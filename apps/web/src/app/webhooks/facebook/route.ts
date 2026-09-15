import { NextRequest, NextResponse } from 'next/server';

interface UserSession {
  state: 'IDLE' | 'AWAITING_ADDRESS' | 'AWAITING_PHONE';
  selectedProduct?: string;
  price?: number;
  customerName?: string;
  deliveryAddress?: string;
  partialPhone?: string;
}

// In-memory conversation state for fast serverless responses
const userSessions: Record<string, UserSession> = {};

const HARDCODED_TOKEN =
  'EAAiyNmqJWZCkBSUrjkc4ZCraUnG8t9cXtWDgxkNZCnwd1fmP9LhKDWTr8ApzwweRZA2WHzCFHZBGZCBPmECI15GLqUZAjVyxcnErVjcszH07mdbYU6lA2l2ibDdLKZCLhZADDCXbhQeaP5Bac9xUp7BrR9WnYqMw9hgfl9k7dlxSdaPAcDFTxkqkrSV3X1ZAseJOsFbixCJu4VEgZDZD';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  console.log(`[Facebook Webhook GET] mode=${mode}, token=${token}`);

  if (mode === 'subscribe' && challenge) {
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
    console.log('[Facebook Webhook Event Received]:', JSON.stringify(body));

    if (body.object === 'page') {
      const pageToken =
        (global as any).__BOT_CONFIG__?.fbPageToken ||
        process.env.DEFAULT_FACEBOOK_PAGE_TOKEN ||
        process.env.FB_PAGE_TOKEN ||
        process.env.FACEBOOK_PAGE_ACCESS_TOKEN ||
        HARDCODED_TOKEN;

      const geminiKey =
        (global as any).__BOT_CONFIG__?.geminiApiKey ||
        process.env.GEMINI_API_KEY ||
        process.env.GOOGLE_AI_API_KEY ||
        '';

      for (const entry of body.entry || []) {
        for (const event of entry.messaging || []) {
          const senderId = event.sender?.id;
          if (!senderId || event.message?.is_echo) continue;

          const text = event.message?.text || '';
          const payload = event.postback?.payload || event.message?.quick_reply?.payload;

          await processMessengerEvent(senderId, text, payload, pageToken, geminiKey);
        }
      }

      return new NextResponse('EVENT_RECEIVED', {
        status: 200,
        headers: { 'Content-Type': 'text/plain' },
      });
    }

    return new NextResponse('NOT_A_PAGE_EVENT', { status: 200 });
  } catch (error) {
    console.error('[Facebook Webhook Error]:', error);
    return new NextResponse('EVENT_RECEIVED', { status: 200 });
  }
}

// Convert Bangla digits to English digits
function toEnglishDigits(str: string): string {
  const banglaToEnglish: Record<string, string> = {
    '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
    '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9',
  };
  return str.replace(/[০-৯]/g, (w) => banglaToEnglish[w] || w);
}

// Intelligent Bangladeshi Phone Extractor
function extractBangladeshiPhone(rawText: string): { phone?: string; partialPhone?: string } {
  const normalized = toEnglishDigits(rawText);

  // 1. Perfect 11 digit Bangladeshi number (013 - 019) or with +88/88 prefix
  const exactMatch = normalized.match(/(?:\+?88)?(01[3-9]\d{8})\b/);
  if (exactMatch) {
    return { phone: exactMatch[1] };
  }

  // 2. Formatted with spaces / dashes (e.g. 01712-345678 or 01712 345 678)
  const formattedMatch = normalized.match(/(?:\+?88)?(01[3-9][0-9\s\-]{8,12})/);
  if (formattedMatch) {
    const clean = formattedMatch[1].replace(/[\s\-]/g, '');
    if (clean.length === 11 && clean.startsWith('01')) {
      return { phone: clean };
    }
  }

  // 3. Partial or short phone (e.g. 019389098 - 9 digits or 10 digits)
  const partialMatch = normalized.match(/(?:\+?88)?(01[3-9][0-9]{5,10})\b/);
  if (partialMatch) {
    const clean = partialMatch[1];
    if (clean.length === 11) {
      return { phone: clean };
    } else {
      return { partialPhone: clean };
    }
  }

  return {};
}

