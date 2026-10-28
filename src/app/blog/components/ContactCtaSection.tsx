import { ArrowUpRight } from 'lucide-react';

interface ContactCtaSectionProps {
  onNavigate: (path: string) => void;
}

export default function ContactCtaSection({ onNavigate }: ContactCtaSectionProps) {
  const handleContactClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    onNavigate('/contact');
  };

  return (
    <section
      aria-labelledby="cinematic-contact-cta-heading"
      className="border-t border-[#14100E]/15 bg-[#E6DDD2] text-[#14100E] relative overflow-hidden"
    >
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 py-20 sm:py-28">
        <div className="max-w-3xl space-y-6">
          <p className="text-xs font-mono-tech tracking-wider text-[#012CEB] font-semibold">
            COLLABORATION &amp; DIRECTION OF PHOTOGRAPHY
          </p>
          <h2
            id="cinematic-contact-cta-heading"
            className="font-editorial text-3xl sm:text-5xl lg:text-6xl font-semibold text-[#14100E] tracking-tight leading-[1.1]"
            style={{ textWrap: 'balance' }}
          >
            Have a story worth bringing to life?
          </h2>
          <p className="text-base sm:text-lg text-[#6B625A] leading-relaxed max-w-2xl">
            Available for narrative features, short films, commercial campaigns, and visual
            storytelling collaborations. Directors, producers, agencies, and production teams are
            invited to share scripts, treatments, or shooting schedules for upcoming projects.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-6">
            <a
              href="/#contact"
              onClick={handleContactClick}
              className="min-h-[46px] px-8 py-3 bg-[#14100E] hover:bg-[#012CEB] text-[#F4EDE4] text-sm font-semibold rounded-xl shadow-[3px_3px_0_#012CEB] inline-flex items-center gap-2.5 transition-all whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#012CEB]"
            >
              <span>Inquire About a Project</span>
              <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
            </a>
            <a
              href="/#work"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/#work');
              }}
              className="text-sm font-medium text-[#14100E] hover:text-[#012CEB] underline underline-offset-8 decoration-[#14100E]/30 hover:decoration-[#012CEB] transition-colors whitespace-nowrap shrink-0"
            >
              Explore Selected Cinematography Work →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
