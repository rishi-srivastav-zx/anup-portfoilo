import { useState, useEffect } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  Maximize2,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { SELECTED_WORKS, PHILOSOPHY_PILLARS, PortfolioWorkItem } from '../data/portfolio';
import { getPublishedArticles } from '../data/articles';
import { formatEditorialDate } from './BlogLanding';
import CinematicMedia from './CinematicMedia';
import ContactCtaSection from './ContactCtaSection';
import SEOHead from './SEOHead';

interface PortfolioViewProps {
  onNavigate: (path: string) => void;
}

export function HomeView({ onNavigate }: PortfolioViewProps) {
  const recentJournal = getPublishedArticles().slice(0, 3);
  const [lightboxWork, setLightboxWork] = useState<PortfolioWorkItem | null>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && lightboxWork) {
        setLightboxWork(null);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [lightboxWork]);

  return (
    <>
      <SEOHead
        title="Anup Rawat — Cinematographer & Visual Storyteller"
        description="Portfolio and Cinematic Journal of Anup Rawat, Director of Photography for narrative drama, commercial films, and visual essays."
        canonicalPath="/"
        ogType="website"
      />

      {/* Portfolio Hero */}
      <section className="border-b border-[#F4F1EA]/10 bg-[#070708] film-grain-overlay">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 py-14 sm:py-20 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
            <div className="lg:col-span-6 flex flex-col justify-between space-y-8">
              <div className="space-y-5">
                <p className="text-xs font-mono-tech tracking-[0.18em] text-[#C8A45D]">
                  DIRECTOR OF PHOTOGRAPHY · VISUAL STORYTELLER
                </p>
                <h1
                  className="font-editorial text-4xl sm:text-5xl lg:text-6xl font-semibold text-[#F4F1EA] tracking-tight leading-[1.06]"
                  style={{ textWrap: 'balance' }}
                >
                  Crafting Emotional Gravity Through Light &amp; Frame.
                </h1>
                <p className="text-base sm:text-lg text-[#A39E93] leading-relaxed max-w-xl">
                  Anup Rawat is a cinematographer dedicated to atmospheric narrative drama,
                  visually driven commercials, and documentary essays. Explore selected camera work
                  or read technical essays in The Cinematic Journal.
                </p>
              </div>

              <div className="pt-4 flex flex-wrap items-center gap-4">
                <a
                  href="/blog"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('/blog');
                  }}
                  className="min-h-[44px] px-6 py-3 bg-[#C8A45D] hover:bg-[#D7B673] text-[#070708] text-xs sm:text-sm font-semibold inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0"
                >
                  <span>Read The Cinematic Journal</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </a>

                <a
                  href="/work"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('/work');
                  }}
                  className="min-h-[44px] px-6 py-3 border border-[#F4F1EA]/20 hover:border-[#C8A45D] text-[#F4F1EA] hover:text-[#C8A45D] text-xs sm:text-sm font-medium inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0"
                >
                  <span>Selected Works</span>
                </a>
              </div>
            </div>

            <div className="lg:col-span-6">
              <CinematicMedia
                src="/images/hero-cinematic-set.svg"
                alt="Anamorphic cinema camera rigged on a soundstage dolly track illuminated by warm tungsten backlight."
                width={1600}
                height={900}
                priority={true}
                aspectClassName="aspect-[16/10] lg:h-full"
                overlayScrim={true}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Selected Cinematography Works Preview */}
      <section className="border-b border-[#F4F1EA]/10 bg-[#0A0B0E] py-16 sm:py-24">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 space-y-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#F4F1EA]/10 pb-6">
            <div>
              <p className="text-xs font-mono-tech text-[#C8A45D]">SELECTED CINEMATOGRAPHY</p>
              <h2 className="font-editorial text-3xl sm:text-4xl font-semibold text-[#F4F1EA] mt-1">
                Frames &amp; Visual Studies
              </h2>
            </div>
            <a
              href="/work"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/work');
              }}
              className="text-xs font-mono-tech text-[#C8A45D] hover:text-[#F4F1EA] transition-colors whitespace-nowrap shrink-0"
            >
              View Full Work Index →
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {SELECTED_WORKS.map((work) => (
              <article
                key={work.id}
                className="group border border-[#F4F1EA]/10 bg-[#070708] p-6 flex flex-col justify-between space-y-5"
              >
                <div className="space-y-4">
                  <div className="relative">
                    <CinematicMedia
                      src={work.image}
                      alt={work.imageAlt}
                      width={1200}
                      height={900}
                      aspectClassName="aspect-[16/9]"
                      imgClassName="group-hover:scale-[1.02]"
                    />
                    <button
                      type="button"
                      onClick={() => setLightboxWork(work)}
                      aria-label={`Inspect frame from ${work.title} in fullscreen`}
                      className="absolute bottom-3 right-3 px-3 py-1.5 bg-[#070708]/85 border border-[#F4F1EA]/20 hover:border-[#C8A45D] text-xs font-mono-tech text-[#F4F1EA] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Maximize2 className="w-3.5 h-3.5 text-[#C8A45D]" aria-hidden="true" />
                      <span>Inspect Plate</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs font-mono-tech text-[#A39E93]">
                    <span className="text-[#C8A45D]">{work.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{work.year}</span>
                    <span aria-hidden="true">·</span>
                    <span>{work.aspectRatio}</span>
                  </div>

                  <h3 className="font-editorial text-2xl font-semibold text-[#F4F1EA]">
                    {work.title}
                  </h3>

                  <p className="text-sm text-[#A39E93] leading-relaxed">{work.synopsis}</p>
                </div>

                <div className="pt-4 border-t border-[#F4F1EA]/10 flex items-center justify-between gap-4 text-xs font-mono-tech">
                  <span className="text-[#A39E93]">{work.optics}</span>
                  <a
                    href={`/blog/${work.relatedArticleSlug}`}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate(`/blog/${work.relatedArticleSlug}`);
                    }}
                    className="text-[#C8A45D] hover:text-[#F4F1EA] transition-colors whitespace-nowrap shrink-0"
                  >
                    Read Technical Breakdown →
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Journal Highlights Strip */}
      <section className="bg-[#070708] py-16 sm:py-24">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 space-y-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#F4F1EA]/10 pb-6">
            <div>
              <p className="text-xs font-mono-tech text-[#C8A45D]">THE CINEMATIC JOURNAL</p>
              <h2 className="font-editorial text-3xl sm:text-4xl font-semibold text-[#F4F1EA] mt-1">
                Recent Essays on Craft &amp; Technique
              </h2>
            </div>
            <a
              href="/blog"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/blog');
              }}
              className="text-xs font-mono-tech text-[#C8A45D] hover:text-[#F4F1EA] transition-colors whitespace-nowrap shrink-0"
            >
              Explore All Journal Entries →
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {recentJournal.map((article) => (
              <article
                key={article.id}
                className="group border-b border-[#F4F1EA]/10 pb-8 flex flex-col justify-between space-y-5"
              >
                <div className="space-y-4">
                  <a
                    href={`/blog/${article.slug}`}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate(`/blog/${article.slug}`);
                    }}
                    className="block"
                  >
                    <CinematicMedia
                      src={article.featuredImage}
                      alt={article.featuredImageAlt}
                      width={1200}
                      height={900}
                      aspectClassName="aspect-[16/10]"
                      imgClassName="group-hover:scale-[1.02]"
                    />
                  </a>

                  <div className="flex flex-wrap items-center gap-2 text-xs font-mono-tech text-[#A39E93]">
                    <span className="text-[#C8A45D]">{article.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{formatEditorialDate(article.publishedAt)}</span>
                    <span aria-hidden="true">·</span>
                    <span>{article.readingTime}</span>
                  </div>

                  <h3 className="font-editorial text-2xl font-semibold text-[#F4F1EA] leading-snug">
                    <a
                      href={`/blog/${article.slug}`}
                      onClick={(e) => {
                        e.preventDefault();
                        onNavigate(`/blog/${article.slug}`);
                      }}
                      className="hover:text-[#C8A45D] transition-colors"
                    >
                      {article.title}
                    </a>
                  </h3>

                  <p className="text-sm text-[#A39E93] leading-relaxed line-clamp-3">
                    {article.excerpt}
                  </p>
                </div>

                <a
                  href={`/blog/${article.slug}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate(`/blog/${article.slug}`);
                  }}
                  className="inline-flex items-center gap-2 text-xs font-mono-tech text-[#F4F1EA] group-hover:text-[#C8A45D] transition-colors"
                >
                  <span>Read Essay</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <ContactCtaSection onNavigate={onNavigate} />

      {/* Lightbox Modal */}
      {lightboxWork && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="lightbox-work-title"
          className="fixed inset-0 z-50 bg-[#050506]/95 flex items-center justify-center p-4 sm:p-8"
        >
          <div className="max-w-5xl w-full bg-[#0A0B0E] border border-[#F4F1EA]/20 p-5 sm:p-8 space-y-6">
            <div className="flex items-center justify-between gap-4 border-b border-[#F4F1EA]/10 pb-4">
              <div>
                <p className="text-xs font-mono-tech text-[#C8A45D]">
                  {lightboxWork.category} · {lightboxWork.aspectRatio} · {lightboxWork.optics}
                </p>
                <h2
                  id="lightbox-work-title"
                  className="font-editorial text-2xl sm:text-3xl font-semibold text-[#F4F1EA]"
                >
                  {lightboxWork.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setLightboxWork(null)}
                aria-label="Close frame inspection modal"
                className="min-h-[40px] px-3 py-1.5 border border-[#F4F1EA]/20 hover:border-[#C8A45D] text-xs font-mono-tech text-[#F4F1EA] inline-flex items-center gap-1.5 cursor-pointer"
              >
                <X className="w-4 h-4" />
                <span>ESC</span>
              </button>
            </div>

            <CinematicMedia
              src={lightboxWork.image}
              alt={lightboxWork.imageAlt}
              width={1600}
              height={900}
              aspectClassName="aspect-[16/9]"
              caption={lightboxWork.synopsis}
            />
          </div>
        </div>
      )}
    </>
  );
}

export function WorkView({ onNavigate }: PortfolioViewProps) {
  return (
    <>
      <SEOHead
        title="Selected Work — Anup Rawat | Cinematographer & Visual Storyteller"
        description="Selected narrative drama, commercial cinematography, and visual studies photographed by Anup Rawat."
        canonicalPath="/work"
        ogType="website"
      />

      <section className="bg-[#070708] py-16 sm:py-24">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 space-y-12">
          <div className="max-w-3xl space-y-4">
            <p className="text-xs font-mono-tech tracking-wider text-[#C8A45D]">
              SELECTED CINEMATOGRAPHY
            </p>
            <h1 className="font-editorial text-4xl sm:text-5xl font-semibold text-[#F4F1EA] tracking-tight">
              Narrative, Commercial &amp; Visual Studies
            </h1>
            <p className="text-base sm:text-lg text-[#A39E93] leading-relaxed">
              Each project is approached with a tailored optical and lighting grammar. Click any
              companion essay link to examine the lighting schematics and technical philosophy
              behind the frames.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {SELECTED_WORKS.map((work) => (
              <article
                key={work.id}
                className="border border-[#F4F1EA]/12 bg-[#0A0B0E] p-6 space-y-5 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <CinematicMedia
                    src={work.image}
                    alt={work.imageAlt}
                    width={1200}
                    height={900}
                    aspectClassName="aspect-[16/9]"
                  />
                  <div className="flex flex-wrap items-center gap-2 text-xs font-mono-tech text-[#A39E93]">
                    <span className="text-[#C8A45D]">{work.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{work.year}</span>
                    <span aria-hidden="true">·</span>
                    <span>{work.aspectRatio}</span>
                  </div>
                  <h2 className="font-editorial text-2xl sm:text-3xl font-semibold text-[#F4F1EA]">
                    {work.title}
                  </h2>
                  <p className="text-sm sm:text-base text-[#A39E93] leading-relaxed">
                    {work.synopsis}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#F4F1EA]/10 flex items-center justify-between gap-4 text-xs font-mono-tech">
                  <span className="text-[#A39E93]">{work.optics}</span>
                  <a
                    href={`/blog/${work.relatedArticleSlug}`}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate(`/blog/${work.relatedArticleSlug}`);
                    }}
                    className="text-[#C8A45D] hover:text-[#F4F1EA] inline-flex items-center gap-1.5 transition-colors"
                  >
                    <span>Companion Journal Essay</span>
                    <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <ContactCtaSection onNavigate={onNavigate} />
    </>
  );
}

export function AboutView({ onNavigate }: PortfolioViewProps) {
  return (
    <>
      <SEOHead
        title="About Anup Rawat — Cinematographer & Visual Storyteller"
        description="Learn about cinematographer Anup Rawat's visual philosophy, approach to motivated lighting, camera movement, and collaborative pre-production."
        canonicalPath="/about"
        ogType="website"
      />

      <section className="bg-[#070708] py-16 sm:py-24 border-b border-[#F4F1EA]/10">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 space-y-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-7 space-y-6">
              <p className="text-xs font-mono-tech tracking-wider text-[#C8A45D]">
                VISUAL PHILOSOPHY &amp; APPROACH
              </p>
              <h1
                className="font-editorial text-4xl sm:text-5xl font-semibold text-[#F4F1EA] tracking-tight leading-[1.1]"
                style={{ textWrap: 'balance' }}
              >
                Anup Rawat — Cinematographer &amp; Visual Storyteller.
              </h1>
              <div className="space-y-4 text-base sm:text-lg text-[#D6D1C7] leading-relaxed max-w-2xl">
                <p>
                  Cinematography is the translation of invisible psychological states into physical
                  light, shadow, lens perspective, and rhythm. Rather than imposing a single rigid
                  aesthetic onto every script, each project begins by listening to the architecture
                  of the story.
                </p>
                <p>
                  Through thorough pre-production—combining scene-by-scene tonal mapping, location
                  sun-path tracking, and close alignment with directors and production designers—on-set
                  execution remains calm, adaptable, and focused on performance.
                </p>
              </div>
              <div className="pt-4 flex flex-wrap items-center gap-4">
                <a
                  href="/blog"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('/blog');
                  }}
                  className="min-h-[44px] px-6 py-3 bg-[#C8A45D] hover:bg-[#D7B673] text-[#070708] text-xs font-semibold inline-flex items-center gap-2 transition-colors"
                >
                  <span>Explore The Cinematic Journal</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </a>
                <a
                  href="/contact"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('/contact');
                  }}
                  className="min-h-[44px] px-6 py-3 border border-[#F4F1EA]/20 hover:border-[#C8A45D] text-xs font-mono-tech text-[#F4F1EA] inline-flex items-center gap-2 transition-colors"
                >
                  <span>Discuss a Collaboration</span>
                </a>
              </div>
            </div>

            <div className="lg:col-span-5">
              <CinematicMedia
                src="/images/preproduction-shotlist-workflow.svg"
                alt="Overhead blocking and lighting floorplan prepared during pre-production."
                width={1200}
                height={900}
                aspectClassName="aspect-[4/3]"
                caption="Pre-production overhead blocking & sun-path schematic."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 border-t border-[#F4F1EA]/10">
            {PHILOSOPHY_PILLARS.map((pillar) => (
              <div
                key={pillar.index}
                className="border border-[#F4F1EA]/10 bg-[#0A0B0E] p-6 space-y-3"
              >
                <span className="text-xs font-mono-tech text-[#C8A45D]">
                  {pillar.index}. PRINCIPLE
                </span>
                <h2 className="font-editorial text-2xl font-semibold text-[#F4F1EA]">
                  {pillar.title}
                </h2>
                <p className="text-sm text-[#A39E93] leading-relaxed">{pillar.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ContactCtaSection onNavigate={onNavigate} />
    </>
  );
}

export function ContactView() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [projectType, setProjectType] = useState('Narrative Feature / Short');
  const [timeline, setTimeline] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [feedback, setFeedback] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setStatus('error');
      setFeedback('Please complete your name, email address, and project brief.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      setStatus('error');
      setFeedback('Please provide a valid email address so we can respond to your enquiry.');
      return;
    }

    setStatus('loading');
    setFeedback('');

    try {
      const response = await fetch('/api/contact/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          projectType,
          timeline: timeline.trim(),
          message: message.trim(),
        }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        setStatus('error');
        setFeedback(data?.error || 'Could not submit project enquiry. Please try again.');
        return;
      }
      setStatus('success');
      setFeedback(
        data?.message ||
          'Thank you. Your project brief has been logged for Anup Rawat and will be reviewed promptly.'
      );
      setName('');
      setEmail('');
      setTimeline('');
      setMessage('');
    } catch {
      setStatus('error');
      setFeedback('Unable to reach the enquiry server right now. Please try again shortly.');
    }
  };

  return (
    <>
      <SEOHead
        title="Contact & Project Enquiry — Anup Rawat | Cinematographer"
        description="Get in touch with cinematographer Anup Rawat to discuss narrative films, commercial productions, documentaries, and visual collaborations."
        canonicalPath="/contact"
        ogType="website"
      />

      <section className="bg-[#070708] py-16 sm:py-24">
        <div className="max-w-[1140px] mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-5 space-y-6">
              <p className="text-xs font-mono-tech tracking-wider text-[#C8A45D]">
                PROJECT ENQUIRIES &amp; BOOKINGS
              </p>
              <h1
                className="font-editorial text-4xl sm:text-5xl font-semibold text-[#F4F1EA] tracking-tight leading-[1.1]"
                style={{ textWrap: 'balance' }}
              >
                Have a story worth bringing to life?
              </h1>
              <p className="text-base text-[#A39E93] leading-relaxed">
                Directors, producers, creative agencies, and production teams are invited to share
                treatment decks, scripts, target shoot dates, and location details using the
                enquiry form.
              </p>
              <div className="pt-4 border-t border-[#F4F1EA]/10 space-y-3 text-xs font-mono-tech text-[#A39E93]">
                <p>COLLABORATION FORMATS</p>
                <p className="text-[#F4F1EA]/85 font-sans text-sm">
                  Narrative Features &amp; Shorts · Commercial Campaigns · Documentary &amp; Visual
                  Essays · Pre-Production Lookbook &amp; Lighting Consultation
                </p>
              </div>
            </div>

            <div className="lg:col-span-7">
              <form
                onSubmit={handleSubmit}
                noValidate
                className="border border-[#F4F1EA]/15 bg-[#0A0B0E] p-6 sm:p-10 space-y-6"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="enquiry-name"
                      className="block text-xs font-medium text-[#F4F1EA] mb-2"
                    >
                      Your Name / Producer Name *
                    </label>
                    <input
                      id="enquiry-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Mira Sen"
                      className="w-full min-h-[44px] px-4 py-2.5 bg-[#070708] border border-[#F4F1EA]/20 text-sm text-[#F4F1EA] focus:outline-none focus:border-[#C8A45D]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="enquiry-email"
                      className="block text-xs font-medium text-[#F4F1EA] mb-2"
                    >
                      Email Address *
                    </label>
                    <input
                      id="enquiry-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="producer@productionhouse.com"
                      className="w-full min-h-[44px] px-4 py-2.5 bg-[#070708] border border-[#F4F1EA]/20 text-sm text-[#F4F1EA] focus:outline-none focus:border-[#C8A45D]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="enquiry-type"
                      className="block text-xs font-medium text-[#F4F1EA] mb-2"
                    >
                      Production Format
                    </label>
                    <select
                      id="enquiry-type"
                      value={projectType}
                      onChange={(e) => setProjectType(e.target.value)}
                      className="w-full min-h-[44px] px-4 py-2.5 bg-[#070708] border border-[#F4F1EA]/20 text-sm text-[#F4F1EA] focus:outline-none focus:border-[#C8A45D]"
                    >
                      <option value="Narrative Feature / Short">Narrative Feature / Short</option>
                      <option value="Commercial / Brand Film">Commercial / Brand Film</option>
                      <option value="Documentary / Visual Essay">Documentary / Visual Essay</option>
                      <option value="Music Video / Performance">Music Video / Performance</option>
                      <option value="Visual & Lighting Consultation">
                        Visual &amp; Lighting Consultation
                      </option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="enquiry-timeline"
                      className="block text-xs font-medium text-[#F4F1EA] mb-2"
                    >
                      Estimated Shoot Window / Location
                    </label>
                    <input
                      id="enquiry-timeline"
                      type="text"
                      value={timeline}
                      onChange={(e) => setTimeline(e.target.value)}
                      placeholder="e.g. November 2026 · Mumbai / Ladakh"
                      className="w-full min-h-[44px] px-4 py-2.5 bg-[#070708] border border-[#F4F1EA]/20 text-sm text-[#F4F1EA] focus:outline-none focus:border-[#C8A45D]"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="enquiry-message"
                    className="block text-xs font-medium text-[#F4F1EA] mb-2"
                  >
                    Project Synopsis, Visual References &amp; Scope *
                  </label>
                  <textarea
                    id="enquiry-message"
                    rows={5}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Share a brief overview of the story, visual tone, shooting schedule, or camera package considerations..."
                    className="w-full p-4 bg-[#070708] border border-[#F4F1EA]/20 text-sm text-[#F4F1EA] focus:outline-none focus:border-[#C8A45D]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="min-h-[44px] px-6 py-3 bg-[#C8A45D] hover:bg-[#D7B673] text-[#070708] text-xs sm:text-sm font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-60"
                >
                  {status === 'loading' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                      <span>Sending Project Brief...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Project Enquiry</span>
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </>
                  )}
                </button>

                {feedback && (
                  <div
                    role={status === 'error' ? 'alert' : 'status'}
                    className={`flex items-start gap-2.5 text-xs sm:text-sm pt-2 ${
                      status === 'error' ? 'text-[#E57373]' : 'text-[#C8A45D]'
                    }`}
                  >
                    {status === 'error' ? (
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                    )}
                    <span>{feedback}</span>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
