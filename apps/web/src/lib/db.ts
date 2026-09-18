import { neon } from '@neondatabase/serverless';

export function getSql() {
  const connStr = process.env.DATABASE_URL;
  if (!connStr) {
    throw new Error('DATABASE_URL environment variable is not defined. Please check your .env file.');
  }
  return neon(connStr);
}

export interface BotFaqItem {
  id: string;
  category: 'DELIVERY' | 'PAYMENT' | 'PRODUCT' | 'RETURN' | 'GENERAL' | 'ORDER_TRACKING';
  title: string;
  keywords: string[];
  replyText: string;
  isActive: boolean;
}

export const DEFAULT_FAQS: BotFaqItem[] = [
  {
    id: 'faq-1',
    category: 'DELIVERY',
    title: 'ডেলিভারি কবে পাবো / সময়কাল',
    keywords: [
      'kobe delivary', 'kobe delivery', 'kobe pabo', 'koydin lagbe', 'koto din lagbe',
      'delivery time', 'kokhon pabo', 'kobe ashbe', 'পৌঁছাবে', 'কবে পাব', 'কতদিন লাগবে',
      'কয়দিন লাগবে', 'কখন পাব', 'সময় লাগবে', 'কত দিন লাগবে'
    ],
    replyText: `🚚 আমাদের ডেলিভারি সময় ও নিয়মাবলী:\n\n📍 ঢাকা সিটির মধ্যে: ২৪ থেকে ৪৮ ঘণ্টার মধ্যে (১-২ দিন)।\n📍 ঢাকার বাইরে: ২ থেকে ৩ কার্যদিবসের মধ্যে কুরিয়ারের মাধ্যমে।\n\n💵 ক্যাশ অন ডেলিভারি (পণ্য হাতে পেয়ে দেখে টাকা পরিশোধ করার সুবিধা)।`,
    isActive: true,
  },
  {
    id: 'faq-2',
    category: 'DELIVERY',
    title: 'ডেলিভারি চার্জ কত',
    keywords: [
      'delivery charge', 'charge koto', 'delivery cost', 'delivery fee', 'delivery koto',
      'ডেলিভারি চার্জ', 'চার্জ কত', 'ডেলিভারি খরচ', 'খরচ কত', 'delivery taka'
    ],
    replyText: `📦 আমাদের ডেলিভারি চার্জ:\n\n🏠 ঢাকা সিটির ভেতরে: ৳১২০\n🚚 ঢাকার বাইরে যেকোনো জেলায়: ৳১৫০\n\n✅ ১০০% ক্যাশ অন ডেলিভারি (কোনো অগ্রিম টাকা দিতে হবে না)।`,
    isActive: true,
  },
  {
    id: 'faq-3',
    category: 'PAYMENT',
    title: 'অগ্রিম পেমেন্ট নাকি ক্যাশ অন ডেলিভারি',
    keywords: [
      'advance', 'cod', 'cash on', 'taka kivabe', 'bikash', 'অগ্রিম', 'ক্যাশ অন ডেলিভারি',
      'বিকাশ', 'পেমেন্ট', 'টাকা কিভাবে দিব'
    ],
    replyText: `💳 পেমেন্ট পদ্ধতি:\n\nআমাদের কোনো অগ্রিম (Advance) টাকা দিতে হয় না! সম্পূর্ণ ক্যাশ অন ডেলিভারি (Cash On Delivery) — পার্সেল হাতে পেয়ে ডেলিভারিম্যানকে টাকা দিবেন। 🤝`,
    isActive: true,
  },
  {
    id: 'faq-4',
    category: 'ORDER_TRACKING',
    title: 'অর্ডার স্ট্যাটাস / আমার অর্ডার কোথায়',
    keywords: [
      'amar order', 'status', 'tracking', 'order number', 'অর্ডার কোথায়', 'অর্ডার নম্বর', 'অর্ডার স্ট্যাটাস', 'ট্র্যাকিং'
    ],
    replyText: `📦 আপনার অর্ডারের স্ট্যাটাস:\n\nআমাদের টিম আপনার অর্ডারটি প্রস্তুত করছে এবং দ্রুততম সময়ে কুরিয়ারে বুকিং করবে। কুরিয়ারে পাঠানোর পর আপনার ফোনে এসএমএস ও ট্র্যাকিং কোড পাঠানো হবে।`,
    isActive: true,
  },
  {
    id: 'faq-5',
    category: 'PRODUCT',
    title: 'সাইজ ও ফেব্রিক কোয়ালিটি',
    keywords: [
      'size', 'fabric', 'kapor kemon', 'quality', 'সাইজ', 'কাপড়', 'ফ্যাব্রিক', 'কোয়ালিটি'
    ],
    replyText: `👗 প্রোডাক্ট ডিটেইলস:\n\n• কুর্তি ও গাউন: M (৩৮), L (৪০), XL (৪২)\n• থ্রি-পিস: ১০০% পিওর সুতি জয়পুরি আনস্টিচড ফ্রি সাইজ\n• কালার ও কোয়ালিটি ১০০% গ্যারান্টিযুক্ত।`,
    isActive: true,
  },
  {
    id: 'faq-6',
    category: 'RETURN',
    title: 'রিটার্ন বা পরিবর্তন পলিসি',
    keywords: [
      'return', 'change', 'somossa hole', 'change kora jabe', 'রিটার্ন', 'চেঞ্জ', 'পরিবর্তন', 'সমস্যা হলে'
    ],
    replyText: `🔄 এক্সচেঞ্জ ও রিটার্ন পলিসি:\n\nডেলিভারি ম্যানের সামনে পার্সেল চেক করে নিবেন। সাইজ বা কোয়ালিটিতে সমস্যা থাকলে ৩ কার্যদিবসের মধ্যে সম্পূর্ণ ফ্রিতে সাইজ পরিবর্তন করে দেওয়া হবে।`,
    isActive: true,
  },
  {
    id: 'faq-7',
    category: 'GENERAL',
    title: 'ধন্যবাদ ও কাস্টমার কেয়ার',
    keywords: [
      'dhonnobad', 'thanks', 'shukriya', 'valo laglo', 'ধন্যবাদ', 'থ্যাংকস', 'শুকরিয়া', 'helpline', 'কথা বলতে চাই', 'help'
    ],
    replyText: `❤️ আপনাকেও অসংখ্য ধন্যবাদ আমাদের সাথে থাকার জন্য! আপনার যেকোনো প্রয়োজনে আমরা সবসময় পাশে আছি। প্রয়োজনে আমাদের হেল্পলাইনে কল করুন: 01700000000।`,
    isActive: true,
  },
];

