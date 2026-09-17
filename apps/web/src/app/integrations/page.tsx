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
  Lock,
  Sparkles,
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
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#121622] via-[#0e1017] to-[#090b10] p-6 sm:p-7 border border-neutral-800/90 shadow-2xl">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-bold rounded-full mb-2">
            <Truck className="w-3.5 h-3.5 text-purple-400" />
            <span>কুরিয়ার ও এসএমএস অটোমেশন</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-neutral-100 tracking-tight">
            কুরিয়ার ও এসএমএস গেটওয়ে ইন্টিগ্রেশন
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-2xl leading-relaxed">
            Steadfast, Pathao এবং বাল্ক এসএমএস সার্ভিস ইন্টিগ্রেশন (প্লাগ অ্যান্ড প্লে — শুধু এপিআই কি বসালেই চলবে)।
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Steadfast Courier Integration */}
        <div className="bg-[#10121a] border border-neutral-800/90 rounded-3xl p-6 sm:p-7 space-y-5 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-black shadow-md shadow-purple-600/30 text-sm">
                  SF
                </div>
                <div>
                  <h3 className="font-extrabold text-neutral-100 text-base sm:text-lg">Steadfast Courier API</h3>
                  <p className="text-xs text-neutral-400">বাংলাদেশের শীর্ষস্থানীয় এফ-কমার্স কুরিয়ার</p>
                </div>
              </div>
              <span className="px-2.5 py-1 text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 rounded-xl">
                ● সংযুক্ত
              </span>
            </div>

            <form onSubmit={handleSaveSteadfast} className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                  Steadfast API Key *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                  <input
                    type="password"
                    value={steadfastApiKey}
                    onChange={(e) => setSteadfastApiKey(e.target.value)}
                    placeholder="Api-Key..."
                    className="w-full bg-[#0a0c12] border border-neutral-750 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-neutral-100 font-mono focus:outline-none focus:border-purple-500 shadow-inner"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                  Steadfast Secret Key *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                  <input
                    type="password"
                    value={steadfastSecret}
                    onChange={(e) => setSteadfastSecret(e.target.value)}
                    placeholder="Secret-Key..."
                    className="w-full bg-[#0a0c12] border border-neutral-750 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-neutral-100 font-mono focus:outline-none focus:border-purple-500 shadow-inner"
                  />
                </div>
              </div>

              <div className="pt-1 flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-2xl text-sm font-bold shadow-md shadow-purple-600/25 active:scale-95 transition-all"
                >
                  <Save className="w-4 h-4" />
                  Steadfast সেভ করুন
                </button>
              </div>
            </form>
          </div>

          <div className="p-3.5 bg-[#0a0c12] border border-neutral-800 rounded-2xl text-xs text-neutral-400">
            💡 ড্যাশবোর্ডে <strong>"Steadfast"</strong> বাটনে চাপ দিলেই স্বয়ংক্রিয়ভাবে পার্সেল এন্ট্রি হয়ে ট্র্যাকিং কোড তৈরি হবে।
          </div>
        </div>

        {/* Pathao Courier Integration */}
        <div className="bg-[#10121a] border border-neutral-800/90 rounded-3xl p-6 sm:p-7 space-y-5 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-600 to-red-600 flex items-center justify-center text-white font-black shadow-md shadow-rose-600/30 text-sm">
                  PT
                </div>
                <div>
                  <h3 className="font-extrabold text-neutral-100 text-base sm:text-lg">Pathao Courier API</h3>
                  <p className="text-xs text-neutral-400">পাঠাও এক্সপ্রেস ডেলিভারি ও লাইভ ট্র্যাকিং</p>
                </div>
              </div>
              <span className="px-2.5 py-1 text-xs font-bold bg-neutral-800 text-neutral-400 border border-neutral-700 rounded-xl">
                রেডি
              </span>
            </div>

            <form onSubmit={handleSavePathao} className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                  Pathao Client ID / API Key
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                  <input
                    type="text"
                    value={pathaoApiKey}
                    onChange={(e) => setPathaoApiKey(e.target.value)}
                    placeholder="যেমন: pathao_client_id_..."
                    className="w-full bg-[#0a0c12] border border-neutral-750 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-neutral-100 font-mono focus:outline-none focus:border-rose-500 shadow-inner"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                  Pathao Client Secret
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                  <input
                    type="password"
                    value={pathaoSecret}
                    onChange={(e) => setPathaoSecret(e.target.value)}
                    placeholder="যেমন: pathao_client_secret_..."
                    className="w-full bg-[#0a0c12] border border-neutral-750 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-neutral-100 font-mono focus:outline-none focus:border-rose-500 shadow-inner"
                  />
                </div>
              </div>

              <div className="pt-1 flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white rounded-2xl text-sm font-bold shadow-md shadow-rose-600/25 active:scale-95 transition-all"
                >
                  <Save className="w-4 h-4" />
                  Pathao সেভ করুন
                </button>
              </div>
            </form>
          </div>

          <div className="p-3.5 bg-[#0a0c12] border border-neutral-800 rounded-2xl text-xs text-neutral-400">
            💡 পাঠাও মার্চেন্ট অ্যাকাউন্ট থেকে ক্রেডেনশিয়াল বসালে পাঠাও পার্সেল অটো বুকিং সক্রিয় হবে।
          </div>
        </div>

        {/* WhatsApp Business Cloud API Integration */}
        <div className="bg-[#10121a] border border-neutral-800/90 rounded-3xl p-6 sm:p-7 space-y-5 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-green-600 flex items-center justify-center text-white font-black shadow-md shadow-emerald-600/30">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-neutral-100 text-base sm:text-lg">WhatsApp Cloud API</h3>
                  <p className="text-xs text-neutral-400">মেসেঞ্জারের মতো হোয়াটসঅ্যাপেও ২৪/৭ অটো সেলস বট</p>
                </div>
              </div>
              <span className="px-2.5 py-1 text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 rounded-xl">
                সক্রিয়
              </span>
            </div>

            <div className="space-y-3 pt-1 text-xs text-neutral-300">
              <div className="p-3 bg-[#0a0c12] border border-neutral-800 rounded-2xl space-y-2">
                <p className="font-semibold text-neutral-200">Meta Developers Webhook সেটিংস:</p>
                <div className="space-y-1">
                  <p className="text-[11px] text-neutral-400 font-mono">Callback URL:</p>
                  <code className="block p-2 bg-neutral-900 border border-neutral-750 rounded-xl text-emerald-400 select-all break-all">
                    https://orderflowbd.vercel.app/webhooks/whatsapp
                  </code>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] text-neutral-400 font-mono">Verify Token:</p>
                  <code className="block p-2 bg-neutral-900 border border-neutral-750 rounded-xl text-emerald-400 select-all">
                    orderflow_bd_verify_token
                  </code>
                </div>
              </div>

              <p className="text-neutral-400 leading-relaxed">
                💡 এছাড়াও ড্যাশবোর্ডের প্রতিটি অর্ডারে <strong>"মেসেজ"</strong> বাটনে চাপ দিয়ে সরাসরি ১-ক্লিকেই কাস্টমারকে হোয়াটসঅ্যাপে অর্ডার রিসিট ও ট্র্যাকিং কোড পাঠাতে পারবেন।
              </p>
            </div>
          </div>
        </div>

        {/* Bangladeshi SMS Gateway Integration (Spanning 2 cols) */}
        <div className="md:col-span-2 bg-[#10121a] border border-neutral-800/90 rounded-3xl p-6 sm:p-7 space-y-5 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/30">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-neutral-100 text-base sm:text-lg">
                  Bangladeshi SMS Gateway (Greenweb / BulkSMSBD)
                </h3>
                <p className="text-xs text-neutral-400">
                  অর্ডার কনফার্ম এবং কুরিয়ার ট্র্যাকিং কোড স্বয়ংক্রিয়ভাবে কাস্টমারের ফোনে পাঠাতে
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 rounded-xl">
              ● সক্রিয়
            </span>
          </div>

          <form onSubmit={handleSaveSMS} className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                SMS Provider API Token *
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type="password"
                  value={smsApiKey}
                  onChange={(e) => setSmsApiKey(e.target.value)}
                  placeholder="Greenweb Token..."
                  className="w-full bg-[#0a0c12] border border-neutral-750 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-neutral-100 font-mono focus:outline-none focus:border-emerald-500 shadow-inner"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                Sender ID / Masking Name *
              </label>
              <input
                type="text"
                value={smsSenderId}
                onChange={(e) => setSmsSenderId(e.target.value)}
                placeholder="যেমন: OrderFlowBD"
                className="w-full bg-[#0a0c12] border border-neutral-750 rounded-2xl px-4 py-2.5 text-sm text-neutral-100 focus:outline-none focus:border-emerald-500 shadow-inner"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                অর্ডার কনফার্মেশন SMS টেমপ্লেট:
              </label>
              <textarea
                value={smsTemplate}
                onChange={(e) => setSmsTemplate(e.target.value)}
                rows={2}
                className="w-full bg-[#0a0c12] border border-neutral-750 rounded-2xl p-3 text-sm text-neutral-100 focus:outline-none focus:border-emerald-500 shadow-inner"
              />
              <p className="text-[11px] text-neutral-400 mt-1">
                ডায়নামিক ভেরিয়েবল: <code className="text-emerald-400">{'{name}'}</code>, <code className="text-emerald-400">{'{order_id}'}</code>, <code className="text-emerald-400">{'{amount}'}</code>, <code className="text-emerald-400">{'{tracking_id}'}</code>
              </p>
            </div>

            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl text-sm font-bold shadow-md shadow-emerald-600/25 active:scale-95 transition-all"
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
