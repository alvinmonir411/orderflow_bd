'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import { toast } from 'sonner';

export default function BotSettingsPage() {
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);

  // Form State
  const [fbPageId, setFbPageId] = useState('109283746501928');
  const [fbPageToken, setFbPageToken] = useState('EAABwzLp...EAAGM9201948');
  const [verifyToken, setVerifyToken] = useState('orderflow_bd_verify_token');

  const [waPhoneId, setWaPhoneId] = useState('105948271630491');
  const [waToken, setWaToken] = useState('EAAOxk...WA991823');

  const webhookUrl = 'https://api.yourdomain.com/webhooks/facebook';

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

  const handleSaveFacebook = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Facebook Messenger কনফিগারেশন সফলভাবে সেভ হয়েছে!');
  };

  const handleSaveWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('WhatsApp Cloud API কনফিগারেশন সফলভাবে সেভ হয়েছে!');
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-blue-500/15 border border-blue-500/30 text-blue-400 text-xs font-semibold rounded-full mb-2">
          <Bot className="w-3.5 h-3.5" />
          <span>অটোমেটিক মেসেঞ্জার ও হোয়াটসঅ্যাপ বট</span>
        </div>
        <h2 className="text-2xl font-bold text-neutral-100 tracking-tight">
          মেসেঞ্জার ও হোয়াটসঅ্যাপ বট ইন্টিগ্রেশন
        </h2>
        <p className="text-sm text-neutral-400 mt-1">
          ফেসবুক পেজ টোকেন ও ওয়েব হুক কনফিগার করুন এবং পাশে থাকা লাইভ সিমুলেটরে তাৎক্ষণিক পরীক্ষা করুন
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Connection Forms & Meta Webhook Info (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Webhook Connection Card */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <h3 className="font-bold text-neutral-100 text-base flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              Meta Webhook Credentials (ফেসবুক অ্যাপের জন্য)
            </h3>
            <p className="text-xs text-neutral-400">
              developers.facebook.com এর Messenger Webhook এ নিচের Callback URL ও Verify Token টি পেস্ট করুন:
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                  Callback Webhook URL:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={webhookUrl}
                    className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 text-xs font-mono text-neutral-300 select-all"
                  />
                  <button
                    onClick={() => handleCopy(webhookUrl, 'webhook')}
                    className="p-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl transition-all"
                    title="কপি করুন"
                  >
                    {copiedWebhook ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                  Verify Token:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={verifyToken}
                    className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 text-xs font-mono text-emerald-400 select-all"
                  />
                  <button
                    onClick={() => handleCopy(verifyToken, 'token')}
                    className="p-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl transition-all"
                    title="কপি করুন"
                  >
                    {copiedToken ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Facebook Page Configuration Form */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                  f
                </div>
                <h3 className="font-bold text-neutral-100 text-base">
                  Facebook Page Access Token
                </h3>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                সক্রিয়
              </span>
            </div>

            <form onSubmit={handleSaveFacebook} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Facebook Page ID *
                </label>
                <input
                  type="text"
                  value={fbPageId}
                  onChange={(e) => setFbPageId(e.target.value)}
                  placeholder="যেমন: 109283746501928"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-neutral-100 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Page Access Token (Permanent / Long-lived) *
                </label>
                <input
                  type="password"
                  value={fbPageToken}
                  onChange={(e) => setFbPageToken(e.target.value)}
                  placeholder="EAABwzLp..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-neutral-100 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold shadow-md active:scale-95 transition-all"
                >
                  <Save className="w-4 h-4" />
                  Facebook সেটিংস সেভ করুন
                </button>
              </div>
            </form>
          </div>

          {/* WhatsApp Cloud API Configuration */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                  <Phone className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-neutral-100 text-base">
                  WhatsApp Cloud API (Meta)
                </h3>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-neutral-800 text-neutral-400 rounded-full">
                অপশনাল
              </span>
            </div>

            <form onSubmit={handleSaveWhatsApp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  WhatsApp Business Phone Number ID
                </label>
                <input
                  type="text"
                  value={waPhoneId}
                  onChange={(e) => setWaPhoneId(e.target.value)}
                  placeholder="যেমন: 105948271630491"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-neutral-100 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  WhatsApp System User Access Token
                </label>
                <input
                  type="password"
                  value={waToken}
                  onChange={(e) => setWaToken(e.target.value)}
                  placeholder="EAAOxk..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-neutral-100 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold shadow-md active:scale-95 transition-all"
                >
                  <Save className="w-4 h-4" />
                  WhatsApp সেটিংস সেভ করুন
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Side: Live Interactive Chat Simulator (5 cols) */}
        <div className="lg:col-span-5 space-y-4 sticky top-24">
          <div>
            <h3 className="font-bold text-neutral-100 text-base flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-400" />
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
