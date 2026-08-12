import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
import { MOCK_JOBS, MOCK_COMPANIES } from '@/lib/mockData';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  let jobs = [];
  let companies = [];

  try {
    jobs = await prisma.job.findMany({ where: { status: 'ACTIVE' } });
    companies = await prisma.company.findMany();
  } catch (e) {
    jobs = MOCK_JOBS;
    companies = MOCK_COMPANIES;
  }

  const jobUrls = jobs.map((j) => ({
    url: `${baseUrl}/jobs/${j.slug}`,
    lastModified: new Date(j.postedAt),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  const companyUrls = companies.map((c) => ({
    url: `${baseUrl}/companies/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const staticUrls = [
    '',
    '/jobs',
    '/resume-search',
    '/security',
    '/contact',
    '/privacy',
    '/terms',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 1.0,
  }));

  return [...staticUrls, ...jobUrls, ...companyUrls];
}
