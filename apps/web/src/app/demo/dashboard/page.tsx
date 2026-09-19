'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Zap,
  ShoppingBag,
  Clock,
  Truck,
  Sparkles,
  Bot,
  CheckCircle2,
  TrendingUp,
  BarChart3,
  Layers,
  ArrowRight,
  Printer,
  MessageCircle,
  MessageSquare,
  ShieldCheck,
  Search,
  ExternalLink,
  PhoneCall,
  MapPin,
  RefreshCw,
  Copy,
  Check,
  Send,
  User,
  RotateCcw,
  Sliders,
  DollarSign,
  PackageCheck,
  Store,
  Eye,
  Menu,
  X,
  LayoutDashboard,
  Boxes,
  Crown,
  Briefcase,
  Headphones,
  LogOut,
  Package,
  PlusCircle,
  ArrowUpRight,
  CheckCheck,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { toast } from 'sonner';
import { formatBDTEn } from '@/lib/utils';
import { Order, OrderStatus } from '@/lib/types';
import { InvoiceModal } from '@/components/orders/InvoiceModal';

// 7-day realistic sales trend for AreaChart
const DEMO_CHART_DATA = [
  { name: 'শনি', sales: 32400, orders: 24 },
  { name: 'রবি', sales: 41200, orders: 31 },
  { name: 'সোম', sales: 38900, orders: 28 },
  { name: 'মঙ্গল', sales: 45600, orders: 35 },
  { name: 'বুধ', sales: 42100, orders: 32 },
  { name: 'বৃহঃ', sales: 51800, orders: 41 },
  { name: 'শুক্র', sales: 48250, orders: 38 },
];

// Rich, realistic Bangladeshi demo orders
const INITIAL_DEMO_ORDERS: Order[] = [
  {
    id: 'ord-1',
    orderNumber: 8941,
    storeId: 'demo-store-1',
    customerId: 'cust-1',
    customerName: 'তানভীর আহমেদ',
    customerPhone: '01712-334455',
    deliveryAddress: 'বাড়ি ২৪, রোড ৭, ব্লক-সি, মিরপুর-১০, ঢাকা',
    deliveryCity: 'Dhaka',
    channel: 'FACEBOOK_MESSENGER',
    status: 'DELIVERED',
    itemsPrice: 1750,
    deliveryCharge: 100,
    discount: 0,
    totalPrice: 1850,
    courierStatus: 'ডেলিভার্ড ও ক্যাশ কালেক্টেড',
    createdAt: '2026-09-18T09:15:00.000Z',
    items: [
      {
        id: 'item-1',
        orderId: 'ord-1',
        productId: 'p-1',
        product: { title: 'প্রিমিয়াম কাশ্মীরি কটন কাবলি সেট', basePrice: 1750 },
        variant: { name: 'সাইজ: XL (Navy Blue)' },
        quantity: 1,
        unitPrice: 1750,
      },
    ],
  },
  {
    id: 'ord-2',
    orderNumber: 8940,
    storeId: 'demo-store-1',
    customerId: 'cust-2',
    customerName: 'সাবরিনা ইসলাম',
    customerPhone: '01823-998877',
    deliveryAddress: 'ফ্ল্যাট ৪বি, বাড়ি ১২, রোড ৪/এ, ধানমন্ডি, ঢাকা',
    deliveryCity: 'Dhaka',
    channel: 'FACEBOOK_MESSENGER',
    status: 'IN_TRANSIT',
    itemsPrice: 2320,
    deliveryCharge: 80,
    discount: 0,
    totalPrice: 2400,
    courierStatus: 'ডেলিভারি চলমান (ইন-ট্রানজিট)',
    createdAt: '2026-09-18T10:02:00.000Z',
    items: [
      {
        id: 'item-2',
        orderId: 'ord-2',
        productId: 'p-2',
        product: { title: 'জয়পুরি সিল্ক এমব্রয়ডারি থ্রি-পিস', basePrice: 2320 },
        variant: { name: 'আনস্টিচড (Emerald Green)' },
        quantity: 1,
        unitPrice: 2320,
      },
    ],
  },
  {
    id: 'ord-3',
    orderNumber: 8939,
    storeId: 'demo-store-1',
    customerId: 'cust-3',
    customerName: 'আরিফ হোসেন',
    customerPhone: '01911-223344',
    deliveryAddress: 'হোল্ডিং ৪৫, সেন্ট্রাল প্লাজা রোড, জিইসি মোড়, চট্টগ্রাম',
    deliveryCity: 'Chittagong',
    channel: 'FACEBOOK_MESSENGER',
    status: 'CONFIRMED',
    itemsPrice: 1080,
    deliveryCharge: 120,
    discount: 0,
    totalPrice: 1200,
    courierStatus: 'অর্ডার প্রস্তুত হচ্ছে',
    createdAt: '2026-09-18T10:45:00.000Z',
    items: [
      {
        id: 'item-3',
        orderId: 'ord-3',
        productId: 'p-3',
        product: { title: 'হ্যান্ডক্রাফটেড জেনুইন লেদার ওয়ালেট', basePrice: 1080 },
        variant: { name: 'কালার: Vintage Brown' },
        quantity: 1,
        unitPrice: 1080,
      },
    ],
  },
  {
    id: 'ord-4',
    orderNumber: 8938,
    storeId: 'demo-store-1',
    customerId: 'cust-4',
    customerName: 'ফারহানা চৌধুরী',
    customerPhone: '01633-887766',
    deliveryAddress: 'রোড ২, ব্লক ডি, উপশহর, সিলেট',
    deliveryCity: 'Sylhet',
    channel: 'WHATSAPP',
    status: 'CONFIRMED',
    itemsPrice: 1420,
    deliveryCharge: 130,
    discount: 0,
    totalPrice: 1550,
    courierStatus: 'কনফার্মড',
    createdAt: '2026-09-18T11:10:00.000Z',
    items: [
      {
        id: 'item-4',
        orderId: 'ord-4',
        productId: 'p-4',
        product: { title: 'অর্গানিক হারবাল হেয়ার কেয়ার কম্বো', basePrice: 1420 },
        variant: { name: 'প্যাক: Oil + Shampoo 250ml' },
        quantity: 1,
        unitPrice: 1420,
      },
    ],
  },
  {
    id: 'ord-5',
    orderNumber: 8937,
    storeId: 'demo-store-1',
    customerId: 'cust-5',
    customerName: 'মেহজাবিন নূর',
    customerPhone: '01799-445566',
    deliveryAddress: 'হাউজ ১৮, রোড ১১৩, গুলশান-২, ঢাকা',
    deliveryCity: 'Dhaka',
    channel: 'FACEBOOK_MESSENGER',
    status: 'DELIVERED',
    itemsPrice: 2850,
    deliveryCharge: 100,
    discount: 0,
    totalPrice: 2950,
    courierStatus: 'ডেলিভার্ড ও ক্যাশ কালেক্টেড',
    createdAt: '2026-09-18T08:30:00.000Z',
    items: [
      {
        id: 'item-5',
        orderId: 'ord-5',
        productId: 'p-5',
        product: { title: 'স্মার্ট ফিটনেস ব্যান্ড Watch Pro', basePrice: 2850 },
        variant: { name: 'কালো সিলিকন স্ট্র্যাপ' },
        quantity: 1,
        unitPrice: 2850,
      },
    ],
  },
  {
    id: 'ord-6',
    orderNumber: 8936,
    storeId: 'demo-store-1',
    customerId: 'cust-6',
    customerName: 'কামরুল হাসান',
    customerPhone: '01552-112233',
    deliveryAddress: 'মেইন রোড, সোনাডাঙ্গা আবাসিক এলাকা, খুলনা',
    deliveryCity: 'Khulna',
    channel: 'FACEBOOK_MESSENGER',
    status: 'PENDING_CONFIRMATION',
    itemsPrice: 1320,
    deliveryCharge: 130,
    discount: 0,
    totalPrice: 1450,
    createdAt: '2026-09-18T11:42:00.000Z',
    items: [
      {
        id: 'item-6',
        orderId: 'ord-6',
        productId: 'p-6',
        product: { title: 'এক্সক্লুসিভ স্লিম-ফিট ফর্মাল শার্ট', basePrice: 1320 },
        variant: { name: 'সাইজ: 42 (Sky Blue)' },
        quantity: 1,
        unitPrice: 1320,
      },
    ],
  },
  {
    id: 'ord-7',
    orderNumber: 8935,
    storeId: 'demo-store-1',
    customerId: 'cust-7',
    customerName: 'নুসরাত জাহান তানিয়া',
    customerPhone: '01844-556677',
    deliveryAddress: 'সেক্টর ৭, রোড ৩, উত্তরা, ঢাকা',
    deliveryCity: 'Dhaka',
    channel: 'FACEBOOK_MESSENGER',
    status: 'IN_TRANSIT',
    itemsPrice: 1950,
    deliveryCharge: 70,
    discount: 0,
    totalPrice: 2020,
    courierStatus: 'ডেলিভারি চলমান',
    createdAt: '2026-09-18T09:40:00.000Z',
    items: [
      {
        id: 'item-7',
        orderId: 'ord-7',
        productId: 'p-7',
        product: { title: 'ডিজাইনার জর্জেট পার্টি ওড়না ও গাউন সেট', basePrice: 1950 },
        variant: { name: 'কালার: Maroon Red (Free Size)' },
        quantity: 1,
        unitPrice: 1950,
      },
    ],
  },
];

