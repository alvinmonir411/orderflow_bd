'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Smartphone,
  CheckCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
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

  // 1. LIVE QR CODE MODAL STATE (PRIMARY EXPERIENCE)
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrCodeImage, setQrCodeImage] = useState<string | null>(null);
  const [qrStatus, setQrStatus] = useState<'LOADING' | 'READY' | 'CONNECTED' | 'SETUP_NEEDED' | 'ERROR'>('LOADING');
  const [qrMessage, setQrMessage] = useState('QR কোড জেনারেট হচ্ছে...');
  const [qrInstanceInput, setQrInstanceInput] = useState('');
  const [qrTokenInput, setQrTokenInput] = useState('');
  const [isSavingQrCreds, setIsSavingQrCreds] = useState(false);
  const [showQrConfigForm, setShowQrConfigForm] = useState(false);
  const pollTimerRef = useRef<any>(null);

  // 2. Meta / Advanced Modal State
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState<'meta' | 'guide'>('meta');
  const [discoveredNumbers, setDiscoveredNumbers] = useState<DiscoveredNumber[]>([]);
  const [isConnectingNumber, setIsConnectingNumber] = useState<string | null>(null);
  const [isLoggingInFb, setIsLoggingInFb] = useState(false);

  // Meta Form Inputs
  const [metaPhoneId, setMetaPhoneId] = useState('');
  const [metaToken, setMetaToken] = useState('');
  const [metaPhone, setMetaPhone] = useState('');
  const [metaBusinessId, setMetaBusinessId] = useState('');
  const [isSavingMeta, setIsSavingMeta] = useState(false);

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
        if (data.instanceId) {
          setQrInstanceInput(data.instanceId);
        }
      }
    } catch (err) {
      console.error('Failed to fetch WhatsApp status:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, []);

  // Poll QR Code and Connection State
  const fetchQrCode = async () => {
    try {
      const res = await fetch('/api/whatsapp/qr');
      const data = await res.json();

      if (data.status === 'CONNECTED') {
        setQrStatus('CONNECTED');
        setQrMessage(`🎉 সংযুক্ত হয়েছে: ${data.phone || 'WhatsApp'}`);
        try {
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        } catch {}
        toast.success(`🎉 WhatsApp (${data.phone}) সফলভাবে সংযুক্ত হয়েছে!`);
        if (pollTimerRef.current) clearInterval(pollTimerRef.current);
        await fetchStatus();
        if (onStatusChange) onStatusChange();
        setTimeout(() => setShowQrModal(false), 2500);
        return;
      }

      if (data.status === 'SCAN_QR_CODE' && data.qrCode) {
        setQrStatus('READY');
        setQrCodeImage(data.qrCode);
        setQrMessage('লাইভ QR কোড প্রস্তুত। WhatsApp অ্যাপের Linked Devices দিয়ে স্ক্যান করুন।');
        return;
      }

      if (data.status === 'SETUP_NEEDED') {
        setQrStatus('SETUP_NEEDED');
        setShowQrConfigForm(true);
        setQrMessage('WAAPI Instance আইডি ও টোকেন দিয়ে QR স্ক্যান চালু করুন।');
        return;
      }

      if (data.status === 'WAITING_FOR_QR') {
        setQrStatus('LOADING');
        setQrMessage(data.message || 'QR কোড তৈরি হচ্ছে...');
      }
    } catch {
      setQrStatus('ERROR');
      setQrMessage('QR কোড লোড করতে সাময়িক সমস্যা হয়েছে');
    }
  };

  const handleOpenQrModal = () => {
    setShowQrModal(true);
    setQrStatus('LOADING');
    setQrCodeImage(null);
    setShowQrConfigForm(false);
    fetchQrCode();

    if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    pollTimerRef.current = setInterval(() => {
      fetchQrCode();
    }, 3500);
  };

  const handleCloseQrModal = () => {
    setShowQrModal(false);
    if (pollTimerRef.current) clearInterval(pollTimerRef.current);
  };

  const handleSaveQrCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrInstanceInput.trim() || !qrTokenInput.trim()) {
      toast.error('দয়া করে Instance ID এবং API Token উভয়ই লিখুন');
      return;
    }

    setIsSavingQrCreds(true);
    try {
      const res = await fetch('/api/whatsapp/qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instanceId: qrInstanceInput.trim(),
          token: qrTokenInput.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('ক্রেডেনশিয়াল সেভ হয়েছে! QR কোড তৈরি হচ্ছে...');
        setShowQrConfigForm(false);
        setQrStatus('LOADING');
        await fetchQrCode();
      } else {
        toast.error(data.error || 'সেভ করতে সমস্যা হয়েছে');
      }
    } catch {
      toast.error('সার্ভারে যোগাযোগ করতে ব্যর্থ হয়েছে');
    } finally {
      setIsSavingQrCreds(false);
    }
  };

  const handleRefreshStatus = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/whatsapp/status');
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
        if (data.connected) {
          toast.success(`🎉 WhatsApp (${data.displayPhoneNumber || data.phone || 'Business'}) সক্রিয় রয়েছে!`);
        } else {
          toast.info('কোনো WhatsApp নম্বর কানেক্ট করা নেই');
        }
      }
    } catch {
      toast.error('স্ট্যাটাস রিফ্রেশ করতে সমস্যা হয়েছে');
    } finally {
      setIsRefreshing(false);
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
                  <span>WhatsApp Web & Bot Integration</span>
                </h3>
                <p className="text-xs text-neutral-400">১-ক্লিকে QR স্ক্যান করে সাধারণ যেকোনো মোবাইল WhatsApp যুক্ত করুন</p>
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
                          {status?.provider === 'WAAPI' ? 'WhatsApp Web (QR)' : 'Meta Cloud API'}
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
                        <span className="text-xs text-neutral-400">
                          মোবাইল থেকে সরাসরি যুক্ত • কোনো জটিলতা ছাড়া
                        </span>
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

                {/* Status Badges */}
                <div className="pt-2.5 border-t border-neutral-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-400 text-[11px] font-medium">সেলস বট স্ট্যাটাস:</span>
                    <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] font-medium rounded-lg flex items-center gap-1">
                      <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>২৪/৭ স্বয়ংক্রিয় এআই উত্তর ও অর্ডার বুকিং সক্রিয়</span>
                    </span>
                  </div>

                  <span className="text-[11px] text-neutral-400">
                    কাস্টমার মেসেজ দিলেই এআই উত্তর দেবে
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-5 bg-neutral-900/80 border border-neutral-800 rounded-2xl space-y-3">
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5 shadow-sm">
                  <QrCode className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-neutral-100">WhatsApp Web-এর মতো সহজ স্ক্যান</h4>
                  <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                    কোনো মেটা ডেভেলপার অ্যাকাউন্ট বা ভেরিফিকেশনের প্রয়োজন নেই। নিচের বাটনে চাপ দিয়ে স্ক্রিনের <strong>QR Code</strong> আপনার মোবাইলের WhatsApp দিয়ে স্ক্যান করলেই ৩ সেকেন্ডে কানেক্ট হয়ে যাবে!
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
                onClick={handleOpenQrModal}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-2xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <QrCode className="w-4 h-4" />
                <span>পুনরায় QR স্ক্যান / পরিবর্তন</span>
              </button>

              <button
                onClick={() => setShowTestModal(true)}
                className="w-full py-3 bg-neutral-800 hover:bg-neutral-750 text-neutral-200 hover:text-white border border-neutral-700 font-bold text-xs rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5 text-emerald-400" />
                <span>লাইভ টেস্ট মেসেজ পাঠান</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* HERO PRIMARY ACTION: 1-CLICK QR SCAN */}
              <button
                onClick={handleOpenQrModal}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-neutral-950 font-black text-xs sm:text-sm rounded-2xl shadow-xl shadow-emerald-500/25 active:scale-95 transition-all flex items-center justify-center gap-2.5"
              >
                <QrCode className="w-5 h-5 text-neutral-950" />
                <span>📲 QR কোড স্ক্যান করে WhatsApp কানেক্ট করুন</span>
              </button>

              {/* SECONDARY ACTION: ADVANCED META CLOUD */}
              <button
                onClick={() => {
                  setShowConnectModal(true);
                  setActiveModalTab('meta');
                }}
                className="w-full py-3.5 bg-neutral-800 hover:bg-neutral-750 text-neutral-200 hover:text-white border border-neutral-700 font-bold text-xs sm:text-sm rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg"
              >
                <Settings className="w-4 h-4 text-emerald-400" />
                <span>অ্যাডভান্সড / Meta ক্লাউড অপশন</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* =========================================================
          1. LIVE WHATSAPP WEB QR CODE SCANNER MODAL (HERO EXPERIENCE)
          ========================================================= */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-[#0e111a] border border-emerald-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl overflow-hidden flex flex-col space-y-5">
            {/* Ambient Glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-black shadow-md shadow-emerald-600/30">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-neutral-100">WhatsApp Web QR কোড স্ক্যান করুন</h3>
                  <p className="text-xs text-neutral-400">মোবাইল দিয়ে স্ক্যান করেই সরাসরি এআই চ্যাটবট চালু করুন</p>
                </div>
              </div>

              <button
                onClick={handleCloseQrModal}
                className="p-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-xl transition-all"
              >
                ✕
              </button>
            </div>

            {/* QR Scanner Display Area */}
            <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-4 py-2">
              {/* QR Container Frame */}
              <div className="relative p-4 bg-white rounded-3xl shadow-2xl border-4 border-emerald-500/40 flex items-center justify-center w-64 h-64 sm:w-72 sm:h-72">
                {qrStatus === 'CONNECTED' ? (
                  <div className="flex flex-col items-center justify-center space-y-2 text-emerald-600">
                    <CheckCircle2 className="w-16 h-16 animate-bounce" />
                    <span className="font-extrabold text-sm text-neutral-900">সফলভাবে কানেক্ট হয়েছে!</span>
                  </div>
                ) : qrCodeImage ? (
                  <img
                    src={
                      qrCodeImage.startsWith('data:')
                        ? qrCodeImage
                        : qrCodeImage.startsWith('http')
                        ? qrCodeImage
                        : `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(
                            qrCodeImage
                          )}`
                    }
                    alt="WhatsApp Web QR Code"
                    className="w-full h-full object-contain rounded-xl"
                  />
                ) : qrStatus === 'SETUP_NEEDED' && !qrCodeImage ? (
                  <div className="flex flex-col items-center justify-center space-y-2 text-neutral-800 p-2">
                    <QrCode className="w-12 h-12 text-emerald-600" />
                    <p className="text-xs font-bold text-neutral-700">QR কোড জেনারেটর প্রস্তুত</p>
                    <button
                      onClick={() => setShowQrConfigForm(true)}
                      className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold shadow-md hover:bg-emerald-500 transition-all"
                    >
                      ইনস্ট্যান্স আইডি সেট করুন
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-3 text-neutral-700">
                    <RefreshCw className="w-10 h-10 text-emerald-600 animate-spin" />
                    <span className="text-xs font-bold text-neutral-600">{qrMessage}</span>
                  </div>
                )}
              </div>

              {/* Status Indicator */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-neutral-900 border border-neutral-800 text-emerald-400 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{qrMessage}</span>
              </div>
            </div>

            {/* Step-by-Step Scan Guide */}
            <div className="p-4 bg-neutral-900/90 border border-neutral-800/90 rounded-2xl space-y-2 relative z-10 text-xs text-neutral-300">
              <p className="font-extrabold text-neutral-100 flex items-center gap-1.5 text-xs pb-1 border-b border-neutral-800">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>মোবাইল থেকে যেভাবে স্ক্যান করবেন:</span>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                <div className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-emerald-600/30 text-emerald-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    ১
                  </span>
                  <span>ফোনে <strong>WhatsApp</strong> অ্যাপটি খুলুন</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-emerald-600/30 text-emerald-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    ২
                  </span>
                  <span>উপরে <strong>Settings (⋮)</strong> এ চাপ দিন</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-emerald-600/30 text-emerald-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    ৩
                  </span>
                  <span><strong>Linked Devices (লিংক করা ডিভাইস)</strong> বাছুন</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-emerald-600/30 text-emerald-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    ৪
                  </span>
                  <span><strong>Link a Device</strong> দিয়ে এই কোডটি স্ক্যান করুন</span>
                </div>
              </div>
            </div>

            {/* Collapsible WAAPI Instance Credentials (Optional) */}
            <div className="relative z-10 pt-1 border-t border-neutral-850">
              <button
                type="button"
                onClick={() => setShowQrConfigForm(!showQrConfigForm)}
                className="w-full flex items-center justify-between text-[11px] text-neutral-400 hover:text-neutral-200 py-1"
              >
                <span>কাস্টম WAAPI Instance আইডি ও টোকেন সেটিংস</span>
                {showQrConfigForm ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showQrConfigForm && (
                <form onSubmit={handleSaveQrCredentials} className="mt-2.5 p-3 bg-neutral-950 rounded-xl space-y-2.5 text-xs border border-neutral-800">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-neutral-300 block mb-1">Instance ID</label>
                      <input
                        type="text"
                        value={qrInstanceInput}
                        onChange={(e) => setQrInstanceInput(e.target.value)}
                        placeholder="Instance ID"
                        className="w-full bg-neutral-900 border border-neutral-750 focus:border-emerald-500 rounded-lg px-2.5 py-1.5 text-xs text-neutral-100 font-mono outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-neutral-300 block mb-1">API Token</label>
                      <input
                        type="password"
                        value={qrTokenInput}
                        onChange={(e) => setQrTokenInput(e.target.value)}
                        placeholder="Token"
                        className="w-full bg-neutral-900 border border-neutral-750 focus:border-emerald-500 rounded-lg px-2.5 py-1.5 text-xs text-neutral-100 font-mono outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <a
                      href="https://waapi.app"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      waapi.app থেকে ফ্রি ইনস্ট্যান্স নিন <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                    <button
                      type="submit"
                      disabled={isSavingQrCreds}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold"
                    >
                      {isSavingQrCreds ? 'সেভ হচ্ছে...' : 'সেভ ও লোড'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          2. ADVANCED META CLOUD MODAL (SECONDARY EXPERIENCE)
          ========================================================= */}
      {showConnectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-[#10131d] border border-neutral-800/90 rounded-3xl p-6 shadow-2xl overflow-hidden flex flex-col space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-sm text-white">Meta WhatsApp Cloud API সেটিংস</h4>
                  <p className="text-[11px] text-neutral-400">অফিসিয়াল মেটা ক্লাউড এপিআই ও ডেভেলপার সেটআপ</p>
                </div>
              </div>

              <button
                onClick={() => setShowConnectModal(false)}
                className="p-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!metaPhoneId.trim() || !metaToken.trim()) {
                  toast.error('দয়া করে Phone Number ID এবং Access Token লিখুন');
                  return;
                }
                setIsSavingMeta(true);
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
                    toast.success(data.message || 'Meta WhatsApp সফলভাবে কানেক্ট হয়েছে!');
                    setShowConnectModal(false);
                    await fetchStatus();
                    if (onStatusChange) onStatusChange();
                  } else {
                    toast.error(data.error || 'ভেরিফিকেশন ব্যর্থ হয়েছে');
                  }
                } catch {
                  toast.error('সার্ভারে যোগাযোগ করতে ব্যর্থ হয়েছে');
                } finally {
                  setIsSavingMeta(false);
                }
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="text-xs font-bold text-neutral-200 block mb-1">
                  Meta WhatsApp Phone Number ID <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={metaPhoneId}
                  onChange={(e) => setMetaPhoneId(e.target.value)}
                  placeholder="যেমন: 105938475829102"
                  className="w-full bg-[#0a0c12] border border-neutral-750 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-neutral-100 font-mono outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-200 block mb-1">
                  System User Permanent Access Token <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows={2}
                  value={metaToken}
                  onChange={(e) => setMetaToken(e.target.value)}
                  placeholder="EAA..."
                  className="w-full bg-[#0a0c12] border border-neutral-750 focus:border-emerald-500 rounded-xl p-2.5 text-xs text-neutral-100 font-mono resize-none outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-neutral-300 block mb-1">ফোন নম্বর (ঐচ্ছিক)</label>
                  <input
                    type="text"
                    value={metaPhone}
                    onChange={(e) => setMetaPhone(e.target.value)}
                    placeholder="017XXXXXXXX"
                    className="w-full bg-[#0a0c12] border border-neutral-750 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-neutral-100 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-neutral-300 block mb-1">WABA ID (ঐচ্ছিক)</label>
                  <input
                    type="text"
                    value={metaBusinessId}
                    onChange={(e) => setMetaBusinessId(e.target.value)}
                    placeholder="WABA ID"
                    className="w-full bg-[#0a0c12] border border-neutral-750 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-neutral-100 font-mono outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSavingMeta}
                className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {isSavingMeta ? 'যাচাই হচ্ছে...' : 'সেভ ও মেটা WhatsApp কানেক্ট করুন'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          3. SEND LIVE TEST WHATSAPP MESSAGE MODAL
          ========================================================= */}
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
