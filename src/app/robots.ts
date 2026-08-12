import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const adminPath = process.env.NEXT_PUBLIC_ADMIN_PATH || '/ops-7f3a9c2e';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [adminPath, '/api/admin/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
