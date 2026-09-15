'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Order, OrderStatus } from '@/lib/types';
import { formatBDTEn } from '@/lib/utils';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { InvoiceModal } from '@/components/orders/InvoiceModal';
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
} from 'lucide-react';
import { toast } from 'sonner';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [channelFilter, setChannelFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'NEWEST' | 'OLDEST' | 'PRICE_HIGH' | 'PRICE_LOW'>('NEWEST');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);

  // Manual Order Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [manualAddress, setManualAddress] = useState('');
  const [manualProduct, setManualProduct] = useState('প্রিমিয়াম কাশ্মীরি কুর্তি');
  const [manualVariant, setManualVariant] = useState('Size: L (40)');
  const [manualPrice, setManualPrice] = useState(850);
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

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    await api.updateOrderStatus(orderId, newStatus);
    toast.success('অর্ডারের স্ট্যাটাস আপডেট হয়েছে!');
    loadOrders();
  };

  const handleDispatchSteadfast = async (orderId: string) => {
    const updated = await api.dispatchSteadfast(orderId);
    toast.success(`Steadfast কুরিয়ারে বুকিং সম্পন্ন! ট্র্যাকিং: ${updated.courierTrackingId}`);
    loadOrders();
  };

  const handleDispatchPathao = async (orderId: string) => {
    const updated = await api.dispatchPathao(orderId);
    toast.success(`Pathao কুরিয়ারে বুকিং সম্পন্ন! ট্র্যাকিং: ${updated.courierTrackingId}`);
    loadOrders();
  };

  // Bulk Actions
  const handleSelectAll = () => {
    if (selectedOrderIds.length === filteredOrders.length) {
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

    const headers = ['Order Number', 'Date', 'Customer Name', 'Phone', 'Address', 'Channel', 'Items', 'Total Price', 'Status', 'Courier', 'Tracking'];
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
      if (activeTab !== 'ALL' && order.status !== activeTab) return false;
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

        return matchName || matchPhone || matchAddress || matchOrderNum;
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

  const tabs = [
    { id: 'ALL', label: 'সব অর্ডার', count: orders.length },
    {
      id: 'PENDING_CONFIRMATION',
      label: 'পেন্ডিং',
      count: orders.filter((o) => o.status === 'PENDING_CONFIRMATION').length,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    {
      id: 'CONFIRMED',
      label: 'কনফার্মড',
      count: orders.filter((o) => o.status === 'CONFIRMED').length,
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    },
    {
      id: 'DISPATCHED_TO_COURIER',
      label: 'কুরিয়ারে পাঠানো',
      count: orders.filter((o) => o.status === 'DISPATCHED_TO_COURIER').length,
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    },
    {
      id: 'DELIVERED',
      label: 'ডেলিভারড',
      count: orders.filter((o) => o.status === 'DELIVERED').length,
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    },
    {
      id: 'CANCELLED',
      label: 'বাতিল',
      count: orders.filter((o) => o.status === 'CANCELLED').length,
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    },
  ];

  // Calculated Stats for Current View
  const totalFilteredValue = filteredOrders.reduce((acc, curr) => acc + Number(curr.totalPrice || 0), 0);
  const pendingFilteredCount = filteredOrders.filter((o) => o.status === 'PENDING_CONFIRMATION').length;
  const inTransitFilteredCount = filteredOrders.filter((o) => o.status === 'DISPATCHED_TO_COURIER').length;

  return (
    <div className="space-y-6 pb-16 w-full">
      {/* Full-Width Header Box with Expanded Controls */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#121622] via-[#0e1017] to-[#090b10] p-6 sm:p-8 border border-neutral-800/90 shadow-2xl w-full">
        {/* Glow Effects */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold rounded-full shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>রিয়েল-টাইম অর্ডার ট্র্যাকিং ও কুরিয়ার হাব</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-neutral-100 tracking-tight">
              অর্ডার তালিকা ও সেন্ট্রাল ম্যানেজমেন্ট
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-3xl leading-relaxed">
              ফেসবুক মেসেঞ্জার, হোয়াটসঅ্যাপ ও ফোন কলের সব অর্ডার এক ছাতার নিচে। ১-ক্লিকে কুরিয়ার বুকিং, ইনভয়েস প্রিন্ট ও সিএসভি এক্সপোর্ট।
            </p>
          </div>

          {/* Action Buttons Toolbar */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl text-sm font-bold shadow-lg shadow-emerald-600/25 active:scale-95 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>ম্যানুয়াল নতুন অর্ডার</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-3 bg-[#161a26] hover:bg-neutral-800 text-neutral-200 border border-neutral-750 rounded-2xl text-sm font-bold shadow-md hover:border-neutral-600 transition-all active:scale-95"
              title="CSV শিট ডাউনলোড করুন"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>CSV এক্সপোর্ট</span>
            </button>

            <button
              onClick={handleManualRefresh}
              className="p-3 bg-[#161a26] hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-750 rounded-2xl transition-all shadow-md active:scale-95"
              title="রিফ্রেশ করুন"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Live Mini Stats Ribbon inside Header */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-neutral-800/80 relative z-10">
          <div className="bg-[#090b10]/80 border border-neutral-800/80 p-3.5 rounded-2xl">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">মোট দৃশ্যমান অর্ডার</span>
            <span className="text-xl sm:text-2xl font-black font-mono text-neutral-100 mt-0.5 block">{filteredOrders.length} টি</span>
          </div>

          <div className="bg-[#090b10]/80 border border-neutral-800/80 p-3.5 rounded-2xl">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">মোট অর্ডার মূল্য</span>
            <span className="text-xl sm:text-2xl font-black font-mono text-emerald-400 mt-0.5 block">{formatBDTEn(totalFilteredValue)}</span>
          </div>

          <div className="bg-[#090b10]/80 border border-neutral-800/80 p-3.5 rounded-2xl">
            <span className="text-[11px] font-bold text-amber-400/90 uppercase tracking-wider block">পেন্ডিং কনফার্মেশন</span>
            <span className="text-xl sm:text-2xl font-black font-mono text-amber-400 mt-0.5 block">{pendingFilteredCount} টি</span>
          </div>

          <div className="bg-[#090b10]/80 border border-neutral-800/80 p-3.5 rounded-2xl">
            <span className="text-[11px] font-bold text-purple-400/90 uppercase tracking-wider block">কুরিয়ারে ডেলিভারি পথে</span>
            <span className="text-xl sm:text-2xl font-black font-mono text-purple-300 mt-0.5 block">{inTransitFilteredCount} টি</span>
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
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap border ${
                  isSelected
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-400/30 shadow-lg shadow-emerald-600/20'
                    : 'bg-[#10131c] hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 border-neutral-800'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold border ${
                    isSelected
                      ? 'bg-white/20 text-white border-transparent'
                      : tab.badgeColor || 'bg-neutral-800 text-neutral-300 border-neutral-700/50'
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
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="নাম, ফোন বা অর্ডার নং (#OF-7953)..."
              className="w-full bg-[#10131c] border border-neutral-750 rounded-2xl pl-10 pr-9 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 shadow-inner"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-200 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Channel Filter */}
          <select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value)}
            className="bg-[#10131c] border border-neutral-750 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-neutral-200 font-semibold focus:outline-none focus:border-emerald-500 shadow-sm cursor-pointer"
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
            className="bg-[#10131c] border border-neutral-750 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-neutral-200 font-semibold focus:outline-none focus:border-emerald-500 shadow-sm cursor-pointer"
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
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-950/80 via-neutral-900 to-neutral-900 border border-emerald-500/40 rounded-2xl shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm font-bold text-neutral-100">
              {selectedOrderIds.length} টি অর্ডার নির্বাচিত করা হয়েছে
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleBulkConfirm}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              একসাথে কনফার্ম করুন
            </button>
            <button
              onClick={() => setSelectedOrderIds([])}
              className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-xs font-semibold transition-all"
            >
              নির্বাচন বাতিল
            </button>
          </div>
        </div>
      )}

      {/* Orders Table Container */}
      <div className="bg-[#10121a] border border-neutral-800/90 rounded-3xl overflow-hidden shadow-2xl w-full">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#0b0d14] text-neutral-400 font-semibold border-b border-neutral-800 text-xs uppercase tracking-wider">
              <tr>
                <th className="py-4 px-4 w-12 text-center">
                  <button onClick={handleSelectAll} title="সব নির্বাচন করুন">
                    {selectedOrderIds.length === filteredOrders.length && filteredOrders.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Square className="w-4 h-4 text-neutral-500" />
                    )}
                  </button>
                </th>
                <th className="py-4 px-4">অর্ডার নং ও চ্যানেল</th>
                <th className="py-4 px-4">গ্রাহকের বিবরণ</th>
                <th className="py-4 px-4">অর্ডার আইটেম ও ঠিকানা</th>
                <th className="py-4 px-4">মোট বিল</th>
                <th className="py-4 px-4">কুরিয়ার ও স্ট্যাটাস</th>
                <th className="py-4 px-4 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-20 text-neutral-400">
                    <Package className="w-10 h-10 text-neutral-600 mx-auto mb-2.5" />
                    <p className="text-lg font-bold text-neutral-300">কোনো অর্ডার পাওয়া যায়নি</p>
                    <p className="text-xs text-neutral-500 mt-1">অন্য কোনো নাম, ফোন নম্বর বা অর্ডার নম্বর দিয়ে সার্চ করুন</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const isChecked = selectedOrderIds.includes(order.id);

                  return (
                    <tr
                      key={order.id}
                      className={`hover:bg-neutral-850/40 transition-colors group ${
                        isChecked ? 'bg-emerald-950/15' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-4 px-4 align-top text-center">
                        <button onClick={() => handleToggleSelect(order.id)}>
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Square className="w-4 h-4 text-neutral-600 group-hover:text-neutral-400" />
                          )}
                        </button>
                      </td>

                      {/* Order Number */}
                      <td className="py-4 px-4 align-top">
                        <span className="font-mono font-bold text-emerald-400 text-base flex items-center gap-1.5">
                          <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 shadow-sm">
                            #OF-{order.orderNumber}
                          </span>
                        </span>
                        <div className="mt-2 flex items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold rounded-lg border shadow-sm ${
                              order.channel === 'FACEBOOK_MESSENGER'
                                ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                                : order.channel === 'WHATSAPP'
                                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                                : 'bg-neutral-800 text-neutral-300 border-neutral-700/60'
                            }`}
                          >
                            {order.channel === 'FACEBOOK_MESSENGER'
                              ? 'Messenger Bot'
                              : order.channel === 'WHATSAPP'
                              ? 'WhatsApp'
                              : 'Manual Order'}
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-500 mt-1 font-mono">
                          {new Date(order.createdAt).toLocaleTimeString('bn-BD', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </td>

                      {/* Customer */}
                      <td className="py-4 px-4 align-top space-y-1.5">
                        <p className="font-bold text-neutral-100 text-sm">{order.customerName}</p>
                        <p className="text-xs text-neutral-300 font-mono flex items-center gap-1.5">
                          <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{order.customerPhone}</span>
                        </p>

                        {/* Customer Risk Indicator */}
                        <div className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-semibold">
                          <ShieldCheck className="w-3 h-3 text-emerald-400" />
                          <span>১০০% ডেলিভারি সাকসেস</span>
                        </div>
                      </td>

                      {/* Items & Address */}
                      <td className="py-4 px-4 align-top space-y-1 max-w-sm">
                        <div className="space-y-0.5">
                          {order.items.map((it, idx) => (
                            <p key={idx} className="text-xs text-neutral-200 font-medium leading-tight">
                              • {it.product?.title || 'প্রোডাক্ট'} {it.variant?.name ? `(${it.variant.name})` : ''} × {it.quantity}
                            </p>
                          ))}
                        </div>
                        <p className="text-xs text-neutral-400 flex items-start gap-1.5 pt-1.5 leading-relaxed">
                          <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                          <span>{order.deliveryAddress}</span>
                        </p>
                      </td>

                      {/* Total Price */}
                      <td className="py-4 px-4 align-top">
                        <p className="font-mono font-black text-emerald-400 text-lg">
                          {formatBDTEn(order.totalPrice)}
                        </p>
                        <p className="text-[11px] text-neutral-400">ক্যাশ অন ডেলিভারি</p>
                      </td>

                      {/* Status & Courier */}
                      <td className="py-4 px-4 align-top space-y-2">
                        <OrderStatusBadge status={order.status} />

                        {order.courierTrackingId && (
                          <div className="p-2 bg-purple-500/10 border border-purple-500/25 rounded-xl text-xs space-y-0.5 shadow-sm">
                            <p className="text-[10px] text-purple-300 font-bold uppercase tracking-wider">
                              {order.courierProvider} কুরিয়ার
                            </p>
                            <p className="font-mono font-bold text-purple-200">
                              {order.courierTrackingId}
                            </p>
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 align-top text-right space-y-2">
                        <div className="flex flex-wrap items-center justify-end gap-1.5">
                          {order.status === 'PENDING_CONFIRMATION' && (
                            <button
                              onClick={() => handleStatusChange(order.id, 'CONFIRMED')}
                              className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              কনফার্ম
                            </button>
                          )}

                          {order.status === 'CONFIRMED' && (
                            <>
                              <button
                                onClick={() => handleDispatchSteadfast(order.id)}
                                className="px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1"
                              >
                                <Truck className="w-3.5 h-3.5" />
                                Steadfast
                              </button>
                              <button
                                onClick={() => handleDispatchPathao(order.id)}
                                className="px-3.5 py-1.5 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1"
                              >
                                <Truck className="w-3.5 h-3.5" />
                                Pathao
                              </button>
                            </>
                          )}

                          {order.status === 'DISPATCHED_TO_COURIER' && (
                            <button
                              onClick={() => handleStatusChange(order.id, 'DELIVERED')}
                              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-md"
                            >
                              ডেলিভারড মার্ক
                            </button>
                          )}

                          <button
                            onClick={() => setSelectedInvoiceOrder(order)}
                            title="ইনভয়েস প্রিন্ট"
                            className="p-2 bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-750 rounded-xl transition-all shadow-sm"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-[#10131c] border border-neutral-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-neutral-800 bg-[#0d0f17]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-neutral-100 text-base sm:text-lg">
                    নতুন ম্যানুয়াল অর্ডার এন্ট্রি
                  </h3>
                  <p className="text-xs text-neutral-400">ফোন কল বা সরাসরি নেওয়া অর্ডারের তথ্য এন্ট্রি করুন</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-2 text-neutral-400 hover:text-neutral-100 rounded-xl hover:bg-neutral-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateManualOrder} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                    গ্রাহকের পুরো নাম *
                  </label>
                  <input
                    type="text"
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                    placeholder="যেমন: আলভিন মনির"
                    required
                    className="w-full bg-[#0a0c12] border border-neutral-750 rounded-2xl px-4 py-2.5 text-sm text-neutral-100 focus:outline-none focus:border-emerald-500 shadow-inner"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                    মোবাইল নম্বর (১১ ডিজিট) *
                  </label>
                  <input
                    type="text"
                    value={manualPhone}
                    onChange={(e) => setManualPhone(e.target.value)}
                    placeholder="01938909812"
                    required
                    className="w-full bg-[#0a0c12] border border-neutral-750 rounded-2xl px-4 py-2.5 text-sm text-neutral-100 font-mono focus:outline-none focus:border-emerald-500 shadow-inner"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                  সম্পূর্ণ ডেলিভারি ঠিকানা *
                </label>
                <input
                  type="text"
                  value={manualAddress}
                  onChange={(e) => setManualAddress(e.target.value)}
                  placeholder="যেমন: বাসা #১২, রোড #৪, মিরপুর ১০, ঢাকা"
                  required
                  className="w-full bg-[#0a0c12] border border-neutral-750 rounded-2xl px-4 py-2.5 text-sm text-neutral-100 focus:outline-none focus:border-emerald-500 shadow-inner"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                    প্রোডাক্ট নির্বাচন
                  </label>
                  <select
                    value={manualProduct}
                    onChange={(e) => {
                      setManualProduct(e.target.value);
                      if (e.target.value.includes('কুর্তি')) setManualPrice(850);
                      else if (e.target.value.includes('থ্রি-পিস')) setManualPrice(1250);
                      else if (e.target.value.includes('গাউন')) setManualPrice(1500);
                    }}
                    className="w-full bg-[#0a0c12] border border-neutral-750 rounded-2xl px-4 py-2.5 text-sm text-neutral-100 focus:outline-none focus:border-emerald-500 shadow-inner"
                  >
                    <option value="প্রিমিয়াম কাশ্মীরি কুর্তি">প্রিমিয়াম কাশ্মীরি কুর্তি (৳৮৫০)</option>
                    <option value="জয়পুরি কটন আনস্টিচড থ্রি-পিস">জয়পুরি কটন আনস্টিচড থ্রি-পিস (৳১২৫০)</option>
                    <option value="ডিজাইনার পার্টি গাউন">ডিজাইনার পার্টি গাউন (৳১৫০০)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                    সাইজ / ভ্যারিয়েন্ট
                  </label>
                  <select
                    value={manualVariant}
                    onChange={(e) => setManualVariant(e.target.value)}
                    className="w-full bg-[#0a0c12] border border-neutral-750 rounded-2xl px-4 py-2.5 text-sm text-neutral-100 focus:outline-none focus:border-emerald-500 shadow-inner"
                  >
                    <option value="Size: M (38)">Size: M (38)</option>
                    <option value="Size: L (40)">Size: L (40)</option>
                    <option value="Size: XL (42)">Size: XL (42)</option>
                    <option value="Free Size">Free Size</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                    মূল্য (টাকা)
                  </label>
                  <input
                    type="number"
                    value={manualPrice}
                    onChange={(e) => setManualPrice(Number(e.target.value))}
                    className="w-full bg-[#0a0c12] border border-neutral-750 rounded-2xl px-3 py-2 text-sm text-neutral-100 font-mono focus:outline-none focus:border-emerald-500 shadow-inner"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                    পরিমাণ (Qty)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={manualQuantity}
                    onChange={(e) => setManualQuantity(Number(e.target.value))}
                    className="w-full bg-[#0a0c12] border border-neutral-750 rounded-2xl px-3 py-2 text-sm text-neutral-100 font-mono focus:outline-none focus:border-emerald-500 shadow-inner"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                    ডেলিভারি চার্জ
                  </label>
                  <select
                    value={manualDeliveryCharge}
                    onChange={(e) => setManualDeliveryCharge(Number(e.target.value))}
                    className="w-full bg-[#0a0c12] border border-neutral-750 rounded-2xl px-3 py-2 text-sm text-neutral-100 font-mono focus:outline-none focus:border-emerald-500 shadow-inner"
                  >
                    <option value={120}>ঢাকা সিটি (৳১২০)</option>
                    <option value={150}>ঢাকার বাইরে (৳১৫০)</option>
                    <option value={0}>ফ্রি ডেলিভারি (৳০)</option>
                  </select>
                </div>
              </div>

              <div className="p-4 bg-[#0a0c12] border border-neutral-800 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-xs text-neutral-400">সর্বমোট প্রদেয় বিল (COD):</span>
                  <p className="text-xl font-black text-emerald-400 font-mono">
                    {formatBDTEn(manualPrice * manualQuantity + manualDeliveryCharge - manualDiscount)}
                  </p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 rounded-xl">
                  ক্যাশ অন ডেলিভারি
                </span>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-5 py-2.5 bg-neutral-800 hover:bg-neutral-750 text-neutral-300 rounded-2xl text-sm font-semibold transition-colors"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl text-sm font-bold shadow-md shadow-emerald-600/25 active:scale-95 transition-all"
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
    </div>
  );
}
