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

// 7-day realistic sales data for AreaChart
const DEMO_CHART_DATA = [
  { date: '১২ সেপ্টেম্বর', revenue: 32400, orders: 24 },
  { date: '১৩ সেপ্টেম্বর', revenue: 41200, orders: 31 },
  { date: '১৪ সেপ্টেম্বর', revenue: 38900, orders: 28 },
  { date: '১৫ সেপ্টেম্বর', revenue: 45600, orders: 35 },
  { date: '১৬ সেপ্টেম্বর', revenue: 42100, orders: 32 },
  { date: '১৭ সেপ্টেম্বর', revenue: 51800, orders: 41 },
  { date: '১৮ সেপ্টেম্বর', revenue: 48250, orders: 38 },
];

// Rich, realistic Bangladeshi demo orders
const DEMO_ORDERS: Order[] = [
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
    courierProvider: 'STEADFAST',
    courierTrackingId: 'STDF88231',
    consignmentId: 'CID-991201',
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
    courierProvider: 'PATHAO',
    courierTrackingId: 'PT-44912',
    consignmentId: 'CID-991200',
    courierStatus: 'রাইডার পিকআপ সম্পন্ন (ইন-ট্রানজিট)',
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
    status: 'PROCESSING',
    itemsPrice: 1080,
    deliveryCharge: 120,
    discount: 0,
    totalPrice: 1200,
    courierProvider: 'STEADFAST',
    courierTrackingId: 'STDF88219',
    consignmentId: 'CID-991198',
    courierStatus: 'পার্সেল রেডি ফর পিকআপ',
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
    courierProvider: 'STEADFAST',
    courierTrackingId: 'STDF88210',
    consignmentId: 'CID-991195',
    courierStatus: 'কুরিয়ার বুকিং জেনারেট হয়েছে',
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
    courierProvider: 'STEADFAST',
    courierTrackingId: 'STDF88195',
    consignmentId: 'CID-991180',
    courierStatus: 'ডেলিভার্ড ও ক্যাশ কালেক্টেড',
    createdAt: '2026-09-18T08:30:00.000Z',
    items: [
      {
        id: 'item-5',
        orderId: 'ord-5',
        productId: 'p-5',
        product: { title: 'স্মার্ট ফিটনেস ব্যান্ড ওয়াচ প্রো', basePrice: 2850 },
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
    courierProvider: 'STEADFAST',
    courierTrackingId: 'STDF88172',
    consignmentId: 'CID-991165',
    courierStatus: 'পার্সেল ইন-ট্রানজিট',
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

// Simulated AI bot messages for live interactive testing
const INITIAL_BOT_MSGS: DemoChatMessage[] = [
  {
    sender: 'bot',
    text: 'আসসালামু আলাইকুম! Moner Kotha শপে আপনাকে স্বাগতম। 🌸\nআমাদের আজকের হট সেলিং অফারগুলো নিচে দেখতে পারেন 👇',
    quickReplies: [
      'জয়পুরি কটন থ্রি-পিস এর দাম কত?',
      'ঢাকার ভিতর ডেলিভারি চার্জ কত?',
      'অর্ডার করতে কী কী তথ্য লাগবে?',
    ],
    time: '১০:০০ AM',
  },
];

export default function DemoDashboardPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'chat' | 'bot' | 'courier'>('overview');
  const [orderFilter, setOrderFilter] = useState<'ALL' | 'PENDING' | 'CONFIRMED' | 'IN_TRANSIT' | 'DELIVERED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);
  const [copiedTracking, setCopiedTracking] = useState<string | null>(null);

  // AI Chat simulation state
  const [chatMessages, setChatMessages] = useState<DemoChatMessage[]>(INITIAL_BOT_MSGS);
  const [userInput, setUserInput] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return DEMO_ORDERS.filter((ord) => {
      // Tab filter
      if (orderFilter === 'PENDING' && ord.status !== 'PENDING_CONFIRMATION') return false;
      if (orderFilter === 'CONFIRMED' && ord.status !== 'CONFIRMED' && ord.status !== 'PROCESSING') return false;
      if (orderFilter === 'IN_TRANSIT' && ord.status !== 'IN_TRANSIT' && ord.status !== 'DISPATCHED_TO_COURIER') return false;
      if (orderFilter === 'DELIVERED' && ord.status !== 'DELIVERED') return false;

      // Search filter
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
  }, [orderFilter, searchQuery]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTracking(text);
    toast.success(`ট্র্যাকিং কোড (${text}) কপি করা হয়েছে`);
    setTimeout(() => setCopiedTracking(null), 2000);
  };

  const handleSendChatMessage = (textToSend?: string) => {
    const text = textToSend || userInput;
    if (!text.trim()) return;

    const userMsg = {
      sender: 'user',
      text,
      time: 'এখন',
    };
    setChatMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setUserInput('');
    setIsBotTyping(true);

    // Realistic Gemini Bengali simulation
    setTimeout(() => {
      let botResponse = 'আপনার মেসেজের জন্য ধন্যবাদ! আমাদের ডেলিভারি টিম খুব দ্রুত এটি প্রসেস করছে।';
      let quickReplies: string[] | undefined = undefined;

      const lower = text.toLowerCase();
      if (lower.includes('দাম') || lower.includes('প্রাইস') || lower.includes('কত')) {
        botResponse = 'জয়পুরি কটন থ্রি-পিসের অফার প্রাইস মাত্র ১২৫০ টাকা (রেগুলার ১৫০০ টাকা)! পিওর ১০০% সুতি ফেব্রিক এবং সাথে ম্যাচিং ওড়না থাকবে। অর্ডার করতে চাইলে "অর্ডার করব" লিখুন 😊';
        quickReplies = ['হ্যাঁ, আমি ১ পিস অর্ডার করব', 'ঢাকার বাইরে ডেলিভারি হবে?'];
      } else if (lower.includes('ডেলিভারি') || lower.includes('চার্জ')) {
        botResponse = 'ঢাকার ভিতরে ডেলিভারি চার্জ মাত্র ৭০ টাকা এবং ঢাকার বাইরে ১২০ টাকা। ২-৩ কার্যদিবসের মধ্যে Steadfast কুরিয়ারের মাধ্যমে ক্যাশ অন ডেলিভারিতে পৌঁছে দেওয়া হবে। 🚚';
        quickReplies = ['ক্যাশ অন ডেলিভারি দেওয়া যাবে?', 'অর্ডার করতে চাই'];
      } else if (lower.includes('অর্ডার') || lower.includes('নিব') || lower.includes('করব')) {
        botResponse = 'অসাধারণ! আপনার অর্ডারটি নিশ্চিত করতে অনুগ্রহ করে আপনার পূর্ণ নাম, ১১ ডিজিটের মোবাইল নম্বর এবং বিস্তারিত ঠিকানা লিখে পাঠান 👇';
        quickReplies = ['তানভীর, 01712334455, মিরপুর ১০ ঢাকা'];
      } else if (lower.includes('017') || lower.includes('018') || lower.includes('019') || lower.includes('ঢাকা') || lower.includes('মিরপুর')) {
        botResponse = '🎉 ধন্যবাদ! আপনার তথ্য সফলভাবে ভেরিফাই করা হয়েছে। আপনার অর্ডার নম্বর #OF-8942 সিস্টেমে যুক্ত হয়েছে এবং Steadfast কুরিয়ারে অটো এন্ট্রি নেওয়া হয়েছে। ২ দিনের মধ্যে পার্সেল পৌঁছাবে!';
      }

      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: botResponse,
          quickReplies,
          time: 'এখন',
        },
      ]);
      setIsBotTyping(false);
    }, 600);
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
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
            <Truck className="w-3 h-3" /> ইন-ট্রানজিট
          </span>
        );
      case 'PROCESSING':
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30">
            <Bot className="w-3 h-3" /> এআই কনফার্মড
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

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* 1. Global Sticky Demo Announcement Bar */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-emerald-950/95 via-[#0c141d]/95 to-teal-950/95 border-b border-emerald-500/30 backdrop-blur-md px-4 py-2.5 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-bold text-emerald-300">OrderFlow BD ডেমো সেশন</span>
            <span className="hidden sm:inline text-slate-400">|</span>
            <span className="hidden sm:inline text-slate-300">
              এটি ফুল স্ট্যাটিক প্রিভিউ মোড — কোনো পাসওয়ার্ড ছাড়াই পুরো প্ল্যাটফর্ম টেস্ট করুন
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/register"
              className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-neutral-950 font-black rounded-xl text-xs transition-all shadow-sm active:scale-95 flex items-center gap-1"
            >
              <span>রিয়েল একাউন্ট খুলুন</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
            <Link
              href="/login"
              className="px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 rounded-xl text-xs font-bold transition-all"
            >
              লগইন পেজে যান
            </Link>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6 flex-1">
        {/* Header Strip with Store Info & Tab Switcher */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0b0f19]/90 border border-slate-800/90 rounded-3xl p-5 shadow-xl backdrop-blur-xl">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20 shrink-0">
              <Zap className="w-6 h-6 fill-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Moner Kotha Fashion
                </h1>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold rounded-full">
                  ডেমো স্টোর • Pro Plan
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                সেন্ট্রালাইজড অর্ডার অটোমেশন ও AI সেলস প্ল্যাটফর্ম • ডেমো মোড
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                setActiveTab('bot');
                toast.success('AI সেলস বট সিমুলেটরে স্বাগতম! নিচে যেকোনো মেসেজ লিখে পরীক্ষা করুন।');
              }}
              className="px-3.5 py-2 bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Bot className="w-4 h-4 text-indigo-400" />
              <span>AI বট টেস্ট করুন</span>
            </button>
            <button
              onClick={() => {
                toast.success('ডেমো মেট্রিক্স রিফ্রেশ হয়েছে!');
              }}
              className="p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-2xl border border-slate-700 transition-all cursor-pointer"
              title="রিফ্রেশ"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Demo Sub-navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25'
                : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>ড্যাশবোর্ড ওভারভিউ</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25'
                : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>অর্ডারসমূহ ({DEMO_ORDERS.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'chat'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25'
                : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            <span>মেসেঞ্জার ইনবক্স প্রিভিউ</span>
          </button>

          <button
            onClick={() => setActiveTab('bot')}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'bot'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25'
                : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>AI বট সিমুলেটর</span>
          </button>

          <button
            onClick={() => setActiveTab('courier')}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'courier'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25'
                : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>কুরিয়ার ইন্টিগ্রেশন</span>
          </button>
        </div>

        {/* Integration Status Badges Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-[#0b0f19]/80 border border-emerald-500/30 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-bold text-white">Steadfast API</span>
            </div>
            <span className="text-[11px] text-emerald-400 font-mono font-bold">ব্যালেন্স: ৳৪২,৫০০</span>
          </div>

          <div className="p-3 bg-[#0b0f19]/80 border border-slate-800 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-xs font-bold text-white">Pathao Logistics</span>
            </div>
            <span className="text-[11px] text-slate-400">অ্যাক্টিভ ওয়েবহুক</span>
          </div>

          <div className="p-3 bg-[#0b0f19]/80 border border-slate-800 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-xs font-bold text-white">Facebook Page</span>
            </div>
            <span className="text-[11px] text-emerald-300">Moner Kotha Live</span>
          </div>

          <div className="p-3 bg-[#0b0f19]/80 border border-slate-800 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-400" />
              <span className="text-xs font-bold text-white">Gemini 1.5 Flash</span>
            </div>
            <span className="text-[11px] text-indigo-300">রেসপন্স: ০.৪ সে.</span>
          </div>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* 6 Big KPI Metric Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
              {/* Card 1 */}
              <div className="p-4 bg-gradient-to-b from-emerald-950/40 to-slate-900/90 border border-emerald-500/30 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">আজকের অর্ডার</span>
                  <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl font-black text-white font-mono">৩৮ টি</p>
                <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-bold">
                  <TrendingUp className="w-3 h-3" /> +১৮.৪% বৃদ্ধি
                </div>
              </div>

              {/* Card 2 */}
              <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">ইন-ট্রানজিট</span>
                  <div className="p-1.5 bg-blue-500/20 text-blue-400 rounded-lg">
                    <Truck className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl font-black text-white font-mono">১৪ টি</p>
                <p className="text-[11px] text-slate-400">কুরিয়ারে চলমান</p>
              </div>

              {/* Card 3 */}
              <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">আজকের সেলস</span>
                  <div className="p-1.5 bg-teal-500/20 text-teal-400 rounded-lg">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl font-black text-emerald-400 font-mono">৳৪৮,২৫০</p>
                <p className="text-[11px] text-slate-400">গড় ৳১,২৬৯/অর্ডার</p>
              </div>

              {/* Card 4 */}
              <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">AI অটো-কনফার্ম</span>
                  <div className="p-1.5 bg-indigo-500/20 text-indigo-400 rounded-lg">
                    <Bot className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl font-black text-indigo-300 font-mono">৯৪.২%</p>
                <p className="text-[11px] text-indigo-400/80">৩৬ টি অটো-বুকড</p>
              </div>

              {/* Card 5 */}
              <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">মাসিক টার্নওভার</span>
                  <div className="p-1.5 bg-purple-500/20 text-purple-400 rounded-lg">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl font-black text-white font-mono">৳৪,৮২,৪৫০</p>
                <p className="text-[11px] text-slate-400">মোট ৪২৮ ডেলিভার্ড</p>
              </div>

              {/* Card 6 */}
              <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">রিটার্ন রেট</span>
                  <div className="p-1.5 bg-rose-500/20 text-rose-400 rounded-lg">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl font-black text-rose-300 font-mono">২.১%</p>
                <p className="text-[11px] text-emerald-400">ভেরিফায়েড কাস্টমার</p>
              </div>
            </div>

            {/* AreaChart: 7 Days Sales Trend */}
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
                      dataKey="date"
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
                        name === 'revenue' ? formatBDTEn(value) : `${value} টি`,
                        name === 'revenue' ? 'রেভিনিউ' : 'অর্ডার সংখ্যা',
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
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

            {/* Quick Orders Preview Section */}
            <div className="bg-[#0b0f19]/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-emerald-400" />
                    <span>আজকের রিসেন্ট অর্ডারসমূহ</span>
                  </h3>
                  <p className="text-xs text-slate-400">১-ক্লিকে ক্যাশমেমো প্রিন্ট ও কুরিয়ার ট্র্যাকিং দেখুন</p>
                </div>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>সব অর্ডার দেখুন ({DEMO_ORDERS.length})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Mini Orders List */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                      <th className="py-3 px-3">অর্ডার নং</th>
                      <th className="py-3 px-3">কাস্টমার</th>
                      <th className="py-3 px-3">পণ্য</th>
                      <th className="py-3 px-3">মূল্য</th>
                      <th className="py-3 px-3">কুরিয়ার</th>
                      <th className="py-3 px-3">স্ট্যাটাস</th>
                      <th className="py-3 px-3 text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {DEMO_ORDERS.slice(0, 4).map((order) => (
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
                          {order.courierTrackingId ? (
                            <span className="inline-flex items-center gap-1 font-mono text-[11px] text-slate-300">
                              {order.courierProvider}: {order.courierTrackingId}
                            </span>
                          ) : (
                            <span className="text-slate-500">—</span>
                          )}
                        </td>
                        <td className="py-3 px-3">{getStatusBadge(order.status)}</td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => setSelectedInvoiceOrder(order)}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 transition-all cursor-pointer"
                          >
                            <Printer className="w-3 h-3 text-emerald-400" />
                            <span>চালান</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ALL ORDERS */}
        {activeTab === 'orders' && (
          <div className="bg-[#0b0f19]/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-emerald-400" />
                  <span>অর্ডার ম্যানেজমেন্ট ও কুরিয়ার ট্র্যাকিং</span>
                </h2>
                <p className="text-xs text-slate-400">
                  মোট {DEMO_ORDERS.length} টি ডেমো অর্ডার • লাইভ ফিল্টারিং ও ক্যাশমেমো প্রিভিউ
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
                { id: 'ALL', label: 'সব অর্ডার (৭)' },
                { id: 'PENDING', label: 'পেন্ডিং (১)' },
                { id: 'CONFIRMED', label: 'এআই কনফার্মড (২)' },
                { id: 'IN_TRANSIT', label: 'ইন-ট্রানজিট (২)' },
                { id: 'DELIVERED', label: 'ডেলিভার্ড (২)' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setOrderFilter(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
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
                    <th className="py-3.5 px-3">কুরিয়ার ট্র্যাকিং</th>
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
                          {order.courierTrackingId ? (
                            <div className="space-y-1">
                              <button
                                onClick={() => handleCopy(order.courierTrackingId!)}
                                className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-mono text-[11px] border border-slate-700 transition-all cursor-pointer"
                                title="কপি করুন"
                              >
                                <span>{order.courierTrackingId}</span>
                                {copiedTracking === order.courierTrackingId ? (
                                  <Check className="w-3 h-3 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3 h-3 text-slate-400" />
                                )}
                              </button>
                              <p className="text-[10px] text-slate-400">{order.courierStatus}</p>
                            </div>
                          ) : (
                            <span className="text-slate-500">বুকিং পেন্ডিং</span>
                          )}
                        </td>
                        <td className="py-4 px-3">{getStatusBadge(order.status)}</td>
                        <td className="py-4 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedInvoiceOrder(order)}
                              className="px-2.5 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold inline-flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>চালান</span>
                            </button>
                            <a
                              href={`https://wa.me/88${order.customerPhone.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 rounded-xl border border-slate-700 transition-all"
                              title="হোয়াটসঅ্যাপে নক করুন"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </a>
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

        {/* TAB 3: LIVE MESSENGER CHAT PREVIEW */}
        {activeTab === 'chat' && (
          <div className="bg-[#0b0f19]/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-blue-400" />
                <span>Facebook Messenger AI লাইভ ইনবক্স প্রিভিউ</span>
              </h2>
              <p className="text-xs text-slate-400">
                কীভাবে Gemini AI স্বয়ংক্রিয়ভাবে মেসেঞ্জারে কাস্টমার কনভিন্স করে অর্ডার নেয়
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 border border-slate-800 rounded-2xl overflow-hidden bg-[#06080e]">
              {/* Left: Chat Threads */}
              <div className="border-r border-slate-800 p-3 space-y-2 bg-slate-950/60">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2">
                  সক্রিয় চ্যাট থ্রেড
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

              {/* Right: Message Window */}
              <div className="lg:col-span-2 flex flex-col justify-between h-96 p-4 space-y-4">
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
                  {/* User */}
                  <div className="flex justify-end">
                    <div className="bg-blue-600 text-white p-3 rounded-2xl rounded-tr-none max-w-xs">
                      আপনাদের জয়পুরি সিল্ক এমব্রয়ডারি থ্রি-পিস কি স্টকে আছে? ছবি ও দাম কত?
                    </div>
                  </div>

                  {/* AI Bot */}
                  <div className="flex justify-start">
                    <div className="bg-slate-800 text-slate-200 p-3 rounded-2xl rounded-tl-none max-w-xs space-y-2 border border-slate-700">
                      <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                        <Bot className="w-3 h-3" /> Gemini AI বট
                      </div>
                      <p>
                        জি আপু! জয়পুরি সিল্ক এমব্রয়ডারি থ্রি-পিস এভেইলেবল আছে। অফার প্রাইজ মাত্র ২৩২০ টাকা। নিচে পিকচার দেখে নিন 👇
                      </p>
                      <div className="w-full h-28 bg-slate-900 rounded-lg flex items-center justify-center text-slate-500 text-[11px] border border-slate-700/50">
                        👗 ১:১ ফুল এইচডি ছবি ডিসপ্লে
                      </div>
                    </div>
                  </div>

                  {/* User */}
                  <div className="flex justify-end">
                    <div className="bg-blue-600 text-white p-3 rounded-2xl rounded-tr-none max-w-xs">
                      ১ পিস অর্ডার করব। নাম সাবরিনা ইসলাম, ফোন 01823998877, ঠিকানা ধানমন্ডি ৪/এ, ঢাকা।
                    </div>
                  </div>

                  {/* AI Bot Confirmation */}
                  <div className="flex justify-start">
                    <div className="bg-emerald-950/60 text-emerald-200 p-3 rounded-2xl rounded-tl-none max-w-xs space-y-1.5 border border-emerald-500/40">
                      <p className="font-bold text-white">🎉 অর্ডার নিশ্চিত করা হয়েছে!</p>
                      <p className="text-[11px]">
                        অর্ডার নং: <span className="font-mono font-bold text-emerald-300">#OF-8940</span>
                        <br />
                        মোট মূল্য: ৳২৪০০ (ক্যাশ অন ডেলিভারি)
                        <br />
                        কুরিয়ার: Pathao Express (ট্র্যাকিং: PT-44912)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 text-center text-[11px] text-slate-500">
                  ✨ এটি মেসেঞ্জার অটোমেশন ডেমো। নিজে টেস্ট করতে "AI বট সিমুলেটর" ট্যাবে যান।
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: INTERACTIVE AI BOT SIMULATOR */}
        {activeTab === 'bot' && (
          <div className="bg-[#0b0f19]/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <Bot className="w-5 h-5 text-indigo-400" />
                <span>Google Gemini AI সেলস বট লাইভ টেস্ট সিমুলেটর</span>
              </h2>
              <p className="text-xs text-slate-400">
                বাংলায় যেকোনো প্রশ্ন লিখুন (যেমন: দাম কত?, ডেলিভারি চার্জ কত?, অর্ডার করব) এবং স্বয়ংক্রিয় এআই উত্তর দেখুন
              </p>
            </div>

            <div className="bg-[#06080e] border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 max-w-3xl mx-auto shadow-inner">
              {/* Messages display */}
              <div className="min-h-[260px] max-h-[360px] overflow-y-auto space-y-3 pr-2 text-xs">
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
                          <span>Gemini 1.5 Flash (Bengali Engine)</span>
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
                      <span>AI টাইপ করছে...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Input box */}
              <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="বাংলায় লিখুন: যেমন দাম কত? বা ডেলিভারি চার্জ কত?..."
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
        )}

        {/* TAB 5: COURIER INTEGRATION PREVIEW */}
        {activeTab === 'courier' && (
          <div className="bg-[#0b0f19]/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-6">
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <Truck className="w-5 h-5 text-teal-400" />
                <span>Steadfast ও Pathao কুরিয়ার অটোমেশন এপিআই</span>
              </h2>
              <p className="text-xs text-slate-400">
                ড্যাশবোর্ডে ১-ক্লিকে কুরিয়ার বুকিং, ইনভয়েস প্রিন্ট ও রিটার্ন ট্র্যাকিং
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Steadfast Card */}
              <div className="p-5 bg-slate-950/70 border border-emerald-500/30 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-xs">
                      SF
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">Steadfast Courier API</h4>
                      <p className="text-[11px] text-emerald-400">স্বয়ংক্রিয় ১-ক্লিক পার্সেল বুকিং</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold rounded-full">
                    সক্রিয়
                  </span>
                </div>
                <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-slate-800">
                  <div className="flex justify-between">
                    <span className="text-slate-400">বর্তমান ওয়ালেট ব্যালেন্স:</span>
                    <span className="font-mono font-bold text-white">৳ ৪২,৫০০</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">আজকের ডেলিভারি সম্পন্ন:</span>
                    <span className="font-mono font-bold text-emerald-400">১৮ টি পার্সেল</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">গড় ডেলিভারি সময়:</span>
                    <span className="font-mono font-bold text-slate-300">১.৮ দিন (ঢাকা ও মেট্রো)</span>
                  </div>
                </div>
              </div>

              {/* Pathao Card */}
              <div className="p-5 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center font-black text-xs">
                      PT
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">Pathao Courier Webhook</h4>
                      <p className="text-[11px] text-slate-400">রিয়েল-টাইম রাইডার ট্র্যাকিং</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold rounded-full">
                    সংযুক্ত
                  </span>
                </div>
                <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-slate-800">
                  <div className="flex justify-between">
                    <span className="text-slate-400">আজকের পিকআপ রিকোয়েস্ট:</span>
                    <span className="font-mono font-bold text-white">১২ টি পার্সেল</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">ওয়েবহুক স্ট্যাটাস:</span>
                    <span className="font-mono font-bold text-emerald-400">Active (200 OK)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">ক্যাশ রিকনসিলিয়েশন:</span>
                    <span className="font-mono font-bold text-slate-300">অটোমেটিক ব্যাংক ট্রান্সফার</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

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
