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
  Crown,
  Briefcase,
  Headphones,
  Clock,
  MessageCircle,
  MousePointerClick,
} from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [demoLoadingEmail, setDemoLoadingEmail] = useState<string | null>(null);
  const [pendingError, setPendingError] = useState<string | null>(null);

  const handleLogin = async (e?: React.FormEvent, customEmail?: string, isDemo = false) => {
    if (e) e.preventDefault();
    const loginEmail = customEmail || email;

    if (!loginEmail) {
      toast.error('ইমেইল পূরণ করুন');
      return;
    }
    if (!isDemo && !password) {
      toast.error('পাসওয়ার্ড পূরণ করুন');
      return;
    }

    if (isDemo) {
      setDemoLoadingEmail(loginEmail);
    } else {
      setIsLoading(true);
    }
    setPendingError(null);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          email: loginEmail,
          // Demo accounts: send empty password; backend ignores it
          password: isDemo ? '' : password,
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
          toast.error(data.error || 'লগইন ব্যর্থ হয়েছে। সঠিক তথ্য দিন।');
        }
      }
    } catch (err) {
      toast.error('সার্ভারে যোগাযোগ করতে সমস্যা হয়েছে');
    } finally {
      setIsLoading(false);
      setDemoLoadingEmail(null);
    }
  };

  const getWhatsAppHelpLink = () => {
    const text = encodeURIComponent(
      `আসসালামু আলাইকুম Super Admin,\nআমি OrderFlow BD তে লগইন করার চেষ্টা করছি (${email}), কিন্তু অ্যাকাউন্টটি এখনো অনুমোদনের অপেক্ষায় রয়েছে। অনুগ্রহ করে অ্যাকাউন্টটি সক্রিয় (Approve) করে দিন।`,
    );
    return `https://wa.me/8801700000000?text=${text}`;
  };

  const demoCards = [
    {
      email: 'superadmin@orderflow.com',
      label: 'Super Admin',
      role: 'SUPER_ADMIN',
      desc: 'Platform Owner',
      icon: Crown,
      gradient: 'from-indigo-950/80 to-slate-900',
      border: 'border-indigo-500/40 hover:border-indigo-400',
      iconColor: 'text-indigo-400',
      textColor: 'text-indigo-300',
      emoji: '\u{1F451}',
    },
    {
      email: 'owner@orderflow.com',
      label: 'Store Owner',
      role: 'ADMIN',
      desc: 'Merchant Admin',
      icon: Briefcase,
      gradient: 'from-emerald-950/80 to-slate-900',
      border: 'border-emerald-500/40 hover:border-emerald-400',
      iconColor: 'text-emerald-400',
      textColor: 'text-emerald-300',
      emoji: '\u{1F4BC}',
    },
    {
      email: 'agent@orderflow.com',
      label: 'Support Agent',
      role: 'USER',
      desc: 'Live Chat Staff',
      icon: Headphones,
      gradient: 'from-blue-950/80 to-slate-900',
      border: 'border-blue-500/40 hover:border-blue-400',
      iconColor: 'text-blue-400',
      textColor: 'text-blue-300',
      emoji: '\u{1F4AC}',
    },
  ];

  return (
    <div className="min-h-screen bg-[#06080e] text-white flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      {/* Ambient Lighting Orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-emerald-500/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-indigo-500/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-teal-900/10 via-transparent to-transparent pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md relative z-10 space-y-5">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 flex items-center justify-center text-neutral-950 font-black shadow-lg shadow-emerald-500/25 group-hover:scale-105 transition-transform duration-300">
              <Zap className="w-6 h-6 fill-neutral-950 text-neutral-950" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <h1 className="font-black text-2xl text-white tracking-tight">OrderFlow</h1>
                <span className="px-1.5 py-0.5 text-[10px] font-black bg-gradient-to-r from-emerald-400 to-teal-300 text-neutral-950 rounded-md">
                  SaaS 2.0
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Enterprise Centralized Inbox</p>
            </div>
          </Link>
        </div>

        {/* 1-Click Demo Quick Access Panel */}
        <div className="bg-[#0b0f19]/90 border border-emerald-500/30 rounded-3xl p-4 shadow-2xl backdrop-blur-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>১-ক্লিক ডেমো লগইন — কোনো পাসওয়ার্ড লাগবে না:</span>
            </span>
            <span className="text-[10px] bg-emerald-500/15 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 font-mono">
              Demo
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {demoCards.map((card) => {
              const Icon = card.icon;
              const isThisLoading = demoLoadingEmail === card.email;
              return (
                <button
                  key={card.email}
                  type="button"
                  id={`demo-${card.role.toLowerCase()}`}
                  onClick={() => handleLogin(undefined, card.email, true)}
                  disabled={!!demoLoadingEmail || isLoading}
                  className={`p-3 bg-gradient-to-b ${card.gradient} border ${card.border} rounded-2xl text-left transition-all hover:scale-[1.03] shadow-sm cursor-pointer group disabled:opacity-60 disabled:cursor-not-allowed relative overflow-hidden`}
                >
                  <div className={`flex items-center gap-1.5 ${card.textColor} text-xs font-bold`}>
                    <Icon className={`w-3.5 h-3.5 ${card.iconColor} shrink-0`} />
                    <span>{card.label}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 truncate">{card.desc}</p>
                  <div className={`absolute bottom-2 right-2 transition-all ${isThisLoading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    {isThisLoading ? (
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
                    ) : (
                      <MousePointerClick className="w-3 h-3 text-slate-500" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <p className="text-[10px] text-slate-500 text-center">
            ✨ Demo অ্যাকাউন্টে পাসওয়ার্ড ছাড়াই এক ক্লিকে প্রবেশ করুন
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
                  পেমেন্ট সম্পন্ন করার পর সুপার অ্যাডমিন আপনার শপটি চালু করে দেবেন। দ্রুত অনুমোদনের জন্য সরাসরি হোয়াটসঅ্যাপ করুন:
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
              <span>সুপার অ্যাডমিনকে মেসেজ পাঠান (WhatsApp)</span>
            </a>
          </div>
        )}

        {/* Login Form Card (Real Accounts) */}
        <div className="bg-[#0b0f19]/95 border border-slate-800/90 rounded-[2rem] p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.8)] backdrop-blur-2xl space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-black text-white">রিয়েল অ্যাকাউন্টে লগইন করুন</h2>
            <p className="text-xs text-slate-400">
              নতুন মার্চেন্ট অ্যাকাউন্টে ইমেইল ও পাসওয়ার্ড দিয়ে প্রবেশ করুন
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
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
                <span className="text-[11px] text-emerald-400 hover:underline cursor-pointer">
                  পাসওয়ার্ড ভুলে গেছেন?
                </span>
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
              disabled={isLoading || !!demoLoadingEmail}
              className="w-full py-3.5 px-6 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-2xl text-sm transition-all shadow-[0_10px_25px_rgba(16,185,129,0.3)] active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{isLoading ? 'লগইন হচ্ছে...' : 'লগইন করুন'}</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>

          {/* Footer Register Link */}
          <div className="pt-4 border-t border-slate-800/80 text-center text-xs text-slate-400">
            নতুন ব্যবসা শুরু করছেন?{' '}
            <Link href="/register" className="text-emerald-400 hover:underline font-bold">
              রেজিস্টার করুন
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
