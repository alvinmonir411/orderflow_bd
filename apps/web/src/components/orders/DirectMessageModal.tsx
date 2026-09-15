'use client';

import React, { useState, useEffect } from 'react';
import {
  MessageCircle,
  Send,
  X,
  Sparkles,
  Phone,
  User,
  Package,
  CheckCircle2,
  RefreshCw,
  Zap,
  Tag,
  Truck,
  MapPin,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

interface DirectMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: {
    id: string;
    orderNumber: number | string;
    customerName: string;
    customerPhone: string;
    deliveryAddress?: string;
    totalPrice?: number;
    channel?: string;
    psid?: string;
  } | null;
  onMessageSent?: () => void;
}

export const DirectMessageModal: React.FC<DirectMessageModalProps> = ({
  isOpen,
  onClose,
  order,
  onMessageSent,
}) => {
  const [selectedChannel, setSelectedChannel] = useState<'MESSENGER' | 'WHATSAPP' | 'SMS'>('MESSENGER');
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (order) {
      // Default initial message
      setMessageText(
        `আসসালামু আলাইকুম ${order.customerName || 'সম্মানিত গ্রাহক'}! OrderFlow BD থেকে আপনার অর্ডার #${order.orderNumber} এর ব্যাপারে যোগাযোগ করছি। 🌸`,
      );
    }
  }, [order]);

  if (!isOpen || !order) return null;

  const quickTemplates = [
    {
      label: '📦 কনফার্মেশন',
      text: `আসসালামু আলাইকুম ${order.customerName || 'সম্মানিত গ্রাহক'}! আপনার অর্ডার #${order.orderNumber} সফলভাবে কনফার্ম করা হয়েছে। পণ্যটি দ্রুত আপনার ঠিকানায় পাঠিয়ে দেওয়া হবে। ধন্যবাদ! ❤️`,
    },
    {
      label: '🚚 কুরিয়ারে বুকিং',
      text: `প্রিয় ${order.customerName || 'গ্রাহক'}, আপনার পার্সেলটি (#${order.orderNumber}) কুরিয়ারে হস্তান্তর করা হয়েছে। আগামী ১-২ কার্যদিবসের মধ্যে ডেলিভারি পাবেন। পণ্য হাতে পেয়ে চেক করে নেওয়ার অনুরোধ রইল। 🚚`,
    },
    {
      label: '📍 ঠিকানা যাচাই',
      text: `আসসালামু আলাইকুম, আপনার দেয়া ডেলিভারি ঠিকানা: "${order.deliveryAddress || 'আপনার ঠিকানা'}"। ঠিকানাটি সঠিক আছে কি না একটু কনফার্ম করবেন প্লিজ? 📍`,
    },
    {
      label: '🎁 বিশেষ ডিসকাউন্ট',
      text: `অভিনন্দন ${order.customerName || 'গ্রাহক'}! আপনার জন্য রয়েছে পরবর্তী কেনাকাটায় স্পেশাল ১০% ছাড়! প্রোমোকোড ব্যবহার করুন: OFBD10 🛍️✨`,
    },
    {
      label: '⚠️ ভুল ফোন নম্বর',
      text: `আসসালামু আলাইকুম, আপনার অর্ডারের ফোন নম্বরে সংযোগ পাওয়া যাচ্ছে না। অনুগ্রহ করে আপনার সম্পূর্ণ ১১ ডিজিটের সঠিক মোবাইল নম্বরটি মেসেজে লিখে জানান। 📞`,
    },
  ];

  const handleSendMessage = async () => {
    if (!messageText.trim()) {
      toast.error('অনুগ্রহ করে মেসেজ লিখুন');
      return;
    }

    setIsSending(true);
    try {
      const res = await fetch('/api/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          customerPhone: order.customerPhone,
          psid: order.psid,
          message: messageText.trim(),
          channel: selectedChannel,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(data.message || 'গ্রাহকের চ্যানেলে সফলভাবে মেসেজ পাঠানো হয়েছে! 🚀');
        if (onMessageSent) onMessageSent();
        onClose();
      } else {
        toast.error(data.error || 'মেসেজ পাঠাতে সমস্যা হয়েছে');
      }
    } catch (err: any) {
      console.error('Send message error:', err);
      toast.error('মেসেজ পাঠানোর সময় নেটওয়ার্ক সমস্যা হয়েছে');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-gradient-to-b from-[#161826] to-[#0e1017] border border-indigo-500/30 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-800/80 bg-neutral-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-100 flex items-center gap-2">
                গ্রাহককে সরাসরি মেসেজ পাঠান
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Live Chat
                </span>
              </h2>
              <p className="text-xs text-neutral-400">ড্যাশবোর্ড থেকে সরাসরি গ্রাহকের চ্যানেলে মেসেজ বা নোটিফিকেশন যাবে</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Customer Summary Card */}
          <div className="grid grid-cols-3 gap-2 p-3.5 bg-neutral-900/80 border border-neutral-800 rounded-2xl text-xs">
            <div className="flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <div className="truncate">
                <p className="text-[10px] text-neutral-500 uppercase font-semibold">গ্রাহক</p>
                <p className="font-bold text-neutral-200 truncate">{order.customerName}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <div className="truncate">
                <p className="text-[10px] text-neutral-500 uppercase font-semibold">মোবাইল</p>
                <p className="font-mono font-bold text-neutral-200 truncate">{order.customerPhone}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Package className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <div className="truncate">
                <p className="text-[10px] text-neutral-500 uppercase font-semibold">অর্ডার নং</p>
                <p className="font-mono font-bold text-emerald-400">#OF-{order.orderNumber}</p>
              </div>
            </div>
          </div>

          {/* Channel Selector */}
          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-2">মেসেজ ডেলিভারি চ্যানেল</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedChannel('MESSENGER')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                  selectedChannel === 'MESSENGER'
                    ? 'bg-blue-600/20 border-blue-500 text-blue-400 shadow-md shadow-blue-500/10'
                    : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <MessageCircle className="w-4 h-4 text-blue-400" />
                Messenger
              </button>

              <button
                type="button"
                onClick={() => setSelectedChannel('WHATSAPP')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                  selectedChannel === 'WHATSAPP'
                    ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400 shadow-md shadow-emerald-500/10'
                    : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Zap className="w-4 h-4 text-emerald-400" />
                WhatsApp
              </button>

              <button
                type="button"
                onClick={() => setSelectedChannel('SMS')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                  selectedChannel === 'SMS'
                    ? 'bg-purple-600/20 border-purple-500 text-purple-400 shadow-md shadow-purple-500/10'
                    : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Phone className="w-4 h-4 text-purple-400" />
                SMS
              </button>
            </div>
          </div>

          {/* Quick 1-Click Templates */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-300 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>এক ক্লিকে রেডিমেড টেমপ্লেট নির্বাচন করুন:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {quickTemplates.map((t, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setMessageText(t.text)}
                  className="px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-indigo-950/60 border border-neutral-800 hover:border-indigo-500/40 text-[11px] font-medium text-neutral-300 hover:text-indigo-200 transition-all active:scale-95"
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Message Textarea */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-neutral-300">
              <label>মেসেজের বিষয়বস্তু (যেকোনো কিছু লিখুন):</label>
              <span className="text-[11px] text-neutral-500 font-mono">{messageText.length} অক্ষর</span>
            </div>
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              rows={4}
              placeholder="আপনার বার্তা বা প্রশ্ন লিখুন..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl p-4 text-xs sm:text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed transition-all shadow-inner"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-5 border-t border-neutral-800/80 bg-neutral-900/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold transition-all"
          >
            বাতিল
          </button>

          <button
            type="button"
            onClick={handleSendMessage}
            disabled={isSending || !messageText.trim()}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 hover:from-indigo-600 hover:to-pink-700 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50 active:scale-95"
          >
            {isSending ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                মেসেজ পাঠানো হচ্ছে...
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                সরাসরি মেসেজ পাঠান
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
