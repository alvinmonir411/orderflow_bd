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
} from 'lucide-react';
import { toast } from 'sonner';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);

  const loadOrders = async () => {
    try {
      const list = await api.getOrders();
      setOrders(list);
    } catch (e) {
      console.error(e);
    }
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

  // Filter Logic
  const filteredOrders = orders.filter((order) => {
    if (activeTab !== 'ALL' && order.status !== activeTab) return false;
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

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#121622] via-[#0e1017] to-[#090b10] p-6 sm:p-7 border border-neutral-800/90 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold rounded-full mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>রিয়েল-টাইম অর্ডার ট্র্যাকিং</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-neutral-100 tracking-tight">
              অর্ডার তালিকা ও ম্যানেজমেন্ট
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-xl leading-relaxed">
              মেসেঞ্জার ও হোয়াটসঅ্যাপের সকল অর্ডার দেখুন, গ্রাহক তথ্য ও ১-ক্লিকে কুরিয়ার বুকিং করুন।
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-88">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="নাম, ফোন বা অর্ডার নং (#OF-7953)..."
              className="w-full bg-[#0a0c12] border border-neutral-750 rounded-2xl pl-10 pr-9 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-inner"
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
        </div>
      </div>

      {/* Tabs */}
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
                  : 'bg-[#10131c]/80 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 border-neutral-800/80'
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

      {/* Orders Table */}
      <div className="bg-[#10121a] border border-neutral-800/90 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#0b0d14] text-neutral-400 font-semibold border-b border-neutral-800 text-xs uppercase tracking-wider">
              <tr>
                <th className="py-4 px-5">অর্ডার নং ও মাধ্যম</th>
                <th className="py-4 px-5">গ্রাহকের বিবরণ</th>
                <th className="py-4 px-5">অর্ডার আইটেম ও ঠিকানা</th>
                <th className="py-4 px-5">মোট বিল</th>
                <th className="py-4 px-5">কুরিয়ার ও স্ট্যাটাস</th>
                <th className="py-4 px-5 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-neutral-400">
                    <Package className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
                    <p className="text-base font-bold text-neutral-300">কোনো অর্ডার পাওয়া যায়নি</p>
                    <p className="text-xs text-neutral-500 mt-1">অন্য কোনো নাম, ফোন নম্বর বা অর্ডার নম্বর দিয়ে সার্চ করুন</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-neutral-850/40 transition-colors group">
                    {/* Order Number */}
                    <td className="py-4 px-5 align-top">
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
                              : 'bg-neutral-800 text-neutral-400 border-neutral-700/60'
                          }`}
                        >
                          {order.channel === 'FACEBOOK_MESSENGER'
                            ? 'Messenger Bot'
                            : order.channel === 'WHATSAPP'
                            ? 'WhatsApp'
                            : 'Manual'}
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
                    <td className="py-4 px-5 align-top space-y-1.5">
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
                    <td className="py-4 px-5 align-top space-y-1 max-w-sm">
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
                    <td className="py-4 px-5 align-top">
                      <p className="font-mono font-black text-emerald-400 text-lg">
                        {formatBDTEn(order.totalPrice)}
                      </p>
                      <p className="text-[11px] text-neutral-400">ক্যাশ অন ডেলিভারি</p>
                    </td>

                    {/* Status & Courier */}
                    <td className="py-4 px-5 align-top space-y-2">
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
                    <td className="py-4 px-5 align-top text-right space-y-2">
                      <div className="flex flex-wrap items-center justify-end gap-1.5">
                        {order.status === 'PENDING_CONFIRMATION' && (
                          <button
                            onClick={() => handleStatusChange(order.id, 'CONFIRMED')}
                            className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            কনফার্ম
                          </button>
                        )}

                        {order.status === 'CONFIRMED' && (
                          <>
                            <button
                              onClick={() => handleDispatchSteadfast(order.id)}
                              className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1"
                            >
                              <Truck className="w-3.5 h-3.5" />
                              Steadfast
                            </button>
                            <button
                              onClick={() => handleDispatchPathao(order.id)}
                              className="px-3 py-1.5 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1"
                            >
                              <Truck className="w-3.5 h-3.5" />
                              Pathao
                            </button>
                          </>
                        )}

                        {order.status === 'DISPATCHED_TO_COURIER' && (
                          <button
                            onClick={() => handleStatusChange(order.id, 'DELIVERED')}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-md"
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
    </div>
  );
}
