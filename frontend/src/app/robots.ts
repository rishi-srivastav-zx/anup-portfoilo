import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  // In production environments (Vercel, Node server), NEXT_PUBLIC_SITE_URL or NEXT_PUBLIC_BASE_URL can override.
  // Defaults to the canonical production domain: https://anuprawat.com
  const siteUrl = (
    process.env.NEXT_PUBLIC_PRODUCTION_URL ||
    (process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_SITE_URL?.includes('localhost')
      ? process.env.NEXT_PUBLIC_SITE_URL
      : null) ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    'https://anuprawat.com'
  ).replace(/\/+$/, '');

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/api/',
          '/login-page',
          '/login',
        ],
      },
      {
        userAgent: [
          'Googlebot',
          'Googlebot-Image',
          'Bingbot',
        ],
        allow: '/',
        disallow: [
          '/dashboard/',
          '/api/',
          '/login-page',
          '/login',
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
