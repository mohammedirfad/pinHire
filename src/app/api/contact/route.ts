import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/redis';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateLimit = await checkRateLimit(ip, 5, 60);

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests. Please wait a minute before submitting again.' } },
        { status: 429 }
      );
    }

    const { name, email, subject, message, honeypot } = await req.json();

    // Spam Honeypot Check
    if (honeypot && honeypot.trim().length > 0) {
      // Silent rejection for bots filling hidden fields
      return NextResponse.json({ success: true, message: 'Message sent successfully' });
    }

    if (!name || !email || !message) {
      return NextResponse.json({ error: { code: 'MISSING_FIELDS', message: 'Name, email, and message are required.' } }, { status: 400 });
    }

    console.log(`[CONTACT FORM SUBMISSION] From: ${name} <${email}> | Subject: ${subject}`);

    return NextResponse.json({ success: true, message: 'Your message has been received! We will reply shortly.' });
  } catch (err) {
    return NextResponse.json({ error: { code: 'CONTACT_SUBMIT_FAILED', message: 'Failed to process contact message.' } }, { status: 500 });
  }
}
