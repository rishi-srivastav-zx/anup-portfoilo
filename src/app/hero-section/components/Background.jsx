'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useHero } from '../provider/HeroProvider';

export default function Background() {
  const { config, mousePosition } = useHero();
  const { colors } = config;

  const circleX = mousePosition.x * -4;
  const circleY = mousePosition.y * -4;

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none" style={{ background: `linear-gradient(to bottom right, ${colors.backgroundStart}, ${colors.backgroundEnd})` }}>
      {/* Light streaks */}
      <motion.div 
        animate={{ 
          x: [0, -10, 0], 
          opacity: [0.2, 0.3, 0.2] 
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-0 right-0 w-full h-full opacity-30"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0) 30%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0) 70%)',
          filter: 'blur(50px)',
          transform: 'scale(1.5)'
        }}
      />
      
      {/* Center circle */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: [1, 1.03, 1], opacity: 1, x: circleX, y: circleY }}
        transition={{ 
          opacity: { duration: 1.5 },
          scale: { duration: 6, repeat: Infinity, ease: "easeInOut" },
          x: { type: "spring", stiffness: 50, damping: 20 },
          y: { type: "spring", stiffness: 50, damping: 20 }
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ 
          width: 'clamp(300px, 45vw, 650px)', 
          height: 'clamp(300px, 45vw, 650px)',
          backgroundColor: colors.circle 
        }}
      />

      {/* Leaf Shadow */}
      <motion.div
        animate={{ 
          rotate: [0, 2, -1, 0],
          scale: [1, 1.02, 1]
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-20 -left-20 w-[400px] h-[400px] opacity-10"
        style={{
          backgroundImage: 'radial-gradient(ellipse at center, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 70%)',
          filter: 'blur(60px)',
          borderRadius: '50% 50% 50% 0'
        }}
      />
    </div>
  );
}
