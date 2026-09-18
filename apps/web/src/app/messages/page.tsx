'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { api } from '@/lib/api';
import { Order, Product, User } from '@/lib/types';
import { formatBDTEn } from '@/lib/utils';
import {
  MessageSquare,
  Search,
  Bot,
  User as UserIcon,
  Send,
  Sparkles,
  PhoneCall,
  MapPin,
  Truck,
  ExternalLink,
  CheckCheck,
  Clock,
  ShoppingBag,
  Zap,
  Filter,
  CheckCircle2,
  RefreshCw,
  MessageCircle,
  ShieldCheck,
  ChevronRight,
  Smile,
  Paperclip,
  Printer,
  Inbox,
  Tag,
  Plus,
  X,
  FileText,
  Activity,
  UserCheck,
  Layers,
  Flame,
  Crown,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';

interface ChatMessage {
  id: string;
  sender: 'customer' | 'ai' | 'admin';
  text: string;
  time: string;
  image?: string;
  productCard?: {
    title: string;
    price: number;
    image: string;
  };
}

interface ConversationThread {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  channel: 'FACEBOOK_MESSENGER' | 'WHATSAPP' | 'MANUAL_ENTRY' | string;
  psid?: string;
  productInterest?: string;
  productImage?: string;
  productPrice?: number;
  lastMessage: string;
  lastTime: string;
  unread: boolean;
  orderNumber?: number;
  orderStatus?: string;
  totalSpent?: number;
  isAiActive: boolean;
  status: 'OPEN' | 'PENDING' | 'RESOLVED' | 'CLOSED';
  assignedToId?: string | null;
  assignedToName?: string | null;
  tags: string[];
  messages: ChatMessage[];
}

interface InternalNoteItem {
  id: string;
  authorName: string;
  content: string;
  createdAt: string;
}

interface TimelineItem {
  id: string;
  actorName: string;
  actionType: string;
  description: string;
  createdAt: string;
}

export default function MessagesPage() {
  const [threads, setThreads] = useState<ConversationThread[]>([]);
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);

  // Filters
  const [activeStatusFilter, setActiveStatusFilter] = useState<string>('ALL');
  const [activeChannelFilter, setActiveChannelFilter] = useState<string>('ALL');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('ALL');
  const [selectedTagFilter, setSelectedTagFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Center column modes: 'CHAT' vs 'NOTES'
  const [centerTab, setCenterTab] = useState<'CHAT' | 'NOTES'>('CHAT');

  // Input states
  const [replyText, setReplyText] = useState('');
  const [internalNoteText, setInternalNoteText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Active thread details (Notes & Timeline)
  const [threadNotes, setThreadNotes] = useState<InternalNoteItem[]>([]);
  const [threadTimeline, setThreadTimeline] = useState<TimelineItem[]>([]);

  const PRESET_TAGS = [
    { label: '🔥 Hot Lead', color: 'bg-rose-500/15 text-rose-300 border-rose-500/30' },
    { label: '💎 VIP', color: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30' },
    { label: '⏰ Follow Up', color: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
    { label: '🛍️ Interested', color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
    { label: '⚠️ Complaint', color: 'bg-red-500/15 text-red-300 border-red-500/30' },
    { label: '🚚 High Value', color: 'bg-purple-500/15 text-purple-300 border-purple-500/30' },
  ];

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [convRes, teamRes] = await Promise.all([
        fetch('/api/conversation?list=true'),
        fetch('/api/team'),
      ]);

      const convData = await convRes.json();
      const teamData = await teamRes.json();

      if (convData.success && Array.isArray(convData.threads)) {
        setThreads(convData.threads);
        if (convData.threads.length > 0 && !selectedThreadId) {
          setSelectedThreadId(convData.threads[0].id);
        }
      }

      if (teamData.success && Array.isArray(teamData.members)) {
        setTeamMembers(teamData.members);
      }
    } catch (e) {
      console.error('[Load Conversations Error]:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const currentThread = threads.find((t) => t.id === selectedThreadId) || threads[0] || null;

  // Load Notes & Timeline for current selected thread
  useEffect(() => {
    if (!currentThread) return;
    const convKey = currentThread.psid || currentThread.id;
    fetch(`/api/conversation?convId=${convKey}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setThreadNotes(data.notes || []);
          setThreadTimeline(data.timeline || []);
        }
      })
      .catch(() => {});
  }, [currentThread?.id]);

  // Filtered threads logic
  const filteredThreads = useMemo(() => {
    return threads.filter((t) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = (t.customerName || '').toLowerCase().includes(q);
        const matchPhone = (t.customerPhone || '').includes(q);
        const matchProduct = (t.productInterest || '').toLowerCase().includes(q);
        const matchLast = (t.lastMessage || '').toLowerCase().includes(q);
        if (!matchName && !matchPhone && !matchProduct && !matchLast) return false;
      }

      // 2. Status Filter
      if (activeStatusFilter !== 'ALL' && t.status !== activeStatusFilter) {
        return false;
      }

      // 3. Channel Filter
      if (activeChannelFilter === 'MESSENGER' && t.channel !== 'FACEBOOK_MESSENGER') return false;
      if (activeChannelFilter === 'COMMENTS' && t.channel !== 'FACEBOOK_COMMENT') return false;
      if (activeChannelFilter === 'WHATSAPP' && t.channel !== 'WHATSAPP') return false;
      if (activeChannelFilter === 'ORDERS' && !t.orderNumber) return false;

      // 4. Assignee Filter
      if (assigneeFilter === 'UNASSIGNED' && t.assignedToId) return false;
      if (assigneeFilter !== 'ALL' && assigneeFilter !== 'UNASSIGNED' && t.assignedToId !== assigneeFilter) {
        return false;
      }

      // 5. Tag Filter
      if (selectedTagFilter !== 'ALL' && !t.tags.includes(selectedTagFilter)) {
        return false;
      }

      return true;
    });
  }, [threads, searchQuery, activeStatusFilter, activeChannelFilter, assigneeFilter, selectedTagFilter]);

  // Send message to Customer
  const handleSendReply = async () => {
    if (!replyText.trim() || !currentThread) return;

    setIsSending(true);
    const newMsgText = replyText.trim();
    setReplyText('');

    const newMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      sender: 'admin',
      text: newMsgText,
      time: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
    };

    setThreads((prev) =>
      prev.map((t) => {
        if (t.id === currentThread.id) {
          return {
            ...t,
            lastMessage: `[অ্যাডমিন]: ${newMsgText}`,
            lastTime: 'এখনই',
            unread: false,
            messages: [...t.messages, newMsg],
          };
        }
        return t;
      }),
    );

    try {
      const res = await fetch('/api/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: currentThread.orderNumber,
          customerPhone: currentThread.customerPhone,
          psid: currentThread.psid,
          message: newMsgText,
          channel: currentThread.channel,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(
          currentThread.channel === 'FACEBOOK_MESSENGER'
            ? 'মেসেঞ্জারে কাস্টমারকে সরাসরি পাঠানো হয়েছে! 🚀'
            : 'হোয়াটসঅ্যাপ চ্যাটে মেসেজ রেকর্ড হয়েছে!',
        );
      }
    } catch (e) {
      toast.error('মেসেজ পাঠাতে সমস্যা হয়েছে');
    } finally {
      setIsSending(false);
    }
  };

  // Add Internal Note
  const handleAddInternalNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!internalNoteText.trim() || !currentThread) return;

    const convKey = currentThread.psid || currentThread.id;
    try {
      const res = await fetch('/api/conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_note',
          convId: convKey,
          senderId: currentThread.psid,
          noteContent: internalNoteText.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success('প্রাইভেট ইন্টারনাল নোট সেভ হয়েছে!');
        setInternalNoteText('');
        if (data.note) {
          setThreadNotes((prev) => [...prev, data.note]);
        }
        // Refresh timeline
        const tRes = await fetch(`/api/conversation?convId=${convKey}`);
        const tData = await tRes.json();
        if (tData.success) {
          setThreadTimeline(tData.timeline || []);
        }
      }
    } catch {
      toast.error('নোট সেভ করতে সমস্যা হয়েছে');
    }
  };

  // Update Status
  const handleStatusChange = async (newStatus: 'OPEN' | 'PENDING' | 'RESOLVED' | 'CLOSED') => {
    if (!currentThread) return;
    const convKey = currentThread.psid || currentThread.id;

    setThreads((prev) =>
      prev.map((t) => (t.id === currentThread.id ? { ...t, status: newStatus } : t)),
    );

    try {
      await fetch('/api/conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'status',
          convId: convKey,
          senderId: currentThread.psid,
          status: newStatus,
        }),
      });
      toast.success(`চ্যাটের স্ট্যাটাস '${newStatus}' এ পরিবর্তন করা হয়েছে`);
    } catch {}
  };

  // Update Assignment
  const handleAssignChange = async (memberId: string) => {
    if (!currentThread) return;
    const convKey = currentThread.psid || currentThread.id;

    const selectedMember = teamMembers.find((m) => m.id === memberId);
    const assignedName = selectedMember ? selectedMember.name : null;
    const assignedId = selectedMember ? selectedMember.id : null;

    setThreads((prev) =>
      prev.map((t) =>
        t.id === currentThread.id
          ? { ...t, assignedToId: assignedId, assignedToName: assignedName }
          : t,
      ),
    );

    try {
      await fetch('/api/conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'assign',
          convId: convKey,
          senderId: currentThread.psid,
          assignedToId: assignedId,
          assignedToName: assignedName,
        }),
      });
      toast.success(
        assignedName ? `চ্যাটটি ${assignedName}-কে অ্যাসাইন করা হয়েছে` : 'চ্যাটটি আনঅ্যাসাইন করা হয়েছে',
      );
    } catch {}
  };

  // Toggle Tag
  const handleToggleTag = async (tagLabel: string) => {
    if (!currentThread) return;
    const convKey = currentThread.psid || currentThread.id;

    const exists = currentThread.tags.includes(tagLabel);
    const newTags = exists
      ? currentThread.tags.filter((t) => t !== tagLabel)
      : [...currentThread.tags, tagLabel];

    setThreads((prev) =>
      prev.map((t) => (t.id === currentThread.id ? { ...t, tags: newTags } : t)),
    );

    try {
      await fetch('/api/conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'tags',
          convId: convKey,
          senderId: currentThread.psid,
          tags: newTags,
        }),
      });
      toast.success(exists ? `ট্যাগ '${tagLabel}' সরানো হয়েছে` : `ট্যাগ '${tagLabel}' যুক্ত হয়েছে`);
    } catch {}
  };

  const handleToggleAi = (threadId: string) => {
    setThreads((prev) =>
      prev.map((t) => {
        if (t.id === threadId) {
          const nextState = !t.isAiActive;
          toast.info(
            nextState
              ? `🤖 ${t.customerName}-এর জন্য Gemini AI অটোমেশন চালু`
              : `👤 ${t.customerName}-এর জন্য হিউম্যান টেকওভার মোড চালু`,
          );
          return { ...t, isAiActive: nextState };
        }
        return t;
      }),
    );
  };

  const handleCopyText = (text: string, id: string, label = 'ঠিকানা') => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success(`${label} কপি করা হয়েছে!`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 pb-12 w-full max-w-[1700px] mx-auto">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#10131d] via-[#0d1017] to-[#090b10] p-5 sm:p-6 rounded-3xl border border-neutral-800/90 shadow-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-tr from-emerald-500 to-teal-400 text-neutral-950 font-black rounded-xl">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-neutral-100 tracking-tight">
              সেন্ট্রালাইজড ইনবক্স ও <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">লাইভ CRM হাব</span>
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-neutral-400">
            ফেসবুক মেসেঞ্জার, হোয়াটসঅ্যাপ ও ফোন কলের সব চ্যাট এক স্ক্রিনে। টিম মেম্বারকে চ্যাট অ্যাসাইন করুন, কাস্টম ট্যাগ লাগান এবং প্রাইভেট ইন্টারনাল নোট সেভ করুন।
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-3.5 py-2 bg-neutral-900 hover:bg-neutral-850 text-neutral-300 border border-neutral-750 rounded-xl text-xs font-semibold transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isLoading ? 'animate-spin' : ''}`} />
            <span>লাইভ সিঙ্ক</span>
          </button>
        </div>
      </div>

      {/* Main 3-Column Unified CRM Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[820px]">
        {/* ==================================================== */}
        {/* LEFT COLUMN: Conversation List & Smart Filters (3.8 Cols) */}
        {/* ==================================================== */}
        <div className="lg:col-span-4 bg-[#10131d] border border-neutral-800/90 rounded-3xl flex flex-col overflow-hidden shadow-2xl">
          {/* Status Tabs + Search */}
          <div className="p-3.5 border-b border-neutral-800/80 space-y-2.5 bg-neutral-900/40">
            {/* Status Tabs */}
            <div className="grid grid-cols-5 gap-1 text-[11px] font-bold">
              {[
                { id: 'ALL', label: 'সব', count: threads.length },
                { id: 'OPEN', label: 'Open', count: threads.filter((t) => t.status === 'OPEN').length },
                { id: 'PENDING', label: 'Pending', count: threads.filter((t) => t.status === 'PENDING').length },
                { id: 'RESOLVED', label: 'Done', count: threads.filter((t) => t.status === 'RESOLVED').length },
                { id: 'CLOSED', label: 'Closed', count: threads.filter((t) => t.status === 'CLOSED').length },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => setActiveStatusFilter(st.id)}
                  className={`py-1.5 px-1 rounded-xl text-center transition-all cursor-pointer border ${
                    activeStatusFilter === st.id
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-400/40 shadow-sm'
                      : 'bg-neutral-900/80 text-neutral-400 border-neutral-800 hover:text-white'
                  }`}
                >
                  <span>{st.label}</span>{' '}
                  <span className="text-[9px] opacity-75 font-mono">({st.count})</span>
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="নাম, ফোন বা প্রোডাক্ট সার্চ..."
                className="w-full pl-10 pr-4 py-2 bg-neutral-900 border border-neutral-750 focus:border-emerald-500 rounded-xl text-xs text-neutral-100 placeholder-neutral-500 outline-none transition-all shadow-inner"
              />
            </div>

            {/* Sub Filter Controls: Channel & Assignee */}
            <div className="grid grid-cols-2 gap-2">
              <select
                value={activeChannelFilter}
                onChange={(e) => setActiveChannelFilter(e.target.value)}
                className="bg-neutral-900 border border-neutral-750 text-[11px] text-neutral-300 rounded-xl px-2.5 py-1.5 outline-none cursor-pointer"
              >
                <option value="ALL">সব চ্যানেল (All)</option>
                <option value="MESSENGER">🔵 Messenger</option>
                <option value="WHATSAPP">🟢 WhatsApp</option>
                <option value="COMMENTS">💬 FB Comments</option>
                <option value="ORDERS">📦 Orders Only</option>
              </select>

              <select
                value={assigneeFilter}
                onChange={(e) => setAssigneeFilter(e.target.value)}
                className="bg-neutral-900 border border-neutral-750 text-[11px] text-neutral-300 rounded-xl px-2.5 py-1.5 outline-none cursor-pointer"
              >
                <option value="ALL">সব টিম মেম্বার</option>
                <option value="UNASSIGNED">আন-অ্যাসাইনড চ্যাট</option>
                {teamMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    👤 {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Threads List */}
          <div className="flex-1 overflow-y-auto divide-y divide-neutral-855/60 p-2 space-y-1">
            {filteredThreads.length === 0 ? (
              <div className="py-20 px-4 text-center space-y-2">
                <Inbox className="w-10 h-10 text-neutral-600 mx-auto" />
                <p className="text-sm font-bold text-neutral-300">কোনো চ্যাট পাওয়া যায়নি</p>
                <p className="text-xs text-neutral-500">অন্য ফিল্টার বা সার্চ দিয়ে চেষ্টা করুন</p>
              </div>
            ) : (
              filteredThreads.map((t) => {
                const isSelected = t.id === currentThread?.id;

                const getChannelBadge = (ch: string) => {
                  if (ch === 'FACEBOOK_COMMENT') return { bg: 'bg-indigo-600', label: 'C', title: 'Facebook Comment' };
                  if (ch === 'INSTAGRAM') return { bg: 'bg-pink-600', label: 'IG', title: 'Instagram' };
                  if (ch === 'WHATSAPP') return { bg: 'bg-emerald-600', label: 'WA', title: 'WhatsApp' };
                  return { bg: 'bg-blue-600', label: 'M', title: 'Messenger' };
                };

                const badge = getChannelBadge(t.channel);

                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedThreadId(t.id)}
                    className={`w-full p-3 rounded-2xl text-left transition-all flex items-start gap-2.5 border cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-emerald-500/15 via-emerald-500/5 to-transparent border-emerald-500/40 text-neutral-100 shadow-md scale-[1.01]'
                        : 'bg-neutral-900/40 hover:bg-neutral-850/70 border-transparent text-neutral-300'
                    }`}
                  >
                    {/* Avatar with Channel Badge */}
                    <div className="relative shrink-0 mt-0.5">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-neutral-800 to-neutral-700 flex items-center justify-center font-bold text-xs text-neutral-200 shadow-sm border border-neutral-700">
                        {t.customerName.slice(0, 2)}
                      </div>
                      <span
                        className={`absolute -bottom-1 -right-1 px-1 min-w-[16px] h-3.5 rounded-full flex items-center justify-center text-[7.5px] font-black text-white shadow-sm ${badge.bg}`}
                        title={badge.title}
                      >
                        {badge.label}
                      </span>
                    </div>

                    {/* Thread Info */}
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-xs truncate text-white">
                          {t.customerName}
                        </span>
                        <span className="text-[10px] text-neutral-500 font-mono shrink-0">
                          {t.lastTime}
                        </span>
                      </div>

                      <p className="text-xs text-neutral-400 truncate font-normal leading-tight">
                        {t.lastMessage}
                      </p>

                      {/* Tag Chips & Assignee badge */}
                      <div className="flex flex-wrap items-center gap-1 pt-0.5">
                        {t.assignedToName && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 text-[9px] font-medium bg-neutral-800 text-neutral-300 border border-neutral-700 rounded-md">
                            👤 {t.assignedToName.split(' ')[0]}
                          </span>
                        )}

                        {t.tags.slice(0, 2).map((tag, i) => (
                          <span
                            key={i}
                            className="px-1.5 py-0.2 text-[9px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 rounded-md"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Status & Unread Dot */}
                    <div className="flex flex-col items-end gap-1.5 shrink-0 pt-1">
                      {t.unread && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
                      <span
                        className={`text-[8px] font-bold px-1.5 py-0.5 rounded-md border font-mono ${
                          t.status === 'OPEN'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : t.status === 'PENDING'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ==================================================== */}
        {/* CENTER COLUMN: Live Conversation Window & Notes (5.2 Cols) */}
        {/* ==================================================== */}
        <div className="lg:col-span-5 bg-[#10131d] border border-neutral-800/90 rounded-3xl flex flex-col overflow-hidden shadow-2xl">
          {currentThread ? (
            <>
              {/* Thread Header Controls */}
              <div className="p-3.5 border-b border-neutral-800/80 bg-neutral-900/60 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-neutral-950 font-black text-xs shrink-0">
                    {currentThread.customerName.slice(0, 2)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-neutral-100 truncate">
                        {currentThread.customerName}
                      </h3>
                      {/* Status Dropdown */}
                      <select
                        value={currentThread.status}
                        onChange={(e) => handleStatusChange(e.target.value as any)}
                        className="bg-slate-900 border border-slate-750 text-[10px] font-bold text-emerald-300 rounded-lg px-2 py-0.5 outline-none cursor-pointer"
                      >
                        <option value="OPEN">🟢 Open</option>
                        <option value="PENDING">⏳ Pending</option>
                        <option value="RESOLVED">✅ Resolved</option>
                        <option value="CLOSED">🔒 Closed</option>
                      </select>
                    </div>

                    {/* Assign to team dropdown */}
                    <div className="flex items-center gap-1 mt-0.5">
                      <UserCheck className="w-3 h-3 text-slate-400" />
                      <select
                        value={currentThread.assignedToId || ''}
                        onChange={(e) => handleAssignChange(e.target.value)}
                        className="bg-transparent text-[11px] text-slate-300 outline-none cursor-pointer hover:text-white"
                      >
                        <option value="" className="bg-slate-900">
                          আন-অ্যাসাইনড (Unassigned)
                        </option>
                        {teamMembers.map((m) => (
                          <option key={m.id} value={m.id} className="bg-slate-900">
                            {m.name} ({m.title || 'Staff'})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Right controls: AI toggle + Chat/Notes tab switcher */}
                <div className="flex items-center gap-2">
                  {/* Chat / Notes tab pill */}
                  <div className="flex items-center p-0.5 bg-neutral-900 border border-neutral-750 rounded-xl text-xs">
                    <button
                      onClick={() => setCenterTab('CHAT')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        centerTab === 'CHAT'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      চ্যাট ({currentThread.messages.length})
                    </button>
                    <button
                      onClick={() => setCenterTab('NOTES')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        centerTab === 'NOTES'
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      <FileText className="w-3 h-3" />
                      <span>নোট ({threadNotes.length})</span>
                    </button>
                  </div>

                  {/* AI Bot Toggle */}
                  <button
                    onClick={() => handleToggleAi(currentThread.id)}
                    className={`p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      currentThread.isAiActive
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                        : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                    }`}
                    title="AI অটোমেশন অন/অফ"
                  >
                    <Bot className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Center Content: Chat Messages OR Internal Notes */}
              {centerTab === 'CHAT' ? (
                <>
                  {/* Message Bubbles Body */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#090b12]/50">
                    {currentThread.messages.map((msg) => {
                      const isCustomer = msg.sender === 'customer';
                      const isAi = msg.sender === 'ai';

                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isCustomer ? 'items-start' : 'items-end'}`}
                        >
                          <div className="flex items-baseline gap-1.5 mb-1 px-1">
                            <span className="text-[10px] font-bold text-neutral-400">
                              {isCustomer
                                ? currentThread.customerName
                                : isAi
                                ? '🤖 Gemini AI'
                                : '👤 আপনি / এজেন্ট'}
                            </span>
                            <span className="text-[9px] text-neutral-500 font-mono">{msg.time}</span>
                          </div>

                          <div
                            className={`max-w-[85%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-md ${
                              isCustomer
                                ? 'bg-neutral-850 border border-neutral-750 text-neutral-100 rounded-tl-none'
                                : isAi
                                ? 'bg-gradient-to-br from-[#131d27] to-[#0c161d] border border-emerald-500/30 text-emerald-100 rounded-tr-none'
                                : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none'
                            }`}
                          >
                            <p className="whitespace-pre-wrap">{msg.text}</p>

                            {/* Product Card Attachment */}
                            {msg.productCard && (
                              <div className="mt-2.5 p-2 bg-neutral-900/90 border border-neutral-700/80 rounded-xl flex items-center gap-3">
                                <img
                                  src={msg.productCard.image}
                                  alt={msg.productCard.title}
                                  className="w-12 h-12 rounded-lg object-cover border border-neutral-700 shrink-0"
                                />
                                <div className="min-w-0">
                                  <p className="font-bold text-xs text-neutral-200 truncate">
                                    {msg.productCard.title}
                                  </p>
                                  <p className="text-xs font-mono font-black text-emerald-400">
                                    ৳{msg.productCard.price.toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Quick Snippets */}
                  <div className="px-3 py-1.5 border-t border-neutral-800/80 bg-neutral-900/40 flex items-center gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
                    <span className="text-neutral-500 text-[10px] shrink-0">দ্রুত রিপ্লাই:</span>
                    {[
                      'জি আপু/ভাইয়া, প্রডাক্টটি স্টকে এভেইলেবল আছে।',
                      'ঢাকার ভিতরে ডেলিভারি চার্জ ১২০ টাকা, বাইরে ১৫০ টাকা।',
                      'আপনার অর্ডারটি সফলভাবে কনফার্ম করা হয়েছে।',
                    ].map((snip, i) => (
                      <button
                        key={i}
                        onClick={() => setReplyText(snip)}
                        className="px-2.5 py-1 bg-neutral-850 hover:bg-neutral-800 border border-neutral-750 text-neutral-300 rounded-lg whitespace-nowrap transition-colors cursor-pointer"
                      >
                        {snip.slice(0, 22)}...
                      </button>
                    ))}
                  </div>

                  {/* Reply Input Box */}
                  <div className="p-3 border-t border-neutral-800/80 bg-neutral-900/80 flex items-center gap-2">
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                      placeholder="কাস্টমারকে সরাসরি মেসেজ লিখুন (Enter চাপুন)..."
                      className="flex-1 px-4 py-2.5 bg-neutral-950 border border-neutral-750 focus:border-emerald-500 rounded-2xl text-xs sm:text-sm text-neutral-100 placeholder-neutral-500 outline-none transition-all"
                    />
                    <button
                      onClick={handleSendReply}
                      disabled={isSending || !replyText.trim()}
                      className="p-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-neutral-950 font-bold rounded-2xl transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer shrink-0"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </>
              ) : (
                /* =================== INTERNAL NOTES TAB =================== */
                <div className="flex-1 flex flex-col justify-between p-4 bg-[#0a0d16]/70">
                  <div className="space-y-3 overflow-y-auto pr-1">
                    <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs flex items-start gap-2">
                      <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="block text-white">গোপন টিম নোটবোর্ড (Private Internal Notes)</strong>
                        <span>এখানে লেখা মন্তব্যগুলো শুধুমাত্র আপনার টিমের এজেন্টরা দেখতে পাবে, কাস্টমার কোনো মেসেজ পাবে না।</span>
                      </div>
                    </div>

                    {threadNotes.length === 0 ? (
                      <div className="py-12 text-center text-slate-500 space-y-1">
                        <FileText className="w-8 h-8 mx-auto text-slate-600 mb-1" />
                        <p className="text-xs font-bold text-slate-400">কোনো ইন্টারনাল নোট নেই</p>
                        <p className="text-[11px]">নিচে নোট লিখে সংরক্ষণ করুন</p>
                      </div>
                    ) : (
                      threadNotes.map((note) => (
                        <div
                          key={note.id}
                          className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-1.5 shadow-sm"
                        >
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-indigo-300 flex items-center gap-1">
                              <span>👤 {note.authorName}</span>
                            </span>
                            <span className="text-slate-500 font-mono text-[10px]">
                              {new Date(note.createdAt).toLocaleString('bn-BD', {
                                dateStyle: 'short',
                                timeStyle: 'short',
                              })}
                            </span>
                          </div>
                          <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                            {note.content}
                          </p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add Note Input */}
                  <form onSubmit={handleAddInternalNote} className="pt-3 border-t border-slate-800 flex gap-2">
                    <textarea
                      rows={2}
                      value={internalNoteText}
                      onChange={(e) => setInternalNoteText(e.target.value)}
                      placeholder="টিম মেম্বারদের জন্য ইন্টারনাল নোট লিখুন (যেমন: কাস্টমার বলল বিকালে কল দিতে)..."
                      className="flex-1 p-2.5 bg-slate-950 border border-slate-750 focus:border-indigo-500 rounded-xl text-xs text-white placeholder:text-slate-500 outline-none resize-none"
                    />
                    <button
                      type="submit"
                      disabled={!internalNoteText.trim()}
                      className="px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl text-xs transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer shrink-0"
                    >
                      নোট সেভ
                    </button>
                  </form>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-neutral-500">
              <MessageSquare className="w-12 h-12 text-neutral-700 mb-3" />
              <p className="text-sm font-bold text-neutral-300">কোনো চ্যাট সিলেক্ট করা নেই</p>
            </div>
          )}
        </div>

        {/* ==================================================== */}
        {/* RIGHT COLUMN: Customer CRM Intelligence & Timeline (3.0 Cols) */}
        {/* ==================================================== */}
        <div className="lg:col-span-3 bg-[#10131d] border border-neutral-800/90 rounded-3xl p-4 flex flex-col justify-between overflow-y-auto space-y-4 shadow-2xl">
          {currentThread ? (
            <>
              <div className="space-y-4">
                {/* Header */}
                <div className="pb-2.5 border-b border-neutral-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                    CRM কাস্টমার প্রোফাইল
                  </span>
                  <span className="text-[10px] px-2 py-0.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-full font-bold">
                    Active Lead
                  </span>
                </div>

                {/* Customer Details Box */}
                <div className="p-3 bg-neutral-900/80 rounded-2xl space-y-2 border border-neutral-800/70 text-xs">
                  <p className="font-bold text-neutral-100 text-sm">{currentThread.customerName}</p>
                  <p className="text-neutral-300 font-mono flex items-center gap-1.5">
                    <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{currentThread.customerPhone}</span>
                  </p>
                  {currentThread.customerAddress && (
                    <div className="flex items-start justify-between gap-1 pt-1.5 border-t border-neutral-800 text-slate-300">
                      <div className="flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                        <span className="text-[11px] leading-snug">{currentThread.customerAddress}</span>
                      </div>
                      <button
                        onClick={() => handleCopyText(currentThread.customerAddress!, 'addr-crm', 'ঠিকানা')}
                        className="text-slate-400 hover:text-white p-0.5"
                        title="ঠিকানা কপি করুন"
                      >
                        {copiedId === 'addr-crm' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  )}
                </div>

                {/* Custom CRM Tags Manager */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Tag className="w-3 h-3 text-emerald-400" />
                      <span>কাস্টম ট্যাগ (Custom Tags):</span>
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_TAGS.map((pt) => {
                      const isActive = currentThread.tags.includes(pt.label);
                      return (
                        <button
                          key={pt.label}
                          type="button"
                          onClick={() => handleToggleTag(pt.label)}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                            isActive
                              ? pt.color + ' shadow-sm scale-105'
                              : 'bg-neutral-900/60 text-slate-500 border-neutral-800 hover:text-slate-300'
                          }`}
                        >
                          <span>{pt.label}</span>
                          {isActive && <Check className="w-2.5 h-2.5 ml-0.5" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Product Interest Card */}
                {currentThread.productInterest && (
                  <div className="p-3 bg-gradient-to-br from-[#121622] to-[#0c1017] border border-indigo-500/25 rounded-2xl space-y-2">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">
                      আগ্রহী প্রোডাক্ট
                    </span>
                    <div className="flex items-center gap-2.5">
                      {currentThread.productImage && (
                        <img
                          src={currentThread.productImage}
                          alt={currentThread.productInterest}
                          className="w-10 h-10 rounded-xl object-cover border border-neutral-700 shrink-0"
                        />
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-neutral-200 truncate">
                          {currentThread.productInterest}
                        </p>
                        <p className="text-xs font-black text-emerald-400 font-mono">
                          ৳{currentThread.productPrice?.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Order Status Badge if Order Exists */}
                {currentThread.orderNumber && (
                  <div className="p-3 bg-neutral-900/80 border border-neutral-800 rounded-2xl space-y-1.5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-400">অর্ডার নম্বর:</span>
                      <span className="font-mono font-bold text-emerald-400">
                        #OF-{currentThread.orderNumber}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-400">মোট মূল্য:</span>
                      <span className="font-mono font-bold text-neutral-200">
                        ৳{currentThread.totalSpent?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}

                {/* Activity History Timeline */}
                <div className="space-y-2 pt-2 border-t border-neutral-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                    <Activity className="w-3 h-3 text-cyan-400" />
                    <span>অ্যাক্টিভিটি টাইমলাইন:</span>
                  </span>

                  <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                    {threadTimeline.length === 0 ? (
                      <p className="text-[10px] text-slate-500 italic">কোনো সাম্প্রতিক অ্যাকশন নেই</p>
                    ) : (
                      threadTimeline.slice(0, 5).map((tl) => (
                        <div key={tl.id} className="text-[10px] text-slate-300 border-l-2 border-slate-750 pl-2 space-y-0.5">
                          <p className="text-slate-400 font-mono text-[9px]">{new Date(tl.createdAt).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })} • {tl.actorName}</p>
                          <p className="leading-tight text-slate-200">{tl.description}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* 1-Click Action Buttons */}
              <div className="space-y-2 pt-3 border-t border-neutral-800">
                <a
                  href={`https://wa.me/88${currentThread.customerPhone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 bg-green-600 hover:bg-green-500 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-md active:scale-95"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>১-ক্লিকে WhatsApp খুলুন</span>
                </a>

                <a
                  href={`tel:${currentThread.customerPhone}`}
                  className="w-full py-2 bg-neutral-850 hover:bg-neutral-800 text-neutral-200 border border-neutral-750 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                  <span>সরাসরি ফোন দিন</span>
                </a>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-xs text-neutral-500">
              কোনো তথ্য নেই
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
