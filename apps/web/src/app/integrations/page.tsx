'use client';

import React, { useState } from 'react';
import {
  Zap,
  Sparkles,
  Bot,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  Layers,
  ShoppingBag,
} from 'lucide-react';
import { FacebookIntegrationCard } from '@/components/integrations/FacebookIntegrationCard';

export default function IntegrationsPage() {
  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#121622] via-[#0e1017] to-[#090b10] p-6 sm:p-8 border border-neutral-800/90 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-bold rounded-full mb-2.5">
            <Zap className="w-3.5 h-3.5 text-blue-400" />
            <span>ফেসবুক মেসেঞ্জার বট হাব</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-neutral-100 tracking-tight">
            Facebook Page & AI Messenger Bot
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-2xl leading-relaxed">
            কোনো জটিল কোডিং বা টেকনিক্যাল সেটআপ ছাড়াই আপনার ফেসবুক পেজ কানেক্ট করুন এবং ২৪/৭ অটোমেটিক এআই সেলস ও অর্ডার চালু করুন।
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-2 self-start md:self-auto shrink-0 bg-blue-600/10 border border-blue-500/20 px-4 py-2.5 rounded-2xl">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse" />
          <span className="text-xs font-bold text-blue-300">Meta Graph API v20.0</span>
        </div>
      </div>

      {/* Main Facebook Integration Card */}
      <div>
        <FacebookIntegrationCard />
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-[#0f111a] border border-neutral-800/80 rounded-3xl space-y-2.5 shadow-lg">
          <div className="w-10 h-10 rounded-2xl bg-blue-600/15 border border-blue-500/25 flex items-center justify-center text-blue-400">
            <Bot className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-extrabold text-neutral-100">২৪/৭ স্মার্ট অটো-রিপ্লাই</h4>
          <p className="text-xs text-neutral-400 leading-relaxed">
            মেসেঞ্জারে কাস্টমার যেকোনো প্রশ্ন করলেই গুগল জেমিনাই এআই দিয়ে ন্যাচারাল বাংলায় উত্তর প্রদান করবে।
          </p>
        </div>

        <div className="p-5 bg-[#0f111a] border border-neutral-800/80 rounded-3xl space-y-2.5 shadow-lg">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-extrabold text-neutral-100">ইনস্ট্যান্ট অর্ডার ক্রিয়েশন</h4>
          <p className="text-xs text-neutral-400 leading-relaxed">
            কাস্টমার নাম, ফোন নম্বর ও ঠিকানা দিলেই স্বয়ংক্রিয়ভাবে ড্যাশবোর্ডে নতুন অর্ডার তৈরি ও ইনভেন্টরি আপডেট হবে।
          </p>
        </div>

        <div className="p-5 bg-[#0f111a] border border-neutral-800/80 rounded-3xl space-y-2.5 shadow-lg">
          <div className="w-10 h-10 rounded-2xl bg-purple-600/15 border border-purple-500/25 flex items-center justify-center text-purple-400">
            <Layers className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-extrabold text-neutral-100">১-ক্লিক পেজ সুইচিং</h4>
          <p className="text-xs text-neutral-400 leading-relaxed">
            আপনার একাধিক ফেসবুক পেজ থাকলে যেকোনো সময় ১-ক্লিকেই অন্য পেজে সুইচ বা রিকানেক্ট করতে পারবেন।
          </p>
        </div>
      </div>
    </div>
  );
}
