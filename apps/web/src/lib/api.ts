import { Order, Product, DashboardMetrics } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Initial Demo/Mock Data for instant interactive UI out of the box
const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    title: 'প্রিমিয়াম কাশ্মীরি কুর্তি (মারুন)',
    description: 'উচ্চমানের লিলেন সুতির তৈরি প্রিমিয়াম কাশ্মীরি কুর্তি',
    basePrice: 850,
    stock: 24,
    images: ['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=500&auto=format&fit=crop&q=60'],
    isActive: true,
    createdAt: new Date().toISOString(),
    variants: [
      { id: 'var-1', productId: 'prod-1', name: 'Size: M (38)', stock: 8, priceDiff: 0 },
      { id: 'var-2', productId: 'prod-1', name: 'Size: L (40)', stock: 12, priceDiff: 0 },
      { id: 'var-3', productId: 'prod-1', name: 'Size: XL (42)', stock: 4, priceDiff: 0 },
    ],
  },
  {
    id: 'prod-2',
    title: 'জয়পুরি কটন আনস্টিচড থ্রি-পিস',
    description: '১০০% পিওর কটন জয়পুরি প্রিন্ট থ্রি-পিস',
    basePrice: 1250,
    stock: 14,
    images: ['https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=500&auto=format&fit=crop&q=60'],
    isActive: true,
    createdAt: new Date().toISOString(),
    variants: [
      { id: 'var-4', productId: 'prod-2', name: 'Free Size', stock: 14, priceDiff: 0 },
    ],
  },
  {
    id: 'prod-3',
    title: 'সিল্ক পার্টি কুর্তি (নেভি ব্লু)',
    description: 'এক্সক্লুসিভ গর্জিয়াস পার্টি কুর্তি',
    basePrice: 1100,
    stock: 3, // Low stock demo
    images: ['https://images.unsplash.com/photo-1618244972963-dbee1a7edc95?w=500&auto=format&fit=crop&q=60'],
    isActive: true,
    createdAt: new Date().toISOString(),
    variants: [
      { id: 'var-5', productId: 'prod-3', name: 'Size: L (40)', stock: 2, priceDiff: 0 },
      { id: 'var-6', productId: 'prod-3', name: 'Size: XL (42)', stock: 1, priceDiff: 0 },
    ],
  },
];

