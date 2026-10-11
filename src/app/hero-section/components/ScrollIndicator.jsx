'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useHero } from '../provider/HeroProvider';

export default function ScrollIndicator() {
  const { config } = useHero();
  const { colors } = config;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 2, duration: 1 }}
      className="absolute bottom-12 sm:bottom-8 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center pointer-events-auto cursor-pointer group"
      onClick={() => {
        window.scrollBy({ top: window.innerHeight, left: 0, behavior: 'smooth' });
      }}
      data-cursor="hover"
    >
      <span 
        className="text-[9px] uppercase tracking-[0.2em] mb-3 font-medium opacity-60 group-hover:opacity-100 transition-opacity"
        style={{ color: colors.text }}
      >
        Explore
      </span>
      
      {/* Animated Arrow */}
      <div 
        className="w-[1px] h-12 relative overflow-hidden flex items-center justify-center"
        style={{ backgroundColor: colors.lines }}
      >
        <motion.div
          className="absolute top-0 w-2 h-2 border-r border-b transform rotate-45"
          style={{ borderColor: colors.text }}
          animate={{ 
            y: [-10, 40, 40],
            opacity: [0, 1, 0]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>
    </motion.div>
  );
}
