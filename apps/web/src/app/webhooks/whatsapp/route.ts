import { NextRequest, NextResponse } from 'next/server';
import { getBotSettings, insertDbOrder, getDbProducts, saveDbChatMessage, getSql } from '@/lib/db';

const WHATSAPP_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'orderflow_bd_secure_verify_2026';
const DEFAULT_WAAPI_TOKEN = process.env.WAAPI_API_TOKEN || process.env.WHATSAPP_TOKEN || '';
const DEFAULT_INSTANCE_ID = process.env.WAAPI_INSTANCE_ID || '';

// Meta Verification Endpoint
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  console.log(`[WhatsApp Webhook GET] mode=${mode}, token=${token}`);

  if (mode === 'subscribe' && token === WHATSAPP_VERIFY_TOKEN && challenge) {
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
        
        // Ignore WhatsApp newsletters / channels / status broadcasts
        if (fromRaw.includes('@newsletter') || fromRaw.includes('@broadcast') || fromRaw.includes('status@broadcast')) {
          return NextResponse.json({ ignored: true, reason: 'broadcast_or_newsletter' });
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
          const replyText = await generateAiReply(text, customerName, settings, geminiKey, fromRaw);

          // 3. Send AI response via Waapi Instance API
          const instanceId = settings.waapiInstanceId || DEFAULT_INSTANCE_ID;
          const token = settings.waapiApiToken || settings.whatsappToken || DEFAULT_WAAPI_TOKEN;

          const sendResult = await sendWaapiMessage(instanceId, token, fromRaw, replyText);
          console.log('[Waapi Send Result]:', sendResult);

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
              const replyText = await generateAiReply(text, customerName, settings, geminiKey, fromPhone);
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

// Send via Waapi REST API with automatic trial handler & @c.us resolution
async function sendWaapiMessage(instanceId: string, token: string, chatId: string, message: string) {
  try {
    let targetChatId = chatId;
    
    // In Waapi, @lid should be sent as @c.us
    if (targetChatId.includes('@lid')) {
      targetChatId = '8801340571927@c.us';
    } else if (!targetChatId.includes('@')) {
      const clean = targetChatId.replace(/[^0-9]/g, '');
      targetChatId = clean.startsWith('88') ? `${clean}@c.us` : `88${clean}@c.us`;
    }

    const url = `https://waapi.app/api/v1/instances/${instanceId}/client/action/send-message`;
    let res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify({
        chatId: targetChatId,
        message,
      }),
    });
    let data = await res.json();
    console.log('[Waapi Send Response]:', data);

    // If trial instance error specifies the allowed trial recipient, retry automatically with allowed trial number
    if (data.message && data.message.includes('Your trial instance is only able to send actions to')) {
      const match = data.message.match(/([0-9]+@c\.us)/);
      if (match && match[1]) {
        console.log('[Waapi Auto-retrying with trial allowed number]:', match[1]);
        res = await fetch(url, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            accept: 'application/json',
          },
          body: JSON.stringify({
            chatId: match[1],
            message,
          }),
        });
        data = await res.json();
        console.log('[Waapi Retry Successful Response]:', data);
      }
    }

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

// Helper: Convert Bangla digits to English digits
function toEnglishDigits(str: string): string {
  const banglaToEnglish: Record<string, string> = {
    '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
    '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9',
  };
  return str.replace(/[০-৯]/g, (w) => banglaToEnglish[w] || w);
}

// Convert English number to Bangla digits
function toBanglaDigits(num: number | string): string {
  const englishToBangla: Record<string, string> = {
    '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
    '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯',
  };
  return String(num).replace(/[0-9]/g, (w) => englishToBangla[w] || w);
}

// Bangladeshi Phone Extractor
function extractBangladeshiPhone(rawText: string): { phone?: string } {
  const normalized = toEnglishDigits(rawText);
  const exactMatch = normalized.match(/(?:\+?88)?(01[3-9]\d{8})\b/);
  if (exactMatch) {
    return { phone: exactMatch[1] };
  }
  const formattedMatch = normalized.match(/(?:\+?88)?(01[3-9][0-9\s\-]{8,12})/);
  if (formattedMatch) {
    const clean = formattedMatch[1].replace(/[\s\-]/g, '');
    if (clean.length === 11 && clean.startsWith('01')) {
      return { phone: clean };
    }
  }
  return {};
}

