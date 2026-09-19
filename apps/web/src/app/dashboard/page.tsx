'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Order, DashboardMetrics } from '@/lib/types';
import { formatBDTEn } from '@/lib/utils';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { InvoiceModal } from '@/components/orders/InvoiceModal';
import { CancelOrderModal } from '@/components/orders/CancelOrderModal';
import { LiveBotTester } from '@/components/bot/LiveBotTester';
import {
  Package,
  Clock,
  Truck,
  AlertTriangle,
  ArrowUpRight,
  Printer,
  Sparkles,
  Bot,
  PlusCircle,
  ExternalLink,
  PhoneCall,
  CheckCircle2,
  TrendingUp,
  RefreshCw,
  ShoppingBag,
  Zap,
  MessageCircle,
  ShieldCheck,
  Users,
  DollarSign,
  BarChart3,
  Layers,
  ArrowRight,
  Percent,
  Copy,
  Check,
  Activity,
  Send,
  MapPin,
  Flame,
  Bike,
  PackageCheck,
  AlertCircle,
  FileText,
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
import { DirectMessageModal } from '@/components/orders/DirectMessageModal';
import { StoreSetupWizardModal } from '@/components/onboarding/StoreSetupWizardModal';

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);
  const [selectedMessageOrder, setSelectedMessageOrder] = useState<Order | null>(null);
  const [selectedCancelOrder, setSelectedCancelOrder] = useState<Order | null>(null);
  const [showBotTester, setShowBotTester] = useState(false);
  const [showSetupWizard, setShowSetupWizard] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const loadData = async () => {
    try {
      const [m, orders] = await Promise.all([api.getMetrics(), api.getOrders()]);
      setMetrics(m);
      setAllOrders(orders);
      setRecentOrders(orders.slice(0, 6));
    } catch (e) {
      console.error(e);
    }
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setTimeout(() => setIsRefreshing(false), 500);
    toast.success('ড্যাশবোর্ড ডেটা সফলভাবে রিফ্রেশ হয়েছে!');
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 4000);
    fetch('/api/auth')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.user) {
          setCurrentUser(data.user);
        }
      })
      .catch(() => {});
    return () => clearInterval(interval);
  }, []);

  // Step 1: Confirm Order
  const handleConfirmOrder = async (orderId: string) => {
    await api.updateOrderStatus(orderId, 'CONFIRMED');
    toast.success('অর্ডার কনফার্ম করা হয়েছে! এবার ডেলিভারির জন্য পাঠাতে পারেন।');
    loadData();
  };

  // Step 2: Dispatch for Delivery
  const handleDispatchDelivery = async (orderId: string) => {
    await api.updateOrderStatus(orderId, 'IN_TRANSIT');
    toast.success('অর্ডারটি ডেলিভারির জন্য পাঠানো হয়েছে (ইন-ট্রানজিট)!');
    loadData();
  };

  // Step 3: Rider Received / On the way
  const handleRiderReceived = async (orderId: string) => {
    await api.updateOrderStatus(orderId, 'IN_TRANSIT');
    toast.success('পার্সেল অন দ্য ওয়ে ডেলিভারি হচ্ছে।');
    loadData();
  };

  // Step 4: Delivered
  const handleMarkDelivered = async (orderId: string) => {
    await api.updateOrderStatus(orderId, 'DELIVERED');
    toast.success('ডেলিভারি সম্পন্ন হয়েছে ও ক্যাশ কালেকশন কনফার্মড! 🎉');
    loadData();
  };

  // Step 5: Cancel or Return with Note
  const handleConfirmCancelWithNote = async (orderId: string, status: 'CANCELLED' | 'RETURNED', note: string) => {
    await api.updateOrderStatus(orderId, status, note);
    loadData();
  };

  const handleCopyText = (text: string, id: string, label = 'টেক্সট') => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success(`${label} কপি করা হয়েছে!`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Compute 7-day sales chart data based purely on real database orders
  const chartData = useMemo(() => {
    const dayNames = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র', 'শনি'];
    const today = new Date();
    const orderedDays: Array<{ name: string; sales: number; orders: number }> = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dName = dayNames[d.getDay()];
      const dString = d.toISOString().split('T')[0];

      // Find actual real orders created on this exact date
      const dayOrders = allOrders.filter((o) => {
        if (!o.createdAt) return false;
        try {
          const oDate = new Date(o.createdAt).toISOString().split('T')[0];
          return oDate === dString;
        } catch {
          return false;
        }
      });

      const daySales = dayOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);

      orderedDays.push({
        name: dName,
        sales: daySales,
        orders: dayOrders.length,
      });
    }
    return orderedDays;
  }, [allOrders]);

  // Compute Top Selling Products from purely real orders
  const topProducts = useMemo(() => {
    const map: Record<string, { title: string; count: number; revenue: number; category: string }> = {};
    for (const ord of allOrders) {
      for (const it of ord.items || []) {
        const title = it.product?.title || 'প্রিমিয়াম কালেকশন';
        if (!map[title]) {
          map[title] = {
            title,
            count: 0,
            revenue: 0,
            category: title.includes('থ্রি-পিস') ? 'থ্রি-পিস' : title.includes('কুর্তি') ? 'কুর্তি' : title.includes('শাড়ি') ? 'শাড়ি' : 'কালেকশন',
          };
        }
        map[title].count += it.quantity || 1;
        map[title].revenue += (it.unitPrice || 0) * (it.quantity || 1);
      }
    }

    const list = Object.values(map).sort((a, b) => b.count - a.count);
    return list.slice(0, 4);
  }, [allOrders]);

  const totalSalesAmount = metrics?.totalRevenue ?? 0;
  const aov = allOrders.length > 0 ? Math.round(totalSalesAmount / allOrders.length) : 0;
  const successRate = allOrders.length > 0
    ? Math.round(
        (allOrders.filter((o) => o.status === 'DELIVERED' || o.status === 'CONFIRMED' || o.status === 'DISPATCHED_TO_COURIER').length /
          allOrders.length) *
          100
      )
    : 0;

  // Helper for customer initials
  const getInitials = (name?: string) => {
    if (!name) return 'OF';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  return (
    <div className="space-y-8 pb-16 w-full max-w-[1600px] mx-auto">
      {/* Top Banner / Hero with Ambient Mesh Lighting */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#0c1220]/95 via-[#080d18]/95 to-[#04060c]/95 p-6 sm:p-8 lg:p-9 border border-slate-800/80 shadow-[0_20px_50px_rgba(0,0,0,0.7)] backdrop-blur-2xl">
        {/* Ambient Glowing Orbs */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-teal-900/10 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold rounded-full shadow-inner">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>AI সেলস অটোমেশন সক্রিয়</span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-bold rounded-full shadow-inner">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>স্মার্ট ফ্রড প্রটেকশন</span>
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
              স্বাগতম, <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">OrderFlow BD!</span> 👋
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              মেসেঞ্জার ও হোয়াটসঅ্যাপে আপনার স্মার্ট AI সেলস এজেন্ট ২৪ ঘণ্টা কাস্টমারদের সাথে চ্যাট করছে, শাড়ি-ড্রেসের ছবি দেখাচ্ছে এবং নিখুঁত ফোন নম্বর ও ঠিকানা নিয়ে সরাসরি অর্ডার কনফার্ম করছে।
            </p>
          </div>

          {/* Quick Action Toolbar */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowSetupWizard(true)}
              className="flex items-center gap-2.5 px-5 py-3 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 rounded-2xl text-sm font-black shadow-[0_10px_25px_rgba(16,185,129,0.3)] active:scale-95 transition-all cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-slate-950 text-slate-950" />
              <span>৩-স্টেপ সেটআপ</span>
            </button>

            <button
              onClick={() => setShowBotTester(!showBotTester)}
              className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl text-sm font-bold shadow-lg shadow-blue-600/25 active:scale-95 transition-all cursor-pointer"
            >
              <Bot className="w-4 h-4" />
              <span>{showBotTester ? 'সিমুলেটর বন্ধ' : 'লাইভ চ্যাট টেস্ট'}</span>
            </button>

            <button
              onClick={handleManualRefresh}
              className="p-3 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/70 rounded-2xl transition-all shadow-md active:scale-95 cursor-pointer backdrop-blur-md"
              title="রিফ্রেশ করুন"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
            </button>

            <Link
              href="/orders"
              className="flex items-center gap-2 px-4 py-3 bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/70 rounded-2xl text-sm font-bold shadow-md hover:border-slate-500 transition-all active:scale-95 backdrop-blur-md"
            >
              <span>সকল অর্ডার</span>
              <ArrowUpRight className="w-4 h-4 text-slate-400" />
            </Link>
          </div>
        </div>
      </div>

      {/* New Store Quick Setup Checklist (Shown when 0 orders exist) */}
      {allOrders.length === 0 && (
        <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900/90 to-teal-950/30 border border-emerald-500/40 rounded-3xl p-6 shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">🎉 স্বাগতম! আপনার অ্যাকাউন্ট প্রস্তুত</h3>
                <p className="text-xs text-slate-300">মাত্র ৩টি সহজ ধাপে আপনার ফেসবুক পেজ কানেক্ট করে অটোমেশন চালু করুন:</p>
              </div>
            </div>
            <span className="text-[11px] font-mono px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full font-bold w-fit">
              Ready for Setup
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            <Link
              href="/integrations"
              className="p-4 bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/50 rounded-2xl transition-all group block"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white group-hover:text-emerald-300 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-lg bg-blue-500/20 text-blue-300 flex items-center justify-center text-[10px] font-mono">1</span>
                  <span>ফেসবুক পেজ কানেক্ট</span>
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">পেজ আইডি ও টোকেন দিয়ে মেসেঞ্জার লাইভ চ্যাট যুক্ত করুন</p>
            </Link>

            <Link
              href="/bot-settings"
              className="p-4 bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/50 rounded-2xl transition-all group block"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white group-hover:text-emerald-300 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center text-[10px] font-mono">2</span>
                  <span>AI সেলস বট কনফিগার</span>
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">Gemini AI প্রম্পট, ডেলিভারি চার্জ ও FAQ উত্তর নির্ধারণ করুন</p>
            </Link>

            <Link
              href="/products"
              className="p-4 bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/50 rounded-2xl transition-all group block"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white group-hover:text-emerald-300 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-[10px] font-mono">3</span>
                  <span>প্রোডাক্ট ও স্টক যুক্ত করুন</span>
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">আপনার শপের ড্রেস ও পণ্যের ক্যাটালগ এবং স্টক যুক্ত করুন</p>
            </Link>
          </div>
        </div>
      )}

      {/* Live Interactive Messenger Bot Simulator Card (Collapsible) */}
      {showBotTester && (
        <div className="space-y-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Bot className="w-5 h-5 text-blue-400" />
              <span>{currentUser?.organizationName || 'OrderFlow BD'} AI সেলস বট স্টুডিও</span>
            </h3>
            <span className="text-xs text-slate-400">লাইভ কাস্টমার চ্যাট ও অর্ডার টেস্ট সিমুলেটর</span>
          </div>
          <LiveBotTester storeName={currentUser?.organizationName || 'OrderFlow BD'} onOrderCreated={loadData} />
        </div>
      )}

      {/* 6 Key Business Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5 sm:gap-4">
        {/* 1. Today's Orders */}
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
              <span>{metrics?.todayOrders ?? 0}</span>
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

        {/* 2. Pending Confirmation */}
        <Link 
          href="/orders"
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#18140f] to-[#0e0c08] border border-amber-500/25 p-4 space-y-2 shadow-xl hover:border-amber-500/50 transition-all group block cursor-pointer"
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
              <span>{metrics?.pendingCount ?? 0}</span>
              <span className="text-xs font-semibold text-slate-400 font-sans">টি</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">১-ক্লিক কনফার্ম করুন →</p>
          </div>
          <div className="w-full h-1 bg-slate-800 rounded-full mt-2 overflow-hidden">
            <div 
              className="h-full bg-amber-400 rounded-full" 
              style={{ width: `${Math.min(100, ((metrics?.pendingCount ?? 0) / (allOrders.length || 1)) * 100)}%` }} 
            />
          </div>
        </Link>

        {/* 3. Dispatched / In Courier */}
        {/* 3. Dispatched / In Transit */}
        <Link
          href="/orders"
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#161022] to-[#0c0915] border border-purple-500/25 p-4 space-y-2 shadow-xl hover:border-purple-500/50 transition-all group block cursor-pointer"
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
              <span>{metrics?.dispatchedCount ?? 0}</span>
              <span className="text-xs font-semibold text-slate-400 font-sans">টি</span>
            </div>
            <p className="text-[11px] text-purple-300 mt-1">ক্যাশ অন ডেলিভারি (COD)</p>
          </div>
          <div className="w-full h-1 bg-slate-800 rounded-full mt-2 overflow-hidden">
            <div 
              className="h-full bg-purple-400 rounded-full" 
              style={{ width: `${Math.min(100, ((metrics?.dispatchedCount ?? 0) / (allOrders.length || 1)) * 100)}%` }} 
            />
          </div>
        </Link>

        {/* 4. Total Revenue */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0c1814] to-[#070e0b] border border-teal-500/25 p-4 space-y-2 shadow-xl hover:border-teal-500/40 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              মোট বিক্রয়
            </span>
            <div className="w-7 h-7 bg-teal-500/15 border border-teal-500/30 text-teal-400 rounded-xl font-bold text-xs flex items-center justify-center group-hover:scale-110 transition-transform">
              ৳
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono tracking-tight truncate">
              {formatBDTEn(totalSalesAmount)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">ক্যাশ অন ডেলিভারি</p>
          </div>
          <div className="w-full h-1 bg-slate-800 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" style={{ width: '100%' }} />
          </div>
        </div>

        {/* 5. Average Order Value (AOV) */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#101224] to-[#080914] border border-indigo-500/25 p-4 space-y-2 shadow-xl hover:border-indigo-500/40 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              গড় অর্ডার মূল্য
            </span>
            <div className="w-7 h-7 bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-indigo-300 font-mono tracking-tight">
              ৳{aov.toLocaleString()}
            </div>
            <p className="text-[11px] text-indigo-400/80 mt-1">প্রতি অর্ডারে এভারেজ</p>
          </div>
          <div className="w-full h-1 bg-slate-800 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full" style={{ width: '100%' }} />
          </div>
        </div>

        {/* 6. Delivery Success Rate */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0e1816] to-[#070f0e] border border-emerald-500/30 p-4 space-y-2 shadow-xl hover:border-emerald-500/50 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              সাকসেস রেট
            </span>
            <div className="w-7 h-7 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Percent className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono tracking-tight">
              {successRate > 0 ? `${successRate}%` : '১০০%'}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">কম রিটার্ন রিস্ক</p>
          </div>
          <div className="w-full h-1 bg-slate-800 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-emerald-400 rounded-full" style={{ width: '100%' }} />
          </div>
        </div>
      </div>

      {/* Visual Analytics & AI Performance Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales & Orders Weekly Chart */}
        <div className="lg:col-span-2 bg-[#0b0e19]/95 border border-slate-800/90 rounded-[2rem] p-5 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] space-y-4 backdrop-blur-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-400" />
                <h3 className="font-extrabold text-white text-base sm:text-lg">
                  সাপ্তাহিক বিক্রয় ও অর্ডারের গ্রাফ
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                প্রতিদিনের মোট বিক্রয় এবং অর্ডারের লাইভ পরিসংখ্যান
              </p>
            </div>
            <div className="flex items-center gap-3 self-start sm:self-auto text-xs font-bold text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span>বিক্রয় (টাকা)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
                <span>অর্ডার সংখ্যা</span>
              </span>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(val) => `৳${val}`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '16px',
                    color: '#fff',
                    fontSize: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                  }}
                  formatter={(value: any, name: any) => [
                    name === 'sales' ? `৳${Number(value).toLocaleString()}` : `${value} টি`,
                    name === 'sales' ? 'মোট বিক্রয়' : 'অর্ডার সংখ্যা',
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#10b981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#salesGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Selling Products Leaderboard */}
        <div className="bg-[#0b0e19]/95 border border-slate-800/90 rounded-[2rem] p-5 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] space-y-4 flex flex-col justify-between backdrop-blur-2xl">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-indigo-400" />
                <h3 className="font-extrabold text-white text-base sm:text-lg">
                  বেস্ট সেলিং কালেকশন
                </h3>
              </div>
              <Link
                href="/products"
                className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                সব পণ্য →
              </Link>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">সবচেয়ে বেশি অর্ডার হওয়া ড্রেসসমূহ</p>
          </div>

          <div className="space-y-3 my-2">
            {topProducts.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                এখনও কোনো পণ্য বিক্রয় হয়নি।
              </div>
            ) : (
              topProducts.map((prod, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-900/60 hover:bg-slate-850 border border-slate-800 rounded-2xl flex items-center justify-between gap-3 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-200 truncate">{prod.title}</p>
                      <span className="text-[10px] px-2 py-0.5 bg-slate-800 text-slate-400 rounded-md">
                        {prod.category}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-xs font-black text-emerald-400 font-mono">
                      ৳{prod.revenue.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium">
                      {prod.count} টি বিক্রয়
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-3 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/25 rounded-2xl flex items-center justify-between text-xs shadow-inner">
            <span className="text-slate-300 font-medium">AI সেলস পারফর্ম্যান্স</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 fill-emerald-400" />
              ২৪/৭ অটোমেটেড
            </span>
          </div>
        </div>
      </div>

      {/* Business Growth & Automation Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Highlight 1: AI Instant Sales */}
        <div className="p-5 bg-gradient-to-br from-[#0d1320] to-[#070b14] border border-slate-800/90 rounded-2xl space-y-2 shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
            <Zap className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-white">১.২ সেকেন্ডে অটোমেটিক সেলস</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            কাস্টমার মাঝরাতে নক দিলেও কোনো দেরি ছাড়াই মিষ্টি ভাষায় কথা বলে ছবি ও দাম দেখিয়ে অর্ডার বুক করে নেয়।
          </p>
        </div>

        {/* Highlight 2: Fraud & Return Protection */}
        <div className="p-5 bg-gradient-to-br from-[#151022] to-[#0c0916] border border-slate-800/90 rounded-2xl space-y-2 shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-white">নিখুঁত ১১ ডিজিট ভেরিফিকেশন</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            ভুল বা অসম্পূর্ণ ফোন নাম্বার থাকলে বট নিজে ভুল ধরিয়ে দিয়ে সঠিক ১১ ডিজিটের নাম্বার ও ঠিকানা নিশ্চিত করে।
          </p>
        </div>

        {/* Highlight 3: 1-Click Invoice & Memo */}
        <div className="p-5 bg-gradient-to-br from-[#101726] to-[#080d17] border border-slate-800/90 rounded-2xl space-y-2 shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center">
            <Printer className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-white">১-ক্লিক ক্যাশমেমো ও চালান প্রিন্ট</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            এক্সেল শিটে হাত দিয়ে লেখার দরকার নেই। যেকোনো অর্ডারের চালান ও ক্যাশমেমো প্রিন্টারে ১-ক্লিকে প্রিন্ট করুন।
          </p>
        </div>
      </div>

      {/* Recent Live Orders Table */}
      <div className="bg-[#0b0e19]/95 border border-slate-800/90 rounded-[2rem] overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 sm:p-6 border-b border-slate-800/80 gap-3 bg-slate-900/40">
          <div>
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-400" />
              <h3 className="font-extrabold text-white text-base sm:text-lg">
                সাম্প্রতিক লাইভ অর্ডার সমূহ
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              ১-ক্লিক কনফার্মেশন, ডেলিভারি স্ট্যাটাস ও ক্যাশ মেমো প্রিন্ট
            </p>
          </div>
          <Link
            href="/orders"
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1.5 self-start sm:self-auto bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-2 rounded-xl"
          >
            <span>সকল অর্ডার দেখুন ({allOrders.length})</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#070912] text-slate-400 font-semibold border-b border-slate-800 text-xs uppercase tracking-wider">
              <tr>
                <th className="py-4 px-5">অর্ডার নং</th>
                <th className="py-4 px-5">গ্রাহক ও ফোন</th>
                <th className="py-4 px-5">প্রোডাক্ট বিবরণ</th>
                <th className="py-4 px-5">মোট টাকা</th>
                <th className="py-4 px-5">স্ট্যাটাস</th>
                <th className="py-4 px-5 text-right">১-ক্লিক অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    <p className="text-base font-semibold text-slate-300">কোনো নতুন অর্ডার নেই</p>
                    <p className="text-xs text-slate-500 mt-1">ফেসবুক মেসেঞ্জারে মেসেজ দিলে সাথে সাথে এখানে আসবে</p>
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => {
                  const cleanPhone = (order.customerPhone || '').replace(/[^0-9]/g, '');
                  const waUrl = cleanPhone.startsWith('88') ? `https://wa.me/${cleanPhone}` : `https://wa.me/88${cleanPhone}`;

                  return (
                    <tr key={order.id} className="hover:bg-slate-800/40 transition-colors group">
                      {/* Order Number & Channel */}
                      <td className="py-4 px-5 font-mono font-bold text-slate-200 align-top">
                        <span className="px-2.5 py-1 bg-gradient-to-r from-emerald-500/15 to-teal-500/15 border border-emerald-500/30 rounded-xl text-emerald-300 text-sm font-mono">
                          #OF-{order.orderNumber}
                        </span>
                        <div className="mt-1.5 flex items-center gap-1">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-md border font-bold flex items-center gap-1 ${
                              order.channel === 'FACEBOOK_MESSENGER'
                                ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                                : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            {order.channel === 'FACEBOOK_MESSENGER' ? 'Messenger AI' : 'WhatsApp'}
                          </span>
                        </div>
                      </td>

                      {/* Customer Info */}
                      <td className="py-4 px-5 align-top space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-black text-xs flex items-center justify-center shrink-0">
                            {getInitials(order.customerName)}
                          </div>
                          <div>
                            <p className="font-bold text-white text-sm leading-tight">{order.customerName}</p>
                            <p className="text-xs text-slate-300 font-mono flex items-center gap-1.5 mt-0.5">
                              <a href={`tel:${order.customerPhone}`} className="hover:underline hover:text-emerald-300 flex items-center gap-1">
                                <PhoneCall className="w-3 h-3 text-emerald-400" />
                                <span>{order.customerPhone}</span>
                              </a>
                              <a
                                href={waUrl}
                                target="_blank"
                                rel="noreferrer"
                                title="হোয়াটসঅ্যাপে চ্যাট করুন"
                                className="text-[10px] text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 px-1.5 py-0.2 rounded font-sans font-bold"
                              >
                                WA ↗
                              </a>
                            </p>
                          </div>
                        </div>

                        {order.channel === 'FACEBOOK_MESSENGER' && (
                          <div className="pt-0.5">
                            <a
                              href={`https://business.facebook.com/latest/inbox/messenger?mailbox_id=${process.env.NEXT_PUBLIC_DEFAULT_FACEBOOK_PAGE_ID || ''}&selected_item_id=${order.psid || '28626322373646425'}`}
                              target="_blank"
                              rel="noreferrer"
                              title="ফেসবুক ইনবক্সে এই কাস্টমারের চ্যাট ওপেন করুন"
                              className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-blue-500/15 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 font-semibold transition-colors"
                            >
                              <MessageCircle className="w-3 h-3 text-blue-400" />
                              <span>ফেসবুক চ্যাট ↗</span>
                            </a>
                          </div>
                        )}
                      </td>

                      {/* Product Details & Address */}
                      <td className="py-4 px-5 max-w-xs align-top space-y-1">
                        {order.items.map((it, idx) => (
                          <p key={idx} className="text-xs text-slate-100 font-medium leading-tight">
                            • {it.product?.title || 'প্রোডাক্ট'} {it.variant?.name ? `(${it.variant.name})` : ''} × {it.quantity}
                          </p>
                        ))}
                        <div className="flex items-start justify-between gap-1 text-[11px] text-slate-400 pt-1">
                          <span className="truncate">📍 {order.deliveryAddress}</span>
                          <button
                            onClick={() => handleCopyText(order.deliveryAddress, `dash-addr-${order.id}`, 'ঠিকানা')}
                            className="text-slate-400 hover:text-slate-200 shrink-0"
                            title="ঠিকানা কপি করুন"
                          >
                            {copiedId === `dash-addr-${order.id}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </td>

                      {/* Total Price */}
                      <td className="py-4 px-5 font-mono font-black text-emerald-400 text-base align-top">
                        {formatBDTEn(order.totalPrice)}
                      </td>

                      {/* Status Badge */}
                      <td className="py-4 px-5 align-top space-y-1">
                        <OrderStatusBadge status={order.status} />
                        {order.notes && (
                          <div className="text-[10px] text-rose-300 bg-rose-500/10 border border-rose-500/25 px-2 py-0.5 rounded-md flex items-center gap-1 max-w-[180px] truncate" title={order.notes}>
                            <AlertCircle className="w-2.5 h-2.5 text-rose-400 shrink-0" />
                            <span className="truncate">{order.notes}</span>
                          </div>
                        )}
                      </td>

                      {/* 5-Step Actions */}
                      <td className="py-4 px-5 text-right align-top">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Step 1: Pending -> Confirm / Cancel */}
                          {order.status === 'PENDING_CONFIRMATION' && (
                            <>
                              <button
                                onClick={() => handleConfirmOrder(order.id)}
                                className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1 cursor-pointer"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                কনফার্ম
                              </button>
                              <button
                                onClick={() => setSelectedCancelOrder(order)}
                                className="px-2 py-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-bold cursor-pointer"
                              >
                                বাতিল
                              </button>
                            </>
                          )}

                          {/* Step 2: Confirmed -> Dispatched / In Transit */}
                          {order.status === 'CONFIRMED' && (
                            <>
                              <button
                                onClick={() => handleDispatchDelivery(order.id)}
                                className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1 cursor-pointer"
                              >
                                <Truck className="w-3.5 h-3.5" />
                                ডেলিভারিতে পাঠান
                              </button>
                              <button
                                onClick={() => setSelectedCancelOrder(order)}
                                className="px-2 py-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-bold cursor-pointer"
                              >
                                বাতিল
                              </button>
                            </>
                          )}

                          {/* Step 3: Dispatched -> Rider Received */}
                          {order.status === 'DISPATCHED_TO_COURIER' && (
                            <>
                              <button
                                onClick={() => handleRiderReceived(order.id)}
                                className="px-3 py-1.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1 cursor-pointer"
                              >
                                <Bike className="w-3.5 h-3.5" />
                                রাইডার রিসিভ
                              </button>
                              <button
                                onClick={() => setSelectedCancelOrder(order)}
                                className="px-2 py-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-bold cursor-pointer"
                              >
                                রিটার্ন
                              </button>
                            </>
                          )}

                          {/* Step 4: In Transit -> Delivered */}
                          {order.status === 'IN_TRANSIT' && (
                            <>
                              <button
                                onClick={() => handleMarkDelivered(order.id)}
                                className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1 cursor-pointer"
                              >
                                <PackageCheck className="w-3.5 h-3.5" />
                                ডেলিভারড
                              </button>
                              <button
                                onClick={() => setSelectedCancelOrder(order)}
                                className="px-2 py-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-bold cursor-pointer"
                              >
                                রিটার্ন
                              </button>
                            </>
                          )}

                          {/* Step 5: Cancelled/Returned - edit note */}
                          {(order.status === 'CANCELLED' || order.status === 'RETURNED') && (
                            <button
                              onClick={() => setSelectedCancelOrder(order)}
                              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl text-xs font-semibold cursor-pointer flex items-center gap-1"
                            >
                              <FileText className="w-3 h-3 text-slate-400" />
                              <span>নোট</span>
                            </button>
                          )}

                          <button
                            onClick={() => setSelectedMessageOrder(order)}
                            title="সরাসরি গ্রাহককে মেসেজ পাঠান (Messenger / WhatsApp / SMS)"
                            className="px-2.5 py-1.5 bg-indigo-950/70 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/40 rounded-xl transition-all shadow-sm flex items-center gap-1 text-xs font-semibold cursor-pointer"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">মেসেজ</span>
                          </button>

                          <button
                            onClick={() => setSelectedInvoiceOrder(order)}
                            title="মেমো প্রিন্ট করুন"
                            className="p-2 bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 rounded-xl transition-all shadow-sm cursor-pointer"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Modal */}
      <InvoiceModal
        order={selectedInvoiceOrder}
        onClose={() => setSelectedInvoiceOrder(null)}
      />

      {/* Direct Customer Message Modal */}
      <DirectMessageModal
        isOpen={!!selectedMessageOrder}
        onClose={() => setSelectedMessageOrder(null)}
        order={selectedMessageOrder}
        onMessageSent={loadData}
      />

      {/* Cancel Order with Note Modal */}
      <CancelOrderModal
        isOpen={!!selectedCancelOrder}
        onClose={() => setSelectedCancelOrder(null)}
        order={selectedCancelOrder}
        onConfirmCancel={handleConfirmCancelWithNote}
      />

      {/* Store Setup Wizard Modal */}
      <StoreSetupWizardModal
        isOpen={showSetupWizard}
        onClose={() => setShowSetupWizard(false)}
        onComplete={() => {
          loadData();
          setShowSetupWizard(false);
        }}
      />
    </div>
  );
}

