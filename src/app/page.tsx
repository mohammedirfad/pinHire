'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileText, CheckCircle2, ArrowRight, Sparkles, Compass } from 'lucide-react';
import { HeroSearch } from '@/components/HeroSearch';
import { HomeMapPreview } from '@/components/HomeMapPreview';
import { JobCard } from '@/components/JobCard';
import { MOCK_JOBS, JobMock } from '@/lib/mockData';

export default function HomePage() {
  const [latestJobs, setLatestJobs] = useState<JobMock[]>(MOCK_JOBS.slice(0, 6));

  useEffect(() => {
    fetch('/api/jobs?limit=6')
      .then(r => r.json())
      .then(data => {
        if (data.jobs && data.jobs.length > 0) {
          setLatestJobs(data.jobs.slice(0, 6));
        }
      })
      .catch(() => {/* keep mock data */});
  }, []);

  return (
    <div className="relative overflow-hidden">

      {/* ── Hero Section ── */}
      <section className="relative bg-gradient-to-b from-slate-900 via-brand-950 to-slate-900 text-white pt-16 pb-20 px-4 sm:px-6 lg:px-8">
        {/* Decorative Grid Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:24px_24px] opacity-20" />

        <div className="relative mx-auto max-w-5xl text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-xs font-semibold text-coral-400 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Map-First Job Discovery</span>
            <span className="rounded-full bg-coral-500/20 px-2 py-0.5 text-[10px] text-coral-300">New</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            See where the jobs <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-brand-300 via-coral-400 to-amber-300 bg-clip-text text-transparent">
              actually are.
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            Pinhire is the only job portal that shows you real hiring locations on a live map — not another endless list of 500 identical text rows.
          </p>

          {/* Client Component Search — no function props across server/client boundary */}
          <div className="mx-auto max-w-3xl pt-4">
            <HeroSearch />
          </div>

          {/* Quick Hub Tags */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs text-slate-400">
            <span className="font-semibold text-slate-300">Popular Tech Hubs:</span>
            <Link href="/jobs?location=bangalore" className="hover:text-coral-400 bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700">
              📍 Bangalore
            </Link>
            <Link href="/jobs?location=kochi" className="hover:text-coral-400 bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700">
              📍 Kochi Infopark
            </Link>
            <Link href="/jobs?location=san+francisco" className="hover:text-coral-400 bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700">
              📍 San Francisco
            </Link>
            <Link href="/jobs?location=london" className="hover:text-coral-400 bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700">
              📍 London
            </Link>
          </div>
        </div>
      </section>

      {/* ── Live Interactive Map Preview ── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <div className="rounded-3xl border border-slate-200 bg-white p-3 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 dark:border-slate-800 mb-2">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Live Interactive Map View
              </span>
            </div>
            <Link
              href="/jobs"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 flex items-center gap-1"
            >
              Open Full Screen Map <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <HomeMapPreview jobs={latestJobs} />
        </div>
      </section>

      {/* ── 3 Pillars USP Section ── */}
      <section className="py-20 bg-slate-50 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Why Engineers &amp; Designers Switch to Pinhire
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Built from the ground up for modern job seekers who value commute distance, exact office location, and direct hiring contact.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm hover:shadow-md transition-shadow dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                <Compass className="h-6 w-6 text-coral-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">1. See it, don&apos;t scroll it.</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Every open role is pinned exactly where the company is hiring — city, district, or office — so you instantly see what is near you instead of scanning 500 list rows.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm hover:shadow-md transition-shadow dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">2. Apply your way.</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                No forced sign-up. Apply directly via the company&apos;s career link or email the HR contact directly from your mail client. No artificial barriers.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm hover:shadow-md transition-shadow dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                <FileText className="h-6 w-6 text-brand-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">3. Resume-first discovery.</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Upload your resume once — Pinhire reads it and shows matching engineering, product, or design roles near your preferred location, zero manual filter-hunting required.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Latest Map Job Openings Grid ── */}
      <section className="py-16 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Latest Pinned Job Openings</h2>
              <p className="text-xs text-slate-500">Verified hiring locations updated in real-time</p>
            </div>
            <Link
              href="/jobs"
              className="text-xs font-bold text-brand-600 hover:text-brand-700 dark:text-brand-400 flex items-center gap-1"
            >
              View All Map Jobs <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {latestJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job as any}
                onSelect={(j) => { window.location.href = `/jobs/${j.slug}`; }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── AI Resume Match Banner ── */}
      <section className="py-16 bg-gradient-to-r from-brand-900 via-brand-800 to-indigo-950 text-white">
        <div className="mx-auto max-w-5xl px-4 text-center space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-coral-500/20 text-coral-300 text-xs font-semibold border border-coral-500/30">
            <Sparkles className="h-4 w-4" />
            Match Jobs Instantly
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold">
            Let Pinhire read your resume and match roles near you.
          </h2>
          <p className="text-slate-300 text-sm max-w-xl mx-auto">
            Drop your PDF or DOCX file to extract your skills, years of experience, and preferred city.
          </p>
          <div className="pt-2">
            <Link
              href="/resume-search"
              className="inline-flex items-center gap-2 py-3 px-8 rounded-xl bg-coral-500 hover:bg-coral-600 text-white font-bold text-sm shadow-xl transition-transform hover:scale-105"
            >
              <FileText className="h-4 w-4" />
              Upload Resume &amp; Find Matches
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
