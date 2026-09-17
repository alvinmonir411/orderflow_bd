'use client';

import React, { useState, useEffect } from 'react';
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
  XCircle,
  AlertCircle,
  Copy,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';
import { StoreSetupWizardModal } from '@/components/onboarding/StoreSetupWizardModal';

export default function IntegrationsPage() {
  const [showWizard, setShowWizard] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Facebook State (Dynamic from DB)
  const [fbPageToken, setFbPageToken] = useState('');
  const [fbPageId, setFbPageId] = useState('');
  const [isConnectingFb, setIsConnectingFb] = useState(false);

  // WhatsApp Waapi State (Dynamic from DB)
  const [waapiInstanceId, setWaapiInstanceId] = useState('104344');
  const [waapiApiToken, setWaapiApiToken] = useState('MY60stKiB13JQV05HlNywywyhMyLAN0xVAGcd0Gd4852ce73');
  const [waConnected, setWaConnected] = useState(true);
  const [isSavingWaapi, setIsSavingWaapi] = useState(false);

  // Steadfast State (Dynamic from DB)
  const [steadfastApiKey, setSteadfastApiKey] = useState('');
  const [steadfastSecret, setSteadfastSecret] = useState('');
  const [isSavingSteadfast, setIsSavingSteadfast] = useState(false);

  // Pathao State (Dynamic from DB)
  const [pathaoApiKey, setPathaoApiKey] = useState('');
  const [pathaoSecret, setPathaoSecret] = useState('');
  const [isSavingPathao, setIsSavingPathao] = useState(false);

  // Load Real Configurations from PostgreSQL
  const loadConfig = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/bot-config');
      if (res.ok) {
        const data = await res.json();
        setFbPageToken(data.fbPageToken || '');
        setFbPageId(data.fbPageId || '1314475555081210');
        setSteadfastApiKey(data.steadfastApiKey || '');
        setSteadfastSecret(data.steadfastSecretKey || '');
        setPathaoApiKey(data.pathaoClientId || '');
        setPathaoSecret(data.pathaoSecretKey || '');
        setWaapiInstanceId(data.waapiInstanceId || '104344');
        setWaapiApiToken(data.waapiApiToken || 'MY60stKiB13JQV05HlNywywyhMyLAN0xVAGcd0Gd4852ce73');
        setWaConnected(Boolean(data.waapiInstanceId && data.waapiApiToken));
      }
    } catch (e) {
      console.error('Failed to load integration config:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const fbConnected = Boolean(fbPageToken && fbPageToken.length > 10);
  const steadfastConnected = Boolean(steadfastApiKey && steadfastApiKey.trim().length > 0);
  const pathaoConnected = Boolean(pathaoApiKey && pathaoApiKey.trim().length > 0);

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} ক্লিপবোর্ডে কপি হয়েছে!`);
  };

  const handleConnectFacebook = async () => {
    setIsConnectingFb(true);
    try {
      await new Promise((r) => setTimeout(r, 800));
      await loadConfig();
      toast.success('ফেসবুক পেজ কানেকশন স্ট্যাটাস রিফ্রেশ হয়েছে!');
    } finally {
      setIsConnectingFb(false);
    }
  };

  const handleSaveWaapi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!waapiInstanceId.trim() || !waapiApiToken.trim()) {
      toast.error('দয়া করে আপনার Waapi Instance ID এবং API Token দিন');
      return;
    }
    setIsSavingWaapi(true);
    try {
      const res = await fetch('/api/bot-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          waapiInstanceId: waapiInstanceId.trim(),
          waapiApiToken: waapiApiToken.trim(),
          whatsappConnected: true,
          whatsappProvider: 'WAAPI',
        }),
      });
      if (res.ok) {
        toast.success('🎉 WhatsApp (Waapi Instance) সফলভাবে সেভ ও সংযুক্ত হয়েছে!');
        await loadConfig();
      } else {
        toast.error('WhatsApp ক্রেডেনশিয়াল সেভ করা যায়নি');
      }
    } catch (e) {
      toast.error('সার্ভারে সমস্যা হয়েছে');
    } finally {
      setIsSavingWaapi(false);
    }
  };

  const handleSaveSteadfast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!steadfastApiKey.trim() || !steadfastSecret.trim()) {
      toast.error('দয়া করে আপনার Steadfast API Key এবং Secret Key লিখুন');
      return;
    }
    setIsSavingSteadfast(true);
    try {
      const res = await fetch('/api/bot-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          steadfastApiKey: steadfastApiKey.trim(),
          steadfastSecretKey: steadfastSecret.trim(),
        }),
      });
      if (res.ok) {
        toast.success('🎉 Steadfast API Key সফলভাবে সেভ হয়েছে! এখন ড্যাশবোর্ড থেকে ১-ক্লিকেই পার্সেল এন্ট্রি হবে।');
        await loadConfig();
      } else {
        toast.error('সেভ করতে সমস্যা হয়েছে');
      }
    } catch (e) {
      toast.error('সার্ভারে সমস্যা হয়েছে');
    } finally {
      setIsSavingSteadfast(false);
    }
  };

  const handleSavePathao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pathaoApiKey.trim() || !pathaoSecret.trim()) {
      toast.error('দয়া করে আপনার Pathao Client ID এবং Secret লিখুন');
      return;
    }
    setIsSavingPathao(true);
    try {
      const res = await fetch('/api/bot-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pathaoClientId: pathaoApiKey.trim(),
          pathaoSecretKey: pathaoSecret.trim(),
        }),
      });
      if (res.ok) {
        toast.success('Pathao কুরিয়ার সেটিংস সফলভাবে সেভ হয়েছে!');
        await loadConfig();
      }
    } catch (e) {
      toast.error('সেভ করতে সমস্যা হয়েছে');
    } finally {
      setIsSavingPathao(false);
    }
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
            কোনো জটিল কোডিং ছাড়া আপনার ফেসবুক পেজ, হোয়াটসঅ্যাপ বিজনেস (Waapi) এবং Steadfast কুরিয়ার পরিচালনা করুন।
          </p>
        </div>

        <button
          onClick={() => setShowWizard(true)}
          className="relative z-10 px-5 py-3 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-neutral-950 rounded-2xl text-xs sm:text-sm font-black shadow-xl shadow-emerald-500/25 active:scale-95 transition-all flex items-center gap-2 self-start md:self-auto shrink-0"
        >
          <Sparkles className="w-4 h-4 fill-neutral-950 text-neutral-950" />
          <span>৩-স্টেপ সেটআপ উইজার্ড চালান</span>
        </button>
      </div>

      {/* Grid: Facebook 1-Click & WhatsApp Waapi Connect */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Facebook Page Meta Connection */}
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
                  <p className="text-xs text-neutral-400">মেটা বিজনেস ও মেসেঞ্জার বট</p>
                </div>
              </div>

              {fbConnected ? (
                <span className="px-2.5 py-1 text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 rounded-xl flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>সংযুক্ত</span>
                </span>
              ) : (
                <span className="px-2.5 py-1 text-xs font-bold bg-neutral-800 text-neutral-400 border border-neutral-700 rounded-xl flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5 text-neutral-500" />
                  <span>কানেক্ট করা হয়নি</span>
                </span>
              )}
            </div>

            <div className="p-4 bg-neutral-900/90 border border-neutral-800 rounded-2xl space-y-3">
              {fbConnected ? (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-neutral-400">সংযুক্ত পেজ:</p>
                      <p className="text-sm font-extrabold text-emerald-300 mt-0.5">
                        Moner Kotha <span className="text-xs font-mono text-neutral-400 font-normal">(ID: {fbPageId || '1314475555081210'})</span>
                      </p>
                    </div>
                    <button
                      onClick={handleConnectFacebook}
                      disabled={isConnectingFb}
                      className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 rounded-xl text-xs font-semibold transition-all active:scale-95"
                    >
                      {isConnectingFb ? 'সিঙ্ক হচ্ছে...' : 'রিফ্রেশ'}
                    </button>
                  </div>
                  <p className="text-[11px] text-neutral-400 leading-relaxed border-t border-neutral-800/80 pt-2.5">
                    ✅ <strong>লাইভ সুবিধা:</strong> এই পেজে কাস্টমার মেসেজ দিলে Gemini AI স্বয়ংক্রিয়ভাবে রিপ্লাই দিচ্ছে এবং ড্যাশবোর্ডে অর্ডার সিঙ্ক হচ্ছে।
                  </p>
                </>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-neutral-300">
                    এখনও কোনো ফেসবুক পেজ সংযুক্ত করা হয়নি। নিচে ক্লিক করে পেজ কানেক্ট করুন।
                  </p>
                </div>
              )}
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
                <span>ফেসবুক স্ট্যাটাস যাচাই হচ্ছে...</span>
              </>
            ) : (
              <>
                <span className="font-bold text-base leading-none">f</span>
                <span>{fbConnected ? 'ফেসবুক পেজ কানেকশন রিফ্রেশ করুন' : 'Continue with Facebook (১-ক্লিক কানেক্ট)'}</span>
              </>
            )}
          </button>
        </div>

        {/* 2. WhatsApp Waapi.app Live Integration */}
        <div className="bg-[#10121a] border border-neutral-800/90 rounded-3xl p-6 sm:p-7 space-y-5 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-green-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-green-600/30">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-neutral-100 text-base sm:text-lg">
                    WhatsApp Automation (Waapi)
                  </h3>
                  <p className="text-xs text-neutral-400">হোয়াটসঅ্যাপ চ্যাট ও AI অর্ডার সিঙ্ক</p>
                </div>
              </div>

              {waConnected ? (
                <span className="px-2.5 py-1 text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 rounded-xl flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Instance #{waapiInstanceId} সংযুক্ত</span>
                </span>
              ) : (
                <span className="px-2.5 py-1 text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 rounded-xl flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span>সেটআপ প্রয়োজন</span>
                </span>
              )}
            </div>

            {/* Webhook Instruction Box */}
            <div className="p-3.5 bg-neutral-900/90 border border-neutral-800 rounded-2xl space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-neutral-300 font-bold">Waapi Webhook URL (আপনার প্যানেলে দিন):</span>
                <button
                  type="button"
                  onClick={() => handleCopyText('https://orderflowbd.vercel.app/webhooks/whatsapp', 'Webhook URL')}
                  className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-750 text-neutral-200 border border-neutral-700 rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm active:scale-95 transition-all"
                >
                  <Copy className="w-3 h-3" />
                  <span>কপি করুন</span>
                </button>
              </div>
              <p className="text-xs font-mono text-emerald-400 bg-neutral-950 px-3 py-2 rounded-xl border border-neutral-800 break-all select-all">
                https://orderflowbd.vercel.app/webhooks/whatsapp
              </p>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                👉 Waapi-তে আপনার Instance #{waapiInstanceId}-এর <strong>Webhooks</strong> অপশনে গিয়ে এই URL-টি পেস্ট করে সেভ করুন।
              </p>
            </div>

            {/* Waapi Form */}
            <form onSubmit={handleSaveWaapi} className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">
                  Waapi Instance ID
                </label>
                <div className="relative">
                  <Smartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                  <input
                    type="text"
                    value={waapiInstanceId}
                    onChange={(e) => setWaapiInstanceId(e.target.value)}
                    placeholder="104344"
                    className="w-full bg-[#0a0c12] border border-neutral-750 rounded-xl pl-10 pr-4 py-2 text-xs text-neutral-100 font-mono focus:outline-none focus:border-green-500 shadow-inner"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">
                  Waapi API Token
                </label>
                <div className="relative">
                  <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                  <input
                    type="password"
                    value={waapiApiToken}
                    onChange={(e) => setWaapiApiToken(e.target.value)}
                    placeholder="MY60stKi..."
                    className="w-full bg-[#0a0c12] border border-neutral-750 rounded-xl pl-10 pr-4 py-2 text-xs text-neutral-100 font-mono focus:outline-none focus:border-green-500 shadow-inner"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSavingWaapi}
                className="w-full py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {isSavingWaapi ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Waapi সেটিংস সেভ করুন</span>
                  </>
                )}
              </button>
            </form>
          </div>
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

              {steadfastConnected ? (
                <span className="px-2.5 py-1 text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 rounded-xl flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>সংযুক্ত</span>
                </span>
              ) : (
                <span className="px-2.5 py-1 text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 rounded-xl flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span>কানেক্ট করা হয়নি</span>
                </span>
              )}
            </div>

            <p className="text-xs text-neutral-400">
              Steadfast মার্চেন্ট অ্যাকাউন্ট (<a href="https://steadfast.com.bd/login" target="_blank" rel="noreferrer" className="text-purple-400 underline">steadfast.com.bd</a>) এর Settings ➔ API Information থেকে কী দিয়ে সেভ করুন।
            </p>

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
                    placeholder="আপনার Steadfast API Key দিন..."
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
                    placeholder="আপনার Steadfast Secret Key দিন..."
                    className="w-full bg-[#0a0c12] border border-neutral-750 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-neutral-100 font-mono focus:outline-none focus:border-purple-500 shadow-inner"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSavingSteadfast}
                className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {isSavingSteadfast ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>{steadfastConnected ? 'Steadfast কী আপডেট করুন' : 'Steadfast কী সেভ করুন'}</span>
                  </>
                )}
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

              {pathaoConnected ? (
                <span className="px-2.5 py-1 text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 rounded-xl">
                  ● সংযুক্ত
                </span>
              ) : (
                <span className="px-2.5 py-1 text-xs font-bold bg-neutral-800 text-neutral-400 rounded-xl">
                  ঐচ্ছিক / অসংযুক্ত
                </span>
              )}
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
                  placeholder="আপনার Pathao Client ID লিখুন..."
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
                  placeholder="আপনার Pathao Secret লিখুন..."
                  className="w-full bg-[#0a0c12] border border-neutral-750 rounded-2xl px-4 py-2.5 text-sm text-neutral-100 font-mono focus:outline-none focus:border-red-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSavingPathao}
                className="w-full py-2.5 bg-neutral-800 hover:bg-neutral-750 text-neutral-200 font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {isSavingPathao ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Pathao কী সেভ করুন</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Store Setup Wizard Modal */}
      <StoreSetupWizardModal
        isOpen={showWizard}
        onClose={() => {
          setShowWizard(false);
          loadConfig();
        }}
        onComplete={() => {
          setShowWizard(false);
          loadConfig();
        }}
      />
    </div>
  );
}
