'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { api } from '@/lib/api';
import { Order, Product } from '@/lib/types';
import { formatBDTEn } from '@/lib/utils';
import {
  MessageSquare,
  Search,
  Bot,
  User,
  Send,
  Sparkles,
  PhoneCall,
  MapPin,
  Truck,
  ExternalLink,
  CheckCheck,
  Clock,
  ShoppingBag,
  Zap,
  Filter,
  CheckCircle2,
  RefreshCw,
  MessageCircle,
  ShieldCheck,
  ChevronRight,
  Smile,
  Paperclip,
  Printer,
  Inbox,
} from 'lucide-react';
import { toast } from 'sonner';

interface ChatMessage {
  id: string;
  sender: 'customer' | 'ai' | 'admin';
  text: string;
  time: string;
  image?: string;
  productCard?: {
    title: string;
    price: number;
    image: string;
  };
}

interface ConversationThread {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  channel: 'FACEBOOK_MESSENGER' | 'WHATSAPP' | 'MANUAL_ENTRY' | string;
  psid?: string;
  productInterest?: string;
  productImage?: string;
  productPrice?: number;
  lastMessage: string;
  lastTime: string;
  unread: boolean;
  orderNumber?: number;
  orderStatus?: string;
  totalSpent?: number;
  isAiActive: boolean;
  messages: ChatMessage[];
}