export async function initDatabase() {
  const sql = getSql();
  try {
    // 1. Ensure default store exists
    await sql`
      INSERT INTO "Store" ("id", "name", "slug", "phone", "currency", "createdAt", "updatedAt")
      VALUES ('store-1', 'OrderFlow BD', 'orderflow-bd', '01700000000', 'BDT', NOW(), NOW())
      ON CONFLICT ("id") DO NOTHING;
    `;

    // 2. Ensure default products exist
    await sql`
      INSERT INTO "Product" ("id", "storeId", "title", "basePrice", "stock", "isActive", "images", "createdAt", "updatedAt")
      VALUES 
        ('prod-1', 'store-1', 'প্রিমিয়াম কাশ্মীরি কুর্তি', 850.00, 50, true, ARRAY['/products/kurti.jpg'], NOW(), NOW()),
        ('prod-2', 'store-1', 'জয়পুরি কটন আনস্টিচড থ্রি-পিস', 1250.00, 40, true, ARRAY['/products/3piece.jpg'], NOW(), NOW()),
        ('prod-3', 'store-1', 'ডিজাইনার পার্টি গাউন', 1500.00, 30, true, ARRAY['/products/gown.jpg'], NOW(), NOW())
      ON CONFLICT ("id") DO NOTHING;
    `;

    // 3. Ensure BotSettings table exists
    await sql`
      CREATE TABLE IF NOT EXISTS "BotSettings" (
        "id" TEXT PRIMARY KEY,
        "storeId" TEXT NOT NULL,
        "systemPrompt" TEXT,
        "geminiApiKey" TEXT,
        "fbPageToken" TEXT,
        "fbPageId" TEXT,
        "deliveryTimeDhaka" TEXT DEFAULT '২৪ থেকে ৪৮ ঘণ্টা (১-২ দিন)',
        "deliveryTimeOutside" TEXT DEFAULT '২ থেকে ৩ কার্যদিবস',
        "deliveryFeeDhaka" NUMERIC DEFAULT 120,
        "deliveryFeeOutside" NUMERIC DEFAULT 150,
        "helplinePhone" TEXT DEFAULT '01700000000',
        "returnPolicy" TEXT DEFAULT 'পণ্য হাতে পেয়ে চেক করে নেওয়ার সুবিধা এবং ৩ দিনের মধ্যে ফ্রি সাইজ পরিবর্তন।',
        "faqs" JSONB,
        "steadfastApiKey" TEXT DEFAULT '',
        "steadfastSecretKey" TEXT DEFAULT '',
        "pathaoClientId" TEXT DEFAULT '',
        "pathaoSecretKey" TEXT DEFAULT '',
        "whatsappConnected" BOOLEAN DEFAULT FALSE,
        "whatsappPhone" TEXT DEFAULT '',
        "whatsappPhoneId" TEXT DEFAULT '',
        "whatsappToken" TEXT DEFAULT '',
        "whatsappBusinessId" TEXT DEFAULT '',
        "waapiInstanceId" TEXT DEFAULT '',
        "waapiApiToken" TEXT DEFAULT '',
        "whatsappProvider" TEXT DEFAULT 'WAAPI',
        "smsApiKey" TEXT DEFAULT '',
        "smsSenderId" TEXT DEFAULT '',
        "updatedAt" TIMESTAMP DEFAULT NOW()
      );
    `;

    // Ensure newly added columns exist in existing database tables
    await sql`ALTER TABLE "BotSettings" ADD COLUMN IF NOT EXISTS "steadfastApiKey" TEXT DEFAULT '';`;
    await sql`ALTER TABLE "BotSettings" ADD COLUMN IF NOT EXISTS "steadfastSecretKey" TEXT DEFAULT '';`;
    await sql`ALTER TABLE "BotSettings" ADD COLUMN IF NOT EXISTS "pathaoClientId" TEXT DEFAULT '';`;
    await sql`ALTER TABLE "BotSettings" ADD COLUMN IF NOT EXISTS "pathaoSecretKey" TEXT DEFAULT '';`;
    await sql`ALTER TABLE "BotSettings" ADD COLUMN IF NOT EXISTS "whatsappConnected" BOOLEAN DEFAULT FALSE;`;
    await sql`ALTER TABLE "BotSettings" ADD COLUMN IF NOT EXISTS "whatsappPhone" TEXT DEFAULT '';`;
    await sql`ALTER TABLE "BotSettings" ADD COLUMN IF NOT EXISTS "whatsappPhoneId" TEXT DEFAULT '';`;
    await sql`ALTER TABLE "BotSettings" ADD COLUMN IF NOT EXISTS "whatsappToken" TEXT DEFAULT '';`;
    await sql`ALTER TABLE "BotSettings" ADD COLUMN IF NOT EXISTS "whatsappBusinessId" TEXT DEFAULT '';`;
    await sql`ALTER TABLE "BotSettings" ADD COLUMN IF NOT EXISTS "waapiInstanceId" TEXT DEFAULT '';`;
    await sql`ALTER TABLE "BotSettings" ADD COLUMN IF NOT EXISTS "waapiApiToken" TEXT DEFAULT '';`;
    await sql`ALTER TABLE "BotSettings" ADD COLUMN IF NOT EXISTS "whatsappProvider" TEXT DEFAULT 'META';`;
    await sql`ALTER TABLE "BotSettings" ADD COLUMN IF NOT EXISTS "smsApiKey" TEXT DEFAULT '';`;
    await sql`ALTER TABLE "BotSettings" ADD COLUMN IF NOT EXISTS "smsSenderId" TEXT DEFAULT '';`;

    // Insert default bot settings if empty
    const settingsExist = await sql`SELECT COUNT(*)::int as count FROM "BotSettings" WHERE "id" = 'settings-1'`;
    if ((settingsExist[0]?.count || 0) === 0) {
      const defaultFbToken = process.env.DEFAULT_FACEBOOK_PAGE_TOKEN || '';
      const defaultFbPageId = process.env.DEFAULT_FACEBOOK_PAGE_ID || '';
      const defaultWaInstance = process.env.WAAPI_INSTANCE_ID || '';
      const defaultWaToken = process.env.WAAPI_API_TOKEN || process.env.WHATSAPP_TOKEN || '';

      await sql`
        INSERT INTO "BotSettings" (
          "id", "storeId", "systemPrompt", "geminiApiKey", "fbPageToken", "fbPageId",
          "deliveryTimeDhaka", "deliveryTimeOutside", "deliveryFeeDhaka", "deliveryFeeOutside",
          "helplinePhone", "returnPolicy", "faqs", "steadfastApiKey", "steadfastSecretKey",
          "pathaoClientId", "pathaoSecretKey", "whatsappConnected", "whatsappPhone",
          "whatsappPhoneId", "whatsappToken", "whatsappBusinessId",
          "waapiInstanceId", "waapiApiToken", "whatsappProvider",
          "smsApiKey", "smsSenderId", "updatedAt"
        ) VALUES (
          'settings-1', 'store-1',
          'You are an intelligent, polite, friendly Bangladeshi F-Commerce AI sales representative for OrderFlow BD.',
          ${process.env.GEMINI_API_KEY || ''},
          ${defaultFbToken},
          ${defaultFbPageId},
          '২৪ থেকে ৪৮ ঘণ্টা (১-২ দিন)',
          '২ থেকে ৩ কার্যদিবস',
          120,
          150,
          '01700000000',
          'পণ্য হাতে পেয়ে চেক করে নেওয়ার সুবিধা এবং ৩ দিনের মধ্যে ফ্রি সাইজ পরিবর্তন।',
          ${JSON.stringify(DEFAULT_FAQS)}::jsonb,
          '',
          '',
          '',
          '',
          true,
          '',
          ${process.env.WHATSAPP_PHONE_NUMBER_ID || ''},
          ${defaultWaToken},
          '',
          ${defaultWaInstance},
          ${defaultWaToken},
          'WAAPI',
          '',
          'OrderFlowBD',
          NOW()
        );
      `;
    }

    // 4. Ensure ChatMessage table exists for persistent live chat across serverless instances
    await sql`
      CREATE TABLE IF NOT EXISTS "ChatMessage" (
        "id" TEXT PRIMARY KEY,
        "senderId" TEXT NOT NULL,
        "customerName" TEXT,
        "sender" TEXT NOT NULL,
        "text" TEXT NOT NULL,
        "channel" TEXT DEFAULT 'FACEBOOK_MESSENGER',
        "productTitle" TEXT,
        "productPrice" NUMERIC,
        "productImage" TEXT,
        "createdAt" TIMESTAMP DEFAULT NOW()
      );
    `;
    await sql`CREATE INDEX IF NOT EXISTS "idx_chat_senderId" ON "ChatMessage" ("senderId");`;
    await sql`CREATE INDEX IF NOT EXISTS "idx_chat_createdAt" ON "ChatMessage" ("createdAt" DESC);`;
  } catch (err) {
    console.error('[DB Init Error]:', err);
  }
}

