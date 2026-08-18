import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDistanceKm, KNOWN_CITIES } from '@/lib/geo';
import { normalizeSearchText, textMatchesQuery } from '@/lib/search';

export const dynamic = 'force-dynamic';

function getKeywordRelevance(job: any, keyword: string): number {
  const query = normalizeSearchText(keyword);
  if (!query) return 0;

  const title = normalizeSearchText(job.title || '');
  const company = normalizeSearchText(job.company?.name || '');
  const description = normalizeSearchText(job.description || '');
  const jobType = normalizeSearchText(job.jobType || '');

  if (title === query) return 100;
  if (company === query) return 95;
  if (title.startsWith(query)) return 90;
  if (company.startsWith(query)) return 85;
  if (title.includes(query)) return 80;
  if (company.includes(query)) return 75;
  if (jobType.includes(query)) return 60;
  if (description.includes(query)) return 45;
  return 20;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const keyword = searchParams.get('keyword')?.toLowerCase() || '';
    const location = searchParams.get('location')?.toLowerCase() || '';
    const experienceBand = searchParams.get('experienceBand') || 'all';
    const jobType = searchParams.get('jobType') || 'all';
    const radiusKm = Number(searchParams.get('radiusKm')) || 100;
    const centerLat = searchParams.get('lat') ? Number(searchParams.get('lat')) : null;
    const centerLng = searchParams.get('lng') ? Number(searchParams.get('lng')) : null;

    let jobs = await prisma.job.findMany({
      where: {
        status: 'ACTIVE',
      },
      include: {
        company: true,
      },
      orderBy: {
        postedAt: 'desc',
      },
    });

    // Filter by keyword
    if (keyword) {
      jobs = jobs.filter(
        (j) =>
          textMatchesQuery(`${j.title} ${j.company.name} ${j.description} ${j.jobType}`, keyword)
      );
      jobs = jobs.sort((a, b) => {
        const relevanceDiff = getKeywordRelevance(b, keyword) - getKeywordRelevance(a, keyword);
        if (relevanceDiff !== 0) return relevanceDiff;
        return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
      });
    }

    // Filter by location text
    if (location) {
      jobs = jobs.filter(
        (j) =>
          j.locationLabel.toLowerCase().includes(location) ||
          j.company.name.toLowerCase().includes(location)
      );
    }

    // Filter by job type
    if (jobType !== 'all') {
      jobs = jobs.filter((j) => j.jobType === jobType);
    }

    // Filter by experience band
    if (experienceBand !== 'all') {
      if (experienceBand === '0-1') jobs = jobs.filter((j) => j.experienceMin <= 1);
      else if (experienceBand === '1-3') jobs = jobs.filter((j) => j.experienceMin >= 1 && j.experienceMin <= 3);
      else if (experienceBand === '3-5') jobs = jobs.filter((j) => j.experienceMin >= 3 && j.experienceMin <= 5);
      else if (experienceBand === '5-7') jobs = jobs.filter((j) => j.experienceMin >= 5 && j.experienceMin <= 7);
      else if (experienceBand === '7+') jobs = jobs.filter((j) => j.experienceMin >= 7);
    }

    // Filter by geographic radius if lat/lng center provided
    if (centerLat !== null && centerLng !== null) {
      jobs = jobs.filter(
        (j) => getDistanceKm(centerLat, centerLng, j.lat, j.lng) <= radiusKm
      );
    }

    return NextResponse.json({ success: true, count: jobs.length, jobs });
  } catch (error) {
    console.error('Error fetching jobs API:', error);
    return NextResponse.json({ error: { code: 'FETCH_JOBS_FAILED', message: 'Failed to fetch job postings' } }, { status: 500 });
  }
}
