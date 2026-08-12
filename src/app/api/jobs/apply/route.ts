import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { jobId, method, userId } = await req.json();

    if (!jobId) {
      return NextResponse.json({ error: { code: 'MISSING_JOB_ID', message: 'Job ID required' } }, { status: 400 });
    }

    const application = await prisma.application.create({
      data: {
        jobId,
        method: method || 'link',
        userId: userId || null,
      },
    });

    return NextResponse.json({ success: true, application });
  } catch (err) {
    console.error('Error recording application:', err);
    return NextResponse.json({ error: { code: 'APPLICATION_FAILED', message: 'Failed to record application' } }, { status: 500 });
  }
}
