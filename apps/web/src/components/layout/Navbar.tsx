'use client';

import React from 'react';
import { Bell, Store, Search, UserCheck } from 'lucide-react';

export const Navbar: React.FC = () => {
  return (
    <header className="h-16 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Store Badge & Search */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-xl">
          <Store className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold text-neutral-200">আলভিন ফ্যাশন হাব (FB Store)</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 bg-neutral-900/60 border border-neutral-800 px-3 py-1.5 rounded-xl text-xs text-neutral-400">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
          <span>Webhook: Connected</span>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-neutral-800">
          <div className="w-8 h-8 rounded-full bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-xs">
            AM
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-neutral-200">Alvin Monir</p>
            <p className="text-[10px] text-neutral-500">Merchant Owner</p>
          </div>
        </div>
      </div>
    </header>
  );
};
