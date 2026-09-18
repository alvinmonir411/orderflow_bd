'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

// These routes render WITHOUT sidebar/navbar — fully standalone pages
const SHELL_FREE_ROUTES = ['/', '/login', '/register', '/admin'];

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
      </div>
    </div>
  );
};