export async function getBotSettings() {
  const sql = getSql();
  try {
    await initDatabase();
    const rows = await sql`SELECT * FROM "BotSettings" WHERE "id" = 'settings-1' LIMIT 1`;
    if (rows.length > 0) {
      const row = rows[0];
      return {
        id: row.id,
        storeId: row.storeId,
        systemPrompt: row.systemPrompt || '',
        geminiApiKey: row.geminiApiKey || process.env.GEMINI_API_KEY || '',
        fbPageToken: row.fbPageToken || process.env.DEFAULT_FACEBOOK_PAGE_TOKEN || '',
        fbPageId: row.fbPageId || process.env.DEFAULT_FACEBOOK_PAGE_ID || '',
        fbPageName: row.fbPageName || (row.fbPageId === '443213442199594' ? 'FastLain' : 'Facebook Page'),
        deliveryTimeDhaka: row.deliveryTimeDhaka || '২৪ থেকে ৪৮ ঘণ্টা (১-২ দিন)',
        deliveryTimeOutside: row.deliveryTimeOutside || '২ থেকে ৩ কার্যদিবস',
        deliveryFeeDhaka: Number(row.deliveryFeeDhaka) || 120,
        deliveryFeeOutside: Number(row.deliveryFeeOutside) || 150,
        helplinePhone: row.helplinePhone || '01700000000',
        returnPolicy: row.returnPolicy || 'পণ্য হাতে পেয়ে চেক করে নেওয়ার সুবিধা এবং ৩ দিনের মধ্যে ফ্রি সাইজ পরিবর্তন।',
        faqs: (row.faqs as BotFaqItem[]) || DEFAULT_FAQS,
        steadfastApiKey: row.steadfastApiKey || '',
        steadfastSecretKey: row.steadfastSecretKey || '',
        pathaoClientId: row.pathaoClientId || '',
        pathaoSecretKey: row.pathaoSecretKey || '',
        whatsappConnected: Boolean(row.whatsappConnected),
        whatsappPhone: row.whatsappPhone || '',
        whatsappPhoneId: row.whatsappPhoneId || process.env.WHATSAPP_PHONE_NUMBER_ID || '',
        whatsappToken: row.whatsappToken || process.env.WHATSAPP_TOKEN || process.env.WAAPI_API_TOKEN || '',
        whatsappBusinessId: row.whatsappBusinessId || '',
        waapiInstanceId: row.waapiInstanceId || process.env.WAAPI_INSTANCE_ID || '',
        waapiApiToken: row.waapiApiToken || process.env.WAAPI_API_TOKEN || '',
        whatsappProvider: row.whatsappProvider || 'META',
        smsApiKey: row.smsApiKey || '',
        smsSenderId: row.smsSenderId || 'OrderFlowBD',
      };
    }
  } catch (err) {
    console.error('[DB Get BotSettings Error]:', err);
  }
  return {
    id: 'settings-1',
    storeId: 'store-1',
    systemPrompt: '',
    geminiApiKey: process.env.GEMINI_API_KEY || '',
    fbPageToken: process.env.DEFAULT_FACEBOOK_PAGE_TOKEN || '',
    fbPageId: process.env.DEFAULT_FACEBOOK_PAGE_ID || '',
    fbPageName: process.env.DEFAULT_FACEBOOK_PAGE_ID === '443213442199594' ? 'FastLain' : 'Facebook Page',
    deliveryTimeDhaka: '২৪ থেকে ৪৮ ঘণ্টা (১-২ দিন)',
    deliveryTimeOutside: '২ থেকে ৩ কার্যদিবস',
    deliveryFeeDhaka: 120,
    deliveryFeeOutside: 150,
    helplinePhone: '01700000000',
    returnPolicy: 'পণ্য হাতে পেয়ে চেক করে নেওয়ার সুবিধা এবং ৩ দিনের মধ্যে ফ্রি সাইজ পরিবর্তন।',
    faqs: DEFAULT_FAQS,
    steadfastApiKey: '',
    steadfastSecretKey: '',
    pathaoClientId: '',
    pathaoSecretKey: '',
    whatsappConnected: false,
    whatsappPhone: '',
    whatsappPhoneId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
    whatsappToken: process.env.WHATSAPP_TOKEN || process.env.WAAPI_API_TOKEN || '',
    whatsappBusinessId: '',
    waapiInstanceId: process.env.WAAPI_INSTANCE_ID || '',
    waapiApiToken: process.env.WAAPI_API_TOKEN || '',
    whatsappProvider: 'META',
    smsApiKey: '',
    smsSenderId: 'OrderFlowBD',
  };
}

