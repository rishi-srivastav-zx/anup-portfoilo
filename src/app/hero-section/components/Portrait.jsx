'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import { useHero } from '../provider/HeroProvider';

export default function Portrait() {
  const { config, mousePosition, setHoveringPortrait } = useHero();
  const { images } = config;
  const shouldReduceMotion = useReducedMotion();

  const portraitX = shouldReduceMotion ? 0 : mousePosition.x * 8;
  const portraitY = shouldReduceMotion ? 0 : mousePosition.y * 8;

  return (
    <div className="absolute inset-x-0 top-0 -bottom-8 sm:-bottom-14 md:-bottom-20 z-20 flex justify-center items-end pointer-events-none">
      <motion.div
        initial={{ y: shouldReduceMotion ? 0 : 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1, x: portraitX, y: portraitY }}
        whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
        onHoverStart={() => setHoveringPortrait(true)}
        onHoverEnd={() => setHoveringPortrait(false)}
        transition={{
          y: { duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 },
          opacity: { duration: 1.2, delay: 0.2 },
          scale: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
          x: { type: "spring", stiffness: 50, damping: 25 },
        }}
        className="relative w-full max-w-[95vw] sm:max-w-[80vw] md:max-w-[64vw] lg:max-w-[56vw] xl:max-w-[50vw] h-[95%] sm:h-full md:h-[102%] lg:h-[105%] pointer-events-auto"
        style={{ cursor: 'none' }} // Custom cursor logic can be added here or via global styles
      >
        <div 
          className="relative w-full h-full"
          style={{
            maskImage: 'linear-gradient(to bottom, black 0%, black 76%, rgba(0,0,0,0.7) 88%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 76%, rgba(0,0,0,0.7) 88%, transparent 100%)'
          }}
        >
          <Image
            src={images?.portrait || '/images/anup_portrait.png'}
            alt="Anup Rawat"
            fill
            priority
            sizes="(max-width: 750px) 90vw, 60vw"
            style={{ 
              objectFit: 'contain', 
              objectPosition: 'bottom center',
              filter: 'contrast(1.02)'
            }}
          />
        </div>

        {/* Soft natural vertical gradient overlay matching the warm beige background exactly */}
        <div 
          className="absolute inset-x-0 bottom-0 pointer-events-none h-24 sm:h-32 md:h-40"
          style={{
            background: 'linear-gradient(to bottom, rgba(230, 221, 210, 0) 0%, rgba(230, 221, 210, 0.35) 45%, rgba(230, 221, 210, 0.85) 80%, #E6DDD2 100%)'
          }}
        />
      </motion.div>
    </div>
  );
}
