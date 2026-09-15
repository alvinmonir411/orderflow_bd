export type OrderStatus =
  | 'PENDING_CONFIRMATION'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'DISPATCHED_TO_COURIER'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURNED';

export type ChannelType = 'FACEBOOK_MESSENGER' | 'WHATSAPP' | 'MANUAL_ENTRY';

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  sku?: string;
  stock: number;
  priceDiff: number;
}

export interface Product {
  id: string;
  title: string;
  description?: string;
  basePrice: number;
  sku?: string;
  stock: number;
  images: string[];
  isActive: boolean;
  variants: ProductVariant[];
  createdAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  product: {
    title: string;
    basePrice: number;
  };
  variantId?: string;
  variant?: {
    name: string;
  };
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  orderNumber: number;
  storeId: string;
  customerId: string;
  channel: ChannelType;
  status: OrderStatus;
  itemsPrice: number;
  deliveryCharge: number;
  discount: number;
  totalPrice: number;
  deliveryAddress: string;
  deliveryCity?: string;
  customerPhone: string;
  customerName: string;
  notes?: string;
  courierProvider?: 'STEADFAST' | 'PATHAO' | 'REDX';
  courierTrackingId?: string;
  consignmentId?: string;
  courierStatus?: string;
  items: OrderItem[];
  createdAt: string;
  customer?: {
    name: string;
    phone: string;
    totalOrders: number;
    deliveryRate: number;
  };
}

export interface DashboardMetrics {
  todayOrders: number;
  pendingCount: number;
  confirmedCount: number;
  dispatchedCount: number;
  deliveredCount: number;
  totalRevenue: number;
  lowStockAlerts: number;
}
