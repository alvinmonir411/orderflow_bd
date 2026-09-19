'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Store, Sparkles, Menu, Globe, Lock, LogOut, Users, Crown, Briefcase, Headphones } from 'lucide-react';
import { toast } from 'sonner';

interface NavbarProps {
  onMenuToggle?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuToggle }) => {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    fetch('/api/auth')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.user) {
          setCurrentUser(data.user);
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'logout' }),
      });
      toast.success('লগআউট সফল হয়েছে');
      router.push('/login');
      router.refresh();
    } catch {
      router.push('/login');
    }
  };

  const getRoleBadge = (role?: string) => {
    if (role === 'SUPER_ADMIN') return { bg: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30', label: 'Super Admin', icon: Crown };
    if (role === 'ADMIN') return { bg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30', label: 'Store Owner', icon: Briefcase };
    return { bg: 'bg-blue-500/15 text-blue-300 border-blue-500/30', label: 'Support Agent', icon: Headphones };
  };

  const roleInfo = getRoleBadge(currentUser?.role);
  const RoleIcon = roleInfo.icon;

  return (
    <header className="h-16 border-b border-neutral-800/80 bg-[#090a0f]/80 backdrop-blur-xl px-4 md:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Mobile Toggle & Store Badge */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="p-2 lg:hidden bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-300 hover:text-neutral-100 transition-all cursor-pointer"
          aria-label="Toggle Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 bg-gradient-to-r from-neutral-900 to-neutral-900/60 border border-neutral-800/80 px-3.5 py-1.5 rounded-xl shadow-sm">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-sm shadow-emerald-500/50" />
          <Store className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold text-neutral-100 tracking-tight">
            {currentUser?.organizationName || 'OrderFlow BD'}
          </span>
          <span className="text-[10px] px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md font-mono hidden sm:inline-block">
            SaaS Pro
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {currentUser?.role === 'SUPER_ADMIN' && (
          <Link
            href="/admin"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-950/80 hover:bg-indigo-900/90 text-indigo-300 border border-indigo-500/40 rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-500/10"
            title="সুপার অ্যাডমিন প্ল্যাটফর্ম কন্ট্রোল"
          >
            <Crown className="w-3.5 h-3.5 text-indigo-400" />
            <span>Master Admin</span>
          </Link>
        )}

        <Link
          href="/team"
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-purple-300 border border-neutral-800 rounded-xl text-xs font-semibold transition-all shadow-sm"
          title="টিম মেম্বার পরিচালনা করুন"
        >
          <Users className="w-3.5 h-3.5 text-purple-400" />
          <span>টিম</span>
        </Link>

        <Link
          href="/"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-emerald-300 border border-neutral-800 rounded-xl text-xs font-semibold transition-all shadow-sm"
          title="পাবলিক ল্যান্ডিং পেজ দেখুন"
        >
          <Globe className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">ল্যান্ডিং পেজ</span>
        </Link>

        {/* User Profile & Lock/Logout */}
        <div className="flex items-center gap-2 sm:gap-2.5 pl-2 sm:pl-3 border-l border-neutral-800/80">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-indigo-500 text-neutral-950 font-black text-xs flex items-center justify-center shadow-md shadow-emerald-500/20">
            {currentUser?.avatar || currentUser?.name?.slice(0, 2).toUpperCase() || 'AM'}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-neutral-200 leading-tight">
              {currentUser?.name || 'Alvin Monir'}
            </p>
            <div className="flex items-center gap-1 mt-0.5">
              <RoleIcon className="w-2.5 h-2.5 text-emerald-400" />
              <span className="text-[10px] text-neutral-400 font-medium capitalize">
                {roleInfo.label}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 bg-neutral-900 hover:bg-red-500/20 text-neutral-400 hover:text-red-400 border border-neutral-800 rounded-xl transition-all ml-1 cursor-pointer"
            title="লগআউট করুন"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
