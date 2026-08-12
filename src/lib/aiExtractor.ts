// Smart Paste-to-Publish AI Extractor
// Extracts structured job parameters from raw pasted text/emails/descriptions.

import { KNOWN_CITIES, DEFAULT_CENTER } from './geo';

export interface ExtractedJobData {
  title: string;
  companyName: string;
  locationLabel: string;
  lat: number;
  lng: number;
  experienceMin: number;
  experienceMax?: number;
  jobType: 'FULL_TIME' | 'PART_TIME' | 'INTERNSHIP' | 'FREELANCE';
  description: string;
  applyLink?: string;
  hrEmail?: string;
}

export async function extractJobFromText(rawText: string): Promise<ExtractedJobData> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (apiKey && apiKey.trim().length > 0) {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1000,
          messages: [
            {
              role: 'user',
              content: `Analyze the following raw job posting text and output ONLY a raw JSON object (no markdown, no formatting) with these fields:
{
  "title": string,
  "companyName": string,
  "locationLabel": string,
  "lat": number,
  "lng": number,
  "experienceMin": number (years),
  "experienceMax": number or null,
  "jobType": "FULL_TIME" | "PART_TIME" | "INTERNSHIP" | "FREELANCE",
  "description": string,
  "applyLink": string or null,
  "hrEmail": string or null
}

Raw Job Text:
"""
${rawText}
"""`,
            },
          ],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.content?.[0]?.text;
        if (content) {
          const parsed = JSON.parse(content.replace(/```json|```/g, '').trim());
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Anthropic API call failed or not configured, using smart offline fallback extractor:', err);
    }
  }

  // Smart Offline Fallback NLP Extractor
  return parseOfflineJobText(rawText);
}

function parseOfflineJobText(text: string): ExtractedJobData {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  
  // Extract Title (first line or line with Senior/Lead/Engineer/Developer/Manager)
  let title = lines[0] || 'Software Engineer';
  for (const line of lines) {
    if (/(engineer|developer|manager|lead|designer|architect|analyst|specialist)/i.test(line) && line.length < 80) {
      title = line;
      break;
    }
  }

  // Extract Company Name
  let companyName = 'Innovate Tech';
  const companyMatch = text.match(/(?:at|company|hiring for|join|about)\s+([A-Z][A-Za-z0-9\s&]{2,25})/i);
  if (companyMatch) {
    companyName = companyMatch[1].trim();
  }

  // Extract Email
  let hrEmail: string | undefined;
  const emailMatch = text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/);
  if (emailMatch) {
    hrEmail = emailMatch[1];
  }

  // Extract Apply Link
  let applyLink: string | undefined;
  const urlMatch = text.match(/(https?:\/\/[^\s]+)/);
  if (urlMatch) {
    applyLink = urlMatch[1];
  }

  // Extract Experience
  let experienceMin = 2;
  let experienceMax: number | undefined = 5;
  const expMatch = text.match(/(\d+)\s*[-to–]\s*(\d+)\s*(?:years?|yrs?)/i);
  if (expMatch) {
    experienceMin = parseInt(expMatch[1], 10);
    experienceMax = parseInt(expMatch[2], 10);
  } else {
    const singleExp = text.match(/(\d+)\+?\s*(?:years?|yrs?)/i);
    if (singleExp) {
      experienceMin = parseInt(singleExp[1], 10);
    }
  }

  // Job Type
  let jobType: 'FULL_TIME' | 'PART_TIME' | 'INTERNSHIP' | 'FREELANCE' = 'FULL_TIME';
  if (/part[\s-]time/i.test(text)) jobType = 'PART_TIME';
  if (/intern(?:ship)?/i.test(text)) jobType = 'INTERNSHIP';
  if (/freelance|contract/i.test(text)) jobType = 'FREELANCE';

  // Location & Geo matching
  let locationLabel = DEFAULT_CENTER.label;
  let lat = DEFAULT_CENTER.lat;
  let lng = DEFAULT_CENTER.lng;

  for (const [key, cityInfo] of Object.entries(KNOWN_CITIES)) {
    const regex = new RegExp(`\\b${key}|${cityInfo.label.split(',')[0]}\\b`, 'i');
    if (regex.test(text)) {
      locationLabel = cityInfo.label;
      lat = cityInfo.lat;
      lng = cityInfo.lng;
      break;
    }
  }

  return {
    title,
    companyName,
    locationLabel,
    lat,
    lng,
    experienceMin,
    experienceMax,
    jobType,
    description: text,
    applyLink,
    hrEmail,
  };
}