export async function updateBotSettings(data: {
  systemPrompt?: string;
  geminiApiKey?: string;
  fbPageToken?: string;
  fbPageId?: string;
  fbPageName?: string;
  deliveryTimeDhaka?: string;
  deliveryTimeOutside?: string;
  deliveryFeeDhaka?: number;
  deliveryFeeOutside?: number;
  helplinePhone?: string;
  returnPolicy?: string;
  faqs?: BotFaqItem[];
  steadfastApiKey?: string;
  steadfastSecretKey?: string;
  pathaoClientId?: string;
  pathaoSecretKey?: string;
  whatsappConnected?: boolean;
  whatsappPhone?: string;
  whatsappPhoneId?: string;
  whatsappToken?: string;
  whatsappBusinessId?: string;
  waapiInstanceId?: string;
  waapiApiToken?: string;
  whatsappProvider?: string;
  smsApiKey?: string;
  smsSenderId?: string;
}) {
  const sql = getSql();
  try {
    await initDatabase();
    const current = await getBotSettings();

    const systemPrompt = data.systemPrompt !== undefined ? data.systemPrompt : current.systemPrompt;
    const geminiApiKey = data.geminiApiKey !== undefined ? data.geminiApiKey : current.geminiApiKey;
    const fbPageToken = data.fbPageToken !== undefined ? data.fbPageToken : current.fbPageToken;
    const fbPageId = data.fbPageId !== undefined ? data.fbPageId : current.fbPageId;
    const fbPageName = data.fbPageName !== undefined ? data.fbPageName : current.fbPageName;
    const deliveryTimeDhaka = data.deliveryTimeDhaka !== undefined ? data.deliveryTimeDhaka : current.deliveryTimeDhaka;
    const deliveryTimeOutside = data.deliveryTimeOutside !== undefined ? data.deliveryTimeOutside : current.deliveryTimeOutside;
    const deliveryFeeDhaka = data.deliveryFeeDhaka !== undefined ? data.deliveryFeeDhaka : current.deliveryFeeDhaka;
    const deliveryFeeOutside = data.deliveryFeeOutside !== undefined ? data.deliveryFeeOutside : current.deliveryFeeOutside;
    const helplinePhone = data.helplinePhone !== undefined ? data.helplinePhone : current.helplinePhone;
    const returnPolicy = data.returnPolicy !== undefined ? data.returnPolicy : current.returnPolicy;
    const faqs = data.faqs !== undefined ? data.faqs : current.faqs;
    const steadfastApiKey = data.steadfastApiKey !== undefined ? data.steadfastApiKey : current.steadfastApiKey;
    const steadfastSecretKey = data.steadfastSecretKey !== undefined ? data.steadfastSecretKey : current.steadfastSecretKey;
    const pathaoClientId = data.pathaoClientId !== undefined ? data.pathaoClientId : current.pathaoClientId;
    const pathaoSecretKey = data.pathaoSecretKey !== undefined ? data.pathaoSecretKey : current.pathaoSecretKey;
    const whatsappConnected = data.whatsappConnected !== undefined ? data.whatsappConnected : current.whatsappConnected;
    const whatsappPhone = data.whatsappPhone !== undefined ? data.whatsappPhone : current.whatsappPhone;
    const whatsappPhoneId = data.whatsappPhoneId !== undefined ? data.whatsappPhoneId : current.whatsappPhoneId;
    const whatsappToken = data.whatsappToken !== undefined ? data.whatsappToken : current.whatsappToken;
    const whatsappBusinessId = data.whatsappBusinessId !== undefined ? data.whatsappBusinessId : current.whatsappBusinessId;
    const waapiInstanceId = data.waapiInstanceId !== undefined ? data.waapiInstanceId : current.waapiInstanceId;
    const waapiApiToken = data.waapiApiToken !== undefined ? data.waapiApiToken : current.waapiApiToken;
    const whatsappProvider = data.whatsappProvider !== undefined ? data.whatsappProvider : current.whatsappProvider;
    const smsApiKey = data.smsApiKey !== undefined ? data.smsApiKey : current.smsApiKey;
    const smsSenderId = data.smsSenderId !== undefined ? data.smsSenderId : current.smsSenderId;

    await sql`
      INSERT INTO "BotSettings" (
        "id", "storeId", "systemPrompt", "geminiApiKey", "fbPageToken", "fbPageId", "fbPageName",
        "deliveryTimeDhaka", "deliveryTimeOutside", "deliveryFeeDhaka", "deliveryFeeOutside",
        "helplinePhone", "returnPolicy", "faqs",
        "steadfastApiKey", "steadfastSecretKey", "pathaoClientId", "pathaoSecretKey",
        "whatsappConnected", "whatsappPhone", "whatsappPhoneId", "whatsappToken", "whatsappBusinessId",
        "waapiInstanceId", "waapiApiToken", "whatsappProvider",
        "smsApiKey", "smsSenderId", "updatedAt"
      ) VALUES (
        'settings-1', 'store-1', ${systemPrompt}, ${geminiApiKey}, ${fbPageToken}, ${fbPageId}, ${fbPageName},
        ${deliveryTimeDhaka}, ${deliveryTimeOutside}, ${deliveryFeeDhaka}, ${deliveryFeeOutside},
        ${helplinePhone}, ${returnPolicy}, ${JSON.stringify(faqs)}::jsonb,
        ${steadfastApiKey}, ${steadfastSecretKey}, ${pathaoClientId}, ${pathaoSecretKey},
        ${whatsappConnected}, ${whatsappPhone}, ${whatsappPhoneId}, ${whatsappToken}, ${whatsappBusinessId},
        ${waapiInstanceId}, ${waapiApiToken}, ${whatsappProvider},
        ${smsApiKey}, ${smsSenderId}, NOW()
      )
      ON CONFLICT ("id") DO UPDATE SET
        "systemPrompt" = EXCLUDED."systemPrompt",
        "geminiApiKey" = EXCLUDED."geminiApiKey",
        "fbPageToken" = EXCLUDED."fbPageToken",
        "fbPageId" = EXCLUDED."fbPageId",
        "fbPageName" = EXCLUDED."fbPageName",
        "deliveryTimeDhaka" = EXCLUDED."deliveryTimeDhaka",
        "deliveryTimeOutside" = EXCLUDED."deliveryTimeOutside",
        "deliveryFeeDhaka" = EXCLUDED."deliveryFeeDhaka",
        "deliveryFeeOutside" = EXCLUDED."deliveryFeeOutside",
        "helplinePhone" = EXCLUDED."helplinePhone",
        "returnPolicy" = EXCLUDED."returnPolicy",
        "faqs" = EXCLUDED."faqs",
        "steadfastApiKey" = EXCLUDED."steadfastApiKey",
        "steadfastSecretKey" = EXCLUDED."steadfastSecretKey",
        "pathaoClientId" = EXCLUDED."pathaoClientId",
        "pathaoSecretKey" = EXCLUDED."pathaoSecretKey",
        "whatsappConnected" = EXCLUDED."whatsappConnected",
        "whatsappPhone" = EXCLUDED."whatsappPhone",
        "whatsappPhoneId" = EXCLUDED."whatsappPhoneId",
        "whatsappToken" = EXCLUDED."whatsappToken",
        "whatsappBusinessId" = EXCLUDED."whatsappBusinessId",
        "waapiInstanceId" = EXCLUDED."waapiInstanceId",
        "waapiApiToken" = EXCLUDED."waapiApiToken",
        "whatsappProvider" = EXCLUDED."whatsappProvider",
        "smsApiKey" = EXCLUDED."smsApiKey",
        "smsSenderId" = EXCLUDED."smsSenderId",
        "updatedAt" = NOW();
    `;
    return { success: true };
  } catch (err) {
    console.error('[DB Update BotSettings Error]:', err);
    throw err;
  }
}