// Intelligent NLP Parser for Name and Address from mixed Bangla/English text
function extractNameAndAddress(text: string, phone?: string): { name: string; address: string } {
  const lines = text
    .split(/[\n,]+/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  let name = '';
  let addressParts: string[] = [];

  for (const line of lines) {
    const cleanLine = toEnglishDigits(line);
    if (phone && cleanLine.includes(phone)) {
      const remaining = line.replace(phone, '').trim();
      if (remaining.length > 0) addressParts.push(remaining);
      continue;
    }

    const lower = line.toLowerCase();
    const isAreaWord = ['mirpur', 'uttara', 'dhanmondi', 'gulshan', 'banani', 'dhaka', 'chittagong', 'sylhet', 'road', 'house', 'sector', 'block', 'মিরপুর', 'উত্তরা', 'ঢাকা', 'রোড', 'বাসা', 'গ্রাম', 'থানা', 'জেলা'].some(w => lower.includes(w));

    if (!name && !isAreaWord && line.split(' ').length <= 3 && !/\d{4,}/.test(cleanLine)) {
      name = line.replace(/^(name|নাম|amr nam|amar name|my name)\s*[:=]?\s*/i, '').trim();
    } else {
      addressParts.push(line.replace(/^(address|ঠিকানা|thikana)\s*[:=]?\s*/i, '').trim());
    }
  }

  if (!name) name = 'সম্মানিত কাস্টমার';
  let address = addressParts.join(', ').trim();
  if (!address) address = text.trim();

  return { name, address };
}

// Google AI Studio (Gemini) Call
async function callGeminiAI(
  userText: string,
  session: UserSession,
  apiKey: string,
): Promise<{ replyText: string; orderData?: any }> {
  try {
    const systemPrompt = `You are an ultra-intelligent, friendly Bangladeshi F-Commerce AI sales assistant for "OrderFlow BD".

STORE PRODUCTS:
1. প্রিমিয়াম কাশ্মীরি কুর্তি - ৳৮৫০ (সাইজ: M, L, XL, লিলেন সুতি)
2. জয়পুরি কটন আনস্টিচড থ্রি-পিস - ৳১২৫০ (১০০% পিওর কটন)
3. ডিজাইনার পার্টি গাউন - ৳১৫০০ (গর্জিয়াস পার্টি গাউন)

DELIVERY POLICY:
- ডেলিভারি চার্জ: ঢাকা সিটিতে ৳১২০, ঢাকার বাইরে ৳১৫০।
- ক্যাশ অন ডেলিভারি (পণ্য পেয়ে টাকা)। ডেলিভারি সময় ২-৩ দিন।

CONVERSATION CONTEXT:
- Currently Selected Product: ${session.selectedProduct || 'None yet'}
- Customer Name: ${session.customerName || 'Unknown'}
- Address: ${session.deliveryAddress || 'Unknown'}

STRICT VALIDATION RULES:
1. Respond in natural, polite, engaging Bengali (with emojis).
2. If the customer asks questions about products, price, fabric, discounts, or delivery, answer accurately and politely.
3. If the customer gives incomplete or mistaken input:
   - If phone number has wrong number of digits (e.g. 9 or 10 digits like 019389098), specifically point out the mistake:
     "মনির ভাই, আপনার ঠিকানা নোট করেছি। তবে আপনার মোবাইল নম্বরে ৯টি ডিজিট পাওয়া গেছে (019389098)। বাংলাদেশে মোবাইল নম্বর ১১ ডিজিটের হয়। দয়া করে আপনার ১১ ডিজিটের সঠিক নম্বরটি দিন।"
   - If address is missing, politely ask for their specific area/thana/district.
4. When all info (Name, 11-digit phone, Address, and Product) is completely provided and ready to confirm:
   Output your congratulatory confirmation message AND at the very bottom include:
   JSON_START{"orderConfirmed":true,"product":"...","price":1500,"customerName":"...","phone":"...","address":"..."}JSON_END`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemPrompt}\n\nCustomer message: "${userText}"` }],
            },
          ],
        }),
      },
    );

    const data = await res.json();
    const rawReply = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    let orderData = null;
    let cleanReply = rawReply;
    if (rawReply.includes('JSON_START') && rawReply.includes('JSON_END')) {
      const jsonStr = rawReply.substring(
        rawReply.indexOf('JSON_START') + 10,
        rawReply.indexOf('JSON_END'),
      );
      try {
        orderData = JSON.parse(jsonStr.trim());
        cleanReply = rawReply.substring(0, rawReply.indexOf('JSON_START')).trim();
      } catch (e) {}
    }

    return { replyText: cleanReply, orderData };
  } catch (err) {
    console.error('Gemini API Error:', err);
    return { replyText: '' };
  }
}

async function processMessengerEvent(
  senderId: string,
  text: string,
  payload?: string,
  pageToken?: string,
  geminiKey?: string,
) {
  const session = userSessions[senderId] || { state: 'IDLE' };
  const rawText = text.trim();
  const lowerText = rawText.toLowerCase();

  // If Gemini API Key is available, prioritize Google AI Studio
  if (geminiKey && rawText && !payload) {
    const { replyText, orderData } = await callGeminiAI(rawText, session, geminiKey);
    if (replyText) {
      if (orderData && orderData.orderConfirmed) {
        const orderNum = Math.floor(1000 + Math.random() * 9000);
        const itemPrice = orderData.price || 1500;
        const deliveryCharge = 120;
        const totalPrice = itemPrice + deliveryCharge;
        const finalName = orderData.customerName || session.customerName || 'সম্মানিত কাস্টমার';
        const finalPhone = orderData.phone || '01700000000';
        const finalAddress = orderData.address || session.deliveryAddress || 'ঢাকা';
        const prodTitle = orderData.product || session.selectedProduct || 'ডিজাইনার পার্টি গাউন';

        const newOrder = {
          id: `ord-fb-${Date.now()}`,
          orderNumber: orderNum,
          storeId: 'store-1',
          customerId: `cust-fb-${senderId}`,
          channel: 'FACEBOOK_MESSENGER',
          status: 'PENDING_CONFIRMATION',
          itemsPrice: itemPrice,
          deliveryCharge: deliveryCharge,
          totalPrice: totalPrice,
          deliveryAddress: finalAddress,
          deliveryCity: 'ঢাকা',
          customerPhone: finalPhone,
          customerName: finalName,
          createdAt: new Date().toISOString(),
          items: [
            {
              id: `oi-fb-${Date.now()}`,
              orderId: `ord-fb-${Date.now()}`,
              productId: 'prod-3',
              product: { title: prodTitle, basePrice: itemPrice },
              variant: { name: 'Standard Size' },
              quantity: 1,
              unitPrice: itemPrice,
            },
          ],
          customer: {
            name: finalName,
            phone: finalPhone,
            totalOrders: 1,
            deliveryRate: 100,
          },
        };

        (global as any).__LIVE_ORDERS__ = (global as any).__LIVE_ORDERS__ || [];
        (global as any).__LIVE_ORDERS__.unshift(newOrder);

        session.state = 'IDLE';
        userSessions[senderId] = session;
      }

      await sendFbMessage(senderId, replyText, pageToken);
      return;
    }
  }

  // 1. Explicit Payload Button Click
  if (payload) {
    if (payload.startsWith('PROD_')) {
      const prodName =
        payload === 'PROD_KURTI'
          ? 'প্রিমিয়াম কাশ্মীরি কুর্তি'
          : payload === 'PROD_3PIECE'
          ? 'জয়পুরি কটন আনস্টিচড থ্রি-পিস'
          : 'ডিজাইনার পার্টি গাউন';
      const price = payload === 'PROD_KURTI' ? 850 : payload === 'PROD_3PIECE' ? 1250 : 1500;

      session.state = 'AWAITING_ADDRESS';
      session.selectedProduct = prodName;
      session.price = price;
      userSessions[senderId] = session;

      await sendFbMessage(
        senderId,
        `আপনি '${prodName} (৳${price})' নির্বাচন করেছেন। 🛍️\n\nঅর্ডারটি কনফার্ম করতে অনুগ্রহ করে আপনার:\n১. পুরো নাম\n২. মোবাইল নম্বর (১১ ডিজিট)\n৩. সম্পূর্ণ ডেলিভারি ঠিকানা\nলিখে মেসেজ পাঠান (যেমন: মনির, 01938909812, মিরপুর ১৬, ঢাকা)।`,
        pageToken,
      );
      return;
    }
  }

  // 2. Natural Language Product Mention
  if (session.state === 'IDLE' || !session.selectedProduct) {
    if (lowerText.includes('গাউন') || lowerText.includes('gown') || lowerText.includes('party')) {
      session.state = 'AWAITING_ADDRESS';
      session.selectedProduct = 'ডিজাইনার পার্টি গাউন';
      session.price = 1500;
      userSessions[senderId] = session;

      await sendFbMessage(
        senderId,
        `আপনি 'ডিজাইনার পার্টি গাউন (৳১৫০০)' নির্বাচন করেছেন। 👗✨\n\nঅর্ডারটি কনফার্ম করতে আপনার নাম, ১১ ডিজিটের মোবাইল নম্বর ও ডেলিভারি ঠিকানা লিখে পাঠান (যেমন: মনির, 01938909812, মিরপুর ১৬)।`,
        pageToken,
      );
      return;
    } else if (lowerText.includes('কুর্তি') || lowerText.includes('kurti') || lowerText.includes('কাশ্মীরি')) {
      session.state = 'AWAITING_ADDRESS';
      session.selectedProduct = 'প্রিমিয়াম কাশ্মীরি কুর্তি';
      session.price = 850;
      userSessions[senderId] = session;

      await sendFbMessage(
        senderId,
        `আপনি 'প্রিমিয়াম কাশ্মীরি কুর্তি (৳৮৫০)' নির্বাচন করেছেন। 🛍️\n\nঅর্ডারটি কনফার্ম করতে আপনার নাম, ১১ ডিজিটের মোবাইল নম্বর ও ডেলিভারি ঠিকানা পাঠান।`,
        pageToken,
      );
      return;
    } else if (lowerText.includes('থ্রি-পিস') || lowerText.includes('3 piece') || lowerText.includes('জয়পুরি') || lowerText.includes('three piece')) {
      session.state = 'AWAITING_ADDRESS';
      session.selectedProduct = 'জয়পুরি কটন আনস্টিচড থ্রি-পিস';
      session.price = 1250;
      userSessions[senderId] = session;

      await sendFbMessage(
        senderId,
        `আপনি 'জয়পুরি কটন আনস্টিচড থ্রি-পিস (৳১২৫০)' নির্বাচন করেছেন। 🛍️\n\nঅর্ডারটি কনফার্ম করতে আপনার নাম, ১১ ডিজিটের মোবাইল নম্বর ও ডেলিভারি ঠিকানা পাঠান।`,
        pageToken,
      );
      return;
    }
  }

  // 3. Check for phone & address extraction
  const { phone, partialPhone } = extractBangladeshiPhone(rawText);

  // If phone is valid (11 digits)
  if (phone) {
    const { name, address } = extractNameAndAddress(rawText, phone);
    const finalName = (name && name !== 'সম্মানিত কাস্টমার') ? name : (session.customerName || 'সম্মানিত কাস্টমার');
    const finalAddress = address.length > 3 ? address : (session.deliveryAddress || 'ঢাকা');
    const prodTitle = session.selectedProduct || 'ডিজাইনার পার্টি গাউন';
    const itemPrice = session.price || 1500;
    const deliveryCharge = 120;
    const totalPrice = itemPrice + deliveryCharge;
    const orderNum = Math.floor(1000 + Math.random() * 9000);

    // Save live order
    const newOrder = {
      id: `ord-fb-${Date.now()}`,
      orderNumber: orderNum,
      storeId: 'store-1',
      customerId: `cust-fb-${senderId}`,
      channel: 'FACEBOOK_MESSENGER',
      status: 'PENDING_CONFIRMATION',
      itemsPrice: itemPrice,
      deliveryCharge: deliveryCharge,
      totalPrice: totalPrice,
      deliveryAddress: finalAddress,
      deliveryCity: 'ঢাকা',
      customerPhone: phone,
      customerName: finalName,
      createdAt: new Date().toISOString(),
      items: [
        {
          id: `oi-fb-${Date.now()}`,
          orderId: `ord-fb-${Date.now()}`,
          productId: 'prod-3',
          product: { title: prodTitle, basePrice: itemPrice },
          variant: { name: 'Standard Size' },
          quantity: 1,
          unitPrice: itemPrice,
        },
      ],
      customer: {
        name: finalName,
        phone: phone,
        totalOrders: 1,
        deliveryRate: 100,
      },
    };

    (global as any).__LIVE_ORDERS__ = (global as any).__LIVE_ORDERS__ || [];
    (global as any).__LIVE_ORDERS__.unshift(newOrder);

    session.state = 'IDLE';
    userSessions[senderId] = session;

    await sendFbMessage(
      senderId,
      `🎉 অভিনন্দন ${finalName}! আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে।\n\n` +
      `📦 অর্ডার নম্বর: #OF-${orderNum}\n` +
      `👗 প্রোডাক্ট: ${prodTitle}\n` +
      `📍 ডেলিভারি ঠিকানা: ${finalAddress}\n` +
      `📞 মোবাইল: ${phone}\n` +
      `💰 মোট পরিমাণ: ৳${totalPrice} (হোম ডেলিভারি চার্জ সহ, ক্যাশ অন ডেলিভারি)\n` +
      `🚚 ২-৩ কার্যদিবসের মধ্যে কুরিয়ারের মাধ্যমে আপনার ঠিকানায় পৌঁছে যাবে।\n\n` +
      `প্যাকেজটি পাঠানোর পর আপনাকে ট্র্যাকিং কোডসহ এসএমএস ও মেসেজ দেওয়া হবে। ধন্যবাদ সাথে থাকার জন্য! ❤️`,
      pageToken,
    );
    return;
  }

  // 4. If user sent an INCOMPLETE phone number (e.g. 019389098 - 9 digits)
  if (partialPhone) {
    const { name, address } = extractNameAndAddress(rawText, partialPhone);
    session.state = 'AWAITING_PHONE';
    if (name && name !== 'সম্মানিত কাস্টমার') session.customerName = name;
    if (address && address.length > 3) session.deliveryAddress = address;
    session.partialPhone = partialPhone;
    userSessions[senderId] = session;

    await sendFbMessage(
      senderId,
      `ধন্যবাদ ${session.customerName || ''}! আপনার ঠিকানা (${session.deliveryAddress || address}) নোট করা হয়েছে। 📍\n\n` +
      `⚠️ তবে আপনার দেয়া মোবাইল নম্বরটিতে ${partialPhone.length}টি ডিজিট পাওয়া গেছে (${partialPhone})।\n` +
      `বাংলাদেশে মোবাইল নম্বর ১১ ডিজিটের হয়ে থাকে। অনুগ্রহ করে আপনার সম্পূর্ণ ১১ ডিজিটের মোবাইল নম্বরটি লিখে পাঠান (যেমন: ${partialPhone}xx)।`,
      pageToken,
    );
    return;
  }

  // 5. If user sent text while in AWAITING_PHONE / AWAITING_ADDRESS
  if (session.state === 'AWAITING_PHONE' || session.state === 'AWAITING_ADDRESS') {
    const digitsOnly = toEnglishDigits(rawText).replace(/[^0-9]/g, '');
    if (digitsOnly.length >= 2 && digitsOnly.length <= 11) {
      let combinedPhone = '';
      if (digitsOnly.length === 11 && digitsOnly.startsWith('01')) {
        combinedPhone = digitsOnly;
      } else if (session.partialPhone && (session.partialPhone + digitsOnly).length === 11) {
        combinedPhone = session.partialPhone + digitsOnly;
      }

      if (combinedPhone.length === 11) {
        const finalName = session.customerName || 'সম্মানিত কাস্টমার';
        const finalAddress = session.deliveryAddress || 'মিরপুর, ঢাকা';
        const prodTitle = session.selectedProduct || 'ডিজাইনার পার্টি গাউন';
        const itemPrice = session.price || 1500;
        const deliveryCharge = 120;
        const totalPrice = itemPrice + deliveryCharge;
        const orderNum = Math.floor(1000 + Math.random() * 9000);

        const newOrder = {
          id: `ord-fb-${Date.now()}`,
          orderNumber: orderNum,
          storeId: 'store-1',
          customerId: `cust-fb-${senderId}`,
          channel: 'FACEBOOK_MESSENGER',
          status: 'PENDING_CONFIRMATION',
          itemsPrice: itemPrice,
          deliveryCharge: deliveryCharge,
          totalPrice: totalPrice,
          deliveryAddress: finalAddress,
          deliveryCity: 'ঢাকা',
          customerPhone: combinedPhone,
          customerName: finalName,
          createdAt: new Date().toISOString(),
          items: [
            {
              id: `oi-fb-${Date.now()}`,
              orderId: `ord-fb-${Date.now()}`,
              productId: 'prod-3',
              product: { title: prodTitle, basePrice: itemPrice },
              variant: { name: 'Standard Size' },
              quantity: 1,
              unitPrice: itemPrice,
            },
          ],
          customer: {
            name: finalName,
            phone: combinedPhone,
            totalOrders: 1,
            deliveryRate: 100,
          },
        };

        (global as any).__LIVE_ORDERS__ = (global as any).__LIVE_ORDERS__ || [];
        (global as any).__LIVE_ORDERS__.unshift(newOrder);

        session.state = 'IDLE';
        userSessions[senderId] = session;

        await sendFbMessage(
          senderId,
          `🎉 ধন্যবাদ ${finalName}! আপনার ১১ ডিজিটের নম্বর (${combinedPhone}) ভেরিফাই হয়েছে এবং অর্ডারটি সফলভাবে কনফার্ম করা হয়েছে।\n\n` +
          `📦 অর্ডার নম্বর: #OF-${orderNum}\n` +
          `👗 প্রোডাক্ট: ${prodTitle}\n` +
          `📍 ডেলিভারি ঠিকানা: ${finalAddress}\n` +
          `💰 মোট পরিমাণ: ৳${totalPrice} (ক্যাশ অন ডেলিভারি)\n` +
          `🚚 ২-৩ কার্যদিবসের মধ্যে আপনার ঠিকানায় পৌঁছে যাবে। ধন্যবাদ! ❤️`,
          pageToken,
        );
        return;
      }
    }
  }

  // 6. Default: Main Menu / Greeting
  session.state = 'IDLE';
  userSessions[senderId] = session;

  await sendFbQuickReplies(
    senderId,
    `আসসালামু আলাইকুম! OrderFlow BD শপে আপনাকে স্বাগতম। 🌸\n\nকোন প্রোডাক্টটি আপনি দেখতে বা অর্ডার করতে চান তা নিচে নির্বাচন করুন 👇`,
    [
      { title: 'প্রিন্ট কুর্তি - ৮৫০', payload: 'PROD_KURTI' },
      { title: 'জয়পুরি থ্রি-পিস - ১২৫০', payload: 'PROD_3PIECE' },
      { title: 'পার্টি গাউন - ১৫০০', payload: 'PROD_GOWN' },
    ],
    pageToken,
  );
}

