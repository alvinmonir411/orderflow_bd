'use client';

import React, { useState } from 'react';
import {
  Truck,
  MessageSquare,
  Key,
  CheckCircle2,
  Save,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';

export default function IntegrationsPage() {
  // Steadfast State
  const [steadfastApiKey, setSteadfastApiKey] = useState('stdf_api_9948201948201');
  const [steadfastSecret, setSteadfastSecret] = useState('stdf_sec_8849204928492');

  // Pathao State
  const [pathaoApiKey, setPathaoApiKey] = useState('');
  const [pathaoSecret, setPathaoSecret] = useState('');

  // SMS State
  const [smsApiKey, setSmsApiKey] = useState('gw_live_key_9948201');
  const [smsSenderId, setSmsSenderId] = useState('OrderFlowBD');
  const [smsTemplate, setSmsTemplate] = useState(
    'প্রিয় {name}, OrderFlow এ আপনার অর্ডার #{order_id} সফলভাবে গ্রহণ করা হয়েছে। মোট: ৳{amount}',
  );

  const handleSaveSteadfast = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Steadfast কুরিয়ার API Key সফলভাবে সেভ হয়েছে! এখন থেকে ১-ক্লিকেই পার্সেল এন্ট্রি হবে।');
  };

  const handleSavePathao = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Pathao কুরিয়ার ক্রেডেনশিয়াল সফলভাবে সেভ হয়েছে!');
  };

  const handleSaveSMS = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('এসএমএস গেটওয়ে সেটিংস সফলভাবে কনফিগার করা হয়েছে!');
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-purple-500/15 border border-purple-500/30 text-purple-400 text-xs font-semibold rounded-full mb-2">
          <Truck className="w-3.5 h-3.5" />
          <span>কুরিয়ার ও এসএমএস অটোমেশন</span>
        </div>
        <h2 className="text-2xl font-bold text-neutral-100 tracking-tight">
          কুরিয়ার ও এসএমএস গেটওয়ে ইন্টিগ্রেশন
        </h2>
        <p className="text-sm text-neutral-400 mt-1">
          Steadfast, Pathao এবং বাল্ক এসএমএস সার্ভিস ইন্টিগ্রেশন (প্লাগ অ্যান্ড প্লে — শুধু এপিআই কি বসালেই চলবে)
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Steadfast Courier Integration */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold">
                  SF
                </div>
                <div>
                  <h3 className="font-bold text-neutral-100 text-base">Steadfast Courier API</h3>
                  <p className="text-xs text-neutral-400">বাংলাদেশের সবচেয়ে জনপ্রিয় এফ-কমার্স কুরিয়ার</p>
                </div>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                সংযুক্ত
              </span>
            </div>

            <form onSubmit={handleSaveSteadfast} className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Steadfast API Key *
                </label>
                <input
                  type="password"
                  value={steadfastApiKey}
                  onChange={(e) => setSteadfastApiKey(e.target.value)}
                  placeholder="Api-Key..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-neutral-100 font-mono focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Steadfast Secret Key *
                </label>
                <input
                  type="password"
                  value={steadfastSecret}
                  onChange={(e) => setSteadfastSecret(e.target.value)}
                  placeholder="Secret-Key..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-neutral-100 font-mono focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-semibold shadow-md active:scale-95 transition-all"
                >
                  <Save className="w-4 h-4" />
                  Steadfast সেভ করুন
                </button>
              </div>
            </form>
          </div>

          <div className="p-3 bg-neutral-950/60 border border-neutral-850 rounded-xl text-[11px] text-neutral-400">
            💡 ড্যাশবোর্ডে "Steadfast বুকিং" বাটনে চাপ দিলেই স্বয়ংক্রিয়ভাবে পার্সেল এন্ট্রি হয়ে ট্র্যাকিং কোড তৈরি হবে।
          </div>
        </div>

        {/* Pathao Courier Integration */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 font-bold">
                  PT
                </div>
                <div>
                  <h3 className="font-bold text-neutral-100 text-base">Pathao Courier API</h3>
                  <p className="text-xs text-neutral-400">পাঠাও এক্সপ্রেস ডেলিভারি ও রিয়েল-টাইম ট্র্যাকিং</p>
                </div>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-neutral-800 text-neutral-400 rounded-full">
                রেডি
              </span>
            </div>

            <form onSubmit={handleSavePathao} className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Pathao Client ID / API Key
                </label>
                <input
                  type="text"
                  value={pathaoApiKey}
                  onChange={(e) => setPathaoApiKey(e.target.value)}
                  placeholder="যেমন: pathao_client_id_..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-neutral-100 font-mono focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Pathao Client Secret
                </label>
                <input
                  type="password"
                  value={pathaoSecret}
                  onChange={(e) => setPathaoSecret(e.target.value)}
                  placeholder="যেমন: pathao_client_secret_..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-neutral-100 font-mono focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-sm font-semibold shadow-md active:scale-95 transition-all"
                >
                  <Save className="w-4 h-4" />
                  Pathao সেভ করুন
                </button>
              </div>
            </form>
          </div>

          <div className="p-3 bg-neutral-950/60 border border-neutral-850 rounded-xl text-[11px] text-neutral-400">
            💡 পাঠাও এর মার্চেন্ট একাউন্ট থেকে এপিআই ক্রেডেনশিয়াল দিলে পাঠাও পার্সেল বুকিং সক্রিয় হবে।
          </div>
        </div>

        {/* Bangladeshi SMS Gateway Integration (Spanning 2 cols) */}
        <div className="md:col-span-2 bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-neutral-100 text-base">
                  Bangladeshi SMS Gateway (Greenweb / BulkSMSBD)
                </h3>
                <p className="text-xs text-neutral-400">
                  অর্ডার কনফার্ম এবং কুরিয়ার ট্র্যাকিং কোড স্বয়ংক্রিয়ভাবে কাস্টমারের ফোনে পাঠাতে
                </p>
              </div>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
              সক্রিয়
            </span>
          </div>

          <form onSubmit={handleSaveSMS} className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                SMS Provider API Token *
              </label>
              <input
                type="password"
                value={smsApiKey}
                onChange={(e) => setSmsApiKey(e.target.value)}
                placeholder="Greenweb Token..."
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-neutral-100 font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Sender ID / Masking Name *
              </label>
              <input
                type="text"
                value={smsSenderId}
                onChange={(e) => setSmsSenderId(e.target.value)}
                placeholder="যেমন: OrderFlowBD"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-neutral-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                অর্ডার কনফার্মেশন SMS টেমপ্লেট:
              </label>
              <textarea
                value={smsTemplate}
                onChange={(e) => setSmsTemplate(e.target.value)}
                rows={2}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-sm text-neutral-100 focus:outline-none focus:border-emerald-500"
              />
              <p className="text-[11px] text-neutral-500 mt-1">
                ডায়নামিক ভেরিয়েবল: <code>{'{name}'}</code>, <code>{'{order_id}'}</code>, <code>{'{amount}'}</code>, <code>{'{tracking_id}'}</code>
              </p>
            </div>

            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold shadow-md active:scale-95 transition-all"
              >
                <Save className="w-4 h-4" />
                SMS কনফিগারেশন সেভ করুন
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
