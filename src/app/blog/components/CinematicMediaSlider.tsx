'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion, type Variants } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Images,
  FileText,
  Download,
  ExternalLink,
  Film,
} from 'lucide-react';

export type MediaType = 'image' | 'pdf' | 'video';

export interface GalleryMediaItem {
  id?: string;
  url: string;
  alt: string;
  caption?: string;
  type: MediaType;
  width?: number;
  height?: number;
  name?: string;
}

export function resolveMediaType(item: any, url: string): MediaType {
  if (item?.type === 'pdf' || item?.type === 'video' || item?.type === 'image') {
    return item.type;
  }
  if (!url) return 'image';
  const clean = url.split('?')[0].toLowerCase();
  if (clean.endsWith('.pdf')) return 'pdf';
  if (
    clean.endsWith('.mp4') ||
    clean.endsWith('.webm') ||
    clean.endsWith('.mov') ||
    clean.endsWith('.ogg')
  ) {
    return 'video';
  }
  return 'image';
}

interface CinematicMediaSliderProps {
  media: GalleryMediaItem[];
  title?: string;
  onOpenLightbox?: (index: number) => void;
  className?: string;
  autoPlayIntervalMs?: number;
}

export default function CinematicMediaSlider({
  media,
  title = 'Gallery',
  onOpenLightbox,
  className = '',
  autoPlayIntervalMs = 2500,
}: CinematicMediaSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState<number>(1);
  const [isHovered, setIsHovered] = useState(false);
  const [isTabActive, setIsTabActive] = useState(true);
  const [isInViewport, setIsInViewport] = useState(true);
  const [resetKey, setResetKey] = useState(0);
  const [loadedUrls, setLoadedUrls] = useState<Record<string, boolean>>({});

  const containerRef = useRef<HTMLDivElement>(null);
  const thumbnailStripRef = useRef<HTMLDivElement>(null);
  const thumbnailRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const shouldReduceMotion = useReducedMotion();

  // Guard activeIndex within bounds
  const totalItems = media.length;
  const safeIndex = totalItems > 0 ? ((activeIndex % totalItems) + totalItems) % totalItems : 0;
  const currentItem = media[safeIndex] || media[0];

  // Manual navigation helper that resets the 4s autoplay timer
  const resetTimer = useCallback(() => {
    setResetKey((prev) => prev + 1);
  }, []);

  const handlePrev = useCallback(() => {
    if (totalItems <= 1) return;
    setDirection(-1);
    setActiveIndex((prev) => (prev === 0 ? totalItems - 1 : prev - 1));
    resetTimer();
  }, [totalItems, resetTimer]);

  const handleNext = useCallback(() => {
    if (totalItems <= 1) return;
    setDirection(1);
    setActiveIndex((prev) => (prev === totalItems - 1 ? 0 : prev + 1));
    resetTimer();
  }, [totalItems, resetTimer]);

  const handleSelectThumb = useCallback(
    (idx: number) => {
      if (idx === safeIndex) return;
      setDirection(idx > safeIndex ? 1 : -1);
      setActiveIndex(idx);
      resetTimer();
    },
    [safeIndex, resetTimer]
  );

  // 1. Preload ALL gallery images immediately so switching is instant without waiting
  useEffect(() => {
    if (totalItems <= 1) return;

    media.forEach((item) => {
      if (item && item.type === 'image' && item.url) {
        const img = new Image();
        img.src = item.url;
        img.onload = () => {
          setLoadedUrls((prev) => ({ ...prev, [item.url]: true }));
        };
      }
    });
  }, [media, totalItems]);

  // 2. Track Window Focus & Tab Visibility
  useEffect(() => {
    const handleVisibility = () => {
      setIsTabActive(!document.hidden);
    };
    const handleFocus = () => setIsTabActive(true);
    const handleBlur = () => setIsTabActive(false);

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  // 3. Track visibility within viewport - pause autoplay when user scrolls down to read article
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInViewport(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // 4. Autoplay Loop (pauses on hover, inactive tab, when active item is PDF/Video, or when scrolled out of view)
  useEffect(() => {
    if (totalItems <= 1) return;
    if (isHovered || !isTabActive || !isInViewport) return;

    // Do NOT autoplay when viewing PDFs or videos
    if (currentItem?.type !== 'image') return;

    const timer = setInterval(() => {
      setDirection(1);
      setActiveIndex((prev) => (prev === totalItems - 1 ? 0 : prev + 1));
    }, autoPlayIntervalMs);

    return () => clearInterval(timer);
  }, [totalItems, isHovered, isTabActive, isInViewport, currentItem?.type, autoPlayIntervalMs, resetKey]);

  // 5. Smoothly scroll ONLY the horizontal thumbnail container (NEVER scroll the window or jump to top!)
  useEffect(() => {
    const thumbEl = thumbnailRefs.current[safeIndex];
    const container = thumbnailStripRef.current;
    if (thumbEl && container) {
      const containerRect = container.getBoundingClientRect();
      const thumbRect = thumbEl.getBoundingClientRect();
      const offset =
        thumbRect.left -
        containerRect.left -
        (container.clientWidth / 2 - thumbEl.clientWidth / 2);

      if (Math.abs(offset) > 4) {
        container.scrollBy({
          left: offset,
          behavior: 'smooth',
        });
      }
    }
  }, [safeIndex]);

  // 5. Mobile Touch Gesture Handling (Swipe Left / Swipe Right)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;

    // Horizontal swipe threshold
    if (Math.abs(deltaX) > 42 && Math.abs(deltaX) > Math.abs(deltaY) * 1.4) {
      if (deltaX < 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  if (!currentItem || totalItems === 0) return null;

  // Fast, responsive cinematic transitions (instant & smooth, no lag)
  const slideVariants: Variants = {
    enter: (dir: number) => ({
      opacity: 0,
      scale: shouldReduceMotion ? 1 : 1.01,
      x: shouldReduceMotion ? 0 : dir > 0 ? 10 : -10,
    }),
    center: {
      opacity: 1,
      scale: 1,
      x: 0,
      transition: {
        duration: shouldReduceMotion ? 0.15 : 0.35,
        ease: [0.16, 1, 0.3, 1] as const, // Snappy cinematic ease
      },
    },
    exit: (dir: number) => ({
      opacity: 0,
      scale: shouldReduceMotion ? 1 : 0.99,
      x: shouldReduceMotion ? 0 : dir > 0 ? -10 : 10,
      transition: {
        duration: shouldReduceMotion ? 0.15 : 0.28,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    }),
  };

  return (
    <div
      ref={containerRef}
      className={`space-y-4 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Main Active Media Frame */}
      <div className="relative group border-2 border-[#14100E] rounded-2xl overflow-hidden bg-[#14100E] shadow-[4px_4px_0_#14100E]">
        {/* Media Presentation: Image, PDF, or Video */}
        {currentItem.type === 'pdf' ? (
          /* PDF Viewer Container */
          <div className="relative w-full aspect-[16/9] bg-[#171412] flex flex-col justify-between p-4 sm:p-6 text-[#F4EDE4]">
            {/* PDF Header Bar */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3 z-10">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[#012CEB]/20 text-[#012CEB] border border-[#012CEB]/40">
                  <FileText className="w-4 h-4" />
                </span>
                <div>
                  <p className="font-mono-tech text-xs uppercase tracking-wider text-neutral-200 font-semibold">
                    PDF Document
                  </p>
                  <p className="text-[11px] text-neutral-400 truncate max-w-xs sm:max-w-md">
                    {currentItem.caption || currentItem.alt || 'Editorial Document Attachment'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={currentItem.url}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-[#012CEB] text-white text-xs font-mono-tech flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Download</span>
                </a>
                <a
                  href={currentItem.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-[#012CEB] text-white text-xs font-mono-tech flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Open in Tab</span>
                </a>
              </div>
            </div>

            {/* Embedded PDF iframe */}
            <div className="flex-1 my-3 bg-neutral-900/90 rounded-xl overflow-hidden border border-white/10 relative">
              <iframe
                src={`${currentItem.url}#view=FitH`}
                title={currentItem.alt || 'PDF Document Viewer'}
                className="w-full h-full border-0"
              />
            </div>

            {/* PDF Status Footer */}
            <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono-tech pt-2 border-t border-white/10">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                Autoplay paused for document review
              </span>
              <span>
                {safeIndex + 1} / {totalItems}
              </span>
            </div>
          </div>
        ) : currentItem.type === 'video' ? (
          /* Video Viewer Container */
          <div className="relative w-full aspect-[16/9] bg-[#14100E] flex items-center justify-center">
            <video
              src={currentItem.url}
              controls
              playsInline
              className="w-full h-full object-contain"
            />
          </div>
        ) : (
          /* Image Slideshow with Framer Motion */
          <div
            onClick={() => onOpenLightbox && onOpenLightbox(safeIndex)}
            className="cursor-zoom-in relative w-full aspect-[16/9] overflow-hidden bg-[#14100E]"
          >
            <AnimatePresence initial={false} custom={direction} mode="popLayout">
              <motion.div
                key={currentItem.url || safeIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="absolute inset-0 w-full h-full"
              >
                <img
                  src={currentItem.url}
                  alt={currentItem.alt || title}
                  loading="eager"
                  decoding="async"
                  className="w-full h-full object-cover select-none pointer-events-none"
                />

                {/* Subtle Cinematic Scrim */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#14100E]/75 via-transparent to-transparent"
                />

                {/* Optional Caption inside Frame */}
                {currentItem.caption && (
                  <div className="absolute bottom-3 left-4 sm:bottom-4 sm:left-6 z-20 pointer-events-none max-w-xl">
                    <p className="text-xs sm:text-sm font-sans text-[#F4EDE4]/90 backdrop-blur-xs drop-shadow-md">
                      {currentItem.caption}
                    </p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        {/* Counter Badge (Top Right) */}
        {totalItems > 1 && (
          <div className="absolute top-4 right-4 z-20 flex items-center gap-2 pointer-events-none">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono-tech font-semibold bg-[#14100E]/85 text-[#F4EDE4] backdrop-blur-md border border-white/20 shadow-md">
              <Images className="w-3.5 h-3.5 text-[#012CEB]" />
              <span>
                {safeIndex + 1} / {totalItems}
              </span>
            </span>
          </div>
        )}

        {/* Previous and Next Navigation Arrows */}
        {totalItems > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              aria-label="Previous gallery image"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-[#14100E]/80 hover:bg-[#012CEB] text-white flex items-center justify-center transition-all cursor-pointer shadow-md backdrop-blur-sm focus:outline-none hover:scale-105 active:scale-95"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              aria-label="Next gallery image"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-[#14100E]/80 hover:bg-[#012CEB] text-white flex items-center justify-center transition-all cursor-pointer shadow-md backdrop-blur-sm focus:outline-none hover:scale-105 active:scale-95"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Fullscreen Expand Action Pill */}
        {currentItem.type === 'image' && onOpenLightbox && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenLightbox(safeIndex);
            }}
            aria-label="View image full screen"
            className="absolute bottom-4 right-4 z-20 px-3 py-1.5 rounded-lg bg-[#14100E]/80 hover:bg-[#012CEB] text-[#F4EDE4] text-xs font-mono-tech flex items-center gap-1.5 backdrop-blur-sm transition-all cursor-pointer shadow-md hover:scale-105"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Expand</span>
          </button>
        )}
      </div>

      {/* Multiple Media Thumbnail Strip */}
      {totalItems > 1 && (
        <div
          ref={thumbnailStripRef}
          className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 no-scrollbar scroll-smooth"
        >
          {media.map((item, idx) => {
            const isActive = idx === safeIndex;
            return (
              <button
                key={item.url || idx}
                ref={(el) => {
                  thumbnailRefs.current[idx] = el;
                }}
                type="button"
                onClick={() => handleSelectThumb(idx)}
                aria-label={`View media ${idx + 1}`}
                className={`relative shrink-0 rounded-xl overflow-hidden transition-all duration-200 cursor-pointer border-2 ${
                  isActive
                    ? 'border-[#012CEB] scale-[1.03] shadow-[0_0_12px_rgba(1,44,235,0.4)] ring-2 ring-[#012CEB]/35'
                    : 'border-[#14100E]/20 hover:border-[#14100E] opacity-75 hover:opacity-100 hover:scale-[1.01]'
                }`}
              >
                {item.type === 'pdf' ? (
                  <div className="w-24 h-16 sm:w-28 sm:h-20 bg-[#1e1916] flex flex-col items-center justify-center p-2 text-center">
                    <FileText className="w-5 h-5 text-amber-400 mb-1" />
                    <span className="text-[10px] font-mono-tech text-neutral-300 font-semibold truncate w-full px-1">
                      PDF
                    </span>
                  </div>
                ) : item.type === 'video' ? (
                  <div className="w-24 h-16 sm:w-28 sm:h-20 bg-[#16171b] flex flex-col items-center justify-center p-2 text-center">
                    <Film className="w-5 h-5 text-[#012CEB] mb-1" />
                    <span className="text-[10px] font-mono-tech text-neutral-300 font-semibold truncate w-full px-1">
                      VIDEO
                    </span>
                  </div>
                ) : (
                  <img
                    src={item.url}
                    alt={item.alt || `Thumbnail ${idx + 1}`}
                    loading="lazy"
                    decoding="async"
                    className="w-24 h-16 sm:w-28 sm:h-20 object-cover bg-neutral-900"
                  />
                )}

                {/* Animated active border glow ring */}
                {isActive && (
                  <motion.div
                    layoutId="activeMediaThumbGlow"
                    className="absolute inset-0 rounded-xl ring-2 ring-[#012CEB] pointer-events-none"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}

                {/* Thumbnail Index Badge */}
                <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[9px] font-mono-tech font-bold bg-black/80 text-white backdrop-blur-xs">
                  {idx + 1}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
