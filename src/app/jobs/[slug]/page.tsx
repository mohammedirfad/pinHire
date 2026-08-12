import React from 'react';
import Metadata from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MapPin, Building2, Briefcase, ExternalLink, Mail, ArrowLeft, Clock, ShieldCheck, AlertCircle } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { MOCK_JOBS } from '@/lib/mockData';
import { formatDate } from '@/lib/utils';
import { JobCard } from '@/components/JobCard';

interface JobPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: JobPageProps) {
  let job: any = null;
  try {
    job = await prisma.job.findUnique({
      where: { slug: params.slug },
      include: { company: true },
    });
  } catch (e) {
    job = MOCK_JOBS.find(j => j.slug === params.slug);
  }

  if (!job) {
    return {
      title: 'Job Not Found | Pinhire',
    };
  }

  return {
    title: `${job.title} at ${job.company.name} in ${job.locationLabel}`,
    description: `Apply for ${job.title} at ${job.company.name} located in ${job.locationLabel}. See real hiring location on Pinhire live map.`,
    openGraph: {
      title: `${job.title} - ${job.company.name}`,
      description: `Hiring in ${job.locationLabel}. View on Pinhire live map.`,
      images: [job.company.logoUrl || 'https://pinhire.com/og-default.png'],
    },
  };
}

export const revalidate = 300; // ISR revalidate every 5 minutes

export default async function JobDetailPage({ params }: JobPageProps) {
  let job: any = null;
  try {
    job = await prisma.job.findUnique({
      where: { slug: params.slug },
      include: { company: true },
    });
  } catch (e) {
    job = MOCK_JOBS.find(j => j.slug === params.slug) as any;
  }

  if (!job) {
    notFound();
  }

  const isExpired = job.status === 'EXPIRED' || new Date(job.expiresAt) < new Date();

  // Fetch similar active jobs near location
  let similarJobs: any[] = [];
  try {
    similarJobs = await prisma.job.findMany({
      where: {
        status: 'ACTIVE',
        id: { not: job.id },
      },
      include: { company: true },
      take: 3,
    });
  } catch (e) {
    similarJobs = MOCK_JOBS.filter(j => j.id !== job.id).slice(0, 3);
  }

  // Schema.org JobPosting JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: job.description,
    datePosted: new Date(job.postedAt).toISOString(),
    validThrough: new Date(job.expiresAt).toISOString(),
    employmentType: job.jobType,
    hiringOrganization: {
      '@type': 'Organization',
      name: job.company.name,
      sameAs: job.company.website,
      logo: job.company.logoUrl,
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: job.locationLabel,
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: job.lat,
        longitude: job.lng,
      },
    },
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      {/* Inject JobPosting JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-4xl space-y-6">
        
        {/* Back Link */}
        <Link
          href="/jobs"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Full Map Search
        </Link>

        {/* Expired Job Banner (410 Graceful UX) */}
        {isExpired && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold">This job posting expired after 30 days</h3>
              <p className="text-xs mt-0.5 text-amber-800 dark:text-amber-300">
                This position may no longer be taking applications. We’ve listed similar roles in {job.locationLabel} below!
              </p>
            </div>
          </div>
        )}

        {/* Main Job Detail Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900 space-y-6">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-6 dark:border-slate-800">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 flex-shrink-0 rounded-2xl border border-slate-200 bg-slate-50 p-2 dark:border-slate-800 dark:bg-slate-800 flex items-center justify-center">
                {job.company.logoUrl ? (
                  <img src={job.company.logoUrl} alt={job.company.name} className="h-full w-full object-cover rounded-lg" />
                ) : (
                  <Building2 className="h-8 w-8 text-slate-400" />
                )}
              </div>
              <div>
                <Link
                  href={`/companies/${job.company.slug}`}
                  className="text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400"
                >
                  {job.company.name}
                </Link>
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                  {job.title}
                </h1>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> Posted {formatDate(job.postedAt)}
                </p>
              </div>
            </div>

            {/* Apply Action Buttons */}
            <div className="flex flex-col gap-2 w-full sm:w-auto">
              {job.applyLink && !isExpired && (
                <a
                  href={job.applyLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-pin transition-transform hover:scale-105"
                >
                  Apply Direct via Link <ExternalLink className="h-4 w-4" />
                </a>
              )}
              {job.hrEmail && !isExpired && (
                <a
                  href={`mailto:${job.hrEmail}?subject=Application for ${encodeURIComponent(job.title)} via Pinhire`}
                  className="flex items-center justify-center gap-2 py-2.5 px-6 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <Mail className="h-4 w-4 text-coral-500" /> Email HR ({job.hrEmail})
                </a>
              )}
            </div>
          </div>

          {/* Hiring Location */}
          <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-coral-50 text-coral-500">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500">Pinhire Hiring Location:</span>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{job.locationLabel}</p>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Role Description & Requirements
            </h2>
            <div className="prose prose-slate dark:prose-invert text-sm leading-relaxed whitespace-pre-line text-slate-700 dark:text-slate-300">
              {job.description}
            </div>
          </div>

        </div>

        {/* Similar Active Roles Section */}
        {similarJobs.length > 0 && (
          <div className="space-y-4 pt-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Similar Roles Active Near {job.locationLabel.split(',')[0]}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {similarJobs.map((j) => (
                <JobCard key={j.id} job={j as any} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
