import { neon } from '@neondatabase/serverless';

const DEFAULT_DATABASE_URL =
  'postgresql://neondb_owner:npg_fVreJN50Kauw@ep-billowing-shadow-a5svvtgn-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require';

export function getSql() {
  const connStr = process.env.DATABASE_URL || DEFAULT_DATABASE_URL;
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
        "updatedAt" TIMESTAMP DEFAULT NOW()
      );
    `;

    // Insert default bot settings if empty
    const settingsExist = await sql`SELECT COUNT(*)::int as count FROM "BotSettings" WHERE "id" = 'settings-1'`;
    if ((settingsExist[0]?.count || 0) === 0) {
      await sql`
        INSERT INTO "BotSettings" (
          "id", "storeId", "systemPrompt", "geminiApiKey", "fbPageToken", "fbPageId",
          "deliveryTimeDhaka", "deliveryTimeOutside", "deliveryFeeDhaka", "deliveryFeeOutside",
          "helplinePhone", "returnPolicy", "faqs", "updatedAt"
        ) VALUES (
          'settings-1', 'store-1',
          'You are an intelligent, polite, friendly Bangladeshi F-Commerce AI sales representative for OrderFlow BD.',
          '',
          'EAAiyNmqJWZCkBSUrjkc4ZCraUnG8t9cXtWDgxkNZCnwd1fmP9LhKDWTr8ApzwweRZA2WHzCFHZBGZCBPmECI15GLqUZAjVyxcnErVjcszH07mdbYU6lA2l2ibDdLKZCLhZADDCXbhQeaP5Bac9xUp7BrR9WnYqMw9hgfl9k7dlxSdaPAcDFTxkqkrSV3X1ZAseJOsFbixCJu4VEgZDZD',
          '1314475555081210',
          '২৪ থেকে ৪৮ ঘণ্টা (১-২ দিন)',
          '২ থেকে ৩ কার্যদিবস',
          120,
          150,
          '01700000000',
          'পণ্য হাতে পেয়ে চেক করে নেওয়ার সুবিধা এবং ৩ দিনের মধ্যে ফ্রি সাইজ পরিবর্তন।',
          ${JSON.stringify(DEFAULT_FAQS)}::jsonb,
          NOW()
        );
      `;
    }
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
        fbPageId: row.fbPageId || '1314475555081210',
        deliveryTimeDhaka: row.deliveryTimeDhaka || '২৪ থেকে ৪৮ ঘণ্টা (১-২ দিন)',
        deliveryTimeOutside: row.deliveryTimeOutside || '২ থেকে ৩ কার্যদিবস',
        deliveryFeeDhaka: Number(row.deliveryFeeDhaka) || 120,
        deliveryFeeOutside: Number(row.deliveryFeeOutside) || 150,
        helplinePhone: row.helplinePhone || '01700000000',
        returnPolicy: row.returnPolicy || 'পণ্য হাতে পেয়ে চেক করে নেওয়ার সুবিধা এবং ৩ দিনের মধ্যে ফ্রি সাইজ পরিবর্তন।',
        faqs: (row.faqs as BotFaqItem[]) || DEFAULT_FAQS,
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
    fbPageId: '1314475555081210',
    deliveryTimeDhaka: '২৪ থেকে ৪৮ ঘণ্টা (১-২ দিন)',
    deliveryTimeOutside: '২ থেকে ৩ কার্যদিবস',
    deliveryFeeDhaka: 120,
    deliveryFeeOutside: 150,
    helplinePhone: '01700000000',
    returnPolicy: 'পণ্য হাতে পেয়ে চেক করে নেওয়ার সুবিধা এবং ৩ দিনের মধ্যে ফ্রি সাইজ পরিবর্তন।',
    faqs: DEFAULT_FAQS,
  };
}

export async function updateBotSettings(data: {
  systemPrompt?: string;
  geminiApiKey?: string;
  fbPageToken?: string;
  fbPageId?: string;
  deliveryTimeDhaka?: string;
  deliveryTimeOutside?: string;
  deliveryFeeDhaka?: number;
  deliveryFeeOutside?: number;
  helplinePhone?: string;
  returnPolicy?: string;
  faqs?: BotFaqItem[];
}) {
  const sql = getSql();
  try {
    await initDatabase();
    const current = await getBotSettings();

    const systemPrompt = data.systemPrompt !== undefined ? data.systemPrompt : current.systemPrompt;
    const geminiApiKey = data.geminiApiKey !== undefined ? data.geminiApiKey : current.geminiApiKey;
    const fbPageToken = data.fbPageToken !== undefined ? data.fbPageToken : current.fbPageToken;
    const fbPageId = data.fbPageId !== undefined ? data.fbPageId : current.fbPageId;
    const deliveryTimeDhaka = data.deliveryTimeDhaka !== undefined ? data.deliveryTimeDhaka : current.deliveryTimeDhaka;
    const deliveryTimeOutside = data.deliveryTimeOutside !== undefined ? data.deliveryTimeOutside : current.deliveryTimeOutside;
    const deliveryFeeDhaka = data.deliveryFeeDhaka !== undefined ? data.deliveryFeeDhaka : current.deliveryFeeDhaka;
    const deliveryFeeOutside = data.deliveryFeeOutside !== undefined ? data.deliveryFeeOutside : current.deliveryFeeOutside;
    const helplinePhone = data.helplinePhone !== undefined ? data.helplinePhone : current.helplinePhone;
    const returnPolicy = data.returnPolicy !== undefined ? data.returnPolicy : current.returnPolicy;
    const faqs = data.faqs !== undefined ? data.faqs : current.faqs;

    await sql`
      INSERT INTO "BotSettings" (
        "id", "storeId", "systemPrompt", "geminiApiKey", "fbPageToken", "fbPageId",
        "deliveryTimeDhaka", "deliveryTimeOutside", "deliveryFeeDhaka", "deliveryFeeOutside",
        "helplinePhone", "returnPolicy", "faqs", "updatedAt"
      ) VALUES (
        'settings-1', 'store-1', ${systemPrompt}, ${geminiApiKey}, ${fbPageToken}, ${fbPageId},
        ${deliveryTimeDhaka}, ${deliveryTimeOutside}, ${deliveryFeeDhaka}, ${deliveryFeeOutside},
        ${helplinePhone}, ${returnPolicy}, ${JSON.stringify(faqs)}::jsonb, NOW()
      )
      ON CONFLICT ("id")
      DO UPDATE SET
        "systemPrompt" = EXCLUDED."systemPrompt",
        "geminiApiKey" = EXCLUDED."geminiApiKey",
        "fbPageToken" = EXCLUDED."fbPageToken",
        "fbPageId" = EXCLUDED."fbPageId",
        "deliveryTimeDhaka" = EXCLUDED."deliveryTimeDhaka",
        "deliveryTimeOutside" = EXCLUDED."deliveryTimeOutside",
        "deliveryFeeDhaka" = EXCLUDED."deliveryFeeDhaka",
        "deliveryFeeOutside" = EXCLUDED."deliveryFeeOutside",
        "helplinePhone" = EXCLUDED."helplinePhone",
        "returnPolicy" = EXCLUDED."returnPolicy",
        "faqs" = EXCLUDED."faqs",
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
  deliveryCharge: number;
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
    const totalPrice = data.itemsPrice + data.deliveryCharge - discount;
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

