'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  CheckCircle2,
  XCircle,
  RefreshCw,
  Trash2,
  Phone,
  MessageSquare,
  Send,
  QrCode,
  Smartphone,
  CheckCheck,
  Settings,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

interface WhatsAppStatus {
  connected: boolean;
  provider?: string;
  phone?: string;
  displayPhoneNumber?: string;
  verifiedName?: string;
  instanceId?: string;
}

interface WhatsAppIntegrationCardProps {
  onStatusChange?: () => void;
}

export const WhatsAppIntegrationCard: React.FC<WhatsAppIntegrationCardProps> = ({ onStatusChange }) => {
  const [status, setStatus] = useState<WhatsAppStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  // QR Modal
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrCodeImage, setQrCodeImage] = useState<string | null>(null);
  const [qrPhase, setQrPhase] = useState<'LOADING' | 'READY' | 'CONNECTED' | 'ERROR' | 'SETUP_NEEDED'>('LOADING');
  const [qrError, setQrError] = useState('');
  const pollRef = useRef<any>(null);

  // Advanced / manual setup (hidden by default)
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [advInstanceId, setAdvInstanceId] = useState('');
  const [advToken, setAdvToken] = useState('');
  const [isSavingAdv, setIsSavingAdv] = useState(false);

  // Test modal
  const [showTestModal, setShowTestModal] = useState(false);
  const [testPhone, setTestPhone] = useState('');
  const [testMessage, setTestMessage] = useState('🌸 OrderFlow BD টেস্ট: আপনার WhatsApp চ্যাটবট সক্রিয় আছে! 🎉');
  const [isSendingTest, setIsSendingTest] = useState(false);

  // ── Fetch connection status ──────────────────────────────────────────────────
  const fetchStatus = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/whatsapp/status');
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
        if (data.phone) setTestPhone(data.phone);
      }
    } catch {}
    finally { setIsLoading(false); }
  };

  useEffect(() => {
    fetchStatus();
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  // ── Poll QR ──────────────────────────────────────────────────────────────────
  const pollQr = async () => {
    try {
      const res = await fetch('/api/whatsapp/qr');
      const data = await res.json();

      if (data.status === 'CONNECTED') {
        setQrPhase('CONNECTED');
        try { confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } }); } catch {}
        toast.success(`🎉 WhatsApp (${data.phone}) সফলভাবে কানেক্ট হয়েছে!`);
        clearInterval(pollRef.current);
        await fetchStatus();
        if (onStatusChange) onStatusChange();
        setTimeout(() => setShowQrModal(false), 2000);
        return;
      }

      if (data.status === 'SCAN_QR_CODE' && data.qrCode) {
        setQrPhase('READY');
        setQrCodeImage(data.qrCode);
        return;
      }

      if (data.status === 'SETUP_NEEDED') {
        setQrPhase('SETUP_NEEDED');
        setShowAdvanced(true);
        return;
      }

      if (data.status === 'ERROR') {
        setQrPhase('ERROR');
        setQrError(data.error || 'QR লোড করতে সমস্যা হয়েছে');
        return;
      }

      // WAITING_FOR_QR — keep loading spinner
      setQrPhase('LOADING');
    } catch {
      setQrPhase('ERROR');
      setQrError('সার্ভারে যোগাযোগ করতে ব্যর্থ হয়েছে');
    }
  };

  const openQrModal = () => {
    setShowQrModal(true);
    setQrPhase('LOADING');
    setQrCodeImage(null);
    setQrError('');
    setShowAdvanced(false);
    pollQr();
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(pollQr, 4000);
  };

  const closeQrModal = () => {
    setShowQrModal(false);
    clearInterval(pollRef.current);
  };

  // ── Save advanced credentials ────────────────────────────────────────────────
  const saveAdvanced = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!advInstanceId.trim() || !advToken.trim()) {
      toast.error('Instance ID ও API Token দিন');
      return;
    }
    setIsSavingAdv(true);
    try {
      const res = await fetch('/api/whatsapp/qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instanceId: advInstanceId.trim(), token: advToken.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('সেভ হয়েছে! QR কোড আসছে...');
        setShowAdvanced(false);
        setQrPhase('LOADING');
        setQrCodeImage(null);
        await pollQr();
      } else {
        toast.error(data.error || 'সেভ করতে সমস্যা হয়েছে');
      }
    } catch { toast.error('সার্ভার এরর'); }
    finally { setIsSavingAdv(false); }
  };

  // ── Disconnect ───────────────────────────────────────────────────────────────
  const doDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      const res = await fetch('/api/whatsapp/disconnect', { method: 'POST' });
      if (res.ok) {
        toast.success('WhatsApp ডিসকানেক্ট করা হয়েছে');
        await fetchStatus();
        if (onStatusChange) onStatusChange();
      }
    } catch { toast.error('ডিসকানেক্ট করতে সমস্যা'); }
    finally { setIsDisconnecting(false); }
  };

  const handleDisconnect = () => {
    toast.warning('WhatsApp ডিসকানেক্ট করতে চান?', {
      description: 'AI রিপ্লাই ও চ্যাটবট বন্ধ হয়ে যাবে।',
      action: { label: 'হ্যাঁ, ডিসকানেক্ট', onClick: doDisconnect },
      cancel: { label: 'বাতিল', onClick: () => {} },
      duration: 7000,
    });
  };

  // ── Send test message ────────────────────────────────────────────────────────
  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testPhone.trim()) { toast.error('ফোন নম্বর লিখুন'); return; }
    setIsSendingTest(true);
    try {
      const res = await fetch('/api/whatsapp/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: testPhone.trim(), message: testMessage.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success) { toast.success('টেস্ট মেসেজ পাঠানো হয়েছে! 🎉'); setShowTestModal(false); }
      else toast.error(data.error || 'পাঠাতে সমস্যা হয়েছে');
    } catch { toast.error('সার্ভার এরর'); }
    finally { setIsSendingTest(false); }
  };

  const isConnected = Boolean(status?.connected);

  return (
    <>
      {/* ── CARD ─────────────────────────────────────────────────────────────── */}
      <div className="bg-[#10121a] border border-neutral-800/90 rounded-3xl p-6 sm:p-7 space-y-5 shadow-xl flex flex-col justify-between relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-4 relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-700 via-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-600/30">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-neutral-100 text-base sm:text-lg">WhatsApp AI চ্যাটবট</h3>
                <p className="text-xs text-neutral-400">QR স্ক্যান করে মোবাইল WhatsApp সরাসরি যুক্ত করুন</p>
              </div>
            </div>

            {isLoading ? (
              <span className="px-3 py-1 bg-neutral-850 text-neutral-400 rounded-xl text-xs flex items-center gap-1.5">
                <RefreshCw className="w-3 h-3 animate-spin" /><span>লোড হচ্ছে...</span>
              </span>
            ) : isConnected ? (
              <span className="px-3 py-1 text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 rounded-xl flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                সংযুক্ত ও সক্রিয়
              </span>
            ) : (
              <span className="px-3 py-1 text-xs font-bold bg-neutral-800 text-neutral-400 border border-neutral-700 rounded-xl flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5 text-neutral-500" />কানেক্ট নেই
              </span>
            )}
          </div>

          {/* Body */}
          {isConnected ? (
            <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-950/30 via-neutral-900/90 to-neutral-900 border border-emerald-500/30 rounded-2xl space-y-3 shadow-lg">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-neutral-400">কানেক্টেড নম্বর</p>
                    <h4 className="text-lg font-black text-emerald-300">
                      {status?.verifiedName
                        ? `${status.verifiedName} (${status.displayPhoneNumber || status.phone})`
                        : status?.displayPhoneNumber || status?.phone || 'WhatsApp Business Connected'}
                    </h4>
                    <p className="text-[11px] text-neutral-400">২৪/৭ AI চ্যাটবট সক্রিয়</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowTestModal(true)}
                    className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5 shadow-md"
                  >
                    <Send className="w-3.5 h-3.5" /><span>টেস্ট</span>
                  </button>
                  <button
                    onClick={handleDisconnect}
                    disabled={isDisconnecting}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/15 border border-red-500/25 rounded-xl transition-all active:scale-95"
                    title="ডিসকানেক্ট"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-neutral-800/80 flex flex-wrap items-center gap-2 text-xs">
                <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-lg flex items-center gap-1">
                  <CheckCheck className="w-3.5 h-3.5" />২৪/৭ স্বয়ংক্রিয় AI উত্তর ও অর্ডার বুকিং সক্রিয়
                </span>
              </div>
            </div>
          ) : (
            <div className="p-5 bg-neutral-900/80 border border-neutral-800 rounded-2xl space-y-3">
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0">
                  <QrCode className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-neutral-100">মাত্র ৩টি ধাপে কানেক্ট করুন</h4>
                  <div className="mt-2 space-y-1.5 text-xs text-neutral-400">
                    <p>① নিচের বাটনে চাপুন → QR কোড দেখাবে</p>
                    <p>② ফোনে WhatsApp খুলুন → Settings → Linked Devices → Link a Device</p>
                    <p>③ QR কোড স্ক্যান করুন → সাথে সাথে কানেক্ট!</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer buttons */}
        <div className="pt-2 relative z-10 flex flex-col gap-2">
          {isConnected ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                onClick={openQrModal}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-2xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <QrCode className="w-4 h-4" /><span>নতুন QR স্ক্যান / পরিবর্তন</span>
              </button>
              <button
                onClick={() => setShowTestModal(true)}
                className="w-full py-3 bg-neutral-800 hover:bg-neutral-750 text-neutral-200 border border-neutral-700 font-bold text-xs rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5 text-emerald-400" /><span>লাইভ টেস্ট মেসেজ</span>
              </button>
            </div>
          ) : (
            <button
              onClick={openQrModal}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-neutral-950 font-black text-sm rounded-2xl shadow-xl shadow-emerald-500/25 active:scale-95 transition-all flex items-center justify-center gap-2.5"
            >
              <QrCode className="w-5 h-5" />
              <span>📲 WhatsApp কানেক্ট করুন</span>
            </button>
          )}
        </div>
      </div>

      {/* ── QR MODAL ─────────────────────────────────────────────────────────── */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-[#0e111a] border border-emerald-500/40 rounded-3xl p-6 shadow-2xl overflow-hidden flex flex-col space-y-5">
            {/* Glow */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/30">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-neutral-100">QR কোড স্ক্যান করুন</h3>
                  <p className="text-[11px] text-neutral-400">WhatsApp → Settings → Linked Devices</p>
                </div>
              </div>
              <button onClick={closeQrModal} className="p-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-xl transition-all">✕</button>
            </div>

            {/* QR Box */}
            <div className="relative z-10 flex flex-col items-center space-y-4">
              <div className="relative p-3 bg-white rounded-3xl shadow-2xl border-4 border-emerald-500/40 flex items-center justify-center w-60 h-60 sm:w-64 sm:h-64">
                {qrPhase === 'CONNECTED' ? (
                  <div className="flex flex-col items-center gap-2 text-emerald-600">
                    <CheckCircle2 className="w-16 h-16 animate-bounce" />
                    <span className="font-extrabold text-sm text-neutral-900">কানেক্ট হয়েছে! 🎉</span>
                  </div>
                ) : qrPhase === 'READY' && qrCodeImage ? (
                  <img
                    src={qrCodeImage.startsWith('data:') ? qrCodeImage : qrCodeImage.startsWith('http') ? qrCodeImage : `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(qrCodeImage)}`}
                    alt="WhatsApp QR Code"
                    className="w-full h-full object-contain rounded-xl"
                  />
                ) : qrPhase === 'ERROR' ? (
                  <div className="flex flex-col items-center gap-2 text-center p-3">
                    <XCircle className="w-12 h-12 text-red-400" />
                    <p className="text-xs text-neutral-700 font-semibold">{qrError}</p>
                    <button onClick={pollQr} className="mt-1 px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold">আবার চেষ্টা করুন</button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 text-neutral-700">
                    <RefreshCw className="w-10 h-10 text-emerald-600 animate-spin" />
                    <span className="text-xs font-semibold text-neutral-600">QR কোড তৈরি হচ্ছে...</span>
                  </div>
                )}
              </div>

              {/* Status pill */}
              <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold border shadow-sm ${
                qrPhase === 'READY' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' :
                qrPhase === 'CONNECTED' ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-200' :
                qrPhase === 'ERROR' ? 'bg-red-500/10 border-red-500/30 text-red-300' :
                'bg-neutral-900 border-neutral-800 text-neutral-400'
              }`}>
                <span className={`w-2 h-2 rounded-full ${qrPhase === 'READY' || qrPhase === 'CONNECTED' ? 'bg-emerald-400 animate-pulse' : qrPhase === 'ERROR' ? 'bg-red-400' : 'bg-neutral-500 animate-pulse'}`} />
                {qrPhase === 'READY' ? 'স্ক্যান করুন' :
                 qrPhase === 'CONNECTED' ? 'সংযুক্ত হয়েছে!' :
                 qrPhase === 'ERROR' ? 'সমস্যা হয়েছে' :
                 'QR তৈরি হচ্ছে...'}
              </div>
            </div>

            {/* Step guide */}
            {qrPhase !== 'CONNECTED' && (
              <div className="p-3.5 bg-neutral-900/90 border border-neutral-800 rounded-2xl relative z-10">
                <p className="text-[11px] font-bold text-neutral-200 mb-2 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-emerald-400" />মোবাইলে যা করবেন:
                </p>
                <div className="grid grid-cols-2 gap-y-1.5 gap-x-3 text-[11px] text-neutral-400">
                  <span>① WhatsApp খুলুন</span>
                  <span>② Settings (⋮) চাপুন</span>
                  <span>③ Linked Devices বাছুন</span>
                  <span>④ Link a Device → স্ক্যান</span>
                </div>
              </div>
            )}

            {/* Advanced / manual toggle */}
            {qrPhase !== 'CONNECTED' && (
              <div className="relative z-10 border-t border-neutral-800 pt-3">
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="w-full flex items-center justify-between text-[11px] text-neutral-500 hover:text-neutral-300 transition-colors"
                >
                  <span>⚙️ নিজের WAAPI Instance ব্যবহার করুন (অ্যাডভান্সড)</span>
                  {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {showAdvanced && (
                  <form onSubmit={saveAdvanced} className="mt-3 p-3 bg-neutral-950 rounded-xl space-y-2.5 border border-neutral-800">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-neutral-300 block mb-1">Instance ID</label>
                        <input
                          type="text"
                          value={advInstanceId}
                          onChange={(e) => setAdvInstanceId(e.target.value)}
                          placeholder="যেমন: 12345"
                          className="w-full bg-neutral-900 border border-neutral-700 focus:border-emerald-500 rounded-lg px-2.5 py-1.5 text-xs text-neutral-100 font-mono outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-neutral-300 block mb-1">API Token</label>
                        <input
                          type="password"
                          value={advToken}
                          onChange={(e) => setAdvToken(e.target.value)}
                          placeholder="Token..."
                          className="w-full bg-neutral-900 border border-neutral-700 focus:border-emerald-500 rounded-lg px-2.5 py-1.5 text-xs text-neutral-100 font-mono outline-none"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <a href="https://waapi.app" target="_blank" rel="noreferrer" className="text-[10px] text-emerald-400 hover:underline flex items-center gap-1">
                        waapi.app <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                      <button
                        type="submit"
                        disabled={isSavingAdv}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold disabled:opacity-50"
                      >
                        {isSavingAdv ? 'সেভ...' : 'সেভ ও লোড'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TEST MESSAGE MODAL ────────────────────────────────────────────────── */}
      {showTestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-[#10131d] border border-neutral-800/90 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-black text-sm text-white">লাইভ টেস্ট মেসেজ</h4>
                  <p className="text-[11px] text-neutral-400">WhatsApp-এ সরাসরি পাঠিয়ে পরীক্ষা করুন</p>
                </div>
              </div>
              <button onClick={() => setShowTestModal(false)} className="p-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-lg">✕</button>
            </div>

            <form onSubmit={handleSendTest} className="space-y-3 text-xs">
              <div>
                <label className="text-xs font-bold text-neutral-200 block mb-1">WhatsApp নম্বর:</label>
                <input
                  type="text"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  placeholder="017XXXXXXXX"
                  className="w-full bg-[#0a0c12] border border-neutral-700 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-neutral-100 outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-neutral-200 block mb-1">মেসেজ:</label>
                <textarea
                  rows={3}
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  className="w-full bg-[#0a0c12] border border-neutral-700 focus:border-emerald-500 rounded-xl p-2.5 text-xs text-neutral-100 resize-none outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={isSendingTest}
                className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {isSendingTest ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" />পাঠানো হচ্ছে...</> : <><Send className="w-3.5 h-3.5" />মেসেজ পাঠান</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
