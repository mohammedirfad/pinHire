import React from 'react';

export const metadata = {
  title: 'Terms of Service | Pinhire',
  description: 'Pinhire terms of service governing map-based job portal usage.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900 space-y-6">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Terms of Service</h1>
        <p className="text-xs text-slate-500">Last updated: August 10, 2026</p>

        <div className="prose prose-slate dark:prose-invert text-xs leading-relaxed space-y-4 text-slate-700 dark:text-slate-300">
          <p>
            Welcome to Pinhire. By accessing our map-based job portal, you agree to these Terms of Service.
          </p>

          <h3 className="text-sm font-bold text-slate-900 dark:text-white">1. Use of Platform</h3>
          <p>
            Pinhire provides map visualization for open hiring roles. Users agree not to scrape, reverse engineer, or spam job application endpoints.
          </p>

          <h3 className="text-sm font-bold text-slate-900 dark:text-white">2. Job Postings & Auto-Expiry</h3>
          <p>
            Job postings on Pinhire automatically expire after 30 days unless extended by an authorized company administrator.
          </p>

          <h3 className="text-sm font-bold text-slate-900 dark:text-white">3. Disclaimers</h3>
          <p>
            Pinhire does not guarantee job placements or external employer responses.
          </p>
        </div>
      </div>
    </div>
  );
}
