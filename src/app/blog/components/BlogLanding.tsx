'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ArrowDown, Search, X, SlidersHorizontal } from 'lucide-react';
import {
  BLOG_CATEGORIES,
  BlogArticle,
  BlogCategory,
  getPublishedArticles,
  fetchDynamicArticles,
} from '../data/articles';
import CinematicMedia from './CinematicMedia';
import ContactCtaSection from './ContactCtaSection';
import SEOHead from './SEOHead';

interface BlogLandingProps {
  initialCategory?: string;
  initialQuery?: string;
  initialArticles?: BlogArticle[];
  onNavigate?: (path: string) => void;
  onSyncFilterParams?: (category: string, query: string) => void;
}

export function formatEditorialDate(isoDate: string): string {
  if (!isoDate) return '';
  const clean = String(isoDate).trim();
  let parsed = new Date(clean);
  if (Number.isNaN(parsed.getTime())) {
    parsed = new Date(`${clean}T00:00:00`);
  }
  if (Number.isNaN(parsed.getTime())) return clean;
  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatPublishedWithTime(isoDate: string): string {
  if (!isoDate) return '';
  const clean = String(isoDate).trim();
  let parsed = new Date(clean);
  if (Number.isNaN(parsed.getTime())) {
    parsed = new Date(`${clean}T00:00:00`);
  }
  if (Number.isNaN(parsed.getTime())) return clean;

  const dateFormatted = parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const hours = parsed.getHours();
  const minutes = parsed.getMinutes();
  const hasSpecificTime = (hours !== 0 || minutes !== 0) && clean.includes('T') && !clean.endsWith('T00:00:00.000Z');

  if (hasSpecificTime) {
    const timeFormatted = parsed.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    return `${dateFormatted} at ${timeFormatted}`;
  }

  return dateFormatted;
}

const INITIAL_VISIBLE_COUNT = 6;

export default function BlogLanding({
  initialCategory = 'All',
  initialQuery = '',
  initialArticles,
  onNavigate,
  onSyncFilterParams,
}: BlogLandingProps) {
  const router = useRouter();
  const [allPublished, setAllPublished] = useState<BlogArticle[]>(() => {
    if (initialArticles && initialArticles.length > 0) return initialArticles;
    return getPublishedArticles();
  });

  // Dynamic fetch to merge any newly created articles from DB
  useEffect(() => {
    let isCancelled = false;
    fetchDynamicArticles().then((articles) => {
      if (!isCancelled && articles && articles.length > 0) {
        setAllPublished(articles);
      }
    });
    return () => {
      isCancelled = true;
    };
  }, []);

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'All');
  const [searchInput, setSearchInput] = useState<string>(initialQuery || '');
  const [debouncedQuery, setDebouncedQuery] = useState<string>(initialQuery || '');
  const [visibleCount, setVisibleCount] = useState<number>(INITIAL_VISIBLE_COUNT);

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

  // Sync props when URL changes via browser back/forward or footer category clicks
  useEffect(() => {
    setSelectedCategory(initialCategory || 'All');
  }, [initialCategory]);

  useEffect(() => {
    setSearchInput(initialQuery || '');
    setDebouncedQuery(initialQuery || '');
  }, [initialQuery]);

  // Debounce search input (180ms)
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(searchInput.trim());
    }, 180);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  // Sync active filters to URL query parameters
  useEffect(() => {
    if (onSyncFilterParams) {
      onSyncFilterParams(selectedCategory, debouncedQuery);
    }
  }, [selectedCategory, debouncedQuery, onSyncFilterParams]);

  // Only show categories that actually have published content
  const activeCategories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const article of allPublished) {
      counts.set(article.category, (counts.get(article.category) || 0) + 1);
    }
    return BLOG_CATEGORIES.filter((cat) => (counts.get(cat) || 0) > 0).map((cat) => ({
      name: cat,
      count: counts.get(cat) || 0,
    }));
  }, [allPublished]);

  const isFiltering = selectedCategory !== 'All' || debouncedQuery.length > 0;

  // Identify the single active featured article (if any)
  const featuredArticle = useMemo(() => {
    return allPublished.find((article) => Boolean(article.isFeatured));
  }, [allPublished]);

  const filteredArticles = useMemo(() => {
    return allPublished.filter((article) => {
      const matchesCategory =
        selectedCategory === 'All' || article.category === (selectedCategory as BlogCategory);

      if (!matchesCategory) return false;

      if (!debouncedQuery) return true;

      const q = debouncedQuery.toLowerCase();
      const inTitle = article.title.toLowerCase().includes(q);
      const inExcerpt = article.excerpt.toLowerCase().includes(q);
      const inCategory = article.category.toLowerCase().includes(q);
      const inTags = article.tags.some((t) => t.toLowerCase().includes(q));
      const inTech = article.technicalNote.toLowerCase().includes(q);

      return inTitle || inExcerpt || inCategory || inTags || inTech;
    });
  }, [allPublished, selectedCategory, debouncedQuery]);

  // When an article is featured, show it at the top hero and keep the archive grid clean (no duplicate)
  const gridArticles = useMemo(() => {
    if (featuredArticle && !isFiltering) {
      return filteredArticles.filter(
        (article) => article.id !== featuredArticle.id && article.slug !== featuredArticle.slug
      );
    }
    return filteredArticles;
  }, [filteredArticles, featuredArticle, isFiltering]);

  const displayedGridArticles = useMemo(() => {
    return gridArticles.slice(0, visibleCount);
  }, [gridArticles, visibleCount]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setVisibleCount(INITIAL_VISIBLE_COUNT);
  };

  const handleResetFilters = () => {
    setSelectedCategory('All');
    setSearchInput('');
    setDebouncedQuery('');
    setVisibleCount(INITIAL_VISIBLE_COUNT);
  };

  const handleArticleClick = (e: React.MouseEvent<HTMLAnchorElement>, slug: string) => {
    e.preventDefault();
    handleNavigate(`/blog/${slug}`);
  };

  return (
    <>
      <SEOHead
        title="The Cinematic Journal — Anup Rawat | Cinematography, Lighting & Visual Craft"
        description="Field notes and deep-dive essays by cinematographer Anup Rawat exploring film lighting ratios, camera movement psychology, cinema optics, exposure latitude, and visual storytelling."
        canonicalPath="/blog"
        ogType="website"
        ogImage="/images/ar-logo.png"
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'The Cinematic Journal', path: '/blog' },
        ]}
      />

      {/* B. Cinematic Journal Hero (Split Editorial Layout - Warm Parchment Theme) */}
      <section
        aria-labelledby="journal-hero-heading"
        className="border-b border-[#14100E]/15 bg-[#E6DDD2] text-[#14100E]"
      >
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 py-12 sm:py-16 lg:py-20">
          {featuredArticle ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
              {/* Left Column: Featured Article Editorial Typography */}
              <div className="lg:col-span-6 flex flex-col justify-between space-y-8">
                <div className="space-y-5">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#012CEB] text-white rounded-md text-xs font-mono-tech tracking-[0.16em] font-bold shadow-xs">
                      <span className="text-amber-300">★</span>
                      <span>FEATURED ESSAY</span>
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F4EFE6] border border-[#14100E]/15 rounded-md text-xs font-mono-tech tracking-[0.18em] text-[#14100E] font-semibold uppercase">
                      <span>●</span>
                      <span>{featuredArticle.category}</span>
                    </div>
                  </div>

                  <a
                    href={`/blog/${featuredArticle.slug}`}
                    onClick={(e) => handleArticleClick(e, featuredArticle.slug)}
                    className="group block"
                  >
                    <h1
                      id="journal-hero-heading"
                      className="font-editorial text-4xl sm:text-5xl lg:text-[3.65rem] font-semibold text-[#14100E] group-hover:text-[#012CEB] tracking-tight leading-[1.06] transition-colors"
                      style={{ textWrap: 'balance' }}
                    >
                      {featuredArticle.title}
                    </h1>
                  </a>

                  <p className="text-base sm:text-lg text-[#6B625A] leading-relaxed max-w-xl line-clamp-3">
                    {featuredArticle.excerpt}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#14100E]/15 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-2.5 text-xs text-[#6B625A] font-mono-tech">
                    <span className="font-semibold text-[#14100E]">
                      By {featuredArticle.author?.name || 'Anup Rawat'}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{formatEditorialDate(featuredArticle.publishedAt)}</span>
                    <span aria-hidden="true">·</span>
                    <span>{featuredArticle.readingTime}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <a
                      href={`/blog/${featuredArticle.slug}`}
                      onClick={(e) => handleArticleClick(e, featuredArticle.slug)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[#012CEB] text-white rounded-xl text-xs font-mono-tech font-bold hover:bg-[#14100E] transition-all shadow-[2px_2px_0_#14100E] group"
                    >
                      <span>Read Featured Essay</span>
                      <ArrowRight
                        className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform"
                        aria-hidden="true"
                      />
                    </a>

                    <a
                      href="#journal-archive"
                      className="inline-flex items-center gap-1.5 text-xs font-mono-tech font-semibold text-[#6B625A] hover:text-[#14100E] transition-colors whitespace-nowrap shrink-0"
                    >
                      <span>Explore Archive</span>
                      <ArrowDown className="w-3.5 h-3.5" aria-hidden="true" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Right Column: Featured Image Cinematic Plate */}
              <div className="lg:col-span-6 flex flex-col justify-center">
                <div className="relative h-full flex flex-col justify-center">
                  <a
                    href={`/blog/${featuredArticle.slug}`}
                    onClick={(e) => handleArticleClick(e, featuredArticle.slug)}
                    className="group relative block overflow-hidden rounded-2xl border-2 border-[#14100E] bg-[#14100E] shadow-[5px_5px_0_#14100E] transition-all duration-300 hover:-translate-y-1 hover:shadow-[7px_7px_0_#14100E]"
                  >
                    <CinematicMedia
                      src={featuredArticle.featuredImage || '/images/hero-cinematic-set.svg'}
                      alt={featuredArticle.featuredImageAlt || featuredArticle.title}
                      width={1600}
                      height={900}
                      priority={true}
                      aspectClassName="aspect-[16/10] lg:h-full"
                      overlayScrim={true}
                    />
                    <div className="absolute top-3.5 left-3.5 z-10 flex items-center gap-1.5 px-3 py-1 bg-[#14100E]/90 backdrop-blur-md rounded-md border border-white/20 text-[10px] font-mono-tech tracking-wider text-white font-semibold shadow-xs">
                      <span className="text-amber-300">★</span>
                      <span>FEATURED ESSAY</span>
                    </div>
                  </a>
                  <div className="mt-2.5 flex items-center justify-between text-xs font-mono-tech text-[#6B625A] px-1">
                    <span className="uppercase truncate max-w-[70%]">
                      PLATE 01 · {featuredArticle.category} STUDY
                    </span>
                    <span>{featuredArticle.readingTime}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
              {/* Left Column: Expressive Editorial Typography */}
              <div className="lg:col-span-6 flex flex-col justify-between space-y-8">
                <div className="space-y-5">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F4EFE6] border border-[#14100E]/15 rounded-md text-xs font-mono-tech tracking-[0.18em] text-[#012CEB] font-semibold">
                    <span>●</span>
                    <span>THE CINEMATIC JOURNAL</span>
                  </div>
                  <h1
                    id="journal-hero-heading"
                    className="font-editorial text-4xl sm:text-5xl lg:text-[3.65rem] font-semibold text-[#14100E] tracking-tight leading-[1.06]"
                    style={{ textWrap: 'balance' }}
                  >
                    Stories Behind the Frame.
                  </h1>
                  <p className="text-base sm:text-lg text-[#6B625A] leading-relaxed max-w-xl">
                    An ongoing monograph by cinematographer Anup Rawat exploring the architecture of
                    light, camera movement psychology, optical character, and the quiet technical
                    decisions that shape emotional visual storytelling.
                  </p>
                </div>

                <div className="pt-4 border-t border-[#14100E]/15 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#6B625A] font-mono-tech">
                    <span>Lighting &amp; Exposure</span>
                    <span aria-hidden="true">·</span>
                    <span>Camera &amp; Lenses</span>
                    <span aria-hidden="true">·</span>
                    <span>Visual Grammar</span>
                  </div>

                  <a
                    href="#journal-archive"
                    className="inline-flex items-center gap-2 text-xs font-mono-tech font-semibold text-[#012CEB] hover:text-[#14100E] transition-colors whitespace-nowrap shrink-0"
                  >
                    <span>Explore Essays</span>
                    <ArrowDown className="w-3.5 h-3.5" aria-hidden="true" />
                  </a>
                </div>
              </div>

              {/* Right Column: Composed Soundstage Visual Plate */}
              <div className="lg:col-span-6 flex flex-col justify-center">
                <div className="relative h-full">
                  <CinematicMedia
                    src="/images/hero-cinematic-set.svg"
                    alt="Soundstage cinematography study showing a cinema camera rigged on a dolly track with a warm tungsten fresnel backlight cutting through mist."
                    width={1600}
                    height={900}
                    priority={true}
                    aspectClassName="aspect-[16/10] lg:h-full"
                    overlayScrim={true}
                  />
                  <div className="mt-2.5 flex items-center justify-between text-xs font-mono-tech text-[#6B625A]">
                    <span>PLATE 01 · SOUNDSTAGE DOLLY &amp; TUNGSTEN BACKLIGHT STUDY</span>
                    <span>2.39:1 SCOPE</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* E & F. Category Filters & Search Discovery + D. Editorial Article Grid */}
      <section
        id="journal-archive"
        aria-labelledby="journal-archive-heading"
        className="bg-[#E6DDD2] py-16 sm:py-24 text-[#14100E]"
      >
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 space-y-12">
          {/* Archive Header & Search Bar */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-8 border-b border-[#14100E]/15">
            <div className="space-y-2">
              <p className="text-xs font-mono-tech tracking-wider text-[#012CEB] font-semibold">
                ARCHIVE &amp; FIELD INDEX
              </p>
              <h2
                id="journal-archive-heading"
                className="font-editorial text-3xl sm:text-4xl font-semibold text-[#14100E] tracking-tight"
              >
                Articles &amp; Technical Breakdowns
              </h2>
            </div>

            {/* F. Clean Search Interface */}
            <div className="w-full lg:w-96">
              <label htmlFor="journal-search-input" className="sr-only">
                Search articles by title, topic, or tag
              </label>
              <div className="relative flex items-center">
                <Search
                  className="w-4 h-4 text-[#6B625A] absolute left-3.5 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  id="journal-search-input"
                  type="search"
                  value={searchInput}
                  onChange={(e) => {
                    setSearchInput(e.target.value);
                    setVisibleCount(INITIAL_VISIBLE_COUNT);
                  }}
                  placeholder="Search lighting, lenses, blocking, ISO..."
                  className="w-full min-h-[44px] pl-10 pr-10 py-2.5 bg-[#F4EFE6] border-2 border-[#14100E]/20 hover:border-[#14100E] focus:border-[#012CEB] rounded-xl text-sm text-[#14100E] placeholder:text-[#6B625A]/60 focus:outline-none focus:ring-2 focus:ring-[#012CEB]/20 transition-all shadow-xs"
                />
                {searchInput.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchInput('');
                      setDebouncedQuery('');
                    }}
                    aria-label="Clear search query"
                    className="absolute right-2.5 p-1.5 text-[#6B625A] hover:text-[#14100E] cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* E. Functional Category Filter Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div
              role="group"
              aria-label="Filter articles by cinematography category"
              className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 no-scrollbar"
            >
              <button
                type="button"
                onClick={() => handleCategoryChange('All')}
                aria-pressed={selectedCategory === 'All'}
                className={`min-h-[40px] px-4 py-2 text-xs font-mono-tech transition-all whitespace-nowrap shrink-0 cursor-pointer rounded-lg border-2 ${
                  selectedCategory === 'All'
                    ? 'bg-[#14100E] text-[#F4EFE6] border-[#14100E] font-semibold shadow-[2px_2px_0_#012CEB]'
                    : 'bg-[#F4EFE6] text-[#6B625A] border-[#14100E]/15 hover:text-[#14100E] hover:border-[#14100E]'
                }`}
              >
                All Entries ({allPublished.length})
              </button>

              {activeCategories.map((cat) => {
                const active = selectedCategory === cat.name;
                return (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => handleCategoryChange(cat.name)}
                    aria-pressed={active}
                    className={`min-h-[40px] px-4 py-2 text-xs font-mono-tech transition-all whitespace-nowrap shrink-0 cursor-pointer rounded-lg border-2 ${
                      active
                        ? 'bg-[#14100E] text-[#F4EFE6] border-[#14100E] font-semibold shadow-[2px_2px_0_#012CEB]'
                        : 'bg-[#F4EFE6] text-[#6B625A] border-[#14100E]/15 hover:text-[#14100E] hover:border-[#14100E]'
                    }`}
                  >
                    {cat.name} ({cat.count})
                  </button>
                );
              })}
            </div>

            {isFiltering && (
              <div className="flex items-center justify-between sm:justify-end gap-4 text-xs font-mono-tech text-[#6B625A]">
                <span>
                  Showing {filteredArticles.length}{' '}
                  {filteredArticles.length === 1 ? 'article' : 'articles'}
                </span>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-[#012CEB] font-semibold hover:text-[#14100E] underline underline-offset-4 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>

          {/* Empty State When No Articles Match */}
          {gridArticles.length === 0 ? (
            featuredArticle && !isFiltering ? (
              <div className="border-2 border-[#14100E] bg-[#F4EFE6] rounded-2xl shadow-[4px_4px_0_#14100E] p-10 sm:p-14 text-center max-w-2xl mx-auto my-8 space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#012CEB]/10 text-[#012CEB] rounded-md text-xs font-mono-tech tracking-wider font-semibold">
                  <span className="text-amber-500">★</span>
                  <span>1 FEATURED ESSAY HIGHLIGHTED ABOVE</span>
                </div>
                <h3 className="font-editorial text-2xl font-semibold text-[#14100E]">
                  Featured Spotlight Active
                </h3>
                <p className="text-sm text-[#6B625A] leading-relaxed">
                  Currently featuring <strong>&ldquo;{featuredArticle.title}&rdquo;</strong> as the lead essay above. Additional field journal entries and case studies are being authored.
                </p>
              </div>
            ) : (
              <div className="border-2 border-[#14100E] bg-[#F4EFE6] rounded-2xl shadow-[4px_4px_0_#14100E] p-10 sm:p-16 text-center max-w-2xl mx-auto my-8 space-y-5">
                <SlidersHorizontal
                  className="w-8 h-8 text-[#012CEB] mx-auto opacity-80"
                  aria-hidden="true"
                />
                <div className="space-y-2">
                  <h3 className="font-editorial text-2xl font-semibold text-[#14100E]">
                    No journal entries match your current filter.
                  </h3>
                  <p className="text-sm text-[#6B625A] leading-relaxed">
                    {debouncedQuery
                      ? `No articles matched "${debouncedQuery}"${
                          selectedCategory !== 'All' ? ` in ${selectedCategory}` : ''
                        }. Try searching for broader terms such as "lighting", "lenses", "ISO", or "movement".`
                      : `No articles found in ${selectedCategory}.`}
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="min-h-[44px] px-6 py-2.5 bg-[#14100E] hover:bg-[#012CEB] text-[#F4EDE4] text-xs font-semibold rounded-xl shadow-[2px_2px_0_#012CEB] transition-colors cursor-pointer"
                  >
                    Reset Search &amp; Category Filters
                  </button>
                </div>
              </div>
            )
          ) : (
            /* D. Varied Editorial Article Grid (Asymmetric 12-Col Bento Layout) */
            <div className="grid grid-cols-1 md:grid-cols-12 gap-x-8 gap-y-14">
              {displayedGridArticles.map((article: BlogArticle, index: number) => {
                const patternPos = index % 4;
                let colSpanClass = 'md:col-span-6';
                let aspectClass = 'aspect-[16/10]';

                if (patternPos === 0) {
                  colSpanClass = 'md:col-span-7';
                  aspectClass = 'aspect-[16/9]';
                } else if (patternPos === 1) {
                  colSpanClass = 'md:col-span-5';
                  aspectClass = 'aspect-[4/3]';
                } else if (patternPos === 2) {
                  colSpanClass = 'md:col-span-5';
                  aspectClass = 'aspect-[4/3]';
                } else {
                  colSpanClass = 'md:col-span-7';
                  aspectClass = 'aspect-[16/9]';
                }

                return (
                  <article
                    key={article.id}
                    className={`${colSpanClass} group flex flex-col justify-between border-b border-[#14100E]/15 pb-10`}
                  >
                    <div className="space-y-5">
                      <a
                        href={`/blog/${article.slug}`}
                        onClick={(e) => handleArticleClick(e, article.slug)}
                        className="block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#012CEB]"
                      >
                        <CinematicMedia
                          src={article.featuredImage}
                          alt={article.featuredImageAlt}
                          width={1200}
                          height={900}
                          aspectClassName={aspectClass}
                          imgClassName="group-hover:scale-[1.02]"
                        />
                      </a>

                      {/* Clean Unboxed Metadata with Typographic Separators */}
                      <div className="flex flex-wrap items-center gap-2 text-xs font-mono-tech text-[#6B625A]">
                        {article.isFeatured && (
                          <>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#012CEB] text-[#F4EFE6]">
                              Featured Essay
                            </span>
                            <span aria-hidden="true">·</span>
                          </>
                        )}
                        <span className="text-[#012CEB] font-semibold">{article.category}</span>
                        <span aria-hidden="true">·</span>
                        <time dateTime={article.publishedAt}>
                          {formatEditorialDate(article.publishedAt)}
                        </time>
                        <span aria-hidden="true">·</span>
                        <span>{article.readingTime}</span>
                      </div>

                      <h3
                        className="font-editorial text-2xl sm:text-3xl font-semibold text-[#14100E] leading-[1.2] tracking-tight"
                        style={{ textWrap: 'balance' }}
                      >
                        <a
                          href={`/blog/${article.slug}`}
                          onClick={(e) => handleArticleClick(e, article.slug)}
                          className="hover:text-[#012CEB] transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#012CEB]"
                        >
                          {article.title}
                        </a>
                      </h3>

                      <p className="text-sm sm:text-base text-[#6B625A] leading-relaxed">
                        {article.excerpt}
                      </p>
                    </div>

                    <div className="pt-6 flex items-center justify-between gap-4">
                      <a
                        href={`/blog/${article.slug}`}
                        onClick={(e) => handleArticleClick(e, article.slug)}
                        aria-label={`Read article: ${article.title}`}
                        className="inline-flex items-center gap-2 text-xs font-mono-tech font-semibold text-[#14100E] group-hover:text-[#012CEB] transition-colors whitespace-nowrap shrink-0"
                      >
                        <span>Read Article</span>
                        <ArrowRight
                          className="w-3.5 h-3.5 transition-transform duration-150 group-hover:translate-x-1"
                          aria-hidden="true"
                        />
                      </a>

                      <span className="text-xs font-mono-tech text-[#6B625A] truncate max-w-[220px]">
                        {article.technicalNote}
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* Pagination / Load More */}
          {gridArticles.length > visibleCount && (
            <div className="pt-6 flex flex-col items-center justify-center gap-3">
              <p className="text-xs font-mono-tech text-[#6B625A]">
                Showing {displayedGridArticles.length} of {gridArticles.length} archive articles
              </p>
              <button
                type="button"
                onClick={() => setVisibleCount((prev) => prev + 4)}
                className="min-h-[44px] px-8 py-3 border-2 border-[#14100E] bg-[#F4EFE6] hover:bg-[#14100E] text-[#14100E] hover:text-[#F4EDE4] text-xs font-mono-tech font-semibold rounded-xl shadow-[3px_3px_0_#14100E] transition-all cursor-pointer"
              >
                Load More Journal Entries
              </button>
            </div>
          )}
        </div>
      </section>

      {/* H. Cinematic Contact CTA */}
      <ContactCtaSection onNavigate={onNavigate} />
    </>
  );
}
