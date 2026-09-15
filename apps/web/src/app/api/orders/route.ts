import { NextRequest, NextResponse } from 'next/server';

// Global server memory store for live orders (survives requests)
let liveOrders: any[] = [
  {
    id: 'ord-1',
    orderNumber: 101,
    storeId: 'store-1',
    customerId: 'cust-1',
    channel: 'FACEBOOK_MESSENGER',
    status: 'PENDING_CONFIRMATION',
    itemsPrice: 850,
    deliveryCharge: 70,
    totalPrice: 920,
    deliveryAddress: 'বাসা #১২, রোড #৪, সেক্টর ৩, উত্তরা, ঢাকা',
    deliveryCity: 'ঢাকা',
    customerPhone: '01711223344',
    customerName: 'নুসরাত জাহান',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    items: [
      {
        id: 'oi-1',
        orderId: 'ord-1',
        productId: 'prod-1',
        product: { title: 'প্রিমিয়াম কাশ্মীরি কুর্তি (মারুন)', basePrice: 850 },
        variant: { name: 'Size: L (40)' },
        quantity: 1,
        unitPrice: 850,
      },
    ],
    customer: {
      name: 'নুসরাত জাহান',
      phone: '01711223344',
      totalOrders: 3,
      deliveryRate: 100,
    },
  },
  {
    id: 'ord-2',
    orderNumber: 102,
    storeId: 'store-1',
    customerId: 'cust-2',
    channel: 'WHATSAPP',
    status: 'CONFIRMED',
    itemsPrice: 1250,
    deliveryCharge: 80,
    totalPrice: 1330,
    deliveryAddress: 'জিইসি মোড়, নাসিরাবাদ, চট্টগ্রাম',
    deliveryCity: 'চট্টগ্রাম',
    customerPhone: '01899887766',
    customerName: 'তানভীর আহমেদ',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    items: [
      {
        id: 'oi-2',
        orderId: 'ord-2',
        productId: 'prod-2',
        product: { title: 'জয়পুরি কটন আনস্টিচড থ্রি-পিস', basePrice: 1250 },
        variant: { name: 'Free Size' },
        quantity: 1,
        unitPrice: 1250,
      },
    ],
    customer: {
      name: 'তানভীর আহমেদ',
      phone: '01899887766',
      totalOrders: 1,
      deliveryRate: 100,
    },
  },
  {
    id: 'ord-3',
    orderNumber: 103,
    storeId: 'store-1',
    customerId: 'cust-3',
    channel: 'FACEBOOK_MESSENGER',
    status: 'DISPATCHED_TO_COURIER',
    itemsPrice: 850,
    deliveryCharge: 70,
    totalPrice: 920,
    deliveryAddress: 'বাড়ি #২৩, রোড #৭, ধানমন্ডি, ঢাকা',
    deliveryCity: 'ঢাকা',
    customerPhone: '01611002233',
    customerName: 'ফারজানা আক্তার',
    courierProvider: 'STEADFAST',
    courierTrackingId: 'STD-884920',
    consignmentId: 'CID-918234',
    courierStatus: 'IN_TRANSIT',
    createdAt: new Date(Date.now() - 14400000).toISOString(),
    items: [
      {
        id: 'oi-3',
        orderId: 'ord-3',
        productId: 'prod-1',
        product: { title: 'প্রিমিয়াম কাশ্মীরি কুর্তি (মারুন)', basePrice: 850 },
        variant: { name: 'Size: M (38)' },
        quantity: 1,
        unitPrice: 850,
      },
    ],
    customer: {
      name: 'ফারজানা আক্তার',
      phone: '01611002233',
      totalOrders: 5,
      deliveryRate: 100,
    },
  },
];

// Attach to global for serverless persistence
(global as any).__LIVE_ORDERS__ = (global as any).__LIVE_ORDERS__ || liveOrders;

export async function GET() {
  const orders = (global as any).__LIVE_ORDERS__ || liveOrders;
  return NextResponse.json(orders);
}

export async function POST(request: NextRequest) {
  try {
    const newOrder = await request.json();
    const orders = (global as any).__LIVE_ORDERS__ || liveOrders;
    
    // Add new order to the beginning of the list
    orders.unshift(newOrder);
    (global as any).__LIVE_ORDERS__ = orders;

    return NextResponse.json({ success: true, order: newOrder });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { orderId, status, courierProvider, courierTrackingId, consignmentId, courierStatus } = await request.json();
    const orders = (global as any).__LIVE_ORDERS__ || liveOrders;
    const index = orders.findIndex((o: any) => o.id === orderId);

    if (index !== -1) {
      orders[index] = {
        ...orders[index],
        ...(status && { status }),
        ...(courierProvider && { courierProvider }),
        ...(courierTrackingId && { courierTrackingId }),
        ...(consignmentId && { consignmentId }),
        ...(courierStatus && { courierStatus }),
      };
      (global as any).__LIVE_ORDERS__ = orders;
      return NextResponse.json({ success: true, order: orders[index] });
    }

    return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
