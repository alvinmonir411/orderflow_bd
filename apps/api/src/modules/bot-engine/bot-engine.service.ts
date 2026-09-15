import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import axios from 'axios';

@Injectable()
export class BotEngineService {
  private readonly logger = new Logger(BotEngineService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Main Facebook Messenger Message / Postback Processor
   */
  async handleFacebookMessage(entry: any) {
    for (const item of entry) {
      const pageId = item.id;
      const messagingEvents = item.messaging || [];

      // Find store linked with this Facebook Page
      const store = await this.prisma.store.findFirst({
        where: { facebookPageId: pageId },
      });

      for (const event of messagingEvents) {
        const senderId = event.sender?.id;
        if (!senderId) continue;

        // Skip bot's own echo messages
        if (event.message?.is_echo) continue;

        const pageToken = store?.facebookPageToken || process.env.DEFAULT_FACEBOOK_PAGE_TOKEN;

        try {
          if (event.postback) {
            await this.processPayload(store, senderId, event.postback.payload, pageToken);
          } else if (event.message?.quick_reply) {
            await this.processPayload(store, senderId, event.message.quick_reply.payload, pageToken);
          } else if (event.message?.text) {
            await this.processText(store, senderId, event.message.text.trim(), pageToken);
          }
        } catch (error) {
          this.logger.error(`Error processing message for PSID: ${senderId}`, error);
        }
      }
    }
  }

  /**
   * Text processor - Handles conversational flow based on current BotSession state
   */
  private async processText(store: any, senderId: string, text: string, pageToken?: string) {
    if (!store) {
      if (pageToken) {
        await this.sendFbMessage(senderId, 'দুঃখিত, পেজটি বর্তমানে OrderFlow BD এর সাথে কনফিগার করা নেই।', pageToken);
      }
      return;
    }

    // Retrieve or create BotSession
    let session = await this.prisma.botSession.findFirst({
      where: {
        storeId: store.id,
        channel: 'FACEBOOK_MESSENGER',
        senderId: senderId,
      },
    });

    if (!session) {
      session = await this.prisma.botSession.create({
        data: {
          storeId: store.id,
          channel: 'FACEBOOK_MESSENGER',
          senderId: senderId,
          currentState: 'IDLE',
        },
      });
    }

    const lower = text.toLowerCase();

    // Reset flow if user says start / hi / menu / order
    if (['hi', 'hello', 'start', 'order', 'অর্ডার', 'কুর্তি', 'দাম', 'প্রোডাক্ট', 'মেনু'].some((k) => lower.includes(k))) {
      await this.resetAndShowProducts(store, senderId, pageToken);
      return;
    }

    // State Machine
    switch (session.currentState) {
      case 'AWAITING_PHONE_NAME': {
        // Parse Name and Phone number
        const phoneMatch = text.match(/(01[3-9]\d{8})/);
        const phone = phoneMatch ? phoneMatch[0] : '';
        const name = text.replace(phone, '').trim() || 'সম্মানিত কাস্টমার';

        if (!phone || phone.length !== 11) {
          await this.sendFbMessage(
            senderId,
            'অনুগ্রহ করে আপনার সঠিক ১১ ডিজিটের মোবাইল নম্বর প্রদান করুন (যেমন: 01712345678):',
            pageToken,
          );
          return;
        }

        const tempData = (session.tempData as any) || {};
        tempData.customerName = name;
        tempData.customerPhone = phone;

        await this.prisma.botSession.update({
          where: { id: session.id },
          data: {
            currentState: 'AWAITING_ADDRESS',
            tempData,
          },
        });

        await this.sendFbMessage(
          senderId,
          `ধন্যবাদ ${name}! এবার অনুগ্রহ করে আপনার সম্পূর্ণ ডেলিভারি ঠিকানা লিখুন (যেমন: বাসা #১২, রোড #৪, ধানমন্ডি, ঢাকা):`,
          pageToken,
        );
        break;
      }

      case 'AWAITING_ADDRESS': {
        const address = text;
        const tempData = (session.tempData as any) || {};
        tempData.deliveryAddress = address;

        // Auto detect inside / outside dhaka for delivery charge
        const isOutsideDhaka =
          address.toLowerCase().includes('outside') ||
          address.toLowerCase().includes('চট্টগ্রাম') ||
          address.toLowerCase().includes('সিলেট') ||
          address.toLowerCase().includes('রাজশাহী') ||
          address.toLowerCase().includes('খুলনা') ||
          address.toLowerCase().includes('barisal') ||
          address.toLowerCase().includes('chittagong') ||
          address.toLowerCase().includes('sylhet');

        const deliveryCharge = isOutsideDhaka ? 130 : 70;
        tempData.deliveryCharge = deliveryCharge;
        tempData.deliveryCity = isOutsideDhaka ? 'Outside Dhaka' : 'Dhaka';

        // Fetch selected product & variant details
        const product = await this.prisma.product.findUnique({
          where: { id: session.selectedProductId || '' },
          include: { variants: true },
        });

        const variant = product?.variants.find((v) => v.id === session.selectedVariantId);
        const unitPrice = Number(product?.basePrice || 0) + Number(variant?.priceDiff || 0);
        const total = unitPrice + deliveryCharge;

        tempData.unitPrice = unitPrice;
        tempData.totalPrice = total;

        await this.prisma.botSession.update({
          where: { id: session.id },
          data: {
            currentState: 'AWAITING_CONFIRMATION',
            tempData,
          },
        });

        // Send order summary and quick reply buttons
        const summaryText =
          `📝 আপনার অর্ডার সামারি:\n\n` +
          `🛍️ প্রোডাক্ট: ${product?.title || 'নির্বাচিত পণ্য'} ${variant ? `(${variant.name})` : ''}\n` +
          `💵 পণ্যের দাম: ৳${unitPrice}\n` +
          `🚚 ডেলিভারি চার্জ: ৳${deliveryCharge}\n` +
          `💰 মোট প্রদেয়: ৳${total} (ক্যাশ অন ডেলিভারি)\n\n` +
          `👤 নাম: ${tempData.customerName}\n` +
          `📞 ফোন: ${tempData.customerPhone}\n` +
          `📍 ঠিকানা: ${address}\n\n` +
          `অর্ডারটি কনফার্ম করতে নিচের বাটনে চাপ দিন 👇`;

        await this.sendFbQuickReplies(
          senderId,
          summaryText,
          [
            { title: '✅ কনফার্ম করুন', payload: 'CONFIRM_ORDER_YES' },
            { title: '❌ বাতিল করুন', payload: 'CANCEL_ORDER' },
          ],
          pageToken,
        );
        break;
      }

      default: {
        // Fallback default message
        await this.resetAndShowProducts(store, senderId, pageToken);
        break;
      }
    }
  }

  /**
   * Process payload when user clicks interactive buttons / quick replies
   */
  async processPayload(store: any, senderId: string, payload: string, pageToken?: string) {
    if (!store) return;

    let session = await this.prisma.botSession.findFirst({
      where: {
        storeId: store.id,
        channel: 'FACEBOOK_MESSENGER',
        senderId: senderId,
      },
    });

    if (!session) {
      session = await this.prisma.botSession.create({
        data: {
          storeId: store.id,
          channel: 'FACEBOOK_MESSENGER',
          senderId: senderId,
          currentState: 'IDLE',
        },
      });
    }

    if (payload.startsWith('SELECT_PRODUCT_')) {
      const productId = payload.replace('SELECT_PRODUCT_', '');
      const product = await this.prisma.product.findUnique({
        where: { id: productId },
        include: { variants: true },
      });

      if (!product || product.stock <= 0) {
        await this.sendFbMessage(senderId, 'দুঃখিত! এই প্রোডাক্টটির স্টক শেষ হয়ে গেছে।', pageToken);
        return;
      }

      // If product has variants (Sizes / Colors)
      if (product.variants && product.variants.length > 0) {
        await this.prisma.botSession.update({
          where: { id: session.id },
          data: {
            currentState: 'SELECTING_VARIANT',
            selectedProductId: productId,
          },
        });

        const quickReplies = product.variants
          .filter((v) => v.stock > 0)
          .map((v) => ({
            title: v.name,
            payload: `SELECT_VARIANT_${v.id}`,
          }));

        if (quickReplies.length === 0) {
          await this.sendFbMessage(senderId, 'দুঃখিত! এই সাইজের সকল স্টক শেষ হয়ে গেছে।', pageToken);
          return;
        }

        await this.sendFbQuickReplies(
          senderId,
          `আপনি নির্বাচন করেছেন: ${product.title} (৳${product.basePrice})\nঅনুগ্রহ করে আপনার সাইজ বা ভ্যারিয়েন্ট বেছে নিন 👇`,
          quickReplies,
          pageToken,
        );
      } else {
        // No variants, ask for name & phone directly
        await this.prisma.botSession.update({
          where: { id: session.id },
          data: {
            currentState: 'AWAITING_PHONE_NAME',
            selectedProductId: productId,
            selectedVariantId: null,
            tempData: {},
          },
        });

        await this.sendFbMessage(
          senderId,
          `চমৎকার পছন্দ! "${product.title}" এর জন্য অনুগ্রহ করে আপনার নাম ও ১১ ডিজিটের মোবাইল নম্বর লিখে পাঠান (যেমন: 01712345678):`,
          pageToken,
        );
      }
    } else if (payload.startsWith('SELECT_VARIANT_')) {
      const variantId = payload.replace('SELECT_VARIANT_', '');
      const variant = await this.prisma.productVariant.findUnique({
        where: { id: variantId },
        include: { product: true },
      });

      if (!variant) return;

      await this.prisma.botSession.update({
        where: { id: session.id },
        data: {
          currentState: 'AWAITING_PHONE_NAME',
          selectedVariantId: variantId,
          tempData: {},
        },
      });

      await this.sendFbMessage(
        senderId,
        `আপনি বেছে নিয়েছেন: ${variant.product.title} (${variant.name})\nঅনুগ্রহ করে আপনার নাম ও মোবাইল নম্বর লিখে পাঠান (যেমন: 01712345678):`,
        pageToken,
      );
    } else if (payload === 'CONFIRM_ORDER_YES') {
      const tempData = (session.tempData as any) || {};

      // 1. Create or update customer record
      let customer = await this.prisma.customer.findFirst({
        where: {
          storeId: store.id,
          phone: tempData.customerPhone,
        },
      });

      if (!customer) {
        customer = await this.prisma.customer.create({
          data: {
            storeId: store.id,
            name: tempData.customerName || 'কাস্টমার',
            phone: tempData.customerPhone,
            psid: senderId,
            address: tempData.deliveryAddress,
            district: tempData.deliveryCity,
            totalOrders: 1,
          },
        });
      } else {
        customer = await this.prisma.customer.update({
          where: { id: customer.id },
          data: {
            psid: senderId,
            totalOrders: { increment: 1 },
            address: tempData.deliveryAddress || customer.address,
          },
        });
      }

      // 2. Create Order in Database
      const order = await this.prisma.order.create({
        data: {
          storeId: store.id,
          customerId: customer.id,
          channel: 'FACEBOOK_MESSENGER',
          status: 'PENDING_CONFIRMATION',
          itemsPrice: tempData.unitPrice,
          deliveryCharge: tempData.deliveryCharge,
          totalPrice: tempData.totalPrice,
          deliveryAddress: tempData.deliveryAddress,
          deliveryCity: tempData.deliveryCity,
          customerPhone: tempData.customerPhone,
          customerName: tempData.customerName,
          items: {
            create: [
              {
                productId: session.selectedProductId!,
                variantId: session.selectedVariantId,
                quantity: 1,
                unitPrice: tempData.unitPrice,
              },
            ],
          },
        },
      });

      // 3. Deduct stock automatically
      if (session.selectedVariantId) {
        await this.prisma.productVariant.update({
          where: { id: session.selectedVariantId },
          data: { stock: { decrement: 1 } },
        });
      }
      if (session.selectedProductId) {
        await this.prisma.product.update({
          where: { id: session.selectedProductId },
          data: { stock: { decrement: 1 } },
        });
      }

      // 4. Reset Session
      await this.prisma.botSession.update({
        where: { id: session.id },
        data: {
          currentState: 'IDLE',
          selectedProductId: null,
          selectedVariantId: null,
          tempData: {},
        },
      });

      // 5. Send celebratory confirmation message
      const confirmMsg =
        `🎉 অভিনন্দন! আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে।\n\n` +
        `📦 অর্ডার নম্বর: #${order.orderNumber}\n` +
        `💰 মোট পরিমাণ: ৳${order.totalPrice} (ক্যাশ অন ডেলিভারি)\n` +
        `🚚 ২-৩ কার্যদিবসের মধ্যে কুরিয়ারের মাধ্যমে আপনার ঠিকানায় পৌঁছে যাবে।\n\n` +
        `প্যাকেজটি পাঠানোর পর আপনাকে ট্র্যাকিং কোডসহ এসএমএস ও মেসেজ দেওয়া হবে। ধন্যবাদ সাথে থাকার জন্য! ❤️`;

      await this.sendFbMessage(senderId, confirmMsg, pageToken);
    } else if (payload === 'CANCEL_ORDER') {
      await this.prisma.botSession.update({
        where: { id: session.id },
        data: {
          currentState: 'IDLE',
          selectedProductId: null,
          selectedVariantId: null,
          tempData: {},
        },
      });

      await this.sendFbMessage(
        senderId,
        'আপনার অর্ডারটি বাতিল করা হয়েছে। নতুন কোনো প্রোডাক্ট দেখতে চাইলে "Hi" লিখে মেসেজ দিন। ধন্যবাদ!',
        pageToken,
      );
    }
  }

  /**
   * Reset session and show top active products carousel/quick replies
   */
  private async resetAndShowProducts(store: any, senderId: string, pageToken?: string) {
    const products = await this.prisma.product.findMany({
      where: { storeId: store.id, isActive: true, stock: { gt: 0 } },
      take: 8,
    });

    if (products.length === 0) {
      await this.sendFbMessage(
        senderId,
        'স্বাগতম! আমাদের সকল প্রোডাক্টের স্টক বর্তমানে বুকড। নতুন স্টক আসলে জানানো হবে।',
        pageToken,
      );
      return;
    }

    const quickReplies = products.map((p) => ({
      title: `${p.title.slice(0, 15)} - ৳${p.basePrice}`,
      payload: `SELECT_PRODUCT_${p.id}`,
    }));

    await this.sendFbQuickReplies(
      senderId,
      `আসসালামু আলাইকুম! ${store.name} এ আপনাকে স্বাগতম। 🌸\nকোন প্রোডাক্টটি আপনি নিতে চান তা নির্বাচন করুন 👇`,
      quickReplies,
      pageToken,
    );
  }

  /**
   * Send regular text message to Facebook Messenger PSID
   */
  async sendFbMessage(recipientId: string, text: string, pageToken?: string) {
    if (!pageToken) {
      this.logger.warn(`No page token provided to send message to ${recipientId}`);
      return;
    }

    try {
      await axios.post(
        `https://graph.facebook.com/v20.0/me/messages?access_token=${pageToken}`,
        {
          recipient: { id: recipientId },
          message: { text },
        },
      );
    } catch (err: any) {
      this.logger.error(`Failed to send FB message: ${err.response?.data?.error?.message || err.message}`);
    }
  }

  /**
   * Send Quick Reply buttons to Facebook Messenger PSID
   */
  async sendFbQuickReplies(
    recipientId: string,
    text: string,
    quickReplies: Array<{ title: string; payload: string }>,
    pageToken?: string,
  ) {
    if (!pageToken) return;

    try {
      await axios.post(
        `https://graph.facebook.com/v20.0/me/messages?access_token=${pageToken}`,
        {
          recipient: { id: recipientId },
          message: {
            text,
            quick_replies: quickReplies.slice(0, 13).map((qr) => ({
              content_type: 'text',
              title: qr.title.length > 20 ? qr.title.slice(0, 20) : qr.title,
              payload: qr.payload,
            })),
          },
        },
      );
    } catch (err: any) {
      this.logger.error(`Failed to send FB quick replies: ${err.response?.data?.error?.message || err.message}`);
    }
  }

  /**
   * WhatsApp Cloud API Incoming Webhook Processor
   */
  async handleWhatsAppMessage(body: any) {
    const entry = body?.entry?.[0];
    const changes = entry?.changes?.[0]?.value;
    const messages = changes?.messages;

    if (!messages || messages.length === 0) return;

    const message = messages[0];
    const fromNumber = message.from; // WhatsApp sender phone number
    const businessPhoneId = changes?.metadata?.phone_number_id;

    const store = await this.prisma.store.findFirst({
      where: { whatsappPhoneId: businessPhoneId },
    });

    if (!store) return;

    const token = store.whatsappToken || undefined;

    if (message.type === 'text') {
      const text = message.text.body;
      await this.processWhatsAppText(store, fromNumber, text, token);
    } else if (message.type === 'interactive') {
      const buttonId = message.interactive?.button_reply?.id || message.interactive?.list_reply?.id;
      await this.processWhatsAppPayload(store, fromNumber, buttonId, token);
    }
  }

  private async processWhatsAppText(store: any, fromNumber: string, text: string, token?: string) {
    if (token && store.whatsappPhoneId) {
      await this.sendWhatsAppText(
        store.whatsappPhoneId,
        fromNumber,
        `আসসালামু আলাইকুম! ${store.name} এ আপনাকে স্বাগতম। আপনি মেসেজ পাঠিয়েছেন: "${text}". বিস্তারিত দেখতে ভিজিট করুন।`,
        token,
      );
    }
  }

  private async processWhatsAppPayload(store: any, fromNumber: string, payload: string, token?: string) {
    // WhatsApp button payloads
  }

  async sendWhatsAppText(phoneId: string, to: string, text: string, token: string) {
    try {
      await axios.post(
        `https://graph.facebook.com/v20.0/${phoneId}/messages`,
        {
          messaging_product: 'whatsapp',
          to,
          type: 'text',
          text: { body: text },
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
    } catch (err: any) {
      this.logger.error(`Failed to send WhatsApp message: ${err.response?.data?.error?.message || err.message}`);
    }
  }
}