async function sendFbMessage(recipientId: string, text: string, token?: string) {
  const activeToken = token || HARDCODED_TOKEN;
  if (!activeToken) {
    console.warn('[Facebook Webhook] Warning: No Page Access Token configured yet to send reply.');
    return;
  }

  try {
    const res = await fetch(`https://graph.facebook.com/v20.0/me/messages?access_token=${activeToken}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipient: { id: recipientId },
        message: { text },
      }),
    });
    const data = await res.json();
    console.log('[Facebook Send Message Result]:', data);
  } catch (err) {
    console.error('[Facebook Send Message Error]:', err);
  }
}

async function sendFbQuickReplies(
  recipientId: string,
  text: string,
  quickReplies: Array<{ title: string; payload: string }>,
  token?: string,
) {
  const activeToken = token || HARDCODED_TOKEN;
  if (!activeToken) {
    console.warn('[Facebook Webhook] Warning: No Page Access Token configured yet to send reply.');
    return;
  }

  try {
    const res = await fetch(`https://graph.facebook.com/v20.0/me/messages?access_token=${activeToken}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipient: { id: recipientId },
        message: {
          text,
          quick_replies: quickReplies.map((qr) => ({
            content_type: 'text',
            title: qr.title.slice(0, 20),
            payload: qr.payload,
          })),
        },
      }),
    });
    const data = await res.json();
    console.log('[Facebook Quick Replies Result]:', data);
  } catch (err) {
    console.error('[Facebook Quick Replies Error]:', err);
  }
}
