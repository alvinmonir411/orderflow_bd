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
  ShieldAlert,
  PhoneCall,
  MapPin,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';
import { toast } from 'sonner';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);

  const loadOrders = async () => {
    const list = await api.getOrders();
    setOrders(list);
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
      const term = searchTerm.toLowerCase();
      const matchName = order.customerName.toLowerCase().includes(term);
      const matchPhone = order.customerPhone.includes(term);
      const matchOrderNum = String(order.orderNumber).includes(term);
      return matchName || matchPhone || matchOrderNum;
    }
    return true;
  });

  const tabs = [
    { id: 'ALL', label: 'সব অর্ডার', count: orders.length },
    {
      id: 'PENDING_CONFIRMATION',
      label: 'পেন্ডিং',
      count: orders.filter((o) => o.status === 'PENDING_CONFIRMATION').length,
      badgeColor: 'bg-amber-500/20 text-amber-400',
    },
    {
      id: 'CONFIRMED',
      label: 'কনফার্মড',
      count: orders.filter((o) => o.status === 'CONFIRMED').length,
    },
    {
      id: 'DISPATCHED_TO_COURIER',
      label: 'কুরিয়ারে পাঠানো',
      count: orders.filter((o) => o.status === 'DISPATCHED_TO_COURIER').length,
    },
    {
      id: 'DELIVERED',
      label: 'ডেলিভারড',
      count: orders.filter((o) => o.status === 'DELIVERED').length,
    },
    {
      id: 'CANCELLED',
      label: 'বাতিল',
      count: orders.filter((o) => o.status === 'CANCELLED').length,
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-neutral-100 tracking-tight">অর্ডার ম্যানেজমেন্ট</h2>
          <p className="text-sm text-neutral-400 mt-0.5">
            সব অর্ডারের তালিকা, কাস্টমার হিস্ট্রি, ১-ক্লিক কুরিয়ার বুকিং ও ইনভয়েস
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="নাম, ফোন বা অর্ডার নম্বর খুঁজুন..."
            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-4 py-2 text-sm text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-neutral-800">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-neutral-900/60 hover:bg-neutral-850 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-xs font-mono font-semibold ${
                activeTab === tab.id ? 'bg-white/20 text-white' : tab.badgeColor || 'bg-neutral-800 text-neutral-300'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-950/60 text-neutral-400 font-medium border-b border-neutral-800 text-xs uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">অর্ডার নং ও মাধ্যম</th>
                <th className="py-3.5 px-4">গ্রাহকের বিবরণ</th>
                <th className="py-3.5 px-4">অর্ডার আইটেম ও ঠিকানা</th>
                <th className="py-3.5 px-4">মোট বিল</th>
                <th className="py-3.5 px-4">কুরিয়ার ও স্ট্যাটাস</th>
                <th className="py-3.5 px-4 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-neutral-500">
                    কোনো অর্ডার পাওয়া যায়নি
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-neutral-850/40 transition-colors">
                    {/* Order Number */}
                    <td className="py-4 px-4 align-top">
                      <span className="font-mono font-bold text-neutral-100 text-base">
                        #{order.orderNumber}
                      </span>
                      <div className="mt-1">
                        <span className="px-2 py-0.5 text-[10px] font-semibold bg-neutral-800 text-neutral-400 border border-neutral-700/60 rounded">
                          {order.channel === 'FACEBOOK_MESSENGER'
                            ? 'Messenger'
                            : order.channel === 'WHATSAPP'
                            ? 'WhatsApp'
                            : 'Manual'}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-500 mt-1">
                        {new Date(order.createdAt).toLocaleTimeString('bn-BD', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </td>

                    {/* Customer */}
                    <td className="py-4 px-4 align-top space-y-1">
                      <p className="font-semibold text-neutral-100">{order.customerName}</p>
                      <p className="text-xs text-neutral-300 font-mono flex items-center gap-1">
                        <PhoneCall className="w-3 h-3 text-neutral-500" />
                        {order.customerPhone}
                      </p>

                      {/* Customer Risk Indicator */}
                      <div className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                        <ShieldCheck className="w-3 h-3" />
                        <span>১০০% ডেলিভারি সাকসেস</span>
                      </div>
                    </td>

                    {/* Items & Address */}
                    <td className="py-4 px-4 align-top space-y-1 max-w-sm">
                      <div className="space-y-0.5">
                        {order.items.map((it, idx) => (
                          <p key={idx} className="text-xs text-neutral-200 font-medium">
                            • {it.product?.title || 'প্রোডাক্ট'} {it.variant?.name ? `(${it.variant.name})` : ''} × {it.quantity}
                          </p>
                        ))}
                      </div>
                      <p className="text-xs text-neutral-400 flex items-start gap-1 pt-1">
                        <MapPin className="w-3 h-3 text-neutral-500 shrink-0 mt-0.5" />
                        <span>{order.deliveryAddress}</span>
                      </p>
                    </td>

                    {/* Total Price */}
                    <td className="py-4 px-4 align-top">
                      <p className="font-mono font-bold text-emerald-400 text-lg">
                        {formatBDTEn(order.totalPrice)}
                      </p>
                      <p className="text-[11px] text-neutral-500">ক্যাশ অন ডেলিভারি</p>
                    </td>

                    {/* Status & Courier */}
                    <td className="py-4 px-4 align-top space-y-2">
                      <OrderStatusBadge status={order.status} />

                      {order.courierTrackingId && (
                        <div className="p-2 bg-purple-500/10 border border-purple-500/20 rounded-lg text-xs space-y-0.5">
                          <p className="text-[10px] text-purple-400 font-semibold uppercase">
                            {order.courierProvider} কুরিয়ার
                          </p>
                          <p className="font-mono font-bold text-purple-300">
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
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-all shadow-sm flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            কনফার্ম
                          </button>
                        )}

                        {order.status === 'CONFIRMED' && (
                          <>
                            <button
                              onClick={() => handleDispatchSteadfast(order.id)}
                              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-lg transition-all shadow-sm flex items-center gap-1"
                            >
                              <Truck className="w-3.5 h-3.5" />
                              Steadfast বুকিং
                            </button>
                            <button
                              onClick={() => handleDispatchPathao(order.id)}
                              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg transition-all shadow-sm flex items-center gap-1"
                            >
                              <Truck className="w-3.5 h-3.5" />
                              Pathao বুকিং
                            </button>
                          </>
                        )}

                        {order.status === 'DISPATCHED_TO_COURIER' && (
                          <button
                            onClick={() => handleStatusChange(order.id, 'DELIVERED')}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-all"
                          >
                            ডেলিভারড মার্ক করুন
                          </button>
                        )}

                        <button
                          onClick={() => setSelectedInvoiceOrder(order)}
                          title="ইনভয়েস প্রিন্ট"
                          className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg transition-all"
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
