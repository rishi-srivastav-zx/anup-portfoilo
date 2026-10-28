import { useState, useEffect, useMemo } from 'react';
import { ArrowRight, ArrowDown, Search, X, SlidersHorizontal } from 'lucide-react';
import {
  BLOG_CATEGORIES,
  BlogArticle,
  BlogCategory,
  getFeaturedArticle,
  getPublishedArticles,
} from '../data/articles';
import CinematicMedia from './CinematicMedia';
import NewsletterSection from './NewsletterSection';
import ContactCtaSection from './ContactCtaSection';
import SEOHead from './SEOHead';

interface BlogLandingProps {
  initialCategory?: string;
  initialQuery?: string;
  onNavigate: (path: string) => void;
  onSyncFilterParams: (category: string, query: string) => void;
}

export function formatEditorialDate(isoDate: string): string {
  const parsed = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return isoDate;
  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const INITIAL_VISIBLE_COUNT = 6;

export default function BlogLanding({
  initialCategory = 'All',
  initialQuery = '',
  onNavigate,
  onSyncFilterParams,
}: BlogLandingProps) {
  const allPublished = useMemo(() => getPublishedArticles(), []);
  const featuredArticle = useMemo(() => getFeaturedArticle(), []);

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'All');
  const [searchInput, setSearchInput] = useState<string>(initialQuery || '');
  const [debouncedQuery, setDebouncedQuery] = useState<string>(initialQuery || '');
  const [visibleCount, setVisibleCount] = useState<number>(INITIAL_VISIBLE_COUNT);

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
    onSyncFilterParams(selectedCategory, debouncedQuery);
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

  // When not filtering, Featured Story is shown in its dedicated spotlight above the grid,
  // while the grid displays all remaining articles (plus allows browsing everything when filtered).
  const gridArticles = useMemo(() => {
    if (isFiltering) {
      return filteredArticles;
    }
    return filteredArticles.filter((a) => a.id !== featuredArticle.id);
  }, [filteredArticles, featuredArticle.id, isFiltering]);

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
    onNavigate(`/blog/${slug}`);
  };

  return (
    <>
      <SEOHead
        title="The Cinematic Journal — Anup Rawat | Cinematography, Lighting & Visual Craft"
        description="Field notes and deep-dive essays by cinematographer Anup Rawat exploring film lighting ratios, camera movement psychology, cinema optics, exposure latitude, and visual storytelling."
        canonicalPath="/blog"
        ogType="website"
        ogImage="/images/hero-cinematic-set.svg"
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
                  href="#featured-story"
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
        </div>
      </section>

      {/* C. Featured Story (Directly Below Hero - Split Editorial Layout) */}
      <section
        id="featured-story"
        aria-labelledby="featured-story-heading"
        className="border-b border-[#14100E]/15 bg-[#F4EFE6] text-[#14100E] scroll-mt-16"
      >
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 py-14 sm:py-20">
          <div className="mb-8 flex items-center justify-between gap-4 border-b border-[#14100E]/15 pb-4">
            <span className="text-xs font-mono-tech tracking-wider text-[#012CEB] font-semibold">
              FEATURED ESSAY
            </span>
            <span className="text-xs font-mono-tech text-[#6B625A]">
              {featuredArticle.technicalNote}
            </span>
          </div>

          <article className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center group">
            <div className="lg:col-span-7">
              <a
                href={`/blog/${featuredArticle.slug}`}
                onClick={(e) => handleArticleClick(e, featuredArticle.slug)}
                className="block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#012CEB]"
              >
                <CinematicMedia
                  src={featuredArticle.featuredImage}
                  alt={featuredArticle.featuredImageAlt}
                  width={1600}
                  height={900}
                  aspectClassName="aspect-[16/9]"
                  imgClassName="group-hover:scale-[1.02]"
                />
              </a>
            </div>

            <div className="lg:col-span-5 space-y-5">
              {/* Unboxed Metadata */}
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono-tech text-[#6B625A]">
                <span className="text-[#012CEB] font-semibold">{featuredArticle.category}</span>
                <span aria-hidden="true">·</span>
                <time dateTime={featuredArticle.publishedAt}>
                  {formatEditorialDate(featuredArticle.publishedAt)}
                </time>
                <span aria-hidden="true">·</span>
                <span>{featuredArticle.readingTime}</span>
              </div>

              <h2
                id="featured-story-heading"
                className="font-editorial text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#14100E] leading-[1.15] tracking-tight"
                style={{ textWrap: 'balance' }}
              >
                <a
                  href={`/blog/${featuredArticle.slug}`}
                  onClick={(e) => handleArticleClick(e, featuredArticle.slug)}
                  className="hover:text-[#012CEB] transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#012CEB]"
                >
                  {featuredArticle.title}
                </a>
              </h2>

              <p className="text-sm sm:text-base text-[#6B625A] leading-relaxed line-clamp-3">
                {featuredArticle.excerpt}
              </p>

              <div className="pt-2">
                <a
                  href={`/blog/${featuredArticle.slug}`}
                  onClick={(e) => handleArticleClick(e, featuredArticle.slug)}
                  className="inline-flex items-center gap-2.5 text-sm font-semibold text-[#14100E] group-hover:text-[#012CEB] transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#012CEB]"
                >
                  <span className="underline underline-offset-8 decoration-[#012CEB]/60 group-hover:decoration-[#012CEB]">
                    Read the story
                  </span>
                  <ArrowRight
                    className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </a>
              </div>
            </div>
          </article>
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

      {/* G. Reader Connection / Newsletter */}
      <NewsletterSection />

      {/* H. Cinematic Contact CTA */}
      <ContactCtaSection onNavigate={onNavigate} />
    </>
  );
}
