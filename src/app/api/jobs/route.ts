import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDistanceKm, KNOWN_CITIES } from '@/lib/geo';

export const dynamic = 'force-dynamic';

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
          j.title.toLowerCase().includes(keyword) ||
          j.company.name.toLowerCase().includes(keyword) ||
          j.description.toLowerCase().includes(keyword)
      );
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
