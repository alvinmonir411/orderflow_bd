'use client';

import React, { useState } from 'react';
import { Order } from '@/lib/types';
import { formatBDTEn } from '@/lib/utils';
import {
  X,
  AlertTriangle,
  FileText,
  PhoneOff,
  UserX,
  MapPinOff,
  RotateCcw,
  PackageX,
  CheckCircle2,
  HelpCircle,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';

interface CancelOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onConfirmCancel: (orderId: string, status: 'CANCELLED' | 'RETURNED', note: string) => Promise<void>;
}

export const CancelOrderModal: React.FC<CancelOrderModalProps> = ({
  isOpen,
  onClose,
  order,
  onConfirmCancel,
}) => {
  const [selectedReason, setSelectedReason] = useState<string>('ফোন বন্ধ / রিসিভ করেনি');
  const [customNote, setCustomNote] = useState<string>('');
  const [targetStatus, setTargetStatus] = useState<'CANCELLED' | 'RETURNED'>('CANCELLED');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !order) return null;

  const presetReasons = [
    {
      id: 'no_answer',
      label: 'ফোন বন্ধ / রিসিভ করেনি',
      icon: PhoneOff,
      description: 'বারবার কল দেওয়া হলেও ফোন বন্ধ বা রিসিভ করেনি',
    },
    {
      id: 'refused',
      label: 'গ্রাহক পার্সেল নিতে অস্বীকৃতি জানিয়েছে',
      icon: UserX,
      description: 'ডেলিভারির সময় বা কল করার পর অর্ডার লাগবে না বলেছে',
    },
    {
      id: 'wrong_address',
      label: 'ভুল বা অসম্পূর্ণ ডেলিভারি ঠিকানা',
      icon: MapPinOff,
      description: 'কুরিয়ার রাইডার ঠিকানায় গিয়ে কাস্টমারকে পায়নি',
    },
    {
      id: 'size_mismatch',
      label: 'সাইজ / কালার পছন্দ হয়নি (রিটার্ন)',
      icon: RotateCcw,
      description: 'পণ্য দেখার পর সাইজ বা কালার না মেলায় ফেরত পাঠিয়েছে',
    },
    {
      id: 'courier_damage',
      label: 'কুরিয়ারে নষ্ট বা ড্যামেজ পার্সেল',
      icon: PackageX,
      description: 'পার্সেল কুরিয়ার ট্রানজিটে ড্যামেজ হয়েছে',
    },
    {
      id: 'custom',
      label: 'অন্যান্য বিশেষ কারণ',
      icon: FileText,
      description: 'নিচে বিস্তারিত নোট লিখে সংরক্ষণ করুন',
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalNote = customNote.trim()
      ? `${selectedReason}: ${customNote.trim()}`
      : selectedReason;

    setIsSubmitting(true);
    try {
      await onConfirmCancel(order.id, targetStatus, finalNote);
      toast.success(
        targetStatus === 'CANCELLED'
          ? `অর্ডার #${order.orderNumber} বাতিল করা হয়েছে (নোট সেভড)`
          : `অর্ডার #${order.orderNumber} রিটার্ন মার্ক করা হয়েছে (নোট সেভড)`,
      );
      onClose();
    } catch (err) {
      toast.error('অর্ডার স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl p-4 animate-in fade-in duration-200">
      <div className="bg-[#0f1422] border border-rose-500/30 rounded-[2.5rem] w-full max-w-xl overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.9)] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-[#0a0e1a]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 font-black shadow-md shadow-rose-500/20">
              <AlertTriangle className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-black text-white text-base sm:text-lg flex items-center gap-2">
                <span>অর্ডার বাতিল বা রিটার্ন নোট</span>
                <span className="text-xs px-2 py-0.5 bg-rose-500/20 text-rose-300 rounded-md font-mono">
                  #OF-{order.orderNumber}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                গ্রাহক: <strong className="text-slate-200">{order.customerName}</strong> ({order.customerPhone})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Order Quick Summary */}
        <div className="bg-slate-950/60 border-b border-slate-800/80 px-6 py-3 flex items-center justify-between text-xs">
          <span className="text-slate-400">মোট বিল: <strong className="text-emerald-400 font-mono text-sm">{formatBDTEn(order.totalPrice)}</strong></span>
          <span className="text-slate-400">বর্তমান স্ট্যাটাস: <strong className="text-slate-200">{order.status}</strong></span>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Target Status Choice */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              স্ট্যাটাস নির্বাচন করুন:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTargetStatus('CANCELLED')}
                className={`py-2.5 px-4 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  targetStatus === 'CANCELLED'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-md shadow-rose-500/10'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                <PackageX className="w-4 h-4" />
                <span>অর্ডার বাতিল (Cancelled)</span>
              </button>
              <button
                type="button"
                onClick={() => setTargetStatus('RETURNED')}
                className={`py-2.5 px-4 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  targetStatus === 'RETURNED'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-md shadow-amber-500/10'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                <RotateCcw className="w-4 h-4" />
                <span>পার্সেল রিটার্ন (Returned)</span>
              </button>
            </div>
          </div>

          {/* Preset Reasons */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              বাতিল বা রিটার্নের মূল কারণ নির্বাচন করুন:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto pr-1">
              {presetReasons.map((r) => {
                const Icon = r.icon;
                const isSelected = selectedReason === r.label;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelectedReason(r.label)}
                    className={`p-2.5 rounded-xl text-left border transition-all flex items-start gap-2.5 cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-rose-950/60 to-slate-900 text-white border-rose-500/50 shadow-sm'
                        : 'bg-slate-900/80 text-slate-300 border-slate-800/90 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${isSelected ? 'text-rose-400' : 'text-slate-500'}`} />
                    <div>
                      <p className="text-xs font-bold leading-snug">{r.label}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Note Input */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>বিস্তারিত নোট / মন্তব্য (ঐচ্ছিক):</span>
              <span className="text-[10px] text-slate-500 font-normal">অর্ডার শিট ও কাস্টমার প্রোফাইলে দেখা যাবে</span>
            </label>
            <textarea
              rows={2}
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="যেমন: কাস্টমার বলল আগামী শুক্রবারের আগে ঢাকায় থাকবে না, তাই বাতিল করা হলো..."
              className="w-full bg-slate-900 border border-slate-800 focus:border-rose-500 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none resize-none shadow-inner"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
            >
              বাতিল করুন
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-gradient-to-r from-rose-600 via-pink-600 to-rose-600 hover:from-rose-500 hover:to-pink-500 text-white font-black rounded-xl text-xs sm:text-sm transition-all shadow-lg shadow-rose-600/30 active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'সেভ হচ্ছে...' : 'নোটসহ স্ট্যাটাস পরিবর্তন করুন'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
