import { NextRequest, NextResponse } from 'next/server';
import { extractJobFromText } from '@/lib/aiExtractor';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { rawText } = body;

    if (!rawText || typeof rawText !== 'string') {
      return NextResponse.json({ error: { code: 'INVALID_INPUT', message: 'Raw text is required' } }, { status: 400 });
    }

    const extracted = await extractJobFromText(rawText);
    return NextResponse.json({ success: true, extracted });
  } catch (err) {
    console.error('Error in smart job extraction:', err);
    return NextResponse.json({ error: { code: 'EXTRACTION_FAILED', message: 'Failed to extract job details' } }, { status: 500 });
  }
}
