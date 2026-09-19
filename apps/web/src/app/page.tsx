'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Zap,
  Bot,
  Sparkles,
  ShoppingBag,
  Truck,
  ArrowRight,
  CheckCircle2,
  PhoneCall,
  MessageCircle,
  ShieldCheck,
  BarChart3,
  Layers,
  Clock,
  Printer,
  ChevronRight,
  ExternalLink,
  Star,
  Users,
  TrendingUp,
  HelpCircle,
  Play,
  Lock,
  ArrowUpRight,
  Send,
  Eye,
  Check,
} from 'lucide-react';
import { formatBDTEn } from '@/lib/utils';

export default function LandingPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [dailyOrders, setDailyOrders] = useState(25);
  const [simulatedChatMessages, setSimulatedChatMessages] = useState<
    Array<{ sender: 'user' | 'bot'; text: string; time: string; image?: string }>
  >([]);
  const [simInput, setSimInput] = useState('');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Auto-advance step demo every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 6);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Calculator calculations
  const monthlyOrders = dailyOrders * 30;
  const hoursSavedPerMonth = Math.round((dailyOrders * 8 * 30) / 60); // 8 mins per order manual chat/entry
  const estimatedSavingsBDT = dailyOrders * 350; // extra staff & time cost
  const potentialExtraSales = Math.round(monthlyOrders * 0.22); // 22% conversion bump due to instant reply

  const steps = [
    {
      id: 0,
      title: '১. কাস্টমার মেসেঞ্জারে নক করে',
      shortTitle: 'মেসেজ শুরু',
      subtitle: 'রাত ২টা বা ছুটির দিন—কাস্টমার যে কোনো সময়ে দাম বা ছবি দেখতে চায়',
      icon: MessageCircle,
      badge: 'Step 1: Inquiry',
      color: 'from-blue-500/20 to-cyan-500/10 text-blue-400 border-blue-500/30',
      demo: {
        type: 'chat',
        userMsg: 'আসসালামু আলাইকুম ভাইয়া, জয়পুরি কটন থ্রি-পিসের ছবি আর দাম কত?',
        aiMsg: 'ওয়ালাইকুম আসসালাম! আমাদের কাছে জয়পুরি কটন আনস্টিচড থ্রি-পিস এভেইলেবল আছে। অফার প্রাইস মাত্র ১২৫০ টাকা। নিচে ছবি দেখে নিন 👇',
        image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80',
        actionText: '📷 ১:১ ফুল এইচডি ছবি ও দাম লোড হয়েছে',
      },
    },
    {
      id: 1,
      title: '২. Gemini AI লাইভ ছবি ও ভ্যারিয়েন্ট দেখায়',
      shortTitle: 'AI ক্যাটালগ',
      subtitle: 'ডাটাবেজ থেকে রিয়েলটাইম দাম, ডিসকাউন্ট ও ছবি দেখিয়ে কাস্টমার কনভিন্স করে',
      icon: Bot,
      badge: 'Step 2: Intelligent Showroom',
      color: 'from-indigo-500/20 to-purple-500/10 text-indigo-300 border-indigo-500/30',
      demo: {
        type: 'product_showcase',
        productName: 'জয়পুরি কটন আনস্টিচড থ্রি-পিস',
        price: '৳১,২৫০',
        regularPrice: '৳১,৫০০',
        features: ['১০০% পিওর কটন ফেব্রিক', 'ম্যাচিং ওড়না ও সেলোয়ার', 'কালার গ্যারান্টি'],
        stockText: 'স্টক সীমিত (১২ পিস বাকি)',
      },
    },
    {
      id: 2,
      title: '৩. ফোন ও ফুল ঠিকানা ভেরিফিকেশন',
      shortTitle: 'অর্ডার ক্যাপচার',
      subtitle: 'AI নিখুঁত ১১ ডিজিটের ফোন নাম্বার এবং সম্পূর্ণ ঠিকানা সংগ্রহ করে',
      icon: ShieldCheck,
      badge: 'Step 3: Fraud Shield',
      color: 'from-emerald-500/20 to-teal-500/10 text-emerald-300 border-emerald-500/30',
      demo: {
        type: 'verification',
        name: 'সাবিহা চৌধুরী',
        phone: '01712-345678',
        phoneStatus: 'ভেরিফায়েড ১১ ডিজিট নম্বর ✅',
        address: 'বাড়ি নং ১২, রোড ৪, ধানমন্ডি, ঢাকা',
        deliveryCharge: 'ঢাকার ভিতর ৳৭০',
      },
    },
    {
      id: 3,
      title: '৪. লাইভ ড্যাশবোর্ডে ইনস্ট্যান্ট সিঙ্ক',
      shortTitle: 'ড্যাশবোর্ড সিঙ্ক',
      subtitle: 'কোনো এক্সেল শিটের ঝামেলা নেই, সেকেন্ডের মধ্যে ড্যাশবোর্ডে নতুন অর্ডার চলে আসে',
      icon: Layers,
      badge: 'Step 4: Live Inventory',
      color: 'from-teal-500/20 to-emerald-500/10 text-teal-300 border-teal-500/30',
      demo: {
        type: 'dashboard_item',
        orderNo: '#OF-1048',
        amount: '৳১,৩২০ (COD)',
        channel: 'Facebook Messenger AI',
        status: 'PENDING_CONFIRMATION',
      },
    },
    {
      id: 4,
      title: '৫. ১-ক্লিকে ইনভয়েস ও মেমো জেনারেট',
      shortTitle: 'মেমো ও ইনভয়েস',
      subtitle: 'কাস্টমারের বিস্তারিত বিবরণ ও বারকোড সহ প্রফেশনাল ক্যাশমেমো ইনস্ট্যান্ট তৈরি ও প্রিন্ট',
      icon: Printer,
      badge: 'Step 5: Instant Invoice',
      color: 'from-purple-500/20 to-pink-500/10 text-purple-300 border-purple-500/30',
      demo: {
        type: 'invoice_ready',
        invoiceNo: 'INV-1048',
        customer: 'সাবিহা চৌধুরী',
        amount: '৳১,৩২০',
        status: 'প্রিন্ট ও ডেলিভারি রেডি',
      },
    },
    {
      id: 5,
      title: '৬. ১-ক্লিকে সরাসরি WhatsApp চ্যাট',
      shortTitle: 'কাস্টমার কানেক্ট',
      subtitle: 'মোবাইলে নম্বর সেভ করা ছাড়াই ড্যাশবোর্ড থেকে ১-ক্লিকে WhatsApp বা কল ওপেন',
      icon: MessageCircle,
      badge: 'Step 6: Omnichannel Connect',
      color: 'from-emerald-500/20 to-green-500/10 text-emerald-300 border-emerald-500/30',
      demo: {
        type: 'whatsapp_connect',
        customerPhone: '+8801712345678',
        directAction: '১-ক্লিকে অফিসিয়াল WhatsApp চ্যাট চালু',
        smsPreview: 'আপনার অর্ডার #OF-1048 ডেলিভারির জন্য প্রস্তুত করা হয়েছে।',
      },
    },
  ];

  const faqs = [
    {
      q: 'AI কি আসলেই সাধারণ চ্যাটবট নাকি মানুষের মতো বাংলায় কথা বলতে পারে?',
      a: 'OrderFlow BD চালিত হচ্ছে Google Gemini AI দিয়ে। এটি সাধারণ বাটন-ভিত্তিক বোকা বট নয়। কাস্টমার যেভাবেই বাংলায় বা বাংলিশে প্রশ্ন করুক না কেন—সাইজ, কালার, স্টক বা ডেলিভারির নিয়ম নিয়ে মানুষের মতোই মিষ্টি ও সাবলীল বাংলায় কথা বলে ডিল ক্লোজ করে।',
    },
    {
      q: 'অর্ডারগুলো কীভাবে ডেলিভারির জন্য প্রসেস করা হয়?',
      a: 'অর্ডার কনফার্ম হওয়ার সাথে সাথে ড্যাশবোর্ডে কাস্টমারের নাম, মোবাইল ও সম্পূর্ণ ডেলিভারি ঠিকানাসহ অটোমেটিক মেমো ও চালান তৈরি হয়। আপনি ড্যাশবোর্ড থেকেই স্ট্যাটাস আপডেট (Confirmed, In-Transit, Delivered) এবং কাস্টমার যোগাযোগ সহজে পরিচালনা করতে পারবেন।',
    },
    {
      q: 'আমি নতুন প্রোডাক্ট অ্যাড করলে AI কীভাবে জানতে পারবে?',
      a: 'আপনার কাজ শুধু ড্যাশবোর্ডে গিয়ে প্রোডাক্টের ছবি, দাম ও বিবরণ সেভ করা। কোনো ম্যানুয়াল ট্রেনিং দরকার নেই—ডাটাবেজে যুক্ত হওয়া মাত্রই AI সেই নতুন প্রডাক্টের ছবি ও তথ্য কাস্টমারদের দেখানো শুরু করে।',
    },
    {
      q: 'ফেসবুক মেসেঞ্জার এবং হোয়াটসঅ্যাপ কি এক জায়গা থেকেই হ্যান্ডেল করা যাবে?',
      a: 'হ্যাঁ! কাস্টমার মেসেঞ্জারে কথা বলুক বা হোয়াটসঅ্যাপে অর্ডার দিক—সব মেসেজ ও অর্ডার আপনার একটাই OrderFlow BD ড্যাশবোর্ডে চলে আসবে। আপনি ড্যাশবোর্ড থেকেই লাইভ মনিটরিং এবং ১-ক্লিকে কাস্টমারের সাথে যোগাযোগ করতে পারবেন।',
    },
  ];

  return (
    <div className="min-h-screen bg-[#07080c] text-neutral-100 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* 1. Header / Navigation */}
      <header className="sticky top-0 z-50 bg-[#07080c]/85 backdrop-blur-2xl border-b border-neutral-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 flex items-center justify-center text-neutral-950 font-black shadow-lg shadow-emerald-500/25 group-hover:scale-105 transition-transform duration-300">
              <Zap className="w-6 h-6 fill-neutral-950 text-neutral-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl sm:text-2xl text-neutral-100 tracking-tight">
                  OrderFlow
                </span>
                <span className="px-2 py-0.5 text-[11px] font-black bg-gradient-to-r from-emerald-400 to-teal-300 text-neutral-950 rounded-md shadow-sm">
                  BD 2.0
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 font-medium">
                AI F-Commerce Automation Platform
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-neutral-300">
            <a href="#how-it-works" className="hover:text-emerald-400 transition-colors">
              কীভাবে কাজ করে
            </a>
            <a href="#features" className="hover:text-emerald-400 transition-colors">
              ফিচারসমূহ
            </a>
            <a href="#crm-saas" className="hover:text-emerald-400 transition-colors">
              CRM ও টিম ম্যানেজমেন্ট
            </a>
            <a href="#calculator" className="hover:text-emerald-400 transition-colors">
              খরচ ও সময় ক্যালকুলেটর
            </a>
            <a href="#faq" className="hover:text-emerald-400 transition-colors">
              FAQ
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-bold text-neutral-300 hover:text-white bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-750 rounded-xl transition-all"
            >
              লগইন / ডেমো
            </Link>
            <Link
              href="/register"
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-neutral-950 font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-500/25 active:scale-95 transition-all"
            >
              <span>শুরু করুন</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden">
        {/* Background ambient lighting */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[650px] h-[350px] bg-gradient-to-tr from-emerald-500/15 via-teal-500/10 to-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 -right-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm font-bold rounded-full shadow-lg shadow-emerald-500/10 backdrop-blur-md">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>AI F-Commerce Automation & Multi-Tenant SaaS Platform</span>
          </div>

          {/* Main Headline */}
          <div className="space-y-4 max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-neutral-100 tracking-tight leading-[1.2]">
              মেসেঞ্জারে অটোমেটিক সেলস,{' '}
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                স্মার্ট অর্ডার প্রসেসিং
              </span>{' '}
              ও অ্যাডভান্সড CRM ড্যাশবোর্ড!
            </h1>
            <p className="text-base sm:text-xl text-neutral-300 leading-relaxed max-w-3xl mx-auto font-normal">
              পেজে শত শত কাস্টমার মেসেজ দিলেও আর একটি সেলও মিস হবে না। Google Gemini AI মানুষের মতো
              মিষ্টি বাংলায় কথা বলে ১:১ সাইজে ছবি দেখিয়ে অর্ডার নিবে, ড্যাশবোর্ডে টিম অ্যাসাইনমেন্ট ও ট্যাগিং করবে এবং স্বয়ংক্রিয়ভাবে ক্যাশমেমো তৈরি করবে।
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-neutral-950 font-black text-base rounded-2xl shadow-xl shadow-emerald-500/25 active:scale-95 transition-all flex items-center justify-center gap-2.5 group"
            >
              <span>🚀 শুরু করুন</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/login"
              className="w-full sm:w-auto px-7 py-4 bg-neutral-900/90 hover:bg-neutral-850 text-neutral-200 hover:text-white border border-neutral-750 hover:border-neutral-600 font-bold text-base rounded-2xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 text-emerald-400 fill-emerald-400" />
              <span>১-ক্লিক ডেমো অ্যাকাউন্ট ট্রাই করুন</span>
            </Link>
          </div>

          {/* Quick Metrics Pills */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto pt-6 text-left">
            <div className="p-3.5 bg-neutral-900/60 border border-neutral-800/80 rounded-2xl flex items-center gap-3">
              <div className="p-2 bg-emerald-500/15 text-emerald-400 rounded-xl">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-neutral-400">রেসপন্স টাইম</p>
                <p className="text-sm font-bold text-neutral-100 font-mono">০.৫ সেকেন্ড</p>
              </div>
            </div>

            <div className="p-3.5 bg-neutral-900/60 border border-neutral-800/80 rounded-2xl flex items-center gap-3">
              <div className="p-2 bg-purple-500/15 text-purple-400 rounded-xl">
                <Printer className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-neutral-400">মেমো ও ইনভয়েস</p>
                <p className="text-sm font-bold text-purple-300 font-mono">১-ক্লিক ক্যাশমেমো</p>
              </div>
            </div>

            <div className="p-3.5 bg-neutral-900/60 border border-neutral-800/80 rounded-2xl flex items-center gap-3">
              <div className="p-2 bg-blue-500/15 text-blue-400 rounded-xl">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-neutral-400">চ্যাট এআই</p>
                <p className="text-sm font-bold text-blue-300 font-mono">Gemini 2.5 Flash</p>
              </div>
            </div>

            <div className="p-3.5 bg-neutral-900/60 border border-neutral-800/80 rounded-2xl flex items-center gap-3">
              <div className="p-2 bg-teal-500/15 text-teal-400 rounded-xl">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-neutral-400">সেলস গ্রোথ</p>
                <p className="text-sm font-bold text-emerald-400 font-mono">+৩০% কনভার্সন</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Interactive 6-Step Visual Workflow Demonstration */}
      <section id="how-it-works" className="py-20 bg-[#0a0c13] border-y border-neutral-800/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Section Header */}
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold rounded-full">
              <Sparkles className="w-3.5 h-3.5" />
              <span>রিয়েল-ওয়ার্ল্ড ইন্টারেক্টিভ সিমুলেটর</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-neutral-100 tracking-tight">
              ইনবক্স থেকে সফল ডেলিভারি —{' '}
              <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                স্টেপ বাই স্টেপ কীভাবে কাজ করে?
              </span>
            </h2>
            <p className="text-sm sm:text-base text-neutral-400">
              যেকোনো একটি স্টেপে ক্লিক করে লাইভ দেখুন OrderFlow BD কীভাবে আপনার ব্যবসার প্রতিটি স্তর একা পরিচালনা করে।
            </p>
          </div>

          {/* Interactive Step Switcher & Showcase Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Step Navigation Tabs (Left 5 Cols) */}
            <div className="lg:col-span-5 space-y-3">
              {steps.map((s, idx) => {
                const Icon = s.icon;
                const isCurrent = activeStep === idx;

                return (
                  <button
                    key={s.id}
                    onClick={() => setActiveStep(idx)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 flex items-start gap-4 ${
                      isCurrent
                        ? 'bg-gradient-to-r from-neutral-900 via-neutral-850 to-neutral-900 border-emerald-500/40 shadow-xl shadow-emerald-500/5 scale-[1.02]'
                        : 'bg-neutral-900/40 hover:bg-neutral-900/70 border-neutral-800/70 text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    <div
                      className={`p-2.5 rounded-xl border shrink-0 transition-all ${
                        isCurrent
                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                          : 'bg-neutral-800/80 border-neutral-700/60 text-neutral-400'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <h3
                          className={`font-bold text-sm sm:text-base leading-snug ${
                            isCurrent ? 'text-neutral-100' : 'text-neutral-300'
                          }`}
                        >
                          {s.title}
                        </h3>
                        {isCurrent && (
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-neutral-400 mt-1 leading-relaxed line-clamp-2">
                        {s.subtitle}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Simulated Live Visual Display (Right 7 Cols) */}
            <div className="lg:col-span-7 bg-[#10131d] border border-neutral-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden min-h-[440px] flex flex-col justify-between">
              {/* Glow */}
              <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Demo Card Header */}
              <div className="flex items-center justify-between pb-4 border-b border-neutral-800/80 relative z-10">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="text-xs font-mono text-neutral-400 ml-2">
                    OrderFlow BD Simulator
                  </span>
                </div>
                <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  {steps[activeStep].badge}
                </span>
              </div>

              {/* Dynamic Content based on Active Step */}
              <div className="py-6 relative z-10 my-auto">
                {activeStep === 0 && (
                  <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300 max-w-md mx-auto">
                    {/* Customer Message */}
                    <div className="flex justify-end">
                      <div className="bg-blue-600 text-white p-3.5 rounded-2xl rounded-tr-none text-xs sm:text-sm max-w-[85%] shadow-md">
                        {steps[0].demo.userMsg}
                      </div>
                    </div>

                    {/* AI Bot Message */}
                    <div className="flex gap-2.5 items-start">
                      <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-neutral-950 font-black text-xs shrink-0">
                        AI
                      </div>
                      <div className="bg-neutral-850 border border-neutral-750 p-3.5 rounded-2xl rounded-tl-none text-xs sm:text-sm text-neutral-200 max-w-[85%] space-y-2 shadow-md">
                        <p>{steps[0].demo.aiMsg}</p>
                        <div className="rounded-xl overflow-hidden border border-neutral-700/80 aspect-square max-w-[200px] relative">
                          <img
                            src={steps[0].demo.image}
                            alt="Product Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeStep === 1 && (
                  <div className="animate-in fade-in zoom-in-95 duration-300 max-w-md mx-auto bg-neutral-900/90 border border-neutral-750 rounded-2xl p-5 space-y-4 shadow-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                        Google Gemini Live Sync
                      </span>
                      <span className="text-[11px] font-bold px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
                        {steps[1].demo.stockText || 'স্টক এভেইলেবল'}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-neutral-100">
                      {steps[1].demo.productName || 'জয়পুরি কটন আনস্টিচড থ্রি-পিস'}
                    </h4>

                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-emerald-400 font-mono">
                        {steps[1].demo.price || '৳১,২৫০'}
                      </span>
                      <span className="text-xs text-neutral-500 line-through">
                        {steps[1].demo.regularPrice || '৳১,৫০০'}
                      </span>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-neutral-800">
                      {['১০০% পিওর কটন ফেব্রিক', 'ম্যাচিং ওড়না ও সেলোয়ার', 'কালার গ্যারান্টি'].map((f, i) => (
                        <p key={i} className="text-xs text-neutral-300 flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{f}</span>
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {activeStep === 2 && (
                  <div className="animate-in fade-in zoom-in-95 duration-300 max-w-md mx-auto bg-neutral-900/90 border border-neutral-750 rounded-2xl p-5 space-y-3.5 shadow-xl">
                    <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                      <ShieldCheck className="w-4 h-4" />
                      <span>ভেরিফায়েড কাস্টমার ইনফরমেশন</span>
                    </div>

                    <div className="space-y-2 text-xs text-neutral-200">
                      <div className="p-2.5 bg-neutral-800/80 rounded-xl flex justify-between">
                        <span className="text-neutral-400">নাম:</span>
                        <span className="font-bold">{steps[2].demo.name}</span>
                      </div>
                      <div className="p-2.5 bg-neutral-800/80 rounded-xl flex justify-between items-center">
                        <span className="text-neutral-400">মোবাইল:</span>
                        <span className="font-mono font-bold text-emerald-400">
                          {steps[2].demo.phone}
                        </span>
                      </div>
                      <div className="p-2.5 bg-neutral-800/80 rounded-xl flex justify-between">
                        <span className="text-neutral-400">ঠিকানা:</span>
                        <span className="font-medium text-right max-w-[200px]">
                          {steps[2].demo.address}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {activeStep === 3 && (
                  <div className="animate-in fade-in zoom-in-95 duration-300 max-w-md mx-auto bg-neutral-900/90 border border-neutral-750 rounded-2xl p-5 space-y-4 shadow-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-teal-400">
                        ড্যাশবোর্ডে নতুন অর্ডার যোগ হয়েছে
                      </span>
                      <span className="text-[11px] font-mono font-bold px-2 py-0.5 bg-teal-500/20 text-teal-300 rounded-lg">
                        {steps[3].demo.orderNo}
                      </span>
                    </div>

                    <div className="p-4 bg-neutral-800/80 rounded-xl space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-neutral-400">মোট টাকা:</span>
                        <span className="text-lg font-mono font-black text-emerald-400">
                          {steps[3].demo.amount}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-neutral-400">অর্ডার চ্যানেল:</span>
                        <span className="font-semibold text-neutral-200">
                          {steps[3].demo.channel}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {activeStep === 4 && (
                  <div className="animate-in fade-in zoom-in-95 duration-300 max-w-md mx-auto bg-neutral-900/90 border border-purple-500/30 rounded-2xl p-5 space-y-4 shadow-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Printer className="w-5 h-5 text-purple-400" />
                        <span className="text-sm font-bold text-purple-300">
                          প্রিন্ট-রেডি ক্যাশমেমো ও বারকোড
                        </span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-md">
                        ৮০ মিমি রেডি
                      </span>
                    </div>

                    <div className="p-3.5 bg-purple-950/30 border border-purple-500/20 rounded-xl space-y-1.5 font-mono text-xs">
                      <div className="flex justify-between">
                        <span className="text-neutral-400">চালান নং:</span>
                        <span className="text-purple-300 font-bold">{steps[4].demo.invoiceNo}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">কাস্টমার:</span>
                        <span className="text-neutral-200">{steps[4].demo.customer}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">মোট বিল (COD):</span>
                        <span className="text-emerald-400 font-bold">{steps[4].demo.amount}</span>
                      </div>
                    </div>

                    <p className="text-xs text-neutral-300 text-center font-medium">
                      🖨️ ১-ক্লিক থার্মাল ও এ৪ ক্যাশমেমো প্রিন্ট করে পার্সেলের সাথে সেঁটে দিন!
                    </p>
                  </div>
                )}

                {activeStep === 5 && (
                  <div className="animate-in fade-in zoom-in-95 duration-300 max-w-md mx-auto bg-neutral-900/90 border border-emerald-500/30 rounded-2xl p-5 space-y-4 shadow-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-5 h-5 text-emerald-400" />
                        <span className="text-sm font-bold text-emerald-300">
                          ১-ক্লিক WhatsApp ও SMS
                        </span>
                      </div>
                    </div>

                    <div className="p-3.5 bg-neutral-800/80 rounded-xl space-y-2 text-xs">
                      <p className="text-neutral-400">
                        নম্বর সেভ ছাড়াই চ্যাট:{' '}
                        <span className="text-emerald-300 font-mono font-bold">
                          {steps[5].demo.customerPhone}
                        </span>
                      </p>
                      <div className="p-2.5 bg-neutral-900 border border-neutral-700/80 rounded-lg text-neutral-300 text-[11px] leading-relaxed">
                        📩 {steps[5].demo.smsPreview}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer Next/Prev */}
              <div className="flex items-center justify-between pt-4 border-t border-neutral-800/80 relative z-10 text-xs">
                <span className="text-neutral-400">স্টেপ {activeStep + 1} / ৬</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveStep((prev) => (prev > 0 ? prev - 1 : 5))}
                    className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg font-semibold"
                  >
                    আগেরটি
                  </button>
                  <button
                    onClick={() => setActiveStep((prev) => (prev < 5 ? prev + 1 : 0))}
                    className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 rounded-lg font-semibold"
                  >
                    পরবর্তী স্টেপ →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Core Features Showcase */}
      <section id="features" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold rounded-full">
            <Zap className="w-3.5 h-3.5" />
            <span>আধুনিক প্রযুক্তি ও সুপারপাওয়ার</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-neutral-100 tracking-tight">
            কেন সাধারণ বট বাদ দিয়ে{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              OrderFlow BD ব্যবহার করবেন?
            </span>
          </h2>
          <p className="text-sm sm:text-base text-neutral-400">
            বাজারের প্রচলিত রোবটিক চ্যাটবটের দিন শেষ। আমাদের এআই কাস্টমারকে বুঝবে ঠিক একজন সিনিয়র সেলস এক্সিকিউটিভের মতো।
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="bg-[#10121b] border border-neutral-800/80 hover:border-emerald-500/40 rounded-3xl p-6 sm:p-7 space-y-4 transition-all group shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold text-neutral-100">
              Google Gemini 2.5 AI ব্রেন
            </h3>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
              কোনো ফিক্সড বাটন বা টেমপ্লেট নয়। কাস্টমার বাংলিশে লিখুক বা ভাঙা বাংলায়—আমাদের AI নিখুঁতভাবে অর্থ বুঝে চমৎকার বাংলায় রেসপন্স করে।
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-[#10121b] border border-neutral-800/80 hover:border-purple-500/40 rounded-3xl p-6 sm:p-7 space-y-4 transition-all group shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold text-neutral-100">
              অর্ডার ও ডেলিভারি লাইফসাইকেল
            </h3>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
              অর্ডার গ্রহণ, কনফার্মেশন, ইন-ট্রানজিট এবং ডেলিভারি সম্পন্ন হওয়া পর্যন্ত পুরো সেলস ও ডেলিভারি পাইপলাইন এক স্ক্রিনে ট্র্যাক করুন।
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-[#10121b] border border-neutral-800/80 hover:border-blue-500/40 rounded-3xl p-6 sm:p-7 space-y-4 transition-all group shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold text-neutral-100">
              লাইভ ডাটাবেজ ক্যাটালগ সিঙ্ক
            </h3>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
              ড্যাশবোর্ডে নতুন প্রোডাক্ট যোগ করার সাথে সাথে AI নিজে থেকেই তা চিনে ফেলে এবং কাস্টমারদের কাছে নতুন কালেকশন প্রদর্শন করে।
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-[#10121b] border border-neutral-800/80 hover:border-teal-500/40 rounded-3xl p-6 sm:p-7 space-y-4 transition-all group shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/15 border border-teal-500/30 text-teal-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <MessageCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold text-neutral-100">
              সেন্ট্রালাইজড ওমনি-চ্যানেল ইনবক্স
            </h3>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
              মেসেঞ্জার এবং হোয়াটসঅ্যাপ—দুই প্ল্যাটফর্মের সব অর্ডার ও চ্যাট একটিমাত্র ড্যাশবোর্ডে। কোনো আলাদা সফটওয়্যারে যাওয়ার প্রয়োজন নেই।
            </p>
          </div>

          {/* Feature 5 */}
          <div className="bg-[#10121b] border border-neutral-800/80 hover:border-amber-500/40 rounded-3xl p-6 sm:p-7 space-y-4 transition-all group shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Printer className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold text-neutral-100">
              প্রিন্ট-রেডি মেমো ও ইনভয়েস
            </h3>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
              প্রতিটি অর্ডারের প্রফেশনাল মেমো ১-ক্লিকে প্রিন্ট করুন এবং পার্সেলের সাথে সেঁটে দিন। ব্র্যান্ডিং হবে প্রিমিয়াম ও আকর্ষণীয়।
            </p>
          </div>

          {/* Feature 6 */}
          <div className="bg-[#10121b] border border-neutral-800/80 hover:border-pink-500/40 rounded-3xl p-6 sm:p-7 space-y-4 transition-all group shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-pink-500/15 border border-pink-500/30 text-pink-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold text-neutral-100">
              ভুল নম্বর ও ফেক অর্ডার প্রটেকশন
            </h3>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
              ১০ ডিজিট বা অসম্পূর্ণ ফোন নাম্বার দিলে AI নিজ দায়িত্বে কাস্টমারকে বলে সঠিক ১১ ডিজিট নাম্বার ও পরিষ্কার ঠিকানা নিশ্চিত করে।
            </p>
          </div>
        </div>
      </section>

      {/* 4.5. CRM & Multi-Tenant SaaS Section */}
      <section id="crm-saas" className="py-20 bg-[#090b12] border-t border-neutral-800/80 relative overflow-hidden">
        <div className="absolute top-1/2 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14 relative z-10">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold rounded-full">
              <Users className="w-3.5 h-3.5" />
              <span>Multi-Tenant Enterprise Architecture</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-neutral-100 tracking-tight">
              সম্পূর্ণ টিম ও ইনবক্স কন্ট্রোল —{' '}
              <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
                একটি সেন্ট্রালাইজড CRM সল্যুশন
              </span>
            </h2>
            <p className="text-sm sm:text-base text-neutral-400">
              একাধিক কর্মী, পেজ ও চ্যাট হ্যান্ডেল করুন কোনো কনফিউশন ছাড়াই। রোল-বেসড অ্যাক্সেস এবং কাস্টম ট্যাগের মাধ্যমে দ্রুত ডিল ক্লোজ করুন।
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#10131f] border border-neutral-800/80 rounded-3xl p-6 space-y-4 hover:border-indigo-500/40 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center font-black">
                👥
              </div>
              <h3 className="text-lg font-bold text-neutral-100">৩-লেভেল রোল ও টিম ম্যানেজমেন্ট</h3>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                Super Admin, Store Owner/Admin এবং Support Agent রোল। এজেন্টরা শুধুমাত্র অনুমোদিত চ্যাট ও অর্ডার দেখতে পারবে, কোনো কনফিগারেশন পরিবর্তন করতে পারবে না।
              </p>
              <div className="flex flex-wrap gap-1.5 pt-2">
                <span className="px-2 py-0.5 text-[11px] font-bold bg-amber-500/15 text-amber-300 rounded-md border border-amber-500/30">👑 Super Admin</span>
                <span className="px-2 py-0.5 text-[11px] font-bold bg-indigo-500/15 text-indigo-300 rounded-md border border-indigo-500/30">💼 Admin</span>
                <span className="px-2 py-0.5 text-[11px] font-bold bg-emerald-500/15 text-emerald-300 rounded-md border border-emerald-500/30">💬 Agent</span>
              </div>
            </div>

            <div className="bg-[#10131f] border border-neutral-800/80 rounded-3xl p-6 space-y-4 hover:border-indigo-500/40 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-400 flex items-center justify-center font-black">
                🏷️
              </div>
              <h3 className="text-lg font-bold text-neutral-100">অ্যাডভান্সড ৩-কলাম CRM ইনবক্স</h3>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                চ্যাট স্ট্যাটাস পাইপলাইন (Open, Pending, Resolved), টিম অ্যাসাইনমেন্ট, হট লিড / ভিআইপি ট্যাগ এবং কাস্টমার হিস্ট্রি টাইমলাইন এক স্ক্রিনে।
              </p>
              <div className="flex flex-wrap gap-1.5 pt-2">
                <span className="px-2 py-0.5 text-[11px] font-bold bg-rose-500/15 text-rose-300 rounded-md border border-rose-500/30">🔥 Hot Lead</span>
                <span className="px-2 py-0.5 text-[11px] font-bold bg-purple-500/15 text-purple-300 rounded-md border border-purple-500/30">💎 VIP</span>
                <span className="px-2 py-0.5 text-[11px] font-bold bg-amber-500/15 text-amber-300 rounded-md border border-amber-500/30">⏰ Follow Up</span>
              </div>
            </div>

            <div className="bg-[#10131f] border border-neutral-800/80 rounded-3xl p-6 space-y-4 hover:border-indigo-500/40 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-black">
                🔒
              </div>
              <h3 className="text-lg font-bold text-neutral-100">প্রাইভেট ইন্টারনাল নোটস ও সিকিউরিটি</h3>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                টিমের সদস্যরা নিজেদের মধ্যে যেকোনো কথোপকথনে গোপন নোট রাখতে পারবে যা কাস্টমার কখনোই দেখবে না। সাথে PBKDF2 এনক্রিপশন ও রেট লিমিটিং।
              </p>
              <div className="flex flex-wrap gap-1.5 pt-2">
                <span className="px-2 py-0.5 text-[11px] font-bold bg-neutral-800 text-neutral-300 rounded-md border border-neutral-700">🔒 Zero Leak</span>
                <span className="px-2 py-0.5 text-[11px] font-bold bg-teal-500/15 text-teal-300 rounded-md border border-teal-500/30">⚡ HttpOnly Cookies</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Interactive ROI & Time-Savings Calculator */}
      <section id="calculator" className="py-20 bg-[#0a0c13] border-y border-neutral-800/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold rounded-full">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>বিজনেস প্রফিট ও সেভিংস ক্যালকুলেটর</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-neutral-100 tracking-tight">
              OrderFlow BD ব্যবহার করলে আপনার{' '}
              <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                প্রতি মাসে কত টাকা ও সময় বাঁচবে?
              </span>
            </h2>
          </div>

          <div className="bg-[#10131d] border border-neutral-800/90 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8">
            {/* Interactive Slider */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-sm sm:text-base font-bold text-neutral-200">
                  আপনার পেজে প্রতিদিন গড়ে কতটি অর্ডার আসে?
                </label>
                <span className="px-4 py-1.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono font-black text-lg rounded-xl">
                  {dailyOrders} টি / দিন
                </span>
              </div>

              <input
                type="range"
                min="5"
                max="150"
                step="5"
                value={dailyOrders}
                onChange={(e) => setDailyOrders(Number(e.target.value))}
                className="w-full h-3 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
              <div className="flex justify-between text-xs text-neutral-500 font-mono">
                <span>৫ টি</span>
                <span>৫০ টি</span>
                <span>১০০ টি</span>
                <span>১৫০+ টি</span>
              </div>
            </div>

            {/* Calculated Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-neutral-800">
              <div className="p-4 bg-neutral-900/80 border border-neutral-800 rounded-2xl text-center space-y-1">
                <p className="text-xs text-neutral-400 font-medium">প্রতি মাসে সময় বাঁচবে</p>
                <p className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
                  {hoursSavedPerMonth} ঘণ্টা
                </p>
                <p className="text-[11px] text-neutral-500">ম্যানুয়াল চ্যাট ও হিসাবের ঝামেলামুক্ত</p>
              </div>

              <div className="p-4 bg-neutral-900/80 border border-neutral-800 rounded-2xl text-center space-y-1">
                <p className="text-xs text-neutral-400 font-medium">মাসিক সেলস বৃদ্ধি (সম্ভাব্য)</p>
                <p className="text-2xl sm:text-3xl font-black text-teal-400 font-mono">
                  +{potentialExtraSales} টি অর্ডার
                </p>
                <p className="text-[11px] text-neutral-500">দ্রুত ও রাতের বেলার অর্ডারের কারণে</p>
              </div>

              <div className="p-4 bg-neutral-900/80 border border-neutral-800 rounded-2xl text-center space-y-1">
                <p className="text-xs text-neutral-400 font-medium">মাসিক খরচ সাশ্রয়</p>
                <p className="text-2xl sm:text-3xl font-black text-indigo-400 font-mono">
                  ৳{estimatedSavingsBDT.toLocaleString()}
                </p>
                <p className="text-[11px] text-neutral-500">অতিরিক্ত শিফট ও কর্মী খরচ বাঁচবে</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Frequently Asked Questions (FAQ) */}
      <section id="faq" className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold rounded-full">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>সচরাচর জিজ্ঞাসা</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-neutral-100 tracking-tight">
            সাধারণ কিছু প্রশ্নের উত্তর
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((f, idx) => (
            <div
              key={idx}
              className="bg-[#10131d] border border-neutral-800/80 rounded-2xl overflow-hidden transition-all"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-neutral-200 hover:text-emerald-400 transition-colors"
              >
                <span>{f.q}</span>
                <ChevronRight
                  className={`w-5 h-5 text-neutral-400 transition-transform duration-300 shrink-0 ${
                    activeFaq === idx ? 'rotate-90 text-emerald-400' : ''
                  }`}
                />
              </button>
              {activeFaq === idx && (
                <div className="px-5 pb-5 text-xs sm:text-sm text-neutral-400 leading-relaxed border-t border-neutral-800/60 pt-3 animate-in fade-in duration-200">
                  {f.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 7. Call To Action Banner */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-[#121c19] via-[#0f141f] to-[#0a0d14] p-8 sm:p-12 text-center space-y-6 shadow-2xl">
          {/* Ambient light */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-4xl font-black text-neutral-100 tracking-tight">
              আজই আপনার এফ-কমার্স ব্যবসাকে দিন{' '}
              <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                আধুনিক অটোমেশনের শক্তি!
              </span>
            </h2>
            <p className="text-sm sm:text-base text-neutral-300 leading-relaxed">
              OrderFlow BD ড্যাশবোর্ড সরাসরি এক্সপ্লোর করুন এবং আপনার ফেসবুক পেজের সাথে কানেক্ট করুন।
            </p>
          </div>

          <div className="relative z-10 pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-neutral-950 font-black text-base rounded-2xl shadow-xl shadow-emerald-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <span>🚀 ড্যাশবোর্ডে প্রবেশ করুন</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 8. Footer */}
      <footer className="mt-auto border-t border-neutral-800/80 bg-[#07080c] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-neutral-300">OrderFlow BD 2.0</span>
            <span>— Smart F-Commerce AI Platform</span>
          </div>
          <p>© {new Date().getFullYear()} OrderFlow BD. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
