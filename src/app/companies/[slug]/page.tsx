import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Building2, Globe, CheckCircle2, MapPin, ArrowLeft } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { MOCK_COMPANIES, MOCK_JOBS } from '@/lib/mockData';
import { JobCard } from '@/components/JobCard';

interface CompanyPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: CompanyPageProps) {
  let company = null;
  try {
    company = await prisma.company.findUnique({ where: { slug: params.slug } });
  } catch (e) {
    company = MOCK_COMPANIES.find(c => c.slug === params.slug);
  }

  if (!company) return { title: 'Company Not Found' };

  return {
    title: `${company.name} Jobs & Hiring Locations | Pinhire`,
    description: `Explore all open roles and office locations for ${company.name} on Pinhire live map.`,
  };
}

export default async function CompanyProfilePage({ params }: CompanyPageProps) {
  let company: any = null;
  let companyJobs: any[] = [];
  
  try {
    company = await prisma.company.findUnique({
      where: { slug: params.slug },
      include: { jobs: true },
    });
    if (company) {
      companyJobs = company.jobs.map((j: any) => ({
        ...j,
        company,
        postedAt: j.postedAt.toISOString(),
        expiresAt: j.expiresAt.toISOString(),
      }));
    }
  } catch (e) {
    company = MOCK_COMPANIES.find(c => c.slug === params.slug) as any;
    companyJobs = MOCK_JOBS.filter(j => j.companyId === company?.id) as any;
  }

  if (!company) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        
        <Link
          href="/jobs"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Map Jobs
        </Link>

        {/* Company Header Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 flex-shrink-0 rounded-2xl border border-slate-200 bg-slate-50 p-2 dark:border-slate-800 dark:bg-slate-800 flex items-center justify-center">
              {company.logoUrl ? (
                <img src={company.logoUrl} alt={company.name} className="h-full w-full object-cover rounded-xl" />
              ) : (
                <Building2 className="h-10 w-10 text-slate-400" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {company.name}
                </h1>
                {company.verified && (
                  <CheckCircle2 className="h-5 w-5 text-brand-600" />
                )}
              </div>
              {company.website && (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400 flex items-center gap-1 mt-1"
                >
                  <Globe className="h-3.5 w-3.5" /> {company.website}
                </a>
              )}
            </div>
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {company.description}
          </p>
        </div>

        {/* Open Job Roles List */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center justify-between">
            <span>Open Job Postings ({companyJobs.length})</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {companyJobs.map((job) => (
              <JobCard key={job.id} job={job as any} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
