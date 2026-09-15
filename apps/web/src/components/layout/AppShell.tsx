'use client';

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#090a0f] text-neutral-100 antialiased bg-grid-pattern selection:bg-emerald-500/30 selection:text-emerald-200">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Navbar onMenuToggle={() => setIsSidebarOpen((prev) => !prev)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-300">
          {children}
        </main>
      </div>
    </div>
  );
};
