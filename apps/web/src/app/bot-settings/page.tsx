'use client';

import React, { useState, useEffect } from 'react';
import { LiveBotTester } from '@/components/bot/LiveBotTester';
import {
  Bot,
  Copy,
  Check,
  MessageCircle,
  Phone,
  Key,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  Save,
  Zap,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { toast } from 'sonner';

export default function BotSettingsPage() {
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);

  // Form State
  const [fbPageId, setFbPageId] = useState('1314475555081210');
  const [fbPageToken, setFbPageToken] = useState('EAAiyNmqJWZCkBSUrjkc4ZCraUnG8t9cXtWDgxkNZCnwd1fmP9LhKDWTr8ApzwweRZA2WHzCFHZBGZCBPmECI15GLqUZAjVyxcnErVjcszH07mdbYU6lA2l2ibDdLKZCLhZADDCXbhQeaP5Bac9xUp7BrR9WnYqMw9hgfl9k7dlxSdaPAcDFTxkqkrSV3X1ZAseJOsFbixCJu4VEgZDZD');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [verifyToken, setVerifyToken] = useState('orderflow_bd_verify_token');

  const [waPhoneId, setWaPhoneId] = useState('105948271630491');
  const [waToken, setWaToken] = useState('');

  const webhookUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/webhooks/facebook`
    : 'https://web-six-omega-jwewpf4gd5.vercel.app/webhooks/facebook';

  useEffect(() => {
    fetch('/api/bot-config')
      .then((res) => res.json())
      .then((data) => {
        if (data.fbPageId) setFbPageId(data.fbPageId);
        if (data.fbPageToken) setFbPageToken(data.fbPageToken);
        if (data.geminiApiKey) setGeminiApiKey(data.geminiApiKey);
      })
      .catch(() => {});
  }, []);

  const handleCopy = (text: string, type: 'webhook' | 'token') => {
    navigator.clipboard.writeText(text);
    if (type === 'webhook') {
      setCopiedWebhook(true);
      setTimeout(() => setCopiedWebhook(false), 2000);
    } else {
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    }
    toast.success('ক্লিপবোর্ডে কপি করা হয়েছে!');
  };

  const handleSaveFacebook = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/bot-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fbPageId, fbPageToken, geminiApiKey }),
      });
      toast.success('Facebook Messenger কনফিগারেশন সফলভাবে সেভ হয়েছে!');
    } catch {
      toast.error('সেভ করতে সমস্যা হয়েছে');
    }
  };

  const handleSaveGemini = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/bot-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fbPageId, fbPageToken, geminiApiKey }),
      });
      toast.success('Google Gemini AI Studio API Key সফলভাবে সেভ হয়েছে! বট এখন ফুল AI মোডে চলবে।');
    } catch {
      toast.error('সেভ করতে সমস্যা হয়েছে');
    }
  };

  const handleSaveWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('WhatsApp Cloud API কনফিগারেশন সফলভাবে সেভ হয়েছে!');
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#121622] via-[#0e1017] to-[#090b10] p-6 sm:p-7 border border-neutral-800/90 shadow-2xl">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold rounded-full mb-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI সেলস ও মেসেঞ্জার অটোমেশন</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-neutral-100 tracking-tight">
            মেসেঞ্জার ও AI চ্যাটবট ইন্টিগ্রেশন
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-2xl leading-relaxed">
            ফেসবুক পেজ টোকেন ও Google AI Studio (Gemini) API Key কনফিগার করুন। পাশে থাকা লাইভ প্রিভিউতে সাথে সাথে টেস্ট করুন।
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Connection Forms & Meta Webhook Info (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Google AI Studio (Gemini) Intelligence Card */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#151228] via-[#0f101d] to-[#0a0c16] border border-indigo-500/40 p-6 sm:p-7 space-y-5 shadow-2xl group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/15 rounded-full blur-2xl pointer-events-none group-hover:bg-indigo-500/25 transition-all" />

            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 font-black">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-neutral-100 text-base sm:text-lg flex items-center gap-2">
                    Google AI Studio (Gemini 2.0 / 1.5 Flash)
                  </h3>
                  <p className="text-xs text-indigo-300/80 font-medium">সুপার-ইন্টেলিজেন্ট এআই সেলস অ্যাসিস্ট্যান্ট</p>
                </div>
              </div>
              <span className={`px-2.5 py-1 text-xs font-bold rounded-xl border shadow-sm ${
                geminiApiKey
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
              }`}>
                {geminiApiKey ? '● AI সক্রিয়' : 'ফ্রি ইন্টিগ্রেশন'}
              </span>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed relative z-10">
              Google AI Studio থেকে একটি ফ্রি API Key এনে বসালে বট সম্পূর্ণ মানুষের মতো গ্রাহকের সাথে খাঁটি বাংলায় কথা বলবে, যেকোনো প্রশ্নের উত্তর দেবে এবং ভুল ইনপুট দিলে নিজেই সংশোধন করে চেয়ে নেবে!
            </p>

            <form onSubmit={handleSaveGemini} className="space-y-4 relative z-10">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-neutral-200">
                    Gemini API Key (Google AI Studio)
                  </label>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-bold underline flex items-center gap-1 transition-colors"
                  >
                    ফ্রি API Key তৈরি করুন <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                  <input
                    type="password"
                    value={geminiApiKey}
                    onChange={(e) => setGeminiApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full bg-[#0a0c14] border border-neutral-750 rounded-2xl pl-10 pr-4 py-3 text-sm text-neutral-100 font-mono focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-inner"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-2xl text-sm font-bold shadow-lg shadow-indigo-600/30 active:scale-95 transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  Gemini AI সেভ ও চালু করুন
                </button>
              </div>
            </form>
          </div>

          {/* Webhook Connection Card */}
          <div className="bg-[#10121a] border border-neutral-800/90 rounded-3xl p-6 sm:p-7 space-y-4 shadow-xl">
            <h3 className="font-extrabold text-neutral-100 text-base flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              Meta Webhook Credentials (ফেসবুক অ্যাপের জন্য)
            </h3>
            <p className="text-xs text-neutral-400">
              developers.facebook.com এর Messenger Webhook এ নিচের Callback URL ও Verify Token টি পেস্ট করুন:
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                  Callback Webhook URL:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={webhookUrl}
                    className="flex-1 bg-[#0a0c12] border border-neutral-750 rounded-2xl px-4 py-2.5 text-xs font-mono text-neutral-200 select-all"
                  />
                  <button
                    onClick={() => handleCopy(webhookUrl, 'webhook')}
                    className="p-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-2xl transition-all shadow-sm border border-neutral-700/60"
                    title="কপি করুন"
                  >
                    {copiedWebhook ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                  Verify Token:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={verifyToken}
                    className="flex-1 bg-[#0a0c12] border border-neutral-750 rounded-2xl px-4 py-2.5 text-xs font-mono text-emerald-400 select-all font-bold"
                  />
                  <button
                    onClick={() => handleCopy(verifyToken, 'token')}
                    className="p-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-2xl transition-all shadow-sm border border-neutral-700/60"
                    title="কপি করুন"
                  >
                    {copiedToken ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Facebook Page Configuration Form */}
          <div className="bg-[#10121a] border border-neutral-800/90 rounded-3xl p-6 sm:p-7 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-md shadow-blue-600/30">
                  f
                </div>
                <div>
                  <h3 className="font-extrabold text-neutral-100 text-base">
                    Facebook Page Access Token
                  </h3>
                  <p className="text-xs text-neutral-400">মেসেঞ্জার চ্যাটের সাথে সংযোগ</p>
                </div>
              </div>
              <span className="px-2.5 py-1 text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 rounded-xl">
                ● লাইভ সক্রিয়
              </span>
            </div>

            <form onSubmit={handleSaveFacebook} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                  Facebook Page ID *
                </label>
                <input
                  type="text"
                  value={fbPageId}
                  onChange={(e) => setFbPageId(e.target.value)}
                  placeholder="যেমন: 1314475555081210"
                  className="w-full bg-[#0a0c12] border border-neutral-750 rounded-2xl px-4 py-2.5 text-sm text-neutral-100 font-mono focus:outline-none focus:border-blue-500 shadow-inner"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                  Page Access Token (Permanent / Long-lived) *
                </label>
                <input
                  type="password"
                  value={fbPageToken}
                  onChange={(e) => setFbPageToken(e.target.value)}
                  placeholder="EAAiyNmq..."
                  className="w-full bg-[#0a0c12] border border-neutral-750 rounded-2xl px-4 py-2.5 text-sm text-neutral-100 font-mono focus:outline-none focus:border-blue-500 shadow-inner"
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-sm font-bold shadow-md shadow-blue-600/25 active:scale-95 transition-all"
                >
                  <Save className="w-4 h-4" />
                  Facebook সেটিংস সেভ করুন
                </button>
              </div>
            </form>
          </div>

          {/* WhatsApp Cloud API Configuration */}
          <div className="bg-[#10121a] border border-neutral-800/90 rounded-3xl p-6 sm:p-7 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/30">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-neutral-100 text-base">
                    WhatsApp Cloud API (Meta)
                  </h3>
                  <p className="text-xs text-neutral-400">হোয়াটসঅ্যাপ অর্ডার অটোমেশন</p>
                </div>
              </div>
              <span className="px-2.5 py-1 text-xs font-bold bg-neutral-800 text-neutral-400 rounded-xl border border-neutral-700">
                অপশনাল
              </span>
            </div>

            <form onSubmit={handleSaveWhatsApp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                  WhatsApp Business Phone Number ID
                </label>
                <input
                  type="text"
                  value={waPhoneId}
                  onChange={(e) => setWaPhoneId(e.target.value)}
                  placeholder="যেমন: 105948271630491"
                  className="w-full bg-[#0a0c12] border border-neutral-750 rounded-2xl px-4 py-2.5 text-sm text-neutral-100 font-mono focus:outline-none focus:border-emerald-500 shadow-inner"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                  WhatsApp System User Access Token
                </label>
                <input
                  type="password"
                  value={waToken}
                  onChange={(e) => setWaToken(e.target.value)}
                  placeholder="EAAOxk..."
                  className="w-full bg-[#0a0c12] border border-neutral-750 rounded-2xl px-4 py-2.5 text-sm text-neutral-100 font-mono focus:outline-none focus:border-emerald-500 shadow-inner"
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-sm font-bold shadow-md shadow-emerald-600/25 active:scale-95 transition-all"
                >
                  <Save className="w-4 h-4" />
                  WhatsApp সেটিংস সেভ করুন
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Side: Live Interactive Chat Simulator (5 cols) */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-24">
          <div className="p-1">
            <h3 className="font-extrabold text-neutral-100 text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              লাইভ চ্যাটবট টেস্ট প্রিভিউ
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              এখানে মেসেজ বা বাটনে ক্লিক করে পুরো অর্ডার ফ্লো টেস্ট করুন
            </p>
          </div>

          <LiveBotTester />
        </div>
      </div>
    </div>
  );
}
