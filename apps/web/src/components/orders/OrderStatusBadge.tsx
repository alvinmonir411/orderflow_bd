import React from 'react';
import { OrderStatus } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Clock, CheckCircle2, Truck, PackageCheck, XCircle, RotateCcw } from 'lucide-react';

interface Props {
  status: OrderStatus;
  className?: string;
}

export const OrderStatusBadge: React.FC<Props> = ({ status, className }) => {
  const configs: Record<
    OrderStatus,
    { label: string; bg: string; text: string; border: string; icon: any }
  > = {
    PENDING_CONFIRMATION: {
      label: 'পেন্ডিং কনফার্মেশন',
      bg: 'bg-amber-500/15',
      text: 'text-amber-300',
      border: 'border-amber-500/30',
      icon: Clock,
    },
    CONFIRMED: {
      label: 'কনফার্ম হয়েছে',
      bg: 'bg-blue-500/15',
      text: 'text-blue-300',
      border: 'border-blue-500/30',
      icon: CheckCircle2,
    },
    PROCESSING: {
      label: 'প্রসেসিং হচ্ছে',
      bg: 'bg-indigo-500/15',
      text: 'text-indigo-300',
      border: 'border-indigo-500/30',
      icon: Clock,
    },
    DISPATCHED_TO_COURIER: {
      label: 'কুরিয়ারে পাঠানো',
      bg: 'bg-purple-500/15',
      text: 'text-purple-300',
      border: 'border-purple-500/30',
      icon: Truck,
    },
    IN_TRANSIT: {
      label: 'অন দ্য ওয়ে',
      bg: 'bg-sky-500/15',
      text: 'text-sky-300',
      border: 'border-sky-500/30',
      icon: Truck,
    },
    DELIVERED: {
      label: 'ডেলিভারি সম্পন্ন',
      bg: 'bg-emerald-500/15',
      text: 'text-emerald-300',
      border: 'border-emerald-500/30',
      icon: PackageCheck,
    },
    CANCELLED: {
      label: 'বাতিল হয়েছে',
      bg: 'bg-rose-500/15',
      text: 'text-rose-300',
      border: 'border-rose-500/30',
      icon: XCircle,
    },
    RETURNED: {
      label: 'রিটার্ন এসেছে',
      bg: 'bg-red-500/15',
      text: 'text-red-300',
      border: 'border-red-500/30',
      icon: RotateCcw,
    },
  };

  const current = configs[status] || configs.PENDING_CONFIRMATION;
  const Icon = current.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border shadow-sm',
        current.bg,
        current.text,
        current.border,
        className,
      )}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span>{current.label}</span>
    </span>
  );
};
