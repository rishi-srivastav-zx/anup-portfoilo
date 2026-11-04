'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, Film } from 'lucide-react';

interface AuthorBioEditorialProps {
  author: {
    name: string;
    role: string;
    avatar?: string;
    bio?: string;
  };
  onNavigate?: (path: string) => void;
  className?: string;
}

export default function AuthorBioEditorial({
  author,
  onNavigate,
  className = '',
}: AuthorBioEditorialProps) {
  const shouldReduceMotion = useReducedMotion();

  const handleReelClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate('/#work');
      return;
    }
    window.location.href = '/#work';
  };

  const avatarSrc = author?.avatar || '/images/anup_portrait.png';
  const authorName = author?.name || 'Anup Rawat';
  const authorRole = author?.role || 'Director of Photography · Visual Storyteller';
  const authorBio =
    author?.bio ||
    'Crafting emotional visual gravity through motivated lighting, disciplined camera movement, and story-first optical grammar. Available for narrative drama, commercial campaigns, and visual essays worldwide.';

  return (
    <motion.section
      aria-label="About the author"
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className={`mt-14 border-2 border-[#14100E] bg-[#F4EFE6] rounded-2xl p-6 sm:p-8 shadow-[4px_4px_0_#14100E] space-y-6 relative overflow-hidden ${className}`}
    >
      {/* 1. Header Eyebrow Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#14100E]/15 pb-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#C5A059] animate-pulse" aria-hidden="true" />
          <p className="font-mono-tech text-[11px] sm:text-xs font-bold text-[#C5A059] tracking-[0.2em] uppercase">
            A NOTE FROM THE AUTHOR
          </p>
        </div>

        <span
          className="font-mono-tech text-[11px] text-[#6B625A] tracking-wider uppercase hidden sm:inline"
          aria-hidden="true"
        >
          CINEMATOGRAPHY JOURNAL // DP NOTE
        </span>
      </div>

      {/* 2. Main Profile Content */}
      <div className="flex flex-col sm:flex-row items-start gap-5 sm:gap-7">
        {/* Author Avatar with Camera Badge */}
        <div className="relative shrink-0 group">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-[#14100E] shadow-[3px_3px_0_#14100E] bg-[#14100E]">
            <img
              src={avatarSrc}
              alt={`${authorName} — Cinematographer`}
              className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
            />
          </div>

          <span
            className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-[#14100E] border border-white/20 text-[#C5A059] flex items-center justify-center shadow-xs"
            aria-hidden="true"
          >
            <Film className="w-3.5 h-3.5" />
          </span>
        </div>

        {/* Author Info & Editorial Biography */}
        <div className="space-y-2 flex-1">
          <div>
            <h3 className="font-editorial text-2xl sm:text-3xl font-bold text-[#14100E] tracking-tight leading-snug">
              {authorName}
            </h3>
            <p className="font-mono-tech text-xs text-[#6B625A] font-semibold tracking-wider uppercase mt-0.5">
              {authorRole}
            </p>
          </div>

          <p className="text-sm sm:text-base text-[#574E46] leading-relaxed font-sans pt-1">
            {authorBio}
          </p>
        </div>
      </div>

      {/* 3. Footer Action & Signature Row */}
      <div className="pt-4 border-t border-[#14100E]/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Signature Element */}
        <div className="flex items-center gap-2 select-none">
          <span className="font-signature text-3xl sm:text-4xl text-[#14100E]/85 transform -rotate-2">
            Anup Rawat
          </span>
          <span className="font-signature text-xl text-[#012CEB] transform -rotate-1">
            (Baaz)
          </span>
        </div>

        {/* Portfolio CTA */}
        <a
          href="/#work"
          onClick={handleReelClick}
          aria-label="Explore Anup Rawat's Cinematography Reel"
          className="group inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#14100E] hover:bg-[#25201C] active:bg-[#000000] text-[#F4EDE4] text-xs sm:text-sm font-mono-tech font-semibold transition-all duration-200 shadow-md hover:shadow-lg w-full sm:w-auto cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C5A059]/50"
        >
          <span>Explore Cinematography Reel</span>
          <ArrowUpRight className="w-4 h-4 text-[#C5A059] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </a>
      </div>
    </motion.section>
  );
}

