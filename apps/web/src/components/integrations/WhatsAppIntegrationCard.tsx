'use client';

import React from 'react';
import { MessageSquare, Clock, Bell } from 'lucide-react';

interface Props {
  onStatusChange?: () => void;
}

export const WhatsAppIntegrationCard: React.FC<Props> = () => {
  return (
    <div className="bg-[#10121a] border border-neutral-800/90 rounded-3xl p-6 sm:p-7 space-y-5 shadow-xl flex flex-col justify-between relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-neutral-700/10 rounded-full blur-3xl pointer-events-none" />

      <div className="space-y-4 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-500 shadow-lg">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-neutral-400 text-base sm:text-lg flex items-center gap-2">
                WhatsApp AI চ্যাটবট
              </h3>
              <p className="text-xs text-neutral-600">QR স্ক্যান করে WhatsApp যুক্ত করুন</p>
            </div>
          </div>

          {/* "Coming Soon" badge */}
          <span className="px-3 py-1 text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/25 rounded-xl flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            শীঘ্রই আসছে
          </span>
        </div>

        {/* Body */}
        <div className="p-5 bg-neutral-900/60 border border-neutral-800/60 rounded-2xl space-y-4">
          {/* Icon + message */}
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-neutral-300">WhatsApp ইন্টিগ্রেশন শীঘ্রই আসছে</h4>
              <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                এই ফিচারটি বর্তমানে উন্নয়নাধীন। শীঘ্রই আপনি সরাসরি QR কোড স্ক্যান করে আপনার WhatsApp নম্বর যুক্ত করতে এবং AI চ্যাটবট চালু করতে পারবেন।
              </p>
            </div>
          </div>

          {/* Feature preview list */}
          <div className="pt-1 space-y-2">
            <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">যা যা থাকবে:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                '📲 ১-ক্লিকে QR কোড স্ক্যান',
                '🤖 ২৪/৭ AI স্বয়ংক্রিয় উত্তর',
                '📦 WhatsApp-এ অর্ডার বুকিং',
                '📊 রিয়েল-টাইম চ্যাট ড্যাশবোর্ড',
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-2 text-[11px] text-neutral-500 bg-neutral-800/40 rounded-xl px-3 py-2">
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer — disabled button */}
      <div className="pt-2 relative z-10">
        <div className="relative">
          <button
            disabled
            className="w-full py-4 bg-neutral-800/60 text-neutral-600 font-black text-sm rounded-2xl cursor-not-allowed flex items-center justify-center gap-2.5 border border-neutral-700/50"
          >
            <Bell className="w-5 h-5" />
            <span>বর্তমানে উপলব্ধ নয় — শীঘ্রই আসছে</span>
          </button>
          {/* Overlay label */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          </div>
        </div>
        <p className="text-center text-[11px] text-neutral-600 mt-2">
          Facebook Messenger ইন্টিগ্রেশন এখনই ব্যবহার করুন →
        </p>
      </div>
    </div>
  );
};
