'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Quote } from 'lucide-react';

interface HeaderProps {
  currentPath?: string;
  onNavigate?: (path: string) => void;
}

export const CINEMATOGRAPHY_QUOTES = [
  {
    quote: "Cinematography is infinite in its possibilities… much more so than words.",
    author: "Conrad L. Hall, ASC",
  },
  {
    quote: "Lighting is not just about illuminating things; it's about creating an atmosphere.",
    author: "Roger Deakins, ASC, BSC",
  },
  {
    quote: "There is a visual grammar to every story. The material dictates the light.",
    author: "Gordon Willis, ASC",
  },
  {
    quote: "Cinema is a language of light, color, and evocative shadows.",
    author: "Vittorio Storaro, ASC, AIC",
  },
  {
    quote: "The camera must breathe with the characters, never call attention to itself.",
    author: "Emmanuel Lubezki, ASC, AMC",
  },
  {
    quote: "Cinema is a matter of what's inside the frame and what's deliberately left out.",
    author: "Martin Scorsese",
  },
  {
    quote: "The choice of lens is the choice of emotional proximity to the human soul.",
    author: "Darius Khondji, AFC, ASC",
  },
  {
    quote: "Shadow is not the absence of light; it is the sculpture of light.",
    author: "Robert Richardson, ASC",
  },
  {
    quote: "A film is – or should be – more like music than like fiction.",
    author: "Stanley Kubrick",
  },
];

export default function Header({ onNavigate }: HeaderProps) {
  const router = useRouter();
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const advanceQuote = useCallback(() => {
    setIsFading(true);
    setTimeout(() => {
      setQuoteIndex((prev) => (prev + 1) % CINEMATOGRAPHY_QUOTES.length);
      setIsFading(false);
    }, 350);
  }, []);

  // Automatic quote rotation every 4.5 seconds (paused on hover)
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      advanceQuote();
    }, 4500);

    return () => clearInterval(interval);
  }, [isPaused, advanceQuote]);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();

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

  const currentQuote = CINEMATOGRAPHY_QUOTES[quoteIndex];

  return (
    <header className="sticky top-0 z-40 bg-[#E6DDD2]/95 backdrop-blur-md border-b border-[#14100E]/15">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 h-14 sm:h-16 flex items-center justify-between gap-3 sm:gap-6 lg:gap-8">
        {/* Zone 1: Brand Signature */}
        <a
          href="/"
          onClick={(e) => handleLinkClick(e, '/')}
          className="flex items-center gap-2 sm:gap-2.5 select-none group shrink-0"
        >
          <img
            src="/ar-monogram.webp"
            alt="AR"
            className="w-6 h-6 sm:w-8 sm:h-8 object-contain transition-transform duration-300 group-hover:scale-105"
          />
          <span className="font-signature text-xl sm:text-2xl lg:text-3xl font-bold text-[#14100E] leading-none transform -rotate-1 group-hover:text-[#012CEB] transition-colors whitespace-nowrap">
            Anup Rawat
          </span>
        </a>

        {/* Zone 2: Rotating Cinematography Quotes (Desktop / Tablet inline) */}
        <div
          onClick={advanceQuote}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          title="Click to see next cinematography quote"
          className="hidden md:flex flex-1 min-w-0 max-w-2xl mx-2 lg:mx-6 cursor-pointer select-none text-center group py-1 items-center justify-center"
        >
          <div className="overflow-hidden min-h-[30px] flex items-center justify-center">
            <p
              className={`text-xs lg:text-sm text-[#14100E] transition-all duration-350 ease-out flex items-center gap-1.5 lg:gap-2 flex-wrap justify-center leading-snug ${
                isFading
                  ? 'opacity-0 -translate-y-1.5 scale-98'
                  : 'opacity-100 translate-y-0 scale-100'
              }`}
            >
              <Quote className="w-3 h-3 text-[#012CEB] shrink-0 fill-current opacity-80" />
              <span className="italic font-editorial lg:text-base text-[#14100E]">
                “{currentQuote.quote}”
              </span>
              <span className="font-mono-tech text-[10px] lg:text-xs font-semibold text-[#012CEB] not-italic whitespace-nowrap">
                — {currentQuote.author}
              </span>
            </p>
          </div>
        </div>

        {/* Zone 3: Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="/contact"
            onClick={(e) => handleLinkClick(e, '/contact')}
            className="inline-flex items-center justify-center px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-['DM_Mono'] font-bold text-[#F4EFE6] bg-[#14100E] hover:bg-[#012CEB] transition-all duration-150 uppercase tracking-wider rounded-md shadow-[2px_2px_0_#14100E] active:translate-x-[1px] active:translate-y-[1px] whitespace-nowrap"
          >
            Project Enquiry ↗
          </a>
        </div>
      </div>

      {/* Mobile Quote Strip */}
      <div
        onClick={advanceQuote}
        title="Tap to see next cinematography quote"
        className="md:hidden border-t border-[#14100E]/10 px-4 py-1.5 cursor-pointer select-none text-center bg-[#E6DDD2]/80"
      >
        <p
          className={`text-[11px] leading-snug text-[#14100E] transition-all duration-350 ease-out flex items-center justify-center gap-x-1.5 flex-wrap ${
            isFading ? 'opacity-0 -translate-y-1' : 'opacity-100 translate-y-0'
          }`}
        >
          <span className="italic font-editorial text-[#14100E]">
            “{currentQuote.quote}”
          </span>
          <span className="font-mono-tech text-[10px] font-semibold text-[#012CEB] not-italic whitespace-nowrap">
            — {currentQuote.author}
          </span>
        </p>
      </div>
    </header>
  );
}
