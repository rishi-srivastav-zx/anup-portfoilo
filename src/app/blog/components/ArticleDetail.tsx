import { useEffect, useState, useMemo } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Share2,
  BookOpen,
  FileWarning,
} from 'lucide-react';
import {
  getAdjacentArticles,
  getPublishedArticleBySlug,
  getRelatedArticles,
} from '../data/articles';
import { formatEditorialDate } from './BlogLanding';
import CinematicMedia from './CinematicMedia';
import ContactCtaSection from './ContactCtaSection';
import SEOHead from './SEOHead';

interface ArticleDetailProps {
  slug: string;
  onNavigate: (path: string) => void;
}

export default function ArticleDetail({ slug, onNavigate }: ArticleDetailProps) {
  const article = useMemo(() => getPublishedArticleBySlug(slug), [slug]);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
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

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    onNavigate(path);
  };

  const handleShareCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      window.setTimeout(() => setCopiedLink(false), 2200);
    } catch {
      // Fallback if clipboard API is restricted
    }
  };

  // Genuine 404 State for Missing Slugs or Unpublished Drafts
  if (!article) {
    return (
      <>
        <SEOHead
          title="404 — Article Not Found | The Cinematic Journal — Anup Rawat"
          description="The requested cinematography article could not be found or is not publicly published."
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
              The article at <code className="font-mono-tech text-[#14100E] bg-[#E6DDD2] px-1.5 py-0.5 rounded">/blog/{slug}</code>{' '}
              does not exist or remains in unpublished draft status.
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

  const relatedArticles = getRelatedArticles(article, 3);
  const { previous, next } = getAdjacentArticles(article.slug);

  return (
    <>
      <SEOHead
        title={article.seoTitle}
        description={article.seoDescription}
        canonicalPath={`/blog/${article.slug}`}
        ogType="article"
        ogImage={article.featuredImage}
        article={article}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Journal', path: '/blog' },
          { name: article.category, path: `/blog?category=${encodeURIComponent(article.category)}` },
          { name: article.title, path: `/blog/${article.slug}` },
        ]}
      />

      {/* Minimal Reading Progress Bar */}
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
        {/* Article Header & Hero Section */}
        <header className="border-b border-[#14100E]/15 pt-10 pb-12 sm:pt-14 sm:pb-16 bg-[#E6DDD2]">
          <div className="max-w-[1140px] mx-auto px-5 sm:px-8 space-y-8">
            {/* 1. Breadcrumb Navigation */}
            <nav aria-label="Breadcrumb" className="text-xs font-mono-tech text-[#6B625A]">
              <ol className="flex flex-wrap items-center gap-2">
                <li>
                  <a
                    href="/#home"
                    onClick={(e) => handleLinkClick(e, '/#home')}
                    className="hover:text-[#012CEB] transition-colors"
                  >
                    Home
                  </a>
                </li>
                <li aria-hidden="true">/</li>
                <li>
                  <a
                    href="/blog"
                    onClick={(e) => handleLinkClick(e, '/blog')}
                    className="hover:text-[#012CEB] transition-colors"
                  >
                    Journal
                  </a>
                </li>
                <li aria-hidden="true">/</li>
                <li>
                  <a
                    href={`/blog?category=${encodeURIComponent(article.category)}`}
                    onClick={(e) =>
                      handleLinkClick(e, `/blog?category=${encodeURIComponent(article.category)}`)
                    }
                    className="text-[#012CEB] font-semibold hover:underline underline-offset-4"
                  >
                    {article.category}
                  </a>
                </li>
              </ol>
            </nav>

            {/* 2, 3, 4, 5: Category Label, Single H1, Dates, Reading Time */}
            <div className="space-y-5 max-w-4xl">
              <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono-tech text-[#6B625A]">
                <span className="text-[#012CEB] font-semibold">{article.category}</span>
                <span aria-hidden="true">·</span>
                <span>Published {formatEditorialDate(article.publishedAt)}</span>
                {article.updatedAt && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>Updated {formatEditorialDate(article.updatedAt)}</span>
                  </>
                )}
                <span aria-hidden="true">·</span>
                <span>{article.readingTime}</span>
              </div>

              <h1
                className="font-editorial text-3xl sm:text-5xl lg:text-[3.35rem] font-semibold text-[#14100E] tracking-tight leading-[1.1]"
                style={{ textWrap: 'balance' }}
              >
                {article.title}
              </h1>

              <p className="text-base sm:text-xl text-[#6B625A] leading-relaxed max-w-3xl">
                {article.excerpt}
              </p>
            </div>

            {/* 6. Author Attribution & Share Row */}
            <div className="pt-4 border-t border-[#14100E]/15 flex flex-wrap items-center justify-between gap-4">
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
                <span className="hidden sm:inline text-xs font-mono-tech text-[#6B625A]">
                  {article.technicalNote}
                </span>
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

            {/* 7. Compelling Hero Image with Descriptive Alt Text */}
            <div className="pt-2">
              <CinematicMedia
                src={article.featuredImage}
                alt={article.featuredImageAlt}
                width={1600}
                height={900}
                priority={true}
                aspectClassName="aspect-[16/9]"
                caption={article.featuredImageAlt}
              />
            </div>
          </div>
        </header>

        {/* Article Body + Sidebar Table of Contents */}
        <div className="max-w-[1140px] mx-auto px-5 sm:px-8 py-14 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* 9. Table of Contents Sidebar */}
            <aside className="lg:col-span-4 order-1 lg:order-2">
              <div className="lg:sticky lg:top-24 border-2 border-[#14100E] bg-[#F4EFE6] rounded-2xl shadow-[3px_3px_0_#14100E] p-6 space-y-5 text-[#14100E]">
                <div className="flex items-center gap-2 text-xs font-mono-tech text-[#012CEB] font-semibold">
                  <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>IN THIS ARTICLE</span>
                </div>

                <nav aria-label="Table of Contents">
                  <ol className="space-y-3 text-sm">
                    {article.sections.map((sec, idx) => (
                      <li key={sec.id}>
                        <a
                          href={`#${sec.id}`}
                          className="text-[#6B625A] hover:text-[#14100E] transition-colors flex items-baseline gap-2.5 leading-snug"
                        >
                          <span className="font-mono-tech text-xs text-[#012CEB] font-semibold shrink-0">
                            0{idx + 1}.
                          </span>
                          <span className="font-medium">{sec.heading}</span>
                        </a>
                      </li>
                    ))}
                  </ol>
                </nav>

                <div className="pt-4 border-t border-[#14100E]/15 space-y-2">
                  <p className="text-xs font-mono-tech text-[#012CEB] font-semibold">TOPICAL INDEX</p>
                  <p className="text-xs text-[#6B625A] leading-relaxed">
                    {article.tags.join(' · ')}
                  </p>
                </div>
              </div>
            </aside>

            {/* 8 & 10. Main Readable Editorial Column (65-75ch Measure) */}
            <div className="lg:col-span-8 order-2 lg:order-1 max-w-[68ch] space-y-12">
              {/* 8. Readable Article Introduction */}
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

              {/* 10 & 11. Structured Sections with H2, H3, Tables, Diagrams, and Checklists */}
              {article.sections.map((section) => (
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
                    {section.paragraphs.map((paragraph, pIdx) => (
                      <p key={pIdx}>{paragraph}</p>
                    ))}
                  </div>

                  {/* H3 Subsections */}
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

                  {/* Editorial Callout / Pull Quote */}
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

                  {/* Technical Comparison Table with Tabular Numerals */}
                  {section.table && (
                    <div className="my-8 overflow-x-auto border-2 border-[#14100E] bg-[#F4EFE6] rounded-2xl shadow-[3px_3px_0_#14100E]">
                      <table className="w-full text-left border-collapse text-xs sm:text-sm">
                        <caption className="px-4 py-3 text-left text-xs font-mono-tech text-[#012CEB] font-semibold border-b border-[#14100E]/15 bg-[#E6DDD2]">
                          {section.table.caption}
                        </caption>
                        <thead>
                          <tr className="border-b border-[#14100E]/15 text-[#14100E] font-display">
                            {section.table.headers.map((header, hIdx) => (
                              <th key={hIdx} className="px-4 py-3 font-semibold whitespace-nowrap">
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#14100E]/10 font-mono-tech">
                          {section.table.rows.map((row, rIdx) => (
                            <tr key={rIdx} className="hover:bg-[#14100E]/[0.03]">
                              {row.map((cell, cIdx) => (
                                <td
                                  key={cIdx}
                                  className={`px-4 py-3.5 leading-relaxed ${
                                    cIdx === 0
                                      ? 'text-[#012CEB] font-semibold whitespace-nowrap'
                                      : 'text-[#14100E] font-sans'
                                  }`}
                                >
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Practical Field Checklist */}
                  {section.checklist && (
                    <div className="my-6 p-6 border-2 border-[#14100E] bg-[#F4EFE6] rounded-2xl shadow-[3px_3px_0_#14100E] space-y-4">
                      <p className="text-xs font-mono-tech text-[#012CEB] font-semibold">
                        ON-SET &amp; PREP VERIFICATION POINTS
                      </p>
                      <ul className="space-y-3 text-sm sm:text-base text-[#14100E]">
                        {section.checklist.map((item, cIdx) => (
                          <li key={cIdx} className="flex items-start gap-3">
                            <span className="font-mono-tech text-xs text-[#012CEB] font-semibold mt-1 shrink-0">
                              0{cIdx + 1}.
                            </span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Inline Image Placement */}
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

              {/* Author Bio Box at End of Article */}
              <div className="mt-14 p-6 sm:p-8 border-2 border-[#14100E] bg-[#F4EFE6] rounded-2xl shadow-[4px_4px_0_#14100E] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="space-y-2">
                  <p className="text-xs font-mono-tech text-[#012CEB] font-semibold">ABOUT THE AUTHOR</p>
                  <h3 className="font-editorial text-2xl font-semibold text-[#14100E]">
                    {article.author.name}
                  </h3>
                  <p className="text-sm text-[#6B625A] leading-relaxed max-w-xl">
                    Cinematographer and visual storyteller focusing on narrative drama, commercial
                    direction of photography, and atmospheric visual essays.
                  </p>
                </div>
                <a
                  href="/#work"
                  onClick={(e) => handleLinkClick(e, '/#work')}
                  className="min-h-[44px] px-6 py-2.5 bg-[#14100E] hover:bg-[#012CEB] text-[#F4EDE4] text-xs font-mono-tech font-semibold rounded-xl shadow-[2px_2px_0_#012CEB] transition-all whitespace-nowrap shrink-0"
                >
                  View Cinematography Reel
                </a>
              </div>

              {/* 13. Previous / Next Article Navigation */}
              <nav
                aria-label="Adjacent Articles"
                className="pt-10 border-t border-[#14100E]/15 grid grid-cols-1 sm:grid-cols-2 gap-6"
              >
                {previous ? (
                  <a
                    href={`/blog/${previous.slug}`}
                    onClick={(e) => handleLinkClick(e, `/blog/${previous.slug}`)}
                    className="group p-5 border-2 border-[#14100E] bg-[#F4EFE6] hover:bg-white rounded-xl shadow-[3px_3px_0_#14100E] flex flex-col justify-between space-y-2 transition-all"
                  >
                    <span className="inline-flex items-center gap-2 text-xs font-mono-tech text-[#6B625A] group-hover:text-[#012CEB]">
                      <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Previous Essay</span>
                    </span>
                    <span className="font-editorial text-lg font-semibold text-[#14100E] group-hover:text-[#012CEB] transition-colors">
                      {previous.title}
                    </span>
                  </a>
                ) : (
                  <div />
                )}

                {next && (
                  <a
                    href={`/blog/${next.slug}`}
                    onClick={(e) => handleLinkClick(e, `/blog/${next.slug}`)}
                    className="group p-5 border-2 border-[#14100E] bg-[#F4EFE6] hover:bg-white rounded-xl shadow-[3px_3px_0_#14100E] flex flex-col justify-between items-end text-right space-y-2 transition-all"
                  >
                    <span className="inline-flex items-center gap-2 text-xs font-mono-tech text-[#6B625A] group-hover:text-[#012CEB]">
                      <span>Next Essay</span>
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </span>
                    <span className="font-editorial text-lg font-semibold text-[#14100E] group-hover:text-[#012CEB] transition-colors">
                      {next.title}
                    </span>
                  </a>
                )}
              </nav>
            </div>
          </div>
        </div>

        {/* 12. Related Articles */}
        <section
          aria-labelledby="related-articles-heading"
          className="border-t border-[#14100E]/15 bg-[#F4EFE6] text-[#14100E] py-16 sm:py-20"
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
                  className="group flex flex-col justify-between border-2 border-[#14100E] bg-[#E6DDD2] rounded-xl shadow-[3px_3px_0_#14100E] p-5 space-y-5"
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

        {/* 14. Subtle Contact CTA */}
        <ContactCtaSection onNavigate={onNavigate} />
      </article>
    </>
  );
}
