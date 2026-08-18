import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
import { MOCK_JOBS, MOCK_COMPANIES } from '@/lib/mockData';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.pinhire.online';

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
    { route: '', priority: 1.0, changeFrequency: 'daily' as const },
    { route: '/jobs', priority: 0.95, changeFrequency: 'daily' as const },
    { route: '/resume-search', priority: 0.8, changeFrequency: 'weekly' as const },
    { route: '/contact', priority: 0.4, changeFrequency: 'monthly' as const },
    { route: '/security', priority: 0.3, changeFrequency: 'monthly' as const },
    { route: '/privacy', priority: 0.2, changeFrequency: 'yearly' as const },
    { route: '/terms', priority: 0.2, changeFrequency: 'yearly' as const },
  ].map((page) => ({
    url: `${baseUrl}${page.route}`,
    lastModified: new Date(),
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));

  return [...staticUrls, ...jobUrls, ...companyUrls];
}
