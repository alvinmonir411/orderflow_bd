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
  Settings,
  Flame,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  const navigation = [
    {
      name: 'ড্যাশবোর্ড (Overview)',
      href: '/',
      icon: LayoutDashboard,
    },
    {
      name: 'অর্ডার সমূহ (Orders)',
      href: '/orders',
      icon: ShoppingCart,
      badge: 'Live',
    },
    {
      name: 'প্রোডাক্ট ও স্টক (Stock)',
      href: '/products',
      icon: Boxes,
    },
    {
      name: 'মেসেঞ্জার ও চ্যাটবট',
      href: '/bot-settings',
      icon: Bot,
      highlight: true,
    },
    {
      name: 'কুরিয়ার ও এসএমএস',
      href: '/integrations',
      icon: Truck,
    },
  ];

  return (
    <aside className="w-64 bg-neutral-950 border-r border-neutral-850 flex flex-col shrink-0 min-h-screen">
      {/* Brand Logo */}
      <div className="p-5 border-b border-neutral-850">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-neutral-950 font-black shadow-lg shadow-emerald-500/20">
            <Zap className="w-5 h-5 fill-neutral-950" />
          </div>
          <div>
            <h1 className="font-bold text-base text-neutral-100 tracking-tight flex items-center gap-1.5">
              OrderFlow <span className="text-emerald-400 font-extrabold">BD</span>
            </h1>
            <p className="text-[11px] text-neutral-400 font-medium">Smart F-Commerce Platform</p>
          </div>
        </Link>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 p-3 space-y-1.5">
        <p className="px-3 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">
          মূল মেনু
        </p>

        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group',
                isActive
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
                  : 'text-neutral-300 hover:text-neutral-100 hover:bg-neutral-850',
                item.highlight && !isActive && 'text-blue-400 hover:text-blue-300 hover:bg-blue-500/10',
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    'w-4 h-4 transition-transform group-hover:scale-110',
                    isActive ? 'text-emerald-400' : 'text-neutral-400 group-hover:text-neutral-200',
                    item.highlight && !isActive && 'text-blue-400',
                  )}
                />
                <span>{item.name}</span>
              </div>

              {item.badge && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full animate-pulse">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Store Quick Info Footer */}
      <div className="p-3 m-3 bg-neutral-900 border border-neutral-800 rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-semibold text-neutral-300">Facebook Bot একটিভ</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono">Live Sync</span>
        </div>
        <p className="text-[11px] text-neutral-400 mt-1">অর্ডার আসা মাত্র স্ক্রিনে দেখাবে</p>
      </div>
    </aside>
  );
};
