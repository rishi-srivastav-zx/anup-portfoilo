import { useEffect } from 'react';
import { BlogArticle } from '../data/articles';

interface BreadcrumbItem {
  name: string;
  path: string;
}

interface SEOHeadProps {
  title: string;
  description: string;
  canonicalPath: string;
  ogType?: 'website' | 'article';
  ogImage?: string;
  noindex?: boolean;
  article?: BlogArticle;
  breadcrumbs?: BreadcrumbItem[];
}

export function getConfiguredSiteOrigin(): string {
  const envOrigin =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (typeof process !== 'undefined' && process.env?.SITE_URL);
  if (envOrigin && typeof envOrigin === 'string' && envOrigin.trim().length > 0) {
    return envOrigin.replace(/\/+$/, '');
  }
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return '';
}

export default function SEOHead({
  title,
  description,
  canonicalPath,
  ogType = 'website',
  ogImage = '/images/hero-cinematic-set.svg',
  noindex = false,
  article,
  breadcrumbs,
}: SEOHeadProps) {
  useEffect(() => {
    const origin = getConfiguredSiteOrigin();
    const cleanPath = canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`;
    const fullCanonicalUrl = `${origin}${cleanPath}`;
    const fullImageUrl = ogImage.startsWith('http') ? ogImage : `${origin}${ogImage}`;

    document.title = title;

    const setMetaTag = (attr: 'name' | 'property', key: string, content: string) => {
      let element = document.head.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, key);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    setMetaTag('name', 'description', description);
    setMetaTag('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large');

    // OpenGraph
    setMetaTag('property', 'og:title', title);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:type', ogType);
    setMetaTag('property', 'og:url', fullCanonicalUrl);
    setMetaTag('property', 'og:image', fullImageUrl);
    setMetaTag('property', 'og:site_name', 'Anup Rawat — Cinematographer & Visual Storyteller');

    // Twitter
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', title);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', fullImageUrl);

    // Article specific meta
    if (article) {
      setMetaTag('property', 'article:published_time', article.publishedAt);
      if (article.updatedAt) {
        setMetaTag('property', 'article:modified_time', article.updatedAt);
      }
      setMetaTag('property', 'article:section', article.category);
    }

    // Canonical Link
    let canonicalLink = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', fullCanonicalUrl);

    // Structured Data (JSON-LD)
    const existingScript = document.getElementById('seo-json-ld');
    if (existingScript) {
      existingScript.remove();
    }

    if (!noindex) {
      const graph: Record<string, unknown>[] = [];

      if (article) {
        graph.push({
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: article.title,
          description: article.seoDescription || article.excerpt,
          image: [fullImageUrl],
          datePublished: article.publishedAt,
          dateModified: article.updatedAt || article.publishedAt,
          articleSection: article.category,
          keywords: article.tags.join(', '),
          author: {
            '@type': 'Person',
            name: article.author.name,
            jobTitle: article.author.role,
            url: `${origin}/about`,
          },
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': fullCanonicalUrl,
          },
        });
      } else if (cleanPath === '/blog') {
        graph.push({
          '@context': 'https://schema.org',
          '@type': 'Blog',
          name: 'The Cinematic Journal — Anup Rawat',
          description,
          url: fullCanonicalUrl,
          author: {
            '@type': 'Person',
            name: 'Anup Rawat',
            jobTitle: 'Cinematographer & Visual Storyteller',
            url: `${origin}/about`,
          },
        });
      } else {
        graph.push({
          '@context': 'https://schema.org',
          '@type': 'Person',
          name: 'Anup Rawat',
          jobTitle: 'Cinematographer & Visual Storyteller',
          url: origin,
          description,
        });
      }

      if (breadcrumbs && breadcrumbs.length > 0) {
        graph.push({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: breadcrumbs.map((crumb, idx) => ({
            '@type': 'ListItem',
            position: idx + 1,
            name: crumb.name,
            item: `${origin}${crumb.path}`,
          })),
        });
      }

      const script = document.createElement('script');
      script.id = 'seo-json-ld';
      script.type = 'application/ld+json';
      script.text = JSON.stringify(graph.length === 1 ? graph[0] : graph);
      document.head.appendChild(script);
    }
  }, [title, description, canonicalPath, ogType, ogImage, noindex, article, breadcrumbs]);

  return null;
}
