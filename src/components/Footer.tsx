'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, ShieldCheck } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-900 text-slate-400 dark:border-slate-800">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">

          {/* Column 1: Brand & USP */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-700 text-white shadow-pin">
                <MapPin className="h-5 w-5 text-coral-500" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                pin<span className="text-brand-400">hire</span>
              </span>
            </Link>
            <p className="text-xs leading-relaxed text-slate-400">
              See where the jobs actually are. Pinhire is an interactive, map-first job portal displaying real hiring locations on a live map instead of endless list rows.
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Map Online
              </span>
              <span>•</span>
              <span>100% Free Applications</span>
            </div>
          </div>

          {/* Column 2: Popular Tech Hubs (SEO Links) */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Jobs by Tech Hub
            </h3>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <Link href="/jobs?location=bangalore" className="hover:text-white transition-colors">
                  Jobs in Bangalore, India
                </Link>
              </li>
              <li>
                <Link href="/jobs?location=kochi" className="hover:text-white transition-colors">
                  Jobs in Kochi Infopark
                </Link>
              </li>
              <li>
                <Link href="/jobs?location=san+francisco" className="hover:text-white transition-colors">
                  San Francisco Tech Roles
                </Link>
              </li>
              <li>
                <Link href="/jobs?location=new+york" className="hover:text-white transition-colors">
                  New York Software Jobs
                </Link>
              </li>
              <li>
                <Link href="/jobs?location=london" className="hover:text-white transition-colors">
                  London FinTech &amp; Engineering
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Platform & Features */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Platform Features
            </h3>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <Link href="/jobs" className="hover:text-white transition-colors">
                  Interactive Live Map View
                </Link>
              </li>
              <li>
                <Link href="/resume-search" className="hover:text-white transition-colors">
                  AI Resume Match &amp; Discovery
                </Link>
              </li>
              <li>
                <Link href="/security" className="hover:text-white transition-colors">
                  Security &amp; Trust Center
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Support &amp; Contact Form
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal & Security */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Legal &amp; Trust
            </h3>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/security" className="hover:text-white transition-colors flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-brand-400" />
                  GDPR &amp; Security Practices
                </Link>
              </li>
            </ul>
          </div>

        </div>

        <div className="mt-10 border-t border-slate-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <p>© {new Date().getFullYear()} Pinhire Inc. All rights reserved.</p>
          <div className="flex items-center gap-4 text-slate-500">
            <span>Verified Hiring Locations</span>
            <span>•</span>
            <span>Map-First Discovery</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
