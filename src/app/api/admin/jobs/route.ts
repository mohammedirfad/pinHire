import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const jobs = await prisma.job.findMany({
      include: { company: true },
      orderBy: { createdAt: 'desc' },
    });

    const activeCount = jobs.filter((j) => j.status === 'ACTIVE').length;
    const expiredCount = jobs.filter((j) => j.status === 'EXPIRED').length;
    const applicationsCount = await prisma.application.count();
    const usersCount = await prisma.user.count();
    const visitorsCount = await prisma.analyticsEvent.count({
      where: { type: 'visit' },
    });

    return NextResponse.json({
      success: true,
      jobs,
      metrics: {
        totalJobs: jobs.length,
        activeCount,
        expiredCount,
        applicationsCount,
        usersCount,
        visitorsCount,
      },
    });
  } catch (err) {
    console.error('Failed to fetch admin jobs:', err);
    return NextResponse.json({ error: { code: 'FETCH_FAILED', message: 'Failed to fetch admin jobs' } }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, companyName, locationLabel, lat, lng, experienceMin, experienceMax, jobType, description, applyLink, hrEmail, logoUrl } = body;

    if (!title || !companyName || !locationLabel) {
      return NextResponse.json({ error: { code: 'MISSING_FIELDS', message: 'Title, company name, and location label are required' } }, { status: 400 });
    }

    const companySlug = slugify(companyName);

    let company = await prisma.company.findUnique({ where: { slug: companySlug } });
    if (!company) {
      company = await prisma.company.create({
        data: {
          slug: companySlug,
          name: companyName,
          logoUrl: logoUrl || null,
          verified: true,
          lat: lat || 12.9716,
          lng: lng || 77.5946,
        },
      });
    } else if (logoUrl && logoUrl !== company.logoUrl) {
      company = await prisma.company.update({
        where: { id: company.id },
        data: { logoUrl },
      });
    }

    const slug = `${slugify(title)}-${companySlug}-${Date.now().toString(36)}`;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const newJob = await prisma.job.create({
      data: {
        slug,
        title,
        companyId: company.id,
        description,
        lat: lat || 12.9716,
        lng: lng || 77.5946,
        locationLabel,
        experienceMin: Number(experienceMin) || 0,
        experienceMax: experienceMax ? Number(experienceMax) : null,
        jobType: jobType || 'FULL_TIME',
        applyLink: applyLink || null,
        hrEmail: hrEmail || null,
        expiresAt,
        status: 'ACTIVE',
        source: 'pasted-extract',
        createdBy: 'admin',
      },
      include: { company: true },
    });

    return NextResponse.json({ success: true, job: newJob });
  } catch (err) {
    console.error('Failed to create admin job:', err);
    return NextResponse.json({ error: { code: 'CREATE_FAILED', message: 'Failed to publish job' } }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, action, title, companyName, locationLabel, lat, lng, experienceMin, experienceMax, jobType, description, applyLink, hrEmail, logoUrl } = body;

    if (action === 'renew') {
      const newExpiresAt = new Date();
      newExpiresAt.setDate(newExpiresAt.getDate() + 30);

      const job = await prisma.job.update({
        where: { id },
        data: { status: 'ACTIVE', expiresAt: newExpiresAt },
      });
      return NextResponse.json({ success: true, job });
    }

    if (action === 'update') {
      if (!id || !title || !companyName) {
        return NextResponse.json({ error: { code: 'MISSING_FIELDS', message: 'ID, title, and company name required for update' } }, { status: 400 });
      }

      const companySlug = slugify(companyName);
      let company = await prisma.company.findUnique({ where: { slug: companySlug } });
      if (!company) {
        company = await prisma.company.create({
          data: {
            slug: companySlug,
            name: companyName,
            logoUrl: logoUrl || null,
            verified: true,
            lat: lat || 12.9716,
            lng: lng || 77.5946,
          },
        });
      } else if (logoUrl) {
        company = await prisma.company.update({
          where: { id: company.id },
          data: { logoUrl },
        });
      }

      const updatedJob = await prisma.job.update({
        where: { id },
        data: {
          title,
          companyId: company.id,
          description,
          lat: lat || 12.9716,
          lng: lng || 77.5946,
          locationLabel,
          experienceMin: Number(experienceMin) || 0,
          experienceMax: experienceMax ? Number(experienceMax) : null,
          jobType: jobType || 'FULL_TIME',
          applyLink: applyLink || null,
          hrEmail: hrEmail || null,
        },
        include: { company: true },
      });

      return NextResponse.json({ success: true, job: updatedJob });
    }

    return NextResponse.json({ error: { code: 'INVALID_ACTION', message: 'Action not supported' } }, { status: 400 });
  } catch (err) {
    console.error('Failed to update admin job:', err);
    return NextResponse.json({ error: { code: 'UPDATE_FAILED', message: 'Failed to update job' } }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: { code: 'MISSING_ID', message: 'Job ID required' } }, { status: 400 });
    }

    await prisma.job.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Failed to delete admin job:', err);
    return NextResponse.json({ error: { code: 'DELETE_FAILED', message: 'Failed to delete job' } }, { status: 500 });
  }
}
