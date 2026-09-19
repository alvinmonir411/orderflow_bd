'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Crown,
  Building2,
  Users,
  CheckCircle2,
  Clock,
  Ban,
  DollarSign,
  TrendingUp,
  Search,
  RefreshCw,
  Phone,
  Mail,
  ExternalLink,
  MessageCircle,
  ShieldCheck,
  Zap,
  Trash2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Layers,
  ChevronRight,
  CreditCard,
  Eye,
  Copy,
  Check,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { AdminOrganization, SuperAdminStats, OrganizationStatus } from '@/lib/types';
import { formatBDTEn } from '@/lib/utils';

export default function SuperAdminPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [stats, setStats] = useState<SuperAdminStats | null>(null);
  const [organizations, setOrganizations] = useState<AdminOrganization[]>([]);
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'ACTIVE' | 'SUSPENDED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);
  const [copiedTrxId, setCopiedTrxId] = useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTrxId(text);
    toast.success(`${label} কপি করা হয়েছে!`);
    setTimeout(() => setCopiedTrxId(null), 2000);
  };

  const loadData = async (statusFilter = activeTab) => {
    try {
      const res = await fetch(`/api/admin/organizations?status=${statusFilter}`);
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setOrganizations(data.organizations || []);
      } else if (res.status === 401 || res.status === 403) {
        toast.error(data.error || 'অনুমোদনহীন অ্যাক্সেস');
        router.push('/dashboard');
      }
    } catch (err) {
      console.error('[Load Admin Data Error]:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetch('/api/auth')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.user) {
          setCurrentUser(data.user);
          if (data.user.role !== 'SUPER_ADMIN') {
            toast.error('শুধুমাত্র সুপার অ্যাডমিন এই পেজ অ্যাক্সেস করতে পারবে');
            router.push('/dashboard');
          }
        } else {
          router.push('/login');
        }
      })
      .catch(() => router.push('/login'));

    loadData('ALL');
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData(activeTab);
    setTimeout(() => setIsRefreshing(false), 500);
    toast.success('ডেটা সফলভাবে রিফ্রেশ হয়েছে');
  };

  const executeOrgAction = async (orgId: string, action: 'approve' | 'suspend' | 'reactivate' | 'delete', orgName: string) => {
    setActionLoadingId(orgId);
    try {
      const res = await fetch('/api/admin/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, organizationId: orgId }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || 'কাজটি সফলভাবে সম্পন্ন হয়েছে');
        await loadData(activeTab);
      } else {
        toast.error(data.error || 'ব্যর্থ হয়েছে');
      }
    } catch (err) {
      toast.error('সার্ভারে যোগাযোগ করতে ব্যর্থ হয়েছে');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleOrgAction = (orgId: string, action: 'approve' | 'suspend' | 'reactivate' | 'delete', orgName: string) => {
    if (action === 'delete') {
      toast.warning(`'${orgName}' ডিলিট করতে চান?`, {
        description: 'স্টোর ও এর সকল ডেটা চিরতরে মুছে যাবে।',
        action: {
          label: 'হ্যাঁ, ডিলিট করুন',
          onClick: () => executeOrgAction(orgId, 'delete', orgName),
        },
        cancel: {
          label: 'বাতিল',
          onClick: () => {},
        },
        duration: 8000,
      });
      return;
    }

    executeOrgAction(orgId, action, orgName);
  };

  const filteredOrgs = useMemo(() => {
    return organizations.filter((org) => {
      const matchesTab = activeTab === 'ALL' || org.status === activeTab;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        org.name.toLowerCase().includes(q) ||
        org.ownerName.toLowerCase().includes(q) ||
        org.ownerEmail.toLowerCase().includes(q) ||
        org.ownerPhone.includes(q) ||
        org.slug.toLowerCase().includes(q);
      return matchesTab && matchesSearch;
    });
  }, [organizations, activeTab, searchQuery]);

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case 'STARTER':
        return { label: 'Starter (৳৯৯৯/মাস)', color: 'bg-slate-800 text-slate-300 border-slate-700' };
      case 'BUSINESS':
        return { label: 'Business (৳২,৪৯০/মাস)', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' };
      case 'PRO':
      default:
        return { label: 'Pro VIP (৳৪,৯৯০/মাস)', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };
    }
  };

  const getStatusBadge = (status: OrganizationStatus) => {
    switch (status) {
      case 'PENDING':
        return {
          label: '⏳ অনুমোদনের অপেক্ষায়',
          color: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        };
      case 'ACTIVE':
        return {
          label: '✅ সক্রিয় (Active)',
          color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        };
      case 'SUSPENDED':
        return {
          label: '🚫 স্থগিত (Suspended)',
          color: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
        };
      default:
        return {
          label: 'সক্রিয়',
          color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        };
    }
  };

  const getWhatsAppLink = (phone: string, orgName: string, ownerName: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const intlPhone = cleanPhone.startsWith('88') ? cleanPhone : `88${cleanPhone}`;
    const text = encodeURIComponent(
      `আসসালামু আলাইকুম ${ownerName},\nOrderFlow BD SaaS প্ল্যাটফর্মে আপনার স্টোর '${orgName}' রেজিস্ট্রেশন করার জন্য ধন্যবাদ। আপনার পেমেন্ট কনফার্মেশনের জন্য যোগাযোগ করছি।`,
    );
    return `https://wa.me/${intlPhone}?text=${text}`;
  };

  return (
    <div className="min-h-screen bg-[#06080e] text-white p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-indigo-950/80 via-slate-900 to-[#0c1222] border border-indigo-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 shrink-0">
            <Crown className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                SaaS Master Control Panel
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full">
                Super Admin
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              রেজিস্ট্রেশন অনুমোদন, মার্চেন্ট পেমেন্ট ভেরিফিকেশন ও মাল্টি-টেন্যান্ট প্ল্যাটফর্ম পরিচালনা
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-4 py-2.5 bg-slate-800/90 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
            <span>রিফ্রেশ করুন</span>
          </button>
          <Link
            href="/dashboard"
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <span>মার্চেন্ট ড্যাশবোর্ড</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Stores */}
        <div className="bg-[#0b0f19] border border-slate-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">মোট রেজিস্টার্ড স্টোর</span>
            <div className="p-2 bg-blue-500/15 text-blue-400 rounded-xl">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{stats?.totalOrganizations || 0}</span>
            <span className="text-xs text-slate-400 font-medium">টি ব্যবসা</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">প্ল্যাটফর্মে মোট তৈরি হওয়া বিজনেস</p>
        </div>

        {/* Pending Approvals */}
        <div className="bg-[#0b0f19] border border-amber-500/40 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-amber-400 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>অনুমোদনের অপেক্ষায়</span>
            </span>
            <div className="p-2 bg-amber-500/20 text-amber-300 rounded-xl border border-amber-500/30">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-300">{stats?.pendingApprovals || 0}</span>
            <span className="text-xs text-amber-400/80 font-medium">পেন্ডিং স্টোর</span>
          </div>
          <p className="text-[11px] text-amber-400/70 mt-1">পেমেন্ট ভেরিফাই করে অনুমোদন দিন</p>
        </div>

        {/* Active Businesses */}
        <div className="bg-[#0b0f19] border border-emerald-500/30 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-emerald-400 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">সক্রিয় স্টোর</span>
            <div className="p-2 bg-emerald-500/15 text-emerald-400 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-400">{stats?.activeBusinesses || 0}</span>
            <span className="text-xs text-slate-400 font-medium">টি চালু আছে</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">মার্চেন্টরা রেগুলার ব্যবহার করছে</p>
        </div>

        {/* Estimated MRR */}
        <div className="bg-[#0b0f19] border border-purple-500/30 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-purple-400 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">আনুমানিক মাসিক রাজস্ব (MRR)</span>
            <div className="p-2 bg-purple-500/15 text-purple-300 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-purple-300">{formatBDTEn(stats?.estimatedMRR || 0)}</span>
            <span className="text-xs text-purple-400 font-medium">/মাস</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">সক্রিয় সাবস্ক্রিপশন প্যাকেজ আয়</p>
        </div>
      </div>

      {/* Main Table & Filter Section */}
      <div className="bg-[#0b0f19] border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-6">
        {/* Controls Bar: Tabs & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 border border-slate-800 rounded-2xl overflow-x-auto">
            {[
              { id: 'ALL', label: 'সকল স্টোর', count: stats?.totalOrganizations },
              { id: 'PENDING', label: '⏳ অপেক্ষমান', count: stats?.pendingApprovals, alert: true },
              { id: 'ACTIVE', label: '✅ সক্রিয়', count: stats?.activeBusinesses },
              { id: 'SUSPENDED', label: '🚫 স্থগিত', count: stats?.suspendedBusinesses },
            ].map((tab) => {
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    loadData(tab.id as any);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                    isSelected
                      ? tab.alert
                        ? 'bg-amber-500 text-slate-950 shadow-md'
                        : 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                        isSelected
                          ? tab.alert
                            ? 'bg-amber-950 text-amber-200'
                            : 'bg-indigo-950 text-indigo-200'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[260px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="স্টোর, নাম, ইমেইল বা ফোন দিয়ে খুঁজুন..."
              className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-2xl pl-10 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none transition-all shadow-inner"
            />
          </div>
        </div>

        {/* Organizations List / Table */}
        {isLoading ? (
          <div className="py-16 text-center text-slate-400 space-y-3">
            <RefreshCw className="w-8 h-8 mx-auto animate-spin text-indigo-400" />
            <p className="text-sm font-medium">মার্চেন্ট তথ্য লোড হচ্ছে...</p>
          </div>
        ) : filteredOrgs.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-3 border border-dashed border-slate-800 rounded-2xl">
            <Building2 className="w-10 h-10 mx-auto text-slate-600" />
            <p className="text-sm font-bold text-slate-300">কোনো স্টোর পাওয়া যায়নি</p>
            <p className="text-xs text-slate-500">আপনার সার্চ বা ফিল্টারের সাথে কোনো রেকর্ড মেলেনি</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrgs.map((org) => {
              const plan = getPlanBadge(org.plan);
              const status = getStatusBadge(org.status);
              const isActionLoading = actionLoadingId === org.id;

              return (
                <div
                  key={org.id}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                    org.status === 'PENDING'
                      ? 'bg-gradient-to-r from-amber-950/20 via-slate-900/90 to-slate-900/60 border-amber-500/40 shadow-lg shadow-amber-500/5'
                      : org.status === 'SUSPENDED'
                      ? 'bg-slate-900/50 border-rose-500/30 opacity-80'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Store & Owner Meta */}
                    <div className="space-y-2 min-w-0">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h3 className="font-extrabold text-base sm:text-lg text-white tracking-tight flex items-center gap-2">
                          <span>{org.name}</span>
                          <span className="text-xs font-mono font-normal text-slate-500">({org.slug})</span>
                        </h3>
                        <span className={`px-2 py-0.5 text-[11px] font-bold rounded-full border ${status.color}`}>
                          {status.label}
                        </span>
                        <span className={`px-2 py-0.5 text-[11px] font-medium rounded-full border ${plan.color}`}>
                          {plan.label}
                        </span>
                      </div>

                      {/* Merchant Contact Info */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-indigo-400" />
                          <span className="font-bold text-slate-200">{org.ownerName}</span>
                        </span>
                        {org.ownerEmail && (
                          <span className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-slate-500" />
                            <span className="font-mono">{org.ownerEmail}</span>
                          </span>
                        )}
                        <span className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="font-mono text-emerald-300 font-bold">{org.ownerPhone}</span>
                        </span>
                        <span className="text-slate-500 text-[11px]">
                          রেজিস্ট্রেশন: {new Date(org.createdAt).toLocaleDateString('bn-BD')}
                        </span>
                      </div>

                      {/* Payment Proof Section (bKash / Nagad / Rocket) */}
                      {(org.paymentMethod || org.paymentTrxId || org.paymentScreenshot) ? (
                        <div className="mt-2.5 p-3 bg-slate-950/70 border border-slate-800/90 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
                          <div className="flex flex-wrap items-center gap-3">
                            {/* Method Badge */}
                            <div className="flex items-center gap-1.5">
                              <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                              <span className={`px-2 py-0.5 rounded-lg text-[11px] font-bold border ${
                                org.paymentMethod === 'bKash'
                                  ? 'bg-pink-500/20 text-pink-300 border-pink-500/30'
                                  : org.paymentMethod === 'Nagad'
                                  ? 'bg-orange-500/20 text-orange-300 border-orange-500/30'
                                  : 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                              }`}>
                                {org.paymentMethod || 'bKash'}
                              </span>
                            </div>

                            {/* Sender Phone */}
                            {org.paymentSenderPhone && (
                              <div className="flex items-center gap-1 text-slate-300">
                                <span className="text-slate-500 text-[11px]">প্রেরক:</span>
                                <span className="font-mono font-bold text-emerald-400">{org.paymentSenderPhone}</span>
                              </div>
                            )}

                            {/* Trx ID */}
                            {org.paymentTrxId && (
                              <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-lg">
                                <span className="text-slate-500 text-[10px]">TrxID:</span>
                                <span className="font-mono font-bold text-white tracking-wider">{org.paymentTrxId}</span>
                                <button
                                  type="button"
                                  onClick={() => handleCopy(org.paymentTrxId!, 'Trx ID')}
                                  className="text-slate-400 hover:text-white cursor-pointer ml-1"
                                  title="Trx ID কপি করুন"
                                >
                                  {copiedTrxId === org.paymentTrxId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                </button>
                              </div>
                            )}

                            {/* Note if any */}
                            {org.paymentNote && (
                              <span className="text-slate-400 text-[11px] italic">
                                "{org.paymentNote}"
                              </span>
                            )}
                          </div>

                          {/* Screenshot View Button */}
                          {org.paymentScreenshot && (
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setSelectedScreenshot(org.paymentScreenshot!)}
                                className="px-2.5 py-1 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:scale-102"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>স্ক্রিনশট দেখুন</span>
                              </button>
                            </div>
                          )}
                        </div>
                      ) : org.status === 'PENDING' ? (
                        <div className="mt-2 text-[11px] text-amber-400/90 flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg w-fit">
                          <Clock className="w-3 h-3 animate-pulse" />
                          <span>পেমেন্ট প্রুফ এখনো ওয়েবসাইটে সাবমিট করেনি (হোয়াটসঅ্যাপে যোগাযোগ করুন)</span>
                        </div>
                      ) : null}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                      {/* WhatsApp Direct Chat Button */}
                      <a
                        href={getWhatsAppLink(org.ownerPhone, org.name, org.ownerName)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 hover:border-emerald-400 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                        title="পেমেন্টের জন্য মার্চেন্টের সাথে হোয়াটসঅ্যাপে চ্যাট করুন"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                        <span>হোয়াটসঅ্যাপ যোগাযোগ</span>
                      </a>

                      {/* If PENDING: Approve Button */}
                      {org.status === 'PENDING' && (
                        <button
                          onClick={() => handleOrgAction(org.id, 'approve', org.name)}
                          disabled={isActionLoading}
                          className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-xl text-xs transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>{isActionLoading ? 'অনুমোদন হচ্ছে...' : 'অনুমোদন করুন (Approve)'}</span>
                        </button>
                      )}

                      {/* If ACTIVE: Suspend Button */}
                      {org.status === 'ACTIVE' && org.id !== 'org-1' && (
                        <button
                          onClick={() => handleOrgAction(org.id, 'suspend', org.name)}
                          disabled={isActionLoading}
                          className="px-3 py-2 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <Ban className="w-3.5 h-3.5" />
                          <span>স্থগিত করুন</span>
                        </button>
                      )}

                      {/* If SUSPENDED: Reactivate Button */}
                      {org.status === 'SUSPENDED' && (
                        <button
                          onClick={() => handleOrgAction(org.id, 'reactivate', org.name)}
                          disabled={isActionLoading}
                          className="px-3 py-2 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>পুনরায় সক্রিয় করুন</span>
                        </button>
                      )}

                      {/* Delete Button (Except Master Org) */}
                      {org.id !== 'org-1' && (
                        <button
                          onClick={() => handleOrgAction(org.id, 'delete', org.name)}
                          disabled={isActionLoading}
                          className="p-2 bg-slate-800 hover:bg-rose-600/20 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-500/30 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                          title="স্টোর ডিলিট করুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Full-screen Screenshot Modal */}
      {selectedScreenshot && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedScreenshot(null)}
        >
          <div
            className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 max-w-2xl w-full max-h-[90vh] flex flex-col space-y-4 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm sm:text-base font-bold text-white">পেমেন্ট ভেরিফিকেশন স্ক্রিনশট</h3>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={selectedScreenshot}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-all"
                  title="নতুন ট্যাবে খুলুন"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  onClick={() => setSelectedScreenshot(null)}
                  className="p-1.5 text-slate-400 hover:text-rose-400 bg-slate-800 hover:bg-rose-500/20 rounded-lg transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto rounded-2xl bg-black/50 border border-slate-800 flex items-center justify-center p-2 min-h-[300px]">
              <img
                src={selectedScreenshot}
                alt="Payment Screenshot"
                className="max-h-[70vh] w-auto max-w-full object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
