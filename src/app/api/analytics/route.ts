import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const ALLOWED_EVENT_TYPES = new Set(['visit', 'search', 'apply_click', 'resume_upload']);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const type = typeof body.type === 'string' ? body.type : '';

    if (!ALLOWED_EVENT_TYPES.has(type)) {
      return NextResponse.json({ error: { code: 'INVALID_EVENT', message: 'Invalid analytics event type' } }, { status: 400 });
    }

    const metadata = {
      path: typeof body.path === 'string' ? body.path : '/',
      referrer: req.headers.get('referer') || null,
      userAgent: req.headers.get('user-agent') || null,
      at: new Date().toISOString(),
    };

    await prisma.analyticsEvent.create({
      data: {
        type,
        metadata: JSON.stringify(metadata),
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Analytics tracking failed:', err);
    return NextResponse.json({ success: false }, { status: 200 });
  }
}
