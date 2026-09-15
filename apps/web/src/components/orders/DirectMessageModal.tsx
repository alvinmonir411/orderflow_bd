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
  ExternalLink,
  History,
  Clock,
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

interface ChatMessage {
  id: string;
  text: string;
  senderName: string;
  isPage: boolean;
  time: string;
}

interface CustomerProfile {
  name?: string;
  first_name?: string;
  last_name?: string;
  profile_pic?: string;
  id?: string;
}

export const DirectMessageModal: React.FC<DirectMessageModalProps> = ({
  isOpen,
  onClose,
  order,
  onMessageSent,
}) => {
  const [activeView, setActiveView] = useState<'send' | 'history'>('history');
  const [selectedChannel, setSelectedChannel] = useState<'MESSENGER' | 'WHATSAPP' | 'SMS'>('MESSENGER');
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [fbProfile, setFbProfile] = useState<CustomerProfile | null>(null);
  const [inboxUrl, setInboxUrl] = useState<string>('');

  useEffect(() => {
    if (order && isOpen) {
      // Default initial message
      setMessageText(
        `আসসালামু আলাইকুম ${order.customerName || 'সম্মানিত গ্রাহক'}! OrderFlow BD থেকে আপনার অর্ডার #${order.orderNumber} এর ব্যাপারে যোগাযোগ করছি। 🌸`,
      );

      // Fetch live conversation history and Facebook profile
      setIsLoadingHistory(true);
      fetch(`/api/conversation?orderId=${order.id}&psid=${order.psid || ''}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            if (data.profile) setFbProfile(data.profile);
            if (Array.isArray(data.messages)) setChatHistory(data.messages);
            if (data.inboxUrl) setInboxUrl(data.inboxUrl);
          }
        })
        .catch((err) => console.error('Failed to load chat history:', err))
        .finally(() => setIsLoadingHistory(false));
    }
  }, [order, isOpen]);

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
          psid: order.psid || fbProfile?.id,
          message: messageText.trim(),
          channel: selectedChannel,
        }),
      });

      const data = await res.json();
      if (data.success) {
        if (data.deliveredToMessenger) {
          toast.success('🎉 গ্রাহকের ফেসবুক মেসেঞ্জারে সরাসরি মেসেজ পাঠানো হয়েছে!');
          // Add to local chat history
          setChatHistory((prev) => [
            ...prev,
            {
              id: `msg-${Date.now()}`,
              text: messageText.trim(),
              senderName: 'Moner Kotha (Admin)',
              isPage: true,
              time: new Date().toISOString(),
            },
          ]);
          setActiveView('history');
        } else {
          toast.info('📝 মেসেজটি অর্ডারের হিস্ট্রিতে সফলভাবে রেকর্ড ও সেভ করা হয়েছে!');
        }
        if (onMessageSent) onMessageSent();
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

  const directMetaLink =
    inboxUrl ||
    `https://business.facebook.com/latest/inbox/messenger?mailbox_id=1314475555081210&selected_item_id=${
      order.psid || fbProfile?.id || '28626322373646425'
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#161826] to-[#0e1017] border border-indigo-500/30 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-neutral-800/80 bg-neutral-900/50">
          <div className="flex items-center gap-3">
            {fbProfile?.profile_pic ? (
              <img
                src={fbProfile.profile_pic}
                alt="FB Avatar"
                className="w-11 h-11 rounded-2xl object-cover border-2 border-indigo-500 shadow-md"
              />
            ) : (
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                <MessageCircle className="w-5 h-5" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base font-bold text-neutral-100">
                  {fbProfile?.name ? fbProfile.name : order.customerName}
                </h2>
                {fbProfile?.name && fbProfile.name !== order.customerName && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-neutral-800 text-neutral-300 border border-neutral-700">
                    অর্ডারে নাম: {order.customerName}
                  </span>
                )}
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Facebook Messenger
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5 flex items-center gap-2">
                <span>📞 {order.customerPhone}</span>
                <span>•</span>
                <span className="font-mono text-emerald-400">অর্ডার #OF-{order.orderNumber}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={directMetaLink}
              target="_blank"
              rel="noreferrer"
              title="ফেসবুক বিজনেস ইনবক্সে এই চ্যাটটি সরাসরি ওপেন করুন"
              className="px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/40 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
            >
              <span>Meta Inbox</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-neutral-800/60 bg-[#121420]">
          <button
            onClick={() => setActiveView('history')}
            className={`pb-2.5 px-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all ${
              activeView === 'history'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            লাইভ চ্যাট হিস্ট্রি ({chatHistory.length})
          </button>

          <button
            onClick={() => setActiveView('send')}
            className={`pb-2.5 px-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all ${
              activeView === 'send'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            নতুন মেসেজ পাঠান
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6 space-y-4 flex-1 overflow-y-auto">
          {activeView === 'history' ? (
            /* CHAT HISTORY VIEW */
            <div className="space-y-3">
              {isLoadingHistory ? (
                <div className="text-center py-12 text-neutral-400">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-400" />
                  <p className="text-xs">ফেসবুক থেকে চ্যাট হিস্ট্রি লোড হচ্ছে...</p>
                </div>
              ) : chatHistory.length === 0 ? (
                <div className="text-center py-12 text-neutral-500">
                  <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">কোনো পূর্ববর্তী মেসেজ পাওয়া যায়নি</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {chatHistory.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${msg.isPage ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 mb-1 px-1">
                        <span className="font-semibold">{msg.senderName}</span>
                        {msg.time && (
                          <span className="text-neutral-500">
                            • {new Date(msg.time).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                          msg.isPage
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-tr-sm shadow-md'
                            : 'bg-neutral-900 border border-neutral-800 text-neutral-100 rounded-tl-sm shadow-inner'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* SEND MESSAGE VIEW */
            <div className="space-y-5">
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

              {/* Quick Templates */}
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
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-t border-neutral-800/80 bg-neutral-900/50">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold transition-all"
            >
              বন্ধ করুন
            </button>

            {activeView === 'history' && (
              <button
                type="button"
                onClick={() => setActiveView('send')}
                className="px-4 py-2.5 rounded-xl bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 text-xs font-bold border border-indigo-500/30 transition-all flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                মেসেজ লিখুন
              </button>
            )}
          </div>

          {activeView === 'send' && (
            <button
              type="button"
              onClick={handleSendMessage}
              disabled={isSending || !messageText.trim()}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 hover:from-indigo-600 hover:to-pink-700 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50 active:scale-95"
            >
              {isSending ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  পাঠানো হচ্ছে...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  সরাসরি মেসেজ পাঠান
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