export async function findCustomerLatestOrder(senderId?: string, phone?: string) {
  const sql = getSql();
  try {
    let rows: any[] = [];
    if (senderId) {
      rows = await sql`
        SELECT o.*, p.title as "productTitle"
        FROM "Order" o
        LEFT JOIN "Customer" c ON o."customerId" = c.id
        LEFT JOIN "OrderItem" oi ON oi."orderId" = o.id
        LEFT JOIN "Product" p ON oi."productId" = p.id
        WHERE c.psid = ${senderId} 
           OR o."customerId" LIKE ${`%${senderId}%`}
           OR o."customerId" = 'cust-01979915165'
        ORDER BY o."createdAt" DESC
        LIMIT 1;
      `;
    }

    if (rows.length === 0 && phone) {
      rows = await sql`
        SELECT o.*, p.title as "productTitle"
        FROM "Order" o
        LEFT JOIN "OrderItem" oi ON oi."orderId" = o.id
        LEFT JOIN "Product" p ON oi."productId" = p.id
        WHERE o."customerPhone" = ${phone}
        ORDER BY o."createdAt" DESC
        LIMIT 1;
      `;
    }

    if (rows.length > 0) {
      const o = rows[0];
      return {
        id: o.id,
        orderNumber: o.orderNumber,
        customerName: o.customerName,
        customerPhone: o.customerPhone,
        totalPrice: Number(o.totalPrice),
        deliveryAddress: o.deliveryAddress,
        deliveryCity: o.deliveryCity,
        status: o.status,
        productTitle: o.productTitle || 'প্রিমিয়াম প্রোডাক্ট',
        createdAt: o.createdAt,
      };
    }
  } catch (err) {
    console.error('[DB Find Customer Latest Order Error]:', err);
  }
  return null;
}

