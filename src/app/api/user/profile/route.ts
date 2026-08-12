import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get('pinhire_user_session');
    if (!sessionCookie?.value) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Not logged in.' } }, { status: 401 });
    }
    const session = JSON.parse(sessionCookie.value);
    const { name, notifyFreq } = await req.json();

    const updated = await prisma.user.update({
      where: { id: session.id },
      data: {
        ...(name ? { name } : {}),
        ...(notifyFreq ? { notifyFreq } : {}),
      },
    });

    if (notifyFreq && notifyFreq !== 'off') {
      console.log(`[Email Dispatcher] Candidate ${updated.email} configured ${notifyFreq} job alert digests for matching map roles.`);
    }

    return NextResponse.json({
      success: true,
      user: {
        id: updated.id,
        email: updated.email,
        name: updated.name,
        notifyFreq: updated.notifyFreq,
      },
      message: notifyFreq && notifyFreq !== 'off'
        ? `Job alert notifications enabled! Digests will be sent to ${updated.email}.`
        : 'Profile updated.',
    });
  } catch (err) {
    return NextResponse.json({ error: { code: 'UPDATE_FAILED', message: 'Failed to update profile.' } }, { status: 500 });
  }
}
