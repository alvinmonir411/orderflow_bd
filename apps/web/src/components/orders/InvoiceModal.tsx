import React from 'react';
import { Order } from '@/lib/types';
import { formatBDTEn } from '@/lib/utils';
import { X, Printer, CheckCircle, Package } from 'lucide-react';

interface Props {
  order: Order | null;
  onClose: () => void;
}

export const InvoiceModal: React.FC<Props> = ({ order, onClose }) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white text-neutral-900 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-neutral-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-neutral-50 print:hidden">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-600" />
            <h3 className="font-semibold text-neutral-800">ক্যাশ মেমো / ডেলিভারি চালান প্রিন্ট</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-all shadow-sm"
            >
              <Printer className="w-4 h-4" />
              প্রিন্ট করুন
            </button>
            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-200/50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div className="p-8 space-y-6 print:p-0" id="printable-invoice">
          {/* Top Brand & Memo Info */}
          <div className="flex justify-between items-start border-b border-neutral-200 pb-6">
            <div>
              <h1 className="text-2xl font-bold text-emerald-700 tracking-tight">OrderFlow Store</h1>
              <p className="text-xs text-neutral-500 mt-1">Smart F-Commerce Order Management</p>
              <p className="text-xs text-neutral-500">ঢাকা, বাংলাদেশ | হেল্পলাইন: 01700-000000</p>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 font-mono text-sm font-semibold rounded-md border border-emerald-200">
                ইনভয়েস #{order.orderNumber}
              </span>
              <p className="text-xs text-neutral-500 mt-2">
                তারিখ: {new Date(order.createdAt).toLocaleDateString('bn-BD')}
              </p>
              {order.courierTrackingId && (
                <p className="text-xs font-semibold text-purple-700 mt-1">
                  কুরিয়ার ট্র্যাকিং: {order.courierTrackingId}
                </p>
              )}
            </div>
          </div>

          {/* Customer & Shipping Details */}
          <div className="grid grid-cols-2 gap-4 bg-neutral-50 p-4 rounded-xl border border-neutral-100 text-sm">
            <div>
              <h4 className="font-semibold text-neutral-500 uppercase text-xs tracking-wider mb-1">
                গ্রাহকের বিবরণ:
              </h4>
              <p className="font-bold text-neutral-900 text-base">{order.customerName}</p>
              <p className="text-neutral-700 font-medium font-mono">{order.customerPhone}</p>
            </div>
            <div>
              <h4 className="font-semibold text-neutral-500 uppercase text-xs tracking-wider mb-1">
                ডেলিভারি ঠিকানা:
              </h4>
              <p className="text-neutral-800 leading-snug">{order.deliveryAddress}</p>
              <p className="text-xs font-medium text-neutral-500 mt-1">শহর: {order.deliveryCity || 'ঢাকা'}</p>
            </div>
          </div>

          {/* Items Table */}
          <div className="border border-neutral-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-100 text-neutral-700 font-semibold border-b border-neutral-200">
                <tr>
                  <th className="py-3 px-4">আইটেম বিবরণ</th>
                  <th className="py-3 px-4 text-center">পরিমাণ</th>
                  <th className="py-3 px-4 text-right">একক মূল্য</th>
                  <th className="py-3 px-4 text-right">মোট</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {order.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-neutral-50">
                    <td className="py-3 px-4">
                      <p className="font-medium text-neutral-900">{item.product?.title || 'প্রোডাক্ট'}</p>
                      {item.variant?.name && (
                        <p className="text-xs text-neutral-500">{item.variant.name}</p>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center font-semibold">{item.quantity}</td>
                    <td className="py-3 px-4 text-right font-mono">{formatBDTEn(item.unitPrice)}</td>
                    <td className="py-3 px-4 text-right font-semibold font-mono">
                      {formatBDTEn(item.quantity * item.unitPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Calculation Summary */}
          <div className="flex justify-end">
            <div className="w-64 space-y-2 text-sm">
              <div className="flex justify-between text-neutral-600">
                <span>পণ্যের মোট মূল্য:</span>
                <span className="font-mono">{formatBDTEn(order.itemsPrice)}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>ডেলিভারি চার্জ:</span>
                <span className="font-mono">{formatBDTEn(order.deliveryCharge)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>ডিসকাউন্ট:</span>
                  <span className="font-mono">-{formatBDTEn(order.discount)}</span>
                </div>
              )}
              <div className="border-t border-neutral-300 pt-2 flex justify-between font-bold text-base text-neutral-900">
                <span>সর্বমোট (ক্যাশ অন ডেলিভারি):</span>
                <span className="font-mono text-emerald-700">{formatBDTEn(order.totalPrice)}</span>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="border-t border-dashed border-neutral-200 pt-4 text-center text-xs text-neutral-500">
            <p className="flex items-center justify-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> ধন্যবাদ আমাদের সাথে থাকার জন্য!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
