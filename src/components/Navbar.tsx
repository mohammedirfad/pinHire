'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { MapPin, Search, FileText, ShieldCheck, User, Lock, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '@/lib/authContext';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const adminPath = process.env.NEXT_PUBLIC_ADMIN_PATH || '/ops-7f3a9c2e';
  const { user, logout, loading } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-indigo-900/10 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-brand-700 text-white shadow-pin transition-transform group-hover:scale-105">
            <MapPin className="h-6 w-6 text-coral-500" />
            <div className="absolute h-2 w-2 rounded-full bg-coral-500 animate-ping opacity-75" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              pin<span className="text-brand-600 dark:text-brand-400">hire</span>
            </span>
            <span className="hidden sm:inline-block text-[10px] uppercase font-semibold text-coral-600 bg-coral-50 px-1.5 py-0.5 rounded ml-2 border border-coral-100">
              Live Map Jobs
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            href="/jobs"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive('/jobs') ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Search className="h-4 w-4" /> Explore Jobs
          </Link>
          <Link
            href="/resume-search"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive('/resume-search') ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileText className="h-4 w-4 text-coral-500" /> AI Resume Match
          </Link>
          <Link
            href="/security"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive('/security') ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="h-4 w-4" /> Trust
          </Link>
        </nav>

        {/* Right: Auth & Admin */}
        <div className="flex items-center gap-2">
          {!loading && (
            <>
              {user ? (
                // Logged-in user dropdown
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-white text-[11px] font-bold">
                      {(user.name || user.email)[0].toUpperCase()}
                    </div>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 hidden sm:block max-w-[100px] truncate">
                      {user.name || user.email.split('@')[0]}
                    </span>
                    <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 top-10 w-48 rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900 z-50 overflow-hidden">
                      <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.name || 'Candidate'}</p>
                        <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      </div>
                      <Link
                        href="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                      >
                        <User className="h-3.5 w-3.5" /> My Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                      >
                        <LogOut className="h-3.5 w-3.5" /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                // Guest: Login + Signup buttons
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    className="px-3 py-1.5 rounded-full border border-slate-200 text-xs font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="px-3 py-1.5 rounded-full bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm transition-colors"
                  >
                    Create Account
                  </Link>
                </div>
              )}
            </>
          )}

          {/* Admin Secret Link */}
          <Link
            href={adminPath}
            title="Admin Console"
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-900 text-slate-200 text-[11px] font-mono hover:bg-slate-800 transition-colors border border-slate-800 hidden sm:flex"
          >
            <Lock className="h-3 w-3 text-emerald-400" /> Admin
          </Link>
        </div>
      </div>
    </header>
  );
}
