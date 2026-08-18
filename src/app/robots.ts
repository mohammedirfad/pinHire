import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.pinhire.online';
  const adminPath = process.env.NEXT_PUBLIC_ADMIN_PATH || '/ops-7f3a9c2e';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [adminPath, '/api/', '/login', '/signup', '/profile'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
