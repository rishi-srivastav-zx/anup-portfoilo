'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

const HeroContext = createContext({});

export const HeroProvider = ({ children, config }) => {
  const [mousePosition, setMousePosition] = useState({ 
    x: 0, 
    y: 0, 
    clientX: 0, 
    clientY: 0,
    isHoveringPortrait: false 
  });

  useEffect(() => {
    // Completely bypass mouse position parallax tracking on touch-only devices
    if (typeof window !== 'undefined' && window.matchMedia('(hover: none) and (pointer: coarse)').matches) {
      return;
    }

    let rafId = null;
    let latestE = null;
    let lastX = 0;
    let lastY = 0;

    const onTick = () => {
      if (!latestE) return;
      // Normalize mouse position between -1 and 1 for parallax
      const x = (latestE.clientX / window.innerWidth) * 2 - 1;
      const y = (latestE.clientY / window.innerHeight) * 2 - 1;
      
      // Deadband check: only trigger React update if motion is perceptible (> 0.008)
      if (Math.abs(x - lastX) > 0.008 || Math.abs(y - lastY) > 0.008) {
        lastX = x;
        lastY = y;
        setMousePosition(prev => ({ 
          ...prev, 
          x, 
          y, 
          clientX: latestE.clientX, 
          clientY: latestE.clientY 
        }));
      }
      rafId = null;
    };

    const handleMouseMove = (e) => {
      latestE = e;
      if (!rafId) {
        rafId = requestAnimationFrame(onTick);
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  const setHoveringPortrait = (isHovering) => {
    setMousePosition(prev => {
      if (prev.isHoveringPortrait === isHovering) return prev;
      return { ...prev, isHoveringPortrait: isHovering };
    });
  };

  return (
    <HeroContext.Provider value={{ config, mousePosition, setHoveringPortrait }}>
      {children}
    </HeroContext.Provider>
  );
};

export const useHero = () => useContext(HeroContext);
