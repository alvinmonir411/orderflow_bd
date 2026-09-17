import { NextRequest, NextResponse } from 'next/server';
import { getBotSettings, insertDbOrder, getDbProducts, saveDbChatMessage, getSql } from '@/lib/db';

const WHATSAPP_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'orderflow_bd_secure_verify_2026';
const DEFAULT_WAAPI_TOKEN = 'KhHNKuRBXDQ871SPnIPHle3cRZnb9cB5tuzhEMGEc945dcca';
const DEFAULT_INSTANCE_ID = '104344';

// Meta Verification Endpoint
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  console.log(`[WhatsApp Webhook GET] mode=${mode}, token=${token}`);

  if (mode === 'subscribe' && (token === WHATSAPP_VERIFY_TOKEN || token === 'orderflow_bd_secure_verify_2026')) {
    return new NextResponse(challenge, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  return new NextResponse('Verification failed', { status: 403 });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('[WhatsApp Webhook POST Event Received]:', JSON.stringify(body));

    const settings = await getBotSettings();
    const geminiKey = settings.geminiApiKey || process.env.GEMINI_API_KEY || '';

    // ==========================================
    // 1. WAAPI.APP Webhook Processing
    // ==========================================
    if (body.event === 'message_create' || body.event === 'message' || body.event === 'messages.upsert') {
      const msg = body.data?.message || body.data?.messages?.[0] || body.message;
      
      // Ignore outgoing messages sent by the bot owner to avoid infinite loops
      if (msg && !msg.fromMe) {
        const fromRaw = msg.from || msg.chatId || msg._data?.id?.remote || '';
        
        // Ignore WhatsApp newsletters / channels
        if (fromRaw.includes('@newsletter') || fromRaw.includes('@broadcast')) {
          return NextResponse.json({ ignored: true, reason: 'newsletter_event' });
        }

        const fromPhone = fromRaw.replace('@c.us', '').replace('@s.whatsapp.net', '').replace('@lid', '');
        const customerName = msg._data?.notifyName || msg.notifyName || `Customer (${fromPhone.slice(-4)})`;
        const text = (msg.body || msg.text || '').trim();

        if (text && fromRaw) {
          // 1. Save customer message to Neon PostgreSQL
          await saveDbChatMessage({
            senderId: fromRaw,
            customerName,
            sender: 'customer',
            text,
            channel: 'WHATSAPP',
          });

          // 2. Generate intelligent AI reply
          const replyText = await generateAiReply(text, customerName, settings, geminiKey);

          // 3. Send AI response via Waapi Instance API
          const instanceId = settings.waapiInstanceId || DEFAULT_INSTANCE_ID;
          const token = settings.waapiApiToken || settings.whatsappToken || DEFAULT_WAAPI_TOKEN;

          const sendResult = await sendWaapiMessage(instanceId, token, fromRaw, replyText);
          console.log('[Waapi Send Success]:', sendResult);

          // 4. Save AI Reply to Neon PostgreSQL
          await saveDbChatMessage({
            senderId: fromRaw,
            customerName,
            sender: 'ai',
            text: replyText,
            channel: 'WHATSAPP',
          });
        }
      }

      return NextResponse.json({ success: true, provider: 'WAAPI' });
    }

    // ==========================================
    // 2. Meta WhatsApp Cloud API Processing
    // ==========================================
    if (body.object === 'whatsapp_business_account') {
      const phoneId = settings.whatsappPhoneId || process.env.WHATSAPP_PHONE_NUMBER_ID || '';
      const waToken = settings.whatsappToken || process.env.WHATSAPP_ACCESS_TOKEN || '';

      for (const entry of body.entry || []) {
        for (const change of entry.changes || []) {
          const value = change.value;
          if (!value || value.messaging_product !== 'whatsapp') continue;

          const contacts = value.contacts || [];
          const messages = value.messages || [];

          for (const msg of messages) {
            if (msg.type !== 'text' || !msg.text?.body) continue;

            const fromPhone = msg.from; // e.g. 88017XXXXXXXX
            const customerName = contacts[0]?.profile?.name || `Customer (${fromPhone.slice(-4)})`;
            const text = msg.text.body.trim();

            await saveDbChatMessage({
              senderId: fromPhone,
              customerName,
              sender: 'customer',
              text,
              channel: 'WHATSAPP',
            });

            if (phoneId && waToken) {
              const replyText = await generateAiReply(text, customerName, settings, geminiKey);
              await sendMetaWhatsAppMessage(phoneId, waToken, fromPhone, replyText);
              await saveDbChatMessage({
                senderId: fromPhone,
                customerName,
                sender: 'ai',
                text: replyText,
                channel: 'WHATSAPP',
              });
            }
          }
        }
      }

      return new NextResponse('EVENT_RECEIVED', { status: 200 });
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('[WhatsApp Webhook Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 200 });
  }
}

// Send via Waapi REST API
async function sendWaapiMessage(instanceId: string, token: string, chatId: string, message: string) {
  try {
    const url = `https://waapi.app/api/v1/instances/${instanceId}/client/action/send-message`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify({
        chatId,
        message,
      }),
    });
    const data = await res.json();
    console.log('[Waapi API Response]:', data);
    return data;
  } catch (err) {
    console.error('[Send Waapi API Error]:', err);
  }
}

