import { PrismaClient } from '@prisma/client';
import { MOCK_COMPANIES, MOCK_JOBS } from '../src/lib/mockData';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Pinhire database...');

  await prisma.application.deleteMany();
  await prisma.savedJob.deleteMany();
  await prisma.job.deleteMany();
  await prisma.company.deleteMany();

  for (const company of MOCK_COMPANIES) {
    await prisma.company.create({
      data: {
        id: company.id,
        slug: company.slug,
        name: company.name,
        description: company.description,
        website: company.website,
        logoUrl: company.logoUrl,
        verified: company.verified,
        lat: company.lat,
        lng: company.lng,
      },
    });
  }

  for (const job of MOCK_JOBS) {
    await prisma.job.create({
      data: {
        id: job.id,
        slug: job.slug,
        title: job.title,
        companyId: job.companyId,
        description: job.description,
        lat: job.lat,
        lng: job.lng,
        locationLabel: job.locationLabel,
        experienceMin: job.experienceMin,
        experienceMax: job.experienceMax,
        jobType: job.jobType,
        applyLink: job.applyLink,
        hrEmail: job.hrEmail,
        postedAt: new Date(job.postedAt),
        expiresAt: new Date(job.expiresAt),
        status: job.status,
        source: job.source,
        createdBy: job.createdBy,
      },
    });
  }

  console.log('Successfully seeded Pinhire database with companies and jobs!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
