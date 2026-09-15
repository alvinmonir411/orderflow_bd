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
  BrainCircuit,
  BookOpen,
  Plus,
  Trash2,
  Edit3,
  HelpCircle,
  Truck,
  DollarSign,
  PhoneCall,
  RotateCcw,
  Search,
  Sliders,
} from 'lucide-react';
import { toast } from 'sonner';

interface BotFaqItem {
  id: string;
  category: 'DELIVERY' | 'PAYMENT' | 'PRODUCT' | 'RETURN' | 'GENERAL' | 'ORDER_TRACKING';
  title: string;
  keywords: string[];
  replyText: string;
  isActive: boolean;
}

export default function BotSettingsPage() {
  const [activeTab, setActiveTab] = useState<'training' | 'policies' | 'connections' | 'tester'>('training');
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);

  // Connection State
  const [fbPageId, setFbPageId] = useState('1314475555081210');
  const [fbPageToken, setFbPageToken] = useState('EAAiyNmqJWZCkBSUrjkc4ZCraUnG8t9cXtWDgxkNZCnwd1fmP9LhKDWTr8ApzwweRZA2WHzCFHZBGZCBPmECI15GLqUZAjVyxcnErVjcszH07mdbYU6lA2l2ibDdLKZCLhZADDCXbhQeaP5Bac9xUp7BrR9WnYqMw9hgfl9k7dlxSdaPAcDFTxkqkrSV3X1ZAseJOsFbixCJu4VEgZDZD');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [verifyToken, setVerifyToken] = useState('orderflow_bd_verify_token');

  // Policy & Training State
  const [systemPrompt, setSystemPrompt] = useState(
    'You are an intelligent, polite, friendly Bangladeshi F-Commerce AI sales representative for OrderFlow BD. Speak in natural warm Bengali with emojis.',
  );
  const [deliveryTimeDhaka, setDeliveryTimeDhaka] = useState('২৪ থেকে ৪৮ ঘণ্টা (১-২ দিন)');
  const [deliveryTimeOutside, setDeliveryTimeOutside] = useState('২ থেকে ৩ কার্যদিবস');
  const [deliveryFeeDhaka, setDeliveryFeeDhaka] = useState(120);
  const [deliveryFeeOutside, setDeliveryFeeOutside] = useState(150);
  const [helplinePhone, setHelplinePhone] = useState('01700000000');
  const [returnPolicy, setReturnPolicy] = useState('পণ্য হাতে পেয়ে চেক করে নেওয়ার সুবিধা এবং ৩ দিনের মধ্যে ফ্রি সাইজ পরিবর্তন।');

  // FAQs State
  const [faqs, setFaqs] = useState<BotFaqItem[]>([]);
  const [faqSearch, setFaqSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Modal State for Adding/Editing FAQ
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [editingFaq, setEditingFaq] = useState<BotFaqItem | null>(null);
  const [faqTitle, setFaqTitle] = useState('');
  const [faqCategory, setFaqCategory] = useState<BotFaqItem['category']>('DELIVERY');
  const [faqKeywords, setFaqKeywords] = useState('');
  const [faqReply, setFaqReply] = useState('');

  const [isSaving, setIsSaving] = useState(false);

  const webhookUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/webhooks/facebook`
      : 'https://orderflowbd.vercel.app/webhooks/facebook';

  useEffect(() => {
    fetch('/api/bot-config')
      .then((res) => res.json())
      .then((data) => {
        if (data.fbPageId) setFbPageId(data.fbPageId);
        if (data.fbPageToken) setFbPageToken(data.fbPageToken);
        if (data.geminiApiKey) setGeminiApiKey(data.geminiApiKey);
        if (data.systemPrompt) setSystemPrompt(data.systemPrompt);
        if (data.deliveryTimeDhaka) setDeliveryTimeDhaka(data.deliveryTimeDhaka);
        if (data.deliveryTimeOutside) setDeliveryTimeOutside(data.deliveryTimeOutside);
        if (data.deliveryFeeDhaka) setDeliveryFeeDhaka(data.deliveryFeeDhaka);
        if (data.deliveryFeeOutside) setDeliveryFeeOutside(data.deliveryFeeOutside);
        if (data.helplinePhone) setHelplinePhone(data.helplinePhone);
        if (data.returnPolicy) setReturnPolicy(data.returnPolicy);
        if (Array.isArray(data.faqs)) setFaqs(data.faqs);
      })
      .catch((err) => console.error('Failed to load bot config:', err));
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

  const handleSaveAll = async (customPayload?: any) => {
    setIsSaving(true);
    try {
      const payload = customPayload || {
        fbPageId,
        fbPageToken,
        geminiApiKey,
        systemPrompt,
        deliveryTimeDhaka,
        deliveryTimeOutside,
        deliveryFeeDhaka,
        deliveryFeeOutside,
        helplinePhone,
        returnPolicy,
        faqs,
      };

      const res = await fetch('/api/bot-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success('সবগুলো সেটিংস ও AI ট্রেইনিং ডাটাবেজে স্থায়ীভাবে সেভ হয়েছে!');
      } else {
        toast.error('সেভ করতে সমস্যা হয়েছে');
      }
    } catch {
      toast.error('সার্ভারে সমস্যা হয়েছে');
    } finally {
      setIsSaving(false);
    }
  };

  // Open Modal for New FAQ
  const handleOpenAddFaq = () => {
    setEditingFaq(null);
    setFaqTitle('');
    setFaqCategory('DELIVERY');
    setFaqKeywords('');
    setFaqReply('');
    setShowFaqModal(true);
  };

  // Open Modal for Editing FAQ
  const handleOpenEditFaq = (faq: BotFaqItem) => {
    setEditingFaq(faq);
    setFaqTitle(faq.title);
    setFaqCategory(faq.category);
    setFaqKeywords(faq.keywords.join(', '));
    setFaqReply(faq.replyText);
    setShowFaqModal(true);
  };

  // Save or Update FAQ
  const handleSaveFaqModal = () => {
    if (!faqTitle || !faqReply) {
      toast.error('অনুগ্রহ করে শিরোনাম ও উত্তরের বিবরণ লিখুন');
      return;
    }

    const keywordList = faqKeywords
      .split(',')
      .map((k) => k.trim().toLowerCase())
      .filter((k) => k.length > 0);

    let updatedList: BotFaqItem[] = [];
    if (editingFaq) {
      updatedList = faqs.map((f) =>
        f.id === editingFaq.id
          ? {
              ...f,
              title: faqTitle,
              category: faqCategory,
              keywords: keywordList.length > 0 ? keywordList : f.keywords,
              replyText: faqReply,
            }
          : f,
      );
      toast.success('FAQ আপডেট করা হয়েছে!');
    } else {
      const newFaq: BotFaqItem = {
        id: `faq-${Date.now()}`,
        title: faqTitle,
        category: faqCategory,
        keywords: keywordList,
        replyText: faqReply,
        isActive: true,
      };
      updatedList = [newFaq, ...faqs];
      toast.success('নতুন ট্রেইনিং FAQ যোগ করা হয়েছে!');
    }

    setFaqs(updatedList);
    setShowFaqModal(false);
    handleSaveAll({ faqs: updatedList });
  };

  // Delete FAQ
  const handleDeleteFaq = (id: string) => {
    const updated = faqs.filter((f) => f.id !== id);
    setFaqs(updated);
    toast.success('FAQ ডিলিট করা হয়েছে');
    handleSaveAll({ faqs: updated });
  };

  // Toggle FAQ Active State
  const handleToggleFaq = (id: string) => {
    const updated = faqs.map((f) => (f.id === id ? { ...f, isActive: !f.isActive } : f));
    setFaqs(updated);
    handleSaveAll({ faqs: updated });
  };

  const filteredFaqs = faqs.filter((f) => {
    const matchesCategory = selectedCategory === 'ALL' || f.category === selectedCategory;
    const matchesSearch =
      faqSearch === '' ||
      f.title.toLowerCase().includes(faqSearch.toLowerCase()) ||
      f.replyText.toLowerCase().includes(faqSearch.toLowerCase()) ||
      f.keywords.some((k) => k.includes(faqSearch.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#121622] via-[#0e1017] to-[#090b10] p-6 sm:p-8 border border-neutral-800/90 shadow-2xl">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold rounded-full mb-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>AI সেলস ও মেসেঞ্জার নলেজবেস কন্ট্রোল প্যানেল</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-neutral-100 tracking-tight">
              AI ট্রেইনিং ও চ্যাটবট ম্যানেজমেন্ট
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-2xl leading-relaxed">
              আপনার শপের প্রশ্ন-উত্তর, ডেলিভারি নিয়মাবলী ও AI এর আচার-আচরণ সম্পূর্ণ নিজের মতো কাস্টমাইজ করুন।
            </p>
          </div>

          <button
            onClick={() => handleSaveAll()}
            disabled={isSaving}
            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-neutral-950 font-bold text-sm shadow-xl shadow-emerald-500/20 active:scale-95 transition-all"
          >
            {isSaving ? <Zap className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{isSaving ? 'সেভ হচ্ছে...' : 'সব সেভ করুন'}</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-6 border-t border-neutral-800/60">
          <button
            onClick={() => setActiveTab('training')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
              activeTab === 'training'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-neutral-900/80 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200 border border-neutral-800/60'
            }`}
          >
            <BrainCircuit className="w-4 h-4" />
            <span>AI ট্রেইনিং ও FAQ নলেজবেস ({faqs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('policies')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
              activeTab === 'policies'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-neutral-900/80 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200 border border-neutral-800/60'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>শপ পলিসি ও ডেলিভারি সেটিংস</span>
          </button>

          <button
            onClick={() => setActiveTab('connections')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
              activeTab === 'connections'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-neutral-900/80 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200 border border-neutral-800/60'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>API ও মেটা কানেকশন</span>
          </button>

          <button
            onClick={() => setActiveTab('tester')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
              activeTab === 'tester'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-neutral-900/80 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200 border border-neutral-800/60'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>লাইভ চ্যাট সিমুলেটর</span>
          </button>
        </div>
      </div>

      {/* TAB 1: AI TRAINING & FAQ KNOWLEDGE BASE */}
      {activeTab === 'training' && (
        <div className="space-y-6">
          {/* AI Instructions Banner */}
          <div className="rounded-3xl bg-neutral-900/80 border border-neutral-800 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-neutral-100">AI কাস্টম প্রম্পট ও ব্যবহারের আচরণ</h3>
                  <p className="text-xs text-neutral-400">Gemini AI কাস্টমারের সাথে কীভাবে কথা বলবে তা নির্ধারণ করুন</p>
                </div>
              </div>
            </div>
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              rows={3}
              placeholder="AI এর আচরণ নির্দেশ দিন (যেমন: অত্যন্ত বিনয়ী, মিষ্টি বাংলা, বাংলিশ বুঝবে, ইমোজি ব্যবহার করবে)..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl p-4 text-xs sm:text-sm text-neutral-200 focus:outline-none focus:border-indigo-500 font-mono leading-relaxed resize-none"
            />
          </div>

          {/* FAQ Knowledge Base Section */}
          <div className="rounded-3xl bg-neutral-900/80 border border-neutral-800 p-6 sm:p-7 space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-neutral-100 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-400" />
                  <span>বট ট্রেইনিং টপিক ও প্রশ্ন-উত্তর নলেজবেস</span>
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  যেসব প্রশ্ন কাস্টমার করতে পারে এবং বট যেভাবে তাৎক্ষণিক উত্তর দেবে তা নিচে সাজানো রয়েছে।
                </p>
              </div>

              <button
                onClick={handleOpenAddFaq}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>নতুন প্রশ্ন ও উত্তর যোগ করুন</span>
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={faqSearch}
                  onChange={(e) => setFaqSearch(e.target.value)}
                  placeholder="কীওয়ার্ড বা প্রশ্ন খুঁজুন (যেমন: kobe pabo, charge, size)..."
                  className="w-full pl-10 pr-4 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs sm:text-sm text-neutral-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {['ALL', 'DELIVERY', 'PAYMENT', 'PRODUCT', 'RETURN', 'ORDER_TRACKING', 'GENERAL'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      selectedCategory === cat
                        ? 'bg-indigo-600 text-white'
                        : 'bg-neutral-950 text-neutral-400 hover:bg-neutral-800 border border-neutral-800'
                    }`}
                  >
                    {cat === 'ALL'
                      ? 'সব'
                      : cat === 'DELIVERY'
                      ? '🚚 ডেলিভারি'
                      : cat === 'PAYMENT'
                      ? '💳 পেমেন্ট'
                      : cat === 'PRODUCT'
                      ? '👗 পণ্য ও সাইজ'
                      : cat === 'RETURN'
                      ? '🔄 রিটার্ন'
                      : cat === 'ORDER_TRACKING'
                      ? '📦 ট্র্যাকিং'
                      : '💬 অন্যান্য'}
                  </button>
                ))}
              </div>
            </div>

            {/* FAQ List Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {filteredFaqs.length === 0 ? (
                <div className="col-span-2 text-center py-12 text-neutral-500 text-sm">
                  কোনো প্রশ্ন পাওয়া যায়নি। নতুন প্রশ্ন যোগ করতে উপরে ক্লিক করুন।
                </div>
              ) : (
                filteredFaqs.map((faq) => (
                  <div
                    key={faq.id}
                    className={`p-5 rounded-2xl border transition-all ${
                      faq.isActive
                        ? 'bg-neutral-950/80 border-neutral-800 hover:border-neutral-700'
                        : 'bg-neutral-950/40 border-neutral-900 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-indigo-500/15 border border-indigo-500/30 text-indigo-300">
                            {faq.category}
                          </span>
                          <h4 className="text-sm font-bold text-neutral-100">{faq.title}</h4>
                        </div>

                        <div className="flex flex-wrap gap-1 pt-1.5">
                          {faq.keywords.slice(0, 5).map((kw, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded text-[10px] font-mono bg-neutral-900 border border-neutral-800 text-neutral-400"
                            >
                              {kw}
                            </span>
                          ))}
                          {faq.keywords.length > 5 && (
                            <span className="text-[10px] text-neutral-500">+{faq.keywords.length - 5} আরও</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditFaq(faq)}
                          className="p-1.5 rounded-lg bg-neutral-900 text-neutral-400 hover:text-indigo-400 hover:bg-neutral-800 transition-colors"
                          title="এডিট করুন"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteFaq(faq.id)}
                          className="p-1.5 rounded-lg bg-neutral-900 text-neutral-400 hover:text-red-400 hover:bg-neutral-800 transition-colors"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 p-3 rounded-xl bg-neutral-900/60 border border-neutral-800/80 text-xs text-neutral-300 whitespace-pre-line leading-relaxed">
                      {faq.replyText}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STORE POLICIES & DELIVERY RULES */}
      {activeTab === 'policies' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Delivery Timeline Card */}
          <div className="rounded-3xl bg-neutral-900/80 border border-neutral-800 p-6 sm:p-7 space-y-5 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-100">ডেলিভারি সময়কাল সেটিংস</h3>
                <p className="text-xs text-neutral-400">বট কাস্টমারকে এই সময় উল্লেখ করে উত্তর দিবে</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-neutral-300 block mb-1.5">
                  ঢাকা সিটির ভেতরে ডেলিভারি সময়
                </label>
                <input
                  type="text"
                  value={deliveryTimeDhaka}
                  onChange={(e) => setDeliveryTimeDhaka(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-300 block mb-1.5">
                  ঢাকার বাইরে ডেলিভারি সময়
                </label>
                <input
                  type="text"
                  value={deliveryTimeOutside}
                  onChange={(e) => setDeliveryTimeOutside(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Delivery Fees Card */}
          <div className="rounded-3xl bg-neutral-900/80 border border-neutral-800 p-6 sm:p-7 space-y-5 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-100">ডেলিভারি চার্জ (টাকা)</h3>
                <p className="text-xs text-neutral-400">অর্ডার ক্যালকুলেশন ও প্রশ্নের উত্তরে ব্যবহৃত চার্জ</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-neutral-300 block mb-1.5">
                  ঢাকার ভেতরে ডেলিভারি চার্জ (৳)
                </label>
                <input
                  type="number"
                  value={deliveryFeeDhaka}
                  onChange={(e) => setDeliveryFeeDhaka(Number(e.target.value))}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-neutral-100 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-300 block mb-1.5">
                  ঢাকার বাইরে ডেলিভারি চার্জ (৳)
                </label>
                <input
                  type="number"
                  value={deliveryFeeOutside}
                  onChange={(e) => setDeliveryFeeOutside(Number(e.target.value))}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-neutral-100 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Customer Support & Helpline Card */}
          <div className="rounded-3xl bg-neutral-900/80 border border-neutral-800 p-6 sm:p-7 space-y-5 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <PhoneCall className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-100">কাস্টমার কেয়ার হেল্পলাইন</h3>
                <p className="text-xs text-neutral-400">জরুরি প্রয়োজনে কাস্টমার এই নম্বরে কথা বলবে</p>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-300 block mb-1.5">হেল্পলাইন নম্বর</label>
              <input
                type="text"
                value={helplinePhone}
                onChange={(e) => setHelplinePhone(e.target.value)}
                placeholder="017xxxxxxxx"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-neutral-100 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>

          {/* Return & Exchange Policy Card */}
          <div className="rounded-3xl bg-neutral-900/80 border border-neutral-800 p-6 sm:p-7 space-y-5 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-100">রিটার্ন ও পরিবর্তন পলিসি</h3>
                <p className="text-xs text-neutral-400">সাইজ সমস্যা বা ড্যামেজ থাকলে বটের উত্তর</p>
              </div>
            </div>

            <div>
              <textarea
                value={returnPolicy}
                onChange={(e) => setReturnPolicy(e.target.value)}
                rows={3}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs sm:text-sm text-neutral-100 focus:outline-none focus:border-rose-500 resize-none leading-relaxed"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CONNECTIONS & API KEYS */}
      {activeTab === 'connections' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6">
            {/* Google Gemini Card */}
            <div className="rounded-3xl bg-gradient-to-br from-[#151228] via-[#0f101d] to-[#0a0c16] border border-indigo-500/40 p-6 sm:p-7 space-y-5 shadow-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-neutral-100">Google Gemini AI Studio API Key</h3>
                    <p className="text-xs text-neutral-400">ফুল ন্যাচারাল ল্যাঙ্গুয়েজ সেলস ও ইন্টেলিজেন্ট অটোমেশন</p>
                  </div>
                </div>
              </div>

              <div>
                <input
                  type="password"
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full bg-neutral-950/80 border border-neutral-800 rounded-2xl px-4 py-3 text-xs sm:text-sm text-neutral-100 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Facebook Messenger Card */}
            <div className="rounded-3xl bg-neutral-900/80 border border-neutral-800 p-6 sm:p-7 space-y-5 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-neutral-100">Facebook Page Access Token</h3>
                  <p className="text-xs text-neutral-400">মেসেঞ্জারে স্বয়ংক্রিয় রিপ্লাই পাঠানোর টোকেন</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-neutral-300 block mb-1">Page ID</label>
                  <input
                    type="text"
                    value={fbPageId}
                    onChange={(e) => setFbPageId(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-neutral-200 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-300 block mb-1">Page Access Token</label>
                  <textarea
                    value={fbPageToken}
                    onChange={(e) => setFbPageToken(e.target.value)}
                    rows={3}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-neutral-200 font-mono resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Meta Webhook Info */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-3xl bg-neutral-900/80 border border-neutral-800 p-6 space-y-5 shadow-xl">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-neutral-100">Meta Webhook কনফিগারেশন</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-neutral-400 block mb-1">Callback URL</label>
                  <div className="flex items-center gap-2 bg-neutral-950 border border-neutral-800 rounded-xl p-2.5">
                    <input
                      type="text"
                      readOnly
                      value={webhookUrl}
                      className="bg-transparent text-xs text-neutral-300 font-mono w-full focus:outline-none"
                    />
                    <button
                      onClick={() => handleCopy(webhookUrl, 'webhook')}
                      className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300"
                    >
                      {copiedWebhook ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-neutral-400 block mb-1">Verify Token</label>
                  <div className="flex items-center gap-2 bg-neutral-950 border border-neutral-800 rounded-xl p-2.5">
                    <input
                      type="text"
                      readOnly
                      value={verifyToken}
                      className="bg-transparent text-xs text-neutral-300 font-mono w-full focus:outline-none"
                    />
                    <button
                      onClick={() => handleCopy(verifyToken, 'token')}
                      className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300"
                    >
                      {copiedToken ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: LIVE BOT SIMULATOR */}
      {activeTab === 'tester' && (
        <div className="max-w-xl mx-auto">
          <LiveBotTester />
        </div>
      )}

      {/* MODAL: ADD / EDIT FAQ */}
      {showFaqModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-7 max-w-lg w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-base font-bold text-neutral-100 flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-indigo-400" />
                <span>{editingFaq ? 'FAQ এডিট করুন' : 'নতুন ট্রেইনিং FAQ যোগ করুন'}</span>
              </h3>
              <button
                onClick={() => setShowFaqModal(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">ক্যাটাগরি</label>
                <select
                  value={faqCategory}
                  onChange={(e: any) => setFaqCategory(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="DELIVERY">🚚 ডেলিভারি সময় ও চার্জ</option>
                  <option value="PAYMENT">💳 পেমেন্ট ও ক্যাশ অন ডেলিভারি</option>
                  <option value="PRODUCT">👗 পণ্য, সাইজ ও ফেব্রিক</option>
                  <option value="RETURN">🔄 রিটার্ন ও এক্সচেঞ্জ</option>
                  <option value="ORDER_TRACKING">📦 অর্ডার স্ট্যাটাস ও ট্র্যাকিং</option>
                  <option value="GENERAL">💬 সৌজন্যতা ও সাধারণ তথ্য</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">টপিক / প্রশ্নের নাম</label>
                <input
                  type="text"
                  value={faqTitle}
                  onChange={(e) => setFaqTitle(e.target.value)}
                  placeholder="যেমন: ডেলিভারি সময় কতদিন..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">
                  ট্রিগার কীওয়ার্ডসমূহ (কমা দিয়ে আলাদা করুন)
                </label>
                <input
                  type="text"
                  value={faqKeywords}
                  onChange={(e) => setFaqKeywords(e.target.value)}
                  placeholder="kobe pabo, koydin lagbe, delivery time, কবে পাব..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">বটের স্বয়ংক্রিয় উত্তর</label>
                <textarea
                  value={faqReply}
                  onChange={(e) => setFaqReply(e.target.value)}
                  rows={4}
                  placeholder="কাস্টমারকে যে উত্তরটি দিতে চান..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-neutral-100 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800">
              <button
                onClick={() => setShowFaqModal(false)}
                className="px-4 py-2 rounded-xl bg-neutral-950 text-neutral-400 hover:bg-neutral-800 text-xs font-bold"
              >
                বাতিল
              </button>
              <button
                onClick={handleSaveFaqModal}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30"
              >
                সংরক্ষণ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
