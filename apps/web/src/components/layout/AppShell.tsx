'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { ShieldCheck, Lock, KeyRound, ArrowLeft, Zap, Sparkles, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [passcode, setPasscode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const isPublicLanding = pathname === '/';

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const auth = localStorage.getItem('orderflow_admin_auth');
      setIsAuthenticated(auth === 'true');
    }
  }, [pathname]);

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (passcode === '1234' || passcode.toLowerCase() === 'admin' || passcode === 'admin123' || passcode === '') {
      if (typeof window !== 'undefined') {
        localStorage.setItem('orderflow_admin_auth', 'true');
        setIsAuthenticated(true);
        setErrorMsg('');
        toast.success('অ্যাডমিন ড্যাশবোর্ডে স্বাগতম!');
      }
    } else {
      setErrorMsg('ভুল পাসকোড! অনুগ্রহ করে আবার চেষ্টা করুন (ডিফল্ট: 1234 বা ডেমো ক্লিক করুন)');
      toast.error('ভুল পাসকোড!');
    }
  };

  const handleDemoLogin = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('orderflow_admin_auth', 'true');
      setIsAuthenticated(true);
      setErrorMsg('');
      toast.success('ডেমো মোডে অ্যাডমিন ড্যাশবোর্ড ওপেন হয়েছে!');
    }
  };

  // If on public landing page, render cleanly without dashboard frame
  if (isPublicLanding) {
    return <div className="min-h-screen bg-[#07080c] text-neutral-100 antialiased selection:bg-emerald-500/30 selection:text-emerald-200">{children}</div>;
  }

  // Loading state while checking auth
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#090a0f] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  // If not authenticated for admin routes, show Secure Auth Gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#090a0f] bg-grid-pattern flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Glow lights */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md bg-[#10131d]/95 backdrop-blur-2xl border border-neutral-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 space-y-6">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-neutral-950">
              <Lock className="w-8 h-8 stroke-[2.5]" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold rounded-full mb-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>সিকিউর অ্যাডমিন পোর্টাল</span>
              </div>
              <h2 className="text-2xl font-black text-neutral-100 tracking-tight">
                OrderFlow BD
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                ড্যাশবোর্ডে প্রবেশের জন্য সিকিউরিটি পাসকোড লিখুন
              </p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-300 block">
                অ্যাডমিন পিন / পাসওয়ার্ড
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => {
                    setPasscode(e.target.value);
                    setErrorMsg('');
                  }}
                  placeholder="পিন লিখুন (যেমন: 1234)"
                  className="w-full pl-10 pr-4 py-3 bg-neutral-900/90 border border-neutral-750 focus:border-emerald-500 rounded-2xl text-neutral-100 placeholder-neutral-500 text-sm outline-none transition-all font-mono"
                  autoFocus
                />
              </div>
              {errorMsg && (
                <p className="text-xs text-red-400 font-medium mt-1">{errorMsg}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-neutral-950 font-black text-sm rounded-2xl shadow-lg shadow-emerald-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>ড্যাশবোর্ডে প্রবেশ করুন</span>
            </button>
          </form>

          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-neutral-800 w-full" />
            <span className="bg-[#10131d] px-3 text-[11px] text-neutral-500 font-bold uppercase tracking-wider absolute">
              অথবা ডেমো দেখুন
            </span>
          </div>

          <button
            onClick={handleDemoLogin}
            type="button"
            className="w-full py-2.5 bg-neutral-850 hover:bg-neutral-800 text-neutral-200 hover:text-white border border-neutral-700/80 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>১-ক্লিকে ফ্রি ডেমো মোডে প্রবেশ করুন</span>
          </button>

          <div className="pt-2 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-emerald-400 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>মূল ল্যান্ডিং পেজে ফিরে যান</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#090a0f] text-neutral-100 antialiased bg-grid-pattern selection:bg-emerald-500/30 selection:text-emerald-200">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Navbar onMenuToggle={() => setIsSidebarOpen((prev) => !prev)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full animate-in fade-in duration-300">
          {children}
        </main>
      </div>
    </div>
  );
};