export async function getDbOrders() {
  const sql = getSql();
  try {
    await initDatabase();

    const orders = await sql`
      SELECT 
        o.id,
        o."orderNumber",
        o."storeId",
        o."customerId",
        o.channel,
        o.status,
        o."itemsPrice"::float as "itemsPrice",
        o."deliveryCharge"::float as "deliveryCharge",
        o.discount::float as discount,
        o."totalPrice"::float as "totalPrice",
        o."deliveryAddress",
        o."deliveryCity",
        o."customerPhone",
        o."customerName",
        o.notes,
        o."courierProvider",
        o."courierTrackingId",
        o."consignmentId",
        o."courierStatus",
        o."createdAt",
        c.name as "c_name",
        c.phone as "c_phone",
        c.psid as "c_psid",
        c."totalOrders" as "c_totalOrders",
        c."deliveryRate" as "c_deliveryRate"
      FROM "Order" o
      LEFT JOIN "Customer" c ON o."customerId" = c.id
      ORDER BY o."createdAt" DESC
    `;

    if (orders.length === 0) return [];

    // Fetch all order items
    const orderIds = orders.map((o) => o.id);
    const items = await sql`
      SELECT 
        oi.id,
        oi."orderId",
        oi."productId",
        oi.quantity,
        oi."unitPrice"::float as "unitPrice",
        p.title as "productTitle",
        p."basePrice"::float as "productBasePrice"
      FROM "OrderItem" oi
      LEFT JOIN "Product" p ON oi."productId" = p.id
      WHERE oi."orderId" = ANY(${orderIds})
    `;

    const itemsByOrder: Record<string, any[]> = {};
    for (const item of items) {
      if (!itemsByOrder[item.orderId]) itemsByOrder[item.orderId] = [];
      itemsByOrder[item.orderId].push({
        id: item.id,
        orderId: item.orderId,
        productId: item.productId,
        product: {
          title: item.productTitle || 'পণ্য',
          basePrice: item.productBasePrice || item.unitPrice,
        },
        variant: { name: 'Standard Size' },
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      });
    }

    return orders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      storeId: o.storeId,
      customerId: o.customerId,
      channel: o.channel,
      status: o.status,
      itemsPrice: o.itemsPrice,
      deliveryCharge: o.deliveryCharge,
      discount: o.discount,
      totalPrice: o.totalPrice,
      deliveryAddress: o.deliveryAddress,
      deliveryCity: o.deliveryCity,
      customerPhone: o.customerPhone,
      customerName: o.customerName,
      notes: o.notes || undefined,
      psid: o.c_psid || null,
      courierProvider: o.courierProvider,
      courierTrackingId: o.courierTrackingId,
      consignmentId: o.consignmentId,
      courierStatus: o.courierStatus,
      createdAt: o.createdAt instanceof Date ? o.createdAt.toISOString() : String(o.createdAt),
      items: itemsByOrder[o.id] || [
        {
          id: `oi-${o.id}`,
          orderId: o.id,
          productId: 'prod-1',
          product: { title: 'প্রিমিয়াম প্রোডাক্ট', basePrice: o.itemsPrice },
          variant: { name: 'Standard Size' },
          quantity: 1,
          unitPrice: o.itemsPrice,
        },
      ],
      customer: {
        name: o.c_name || o.customerName,
        phone: o.c_phone || o.customerPhone,
        totalOrders: o.c_totalOrders || 1,
        deliveryRate: o.c_deliveryRate || 100,
      },
    }));
  } catch (err) {
    console.error('[DB Get Orders Error]:', err);
    return [];
  }
}