// Send via Meta Cloud API
async function sendMetaWhatsAppMessage(phoneId: string, token: string, toPhone: string, text: string) {
  try {
    const url = `https://graph.facebook.com/v21.0/${phoneId}/messages`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: toPhone,
        type: 'text',
        text: { preview_url: false, body: text },
      }),
    });
    const data = await res.json();
    console.log('[Meta WhatsApp API Send Response]:', data);
    return data;
  } catch (err) {
    console.error('[Send Meta WhatsApp API Error]:', err);
  }
}

async function generateAiReply(userText: string, customerName: string, settings: any, geminiKey: string): Promise<string> {
  const products = await getDbProducts();
  const productListStr = products.map((p: any) => `• ${p.title} - ৳${p.basePrice}`).join('\n');

  if (!geminiKey) {
    return `নমস্কার ${customerName}! OrderFlow BD-তে আপনাকে স্বাগতম। 😊\n\nআমাদের সেরা কালেকশনসমূহ:\n${productListStr}\n\nডেলিভারি চার্জ: ঢাকা সিটিতে ৳${settings.deliveryFeeDhaka || 120}, ঢাকার বাইরে ৳${settings.deliveryFeeOutside || 150}।\n\nঅর্ডার করতে বা কোনো প্রোডাক্ট সম্পর্কে জানতে আমাদের জানান! 🤝`;
  }

  try {
    const prompt = `
You are a friendly, polite, smart Bangladeshi F-Commerce AI sales representative for OrderFlow BD on WhatsApp.
Customer Name: ${customerName}

Store Products Catalog:
${productListStr}

Delivery Details:
- Dhaka City: ৳${settings.deliveryFeeDhaka || 120} (${settings.deliveryTimeDhaka || '1-2 days'})
- Outside Dhaka: ৳${settings.deliveryFeeOutside || 150} (${settings.deliveryTimeOutside || '2-3 days'})
- Payment: 100% Cash On Delivery (ক্যাশ অন ডেলিভারি)
- Helpline: ${settings.helplinePhone || '01700000000'}

Customer Message: "${userText}"

Instructions:
1. Reply politely in natural, attractive Bengali (বাংলা).
2. Answer the customer's question directly with product names, prices, and delivery terms.
3. If they want to order, ask for their full name, complete delivery address, and 11-digit mobile number.
4. Keep the message clean, organized, and friendly with emojis.
`;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (aiText) return aiText.trim();
    }
  } catch (err) {
    console.error('[Gemini WhatsApp Generation Error]:', err);
  }

  return `ধন্যবাদ ${customerName}! OrderFlow BD-তে আপনাকে স্বাগতম। 😊\n\nআমাদের কালেকশনসমূহ:\n${productListStr}\n\nআপনার পছন্দের প্রোডাক্টটি অর্ডার করতে ঠিকানা ও ফোন নাম্বার লিখে পাঠান। 🚚`;
}
