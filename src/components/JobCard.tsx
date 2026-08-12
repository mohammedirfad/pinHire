'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, Briefcase, Clock, Building2, CheckCircle2, ChevronRight } from 'lucide-react';
import { JobMock } from '@/lib/mockData';
import { formatDate } from '@/lib/utils';

interface JobCardProps {
  job: JobMock;
  isSelected?: boolean;
  onSelect?: (job: JobMock) => void;
}

export function JobCard({ job, isSelected, onSelect }: JobCardProps) {
  return (
    <div
      onClick={() => onSelect?.(job)}
      className={`group relative rounded-xl border p-4 transition-all cursor-pointer ${
        isSelected
          ? 'border-brand-500 bg-brand-50/50 shadow-md ring-2 ring-brand-500/20 dark:border-brand-400 dark:bg-brand-950/30'
          : 'border-slate-200 bg-white hover:border-brand-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Company Logo / Placeholder */}
        <div className="h-12 w-12 flex-shrink-0 rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-800 overflow-hidden flex items-center justify-center">
          {job.company.logoUrl ? (
            <img
              src={job.company.logoUrl}
              alt={job.company.name}
              className="h-full w-full object-cover rounded"
            />
          ) : (
            <Building2 className="h-6 w-6 text-slate-400" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <Link
                href={`/companies/${job.company.slug}`}
                onClick={(e) => e.stopPropagation()}
                className="text-xs font-semibold text-slate-600 hover:text-brand-600 truncate dark:text-slate-400 dark:hover:text-brand-400"
              >
                {job.company.name}
              </Link>
              {job.company.verified && (
                <CheckCircle2 className="h-3.5 w-3.5 text-brand-600 flex-shrink-0" />
              )}
            </div>
            <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1 flex-shrink-0">
              <Clock className="h-3 w-3" />
              {formatDate(job.postedAt)}
            </span>
          </div>

          <h3 className="mt-0.5 text-sm font-bold text-slate-900 group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-400 line-clamp-1">
            {job.title}
          </h3>

          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
              <MapPin className="h-3.5 w-3.5 text-coral-500" />
              {job.locationLabel}
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1 font-medium bg-slate-100 px-2 py-0.5 rounded text-[11px] text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <Briefcase className="h-3 w-3 text-brand-500" />
              {job.experienceMin}{job.experienceMax ? `-${job.experienceMax}` : '+'} yrs exp
            </span>
            <span className="inline-flex items-center gap-1 font-medium bg-brand-50 text-brand-700 border border-brand-100 px-2 py-0.5 rounded text-[11px] dark:bg-brand-950/40 dark:text-brand-300 dark:border-brand-900">
              {job.jobType.replace('_', ' ')}
            </span>
          </div>
        </div>

        <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-brand-600 self-center transition-transform group-hover:translate-x-0.5" />
      </div>
    </div>
  );
}
