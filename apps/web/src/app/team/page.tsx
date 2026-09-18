'use client';

import React, { useState, useEffect } from 'react';
import { User, UserRole } from '@/lib/types';
import {
  Users,
  UserPlus,
  ShieldCheck,
  Crown,
  Briefcase,
  Headphones,
  Trash2,
  Edit2,
  Mail,
  Phone,
  CheckCircle2,
  X,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Lock,
  Search,
} from 'lucide-react';
import { toast } from 'sonner';

export default function TeamPage() {
  const [members, setMembers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>('ADMIN');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State for new member
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'ADMIN' | 'USER'>('USER');
  const [newTitle, setNewTitle] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newPassword, setNewPassword] = useState('agent123');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadTeam = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/team');
      const data = await res.json();
      if (data.success && Array.isArray(data.members)) {
        setMembers(data.members);
        if (data.currentUserRole) {
          setCurrentUserRole(data.currentUserRole);
        }
      }
    } catch (err) {
      console.error('[Load Team Error]:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTeam();
  }, []);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) {
      toast.error('নাম এবং ইমেইল পূরণ করুন');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName.trim(),
          email: newEmail.trim(),
          role: newRole,
          title: newTitle.trim() || (newRole === 'ADMIN' ? 'Team Lead' : 'Live Chat Specialist'),
          phone: newPhone.trim(),
          password: newPassword,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`টিম মেম্বার "${newName}" সফলভাবে যুক্ত হয়েছে!`);
        setIsAddModalOpen(false);
        setNewName('');
        setNewEmail('');
        setNewTitle('');
        setNewPhone('');
        loadTeam();
      } else {
        toast.error(data.error || 'টিম মেম্বার যুক্ত করতে ব্যর্থ হয়েছে');
      }
    } catch (err) {
      toast.error('সার্ভারে সমস্যা হয়েছে');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRoleChange = async (userId: string, newRoleValue: string) => {
    try {
      const res = await fetch('/api/team', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRoleValue }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`রোল সফলভাবে '${newRoleValue}' এ পরিবর্তন করা হয়েছে`);
        loadTeam();
      } else {
        toast.error(data.error || 'রোল আপডেট করতে ব্যর্থ হয়েছে');
      }
    } catch (err) {
      toast.error('সার্ভার এরর');
    }
  };

  const handleDeleteMember = async (userId: string, name: string) => {
    if (!confirm(`আপনি কি নিশ্চিত যে "${name}"-কে টিম থেকে বাদ দিতে চান?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/team?userId=${userId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`"${name}"-কে সফলভাবে টিম থেকে রিমুভ করা হয়েছে`);
        loadTeam();
      } else {
        toast.error(data.error || 'মেম্বার ডিলিট করতে ব্যর্থ হয়েছে');
      }
    } catch (err) {
      toast.error('সার্ভার এরর');
    }
  };

  const filteredMembers = members.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.title && m.title.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  return (
    <div className="space-y-8 pb-16 w-full max-w-[1600px] mx-auto">
      {/* Top Banner Hero */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#0c1220]/95 via-[#080d18]/95 to-[#04060c]/95 p-6 sm:p-8 lg:p-9 border border-slate-800/80 shadow-[0_20px_50px_rgba(0,0,0,0.7)] backdrop-blur-2xl">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/15 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold rounded-full shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>SaaS Team & Role Access Control</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
              টিম মেম্বার ও <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">রোল ম্যানেজমেন্ট</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              আপনার ব্যবসার সাপোর্ট এজেন্ট এবং মডারেটরদের ইনবক্সে যুক্ত করুন, নির্দিষ্ট চ্যাট অ্যাসাইন করুন এবং রোল অনুযায়ী এক্সেস নিয়ন্ত্রণ করুন।
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2.5 px-5 py-3 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 rounded-2xl text-sm font-black shadow-[0_10px_25px_rgba(16,185,129,0.3)] active:scale-95 transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4 stroke-[2.5]" />
              <span>নতুন টিম মেম্বার যোগ করুন</span>
            </button>

            <button
              onClick={loadTeam}
              className="p-3 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/70 rounded-2xl transition-all shadow-md active:scale-95 cursor-pointer backdrop-blur-md"
              title="রিফ্রেশ করুন"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* 3 Role Quick Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-7 pt-6 border-t border-slate-800/80 relative z-10">
          <div className="bg-slate-900/80 border border-indigo-500/30 p-4 rounded-2xl flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider block">Super Admin</span>
              <p className="text-xs text-slate-400 mt-0.5">প্ল্যাটফর্ম মালিক, সব ব্যবসা ও সিস্টেম সেটিংসে ফুল এক্সেস</p>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-emerald-500/30 p-4 rounded-2xl flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider block">Admin (Store Owner)</span>
              <p className="text-xs text-slate-400 mt-0.5">টিম মেম্বার নিয়ন্ত্রণ, কুরিয়ার সেটিং, অর্ডার ও প্রোডাক্ট ম্যানেজমেন্ট</p>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-blue-500/30 p-4 rounded-2xl flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-blue-300 uppercase tracking-wider block">User (Support Agent)</span>
              <p className="text-xs text-slate-400 mt-0.5">মেসেঞ্জারে চ্যাট রিপ্লাই, অ্যাসাইন করা চ্যাট ও অর্ডার কনফার্মেশন</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Team Table */}
      <div className="bg-[#0b0e19]/95 border border-slate-800/90 rounded-[2rem] overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
        <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-950/40">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="নাম, ইমেইল বা পদবি দিয়ে খুঁজুন..."
              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-750 focus:border-emerald-500 rounded-xl text-xs text-white placeholder:text-slate-500 outline-none transition-all"
            />
          </div>

          <div className="text-xs text-slate-400 font-mono">
            মোট সদস্য: <strong className="text-white">{filteredMembers.length}</strong> জন
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#070912] text-slate-400 font-bold border-b border-slate-800 text-xs uppercase tracking-wider">
              <tr>
                <th className="py-4 px-6">টিম মেম্বার</th>
                <th className="py-4 px-6">ইমেইল ও ফোন</th>
                <th className="py-4 px-6">বর্তমান রোল</th>
                <th className="py-4 px-6">স্ট্যাটাস</th>
                <th className="py-4 px-6 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-16 text-slate-400">
                    <Users className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                    <p className="text-sm font-bold text-white">কোনো মেম্বার পাওয়া যায়নি</p>
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => {
                  const getRoleBadge = (role: UserRole) => {
                    if (role === 'SUPER_ADMIN') {
                      return {
                        bg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
                        icon: Crown,
                        label: 'Super Admin',
                      };
                    }
                    if (role === 'ADMIN') {
                      return {
                        bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
                        icon: Briefcase,
                        label: 'Admin',
                      };
                    }
                    return {
                      bg: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
                      icon: Headphones,
                      label: 'Support Agent',
                    };
                  };

                  const badge = getRoleBadge(member.role);
                  const Icon = badge.icon;

                  return (
                    <tr key={member.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Name & Avatar */}
                      <td className="py-4 px-6 align-middle">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-md">
                            {member.avatar || member.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-white text-sm leading-tight">{member.name}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{member.title || 'Staff'}</p>
                          </div>
                        </div>
                      </td>

                      {/* Email & Phone */}
                      <td className="py-4 px-6 align-middle space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-slate-300">
                          <Mail className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{member.email}</span>
                        </div>
                        {member.phone && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                            <Phone className="w-3 h-3 text-slate-500" />
                            <span>{member.phone}</span>
                          </div>
                        )}
                      </td>

                      {/* Role Dropdown */}
                      <td className="py-4 px-6 align-middle">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border ${badge.bg}`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                            <span>{badge.label}</span>
                          </span>

                          {member.role !== 'SUPER_ADMIN' && (
                            <select
                              value={member.role}
                              onChange={(e) => handleRoleChange(member.id, e.target.value)}
                              className="bg-slate-900 border border-slate-750 text-slate-300 rounded-lg px-2 py-1 text-xs outline-none cursor-pointer"
                            >
                              <option value="ADMIN">Admin</option>
                              <option value="USER">User (Agent)</option>
                            </select>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6 align-middle">
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span>Active</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 align-middle text-right">
                        {member.role !== 'SUPER_ADMIN' && (
                          <button
                            onClick={() => handleDeleteMember(member.id, member.name)}
                            className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer"
                            title="মেম্বার রিমুভ করুন"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Team Member Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4 animate-in fade-in duration-200">
          <div className="bg-[#0f1422] border border-emerald-500/30 rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.9)] animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-[#0a0e1a]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black shadow-md">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-white text-base">নতুন টিম মেম্বার যুক্ত করুন</h3>
                  <p className="text-xs text-slate-400">মেম্বারকে লগইন তথ্য প্রদান করে অ্যাক্সেস দিন</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMember} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  পূর্ণ নাম
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="যেমন: তানভীর আহমেদ"
                  required
                  className="w-full bg-slate-900 border border-slate-750 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  ইমেইল এড্রেস (লগইন ইউজারনেম)
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="agent@business.com"
                  required
                  className="w-full bg-slate-900 border border-slate-750 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                    পদবি / Title
                  </label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Live Chat Specialist"
                    className="w-full bg-slate-900 border border-slate-750 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                    রোল নির্বাচন
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-750 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none cursor-pointer"
                  >
                    <option value="USER">User (Support Agent)</option>
                    <option value="ADMIN">Admin (Manager)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                    ফোন নম্বর
                  </label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="017XXXXXXXX"
                    className="w-full bg-slate-900 border border-slate-750 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                    প্রাথমিক পাসওয়ার্ড
                  </label>
                  <input
                    type="text"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="agent123"
                    className="w-full bg-slate-900 border border-slate-750 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black rounded-xl text-xs transition-all shadow-md active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmitting ? 'যুক্ত হচ্ছে...' : 'টিমে যুক্ত করুন'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
