import React from 'react';
import { Order } from '@/lib/types';
import { formatBDTEn } from '@/lib/utils';
import { X, Printer, CheckCircle2, Package, Store, MapPin, PhoneCall, Calendar } from 'lucide-react';

interface Props {
  order: Order | null;
  onClose: () => void;
}

export const InvoiceModal: React.FC<Props> = ({ order, onClose }) => {
  const [storeName, setStoreName] = React.useState('স্মার্ট অনলাইন শপ');

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem('orderflow_user');
      if (raw) {
        const u = JSON.parse(raw);
        if (u.organizationName) setStoreName(u.organizationName);
      }
    } catch {}
  }, []);

  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white text-neutral-900 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-neutral-200">
        {/* Modal Action Header (Hidden during print) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-neutral-50 print:hidden">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-neutral-800 text-sm sm:text-base">
              ক্যাশ মেমো / ডেলিভারি চালান প্রিন্ট
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors"
            >
              <Printer className="w-4 h-4" />
              প্রিন্ট / PDF সেভ করুন
            </button>
            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-neutral-700 rounded-xl hover:bg-neutral-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div className="p-8 space-y-6 print:p-0 font-sans text-neutral-900" id="printable-invoice">
          {/* Top Brand & Memo Header */}
          <div className="flex justify-between items-start border-b-2 border-neutral-900 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-black text-sm">
                  OF
                </div>
                <h1 className="text-2xl font-black text-neutral-900 tracking-tight">{storeName}</h1>
              </div>
              <p className="text-xs text-neutral-600 mt-1 font-medium">Smart F-Commerce Platform</p>
              <p className="text-xs text-neutral-500">ঢাকা, বাংলাদেশ | হেল্পলাইন: 01938-909812</p>
            </div>
            <div className="text-right space-y-1">
              <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 font-mono text-sm font-bold rounded-lg border border-emerald-300">
                ইনভয়েস #OF-{order.orderNumber}
              </span>
              <p className="text-xs text-neutral-600 flex items-center justify-end gap-1 font-medium">
                <Calendar className="w-3.5 h-3.5" />
                তারিখ: {new Date(order.createdAt).toLocaleDateString('bn-BD')}
              </p>
              {order.courierTrackingId && (
                <p className="text-xs font-bold text-purple-700 font-mono">
                  {order.courierProvider} ট্র্যাকিং: {order.courierTrackingId}
                </p>
              )}
            </div>
          </div>

          {/* Customer & Shipping Details */}
          <div className="grid grid-cols-2 gap-4 bg-neutral-50 p-5 rounded-2xl border border-neutral-200 text-sm">
            <div>
              <h4 className="font-bold text-neutral-400 uppercase text-[11px] tracking-wider mb-1">
                গ্রাহকের বিবরণ:
              </h4>
              <p className="font-extrabold text-neutral-900 text-base">{order.customerName}</p>
              <p className="text-neutral-700 font-bold font-mono text-sm flex items-center gap-1 mt-0.5">
                <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                {order.customerPhone}
              </p>
            </div>
            <div>
              <h4 className="font-bold text-neutral-400 uppercase text-[11px] tracking-wider mb-1">
                ডেলিভারি ঠিকানা:
              </h4>
              <p className="text-neutral-800 font-medium leading-snug">{order.deliveryAddress}</p>
              <p className="text-xs font-semibold text-neutral-500 mt-1">শহর: {order.deliveryCity || 'ঢাকা'}</p>
            </div>
          </div>

          {/* Items Table */}
          <div className="border border-neutral-300 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-100 text-neutral-800 font-bold border-b border-neutral-300">
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
                      <p className="font-bold text-neutral-900">{item.product?.title || 'প্রোডাক্ট'}</p>
                      {item.variant?.name && (
                        <p className="text-xs text-neutral-500 font-medium">{item.variant.name}</p>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center font-bold">{item.quantity}</td>
                    <td className="py-3 px-4 text-right font-mono font-medium">{formatBDTEn(item.unitPrice)}</td>
                    <td className="py-3 px-4 text-right font-bold font-mono">
                      {formatBDTEn(item.quantity * item.unitPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Calculation Summary */}
          <div className="flex justify-end pt-2">
            <div className="w-72 space-y-2 text-sm bg-neutral-50 p-4 rounded-2xl border border-neutral-200">
              <div className="flex justify-between text-neutral-600 font-medium">
                <span>পণ্যের মূল্য:</span>
                <span className="font-mono">{formatBDTEn(order.itemsPrice)}</span>
              </div>
              <div className="flex justify-between text-neutral-600 font-medium">
                <span>ডেলিভারি চার্জ:</span>
                <span className="font-mono">{formatBDTEn(order.deliveryCharge)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-rose-600 font-medium">
                  <span>ডিসকাউন্ট:</span>
                  <span className="font-mono">-{formatBDTEn(order.discount)}</span>
                </div>
              )}
              <div className="border-t-2 border-neutral-300 pt-2 flex justify-between font-black text-base text-neutral-900">
                <span>সর্বমোট (COD):</span>
                <span className="font-mono text-emerald-700 font-bold">{formatBDTEn(order.totalPrice)}</span>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="border-t border-dashed border-neutral-300 pt-4 text-center text-xs text-neutral-500">
            <p className="flex items-center justify-center gap-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              OrderFlow BD — স্মার্ট এফ-কমার্স ডেলিভারি চালান। ধন্যবাদ আমাদের সাথে থাকার জন্য! ❤️
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
