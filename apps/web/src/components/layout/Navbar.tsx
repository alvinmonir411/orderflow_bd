'use client';

import React from 'react';
import Link from 'next/link';
import { Store, Sparkles, Menu, Globe, Lock, LogOut } from 'lucide-react';
import { toast } from 'sonner';

interface NavbarProps {
  onMenuToggle?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuToggle }) => {
  const handleLockDashboard = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('orderflow_admin_auth');
      toast.info('ড্যাশবোর্ড লক করা হয়েছে');
      window.location.href = '/';
    }
  };

  return (
    <header className="h-16 border-b border-neutral-800/80 bg-[#090a0f]/80 backdrop-blur-xl px-4 md:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Mobile Toggle & Store Badge */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="p-2 lg:hidden bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-300 hover:text-neutral-100 transition-all"
          aria-label="Toggle Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 bg-gradient-to-r from-neutral-900 to-neutral-900/60 border border-neutral-800/80 px-3.5 py-1.5 rounded-xl shadow-sm">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-sm shadow-emerald-500/50" />
          <Store className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold text-neutral-100 tracking-tight">
            FastLain
          </span>
          <span className="text-[10px] px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md font-mono hidden sm:inline-block">
            LIVE STORE
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        <Link
          href="/"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-emerald-300 border border-neutral-800 rounded-xl text-xs font-semibold transition-all shadow-sm"
          title="পাবলিক ল্যান্ডিং পেজ দেখুন"
        >
          <Globe className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">ল্যান্ডিং পেজ</span>
        </Link>

        <div className="hidden md:flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl text-xs text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-semibold font-mono">24/7 AI Sales Active</span>
        </div>

        {/* User Profile & Lock */}
        <div className="flex items-center gap-2 sm:gap-2.5 pl-2 sm:pl-3 border-l border-neutral-800/80">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-neutral-950 font-extrabold text-xs flex items-center justify-center shadow-md shadow-emerald-500/20">
            AM
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-neutral-200 leading-tight">Alvin Monir</p>
            <p className="text-[10px] text-neutral-400 font-medium">Merchant Admin</p>
          </div>

          <button
            onClick={handleLockDashboard}
            className="p-2 bg-neutral-900 hover:bg-red-500/20 text-neutral-400 hover:text-red-400 border border-neutral-800 rounded-xl transition-all ml-1"
            title="ড্যাশবোর্ড লক করুন"
          >
            <Lock className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