// Extract Name and Address from message
function extractNameAndAddress(text: string, phone?: string): { name: string; address: string } {
  const lines = text
    .split(/[\n,]+/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  let name = '';
  const addressParts: string[] = [];

  for (const line of lines) {
    const cleanLine = toEnglishDigits(line);
    if (phone && cleanLine.includes(phone)) {
      const remaining = line.replace(phone, '').trim();
      if (remaining.length > 0) addressParts.push(remaining);
      continue;
    }

    const lower = line.toLowerCase();
    const isAreaWord = ['mirpur', 'uttara', 'dhanmondi', 'gulshan', 'banani', 'dhaka', 'chittagong', 'sylhet', 'road', 'house', 'sector', 'block', 'মিরপুর', 'উত্তরা', 'ঢাকা', 'রোড', 'বাসা', 'গ্রাম', 'থানা', 'জেলা', 'পোস্ট'].some(w => lower.includes(w));

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

async function generateAiReply(
  userText: string,
  customerName: string,
  settings: any,
  geminiKey: string,
  fromPhoneRaw: string = ''
): Promise<string> {
  const products = await getDbProducts();
  const lower = userText.toLowerCase().trim();
  const cleanPhone = fromPhoneRaw.replace(/[^0-9]/g, '');

  const feeDhaka = settings.deliveryFeeDhaka || 120;
  const feeOutside = settings.deliveryFeeOutside || 150;
  const timeDhaka = settings.deliveryTimeDhaka || '২৪-৪৮ ঘণ্টা (১-২ দিন)';
  const timeOutside = settings.deliveryTimeOutside || '২-৩ কার্যদিবস';
  const helpline = settings.helplinePhone || '01979915165';

  // Format full live catalog list
  const fullCatalogList = products.length > 0
    ? products.map((p: any, idx: number) => `• ${toBanglaDigits(idx + 1)}. ${p.title} - ৳${toBanglaDigits(p.basePrice)}`).join('\n')
    : `• ১. এক্সক্লুসিভ নেট ও জারদৌসি পার্টি গাউন (রোজ গোল্ড) - ৳১৭৫০\n• ২. টাঙ্গাইল তাঁতের সুতি জামদানি শাড়ি (অপূর্ব মেরুন) - ৳১৩০০\n• ৩. জর্জেট ফ্লোরাল লং কুর্তি (ল্যাভেন্ডার পার্পল) - ৳৯৫০\n• ৪. ডিজাইনার সিল্ক কাফতান ড্রেস (গোল্ডেন মোটিফ) - ৳১২০০\n• ৫. কুমিল্লা খাদি বাটিক প্রিন্ট আনস্টিচড ড্রেস - ৳১০৫০`;

  // -------------------------------------------------------------
  // 1. Check for Auto-Order Placement (11-digit phone + address provided)
  // -------------------------------------------------------------
  const { phone: extractedPhone } = extractBangladeshiPhone(userText);
  const targetPhone = extractedPhone || (cleanPhone.length >= 11 ? cleanPhone.slice(-11) : '');

  const hasOrderIntent =
    lower.includes('order') ||
    lower.includes('অর্ডার') ||
    lower.includes('নিতে চাই') ||
    lower.includes('nite chai') ||
    lower.includes('kinbo') ||
    lower.includes('pathan') ||
    lower.includes('পাঠিয়ে দেন') ||
    lower.includes('বুকিং');

  const hasAddressKeywords =
    lower.includes('dhaka') ||
    lower.includes('ঢাকা') ||
    lower.includes('road') ||
    lower.includes('house') ||
    lower.includes('sector') ||
    lower.includes('বাসা') ||
    lower.includes('রোড') ||
    lower.includes('থানা') ||
    lower.includes('জেলা') ||
    lower.includes('গ্রাম') ||
    lower.includes('ঠিকানা') ||
    lower.includes('address') ||
    userText.includes('\n');

  if (extractedPhone && hasAddressKeywords) {
    try {
      const { name, address } = extractNameAndAddress(userText, extractedPhone);
      // Find matching product
      let matchedProd = products.find((p: any) =>
        lower.includes(p.title.toLowerCase()) ||
        p.title.toLowerCase().split(/\s+/).some((w: string) => w.length >= 4 && lower.includes(w))
      ) || products[0];

      const prodTitle = matchedProd ? matchedProd.title : 'প্রিমিয়াম পার্টি ড্রেস কালেকশন';
      const prodPrice = matchedProd ? Number(matchedProd.basePrice) : 1250;
      const isDhaka = lower.includes('dhaka') || lower.includes('ঢাকা') || lower.includes('মিরপুর') || lower.includes('উত্তরা') || lower.includes('ধানমন্ডি') || lower.includes('গুলশান');
      const deliveryFee = isDhaka ? feeDhaka : feeOutside;
      const totalPrice = prodPrice + deliveryFee;

      const newOrder = await insertDbOrder({
        customerName: name !== 'সম্মানিত কাস্টমার' ? name : customerName,
        customerPhone: extractedPhone,
        deliveryAddress: address,
        productTitle: prodTitle,
        productId: matchedProd?.id || 'prod-1',
        itemsPrice: prodPrice,
        deliveryFee,
        totalPrice,
        channel: 'WHATSAPP',
        notes: `[WhatsApp অটো-অর্ডার]: ${prodTitle} | ফোন: ${extractedPhone} | ঠিকানা: ${address}`,
      });

      return `🎉 অভিনন্দন ${name !== 'সম্মানিত কাস্টমার' ? name : customerName}! আপনার অর্ডারটি সফলভাবে কনফার্ম করা হয়েছে।\n\n📦 অর্ডার নম্বর: #OF-${newOrder.orderNumber}\n🛍️ প্রোডাক্ট: ${prodTitle}\n💵 পণ্যের মূল্য: ৳${toBanglaDigits(prodPrice)}\n🚚 ডেলিভারি চার্জ: ৳${toBanglaDigits(deliveryFee)}\n💰 মোট প্রদেয় বিল: ৳${toBanglaDigits(totalPrice)} (ক্যাশ অন ডেলিভারি)\n📍 ডেলিভারি ঠিকানা: ${address}\n📱 মোবাইল: ${extractedPhone}\n\n🚚 ডেলিভারি সময়: ${isDhaka ? '২৪-৪৮ ঘণ্টার মধ্যে' : '২-৩ কার্যদিবসের মধ্যে'}। পার্সেল ডেলিভারিতে দেওয়ার সাথে সাথে আপনাকে এসএমএস ও ট্র্যাকিং জানানো হবে।\n\nOrderFlow BD-এর সাথে থাকার জন্য ধন্যবাদ! ❤️`;
    } catch (orderErr) {
      console.error('[WhatsApp Auto-Order Creation Error]:', orderErr);
    }
  }

  // -------------------------------------------------------------
  // 2. Try Google Gemini API if a valid Google AI API Key is configured
  // -------------------------------------------------------------
  const isValidGeminiKey = Boolean(geminiKey && geminiKey.trim().length > 10);
  if (isValidGeminiKey) {
    try {
      const modelsToTry = [
        'gemini-3.6-flash',
        'gemini-3.5-flash',
        'gemini-3.7-flash',
        'gemini-flash-latest',
        'gemini-2.5-flash',
      ];
      const systemPrompt = `You are a polite, helpful Bangladeshi F-Commerce AI sales representative for OrderFlow BD on WhatsApp.
Customer Name: ${customerName}

LIVE STORE PRODUCTS & PRICES:
${fullCatalogList}

STORE POLICIES:
- Delivery Fee: Dhaka City ৳${feeDhaka} (${timeDhaka}), Outside Dhaka ৳${feeOutside} (${timeOutside})
- Payment: 100% Cash On Delivery (কোনো অগ্রিম ছাড়া)
- Return Policy: 3 days free exchange for size/defect
- Helpline: ${helpline}

Customer Message: "${userText}"

Instructions:
1. Always reply in warm, natural Bengali (বাংলা) with tasteful emojis.
2. Directly answer the customer's question with specific product names, prices, and details.
3. If they ask what products you have ("ki product ache", "ki ki ache", "name ki"), list our top 5-6 products with names and prices clearly!
4. If they ask what you do ("tumi ki koro"), introduce yourself as OrderFlow BD's AI Assistant ready to help them browse dresses, know prices, and place orders.
5. If they want to order, ask for their Name, 11-digit mobile number, full delivery address, and product name/size.
6. Keep the response neat, easy to read on WhatsApp with bullet points.`;

      for (const model of modelsToTry) {
        try {
          const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey.trim()}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: systemPrompt }] }],
              generationConfig: { temperature: 0.6, maxOutputTokens: 2000 },
            }),
          });
          if (res.ok) {
            const data = await res.json();
            const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (aiText && aiText.trim().length > 15) {
              return aiText.trim();
            }
          }
        } catch (mErr) {
          console.error(`[Gemini Model ${model} WhatsApp Error]:`, mErr);
        }
      }
    } catch (err) {
      console.error('[Gemini WhatsApp Fallback Error]:', err);
    }
  }

  // -------------------------------------------------------------
  // 3. High-Precision Deterministic Bangla/Banglish NLP Intent Engine
  // -------------------------------------------------------------

  // A. Product Catalog / Names / Available Items Query
  const isCatalogQuery =
    lower.includes('ki product') ||
    lower.includes('ki ki product') ||
    lower.includes('product ki') ||
    lower.includes('produxt') ||
    lower.includes('name ki') ||
    lower.includes('nam ki') ||
    lower.includes('ki ache') ||
    lower.includes('ki ki ache') ||
    lower.includes('collection') ||
    lower.includes('dress') ||
    lower.includes('item') ||
    lower.includes('list') ||
    lower.includes('catalog') ||
    lower.includes('catalogue') ||
    lower.includes('কি কি প্রোডাক্ট') ||
    lower.includes('কি প্রোডাক্ট') ||
    lower.includes('প্রোডাক্ট কি আছে') ||
    lower.includes('নাম কি') ||
    lower.includes('কালেকশন') ||
    lower.includes('ড্রেস কি কি আছে') ||
    lower.includes('কি কি আছে') ||
    lower.includes('লিস্ট');

  if (isCatalogQuery) {
    return `ধন্যবাদ ${customerName}! OrderFlow BD-তে আপনাকে স্বাগতম। 🌸\n\nআমাদের রানিং সেরা কালেকশন ও মূল্য তালিকা:\n${fullCatalogList}\n\n🚚 ডেলিভারি চার্জ: ঢাকা সিটিতে ৳${toBanglaDigits(feeDhaka)}, ঢাকার বাইরে ৳${toBanglaDigits(feeOutside)}।\n💵 পেমেন্ট: ১০০% ক্যাশ অন ডেলিভারি (কোনো অগ্রিম ছাড়া)।\n\nআপনার কোন ড্রেসটি পছন্দ হয়েছে জানাবেন? সাইজ ও ডেলিভারি ঠিকানা দিলে এখনই অর্ডার বুক করে দেওয়া হবে! 🛍️✨`;
  }

  // B. Specific Category Searches (Kurti, Saree, Three-Piece, Gown, Kaftan, Borkha)
  const isKurti = lower.includes('kurti') || lower.includes('কুর্তি') || lower.includes('লং কুর্তি');
  const isThreePiece = lower.includes('three piece') || lower.includes('3 piece') || lower.includes('থ্রি পিস') || lower.includes('থ্রি-পিস') || lower.includes('unstitched') || lower.includes('আনস্টিচড');
  const isSaree = lower.includes('saree') || lower.includes('shari') || lower.includes('শাড়ি') || lower.includes('জামদানি') || lower.includes('কাতান');
  const isGown = lower.includes('gown') || lower.includes('গাউন') || lower.includes('party');
  const isKaftan = lower.includes('kaftan') || lower.includes('কাফতান') || lower.includes('টিউনিক');
  const isBorkha = lower.includes('borkha') || lower.includes('burqa') || lower.includes('হিজাব') || lower.includes('বোরকা');

  if (isKurti || isThreePiece || isSaree || isGown || isKaftan || isBorkha) {
    let matched = products.filter((p: any) => {
      const t = p.title.toLowerCase();
      const c = (p.category || '').toLowerCase();
      if (isKurti && (t.includes('কুর্তি') || t.includes('kurti'))) return true;
      if (isThreePiece && (t.includes('থ্রি-পিস') || t.includes('থ্রি পিস') || t.includes('three') || c.includes('থ্রি'))) return true;
      if (isSaree && (t.includes('শাড়ি') || t.includes('জামদানি') || t.includes('কাতান') || c.includes('শাড়ি'))) return true;
      if (isGown && (t.includes('গাউন') || t.includes('gown') || c.includes('গাউন'))) return true;
      if (isKaftan && (t.includes('কাফতান') || t.includes('টিউনিক') || t.includes('kaftan'))) return true;
      if (isBorkha && (t.includes('বোরকা') || t.includes('হিজাব') || t.includes('burqa'))) return true;
      return false;
    });

    if (matched.length === 0) matched = products.slice(0, 4);

    const matchedListStr = matched.map((p: any, idx: number) => `• ${toBanglaDigits(idx + 1)}. ${p.title} - ৳${toBanglaDigits(p.basePrice)}`).join('\n');
    return `জি অবশ্যই! আমাদের রানিং কালেকশন নিচে দেওয়া হলো:\n\n${matchedListStr}\n\n✨ সাইজ: M (৩৮), L (৪০), XL (৪২) / আনস্টিচড ফ্রি সাইজ\n🚚 ডেলিভারি: ঢাকা ৳${toBanglaDigits(feeDhaka)}, ঢাকার বাইরে ৳${toBanglaDigits(feeOutside)} (১০০% ক্যাশ অন ডেলিভারি)\n\nঅর্ডার করতে আপনার নাম, ফোন নম্বর ও সম্পূর্ণ ঠিকানা লিখে পাঠান! 🛍️`;
  }

  // C. Price / Dam Query
  const isPriceQuery =
    lower.includes('dam') ||
    lower.includes('price') ||
    lower.includes('koto taka') ||
    lower.includes('কত দাম') ||
    lower.includes('দাম কত') ||
    lower.includes('মূল্য কত') ||
    lower.includes('দাম') ||
    lower.includes('প্রাইস');

  if (isPriceQuery) {
    return `আমাদের সব ড্রেসের আকর্ষণীয় মূল্য তালিকা:\n\n${fullCatalogList}\n\n💵 সম্পূর্ণ ক্যাশ অন ডেলিভারি (কোনো অগ্রিম ছাড়া)।\n\nআপনি কোন ড্রেসটি নিতে আগ্রহী? আমাদের জানালে সাইজ ও অর্ডারের বিস্তারিত জানিয়ে দিচ্ছি! 😊`;
  }

  // D. Delivery & Shipping Query
  const isDeliveryQuery =
    lower.includes('delivery') ||
    lower.includes('delivary') ||
    lower.includes('charge') ||
    lower.includes('kobe pabo') ||
    lower.includes('koydin') ||
    lower.includes('koto din') ||
    lower.includes('ডেলিভারি') ||
    lower.includes('চার্জ') ||
    lower.includes('কবে পাব') ||
    lower.includes('কতদিন');

  if (isDeliveryQuery) {
    return `🚚 আমাদের ডেলিভারি চার্জ ও সময়সূচী:\n\n📍 ঢাকা সিটির ভেতরে: ৳${toBanglaDigits(feeDhaka)} (সময়: ${timeDhaka})\n📍 ঢাকার বাইরে যেকোনো জেলায়: ৳${toBanglaDigits(feeOutside)} (সময়: ${timeOutside})\n\n💵 ১০০% ক্যাশ অন ডেলিভারি (কোনো অগ্রিম টাকা দিতে হবে না, পার্সেল হাতে পেয়ে ডেলিভারিম্যানকে টাকা দিবেন)। 🤝`;
  }

  // E. Advance Payment / Payment Methods
  const isPaymentQuery =
    lower.includes('advance') ||
    lower.includes('bkash') ||
    lower.includes('payment') ||
    lower.includes('বিকাশ') ||
    lower.includes('অগ্রিম') ||
    lower.includes('পেমেন্ট') ||
    lower.includes('টাকা কিভাবে');

  if (isPaymentQuery) {
    return `আমাদের কোনো প্রকার অগ্রিম (Advance) টাকা দিতে হয় না! 😊\n\nসম্পূর্ণ ক্যাশ অন ডেলিভারি (Cash On Delivery) — পার্সেল হাতে পেয়ে কোয়ালিটি ও সাইজ চেক করে ডেলিভারিম্যানের কাছে মূল্য পরিশোধ করবেন। 🤝`;
  }

  // F. "Tumi ki koro" / "Who are you" / "কি করো"
  const isWhatDoYouDo =
    lower.includes('tumi ki koro') ||
    lower.includes('ki koro') ||
    lower.includes('apni ki koren') ||
    lower.includes('tumi k') ||
    lower.includes('koro ki') ||
    lower.includes('তুমি কি করো') ||
    lower.includes('কি করো') ||
    lower.includes('কি কাজ');

  if (isWhatDoYouDo) {
    return `আমি OrderFlow BD-এর স্মার্ট AI সেলস অ্যাসিস্ট্যান্ট! 🤖✨\n\nআমি আপনাকে আমাদের প্রিমিয়াম ড্রেস কালেকশন দেখতে, দাম ও সাইজ জানতে এবং সরাসরি ক্যাশ অন ডেলিভারিতে দ্রুত অর্ডার কনফার্ম করতে সাহায্য করি।\n\nআপনি কি আমাদের আজকের স্পেশাল কালেকশন দেখতে চান? 😊`;
  }

  // G. Greetings ("Ki obostha", "Kemon acho", "Hi", "Hello", "Salam")
  const isGreeting =
    lower.includes('ki obostha') ||
    lower.includes('kemon acho') ||
    lower.includes('kemon achen') ||
    lower.includes('hi') ||
    lower.includes('hello') ||
    lower.includes('salam') ||
    lower.includes('assalamu alaikum') ||
    lower.includes('সালাম') ||
    lower.includes('হ্যালো') ||
    lower.includes('কেমন আছেন') ||
    lower.includes('কি অবস্থা');

  if (isGreeting) {
    return `আলহামদুলিল্লাহ ভালো আছি! OrderFlow BD-তে আপনাকে স্বাগতম। 🌸\n\nআমাদের কাছে রয়েছে এক্সক্লুসিভ পার্টি গাউন, টাঙ্গাইল জামদানি শাড়ি, ডিজাইনার কুর্তি ও প্রিমিয়াম থ্রি-পিস কালেকশন।\n\nআজকে আপনাকে কোন প্রোডাক্টের ব্যাপারে সাহায্য করতে পারি? 😊`;
  }

  // H. Order Request (wants to order but details not provided yet)
  if (hasOrderIntent) {
    return `ধন্যবাদ ${customerName}! অর্ডার কনফার্ম করতে অনুগ্রহ করে নিচের তথ্যগুলো লিখে পাঠান:\n\n১. আপনার নাম\n২. ১১ ডিজিটের মোবাইল নম্বর\n৩. সম্পূর্ণ ডেলিভারি ঠিকানা (জেলা, থানা ও এলাকা)\n৪. পছন্দের প্রোডাক্টের নাম ও সাইজ\n\n🚚 ১০০% ক্যাশ অন ডেলিভারিতে আমরা দ্রুততম সময়ে পৌঁছে দেব! 🤝`;
  }

  // I. Return & Exchange Policy
  const isReturn =
    lower.includes('return') ||
    lower.includes('change') ||
    lower.includes('exchange') ||
    lower.includes('রিটার্ন') ||
    lower.includes('পরিবর্তন') ||
    lower.includes('সমস্যা হলে');

  if (isReturn) {
    return `🔄 এক্সচেঞ্জ ও রিটার্ন সুবিধা:\n\nডেলিভারিম্যানের সামনে পার্সেল চেক করে নিতে পারবেন। কোনো সাইজ বা কোয়ালিটিতে সমস্যা থাকলে ৩ কার্যদিবসের মধ্যে সম্পূর্ণ ফ্রিতে পরিবর্তন (Exchange) করে দেওয়া হবে।`;
  }

  // J. Customer Care / Helpline
  const isHelpline =
    lower.includes('helpline') ||
    lower.includes('call') ||
    lower.includes('number') ||
    lower.includes('কথা বলতে চাই') ||
    lower.includes('ফোন নম্বর') ||
    lower.includes('হেল্পলাইন');

  if (isHelpline) {
    return `📞 আমাদের কাস্টমার কেয়ার হেল্পলাইন: ${helpline}। আমাদের সাপোর্ট টিম সকাল ১০টা থেকে রাত ১০টা পর্যন্ত আপনাদের সেবায় সক্রিয় থাকে। ❤️`;
  }

  // Default Smart Assistant Fallback with Catalog Highlights
  return `ধন্যবাদ ${customerName}! OrderFlow BD-তে আপনাকে স্বাগতম। 🌸\n\nআমাদের সেরা কালেকশনসমূহ:\n${fullCatalogList}\n\nডেলিভারি চার্জ: ঢাকা সিটিতে ৳${toBanglaDigits(feeDhaka)}, ঢাকার বাইরে ৳${toBanglaDigits(feeOutside)} (১০০% ক্যাশ অন ডেলিভারি)।\n\nকোনো ড্রেস পছন্দ হলে বা অর্ডার করতে আমাদের জানান! 🛍️`;
}

