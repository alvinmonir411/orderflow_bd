import { neon } from '@neondatabase/serverless';

const DEFAULT_DATABASE_URL =
  'postgresql://neondb_owner:npg_fVreJN50Kauw@ep-billowing-shadow-a5svvtgn-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require';

export function getSql() {
  const connStr = process.env.DATABASE_URL || DEFAULT_DATABASE_URL;
  return neon(connStr);
}

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

    // 3. Check if orders table is empty; if so, seed sample orders including Monir's order
    const orderCountRes = await sql`SELECT COUNT(*)::int as count FROM "Order"`;
    const count = orderCountRes[0]?.count || 0;

    if (count === 0) {
      // Seed Monir's real order from Messenger
      await insertDbOrder({
        customerName: 'monir',
        customerPhone: '01979915165',
        deliveryAddress: 'dhaka',
        deliveryCity: 'ঢাকা',
        channel: 'FACEBOOK_MESSENGER',
        status: 'PENDING_CONFIRMATION',
        itemsPrice: 850,
        deliveryCharge: 120,
        discount: 0,
        productTitle: 'প্রিমিয়াম কাশ্মীরি কুর্তি',
        variantName: 'Size: L (40)',
      });

      // Seed another order
      await insertDbOrder({
        customerName: 'তানিয়া আক্তার',
        customerPhone: '01712345678',
        deliveryAddress: 'মিরপুর-১০, ঢাকা',
        deliveryCity: 'ঢাকা',
        channel: 'FACEBOOK_MESSENGER',
        status: 'PENDING_CONFIRMATION',
        itemsPrice: 1250,
        deliveryCharge: 120,
        discount: 0,
        productTitle: 'জয়পুরি কটন আনস্টিচড থ্রি-পিস',
        variantName: 'Free Size',
      });

      await insertDbOrder({
        customerName: 'তানভীর আহমেদ',
        customerPhone: '01899887766',
        deliveryAddress: 'জিইসি মোড়, নাসিরাবাদ, চট্টগ্রাম',
        deliveryCity: 'চট্টগ্রাম',
        channel: 'WHATSAPP',
        status: 'CONFIRMED',
        itemsPrice: 1250,
        deliveryCharge: 150,
        discount: 70,
        productTitle: 'জয়পুরি কটন আনস্টিচড থ্রি-পিস',
        variantName: 'Free Size',
      });
    }
  } catch (err) {
    console.error('[DB Init Error]:', err);
  }
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
