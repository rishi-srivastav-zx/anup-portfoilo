'use client';

import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useVelocity, useReducedMotion } from 'framer-motion';

export default function CustomCursor() {
  const [mounted, setMounted] = useState(false);
  const [hoverType, setHoverType] = useState(null); // 'link', 'view', 'input'
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 150, mass: 0.5 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);
  
  const velocityX = useVelocity(smoothX);
  const velocityY = useVelocity(smoothY);

  const stretchX = useTransform(velocityX, [-1000, 0, 1000], [1.25, 1, 1.25]);
  const stretchY = useTransform(velocityY, [-1000, 0, 1000], [1.25, 1, 1.25]);
  
  const rotation = useTransform(
    [velocityX, velocityY],
    ([vx, vy]) => {
      if (vx === 0 && vy === 0) return 0;
      return (Math.atan2(vy, vx) * 180) / Math.PI;
    }
  );

  useEffect(() => {
    setMounted(true);
    
    // Check if device supports hover
    if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) {
      return;
    }
    
    // Hide default cursor on body
    document.body.style.cursor = 'none';

    const moveCursor = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isVisible) setIsVisible(true);

      const target = e.target;
      if (target.closest('[data-cursor="view"]')) {
        setHoverType('view');
      } else if (
        target.closest('a') || 
        target.closest('button') || 
        target.closest('[data-cursor="hover"]')
      ) {
        setHoverType('link');
      } else if (
        target.tagName.toLowerCase() === 'input' || 
        target.tagName.toLowerCase() === 'textarea'
      ) {
        setHoverType('input');
      } else {
        setHoverType(null);
      }
    };

    const handleMouseDown = () => setIsMouseDown(true);
    const handleMouseUp = () => setIsMouseDown(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      document.body.style.cursor = 'auto';
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [mouseX, mouseY, isVisible]);

  if (!mounted || shouldReduceMotion) return null;
  if (typeof window !== 'undefined' && window.matchMedia('(hover: none) and (pointer: coarse)').matches) return null;

  // Variants for the outer ring
  const ringVariants = {
    default: {
      width: 36,
      height: 36,
      backgroundColor: 'rgba(20, 16, 14, 0)',
      border: '1.5px solid #14100E',
      borderRadius: '50%',
      scale: isMouseDown ? 0.8 : 1,
    },
    link: {
      width: 64,
      height: 64,
      backgroundColor: 'rgba(20, 16, 14, 0.1)',
      border: '0px solid #14100E',
      borderRadius: '50%',
      scale: isMouseDown ? 0.8 : 1,
    },
    view: {
      width: 84,
      height: 84,
      backgroundColor: 'rgba(20, 16, 14, 1)',
      border: '0px solid #14100E',
      borderRadius: '50%',
      scale: isMouseDown ? 0.8 : 1,
    },
    input: {
      width: 2,
      height: 24,
      backgroundColor: 'rgba(20, 16, 14, 1)',
      border: '0px solid #14100E',
      borderRadius: '0%',
      scale: 1,
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]" style={{ opacity: isVisible ? 1 : 0, transition: 'opacity 0.3s ease' }}>
      <motion.div
        className="absolute top-0 left-0 flex items-center justify-center -translate-x-1/2 -translate-y-1/2"
        style={{
          x: smoothX,
          y: smoothY,
          scaleX: stretchX,
          scaleY: stretchY,
          rotate: rotation,
        }}
      >
        <motion.div
          variants={ringVariants}
          animate={hoverType || 'default'}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="flex items-center justify-center overflow-hidden"
        >
          {hoverType === 'view' && (
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-[#F4EDE4] text-[9px] uppercase tracking-widest font-medium whitespace-nowrap font-sans"
            >
              Showreel
            </motion.span>
          )}
        </motion.div>
      </motion.div>

      {/* Center dot (only visible in default state) */}
      <motion.div
        className="absolute top-0 left-0 w-1.5 h-1.5 bg-[#14100E] rounded-full -translate-x-1/2 -translate-y-1/2"
        style={{ x: mouseX, y: mouseY }}
        animate={{ opacity: (hoverType === null && !isMouseDown) ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      />
    </div>
  );
}
