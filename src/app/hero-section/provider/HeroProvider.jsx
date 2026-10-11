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
    const handleMouseMove = (e) => {
      // Normalize mouse position between -1 and 1 for parallax
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setMousePosition(prev => ({ 
        ...prev, 
        x, 
        y, 
        clientX: e.clientX, 
        clientY: e.clientY 
      }));
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const setHoveringPortrait = (isHovering) => {
    setMousePosition(prev => ({ ...prev, isHoveringPortrait: isHovering }));
  };

  return (
    <HeroContext.Provider value={{ config, mousePosition, setHoveringPortrait }}>
      {children}
    </HeroContext.Provider>
  );
};

export const useHero = () => useContext(HeroContext);
