'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Zap,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Users,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Crown,
  Briefcase,
  Headphones,
} from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [demoUsers, setDemoUsers] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/auth?action=demo')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.demoUsers) {
          setDemoUsers(data.demoUsers);
        }
      })
      .catch(() => {});
  }, []);

  const handleLogin = async (e?: React.FormEvent, customEmail?: string, customPassword?: string) => {
    if (e) e.preventDefault();
    const loginEmail = customEmail || email;
    const loginPass = customPassword || password;

    if (!loginEmail || !loginPass) {
      toast.error('ইমেইল ও পাসওয়ার্ড পূরণ করুন');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          email: loginEmail,
          password: loginPass,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`স্বাগতম ${data.user?.name || ''}! লগইন সফল হয়েছে।`);
        router.push('/dashboard');
        router.refresh();
      } else {
        toast.error(data.error || 'লগইন ব্যর্থ হয়েছে। সঠিক তথ্য দিন।');
      }
    } catch (err) {
      toast.error('সার্ভারে যোগাযোগ করতে সমস্যা হয়েছে');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = (demo: any) => {
    setEmail(demo.email);
    setPassword(demo.password);
    handleLogin(undefined, demo.email, demo.password);
  };

  return (
    <div className="min-h-screen bg-[#06080e] text-white flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      {/* Ambient Lighting Orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-emerald-500/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-indigo-500/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-teal-900/10 via-transparent to-transparent pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md relative z-10 space-y-6">
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
        <div className="bg-[#0b0f19]/90 border border-emerald-500/30 rounded-3xl p-4.5 shadow-2xl backdrop-blur-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>১-ক্লিক ডেমো লগইন (Quick Demo Access):</span>
            </span>
            <span className="text-[10px] bg-emerald-500/15 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 font-mono">
              Ready
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo({ email: 'superadmin@orderflow.com', password: 'admin123' })}
              className="p-2.5 bg-gradient-to-b from-indigo-950/80 to-slate-900 border border-indigo-500/40 hover:border-indigo-400 rounded-2xl text-left transition-all hover:scale-[1.02] shadow-sm cursor-pointer group"
            >
              <div className="flex items-center gap-1.5 text-indigo-300 text-xs font-bold">
                <Crown className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>Super Admin</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1 truncate">Platform Owner</p>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo({ email: 'owner@orderflow.com', password: 'admin123' })}
              className="p-2.5 bg-gradient-to-b from-emerald-950/80 to-slate-900 border border-emerald-500/40 hover:border-emerald-400 rounded-2xl text-left transition-all hover:scale-[1.02] shadow-sm cursor-pointer group"
            >
              <div className="flex items-center gap-1.5 text-emerald-300 text-xs font-bold">
                <Briefcase className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Store Owner</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1 truncate">Merchant Admin</p>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo({ email: 'agent@orderflow.com', password: 'agent123' })}
              className="p-2.5 bg-gradient-to-b from-blue-950/80 to-slate-900 border border-blue-500/40 hover:border-blue-400 rounded-2xl text-left transition-all hover:scale-[1.02] shadow-sm cursor-pointer group"
            >
              <div className="flex items-center gap-1.5 text-blue-300 text-xs font-bold">
                <Headphones className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>Support Agent</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1 truncate">Live Chat Staff</p>
            </button>
          </div>
        </div>

        {/* Login Form Card */}
        <div className="bg-[#0b0f19]/95 border border-slate-800/90 rounded-[2rem] p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.8)] backdrop-blur-2xl space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-black text-white">অ্যাকাউন্টে লগইন করুন</h2>
            <p className="text-xs text-slate-400">
              আপনার ইমেইল ও পাসওয়ার্ড প্রদান করে ড্যাশবোর্ডে প্রবেশ করুন
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                ইমেইল এড্রেস
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
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
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  পাসওয়ার্ড
                </label>
                <span className="text-[11px] text-emerald-400 hover:underline cursor-pointer">
                  পাসওয়ার্ড ভুলে গেছেন?
                </span>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
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
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
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
              ফ্রি রেজিস্টার করুন
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
