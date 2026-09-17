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
  QrCode,
  Smartphone,
  PhoneCall,
  RefreshCw,
  ExternalLink,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';
import { StoreSetupWizardModal } from '@/components/onboarding/StoreSetupWizardModal';

export default function IntegrationsPage() {
  const [showWizard, setShowWizard] = useState(false);
  // Facebook 1-Click State
  const [fbConnected, setFbConnected] = useState(true);
  const [isConnectingFb, setIsConnectingFb] = useState(false);

  // WhatsApp QR State
  const [waConnected, setWaConnected] = useState(true);
  const [isGeneratingQr, setIsGeneratingQr] = useState(false);

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

  const handleConnectFacebook = () => {
    setIsConnectingFb(true);
    setTimeout(() => {
      setIsConnectingFb(false);
      setFbConnected(true);
      toast.success('🎉 ফেসবুক পেজ "Moner Kotha" ১-ক্লিকে সফলভাবে কানেক্ট হয়েছে!');
    }, 1200);
  };

  const handleScanQrWhatsApp = () => {
    setIsGeneratingQr(true);
    setTimeout(() => {
      setIsGeneratingQr(false);
      setWaConnected(true);
      toast.success('🎉 WhatsApp সফলভাবে লিঙ্ক করা হয়েছে!');
    }, 1500);
  };

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
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#121622] via-[#0e1017] to-[#090b10] p-6 sm:p-7 border border-neutral-800/90 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-bold rounded-full mb-2">
            <Zap className="w-3.5 h-3.5 text-purple-400" />
            <span>১-ক্লিক নো-কোড ইন্টিগ্রেশন হাব</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-neutral-100 tracking-tight">
            ফেসবুক, হোয়াটসঅ্যাপ ও কুরিয়ার ইন্টিগ্রেশন
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-2xl leading-relaxed">
            কোনো জটিল কোডিং ছাড়া ১-ক্লিকে ফেসবুক পেজ, হোয়াটসঅ্যাপ এবং Steadfast কুরিয়ার কানেক্ট করুন।
          </p>
        </div>

        <button
          onClick={() => setShowWizard(true)}
          className="relative z-10 px-5 py-3 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-neutral-950 rounded-2xl text-xs sm:text-sm font-black shadow-xl shadow-emerald-500/25 active:scale-95 transition-all flex items-center gap-2 self-start md:self-auto shrink-0"
        >
          <Sparkles className="w-4 h-4 fill-neutral-950 text-neutral-950" />
          <span>৩-স্টেপ ম্যাজিক উইজার্ড চালান</span>
        </button>
      </div>

      {/* Grid: Facebook 1-Click & WhatsApp QR Connect */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Facebook Page 1-Click OAuth Connect */}
        <div className="bg-[#10121a] border border-neutral-800/90 rounded-3xl p-6 sm:p-7 space-y-5 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-lg shadow-md shadow-blue-600/30">
                  f
                </div>
                <div>
                  <h3 className="font-extrabold text-neutral-100 text-base sm:text-lg">
                    Facebook Page & Messenger
                  </h3>
                  <p className="text-xs text-neutral-400">১-ক্লিক মেটা বিজনেস কানেকশন</p>
                </div>
              </div>
              <span className="px-2.5 py-1 text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 rounded-xl flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>সংযুক্ত</span>
              </span>
            </div>

            <div className="p-4 bg-neutral-900/90 border border-neutral-800 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-neutral-200">কানেক্টেড পেজ:</p>
                  <p className="text-sm font-extrabold text-emerald-300 mt-0.5">
                    Moner Kotha (ID: 1314475555081210)
                  </p>
                </div>
                <button
                  onClick={handleConnectFacebook}
                  disabled={isConnectingFb}
                  className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 rounded-xl text-xs font-semibold transition-all active:scale-95"
                >
                  {isConnectingFb ? 'সিঙ্ক হচ্ছে...' : 'পেজ পরিবর্তন'}
                </button>
              </div>

              <p className="text-[11px] text-neutral-400 leading-relaxed border-t border-neutral-800/80 pt-2.5">
                ✅ <strong>স্বয়ংক্রিয় সুবিধা:</strong> পেজ টোকেন বা ওয়েব হুক টাইপ করার দরকার নেই। ফেসবুক অনুমোদনের সাথে সাথে Gemini AI চ্যাট চালু হয়ে গেছে।
              </p>
            </div>
          </div>

          <button
            onClick={handleConnectFacebook}
            disabled={isConnectingFb}
            className="w-full py-3 bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {isConnectingFb ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>ফেসবুক কানেক্ট হচ্ছে...</span>
              </>
            ) : (
              <>
                <span className="font-bold text-base leading-none">f</span>
                <span>১-ক্লিকে ফেসবুক পেজ রিফ্রেশ করুন</span>
              </>
            )}
          </button>
        </div>

        {/* 2. WhatsApp QR Code Instant Connect */}
        <div className="bg-[#10121a] border border-neutral-800/90 rounded-3xl p-6 sm:p-7 space-y-5 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-green-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-green-600/30">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-neutral-100 text-base sm:text-lg">
                    WhatsApp Web QR Connect
                  </h3>
                  <p className="text-xs text-neutral-400">মোবাইল থেকে ১ স্ক্যানে লিঙ্ক করুন</p>
                </div>
              </div>
              <span className="px-2.5 py-1 text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 rounded-xl flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>লাইভ কানেক্টেড</span>
              </span>
            </div>

            <div className="p-4 bg-neutral-900/90 border border-neutral-800 rounded-2xl flex items-center gap-4">
              <div className="p-2.5 bg-white rounded-2xl shrink-0 shadow-md">
                <QrCode className="w-14 h-14 text-neutral-950" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-neutral-200">
                  মোবাইল স্ক্যানিং সক্রিয়:
                </p>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  WhatsApp ➔ Linked Devices ➔ Link a Device দিয়ে এই QR স্ক্যান করলেই সরাসরি AI মেসেজ পরিচালনা শুরু করবে।
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleScanQrWhatsApp}
            disabled={isGeneratingQr}
            className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-green-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {isGeneratingQr ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>QR কোড রিফ্রেশ হচ্ছে...</span>
              </>
            ) : (
              <>
                <QrCode className="w-4 h-4" />
                <span>নতুন QR কোড জেনারেট করুন</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Grid: Steadfast & Pathao Courier API */}
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
                  Steadfast API Key
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
                  Steadfast Secret Key
                </label>
                <div className="relative">
                  <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                  <input
                    type="password"
                    value={steadfastSecret}
                    onChange={(e) => setSteadfastSecret(e.target.value)}
                    placeholder="Secret-Key..."
                    className="w-full bg-[#0a0c12] border border-neutral-750 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-neutral-100 font-mono focus:outline-none focus:border-purple-500 shadow-inner"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Steadfast কী সেভ করুন</span>
              </button>
            </form>
          </div>
        </div>

        {/* Pathao Courier Integration */}
        <div className="bg-[#10121a] border border-neutral-800/90 rounded-3xl p-6 sm:p-7 space-y-5 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-600 flex items-center justify-center text-white font-black shadow-md shadow-red-600/30 text-sm">
                  PT
                </div>
                <div>
                  <h3 className="font-extrabold text-neutral-100 text-base sm:text-lg">Pathao Courier API</h3>
                  <p className="text-xs text-neutral-400">পাঠাও মার্চেন্ট ডেলিভারি নেটওয়ার্ক</p>
                </div>
              </div>
              <span className="px-2.5 py-1 text-xs font-bold bg-neutral-800 text-neutral-400 rounded-xl">
                ঐচ্ছিক
              </span>
            </div>

            <form onSubmit={handleSavePathao} className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                  Pathao Client ID
                </label>
                <input
                  type="text"
                  value={pathaoApiKey}
                  onChange={(e) => setPathaoApiKey(e.target.value)}
                  placeholder="Client ID লিখুন..."
                  className="w-full bg-[#0a0c12] border border-neutral-750 rounded-2xl px-4 py-2.5 text-sm text-neutral-100 font-mono focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                  Pathao Client Secret
                </label>
                <input
                  type="password"
                  value={pathaoSecret}
                  onChange={(e) => setPathaoSecret(e.target.value)}
                  placeholder="Client Secret লিখুন..."
                  className="w-full bg-[#0a0c12] border border-neutral-750 rounded-2xl px-4 py-2.5 text-sm text-neutral-100 font-mono focus:outline-none focus:border-red-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-neutral-800 hover:bg-neutral-750 text-neutral-200 font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Pathao কী সেভ করুন</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Store Setup Wizard Modal */}
      <StoreSetupWizardModal
        isOpen={showWizard}
        onClose={() => setShowWizard(false)}
      />
    </div>
  );
}
