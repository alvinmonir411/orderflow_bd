'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Order, DashboardMetrics } from '@/lib/types';
import { formatBDTEn } from '@/lib/utils';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { InvoiceModal } from '@/components/orders/InvoiceModal';
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
} from 'lucide-react';
import { toast } from 'sonner';
import { DirectMessageModal } from '@/components/orders/DirectMessageModal';

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);
  const [selectedMessageOrder, setSelectedMessageOrder] = useState<Order | null>(null);
  const [showBotTester, setShowBotTester] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [m, orders] = await Promise.all([api.getMetrics(), api.getOrders()]);
      setMetrics(m);
      setRecentOrders(orders.slice(0, 5));
    } catch (e) {
      console.error(e);
    }
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setTimeout(() => setIsRefreshing(false), 500);
    toast.success('ড্যাশবোর্ড ডেটা রিফ্রেশ হয়েছে!');
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleConfirmOrder = async (orderId: string) => {
    await api.updateOrderStatus(orderId, 'CONFIRMED');
    toast.success('অর্ডারটি কনফার্ম করা হয়েছে! কাস্টমারকে মেসেজ পাঠানো হয়েছে।');
    loadData();
  };

  const handleDispatchSteadfast = async (orderId: string) => {
    const updated = await api.dispatchSteadfast(orderId);
    toast.success(`Steadfast কুরিয়ারে বুকিং সম্পন্ন! ট্র্যাকিং: ${updated.courierTrackingId}`);
    loadData();
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner / Hero */}
      <div className="relative overflow-hidden rounded-3xl border border-neutral-800/90 bg-gradient-to-br from-[#121622] via-[#0e1017] to-[#0a0c12] p-6 sm:p-8 shadow-2xl">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold rounded-full shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>রিয়েল-টাইম এফ-কমার্স অটোমেশন</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-neutral-100 tracking-tight">
              স্বাগতম, <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">Moner Kotha!</span> 👋
            </h2>
            <p className="text-sm text-neutral-400 max-w-2xl leading-relaxed">
              ফেসবুক মেসেঞ্জার ও হোয়াটসঅ্যাপে আসা সকল অর্ডার সরাসরি এখানে সিংক্রোনাইজ হচ্ছে। এক ক্লিকেই কনফার্ম করুন ও কুরিয়ারে বুকিং দিন।
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleManualRefresh}
              className="p-2.5 bg-neutral-900/90 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700/80 rounded-2xl transition-all active:scale-95 shadow-md"
              title="রিফ্রেশ করুন"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
            </button>

            <button
              onClick={() => setShowBotTester(!showBotTester)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl text-sm font-bold shadow-lg shadow-blue-600/25 active:scale-95 transition-all"
            >
              <Bot className="w-4 h-4" />
              {showBotTester ? 'বট সিমুলেটর বন্ধ করুন' : 'লাইভ বট টেস্ট করুন'}
            </button>

            <Link
              href="/orders"
              className="flex items-center gap-2 px-4 py-2.5 bg-neutral-850/80 hover:bg-neutral-800 text-neutral-200 border border-neutral-700/80 rounded-2xl text-sm font-semibold transition-all hover:border-neutral-600 shadow-md"
            >
              <span>সকল অর্ডার তালিকা</span>
              <ArrowUpRight className="w-4 h-4 text-neutral-400" />
            </Link>
          </div>
        </div>
      </div>

      {/* Live Interactive Messenger Bot Simulator Card (Collapsible) */}
      {showBotTester && (
        <div className="space-y-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-base font-bold text-neutral-200 flex items-center gap-2">
              <Bot className="w-5 h-5 text-blue-400" />
              লাইভ কাস্টমার চ্যাট ও অর্ডার সিমুলেটর
            </h3>
            <span className="text-xs text-neutral-400">বাটনে ক্লিক করে টেস্ট অর্ডার দিন, ড্যাশবোর্ডে সাথে সাথে আসবে</span>
          </div>
          <LiveBotTester onOrderCreated={loadData} />
        </div>
      )}

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Orders */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#121820] to-[#0c1015] border border-emerald-500/25 p-5 space-y-3 shadow-xl hover:border-emerald-500/40 transition-all group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none group-hover:bg-emerald-500/20 transition-all" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
              আজকের নতুন অর্ডার
            </span>
            <div className="p-2.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-xl shadow-sm">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-neutral-100 font-mono tracking-tight flex items-baseline gap-1">
              <span>{metrics?.todayOrders ?? 0}</span>
              <span className="text-sm font-semibold text-neutral-400 font-sans">টি</span>
            </div>
            <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1.5 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>লাইভ সিঙ্ক হচ্ছে</span>
            </p>
          </div>
        </div>

        {/* Pending Confirmation */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1b1712] to-[#0f0e0c] border border-amber-500/25 p-5 space-y-3 shadow-xl hover:border-amber-500/40 transition-all group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-xl pointer-events-none group-hover:bg-amber-500/20 transition-all" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
              পেন্ডিং কনফার্মেশন
            </span>
            <div className="p-2.5 bg-amber-500/15 border border-amber-500/30 text-amber-400 rounded-xl shadow-sm">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-amber-400 font-mono tracking-tight flex items-baseline gap-1">
              <span>{metrics?.pendingCount ?? 0}</span>
              <span className="text-sm font-semibold text-neutral-400 font-sans">টি</span>
            </div>
            <p className="text-xs text-neutral-400 mt-1">কল বা কনফার্ম বাটন চাপুন</p>
          </div>
        </div>

        {/* Dispatched / Courier */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#181320] to-[#0e0c15] border border-purple-500/25 p-5 space-y-3 shadow-xl hover:border-purple-500/40 transition-all group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-xl pointer-events-none group-hover:bg-purple-500/20 transition-all" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
              কুরিয়ারে পাঠানো
            </span>
            <div className="p-2.5 bg-purple-500/15 border border-purple-500/30 text-purple-400 rounded-xl shadow-sm">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-neutral-100 font-mono tracking-tight flex items-baseline gap-1">
              <span>{metrics?.dispatchedCount ?? 0}</span>
              <span className="text-sm font-semibold text-neutral-400 font-sans">টি</span>
            </div>
            <p className="text-xs text-purple-400 mt-1">Steadfast / Pathao</p>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#101b17] to-[#0c1210] border border-teal-500/25 p-5 space-y-3 shadow-xl hover:border-teal-500/40 transition-all group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/10 rounded-full blur-xl pointer-events-none group-hover:bg-teal-500/20 transition-all" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
              মোট বিক্রয়
            </span>
            <div className="p-2.5 bg-teal-500/15 border border-teal-500/30 text-teal-400 rounded-xl shadow-sm font-bold text-sm">
              ৳
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-emerald-400 font-mono tracking-tight">
              {formatBDTEn(metrics?.totalRevenue ?? 0)}
            </div>
            <p className="text-xs text-neutral-400 mt-1">ক্যাশ অন ডেলিভারি</p>
          </div>
        </div>
      </div>

      {/* Low Stock Warning Alert */}
      {(metrics?.lowStockAlerts ?? 0) > 0 && (
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-950/40 via-neutral-900 to-neutral-900 border border-amber-500/30 rounded-2xl text-amber-300 text-sm shadow-lg">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <span>
              <strong>সতর্কতা:</strong> {metrics?.lowStockAlerts} টি প্রোডাক্টের স্টক ৫ টির নিচে নেমে এসেছে!
            </span>
          </div>
          <Link
            href="/products"
            className="px-3.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-200 font-bold text-xs rounded-xl transition-all shadow-sm"
          >
            স্টক আপডেট করুন →
          </Link>
        </div>
      )}

      {/* Recent Live Orders Table */}
      <div className="bg-[#10121a] border border-neutral-800/90 rounded-3xl overflow-hidden shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 sm:p-6 border-b border-neutral-800/80 gap-3 bg-neutral-900/40">
          <div>
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-400" />
              <h3 className="font-extrabold text-neutral-100 text-base sm:text-lg">
                সাম্প্রতিক অর্ডার সমূহ
              </h3>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              ১-ক্লিক অ্যাকশন, কুরিয়ার বুকিং ও ক্যাশ মেমো প্রিন্ট
            </p>
          </div>
          <Link
            href="/orders"
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1.5 self-start sm:self-auto bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-2 rounded-xl"
          >
            <span>সকল অর্ডার দেখুন ({recentOrders.length})</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#0b0d14] text-neutral-400 font-semibold border-b border-neutral-800 text-xs uppercase tracking-wider">
              <tr>
                <th className="py-4 px-5">অর্ডার নং</th>
                <th className="py-4 px-5">গ্রাহক ও ফোন</th>
                <th className="py-4 px-5">প্রোডাক্ট বিবরণ</th>
                <th className="py-4 px-5">মোট টাকা</th>
                <th className="py-4 px-5">স্ট্যাটাস</th>
                <th className="py-4 px-5 text-right">১-ক্লিক অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-neutral-400">
                    <p className="text-base font-semibold text-neutral-300">কোনো নতুন অর্ডার নেই</p>
                    <p className="text-xs text-neutral-500 mt-1">ফেসবুক মেসেঞ্জারে মেসেজ দিলে সাথে সাথে এখানে আসবে</p>
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-neutral-850/40 transition-colors group">
                    <td className="py-4 px-5 font-mono font-bold text-neutral-200">
                      <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/25 rounded-lg text-emerald-400 text-sm">
                        #OF-{order.orderNumber}
                      </span>
                      <span className="block text-[11px] text-neutral-400 font-normal mt-1">
                        {order.channel === 'FACEBOOK_MESSENGER' ? 'Messenger Bot' : 'WhatsApp'}
                      </span>
                    </td>

                    <td className="py-4 px-5">
                      <p className="font-bold text-neutral-100 text-sm">{order.customerName}</p>
                      <p className="text-xs text-neutral-400 font-mono flex items-center gap-1.5 mt-0.5">
                        <PhoneCall className="w-3 h-3 text-emerald-400" />
                        <span>{order.customerPhone}</span>
                      </p>
                    </td>

                    <td className="py-4 px-5 max-w-xs">
                      {order.items.map((it, idx) => (
                        <p key={idx} className="text-xs text-neutral-200 font-medium leading-tight">
                          {it.product?.title || 'প্রোডাক্ট'} {it.variant?.name ? `(${it.variant.name})` : ''} × {it.quantity}
                        </p>
                      ))}
                      <p className="text-[11px] text-neutral-400 truncate mt-1">
                        📍 {order.deliveryAddress}
                      </p>
                    </td>

                    <td className="py-4 px-5 font-mono font-black text-emerald-400 text-base">
                      {formatBDTEn(order.totalPrice)}
                    </td>

                    <td className="py-4 px-5">
                      <OrderStatusBadge status={order.status} />
                    </td>

                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {order.status === 'PENDING_CONFIRMATION' && (
                          <button
                            onClick={() => handleConfirmOrder(order.id)}
                            className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            কনফার্ম
                          </button>
                        )}

                        {order.status === 'CONFIRMED' && (
                          <button
                            onClick={() => handleDispatchSteadfast(order.id)}
                            className="px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1.5"
                          >
                            <Truck className="w-3.5 h-3.5" />
                            Steadfast
                          </button>
                        )}

                        <button
                          onClick={() => setSelectedMessageOrder(order)}
                          title="সরাসরি গ্রাহককে মেসেজ পাঠান (Messenger / WhatsApp / SMS)"
                          className="px-3 py-1.5 bg-indigo-950/60 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/40 rounded-xl transition-all shadow-sm flex items-center gap-1.5 text-xs font-semibold"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">মেসেজ</span>
                        </button>

                        <button
                          onClick={() => setSelectedInvoiceOrder(order)}
                          title="মেমো প্রিন্ট করুন"
                          className="p-2 bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-750 rounded-xl transition-all shadow-sm"
                        >
                          <Printer className="w-4 h-4" />
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
    </div>
  );
}