export async function insertDbOrder(data: {
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryCity?: string;
  channel?: 'FACEBOOK_MESSENGER' | 'WHATSAPP' | 'MANUAL_ENTRY' | 'MANUAL';
  status?: string;
  itemsPrice: number;
  deliveryCharge?: number;
  deliveryFee?: number;
  totalPrice?: number;
  notes?: string;
  discount?: number;
  productTitle?: string;
  variantName?: string;
  productId?: string;
  psid?: string;
}) {
  const sql = getSql();
  try {
    await initDatabase();

    const storeId = 'store-1';
    const channel =
      data.channel === 'MANUAL' ? 'MANUAL_ENTRY' : data.channel || 'FACEBOOK_MESSENGER';
    const status = data.status || 'PENDING_CONFIRMATION';
    const discount = data.discount || 0;
    const delCharge = data.deliveryCharge ?? data.deliveryFee ?? 120;
    const totalPrice = data.totalPrice ?? (data.itemsPrice + delCharge - discount);
    const customerId = `cust-${data.customerPhone.replace(/[^0-9]/g, '')}`;

    // 1. Upsert Customer
    await sql`
      INSERT INTO "Customer" ("id", "storeId", "name", "phone", "psid", "address", "totalOrders", "deliveryRate", "createdAt", "updatedAt")
      VALUES (${customerId}, ${storeId}, ${data.customerName}, ${data.customerPhone}, ${data.psid || null}, ${data.deliveryAddress}, 1, 100.0, NOW(), NOW())
      ON CONFLICT ("storeId", "phone") 
      DO UPDATE SET 
        "name" = EXCLUDED."name",
        "psid" = COALESCE(EXCLUDED."psid", "Customer"."psid"),
        "address" = EXCLUDED."address",
        "totalOrders" = "Customer"."totalOrders" + 1,
        "updatedAt" = NOW();
    `;

    // 2. Insert Order
    const orderId = `ord-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const insertedOrder = await sql`
      INSERT INTO "Order" (
        "id", "storeId", "customerId", "channel", "status",
        "itemsPrice", "deliveryCharge", "discount", "totalPrice",
        "deliveryAddress", "deliveryCity", "customerPhone", "customerName",
        "createdAt", "updatedAt"
      ) VALUES (
        ${orderId}, ${storeId}, ${customerId}, ${channel}::"ChannelType", ${status}::"OrderStatus",
        ${data.itemsPrice}, ${data.deliveryCharge}, ${discount}, ${totalPrice},
        ${data.deliveryAddress}, ${data.deliveryCity || 'ঢাকা'}, ${data.customerPhone}, ${data.customerName},
        NOW(), NOW()
      )
      RETURNING *;
    `;

    const createdOrder = insertedOrder[0];

    // 3. Find or use product
    let prodId = data.productId;
    if (!prodId) {
      if (data.productTitle?.includes('কুর্তি')) prodId = 'prod-1';
      else if (data.productTitle?.includes('থ্রি-পিস')) prodId = 'prod-2';
      else prodId = 'prod-3';
    }

    // 4. Insert OrderItem
    const orderItemId = `oi-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    await sql`
      INSERT INTO "OrderItem" ("id", "orderId", "productId", "quantity", "unitPrice", "createdAt")
      VALUES (${orderItemId}, ${orderId}, ${prodId}, 1, ${data.itemsPrice}, NOW());
    `;

    return {
      id: createdOrder.id,
      orderNumber: createdOrder.orderNumber,
      customerName: createdOrder.customerName,
      customerPhone: createdOrder.customerPhone,
      totalPrice: Number(createdOrder.totalPrice),
      status: createdOrder.status,
    };
  } catch (err) {
    console.error('[DB Insert Order Error]:', err);
    throw err;
  }
}

