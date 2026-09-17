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
  channel: 'FACEBOOK_MESSENGER' | 'WHATSAPP';
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
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeChannelFilter, setActiveChannelFilter] = useState<'ALL' | 'MESSENGER' | 'WHATSAPP' | 'ORDERS'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedThreadId, setSelectedThreadId] = useState<string>('thread-1');
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Dynamic conversation threads state
  const [threads, setThreads] = useState<ConversationThread[]>([
    {
      id: 'thread-1',
      customerName: 'সাবিহা চৌধুরী',
      customerPhone: '01712345678',
      customerAddress: 'বাড়ি নং ১২, রোড ৪, ধানমন্ডি, ঢাকা',
      channel: 'FACEBOOK_MESSENGER',
      psid: '1314475555081210',
      productInterest: 'জয়পুরি কটন আনস্টিচড থ্রি-পিস',
      productImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80',
      productPrice: 1250,
      lastMessage: 'হ্যাঁ ভাইয়া, অফার প্রাইসে ১২৫০ টাকায় ১ পিস অর্ডার কনফার্ম করে দিন।',
      lastTime: '১০:৪৫ AM',
      unread: true,
      orderNumber: 1048,
      orderStatus: 'PENDING_CONFIRMATION',
      totalSpent: 1320,
      isAiActive: true,
      messages: [
        {
          id: 'm-1',
          sender: 'customer',
          text: 'আসসালামু আলাইকুম, আপনাদের জয়পুরি কটন ড্রেসের কালেকশন দেখতে চাই। দাম কত?',
          time: '১০:৪১ AM',
        },
        {
          id: 'm-2',
          sender: 'ai',
          text: 'ওয়ালাইকুম আসসালাম! আমাদের কাছে জয়পুরি কটন আনস্টিচড থ্রি-পিস এভেইলেবল আছে। অফার প্রাইস মাত্র ১২৫০ টাকা। নিচে ছবি ও বিবরণ দেখে নিন 👇',
          time: '১০:৪১ AM',
          productCard: {
            title: 'জয়পুরি কটন আনস্টিচড থ্রি-পিস',
            price: 1250,
            image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80',
          },
        },
        {
          id: 'm-3',
          sender: 'customer',
          text: 'ঢাকার ভিতর ডেলিভারি চার্জ কত?',
          time: '১০:৪৩ AM',
        },
        {
          id: 'm-4',
          sender: 'ai',
          text: 'ঢাকার ভিতরে হোম ডেলিভারি চার্জ মাত্র ৭০ টাকা এবং ২-৩ দিনের মধ্যে ডেলিভারি পেয়ে যাবেন। ক্যাশ অন ডেলিভারি সুবিধা আছে। অর্ডার করতে আপনার নাম, পূর্ণ ঠিকানা ও সচল মোবাইল নাম্বার দিন।',
          time: '১০:৪৩ AM',
        },
        {
          id: 'm-5',
          sender: 'customer',
          text: 'নাম: সাবিহা চৌধুরী, মোবাইল: 01712345678, ঠিকানা: বাড়ি নং ১২, রোড ৪, ধানমন্ডি, ঢাকা। হ্যাঁ ভাইয়া, অফার প্রাইসে ১২৫০ টাকায় ১ পিস অর্ডার কনফার্ম করে দিন।',
          time: '১০:৪৫ AM',
        },
        {
          id: 'm-6',
          sender: 'ai',
          text: 'ধন্যবাদ আপু! আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে (অর্ডার নং #OF-1048)। মোট প্রদেয়: ১৩২০ টাকা (COD)। আমাদের সেলস প্রতিনিধি দ্রুত কুরিয়ারে বুকিং সম্পন্ন করবেন।',
          time: '১০:৪৫ AM',
        },
      ],
    },
    {
      id: 'thread-2',
      customerName: 'তানভীর আহমেদ',
      customerPhone: '01898765432',
      customerAddress: 'ফ্ল্যাট ৪বি, সেকশন ১১, উত্তরা, ঢাকা',
      channel: 'WHATSAPP',
      productInterest: 'প্রিমিয়াম কাশ্মীরি কুর্তি',
      productImage: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80',
      productPrice: 850,
      lastMessage: 'কাশ্মীরি কুর্তির ব্লু কালার কি সাইজ XL এভেইলেবল আছে?',
      lastTime: '০৯:৩০ AM',
      unread: false,
      orderNumber: 1047,
      orderStatus: 'CONFIRMED',
      totalSpent: 920,
      isAiActive: true,
      messages: [
        {
          id: 'm-21',
          sender: 'customer',
          text: 'হোয়াটসঅ্যাপে নক দিয়েছি, কাশ্মীরি কুর্তির ব্লু কালার কি সাইজ XL এভেইলেবল আছে?',
          time: '০৯:২৮ AM',
        },
        {
          id: 'm-22',
          sender: 'ai',
          text: 'জি ভাইয়া! প্রিমিয়াম কাশ্মীরি কুর্তির রয়্যাল ব্লু কালার XL (সাইজ ৪২) স্টকে এভেইলেবল আছে। দাম মাত্র ৮৫০ টাকা। আপনি কি এখনই অর্ডার করতে চান?',
          time: '০৯:২৯ AM',
          productCard: {
            title: 'প্রিমিয়াম কাশ্মীরি কুর্তি (রয়্যাল ব্লু)',
            price: 850,
            image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80',
          },
        },
      ],
    },
    {
      id: 'thread-3',
      customerName: 'নুসরাত জাহান',
      customerPhone: '01655443322',
      customerAddress: 'জিইসি মোড়, চট্টগ্রাম',
      channel: 'FACEBOOK_MESSENGER',
      productInterest: 'ডিজাইনার সিল্ক পার্টি গাউন',
      productImage: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600&auto=format&fit=crop&q=80',
      productPrice: 1500,
      lastMessage: 'চট্টগ্রামে কি ক্যাশ অন ডেলিভারি হবে?',
      lastTime: 'গতকাল',
      unread: false,
      orderNumber: 1045,
      orderStatus: 'DISPATCHED',
      totalSpent: 1630,
      isAiActive: false,
      messages: [
        {
          id: 'm-31',
          sender: 'customer',
          text: 'ডিজাইনার সিল্ক গাউনটা কি চট্টগ্রামে ক্যাশ অন ডেলিভারি হবে?',
          time: 'গতকাল ৪:১৫ PM',
        },
        {
          id: 'm-32',
          sender: 'ai',
          text: 'জি আপু! সারা বাংলাদেশে আমরা ক্যাশ অন ডেলিভারিতে পার্সেল পাঠাই। চট্টগ্রামের ডেলিভারি চার্জ ১৩০ টাকা।',
          time: 'গতকাল ৪:১৬ PM',
        },
        {
          id: 'm-33',
          sender: 'admin',
          text: 'আপু আপনার পার্সেলটি Steadfast কুরিয়ারে বুকিং করে দেওয়া হয়েছে (ট্র্যাকিং কোড: CID-984210)। ২ দিনের মধ্যে পেয়ে যাবেন ইনশাআল্লাহ।',
          time: 'গতকাল ৫:০০ PM',
        },
      ],
    },
  ]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [ordList, prodList] = await Promise.all([api.getOrders(), api.getProducts()]);
      setOrders(ordList);
      setProducts(prodList);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
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
      if (activeChannelFilter === 'WHATSAPP') return t.channel === 'WHATSAPP';
      if (activeChannelFilter === 'ORDERS') return !!t.orderNumber;
      return true;
    });
  }, [threads, searchQuery, activeChannelFilter]);

  const currentThread = threads.find((t) => t.id === selectedThreadId) || threads[0];

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
            ফেসবুক মেসেঞ্জার এবং হোয়াটসঅ্যাপের সকল কাস্টমার চ্যাট এক স্ক্রিনে দেখুন, AI হ্যান্ডলিং মনিটর করুন এবং সরাসরি ড্যাশবোর্ড থেকে রিপ্লাই দিন।
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-3.5 py-2 bg-neutral-900 hover:bg-neutral-850 text-neutral-300 border border-neutral-750 rounded-xl text-xs font-semibold transition-all shadow-sm active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
            <span>সিঙ্ক করুন</span>
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
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
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
          <div className="flex-1 overflow-y-auto divide-y divide-neutral-850/60 p-2 space-y-1">
            {filteredThreads.length === 0 ? (
              <div className="p-8 text-center text-neutral-500 text-xs">
                কোনো চ্যাট থ্রেড পাওয়া যায়নি
              </div>
            ) : (
              filteredThreads.map((t) => {
                const isSelected = t.id === currentThread?.id;

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
                        className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white shadow-sm ${
                          t.channel === 'FACEBOOK_MESSENGER' ? 'bg-blue-500' : 'bg-green-500'
                        }`}
                        title={t.channel === 'FACEBOOK_MESSENGER' ? 'Messenger' : 'WhatsApp'}
                      >
                        {t.channel === 'FACEBOOK_MESSENGER' ? 'M' : 'W'}
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
          {/* Thread Header */}
          <div className="p-4 border-b border-neutral-800/80 bg-neutral-900/60 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-neutral-950 font-black text-xs shrink-0">
                {currentThread?.customerName.slice(0, 2)}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-neutral-100 truncate">
                    {currentThread?.customerName}
                  </h3>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      currentThread?.channel === 'FACEBOOK_MESSENGER'
                        ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                        : 'bg-green-500/15 text-green-300 border-green-500/30'
                    }`}
                  >
                    {currentThread?.channel === 'FACEBOOK_MESSENGER'
                      ? '🔵 Messenger'
                      : '🟢 WhatsApp'}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 font-mono mt-0.5">
                  {currentThread?.customerPhone}
                </p>
              </div>
            </div>

            {/* AI Automation Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => currentThread && handleToggleAi(currentThread.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                  currentThread?.isAiActive
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25'
                    : 'bg-amber-500/15 text-amber-300 border-amber-500/30 hover:bg-amber-500/25'
                }`}
                title="AI অটোমেশন চালু/বন্ধ করুন"
              >
                <Bot className="w-3.5 h-3.5" />
                <span>{currentThread?.isAiActive ? 'AI সক্রিয়' : 'ম্যানুয়াল মোড'}</span>
              </button>
            </div>
          </div>

          {/* Message Bubbles Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#090b12]/50">
            {currentThread?.messages.map((msg) => {
              const isCustomer = msg.sender === 'customer';
              const isAi = msg.sender === 'ai';
              const isAdmin = msg.sender === 'admin';

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
        </div>

        {/* Right Column: Customer & Order Intelligence (2.5 Cols) */}
        <div className="lg:col-span-3 bg-[#10131d] border border-neutral-800/90 rounded-3xl p-5 flex flex-col justify-between overflow-y-auto space-y-4 shadow-2xl">
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
                <p className="font-bold text-neutral-100 text-sm">{currentThread?.customerName}</p>
                <p className="text-neutral-400 font-mono flex items-center gap-1.5">
                  <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{currentThread?.customerPhone}</span>
                </p>
                {currentThread?.customerAddress && (
                  <p className="text-neutral-400 flex items-start gap-1.5 pt-1 border-t border-neutral-800">
                    <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                    <span>{currentThread.customerAddress}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Inferred Product Interest Card */}
            {currentThread?.productInterest && (
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
            {currentThread?.orderNumber && (
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
              href={`https://wa.me/88${currentThread?.customerPhone.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 bg-green-600 hover:bg-green-500 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-md active:scale-95"
            >
              <MessageCircle className="w-4 h-4" />
              <span>১-ক্লিকে WhatsApp খুলুন</span>
            </a>

            <a
              href={`tel:${currentThread?.customerPhone}`}
              className="w-full py-2.5 bg-neutral-850 hover:bg-neutral-800 text-neutral-200 border border-neutral-750 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
              <span>সরাসরি কল দিন</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
