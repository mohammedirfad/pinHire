'use client';

import React from 'react';
import { SlidersHorizontal, ArrowUpDown, Shield, Briefcase } from 'lucide-react';

export interface FilterState {
  experienceBand: string; // 'all' | '0-1' | '1-3' | '3-5' | '5-7' | '7+'
  jobType: string;        // 'all' | 'FULL_TIME' | 'PART_TIME' | 'INTERNSHIP' | 'FREELANCE'
  sortBy: string;         // 'latest' | 'relevance' | 'distance'
  radiusKm: number;       // 10 | 25 | 50 | 100
}

interface FilterBarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

export function FilterBar({ filters, onChange }: FilterBarProps) {
  const experienceOptions = [
    { label: 'All Experience', value: 'all' },
    { label: 'Fresher (0-1 yr)', value: '0-1' },
    { label: 'Junior (1-3 yrs)', value: '1-3' },
    { label: 'Mid (3-5 yrs)', value: '3-5' },
    { label: 'Senior (5-7 yrs)', value: '5-7' },
    { label: 'Lead (7+ yrs)', value: '7+' },
  ];

  const jobTypeOptions = [
    { label: 'All Job Types', value: 'all' },
    { label: 'Full-time', value: 'FULL_TIME' },
    { label: 'Part-time', value: 'PART_TIME' },
    { label: 'Internship', value: 'INTERNSHIP' },
    { label: 'Freelance', value: 'FREELANCE' },
  ];

  const sortOptions = [
    { label: 'Latest Posted', value: 'latest' },
    { label: 'Relevance', value: 'relevance' },
    { label: 'Nearest Distance', value: 'distance' },
  ];

  const radiusOptions = [
    { label: 'Within 10 km', value: 10 },
    { label: 'Within 25 km', value: 25 },
    { label: 'Within 50 km', value: 50 },
    { label: 'Within 100 km', value: 100 },
  ];

  return (
    <div className="flex flex-wrap items-center gap-3 py-3 border-b border-slate-200 dark:border-slate-800">
      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 pr-2">
        <SlidersHorizontal className="h-4 w-4 text-brand-600" />
        Filters:
      </div>

      {/* Experience Filter */}
      <select
        value={filters.experienceBand}
        onChange={(e) => onChange({ ...filters, experienceBand: e.target.value })}
        className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 shadow-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
      >
        {experienceOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Job Type Filter */}
      <select
        value={filters.jobType}
        onChange={(e) => onChange({ ...filters, jobType: e.target.value })}
        className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 shadow-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
      >
        {jobTypeOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Radius Filter */}
      <select
        value={filters.radiusKm}
        onChange={(e) => onChange({ ...filters, radiusKm: Number(e.target.value) })}
        className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 shadow-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
      >
        {radiusOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Sort Filter */}
      <div className="ml-auto flex items-center gap-2">
        <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
        <select
          value={filters.sortBy}
          onChange={(e) => onChange({ ...filters, sortBy: e.target.value })}
          className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 shadow-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
