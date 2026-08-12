'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { User, CheckCircle2, Bell, Mail, LogOut, Edit2, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/authContext';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user, loading, logout, refreshUser } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [notifyFreq, setNotifyFreq] = useState<'off' | 'daily' | 'weekly'>('weekly');
  const [saving, setSaving] = useState(false);
  const [editingName, setEditingName] = useState(false);

  // Seed local state from user object
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setNotifyFreq((user.notifyFreq as any) || 'weekly');
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    toast.success('Signed out successfully.');
    router.push('/');
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, notifyFreq }),
      });
      if (!res.ok) throw new Error('Failed to save');
      await refreshUser();
      toast.success('Profile preferences updated!');
      setEditingName(false);
    } catch {
      toast.error('Could not save profile changes.');
    } finally {
      setSaving(false);
    }
  };

  // Guest: show login prompt
  if (!loading && !user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4">
        <div className="max-w-sm w-full rounded-3xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900 text-center space-y-5">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 dark:bg-brand-950">
            <User className="h-8 w-8 text-brand-600 dark:text-brand-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Candidate Account Profile</h1>
            <p className="text-xs text-slate-500 mt-1">
              Sign in to manage your email job alert preferences and profile details.
            </p>
          </div>
          <div className="flex flex-col gap-2 pt-2">
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm transition-colors shadow-md"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Create Free Account
            </Link>
          </div>
          <p className="text-[11px] text-slate-400">No account needed to browse map jobs or apply directly.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-6">

        {/* Profile Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">

          {/* Header row */}
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-600 text-white text-2xl font-extrabold shadow-pin flex-shrink-0">
                {((user?.name || user?.email || 'U')[0]).toUpperCase()}
              </div>
              <div>
                {editingName ? (
                  <div className="flex items-center gap-2">
                    <input
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="rounded-lg border border-brand-400 px-3 py-1.5 text-sm text-slate-900 dark:text-white dark:bg-slate-800 dark:border-brand-600 focus:outline-none"
                      placeholder="Your full name"
                      autoFocus
                    />
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="px-3 py-1.5 rounded-lg bg-brand-600 text-white text-xs font-bold"
                    >
                      {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Save'}
                    </button>
                    <button
                      onClick={() => setEditingName(false)}
                      className="text-xs text-slate-500"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                      {user?.name || 'Candidate'}
                    </h1>
                    <button
                      onClick={() => setEditingName(true)}
                      className="text-slate-400 hover:text-brand-600 transition-colors"
                      title="Edit name"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
                <p className="flex items-center gap-1.5 text-sm text-slate-500 mt-0.5">
                  <Mail className="h-3.5 w-3.5 text-coral-500" />
                  {user?.email}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors dark:border-rose-900 dark:text-rose-400 dark:hover:bg-rose-950/40"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign Out
            </button>
          </div>

          {/* Email Notification Preferences */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-950/50 space-y-3">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-coral-500" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Email Job Alert Notifications
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              When new jobs matching your skills are pinned near your location, receive batched email digests sent directly to <strong className="text-slate-700 dark:text-slate-300">{user?.email}</strong>.
            </p>

            <div className="flex items-center gap-2 pt-1">
              {(['off', 'daily', 'weekly'] as const).map(freq => (
                <button
                  key={freq}
                  onClick={() => setNotifyFreq(freq)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize border transition-all ${
                    notifyFreq === freq
                      ? 'border-brand-500 bg-brand-600 text-white shadow-sm'
                      : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
                  }`}
                >
                  {freq === 'off' ? 'Disabled' : `${freq.charAt(0).toUpperCase() + freq.slice(1)} Digest`}
                </button>
              ))}
            </div>

            {notifyFreq !== (user?.notifyFreq || 'weekly') && (
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-colors mt-2"
              >
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                Save Notification Preference
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
