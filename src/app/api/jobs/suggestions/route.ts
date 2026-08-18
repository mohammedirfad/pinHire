import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getLocalKeywordSuggestions, normalizeSearchText, textMatchesQuery } from '@/lib/search';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || '';
  const normalized = normalizeSearchText(q);

  const suggestions = new Set<string>(getLocalKeywordSuggestions(q, 8));

  try {
    const jobs = await prisma.job.findMany({
      where: { status: 'ACTIVE' },
      include: { company: true },
      orderBy: { postedAt: 'desc' },
      take: 200,
    });

    for (const job of jobs) {
      const candidates = [job.title, job.company.name, job.jobType.replace('_', ' ')];
      for (const candidate of candidates) {
        if (!normalized || textMatchesQuery(candidate, normalized)) {
          suggestions.add(candidate);
        }
      }
    }
  } catch {
    // Local suggestions still make the search useful when the DB is unavailable.
  }

  return NextResponse.json({ suggestions: Array.from(suggestions).slice(0, 10) });
}
