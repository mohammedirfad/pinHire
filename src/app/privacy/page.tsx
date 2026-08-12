import React from 'react';

export const metadata = {
  title: 'Privacy Policy | Pinhire',
  description: 'Pinhire privacy policy detailing data usage, cookie policy, and candidate rights.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900 space-y-6">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Privacy Policy</h1>
        <p className="text-xs text-slate-500">Last updated: August 10, 2026</p>

        <div className="prose prose-slate dark:prose-invert text-xs leading-relaxed space-y-4 text-slate-700 dark:text-slate-300">
          <p>
            At Pinhire, we respect your privacy. This policy explains how we handle candidate data when you search for jobs on our live map or upload a resume.
          </p>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">1. Information We Collect</h3>
          <p>
            We only collect information necessary to connect candidates with real hiring locations:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Geolocation (city or coordinates, only with your browser permission).</li>
            <li>Uploaded resume text (used strictly for AI skill matching).</li>
            <li>Optional profile preferences (notification frequency, saved jobs).</li>
          </ul>

          <h3 className="text-sm font-bold text-slate-900 dark:text-white">2. Anonymous Job Applications</h3>
          <p>
            You are never required to create an account to apply for jobs. External application links take you directly to company ATS pages.
          </p>

          <h3 className="text-sm font-bold text-slate-900 dark:text-white">3. Contact Us</h3>
          <p>If you have questions regarding this Privacy Policy, please contact privacy@pinhire.com.</p>
        </div>
      </div>
    </div>
  );
}
