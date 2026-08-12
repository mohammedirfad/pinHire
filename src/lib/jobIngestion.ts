import { prisma } from '@/lib/prisma';
import { geocodeLocation, KNOWN_CITIES } from '@/lib/geo';

export interface IngestionResult {
  success: boolean;
  ingestedCount: number;
  skippedCount: number;
  cleanedCount: number;
  sourcesProcessed: string[];
  logs: string[];
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function generateLogoUrl(companyName: string): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(companyName)}&background=4F46E5&color=ffffff&bold=true&size=128`;
}

export async function runJobIngestionAndCleanup(): Promise<IngestionResult> {
  let ingestedCount = 0;
  let skippedCount = 0;
  let cleanedCount = 0;
  const sourcesProcessed: string[] = [];
  const logs: string[] = [];

  const log = (msg: string) => {
    console.log(`[JobIngestion] ${msg}`);
    logs.push(msg);
  };

  log('Starting multi-source job ingestion pipeline...');

  // 1. Ingest from Arbeitnow API (Free, global/EU tech roles)
  try {
    log('Fetching from Arbeitnow API...');
    const res = await fetch('https://www.arbeitnow.com/api/job-board-api', { next: { revalidate: 0 } });
    if (res.ok) {
      const data = await res.json();
      const jobs = data?.data || [];
      log(`Arbeitnow returned ${jobs.length} raw jobs.`);
      sourcesProcessed.push('arbeitnow');

      for (const item of jobs.slice(0, 15)) {
        const title = item.title?.trim();
        const companyName = item.company_name?.trim();
        const description = item.description?.replace(/<[^>]*>?/gm, '')?.trim();
        const applyLink = item.url?.trim();
        const locationLabel = item.location?.trim() || 'Remote';

        // Complete detail check
        if (!title || !companyName || !description || description.length < 20 || !applyLink) {
          skippedCount++;
          continue;
        }

        // Deduplication check by applyLink or title+company
        const existing = await prisma.job.findFirst({
          where: {
            OR: [
              { applyLink },
              { title, company: { name: companyName } }
            ]
          }
        });

        if (existing) {
          skippedCount++;
          continue;
        }

        // Geocode location
        let coords = await geocodeLocation(locationLabel);
        if (!coords) {
          coords = { lat: KNOWN_CITIES.bangalore.lat, lng: KNOWN_CITIES.bangalore.lng };
        }

        // Find or create company
        const compSlug = slugify(companyName) || `comp-${Date.now()}`;
        let company = await prisma.company.findUnique({ where: { slug: compSlug } });
        if (!company) {
          company = await prisma.company.create({
            data: {
              slug: compSlug,
              name: companyName,
              logoUrl: generateLogoUrl(companyName),
              verified: true,
              lat: coords.lat,
              lng: coords.lng,
            }
          });
        }

        // Create Job
        const baseSlug = slugify(`${title}-${companyName}`);
        const uniqueSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 7)}`;
        const postedAt = item.created_at ? new Date(item.created_at * 1000) : new Date();
        const expiresAt = new Date(postedAt.getTime() + 25 * 24 * 60 * 60 * 1000);

        await prisma.job.create({
          data: {
            slug: uniqueSlug,
            title,
            companyId: company.id,
            description,
            lat: coords.lat,
            lng: coords.lng,
            locationLabel,
            jobType: item.remote ? 'REMOTE' : 'FULL_TIME',
            applyLink,
            postedAt,
            expiresAt,
            status: 'ACTIVE',
            source: 'arbeitnow',
            createdBy: 'auto-ingest',
          }
        });

        ingestedCount++;
      }
    }
  } catch (err: any) {
    log(`Arbeitnow ingestion error: ${err.message}`);
  }

  // 2. Ingest from Remotive API (Free, remote tech roles)
  try {
    log('Fetching from Remotive API...');
    const res = await fetch('https://remotive.com/api/remote-jobs?limit=15', { next: { revalidate: 0 } });
    if (res.ok) {
      const data = await res.json();
      const jobs = data?.jobs || [];
      log(`Remotive returned ${jobs.length} raw jobs.`);
      sourcesProcessed.push('remotive');

      for (const item of jobs.slice(0, 15)) {
        const title = item.title?.trim();
        const companyName = item.company_name?.trim();
        const description = item.description?.replace(/<[^>]*>?/gm, '')?.trim();
        const applyLink = item.url?.trim();
        const locationLabel = item.candidate_required_location?.trim() || 'Worldwide (Remote)';
        const logoUrl = item.company_logo_url || generateLogoUrl(companyName || 'Company');

        if (!title || !companyName || !description || description.length < 20 || !applyLink) {
          skippedCount++;
          continue;
        }

        const existing = await prisma.job.findFirst({
          where: {
            OR: [
              { applyLink },
              { title, company: { name: companyName } }
            ]
          }
        });

        if (existing) {
          skippedCount++;
          continue;
        }

        let coords = await geocodeLocation(locationLabel);
        if (!coords) {
          coords = { lat: KNOWN_CITIES.sf.lat, lng: KNOWN_CITIES.sf.lng };
        }

        const compSlug = slugify(companyName) || `comp-${Date.now()}`;
        let company = await prisma.company.findUnique({ where: { slug: compSlug } });
        if (!company) {
          company = await prisma.company.create({
            data: {
              slug: compSlug,
              name: companyName,
              logoUrl: logoUrl || generateLogoUrl(companyName),
              verified: true,
              lat: coords.lat,
              lng: coords.lng,
            }
          });
        }

        const baseSlug = slugify(`${title}-${companyName}`);
        const uniqueSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 7)}`;
        const postedAt = item.publication_date ? new Date(item.publication_date) : new Date();
        const expiresAt = new Date(postedAt.getTime() + 25 * 24 * 60 * 60 * 1000);

        await prisma.job.create({
          data: {
            slug: uniqueSlug,
            title,
            companyId: company.id,
            description,
            lat: coords.lat,
            lng: coords.lng,
            locationLabel,
            jobType: 'REMOTE',
            applyLink,
            postedAt,
            expiresAt,
            status: 'ACTIVE',
            source: 'remotive',
            createdBy: 'auto-ingest',
          }
        });

        ingestedCount++;
      }
    }
  } catch (err: any) {
    log(`Remotive ingestion error: ${err.message}`);
  }

  // 3. Ingest from Adzuna API (if credentials present)
  const adzunaAppId = process.env.ADZUNA_APP_ID;
  const adzunaAppKey = process.env.ADZUNA_APP_KEY;

  if (adzunaAppId && adzunaAppKey) {
    try {
      log('Fetching from Adzuna API (India)...');
      const url = `https://api.adzuna.com/v1/api/jobs/in/search/1?app_id=${adzunaAppId}&app_key=${adzunaAppKey}&results_per_page=15&content-type=application/json`;
      const res = await fetch(url, { next: { revalidate: 0 } });
      if (res.ok) {
        const data = await res.json();
        const jobs = data?.results || [];
        log(`Adzuna returned ${jobs.length} raw jobs.`);
        sourcesProcessed.push('adzuna');

        for (const item of jobs) {
          const title = item.title?.trim();
          const companyName = item.company?.display_name?.trim();
          const description = item.description?.trim();
          const applyLink = item.redirect_url?.trim();
          const locationLabel = item.location?.display_name?.trim() || 'India';

          if (!title || !companyName || !description || description.length < 20 || !applyLink) {
            skippedCount++;
            continue;
          }

          const existing = await prisma.job.findFirst({
            where: {
              OR: [
                { applyLink },
                { title, company: { name: companyName } }
              ]
            }
          });

          if (existing) {
            skippedCount++;
            continue;
          }

          let coords = await geocodeLocation(locationLabel);
          if (!coords) {
            coords = { lat: KNOWN_CITIES.bangalore.lat, lng: KNOWN_CITIES.bangalore.lng };
          }

          const compSlug = slugify(companyName) || `comp-${Date.now()}`;
          let company = await prisma.company.findUnique({ where: { slug: compSlug } });
          if (!company) {
            company = await prisma.company.create({
              data: {
                slug: compSlug,
                name: companyName,
                logoUrl: generateLogoUrl(companyName),
                verified: true,
                lat: coords.lat,
                lng: coords.lng,
              }
            });
          }

          const baseSlug = slugify(`${title}-${companyName}`);
          const uniqueSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 7)}`;
          const postedAt = item.created ? new Date(item.created) : new Date();
          const expiresAt = new Date(postedAt.getTime() + 25 * 24 * 60 * 60 * 1000);

          await prisma.job.create({
            data: {
              slug: uniqueSlug,
              title,
              companyId: company.id,
              description,
              lat: coords.lat,
              lng: coords.lng,
              locationLabel,
              jobType: 'FULL_TIME',
              applyLink,
              postedAt,
              expiresAt,
              status: 'ACTIVE',
              source: 'adzuna',
              createdBy: 'auto-ingest',
            }
          });

          ingestedCount++;
        }
      }
    } catch (err: any) {
      log(`Adzuna ingestion error: ${err.message}`);
    }
  } else {
    log('Adzuna API keys not set (ADZUNA_APP_ID/ADZUNA_APP_KEY). Skipping Adzuna feed.');
  }

  // 4. Auto-Delete Jobs older than 25 days
  try {
    log('Executing 25-day auto-cleanup for expired jobs...');
    const twentyFiveDaysAgo = new Date(Date.now() - 25 * 24 * 60 * 60 * 1000);
    const deleteResult = await prisma.job.deleteMany({
      where: {
        postedAt: {
          lt: twentyFiveDaysAgo,
        },
      },
    });
    cleanedCount = deleteResult.count;
    log(`Cleaned up ${cleanedCount} jobs older than 25 days.`);
  } catch (err: any) {
    log(`Auto-cleanup error: ${err.message}`);
  }

  log(`Job Ingestion & Cleanup completed. Ingested: ${ingestedCount}, Skipped: ${skippedCount}, Deleted >25d: ${cleanedCount}`);

  return {
    success: true,
    ingestedCount,
    skippedCount,
    cleanedCount,
    sourcesProcessed,
    logs,
  };
}
