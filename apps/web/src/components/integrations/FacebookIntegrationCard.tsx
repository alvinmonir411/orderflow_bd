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
  ArrowRightLeft,
} from 'lucide-react';
import { toast } from 'sonner';
import { loginWithFacebookPopup, loadFacebookSdk } from '@/lib/facebook-sdk';

interface DiscoveredPage {
  id: string;
  name: string;
  category?: string;
  picture?: string;
  pageToken?: string;
}

interface FacebookStatus {
  connected: boolean;
  pageId?: string;
  pageName?: string;
  isValidToken?: boolean;
  webhookSubscribed?: boolean;
  subscribedFields?: string[];
  webhookUrl?: string;
  verifyToken?: string;
}

interface FacebookIntegrationCardProps {
  onStatusChange?: () => void;
}

export const FacebookIntegrationCard: React.FC<FacebookIntegrationCardProps> = ({ onStatusChange }) => {
  const [status, setStatus] = useState<FacebookStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isLoggingInFb, setIsLoggingInFb] = useState(false);
  const [showDevSettings, setShowDevSettings] = useState(false);

  // Connect Modal State
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [connectTab, setConnectTab] = useState<'popup' | 'token' | 'manual'>('popup');
  const [inputToken, setInputToken] = useState('');
  const [manualPageId, setManualPageId] = useState('');
  const [manualPageToken, setManualPageToken] = useState('');
  const [manualPageName, setManualPageName] = useState('');
  const [isInspecting, setIsInspecting] = useState(false);
  const [isConnectingPage, setIsConnectingPage] = useState<string | null>(null);
  const [discoveredPages, setDiscoveredPages] = useState<DiscoveredPage[]>([]);
  const [showGuide, setShowGuide] = useState(false);

  const fetchStatus = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/facebook/status');
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch (err) {
      console.error('Failed to fetch Facebook status:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    loadFacebookSdk().catch(() => {});
  }, []);

  const handleRefreshStatus = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/facebook/status');
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
        if (data.connected && data.webhookSubscribed) {
          toast.success('🎉 ফেসবুক পেজ ও মেসেঞ্জার বট সম্পূর্ণ সক্রিয় রয়েছে!');
        } else if (data.connected) {
          toast.success(`ফেসবুক পেজ '${data.pageName || 'Facebook Page'}' কানেক্টেড আছে`);
        } else {
          toast.info('কোনো ফেসবুক পেজ কানেক্ট করা নেই');
        }
      }
    } catch (err) {
      toast.error('স্ট্যাটাস রিফ্রেশ করতে সমস্যা হয়েছে');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} ক্লিপবোর্ডে কপি হয়েছে!`);
  };

  // 1-CLICK POPUP FACEBOOK LOGIN (NON-TECHNICAL USERS)
  const handleFacebookLoginPopup = async () => {
    setIsLoggingInFb(true);
    try {
      toast.info('ফেসবুক লগইন উইন্ডো ওপেন হচ্ছে...');
      const loginRes = await loginWithFacebookPopup();

      if (!loginRes.success || !loginRes.accessToken) {
        toast.error(loginRes.error || 'ফেসবুক লগইন সম্পন্ন হয়নি');
        return;
      }

      toast.info('আপনার পেজসমূহ লোড হচ্ছে...');

      // Send token to inspect
      const res = await fetch('/api/facebook/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'inspect_token',
          token: loginRes.accessToken,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.pages && data.pages.length > 0) {
        setDiscoveredPages(data.pages);
        setShowConnectModal(true);
        setConnectTab('popup');
        toast.success(`🎉 ${data.pages.length}টি পেজ পাওয়া গেছে! নিচে আপনার পছন্দের পেজটি সিলেক্ট করে কানেক্ট করুন।`);
      } else {
        toast.error(data.error || 'কোনো পেজ খুঁজে পাওয়া যায়নি। পেজের এডমিন এক্সেস নিশ্চিত করুন।');
        setShowConnectModal(true);
        setConnectTab('popup');
      }
    } catch (err) {
      console.error('[Facebook 1-Click Login Error]:', err);
      toast.error('ফেসবুক লগইনে সমস্যা হয়েছে');
    } finally {
      setIsLoggingInFb(false);
    }
  };

  const handleInspectToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputToken.trim()) {
      toast.error('অনুগ্রহ করে আপনার ফেসবুক টোকেন পেস্ট করুন');
      return;
    }

    setIsInspecting(true);
    setDiscoveredPages([]);
    try {
      const res = await fetch('/api/facebook/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'inspect_token',
          token: inputToken.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.pages && data.pages.length > 0) {
        setDiscoveredPages(data.pages);
        toast.success(`🎉 ${data.pages.length}টি ফেসবুক পেজ পাওয়া গেছে!`);
      } else {
        toast.error(data.error || 'টোকেন দিয়ে কোনো পেজ পাওয়া যায়নি। টোকেনের পারমিশন চেক করুন।');
      }
    } catch (err) {
      toast.error('সার্ভারে যোগাযোগ করতে সমস্যা হয়েছে');
    } finally {
      setIsInspecting(false);
    }
  };

  const handleConnectSelectedPage = async (page: DiscoveredPage) => {
    setIsConnectingPage(page.id);
    try {
      const res = await fetch('/api/facebook/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'connect_page',
          pageId: page.id,
          pageToken: page.pageToken || inputToken.trim(),
          pageName: page.name,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`🎉 '${page.name}' পেজটি সফলভাবে কানেক্ট ও সাবস্ক্রাইব হয়েছে!`);
        setShowConnectModal(false);
        setInputToken('');
        setDiscoveredPages([]);
        await fetchStatus();
        if (onStatusChange) onStatusChange();
      } else {
        toast.error(data.error || 'পেজ কানেক্ট করতে সমস্যা হয়েছে');
      }
    } catch (err) {
      toast.error('সার্ভারে সমস্যা হয়েছে');
    } finally {
      setIsConnectingPage(null);
    }
  };

  const handleManualConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualPageId.trim() || !manualPageToken.trim()) {
      toast.error('দয়া করে Page ID এবং Page Token লিখুন');
      return;
    }

    setIsConnectingPage('manual');
    try {
      const res = await fetch('/api/facebook/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'connect_page',
          pageId: manualPageId.trim(),
          pageToken: manualPageToken.trim(),
          pageName: manualPageName.trim() || 'Facebook Page',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('🎉 ফেসবুক পেজ সফলভাবে সেভ ও সাবস্ক্রাইব হয়েছে!');
        setShowConnectModal(false);
        setManualPageId('');
        setManualPageToken('');
        setManualPageName('');
        await fetchStatus();
        if (onStatusChange) onStatusChange();
      } else {
        toast.error(data.error || 'সেভ করতে সমস্যা হয়েছে');
      }
    } catch (err) {
      toast.error('সার্ভারে সমস্যা হয়েছে');
    } finally {
      setIsConnectingPage(null);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('আপনি কি নিশ্চিত যে ফেসবুক পেজ ডিসকানেক্ট করতে চান?')) return;

    setIsDisconnecting(true);
    try {
      const res = await fetch('/api/facebook/disconnect', { method: 'POST' });
      if (res.ok) {
        toast.success('ফেসবুক পেজ সফলভাবে ডিসকানেক্ট করা হয়েছে');
        await fetchStatus();
        if (onStatusChange) onStatusChange();
      }
    } catch (err) {
      toast.error('ডিসকানেক্ট করতে সমস্যা হয়েছে');
    } finally {
      setIsDisconnecting(false);
    }
  };

  const isConnected = Boolean(status?.connected && status?.pageId);

  return (
    <>
      <div className="bg-[#10121a] border border-neutral-800/90 rounded-3xl p-6 sm:p-7 space-y-5 shadow-xl flex flex-col justify-between relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-4 relative z-10">
          {/* Card Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-600/30">
                f
              </div>
              <div>
                <h3 className="font-extrabold text-neutral-100 text-base sm:text-lg flex items-center gap-2">
                  <span>Facebook Page & Messenger Bot</span>
                </h3>
                <p className="text-xs text-neutral-400">মেটা বিজনেস, মেসেঞ্জার অটোমেশন ও অটো-অর্ডার সিঙ্ক</p>
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
              {/* Connected Page Details Box */}
              <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-950/30 via-neutral-900/90 to-neutral-900 border border-blue-500/30 rounded-2xl space-y-3.5 shadow-lg">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-black text-lg shadow-inner">
                      {status?.pageName?.charAt(0) || 'F'}
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-neutral-400">কানেক্টেড ফেসবুক পেজ:</p>
                      <h4 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                        <span className="text-emerald-300 font-extrabold">
                          {status?.pageName && status.pageName !== 'Facebook Page'
                            ? status.pageName
                            : status?.pageId === '443213442199594'
                            ? 'FastLain'
                            : (status?.pageName || 'Facebook Page')}
                        </span>
                      </h4>
                      <div className="flex items-center gap-2 pt-0.5">
                        <span className="px-2.5 py-0.5 bg-neutral-950 border border-neutral-750 text-neutral-300 font-mono text-xs rounded-lg font-bold">
                          Page ID: {status?.pageId}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setShowConnectModal(true);
                        setConnectTab('popup');
                      }}
                      className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5 shadow-md shadow-blue-600/20"
                      title="অন্য পেজ নির্বাচন করুন"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>পেজ পরিবর্তন</span>
                    </button>
                    <button
                      onClick={handleRefreshStatus}
                      disabled={isRefreshing}
                      className="px-3 py-2 bg-neutral-800 hover:bg-neutral-750 text-neutral-200 border border-neutral-700 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5 shadow-sm"
                      title="লাইভ কানেকশন চেক করুন"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                      <span>{isRefreshing ? 'যাচাই...' : 'টেস্ট'}</span>
                    </button>
                    <button
                      onClick={handleDisconnect}
                      disabled={isDisconnecting}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/15 border border-red-500/25 rounded-xl text-xs transition-all active:scale-95 shadow-sm"
                      title="পেজ ডিসকানেক্ট করুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Subscribed Webhook Badges */}
                <div className="pt-2.5 border-t border-neutral-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-400 text-[11px] font-medium">মেসেঞ্জার বট:</span>
                    <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] font-medium rounded-lg flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>অটো-রিপ্লাই ও লাইভ চ্যাট সক্রিয়</span>
                    </span>
                  </div>

                  <span className="text-[11px] text-neutral-400">
                    সব মেসেজ স্বয়ংক্রিয়ভাবে প্রসেস হচ্ছে
                  </span>
                </div>
              </div>

              {/* Developer Settings Collapsible Accordion */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowDevSettings(!showDevSettings)}
                  className="w-full flex items-center justify-between text-[11px] font-medium text-neutral-400 hover:text-neutral-200 py-1.5 px-3 bg-neutral-900/60 hover:bg-neutral-900 border border-neutral-800/80 rounded-xl transition-all"
                >
                  <span className="flex items-center gap-1.5 text-neutral-300">
                    <Settings className="w-3.5 h-3.5 text-blue-400" />
                    <span>অ্যাডভান্সড ডেভেলপার সেটিংস (ঐচ্ছিক - কোনো কিছু বসানোর প্রয়োজন নেই)</span>
                  </span>
                  {showDevSettings ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {showDevSettings && (
                  <div className="mt-2.5 p-3.5 bg-neutral-950/90 border border-neutral-800 rounded-2xl space-y-2.5 text-xs animate-in fade-in duration-200">
                    <div className="flex items-center gap-1.5 text-emerald-400 text-[11px] pb-1 border-b border-neutral-850 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>আপনার পেজে স্বয়ংক্রিয়ভাবে চ্যাটবট সাবস্ক্রাইব করা হয়েছে। কোনো টেকনিক্যাল সেটিংস পরিবর্তন করতে হবে না।</span>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-neutral-300 font-bold text-[11px]">Meta Webhook Callback URL:</span>
                        <button
                          type="button"
                          onClick={() => handleCopyText(status?.webhookUrl || 'https://orderflowbd.vercel.app/webhooks/facebook', 'Webhook URL')}
                          className="px-2 py-0.5 bg-neutral-800 hover:bg-neutral-750 text-neutral-200 border border-neutral-700 rounded-md text-[10px] font-bold flex items-center gap-1 shadow-sm active:scale-95 transition-all"
                        >
                          <Copy className="w-2.5 h-2.5" />
                          <span>কপি</span>
                        </button>
                      </div>
                      <p className="text-[11px] font-mono text-emerald-400 bg-neutral-900/90 px-2.5 py-1.5 rounded-lg border border-neutral-800 break-all select-all">
                        {status?.webhookUrl || 'https://orderflowbd.vercel.app/webhooks/facebook'}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-neutral-300 font-bold text-[11px]">Verify Token:</span>
                        <button
                          type="button"
                          onClick={() => handleCopyText(status?.verifyToken || 'orderflow_bd_verify_token', 'Verify Token')}
                          className="px-2 py-0.5 bg-neutral-800 hover:bg-neutral-750 text-neutral-200 border border-neutral-700 rounded-md text-[10px] font-bold flex items-center gap-1 shadow-sm active:scale-95 transition-all"
                        >
                          <Copy className="w-2.5 h-2.5" />
                          <span>কপি</span>
                        </button>
                      </div>
                      <p className="text-[11px] font-mono text-emerald-400 bg-neutral-900/90 px-2.5 py-1.5 rounded-lg border border-neutral-800 break-all select-all">
                        {status?.verifyToken || 'orderflow_bd_verify_token'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-5 bg-neutral-900/80 border border-neutral-800 rounded-2xl space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center text-blue-400 shrink-0 mt-0.5 shadow-sm">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-neutral-100">১-ক্লিক নো-কোড ফেসবুক পেজ কানেক্ট</h4>
                  <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                    নিচের <strong>"Continue with Facebook"</strong> বাটনে চাপ দিয়ে আপনার যেকোনো পেজ নির্বাচন করুন। কোনো টোকেন কপি করা ছাড়াই সিস্টেম স্বয়ংক্রিয়ভাবে চ্যাটবট সক্রিয় করে দিবে।
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
                onClick={handleFacebookLoginPopup}
                disabled={isLoggingInFb}
                className="w-full py-3 bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold text-xs rounded-2xl shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                {isLoggingInFb ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>পেজ লোড হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <span className="font-bold text-base leading-none">f</span>
                    <span>পেজ পরিবর্তন / সিলেক্ট করুন</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setShowConnectModal(true);
                  setConnectTab('popup');
                }}
                className="w-full py-3 bg-neutral-800 hover:bg-neutral-750 text-neutral-200 hover:text-white border border-neutral-700 font-bold text-xs rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Layers className="w-3.5 h-3.5 text-blue-400" />
                <span>পেজ তালিকা ও বিকল্প অপশন</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <button
                onClick={handleFacebookLoginPopup}
                disabled={isLoggingInFb}
                className="w-full py-3.5 bg-gradient-to-r from-[#1877F2] via-[#1b6fd8] to-[#145fc2] hover:from-[#166fe5] hover:to-[#1255af] text-white font-black text-sm rounded-2xl shadow-xl shadow-blue-500/25 active:scale-95 transition-all flex items-center justify-center gap-2.5"
              >
                {isLoggingInFb ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>ফেসবুক পেজ লোড হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <span className="font-black text-lg leading-none">f</span>
                    <span>Continue with Facebook (১-ক্লিক কানেক্ট)</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setShowConnectModal(true);
                  setConnectTab('token');
                }}
                className="w-full py-2 text-neutral-400 hover:text-neutral-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Key className="w-3.5 h-3.5 text-neutral-500" />
                <span>টোকেন বা ম্যানুয়াল পেজ আইডি দিয়ে কানেক্ট করতে চাইলে এখানে ক্লিক করুন</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ================= CONNECT / SWITCH FACEBOOK PAGE MODAL ================= */}
      {showConnectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-[#10131d] border border-neutral-800/90 rounded-3xl p-6 sm:p-7 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800/80 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-lg shadow-md shadow-blue-600/30">
                  f
                </div>
                <div>
                  <h3 className="text-lg font-black text-neutral-100">ফেসবুক পেজ নির্বাচন করুন</h3>
                  <p className="text-xs text-neutral-400">আপনার যেকোনো ফেসবুক পেজ সিলেক্ট করে ১-ক্লিকে চ্যাটবট কানেক্ট করুন</p>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowConnectModal(false);
                }}
                className="p-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-xl transition-all"
              >
                ✕
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="grid grid-cols-3 gap-1.5 my-4 relative z-10 p-1 bg-neutral-900/90 border border-neutral-800 rounded-2xl text-xs font-bold">
              <button
                onClick={() => setConnectTab('popup')}
                className={`py-2 px-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  connectTab === 'popup'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>১-ক্লিক পেজসমূহ</span>
              </button>
              <button
                onClick={() => setConnectTab('token')}
                className={`py-2 px-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  connectTab === 'token'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Key className="w-3.5 h-3.5" />
                <span>টোকেন ডিটেক্টর</span>
              </button>
              <button
                onClick={() => setConnectTab('manual')}
                className={`py-2 px-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  connectTab === 'manual'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>ম্যানুয়াল এন্ট্রি</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto py-1 relative z-10 space-y-4">
              {/* TAB 1: 1-CLICK FACEBOOK POPUP LOGIN & PAGE PICKER */}
              {connectTab === 'popup' && (
                <div className="space-y-4">
                  {/* Discovered Pages List */}
                  {discoveredPages.length > 0 ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-neutral-200 flex items-center gap-1.5">
                          <Layers className="w-4 h-4 text-emerald-400" />
                          <span>আপনার পেজসমূহ ({discoveredPages.length}টি পাওয়া গেছে):</span>
                        </p>

                        <button
                          type="button"
                          onClick={handleFacebookLoginPopup}
                          disabled={isLoggingInFb}
                          className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 transition-colors"
                        >
                          <RefreshCw className={`w-3 h-3 ${isLoggingInFb ? 'animate-spin' : ''}`} />
                          <span>রি-স্ক্যান / অন্য একাউন্ট</span>
                        </button>
                      </div>

                      <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                        {discoveredPages.map((page) => {
                          const isCurrentActive = status?.pageId === page.id;

                          return (
                            <div
                              key={page.id}
                              className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                                isCurrentActive
                                  ? 'bg-gradient-to-r from-emerald-950/40 via-neutral-900 to-neutral-900 border-emerald-500/50 shadow-md'
                                  : 'bg-neutral-900/90 border-neutral-800 hover:border-blue-500/50 hover:bg-neutral-850/80'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-black text-base shrink-0 shadow-sm overflow-hidden">
                                  {page.picture ? (
                                    <img src={page.picture} alt={page.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <span>{page.name.charAt(0)}</span>
                                  )}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="text-sm font-extrabold text-neutral-100">{page.name}</h4>
                                    {isCurrentActive && (
                                      <span className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold rounded-md">
                                        সক্রিয় পেজ
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] font-mono text-neutral-400 mt-0.5">
                                    Page ID: <span className="text-neutral-300 font-medium">{page.id}</span>
                                    {page.category ? ` • ${page.category}` : ''}
                                  </p>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleConnectSelectedPage(page)}
                                disabled={isConnectingPage === page.id}
                                className={`px-4 py-2.5 text-xs font-black rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5 shrink-0 ${
                                  isCurrentActive
                                    ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700'
                                    : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/20'
                                }`}
                              >
                                {isConnectingPage === page.id ? (
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
                                    <span>⚡ এই পেজটি কানেক্ট করুন</span>
                                  </>
                                )}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 bg-gradient-to-r from-blue-950/40 via-neutral-900 to-neutral-900 border border-blue-500/30 rounded-2xl space-y-4 text-center">
                      <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 mx-auto shadow-inner">
                        <Sparkles className="w-7 h-7" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-base font-extrabold text-neutral-100">
                          ফেসবুক লগইন করে পেজ সিলেক্ট করুন
                        </h4>
                        <p className="text-xs text-neutral-300 leading-relaxed max-w-md mx-auto">
                          নিচের বাটনে চাপ দিলে আপনার ফেসবুক পেজসমূহের লিস্ট আসবে। সেখান থেকে আপনি যেকোনো পেজ সিলেক্ট করে কানেক্ট করতে পারবেন।
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleFacebookLoginPopup}
                        disabled={isLoggingInFb}
                        className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm rounded-2xl shadow-xl shadow-blue-500/25 active:scale-95 transition-all flex items-center justify-center gap-2.5"
                      >
                        {isLoggingInFb ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>ফেসবুক লগইন উইন্ডো লোড হচ্ছে...</span>
                          </>
                        ) : (
                          <>
                            <span className="font-bold text-lg leading-none">f</span>
                            <span>Continue with Facebook</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: TOKEN INSPECTOR */}
              {connectTab === 'token' && (
                <div className="space-y-4">
                  <form onSubmit={handleInspectToken} className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-neutral-200 flex items-center gap-1.5">
                          <Key className="w-3.5 h-3.5 text-blue-400" />
                          <span>ফেসবুক অ্যাক্সেস টোকেন দিন</span>
                        </label>
                        <a
                          href="https://developers.facebook.com/tools/explorer"
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-blue-400 hover:underline flex items-center gap-1"
                        >
                          Graph API Explorer ➔
                        </a>
                      </div>
                      <textarea
                        rows={3}
                        value={inputToken}
                        onChange={(e) => setInputToken(e.target.value)}
                        placeholder="EAAZAdxz..."
                        className="w-full bg-[#0a0c12] border border-neutral-750 focus:border-blue-500 rounded-2xl p-3 text-xs text-neutral-100 font-mono resize-none outline-none shadow-inner"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isInspecting || !inputToken.trim()}
                      className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      {isInspecting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>পেজ খোঁজা হচ্ছে ও টোকেন ভেরিফাই হচ্ছে...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4" />
                          <span>🔍 পেজ খুঁজুন ও ভেরিফাই করুন</span>
                        </>
                      )}
                    </button>
                  </form>

                  {/* Discovered Pages List from Token */}
                  {discoveredPages.length > 0 && (
                    <div className="space-y-2.5 pt-2">
                      <p className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-emerald-400" />
                        <span>পাওয়া গেছে এমন পেজ সমূহ ({discoveredPages.length}টি):</span>
                      </p>

                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {discoveredPages.map((page) => (
                          <div
                            key={page.id}
                            className="p-3.5 bg-neutral-900/90 border border-neutral-800 hover:border-blue-500/50 rounded-2xl flex items-center justify-between gap-3 transition-all"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-sm">
                                {page.name.charAt(0)}
                              </div>
                              <div>
                                <h4 className="text-sm font-extrabold text-neutral-100">{page.name}</h4>
                                <p className="text-[11px] font-mono text-neutral-400">
                                  ID: {page.id} {page.category ? `• ${page.category}` : ''}
                                </p>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleConnectSelectedPage(page)}
                              disabled={isConnectingPage === page.id}
                              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5 shrink-0"
                            >
                              {isConnectingPage === page.id ? (
                                <>
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                  <span>কানেক্ট হচ্ছে...</span>
                                </>
                              ) : (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  <span>⚡ কানেক্ট করুন</span>
                                </>
                              )}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step Guide Accordion */}
                  <div className="border-t border-neutral-850 pt-3">
                    <button
                      type="button"
                      onClick={() => setShowGuide(!showGuide)}
                      className="w-full flex items-center justify-between text-xs text-neutral-400 hover:text-neutral-200 py-1"
                    >
                      <span className="flex items-center gap-1.5 font-semibold text-blue-400">
                        <Info className="w-3.5 h-3.5" />
                        <span>টোকেন কিভাবে পাবেন? (১৫ সেকেন্ডের সহজ নিয়ম)</span>
                      </span>
                      {showGuide ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>

                    {showGuide && (
                      <div className="mt-2.5 p-3.5 bg-neutral-950/80 border border-neutral-800 rounded-2xl text-[11px] text-neutral-300 space-y-2 leading-relaxed">
                        <p>
                          ১. <a href="https://developers.facebook.com/tools/explorer" target="_blank" rel="noreferrer" className="text-blue-400 underline font-bold">Meta Graph API Explorer</a> লিংকে যান।
                        </p>
                        <p>
                          ২. উপরে <strong>Meta App</strong> নির্বাচন করুন (যেমন: <code className="text-emerald-400">orderflow</code>)।
                        </p>
                        <p>
                          ৩. <strong>User or Page</strong> ড্রপডাউন থেকে আপনার পেজ সিলেক্ট করুন অথবা <strong>Generate Access Token</strong> বাটনে চাপ দিন।
                        </p>
                        <p>
                          ৪. এরপর টোকেনটি কপি করে উপরের বক্সে পেস্ট করে <strong>"🔍 পেজ খুঁজুন ও ভেরিফাই করুন"</strong> চাপুন।
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: MANUAL PAGE ID & TOKEN */}
              {connectTab === 'manual' && (
                <form onSubmit={handleManualConnect} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1">
                      Facebook Page Name (পেজের নাম)
                    </label>
                    <input
                      type="text"
                      value={manualPageName}
                      onChange={(e) => setManualPageName(e.target.value)}
                      placeholder="আপনার পেজের নাম লিখুন"
                      className="w-full bg-[#0a0c12] border border-neutral-750 rounded-xl px-4 py-2.5 text-xs text-neutral-100 font-sans focus:outline-none focus:border-blue-500 shadow-inner"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1">
                      Facebook Page ID
                    </label>
                    <input
                      type="text"
                      value={manualPageId}
                      onChange={(e) => setManualPageId(e.target.value)}
                      placeholder="যেমন: 443213442199594"
                      className="w-full bg-[#0a0c12] border border-neutral-750 rounded-xl px-4 py-2.5 text-xs text-neutral-100 font-mono focus:outline-none focus:border-blue-500 shadow-inner"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1">
                      Facebook Page Access Token (EAA...)
                    </label>
                    <textarea
                      rows={3}
                      value={manualPageToken}
                      onChange={(e) => setManualPageToken(e.target.value)}
                      placeholder="EAAZAdxz..."
                      className="w-full bg-[#0a0c12] border border-neutral-750 rounded-xl p-3 text-xs text-neutral-100 font-mono focus:outline-none focus:border-blue-500 shadow-inner resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isConnectingPage === 'manual'}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    {isConnectingPage === 'manual' ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>সেভ ও সাবস্ক্রাইব হচ্ছে...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>পেজ কানেক্ট ও সেভ করুন</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
