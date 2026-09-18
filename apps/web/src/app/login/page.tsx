'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Zap,
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  Eye,
  EyeOff,
  Clock,
  MessageCircle,
  BarChart3,
  Bot,
  Truck,
  Printer,
  ShieldCheck,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingError, setPendingError] = useState<string | null>(null);

  const handleRealLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error('ইমেইল পূরণ করুন');
      return;
    }
    if (!password) {
      toast.error('পাসওয়ার্ড পূরণ করুন');
      return;
    }

    setIsLoading(true);
    setPendingError(null);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          email: email.trim(),
          password,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`স্বাগতম ${data.user?.name || ''}! লগইন সফল হয়েছে।`);
        if (data.user?.role === 'SUPER_ADMIN') {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
        router.refresh();
      } else {
        if (data.isPending) {
          setPendingError(data.error || 'আপনার অ্যাকাউন্টটি অনুমোদনের অপেক্ষায় রয়েছে');
        } else {
          toast.error(data.error || 'ভুল ইমেইল অথবা পাসওয়ার্ড। সঠিক তথ্য দিন।');
        }
      }
    } catch (err) {
      toast.error('সার্ভারে যোগাযোগ করতে সমস্যা হয়েছে');
    } finally {
      setIsLoading(false);
    }
  };

  const getWhatsAppHelpLink = () => {
    const text = encodeURIComponent(
      `আসসালামু আলাইকুম Super Admin,\nআমি OrderFlow BD তে লগইন করার চেষ্টা করছি (${email}), কিন্তু অ্যাকাউন্টটি এখনো অনুমোদনের অপেক্ষায় রয়েছে। অনুগ্রহ করে অ্যাকাউন্টটি সক্রিয় (Approve) করে দিন।`,
    );
    return `https://wa.me/8801700000000?text=${text}`;
  };

  return (
    <div className="min-h-screen bg-[#06080e] text-white flex flex-col justify-center items-center p-4 sm:p-6 lg:p-10 relative overflow-hidden">
      {/* Ambient Lighting Orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-emerald-500/15 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-indigo-500/15 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-teal-900/10 via-transparent to-transparent pointer-events-none" />

      <div className="w-full max-w-5xl relative z-10 space-y-8">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 flex items-center justify-center text-neutral-950 font-black shadow-lg shadow-emerald-500/25 group-hover:scale-105 transition-transform duration-300">
              <Zap className="w-6 h-6 fill-neutral-950 text-neutral-950" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <h1 className="font-black text-2xl sm:text-3xl text-white tracking-tight">OrderFlow BD</h1>
                <span className="px-2 py-0.5 text-[11px] font-black bg-gradient-to-r from-emerald-400 to-teal-300 text-neutral-950 rounded-md">
                  SaaS 2.0
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 font-medium">
                AI F-Commerce Order Automation & Multi-Tenant Platform
              </p>
            </div>
          </Link>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
            নিচের যেকোনো একটি অপশন বেছে নিন — পাসওয়ার্ড ছাড়া সরাসরি ডেমো দেখুন অথবা রিয়েল অ্যাকাউন্টে লগইন করুন:
          </p>
        </div>

        {/* 2 Clear Options: Option 1 (Demo) & Option 2 (Real Login) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
          
          {/* OPTION 1: 1-Click Interactive Demo (No Password Required) */}
          <div className="bg-gradient-to-b from-emerald-950/40 via-[#0b0f19]/90 to-[#0b0f19]/95 border-2 border-emerald-500/40 hover:border-emerald-400/70 rounded-[2rem] p-6 sm:p-8 shadow-[0_20px_50px_rgba(16,185,129,0.15)] backdrop-blur-2xl flex flex-col justify-between transition-all duration-300 relative group overflow-hidden">
            {/* Subtle glow banner */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="space-y-6">
              {/* Badge & Title */}
              <div className="space-y-2.5">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold rounded-full shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  <span>অপশন ১ • ইনস্ট্যান্ট এক্সেস (পাসওয়ার্ড লাগবে না)</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
                  <span>লাইভ ডেমো ড্যাশবোর্ড</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  কোনো ইমেইল বা পাসওয়ার্ড ছাড়াই অর্ডারফ্লো-এর সম্পূর্ণ ফিচার, লাইভ সেলস গ্রাফ এবং AI বট অভিজ্ঞতা নিন।
                </p>
              </div>

              {/* Demo Feature Highlights */}
              <div className="space-y-3 bg-[#06080e]/60 border border-emerald-500/20 rounded-2xl p-4 sm:p-5 text-xs text-slate-300">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-400 shrink-0">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white">রিয়েলিস্টিক অ্যানালিটিক্স গ্রাফ:</span> ৭ দিনের সেলস ট্রেন্ড ও রেভিনিউ মেট্রিক্স
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-teal-500/15 flex items-center justify-center text-teal-400 shrink-0">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white">অটো কুরিয়ার ট্র্যাকিং:</span> Steadfast ও Pathao লাইভ পার্সেল স্ট্যাটাস
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/15 flex items-center justify-center text-indigo-400 shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white">Gemini AI বট সিমুলেটর:</span> বাংলায় চ্যাট করে অটো অর্ডার কনফার্মেশন টেস্ট
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-400 shrink-0">
                    <Printer className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white">প্রিন্ট চালান ও মেমো:</span> ১-ক্লিকে প্রফেশনাল ক্যাশমেমো প্রিভিউ
                  </div>
                </div>
              </div>
            </div>

            {/* Demo CTA Button */}
            <div className="pt-6 space-y-2.5">
              <Link
                href="/demo/dashboard"
                id="enter-demo-btn"
                className="w-full py-4 px-6 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black rounded-2xl text-base transition-all shadow-[0_10px_30px_rgba(16,185,129,0.35)] active:scale-98 flex items-center justify-center gap-2.5 cursor-pointer group"
              >
                <span>🚀 ডেমো ড্যাশবোর্ডে প্রবেশ করুন</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <p className="text-[11px] text-center text-emerald-400/80 font-medium">
                ✨ সম্পূর্ণ ফ্রি ও স্ট্যাটিক • কোনো সাইনআপ দরকার নেই
              </p>
            </div>
          </div>

          {/* OPTION 2: Real Merchant & Admin Login (Email & Password) */}
          <div className="bg-[#0b0f19]/95 border border-slate-800/90 rounded-[2rem] p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.8)] backdrop-blur-2xl flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Badge & Title */}
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-800/80 text-slate-300 border border-slate-700 text-xs font-bold rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                  <span>অপশন ২ • রিয়েল প্রডাকশন একাউন্ট</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white">মার্চেন্ট লগইন</h2>
                <p className="text-xs sm:text-sm text-slate-400">
                  আপনার নিবন্ধিত ইমেইল ও পাসওয়ার্ড দিয়ে লাইভ ড্যাশবোর্ডে প্রবেশ করুন
                </p>
              </div>

              {/* Pending Approval Alert Box */}
              {pendingError && (
                <div className="bg-amber-950/40 border border-amber-500/40 rounded-2xl p-4 space-y-2.5 text-amber-200 text-xs animate-in fade-in duration-200">
                  <div className="flex items-start gap-2.5">
                    <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-white text-xs">{pendingError}</p>
                      <p className="text-[11px] text-amber-300/80 mt-0.5">
                        পেমেন্ট সম্পন্ন করার পর সুপার অ্যাডমিন আপনার শপটি চালু করে দেবেন। অনুমোদনের জন্য সরাসরি হোয়াটসঅ্যাপ করুন:
                      </p>
                    </div>
                  </div>
                  <a
                    href={getWhatsAppHelpLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-xl text-[11px] transition-all"
                  >
                    <MessageCircle className="w-3.5 h-3.5 fill-slate-950" />
                    <span>সুপার অ্যাডমিনকে মেসেজ দিন (WhatsApp)</span>
                  </a>
                </div>
              )}

              {/* Real Login Form */}
              <form onSubmit={handleRealLogin} className="space-y-4 pt-1">
                {/* Email Field */}
                <div className="space-y-1.5">
                  <label htmlFor="login-email" className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                    ইমেইল এড্রেস
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      id="login-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@business.com"
                      required
                      className="w-full bg-slate-900/90 border border-slate-750 focus:border-emerald-500 rounded-2xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none transition-all shadow-inner"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="login-password" className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                      পাসওয়ার্ড
                    </label>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full bg-slate-900/90 border border-slate-750 focus:border-emerald-500 rounded-2xl pl-10 pr-10 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none transition-all shadow-inner"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  id="login-submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-6 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl text-sm transition-all border border-slate-700 hover:border-slate-600 active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <span>{isLoading ? 'যাচাই করা হচ্ছে...' : 'লাইভ অ্যাকাউন্টে লগইন করুন'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Register Link */}
            <div className="pt-4 border-t border-slate-800/80 text-center text-xs text-slate-400">
              এখনো অ্যাকাউন্ট নেই?{' '}
              <Link href="/register" className="text-emerald-400 hover:underline font-bold">
                নতুন মার্চেন্ট রেজিস্ট্রেশন করুন
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