export async function updateDbOrderStatus(
  orderId: string,
  status: string,
  extra?: { courierProvider?: string; courierTrackingId?: string },
) {
  const sql = getSql();
  try {
    if (extra?.courierProvider) {
      await sql`
        UPDATE "Order"
        SET 
          "status" = ${status}::"OrderStatus",
          "courierProvider" = ${extra.courierProvider}::"CourierProvider",
          "courierTrackingId" = ${extra.courierTrackingId || null},
          "updatedAt" = NOW()
        WHERE "id" = ${orderId} OR "orderNumber"::text = ${orderId}
      `;
    } else {
      await sql`
        UPDATE "Order"
        SET 
          "status" = ${status}::"OrderStatus",
          "updatedAt" = NOW()
        WHERE "id" = ${orderId} OR "orderNumber"::text = ${orderId}
      `;
    }
    return true;
  } catch (err) {
    console.error('[DB Update Order Status Error]:', err);
    return false;
  }
}

export async function getDbProducts() {
  const sql = getSql();
  try {
    const products = await sql`
      SELECT 
        id,
        "storeId",
        title,
        COALESCE(category, 'সাধারণ') as category,
        description,
        "basePrice"::float as "basePrice",
        stock,
        "isActive",
        images
      FROM "Product"
      WHERE "isActive" = true
      ORDER BY "createdAt" DESC;
    `;
    return products;
  } catch (err) {
    console.error('[DB Get Products Error]:', err);
    return [];
  }
}

export async function saveDbChatMessage(data: {
  senderId: string;
  customerName?: string;
  sender: 'customer' | 'ai' | 'admin';
  text: string;
  channel?: string;
  productTitle?: string;
  productPrice?: number;
  productImage?: string;
}) {
  const sql = getSql();
  try {
    await initDatabase();
    const id = `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    await sql`
      INSERT INTO "ChatMessage" (
        "id", "senderId", "customerName", "sender", "text", "channel",
        "productTitle", "productPrice", "productImage", "createdAt"
      ) VALUES (
        ${id}, ${data.senderId}, ${data.customerName || null}, ${data.sender}, ${data.text},
        ${data.channel || 'FACEBOOK_MESSENGER'}, ${data.productTitle || null},
        ${data.productPrice || null}, ${data.productImage || null}, NOW()
      );
    `;
    return true;
  } catch (err) {
    console.error('[DB Save Chat Message Error]:', err);
    return false;
  }
}

export async function getDbChatMessagesBySender(senderId: string) {
  const sql = getSql();
  try {
    await initDatabase();
    const rows = await sql`
      SELECT id, "senderId", "customerName", sender, text, channel, "productTitle", "productPrice"::float as "productPrice", "productImage", "createdAt"
      FROM "ChatMessage"
      WHERE "senderId" = ${senderId}
      ORDER BY "createdAt" ASC;
    `;
    return rows;
  } catch (err) {
    console.error('[DB Get Chat Messages Error]:', err);
    return [];
  }
}

export async function getDbChatThreads() {
  const sql = getSql();
  try {
    await initDatabase();
    const rows = await sql`
      SELECT 
        m."senderId",
        m.sender,
        m.text as "lastText",
        m.channel,
        m."productTitle",
        m."productPrice"::float as "productPrice",
        m."productImage",
        m."createdAt" as "lastTime",
        c.name as "c_name",
        c.phone as "c_phone",
        c.address as "c_address"
      FROM "ChatMessage" m
      LEFT JOIN "Customer" c ON (m."senderId" = c.psid OR m."senderId" = c.phone)
      WHERE m.id IN (
        SELECT id FROM (
          SELECT id, ROW_NUMBER() OVER (PARTITION BY "senderId" ORDER BY "createdAt" DESC) as rn
          FROM "ChatMessage"
        ) sub WHERE sub.rn = 1
      )
      ORDER BY m."createdAt" DESC;
    `;
    return rows;
  } catch (err) {
    console.error('[DB Get Chat Threads Error]:', err);
    return [];
  }
}

