'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Copy,
  ExternalLink,
  Lock,
  Key,
  ShieldCheck,
  Zap,
  Layers,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Info,
  Check,
  AlertCircle,
  Trash2,
  Settings,
  Phone,
  MessageSquare,
  Send,
  HelpCircle,
  QrCode,
  Globe,
} from 'lucide-react';
import { toast } from 'sonner';
import { loginWithWhatsAppPopup } from '@/lib/facebook-sdk';

interface DiscoveredNumber {
  phoneId: string;
  displayPhoneNumber: string;
  verifiedName?: string;
  wabaId?: string;
  wabaName?: string;
  businessName?: string;
  token: string;
}

interface WhatsAppStatus {
  connected: boolean;
  provider: 'META' | 'WAAPI';
  phone?: string;
  displayPhoneNumber?: string;
  verifiedName?: string;
  phoneId?: string;
  businessId?: string;
  instanceId?: string;
  hasToken?: boolean;
  isValidToken?: boolean;
  webhookUrl?: string;
  verifyToken?: string;
}

interface WhatsAppIntegrationCardProps {
  onStatusChange?: () => void;
}

export const WhatsAppIntegrationCard: React.FC<WhatsAppIntegrationCardProps> = ({ onStatusChange }) => {
  const [status, setStatus] = useState<WhatsAppStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isLoggingInFb, setIsLoggingInFb] = useState(false);
  const [showDevSettings, setShowDevSettings] = useState(false);

  // Connect Modal State
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState<'1click' | 'meta' | 'waapi' | 'guide'>('1click');
  const [discoveredNumbers, setDiscoveredNumbers] = useState<DiscoveredNumber[]>([]);
  const [isConnectingNumber, setIsConnectingNumber] = useState<string | null>(null);

  // Meta Form Inputs
  const [metaPhoneId, setMetaPhoneId] = useState('');
  const [metaToken, setMetaToken] = useState('');
  const [metaPhone, setMetaPhone] = useState('');
  const [metaBusinessId, setMetaBusinessId] = useState('');

  // WAAPI Form Inputs
  const [waapiInstanceId, setWaapiInstanceId] = useState('');
  const [waapiApiToken, setWaapiApiToken] = useState('');

  const [isSaving, setIsSaving] = useState(false);

  // Live Test Modal
  const [showTestModal, setShowTestModal] = useState(false);
  const [testPhone, setTestPhone] = useState('');
  const [testMessage, setTestMessage] = useState('🌸 OrderFlow BD টেস্ট মেসেজ: আপনার WhatsApp চ্যাটবট সফলভাবে সক্রিয় রয়েছে! 🎉');
  const [isSendingTest, setIsSendingTest] = useState(false);

  const fetchStatus = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/whatsapp/status');
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
        if (data.phoneId) setMetaPhoneId(data.phoneId);
        if (data.phone) {
          setMetaPhone(data.phone);
          setTestPhone(data.phone);
        }
        if (data.businessId) setMetaBusinessId(data.businessId);
        if (data.instanceId) setWaapiInstanceId(data.instanceId);
      }
    } catch (err) {
      console.error('Failed to fetch WhatsApp status:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleRefreshStatus = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/whatsapp/status');
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
        if (data.connected) {
          toast.success(`🎉 WhatsApp (${data.displayPhoneNumber || data.phone || 'Business'}) সফলভাবে সংযুক্ত রয়েছে!`);
        } else {
          toast.info('কোনো WhatsApp নম্বর বা ইনস্ট্যান্স কানেক্ট করা নেই');
        }
      }
    } catch {
      toast.error('স্ট্যাটাস রিফ্রেশ করতে সমস্যা হয়েছে');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} ক্লিপবোর্ডে কপি হয়েছে!`);
  };

  // 1-CLICK POPUP FACEBOOK / WHATSAPP LOGIN
  const handleWhatsAppLoginPopup = async () => {
    setIsLoggingInFb(true);
    try {
      toast.info('মেটা লগইন পপআপ ওপেন হচ্ছে...');
      const loginRes = await loginWithWhatsAppPopup();

      if (!loginRes.success || !loginRes.accessToken) {
        toast.error(loginRes.error || 'মেটা লগইন সম্পন্ন হয়নি');
        return;
      }

      toast.info('আপনার WhatsApp বিজনেস নম্বর খোঁজা হচ্ছে...');

      const res = await fetch('/api/whatsapp/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'discover_numbers',
          token: loginRes.accessToken,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.numbers && data.numbers.length > 0) {
        setDiscoveredNumbers(data.numbers);
        setShowConnectModal(true);
        setActiveModalTab('1click');
        toast.success(`🎉 ${data.numbers.length}টি WhatsApp নম্বর পাওয়া গেছে! নিচে আপনার নম্বরটি সিলেক্ট করুন।`);
      } else {
        toast.info(data.message || 'কোনো পূর্বনির্ধারিত WhatsApp নম্বর পাওয়া যায়নি। আপনি ম্যানুয়ালি Phone ID দিতে পারেন।');
        setShowConnectModal(true);
        setActiveModalTab('meta');
      }
    } catch (err) {
      console.error('[WhatsApp 1-Click Login Error]:', err);
      toast.error('মেটা লগইনে সমস্যা হয়েছে');
    } finally {
      setIsLoggingInFb(false);
    }
  };

  const handleConnectDiscoveredNumber = async (num: DiscoveredNumber) => {
    setIsConnectingNumber(num.phoneId);
    try {
      const res = await fetch('/api/whatsapp/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'META',
          whatsappPhoneId: num.phoneId,
          whatsappToken: num.token,
          whatsappPhone: num.displayPhoneNumber,
          whatsappBusinessId: num.wabaId,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`🎉 WhatsApp (${num.displayPhoneNumber || num.verifiedName}) সফলভাবে সংযুক্ত হয়েছে!`);
        setShowConnectModal(false);
        setDiscoveredNumbers([]);
        await fetchStatus();
        if (onStatusChange) onStatusChange();
      } else {
        toast.error(data.error || 'কানেক্ট করতে সমস্যা হয়েছে');
      }
    } catch {
      toast.error('সার্ভারে সমস্যা হয়েছে');
    } finally {
      setIsConnectingNumber(null);
    }
  };

  const handleConnectMeta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!metaPhoneId.trim() || !metaToken.trim()) {
      toast.error('দয়া করে Phone Number ID এবং Access Token লিখুন');
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/whatsapp/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'META',
          whatsappPhoneId: metaPhoneId.trim(),
          whatsappToken: metaToken.trim(),
          whatsappPhone: metaPhone.trim(),
          whatsappBusinessId: metaBusinessId.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message || '🎉 WhatsApp সফলভাবে কানেক্ট হয়েছে!');
        setShowConnectModal(false);
        await fetchStatus();
        if (onStatusChange) onStatusChange();
      } else {
        toast.error(data.error || 'কানেক্ট করতে সমস্যা হয়েছে। ক্রেডেনশিয়াল পরীক্ষা করুন।');
      }
    } catch {
      toast.error('সার্ভারে যোগাযোগ করতে সমস্যা হয়েছে');
    } finally {
      setIsSaving(false);
    }
  };

  const handleConnectWaapi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!waapiInstanceId.trim() || !waapiApiToken.trim()) {
      toast.error('দয়া করে WAAPI Instance ID এবং API Token প্রদান করুন');
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/whatsapp/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'WAAPI',
          waapiInstanceId: waapiInstanceId.trim(),
          waapiApiToken: waapiApiToken.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message || '🎉 WAAPI ইনস্ট্যান্স সফলভাবে কানেক্ট হয়েছে!');
        setShowConnectModal(false);
        await fetchStatus();
        if (onStatusChange) onStatusChange();
      } else {
        toast.error(data.error || 'কানেক্ট করতে সমস্যা হয়েছে');
      }
    } catch {
      toast.error('সার্ভারে যোগাযোগ করতে সমস্যা হয়েছে');
    } finally {
      setIsSaving(false);
    }
  };

  const executeDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      const res = await fetch('/api/whatsapp/disconnect', { method: 'POST' });
      if (res.ok) {
        toast.success('WhatsApp সফলভাবে ডিসকানেক্ট করা হয়েছে');
        await fetchStatus();
        if (onStatusChange) onStatusChange();
      }
    } catch {
      toast.error('ডিসকানেক্ট করতে সমস্যা হয়েছে');
    } finally {
      setIsDisconnecting(false);
    }
  };

  const handleDisconnect = () => {
    toast.warning('WhatsApp ডিসকানেক্ট করতে চান?', {
      description: 'ডিসকানেক্ট করলে স্বয়ংক্রিয় এআই রিপ্লাই ও চ্যাটবট মেসেজ পাঠানো স্থগিত থাকবে।',
      action: {
        label: 'ডিসকানেক্ট করুন',
        onClick: () => executeDisconnect(),
      },
      cancel: {
        label: 'বাতিল',
        onClick: () => {},
      },
      duration: 8000,
    });
  };

  const handleSendTestMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testPhone.trim()) {
      toast.error('ফোন নম্বর লিখুন (যেমন: 017XXXXXXXX)');
      return;
    }

    setIsSendingTest(true);
    try {
      const res = await fetch('/api/whatsapp/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: testPhone.trim(),
          message: testMessage.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`🎉 ${data.message || 'টেস্ট মেসেজ সফলভাবে পাঠানো হয়েছে!'}`);
        setShowTestModal(false);
      } else {
        toast.error(data.error || 'টেস্ট মেসেজ পাঠাতে সমস্যা হয়েছে');
      }
    } catch {
      toast.error('সার্ভার যোগাযোগে ব্যর্থতা');
    } finally {
      setIsSendingTest(false);
    }
  };

  const isConnected = Boolean(status?.connected);
  const webhookUrl = status?.webhookUrl || 'https://orderflowbd.vercel.app/webhooks/whatsapp';
  const verifyToken = status?.verifyToken || 'orderflow_bd_secure_verify_2026';

  return (
    <>
      <div className="bg-[#10121a] border border-neutral-800/90 rounded-3xl p-6 sm:p-7 space-y-5 shadow-xl flex flex-col justify-between relative overflow-hidden">
        {/* Ambient Top Glow (WhatsApp Emerald) */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-4 relative z-10">
          {/* Card Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-700 via-emerald-600 to-teal-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-emerald-600/30">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-neutral-100 text-base sm:text-lg flex items-center gap-2">
                  <span>WhatsApp Cloud API & Bot</span>
                </h3>
                <p className="text-xs text-neutral-400">১-ক্লিকে মেটা বিজনেস কানেক্ট, লাইভ কাস্টমার চ্যাট ও অটো-অর্ডার</p>
              </div>
            </div>

            {isLoading ? (
              <span className="px-3 py-1 bg-neutral-850 text-neutral-400 rounded-xl text-xs flex items-center gap-1.5">
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>লোড হচ্ছে...</span>
              </span>
            ) : isConnected ? (
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 rounded-xl flex items-center gap-1.5 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>সংযুক্ত ও সক্রিয়</span>
                </span>
              </div>
            ) : (
              <span className="px-3 py-1 text-xs font-bold bg-neutral-800 text-neutral-400 border border-neutral-700 rounded-xl flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5 text-neutral-500" />
                <span>কানেক্ট করা হয়নি</span>
              </span>
            )}
          </div>

          {/* Card Body */}
          {isConnected ? (
            <div className="space-y-3.5">
              {/* Connected Details Box */}
              <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-950/30 via-neutral-900/90 to-neutral-900 border border-emerald-500/30 rounded-2xl space-y-3.5 shadow-lg">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black text-lg shadow-inner">
                      <Phone className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-semibold text-neutral-400">কানেক্টেড WhatsApp নম্বর:</p>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                          {status?.provider === 'WAAPI' ? 'WAAPI Instance' : 'Meta Cloud API'}
                        </span>
                      </div>
                      <h4 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                        <span className="text-emerald-300 font-extrabold">
                          {status?.verifiedName
                            ? `${status.verifiedName} (${status.displayPhoneNumber || status.phone})`
                            : status?.displayPhoneNumber || status?.phone || 'WhatsApp Business Connected'}
                        </span>
                      </h4>
                      <div className="flex items-center gap-2 pt-0.5">
                        {status?.phoneId && (
                          <span className="px-2.5 py-0.5 bg-neutral-950 border border-neutral-750 text-neutral-300 font-mono text-xs rounded-lg font-bold">
                            Phone ID: {status.phoneId}
                          </span>
                        )}
                        {status?.instanceId && (
                          <span className="px-2.5 py-0.5 bg-neutral-950 border border-neutral-750 text-neutral-300 font-mono text-xs rounded-lg font-bold">
                            Instance: {status.instanceId}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowTestModal(true)}
                      className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
                      title="টেস্ট মেসেজ পাঠান"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>টেস্ট</span>
                    </button>
                    <button
                      onClick={handleRefreshStatus}
                      disabled={isRefreshing}
                      className="px-3 py-2 bg-neutral-800 hover:bg-neutral-750 text-neutral-200 border border-neutral-700 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5 shadow-sm"
                      title="লাইভ কানেকশন চেক করুন"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                      <span>{isRefreshing ? 'যাচাই...' : 'চেক'}</span>
                    </button>
                    <button
                      onClick={handleDisconnect}
                      disabled={isDisconnecting}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/15 border border-red-500/25 rounded-xl text-xs transition-all active:scale-95 shadow-sm"
                      title="ডিসকানেক্ট করুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Subscribed Webhook Status */}
                <div className="pt-2.5 border-t border-neutral-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-400 text-[11px] font-medium">সেলস বট স্ট্যাটাস:</span>
                    <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] font-medium rounded-lg flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>২৪/৭ স্বয়ংক্রিয় এআই উত্তর ও অর্ডার বুকিং সক্রিয়</span>
                    </span>
                  </div>

                  <span className="text-[11px] text-neutral-400">
                    কাস্টমার মেসেজ দিলেই রিয়েল-টাইমে রিপ্লাই হবে
                  </span>
                </div>
              </div>

              {/* Developer Webhook Settings Accordion */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowDevSettings(!showDevSettings)}
                  className="w-full flex items-center justify-between text-[11px] font-medium text-neutral-400 hover:text-neutral-200 py-1.5 px-3 bg-neutral-900/60 hover:bg-neutral-900 border border-neutral-800/80 rounded-xl transition-all"
                >
                  <span className="flex items-center gap-1.5 text-neutral-300">
                    <Settings className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Meta Webhook কনফিগারেশন বিবরণ (URL ও Verify Token)</span>
                  </span>
                  {showDevSettings ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {showDevSettings && (
                  <div className="mt-2.5 p-3.5 bg-neutral-950/90 border border-neutral-800 rounded-2xl space-y-2.5 text-xs animate-in fade-in duration-200">
                    <div className="flex items-center gap-1.5 text-emerald-400 text-[11px] pb-1 border-b border-neutral-850 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>Meta App-এর <strong>WhatsApp &gt; Configuration</strong> সেকশনে নিচের মানগুলো বসান:</span>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-neutral-300 font-bold text-[11px]">Webhook Callback URL:</span>
                        <button
                          type="button"
                          onClick={() => handleCopyText(webhookUrl, 'Webhook URL')}
                          className="px-2 py-0.5 bg-neutral-800 hover:bg-neutral-750 text-neutral-200 border border-neutral-700 rounded-md text-[10px] font-bold flex items-center gap-1 shadow-sm active:scale-95 transition-all"
                        >
                          <Copy className="w-2.5 h-2.5" />
                          <span>কপি</span>
                        </button>
                      </div>
                      <p className="text-[11px] font-mono text-emerald-400 bg-neutral-900/90 px-2.5 py-1.5 rounded-lg border border-neutral-800 break-all select-all">
                        {webhookUrl}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-neutral-300 font-bold text-[11px]">Verify Token:</span>
                        <button
                          type="button"
                          onClick={() => handleCopyText(verifyToken, 'Verify Token')}
                          className="px-2 py-0.5 bg-neutral-800 hover:bg-neutral-750 text-neutral-200 border border-neutral-700 rounded-md text-[10px] font-bold flex items-center gap-1 shadow-sm active:scale-95 transition-all"
                        >
                          <Copy className="w-2.5 h-2.5" />
                          <span>কপি</span>
                        </button>
                      </div>
                      <p className="text-[11px] font-mono text-emerald-400 bg-neutral-900/90 px-2.5 py-1.5 rounded-lg border border-neutral-800 break-all select-all">
                        {verifyToken}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-5 bg-neutral-900/80 border border-neutral-800 rounded-2xl space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5 shadow-sm">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-neutral-100">১-ক্লিক WhatsApp বিজনেস কানেক্ট</h4>
                  <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                    ফেসবুকের মতো নিচের <strong>"Continue with Facebook"</strong> বাটনে ক্লিক করে সরাসরি লগইন করুন। মেটা থেকে স্বয়ংক্রিয়ভাবে আপনার WhatsApp বিজনেস নম্বর খুঁজে নিয়ে এক ক্লিকে কানেক্ট করে দেওয়া হবে।
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Card Footer Actions */}
        <div className="pt-2 relative z-10 flex flex-col gap-2">
          {isConnected ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                onClick={handleWhatsAppLoginPopup}
                disabled={isLoggingInFb}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-2xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                {isLoggingInFb ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>লোড হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>নম্বর পরিবর্তন / রি-স্ক্যান</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setShowConnectModal(true);
                  setActiveModalTab('meta');
                }}
                className="w-full py-3 bg-neutral-800 hover:bg-neutral-750 text-neutral-200 hover:text-white border border-neutral-700 font-bold text-xs rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Settings className="w-3.5 h-3.5 text-emerald-400" />
                <span>ম্যানুয়াল ও বিকল্প অপশন</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                onClick={handleWhatsAppLoginPopup}
                disabled={isLoggingInFb}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm rounded-2xl shadow-xl shadow-emerald-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                {isLoggingInFb ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>মেটা উইন্ডো লোড হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>১-ক্লিকে WhatsApp কানেক্ট</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setShowConnectModal(true);
                  setActiveModalTab('meta');
                }}
                className="w-full py-3.5 bg-neutral-800 hover:bg-neutral-750 text-neutral-100 hover:text-white border border-neutral-700 font-bold text-xs sm:text-sm rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg"
              >
                <Key className="w-4 h-4 text-emerald-400" />
                <span>ম্যানুয়াল / QR কোড অপশন</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ================= CONNECT / SETUP WHATSAPP MODAL ================= */}
      {showConnectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-[#10131d] border border-neutral-800/90 rounded-3xl p-6 sm:p-7 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Ambient Green Glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800/80 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-black text-lg shadow-md shadow-emerald-600/30">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-neutral-100">WhatsApp বিজনেস নম্বর নির্বাচন করুন</h3>
                  <p className="text-xs text-neutral-400">ফেসবুকের মতোই ১-ক্লিকে অথবা ম্যানুয়ালি WhatsApp চ্যাটবট যুক্ত করুন</p>
                </div>
              </div>

              <button
                onClick={() => setShowConnectModal(false)}
                className="p-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-xl transition-all"
              >
                ✕
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="grid grid-cols-4 gap-1.5 my-4 relative z-10 p-1 bg-neutral-900/90 border border-neutral-800 rounded-2xl text-[11px] font-bold">
              <button
                onClick={() => setActiveModalTab('1click')}
                className={`py-2 px-1.5 rounded-xl transition-all flex items-center justify-center gap-1 ${
                  activeModalTab === '1click'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Zap className="w-3 h-3" />
                <span>১-ক্লিক নম্বর</span>
              </button>
              <button
                onClick={() => setActiveModalTab('meta')}
                className={`py-2 px-1.5 rounded-xl transition-all flex items-center justify-center gap-1 ${
                  activeModalTab === 'meta'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Globe className="w-3 h-3" />
                <span>ম্যানুয়াল Meta</span>
              </button>
              <button
                onClick={() => setActiveModalTab('waapi')}
                className={`py-2 px-1.5 rounded-xl transition-all flex items-center justify-center gap-1 ${
                  activeModalTab === 'waapi'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <QrCode className="w-3 h-3" />
                <span>QR কোড</span>
              </button>
              <button
                onClick={() => setActiveModalTab('guide')}
                className={`py-2 px-1.5 rounded-xl transition-all flex items-center justify-center gap-1 ${
                  activeModalTab === 'guide'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <HelpCircle className="w-3 h-3" />
                <span>গাইড</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto py-1 relative z-10 space-y-4">
              {/* TAB 0: 1-CLICK DISCOVERED NUMBERS */}
              {activeModalTab === '1click' && (
                <div className="space-y-4">
                  {discoveredNumbers.length > 0 ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-neutral-200 flex items-center gap-1.5">
                          <Layers className="w-4 h-4 text-emerald-400" />
                          <span>আপনার WhatsApp নম্বরসমূহ ({discoveredNumbers.length}টি পাওয়া গেছে):</span>
                        </p>

                        <button
                          type="button"
                          onClick={handleWhatsAppLoginPopup}
                          disabled={isLoggingInFb}
                          className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 transition-colors"
                        >
                          <RefreshCw className={`w-3 h-3 ${isLoggingInFb ? 'animate-spin' : ''}`} />
                          <span>রি-স্ক্যান</span>
                        </button>
                      </div>

                      <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                        {discoveredNumbers.map((num) => {
                          const isCurrentActive = status?.phoneId === num.phoneId;

                          return (
                            <div
                              key={num.phoneId}
                              className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                                isCurrentActive
                                  ? 'bg-gradient-to-r from-emerald-950/40 via-neutral-900 to-neutral-900 border-emerald-500/50 shadow-md'
                                  : 'bg-neutral-900/90 border-neutral-800 hover:border-emerald-500/50 hover:bg-neutral-850/80'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black text-base shrink-0 shadow-sm">
                                  <Phone className="w-5 h-5" />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="text-sm font-extrabold text-neutral-100">
                                      {num.displayPhoneNumber || num.verifiedName || 'WhatsApp Number'}
                                    </h4>
                                    {isCurrentActive && (
                                      <span className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold rounded-md">
                                        সক্রিয়
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] font-mono text-neutral-400 mt-0.5">
                                    Phone ID: <span className="text-neutral-300 font-medium">{num.phoneId}</span>
                                    {num.businessName ? ` • ${num.businessName}` : ''}
                                  </p>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleConnectDiscoveredNumber(num)}
                                disabled={isConnectingNumber === num.phoneId}
                                className={`px-4 py-2.5 text-xs font-black rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5 shrink-0 ${
                                  isCurrentActive
                                    ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700'
                                    : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/20'
                                }`}
                              >
                                {isConnectingNumber === num.phoneId ? (
                                  <>
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                    <span>কানেক্ট হচ্ছে...</span>
                                  </>
                                ) : isCurrentActive ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>রিকানেক্ট</span>
                                  </>
                                ) : (
                                  <>
                                    <Zap className="w-3.5 h-3.5" />
                                    <span>⚡ এই নম্বরটি কানেক্ট করুন</span>
                                  </>
                                )}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 bg-gradient-to-r from-emerald-950/40 via-neutral-900 to-neutral-900 border border-emerald-500/30 rounded-2xl space-y-4 text-center">
                      <div className="w-14 h-14 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto shadow-inner">
                        <Sparkles className="w-7 h-7" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-base font-extrabold text-neutral-100">
                          ১-ক্লিক Facebook Login দিয়ে WhatsApp খুঁজুন
                        </h4>
                        <p className="text-xs text-neutral-300 leading-relaxed max-w-md mx-auto">
                          নিচের বাটনে চাপ দিলে আপনার ফেসবুক বিজনেস অ্যাকাউন্টে থাকা WhatsApp নম্বরগুলো স্বয়ংক্রিয়ভাবে খুঁজে বের করা হবে। কোনো আইডি বা টোকেন কপি করতে হবে না।
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleWhatsAppLoginPopup}
                        disabled={isLoggingInFb}
                        className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm rounded-2xl shadow-xl shadow-emerald-500/25 active:scale-95 transition-all flex items-center justify-center gap-2.5"
                      >
                        {isLoggingInFb ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>মেটা লগইন উইন্ডো লোড হচ্ছে...</span>
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4" />
                            <span>Continue with Facebook (Find WhatsApp)</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 1: META CLOUD API FORM */}
              {activeModalTab === 'meta' && (
                <form onSubmit={handleConnectMeta} className="space-y-4">
                  <div className="p-3.5 bg-emerald-950/20 border border-emerald-500/20 rounded-2xl text-xs text-emerald-300 flex items-start gap-2.5">
                    <Info className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                    <span>
                      মেটা ডেভেলপার কনসোলের <strong>WhatsApp &gt; API Setup</strong> পেজ থেকে আপনার <strong>Phone Number ID</strong> এবং <strong>Access Token</strong> কপি করে এখানে বসান।
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-bold text-neutral-200 block mb-1.5">
                        WhatsApp Phone Number ID <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={metaPhoneId}
                        onChange={(e) => setMetaPhoneId(e.target.value)}
                        placeholder="যেমন: 105938475829102"
                        className="w-full bg-[#0a0c12] border border-neutral-750 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-neutral-100 font-mono outline-none"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-neutral-200">
                          Permanent Access Token / System User Token <span className="text-red-400">*</span>
                        </label>
                        <a
                          href="https://developers.facebook.com/apps"
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1"
                        >
                          Meta Console <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                      <textarea
                        rows={3}
                        value={metaToken}
                        onChange={(e) => setMetaToken(e.target.value)}
                        placeholder="EAA..."
                        className="w-full bg-[#0a0c12] border border-neutral-750 focus:border-emerald-500 rounded-xl p-3 text-xs text-neutral-100 font-mono resize-none outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-neutral-200 block mb-1.5">
                          WhatsApp ফোন নম্বর (ঐচ্ছিক)
                        </label>
                        <input
                          type="text"
                          value={metaPhone}
                          onChange={(e) => setMetaPhone(e.target.value)}
                          placeholder="017XXXXXXXX"
                          className="w-full bg-[#0a0c12] border border-neutral-750 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-neutral-100 outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-neutral-200 block mb-1.5">
                          WhatsApp Business Account ID (ঐচ্ছিক)
                        </label>
                        <input
                          type="text"
                          value={metaBusinessId}
                          onChange={(e) => setMetaBusinessId(e.target.value)}
                          placeholder="WABA ID"
                          className="w-full bg-[#0a0c12] border border-neutral-750 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-neutral-100 font-mono outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Webhook Reminder Box */}
                  <div className="p-3 bg-neutral-900/90 border border-neutral-800 rounded-xl space-y-1 text-xs">
                    <p className="font-bold text-neutral-200 text-[11px]">মেটাতে দেওয়ার জন্য Webhook তথ্য:</p>
                    <div className="flex items-center justify-between text-[10px] font-mono text-emerald-400 bg-neutral-950 p-2 rounded-lg border border-neutral-800">
                      <span className="truncate mr-2">{webhookUrl}</span>
                      <button
                        type="button"
                        onClick={() => handleCopyText(webhookUrl, 'Webhook URL')}
                        className="text-neutral-400 hover:text-white shrink-0"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>কানেক্ট ও যাচাই করা হচ্ছে...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>ম্যানুয়াল মেটা WhatsApp সেভ করুন</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* TAB 2: WAAPI FORM */}
              {activeModalTab === 'waapi' && (
                <form onSubmit={handleConnectWaapi} className="space-y-4">
                  <div className="p-3.5 bg-neutral-900/90 border border-neutral-800 rounded-2xl text-xs text-neutral-300 flex items-start gap-2.5">
                    <Info className="w-4 h-4 shrink-0 mt-0.5 text-blue-400" />
                    <span>
                      যদি আপনি মেটা ডেভেলপার অ্যাকাউন্ট ছাড়াই সাধারণ হোয়াটসঅ্যাপ নম্বর ব্যবহার করতে চান, তবে <strong>waapi.app</strong> থেকে QR কোড স্ক্যান করে ইনস্ট্যান্স আইডি ও টোকেন এখানে বসান।
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-bold text-neutral-200 block mb-1.5">
                        WAAPI Instance ID <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={waapiInstanceId}
                        onChange={(e) => setWaapiInstanceId(e.target.value)}
                        placeholder="যেমন: 12345"
                        className="w-full bg-[#0a0c12] border border-neutral-750 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-neutral-100 font-mono outline-none"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-neutral-200">
                          WAAPI API Token <span className="text-red-400">*</span>
                        </label>
                        <a
                          href="https://waapi.app"
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1"
                        >
                          waapi.app ওপেন করুন <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                      <input
                        type="password"
                        value={waapiApiToken}
                        onChange={(e) => setWaapiApiToken(e.target.value)}
                        placeholder="WAAPI API Token"
                        className="w-full bg-[#0a0c12] border border-neutral-750 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-neutral-100 font-mono outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>সংযুক্ত হচ্ছে...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>WAAPI ইনস্ট্যান্স সেভ করুন</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* TAB 3: STEP-BY-STEP SETUP GUIDE */}
              {activeModalTab === 'guide' && (
                <div className="space-y-3.5 text-xs leading-relaxed text-neutral-300">
                  <div className="p-3.5 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-2">
                    <h4 className="font-extrabold text-white text-sm flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[11px] font-bold">1</span>
                      <span>Meta Developer পোর্টালে যান</span>
                    </h4>
                    <p className="text-neutral-400 pl-7 text-[11px]">
                      <a href="https://developers.facebook.com" target="_blank" rel="noreferrer" className="text-emerald-400 underline">
                        developers.facebook.com
                      </a>
                      -এ লগইন করে আপনার অ্যাপে যান (বা একটি <strong>Business</strong> টাইপ অ্যাপ তৈরি করুন)।
                    </p>
                  </div>

                  <div className="p-3.5 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-2">
                    <h4 className="font-extrabold text-white text-sm flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[11px] font-bold">2</span>
                      <span>WhatsApp প্রোডাক্ট যুক্ত করুন</span>
                    </h4>
                    <p className="text-neutral-400 pl-7 text-[11px]">
                      অ্যাপ ড্যাশবোর্ডের বামের মেনুতে <strong>Add Product</strong> এ ক্লিক করে <strong>WhatsApp</strong> এর পাশে <strong>Set Up</strong> বাটনে চাপুন।
                    </p>
                  </div>

                  <div className="p-3.5 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-2">
                    <h4 className="font-extrabold text-white text-sm flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[11px] font-bold">3</span>
                      <span>Phone Number ID এবং Token কপি করুন</span>
                    </h4>
                    <p className="text-neutral-400 pl-7 text-[11px]">
                      <strong>API Setup</strong> পেজে যান। সেখানে প্রদত্ত <strong>Phone Number ID</strong> এবং <strong>Temporary Access Token</strong> (বা System User Permanent Token) কপি করে OrderFlow BD-এর ফর্মে বসিয়ে সেভ করুন।
                    </p>
                  </div>

                  <div className="p-3.5 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-2">
                    <h4 className="font-extrabold text-white text-sm flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[11px] font-bold">4</span>
                      <span>Webhook ও সাবস্ক্রিপশন সম্পন্ন করুন</span>
                    </h4>
                    <div className="pl-7 space-y-2 text-[11px]">
                      <p className="text-neutral-400">
                        Meta-র <strong>WhatsApp &gt; Configuration</strong> সেকশনে Edit Webhook এ নিচের তথ্য দিন:
                      </p>
                      <div className="p-2 bg-neutral-950 rounded-lg border border-neutral-800 font-mono text-[10px] space-y-1">
                        <div>
                          <span className="text-neutral-400">Callback URL:</span>{' '}
                          <span className="text-emerald-400">{webhookUrl}</span>
                        </div>
                        <div>
                          <span className="text-neutral-400">Verify Token:</span>{' '}
                          <span className="text-emerald-400">{verifyToken}</span>
                        </div>
                      </div>
                      <p className="text-emerald-400 font-medium">
                        Verify and Save করার পর Webhook fields থেকে <strong>messages</strong> ফিল্ডটি <strong>Subscribe</strong> করুন। ব্যাস, সেলস বট স্বয়ংক্রিয়ভাবে সক্রিয় হয়ে যাবে!
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= SEND LIVE TEST WHATSAPP MESSAGE MODAL ================= */}
      {showTestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-[#10131d] border border-neutral-800/90 rounded-3xl p-6 shadow-2xl overflow-hidden space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-black text-sm text-white">লাইভ WhatsApp টেস্ট মেসেজ</h4>
                  <p className="text-[11px] text-neutral-400">আপনার নম্বরে সরাসরি মেসেজ পাঠিয়ে সংযোগ পরীক্ষা করুন</p>
                </div>
              </div>

              <button
                onClick={() => setShowTestModal(false)}
                className="p-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendTestMessage} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-neutral-200 block mb-1">
                  প্রাপকের WhatsApp মোবাইল নম্বর:
                </label>
                <input
                  type="text"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  placeholder="017XXXXXXXX"
                  className="w-full bg-[#0a0c12] border border-neutral-750 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-neutral-100 font-mono outline-none"
                />
                <p className="text-[10px] text-neutral-500 mt-1">
                  নোট: মেটা স্যান্ডবক্স ট্রায়াল নম্বরে মেসেজ পাঠাতে নম্বরটি প্রথমে মেটা কনসোলে "To" লিস্টে যোগ করতে হয়।
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-200 block mb-1">
                  টেস্ট মেসেজের বিবরণ:
                </label>
                <textarea
                  rows={3}
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  className="w-full bg-[#0a0c12] border border-neutral-750 focus:border-emerald-500 rounded-xl p-2.5 text-xs text-neutral-100 resize-none outline-none leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={isSendingTest}
                className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {isSendingTest ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>মেসেজ পাঠানো হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>মেসেজ সেন্ড করুন</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
