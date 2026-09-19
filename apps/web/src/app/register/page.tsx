'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Zap,
  Mail,
  Lock,
  User,
  Building,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Phone,
  Clock,
  MessageCircle,
  CreditCard,
  Copy,
  Check,
  ChevronLeft,
  Upload,
  Image as ImageIcon,
  X,
  Send,
} from 'lucide-react';
import { toast } from 'sonner';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<'STARTER' | 'BUSINESS' | 'PRO'>('PRO');
  const [isLoading, setIsLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState<any>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Payment proof form state
  const [paymentMethod, setPaymentMethod] = useState<'bKash' | 'Nagad' | 'Rocket'>('bKash');
  const [paymentSenderPhone, setPaymentSenderPhone] = useState('');
  const [paymentTrxId, setPaymentTrxId] = useState('');
  const [paymentScreenshot, setPaymentScreenshot] = useState('');
  const [paymentNote, setPaymentNote] = useState('');
  const [isUploadingScreenshot, setIsUploadingScreenshot] = useState(false);
  const [isSubmittingProof, setIsSubmittingProof] = useState(false);
  const [proofSubmitted, setProofSubmitted] = useState(false);

  const PAYMENT_NUMBER = '01979915165';

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    toast.success(`${label} কপি করা হয়েছে!`);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !businessName || !phone) {
      toast.error('অনুগ্রহ করে সকল প্রয়োজনীয় তথ্য পূরণ করুন');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register',
          name,
          organizationName: businessName,
          email,
          phone,
          password,
          plan: selectedPlan,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(data.message || 'রেজিস্ট্রেশন সফল হয়েছে!');
        setRegistrationSuccess({
          organizationId: data.details?.organizationId,
          name,
          businessName,
          email,
          phone,
          plan: selectedPlan,
        });
        setPaymentSenderPhone(phone);
      } else {
        toast.error(data.error || 'রেজিস্ট্রেশন ব্যর্থ হয়েছে');
      }
    } catch (err) {
      toast.error('সার্ভারে যোগাযোগ করতে সমস্যা হয়েছে');
    } finally {
      setIsLoading(false);
    }
  };

  const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('শুধুমাত্র ইমেজ ফাইল (JPG, PNG) আপলোড করতে পারবেন');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      toast.error('ছবির সাইজ ৮MB এর কম হতে হবে');
      return;
    }

    setIsUploadingScreenshot(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.url) {
        setPaymentScreenshot(data.url);
        toast.success('পেমেন্ট স্ক্রিনশট আপলোড হয়েছে!');
      } else {
        toast.error('স্ক্রিনশট আপলোড করতে সমস্যা হয়েছে');
      }
    } catch (err) {
      toast.error('সার্ভারে যোগাযোগ করতে ব্যর্থ হয়েছে');
    } finally {
      setIsUploadingScreenshot(false);
    }
  };

  const handleSubmitPaymentProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentTrxId && !paymentScreenshot && !paymentSenderPhone) {
      toast.error('অনুগ্রহ করে ট্রানজেকশন আইডি অথবা স্ক্রিনশট প্রদান করুন');
      return;
    }

    setIsSubmittingProof(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit_payment_proof',
          organizationId: registrationSuccess?.organizationId,
          email: registrationSuccess?.email || email,
          paymentMethod,
          paymentSenderPhone: paymentSenderPhone || registrationSuccess?.phone || phone,
          paymentTrxId,
          paymentScreenshot,
          paymentNote,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setProofSubmitted(true);
        toast.success(data.message || 'পেমেন্ট প্রুফ সফলভাবে জমা দেওয়া হয়েছে!');
      } else {
        toast.error(data.error || 'পেমেন্ট প্রুফ জমা দিতে সমস্যা হয়েছে');
      }
    } catch (err) {
      toast.error('সার্ভারে যোগাযোগ করতে সমস্যা হয়েছে');
    } finally {
      setIsSubmittingProof(false);
    }
  };

  const getWhatsAppSuperAdminLink = () => {
    let paymentDetailsText = '';
    if (paymentMethod) {
      paymentDetailsText += `\nপেমেন্ট মেথড: ${paymentMethod}`;
    }
    if (paymentSenderPhone) {
      paymentDetailsText += `\nপ্রেরক নম্বর: ${paymentSenderPhone}`;
    }
    if (paymentTrxId) {
      paymentDetailsText += `\nTrx ID: ${paymentTrxId}`;
    }
    if (paymentScreenshot) {
      paymentDetailsText += `\n(স্ক্রিনশট ওয়েবসাইটে আপলোড করা হয়েছে)`;
    }
    if (paymentNote) {
      paymentDetailsText += `\nনোট: ${paymentNote}`;
    }

    const text = encodeURIComponent(
      `আসসালামু আলাইকুম Super Admin,\nআমি OrderFlow BD তে '${registrationSuccess?.businessName || businessName}' স্টোর রেজিস্টার করেছি।\nআমার নাম: ${registrationSuccess?.name || name}\nফোন: ${registrationSuccess?.phone || phone}\nইমেইল: ${registrationSuccess?.email || email}\nপ্যাকেজ: ${registrationSuccess?.plan || selectedPlan}${paymentDetailsText}\n\nঅনুগ্রহ করে আমার অ্যাকাউন্টটি ভেরিফাই ও অনুমোদন (Approve) করুন।`,
    );
    return `https://wa.me/8801979915165?text=${text}`;
  };

  return (
    <div className="min-h-screen bg-[#06080e] text-white flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      {/* Ambient Lighting Orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-emerald-500/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-indigo-500/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-teal-900/10 via-transparent to-transparent pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-xl relative z-10 space-y-6 my-8">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 flex items-center justify-center text-neutral-950 font-black shadow-lg shadow-emerald-500/25 group-hover:scale-105 transition-transform duration-300">
              <Zap className="w-6 h-6 fill-neutral-950 text-neutral-950" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <h1 className="font-black text-2xl text-white tracking-tight">OrderFlow</h1>
                <span className="px-1.5 py-0.5 text-[10px] font-black bg-gradient-to-r from-emerald-400 to-teal-300 text-neutral-950 rounded-md">
                  SaaS 2.0
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Enterprise Organization Onboarding</p>
            </div>
          </Link>
        </div>

        {/* Conditional Screen: Success Pending State VS Registration Form */}
        {registrationSuccess ? (
          <div className="bg-[#0b0f19]/95 border border-emerald-500/40 rounded-[2rem] p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.8)] backdrop-blur-2xl space-y-6 animate-in fade-in zoom-in-95 duration-300">
            {/* Success Header */}
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-3xl mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/10">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">রেজিস্ট্রেশন সফলভাবে সম্পন্ন হয়েছে!</h2>
              <p className="text-xs sm:text-sm text-emerald-300 font-medium">
                আপনার স্টোর তৈরি হয়েছে। পেমেন্ট কনফার্মেশনের পর সুপার অ্যাডমিন অনুমোদন করবেন।
              </p>
            </div>

            {/* Registered Info Summary */}
            <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">স্টোরের নাম:</span>
                <span className="font-bold text-white">{registrationSuccess.businessName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">অনার নাম:</span>
                <span className="font-bold text-white">{registrationSuccess.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">ইমেইল:</span>
                <span className="font-mono text-slate-300">{registrationSuccess.email}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">ফোন নম্বর:</span>
                <span className="font-mono text-emerald-400 font-bold">{registrationSuccess.phone}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">নির্বাচিত প্যাকেজ:</span>
                <span className="font-bold text-purple-300">{registrationSuccess.plan} VIP</span>
              </div>
            </div>

            {/* Payment Verification Instructions (01979915165 - bKash / Nagad / Rocket) */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-950/40 via-slate-900/90 to-teal-950/40 border border-emerald-500/30 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs sm:text-sm">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <span>পেমেন্ট নির্দেশিকা (বিকাশ / নগদ / রকেট):</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                নিচের নম্বরে বিকাশ, নগদ বা রকেটের মাধ্যমে আপনার নির্বাচিত প্যাকেজের ফি সেন্ড মানি (Send Money) বা পেমেন্ট করুন:
              </p>

              {/* Payment Number Card */}
              <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                      bKash / Nagad / Rocket নম্বর:
                    </span>
                    <div className="text-lg sm:text-xl font-mono font-black text-emerald-400 tracking-wider">
                      {PAYMENT_NUMBER}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(PAYMENT_NUMBER, 'পেমেন্ট নম্বর')}
                    className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                  >
                    {copiedText === 'পেমেন্ট নম্বর' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedText === 'পেমেন্ট নম্বর' ? 'কপি হয়েছে' : 'নম্বর কপি করুন'}</span>
                  </button>
                </div>

                {/* Supported Provider Badges */}
                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800/80 text-[11px]">
                  <span className="px-2 py-0.5 rounded-lg bg-pink-500/20 text-pink-300 border border-pink-500/30 font-bold">
                    বিকাশ (bKash)
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-orange-500/20 text-orange-300 border border-orange-500/30 font-bold">
                    নগদ (Nagad)
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
                    রকেট (Rocket)
                  </span>
                  <span className="text-slate-400 text-[10px] ml-auto">
                    (Send Money / Personal / Cash In)
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Proof Submission Form */}
            <div className="p-4 sm:p-5 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <h3 className="text-xs sm:text-sm font-bold text-white">
                    ওয়েবসাইটে পেমেন্ট প্রুফ জমা দিন:
                  </h3>
                </div>
                {proofSubmitted && (
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold rounded-full">
                    জমা হয়েছে ✅
                  </span>
                )}
              </div>

              {proofSubmitted ? (
                <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-xl space-y-2 text-xs">
                  <p className="font-bold text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>আপনার পেমেন্ট প্রুফ সফলভাবে জমা নেওয়া হয়েছে!</span>
                  </p>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    সুপার অ্যাডমিন আপনার পাঠানো তথ্য ও স্ক্রিনশট যাচাই করে অল্প সময়ের মধ্যে অ্যাকাউন্ট সক্রিয় করে দেবেন। আপনি চাইলে দ্রুত ভেরিফিকেশনের জন্য সরাসরি WhatsApp-এও মেসেজ করতে পারেন।
                  </p>
                  <div className="pt-2 text-[11px] font-mono text-slate-400 flex flex-wrap gap-x-4 gap-y-1">
                    <span>মাধ্যম: <strong className="text-white">{paymentMethod}</strong></span>
                    {paymentTrxId && <span>TrxID: <strong className="text-white">{paymentTrxId}</strong></span>}
                    {paymentSenderPhone && <span>প্রেরক নম্বর: <strong className="text-white">{paymentSenderPhone}</strong></span>}
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitPaymentProof} className="space-y-3.5">
                  {/* Payment Channel Selector */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                      কোথায় পেমেন্ট করেছেন (মাধ্যম নির্বাচন করুন):
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'bKash', label: 'বিকাশ', sub: 'bKash', color: 'border-pink-500/50 bg-pink-500/15 text-pink-300' },
                        { id: 'Nagad', label: 'নগদ', sub: 'Nagad', color: 'border-orange-500/50 bg-orange-500/15 text-orange-300' },
                        { id: 'Rocket', label: 'রকেট', sub: 'Rocket', color: 'border-purple-500/50 bg-purple-500/15 text-purple-300' },
                      ].map((m) => {
                        const isSelected = paymentMethod === m.id;
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setPaymentMethod(m.id as any)}
                            className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                              isSelected
                                ? `${m.color} shadow-md shadow-emerald-500/5 ring-1 ring-emerald-400/50 font-bold`
                                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            <span className="block text-xs">{m.label}</span>
                            <span className="block text-[10px] text-slate-400">{m.sub}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Sender Phone & Trx ID */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-300">
                        যে নম্বর থেকে টাকা পাঠিয়েছেন:
                      </label>
                      <input
                        type="tel"
                        value={paymentSenderPhone}
                        onChange={(e) => setPaymentSenderPhone(e.target.value)}
                        placeholder="01XXXXXXXXX"
                        className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none transition-all font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-300">
                        ট্রানজেকশন আইডি (TrxID):
                      </label>
                      <input
                        type="text"
                        value={paymentTrxId}
                        onChange={(e) => setPaymentTrxId(e.target.value)}
                        placeholder="যেমন: BL9A38ZK9Q"
                        className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none transition-all font-mono uppercase"
                      />
                    </div>
                  </div>

                  {/* Screenshot Upload Dropzone */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-slate-300">
                      পেমেন্টের স্ক্রিনশট আপলোড করুন:
                    </label>

                    {paymentScreenshot ? (
                      <div className="relative p-2 bg-slate-950 border border-emerald-500/40 rounded-xl flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <img
                            src={paymentScreenshot}
                            alt="Payment Proof"
                            className="w-12 h-12 object-cover rounded-lg border border-slate-800 shrink-0"
                          />
                          <div className="truncate">
                            <span className="text-xs font-bold text-emerald-400 block truncate">
                              স্ক্রিনশট সফলভাবে সংযুক্ত
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                              ইমেজ ফাইল প্রস্তুত
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setPaymentScreenshot('')}
                          className="p-1.5 bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-lg transition-all cursor-pointer shrink-0"
                          title="স্ক্রিনশট মুছুন"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="relative flex flex-col items-center justify-center p-4 border border-dashed border-slate-750 hover:border-emerald-500/60 bg-slate-950/60 rounded-xl cursor-pointer transition-all hover:bg-slate-900/50 group">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleScreenshotUpload}
                          disabled={isUploadingScreenshot}
                          className="sr-only"
                        />
                        <div className="flex flex-col items-center gap-1 text-center">
                          {isUploadingScreenshot ? (
                            <>
                              <Clock className="w-5 h-5 text-emerald-400 animate-spin" />
                              <span className="text-xs text-emerald-300 font-bold">
                                স্ক্রিনশট আপলোড হচ্ছে...
                              </span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-5 h-5 text-slate-400 group-hover:text-emerald-400 transition-colors" />
                              <span className="text-xs text-slate-300 font-medium">
                                স্ক্রিনশট বেছে নিন বা এখানে ড্রপ করুন
                              </span>
                              <span className="text-[10px] text-slate-500">
                                JPG, PNG বা WEBP (সর্বোচ্চ ৮MB)
                              </span>
                            </>
                          )}
                        </div>
                      </label>
                    )}
                  </div>

                  {/* Optional Short Note */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-400">
                      কোনো নোট বা তথ্য থাকলে লিখুন (ঐচ্ছিক):
                    </label>
                    <input
                      type="text"
                      value={paymentNote}
                      onChange={(e) => setPaymentNote(e.target.value)}
                      placeholder="যেমন: বিকাশ পার্সোনাল থেকে ৫০০০ টাকা পাঠিয়েছি"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none transition-all"
                    />
                  </div>

                  {/* Submit Proof Button */}
                  <button
                    type="submit"
                    disabled={isSubmittingProof || isUploadingScreenshot}
                    className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs transition-all shadow-md shadow-emerald-500/20 active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmittingProof ? 'জমা হচ্ছে...' : 'পেমেন্ট প্রুফ জমা দিন (Submit Proof)'}</span>
                  </button>
                </form>
              )}
            </div>

            {/* Direct WhatsApp Option */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>চাইলে সরাসরি WhatsApp এ যোগাযোগ করুন:</span>
              </div>
              <a
                href={getWhatsAppSuperAdminLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-2xl text-xs sm:text-sm transition-all shadow-[0_10px_25px_rgba(16,185,129,0.3)] active:scale-98 flex items-center justify-center gap-2 cursor-pointer text-center"
              >
                <MessageCircle className="w-4 h-4 fill-slate-950" />
                <span>সুপার অ্যাডমিনকে WhatsApp করুন ({PAYMENT_NUMBER})</span>
              </a>
            </div>

            {/* Back to Login Link */}
            <div className="pt-2 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white font-bold transition-all"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>লগইন পেজে যান</span>
              </Link>
            </div>
          </div>
        ) : (
          /* Register Card Form */
          <div className="bg-[#0b0f19]/95 border border-slate-800/90 rounded-[2rem] p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.8)] backdrop-blur-2xl space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl font-black text-white">নতুন ব্যবসা / স্টোর রেজিস্টার করুন</h2>
              <p className="text-xs text-slate-400">
                আপনার ফেসবুক পেজ ও মেসেঞ্জার চ্যাট সেন্ট্রালাইজ করতে অ্যাকাউন্ট খুলুন
              </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              {/* Business / Org Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  ব্যবসা বা ফেসবুক পেজের নাম
                </label>
                <div className="relative">
                  <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="যেমন: Moner Kotha Fashion"
                    required
                    className="w-full bg-slate-900/90 border border-slate-750 focus:border-emerald-500 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none transition-all shadow-inner"
                  />
                </div>
              </div>

              {/* Owner Full Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  আপনার পূর্ণ নাম (Owner Name)
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="আপনার নাম"
                    required
                    className="w-full bg-slate-900/90 border border-slate-750 focus:border-emerald-500 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none transition-all shadow-inner"
                  />
                </div>
              </div>

              {/* Phone Field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  মোবাইল / WhatsApp নম্বর
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="017XXXXXXXX"
                    required
                    className="w-full bg-slate-900/90 border border-slate-750 focus:border-emerald-500 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none transition-all shadow-inner"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  অফিসিয়াল ইমেইল
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@business.com"
                    required
                    className="w-full bg-slate-900/90 border border-slate-750 focus:border-emerald-500 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none transition-all shadow-inner"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  পাসওয়ার্ড
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-slate-900/90 border border-slate-750 focus:border-emerald-500 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none transition-all shadow-inner"
                  />
                </div>
              </div>

              {/* Plan Choice Selector */}
              <div className="space-y-2 pt-1">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  প্যাকেজ নির্বাচন করুন:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'STARTER', name: 'Starter', price: '৳৯৯৯/মাস', limit: '১,০০০ চ্যাট' },
                    { id: 'BUSINESS', name: 'Business', price: '৳২,৪৯০/মাস', limit: '১০,০০০ চ্যাট' },
                    { id: 'PRO', name: 'Pro VIP', price: '৳৪,৯৯০/মাস', limit: '৫০,০০০ চ্যাট' },
                  ].map((p) => {
                    const isSelected = selectedPlan === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSelectedPlan(p.id as any)}
                        className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-md'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold">{p.name}</span>
                          {isSelected && <Check className="w-3 h-3 text-emerald-400" />}
                        </div>
                        <p className="text-[11px] font-mono text-emerald-300 mt-0.5">{p.price}</p>
                        <p className="text-[9px] text-slate-500">{p.limit}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-6 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-2xl text-sm transition-all shadow-[0_10px_25px_rgba(16,185,129,0.3)] active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
              >
                <span>{isLoading ? 'তৈরি হচ্ছে...' : 'রেজিস্ট্রেশন করুন'}</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </form>

            {/* Footer Login Link */}
            <div className="pt-4 border-t border-slate-800/80 text-center text-xs text-slate-400">
              ইতোমধ্যে অ্যাকাউন্ট আছে?{' '}
              <Link href="/login" className="text-emerald-400 hover:underline font-bold">
                লগইন করুন
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
