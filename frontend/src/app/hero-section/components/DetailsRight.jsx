'use client';

import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useHeroConfig } from '../provider/HeroProvider';

export default function DetailsRight() {
  const { config } = useHeroConfig();
  const { content: { topRightQuote, graph, showreel }, colors } = config;
  const shouldReduceMotion = useReducedMotion();
  const [isGraphHovered, setIsGraphHovered] = useState(false);

  const handleShowreelClick = (e) => {
    e.preventDefault();
    const el = document.getElementById('work-inner') || document.getElementById('work');
    if (typeof window !== 'undefined' && window.lenis) {
      window.lenis.scrollTo(el || '#work', {
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });
    } else if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="absolute right-3 sm:right-6 md:right-12 top-2 sm:top-6 bottom-24 sm:bottom-28 md:bottom-12 z-30 pointer-events-none flex flex-col justify-between items-end">
      
      {/* Mobile Top Right Showreel Badge */}
      <motion.div
        initial={{ opacity: 0, x: shouldReduceMotion ? 0 : 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, delay: 1, ease: [0.16, 1, 0.3, 1] }}
        className="sm:hidden pointer-events-auto"
      >
        <motion.a 
          href={showreel.href || '#work'} 
          onClick={handleShowreelClick}
          aria-label="View Cinematography Showreel"
          className="block border px-2.5 py-1.5 bg-[#F4EDE4] text-[#14100E] shadow-[2px_2px_0_#14100E] active:translate-x-[1px] active:translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14100E]"
          style={{ borderColor: '#14100E' }}
        >
          <span className="font-mono text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1">
            Showreel <span className="text-[11px] leading-none" aria-hidden="true">↗</span>
          </span>
        </motion.a>
      </motion.div>

      {/* Desktop/Tablet Top Right Quote & Graph */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="hidden sm:flex items-start text-right pointer-events-auto"
        style={{ color: colors.text }}
      >
        <div className="mr-3 sm:mr-4 md:mr-6 text-xs md:text-sm tracking-wide leading-relaxed font-light">
          {topRightQuote.line1}<br />
          {topRightQuote.line2}<br />
          <span className="font-bold">{topRightQuote.bold}</span>
        </div>
        
        {/* SVG Graph */}
        <div 
          className="relative w-18 h-12 sm:w-20 sm:h-14 md:w-24 md:h-16 cursor-default group shrink-0"
          onMouseEnter={() => setIsGraphHovered(true)}
          onMouseLeave={() => setIsGraphHovered(false)}
          tabIndex={0}
          role="img"
          aria-label="Cinematography timeline graph"
        >
          {/* Axes */}
          <div className="absolute left-0 top-0 bottom-0 w-[1px]" style={{ backgroundColor: colors.lines, opacity: 0.5 }} aria-hidden="true"></div>
          <div className="absolute left-0 bottom-0 right-0 h-[1px]" style={{ backgroundColor: colors.lines, opacity: 0.5 }} aria-hidden="true"></div>
          
          <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox="0 0 100 60" aria-hidden="true">
            <motion.path
              d="M 0 60 Q 50 60 100 0"
              fill="transparent"
              stroke={colors.text}
              strokeWidth="1.5"
              initial={{ pathLength: 0 }}
              animate={
                shouldReduceMotion
                  ? { pathLength: 1 }
                  : isGraphHovered
                  ? { pathLength: [0, 1] }
                  : { pathLength: 1 }
              }
              transition={
                shouldReduceMotion
                  ? { duration: 0.01 }
                  : isGraphHovered
                  ? { duration: 0.8, ease: "easeInOut" }
                  : { duration: 2, ease: "easeOut", delay: 1.5 }
              }
            />
            <motion.circle
              cx="100"
              cy="0"
              r="2.5"
              fill={colors.text}
              initial={{ scale: 0, opacity: 0 }}
              animate={
                shouldReduceMotion
                  ? { scale: 1, opacity: 1 }
                  : isGraphHovered
                  ? { scale: [1, 1.5, 1], opacity: 1 }
                  : { scale: 1, opacity: 1 }
              }
              transition={
                shouldReduceMotion
                  ? { duration: 0.01 }
                  : isGraphHovered
                  ? { duration: 0.3 }
                  : { delay: 3, duration: 0.3, type: "spring" }
              }
            />
          </svg>
          
          <div className="absolute -bottom-4 sm:-bottom-5 left-0 text-[8px] sm:text-[9px]" style={{ color: colors.secondary }}>{graph.startLabel}</div>
          <div className="absolute -bottom-4 sm:-bottom-5 right-0 text-[8px] sm:text-[9px]" style={{ color: colors.secondary }}>{graph.endLabel}</div>
        </div>
      </motion.div>

      {/* Desktop/Tablet Bottom Right Showreel Tag */}
      <motion.div
        initial={{ y: shouldReduceMotion ? 0 : -40, opacity: 0, rotate: -6 }}
        animate={{ y: 0, opacity: 1, rotate: -6 }}
        transition={{ duration: 1, delay: 1.5, type: "spring" }}
        className="hidden sm:block mt-auto relative pointer-events-auto group cursor-pointer pb-1 sm:pb-4"
        whileHover="hover"
      >
        <motion.a 
          href={showreel.href || '#work'} 
          onClick={handleShowreelClick}
          aria-label="View Cinematography Showreel in Featured Work"
          className="block relative z-10 border px-2.5 py-1.5 sm:px-3.5 sm:py-2 md:px-4 md:py-2 bg-[#E6DDD2]/70 sm:bg-transparent overflow-hidden backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14100E]"
          style={{ borderColor: colors.lines, color: colors.text }}
          variants={{
            hover: { 
              rotate: 6, // Counteract the -6deg on the container
              backgroundColor: '#14100E',
              color: '#F4EDE4',
              transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } 
            }
          }}
        >
          <span className="font-mono text-[10px] sm:text-xs uppercase tracking-widest relative z-10">{showreel.text}</span>
          
          {/* Faint Star */}
          <motion.div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl sm:text-3xl md:text-4xl opacity-10 pointer-events-none"
            variants={{
              hover: { rotate: 90, opacity: 0.2, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }
            }}
            aria-hidden="true"
          >
            ✦
          </motion.div>
        </motion.a>
        
        {/* Line and arrow */}
        <div className="absolute -right-3 sm:-right-5 bottom-2 sm:bottom-4 w-[1px] h-12 sm:h-20 md:h-24 origin-top pointer-events-none" style={{ backgroundColor: colors.lines }} aria-hidden="true">
          <motion.div 
            className="absolute -bottom-1 -right-1 text-[10px] sm:text-xs"
            style={{ color: colors.text }}
            variants={{
              hover: { x: 3, y: 3, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }
            }}
            aria-hidden="true"
          >
            ↘
          </motion.div>
        </div>
      </motion.div>

    </div>
  );
}
