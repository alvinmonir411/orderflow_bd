'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Zap,
  Mail,
  Lock,
  User,
  Building,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Crown,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<'STARTER' | 'BUSINESS' | 'PRO'>('PRO');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !businessName) {
      toast.error('অনুগ্রহ করে সকল প্রয়োজনীয় তথ্য পূরণ করুন');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register',
          name,
          organizationName: businessName,
          email,
          password,
          plan: selectedPlan,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success('অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে! ড্যাশবোর্ডে রিডাইরেক্ট হচ্ছে...');
        router.push('/dashboard');
        router.refresh();
      } else {
        toast.error(data.error || 'রেজিস্ট্রেশন ব্যর্থ হয়েছে');
      }
    } catch (err) {
      toast.error('সার্ভারে যোগাযোগ করতে সমস্যা হয়েছে');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#06080e] text-white flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      {/* Ambient Lighting Orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-emerald-500/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-indigo-500/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-teal-900/10 via-transparent to-transparent pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-lg relative z-10 space-y-6">
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
              <p className="text-xs text-slate-400 font-medium">Enterprise Organization Onboarding</p>
            </div>
          </Link>
        </div>

        {/* Register Card */}
        <div className="bg-[#0b0f19]/95 border border-slate-800/90 rounded-[2rem] p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.8)] backdrop-blur-2xl space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-black text-white">নতুন ব্যবসা / স্টোর রেজিস্টার করুন</h2>
            <p className="text-xs text-slate-400">
              আপনার ফেসবুক পেজ ও মেসেঞ্জার চ্যাট সেন্ট্রালাইজ করতে অ্যাকাউন্ট খুলুন
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            {/* Business / Org Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                ব্যবসা বা ফেসবুক পেজের নাম
              </label>
              <div className="relative">
                <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="যেমন: Moner Kotha Fashion"
                  required
                  className="w-full bg-slate-900/90 border border-slate-750 focus:border-emerald-500 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none transition-all shadow-inner"
                />
              </div>
            </div>

            {/* Owner Full Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                আপনার পূর্ণ নাম (Owner Name)
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="আপনার নাম"
                  required
                  className="w-full bg-slate-900/90 border border-slate-750 focus:border-emerald-500 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none transition-all shadow-inner"
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                অফিসিয়াল ইমেইল
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@business.com"
                  required
                  className="w-full bg-slate-900/90 border border-slate-750 focus:border-emerald-500 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none transition-all shadow-inner"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                পাসওয়ার্ড
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-slate-900/90 border border-slate-750 focus:border-emerald-500 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none transition-all shadow-inner"
                />
              </div>
            </div>

            {/* Plan Choice Selector */}
            <div className="space-y-2 pt-1">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                প্যাকেজ নির্বাচন করুন:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'STARTER', name: 'Starter', price: '৳৯৯৯/মাস', limit: '১,০০০ চ্যাট' },
                  { id: 'BUSINESS', name: 'Business', price: '৳২,৪৯০/মাস', limit: '১০,০০০ চ্যাট' },
                  { id: 'PRO', name: 'Pro VIP', price: '৳৪,৯৯০/মাস', limit: '৫০,০০০ চ্যাট' },
                ].map((p) => {
                  const isSelected = selectedPlan === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedPlan(p.id as any)}
                      className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-md'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">{p.name}</span>
                        {isSelected && <Check className="w-3 h-3 text-emerald-400" />}
                      </div>
                      <p className="text-[11px] font-mono text-emerald-300 mt-0.5">{p.price}</p>
                      <p className="text-[9px] text-slate-500">{p.limit}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-6 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-2xl text-sm transition-all shadow-[0_10px_25px_rgba(16,185,129,0.3)] active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              <span>{isLoading ? 'তৈরি হচ্ছে...' : 'ফ্রি অ্যাকাউন্ট খুলুন'}</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>

          {/* Footer Login Link */}
          <div className="pt-4 border-t border-slate-800/80 text-center text-xs text-slate-400">
            ইতোমধ্যে অ্যাকাউন্ট আছে?{' '}
            <Link href="/login" className="text-emerald-400 hover:underline font-bold">
              লগইন করুন
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
