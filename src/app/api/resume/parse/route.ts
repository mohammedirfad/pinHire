import { NextRequest, NextResponse } from 'next/server';
import { parseResumeText } from '@/lib/resumeParser';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { resumeText } = await req.json();

    if (!resumeText || !resumeText.trim()) {
      return NextResponse.json({ error: { code: 'MISSING_TEXT', message: 'Resume text is required' } }, { status: 400 });
    }

    const parsedResume = await parseResumeText(resumeText);

    // Fetch active jobs from database
    const dbJobs = await prisma.job.findMany({
      where: { status: 'ACTIVE' },
      include: { company: true },
      orderBy: { postedAt: 'desc' },
    });

    // Weighted Match Scoring Algorithm
    const scoredJobs = dbJobs.map((job) => {
      const jobText = `${job.title} ${job.description} ${job.locationLabel} ${job.company.name}`.toLowerCase();
      let points = 50; // base score

      // 1. Skill overlap (+15 pts per skill)
      let matchedSkillCount = 0;
      parsedResume.skills.forEach((skill) => {
        if (jobText.includes(skill.toLowerCase())) {
          points += 15;
          matchedSkillCount++;
        }
      });

      // 2. Role alignment (+35 pts)
      const matchesRole = parsedResume.detectedRoles.some((role) =>
        jobText.includes(role.toLowerCase()) || job.title.toLowerCase().includes(role.toLowerCase())
      );
      if (matchesRole) points += 35;

      // 3. Location proximity (+25 pts)
      const candidateLoc = parsedResume.locationPreference.toLowerCase();
      const isRemote = job.jobType === 'REMOTE' || jobText.includes('remote');
      const isLocationMatch = candidateLoc && jobText.includes(candidateLoc.split(',')[0].trim());
      if (isRemote || isLocationMatch) points += 25;

      // Normalize match percentage between 65% and 98%
      const matchScore = Math.min(98, Math.max(62, Math.round((points / 160) * 100)));

      return {
        ...job,
        matchScore,
        matchedSkillCount,
      };
    });

    // Sort jobs descending by matchScore
    scoredJobs.sort((a, b) => b.matchScore - a.matchScore);

    return NextResponse.json({
      success: true,
      parsedResume,
      matchedJobs: scoredJobs,
    });
  } catch (err) {
    console.error('Error parsing resume API:', err);
    return NextResponse.json({ error: { code: 'PARSE_FAILED', message: 'Failed to parse resume' } }, { status: 500 });
  }
}