export default function MessagesPage() {
  const [activeChannelFilter, setActiveChannelFilter] = useState<'ALL' | 'MESSENGER' | 'COMMENTS' | 'INSTAGRAM' | 'WHATSAPP' | 'ORDERS'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [threads, setThreads] = useState<ConversationThread[]>([]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/conversation?list=true');
      const data = await res.json();

      if (data.success && Array.isArray(data.threads)) {
        setThreads(data.threads);
        if (data.threads.length > 0 && !selectedThreadId) {
          setSelectedThreadId(data.threads[0].id);
        }
      }
    } catch (e) {
      console.error('[Load Conversations Error]:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  // Filtered threads list
  const filteredThreads = useMemo(() => {
    return threads.filter((t) => {
      const matchSearch =
        t.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.customerPhone.includes(searchQuery) ||
        (t.productInterest && t.productInterest.toLowerCase().includes(searchQuery.toLowerCase())) ||
        t.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchSearch) return false;

      if (activeChannelFilter === 'MESSENGER') return t.channel === 'FACEBOOK_MESSENGER';
      if (activeChannelFilter === 'COMMENTS') return t.channel === 'FACEBOOK_COMMENT';
      if (activeChannelFilter === 'INSTAGRAM') return t.channel === 'INSTAGRAM';
      if (activeChannelFilter === 'WHATSAPP') return t.channel === 'WHATSAPP';
      if (activeChannelFilter === 'ORDERS') return !!t.orderNumber;
      return true;
    });
  }, [threads, searchQuery, activeChannelFilter]);

  const currentThread = threads.find((t) => t.id === selectedThreadId) || filteredThreads[0] || null;

  const handleSendReply = async () => {
    if (!replyText.trim() || !currentThread) return;

    setIsSending(true);
    const newMsgText = replyText.trim();
    setReplyText('');

    // Optimistic UI update
    const newMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      sender: 'admin',
      text: newMsgText,
      time: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
    };

    setThreads((prev) =>
      prev.map((t) => {
        if (t.id === currentThread.id) {
          return {
            ...t,
            lastMessage: `[অ্যাডমিন]: ${newMsgText}`,
            lastTime: 'এখনই',
            unread: false,
            messages: [...t.messages, newMsg],
          };
        }
        return t;
      })
    );

    try {
      const res = await fetch('/api/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: currentThread.orderNumber,
          customerPhone: currentThread.customerPhone,
          psid: currentThread.psid,
          message: newMsgText,
          channel: currentThread.channel,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(
          currentThread.channel === 'FACEBOOK_MESSENGER'
            ? 'মেসেঞ্জারে কাস্টমারকে সরাসরি পাঠানো হয়েছে! 🚀'
            : 'হোয়াটসঅ্যাপ চ্যাটে মেসেজ রেকর্ড হয়েছে!'
        );
      }
    } catch (e) {
      toast.error('মেসেজ পাঠাতে সমস্যা হয়েছে');
    } finally {
      setIsSending(false);
    }
  };

  const handleToggleAi = (threadId: string) => {
    setThreads((prev) =>
      prev.map((t) => {
        if (t.id === threadId) {
          const nextState = !t.isAiActive;
          toast.info(
            nextState
              ? `🤖 ${t.customerName}-এর জন্য Gemini AI অটোমেশন চালু করা হয়েছে`
              : `👤 ${t.customerName}-এর জন্য হিউম্যান টেকওভার মোড চালু (AI মিউট করা হয়েছে)`
          );
          return { ...t, isAiActive: nextState };
        }
        return t;
      })
    );
  };

  const handleQuickSnippet = (text: string) => {
    setReplyText(text);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#10131d] via-[#0d1017] to-[#090b10] p-5 sm:p-6 rounded-3xl border border-neutral-800/90 shadow-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-xl">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-neutral-100 tracking-tight">
              মেসেজ ও লাইভ চ্যাট হাব (Omnichannel Hub)
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-neutral-400">
            ফেসবুক মেসেঞ্জার এবং হোয়াটসঅ্যাপের সকল আসল কাস্টমার চ্যাট এক স্ক্রিনে দেখুন, AI হ্যান্ডলিং মনিটর করুন এবং সরাসরি ড্যাশবোর্ড থেকে রিপ্লাই দিন।
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-3.5 py-2 bg-neutral-900 hover:bg-neutral-850 text-neutral-300 border border-neutral-750 rounded-xl text-xs font-semibold transition-all shadow-sm active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isLoading ? 'animate-spin' : ''}`} />
            <span>লাইভ সিঙ্ক</span>
          </button>
        </div>
      </div>

      {/* Main 3-Column Unified Chat Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[760px]">
        {/* Left Column: Conversation List (3.5 Cols) */}
        <div className="lg:col-span-4 bg-[#10131d] border border-neutral-800/90 rounded-3xl flex flex-col overflow-hidden shadow-2xl">
          {/* Search & Channel Filter Tabs */}
          <div className="p-4 border-b border-neutral-800/80 space-y-3 bg-neutral-900/40">
            <div className="relative">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="কাস্টমার নাম, ফোন বা মেসেজ খুঁজুন..."
                className="w-full pl-10 pr-4 py-2 bg-neutral-900/90 border border-neutral-750 focus:border-emerald-500 rounded-xl text-xs text-neutral-100 placeholder-neutral-500 outline-none transition-all"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
              <button
                onClick={() => setActiveChannelFilter('ALL')}
                className={`px-3 py-1 rounded-lg font-semibold whitespace-nowrap transition-all ${
                  activeChannelFilter === 'ALL'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-neutral-850 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                সকল ({threads.length})
              </button>
              <button
                onClick={() => setActiveChannelFilter('MESSENGER')}
                className={`px-3 py-1 rounded-lg font-semibold whitespace-nowrap transition-all ${
                  activeChannelFilter === 'MESSENGER'
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                    : 'bg-neutral-850 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                🔵 Messenger
              </button>
              <button
                onClick={() => setActiveChannelFilter('COMMENTS')}
                className={`px-3 py-1 rounded-lg font-semibold whitespace-nowrap transition-all ${
                  activeChannelFilter === 'COMMENTS'
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                    : 'bg-neutral-850 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                💬 Comments
              </button>
              <button
                onClick={() => setActiveChannelFilter('INSTAGRAM')}
                className={`px-3 py-1 rounded-lg font-semibold whitespace-nowrap transition-all ${
                  activeChannelFilter === 'INSTAGRAM'
                    ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40'
                    : 'bg-neutral-850 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                📸 Instagram
              </button>
              <button
                onClick={() => setActiveChannelFilter('WHATSAPP')}
                className={`px-3 py-1 rounded-lg font-semibold whitespace-nowrap transition-all ${
                  activeChannelFilter === 'WHATSAPP'
                    ? 'bg-green-500/20 text-green-300 border border-green-500/40'
                    : 'bg-neutral-850 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                🟢 WhatsApp
              </button>
              <button
                onClick={() => setActiveChannelFilter('ORDERS')}
                className={`px-3 py-1 rounded-lg font-semibold whitespace-nowrap transition-all ${
                  activeChannelFilter === 'ORDERS'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                    : 'bg-neutral-850 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                📦 অর্ডারস
              </button>
            </div>
          </div>

          {/* Threads List */}
          <div className="flex-1 overflow-y-auto divide-y divide-neutral-855/60 p-2 space-y-1">
            {filteredThreads.length === 0 ? (
              <div className="py-16 px-4 text-center space-y-2">
                <Inbox className="w-10 h-10 text-neutral-600 mx-auto" />
                <p className="text-sm font-bold text-neutral-300">কোনো চ্যাট মেসেজ নেই</p>
                <p className="text-xs text-neutral-500">
                  ফেসবুক পেজের মেসেঞ্জারে, কমেন্টে বা হোয়াটসঅ্যাপে নক দিলে সাথে সাথে এখানে লাইভ চ্যাট দেখা যাবে।
                </p>
              </div>
            ) : (
              filteredThreads.map((t) => {
                const isSelected = t.id === currentThread?.id;

                const getChannelBadge = (ch: string) => {
                  if (ch === 'FACEBOOK_COMMENT') return { bg: 'bg-indigo-600', label: 'C', title: 'Facebook Comment' };
                  if (ch === 'INSTAGRAM') return { bg: 'bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600', label: 'IG', title: 'Instagram' };
                  if (ch === 'WHATSAPP') return { bg: 'bg-emerald-600', label: 'WA', title: 'WhatsApp' };
                  return { bg: 'bg-blue-600', label: 'M', title: 'Messenger' };
                };

                const badge = getChannelBadge(t.channel);

                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedThreadId(t.id)}
                    className={`w-full p-3.5 rounded-2xl text-left transition-all flex items-start gap-3 border ${
                      isSelected
                        ? 'bg-gradient-to-r from-emerald-500/15 via-emerald-500/5 to-transparent border-emerald-500/30 text-neutral-100 shadow-md'
                        : 'bg-neutral-900/30 hover:bg-neutral-850/60 border-transparent text-neutral-300'
                    }`}
                  >
                    {/* Avatar with Channel Badge */}
                    <div className="relative shrink-0">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-neutral-800 to-neutral-700 flex items-center justify-center font-bold text-sm text-neutral-200 shadow-sm border border-neutral-700">
                        {t.customerName.slice(0, 2)}
                      </div>
                      <span
                        className={`absolute -bottom-1 -right-1 px-1 min-w-[18px] h-4 rounded-full flex items-center justify-center text-[8px] font-black text-white shadow-sm ${badge.bg}`}
                        title={badge.title}
                      >
                        {badge.label}
                      </span>
                    </div>

                    {/* Thread Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-xs sm:text-sm truncate">
                          {t.customerName}
                        </span>
                        <span className="text-[10px] text-neutral-500 font-mono shrink-0">
                          {t.lastTime}
                        </span>
                      </div>

                      {/* Product Tag if available */}
                      {t.productInterest && (
                        <span className="inline-block px-1.5 py-0.5 my-0.5 text-[10px] font-medium bg-indigo-500/15 text-indigo-300 border border-indigo-500/25 rounded-md truncate max-w-[190px]">
                          🏷️ {t.productInterest}
                        </span>
                      )}

                      <p className="text-xs text-neutral-400 truncate mt-0.5 font-normal">
                        {t.lastMessage}
                      </p>
                    </div>

                    {/* Unread Indicator & AI Status */}
                    <div className="flex flex-col items-end gap-1.5 shrink-0 self-center">
                      {t.unread && (
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      )}
                      {t.isAiActive ? (
                        <span className="text-[9px] px-1 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-mono">
                          AI
                        </span>
                      ) : (
                        <span className="text-[9px] px-1 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded font-mono">
                          Human
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Center Column: Live Conversation Window (5.5 Cols) */}
        <div className="lg:col-span-5 bg-[#10131d] border border-neutral-800/90 rounded-3xl flex flex-col overflow-hidden shadow-2xl">
          {currentThread ? (
            <>
              {/* Thread Header */}
              <div className="p-4 border-b border-neutral-800/80 bg-neutral-900/60 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-neutral-950 font-black text-xs shrink-0">
                    {currentThread.customerName.slice(0, 2)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-neutral-100 truncate">
                        {currentThread.customerName}
                      </h3>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          currentThread.channel === 'FACEBOOK_COMMENT'
                            ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
                            : currentThread.channel === 'INSTAGRAM'
                            ? 'bg-pink-500/15 text-pink-300 border-pink-500/30'
                            : currentThread.channel === 'WHATSAPP'
                            ? 'bg-green-500/15 text-green-300 border-green-500/30'
                            : 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                        }`}
                      >
                        {currentThread.channel === 'FACEBOOK_COMMENT'
                          ? '💬 FB Comment'
                          : currentThread.channel === 'INSTAGRAM'
                          ? '📸 Instagram'
                          : currentThread.channel === 'WHATSAPP'
                          ? '🟢 WhatsApp'
                          : '🔵 Messenger'}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400 font-mono mt-0.5">
                      {currentThread.customerPhone || currentThread.psid}
                    </p>
                  </div>
                </div>

                {/* AI Automation Toggle */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleAi(currentThread.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                      currentThread.isAiActive
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25'
                        : 'bg-amber-500/15 text-amber-300 border-amber-500/30 hover:bg-amber-500/25'
                    }`}
                    title="AI অটোমেশন চালু/বন্ধ করুন"
                  >
                    <Bot className="w-3.5 h-3.5" />
                    <span>{currentThread.isAiActive ? 'AI সক্রিয়' : 'ম্যানুয়াল মোড'}</span>
                  </button>
                </div>
              </div>

              {/* Message Bubbles Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#090b12]/50">
                {currentThread.messages.map((msg) => {
                  const isCustomer = msg.sender === 'customer';
                  const isAi = msg.sender === 'ai';

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isCustomer ? 'items-start' : 'items-end'}`}
                    >
                      <div className="flex items-baseline gap-1.5 mb-1 px-1">
                        <span className="text-[10px] font-bold text-neutral-400">
                          {isCustomer
                            ? currentThread.customerName
                            : isAi
                            ? '🤖 Gemini AI'
                            : '👤 অ্যাডমিন (আপনি)'}
                        </span>
                        <span className="text-[9px] text-neutral-500 font-mono">{msg.time}</span>
                      </div>

                      <div
                        className={`max-w-[85%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-md ${
                          isCustomer
                            ? 'bg-neutral-850 border border-neutral-750 text-neutral-100 rounded-tl-none'
                            : isAi
                            ? 'bg-gradient-to-br from-[#131d27] to-[#0c161d] border border-emerald-500/30 text-emerald-100 rounded-tr-none'
                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.text}</p>

                        {/* Product Card Attachment */}
                        {msg.productCard && (
                          <div className="mt-2.5 p-2 bg-neutral-900/90 border border-neutral-700/80 rounded-xl flex items-center gap-3">
                            <img
                              src={msg.productCard.image}
                              alt={msg.productCard.title}
                              className="w-12 h-12 rounded-lg object-cover border border-neutral-700 shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="font-bold text-xs text-neutral-200 truncate">
                                {msg.productCard.title}
                              </p>
                              <p className="text-xs font-mono font-black text-emerald-400">
                                ৳{msg.productCard.price.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quick Snippet Chips */}
              <div className="px-3 py-2 border-t border-neutral-800/80 bg-neutral-900/40 flex items-center gap-1.5 overflow-x-auto text-[11px]">
                <span className="text-neutral-500 text-[10px] shrink-0">দ্রুত রিপ্লাই:</span>
                <button
                  onClick={() => handleQuickSnippet('জি আপু/ভাইয়া, প্রডাক্টটি স্টকে এভেইলেবল আছে।')}
                  className="px-2.5 py-1 bg-neutral-850 hover:bg-neutral-800 border border-neutral-750 text-neutral-300 rounded-lg whitespace-nowrap transition-colors"
                >
                  স্টক আছে
                </button>
                <button
                  onClick={() =>
                    handleQuickSnippet('ঢাকার ভিতরে ডেলিভারি চার্জ ৭০ টাকা, ঢাকার বাইরে ১৩০ টাকা।')
                  }
                  className="px-2.5 py-1 bg-neutral-850 hover:bg-neutral-800 border border-neutral-750 text-neutral-300 rounded-lg whitespace-nowrap transition-colors"
                >
                  ডেলিভারি চার্জ
                </button>
                <button
                  onClick={() =>
                    handleQuickSnippet('আপনার পার্সেলটি Steadfast কুরিয়ারে বুকিং সম্পন্ন হয়েছে।')
                  }
                  className="px-2.5 py-1 bg-neutral-850 hover:bg-neutral-800 border border-neutral-750 text-neutral-300 rounded-lg whitespace-nowrap transition-colors"
                >
                  কুরিয়ার বুকড
                </button>
              </div>

              {/* Live Admin Reply Input */}
              <div className="p-3 border-t border-neutral-800/80 bg-neutral-900/80 flex items-center gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                  placeholder="কাস্টমারকে সরাসরি মেসেজ লিখুন (Enter চাপুন)..."
                  className="flex-1 px-4 py-2.5 bg-neutral-950 border border-neutral-750 focus:border-emerald-500 rounded-2xl text-xs sm:text-sm text-neutral-100 placeholder-neutral-500 outline-none transition-all"
                />
                <button
                  onClick={handleSendReply}
                  disabled={isSending || !replyText.trim()}
                  className="p-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-neutral-950 font-bold rounded-2xl transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:pointer-events-none shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-neutral-500">
              <MessageSquare className="w-12 h-12 text-neutral-700 mb-3" />
              <p className="text-sm font-bold text-neutral-300">কোনো চ্যাট সিলেক্ট করা নেই</p>
              <p className="text-xs text-neutral-500 mt-1">
                বাম পাশের তালিকা থেকে যেকোনো কাস্টমার সিলেক্ট করুন
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Customer & Order Intelligence (2.5 Cols) */}
        <div className="lg:col-span-3 bg-[#10131d] border border-neutral-800/90 rounded-3xl p-5 flex flex-col justify-between overflow-y-auto space-y-4 shadow-2xl">
          {currentThread ? (
            <>
              <div className="space-y-4">
                {/* Header */}
                <div className="pb-3 border-b border-neutral-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                    কাস্টমার প্রোফাইল
                  </span>
                  <span className="text-[10px] px-2 py-0.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-full font-bold">
                    Active Lead
                  </span>
                </div>

                {/* Customer Details */}
                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-neutral-900/80 rounded-2xl space-y-2 border border-neutral-800/70">
                    <p className="font-bold text-neutral-100 text-sm">{currentThread.customerName}</p>
                    <p className="text-neutral-400 font-mono flex items-center gap-1.5">
                      <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{currentThread.customerPhone}</span>
                    </p>
                    {currentThread.customerAddress && (
                      <p className="text-neutral-400 flex items-start gap-1.5 pt-1 border-t border-neutral-800">
                        <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                        <span>{currentThread.customerAddress}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Inferred Product Interest Card */}
                {currentThread.productInterest && (
                  <div className="p-3.5 bg-gradient-to-br from-[#121622] to-[#0c1017] border border-indigo-500/25 rounded-2xl space-y-2.5">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">
                      আগ্রহী প্রোডাক্ট
                    </span>
                    <div className="flex items-center gap-3">
                      {currentThread.productImage && (
                        <img
                          src={currentThread.productImage}
                          alt={currentThread.productInterest}
                          className="w-12 h-12 rounded-xl object-cover border border-neutral-700 shrink-0"
                        />
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-neutral-200 truncate">
                          {currentThread.productInterest}
                        </p>
                        <p className="text-xs font-black text-emerald-400 font-mono">
                          ৳{currentThread.productPrice?.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Order Status Badge if Order Exists */}
                {currentThread.orderNumber && (
                  <div className="p-3 bg-neutral-900/80 border border-neutral-800 rounded-2xl space-y-1.5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-400">অর্ডার নম্বর:</span>
                      <span className="font-mono font-bold text-emerald-400">
                        #OF-{currentThread.orderNumber}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-400">মোট মূল্য:</span>
                      <span className="font-mono font-bold text-neutral-200">
                        ৳{currentThread.totalSpent?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* 1-Click Action Buttons */}
              <div className="space-y-2 pt-3 border-t border-neutral-800">
                <a
                  href={`https://wa.me/88${currentThread.customerPhone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 bg-green-600 hover:bg-green-500 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-md active:scale-95"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>১-ক্লিকে WhatsApp খুলুন</span>
                </a>

                <a
                  href={`tel:${currentThread.customerPhone}`}
                  className="w-full py-2.5 bg-neutral-850 hover:bg-neutral-800 text-neutral-200 border border-neutral-750 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                  <span>সরাসরি কল দিন</span>
                </a>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-xs text-neutral-500">
              কোনো তথ্য নেই
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
