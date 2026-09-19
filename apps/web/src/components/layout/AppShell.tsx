'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { MessageCircle, ExternalLink, Zap } from 'lucide-react';

// These routes render WITHOUT sidebar/navbar — fully standalone pages
const SHELL_FREE_ROUTES = ['/', '/login', '/register', '/admin', '/demo'];

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Check if current route is shell-free (no sidebar/navbar)
  const isShellFree = SHELL_FREE_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + '/'),
  );

  // Shell-free: render children directly with no layout chrome
  if (isShellFree) {
    return (
      <div className="min-h-screen bg-[#07080c] text-neutral-100 antialiased selection:bg-emerald-500/30 selection:text-emerald-200">
        {children}
      </div>
    );
  }

  // Dashboard shell: full sidebar + navbar layout
  return (
    <div className="flex min-h-screen bg-[#090a0f] text-neutral-100 antialiased bg-grid-pattern selection:bg-emerald-500/30 selection:text-emerald-200">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Navbar onMenuToggle={() => setIsSidebarOpen((prev) => !prev)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full animate-in fade-in duration-300">
          {children}
        </main>
        {/* Global Dashboard Footer */}
        <footer className="mt-auto border-t border-neutral-800/80 bg-[#07080c]/90 backdrop-blur-md py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-400">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <Zap className="w-3 h-3 fill-current" />
              </div>
              <span className="font-bold text-neutral-200">OrderFlow BD</span>
              <span className="text-neutral-400 hidden sm:inline">— সেন্ট্রালাইজড F-Commerce AI প্ল্যাটফর্ম</span>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-neutral-400 hidden md:inline">সাপোর্ট ও সাহায্যের জন্য:</span>
              <a
                href="https://chat.whatsapp.com/GLhBIGB3fbOLoVg0uDYoGk"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-bold transition-all shadow-sm group cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span>WhatsApp সাপোর্ট গ্রুপে জয়েন করুন</span>
                <ExternalLink className="w-3 h-3 opacity-70" />
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};
