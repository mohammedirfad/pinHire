# 📍 Pinhire — Interactive Map-Based Job Portal

> *"See where the jobs actually are. Pinhire is the only job portal that shows you real hiring locations on a live map — not another endless list."*

---

## 🌟 Core USP Pillars
1. **See it, don't scroll it:** Every open role is pinned exactly where the company is hiring — city, district, or office.
2. **Apply your way:** No forced sign-up. Apply directly via the company's link, email the HR contact directly, or track applications in your candidate profile.
3. **Resume-first discovery:** Upload a resume once — Pinhire reads it and shows matching roles near your preferred location.

---

## 🛠️ Technology Stack
- **Framework:** Next.js 14+ (App Router), TypeScript (Strict Mode)
- **Styling:** Tailwind CSS + Lucide Icons + Framer Motion
- **Database:** PostgreSQL with Prisma ORM
- **Maps:** Leaflet / MapLibre GL / OpenStreetMap (with custom HTML company logo markers)
- **AI & Resume Parsing:** Anthropic Claude API (with smart offline NLP parser fallbacks)
- **Caching & Rate Limiting:** Redis token bucket (with memory TTL fallback for standalone zero-config execution)
- **SEO & Structured Data:** `generateMetadata`, `JobPosting` schema.org JSON-LD, dynamic `sitemap.xml` & `robots.txt`, 410 graceful redirects for expired roles

---

## 🚀 Quick Start Guide

### 1. Installation
```bash
git clone https://github.com/your-org/pinhire.git
cd pinhire
npm install
```

### 2. Environment Setup
Copy `.env.example` to `.env`:
```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST.neon.tech/DBNAME?sslmode=require"

# Admin Panel Secret Path (Randomized & configurable per deployment)
NEXT_PUBLIC_ADMIN_PATH="/--------"
ADMIN_SECRET="pinhire_admin_super_secret_2026"

# Site Metadata
NEXT_PUBLIC_SITE_URL="http://localhost:3000"

# Optional External API Keys (Graceful fallbacks included out of the box)
ANTHROPIC_API_KEY=""
MAPBOX_ACCESS_TOKEN=""
```

### 3. Database Initialization & Seeding
```bash
npx prisma db push
node prisma/seed.js
```

For Vercel + Neon, set the same `DATABASE_URL` in Vercel project environment variables, then run `npx prisma db push` against that Neon URL once so the production tables exist.

### 4. Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔒 Secret Admin Panel & How to Rotate the Admin URL

The Admin Panel is served at a **non-guessable, randomized URL path** (never `/admin` or `/dashboard`).

- **Default Path:** `http://localhost:3000/ops-7f3a9c2e`
- **Default Passcode:** `admin123`

### How to Rotate the Admin Path
To change or rotate the secret path in production:
1. Update `NEXT_PUBLIC_ADMIN_PATH` in `.env`:
   ```env
   NEXT_PUBLIC_ADMIN_PATH="/ops-secret-key-9921"
   ```
2. Re-deploy or restart your Next.js application. Access is immediately isolated to the new URL.

---

## 📄 Key Application Routes

| Route | Description |
|---|---|
| `/` | Landing page with Hero search, live Leaflet map preview, USP pillars, & trending jobs |
| `/jobs` | Split Map + List hybrid view with live pin syncing, debounced map panning, & radius filters |
| `/jobs/[slug]` | SSR job detail page with full SEO metadata, `JobPosting` schema.org, & 410 expired role handling |
| `/companies/[slug]` | Company profile page featuring company logo, verified badge, description, & open roles |
| `/resume-search` | AI Resume Upload → extracts candidate skills & experience → pins matching jobs on map |
| `/profile` | Logged-in candidate dashboard: saved job bookmarks, application history, & digest frequency |
| `/contact` | Rate-limited contact form with honeypot spam protection |
| `/security` | Security, privacy practices, & compliance page |
| `/privacy`, `/terms` | Standard legal policies |
| `/[NEXT_PUBLIC_ADMIN_PATH]` | Admin console with Smart Paste-to-Publish AI Extractor & 30-day auto-expiry renewal |

---

## 🎨 Design System
- **Primary Color:** Deep Indigo (`#3730A3` / `#4F46E5`)
- **Accent Color:** Coral (`#FF6B4A`)
- **Neutrals:** Slate Dark Mode & Light Mode glassmorphism
