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
} from 'lucide-react';
import { toast } from 'sonner';

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);
  const [showBotTester, setShowBotTester] = useState(false);

  const loadData = async () => {
    const [m, orders] = await Promise.all([api.getMetrics(), api.getOrders()]);
    setMetrics(m);
    setRecentOrders(orders.slice(0, 5));
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
      {/* Top Banner / Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-950/60 via-neutral-900 to-neutral-900 border border-emerald-500/20 p-6 rounded-2xl">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold rounded-full mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>অর্ডারফ্লো লাইভ ড্যাশবোর্ড</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-neutral-100 tracking-tight">
            স্বাগতম, আলভিন ফ্যাশন হাব! 👋
          </h2>
          <p className="text-sm text-neutral-400 mt-1">
            ফেসবুক মেসেঞ্জার ও হোয়াটসঅ্যাপে আসা সকল অর্ডার এখান থেকে ১-ক্লিকে ম্যানেজ করুন।
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowBotTester(!showBotTester)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-600/20 active:scale-95"
          >
            <Bot className="w-4 h-4" />
            {showBotTester ? 'বট টেস্ট বন্ধ করুন' : 'মেসেঞ্জার বট টেস্ট করুন'}
          </button>
          <Link
            href="/orders"
            className="flex items-center gap-2 px-4 py-2.5 bg-neutral-800 hover:bg-neutral-750 text-neutral-200 border border-neutral-700 rounded-xl text-sm font-medium transition-all"
          >
            <span>সকল অর্ডার</span>
            <ArrowUpRight className="w-4 h-4 text-neutral-400" />
          </Link>
        </div>
      </div>

      {/* Live Interactive Messenger Bot Simulator Card (Collapsible or toggleable) */}
      {showBotTester && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Today's Orders */}
        <div className="bg-neutral-900/90 border border-neutral-800 p-5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              আজকের নতুন অর্ডার
            </span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-neutral-100 font-mono">
              {metrics?.todayOrders ?? 0} টি
            </div>
            <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
              <span>● লাইভ কাউন্ট</span>
            </p>
          </div>
        </div>

        {/* Pending Confirmation */}
        <div className="bg-neutral-900/90 border border-neutral-800 p-5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              পেন্ডিং কনফার্মেশন
            </span>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-amber-400 font-mono">
              {metrics?.pendingCount ?? 0} টি
            </div>
            <p className="text-xs text-neutral-400 mt-1">কল বা কনফার্ম বাটন চাপুন</p>
          </div>
        </div>

        {/* Dispatched / Courier */}
        <div className="bg-neutral-900/90 border border-neutral-800 p-5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              কুরিয়ারে পাঠানো হয়েছে
            </span>
            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-neutral-100 font-mono">
              {metrics?.dispatchedCount ?? 0} টি
            </div>
            <p className="text-xs text-purple-400 mt-1">Steadfast / Pathao</p>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-neutral-900/90 border border-neutral-800 p-5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              মোট বিক্রয়
            </span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <span className="font-bold text-sm">৳</span>
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-emerald-400 font-mono">
              {formatBDTEn(metrics?.totalRevenue ?? 0)}
            </div>
            <p className="text-xs text-neutral-400 mt-1">ক্যাশ অন ডেলিভারি</p>
          </div>
        </div>
      </div>

      {/* Low Stock Warning Alert if any */}
      {(metrics?.lowStockAlerts ?? 0) > 0 && (
        <div className="flex items-center justify-between p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-300 text-sm">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <span>
              <strong>সতর্কতা:</strong> {metrics?.lowStockAlerts} টি প্রোডাক্টের স্টক ৫ টির নিচে নেমে এসেছে!
            </span>
          </div>
          <Link
            href="/products"
            className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold text-xs rounded-lg transition-all"
          >
            স্টক আপডেট করুন →
          </Link>
        </div>
      )}

      {/* Recent Live Orders Table */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="flex items-center justify-between p-5 border-b border-neutral-800">
          <div>
            <h3 className="font-bold text-neutral-100 text-base">সাম্প্রতিক অর্ডার সমূহ</h3>
            <p className="text-xs text-neutral-400 mt-0.5">১-ক্লিক অ্যাকশন ও ইনভয়েস প্রিন্ট</p>
          </div>
          <Link
            href="/orders"
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1"
          >
            সকল অর্ডার দেখুন ({recentOrders.length}) →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-950/60 text-neutral-400 font-medium border-b border-neutral-800 text-xs uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">অর্ডার নং</th>
                <th className="py-3.5 px-4">গ্রাহক ও ফোন</th>
                <th className="py-3.5 px-4">প্রোডাক্ট বিবরণ</th>
                <th className="py-3.5 px-4">মোট টাকা</th>
                <th className="py-3.5 px-4">স্ট্যাটাস</th>
                <th className="py-3.5 px-4 text-right">১-ক্লিক অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-neutral-850/40 transition-colors">
                  <td className="py-4 px-4 font-mono font-bold text-neutral-200">
                    #{order.orderNumber}
                    <span className="block text-[10px] text-neutral-500 font-normal">
                      {order.channel === 'FACEBOOK_MESSENGER' ? 'Messenger' : 'WhatsApp'}
                    </span>
                  </td>

                  <td className="py-4 px-4">
                    <p className="font-semibold text-neutral-200">{order.customerName}</p>
                    <p className="text-xs text-neutral-400 font-mono flex items-center gap-1">
                      <PhoneCall className="w-3 h-3 text-neutral-500" />
                      {order.customerPhone}
                    </p>
                  </td>

                  <td className="py-4 px-4">
                    {order.items.map((it, idx) => (
                      <p key={idx} className="text-xs text-neutral-300 font-medium">
                        {it.product?.title || 'প্রোডাক্ট'} {it.variant?.name ? `(${it.variant.name})` : ''} × {it.quantity}
                      </p>
                    ))}
                    <p className="text-[11px] text-neutral-500 truncate max-w-xs mt-0.5">
                      📍 {order.deliveryAddress}
                    </p>
                  </td>

                  <td className="py-4 px-4 font-mono font-bold text-emerald-400 text-base">
                    {formatBDTEn(order.totalPrice)}
                  </td>

                  <td className="py-4 px-4">
                    <OrderStatusBadge status={order.status} />
                  </td>

                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {order.status === 'PENDING_CONFIRMATION' && (
                        <button
                          onClick={() => handleConfirmOrder(order.id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-all shadow-sm flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          কনফার্ম
                        </button>
                      )}

                      {order.status === 'CONFIRMED' && (
                        <button
                          onClick={() => handleDispatchSteadfast(order.id)}
                          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-lg transition-all shadow-sm flex items-center gap-1"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          Steadfast বুকিং
                        </button>
                      )}

                      <button
                        onClick={() => setSelectedInvoiceOrder(order)}
                        title="মেমো প্রিন্ট করুন"
                        className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg transition-all"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Modal */}
      <InvoiceModal
        order={selectedInvoiceOrder}
        onClose={() => setSelectedInvoiceOrder(null)}
      />
    </div>
  );
}
