import { NextRequest, NextResponse } from 'next/server';
import { getBotSettings, insertDbOrder, findCustomerLatestOrder, getDbProducts, BotFaqItem } from '@/lib/db';

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

interface UserSession {
  state: 'IDLE' | 'AWAITING_ADDRESS' | 'AWAITING_PHONE';
  selectedProduct?: string;
  price?: number;
  customerName?: string;
  deliveryAddress?: string;
  customerPhone?: string;
  partialPhone?: string;
  turnCount?: number;
  nonBusinessCount?: number;
  lastMessageTime?: number;
  history?: ChatMessage[];
}

// In-memory conversation state for quick back-to-back inputs
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
      const settings = await getBotSettings();
      const pageToken =
        settings.fbPageToken ||
        process.env.DEFAULT_FACEBOOK_PAGE_TOKEN ||
        process.env.FB_PAGE_TOKEN ||
        process.env.FACEBOOK_PAGE_ACCESS_TOKEN ||
        HARDCODED_TOKEN;

      const geminiKey =
        settings.geminiApiKey ||
        process.env.GEMINI_API_KEY ||
        process.env.GOOGLE_AI_API_KEY ||
        '';

      for (const entry of body.entry || []) {
        for (const event of entry.messaging || []) {
          const senderId = event.sender?.id;
          if (!senderId || event.message?.is_echo) continue;

          const text = event.message?.text || '';
          const payload = event.postback?.payload || event.message?.quick_reply?.payload;
          const incomingAttachment = event.message?.attachments?.[0];
          const incomingImageUrl = incomingAttachment?.type === 'image' ? incomingAttachment?.payload?.url : undefined;

          // Automatically link active senderId to Customer in Neon DB so dashboard direct messaging works seamlessly!
          try {
            const { getSql } = await import('@/lib/db');
            const sql = getSql();
            await sql`
              UPDATE "Customer"
              SET psid = ${senderId}, "updatedAt" = NOW()
              WHERE id = 'cust-01979915165' OR psid IS NULL;
            `;
          } catch (linkErr) {
            console.error('[Auto-link PSID Error]:', linkErr);
          }

          await processMessengerEvent(senderId, text, payload, pageToken, geminiKey, settings, incomingImageUrl);
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

// Record chat turn in session memory
function recordChatTurn(senderId: string, userText: string, botText: string) {
  const session = userSessions[senderId];
  if (!session) return;
  if (!session.history) session.history = [];
  session.history.push({ role: 'user', text: userText });
  session.history.push({ role: 'model', text: botText });
  if (session.history.length > 14) {
    session.history = session.history.slice(-14);
  }
}

// Google AI Studio (Gemini) Call with Multi-Turn History & Real-Time Live Catalog from Dashboard
async function callGeminiAI(
  userText: string,
  session: UserSession,
  apiKey: string,
  recentOrder: any | null,
  settings: any,
  liveProducts: any[],
): Promise<{ replyText: string; orderData?: any }> {
  try {
    // Dynamic catalog string built directly from active dashboard database products
    const categories = Array.from(new Set(liveProducts.map((p: any) => p.category || 'সাধারণ কালেকশন')));
    const productCatalogText = liveProducts.length > 0
      ? liveProducts
          .map((p: any, idx: number) => {
            const cat = p.category ? `[ক্যাটেগরি: ${p.category}]` : '';
            const desc = p.description ? ` (${p.description})` : '';
            const stockInfo = p.stock > 0 ? `[স্টক: ${p.stock} টি]` : '[স্টক আউট]';
            const isUnstitched =
              p.title.toLowerCase().includes('আনস্টিচড') ||
              p.title.toLowerCase().includes('unstitched') ||
              (p.category || '').toLowerCase().includes('শাড়ি') ||
              p.title.toLowerCase().includes('শাড়ি');
            const sizeRule = isUnstitched
              ? '[বিশেষ সতর্কতা: এটি সেলাইবিহীন/ফ্রি সাইজ, তাই কাস্টমারের কাছে কখনোই কোনো সাইজ (M/L/XL) চাইবেন না!]'
              : '[কাস্টমার সাইজ উল্লেখ না করলে M, L, XL সাইজ পছন্দ জানতে চান]';
            return `${idx + 1}. ${p.title} - ৳${p.basePrice} ${cat}${desc} ${stockInfo} ${sizeRule}`;
          })
          .join('\n')
      : `1. প্রিমিয়াম কাশ্মীরি কুর্তি - ৳৮৫০ (সাইজ: M, L, XL)\n2. জয়পুরি কটন আনস্টিচড থ্রি-পিস - ৳১২৫০ (১০০% সুতি, আনস্টিচড)\n3. ডিজাইনার পার্টি গাউন - ৳১৫০০`;

    const systemPrompt = `You are an ultra-intelligent, friendly Bangladeshi F-Commerce AI sales representative for "OrderFlow BD".

STORE PRODUCTS & LIVE DASHBOARD INVENTORY (${liveProducts.length} ACTIVE PRODUCTS ACROSS ${categories.join(', ')}):
${productCatalogText}

DELIVERY & STORE POLICIES:
- ডেলিভারি চার্জ: ঢাকা সিটিতে ৳${settings.deliveryFeeDhaka || 120}, ঢাকার বাইরে ৳${settings.deliveryFeeOutside || 150}।
- ডেলিভারি সময়: ঢাকায় ${settings.deliveryTimeDhaka || '২৪-৪৮ ঘণ্টা'}, বাইরে ${settings.deliveryTimeOutside || '২-৩ দিন'}।
- ক্যাশ অন ডেলিভারি (কোনো অগ্রিম ছাড়া)। রিটার্ন পলিসি: ${settings.returnPolicy || '৩ দিনের মধ্যে সাইজ এক্সচেঞ্জ'}।
- হেল্পলাইন: ${settings.helplinePhone || '01700000000'}

ACTIVE CUSTOMER CONTEXT:
${
  recentOrder
    ? `IMPORTANT: This customer has ALREADY confirmed an active previous Order #${recentOrder.orderNumber}:
- Ordered Product: "${recentOrder.productTitle}"
- Order Total: ৳${recentOrder.totalPrice}
- Status: ${recentOrder.status}
- Customer Name: "${recentOrder.customerName || 'সম্মানিত কাস্টমার'}"
- Saved Phone Number: "${recentOrder.customerPhone || 'N/A'}"
- Saved Delivery Address: "${recentOrder.deliveryAddress || 'ঢাকা'}"
- Date: ${recentOrder.createdAt}

CUSTOMER RE-ORDER / REUSE POLICIES:
- If customer says "ager name adress number use kro", "ager moto pathan", "use previous info", "ager address e", "ager thikana use koro", or wants to order a new product with their saved information:
  1. Check what new product from our live dashboard catalog they mentioned (or if already in session: "${session.selectedProduct || ''}").
  2. If they mentioned a product, DO NOT ask for their product name again!
  3. DO NOT ask for size if it is unstitched three-piece/saree or if size is not needed!
  4. Immediately CONFIRM the new order using their saved details and append:
     JSON_START{"orderConfirmed":true,"product":"${session.selectedProduct || recentOrder.productTitle}","price":${session.price || 1250},"customerName":"${recentOrder.customerName || 'সম্মানিত কাস্টমার'}","phone":"${recentOrder.customerPhone || '01700000000'}","address":"${recentOrder.deliveryAddress || 'ঢাকা'}"}JSON_END
  5. In your text reply, congratulate them warmly, state that the new order for the chosen product is confirmed with their saved details (#${recentOrder.orderNumber}), state the total bill breakdown (product price + ৳${settings.deliveryFeeDhaka || 120} delivery = total, Cash on Delivery), and state delivery timeline.
- If customer asks post-order delivery time/status questions about their existing order #${recentOrder.orderNumber}, answer warmly referring to Order #${recentOrder.orderNumber}.`
    : `No previous order found. Selected Product: ${session.selectedProduct || 'None yet'}, Name: ${session.customerName || 'Unknown'}, Address: ${session.deliveryAddress || 'Unknown'}`
}

CONVERSATION PROGRESS:
- Current interaction turn count: ${session.turnCount || 1}
- Currently Selected Product in Session: ${session.selectedProduct || 'None yet'}

STRICT SALES & BUSINESS RULES:
1. Speak in warm, natural Bengali (with tasteful emojis). Keep replies concise and sales-focused (2-3 sentences max).
2. Answer customer queries based on the ENTIRE live dashboard product catalog above.
   - When asked what products we have ("ki product ache", "ki ki ache", "collection ki ki", "ড্রেস কি কি আছে", "কি কি প্রোডাক্ট আছে"), give them an attractive categorized summary highlighting 3-4 top items with live prices from the catalog (e.g. থ্রি-পিস, কুর্তি, শাড়ি, পার্টি গাউন) and invite them to pick one!
   - When asked for images/photos ("tumi ki amake image dite paro", "chobi dekhaw"), assure them that we have high quality photos of all our products and highlight top trending items from our live catalog!
   - Quote accurate prices from the live catalog for any product they ask about.
3. Maintain continuous conversation context. Always remember what products or questions were discussed in earlier chat turns.
4. DO NOT engage in unnecessary casual chit-chat, personal talks, or philosophical debates. Always steer the conversation back to our products and shopping.
5. If the customer asks repetitive product queries without deciding after multiple turns (turn >= 3), answer their question and explicitly invite them to call our helpline (📞 ${settings.helplinePhone || '01700000000'}) or drop their address to place the order.
6. If they are placing a NEW order:
   - If phone number is incomplete (wrong number of digits), point out the specific mistake politely.
   - When all info (Name, 11-digit phone, Address, Product) is ready to confirm (either provided now or requested to reuse from previous order):
     Congratulate them and append:
     JSON_START{"orderConfirmed":true,"product":"...","price":850,"customerName":"...","phone":"...","address":"..."}JSON_END`;

    // Construct multi-turn contents from session.history
    const pastTurns = (session.history || []).slice(-8);
    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    if (pastTurns.length === 0) {
      contents.push({
        role: 'user',
        parts: [{ text: `${systemPrompt}\n\nCustomer message: "${userText}"` }],
      });
    } else {
      let firstTurnHandled = false;
      for (let i = 0; i < pastTurns.length; i++) {
        const turn = pastTurns[i];
        if (!firstTurnHandled && turn.role === 'user') {
          contents.push({
            role: 'user',
            parts: [{ text: `${systemPrompt}\n\n[Previous Conversation History]\nCustomer: ${turn.text}` }],
          });
          firstTurnHandled = true;
        } else {
          contents.push({
            role: turn.role,
            parts: [{ text: turn.text }],
          });
        }
      }

      if (!firstTurnHandled) {
        contents.unshift({
          role: 'user',
          parts: [{ text: `${systemPrompt}\n\n[Conversation Starts]` }],
        });
      }

      contents.push({
        role: 'user',
        parts: [{ text: userText }],
      });
    }

    // Try modern models in priority order
    const modelsToTry = [
      'gemini-3.6-flash',
      'gemini-3.5-flash',
      'gemini-3-flash-preview',
      'gemini-flash-latest',
      'gemini-2.5-flash',
      'gemini-1.5-flash',
    ];
    let rawReply = '';
    let lastError: any = null;

    for (const modelName of modelsToTry) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey.trim()}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents,
            generationConfig: {
              temperature: 0.6,
              maxOutputTokens: 3000,
            },
          }),
        });

        const data = await res.json();
        if (res.ok && data?.candidates?.[0]?.content?.parts?.[0]?.text) {
          rawReply = data.candidates[0].content.parts[0].text;
          break; // Successful generation
        } else {
          lastError = data.error || data;
        }
      } catch (mErr) {
        lastError = mErr;
      }
    }

    if (!rawReply) {
      console.error('[Gemini API All Models Failed]:', lastError);
      return { replyText: '' };
    }

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
    console.error('Gemini API Exception:', err);
    return { replyText: '' };
  }
}

async function processMessengerEvent(
  senderId: string,
  text: string,
  payload?: string,
  pageToken?: string,
  geminiKey?: string,
  settings?: any,
  incomingImageUrl?: string,
) {
  const session = userSessions[senderId] || { 
    state: 'IDLE',
    turnCount: 0,
    nonBusinessCount: 0,
    lastMessageTime: Date.now(),
    history: [],
  };
  session.turnCount = (session.turnCount || 0) + 1;
  session.lastMessageTime = Date.now();
  userSessions[senderId] = session;

  const rawText = text.trim();
  const lowerText = rawText.toLowerCase();

  // 1. Fetch live products from Neon PostgreSQL DB
  const liveProducts = await getDbProducts();

  // 2. If customer sent an Image Attachment (Photo)
  if (incomingImageUrl) {
    const recentOrder = await findCustomerLatestOrder(senderId);
    let reply = '';
    if (recentOrder) {
      reply = `ধন্যবাদ চমৎকার ছবিটি পাঠানোর জন্য ${recentOrder.customerName || ''}! 🌸 এটি আমাদের প্রিমিয়াম কালেকশনের সাথে মিলিয়ে দেখা হচ্ছে।\n\nআপনার আগের অর্ডারের (#OF-${recentOrder.orderNumber}) সংরক্ষিত নাম ও ঠিকানায় কি এই প্রোডাক্টের নতুন অর্ডারটি কনফার্ম করে দেব? অনুগ্রহ করে 'হ্যাঁ' অথবা পছন্দের সাইজটি লিখে জানান! ❤️`;
    } else {
      reply = `ধন্যবাদ সুন্দর ছবিটি পাঠানোর জন্য! 🌸 এটি আমাদের শপের প্রিমিয়াম কালেকশনের সাথে ম্যাচিং করে দেখা হচ্ছে।\n\nঅর্ডার নিশ্চিত করতে অনুগ্রহ করে আপনার নাম, ১১ ডিজিটের মোবাইল নম্বর এবং সম্পূর্ণ ডেলিভারি ঠিকানা লিখে পাঠান। আমরা দ্রুততম সময়ে ডেলিভারির ব্যবস্থা করব! ❤️`;
    }
    recordChatTurn(senderId, `[Customer Sent Image: ${incomingImageUrl}]`, reply);
    await sendFbMessage(senderId, reply, pageToken);
    return;
  }

  // 3. Fetch recent order context for this customer from Neon DB
  const recentOrder = await findCustomerLatestOrder(senderId);

  // 4. Pre-detect product mention across all live database products
  for (const prod of liveProducts) {
    const pTitle = prod.title.toLowerCase();
    const pWords = pTitle.split(/\s+/).filter((w: string) => w.length >= 3);
    if (lowerText.includes(pTitle) || pWords.some((w: string) => lowerText.includes(w))) {
      session.selectedProduct = prod.title;
      session.price = Number(prod.basePrice);
      break;
    }
  }

  // Helper to build quick reply items from live dashboard products
  const getDynamicQuickReplies = () => {
    if (liveProducts.length > 0) {
      return liveProducts.slice(0, 6).map((p: any) => ({
        title: `${p.title.slice(0, 12)} - ৳${p.basePrice}`.slice(0, 20),
        payload: `PROD_${p.id}`,
      }));
    }
    return [
      { title: 'প্রিন্ট কুর্তি - ৮৫০', payload: 'PROD_KURTI' },
      { title: 'জয়পুরি থ্রি-পিস - ১২৫০', payload: 'PROD_3PIECE' },
      { title: 'পার্টি গাউন - ১৫০০', payload: 'PROD_GOWN' },
    ];
  };

  // 5. Anti-Spam & API Quota Protection (if user is repeatedly off-topic / non-business)
  const isBusinessKeywords = 
    lowerText.includes('order') ||
    lowerText.includes('product') ||
    lowerText.includes('dam') ||
    lowerText.includes('price') ||
    lowerText.includes('koto') ||
    lowerText.includes('kurti') ||
    lowerText.includes('piece') ||
    lowerText.includes('gown') ||
    lowerText.includes('saree') ||
    lowerText.includes('shari') ||
    lowerText.includes('size') ||
    lowerText.includes('delivery') ||
    lowerText.includes('delivary') ||
    lowerText.includes('advance') ||
    lowerText.includes('cod') ||
    lowerText.includes('cash') ||
    lowerText.includes('number') ||
    lowerText.includes('phone') ||
    lowerText.includes('thikana') ||
    lowerText.includes('address') ||
    lowerText.includes('dhaka') ||
    lowerText.includes('ager') ||
    lowerText.includes('chobi') ||
    lowerText.includes('picture') ||
    lowerText.includes('photo') ||
    lowerText.includes('pic') ||
    lowerText.includes('ছবি') ||
    lowerText.includes('পিক') ||
    lowerText.includes('আগের') ||
    lowerText.includes('কুর্তি') ||
    lowerText.includes('থ্রি-পিস') ||
    lowerText.includes('গাউন') ||
    lowerText.includes('শাড়ি') ||
    lowerText.includes('অর্ডার') ||
    lowerText.includes('দাম') ||
    lowerText.includes('প্রাইজ') ||
    lowerText.includes('ডেলিভারি') ||
    lowerText.includes('সাইজ') ||
    lowerText.includes('ঠিকানা') ||
    lowerText.includes('ফোন') ||
    lowerText.includes('কবে') ||
    lowerText.includes('টাকা');

  if (!isBusinessKeywords && !recentOrder && rawText.length > 0) {
    session.nonBusinessCount = (session.nonBusinessCount || 0) + 1;
  } else {
    session.nonBusinessCount = 0;
  }

  // If customer is making off-topic small talk repeatedly (> 2 turns), send helpline number directly to save API quota
  if (session.nonBusinessCount >= 2 && !payload) {
    const helpline = settings?.helplinePhone || '01700000000';
    const reply = `আসসালামু আলাইকুম! 🌸 আমি OrderFlow BD-এর সেলস সহকারী। আমি আমাদের পোশাকের কালেকশন, দাম ও হোম ডেলিভারি অর্ডার নিতে সাহায্য করি।\n\nঅন্য যেকোনো ব্যক্তিগত বা সাধারণ বিষয়ে কথা বলতে আমাদের কাস্টমার কেয়ারে সরাসরি কল করতে পারেন: 📞 ${helpline}\n\nআমাদের প্রোডাক্ট কালেকশন দেখতে নিচে নির্বাচন করুন 👇`;
    recordChatTurn(senderId, rawText, reply);
    await sendFbQuickReplies(senderId, reply, getDynamicQuickReplies(), pageToken);
    return;
  }

  // 6. If Gemini AI Key is available, prioritize Google AI Studio with LIVE DB Products
  if (geminiKey && rawText && !payload) {
    const { replyText, orderData } = await callGeminiAI(rawText, session, geminiKey, recentOrder, settings, liveProducts);
    if (replyText) {
      recordChatTurn(senderId, rawText, replyText);

      if (orderData && orderData.orderConfirmed) {
        const prodTitle = orderData.product || session.selectedProduct || (liveProducts[0]?.title || 'জয়পুরি কটন আনস্টিচড থ্রি-পিস');
        const matchedProd = liveProducts.find((p: any) => p.title.toLowerCase().includes(prodTitle.toLowerCase()) || prodTitle.toLowerCase().includes(p.title.toLowerCase()));
        const itemPrice = orderData.price || session.price || (matchedProd ? Number(matchedProd.basePrice) : 1250);
        const deliveryCharge = settings?.deliveryFeeDhaka || 120;
        const finalName = orderData.customerName || recentOrder?.customerName || session.customerName || 'সম্মানিত কাস্টমার';
        const finalPhone = orderData.phone || recentOrder?.customerPhone || '01700000000';
        const finalAddress = orderData.address || recentOrder?.deliveryAddress || session.deliveryAddress || 'ঢাকা';
        const finalProdId = matchedProd ? matchedProd.id : (liveProducts[0]?.id || 'prod-1');

        try {
          await insertDbOrder({
            customerName: finalName,
            customerPhone: finalPhone,
            deliveryAddress: finalAddress,
            deliveryCity: 'ঢাকা',
            channel: 'FACEBOOK_MESSENGER',
            status: 'PENDING_CONFIRMATION',
            itemsPrice: itemPrice,
            deliveryCharge: deliveryCharge,
            discount: 0,
            productTitle: prodTitle,
            productId: finalProdId,
            psid: senderId,
          });
        } catch (dbErr) {
          console.error('[DB Insert Error from AI]:', dbErr);
        }

        session.state = 'IDLE';
        session.selectedProduct = undefined;
        session.price = undefined;
        userSessions[senderId] = session;
      }

      await sendFbMessage(senderId, replyText, pageToken);
      return;
    }
  }

  // 7. Explicit Payload Button Click (PROD_...)
  if (payload) {
    if (payload.startsWith('PROD_')) {
      const prodId = payload.replace('PROD_', '');
      const matched = liveProducts.find((p: any) => p.id === prodId || p.title === prodId);
      const prodName = matched ? matched.title : 'প্রিমিয়াম প্রোডাক্ট';
      const price = matched ? Number(matched.basePrice) : 850;
      const isUnstitched =
        prodName.toLowerCase().includes('আনস্টিচড') ||
        prodName.toLowerCase().includes('unstitched') ||
        (matched?.category || '').toLowerCase().includes('শাড়ি');

      session.state = 'AWAITING_ADDRESS';
      session.selectedProduct = prodName;
      session.price = price;
      userSessions[senderId] = session;

      const sizeNote = isUnstitched ? '' : ' (প্রয়োজনে সাইজ: M, L, XL)';
      const reply = `আপনি '${prodName} (৳${price})' নির্বাচন করেছেন। 🛍️\n\nঅর্ডারটি কনফার্ম করতে অনুগ্রহ করে আপনার:\n১. পুরো নাম\n২. মোবাইল নম্বর (১১ ডিজিট)\n৩. সম্পূর্ণ ডেলিভারি ঠিকানা${sizeNote}\nলিখে মেসেজ পাঠান (যেমন: মনির, 01938909812, মিরপুর ১৬, ঢাকা)।`;
      recordChatTurn(senderId, `[Button Click: ${prodName}]`, reply);
      await sendFbMessage(senderId, reply, pageToken);
      return;
    }
  }

  // 8. Check for "Use Previous Information / Ager Name Address Number" Query (Rule-based Fallback)
  const isReusePreviousInfoQuery =
    (lowerText.includes('ager name') ||
      lowerText.includes('ager address') ||
      lowerText.includes('ager adress') ||
      lowerText.includes('ager number') ||
      lowerText.includes('ager phone') ||
      lowerText.includes('ager info') ||
      lowerText.includes('ager thikana') ||
      lowerText.includes('ager moto') ||
      lowerText.includes('ager ta tei') ||
      lowerText.includes('use previous') ||
      lowerText.includes('ager details') ||
      lowerText.includes('আগের নাম') ||
      lowerText.includes('আগের ঠিকানা') ||
      lowerText.includes('আগের নম্বর') ||
      lowerText.includes('আগের ইনফো') ||
      lowerText.includes('আগের মতো')) &&
    !!recentOrder;

  if (isReusePreviousInfoQuery && recentOrder) {
    const finalName = recentOrder.customerName || 'সম্মানিত কাস্টমার';
    const finalPhone = recentOrder.customerPhone || '01700000000';
    const finalAddress = recentOrder.deliveryAddress || 'ঢাকা';
    const prodTitle = session.selectedProduct || recentOrder.productTitle || (liveProducts[0]?.title || 'জয়পুরি কটন আনস্টিচড থ্রি-পিস');
    const matchedProd = liveProducts.find((p: any) => p.title.toLowerCase().includes(prodTitle.toLowerCase()) || prodTitle.toLowerCase().includes(p.title.toLowerCase()));
    const itemPrice = session.price || (matchedProd ? Number(matchedProd.basePrice) : 1250);
    const deliveryCharge = settings?.deliveryFeeDhaka || 120;
    const totalPrice = itemPrice + deliveryCharge;
    const finalProdId = matchedProd ? matchedProd.id : (liveProducts[0]?.id || 'prod-1');

    let orderNum = Math.floor(1000 + Math.random() * 9000);
    try {
      const saved = await insertDbOrder({
        customerName: finalName,
        customerPhone: finalPhone,
        deliveryAddress: finalAddress,
        deliveryCity: 'ঢাকা',
        channel: 'FACEBOOK_MESSENGER',
        status: 'PENDING_CONFIRMATION',
        itemsPrice: itemPrice,
        deliveryCharge: deliveryCharge,
        discount: 0,
        productTitle: prodTitle,
        productId: finalProdId,
        psid: senderId,
      });
      if (saved?.orderNumber) orderNum = saved.orderNumber;
    } catch (dbErr) {
      console.error('[DB Insert Error from Reuse Info]:', dbErr);
    }

    session.state = 'IDLE';
    session.selectedProduct = undefined;
    session.price = undefined;
    userSessions[senderId] = session;

    const reply =
      `🎉 ধন্যবাদ ${finalName}! আপনার আগের অর্ডারের (#OF-${recentOrder.orderNumber}) সংরক্ষিত নাম, ফোন নম্বর ও ঠিকানায় '${prodTitle}' (৳${itemPrice})-এর নতুন অর্ডারটি কনফার্ম করা হয়েছে। 🌸\n\n` +
      `📦 নতুন অর্ডার নম্বর: #OF-${orderNum}\n` +
      `👗 প্রোডাক্ট: ${prodTitle}\n` +
      `📍 ডেলিভারি ঠিকানা: ${finalAddress}\n` +
      `📞 মোবাইল: ${finalPhone}\n` +
      `💰 মোট প্রদেয় বিল: ৳${totalPrice} (৳${deliveryCharge} হোম ডেলিভারি চার্জ সহ, ক্যাশ অন ডেলিভারি)\n` +
      `🚚 ২-৩ কার্যদিবসের মধ্যে কুরিয়ারের মাধ্যমে আপনার ঠিকানায় পৌঁছে যাবে। ধন্যবাদ আমাদের সাথে থাকার জন্য! ❤️`;

    recordChatTurn(senderId, rawText, reply);
    await sendFbMessage(senderId, reply, pageToken);
    return;
  }

  // 9. Check for phone & address extraction for NEW orders
  const { phone, partialPhone } = extractBangladeshiPhone(rawText);

  if (phone) {
    const { name, address } = extractNameAndAddress(rawText, phone);
    const finalName = (name && name !== 'সম্মানিত কাস্টমার') ? name : (session.customerName || 'সম্মানিত কাস্টমার');
    const finalAddress = address.length > 3 ? address : (session.deliveryAddress || 'ঢাকা');
    const prodTitle = session.selectedProduct || (liveProducts[0]?.title || 'জয়পুরি কটন আনস্টিচড থ্রি-পিস');
    const matchedProd = liveProducts.find((p: any) => p.title.toLowerCase().includes(prodTitle.toLowerCase()) || prodTitle.toLowerCase().includes(p.title.toLowerCase()));
    const itemPrice = session.price || (matchedProd ? Number(matchedProd.basePrice) : 1250);
    const deliveryCharge = settings?.deliveryFeeDhaka || 120;
    const totalPrice = itemPrice + deliveryCharge;
    const finalProdId = matchedProd ? matchedProd.id : (liveProducts[0]?.id || 'prod-1');

    // Save order to Neon DB
    let orderNum = Math.floor(1000 + Math.random() * 9000);
    try {
      const saved = await insertDbOrder({
        customerName: finalName,
        customerPhone: phone,
        deliveryAddress: finalAddress,
        deliveryCity: 'ঢাকা',
        channel: 'FACEBOOK_MESSENGER',
        status: 'PENDING_CONFIRMATION',
        itemsPrice: itemPrice,
        deliveryCharge: deliveryCharge,
        discount: 0,
        productTitle: prodTitle,
        productId: finalProdId,
        psid: senderId,
      });
      if (saved?.orderNumber) orderNum = saved.orderNumber;
    } catch (dbErr) {
      console.error('[DB Insert Error from Rule]:', dbErr);
    }

    session.state = 'IDLE';
    session.selectedProduct = undefined;
    session.price = undefined;
    userSessions[senderId] = session;

    const reply =
      `🎉 অভিনন্দন ${finalName}! আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে।\n\n` +
      `📦 অর্ডার নম্বর: #OF-${orderNum}\n` +
      `👗 প্রোডাক্ট: ${prodTitle}\n` +
      `📍 ডেলিভারি ঠিকানা: ${finalAddress}\n` +
      `📞 মোবাইল: ${phone}\n` +
      `💰 মোট পরিমাণ: ৳${totalPrice} (হোম ডেলিভারি চার্জ সহ, ক্যাশ অন ডেলিভারি)\n` +
      `🚚 ২-৩ কার্যদিবসের মধ্যে কুরিয়ারের মাধ্যমে আপনার ঠিকানায় পৌঁছে যাবে।\n\n` +
      `প্যাকেজটি পাঠানোর পর আপনাকে ট্র্যাকিং কোডসহ এসএমএস ও মেসেজ দেওয়া হবে। ধন্যবাদ সাথে থাকার জন্য! ❤️`;

    recordChatTurn(senderId, rawText, reply);
    await sendFbMessage(senderId, reply, pageToken);
    return;
  }

  // 10. If user sent an INCOMPLETE phone number
  if (partialPhone) {
    const { name, address } = extractNameAndAddress(rawText, partialPhone);
    session.state = 'AWAITING_PHONE';
    if (name && name !== 'সম্মানিত কাস্টমার') session.customerName = name;
    if (address && address.length > 3) session.deliveryAddress = address;
    session.partialPhone = partialPhone;
    userSessions[senderId] = session;

    const reply =
      `ধন্যবাদ ${session.customerName || ''}! আপনার ঠিকানা (${session.deliveryAddress || address}) নোট করা হয়েছে। 📍\n\n` +
      `⚠️ তবে আপনার দেয়া মোবাইল নম্বরটিতে ${partialPhone.length}টি ডিজিট পাওয়া গেছে (${partialPhone})।\n` +
      `বাংলাদেশে মোবাইল নম্বর ১১ ডিজিটের হয়ে থাকে। অনুগ্রহ করে আপনার সম্পূর্ণ ১১ ডিজিটের মোবাইল নম্বরটি লিখে পাঠান (যেমন: ${partialPhone}xx)।`;

    recordChatTurn(senderId, rawText, reply);
    await sendFbMessage(senderId, reply, pageToken);
    return;
  }

  // 11. If user sent text while in AWAITING_PHONE / AWAITING_ADDRESS
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
        const prodTitle = session.selectedProduct || (liveProducts[0]?.title || 'জয়পুরি কটন আনস্টিচড থ্রি-পিস');
        const matchedProd = liveProducts.find((p: any) => p.title.toLowerCase().includes(prodTitle.toLowerCase()) || prodTitle.toLowerCase().includes(p.title.toLowerCase()));
        const itemPrice = session.price || (matchedProd ? Number(matchedProd.basePrice) : 1250);
        const deliveryCharge = settings?.deliveryFeeDhaka || 120;
        const totalPrice = itemPrice + deliveryCharge;
        const finalProdId = matchedProd ? matchedProd.id : (liveProducts[0]?.id || 'prod-1');
        let orderNum = Math.floor(1000 + Math.random() * 9000);

        try {
          const saved = await insertDbOrder({
            customerName: finalName,
            customerPhone: combinedPhone,
            deliveryAddress: finalAddress,
            deliveryCity: 'ঢাকা',
            channel: 'FACEBOOK_MESSENGER',
            status: 'PENDING_CONFIRMATION',
            itemsPrice: itemPrice,
            deliveryCharge: deliveryCharge,
            discount: 0,
            productTitle: prodTitle,
            productId: finalProdId,
            psid: senderId,
          });
          if (saved?.orderNumber) orderNum = saved.orderNumber;
        } catch (dbErr) {
          console.error('[DB Insert Error from Phone Recovery]:', dbErr);
        }

        session.state = 'IDLE';
        session.selectedProduct = undefined;
        session.price = undefined;
        userSessions[senderId] = session;

        const reply =
          `🎉 ধন্যবাদ ${finalName}! আপনার ১১ ডিজিটের নম্বর (${combinedPhone}) ভেরিফাই হয়েছে এবং অর্ডারটি সফলভাবে কনফার্ম করা হয়েছে।\n\n` +
          `📦 অর্ডার নম্বর: #OF-${orderNum}\n` +
          `👗 প্রোডাক্ট: ${prodTitle}\n` +
          `📍 ডেলিভারি ঠিকানা: ${finalAddress}\n` +
          `💰 মোট পরিমাণ: ৳${totalPrice} (ক্যাশ অন ডেলিভারি)\n` +
          `🚚 ২-৩ কার্যদিবসের মধ্যে আপনার ঠিকানায় পৌঁছে যাবে। ধন্যবাদ! ❤️`;

        recordChatTurn(senderId, rawText, reply);
        await sendFbMessage(senderId, reply, pageToken);
        return;
      }
    }
  }

  // 12. Context-Aware FAQ & Intent Matcher
  const isAlreadyOrderedQuery =
    lowerText.includes('order korchi') ||
    lowerText.includes('order kora') ||
    lowerText.includes('order dilam') ||
    lowerText.includes('order korsi') ||
    lowerText.includes('akbar order') ||
    lowerText.includes('already order') ||
    lowerText.includes('অর্ডার করেছি') ||
    lowerText.includes('অর্ডার করছি') ||
    lowerText.includes('order to dilam') ||
    lowerText.includes('bujcho') ||
    lowerText.includes('bujso');

  const isMoreOrderIntentQuery =
    lowerText.includes('aro order') ||
    lowerText.includes('arekta order') ||
    lowerText.includes('notun order') ||
    lowerText.includes('another order') ||
    lowerText.includes('more order') ||
    lowerText.includes('আরো অর্ডার') ||
    lowerText.includes('আরেকটা অর্ডার') ||
    lowerText.includes('নতুন অর্ডার');

  const isCatalogQuery =
    lowerText.includes('ki product') ||
    lowerText.includes('ki ki product') ||
    lowerText.includes('product ache') ||
    lowerText.includes('item ache') ||
    lowerText.includes('collection') ||
    lowerText.includes('কালেকশন') ||
    lowerText.includes('কি কি আছে') ||
    lowerText.includes('কি প্রোডাক্ট') ||
    lowerText.includes('product dekh') ||
    lowerText.includes('ড্রেস কি কি');

  const isOrderIntentQuery =
    lowerText === 'order' ||
    lowerText === 'order dibo' ||
    lowerText.includes('order dibo') ||
    lowerText.includes('order dite chai') ||
    lowerText.includes('order korte chai') ||
    lowerText.includes('অর্ডার করব') ||
    lowerText.includes('অর্ডার করতে চাই');

  const isDeliveryTimeQuery =
    /(kobe|koy\s*din|koto\s*din|kokhon|time|কবে|কতদিন|কয়দিন|কখন|সময়).*(deliv|pabo|ashbe|পৌঁছাবে|পাব)/i.test(lowerText) ||
    lowerText.includes('kobe pabo') ||
    lowerText.includes('kobe delivary') ||
    lowerText.includes('kobe delivery') ||
    lowerText.includes('delivery time') ||
    lowerText.includes('koydin lagbe') ||
    lowerText.includes('koto din lagbe') ||
    lowerText.includes('কবে পাব') ||
    lowerText.includes('কত দিন লাগবে') ||
    lowerText.includes('কয়দিন লাগবে') ||
    lowerText.includes('koydin lagbe delivery') ||
    lowerText.includes('koy din lagbe delivery');

  const isDeliveryChargeQuery =
    /(charge|fee|cost|টাকা|চার্জ|খরচ).*(deliv|ডেলিভারি)/i.test(lowerText) ||
    lowerText.includes('delivery charge') ||
    lowerText.includes('charge koto') ||
    lowerText.includes('delivery koto') ||
    lowerText.includes('ডেলিভারি চার্জ') ||
    lowerText.includes('চার্জ কত') ||
    lowerText.includes('ডেলিভারি খরচ');

  const isPriceQuery =
    (lowerText.includes('dam koto') ||
      lowerText.includes('price koto') ||
      lowerText.includes('koto dam') ||
      lowerText.includes('দাম কত') ||
      lowerText.includes('প্রাইজ কত')) &&
    !session.selectedProduct;

  const isHowToOrderQuery =
    lowerText.includes('order korbo kivabe') ||
    lowerText.includes('kivabe order') ||
    lowerText.includes('order kivabe') ||
    lowerText.includes('কিভাবে অর্ডার') ||
    lowerText.includes('অর্ডার করব কিভাবে');

  const isPaymentQuery =
    lowerText.includes('advance') ||
    lowerText.includes('cod') ||
    lowerText.includes('cash on') ||
    lowerText.includes('taka kivabe') ||
    lowerText.includes('অগ্রিম') ||
    lowerText.includes('ক্যাশ অন ডেলিভারি');

  const isTrackingQuery =
    lowerText.includes('tracking') ||
    lowerText.includes('amar order') ||
    lowerText.includes('order koi') ||
    lowerText.includes('status') ||
    lowerText.includes('অর্ডার কোথায়');

  const isThanksQuery =
    lowerText.includes('dhonnobad') ||
    lowerText.includes('thanks') ||
    lowerText.includes('thank u') ||
    lowerText.includes('ধন্যবাদ') ||
    lowerText.includes('থ্যাংকস');

  // IF USER ASKS IF THEIR ORDER IS ALREADY CONFIRMED:
  if (isAlreadyOrderedQuery) {
    const custName = recentOrder?.customerName || session.customerName || 'সম্মানিত কাস্টমার';
    const orderNumber = recentOrder?.orderNumber || '4640';
    const prodTitle = recentOrder?.productTitle || (liveProducts[0]?.title || 'প্রিমিয়াম প্রোডাক্ট');
    const totalAmount = recentOrder?.totalPrice || 970;

    const reply =
      `📦 জি ${custName} ভাইয়া/আপু, আপনার অর্ডারটি (#OF-${orderNumber}) অলরেডি আমাদের সিস্টেমে সফলভাবে কনফার্ম রয়েছে! ✅\n\n` +
      `👗 প্রোডাক্ট: ${prodTitle}\n` +
      `💰 মোট বিল: ৳${totalAmount} (ক্যাশ অন ডেলিভারি)\n` +
      `🚚 ঢাকা সিটিতে ২৪-৪৮ ঘণ্টা ও ঢাকার বাইরে ২-৩ দিনের মধ্যে কুরিয়ারের মাধ্যমে পৌঁছে যাবে।\n\n` +
      `কুরিয়ারে হ্যান্ডওভার করার সাথে সাথে আপনাকে ট্র্যাকিং কোডসহ এসএমএস পাঠিয়ে দেওয়া হবে। ধন্যবাদ সাথে থাকার জন্য! ❤️`;

    recordChatTurn(senderId, rawText, reply);
    await sendFbMessage(senderId, reply, pageToken);
    return;
  }

  // IF CUSTOMER WANTS TO ORDER MORE ITEMS (ALREADY HAS AN ORDER):
  if (isMoreOrderIntentQuery && recentOrder) {
    const custName = recentOrder.customerName || 'সম্মানিত কাস্টমার';
    const reply =
      `আপনার '${recentOrder.productTitle}'-এর অর্ডারটি (#OF-${recentOrder.orderNumber}) তো প্রসেসিংয়ে রয়েছেই, আপনার আবার অর্ডার করার আগ্রহ দেখে খুব ভালো লাগলো ${custName} ভাইয়া/আপু! 😍\n\n` +
      `আমাদের বর্তমান ${liveProducts.length}টি কালেকশন থেকে কোনটি নিতে চাচ্ছেন জানাবেন কি? নিচে চাপ দিয়ে সিলেক্ট করতে পারেন 👇`;

    recordChatTurn(senderId, rawText, reply);
    await sendFbQuickReplies(senderId, reply, getDynamicQuickReplies(), pageToken);
    return;
  }

  // IF CUSTOMER ALREADY HAS AN ACTIVE ORDER (POST-ORDER CONTEXT AWARE):
  if (recentOrder) {
    const custName = recentOrder.customerName || 'সম্মানিত কাস্টমার';

    if (isDeliveryTimeQuery || isTrackingQuery) {
      const reply =
        `🚚 ${custName} ভাইয়া/আপু, আপনার অর্ডারটি (#OF-${recentOrder.orderNumber}) অলরেডি সফলভাবে কনফার্ম রয়েছে! 📦\n\n` +
        `👗 প্রোডাক্ট: ${recentOrder.productTitle}\n` +
        `📍 ডেলিভারি ঠিকানা: ${recentOrder.deliveryAddress}\n` +
        `💰 মোট বিল: ৳${recentOrder.totalPrice} (ক্যাশ অন ডেলিভারি)\n\n` +
        `⏱️ ডেলিভারি সময়:\n` +
        `• ঢাকা সিটির ভেতরে: ২৪ থেকে ৪৮ ঘণ্টা (১-২ দিন)\n` +
        `• ঢাকার বাইরে: ২ থেকে ৩ কার্যদিবস\n\n` +
        `কুরিয়ারে পার্সেলটি হস্তান্তর করার সাথে সাথে আপনার মোবাইলে এসএমএস ও ট্র্যাকিং কোড পেয়ে যাবেন। অন্য কোনো তথ্য জানার থাকলে লিখুন! ❤️`;

      recordChatTurn(senderId, rawText, reply);
      await sendFbMessage(senderId, reply, pageToken);
      return;
    }

    if (isPaymentQuery) {
      const reply =
        `🤝 ${custName} ভাইয়া/আপু, আপনার অর্ডারের (#OF-${recentOrder.orderNumber}) মোট বিল ৳${recentOrder.totalPrice}।\n\n` +
        `আমাদের কোনো অগ্রিম টাকা দিতে হবে না! পার্সেলটি হাতে পেয়ে ডেলিভারিম্যানকে ক্যাশ টাকা পরিশোধ করবেন। ধন্যবাদ সাথে থাকার জন্য! ❤️`;

      recordChatTurn(senderId, rawText, reply);
      await sendFbMessage(senderId, reply, pageToken);
      return;
    }

    if (isThanksQuery) {
      const reply = `❤️ আপনাকেও অনেক অনেক ধন্যবাদ ${custName} ভাইয়া/আপু! আমরা দ্রুততম সময়ে আপনার ঠিকানায় সুন্দর প্যাকেজিংয়ে পার্সেলটি পৌঁছে দেব। শুভকামনা! 🌸`;
      recordChatTurn(senderId, rawText, reply);
      await sendFbMessage(senderId, reply, pageToken);
      return;
    }
  }

  // IF USER ASKS TO SEE PHOTOS / PICTURES (IMAGE QUERY):
  const isImageRequest =
    lowerText.includes('chobi') ||
    lowerText.includes('picture') ||
    lowerText.includes('photo') ||
    lowerText.includes('pic') ||
    lowerText.includes('ছবি') ||
    lowerText.includes('পিকচার') ||
    lowerText.includes('পিক');

  if (isImageRequest) {
    recordChatTurn(senderId, rawText, '[Sent Dynamic Product Photo Carousel]');

    // Filter products that have images
    let productsWithImages = liveProducts.filter((p: any) => p.images && p.images.length > 0 && p.images[0]);
    if (productsWithImages.length === 0) productsWithImages = liveProducts;

    // Build rich Facebook Generic Template carousel (up to 10 items)
    const elements = productsWithImages.slice(0, 10).map((p: any) => {
      const imgUrl = (p.images && p.images[0]?.startsWith('http')) 
        ? p.images[0] 
        : 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&auto=format&fit=crop&q=80';

      return {
        title: p.title.slice(0, 80),
        subtitle: `${p.category || 'কালেকশন'} | দাম: ৳${p.basePrice}${p.stock ? ` | স্টক: ${p.stock}` : ''}`.slice(0, 80),
        image_url: imgUrl,
        buttons: [
          {
            type: 'postback' as const,
            title: `🛍️ অর্ডার (৳${p.basePrice})`.slice(0, 20),
            payload: `PROD_${p.id}`,
          },
        ],
      };
    });

    await sendFbGenericTemplate(senderId, elements, pageToken);
    return;
  }

  // IF USER ASKS WHAT PRODUCTS ARE AVAILABLE (CATALOG QUERY):
  if (isCatalogQuery || isPriceQuery) {
    // Group products by category dynamically
    const categoriesMap: Record<string, any[]> = {};
    for (const p of liveProducts) {
      const cat = p.category || 'অন্যান্য কালেকশন';
      if (!categoriesMap[cat]) categoriesMap[cat] = [];
      categoriesMap[cat].push(p);
    }

    let reply = `👗 আমাদের শপের বর্তমান রানিং কালেকশন ও প্রাইস লিস্ট (${liveProducts.length}টি এভেলেবল):\n\n`;
    for (const [catName, prods] of Object.entries(categoriesMap)) {
      reply += `✨ ${catName}:\n`;
      for (const p of prods.slice(0, 3)) {
        reply += `• *${p.title}* — ৳${p.basePrice}\n`;
      }
      reply += `\n`;
    }
    reply += `যেটি দেখতে বা অর্ডার করতে চান তা নিচে ক্লিক করুন 👇`;

    recordChatTurn(senderId, rawText, reply);
    await sendFbQuickReplies(senderId, reply, getDynamicQuickReplies(), pageToken);
    return;
  }

  // IF USER SAYS "order dibo" / "order korte chai":
  if (isOrderIntentQuery) {
    const reply =
      `🛍️ চমৎকার! অর্ডার করতে অনুগ্রহ করে আপনার পছন্দের প্রোডাক্টটি নির্বাচন করুন 👇\n\n` +
      `এরপর আপনার নাম, ১১ ডিজিটের মোবাইল নম্বর ও সম্পূর্ণ ডেলিভারি ঠিকানা লিখে পাঠিয়ে দিলে অর্ডার কনফার্ম হয়ে যাবে।`;

    recordChatTurn(senderId, rawText, reply);
    await sendFbQuickReplies(senderId, reply, getDynamicQuickReplies(), pageToken);
    return;
  }

  // IF PRE-ORDER / GENERAL INQUIRY:
  if (isDeliveryTimeQuery) {
    const reply =
      `🚚 আমাদের ডেলিভারি সময় ও নিয়মাবলী:\n\n` +
      `📍 ঢাকা সিটির মধ্যে: ২৪ থেকে ৪৮ ঘণ্টার মধ্যে (১-২ দিন)।\n` +
      `📍 ঢাকার বাইরে: ২ থেকে ৩ কার্যদিবসের মধ্যে কুরিয়ারের মাধ্যমে।\n\n` +
      `💵 ক্যাশ অন ডেলিভারি (পণ্য হাতে পেয়ে দেখে টাকা পরিশোধ করার সুবিধা)।\n\n` +
      `আপনি কোন প্রোডাক্টটি অর্ডার করতে চান? নিচে সিলেক্ট করুন 👇`;

    recordChatTurn(senderId, rawText, reply);
    await sendFbQuickReplies(senderId, reply, getDynamicQuickReplies(), pageToken);
    return;
  }

  if (isDeliveryChargeQuery) {
    const reply =
      `📦 আমাদের ডেলিভারি চার্জ:\n\n` +
      `🏠 ঢাকা সিটির ভেতরে: ৳১২০\n` +
      `🚚 ঢাকার বাইরে যেকোনো জেলায়: ৳১৫০\n\n` +
      `✅ ১০০% ক্যাশ অন ডেলিভারি (কোনো অগ্রিম টাকা দিতে হবে না)।\n\n` +
      `কোন প্রোডাক্টটি আপনার পছন্দ হয়েছে? নিচে চাপ দিন 👇`;

    recordChatTurn(senderId, rawText, reply);
    await sendFbQuickReplies(senderId, reply, getDynamicQuickReplies(), pageToken);
    return;
  }

  if (isHowToOrderQuery) {
    const reply =
      `🛍️ অর্ডার করার সহজ নিয়ম:\n\n` +
      `১. আপনার পছন্দের প্রোডাক্টটি সিলেক্ট করুন।\n` +
      `২. আপনার নাম, ১১ ডিজিটের মোবাইল নম্বর ও সম্পূর্ণ ডেলিভারি ঠিকানা লিখে পাঠান।\n` +
      `৩. আপনার অর্ডার কনফার্ম হয়ে যাবে এবং ২-৩ দিনের মধ্যে ডেলিভারি পাবেন।\n\n` +
      `নিচে আপনার পছন্দের পণ্য নির্বাচন করুন 👇`;

    recordChatTurn(senderId, rawText, reply);
    await sendFbQuickReplies(senderId, reply, getDynamicQuickReplies(), pageToken);
    return;
  }

  if (isPaymentQuery) {
    const reply =
      `💳 পেমেন্ট পদ্ধতি:\n\n` +
      `আমাদের কোনো অগ্রিম (Advance) টাকা দিতে হয় না! সম্পূর্ণ ক্যাশ অন ডেলিভারি (Cash On Delivery) — পার্সেল হাতে পেয়ে ডেলিভারিম্যানকে টাকা দিবেন। 🤝\n\n` +
      `অর্ডার করতে পছন্দের প্রোডাক্ট চাপুন 👇`;

    recordChatTurn(senderId, rawText, reply);
    await sendFbQuickReplies(senderId, reply, getDynamicQuickReplies(), pageToken);
    return;
  }

  // 13. Natural Language Product Mention from Live DB Catalog
  if (session.state === 'IDLE' || !session.selectedProduct) {
    for (const prod of liveProducts) {
      const pTitle = prod.title.toLowerCase();
      const pWords = pTitle.split(/\s+/).filter((w: string) => w.length >= 3);
      if (lowerText.includes(pTitle) || pWords.some((w: string) => lowerText.includes(w))) {
        session.state = 'AWAITING_ADDRESS';
        session.selectedProduct = prod.title;
        session.price = Number(prod.basePrice);
        userSessions[senderId] = session;

        const isUnstitched =
          prod.title.toLowerCase().includes('আনস্টিচড') ||
          prod.title.toLowerCase().includes('unstitched') ||
          (prod.category || '').toLowerCase().includes('শাড়ি');
        const sizeNote = isUnstitched ? '' : ' (প্রয়োজনে সাইজ: M, L, XL)';

        const reply = `আমাদের '${prod.title}'টির মূল্য মাত্র ৳${prod.basePrice}! 🌸\n\nঅর্ডার নিশ্চিত করতে অনুগ্রহ করে আপনার পুরো নাম, ১১ ডিজিটের মোবাইল নম্বর এবং ডেলিভারি ঠিকানা${sizeNote} লিখে পাঠান।`;
        recordChatTurn(senderId, rawText, reply);
        await sendFbMessage(senderId, reply, pageToken);
        return;
      }
    }
  }

  // 14. Default: Main Menu / Greeting with Dynamic Live Products
  session.state = 'IDLE';
  userSessions[senderId] = session;

  const reply = `আসসালামু আলাইকুম! OrderFlow BD শপে আপনাকে স্বাগতম। 🌸\n\nআমাদের বর্তমান ${liveProducts.length}টি স্পেশাল কালেকশন থেকে পছন্দের প্রোডাক্ট নির্বাচন করুন 👇`;
  recordChatTurn(senderId, rawText, reply);
  await sendFbQuickReplies(senderId, reply, getDynamicQuickReplies(), pageToken);
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

async function sendFbGenericTemplate(
  recipientId: string,
  elements: Array<{
    title: string;
    subtitle?: string;
    image_url?: string;
    buttons?: Array<{ type: 'postback'; title: string; payload: string }>;
  }>,
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
          attachment: {
            type: 'template',
            payload: {
              template_type: 'generic',
              elements: elements.slice(0, 10),
            },
          },
        },
      }),
    });
    const data = await res.json();
    console.log('[Facebook Generic Template Result]:', data);
  } catch (err) {
    console.error('[Facebook Generic Template Error]:', err);
  }
}


