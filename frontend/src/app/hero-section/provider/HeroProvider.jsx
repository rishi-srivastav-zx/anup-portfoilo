'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';

const HeroConfigContext = createContext(null);
const HeroMotionContext = createContext(null);

const DEFAULT_MOUSE_POSITION = {
  x: 0,
  y: 0,
  clientX: 0,
  clientY: 0,
  isHoveringPortrait: false
};

export const HeroProvider = ({ children, config }) => {
  const [mousePosition, setMousePosition] = useState(DEFAULT_MOUSE_POSITION);

  useEffect(() => {
    // Completely bypass mouse position parallax tracking on touch-only or iOS devices
    const isTouchOnly =
      (typeof window !== 'undefined' && window.matchMedia('(hover: none) and (pointer: coarse)').matches) ||
      (typeof navigator !== 'undefined' && (
        /iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
      ));

    if (isTouchOnly) {
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

  const setHoveringPortrait = useCallback((isHovering) => {
    setMousePosition(prev => {
      if (prev.isHoveringPortrait === isHovering) return prev;
      return { ...prev, isHoveringPortrait: isHovering };
    });
  }, []);

  const configValue = useMemo(() => ({ config }), [config]);
  const motionValue = useMemo(() => ({ mousePosition, setHoveringPortrait }), [mousePosition, setHoveringPortrait]);

  return (
    <HeroConfigContext.Provider value={configValue}>
      <HeroMotionContext.Provider value={motionValue}>
        {children}
      </HeroMotionContext.Provider>
    </HeroConfigContext.Provider>
  );
};

export const useHeroConfig = () => {
  const ctx = useContext(HeroConfigContext);
  return ctx || { config: {} };
};

export const useHeroMotion = () => {
  const ctx = useContext(HeroMotionContext);
  return ctx || { mousePosition: DEFAULT_MOUSE_POSITION, setHoveringPortrait: () => {} };
};

export const useHero = () => {
  const configCtx = useContext(HeroConfigContext);
  const motionCtx = useContext(HeroMotionContext);
  return {
    config: configCtx?.config,
    mousePosition: motionCtx?.mousePosition || DEFAULT_MOUSE_POSITION,
    setHoveringPortrait: motionCtx?.setHoveringPortrait,
  };
};
