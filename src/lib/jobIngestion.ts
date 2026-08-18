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

function decodeHtml(value: string): string {
  return value
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&ndash;/g, '-')
    .replace(/&mdash;/g, '-')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function stripHtml(value: string): string {
  return decodeHtml(value.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();
}

function toAbsoluteUrl(url: string, baseUrl: string): string {
  try {
    return new URL(url, baseUrl).toString();
  } catch {
    return baseUrl;
  }
}

function parseDate(value?: string | null): Date | null {
  if (!value) return null;
  const cleaned = value.replace(/(\d+)(st|nd|rd|th)/gi, '$1').trim();
  const ddMmYyyy = cleaned.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (ddMmYyyy) {
    return new Date(Number(ddMmYyyy[3]), Number(ddMmYyyy[2]) - 1, Number(ddMmYyyy[1]));
  }

  const parsed = new Date(cleaned);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getExpiryDate(value?: string | null): Date {
  const parsed = parseDate(value);
  if (parsed) return parsed;

  const fallback = new Date();
  fallback.setDate(fallback.getDate() + 30);
  return fallback;
}

function parseExperienceRange(text: string) {
  const normalized = text.toLowerCase();
  const range = normalized.match(/(\d+)\s*(?:\+|to|-)\s*(\d+)?\s*(?:years|year|yrs|yr)/);
  if (range) {
    return {
      min: Number(range[1]) || 0,
      max: range[2] ? Number(range[2]) : null,
    };
  }

  const single = normalized.match(/(\d+)\s*\+?\s*(?:years|year|yrs|yr)/);
  return {
    min: single ? Number(single[1]) || 0 : 0,
    max: null,
  };
}

function parseInfoparkRows(html: string, baseUrl: string) {
  const rows = [...html.matchAll(/<tr[\s\S]*?<\/tr>/gi)];
  return rows
    .map((row) => {
      const rowHtml = row[0];
      const cells = [...rowHtml.matchAll(/<td[\s\S]*?>([\s\S]*?)<\/td>/gi)].map((cell) => stripHtml(cell[1]));
      const detailHref = rowHtml.match(/href=["']([^"']*(?:company-jobs\/details|\/jobs\/)[^"']*)["']/i)?.[1];
      if (cells.length < 4 || !detailHref) return null;

      return {
        postedDate: cells[0],
        title: cells[1],
        companyName: cells[2],
        closingDate: cells[3],
        detailUrl: toAbsoluteUrl(detailHref, baseUrl),
      };
    })
    .filter(Boolean) as Array<{
      postedDate: string;
      title: string;
      companyName: string;
      closingDate: string;
      detailUrl: string;
    }>;
}

function parseInfoparkDetail(html: string) {
  const text = stripHtml(html);
  const email = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || null;
  const location = text.match(/Location\s*:?\s*([A-Za-z ,.-]+)/i)?.[1]?.split(/Job Summary|Key Responsibilities|Qualification/i)[0]?.trim();
  const profileHref = html.match(/href=["']([^"']*company-profile[^"']*)["']/i)?.[1] || null;
  const logoHref = html.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1] || null;

  const careerStart = text.indexOf('Career Opportunities');
  const description = careerStart >= 0 ? text.slice(careerStart).replace(/^Career Opportunities\s+Back\s+/i, '').trim() : text;

  return {
    description,
    email,
    location,
    companyWebsite: profileHref,
    logoHref,
  };
}

function getEnvList(name: string, fallback: string[]): string[] {
  return (process.env[name] || fallback.join(','))
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function getEnvNumber(name: string, fallback: number, max: number): number {
  const value = Number(process.env[name]);
  if (!Number.isFinite(value) || value <= 0) return fallback;
  return Math.min(value, max);
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

  // 0. Ingest from Infopark public jobs pages (Kerala IT park roles)
  try {
    const baseUrl = 'https://infopark.in';
    const maxPages = getEnvNumber('INFOPARK_PAGES', 5, 25);
    log(`Fetching from Infopark public jobs pages (${maxPages} page(s))...`);
    sourcesProcessed.push('infopark');

    for (let page = 1; page <= maxPages; page++) {
      const listRes = await fetch(`${baseUrl}/companies-job?page=${page}`, {
        headers: {
          'User-Agent': 'PinhireJobBot/1.0 (+https://www.pinhire.online)',
          Accept: 'text/html',
        },
        next: { revalidate: 0 },
      });

      if (!listRes.ok) {
        log(`Infopark skipped page ${page}: HTTP ${listRes.status}`);
        continue;
      }

      const listHtml = await listRes.text();
      const listings = parseInfoparkRows(listHtml, baseUrl);
      log(`Infopark returned ${listings.length} listing rows for page ${page}.`);

      for (const listing of listings) {
        if (!listing.title || !listing.companyName || !listing.detailUrl) {
          skippedCount++;
          continue;
        }

        const existing = await prisma.job.findFirst({
          where: {
            OR: [
              { applyLink: listing.detailUrl },
              { title: listing.title, company: { name: listing.companyName } },
            ],
          },
        });

        if (existing) {
          skippedCount++;
          continue;
        }

        const detailRes = await fetch(listing.detailUrl, {
          headers: {
            'User-Agent': 'PinhireJobBot/1.0 (+https://www.pinhire.online)',
            Accept: 'text/html',
          },
          next: { revalidate: 0 },
        });

        if (!detailRes.ok) {
          skippedCount++;
          continue;
        }

        const detail = parseInfoparkDetail(await detailRes.text());
        const description = detail.description || `Job vacancy for ${listing.title} at ${listing.companyName}.`;
        if (description.length < 80) {
          skippedCount++;
          continue;
        }

        const locationLabel = detail.location || 'Infopark Kochi, Kerala, India';
        const coords = (await geocodeLocation(locationLabel)) || { lat: 10.0104, lng: 76.3637 };
        const companySlug = slugify(listing.companyName) || `infopark-company-${Date.now()}`;
        const company = await prisma.company.upsert({
          where: { slug: companySlug },
          update: {
            website: detail.companyWebsite ? toAbsoluteUrl(detail.companyWebsite, baseUrl) : undefined,
            logoUrl: detail.logoHref ? toAbsoluteUrl(detail.logoHref, baseUrl) : undefined,
          },
          create: {
            slug: companySlug,
            name: listing.companyName,
            website: detail.companyWebsite ? toAbsoluteUrl(detail.companyWebsite, baseUrl) : null,
            logoUrl: detail.logoHref ? toAbsoluteUrl(detail.logoHref, baseUrl) : null,
            verified: true,
            lat: coords.lat,
            lng: coords.lng,
          },
        });

        const experience = parseExperienceRange(`${listing.title} ${description}`);
        const postedAt = parseDate(listing.postedDate) || new Date();
        await prisma.job.create({
          data: {
            slug: `${slugify(`${listing.title}-${listing.companyName}`)}-${Math.random().toString(36).slice(2, 7)}`,
            title: listing.title,
            companyId: company.id,
            description,
            lat: coords.lat,
            lng: coords.lng,
            locationLabel,
            experienceMin: experience.min,
            experienceMax: experience.max,
            jobType: listing.title.toLowerCase().includes('intern') ? 'INTERNSHIP' : 'FULL_TIME',
            applyLink: listing.detailUrl,
            hrEmail: detail.email,
            postedAt,
            expiresAt: getExpiryDate(listing.closingDate),
            status: 'ACTIVE',
            source: 'infopark',
            createdBy: 'auto-ingest',
          },
        });

        ingestedCount++;
      }
    }
  } catch (err: any) {
    log(`Infopark ingestion error: ${err.message}`);
  }

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
      const indiaLocations = getEnvList('INDIA_JOB_LOCATIONS', [
        'Bangalore',
        'Hyderabad',
        'Pune',
        'Chennai',
        'Mumbai',
        'Delhi NCR',
        'Gurgaon',
        'Noida',
        'Kochi',
        'Ahmedabad',
      ]);
      const resultsPerPage = getEnvNumber('ADZUNA_RESULTS_PER_PAGE', 50, 50);
      const pagesPerLocation = getEnvNumber('ADZUNA_PAGES_PER_LOCATION', 1, 5);
      const geocodeCache = new Map<string, { lat: number; lng: number } | null>();

      log(`Fetching from Adzuna API (India sweep: ${indiaLocations.length} locations, ${pagesPerLocation} page(s) each)...`);
      sourcesProcessed.push('adzuna');

      for (const location of indiaLocations) {
        for (let page = 1; page <= pagesPerLocation; page++) {
          const params = new URLSearchParams({
            app_id: adzunaAppId,
            app_key: adzunaAppKey,
            results_per_page: String(resultsPerPage),
            where: location,
            'content-type': 'application/json',
          });
          const url = `https://api.adzuna.com/v1/api/jobs/in/search/${page}?${params.toString()}`;
          const res = await fetch(url, { next: { revalidate: 0 } });
          if (!res.ok) {
            log(`Adzuna skipped ${location} page ${page}: HTTP ${res.status}`);
            continue;
          }

          const data = await res.json();
          const jobs = data?.results || [];
          log(`Adzuna returned ${jobs.length} raw jobs for ${location}, page ${page}.`);

          for (const item of jobs) {
            const title = item.title?.trim();
            const companyName = item.company?.display_name?.trim();
            const description = item.description?.trim();
            const applyLink = item.redirect_url?.trim();
            const locationLabel = item.location?.display_name?.trim() || `${location}, India`;

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

            let coords = geocodeCache.get(locationLabel);
            if (coords === undefined) {
              coords = await geocodeLocation(locationLabel);
              geocodeCache.set(locationLabel, coords);
            }
            if (!coords) {
              coords = await geocodeLocation(`${location}, India`);
            }
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
