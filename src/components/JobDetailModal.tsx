'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { X, MapPin, Building2, Briefcase, ExternalLink, Mail, CheckCircle2, Share2, Bookmark } from 'lucide-react';
import { JobMock } from '@/lib/mockData';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';

interface JobDetailModalProps {
  job: JobMock | null;
  onClose: () => void;
}

export function JobDetailModal({ job, onClose }: JobDetailModalProps) {
  const [saved, setSaved] = useState(false);
  const [applied, setApplied] = useState(false);

  if (!job) return null;

  const handleApplyClick = async (method: 'link' | 'email') => {
    try {
      await fetch('/api/jobs/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: job.id, method }),
      });
      setApplied(true);
      toast.success('Application recorded in profile history!');
    } catch (e) {
      console.error(e);
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/jobs/${job.slug}`;
    navigator.clipboard.writeText(url);
    toast.success('Job link copied to clipboard!');
  };

  const handleSaveToggle = () => {
    setSaved(!saved);
    toast.success(saved ? 'Removed from saved jobs' : 'Job saved to profile bookmarks');
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col bg-white shadow-2xl dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 transform transition-transform duration-300">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            Job Details & Hiring Location
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            title="Share Job"
          >
            <Share2 className="h-4 w-4" />
          </button>
          <button
            onClick={handleSaveToggle}
            className={`p-1.5 rounded-lg transition-colors ${
              saved ? 'text-coral-500 bg-coral-50' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
            title="Save Job"
          >
            <Bookmark className="h-4 w-4" fill={saved ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        
        {/* Company Header */}
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 flex-shrink-0 rounded-xl border border-slate-200 bg-slate-50 p-1.5 dark:border-slate-800 dark:bg-slate-800 overflow-hidden flex items-center justify-center">
            {job.company.logoUrl ? (
              <img src={job.company.logoUrl} alt={job.company.name} className="h-full w-full object-cover rounded-lg" />
            ) : (
              <Building2 className="h-8 w-8 text-slate-400" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <Link
                href={`/companies/${job.company.slug}`}
                className="font-bold text-slate-900 hover:text-brand-600 dark:text-white dark:hover:text-brand-400"
              >
                {job.company.name}
              </Link>
              {job.company.verified && (
                <CheckCircle2 className="h-4 w-4 text-brand-600" />
              )}
            </div>
            <h1 className="mt-1 text-xl font-extrabold text-slate-900 dark:text-white leading-snug">
              {job.title}
            </h1>
            <p className="mt-1 text-xs text-slate-500 flex items-center gap-1">
              Posted {formatDate(job.postedAt)}
            </p>
          </div>
        </div>

        {/* Location & Experience Badges */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-950/50 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
            <MapPin className="h-4 w-4 text-coral-500 flex-shrink-0" />
            <span>Exact Hiring Location:</span>
            <span className="text-slate-900 dark:text-white font-bold">{job.locationLabel}</span>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-brand-50 text-brand-700 text-xs font-semibold border border-brand-100 dark:bg-brand-950 dark:text-brand-300 dark:border-brand-900">
              <Briefcase className="h-3.5 w-3.5" />
              {job.experienceMin}{job.experienceMax ? `-${job.experienceMax}` : '+'} Years Exp
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-100 dark:bg-emerald-950 dark:text-emerald-300">
              {job.jobType.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Detailed Job Description */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
            Job Description
          </h3>
          <div className="prose prose-sm dark:prose-invert text-slate-600 dark:text-slate-300 whitespace-pre-line text-sm leading-relaxed">
            {job.description}
          </div>
        </div>

      </div>

      {/* Footer CTA Apply Bar */}
      <div className="border-t border-slate-200 p-4 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
        {job.applyLink && (
          <a
            href={job.applyLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleApplyClick('link')}
            className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md transition-transform hover:scale-[1.01] active:scale-[0.99]"
          >
            Apply Direct via Company Link
            <ExternalLink className="h-4 w-4" />
          </a>
        )}

        {job.hrEmail && (
          <a
            href={`mailto:${job.hrEmail}?subject=Application for ${encodeURIComponent(job.title)} via Pinhire`}
            onClick={() => handleApplyClick('email')}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl border border-slate-300 text-slate-800 font-semibold text-sm hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <Mail className="h-4 w-4 text-coral-500" />
            Email HR Contact directly ({job.hrEmail})
          </a>
        )}

        {applied && (
          <p className="text-center text-xs font-semibold text-emerald-600 flex items-center justify-center gap-1 pt-1">
            <CheckCircle2 className="h-3.5 w-3.5" /> Applied! Logged in your profile.
          </p>
        )}
      </div>

    </div>
  );
}
