'use client';

import React, { useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useVelocity, useReducedMotion } from 'framer-motion';
import { useHero } from '../provider/HeroProvider';

export default function CustomCursor() {
  const { mousePosition } = useHero();
  const shouldReduceMotion = useReducedMotion();
  
  // Motion values for exact position
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // Springs for smooth follow (lerp/inertia)
  const springConfig = { damping: 25, stiffness: 120, mass: 0.5 };
  const smoothX = useSpring(cursorX, springConfig);
  const smoothY = useSpring(cursorY, springConfig);

  // Velocity for stretching effect
  const velocityX = useVelocity(smoothX);
  const velocityY = useVelocity(smoothY);

  // Stretch based on velocity (cinematic motion blur simulation)
  const scaleX = useTransform(velocityX, [-1000, 0, 1000], [1.2, 1, 1.2]);
  const scaleY = useTransform(velocityY, [-1000, 0, 1000], [1.2, 1, 1.2]);
  const rotation = useTransform(
    [velocityX, velocityY],
    ([vx, vy]) => {
      if (vx === 0 && vy === 0) return 0;
      return (Math.atan2(vy, vx) * 180) / Math.PI;
    }
  );

  useEffect(() => {
    // Only run on desktop, avoid tracking on touch devices
    if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) return;

    const moveCursor = (e) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    window.addEventListener('mousemove', moveCursor);
    return () => window.removeEventListener('mousemove', moveCursor);
  }, [cursorX, cursorY]);

  if (shouldReduceMotion) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] hidden sm:block overflow-hidden">
      {/* 
        SVG Noise Filter for the cinematic film-grain look 
        Applied to the cursor glow 
      */}
      <svg className="hidden">
        <filter id="cinematicNoise">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch"/>
          <feColorMatrix type="matrix" values="1 0 0 0 0, 0 1 0 0 0, 0 0 1 0 0, 0 0 0 0.1 0" />
        </filter>
      </svg>

      <motion.div
        className="absolute top-0 left-0 w-64 h-64 -mt-32 -ml-32 rounded-full pointer-events-none mix-blend-screen"
        style={{
          x: smoothX,
          y: smoothY,
          scaleX,
          scaleY,
          rotate: rotation,
          background: 'radial-gradient(circle at center, rgba(140, 180, 255, 0.12) 0%, rgba(200, 220, 255, 0.04) 30%, transparent 70%)',
          filter: mousePosition.isHoveringPortrait ? 'blur(10px) brightness(1.2)' : 'blur(15px)',
          transition: 'filter 0.3s ease-out'
        }}
      >
        {/* Inner intense light core */}
        <div 
          className="absolute inset-0 rounded-full opacity-60" 
          style={{
            background: 'radial-gradient(circle at center, rgba(255, 255, 255, 0.3) 0%, transparent 20%)',
          }}
        />
        {/* Film grain texture applied to the glow */}
        <div 
          className="absolute inset-0 rounded-full opacity-30 mix-blend-overlay"
          style={{ filter: 'url(#cinematicNoise)' }}
        />
      </motion.div>
    </div>
  );
}
