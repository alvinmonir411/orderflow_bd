export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'USER';

export interface User {
  id: string;
  organizationId: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  title?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export type OrganizationStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: 'STARTER' | 'BUSINESS' | 'PRO' | 'ENTERPRISE';
  status?: OrganizationStatus;
  ownerPhone?: string;
  fbPageId?: string;
  fbPageName?: string;
  fbPageToken?: string;
  maxTeamMembers: number;
  maxConversationsPerMonth: number;
  approvedAt?: string;
  approvedBy?: string;
  createdAt: string;
}

export interface AdminOrganization {
  id: string;
  name: string;
  slug: string;
  plan: 'STARTER' | 'BUSINESS' | 'PRO' | 'ENTERPRISE';
  status: OrganizationStatus;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  userCount: number;
  orderCount: number;
  conversationCount: number;
  approvedAt?: string;
  approvedBy?: string;
  createdAt: string;
}

export interface SuperAdminStats {
  totalOrganizations: number;
  pendingApprovals: number;
  activeBusinesses: number;
  suspendedBusinesses: number;
  totalUsers: number;
  totalOrders: number;
  estimatedMRR: number;
}

export type OrderStatus =
  | 'PENDING_CONFIRMATION'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'DISPATCHED_TO_COURIER'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURNED';

export type ChannelType = 'FACEBOOK_MESSENGER' | 'FACEBOOK_COMMENT' | 'WHATSAPP' | 'INSTAGRAM' | 'MANUAL_ENTRY' | 'MANUAL';

export type ConversationStatus = 'OPEN' | 'PENDING' | 'RESOLVED' | 'CLOSED';

export interface InternalNote {
  id: string;
  conversationId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export interface ConversationTimelineEvent {
  id: string;
  conversationId: string;
  actorName: string;
  actionType: 'ASSIGNED' | 'STATUS_CHANGED' | 'TAG_ADDED' | 'TAG_REMOVED' | 'ORDER_CREATED' | 'NOTE_ADDED' | 'MESSAGE_SENT';
  description: string;
  createdAt: string;
}

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
  category?: string;
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
  organizationId?: string;
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
  psid?: string;
  items: OrderItem[];
  createdAt: string;
  customer?: {
    name: string;
    phone: string;
    psid?: string;
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
