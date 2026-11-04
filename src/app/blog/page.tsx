import type { Metadata } from 'next';
import { Suspense } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import BlogLanding from './components/BlogLanding';
import { fetchDynamicArticles } from './data/articles';

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_BASE_URL ||
  'https://anuprawat.com'
).replace(/\/+$/, '');

export const metadata: Metadata = {
  title: 'The Cinematic Journal — Anup Rawat | Director of Photography',
  description:
    'Essays, field notes, and visual case studies on film lighting architecture, camera movement psychology, cinema optics, and visual storytelling by cinematographer Anup Rawat.',
  keywords: [
    'cinematography blog',
    'film lighting techniques',
    'director of photography notes',
    'camera movement',
    'cinema lenses',
    'anamorphic optics',
    'exposure latitude',
    'visual storytelling',
    'Anup Rawat cinematographer',
  ],
  alternates: {
    canonical: `${siteUrl}/blog`,
  },
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-snippet': -1,
  },
  openGraph: {
    title: 'The Cinematic Journal — Anup Rawat | Director of Photography',
    description:
      'Essays, field notes, and visual case studies on film lighting architecture, camera movement psychology, cinema optics, and visual storytelling by cinematographer Anup Rawat.',
    url: `${siteUrl}/blog`,
    siteName: 'Anup Rawat — Cinematographer & Visual Storyteller',
    type: 'website',
    images: [
      {
        url: `${siteUrl}/images/hero-cinematic-set.svg`,
        width: 1600,
        height: 900,
        alt: 'The Cinematic Journal — Cinematography and Visual Craft by Anup Rawat',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Cinematic Journal — Anup Rawat',
    description:
      'Essays on cinematography, visual grammar, light architecture, and camera choreography by Anup Rawat.',
    images: [`${siteUrl}/images/hero-cinematic-set.svg`],
    creator: '@anuprawat',
  },
};

export default async function BlogPage() {
  const dynamicArticles = await fetchDynamicArticles();

  // Structured Data Schema for Blog Catalog (JSON-LD)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': `${siteUrl}/blog#journal`,
    name: 'The Cinematic Journal — Anup Rawat',
    description:
      'Essays, field notes, and visual case studies on cinematography, film lighting ratios, optics, and camera movement.',
    url: `${siteUrl}/blog`,
    inLanguage: 'en-US',
    publisher: {
      '@type': 'Person',
      name: 'Anup Rawat',
      jobTitle: 'Director of Photography & Visual Storyteller',
      url: `${siteUrl}/#about`,
    },
    blogPost: dynamicArticles.map((article) => ({
      '@type': 'BlogPosting',
      headline: article.title,
      description: article.seoDescription || article.excerpt,
      url: article.canonicalUrl?.startsWith('http')
        ? article.canonicalUrl
        : `${siteUrl}/blog/${article.slug}`,
      datePublished: article.publishedAt,
      dateModified: article.updatedAt || article.publishedAt,
    })),
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#E6DDD2] text-[#14100E] font-['DM_Sans'] selection:bg-[#012CEB] selection:text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#012CEB] focus:text-white focus:text-xs focus:font-semibold"
      >
        Skip to main content
      </a>

      <Header currentPath="/blog" />

      <main id="main-content" className="flex-1">
        <Suspense
          fallback={
            <div className="min-h-[50vh] flex items-center justify-center">
              <div className="text-xs font-mono-tech text-[#6B625A] animate-pulse">
                Loading The Cinematic Journal...
              </div>
            </div>
          }
        >
          <BlogLanding initialArticles={dynamicArticles} />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
