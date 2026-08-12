import React from 'react';
import { ShieldCheck, Lock, EyeOff, Server, Key, CheckCircle2 } from 'lucide-react';

export const metadata = {
  title: 'Security & Trust Practices | Pinhire',
  description: 'Learn about Pinhire security architecture, data privacy, anonymous application flow, and custom admin path safeguards.',
};

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-8">
        
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
            <ShieldCheck className="h-8 w-8 text-coral-500" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            Security & Privacy Practices
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
            At Pinhire, candidate privacy and platform integrity are core design requirements.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <EyeOff className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Optional Anonymous Applying
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Candidates can apply directly to companies via external ATS links or direct HR emails without creating an account or storing sensitive personal profile data.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <Lock className="h-5 w-5 text-coral-500" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Obfuscated Secret Admin Routes
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Admin operations are isolated on randomized, non-guessable environment routes (never standard /admin or /dashboard paths), protected by passcode auth and rate limiting.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Server className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Rate Limiting & Bot Protection
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Public API routes, resume uploads, and contact forms are protected by Redis token bucket rate limiting and invisible honeypots to prevent automated scraping & abuse.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Key className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Encrypted Resume Processing
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Uploaded resumes are parsed transiently in memory for skill extraction and job matching, with zero tracking cookies or data broker sharing.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
