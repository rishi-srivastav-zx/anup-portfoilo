'use client';

import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowUpRight,
  Mail,
  MessageCircle,
  Clapperboard,
  Film,
  Sparkles,
} from 'lucide-react';
import { SELECTED_WORKS } from '../data/portfolio';
import ProjectInquiryModal from './ProjectInquiryModal';

const PORTFOLIO_EMAIL = process.env.NEXT_PUBLIC_PORTFOLIO_EMAIL || 'Anooprawat123123@gmail.com';
const WHATSAPP_URL =
  'https://wa.me/?text=Hi%20Anup%2C%20I%20am%20reaching%20out%20from%20your%20cinematography%20portfolio%20regarding%20a%20project';

interface BlogSidebarProps {
  onNavigate?: (path: string) => void;
  className?: string;
}

export default function BlogSidebar({ onNavigate, className = '' }: BlogSidebarProps) {
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  // Top 2 selected portfolio projects (compact to fit comfortably within viewport while sticky)
  const featuredWorks = SELECTED_WORKS.slice(0, 2);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate(path);
    }
  };

  return (
    <>
      <div className={`space-y-6 sm:space-y-8 ${className}`}>
        {/* 1. STICKY HIRE ANUP CARD */}
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="relative bg-[#14100E] border-2 border-[#14100E] rounded-2xl p-6 sm:p-7 text-[#F4EDE4] shadow-[4px_4px_0_#14100E] overflow-hidden"
        >
          {/* Subtle Ambient Film Watermark in Background */}
          <div
            aria-hidden="true"
            className="absolute -right-6 -bottom-6 w-32 h-32 opacity-[0.06] pointer-events-none select-none text-[#F4EDE4]"
          >
            <Clapperboard className="w-full h-full stroke-1" />
          </div>

          <div className="relative z-10 space-y-4">
            {/* Small Availability Indicator */}
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#C5A059]/15 border border-[#C5A059]/35 text-[10px] sm:text-[11px] font-mono-tech text-[#C5A059] font-bold tracking-wider uppercase">
                <span className="w-2 h-2 rounded-full bg-[#C5A059] animate-pulse" />
                OPEN FOR PROJECTS
              </span>

              {/* Minimal Cinema Detail */}
              <span className="text-[#C5A059]/60 font-mono-tech text-xs tracking-widest" aria-hidden="true">
                DP // 2026
              </span>
            </div>

            {/* Heading */}
            <h3 className="font-editorial text-2xl sm:text-[1.65rem] font-bold text-[#F4EDE4] leading-snug tracking-tight">
              Let&apos;s create something extraordinary.
            </h3>

            {/* Description */}
            <p className="text-sm text-[#A39E93] leading-relaxed font-sans">
              Have a film, commercial or creative project in mind? Let&apos;s bring your vision to life.
            </p>

            {/* Primary CTA: Discuss Your Project */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsInquiryModalOpen(true)}
                className="group w-full py-3 px-5 rounded-xl bg-[#C5A059] hover:bg-[#D7B673] active:bg-[#B38F48] text-[#14100E] font-semibold text-xs sm:text-sm font-mono-tech inline-flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#C5A059]/40"
              >
                <span>Discuss Your Project</span>
                <ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>
            </div>

            {/* Secondary Contact Options: WhatsApp & Email */}
            <div className="pt-1 flex items-center gap-2.5">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2 px-3 rounded-lg border border-white/10 hover:border-[#C5A059]/60 bg-white/5 hover:bg-white/10 text-xs font-mono-tech text-[#F4EDE4] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                <span>WhatsApp</span>
              </a>

              <a
                href={`mailto:${PORTFOLIO_EMAIL}?subject=Cinematography%20Project%20Inquiry`}
                className="flex-1 py-2 px-3 rounded-lg border border-white/10 hover:border-[#C5A059]/60 bg-white/5 hover:bg-white/10 text-xs font-mono-tech text-[#F4EDE4] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>Email</span>
              </a>
            </div>
          </div>
        </motion.div>

        {/* 2. FEATURED WORK SECTION */}
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="border-2 border-[#14100E] bg-[#F4EFE6] rounded-2xl p-6 shadow-[4px_4px_0_#14100E] space-y-5"
        >
          {/* Header Row */}
          <div className="flex items-center justify-between gap-3 border-b border-[#14100E]/15 pb-3.5">
            <div className="flex items-center gap-2">
              <Film className="w-4 h-4 text-[#012CEB]" />
              <h4 className="font-editorial text-lg sm:text-xl font-bold text-[#14100E]">
                Selected Works
              </h4>
            </div>

            <a
              href="/#work"
              onClick={(e) => handleLinkClick(e, '/#work')}
              className="text-xs font-mono-tech font-semibold text-[#012CEB] hover:text-[#14100E] inline-flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
            >
              <span>View All</span>
              <span aria-hidden="true">→</span>
            </a>
          </div>

          {/* Project List */}
          <div className="space-y-3.5">
            {featuredWorks.map((work) => (
              <a
                key={work.id}
                href={`/blog/${work.relatedArticleSlug}`}
                onClick={(e) => handleLinkClick(e, `/blog/${work.relatedArticleSlug}`)}
                className="group block border border-[#14100E]/15 hover:border-[#14100E] bg-[#E6DDD2]/60 hover:bg-[#E6DDD2] rounded-xl p-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs cursor-pointer"
              >
                {/* Thumbnail Frame */}
                <div className="relative aspect-[16/10] rounded-lg overflow-hidden bg-[#14100E] mb-2.5 border border-[#14100E]/10">
                  <img
                    src={work.image}
                    alt={work.imageAlt || work.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.04]"
                  />
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#14100E]/60 via-transparent to-transparent"
                  />
                  <span className="absolute bottom-1.5 left-2 text-[10px] font-mono-tech text-white/90 font-medium">
                    {work.year} · {work.aspectRatio}
                  </span>
                </div>

                {/* Category & Title */}
                <div className="space-y-1">
                  <p className="text-[10px] font-mono-tech uppercase tracking-wider text-[#6B625A] font-semibold">
                    {work.category}
                  </p>
                  <div className="flex items-center justify-between gap-2">
                    <h5 className="font-editorial font-bold text-sm sm:text-base text-[#14100E] group-hover:text-[#012CEB] transition-colors line-clamp-1">
                      {work.title}
                    </h5>
                    <ArrowUpRight className="w-4 h-4 text-[#14100E]/50 group-hover:text-[#012CEB] transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shrink-0" />
                  </div>
                </div>
              </a>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Project Inquiry Modal */}
      <ProjectInquiryModal
        isOpen={isInquiryModalOpen}
        onClose={() => setIsInquiryModalOpen(false)}
      />
    </>
  );
}

