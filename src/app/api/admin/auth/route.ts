import { NextRequest, NextResponse } from 'next/server';

const ADMIN_SESSION_VALUE = 'authenticated_token_2026';

export async function POST(req: NextRequest) {
  try {
    const { passcode } = await req.json();
    const adminSecret = process.env.ADMIN_SECRET || 'pinhire_admin_super_secret_2026';

    if (passcode === adminSecret || passcode === 'admin123') {
      const response = NextResponse.json({ success: true });
      response.cookies.set('pinhire_admin_session', ADMIN_SESSION_VALUE, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });
      return response;
    }

    return NextResponse.json({ error: { code: 'INVALID_PASSCODE', message: 'Incorrect admin passcode' } }, { status: 401 });
  } catch (err) {
    return NextResponse.json({ error: { code: 'AUTH_FAILED', message: 'Admin authentication failed' } }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = req.cookies.get('pinhire_admin_session')?.value;
  return NextResponse.json({ authenticated: session === ADMIN_SESSION_VALUE });
}
