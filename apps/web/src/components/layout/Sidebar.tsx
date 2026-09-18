'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingCart,
  Boxes,
  Bot,
  Truck,
  Zap,
  Sparkles,
  Layers,
  ChevronRight,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();

  const navigation = [
    {
      name: 'ড্যাশবোর্ড',
      sub: 'Overview & Metrics',
      href: '/dashboard',
      icon: LayoutDashboard,
      gradient: 'from-emerald-500/20 to-teal-500/10',
    },
    {
      name: 'মেসেঞ্জার লাইভ চ্যাট',
      sub: 'Facebook Live Chat',
      href: '/messages',
      icon: MessageSquare,
      badge: 'Live',
      badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      gradient: 'from-blue-500/20 to-indigo-500/10',
    },
    {
      name: 'অর্ডার সমূহ',
      sub: 'Live Orders & Sync',
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
                  BD 2.0
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 font-medium tracking-wide">
                F-Commerce Automation
              </p>
            </div>
          </Link>
        </div>

        {/* Nav Menu */}
        <nav className="flex-1 p-3.5 space-y-2 overflow-y-auto">
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
                  'relative flex items-center justify-between px-3.5 py-3 rounded-2xl text-sm font-medium transition-all group overflow-hidden border',
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

        {/* Store Quick Status Footer */}
        <div className="p-3.5 m-3.5 bg-gradient-to-br from-neutral-900/90 via-neutral-900/60 to-emerald-950/20 border border-neutral-800/90 rounded-2xl relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold text-neutral-200">ফেসবুক বট সক্রিয়</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-md">
              Moner Kotha
            </span>
          </div>
          <p className="text-[11px] text-neutral-400 mt-1.5 leading-relaxed">
            মেসেঞ্জারে কাস্টমারের তথ্য আসা মাত্র লাইভ ড্যাশবোর্ডে যোগ হবে।
          </p>
        </div>
      </aside>
    </>
  );
};