const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-1',
    orderNumber: 101,
    storeId: 'store-1',
    customerId: 'cust-1',
    channel: 'FACEBOOK_MESSENGER',
    status: 'PENDING_CONFIRMATION',
    itemsPrice: 850,
    deliveryCharge: 70,
    discount: 0,
    totalPrice: 920,
    deliveryAddress: 'বাসা #১২, রোড #৪, সেক্টর ৩, উত্তরা, ঢাকা',
    deliveryCity: 'Dhaka',
    customerPhone: '01711223344',
    customerName: 'নুসরাত জাহান',
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
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
    deliveryCharge: 130,
    discount: 50,
    totalPrice: 1330,
    deliveryAddress: 'জিইসি মোড়, নাসিরাবাদ, চট্টগ্রাম',
    deliveryCity: 'Outside Dhaka',
    customerPhone: '01899887766',
    customerName: 'তানভীর আহমেদ',
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    items: [
      {
        id: 'oi-2',
        orderId: 'ord-2',
        productId: 'prod-2',
        product: { title: 'জয়পুরি কটন আনস্টিচড থ্রি-পিস', basePrice: 1250 },
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
    discount: 0,
    totalPrice: 920,
    deliveryAddress: 'হাউজ #২৩, রোড #৭, ধানমন্ডি, ঢাকা',
    deliveryCity: 'Dhaka',
    customerPhone: '01611002233',
    customerName: 'ফারজানা আক্তার',
    courierProvider: 'STEADFAST',
    courierTrackingId: 'STD-884920',
    consignmentId: 'CID-594021',
    courierStatus: 'IN_TRANSIT',
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
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

class StorageApi {
  private getOrdersFromStorage(): Order[] {
    if (typeof window === 'undefined') return INITIAL_ORDERS;
    const stored = localStorage.getItem('orderflow_orders');
    if (!stored) {
      localStorage.setItem('orderflow_orders', JSON.stringify(INITIAL_ORDERS));
      return INITIAL_ORDERS;
    }
    return JSON.parse(stored);
  }

  private saveOrdersToStorage(orders: Order[]) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('orderflow_orders', JSON.stringify(orders));
    }
  }

  private getProductsFromStorage(): Product[] {
    if (typeof window === 'undefined') return INITIAL_PRODUCTS;
    const stored = localStorage.getItem('orderflow_products');
    if (!stored) {
      localStorage.setItem('orderflow_products', JSON.stringify(INITIAL_PRODUCTS));
      return INITIAL_PRODUCTS;
    }
    return JSON.parse(stored);
  }

  private saveProductsToStorage(products: Product[]) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('orderflow_products', JSON.stringify(products));
    }
  }

  async getOrders(): Promise<Order[]> {
    return this.getOrdersFromStorage();
  }

  async getProducts(): Promise<Product[]> {
    return this.getProductsFromStorage();
  }

  async updateOrderStatus(orderId: string, status: Order['status']): Promise<Order> {
    const orders = this.getOrdersFromStorage();
    const index = orders.findIndex((o) => o.id === orderId);
    if (index === -1) throw new Error('Order not found');

    orders[index] = {
      ...orders[index],
      status,
    };

    this.saveOrdersToStorage(orders);
    return orders[index];
  }

  async dispatchSteadfast(orderId: string): Promise<Order> {
    const orders = this.getOrdersFromStorage();
    const index = orders.findIndex((o) => o.id === orderId);
    if (index === -1) throw new Error('Order not found');

    const trackingCode = `STD-${Date.now().toString().slice(-6)}`;
    const consignmentId = `CID-${Math.floor(100000 + Math.random() * 900000)}`;

    orders[index] = {
      ...orders[index],
      status: 'DISPATCHED_TO_COURIER',
      courierProvider: 'STEADFAST',
      courierTrackingId: trackingCode,
      consignmentId: consignmentId,
      courierStatus: 'IN_TRANSIT',
    };

    this.saveOrdersToStorage(orders);
    return orders[index];
  }

  async dispatchPathao(orderId: string): Promise<Order> {
    const orders = this.getOrdersFromStorage();
    const index = orders.findIndex((o) => o.id === orderId);
    if (index === -1) throw new Error('Order not found');

    const trackingCode = `PTH-${Date.now().toString().slice(-6)}`;
    const consignmentId = `PATHAO-${Math.floor(100000 + Math.random() * 900000)}`;

    orders[index] = {
      ...orders[index],
      status: 'DISPATCHED_TO_COURIER',
      courierProvider: 'PATHAO',
      courierTrackingId: trackingCode,
      consignmentId: consignmentId,
      courierStatus: 'PICKUP_REQUESTED',
    };

    this.saveOrdersToStorage(orders);
    return orders[index];
  }

  async createOrder(data: Partial<Order>): Promise<Order> {
    const orders = this.getOrdersFromStorage();
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: (orders[0]?.orderNumber || 100) + 1,
      storeId: 'store-1',
      customerId: `cust-${Date.now()}`,
      channel: data.channel || 'FACEBOOK_MESSENGER',
      status: data.status || 'PENDING_CONFIRMATION',
      itemsPrice: data.itemsPrice || 0,
      deliveryCharge: data.deliveryCharge || 70,
      discount: data.discount || 0,
      totalPrice: data.totalPrice || 0,
      deliveryAddress: data.deliveryAddress || '',
      deliveryCity: data.deliveryCity || 'Dhaka',
      customerPhone: data.customerPhone || '',
      customerName: data.customerName || 'কাস্টমার',
      items: data.items || [],
      createdAt: new Date().toISOString(),
    };

    orders.unshift(newOrder);
    this.saveOrdersToStorage(orders);
    return newOrder;
  }

  async updateProductStock(productId: string, delta: number): Promise<Product> {
    const products = this.getProductsFromStorage();
    const index = products.findIndex((p) => p.id === productId);
    if (index === -1) throw new Error('Product not found');

    products[index] = {
      ...products[index],
      stock: Math.max(0, products[index].stock + delta),
    };

    this.saveProductsToStorage(products);
    return products[index];
  }

  async addProduct(productData: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
    const products = this.getProductsFromStorage();
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    products.unshift(newProduct);
    this.saveProductsToStorage(products);
    return newProduct;
  }

  async getMetrics(): Promise<DashboardMetrics> {
    const orders = this.getOrdersFromStorage();
    const products = this.getProductsFromStorage();

    const pendingCount = orders.filter((o) => o.status === 'PENDING_CONFIRMATION').length;
    const confirmedCount = orders.filter((o) => o.status === 'CONFIRMED').length;
    const dispatchedCount = orders.filter((o) => o.status === 'DISPATCHED_TO_COURIER').length;
    const deliveredCount = orders.filter((o) => o.status === 'DELIVERED').length;
    const totalRevenue = orders
      .filter((o) => !['CANCELLED', 'RETURNED'].includes(o.status))
      .reduce((sum, o) => sum + Number(o.totalPrice), 0);

    const lowStockAlerts = products.filter((p) => p.stock <= 5).length;

    return {
      todayOrders: orders.length,
      pendingCount,
      confirmedCount,
      dispatchedCount,
      deliveredCount,
      totalRevenue,
      lowStockAlerts,
    };
  }
}

export const api = new StorageApi();
