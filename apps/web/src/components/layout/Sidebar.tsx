'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingCart,
  Boxes,
  Bot,
  Zap,
  Sparkles,
  Layers,
  ChevronRight,
  ExternalLink,
  MessageSquare,
  LogOut,
  Crown,
  Briefcase,
  Headphones,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    fetch('/api/auth')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.user) {
          setCurrentUser(data.user);
          if (data.user.role === 'SUPER_ADMIN') {
            fetch('/api/admin/organizations')
              .then((res) => res.json())
              .then((adminData) => {
                if (adminData.success && adminData.stats) {
                  setPendingCount(adminData.stats.pendingApprovals || 0);
                }
              })
              .catch(() => {});
          }
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
      toast.success('সফলভাবে লগআউট হয়েছেন');
      router.push('/login');
      router.refresh();
    } catch {
      router.push('/login');
    }
  };

  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

  const navigation = [
    ...(isSuperAdmin
      ? [
          {
            name: '👑 সুপার অ্যাডমিন',
            sub: 'অনুমোদন ও মাস্টার কন্ট্রোল',
            href: '/admin',
            icon: Crown,
            highlight: true,
            badge: pendingCount > 0 ? `${pendingCount} Pending` : 'Super Admin',
            badgeColor: pendingCount > 0 ? 'bg-amber-500/25 text-amber-300 border-amber-500/40 animate-pulse' : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
            gradient: 'from-indigo-500/20 to-purple-500/10',
          },
        ]
      : []),
    {
      name: 'ড্যাশবোর্ড',
      sub: 'Overview & Metrics',
      href: '/dashboard',
      icon: LayoutDashboard,
      gradient: 'from-emerald-500/20 to-teal-500/10',
    },
    {
      name: 'মেসেঞ্জার লাইভ চ্যাট',
      sub: 'Facebook Live Chat Hub',
      href: '/messages',
      icon: MessageSquare,
      badge: 'CRM Hub',
      badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      gradient: 'from-blue-500/20 to-indigo-500/10',
    },
    {
      name: 'অর্ডার সমূহ',
      sub: '5-Step Pipeline & Sync',
      href: '/orders',
      icon: ShoppingCart,
      badge: 'Orders',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      gradient: 'from-emerald-500/20 to-teal-500/10',
    },
    {
      name: 'প্রোডাক্ট ও স্টক',
      sub: 'Inventory & Variants',
      href: '/products',
      icon: Boxes,
      gradient: 'from-teal-500/20 to-cyan-500/10',
    },

    {
      name: 'এআই সেলস বট সেটিংস',
      sub: 'Google Gemini Studio',
      href: '/bot-settings',
      icon: Bot,
      highlight: true,
      badge: 'Gemini AI',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      gradient: 'from-indigo-500/20 to-purple-500/10',
    },
    {
      name: 'ফেসবুক ইন্টিগ্রেশন',
      sub: 'Page & Messenger Connect',
      href: '/integrations',
      icon: Zap,
      gradient: 'from-blue-500/20 to-cyan-500/10',
    },
  ];

  const getRoleIcon = (role?: string) => {
    if (role === 'SUPER_ADMIN') return Crown;
    if (role === 'ADMIN') return Briefcase;
    return Headphones;
  };

  const RoleIcon = getRoleIcon(currentUser?.role);

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden transition-opacity"
        />
      )}

      <aside
        className={cn(
          'fixed lg:sticky top-0 left-0 z-50 h-screen w-72 bg-[#0d0f17]/95 backdrop-blur-2xl border-r border-neutral-800/80 flex flex-col shrink-0 transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        {/* Brand Logo & Glow */}
        <div className="p-5 border-b border-neutral-800/80 relative overflow-hidden">
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <Link href="/" className="flex items-center gap-3 relative z-10 group" onClick={onClose}>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 flex items-center justify-center text-neutral-950 font-black shadow-lg shadow-emerald-500/25 group-hover:scale-105 transition-transform duration-300">
              <Zap className="w-5 h-5 fill-neutral-950 text-neutral-950" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-extrabold text-lg text-neutral-100 tracking-tight">
                  OrderFlow
                </h1>
                <span className="px-1.5 py-0.5 text-[10px] font-black bg-gradient-to-r from-emerald-400 to-teal-300 text-neutral-950 rounded-md shadow-sm">
                  SaaS 2.0
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 font-medium tracking-wide">
                F-Commerce Automation
              </p>
            </div>
          </Link>
        </div>

        {/* Nav Menu */}
        <nav className="flex-1 p-3.5 space-y-1.5 overflow-y-auto">
          <p className="px-3 text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>মূল মেনু</span>
            <span className="text-[10px] text-emerald-400 font-mono font-medium">LIVE MODE</span>
          </p>

          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'relative flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-medium transition-all group overflow-hidden border',
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500/15 via-emerald-500/10 to-transparent text-emerald-300 border-emerald-500/30 shadow-lg shadow-emerald-500/5'
                    : 'text-neutral-300 hover:text-neutral-100 hover:bg-neutral-800/40 border-transparent',
                  item.highlight && !isActive && 'text-indigo-300 hover:bg-indigo-500/10 border-indigo-500/10',
                )}
              >
                {/* Active Indicator bar */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-7 bg-gradient-to-b from-emerald-400 to-teal-400 rounded-r-full" />
                )}

                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'p-2 rounded-xl border transition-all duration-300 group-hover:scale-110',
                      isActive
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 shadow-sm'
                        : 'bg-neutral-850/60 text-neutral-400 border-neutral-750/50 group-hover:text-neutral-200 group-hover:border-neutral-600',
                      item.highlight && !isActive && 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
                    )}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold block text-sm leading-snug">{item.name}</span>
                    <span className="text-[10px] text-neutral-400 block font-normal leading-tight">
                      {item.sub}
                    </span>
                  </div>
                </div>

                {item.badge && (
                  <span
                    className={cn(
                      'px-2 py-0.5 text-[10px] font-bold rounded-full border shadow-sm',
                      item.badgeColor || 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Profile & Logout Section */}
        <div className="p-3 m-3 bg-[#0a0d16] border border-neutral-800/90 rounded-2xl relative overflow-hidden shadow-lg space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-sm shrink-0">
                {currentUser?.avatar || currentUser?.name?.slice(0, 2).toUpperCase() || 'OF'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate leading-tight">
                  {currentUser?.name || 'Alvin Monir'}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <RoleIcon className="w-2.5 h-2.5 text-emerald-400" />
                  <span className="text-[10px] text-slate-400 font-mono capitalize">
                    {currentUser?.role || 'Admin'}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="লগআউট করুন"
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
