'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Share2,
  FileWarning,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  Images,
  Calendar,
  Clock,
  Download,
} from 'lucide-react';
import {
  BlogArticle,
  fetchDynamicArticleBySlug,
} from '../data/articles';
import { formatPublishedWithTime } from './BlogLanding';
import CinematicMedia from './CinematicMedia';
import CinematicMediaSlider, { GalleryMediaItem, resolveMediaType } from './CinematicMediaSlider';
import BlogSidebar from './BlogSidebar';
import AuthorBioEditorial from './AuthorBioEditorial';
import ContactCtaSection from './ContactCtaSection';
import SEOHead from './SEOHead';

interface ArticleDetailProps {
  slug: string;
  initialArticle?: BlogArticle | null;
  initialRelatedArticles?: BlogArticle[];
  onNavigate?: (path: string) => void;
}


export default function ArticleDetail({
  slug,
  initialArticle,
  initialRelatedArticles,
  onNavigate,
}: ArticleDetailProps) {
  const router = useRouter();
  const [article, setArticle] = useState<BlogArticle | null>(() => initialArticle || null);
  const [relatedArticlesList, setRelatedArticlesList] = useState<BlogArticle[]>(() => {
    if (initialRelatedArticles && initialRelatedArticles.length > 0) return initialRelatedArticles;
    if (initialArticle?.relatedArticles && initialArticle.relatedArticles.length > 0) {
      return initialArticle.relatedArticles;
    }
    return [];
  });
  const [scrollProgress, setScrollProgress] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Sync article dynamically when initialArticle or slug changes
  useEffect(() => {
    if (initialArticle && initialArticle.slug === slug) {
      setArticle(initialArticle);
      if (initialArticle.relatedArticles && initialArticle.relatedArticles.length > 0) {
        setRelatedArticlesList(initialArticle.relatedArticles);
      }
      return;
    }

    let isCancelled = false;
    fetchDynamicArticleBySlug(slug).then((fetched) => {
      if (!isCancelled && fetched) {
        setArticle(fetched);
        if (fetched.relatedArticles && fetched.relatedArticles.length > 0) {
          setRelatedArticlesList(fetched.relatedArticles);
        }
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [slug, initialArticle]);

  // Auto-refresh detail page on focus, visibility change, or admin broadcast update
  useEffect(() => {
    let lastRefresh = Date.now();

    const refreshArticle = async () => {
      try {
        const fresh = await fetchDynamicArticleBySlug(slug);
        if (fresh) {
          setArticle((prev) => {
            if (
              !prev ||
              prev.updatedAt !== fresh.updatedAt ||
              prev.title !== fresh.title ||
              prev.status !== fresh.status ||
              prev.content !== fresh.content
            ) {
              return fresh;
            }
            return prev;
          });
          if (fresh.relatedArticles && fresh.relatedArticles.length > 0) {
            setRelatedArticlesList(fresh.relatedArticles);
          }
        }
      } catch {
        // Non-blocking background sync
      }
    };

    const triggerRefreshIfStale = () => {
      const now = Date.now();
      if (now - lastRefresh >= 8000) {
        lastRefresh = now;
        refreshArticle();
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'blog_published_at' || e.key === 'studio_articles_updated') {
        lastRefresh = Date.now();
        refreshArticle();
      }
    };

    const handleLocalUpdate = () => {
      lastRefresh = Date.now();
      refreshArticle();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        triggerRefreshIfStale();
      }
    };

    const handleFocus = () => {
      triggerRefreshIfStale();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('studio_articles_updated', handleLocalUpdate);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('studio_articles_updated', handleLocalUpdate);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [slug]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    setActiveImageIndex(0);
  }, [slug]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (docHeight <= 0) {
        setScrollProgress(0);
        return;
      }
      const progress = Math.min(100, Math.max(0, (scrollTop / docHeight) * 100));
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [slug]);

  const handleNavigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
      return;
    }
    if (path === '/' || path === '/home' || path.startsWith('/#')) {
      window.location.href = path === '/' ? '/#home' : path;
      return;
    }
    if (path === '/about' || path === '/work' || path === '/visuals' || path === '/contact') {
      window.location.href = `/#${path.replace('/', '')}`;
      return;
    }
    router.push(path);
  };

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    handleNavigate(path);
  };

  const handleShareCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      window.setTimeout(() => setCopiedLink(false), 2200);
    } catch {
      // Fallback
    }
  };

  // Collect all unique gallery media items (Images, PDFs, Videos)
  const allMedia: GalleryMediaItem[] = useMemo(() => {
    if (!article) return [];
    const items: GalleryMediaItem[] = [];
    const seen = new Set<string>();

    if (article.featuredImage) {
      const type = resolveMediaType(null, article.featuredImage);
      items.push({
        url: article.featuredImage,
        alt: article.featuredImageAlt || article.title,
        caption: article.featuredImageAlt,
        type,
      });
      seen.add(article.featuredImage);
    }

    const rawGallery = Array.isArray(article.galleryImages)
      ? article.galleryImages
      : Array.isArray((article as any).gallery)
      ? (article as any).gallery
      : [];

    rawGallery.forEach((img: any, idx: number) => {
      const url = typeof img === 'string' ? img : img?.url || img?.src;
      if (url && !seen.has(url)) {
        seen.add(url);
        const type = resolveMediaType(img, url);
        items.push({
          url,
          alt: img?.alt || img?.name || `${article.title} - Media ${idx + 1}`,
          caption: img?.caption || img?.name,
          width: img?.width,
          height: img?.height,
          type,
        });
      }
    });

    return items;
  }, [article]);

  const currentMedia = allMedia[activeImageIndex] || allMedia[0];

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev === 0 ? allMedia.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev === allMedia.length - 1 ? 0 : prev + 1));
  };

  // 404 state
  if (!article) {
    return (
      <>
        <SEOHead
          title="404 — Article Not Found | The Cinematic Journal"
          description="The requested cinematography article could not be found."
          canonicalPath={`/blog/${slug}`}
          noindex={true}
        />
        <main className="min-h-[70vh] flex items-center justify-center bg-[#E6DDD2] text-[#14100E] px-5 py-24">
          <div className="max-w-xl w-full border-2 border-[#14100E] bg-[#F4EFE6] rounded-2xl shadow-[4px_4px_0_#14100E] p-8 sm:p-12 text-center space-y-6">
            <FileWarning className="w-10 h-10 text-[#012CEB] mx-auto" aria-hidden="true" />
            <p className="text-xs font-mono-tech text-[#012CEB] font-semibold">HTTP 404 · ENTRY NOT FOUND</p>
            <h1 className="font-editorial text-3xl sm:text-4xl font-semibold text-[#14100E]">
              This journal entry is unavailable.
            </h1>
            <p className="text-sm sm:text-base text-[#6B625A] leading-relaxed">
              The article at <code className="font-mono-tech text-[#14100E] bg-[#E6DDD2] px-1.5 py-0.5 rounded">/blog/{slug}</code> does not exist or remains in unpublished draft status.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
              <a
                href="/blog"
                onClick={(e) => handleLinkClick(e, '/blog')}
                className="min-h-[44px] px-6 py-2.5 bg-[#14100E] hover:bg-[#012CEB] text-[#F4EDE4] text-xs font-semibold rounded-xl shadow-[2px_2px_0_#012CEB] inline-flex items-center gap-2 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                <span>Return to The Cinematic Journal</span>
              </a>
            </div>
          </div>
        </main>
      </>
    );
  }

  const relatedArticles =
    relatedArticlesList.length > 0
      ? relatedArticlesList
      : (article.relatedArticles && article.relatedArticles.length > 0)
      ? article.relatedArticles
      : [];

  return (
    <>
      <SEOHead
        title={article.seoTitle}
        description={article.seoDescription}
        keywords={article.seoKeywords || article.tags}
        canonicalUrl={article.canonicalUrl}
        canonicalPath={`/blog/${article.slug}`}
        ogType="article"
        ogImage={article.featuredImage}
        article={article}
      />

      {/* Reading Progress Bar */}
      <div
        aria-hidden="true"
        className="fixed top-16 left-0 right-0 z-30 h-[3px] bg-[#14100E]/10 pointer-events-none"
      >
        <div
          className="h-full bg-[#012CEB] transition-transform duration-100 origin-left"
          style={{ transform: `scaleX(${scrollProgress / 100})` }}
        />
      </div>

      <article className="bg-[#E6DDD2] text-[#14100E]">
        {/* Article Header & Media Hero */}
        <header className="relative border-b border-[#14100E]/15 pt-10 pb-12 sm:pt-14 sm:pb-16 bg-[#E6DDD2] overflow-hidden">
          {/* Subtle Cinematic Lighting & Camera Backdrop on the Right */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-0 top-0 bottom-0 w-full sm:w-1/2 lg:w-2/5 max-w-[500px] overflow-hidden select-none opacity-20 sm:opacity-25"
            style={{
              maskImage: 'linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0.6) 40%, rgba(0,0,0,0) 95%)',
              WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0.6) 40%, rgba(0,0,0,0) 95%)',
            }}
          >
            <svg
              viewBox="0 0 500 320"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full object-cover object-right"
            >
              <defs>
                <radialGradient id="fresnelGlow" cx="80%" cy="40%" r="55%">
                  <stop offset="0%" stopColor="#C5A059" stopOpacity="0.35" />
                  <stop offset="60%" stopColor="#C5A059" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#C5A059" stopOpacity="0" />
                </radialGradient>
              </defs>

              <rect width="500" height="320" fill="url(#fresnelGlow)" />

              {/* Cinema Camera on Fluid Head Tripod */}
              <g stroke="#14100E" strokeWidth="1.75" fill="#14100E" opacity="0.35">
                <line x1="280" y1="180" x2="220" y2="320" strokeWidth="2.5" />
                <line x1="280" y1="180" x2="330" y2="320" strokeWidth="2.5" />
                <line x1="280" y1="180" x2="275" y2="320" strokeWidth="2" />
                <line x1="245" y1="260" x2="310" y2="260" strokeWidth="1.5" />

                <rect x="268" y="165" width="24" height="15" rx="3" />
                <line x1="280" y1="172" x2="240" y2="195" strokeWidth="2" />

                <rect x="260" y="115" width="55" height="50" rx="4" />
                <path d="M265 115 V102 H305 V115" fill="none" strokeWidth="3" />
                <rect x="250" y="100" width="24" height="18" rx="2" />
                <line x1="262" y1="118" x2="262" y2="128" strokeWidth="2" />
                <rect x="315" y="125" width="16" height="36" rx="2" fillOpacity="0.6" />
                <polygon points="230,120 260,130 260,158 230,165" fillOpacity="0.85" />
                <line x1="220" y1="112" x2="255" y2="120" strokeWidth="3" />
                <line x1="225" y1="168" x2="315" y2="168" strokeWidth="2.5" />
              </g>

              {/* Studio Fresnel Spotlight with 4 Barn Doors */}
              <g stroke="#14100E" strokeWidth="2" fill="#14100E" opacity="0.45">
                <line x1="435" y1="160" x2="435" y2="320" strokeWidth="3" />
                <line x1="435" y1="280" x2="390" y2="320" strokeWidth="2.5" />
                <line x1="435" y1="280" x2="480" y2="320" strokeWidth="2.5" />
                <circle cx="435" cy="220" r="4" />

                <path d="M410 120 C410 160 460 160 460 120" fill="none" strokeWidth="3" />
                <line x1="435" y1="150" x2="435" y2="160" strokeWidth="3" />

                <rect x="415" y="70" width="45" height="60" rx="5" />
                <line x1="425" y1="70" x2="425" y2="130" strokeWidth="1" strokeOpacity="0.5" />
                <line x1="440" y1="70" x2="440" y2="130" strokeWidth="1" strokeOpacity="0.5" />

                <ellipse cx="415" cy="100" rx="6" ry="26" fill="#DDD4C7" stroke="#14100E" strokeWidth="2" />
                <ellipse cx="415" cy="100" rx="3" ry="18" fill="none" stroke="#14100E" strokeWidth="1" strokeOpacity="0.6" />
                <ellipse cx="415" cy="100" rx="1.5" ry="9" fill="none" stroke="#14100E" strokeWidth="1" strokeOpacity="0.6" />

                <polygon points="415,74 380,48 425,44 421,74" fillOpacity="0.8" />
                <polygon points="415,126 385,155 430,150 421,126" fillOpacity="0.8" />
                <polygon points="410,80 365,85 365,115 410,120" fillOpacity="0.7" />
                <polygon points="420,85 450,88 450,112 420,115" fillOpacity="0.5" />
              </g>
            </svg>
          </div>

          <div className="relative z-10 max-w-[1140px] mx-auto px-5 sm:px-8 space-y-6 sm:space-y-8">
            {/* 1. Metadata Row */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-mono-tech">
              {/* Category Pill */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DDD4C7] border border-[#C5B8A8] text-[#14100E] font-semibold uppercase tracking-wider text-[11px] sm:text-xs shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
                {/* Cinema camera icon */}
                <svg className="w-3.5 h-3.5 text-[#14100E]" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <circle cx="7" cy="5" r="2.5" />
                  <circle cx="13" cy="5" r="2.5" />
                  <rect x="3" y="8" width="13" height="10" rx="2" />
                  <polygon points="16,11 21,8 21,18 16,15" />
                </svg>
                <span>{article.category}</span>
              </div>

              {/* Separator */}
              <span className="text-[#B8ADA0] select-none text-xs hidden sm:inline" aria-hidden="true">|</span>

              {/* Published Date */}
              <span className="inline-flex items-center gap-1.5 text-xs font-mono-tech text-[#6B625A]">
                <Calendar className="w-3.5 h-3.5 text-[#7E7367]" aria-hidden="true" />
                <span>Published {formatPublishedWithTime(article.publishedAt)}</span>
              </span>

              {/* Separator */}
              <span className="text-[#B8ADA0] select-none text-xs hidden sm:inline" aria-hidden="true">|</span>

              {/* Reading Time */}
              <span className="inline-flex items-center gap-1.5 text-xs font-mono-tech text-[#6B625A]">
                <Clock className="w-3.5 h-3.5 text-[#7E7367]" aria-hidden="true" />
                <span>{article.readingTime}</span>
              </span>
            </div>

            {/* 2. Blog Title & 3. Subtitle */}
            <div className="space-y-4 max-w-4xl">
              <h1
                className="font-editorial text-3xl sm:text-5xl lg:text-[3.5rem] font-bold text-[#14100E] tracking-tight leading-[1.12]"
                style={{ textWrap: 'balance' }}
              >
                {article.title}
              </h1>

              {/* Thin Pale-Golden Accent Line */}
              <div className="w-16 sm:w-20 h-[2.5px] bg-[#C5A059] rounded-full my-3 sm:my-4" />

              {/* Subtitle / Excerpt */}
              {article.excerpt && (
                <p className="text-base sm:text-xl text-[#6B625A] leading-relaxed max-w-3xl font-sans">
                  {article.excerpt}
                </p>
              )}
            </div>

            {/* 4. Refined Bottom Divider with Golden Detail // */}
            <div className="pt-2 sm:pt-4 flex items-center">
              <div className="flex-1 h-[1px] bg-[#14100E]/15" />
              <span className="font-mono-tech text-base sm:text-lg text-[#C5A059] font-bold tracking-widest pl-3 sm:pl-4 select-none">
                //
              </span>
            </div>

            {/* Author Attribution & Share Row */}
            <div className="pt-1 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-xs sm:text-sm">
                <div>
                  <span className="text-[#6B625A]">Written by </span>
                  <a
                    href="/#about"
                    onClick={(e) => handleLinkClick(e, '/#about')}
                    className="font-semibold text-[#14100E] hover:text-[#012CEB] transition-colors"
                  >
                    {article.author.name}
                  </a>
                  <span className="text-[#6B625A]"> · {article.author.role}</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {article.technicalNote && (
                  <span className="hidden sm:inline text-xs font-mono-tech text-[#6B625A]">
                    {article.technicalNote}
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleShareCopy}
                  className="min-h-[38px] px-4 py-1.5 border-2 border-[#14100E] bg-[#F4EFE6] hover:bg-[#14100E] text-[#14100E] hover:text-[#F4EDE4] text-xs font-mono-tech font-semibold inline-flex items-center gap-2 rounded-lg shadow-xs transition-all cursor-pointer"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#012CEB]" aria-hidden="true" />
                      <span>Link Copied</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5 text-[#012CEB]" aria-hidden="true" />
                      <span>Copy Article URL</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* MULTI-MEDIA GALLERY / CINEMATIC AUTOPLAY SLIDER */}
            {allMedia.length > 0 && (
              <div className="pt-2">
                <CinematicMediaSlider
                  media={allMedia}
                  title={article.title}
                  onOpenLightbox={(idx) => {
                    setActiveImageIndex(idx);
                    setLightboxOpen(true);
                  }}
                />
              </div>
            )}
          </div>
        </header>

        {/* Article Body + Sticky Right Sidebar (70% Article / 30% Sidebar on desktop) */}
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8 py-12 sm:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
            {/* Main Article Content (Approx 70% width on desktop) */}
            <div className="lg:col-span-8 min-w-0 space-y-12">
              {/* If content exists, render content ONCE (NO duplicate sections/intro) */}
              {article.content ? (
                <div
                  className="prose prose-neutral max-w-none text-base sm:text-lg text-[#3B342F] leading-[1.8] space-y-6"
                  dangerouslySetInnerHTML={{ __html: article.content }}
                />
              ) : (
                <div className="space-y-10">
                  {article.introduction && article.introduction.length > 0 && (
                    <div className="space-y-5 text-base sm:text-lg text-[#14100E] leading-[1.8]">
                      {article.introduction.map((para, i) => (
                        <p
                          key={i}
                          className={
                            i === 0
                              ? 'first-letter:font-editorial first-letter:text-5xl first-letter:font-semibold first-letter:text-[#012CEB] first-letter:float-left first-letter:mr-3 first-letter:leading-none'
                              : ''
                          }
                        >
                          {para}
                        </p>
                      ))}
                    </div>
                  )}

                  {article.sections &&
                    article.sections.map((section) => (
                      <section
                        key={section.id}
                        id={section.id}
                        className="scroll-mt-24 space-y-6 pt-6 border-t border-[#14100E]/15"
                      >
                        <h2
                          className="font-editorial text-2xl sm:text-3xl font-semibold text-[#14100E] tracking-tight leading-snug"
                          style={{ textWrap: 'balance' }}
                        >
                          {section.heading}
                        </h2>

                        <div className="space-y-5 text-base text-[#3B342F] leading-[1.8]">
                          {section.paragraphs.map((paragraph, pIdx) =>
                            paragraph && paragraph.trim().startsWith('<') ? (
                              <div
                                key={pIdx}
                                className="space-y-4 prose max-w-none text-[#3B342F]"
                                dangerouslySetInnerHTML={{ __html: paragraph }}
                              />
                            ) : (
                              <p key={pIdx}>{paragraph}</p>
                            )
                          )}
                        </div>

                        {section.subSections &&
                          section.subSections.map((sub, sIdx) => (
                            <div key={sIdx} className="pt-3 space-y-3">
                              <h3 className="font-display text-lg font-semibold text-[#14100E]">
                                {sub.title}
                              </h3>
                              {sub.paragraphs.map((sp, spIdx) => (
                                <p key={spIdx} className="text-base text-[#3B342F] leading-[1.8]">
                                  {sp}
                                </p>
                              ))}
                            </div>
                          ))}

                        {section.pullQuote && (
                          <blockquote className="my-8 p-6 sm:p-8 border-2 border-[#012CEB] bg-[#F4EFE6] rounded-2xl shadow-[3px_3px_0_#012CEB] space-y-3">
                            <p className="font-editorial italic text-xl sm:text-2xl text-[#14100E] leading-relaxed">
                              “{section.pullQuote.text}”
                            </p>
                            <footer className="text-xs font-mono-tech text-[#012CEB] font-semibold">
                              — {section.pullQuote.context}
                            </footer>
                          </blockquote>
                        )}

                        {section.inlineImage && (
                          <div className="my-8">
                            <CinematicMedia
                              src={section.inlineImage.src}
                              alt={section.inlineImage.alt}
                              width={1200}
                              height={900}
                              aspectClassName="aspect-[4/3]"
                              caption={section.inlineImage.caption}
                            />
                          </div>
                        )}
                      </section>
                    ))}
                </div>
              )}

              {/* Premium Editorial Author Profile Component */}
              <AuthorBioEditorial author={article.author} onNavigate={handleNavigate} />
            </div>

            {/* Dedicated Sticky Right Sidebar (Approx 30% width on desktop, moves below on mobile) */}
            <aside aria-label="Cinematographer sidebar" className="lg:col-span-4 min-w-0 h-full relative">
              <div className="sticky top-20 sm:top-24 space-y-6">
                <BlogSidebar onNavigate={handleNavigate} />
              </div>
            </aside>
          </div>
        </div>

        {/* FURTHER READING (Same seamless theme background: bg-[#E6DDD2] - ONLY shown if related articles exist) */}
        {relatedArticles.length > 0 && (
          <section
            aria-labelledby="related-articles-heading"
            className="border-t border-[#14100E]/15 bg-[#E6DDD2] text-[#14100E] py-16 sm:py-20"
          >
            <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 space-y-10">
              <div className="flex items-center justify-between gap-4 border-b border-[#14100E]/15 pb-4">
                <div>
                  <p className="text-xs font-mono-tech text-[#012CEB] font-semibold">FURTHER READING</p>
                  <h2
                    id="related-articles-heading"
                    className="font-editorial text-2xl sm:text-3xl font-semibold text-[#14100E] mt-1"
                  >
                    Related Cinematography Notes
                  </h2>
                </div>

                <a
                  href="/blog"
                  onClick={(e) => handleLinkClick(e, '/blog')}
                  className="text-xs font-mono-tech font-semibold text-[#012CEB] hover:text-[#14100E] transition-colors whitespace-nowrap shrink-0"
                >
                  All Journal Entries →
                </a>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {relatedArticles.map((rel) => (
                  <article
                    key={rel.id}
                    className="group flex flex-col justify-between border-2 border-[#14100E] bg-[#F4EFE6] rounded-xl shadow-[3px_3px_0_#14100E] p-5 space-y-5"
                  >
                    <div className="space-y-4">
                      <a
                        href={`/blog/${rel.slug}`}
                        onClick={(e) => handleLinkClick(e, `/blog/${rel.slug}`)}
                        className="block"
                      >
                        <CinematicMedia
                          src={rel.featuredImage}
                          alt={rel.featuredImageAlt}
                          width={1200}
                          height={900}
                          aspectClassName="aspect-[16/10]"
                          imgClassName="group-hover:scale-[1.02]"
                        />
                      </a>

                      <div className="flex flex-wrap items-center gap-2 text-xs font-mono-tech text-[#6B625A]">
                        <span className="text-[#012CEB] font-semibold">{rel.category}</span>
                        <span aria-hidden="true">·</span>
                        <span>{rel.readingTime}</span>
                      </div>

                      <h3 className="font-editorial text-xl font-semibold text-[#14100E] leading-snug">
                        <a
                          href={`/blog/${rel.slug}`}
                          onClick={(e) => handleLinkClick(e, `/blog/${rel.slug}`)}
                          className="hover:text-[#012CEB] transition-colors"
                        >
                          {rel.title}
                        </a>
                      </h3>
                    </div>

                    <a
                      href={`/blog/${rel.slug}`}
                      onClick={(e) => handleLinkClick(e, `/blog/${rel.slug}`)}
                      className="inline-flex items-center gap-2 text-xs font-mono-tech font-semibold text-[#14100E] group-hover:text-[#012CEB] transition-colors pt-2"
                    >
                      <span>Read Article</span>
                      <ArrowRight
                        className="w-3.5 h-3.5 transition-transform duration-150 group-hover:translate-x-1"
                        aria-hidden="true"
                      />
                    </a>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Contact CTA */}
        <ContactCtaSection onNavigate={handleNavigate} />
      </article>

      {/* Lightbox Modal for multiple gallery media */}
      {lightboxOpen && currentMedia && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-between p-4 sm:p-8 backdrop-blur-md"
          onClick={() => setLightboxOpen(false)}
        >
          <div className="w-full max-w-6xl flex items-center justify-between text-white z-10">
            <span className="text-xs font-mono-tech text-neutral-400">
              Media {activeImageIndex + 1} of {allMedia.length}
            </span>
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              aria-label="Close media viewer"
              className="p-2 rounded-lg bg-white/10 hover:bg-white/25 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div
            className="relative max-w-6xl w-full max-h-[80vh] flex items-center justify-center my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {currentMedia.type === 'pdf' ? (
              <div className="w-full h-[75vh] bg-[#171412] rounded-xl overflow-hidden border border-white/20 p-4 flex flex-col">
                <div className="flex items-center justify-between pb-3 border-b border-white/10 text-white">
                  <span className="font-mono-tech text-xs uppercase tracking-wider text-neutral-300">
                    PDF Document
                  </span>
                  <a
                    href={currentMedia.url}
                    download
                    className="px-3 py-1.5 rounded-lg bg-[#012CEB] text-white text-xs font-mono-tech inline-flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </a>
                </div>
                <iframe
                  src={`${currentMedia.url}#view=FitH`}
                  title={currentMedia.alt || 'PDF Document'}
                  className="flex-1 w-full border-0 mt-3 rounded-lg"
                />
              </div>
            ) : currentMedia.type === 'video' ? (
              <video
                src={currentMedia.url}
                controls
                autoPlay
                className="max-h-[75vh] max-w-full rounded-lg shadow-2xl"
              />
            ) : (
              <img
                src={currentMedia.url}
                alt={currentMedia.alt}
                className="max-h-[75vh] max-w-full object-contain rounded-lg shadow-2xl"
              />
            )}

            {allMedia.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevImage}
                  className="absolute -left-4 sm:-left-12 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/15 hover:bg-[#012CEB] text-white flex items-center justify-center transition-all cursor-pointer shadow-md"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={handleNextImage}
                  className="absolute -right-4 sm:-right-12 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/15 hover:bg-[#012CEB] text-white flex items-center justify-center transition-all cursor-pointer shadow-md"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          {currentMedia.caption && (
            <p className="text-xs sm:text-sm text-neutral-300 text-center font-mono-tech max-w-xl">
              {currentMedia.caption}
            </p>
          )}
        </div>
      )}
    </>
  );
}
