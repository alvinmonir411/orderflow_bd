'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Zap,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  X,
  Bot,
  Truck,
  MessageSquare,
  Globe,
  Store,
  ShieldCheck,
  QrCode,
  Smartphone,
  PhoneCall,
  Check,
  RefreshCw,
  Lock,
} from 'lucide-react';
import { toast } from 'sonner';

interface StoreSetupWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

export const StoreSetupWizardModal: React.FC<StoreSetupWizardModalProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isConnectingFb, setIsConnectingFb] = useState(false);
  const [fbConnected, setFbConnected] = useState(true);
  const [selectedPage, setSelectedPage] = useState('Moner Kotha (ID: 1314475555081210)');
  const [steadfastPhone, setSteadfastPhone] = useState('01938909812');
  const [steadfastPassword, setSteadfastPassword] = useState('••••••••');
  const [isConnectingSteadfast, setIsConnectingSteadfast] = useState(false);
  const [steadfastConnected, setSteadfastConnected] = useState(true);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [deliveryDhaka, setDeliveryDhaka] = useState(120);
  const [deliveryOutside, setDeliveryOutside] = useState(150);

  if (!isOpen) return null;

  const handleConnectFacebook = () => {
    setIsConnectingFb(true);
    setTimeout(() => {
      setIsConnectingFb(false);
      setFbConnected(true);
      toast.success('🎉 ফেসবুক পেজ "Moner Kotha" সফলভাবে কানেক্ট হয়েছে!');
    }, 1200);
  };

  const handleConnectSteadfast = (e: React.FormEvent) => {
    e.preventDefault();
    setIsConnectingSteadfast(true);
    setTimeout(() => {
      setIsConnectingSteadfast(false);
      setSteadfastConnected(true);
      toast.success('🎉 Steadfast মার্চেন্ট API সফলভাবে কানেক্ট হয়েছে!');
    }, 1000);
  };

  const handleFinishSetup = () => {
    toast.success('🚀 আপনার সম্পূর্ণ শপ অটোমেশন সফলভাবে কনফিগার করা হয়েছে!');
    if (onComplete) onComplete();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#10131d] border border-neutral-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-5 border-b border-neutral-800/80 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-neutral-950 font-black shadow-md shadow-emerald-500/20">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-neutral-100 tracking-tight">
                ৩-স্টেপ ম্যাজিক সেটআপ উইজার্ড
              </h2>
              <p className="text-xs text-neutral-400">
                কোনো জটিল কোডিং ছাড়া ২ মিনিটে আপনার অনলাইন শপ চালু করুন
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-xl transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Progress Indicators */}
        <div className="grid grid-cols-3 gap-2 my-5 relative z-10">
          {[
            { step: 1, label: '১. ফেসবুক পেজ', icon: MessageSquare },
            { step: 2, label: '২. কুরিয়ার কানেক্ট', icon: Truck },
            { step: 3, label: '৩. AI সেলস এজেন্ট', icon: Bot },
          ].map((item) => (
            <div
              key={item.step}
              onClick={() => setCurrentStep(item.step)}
              className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer flex items-center justify-center gap-2 text-xs font-bold ${
                currentStep === item.step
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-md'
                  : currentStep > item.step
                  ? 'bg-neutral-850/80 border-emerald-500/30 text-emerald-400'
                  : 'bg-neutral-900/40 border-neutral-800/60 text-neutral-500'
              }`}
            >
              {currentStep > item.step ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <item.icon className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">{item.label}</span>
              <span className="sm:hidden">{item.step}</span>
            </div>
          ))}
        </div>

        {/* Step Body */}
        <div className="flex-1 overflow-y-auto py-2 relative z-10 space-y-4">
          {/* STEP 1: Facebook Page 1-Click Connect */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
              <div className="p-4 bg-gradient-to-r from-blue-950/30 to-indigo-950/20 border border-blue-500/25 rounded-2xl space-y-2">
                <h3 className="font-extrabold text-sm sm:text-base text-neutral-100 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-ping" />
                  ধাপ ১: ১-ক্লিকে ফেসবুক পেজ কানেক্ট করুন
                </h3>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  কোনো API টোকেন কপি করতে হবে না। নিচের বাটনে ক্লিক করে আপনার ফেসবুক পেজ সিলেক্ট করুন—বাকি সব অটোমেটিক হয়ে যাবে।
                </p>
              </div>

              {fbConnected ? (
                <div className="p-5 bg-neutral-900/90 border border-emerald-500/30 rounded-2xl space-y-3 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-md">
                        f
                      </div>
                      <div>
                        <p className="text-sm font-bold text-neutral-100">{selectedPage}</p>
                        <p className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>মেসেঞ্জার ও ওয়েব হুক লাইভ সক্রিয়</span>
                        </p>
                      </div>
                    </div>

                    <span className="px-3 py-1 bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold">
                      সংযুক্ত ✅
                    </span>
                  </div>

                  <div className="p-3 bg-neutral-850/80 rounded-xl text-xs text-neutral-400 leading-relaxed border border-neutral-750">
                    💡 <strong>স্বয়ংক্রিয় সুবিধা:</strong> আপনার এই পেজে কোনো গ্রাহক মেসেজ দিলে Google Gemini AI নিজে নিজেই রিপ্লাই দিবে এবং ড্যাশবোর্ডে অর্ডার সিঙ্ক করবে।
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-neutral-900/80 border border-neutral-800 rounded-2xl text-center space-y-4">
                  <button
                    onClick={handleConnectFacebook}
                    disabled={isConnectingFb}
                    className="w-full py-3.5 bg-[#1877F2] hover:bg-[#166fe5] text-white font-black text-sm rounded-2xl shadow-xl shadow-blue-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    {isConnectingFb ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>ফেসবুকের সাথে কানেক্ট হচ্ছে...</span>
                      </>
                    ) : (
                      <>
                        <span className="font-bold text-lg leading-none">f</span>
                        <span>Continue with Facebook (১-ক্লিক কানেক্ট)</span>
                      </>
                    )}
                  </button>
                  <p className="text-[11px] text-neutral-500">
                    🔒 মেটা অফিশিয়াল বিজনেস লগইন দ্বারা সুরক্ষিত
                  </p>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: Courier 1-Click Connect */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
              <div className="p-4 bg-gradient-to-r from-purple-950/30 to-pink-950/20 border border-purple-500/25 rounded-2xl space-y-2">
                <h3 className="font-extrabold text-sm sm:text-base text-neutral-100 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-purple-400" />
                  ধাপ ২: Steadfast / Pathao কুরিয়ার কানেক্ট করুন
                </h3>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  কুরিয়ারের ফোন নম্বর দিয়ে লগইন করলেই অর্ডার কনফার্ম করার পর ড্যাশবোর্ড থেকে ১-ক্লিকে পার্সেল বুকিং হয়ে যাবে।
                </p>
              </div>

              {steadfastConnected ? (
                <div className="p-5 bg-neutral-900/90 border border-emerald-500/30 rounded-2xl space-y-3 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-black text-xs">
                        SF
                      </div>
                      <div>
                        <p className="text-sm font-bold text-neutral-100">Steadfast Courier Ltd.</p>
                        <p className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>মার্চেন্ট API Key সক্রিয় (১-ক্লিক বুকিং রেডি)</span>
                        </p>
                      </div>
                    </div>

                    <span className="px-3 py-1 bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold">
                      সংযুক্ত ✅
                    </span>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleConnectSteadfast} className="p-5 bg-neutral-900/90 border border-neutral-800 rounded-2xl space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-neutral-300">Steadfast রেজিস্টার্ড ফোন নম্বর</label>
                    <input
                      type="text"
                      value={steadfastPhone}
                      onChange={(e) => setSteadfastPhone(e.target.value)}
                      placeholder="017XXXXXXXX"
                      className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-750 focus:border-purple-500 rounded-xl text-xs text-neutral-100 font-mono outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-neutral-300">মার্চেন্ট পাসওয়ার্ড</label>
                    <input
                      type="password"
                      value={steadfastPassword}
                      onChange={(e) => setSteadfastPassword(e.target.value)}
                      placeholder="পাসওয়ার্ড লিখুন..."
                      className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-750 focus:border-purple-500 rounded-xl text-xs text-neutral-100 outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isConnectingSteadfast}
                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    {isConnectingSteadfast ? 'কানেক্ট হচ্ছে...' : '১-ক্লিকে কুরিয়ার লিংক করুন'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* STEP 3: Gemini AI Settings & Launch */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
              <div className="p-4 bg-gradient-to-r from-emerald-950/30 to-teal-950/20 border border-emerald-500/25 rounded-2xl space-y-2">
                <h3 className="font-extrabold text-sm sm:text-base text-neutral-100 flex items-center gap-2">
                  <Bot className="w-4 h-4 text-emerald-400" />
                  ধাপ ৩: Google Gemini AI স্মার্ট সেলস ম্যানেজার
                </h3>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  আপনার হয়ে ২৪ ঘণ্টা সাবলীল বাংলায় কাস্টমারদের দাম, ছবি ও তথ্য দিয়ে অর্ডার কনফার্ম করবে।
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-neutral-900/80 border border-neutral-800 rounded-xl space-y-1">
                  <label className="text-neutral-400 block font-bold">ঢাকা সিটিতে ডেলিভারি ফি</label>
                  <div className="flex items-center gap-1 font-mono font-bold text-emerald-400 text-base">
                    <span>৳</span>
                    <input
                      type="number"
                      value={deliveryDhaka}
                      onChange={(e) => setDeliveryDhaka(Number(e.target.value))}
                      className="w-16 bg-neutral-950 border border-neutral-700 px-2 py-1 rounded-lg text-sm text-neutral-100"
                    />
                  </div>
                </div>

                <div className="p-3 bg-neutral-900/80 border border-neutral-800 rounded-xl space-y-1">
                  <label className="text-neutral-400 block font-bold">ঢাকার বাইরে ডেলিভারি ফি</label>
                  <div className="flex items-center gap-1 font-mono font-bold text-teal-400 text-base">
                    <span>৳</span>
                    <input
                      type="number"
                      value={deliveryOutside}
                      onChange={(e) => setDeliveryOutside(Number(e.target.value))}
                      className="w-16 bg-neutral-950 border border-neutral-700 px-2 py-1 rounded-lg text-sm text-neutral-100"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-emerald-950/40 via-neutral-900 to-neutral-900 border border-emerald-500/40 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-neutral-100">২৪/৭ AI অটোমেশন চালিত</p>
                  <p className="text-[11px] text-emerald-300 mt-0.5">
                    স্টক ও প্রডাক্ট লাইভ ডাটাবেজ থেকে রিড হবে
                  </p>
                </div>
                <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-between pt-5 border-t border-neutral-800/80 relative z-10 text-xs">
          {currentStep > 1 ? (
            <button
              onClick={() => setCurrentStep((prev) => prev - 1)}
              className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-850 text-neutral-300 border border-neutral-750 font-bold rounded-xl transition-all flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>আগের ধাপ</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep < 3 ? (
            <button
              onClick={() => setCurrentStep((prev) => prev + 1)}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-neutral-950 font-black rounded-xl shadow-lg active:scale-95 transition-all flex items-center gap-1.5"
            >
              <span>পরবর্তী ধাপ</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleFinishSetup}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-neutral-950 font-black text-sm rounded-xl shadow-xl shadow-emerald-500/25 active:scale-95 transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>সেটআপ সম্পন্ন করুন 🚀</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
