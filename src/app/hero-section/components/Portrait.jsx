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
    <div className="absolute inset-0 z-20 flex justify-center items-end pointer-events-none">
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
        className="relative w-full max-w-[80vw] md:max-w-[50vw] h-[92%] pointer-events-auto"
        style={{ cursor: 'none' }} // Custom cursor logic can be added here or via global styles
      >
        <Image
          src={images.portrait}
          alt="Anup Rawat"
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          style={{ 
            objectFit: 'contain', 
            objectPosition: 'bottom center',
            filter: 'sepia(0.2) grayscale(0.1)'
          }}
        />
      </motion.div>
    </div>
  );
}
