import { fetchDynamicArticles } from './blog/data/articles';

export default async function sitemap() {
  const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    'https://anuprawat.com'
  ).replace(/\/+$/, '');

  const staticRoutes = [
    {
      url: `${siteUrl}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${siteUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${siteUrl}/terms-and-conditions`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  try {
    const articles = await fetchDynamicArticles(100);
    const blogRoutes = (articles || [])
      .filter((article) => article.status === 'published')
      .map((article) => ({
        url: `${siteUrl}/blog/${article.slug}`,
        lastModified: article.updatedAt
          ? new Date(article.updatedAt)
          : article.publishedAt
          ? new Date(article.publishedAt)
          : new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
      }));

    return [...staticRoutes, ...blogRoutes];
  } catch (error) {
    console.error('[sitemap] Failed to fetch articles:', error);
    return staticRoutes;
  }
}

