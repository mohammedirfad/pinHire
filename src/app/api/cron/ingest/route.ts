import { NextResponse } from 'next/server';
import { runJobIngestionAndCleanup } from '@/lib/jobIngestion';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const authHeader = request.headers.get('authorization');
  const secretParam = searchParams.get('secret');

  // Verify secret if CRON_SECRET is configured
  const expectedSecret = process.env.CRON_SECRET;
  if (expectedSecret && secretParam !== expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: 'Unauthorized cron request' }, { status: 401 });
  }

  try {
    const result = await runJobIngestionAndCleanup();
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Ingestion failed' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  return GET(request);
}
