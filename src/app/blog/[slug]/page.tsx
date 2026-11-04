import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ArticleDetail from '../components/ArticleDetail';
import {
  BlogArticle,
  fetchDynamicArticles,
  fetchDynamicArticleBySlug,
} from '../data/articles';

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = true;

export async function generateStaticParams() {
  const articles = await fetchDynamicArticles();
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const article = await fetchDynamicArticleBySlug(decodedSlug);

  const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    'https://anuprawat.com'
  ).replace(/\/+$/, '');

  if (!article) {
    return {
      title: '404 — Article Not Found | The Cinematic Journal',
      description: 'The requested cinematography article could not be found.',
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title = article.seoTitle || `${article.title} — Anup Rawat`;
  const description = article.seoDescription || article.excerpt;
  const canonical = article.canonicalUrl?.startsWith('http')
    ? article.canonicalUrl
    : `${siteUrl}/blog/${article.slug}`;

  const resolvedImageUrl = article.featuredImage?.startsWith('http')
    ? article.featuredImage
    : `${siteUrl}${article.featuredImage?.startsWith('/') ? '' : '/'}${article.featuredImage}`;

  const keywordsArray = article.seoKeywords
    ? article.seoKeywords.split(',').map((k) => k.trim()).filter(Boolean)
    : article.tags;

  return {
    title,
    description,
    keywords: keywordsArray,
    alternates: {
      canonical,
    },
    robots:
      article.status === 'published'
        ? {
            index: true,
            follow: true,
            'max-image-preview': 'large',
            'max-snippet': -1,
            'max-video-preview': -1,
          }
        : {
            index: false,
            follow: false,
          },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'Anup Rawat — Director of Photography & Visual Storyteller',
      type: 'article',
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt || article.publishedAt,
      authors: [article.author?.name || 'Anup Rawat'],
      section: article.category,
      tags: article.tags,
      images: [
        {
          url: resolvedImageUrl,
          width: 1600,
          height: 900,
          alt: article.featuredImageAlt || article.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [resolvedImageUrl],
      creator: '@anuprawat',
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const article = await fetchDynamicArticleBySlug(decodedSlug);

  const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    'https://anuprawat.com'
  ).replace(/\/+$/, '');

  const canonical = article?.canonicalUrl?.startsWith('http')
    ? article.canonicalUrl
    : `${siteUrl}/blog/${decodedSlug}`;

  const fullImageUrl = article?.featuredImage?.startsWith('http')
    ? article.featuredImage
    : `${siteUrl}${article?.featuredImage?.startsWith('/') ? '' : '/'}${article?.featuredImage}`;

  // Structured Data Schema for Google Search Rich Results (JSON-LD)
  const jsonLd = article
    ? {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'BlogPosting',
            '@id': `${canonical}#article`,
            isPartOf: {
              '@type': 'Blog',
              '@id': `${siteUrl}/blog#journal`,
              name: 'The Cinematic Journal — Anup Rawat',
              publisher: {
                '@type': 'Person',
                name: 'Anup Rawat',
                url: `${siteUrl}/#about`,
              },
            },
            headline: article.title,
            description: article.seoDescription || article.excerpt,
            url: canonical,
            image: [fullImageUrl],
            datePublished: article.publishedAt,
            dateModified: article.updatedAt || article.publishedAt,
            articleSection: article.category,
            keywords: article.seoKeywords || article.tags.join(', '),
            wordCount: article.readingTime,
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': canonical,
            },
            author: {
              '@type': 'Person',
              name: article.author?.name || 'Anup Rawat',
              jobTitle: article.author?.role || 'Director of Photography',
              url: `${siteUrl}/#about`,
            },
            publisher: {
              '@type': 'Person',
              name: 'Anup Rawat',
              url: `${siteUrl}/#about`,
            },
          },
          {
            '@type': 'BreadcrumbList',
            '@id': `${canonical}#breadcrumb`,
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: `${siteUrl}/`,
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Journal',
                item: `${siteUrl}/blog`,
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: article.category,
                item: `${siteUrl}/blog?category=${encodeURIComponent(article.category)}`,
              },
              {
                '@type': 'ListItem',
                position: 4,
                name: article.title,
                item: canonical,
              },
            ],
          },
        ],
      }
    : null;

  return (
    <div className="min-h-screen flex flex-col bg-[#E6DDD2] text-[#14100E] font-['DM_Sans'] selection:bg-[#012CEB] selection:text-white">
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}

      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#012CEB] focus:text-white focus:text-xs focus:font-semibold"
      >
        Skip to main content
      </a>

      <Header currentPath={`/blog/${decodedSlug}`} />

      <main id="main-content" className="flex-1">
        <ArticleDetail slug={decodedSlug} initialArticle={article} />
      </main>

      <Footer />
    </div>
  );
}

