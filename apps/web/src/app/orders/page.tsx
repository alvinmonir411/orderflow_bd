'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Order, OrderStatus } from '@/lib/types';
import { formatBDTEn } from '@/lib/utils';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { InvoiceModal } from '@/components/orders/InvoiceModal';
import { CancelOrderModal } from '@/components/orders/CancelOrderModal';
import {
  Search,
  Filter,
  Truck,
  CheckCircle2,
  Printer,
  ShieldCheck,
  PhoneCall,
  MapPin,
  ExternalLink,
  Package,
  Layers,
  Sparkles,
  ShoppingBag,
  PlusCircle,
  Download,
  RefreshCw,
  X,
  ChevronDown,
  ArrowUpDown,
  CheckSquare,
  Square,
  FileSpreadsheet,
  Trash2,
  MessageCircle,
  TrendingUp,
  Clock,
  ArrowUpRight,
  Check,
  CreditCard,
  User,
  Hash,
  Copy,
  Send,
  MessageSquare,
  Flame,
  CheckCheck,
  Bike,
  PackageCheck,
  XCircle,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { DirectMessageModal } from '@/components/orders/DirectMessageModal';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [channelFilter, setChannelFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'NEWEST' | 'OLDEST' | 'PRICE_HIGH' | 'PRICE_LOW'>('NEWEST');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);
  const [selectedMessageOrder, setSelectedMessageOrder] = useState<Order | null>(null);
  const [selectedCancelOrder, setSelectedCancelOrder] = useState<Order | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Manual Order Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [manualAddress, setManualAddress] = useState('');
  const [manualProduct, setManualProduct] = useState('প্রিমিয়াম টাঙ্গাইল সুতি জামদানি শাড়ি');
  const [manualVariant, setManualVariant] = useState('Standard Size');
  const [manualPrice, setManualPrice] = useState(1300);
  const [manualQuantity, setManualQuantity] = useState(1);
  const [manualDeliveryCharge, setManualDeliveryCharge] = useState(120);
  const [manualDiscount, setManualDiscount] = useState(0);
  const [manualChannel, setManualChannel] = useState<'MANUAL' | 'FACEBOOK_MESSENGER' | 'WHATSAPP'>('MANUAL');

  const loadOrders = async () => {
    try {
      const list = await api.getOrders();
      setOrders(list);
    } catch (e) {
      console.error(e);
    }
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await loadOrders();
    setTimeout(() => setIsRefreshing(false), 400);
    toast.success('অর্ডার তালিকা রিফ্রেশ হয়েছে!');
  };

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 3000);
    return () => clearInterval(interval);
  }, []);

  // Step 1: Confirm Order
  const handleConfirmOrder = async (orderId: string) => {
    await api.updateOrderStatus(orderId, 'CONFIRMED');
    toast.success('অর্ডার কনফার্ম করা হয়েছে! এবার কুরিয়ারে পাঠাতে পারেন।');
    loadOrders();
  };

  // Step 2: Dispatch to Courier (Steadfast / Pathao)
  const handleDispatchSteadfast = async (orderId: string) => {
    const updated = await api.dispatchSteadfast(orderId);
    toast.success(`Steadfast কুরিয়ারে পাঠানো হয়েছে! ট্র্যাকিং: ${updated.courierTrackingId}`);
    loadOrders();
  };

  const handleDispatchPathao = async (orderId: string) => {
    const updated = await api.dispatchPathao(orderId);
    toast.success(`Pathao কুরিয়ারে পাঠানো হয়েছে! ট্র্যাকিং: ${updated.courierTrackingId}`);
    loadOrders();
  };

  // Step 3: Rider Received (In Transit)
  const handleRiderReceived = async (orderId: string) => {
    await api.updateOrderStatus(orderId, 'IN_TRANSIT');
    toast.success('কুরিয়ার রাইডার পার্সেল রিসিভ করেছে! অন দ্য ওয়ে ডেলিভারি হচ্ছে।');
    loadOrders();
  };

  // Step 4: Delivered
  const handleMarkDelivered = async (orderId: string) => {
    await api.updateOrderStatus(orderId, 'DELIVERED');
    toast.success('ডেলিভারি সফলভাবে সম্পন্ন হয়েছে ও ক্যাশ কালেকশন কনফার্মড! 🎉');
    loadOrders();
  };

  // Step 5: Cancel or Return with Note
  const handleConfirmCancelWithNote = async (orderId: string, status: 'CANCELLED' | 'RETURNED', note: string) => {
    await api.updateOrderStatus(orderId, status, note);
    loadOrders();
  };

  const handleCopyText = (text: string, id: string, label = 'টেক্সট') => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success(`${label} কপি করা হয়েছে!`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Bulk Actions
  const handleSelectAll = () => {
    if (selectedOrderIds.length === filteredOrders.length && filteredOrders.length > 0) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(filteredOrders.map((o) => o.id));
    }
  };

  const handleToggleSelect = (orderId: string) => {
    if (selectedOrderIds.includes(orderId)) {
      setSelectedOrderIds(selectedOrderIds.filter((id) => id !== orderId));
    } else {
      setSelectedOrderIds([...selectedOrderIds, orderId]);
    }
  };

  const handleBulkConfirm = async () => {
    if (selectedOrderIds.length === 0) return;
    for (const id of selectedOrderIds) {
      await api.updateOrderStatus(id, 'CONFIRMED');
    }
    toast.success(`${selectedOrderIds.length} টি অর্ডার সফলভাবে কনফার্ম করা হয়েছে!`);
    setSelectedOrderIds([]);
    loadOrders();
  };

  // CSV Export
  const handleExportCSV = () => {
    if (filteredOrders.length === 0) {
      toast.error('এক্সপোর্ট করার মতো কোনো অর্ডার নেই');
      return;
    }

    const headers = ['Order Number', 'Date', 'Customer Name', 'Phone', 'Address', 'Channel', 'Items', 'Total Price', 'Status', 'Courier', 'Tracking', 'Notes'];
    const rows = filteredOrders.map((o) => [
      `#OF-${o.orderNumber}`,
      new Date(o.createdAt).toLocaleDateString('en-GB'),
      `"${(o.customerName || '').replace(/"/g, '""')}"`,
      `"${o.customerPhone || ''}"`,
      `"${(o.deliveryAddress || '').replace(/"/g, '""')}"`,
      o.channel,
      `"${o.items.map((it) => `${it.product?.title || 'Item'} (${it.quantity})`).join(', ')}"`,
      o.totalPrice,
      o.status,
      o.courierProvider || 'N/A',
      o.courierTrackingId || 'N/A',
      `"${(o.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `orderflow_orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('অর্ডার শিট CSV ফাইলে ডাউনলোড হয়েছে!');
  };

  // Create Manual Order
  const handleCreateManualOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName || !manualPhone || !manualAddress) {
      toast.error('অনুগ্রহ করে নাম, ফোন নম্বর ও ডেলিভারি ঠিকানা পূরণ করুন');
      return;
    }

    const itemsTotal = manualPrice * manualQuantity;
    const finalTotal = itemsTotal + Number(manualDeliveryCharge) - Number(manualDiscount);

    await api.createOrder({
      customerName: manualName,
      customerPhone: manualPhone,
      deliveryAddress: manualAddress,
      deliveryCity: manualDeliveryCharge === 120 ? 'ঢাকা সিটি' : 'ঢাকার বাইরে',
      itemsPrice: itemsTotal,
      deliveryCharge: Number(manualDeliveryCharge),
      discount: Number(manualDiscount),
      totalPrice: finalTotal,
      channel: manualChannel,
      status: 'PENDING_CONFIRMATION',
      items: [
        {
          id: `oi-manual-${Date.now()}`,
          orderId: '',
          productId: 'prod-custom',
          product: { title: manualProduct, basePrice: manualPrice },
          variant: { name: manualVariant },
          quantity: manualQuantity,
          unitPrice: manualPrice,
        },
      ],
    });

    toast.success('নতুন ম্যানুয়াল অর্ডার সফলভাবে তৈরি হয়েছে!');
    setIsCreateModalOpen(false);
    setManualName('');
    setManualPhone('');
    setManualAddress('');
    loadOrders();
  };

  // Filter & Sort Logic
  const filteredOrders = orders
    .filter((order) => {
      if (activeTab === 'CANCELLED_OR_RETURNED') {
        if (order.status !== 'CANCELLED' && order.status !== 'RETURNED') return false;
      } else if (activeTab !== 'ALL' && order.status !== activeTab) {
        return false;
      }
      if (channelFilter !== 'ALL' && order.channel !== channelFilter) return false;
      if (searchTerm) {
        const raw = searchTerm.toLowerCase().trim();
        const clean = raw.replace(/[^a-z0-9]/g, '');
        const numStr = String(order.orderNumber).toLowerCase();
        const cleanNum = numStr.replace(/[^a-z0-9]/g, '');
        const formattedNum = `of${numStr}`.replace(/[^a-z0-9]/g, '');

        const matchOrderNum =
          raw.includes(numStr) ||
          numStr.includes(raw) ||
          `#${numStr}`.includes(raw) ||
          `#of-${numStr}`.includes(raw) ||
          `of-${numStr}`.includes(raw) ||
          (clean.length > 0 && (cleanNum.includes(clean) || formattedNum.includes(clean) || clean.includes(cleanNum)));

        const matchName = (order.customerName || '').toLowerCase().includes(raw);
        const matchPhone = (order.customerPhone || '').replace(/[^0-9]/g, '').includes(clean);
        const matchAddress = (order.deliveryAddress || '').toLowerCase().includes(raw);
        const matchNote = (order.notes || '').toLowerCase().includes(raw);

        return matchName || matchPhone || matchAddress || matchOrderNum || matchNote;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'NEWEST') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'OLDEST') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === 'PRICE_HIGH') return b.totalPrice - a.totalPrice;
      if (sortBy === 'PRICE_LOW') return a.totalPrice - b.totalPrice;
      return 0;
    });

  // 5-Step Order Lifecycle Tabs
  const tabs = [
    { id: 'ALL', label: 'সব অর্ডার', count: orders.length },
    {
      id: 'PENDING_CONFIRMATION',
      label: 'পেন্ডিং',
      count: orders.filter((o) => o.status === 'PENDING_CONFIRMATION').length,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    },
    {
      id: 'CONFIRMED',
      label: '১. কনফার্মড',
      count: orders.filter((o) => o.status === 'CONFIRMED').length,
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    },
    {
      id: 'DISPATCHED_TO_COURIER',
      label: '২. কুরিয়ারে পাঠানো',
      count: orders.filter((o) => o.status === 'DISPATCHED_TO_COURIER').length,
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    },
    {
      id: 'IN_TRANSIT',
      label: '৩. রাইডার রিসিভ',
      count: orders.filter((o) => o.status === 'IN_TRANSIT').length,
      badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    },
    {
      id: 'DELIVERED',
      label: '৪. ডেলিভারড',
      count: orders.filter((o) => o.status === 'DELIVERED').length,
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    },
    {
      id: 'CANCELLED_OR_RETURNED',
      label: 'বাতিল / নোট',
      count: orders.filter((o) => o.status === 'CANCELLED' || o.status === 'RETURNED').length,
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    },
  ];

  // Calculated Stats for Current View
  const totalFilteredValue = filteredOrders.reduce((acc, curr) => acc + Number(curr.totalPrice || 0), 0);
  const pendingFilteredCount = orders.filter((o) => o.status === 'PENDING_CONFIRMATION').length;
  const inTransitFilteredCount = orders.filter((o) => o.status === 'DISPATCHED_TO_COURIER' || o.status === 'IN_TRANSIT').length;
  const deliveredFilteredCount = orders.filter((o) => o.status === 'DELIVERED').length;

  // Helper for customer avatar initials
  const getInitials = (name?: string) => {
    if (!name) return 'OF';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  return (
    <div className="space-y-6 pb-20 w-full max-w-[1600px] mx-auto">
      {/* Top Banner Hero with Sleek Glassmorphism & Mesh Lighting */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#0c1220]/95 via-[#080d18]/95 to-[#04060c]/95 p-6 sm:p-8 lg:p-9 border border-slate-800/80 shadow-[0_20px_50px_rgba(0,0,0,0.7)] backdrop-blur-2xl">
        {/* Ambient Glowing Orbs */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-teal-900/10 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold rounded-full shadow-inner">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>রিয়েল-টাইম অর্ডার ট্র্যাকিং ও কুরিয়ার হাব</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
              অর্ডার তালিকা ও <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">সেন্ট্রাল ম্যানেজমেন্ট</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              ফেসবুক মেসেঞ্জার, হোয়াটসঅ্যাপ ও ফোন কলের সব অর্ডার এক ছাতার নিচে। ১-ক্লিকে কুরিয়ার বুকিং, ইনভয়েস প্রিন্ট ও সিএসভি এক্সপোর্ট।
            </p>
          </div>

          {/* Action Buttons Toolbar */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2.5 px-5 py-3 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 rounded-2xl text-sm font-black shadow-[0_10px_25px_rgba(16,185,129,0.3)] active:scale-95 transition-all cursor-pointer group"
            >
              <PlusCircle className="w-4 h-4 stroke-[2.5] group-hover:rotate-90 transition-transform duration-300" />
              <span>ম্যানুয়াল নতুন অর্ডার</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-3 bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/70 rounded-2xl text-sm font-bold shadow-md hover:border-slate-500 transition-all active:scale-95 cursor-pointer backdrop-blur-md"
              title="CSV শিট ডাউনলোড করুন"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>CSV এক্সপোর্ট</span>
            </button>

            <button
              onClick={handleManualRefresh}
              className="p-3 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/70 rounded-2xl transition-all shadow-md active:scale-95 cursor-pointer backdrop-blur-md"
              title="রিফ্রেশ করুন"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* 4 Interactive KPI Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 mt-7 pt-6 border-t border-slate-800/80 relative z-10">
          {/* Stat 1 */}
          <div 
            onClick={() => setActiveTab('ALL')}
            className="bg-gradient-to-br from-slate-900/90 to-slate-950/90 border border-slate-800/90 p-4 rounded-2xl relative overflow-hidden group hover:border-emerald-500/40 transition-all shadow-lg cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">মোট দৃশ্যমান অর্ডার</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl sm:text-3xl font-black font-mono text-white">{filteredOrders.length}</span>
              <span className="text-xs font-bold text-slate-400">টি</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800/80 rounded-full mt-3 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" style={{ width: '100%' }} />
            </div>
          </div>

          {/* Stat 2 */}
          <div className="bg-gradient-to-br from-slate-900/90 to-slate-950/90 border border-slate-800/90 p-4 rounded-2xl relative overflow-hidden group hover:border-teal-500/40 transition-all shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-teal-400 uppercase tracking-wider">মোট অর্ডার মূল্য</span>
              <div className="w-8 h-8 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 group-hover:scale-110 transition-transform">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">{formatBDTEn(totalFilteredValue)}</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800/80 rounded-full mt-3 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 rounded-full" style={{ width: '100%' }} />
            </div>
          </div>

          {/* Stat 3 */}
          <div 
            onClick={() => setActiveTab('PENDING_CONFIRMATION')}
            className="bg-gradient-to-br from-slate-900/90 to-slate-950/90 border border-slate-800/90 p-4 rounded-2xl relative overflow-hidden group hover:border-amber-500/50 transition-all shadow-lg cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">পেন্ডিং কনফার্মেশন</span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl sm:text-3xl font-black font-mono text-amber-400">{pendingFilteredCount}</span>
              <span className="text-xs font-bold text-amber-300/80">টি বাকি</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800/80 rounded-full mt-3 overflow-hidden">
              <div 
                className="h-full bg-amber-400 rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, (pendingFilteredCount / (orders.length || 1)) * 100)}%` }} 
              />
            </div>
          </div>

          {/* Stat 4 */}
          <div 
            onClick={() => setActiveTab('DISPATCHED_TO_COURIER')}
            className="bg-gradient-to-br from-slate-900/90 to-slate-950/90 border border-slate-800/90 p-4 rounded-2xl relative overflow-hidden group hover:border-purple-500/50 transition-all shadow-lg cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">কুরিয়ারে ডেলিভারি পথে</span>
              <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-300 group-hover:scale-110 transition-transform">
                <Truck className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl sm:text-3xl font-black font-mono text-purple-300">{inTransitFilteredCount}</span>
              <span className="text-xs font-bold text-purple-300/80">টি পার্সেল</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800/80 rounded-full mt-3 overflow-hidden">
              <div 
                className="h-full bg-purple-400 rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, (inTransitFilteredCount / (orders.length || 1)) * 100)}%` }} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar: Status Tabs + Search + Channel + Sorting */}
      <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {tabs.map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap border cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 text-white border-emerald-400/50 shadow-lg shadow-emerald-600/30 scale-[1.02]'
                    : 'bg-slate-900/80 hover:bg-slate-800/90 text-slate-300 hover:text-white border-slate-800/90 backdrop-blur-md'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold border ${
                    isSelected
                      ? 'bg-white/20 text-white border-transparent'
                      : tab.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700/60'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search, Channel Dropdown & Sort Dropdown */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="নাম, ফোন বা অর্ডার নং (#OF-4)..."
              className="w-full bg-slate-900/90 border border-slate-750 focus:border-emerald-500 rounded-2xl pl-10 pr-9 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-inner backdrop-blur-md transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs font-bold p-1"
              >
                ✕
              </button>
            )}
          </div>

          {/* Channel Filter */}
          <select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value)}
            className="bg-slate-900/90 border border-slate-750 focus:border-emerald-500 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-200 font-semibold focus:outline-none shadow-sm cursor-pointer backdrop-blur-md"
          >
            <option value="ALL">সব চ্যানেল (All Channels)</option>
            <option value="FACEBOOK_MESSENGER">Facebook Messenger Bot</option>
            <option value="WHATSAPP">WhatsApp Cloud API</option>
            <option value="MANUAL">Manual / Phone Order</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-900/90 border border-slate-750 focus:border-emerald-500 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-200 font-semibold focus:outline-none shadow-sm cursor-pointer backdrop-blur-md"
          >
            <option value="NEWEST">নতুন অর্ডার আগে</option>
            <option value="OLDEST">পুরোনো অর্ডার আগে</option>
            <option value="PRICE_HIGH">বেশি মূল্যের অর্ডার</option>
            <option value="PRICE_LOW">কম মূল্যের অর্ডার</option>
          </select>
        </div>
      </div>

      {/* Bulk Action Banner if rows selected */}
      {selectedOrderIds.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-950/90 via-slate-900 to-slate-900 border border-emerald-500/50 rounded-2xl shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-200 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm font-bold text-white">
              {selectedOrderIds.length} টি অর্ডার নির্বাচিত করা হয়েছে
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleBulkConfirm}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              একসাথে কনফার্ম করুন
            </button>
            <button
              onClick={() => setSelectedOrderIds([])}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-all cursor-pointer"
            >
              নির্বাচন বাতিল
            </button>
          </div>
        </div>
      )}

      {/* Orders Table Container */}
      <div className="bg-[#0b0e19]/95 border border-slate-800/90 rounded-[2rem] overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.6)] w-full backdrop-blur-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#070912] text-slate-400 font-bold border-b border-slate-800 text-xs uppercase tracking-wider">
              <tr>
                <th className="py-4 px-4 w-12 text-center">
                  <button onClick={handleSelectAll} title="সব নির্বাচন করুন" className="cursor-pointer">
                    {selectedOrderIds.length === filteredOrders.length && filteredOrders.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-500 hover:text-slate-300" />
                    )}
                  </button>
                </th>
                <th className="py-4 px-4 font-mono">অর্ডার নং ও চ্যানেল</th>
                <th className="py-4 px-4">গ্রাহকের বিবরণ</th>
                <th className="py-4 px-4">অর্ডার আইটেম ও ডেলিভারি ঠিকানা</th>
                <th className="py-4 px-4 font-mono">মোট বিল</th>
                <th className="py-4 px-4">কুরিয়ার ও স্ট্যাটাস</th>
                <th className="py-4 px-4 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-20 text-slate-400">
                    <div className="w-16 h-16 mx-auto rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mb-3 shadow-inner">
                      <Package className="w-8 h-8 stroke-[1.5]" />
                    </div>
                    <p className="text-lg font-black text-white">কোনো অর্ডার পাওয়া যায়নি</p>
                    <p className="text-xs text-slate-400 mt-1">অন্য কোনো নাম, ফোন নম্বর বা অর্ডার নম্বর দিয়ে সার্চ করুন</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const isChecked = selectedOrderIds.includes(order.id);
                  const cleanPhone = (order.customerPhone || '').replace(/[^0-9]/g, '');
                  const waUrl = cleanPhone.startsWith('88') ? `https://wa.me/${cleanPhone}` : `https://wa.me/88${cleanPhone}`;

                  return (
                    <tr
                      key={order.id}
                      className={`hover:bg-slate-800/40 transition-colors group ${
                        isChecked ? 'bg-emerald-950/25 border-l-4 border-l-emerald-400' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-4 px-4 align-top text-center">
                        <button onClick={() => handleToggleSelect(order.id)} className="cursor-pointer pt-1">
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-600 group-hover:text-slate-400" />
                          )}
                        </button>
                      </td>

                      {/* Order Number & Channel */}
                      <td className="py-4 px-4 align-top space-y-1.5">
                        <span className="font-mono font-black text-emerald-400 text-sm flex items-center gap-1.5">
                          <span className="px-3 py-1 bg-gradient-to-r from-emerald-500/15 via-teal-500/15 to-emerald-500/10 border border-emerald-500/35 rounded-xl text-emerald-300 shadow-sm font-mono tracking-tight">
                            #OF-{order.orderNumber}
                          </span>
                        </span>
                        <div className="flex items-center gap-1.5 pt-0.5">
                          <span
                            className={`px-2.5 py-0.5 text-[10px] font-bold rounded-lg border shadow-sm flex items-center gap-1.5 ${
                              order.channel === 'FACEBOOK_MESSENGER'
                                ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                                : order.channel === 'WHATSAPP'
                                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                                : 'bg-slate-800 text-slate-300 border-slate-700/60'
                            }`}
                          >
                            {order.channel === 'FACEBOOK_MESSENGER' ? (
                              <>
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                                <span>Messenger Bot</span>
                              </>
                            ) : order.channel === 'WHATSAPP' ? (
                              <>
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                <span>WhatsApp</span>
                              </>
                            ) : (
                              <span>Manual Entry</span>
                            )}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>
                            {new Date(order.createdAt).toLocaleTimeString('bn-BD', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </p>
                      </td>

                      {/* Customer Info */}
                      <td className="py-4 px-4 align-top space-y-2">
                        <div className="flex items-center gap-2.5">
                          {/* Avatar Initials */}
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-md">
                            {getInitials(order.customerName)}
                          </div>
                          <div>
                            <p className="font-black text-white text-sm tracking-tight leading-tight">
                              {order.customerName}
                            </p>
                            <p className="text-xs text-slate-300 font-mono flex items-center gap-2 mt-0.5">
                              <a 
                                href={`tel:${order.customerPhone}`} 
                                className="hover:underline hover:text-emerald-300 flex items-center gap-1 font-semibold text-slate-200"
                                title="ফোন করুন"
                              >
                                <PhoneCall className="w-3 h-3 text-emerald-400 shrink-0" />
                                <span>{order.customerPhone}</span>
                              </a>

                              {/* WhatsApp Direct Chat Trigger */}
                              <a
                                href={waUrl}
                                target="_blank"
                                rel="noreferrer"
                                title="হোয়াটসঅ্যাপে সরাসরি চ্যাট ওপেন করুন"
                                className="text-[10px] text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 px-1.5 py-0.2 rounded font-sans font-bold transition-colors"
                              >
                                WA ↗
                              </a>
                            </p>
                          </div>
                        </div>

                        {/* Customer Badges & Cancel/Return Note Display */}
                        <div className="flex flex-col gap-1 pt-0.5">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <div className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-semibold">
                              <ShieldCheck className="w-3 h-3 text-emerald-400" />
                              <span>১০০% ডেলিভারি সাকসেস</span>
                            </div>

                            {order.channel === 'FACEBOOK_MESSENGER' && (
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
                            )}
                          </div>

                          {/* Cancellation / Return Note Pill if exists */}
                          {order.notes && (
                            <div className="p-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-1.5 shadow-sm">
                              <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                              <div>
                                <span className="font-bold text-[10px] uppercase tracking-wider block text-rose-400">
                                  নোট / কারণ:
                                </span>
                                <p className="text-[11px] text-rose-200 leading-snug">{order.notes}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Items & Address */}
                      <td className="py-4 px-4 align-top space-y-2 max-w-sm">
                        {/* Products list */}
                        <div className="space-y-1.5">
                          {order.items.map((it, idx) => (
                            <div key={idx} className="flex flex-wrap items-center gap-1.5 text-xs text-slate-100 font-medium leading-tight">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                              <span className="font-semibold text-slate-100">{it.product?.title || 'প্রোডাক্ট'}</span>
                              {it.variant?.name && (
                                <span className="px-1.5 py-0.5 bg-slate-800/90 text-[10px] rounded-md text-slate-300 font-mono border border-slate-700/60">
                                  {it.variant.name}
                                </span>
                              )}
                              <span className="text-emerald-400 font-bold font-mono">× {it.quantity}</span>
                            </div>
                          ))}
                        </div>

                        {/* Address Pill with 1-Click Copy */}
                        <div className="flex items-start justify-between gap-2 p-2 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-slate-300 leading-relaxed group/addr">
                          <div className="flex items-start gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                            <span className="text-[11px] text-slate-200">{order.deliveryAddress}</span>
                          </div>
                          <button
                            onClick={() => handleCopyText(order.deliveryAddress, `addr-${order.id}`, 'ঠিকানা')}
                            title="ঠিকানা কপি করুন"
                            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded transition-colors shrink-0 cursor-pointer"
                          >
                            {copiedId === `addr-${order.id}` ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Total Price */}
                      <td className="py-4 px-4 align-top space-y-1">
                        <p className="font-mono font-black text-emerald-400 text-lg tracking-tight">
                          {formatBDTEn(order.totalPrice)}
                        </p>
                        <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                          ক্যাশ অন ডেলিভারি
                        </span>
                      </td>

                      {/* Status & Courier */}
                      <td className="py-4 px-4 align-top space-y-2">
                        <OrderStatusBadge status={order.status} />

                        {order.courierTrackingId && (
                          <div className="p-2 bg-purple-500/10 border border-purple-500/25 rounded-xl text-xs space-y-1 shadow-sm">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-purple-300 font-bold uppercase tracking-wider">
                                {order.courierProvider} কুরিয়ার
                              </span>
                              <button
                                onClick={() => handleCopyText(order.courierTrackingId!, `track-${order.id}`, 'ট্র্যাকিং কোড')}
                                className="text-purple-400 hover:text-purple-200 text-[10px] cursor-pointer"
                                title="ট্র্যাকিং আইডি কপি করুন"
                              >
                                {copiedId === `track-${order.id}` ? <Check className="w-2.5 h-2.5" /> : <Copy className="w-2.5 h-2.5" />}
                              </button>
                            </div>
                            <p className="font-mono font-bold text-purple-200 select-all text-xs">
                              {order.courierTrackingId}
                            </p>
                          </div>
                        )}
                      </td>

                      {/* 5-Step Pipeline Actions: Confirm -> Courier -> Rider Recv -> Delivered / Cancel Note */}
                      <td className="py-4 px-4 align-top text-right space-y-2">
                        <div className="flex flex-wrap items-center justify-end gap-1.5">
                          {/* Step 1: Pending -> Confirm */}
                          {order.status === 'PENDING_CONFIRMATION' && (
                            <>
                              <button
                                onClick={() => handleConfirmOrder(order.id)}
                                className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                                <span>কনফার্ম</span>
                              </button>
                              <button
                                onClick={() => setSelectedCancelOrder(order)}
                                title="অর্ডার বাতিল করুন ও নোট লিখুন"
                                className="px-2.5 py-1.5 bg-rose-950/70 hover:bg-rose-900 text-rose-300 border border-rose-500/30 rounded-xl transition-all text-xs font-bold cursor-pointer"
                              >
                                বাতিল
                              </button>
                            </>
                          )}

                          {/* Step 2: Confirmed -> Courier Dispatch */}
                          {order.status === 'CONFIRMED' && (
                            <>
                              <button
                                onClick={() => handleDispatchSteadfast(order.id)}
                                title="Steadfast কুরিয়ারে বুকিং করুন"
                                className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1 cursor-pointer"
                              >
                                <Truck className="w-3.5 h-3.5" />
                                Steadfast
                              </button>
                              <button
                                onClick={() => handleDispatchPathao(order.id)}
                                title="Pathao কুরিয়ারে বুকিং করুন"
                                className="px-3 py-1.5 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1 cursor-pointer"
                              >
                                <Truck className="w-3.5 h-3.5" />
                                Pathao
                              </button>
                              <button
                                onClick={() => setSelectedCancelOrder(order)}
                                title="অর্ডার বাতিল বা রিটার্ন নোট"
                                className="px-2 py-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-bold cursor-pointer"
                              >
                                বাতিল
                              </button>
                            </>
                          )}

                          {/* Step 3: Dispatched to Courier -> Rider Received (In Transit) */}
                          {order.status === 'DISPATCHED_TO_COURIER' && (
                            <>
                              <button
                                onClick={() => handleRiderReceived(order.id)}
                                title="কুরিয়ার রাইডার পার্সেল রিসিভ করেছে"
                                className="px-3 py-1.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer"
                              >
                                <Bike className="w-3.5 h-3.5" />
                                <span>রাইডার রিসিভ</span>
                              </button>
                              <button
                                onClick={() => setSelectedCancelOrder(order)}
                                title="পার্সেল রিটার্ন বা বাতিল নোট"
                                className="px-2 py-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-bold cursor-pointer"
                              >
                                রিটার্ন/নোট
                              </button>
                            </>
                          )}

                          {/* Step 4: In Transit -> Delivered */}
                          {order.status === 'IN_TRANSIT' && (
                            <>
                              <button
                                onClick={() => handleMarkDelivered(order.id)}
                                title="কাস্টমার পার্সেল পেয়েছে ও ক্যাশ পেমেন্ট সম্পন্ন"
                                className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer"
                              >
                                <PackageCheck className="w-3.5 h-3.5" />
                                <span>ডেলিভারড</span>
                              </button>
                              <button
                                onClick={() => setSelectedCancelOrder(order)}
                                title="কাস্টমার পার্সেল নেয়নি / রিটার্ন এসেছে"
                                className="px-2.5 py-1.5 bg-rose-950/70 hover:bg-rose-900 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-bold cursor-pointer"
                              >
                                রিটার্ন/বাতিল
                              </button>
                            </>
                          )}

                          {/* Step 5: If Cancelled or Returned - edit note option */}
                          {(order.status === 'CANCELLED' || order.status === 'RETURNED') && (
                            <button
                              onClick={() => setSelectedCancelOrder(order)}
                              title="নোট সম্পাদনা করুন"
                              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl text-xs font-semibold cursor-pointer flex items-center gap-1"
                            >
                              <FileText className="w-3 h-3 text-slate-400" />
                              <span>নোট এডিট</span>
                            </button>
                          )}

                          {/* Direct Message Customer Button */}
                          <button
                            onClick={() => setSelectedMessageOrder(order)}
                            title="সরাসরি গ্রাহককে মেসেজ পাঠান (Messenger / WhatsApp / SMS)"
                            className="px-3 py-1.5 bg-indigo-950/70 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/40 rounded-xl transition-all shadow-sm flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">মেসেজ</span>
                          </button>

                          {/* Invoice Print Button */}
                          <button
                            onClick={() => setSelectedInvoiceOrder(order)}
                            title="ইনভয়েস প্রিন্ট"
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

      {/* Manual Order Creation Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl p-4 animate-in fade-in duration-200">
          <div className="bg-[#0f1422] border border-slate-800 rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.8)]">
            <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-[#0a0e1a]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black shadow-md shadow-emerald-500/20">
                  <PlusCircle className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="font-black text-white text-base sm:text-lg">
                    নতুন ম্যানুয়াল অর্ডার এন্ট্রি
                  </h3>
                  <p className="text-xs text-slate-400">ফোন কল বা সরাসরি নেওয়া অর্ডারের তথ্য এন্ট্রি করুন</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateManualOrder} className="p-6 sm:p-7 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    গ্রাহকের পূর্ণ নাম *
                  </label>
                  <input
                    type="text"
                    required
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                    placeholder="যেমন: আলভিন মনির"
                    className="w-full bg-slate-900 border border-slate-700/80 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    ১১ ডিজিট মোবাইল নম্বর *
                  </label>
                  <input
                    type="tel"
                    required
                    value={manualPhone}
                    onChange={(e) => setManualPhone(e.target.value)}
                    placeholder="017XXXXXXXX"
                    className="w-full bg-slate-900 border border-slate-700/80 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  সম্পূর্ণ ডেলিভারি ঠিকানা *
                </label>
                <textarea
                  required
                  rows={2}
                  value={manualAddress}
                  onChange={(e) => setManualAddress(e.target.value)}
                  placeholder="বাড়ি নং, রোড নং, এলাকা, থানা, জেলা (যেমন: হাউজ #১২, রোড #৪, বনশ্রী, ঢাকা)"
                  className="w-full bg-slate-900 border border-slate-700/80 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    প্রোডাক্টের নাম
                  </label>
                  <input
                    type="text"
                    value={manualProduct}
                    onChange={(e) => setManualProduct(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700/80 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    সাইজ / ভ্যারিয়েন্ট
                  </label>
                  <input
                    type="text"
                    value={manualVariant}
                    onChange={(e) => setManualVariant(e.target.value)}
                    placeholder="যেমন: Size: L (40)"
                    className="w-full bg-slate-900 border border-slate-700/80 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    মূল্য (৳)
                  </label>
                  <input
                    type="number"
                    value={manualPrice}
                    onChange={(e) => setManualPrice(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700/80 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    পরিমাণ
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={manualQuantity}
                    onChange={(e) => setManualQuantity(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700/80 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    ডেলিভারি চার্জ (৳)
                  </label>
                  <select
                    value={manualDeliveryCharge}
                    onChange={(e) => setManualDeliveryCharge(Number(e.target.value))}
                    className="w-full bg-[#080b12] border border-slate-750 focus:border-emerald-500 rounded-2xl px-3 py-2 text-sm text-white font-mono focus:outline-none shadow-inner cursor-pointer"
                  >
                    <option value={120}>ঢাকা সিটি (৳১২০)</option>
                    <option value={150}>ঢাকার বাইরে (৳১৫০)</option>
                    <option value={0}>ফ্রি ডেলিভারি (৳০)</option>
                  </select>
                </div>
              </div>

              <div className="p-4 bg-[#080b12] border border-slate-800 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400">সর্বমোট প্রদেয় বিল (COD):</span>
                  <p className="text-xl font-black text-emerald-400 font-mono">
                    {formatBDTEn(manualPrice * manualQuantity + manualDeliveryCharge - manualDiscount)}
                  </p>
                </div>
                <span className="text-xs font-bold px-3 py-1 bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 rounded-xl">
                  ক্যাশ অন ডেলিভারি
                </span>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl text-sm font-semibold transition-colors cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl text-sm font-bold shadow-md shadow-emerald-600/25 active:scale-95 transition-all cursor-pointer"
                >
                  অর্ডার সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
        onMessageSent={loadOrders}
      />

      {/* Cancel Order with Note Modal */}
      <CancelOrderModal
        isOpen={!!selectedCancelOrder}
        onClose={() => setSelectedCancelOrder(null)}
        order={selectedCancelOrder}
        onConfirmCancel={handleConfirmCancelWithNote}
      />
    </div>
  );
}
