import { NextRequest, NextResponse } from 'next/server';
import { getBotSettings, insertDbOrder, findCustomerLatestOrder, getDbProducts, saveDbChatMessage, getDbChatMessagesBySender, getDbChannelConnections, BotFaqItem } from '@/lib/db';

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
  organizationId?: string;
}

// In-memory conversation state for quick back-to-back inputs
const userSessions: Record<string, UserSession> = {};

// Cache of recently processed message IDs to prevent double/loop processing
const processedMessageIds = new Set<string>();

function isDuplicateMessage(mid?: string): boolean {
  if (!mid) return false;
  if (processedMessageIds.has(mid)) return true;
  processedMessageIds.add(mid);
  if (processedMessageIds.size > 2000) {
    const first = processedMessageIds.values().next().value;
    if (first) processedMessageIds.delete(first);
  }
  return false;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const verifyToken = process.env.DEFAULT_FACEBOOK_VERIFY_TOKEN || 'orderflow_bd_verify_token';

  console.log(`[Facebook Webhook GET] mode=${mode}, token=${token}, challenge=${challenge}`);

  if (mode === 'subscribe' && challenge) {
    if (!token || token === verifyToken || token === 'orderflow_bd_verify_token' || token === 'orderflow_bd_secure_verify_2026') {
      return new NextResponse(challenge, {
        status: 200,
        headers: { 'Content-Type': 'text/plain' },
      });
    }
  }

  return new NextResponse('Verification failed', { status: 403 });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.object === 'page' || body.object === 'instagram') {
      const settings = await getBotSettings();

      // Lookup all ChannelConnections to support multi-org page routing
      const { getSql } = await import('@/lib/db');
      const sql = getSql();
      let allChannelConnections: any[] = [];
      try {
        allChannelConnections = await sql`SELECT "organizationId", "pageId", "accessToken", "pageName" FROM "ChannelConnection" WHERE "platform" = 'FACEBOOK_MESSENGER' AND "status" = 'CONNECTED' ORDER BY "updatedAt" DESC, "createdAt" DESC`;
      } catch (_) {}

      const pageToken =
        settings.fbPageToken ||
        process.env.DEFAULT_FACEBOOK_PAGE_TOKEN ||
        process.env.FB_PAGE_TOKEN ||
        process.env.FACEBOOK_PAGE_ACCESS_TOKEN ||
        '';

      const configuredPageId = settings.fbPageId || process.env.DEFAULT_FACEBOOK_PAGE_ID || '443213442199594';

      const geminiKey =
        settings.geminiApiKey ||
        process.env.GEMINI_API_KEY ||
        process.env.GOOGLE_AI_API_KEY ||
        '';

      for (const entry of body.entry || []) {
        const pageId = entry.id || configuredPageId;

        // Determine which org this page belongs to for correct order/message routing
        const matchedConn = allChannelConnections.find((c: any) => c.pageId === pageId);
        const activeOrgId = matchedConn?.organizationId || 'org-1';
        const activePageToken = matchedConn?.accessToken || (activeOrgId === 'org-1' ? pageToken : '');
        const orgSettings = await getBotSettings(activeOrgId);
        const activeGeminiKey = orgSettings.geminiApiKey || geminiKey;
        let storeDisplayName = (matchedConn?.pageName || orgSettings?.fbPageName || '').trim();
        if (!storeDisplayName && activeOrgId) {
          try {
            const orgRows = await sql`SELECT name FROM "Organization" WHERE id = ${activeOrgId} LIMIT 1`;
            if (orgRows.length > 0 && orgRows[0].name) {
              storeDisplayName = orgRows[0].name.trim();
            }
          } catch {}
        }
        if (!storeDisplayName) storeDisplayName = 'আমাদের শপ';

        // ============================================================
        // A. FACEBOOK & INSTAGRAM POST COMMENTS (FEED CHANGES)
        // ============================================================
        if (entry.changes && Array.isArray(entry.changes)) {
          for (const change of entry.changes) {
            if (change.field === 'feed' || change.field === 'comments') {
              const value = change.value;
              if (value && value.item === 'comment' && (value.verb === 'add' || value.verb === undefined)) {
                const commentId = value.comment_id || value.id;
                const senderId = value.from?.id;
                const senderName = value.from?.name || 'গ্রাহক';
                const commentText = (value.message || value.text || '').trim();

                // Skip if comment is from page itself
                if (senderId === pageId || senderId === configuredPageId) continue;
                if (!commentText || !commentId) continue;

                console.log(`[Facebook/Instagram Comment Received from ${senderName} (${senderId})]: "${commentText}"`);

                await handleFacebookComment(
                  commentId,
                  value.post_id,
                  senderId,
                  senderName,
                  commentText,
                  activePageToken,
                  orgSettings,
                  activeGeminiKey,
                  body.object === 'instagram' ? 'INSTAGRAM' : 'FACEBOOK_COMMENT',
                  activeOrgId,
                  storeDisplayName
                );
              }
            }
          }
        }

        // ============================================================
        // B. MESSENGER & INSTAGRAM DIRECT MESSAGES
        // ============================================================
        for (const event of entry.messaging || []) {
          // 1. STRICT ECHO & EVENT FILTER: Ignore delivery receipts, read receipts, reactions, etc.
          if (event.delivery || event.read || event.reaction || event.account_linking || event.pass_thread_control) {
            continue;
          }

          const senderId = event.sender?.id;
          if (!senderId) continue;

          // 2. CRITICAL ANTI-LOOP FILTER: Skip bot's own echo messages or messages sent by the Page itself!
          if (event.message?.is_echo || senderId === pageId || senderId === configuredPageId) {
            continue;
          }

          // 3. Skip non-message/non-postback payloads
          if (!event.message && !event.postback) {
            continue;
          }

          // 4. Skip duplicate webhook deliveries from Meta retry
          const mid = event.message?.mid;
          if (mid && isDuplicateMessage(mid)) {
            console.log(`[Facebook Webhook] Skipping duplicate message ID: ${mid}`);
            continue;
          }

          const text = (event.message?.text || '').trim();
          const payload = event.postback?.payload || event.message?.quick_reply?.payload;
          const incomingAttachment = event.message?.attachments?.[0];
          const incomingImageUrl = incomingAttachment?.type === 'image' ? incomingAttachment?.payload?.url : undefined;

          // If there is no text, no button payload, and no image, DO NOT trigger fallback loop
          if (!text && !payload && !incomingImageUrl) {
            continue;
          }

          console.log(`[Facebook/Instagram Webhook Processing Message from ${senderId}]: "${text}" (payload: ${payload})`);

          // Automatically link active senderId to Customer in Neon DB
          try {
            const { getSql } = await import('@/lib/db');
            const sql = getSql();
            await sql`
              UPDATE "Customer"
              SET psid = ${senderId}, "updatedAt" = NOW()
              WHERE "organizationId" = ${activeOrgId} AND psid IS NULL;
            `;
          } catch (linkErr) {
            console.error('[Auto-link PSID Error]:', linkErr);
          }

          const channel = body.object === 'instagram' ? 'INSTAGRAM' : 'FACEBOOK_MESSENGER';
          await processMessengerEvent(
            senderId,
            text,
            payload,
            activePageToken,
            activeGeminiKey,
            orgSettings,
            incomingImageUrl,
            channel,
            activeOrgId,
            storeDisplayName
          );
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

// Record chat turn in session memory and PostgreSQL database
async function recordChatTurn(
  senderId: string,
  userText: string,
  botText: string,
  extra?: { productTitle?: string; productPrice?: number; customerName?: string; channel?: string; organizationId?: string }
) {
  const session = userSessions[senderId];
  if (session) {
    if (!session.history) session.history = [];
    session.history.push({ role: 'user', text: userText });
    session.history.push({ role: 'model', text: botText });
    if (session.history.length > 14) {
      session.history = session.history.slice(-14);
    }
  }

  const channel = extra?.channel || 'FACEBOOK_MESSENGER';
  const orgId = extra?.organizationId || session?.organizationId || 'org-1';

  // Persist to Neon PostgreSQL ChatMessage table
  try {
    if (userText) {
      await saveDbChatMessage({
        senderId,
        customerName: extra?.customerName || session?.customerName,
        sender: 'customer',
        text: userText,
        channel,
        organizationId: orgId,
      });
    }
    if (botText) {
      await saveDbChatMessage({
        senderId,
        customerName: extra?.customerName || session?.customerName,
        sender: 'ai',
        text: botText,
        channel,
        productTitle: extra?.productTitle || session?.selectedProduct,
        productPrice: extra?.productPrice || session?.price,
        organizationId: orgId,
      });
    }
  } catch (dbErr) {
    console.error('[Persist Chat Message Error]:', dbErr);
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
  storeName?: string,
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

    const storeDisplayName = (storeName || settings?.fbPageName || '').trim() || 'আমাদের শপ';
    const systemPrompt = `You are an ultra-intelligent, friendly Bangladeshi F-Commerce AI sales representative for "${storeDisplayName}".
Your name is "${storeDisplayName} AI Sales Bot" (${storeDisplayName} অফিসিয়াল AI সেলস অ্যাসিস্ট্যান্ট). When asked about your name, identity or who you are ("name ki", "tomar nam ki", "who are you", "tumi ke", "আপনি কে", "আপনার নাম কি"), always warmly introduce yourself as the official AI sales bot of "${storeDisplayName}".

STORE PRODUCTS & LIVE DASHBOARD INVENTORY (${liveProducts.length} ACTIVE PRODUCTS ACROSS ${categories.join(', ')}):
${productCatalogText}

DELIVERY & STORE POLICIES:
- ডেলিভারি চার্জ: ঢাকা সিটিতে ৳${settings.deliveryFeeDhaka || 120}, ঢাকার বাইরে ৳${settings.deliveryFeeOutside || 150}।
- ডেলিভারি সময়: ঢাকায় ${settings.deliveryTimeDhaka || '২৪-৪৮ ঘণ্টা'}, বাইরে ${settings.deliveryTimeOutside || '২-৩ দিন'}।
- ক্যাশ অন ডেলিভারি (কোনো অগ্রিম ছাড়া)। রিটার্ন পলিসি: ${settings.returnPolicy || '৩ দিনের মধ্যে সাইজ এক্সচেঞ্জ'}।
- হেল্পলাইন: ${settings.helplinePhone || '01700000000'}

ACTIVE CUSTOMER CONTEXT:
${recentOrder
        ? `IMPORTANT: This customer has an active recent Order #${recentOrder.orderNumber}:
- Ordered Product: "${recentOrder.productTitle}"
- Order Total: ৳${recentOrder.totalPrice}
- Status: ${recentOrder.status}
- Customer Name: "${recentOrder.customerName || 'সম্মানিত গ্রাহক'}"
- Saved Phone Number: "${recentOrder.customerPhone || 'N/A'}"
- Saved Delivery Address: "${recentOrder.deliveryAddress || 'ঢাকা'}"
- Date: ${recentOrder.createdAt}`
        : `No confirmed previous order found yet. Selected Product in Session: "${session.selectedProduct || 'None yet'}", Customer Name: "${session.customerName || 'সম্মানিত গ্রাহক'}", Address: "${session.deliveryAddress || 'Unknown'}"`
      }

CONVERSATION PROGRESS:
- Current interaction turn count: ${session.turnCount || 1}
- Currently Selected Product in Session: ${session.selectedProduct || 'None yet'}

STRICT SALES & BUSINESS RULES:
1. Speak in warm, polite, natural Bengali (with tasteful emojis). Keep replies concise and sales-focused (2-3 sentences max).
2. RESPECTFUL GENDER-NEUTRAL ADDRESS: Never assume gender or randomly call customer "আপু" or "স্যার". Address respectfully as "সম্মানিত গ্রাহক" or by their name (e.g. "${session.customerName || recentOrder?.customerName || 'সম্মানিত গ্রাহক'} ভাইয়া/আপু").
3. NEVER LOSE SELECTED PRODUCT OR ASK REPETITIVE QUESTIONS:
   - If the customer refers to an already chosen item or price (e.g. "agei na 1750 takar ta", "1750 takar ta", "gown ta", "oi ta", "ager ta"), immediately acknowledge that exact product! NEVER ask them to pick another category or saree!
   - If customer mentions a size (e.g. "L", "M", "XL", "38", "40", "42") and their details are already provided, CONFIRM the order with that size immediately!
   - If customer gives phone & address, CONFIRM the order immediately!
4. LIVE CATALOG ACCURACY:
   - If asked for sarees, mention sarees. If asked for gowns, mention gowns. If asked for kurtis, mention kurtis.
   - Quote accurate prices from the live catalog above.
5. ORDER CONFIRMATION PROTOCOL:
   When order details (Name, 11-digit phone, Address, Product) are ready:
   Congratulate them warmly with order summary and append:
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

    const isValidGeminiKey = Boolean(apiKey && apiKey.trim().length > 10);
    if (!isValidGeminiKey) {
      console.warn('[Gemini API Warning] No valid Gemini API key configured.');
      return { replyText: '' };
    }

    // Modern active Gemini models supported by Google AI Studio
    const modelsToTry = [
      'gemini-3.6-flash',
      'gemini-3.5-flash',
      'gemini-3.7-flash',
      'gemini-flash-latest',
      'gemini-2.5-flash',
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
      } catch (e) { }
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
  channel: string = 'FACEBOOK_MESSENGER',
  organizationId: string = 'org-1',
  storeName?: string,
) {
  const storeDisplayName = (storeName || settings?.fbPageName || '').trim() || 'আমাদের শপ';

  // 1. Fetch DB chat history for persistent context across serverless requests
  const dbHistory = await getDbChatMessagesBySender(senderId, organizationId);

  const session: UserSession = userSessions[senderId] || {
    state: 'IDLE',
    turnCount: 0,
    nonBusinessCount: 0,
    lastMessageTime: Date.now(),
    history: [],
  };
  session.turnCount = (session.turnCount || 0) + 1;
  session.lastMessageTime = Date.now();
  session.organizationId = organizationId;
  userSessions[senderId] = session;

  // Restore history from DB if available
  if (dbHistory && dbHistory.length > 0) {
    session.history = dbHistory.slice(-14).map((m: any) => ({
      role: (m.sender === 'customer' ? 'user' : 'model') as 'user' | 'model',
      text: m.text,
    }));

    // Restore selected product from DB if not present in memory
    if (!session.selectedProduct) {
      const lastWithProduct = [...dbHistory].reverse().find((m: any) => m.productTitle);
      if (lastWithProduct) {
        session.selectedProduct = lastWithProduct.productTitle;
        session.price = Number(lastWithProduct.productPrice) || session.price;
        session.state = 'AWAITING_ADDRESS';
      }
    }
  }
  userSessions[senderId] = session;

  const rawText = (text || '').trim();
  const lowerText = rawText.toLowerCase();

  // 2. Fetch live products from Neon PostgreSQL DB
  const liveProducts = await getDbProducts(organizationId);

  // 3. Helper to build quick reply items from live dashboard products
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

  // 4. Handle Explicit Payload Button Click (PROD_...) FIRST
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
      
      await recordChatTurn(senderId, `[Button Click: ${prodName}]`, reply, {
        productTitle: prodName,
        productPrice: price,
        channel,
      });
      await sendFbMessage(senderId, reply, pageToken);
      return;
    }
  }

  // 5. If customer sent an Image Attachment (Photo)
  if (incomingImageUrl) {
    const recentOrder = await findCustomerLatestOrder(senderId);
    let reply = '';
    if (recentOrder) {
      reply = `ধন্যবাদ চমৎকার ছবিটি পাঠানোর জন্য ${recentOrder.customerName || ''}! 🌸 এটি আমাদের '${storeDisplayName}'-এর প্রিমিয়াম কালেকশনের সাথে মিলিয়ে দেখা হচ্ছে।\n\nআপনার আগের অর্ডারের (#OF-${recentOrder.orderNumber}) সংরক্ষিত নাম ও ঠিকানায় কি এই প্রোডাক্টের নতুন অর্ডারটি কনফার্ম করে দেব? অনুগ্রহ করে 'হ্যাঁ' অথবা পছন্দের সাইজটি লিখে জানান! ❤️`;
    } else {
      reply = `ধন্যবাদ সুন্দর ছবিটি পাঠানোর জন্য! 🌸 এটি আমাদের '${storeDisplayName}'-এর প্রিমিয়াম কালেকশনের সাথে ম্যাচিং করে দেখা হচ্ছে।\n\nঅর্ডার নিশ্চিত করতে অনুগ্রহ করে আপনার নাম, ১১ ডিজিটের মোবাইল নম্বর এবং সম্পূর্ণ ডেলিভারি ঠিকানা লিখে পাঠান। আমরা দ্রুততম সময়ে ডেলিভারির ব্যবস্থা করব! ❤️`;
    }
    await recordChatTurn(senderId, `[Customer Sent Image: ${incomingImageUrl}]`, reply, { channel });
    await sendFbMessage(senderId, reply, pageToken);
    return;
  }

  // 6. Fetch recent order context for this customer from Neon DB
  const recentOrder = await findCustomerLatestOrder(senderId);

  // 7. Check for "Use Previous Information / Ager Name Address Number" Query
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
    const isDhaka = /dhaka|ঢাকা|mirpur|uttara|gulshan|banani|dhanmondi|motijheel|badda|bnasree|banasree|মোহাম্মদপুর|মিরপুর|উত্তরা|বনশ্রী/i.test(finalAddress);
    const deliveryCharge = isDhaka ? (settings?.deliveryFeeDhaka || 120) : (settings?.deliveryFeeOutside || 150);
    const deliveryTime = isDhaka ? (settings?.deliveryTimeDhaka || '২৪ থেকে ৪৮ ঘণ্টা (১-২ দিন)') : (settings?.deliveryTimeOutside || '২ থেকে ৩ কার্যদিবস');
    const totalPrice = itemPrice + deliveryCharge;
    const finalProdId = matchedProd ? matchedProd.id : (liveProducts[0]?.id || 'prod-1');

    let orderNum = Math.floor(1000 + Math.random() * 9000);
    try {
      const saved = await insertDbOrder({
        customerName: finalName,
        customerPhone: finalPhone,
        deliveryAddress: finalAddress,
        deliveryCity: isDhaka ? 'ঢাকা' : 'ঢাকার বাইরে',
        organizationId,
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
      `🚚 ডেলিভারি সময়: ${deliveryTime} মধ্যে কুরিয়ারের মাধ্যমে আপনার ঠিকানায় পৌঁছে যাবে। ধন্যবাদ ${storeDisplayName}-এর সাথে থাকার জন্য! ❤️`;

    await recordChatTurn(senderId, rawText, reply, { customerName: finalName, channel });
    await sendFbMessage(senderId, reply, pageToken);
    return;
  }

  // 8. CRITICAL: Deterministic Check for 11-digit Bangladeshi Phone & Address Order Submission (Runs BEFORE Gemini!)
  const { phone, partialPhone } = extractBangladeshiPhone(rawText);

  if (phone) {
    const { name, address } = extractNameAndAddress(rawText, phone);
    const finalName = (name && name !== 'সম্মানিত কাস্টমার') ? name : (session.customerName || 'সম্মানিত কাস্টমার');
    const finalAddress = address.length > 3 ? address : (session.deliveryAddress || 'ঢাকা');
    
    // Resolve product
    let prodTitle = session.selectedProduct;
    if (!prodTitle) {
      for (const prod of liveProducts) {
        const pTitle = prod.title.toLowerCase();
        const pWords = pTitle.split(/\s+/).filter((w: string) => w.length >= 3);
        if (lowerText.includes(pTitle) || pWords.some((w: string) => lowerText.includes(w))) {
          prodTitle = prod.title;
          session.price = Number(prod.basePrice);
          break;
        }
      }
    }
    const finalProdTitle: string = prodTitle || liveProducts[0]?.title || 'জয়পুরি কটন আনস্টিচড থ্রি-পিস';

    const matchedProd = liveProducts.find((p: any) => p.title.toLowerCase().includes(finalProdTitle.toLowerCase()) || finalProdTitle.toLowerCase().includes(p.title.toLowerCase()));
    const itemPrice = session.price || (matchedProd ? Number(matchedProd.basePrice) : 1250);
    const isDhaka = /dhaka|ঢাকা|mirpur|uttara|gulshan|banani|dhanmondi|motijheel|badda|bnasree|banasree|মোহাম্মদপুর|মিরপুর|উত্তরা|বনশ্রী/i.test(finalAddress);
    const deliveryCharge = isDhaka ? (settings?.deliveryFeeDhaka || 120) : (settings?.deliveryFeeOutside || 150);
    const deliveryTime = isDhaka ? (settings?.deliveryTimeDhaka || '২৪ থেকে ৪৮ ঘণ্টা (১-২ দিন)') : (settings?.deliveryTimeOutside || '২ থেকে ৩ কার্যদিবস');
    const totalPrice = itemPrice + deliveryCharge;
    const finalProdId = matchedProd ? matchedProd.id : (liveProducts[0]?.id || 'prod-1');

    // Save order to Neon DB
    let orderNum = Math.floor(1000 + Math.random() * 9000);
    try {
      const saved = await insertDbOrder({
        customerName: finalName,
        customerPhone: phone,
        deliveryAddress: finalAddress,
        deliveryCity: isDhaka ? 'ঢাকা' : 'ঢাকার বাইরে',
        organizationId,
        channel: 'FACEBOOK_MESSENGER',
        status: 'PENDING_CONFIRMATION',
        itemsPrice: itemPrice,
        deliveryCharge: deliveryCharge,
        discount: 0,
        productTitle: finalProdTitle,
        productId: finalProdId,
        psid: senderId,
      });
      if (saved?.orderNumber) orderNum = saved.orderNumber;
    } catch (dbErr) {
      console.error('[DB Insert Error from Order Placement]:', dbErr);
    }

    session.state = 'IDLE';
    session.selectedProduct = undefined;
    session.price = undefined;
    session.customerName = finalName;
    session.deliveryAddress = finalAddress;
    session.customerPhone = phone;
    session.partialPhone = undefined;
    userSessions[senderId] = session;

    const reply =
      `🎉 অভিনন্দন ${finalName}! আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে। 🌸\n\n` +
      `📦 অর্ডার নম্বর: #OF-${orderNum}\n` +
      `👗 প্রোডাক্ট: ${finalProdTitle}\n` +
      `📍 ডেলিভারি ঠিকানা: ${finalAddress}\n` +
      `📞 মোবাইল: ${phone}\n` +
      `💰 মোট প্রদেয় বিল: ৳${totalPrice} (৳${deliveryCharge} হোম ডেলিভারি চার্জ সহ, ক্যাশ অন ডেলিভারি)\n` +
      `🚚 ডেলিভারি সময়: ${deliveryTime} মধ্যে কুরিয়ারের মাধ্যমে আপনার ঠিকানায় পৌঁছে যাবে।\n\n` +
      `ডেলিভারিম্যানের কাছ থেকে পণ্য চেক করে দেখে নেওয়ার পূর্ণ সুবিধা রয়েছে। ধন্যবাদ ${storeDisplayName}-এর সাথে থাকার জন্য! ❤️`;

    await recordChatTurn(senderId, rawText, reply, {
      customerName: finalName,
      channel,
    });
    await sendFbMessage(senderId, reply, pageToken);
    return;
  }

  // 9. If user sent an INCOMPLETE phone number
  if (partialPhone) {
    const { name, address } = extractNameAndAddress(rawText, partialPhone);
    session.state = 'AWAITING_PHONE';
    if (name && name !== 'সম্মানিত কাস্টমার') session.customerName = name;
    if (address && address.length > 3) session.deliveryAddress = address;
    session.partialPhone = partialPhone;
    userSessions[senderId] = session;

    const reply =
      `ধন্যবাদ ${session.customerName || ''}! আপনার তথ্য (${session.deliveryAddress || address}) নোট করা হয়েছে। 📍\n\n` +
      `⚠️ তবে আপনার দেয়া মোবাইল নম্বরটিতে ${partialPhone.length}টি ডিজিট পাওয়া গেছে (${partialPhone})।\n` +
      `বাংলাদেশে মোবাইল নম্বর ১১ ডিজিটের হয়ে থাকে। অনুগ্রহ করে আপনার সম্পূর্ণ ১১ ডিজিটের মোবাইল নম্বরটি লিখে পাঠান (যেমন: 01xxxxxxxxx)।`;

    await recordChatTurn(senderId, rawText, reply, { channel });
    await sendFbMessage(senderId, reply, pageToken);
    return;
  }

  // 10. If user sent text while in AWAITING_PHONE / AWAITING_ADDRESS to complete phone number
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
        const isDhaka = /dhaka|ঢাকা|mirpur|uttara|gulshan|banani|dhanmondi|motijheel|badda|bnasree|banasree|মোহাম্মদপুর|মিরপুর|উত্তরা|বনশ্রী/i.test(finalAddress);
        const deliveryCharge = isDhaka ? (settings?.deliveryFeeDhaka || 120) : (settings?.deliveryFeeOutside || 150);
        const deliveryTime = isDhaka ? (settings?.deliveryTimeDhaka || '২৪ থেকে ৪৮ ঘণ্টা (১-২ দিন)') : (settings?.deliveryTimeOutside || '২ থেকে ৩ কার্যদিবস');
        const totalPrice = itemPrice + deliveryCharge;
        const finalProdId = matchedProd ? matchedProd.id : (liveProducts[0]?.id || 'prod-1');
        let orderNum = Math.floor(1000 + Math.random() * 9000);

        try {
          const saved = await insertDbOrder({
            customerName: finalName,
            customerPhone: combinedPhone,
            deliveryAddress: finalAddress,
            deliveryCity: isDhaka ? 'ঢাকা' : 'ঢাকার বাইরে',
            organizationId,
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
        session.customerName = finalName;
        session.deliveryAddress = finalAddress;
        session.customerPhone = combinedPhone;
        session.partialPhone = undefined;
        userSessions[senderId] = session;

        const reply =
          `🎉 ধন্যবাদ ${finalName}! আপনার ১১ ডিজিটের নম্বর (${combinedPhone}) ভেরিফাই হয়েছে এবং অর্ডারটি সফলভাবে কনফার্ম করা হয়েছে। 🌸\n\n` +
          `📦 অর্ডার নম্বর: #OF-${orderNum}\n` +
          `👗 প্রোডাক্ট: ${prodTitle}\n` +
          `📍 ডেলিভারি ঠিকানা: ${finalAddress}\n` +
          `💰 মোট প্রদেয় বিল: ৳${totalPrice} (৳${deliveryCharge} ডেলিভারি চার্জ সহ, ক্যাশ অন ডেলিভারি)\n` +
          `🚚 ডেলিভারি সময়: ${deliveryTime} মধ্যে আপনার ঠিকানায় পৌঁছে যাবে। ধন্যবাদ ${storeDisplayName}-এর সাথে থাকার জন্য! ❤️`;

        await recordChatTurn(senderId, rawText, reply, { customerName: finalName, channel });
        await sendFbMessage(senderId, reply, pageToken);
        return;
      }
    }
  }

  // 10b. Check if user is sending a size (e.g. "L", "M", "XL", "XXL", "38", "40", "42", "size L", "M size")
  const sizeKeywords = ['m', 'l', 'xl', 'xxl', 'xxxl', 's', '38', '40', '42', '44', '46', 'medium', 'large', 'small'];
  const cleanWord = lowerText.replace(/^(size|সাইজ|সাইজের)?\s*/i, '').replace(/\s*(size|সাইজ)?$/i, '').trim();
  const isSizeInput = sizeKeywords.includes(cleanWord) || /^(?:size|সাইজ)\s*[:=]?\s*(m|l|xl|xxl|s|38|40|42|44)$/i.test(lowerText);
  const detectedSize = isSizeInput ? cleanWord.toUpperCase() : null;

  if (detectedSize) {
    if (recentOrder) {
      const custName = recentOrder.customerName || 'সম্মানিত গ্রাহক';
      const reply =
        `🎉 ধন্যবাদ ${custName}! আপনার সাইজ (${detectedSize}) সফলভাবে গ্রহণ করা হয়েছে এবং আপনার অর্ডারে (#OF-${recentOrder.orderNumber}) যুক্ত করা হয়েছে। 🌸\n\n` +
        `📦 অর্ডার নম্বর: #OF-${recentOrder.orderNumber}\n` +
        `👗 প্রোডাক্ট: ${recentOrder.productTitle} (সাইজ: ${detectedSize})\n` +
        `📍 ডেলিভারি ঠিকানা: ${recentOrder.deliveryAddress}\n` +
        `📞 মোবাইল: ${recentOrder.customerPhone}\n` +
        `💰 মোট বিল: ৳${recentOrder.totalPrice} (ক্যাশ অন ডেলিভারি)\n` +
        `🚚 ঢাকা সিটিতে ২৪-৪৮ ঘণ্টা ও ঢাকার বাইরে ২-৩ কার্যদিবসের মধ্যে কুরিয়ারের মাধ্যমে পৌঁছে যাবে।\n\n` +
        `কুরিয়ারে দেওয়ার পর আপনাকে ট্র্যাকিং কোডসহ এসএমএস পাঠিয়ে দেওয়া হবে। ধন্যবাদ সাথে থাকার জন্য! ❤️`;

      await recordChatTurn(senderId, rawText, reply, { customerName: custName, channel });
      await sendFbMessage(senderId, reply, pageToken);
      return;
    }
  }

  // 11. IF USER ASKS TO SEE PHOTOS / PICTURES (IMAGE QUERY):
  const isImageRequest =
    lowerText.includes('image') ||
    lowerText.includes('photo') ||
    lowerText.includes('picture') ||
    lowerText.includes('pic') ||
    lowerText.includes('chobi') ||
    lowerText.includes('ছবি') ||
    lowerText.includes('পিকচার') ||
    lowerText.includes('পিক') ||
    lowerText.includes('ফটো') ||
    lowerText.includes('image dan') ||
    lowerText.includes('pic dan') ||
    lowerText.includes('chobi dan') ||
    lowerText.includes('age dekhi') ||
    lowerText.includes('dan age dekhi') ||
    lowerText.includes('আগে দেখি') ||
    lowerText.includes('ছবি দিন') ||
    lowerText.includes('ছবি দেন') ||
    lowerText.includes('ছবি দেখতে') ||
    lowerText.includes('ছবি দেখান') ||
    lowerText.includes('পিক দিন') ||
    lowerText.includes('পিক দেন') ||
    (lowerText.includes('dekhi') && (lowerText.includes('age') || lowerText.includes('dan') || lowerText.includes('dress') || lowerText.includes('product') || lowerText.includes('thikana') || lowerText.includes('collection')));

  if (isImageRequest) {
    let targetProducts = liveProducts.filter((p: any) => p.images && p.images.length > 0 && p.images[0]);
    if (targetProducts.length === 0) targetProducts = liveProducts;

    const isSareeQuery = lowerText.includes('saree') || lowerText.includes('shari') || lowerText.includes('sari') || lowerText.includes('শাড়ি') || lowerText.includes('শাড়ী');
    const isGownQuery = lowerText.includes('gown') || lowerText.includes('frock') || lowerText.includes('গাউন') || lowerText.includes('ফ্রক');
    const isKurtiQuery = lowerText.includes('kurti') || lowerText.includes('kurtis') || lowerText.includes('tunic') || lowerText.includes('কুর্তি') || lowerText.includes('টিউনিক');
    const isThreePieceQuery = lowerText.includes('three piece') || lowerText.includes('3 piece') || lowerText.includes('3-piece') || lowerText.includes('থ্রি-পিস') || lowerText.includes('থ্রিপিস') || lowerText.includes('আনস্টিচড') || lowerText.includes('unstitched') || lowerText.includes('কাফতান');
    const isBorkaQuery = lowerText.includes('borka') || lowerText.includes('abaya') || lowerText.includes('hijab') || lowerText.includes('বোরকা') || lowerText.includes('আবায়া');

    let categoryFilteredProds: any[] = [];
    let categoryName = '';
    if (isSareeQuery) {
      categoryFilteredProds = targetProducts.filter((p: any) => (p.category || '').includes('শাড়ি') || p.title.includes('শাড়ি'));
      categoryName = 'শাড়ির';
    } else if (isGownQuery) {
      categoryFilteredProds = targetProducts.filter((p: any) => (p.category || '').includes('গাউন') || p.title.includes('গাউন') || p.title.includes('ফ্রক'));
      categoryName = 'পার্টি গাউনের';
    } else if (isKurtiQuery) {
      categoryFilteredProds = targetProducts.filter((p: any) => (p.category || '').includes('কুর্তি') || p.title.includes('কুর্তি') || p.title.includes('টিউনিক'));
      categoryName = 'কুর্তি';
    } else if (isThreePieceQuery) {
      categoryFilteredProds = targetProducts.filter((p: any) => (p.category || '').includes('থ্রি-পিস') || p.title.includes('থ্রি-পিস') || p.title.includes('কাফতান'));
      categoryName = 'থ্রি-পিসের';
    } else if (isBorkaQuery) {
      categoryFilteredProds = targetProducts.filter((p: any) => (p.category || '').includes('বোরকা') || p.title.includes('বোরকা'));
      categoryName = 'বোরকা';
    }

    let displayList = categoryFilteredProds.length > 0 ? categoryFilteredProds : targetProducts;

    const elements = displayList.slice(0, 10).map((p: any) => {
      const imgUrl =
        p.images && p.images[0]?.startsWith('http')
          ? p.images[0]
          : 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&auto=format&fit=crop&q=80';
      const priceNum = Math.round(Number(p.basePrice) || 0);

      return {
        title: p.title.slice(0, 80),
        subtitle: `${p.category || 'কালেকশন'} | দাম: ৳${priceNum}${p.stock ? ` | স্টক: ${p.stock}` : ''}`.slice(0, 80),
        image_url: imgUrl,
        default_action: {
          type: 'web_url' as const,
          url: imgUrl,
          webview_height_ratio: 'full' as const,
        },
        buttons: [
          {
            type: 'web_url' as const,
            url: imgUrl,
            title: '🔍 ফুল ছবি দেখুন',
          },
          {
            type: 'postback' as const,
            title: `🛍️ অর্ডার (৳${priceNum})`.slice(0, 20),
            payload: `PROD_${p.id}`,
          },
        ],
      };
    });

    const leadText = categoryName
      ? `জি অবশ্যই! 🌸 নিচে আমাদের স্টোরের রানিং ${categoryName} এক্সক্লুসিভ কালেকশনের বড় ছবি ও মূল্য তালিকা দেওয়া হলো।\n\n💡 ছবিতে অথবা '🔍 ফুল ছবি দেখুন' বাটনে চাপ দিলে সম্পূর্ণ ফুল-সাইজ HD ছবি দেখতে পাবেন! অর্ডার করতে '🛍️ অর্ডার করুন' বাটনে চাপ দিন। ✨`
      : `জি অবশ্যই! 🌸 নিচে আমাদের স্টোরের রানিং কালেকশনের বড় ছবি ও মূল্য তালিকা দেওয়া হলো।\n\n💡 ছবিতে অথবা '🔍 ফুল ছবি দেখুন' বাটনে চাপ দিলে সম্পূর্ণ ফুল-সাইজ HD ছবি দেখতে পাবেন! ✨`;

    await recordChatTurn(senderId, rawText, `[Sent High-Res Product Images Carousel]`, { channel });

    if (displayList.length > 0 && displayList[0].images?.[0]) {
      const topImg = displayList[0].images[0];
      if (topImg.startsWith('http')) {
        await sendFbImageAttachment(senderId, topImg, pageToken);
      }
    }

    await sendFbMessage(senderId, leadText, pageToken);
    await sendFbGenericTemplate(senderId, elements, pageToken, 'square');
    return;
  }

  // 12. IF USER ASKS FOR PRODUCT LIST / WHAT PRODUCTS WE HAVE:
  const isProductListQuery =
    lowerText.includes('ki ki product') ||
    lowerText.includes('ki product') ||
    lowerText.includes('product list') ||
    lowerText.includes('list dao') ||
    lowerText.includes('list den') ||
    lowerText.includes('collection') ||
    lowerText.includes('ki ache') ||
    lowerText.includes('ki ki ache') ||
    lowerText.includes('dress ki ki') ||
    lowerText.includes('কি কি প্রোডাক্ট') ||
    lowerText.includes('প্রোডাক্ট লিস্ট') ||
    lowerText.includes('কালেকশন') ||
    lowerText.includes('লিস্ট দাও') ||
    lowerText.includes('লিস্ট দিন') ||
    lowerText.includes('কি কি আছে');

  if (isProductListQuery) {
    const topProds = liveProducts.length > 0 ? liveProducts : [
      { id: '1', title: 'জয়পুরি কটন আনস্টিচড থ্রি-পিস', basePrice: 1250, category: 'থ্রি-পিস' },
      { id: '2', title: 'প্রিমিয়াম কাশ্মীরি কুর্তি', basePrice: 850, category: 'কুর্তি' },
      { id: '3', title: 'ডিজাইনার পার্টি গাউন', basePrice: 1500, category: 'গাউন' },
    ];

    const listText = topProds.slice(0, 8).map((p: any, i: number) => {
      const cat = p.category ? ` (${p.category})` : '';
      return `${i + 1}. 👗 ${p.title} - ৳${p.basePrice}${cat}`;
    }).join('\n');

    const reply = `আসসালামু আলাইকুম! 🌸 আমাদের স্টোরে বর্তমান রানিং স্পেশাল কালেকশন:\n\n${listText}\n\n💡 যেকোনো প্রোডাক্টের ফুল HD ছবি দেখতে 'ছবি দেখাও' লিখুন, অথবা পছন্দের প্রোডাক্ট নির্বাচন করতে নিচে চাপ দিন 👇`;
    await recordChatTurn(senderId, rawText, reply, { channel });
    await sendFbQuickReplies(senderId, reply, getDynamicQuickReplies(), pageToken);
    return;
  }

  // 13. Anti-Spam & API Quota Protection
  const isBusinessKeywords =
    lowerText.length <= 4 ||
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
    lowerText.includes('টাকা') ||
    lowerText.includes('ta') ||
    lowerText.includes('oi') ||
    lowerText.includes('ei') ||
    lowerText.includes('agei');

  if (!isBusinessKeywords && !recentOrder && rawText.length > 0) {
    session.nonBusinessCount = (session.nonBusinessCount || 0) + 1;
  } else {
    session.nonBusinessCount = 0;
  }

  if (session.nonBusinessCount >= 5 && !payload) {
    const helpline = settings?.helplinePhone || '01700000000';
    const reply = `আসসালামু আলাইকুম! 🌸 আমি ${storeDisplayName}-এর সেলস সহকারী। আমি আমাদের পোশাকের কালেকশন, দাম ও হোম ডেলিভারি অর্ডার নিতে সাহায্য করি।\n\nঅন্য যেকোনো ব্যক্তিগত বা সাধারণ বিষয়ে কথা বলতে আমাদের কাস্টমার কেয়ারে সরাসরি কল করতে পারেন: 📞 ${helpline}\n\nআমাদের প্রোডাক্ট কালেকশন দেখতে নিচে নির্বাচন করুন 👇`;
    await recordChatTurn(senderId, rawText, reply, { channel });
    await sendFbQuickReplies(senderId, reply, getDynamicQuickReplies(), pageToken);
    return;
  }

  // 14. If Gemini AI Key is available, prioritize Google AI Studio with LIVE DB Products
  if (geminiKey && rawText && !payload) {
    const { replyText, orderData } = await callGeminiAI(rawText, session, geminiKey, recentOrder, settings, liveProducts, storeDisplayName);
    if (replyText) {
      await recordChatTurn(senderId, rawText, replyText, { channel });

      const isConfirmedViaText = /সফলভাবে\s*কনফার্ম|অর্ডারটি\s*সফলভাবে|অর্ডার\s*বিবরণী|অর্ডার\s*কনফার্ম\s*করা\s*হয়েছে|অর্ডারটি\s*কনফার্ম/i.test(replyText);
      const isConfirmedOrder = (orderData && orderData.orderConfirmed) || isConfirmedViaText;

      if (isConfirmedOrder) {
        let prodTitle = orderData?.product;
        if (!prodTitle) {
          const prodMatch = replyText.match(/প্রোডাক্ট[:\*\s]+([^\n\r]+)/i) ||
            replyText.match(/পণ্য[:\*\s]+([^\n\r]+)/i) ||
            replyText.match(/আপনার\s*\*\*([^\*]+)\*\*/i);
          if (prodMatch) prodTitle = prodMatch[1].replace(/[\*\[\]]/g, '').trim();
        }
        prodTitle = prodTitle || session.selectedProduct || (liveProducts[0]?.title || 'জয়পুরি কটন আনস্টিচড থ্রি-পিস');

        const matchedProd = liveProducts.find((p: any) =>
          p.title.toLowerCase().includes(prodTitle.toLowerCase()) || prodTitle.toLowerCase().includes(p.title.toLowerCase())
        );

        let itemPrice = orderData?.price;
        if (!itemPrice) {
          const priceMatch = replyText.match(/(?:মূল্য|বিল|টাকা)[:\*\s]+[৳]?\s*([0-9]+)/i) ||
            replyText.match(/৳\s*([0-9]+)/);
          if (priceMatch) itemPrice = Number(priceMatch[1]);
        }
        itemPrice = itemPrice || session.price || (matchedProd ? Number(matchedProd.basePrice) : 1250);

        let finalAddress = orderData?.address;
        if (!finalAddress) {
          const addrMatch = replyText.match(/ঠিকানা[:\*\s]+([^\n\r]+)/i);
          if (addrMatch) finalAddress = addrMatch[1].replace(/[\*]/g, '').trim();
        }
        finalAddress = finalAddress || recentOrder?.deliveryAddress || session.deliveryAddress || 'ঢাকা';

        let finalName = orderData?.customerName;
        if (!finalName) {
          const nameMatch = replyText.match(/(?:গ্রাহকের নাম|নাম)[:\*\s]+([^\n\r]+)/i);
          if (nameMatch) finalName = nameMatch[1].replace(/[\*]/g, '').trim();
        }
        finalName = finalName || recentOrder?.customerName || session.customerName || 'সম্মানিত কাস্টমার';

        let finalPhone = orderData?.phone;
        if (!finalPhone) {
          const phoneMatch = replyText.match(/01[3-9]\d{8}/) || rawText.match(/01[3-9]\d{8}/);
          if (phoneMatch) finalPhone = phoneMatch[0];
        }
        finalPhone = finalPhone || recentOrder?.customerPhone || session.customerPhone || '01700000000';

        const isDhaka = /dhaka|ঢাকা|mirpur|uttara|gulshan|banani|dhanmondi|motijheel|badda|bnasree|banasree|মোহাম্মদপুর|মিরপুর|উত্তরা|বনশ্রী/i.test(finalAddress);
        const deliveryCharge = isDhaka ? (settings?.deliveryFeeDhaka || 120) : (settings?.deliveryFeeOutside || 150);
        const finalProdId = matchedProd ? matchedProd.id : (liveProducts[0]?.id || 'prod-1');

        try {
          await insertDbOrder({
            customerName: finalName,
            customerPhone: finalPhone,
            deliveryAddress: finalAddress,
            deliveryCity: isDhaka ? 'ঢাকা' : 'ঢাকার বাইরে',
            organizationId,
            channel: 'FACEBOOK_MESSENGER',
            status: 'PENDING_CONFIRMATION',
            itemsPrice: itemPrice,
            deliveryCharge: deliveryCharge,
            discount: 0,
            productTitle: prodTitle,
            productId: finalProdId,
            psid: senderId,
          });
          console.log(`[Order Inserted Successfully] Org: ${organizationId}, Customer: ${finalName}, Phone: ${finalPhone}, Item: ${prodTitle}`);
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

    await recordChatTurn(senderId, rawText, reply);
    await sendFbMessage(senderId, reply, pageToken);
    return;
  }

  // IF CUSTOMER WANTS TO ORDER MORE ITEMS (ALREADY HAS AN ORDER):
  if (isMoreOrderIntentQuery && recentOrder) {
    const custName = recentOrder.customerName || 'সম্মানিত কাস্টমার';
    const reply =
      `আপনার '${recentOrder.productTitle}'-এর অর্ডারটি (#OF-${recentOrder.orderNumber}) তো প্রসেসিংয়ে রয়েছেই, আপনার আবার অর্ডার করার আগ্রহ দেখে খুব ভালো লাগলো ${custName} ভাইয়া/আপু! 😍\n\n` +
      `আমাদের বর্তমান ${liveProducts.length}টি কালেকশন থেকে কোনটি নিতে চাচ্ছেন জানাবেন কি? নিচে চাপ দিয়ে সিলেক্ট করতে পারেন 👇`;

    await recordChatTurn(senderId, rawText, reply);
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

      await recordChatTurn(senderId, rawText, reply);
      await sendFbMessage(senderId, reply, pageToken);
      return;
    }

    if (isPaymentQuery) {
      const reply =
        `🤝 ${custName} ভাইয়া/আপু, আপনার অর্ডারের (#OF-${recentOrder.orderNumber}) মোট বিল ৳${recentOrder.totalPrice}।\n\n` +
        `আমাদের কোনো অগ্রিম টাকা দিতে হবে না! পার্সেলটি হাতে পেয়ে ডেলিভারিম্যানকে ক্যাশ টাকা পরিশোধ করবেন। ধন্যবাদ সাথে থাকার জন্য! ❤️`;

      await recordChatTurn(senderId, rawText, reply);
      await sendFbMessage(senderId, reply, pageToken);
      return;
    }

    if (isThanksQuery) {
      const reply = `❤️ আপনাকেও অনেক অনেক ধন্যবাদ ${custName} ভাইয়া/আপু! আমরা দ্রুততম সময়ে আপনার ঠিকানায় সুন্দর প্যাকেজিংয়ে পার্সেলটি পৌঁছে দেব। শুভকামনা! 🌸`;
      await recordChatTurn(senderId, rawText, reply);
      await sendFbMessage(senderId, reply, pageToken);
      return;
    }
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

    let reply = `👗 '${storeDisplayName}'-এর বর্তমান রানিং কালেকশন ও প্রাইস লিস্ট (${liveProducts.length}টি এভেলেবল):\n\n`;
    for (const [catName, prods] of Object.entries(categoriesMap)) {
      reply += `✨ ${catName}:\n`;
      for (const p of prods.slice(0, 3)) {
        reply += `• *${p.title}* — ৳${p.basePrice}\n`;
      }
      reply += `\n`;
    }
    reply += `যেটি দেখতে বা অর্ডার করতে চান তা নিচে ক্লিক করুন 👇`;

    await recordChatTurn(senderId, rawText, reply);
    await sendFbQuickReplies(senderId, reply, getDynamicQuickReplies(), pageToken);
    return;
  }

  // IF USER SAYS "order dibo" / "order korte chai":
  if (isOrderIntentQuery) {
    const reply =
      `🛍️ চমৎকার! অর্ডার করতে অনুগ্রহ করে আপনার পছন্দের প্রোডাক্টটি নির্বাচন করুন 👇\n\n` +
      `এরপর আপনার নাম, ১১ ডিজিটের মোবাইল নম্বর ও সম্পূর্ণ ডেলিভারি ঠিকানা লিখে পাঠিয়ে দিলে অর্ডার কনফার্ম হয়ে যাবে।`;

    await recordChatTurn(senderId, rawText, reply);
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

    await recordChatTurn(senderId, rawText, reply);
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

    await recordChatTurn(senderId, rawText, reply);
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

    await recordChatTurn(senderId, rawText, reply);
    await sendFbQuickReplies(senderId, reply, getDynamicQuickReplies(), pageToken);
    return;
  }

  if (isPaymentQuery) {
    const reply =
      `💳 পেমেন্ট পদ্ধতি:\n\n` +
      `আমাদের কোনো অগ্রিম (Advance) টাকা দিতে হয় না! সম্পূর্ণ ক্যাশ অন ডেলিভারি (Cash On Delivery) — পার্সেল হাতে পেয়ে ডেলিভারিম্যানকে টাকা দিবেন। 🤝\n\n` +
      `অর্ডার করতে পছন্দের প্রোডাক্ট চাপুন 👇`;

    await recordChatTurn(senderId, rawText, reply);
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
        await recordChatTurn(senderId, rawText, reply);
        await sendFbMessage(senderId, reply, pageToken);
        return;
      }
    }
  }

  // 14. Default: Main Menu / Greeting with Dynamic Live Products
  session.state = 'IDLE';
  userSessions[senderId] = session;

  const reply = `আসসালামু আলাইকুম! ${storeDisplayName}-এ আপনাকে স্বাগতম। 🌸\n\nআমাদের বর্তমান ${liveProducts.length}টি স্পেশাল কালেকশন থেকে পছন্দের প্রোডাক্ট নির্বাচন করুন 👇`;
  await recordChatTurn(senderId, rawText, reply);
  await sendFbQuickReplies(senderId, reply, getDynamicQuickReplies(), pageToken);
}

async function sendFbMessage(recipientId: string, text: string, token?: string) {
  const activeToken = token || process.env.DEFAULT_FACEBOOK_PAGE_TOKEN || process.env.FB_PAGE_TOKEN || process.env.FACEBOOK_PAGE_ACCESS_TOKEN || '';
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
        messaging_type: 'RESPONSE',
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
  const activeToken = token || process.env.DEFAULT_FACEBOOK_PAGE_TOKEN || process.env.FB_PAGE_TOKEN || process.env.FACEBOOK_PAGE_ACCESS_TOKEN || '';
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
        messaging_type: 'RESPONSE',
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

    if (!res.ok || data.error) {
      console.warn('[Facebook Quick Replies Error, falling back to simple text]:', data.error);
      await sendFbMessage(recipientId, text, activeToken);
    }
  } catch (err) {
    console.error('[Facebook Quick Replies Error, sending plain text fallback]:', err);
    await sendFbMessage(recipientId, text, activeToken);
  }
}

async function sendFbImageAttachment(recipientId: string, imageUrl: string, token?: string) {
  const activeToken = token || process.env.DEFAULT_FACEBOOK_PAGE_TOKEN || process.env.FB_PAGE_TOKEN || process.env.FACEBOOK_PAGE_ACCESS_TOKEN || '';
  if (!activeToken || !imageUrl) return;

  try {
    const res = await fetch(`https://graph.facebook.com/v20.0/me/messages?access_token=${activeToken}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipient: { id: recipientId },
        messaging_type: 'RESPONSE',
        message: {
          attachment: {
            type: 'image',
            payload: {
              url: imageUrl,
              is_reusable: true,
            },
          },
        },
      }),
    });
    const data = await res.json();
    console.log('[Facebook Direct Image Attachment Result]:', data);
  } catch (err) {
    console.error('[Facebook Direct Image Attachment Error]:', err);
  }
}

async function sendFbGenericTemplate(
  recipientId: string,
  elements: Array<{
    title: string;
    subtitle?: string;
    image_url?: string;
    default_action?: {
      type: 'web_url';
      url: string;
      webview_height_ratio?: 'compact' | 'tall' | 'full';
    };
    buttons?: Array<
      | { type: 'postback'; title: string; payload: string }
      | { type: 'web_url'; title: string; url: string; webview_height_ratio?: string }
    >;
  }>,
  token?: string,
  imageAspectRatio: 'square' | 'horizontal' = 'square',
) {
  const activeToken = token || process.env.DEFAULT_FACEBOOK_PAGE_TOKEN || process.env.FB_PAGE_TOKEN || process.env.FACEBOOK_PAGE_ACCESS_TOKEN || '';
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
        messaging_type: 'RESPONSE',
        message: {
          attachment: {
            type: 'template',
            payload: {
              template_type: 'generic',
              image_aspect_ratio: imageAspectRatio,
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

async function handleFacebookComment(
  commentId: string,
  postId: string,
  senderId: string,
  senderName: string,
  message: string,
  pageToken: string,
  settings: any,
  geminiKey: string,
  channel: string = 'FACEBOOK_COMMENT',
  organizationId: string = 'org-1',
  storeName?: string
) {
  if (!commentId || !pageToken) return;
  const storeDisplayName = (storeName || settings?.fbPageName || '').trim() || 'আমাদের শপ';

  // 1. Save customer comment in Neon PostgreSQL DB
  await saveDbChatMessage({
    senderId: senderId || commentId,
    customerName: senderName || 'ফেসবুক কমেন্টকারী',
    sender: 'customer',
    text: `[পোস্ট কমেন্ট]: "${message}"`,
    channel,
    organizationId,
  });

  const products = await getDbProducts(organizationId);
  const lower = message.toLowerCase();

  // Matched product from comment text
  let matched = products.find((p: any) =>
    lower.includes(p.title.toLowerCase()) ||
    p.title.toLowerCase().split(/\s+/).some((w: string) => w.length >= 3 && lower.includes(w))
  );
  const prodTitle = matched ? matched.title : (products[0]?.title || 'জয়পুরি কটন আনস্টিচড থ্রি-পিস');
  const prodPrice = matched ? Number(matched.basePrice) : 1250;
  const deliveryCharge = settings?.deliveryFeeDhaka || 120;

  // 2. Reply publicly to the comment on Facebook
  const publicReplyText = `ধন্যবাদ ${senderName || 'সম্মানিত কাস্টমার'}! 🌸 আমরা আপনার ইনবক্সে বিস্তারিত বিবরণ, আকর্ষণীয় মূল্য তালিকা ও বড় ছবি পাঠিয়ে দিয়েছি। দয়া করে ইনবক্স মেসেজটি চেক করুন! ✨`;

  try {
    const commentReplyUrl = `https://graph.facebook.com/v20.0/${commentId}/comments?access_token=${pageToken}`;
    await fetch(commentReplyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: publicReplyText }),
    });
  } catch (cErr) {
    console.error('[Public Comment Reply Error]:', cErr);
  }

  // 3. Send Private Message to the user using recipient.comment_id
  const privateDmText = `আসসালামু আলাইকুম ${senderName || ''}! 🌸 '${storeDisplayName}'-এর পোস্টে কমেন্ট করার জন্য ধন্যবাদ।\n\nআমাদের '${prodTitle}'-এর অফার মূল্য মাত্র ৳${prodPrice}!\n\n🚚 ডেলিভারি চার্জ: ঢাকা সিটিতে ৳${deliveryCharge}, ঢাকার বাইরে ৳${settings?.deliveryFeeOutside || 150} (১০০% ক্যাশ অন ডেলিভারি)।\n\nঅর্ডার কনফার্ম করতে অনুগ্রহ করে আপনার নাম, ১১ ডিজিটের মোবাইল নম্বর ও ডেলিভারি ঠিকানা লিখে পাঠান! 🛍️✨`;

  try {
    const dmUrl = `https://graph.facebook.com/v20.0/me/messages?access_token=${pageToken}`;
    await fetch(dmUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipient: { comment_id: commentId },
        messaging_type: 'RESPONSE',
        message: { text: privateDmText },
      }),
    });
  } catch (dmErr) {
    console.error('[Private Comment DM Error]:', dmErr);
  }

  // 4. Save AI Reply in DB
  await saveDbChatMessage({
    senderId: senderId || commentId,
    customerName: senderName || 'ফেসবুক কমেন্টকারী',
    sender: 'ai',
    text: `[স্বয়ংক্রিয় কমেন্ট রিপ্লাই ও ইনবক্স পাঠানো হয়েছে]: ${privateDmText}`,
    channel,
    productTitle: prodTitle,
    productPrice: prodPrice,
    organizationId,
  });
}



