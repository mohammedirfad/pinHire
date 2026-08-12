import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createHash } from 'crypto';

export const dynamic = 'force-dynamic';

function hashPassword(password: string): string {
  return createHash('sha256').update(password + 'pinhire_salt_2026').digest('hex');
}

export async function POST(req: NextRequest) {
  try {
    const { action, name, email, password } = await req.json();

    if (action === 'signup') {
      if (!email || !password || !name) {
        return NextResponse.json({ error: { code: 'MISSING_FIELDS', message: 'Name, email, and password are required.' } }, { status: 400 });
      }

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return NextResponse.json({ error: { code: 'EMAIL_EXISTS', message: 'An account with this email already exists.' } }, { status: 400 });
      }

      const user = await prisma.user.create({
        data: { email, name, parsedResume: hashPassword(password) },
      });

      const response = NextResponse.json({ success: true, user: { id: user.id, email: user.email, name: user.name } });
      response.cookies.set('pinhire_user_session', JSON.stringify({ id: user.id, email: user.email, name: user.name }), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
      });
      return response;
    }

    if (action === 'login') {
      if (!email || !password) {
        return NextResponse.json({ error: { code: 'MISSING_FIELDS', message: 'Email and password are required.' } }, { status: 400 });
      }

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || user.parsedResume !== hashPassword(password)) {
        return NextResponse.json({ error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' } }, { status: 401 });
      }

      const response = NextResponse.json({ success: true, user: { id: user.id, email: user.email, name: user.name } });
      response.cookies.set('pinhire_user_session', JSON.stringify({ id: user.id, email: user.email, name: user.name }), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
      });
      return response;
    }

    if (action === 'logout') {
      const response = NextResponse.json({ success: true });
      response.cookies.delete('pinhire_user_session');
      return response;
    }

    return NextResponse.json({ error: { code: 'INVALID_ACTION', message: 'Unknown action' } }, { status: 400 });
  } catch (err) {
    console.error('Auth error:', err);
    return NextResponse.json({ error: { code: 'AUTH_FAILED', message: 'Authentication failed' } }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get('pinhire_user_session');
    if (!sessionCookie?.value) {
      return NextResponse.json({ user: null });
    }
    const user = JSON.parse(sessionCookie.value);
    // Fetch latest prefs from DB
    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser) return NextResponse.json({ user: null });
    return NextResponse.json({ user: { id: dbUser.id, email: dbUser.email, name: dbUser.name, notifyFreq: dbUser.notifyFreq } });
  } catch {
    return NextResponse.json({ user: null });
  }
}