interface DemoChatMessage {
  sender: 'bot' | 'user' | string;
  text: string;
  quickReplies?: string[];
  time: string;
}

const INITIAL_BOT_MSGS: DemoChatMessage[] = [
  {
    sender: 'bot',
    text: 'আসসালামু আলাইকুম! Moner Kotha Fashion-এ আপনাকে স্বাগতম। 🌸\nআমি আপনার ব্যক্তিগত AI সেলস অ্যাসিস্ট্যান্ট।\nআমাদের স্পেশাল কালেকশন দেখতে পারেন অথবা যেকোনো প্রশ্ন জিজ্ঞেস করুন 👇',
    quickReplies: [
      'কি কি প্রোডাক্ট আছে?',
      'জয়পুরি থ্রি-পিসের দাম কত?',
      'ডেলিভারি চার্জ কত?',
      'অর্ডার করতে চাই',
    ],
    time: '১০:০০ AM',
  },
];

export default function DemoDashboardPage() {
  const [activeNav, setActiveNav] = useState<'overview' | 'messages' | 'orders' | 'products' | 'bot'>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>(INITIAL_DEMO_ORDERS);
  const [orderFilter, setOrderFilter] = useState<'ALL' | 'PENDING' | 'CONFIRMED' | 'IN_TRANSIT' | 'DELIVERED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // AI Chat simulation state
  const [chatMessages, setChatMessages] = useState<DemoChatMessage[]>(INITIAL_BOT_MSGS);
  const [userInput, setUserInput] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);

  // Dynamic Metrics computed from current orders state
  const metrics = useMemo(() => {
    const todayOrders = orders.length;
    const pendingCount = orders.filter((o) => o.status === 'PENDING_CONFIRMATION').length;
    const dispatchedCount = orders.filter((o) => o.status === 'IN_TRANSIT' || o.status === 'DISPATCHED_TO_COURIER').length;
    const deliveredCount = orders.filter((o) => o.status === 'DELIVERED').length;
    const totalSales = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0) + 38400;

    return {
      todayOrders,
      pendingCount,
      dispatchedCount,
      deliveredCount,
      totalSales,
      autoRate: '৯৪.২%',
    };
  }, [orders]);

  // Filtered orders for table
  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      if (orderFilter === 'PENDING' && ord.status !== 'PENDING_CONFIRMATION') return false;
      if (orderFilter === 'CONFIRMED' && ord.status !== 'CONFIRMED' && ord.status !== 'PROCESSING') return false;
      if (orderFilter === 'IN_TRANSIT' && ord.status !== 'IN_TRANSIT' && ord.status !== 'DISPATCHED_TO_COURIER') return false;
      if (orderFilter === 'DELIVERED' && ord.status !== 'DELIVERED') return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = ord.customerName.toLowerCase().includes(query);
        const matchesPhone = ord.customerPhone.includes(query);
        const matchesOrder = ord.orderNumber.toString().includes(query);
        const matchesProduct = ord.items.some((it) => it.product.title.toLowerCase().includes(query));
        return matchesName || matchesPhone || matchesOrder || matchesProduct;
      }

      return true;
    });
  }, [orders, orderFilter, searchQuery]);

  const handleRefreshData = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success('ড্যাশবোর্ড মেট্রিক্স সফলভাবে রিফ্রেশ হয়েছে!');
    }, 400);
  };

  // 1-Click Order State Transitions
  const handleConfirmOrder = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'CONFIRMED' } : o))
    );
    toast.success('অর্ডার কনফার্ম করা হয়েছে! এবার ডেলিভারির জন্য পাঠাতে পারেন।');
  };

  const handleDispatchDelivery = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: 'IN_TRANSIT',
              courierStatus: 'ডেলিভারি চলমান (ইন-ট্রানজিট)',
            }
          : o
      )
    );
    toast.success('অর্ডারটি ডেলিভারির জন্য পাঠানো হয়েছে (ইন-ট্রানজিট)!');
  };

  const handleMarkDelivered = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, status: 'DELIVERED', courierStatus: 'ডেলিভার্ড ও ক্যাশ কালেক্টেড' }
          : o
      )
    );
    toast.success('ডেলিভারি সফল ও ক্যাশ কালেকশন কনফার্মড! 🎉');
  };

  // Intelligent Dynamic AI Chat Simulator connected to /api/demo/chat
  const handleSendChatMessage = async (textToSend?: string) => {
    const text = textToSend || userInput;
    if (!text.trim() || isBotTyping) return;

    const userMsg: DemoChatMessage = {
      sender: 'user',
      text,
      time: 'এখন',
    };

    setChatMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setUserInput('');
    setIsBotTyping(true);

    try {
      const res = await fetch('/api/demo/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: [...chatMessages, userMsg].map((m) => ({ sender: m.sender, text: m.text })),
        }),
      });

      const data = await res.json();
      const botReply = data.reply || 'ধন্যবাদ আপনার মেসেজের জন্য! আমাদের সেলস টিম খুব দ্রুত এটি প্রসেস করছে।';
      const quickReplies = data.quickReplies;

      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: botReply,
          quickReplies,
          time: 'এখন',
        },
      ]);

      // If customer confirmed order by providing phone & address
      if (data.orderCreated && data.orderData) {
        const newOrderNum = 8942 + Math.floor(Math.random() * 50);
        const newOrder: Order = {
          id: `ord-${Date.now()}`,
          orderNumber: newOrderNum,
          storeId: 'demo-store-1',
          customerId: `cust-${Date.now()}`,
          customerName: data.orderData.customerName || 'সম্মানিত কাস্টমার',
          customerPhone: data.orderData.customerPhone || '01712-334455',
          deliveryAddress: data.orderData.deliveryAddress || 'মিরপুর-১০, ঢাকা',
          deliveryCity: 'Dhaka',
          channel: 'FACEBOOK_MESSENGER',
          status: 'PENDING_CONFIRMATION',
          itemsPrice: data.orderData.itemsPrice || 1250,
          deliveryCharge: data.orderData.deliveryCharge || 70,
          discount: 0,
          totalPrice: data.orderData.totalPrice || 1320,
          courierStatus: 'অর্ডার প্রস্তুত হচ্ছে',
          createdAt: new Date().toISOString(),
          items: [
            {
              id: `item-${Date.now()}`,
              orderId: `ord-${Date.now()}`,
              productId: 'p-2',
              product: {
                title: data.orderData.productTitle || 'জয়পুরি কটন আনস্টিচড থ্রি-পিস',
                basePrice: 1250,
              },
              variant: { name: '১০০% সুতি (Free Size)' },
              quantity: 1,
              unitPrice: 1250,
            },
          ],
        };

        setOrders((prev) => [newOrder, ...prev]);
        toast.success(`🎉 এআই মেসেঞ্জার চ্যাট থেকে নতুন অর্ডার #OF-${newOrderNum} সিস্টেমে যুক্ত হয়েছে!`);
      }
    } catch (err) {
      // Fallback
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: 'ধন্যবাদ! আমাদের সেলস অ্যাসিস্ট্যান্ট আপনার সাথে আছে। জয়পুরি থ্রি-পিস, কাশ্মীরি কুর্তি বা গাউন সম্পর্কে যেকোনো প্রশ্ন করুন। 😊',
          quickReplies: ['কি কি প্রোডাক্ট আছে?', 'দাম কত?', 'অর্ডার করব'],
          time: 'এখন',
        },
      ]);
    } finally {
      setIsBotTyping(false);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'DELIVERED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" /> ডেলিভার্ড
          </span>
        );
      case 'IN_TRANSIT':
      case 'DISPATCHED_TO_COURIER':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
            <Truck className="w-3 h-3" /> ইন-ট্রানজিট
          </span>
        );
      case 'PROCESSING':
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30">
            <Bot className="w-3 h-3" /> কনফার্মড
          </span>
        );
      case 'PENDING_CONFIRMATION':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Clock className="w-3 h-3" /> পেন্ডিং
          </span>
        );
    }
  };

  const navigationItems = [
    {
      id: 'overview',
      name: 'ড্যাশবোর্ড',
      sub: 'Overview & Metrics',
      icon: LayoutDashboard,
      gradient: 'from-emerald-500/20 to-teal-500/10',
    },
    {
      id: 'messages',
      name: 'মেসেঞ্জার লাইভ চ্যাট',
      sub: 'Facebook Live Chat Hub',
      icon: MessageSquare,
      badge: 'CRM Hub',
      badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      gradient: 'from-blue-500/20 to-indigo-500/10',
    },
    {
      id: 'orders',
      name: 'অর্ডার সমূহ',
      sub: '5-Step Pipeline & Sync',
      icon: ShoppingBag,
      badge: `${orders.length} Orders`,
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      gradient: 'from-emerald-500/20 to-teal-500/10',
    },
    {
      id: 'products',
      name: 'প্রোডাক্ট ও স্টক',
      sub: 'Inventory & Variants',
      icon: Boxes,
      badge: '৪টি পণ্য',
      badgeColor: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
      gradient: 'from-teal-500/20 to-cyan-500/10',
    },
    {
      id: 'bot',
      name: 'এআই সেলস বট সেটিংস',
      sub: 'Google Gemini Studio',
      icon: Bot,
      highlight: true,
      badge: 'Gemini AI',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      gradient: 'from-indigo-500/20 to-purple-500/10',
    },
  ];

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* 1. Global Sticky Demo Announcement Bar */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-emerald-950/95 via-[#0c141d]/95 to-teal-950/95 border-b border-emerald-500/30 backdrop-blur-md px-4 py-2 shadow-lg">
        <div className="max-w-[1700px] mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-bold text-emerald-300">OrderFlow BD ডেমো সেশন</span>
            <span className="hidden sm:inline text-slate-400">|</span>
            <span className="hidden sm:inline text-slate-300">
              অরিজিনাল ড্যাশবোর্ড প্রিভিউ মোড — কোনো পাসওয়ার্ড ছাড়াই সম্পূর্ণ প্ল্যাটফর্ম টেস্ট করুন
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/register"
              className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-neutral-950 font-black rounded-xl text-xs transition-all shadow-sm active:scale-95 flex items-center gap-1"
            >
              <span>রিয়েল একাউন্ট খুলুন</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
            <Link
              href="/login"
              className="px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 rounded-xl text-xs font-bold transition-all"
            >
              লগইন পেজ
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Main Full Layout with Left Sidebar matching Original Dashboard */}
      <div className="flex flex-1 min-h-0 w-full relative">
        {/* Mobile Backdrop Overlay */}
        {isSidebarOpen && (
          <div
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          />
        )}

        {/* The Authentic OrderFlow Left Sidebar */}
        <aside
          className={`fixed lg:sticky top-[41px] left-0 z-40 h-[calc(100vh-41px)] w-72 bg-[#0d0f17]/95 backdrop-blur-2xl border-r border-neutral-800/80 flex flex-col shrink-0 transition-transform duration-300 ease-in-out ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          {/* Brand Logo & Glow */}
          <div className="p-5 border-b border-neutral-800/80 relative overflow-hidden">
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center gap-3 relative z-10 group cursor-pointer" onClick={() => setActiveNav('overview')}>
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 flex items-center justify-center text-neutral-950 font-black shadow-lg shadow-emerald-500/25 group-hover:scale-105 transition-transform duration-300">
                <Zap className="w-5 h-5 fill-neutral-950 text-neutral-950" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="font-extrabold text-lg text-neutral-100 tracking-tight">OrderFlow</h1>
                  <span className="px-1.5 py-0.5 text-[10px] font-black bg-gradient-to-r from-emerald-400 to-teal-300 text-neutral-950 rounded-md shadow-sm">
                    DEMO 2.0
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 font-medium tracking-wide">
                  F-Commerce Automation
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 p-3.5 space-y-1.5 overflow-y-auto">
            <p className="px-3 text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>মূল মেনু</span>
              <span className="text-[10px] text-emerald-400 font-mono font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                DEMO MODE
              </span>
            </p>

            {navigationItems.map((item) => {
              const isActive = activeNav === item.id;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveNav(item.id as any);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full text-left relative flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-medium transition-all group overflow-hidden border cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-500/15 via-emerald-500/10 to-transparent text-emerald-300 border-emerald-500/30 shadow-lg shadow-emerald-500/5'
                      : 'text-neutral-300 hover:text-neutral-100 hover:bg-neutral-800/40 border-transparent'
                  } ${item.highlight && !isActive ? 'text-indigo-300 hover:bg-indigo-500/10 border-indigo-500/10' : ''}`}
                >
                  {/* Active Indicator bar */}
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-7 bg-gradient-to-b from-emerald-400 to-teal-400 rounded-r-full" />
                  )}

                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-xl border transition-all duration-300 group-hover:scale-110 ${
                        isActive
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 shadow-sm'
                          : 'bg-neutral-850/60 text-neutral-400 border-neutral-750/50 group-hover:text-neutral-200 group-hover:border-neutral-600'
                      } ${item.highlight && !isActive ? 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' : ''}`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-semibold block text-sm leading-snug">{item.name}</span>
                      <span className="text-[10px] text-neutral-400 block font-normal leading-tight">
                        {item.sub}
                      </span>
                    </div>
                  </div>

                  {item.badge && (
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-full border shadow-sm ${
                        item.badgeColor || 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Demo Store Profile Box */}
          <div className="p-3.5 m-3 bg-[#0a0d16] border border-neutral-800/90 rounded-2xl relative overflow-hidden shadow-lg space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-sm shrink-0">
                  MK
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate leading-tight">Moner Kotha</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Crown className="w-2.5 h-2.5 text-emerald-400" />
                    <span className="text-[10px] text-slate-400 font-mono">Pro Plan (Demo)</span>
                  </div>
                </div>
              </div>

              <Link
                href="/register"
                title="রিয়েল অ্যাকাউন্ট তৈরি করুন"
                className="p-1.5 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 rounded-xl transition-all"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </aside>

        {/* 3. Main Dashboard Content Container */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header Navbar */}
          <header className="sticky top-[41px] z-30 bg-[#090b12]/90 backdrop-blur-xl border-b border-neutral-800/80 px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Mobile Hamburger Toggle */}
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden p-2 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors"
              >
                {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black text-white">Moner Kotha Fashion</h2>
                  <span className="hidden sm:inline-block px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold rounded-full">
                    ডেমো স্টোর • Pro Plan
                  </span>
                </div>
                <p className="text-xs text-slate-400 hidden sm:block">
                  সেন্ট্রালাইজড অর্ডার অটোমেশন ও AI সেলস প্ল্যাটফর্ম
                </p>
              </div>
            </div>

            {/* Quick Status Badges & CTAs */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden xl:flex items-center gap-2">
                <div className="px-2.5 py-1 bg-slate-900/80 border border-emerald-500/30 rounded-xl flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>ক্যাশ অন ডেলিভারি (COD)</span>
                </div>
                <div className="px-2.5 py-1 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center gap-1.5 text-xs text-indigo-300">
                  <Bot className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Gemini 2.5 Flash</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setActiveNav('bot');
                  toast.success('AI সেলস বট সিমুলেটরে স্বাগতম! নিচে যেকোনো মেসেজ লিখে পরীক্ষা করুন।');
                }}
                className="px-3 py-1.5 bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Bot className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden md:inline">AI বট টেস্ট করুন</span>
              </button>

              <button
                onClick={handleRefreshData}
                className="p-2 bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-750 rounded-xl transition-all cursor-pointer"
                title="রিফ্রেশ করুন"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
              </button>

              <Link
                href="/register"
                className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-neutral-950 font-black rounded-xl text-xs transition-all shadow-md active:scale-95 flex items-center gap-1"
              >
                <span>রেজিস্ট্রেশন</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </header>

          {/* Main Body per Active Nav Item */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] w-full mx-auto">
            {/* ---------------------------------------------------- */}
            {/* VIEW 1: OVERVIEW & METRICS (MATCHING ORIGINAL DASHBOARD) */}
            {/* ---------------------------------------------------- */}
            {activeNav === 'overview' && (
              <div className="space-y-6">
                {/* Hero Banner with Ambient Mesh Lighting */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0c1220]/95 via-[#080d18]/95 to-[#04060c]/95 p-6 sm:p-8 border border-slate-800/80 shadow-[0_20px_50px_rgba(0,0,0,0.7)] backdrop-blur-2xl">
                  <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/15 rounded-full blur-[100px] pointer-events-none" />
                  <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/15 rounded-full blur-[100px] pointer-events-none" />

                  <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                    <div className="space-y-2.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold rounded-full shadow-inner">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                          </span>
                          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                          <span>AI সেলস অটোমেশন সক্রিয়</span>
                        </div>

                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-bold rounded-full shadow-inner">
                          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                          <span>স্মার্ট ফ্রড প্রটেকশন</span>
                        </div>
                      </div>

                      <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                        স্বাগতম,{' '}
                        <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                          Moner Kotha Fashion!
                        </span>{' '}
                        👋
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
                        মেসেঞ্জার ও ফেসবুকে আপনার স্মার্ট Gemini AI সেলস বট ২৪ ঘণ্টা কাস্টমারদের সাথে কথা বলছে, ড্রেসের দাম ও ছবি দেখাচ্ছে এবং নিখুঁত ফোন নম্বর ও ঠিকানা নিয়ে সরাসরি ড্যাশবোর্ডে অর্ডার যোগ করছে।
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                      <button
                        onClick={() => setActiveNav('bot')}
                        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-lg shadow-indigo-600/25 active:scale-95 transition-all cursor-pointer"
                      >
                        <Bot className="w-4 h-4" />
                        <span>AI বট টেস্ট করুন</span>
                      </button>

                      <button
                        onClick={() => setActiveNav('orders')}
                        className="flex items-center gap-2 px-4 py-2.5 bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/70 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer"
                      >
                        <ShoppingBag className="w-4 h-4 text-emerald-400" />
                        <span>সকল অর্ডার ({orders.length})</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* 6 Key Business Metrics KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
                  {/* Card 1: Today's Orders */}
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0e1422] to-[#080d16] border border-emerald-500/25 p-4 space-y-2 shadow-xl hover:border-emerald-500/40 transition-all group">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        আজকের অর্ডার
                      </span>
                      <div className="w-7 h-7 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Package className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight flex items-baseline gap-1">
                        <span>{metrics.todayOrders}</span>
                        <span className="text-xs font-semibold text-slate-400 font-sans">টি</span>
                      </div>
                      <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        <span>রিয়েল-টাইম সিঙ্ক</span>
                      </p>
                    </div>
                    <div className="w-full h-1 bg-slate-800 rounded-full mt-2 overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: '100%' }} />
                    </div>
                  </div>

                  {/* Card 2: Pending Orders */}
                  <div
                    onClick={() => {
                      setActiveNav('orders');
                      setOrderFilter('PENDING');
                    }}
                    className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#18140f] to-[#0e0c08] border border-amber-500/25 p-4 space-y-2 shadow-xl hover:border-amber-500/50 transition-all group cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        পেন্ডিং অর্ডার
                      </span>
                      <div className="w-7 h-7 bg-amber-500/15 border border-amber-500/30 text-amber-400 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Clock className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono tracking-tight flex items-baseline gap-1">
                        <span>{metrics.pendingCount}</span>
                        <span className="text-xs font-semibold text-slate-400 font-sans">টি</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">১-ক্লিক কনফার্ম করুন →</p>
                    </div>
                    <div className="w-full h-1 bg-slate-800 rounded-full mt-2 overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full" style={{ width: '35%' }} />
                    </div>
                  </div>

                  {/* Card 3: In Transit */}
                  <div
                    onClick={() => {
                      setActiveNav('orders');
                      setOrderFilter('IN_TRANSIT');
                    }}
                    className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#161022] to-[#0c0915] border border-purple-500/25 p-4 space-y-2 shadow-xl hover:border-purple-500/50 transition-all group cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        ডেলিভারি চলমান
                      </span>
                      <div className="w-7 h-7 bg-purple-500/15 border border-purple-500/30 text-purple-400 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Truck className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight flex items-baseline gap-1">
                        <span>{metrics.dispatchedCount}</span>
                        <span className="text-xs font-semibold text-slate-400 font-sans">টি</span>
                      </div>
                      <p className="text-[11px] text-purple-300 mt-1">ক্যাশ অন ডেলিভারি (COD)</p>
                    </div>
                    <div className="w-full h-1 bg-slate-800 rounded-full mt-2 overflow-hidden">
                      <div className="h-full bg-purple-400 rounded-full" style={{ width: '60%' }} />
                    </div>
                  </div>

                  {/* Card 4: Delivered */}
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0c1816] to-[#070e0d] border border-teal-500/25 p-4 space-y-2 shadow-xl group">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        সফল ডেলিভারি
                      </span>
                      <div className="w-7 h-7 bg-teal-500/15 border border-teal-500/30 text-teal-400 rounded-xl flex items-center justify-center">
                        <PackageCheck className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl sm:text-3xl font-black text-teal-300 font-mono tracking-tight flex items-baseline gap-1">
                        <span>{metrics.deliveredCount}</span>
                        <span className="text-xs font-semibold text-slate-400 font-sans">টি</span>
                      </div>
                      <p className="text-[11px] text-emerald-400 mt-1">ক্যাশ কালেকশন কনফার্মড</p>
                    </div>
                    <div className="w-full h-1 bg-slate-800 rounded-full mt-2 overflow-hidden">
                      <div className="h-full bg-teal-400 rounded-full" style={{ width: '80%' }} />
                    </div>
                  </div>

                  {/* Card 5: Total Sales */}
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0e1726] to-[#070d18] border border-blue-500/25 p-4 space-y-2 shadow-xl group">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        মোট সেলস (টাকা)
                      </span>
                      <div className="w-7 h-7 bg-blue-500/15 border border-blue-500/30 text-blue-400 rounded-xl flex items-center justify-center">
                        <DollarSign className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div>
                      <div className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">
                        {formatBDTEn(metrics.totalSales)}
                      </div>
                      <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-bold">
                        <TrendingUp className="w-3 h-3" /> +২২.৮% গ্রোথ
                      </p>
                    </div>
                    <div className="w-full h-1 bg-slate-800 rounded-full mt-2 overflow-hidden">
                      <div className="h-full bg-blue-400 rounded-full" style={{ width: '92%' }} />
                    </div>
                  </div>

                  {/* Card 6: AI Automation Rate */}
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#130f24] to-[#0b0817] border border-indigo-500/25 p-4 space-y-2 shadow-xl group">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        AI অটো-কনফার্ম
                      </span>
                      <div className="w-7 h-7 bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 rounded-xl flex items-center justify-center">
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl sm:text-3xl font-black text-indigo-300 font-mono tracking-tight">
                        {metrics.autoRate}
                      </div>
                      <p className="text-[11px] text-indigo-400 mt-1">০ সেকেন্ডে রিপ্লাই</p>
                    </div>
                    <div className="w-full h-1 bg-slate-800 rounded-full mt-2 overflow-hidden">
                      <div className="h-full bg-indigo-400 rounded-full" style={{ width: '94%' }} />
                    </div>
                  </div>
                </div>

                {/* 7-Day Sales Trend AreaChart */}
                <div className="bg-[#0b0f19]/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-emerald-400" />
                        <span>গত ৭ দিনের সেলস ও রেভিনিউ ট্রেন্ড (ডেমো প্রিভিউ)</span>
                      </h3>
                      <p className="text-xs text-slate-400">রিয়েল-টাইম রেভিনিউ গ্রাফ ও প্রতিদিনের অর্ডার ভলিউম</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-medium text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded bg-emerald-500 inline-block" />
                        <span>মোট রেভিনিউ (টাকা)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded bg-teal-400 inline-block" />
                        <span>অর্ডার সংখ্যা</span>
                      </div>
                    </div>
                  </div>

                  <div className="h-72 w-full pt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={DEMO_CHART_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="demoRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                          </linearGradient>
                          <linearGradient id="demoOrdersGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" vertical={false} />
                        <XAxis
                          dataKey="name"
                          stroke="#64748b"
                          fontSize={11}
                          tickLine={false}
                          axisLine={{ stroke: '#334155' }}
                        />
                        <YAxis
                          stroke="#64748b"
                          fontSize={11}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(val) => `৳${(val / 1000).toFixed(0)}k`}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#0c121e',
                            borderColor: '#1e293b',
                            borderRadius: '16px',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.6)',
                            color: '#fff',
                            fontSize: '12px',
                          }}
                          formatter={(value: any, name: any) => [
                            name === 'sales' ? formatBDTEn(value) : `${value} টি`,
                            name === 'sales' ? 'রেভিনিউ' : 'অর্ডার সংখ্যা',
                          ]}
                        />
                        <Area
                          type="monotone"
                          dataKey="sales"
                          stroke="#10b981"
                          strokeWidth={3}
                          fillOpacity={1}
                          fill="url(#demoRevenueGrad)"
                        />
                        <Area
                          type="monotone"
                          dataKey="orders"
                          stroke="#2dd4bf"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#demoOrdersGrad)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Recent Orders with 1-Click Action Buttons */}
                <div className="bg-[#0b0f19]/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5 text-emerald-400" />
                        <span>আজকের রিসেন্ট অর্ডারসমূহ</span>
                      </h3>
                      <p className="text-xs text-slate-400">১-ক্লিকে কনফার্ম, ডেলিভারিতে পাঠানো ও ক্যাশমেমো প্রিন্ট করুন</p>
                    </div>
                    <button
                      onClick={() => setActiveNav('orders')}
                      className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>সব অর্ডার দেখুন ({orders.length})</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                          <th className="py-3 px-3">অর্ডার নং</th>
                          <th className="py-3 px-3">কাস্টমার</th>
                          <th className="py-3 px-3">পণ্য</th>
                          <th className="py-3 px-3">মূল্য</th>
                          <th className="py-3 px-3">পেমেন্ট মেথড</th>
                          <th className="py-3 px-3">স্ট্যাটাস</th>
                          <th className="py-3 px-3 text-right">অ্যাকশন</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {orders.slice(0, 5).map((order) => (
                          <tr key={order.id} className="hover:bg-slate-800/40 transition-colors">
                            <td className="py-3 px-3 font-mono font-bold text-emerald-400">
                              #OF-{order.orderNumber}
                            </td>
                            <td className="py-3 px-3">
                              <p className="font-bold text-white">{order.customerName}</p>
                              <p className="text-[11px] text-slate-400 font-mono">{order.customerPhone}</p>
                            </td>
                            <td className="py-3 px-3 text-slate-300">
                              {order.items[0]?.product.title}
                            </td>
                            <td className="py-3 px-3 font-mono font-bold text-white">
                              {formatBDTEn(order.totalPrice)}
                            </td>
                            <td className="py-3 px-3">
                              <span className="text-emerald-400 font-medium text-[11px]">ক্যাশ অন ডেলিভারি (COD)</span>
                            </td>
                            <td className="py-3 px-3">{getStatusBadge(order.status)}</td>
                            <td className="py-3 px-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {order.status === 'PENDING_CONFIRMATION' && (
                                  <button
                                    onClick={() => handleConfirmOrder(order.id)}
                                    className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 rounded-lg text-[11px] font-bold transition-all cursor-pointer"
                                  >
                                    কনফার্ম
                                  </button>
                                )}
                                {order.status === 'CONFIRMED' && (
                                  <button
                                    onClick={() => handleDispatchDelivery(order.id)}
                                    className="px-2.5 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 rounded-lg text-[11px] font-bold transition-all cursor-pointer"
                                  >
                                    ডেলিভারিতে পাঠান
                                  </button>
                                )}
                                <button
                                  onClick={() => setSelectedInvoiceOrder(order)}
                                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 transition-all cursor-pointer"
                                >
                                  <Printer className="w-3 h-3 text-emerald-400" />
                                  <span>চালান</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* VIEW 2: MESSENGER LIVE CRM (FACEBOOK LIVE CHAT HUB) */}
            {/* ---------------------------------------------------- */}
            {activeNav === 'messages' && (
              <div className="bg-[#0b0f19]/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
                <div>
                  <h2 className="text-xl font-black text-white flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-400" />
                    <span>Facebook Messenger AI লাইভ ইনবক্স ও CRM</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    কীভাবে Gemini AI স্বয়ংক্রিয়ভাবে মেসেঞ্জারে কাস্টমার কনভিন্স করে অর্ডার নেয়
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 border border-slate-800 rounded-2xl overflow-hidden bg-[#06080e]">
                  {/* Left: Chat Threads */}
                  <div className="border-r border-slate-800 p-3 space-y-2 bg-slate-950/60">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2">
                      সক্রিয় মেসেঞ্জার থ্রেড
                    </p>
                    <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">সাবরিনা ইসলাম</span>
                        <span className="text-[10px] text-emerald-400">১০:০২ AM</span>
                      </div>
                      <p className="text-[11px] text-slate-300 truncate">
                        🤖 AI: আপনার অর্ডারটি নিশ্চিত হয়েছে...
                      </p>
                      <span className="inline-block px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 text-[10px] rounded font-bold">
                        অর্ডার কনফার্মড (#OF-8940)
                      </span>
                    </div>

                    <div className="p-3 rounded-xl hover:bg-slate-900 border border-transparent hover:border-slate-800 text-xs space-y-1 transition-all cursor-pointer">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-300">তানভীর আহমেদ</span>
                        <span className="text-[10px] text-slate-500">০৯:১৫ AM</span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">
                        পাঞ্জাবির সাইজ চার্ট দেখতে চাই
                      </p>
                      <span className="inline-block px-1.5 py-0.2 bg-blue-500/20 text-blue-300 text-[10px] rounded">
                        ডেলিভার্ড (#OF-8941)
                      </span>
                    </div>

                    <div className="p-3 rounded-xl hover:bg-slate-900 border border-transparent hover:border-slate-800 text-xs space-y-1 transition-all cursor-pointer">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-300">কামরুল হাসান</span>
                        <span className="text-[10px] text-slate-500">১১:৪২ AM</span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">
                        ফর্মাল শার্টের সাইজ ৪২ আছে?
                      </p>
                      <span className="inline-block px-1.5 py-0.2 bg-amber-500/20 text-amber-300 text-[10px] rounded">
                        পেন্ডিং ভেরিফিকেশন
                      </span>
                    </div>
                  </div>

                  {/* Right: Conversation Window */}
                  <div className="lg:col-span-2 flex flex-col justify-between h-[450px] p-4 space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                          সা
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">সাবরিনা ইসলাম (ধানমন্ডি, ঢাকা)</p>
                          <p className="text-[10px] text-slate-400">Facebook Messenger • Gemini AI বট হ্যান্ডেল করছে</p>
                        </div>
                      </div>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                        অটো-অর্ডার ক্যাপচার্ড
                      </span>
                    </div>

                    {/* Chat Bubbles */}
                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 text-xs">
                      <div className="flex justify-end">
                        <div className="bg-blue-600 text-white p-3 rounded-2xl rounded-tr-none max-w-xs">
                          আপনাদের জয়পুরি সিল্ক এমব্রয়ডারি থ্রি-পিস কি স্টকে আছে? ছবি ও দাম কত?
                        </div>
                      </div>

                      <div className="flex justify-start">
                        <div className="bg-slate-800 text-slate-200 p-3 rounded-2xl rounded-tl-none max-w-xs space-y-2 border border-slate-700">
                          <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                            <Bot className="w-3 h-3" /> Gemini AI বট
                          </div>
                          <p>
                            জি আপু! জয়পুরি সিল্ক এমব্রয়ডারি থ্রি-পিস এভেইলেবল আছে। অফার প্রাইজ মাত্র ২৩২০ টাকা। নিচে পিকচার দেখে নিন 👇
                          </p>
                          <div className="w-full h-24 bg-slate-900 rounded-lg flex items-center justify-center text-slate-500 text-[11px] border border-slate-700/50">
                            👗 ১:১ ফুল এইচডি ছবি ডিসপ্লে
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <div className="bg-blue-600 text-white p-3 rounded-2xl rounded-tr-none max-w-xs">
                          ১ পিস অর্ডার করব। নাম সাবরিনা ইসলাম, ফোন 01823998877, ঠিকানা ধানমন্ডি ৪/এ, ঢাকা।
                        </div>
                      </div>

                      <div className="flex justify-start">
                        <div className="bg-emerald-950/60 text-emerald-200 p-3 rounded-2xl rounded-tl-none max-w-xs space-y-1.5 border border-emerald-500/40">
                          <p className="font-bold text-white">🎉 অর্ডার নিশ্চিত করা হয়েছে!</p>
                          <p className="text-[11px]">
                            অর্ডার নং: <span className="font-mono font-bold text-emerald-300">#OF-8940</span>
                            <br />
                            মোট মূল্য: ৳২৪০০ (ক্যাশ অন ডেলিভারি)
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 text-center text-[11px] text-slate-400">
                      💡 আপনি নিজে লাইভ এআই টেস্ট করতে চান?{' '}
                      <button
                        onClick={() => setActiveNav('bot')}
                        className="text-emerald-400 font-bold hover:underline cursor-pointer"
                      >
                        "AI সেলস বট সেটিংস" মেনুতে যান →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* VIEW 3: ORDERS MANAGEMENT & 5-STEP PIPELINE */}
            {/* ---------------------------------------------------- */}
            {activeNav === 'orders' && (
              <div className="bg-[#0b0f19]/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-black text-white flex items-center gap-2">
                      <ShoppingBag className="w-5 h-5 text-emerald-400" />
                      <span>অর্ডার ম্যানেজমেন্ট ও ৫-স্টেপ অর্ডার পাইপলাইন</span>
                    </h2>
                    <p className="text-xs text-slate-400">
                      মোট {orders.length} টি ডেমো অর্ডার • লাইভ ফিল্টারিং, ১-ক্লিক ডেলিভারি স্ট্যাটাস ও ক্যাশমেমো প্রিন্ট
                    </p>
                  </div>

                  {/* Search Bar */}
                  <div className="relative w-full md:w-72">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="নাম, ফোন বা অর্ডার নম্বর..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-750 focus:border-emerald-500 rounded-2xl pl-10 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {[
                    { id: 'ALL', label: `সব অর্ডার (${orders.length})` },
                    { id: 'PENDING', label: `পেন্ডিং (${metrics.pendingCount})` },
                    { id: 'CONFIRMED', label: `কনফার্মড (${orders.filter((o) => o.status === 'CONFIRMED').length})` },
                    { id: 'IN_TRANSIT', label: `ইন-ট্রানজিট (${metrics.dispatchedCount})` },
                    { id: 'DELIVERED', label: `ডেলিভার্ড (${metrics.deliveredCount})` },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setOrderFilter(tab.id as any)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                        orderFilter === tab.id
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Orders Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                        <th className="py-3.5 px-3">অর্ডার নং</th>
                        <th className="py-3.5 px-3">কাস্টমার ও মোবাইল</th>
                        <th className="py-3.5 px-3">ঠিকানা</th>
                        <th className="py-3.5 px-3">অর্ডারকৃত পণ্য</th>
                        <th className="py-3.5 px-3">মূল্য (COD)</th>
                        <th className="py-3.5 px-3">পেমেন্ট মেথড</th>
                        <th className="py-3.5 px-3">স্ট্যাটাস</th>
                        <th className="py-3.5 px-3 text-right">অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-12 text-center text-slate-500">
                            কোনো অর্ডার পাওয়া যায়নি। ফিল্টার পরিবর্তন করুন।
                          </td>
                        </tr>
                      ) : (
                        filteredOrders.map((order) => (
                          <tr key={order.id} className="hover:bg-slate-800/40 transition-colors">
                            <td className="py-4 px-3 font-mono font-bold text-emerald-400">
                              #OF-{order.orderNumber}
                            </td>
                            <td className="py-4 px-3">
                              <p className="font-bold text-white">{order.customerName}</p>
                              <a
                                href={`tel:${order.customerPhone}`}
                                className="text-[11px] text-slate-400 font-mono hover:text-emerald-400"
                              >
                                {order.customerPhone}
                              </a>
                            </td>
                            <td className="py-4 px-3 text-slate-300 max-w-xs truncate" title={order.deliveryAddress}>
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                <span className="truncate">{order.deliveryAddress}</span>
                              </div>
                            </td>
                            <td className="py-4 px-3">
                              <p className="font-bold text-white">{order.items[0]?.product.title}</p>
                              <p className="text-[10px] text-slate-400">{order.items[0]?.variant?.name}</p>
                            </td>
                            <td className="py-4 px-3 font-mono font-bold text-white">
                              <div>{formatBDTEn(order.totalPrice)}</div>
                              <span className="text-[10px] text-emerald-400 font-normal">ক্যাশ অন ডেলিভারি</span>
                            </td>
                            <td className="py-4 px-3">
                              <span className="text-emerald-400 font-medium text-[11px]">ক্যাশ অন ডেলিভারি (COD)</span>
                            </td>
                            <td className="py-4 px-3">{getStatusBadge(order.status)}</td>
                            <td className="py-4 px-3 text-right">
                              <div className="flex items-center justify-end gap-1.5 flex-wrap">
                                {order.status === 'PENDING_CONFIRMATION' && (
                                  <button
                                    onClick={() => handleConfirmOrder(order.id)}
                                    className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 rounded-lg text-[11px] font-bold transition-all cursor-pointer"
                                  >
                                    কনফার্ম
                                  </button>
                                )}
                                {order.status === 'CONFIRMED' && (
                                  <button
                                    onClick={() => handleDispatchDelivery(order.id)}
                                    className="px-2.5 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 rounded-lg text-[11px] font-bold transition-all cursor-pointer"
                                  >
                                    ডেলিভারিতে পাঠান
                                  </button>
                                )}
                                {order.status === 'IN_TRANSIT' && (
                                  <button
                                    onClick={() => handleMarkDelivered(order.id)}
                                    className="px-2.5 py-1 bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/30 rounded-lg text-[11px] font-bold transition-all cursor-pointer"
                                  >
                                    ডেলিভার্ড
                                  </button>
                                )}
                                <button
                                  onClick={() => setSelectedInvoiceOrder(order)}
                                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 transition-all cursor-pointer"
                                  title="ক্যাশমেমো প্রিন্ট করুন"
                                >
                                  <Printer className="w-3 h-3 text-emerald-400" />
                                  <span>চালান</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* VIEW 4: PRODUCTS & INVENTORY */}
            {/* ---------------------------------------------------- */}
            {activeNav === 'products' && (
              <div className="bg-[#0b0f19]/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-black text-white flex items-center gap-2">
                      <Boxes className="w-5 h-5 text-teal-400" />
                      <span>প্রোডাক্ট ক্যাটালগ ও স্টক ইনভেন্টরি</span>
                    </h2>
                    <p className="text-xs text-slate-400">
                      Moner Kotha Fashion এর সক্রিয় ড্রেস ও শাড়ির কালেকশন
                    </p>
                  </div>
                  <button
                    onClick={() => toast.info('ডেমো মোডে প্রোডাক্ট যোগ করার ফিচারটি প্রিভিউ হিসেবে সংরক্ষিত রয়েছে।')}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer w-fit"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>নতুন প্রোডাক্ট যোগ করুন</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    {
                      id: 'p-1',
                      title: 'জয়পুরি কটন আনস্টিচড থ্রি-পিস',
                      category: 'থ্রি-পিস',
                      price: 1250,
                      regularPrice: 1500,
                      stock: 18,
                      variants: 'Free Size (১০০% কটন)',
                    },
                    {
                      id: 'p-2',
                      title: 'প্রিমিয়াম কাশ্মীরি কুর্তি কালেকশন',
                      category: 'কুর্তি',
                      price: 850,
                      regularPrice: 1100,
                      stock: 32,
                      variants: 'সাইজ: M, L, XL',
                    },
                    {
                      id: 'p-3',
                      title: 'ডিজাইনার পার্টি গাউন (মারুন)',
                      category: 'গাউন',
                      price: 1500,
                      regularPrice: 1850,
                      stock: 12,
                      variants: 'সাইজ: M, L, XL',
                    },
                    {
                      id: 'p-4',
                      title: 'গর্জিয়াস ভেলভেট পার্টি গাউন (কালো)',
                      category: 'গাউন',
                      price: 1850,
                      regularPrice: 2200,
                      stock: 7,
                      variants: 'সাইজ: L, XL (ভেলভেট)',
                    },
                  ].map((prod) => (
                    <div
                      key={prod.id}
                      className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-3 hover:border-slate-700 transition-all"
                    >
                      <div className="w-full h-32 bg-slate-900 rounded-xl flex items-center justify-center text-slate-500 text-xs border border-slate-800">
                        👗 প্রোডাক্ট ফটো প্রিভিউ
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider">
                          {prod.category}
                        </span>
                        <h4 className="font-bold text-white text-sm mt-0.5">{prod.title}</h4>
                        <p className="text-[11px] text-slate-400 mt-1">{prod.variants}</p>
                      </div>
                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                        <div>
                          <span className="text-base font-black text-white font-mono">৳{prod.price}</span>
                          <span className="text-[11px] text-slate-500 line-through ml-1.5 font-mono">
                            ৳{prod.regularPrice}
                          </span>
                        </div>
                        <span className="text-[11px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md">
                          স্টক: {prod.stock} টি
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* VIEW 5: GOOGLE GEMINI AI BOT STUDIO & LIVE SIMULATOR */}
            {/* ---------------------------------------------------- */}
            {activeNav === 'bot' && (
              <div className="space-y-6">
                {/* Bot Settings Overview Card */}
                <div className="bg-[#0b0f19]/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-black text-white flex items-center gap-2">
                        <Bot className="w-5 h-5 text-indigo-400" />
                        <span>Google Gemini AI সেলস বট স্টুডিও</span>
                      </h2>
                      <p className="text-xs text-slate-400">
                        বাংলা ও বাংলিশ উভয় ভাষাতেই চতুরভাবে কাস্টমার হ্যান্ডেল করে
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold rounded-full w-fit">
                      🟢 Gemini 2.5 Flash Connected
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                    <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl space-y-1">
                      <span className="text-slate-400">এআই মডেল:</span>
                      <p className="font-bold text-white">Gemini 2.5 Flash (Bengali NLP)</p>
                    </div>
                    <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl space-y-1">
                      <span className="text-slate-400">স্বয়ংক্রিয় অর্ডার ক্যাপচার:</span>
                      <p className="font-bold text-emerald-400">চালু আছে (Phone & Address)</p>
                    </div>
                    <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl space-y-1">
                      <span className="text-slate-400">ডেলিভারি চার্জ কনফিগ:</span>
                      <p className="font-bold text-white">ঢাকায় ৳৭০ | ঢাকার বাইরে ৳১২০</p>
                    </div>
                  </div>
                </div>

                {/* Live Interactive Chat Simulator */}
                <div className="bg-[#0b0f19]/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-emerald-400" />
                      <span>লাইভ কাস্টমার চ্যাট টেস্ট সিমুলেটর</span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      নিচে বাংলায় বা বাংলিশে যেকোনো প্রশ্ন লিখুন (যেমন: "koto", "kiki product ache", "aita ki khub valo", "অর্ডার করতে চাই")
                    </p>
                  </div>

                  <div className="bg-[#06080e] border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 max-w-3xl mx-auto shadow-inner">
                    {/* Chat Messages Log */}
                    <div className="min-h-[280px] max-h-[380px] overflow-y-auto space-y-3 pr-2 text-xs">
                      {chatMessages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div
                            className={`p-3.5 rounded-2xl max-w-sm sm:max-w-md space-y-2 ${
                              msg.sender === 'user'
                                ? 'bg-emerald-600 text-white rounded-tr-none'
                                : 'bg-slate-800/90 text-slate-200 border border-slate-700/80 rounded-tl-none'
                            }`}
                          >
                            {msg.sender === 'bot' && (
                              <div className="flex items-center gap-1.5 text-[10px] text-indigo-400 font-bold">
                                <Bot className="w-3.5 h-3.5" />
                                <span>Gemini 2.5 Flash (Bengali Engine)</span>
                              </div>
                            )}
                            <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>

                            {msg.quickReplies && (
                              <div className="pt-2 flex flex-wrap gap-1.5">
                                {msg.quickReplies.map((reply, rIdx) => (
                                  <button
                                    key={rIdx}
                                    onClick={() => handleSendChatMessage(reply)}
                                    className="px-2.5 py-1 bg-slate-700 hover:bg-emerald-600 text-slate-200 hover:text-white rounded-lg text-[11px] font-medium transition-colors cursor-pointer"
                                  >
                                    {reply}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}

                      {isBotTyping && (
                        <div className="flex justify-start">
                          <div className="p-3 bg-slate-800/90 rounded-2xl rounded-tl-none text-xs text-slate-400 flex items-center gap-2">
                            <Bot className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                            <span>AI বুদ্ধিমান উত্তর প্রস্তুত করছে...</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Chat Input Bar */}
                    <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="বাংলায় বা বাংলিশে লিখুন: যেমন koto? বা কি কি ড্রেস আছে?..."
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSendChatMessage();
                        }}
                        className="flex-1 bg-slate-900 border border-slate-750 focus:border-emerald-500 rounded-2xl px-4 py-3 text-xs text-white placeholder:text-slate-500 focus:outline-none transition-all"
                      />
                      <button
                        onClick={() => handleSendChatMessage()}
                        disabled={!userInput.trim() || isBotTyping}
                        className="px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold rounded-2xl text-xs transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                      >
                        <span>পাঠান</span>
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Invoice Modal for any clicked Order */}
      {selectedInvoiceOrder && (
        <InvoiceModal
          order={selectedInvoiceOrder}
          onClose={() => setSelectedInvoiceOrder(null)}
        />
      )}
    </div>
  );
}
