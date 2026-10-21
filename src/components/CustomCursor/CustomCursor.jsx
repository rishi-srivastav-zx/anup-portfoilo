'use client';

import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useVelocity, useReducedMotion } from 'framer-motion';

// Pointer hand SVG (👆 for buttons, arrows, links, clickable tools)
function PointerHandIcon({ className = "w-5 h-5" }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M10 2a1.5 1.5 0 0 0-1.5 1.5v9.42l-1.88-1.88a1.5 1.5 0 0 0-2.12 2.12l5.12 5.12A6.5 6.5 0 0 0 14.19 20h2.06A6.5 6.5 0 0 0 22.75 13.5V11a1.5 1.5 0 0 0-3 0v.5a.75.75 0 0 1-1.5 0V9a1.5 1.5 0 0 0-3 0v1a.75.75 0 0 1-1.5 0V7.5A1.5 1.5 0 0 0 12.25 6h-.01A1.5 1.5 0 0 0 10.75 7.5V11a.75.75 0 0 1-1.5 0V3.5A1.5 1.5 0 0 0 10 2z" />
    </svg>
  );
}

// Open hand SVG (✋ for draggable sketchbook, loupe, plates)
function OpenHandIcon({ className = "w-4 h-4" }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
      <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" />
      <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
      <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
    </svg>
  );
}

// Closed fist SVG (✊ for active dragging/flipping)
function ClosedHandIcon({ className = "w-4 h-4" }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M9 4.5A1.5 1.5 0 0 0 7.5 6v3.2a.75.75 0 0 1-1.5 0V7.5A1.5 1.5 0 0 0 4.5 6v5a7.5 7.5 0 0 0 7.5 7.5h2a7.5 7.5 0 0 0 7.5-7.5V9.5a1.5 1.5 0 0 0-3 0v.5a.75.75 0 0 1-1.5 0V8.5A1.5 1.5 0 0 0 15.5 7v.5a.75.75 0 0 1-1.5 0V6a1.5 1.5 0 0 0-3 0v1.5a.75.75 0 0 1-1.5 0V6A1.5 1.5 0 0 0 9 4.5z" />
    </svg>
  );
}

export default function CustomCursor() {
  const [mounted, setMounted] = useState(false);
  const [hoverType, setHoverType] = useState(null); // 'pointer', 'grab', 'link', 'view', 'input'
  const [hoverLabel, setHoverLabel] = useState(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 180, mass: 0.45 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);
  
  const velocityX = useVelocity(smoothX);
  const velocityY = useVelocity(smoothY);

  const stretchX = useTransform(velocityX, [-1000, 0, 1000], [1.2, 1, 1.2]);
  const stretchY = useTransform(velocityY, [-1000, 0, 1000], [1.2, 1, 1.2]);
  
  const rotation = useTransform(
    [velocityX, velocityY],
    ([vx, vy]) => {
      // Keep hand icons and badges upright
      if (hoverType) return 0;
      if (vx === 0 && vy === 0) return 0;
      return (Math.atan2(vy, vx) * 180) / Math.PI;
    }
  );

  const isVisibleRef = React.useRef(false);

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
      if (!isVisibleRef.current) {
        isVisibleRef.current = true;
        setIsVisible(true);
      }

      const target = e.target;
      if (!target || !target.closest) return;

      if (target.closest('[data-cursor="view"]')) {
        setHoverType('view');
        setHoverLabel('Showreel');
      } else if (target.closest('[data-cursor="grab"]')) {
        setHoverType('grab');
        setHoverLabel('DRAG');
      } else if (
        target.closest('a') || 
        target.closest('button') || 
        target.closest('[data-cursor="hover"]') ||
        target.closest('[data-cursor="pointer"]') ||
        target.closest('[role="button"]')
      ) {
        setHoverType('pointer');
        setHoverLabel(null);
      } else if (
        target.tagName && (
          target.tagName.toLowerCase() === 'input' || 
          target.tagName.toLowerCase() === 'textarea'
        )
      ) {
        setHoverType('input');
        setHoverLabel(null);
      } else {
        setHoverType(null);
        setHoverLabel(null);
      }
    };

    const handleCustomCursor = (e) => {
      const { clientX, clientY, hoverType: customHover, hoverLabel: customLabel, isDown, isLeave } = e.detail || {};
      if (isLeave) {
        isVisibleRef.current = false;
        setIsVisible(false);
        return;
      }
      if (typeof clientX === 'number' && typeof clientY === 'number') {
        mouseX.set(clientX);
        mouseY.set(clientY);
        if (!isVisibleRef.current) {
          isVisibleRef.current = true;
          setIsVisible(true);
        }
      }
      if (customHover !== undefined) {
        setHoverType(customHover);
      }
      if (customLabel !== undefined) {
        setHoverLabel(customLabel);
      }
      if (typeof isDown === 'boolean') {
        setIsMouseDown(isDown);
      }
    };

    const handleMouseDown = () => setIsMouseDown(true);
    const handleMouseUp = () => setIsMouseDown(false);
    const handleMouseLeave = (e) => {
      // Don't hide if moving into an iframe or still within window bounds
      if (e?.relatedTarget?.tagName === 'IFRAME') return;
      if (e?.clientX > 0 && e?.clientX < window.innerWidth && e?.clientY > 0 && e?.clientY < window.innerHeight) return;
      isVisibleRef.current = false;
      setIsVisible(false);
    };
    const handleMouseEnter = () => {
      isVisibleRef.current = true;
      setIsVisible(true);
    };

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('custom-cursor-move', handleCustomCursor);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      document.body.style.cursor = 'auto';
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('custom-cursor-move', handleCustomCursor);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [mouseX, mouseY, hoverType]);

  if (!mounted || shouldReduceMotion) return null;
  if (typeof window !== 'undefined' && window.matchMedia('(hover: none) and (pointer: coarse)').matches) return null;

  // Variants for the outer cursor element
  const ringVariants = {
    default: {
      width: 36,
      height: 36,
      backgroundColor: 'rgba(20, 16, 14, 0)',
      border: '1.5px solid #14100E',
      borderRadius: '50%',
      scale: isMouseDown ? 0.8 : 1,
      padding: '0px',
    },
    pointer: {
      width: 44,
      height: 44,
      backgroundColor: '#14100E',
      border: '1.5px solid rgba(244, 237, 228, 0.35)',
      borderRadius: '50%',
      scale: isMouseDown ? 0.85 : 1,
      padding: '0px',
    },
    link: {
      width: 44,
      height: 44,
      backgroundColor: '#14100E',
      border: '1.5px solid rgba(244, 237, 228, 0.35)',
      borderRadius: '50%',
      scale: isMouseDown ? 0.85 : 1,
      padding: '0px',
    },
    grab: {
      width: 'auto',
      minWidth: 48,
      height: 38,
      backgroundColor: '#14100E',
      border: '1.5px solid rgba(244, 237, 228, 0.35)',
      borderRadius: '20px',
      scale: isMouseDown ? 0.92 : 1,
      padding: '0 12px',
    },
    view: {
      width: 84,
      height: 84,
      backgroundColor: '#14100E',
      border: '0px solid #14100E',
      borderRadius: '50%',
      scale: isMouseDown ? 0.8 : 1,
      padding: '0px',
    },
    input: {
      width: 2,
      height: 24,
      backgroundColor: '#14100E',
      border: '0px solid #14100E',
      borderRadius: '0%',
      scale: 1,
      padding: '0px',
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]" style={{ opacity: isVisible ? 1 : 0, transition: 'opacity 0.25s ease' }}>
      <motion.div
        className="absolute top-0 left-0 flex items-center justify-center -translate-x-1/2 -translate-y-1/2"
        style={{
          x: smoothX,
          y: smoothY,
          scaleX: hoverType ? 1 : stretchX,
          scaleY: hoverType ? 1 : stretchY,
          rotate: rotation,
        }}
      >
        <motion.div
          variants={ringVariants}
          animate={hoverType || 'default'}
          transition={{ type: 'spring', stiffness: 350, damping: 26 }}
          className="flex items-center justify-center overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.22)]"
        >
          {/* Pointer Hand (👆) for clickable items */}
          {(hoverType === 'pointer' || hoverType === 'link') && (
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: isMouseDown ? 0.85 : 1, opacity: 1 }}
              transition={{ duration: 0.15 }}
              className="text-[#F4EDE4] flex items-center justify-center"
            >
              <PointerHandIcon className="w-5 h-5 drop-shadow-sm" />
            </motion.div>
          )}

          {/* Grab / Drag Hand (✋/✊) for draggable elements */}
          {hoverType === 'grab' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-1.5 text-[#F4EDE4] whitespace-nowrap"
            >
              {isMouseDown ? (
                <ClosedHandIcon className="w-4 h-4 text-[#F4EDE4] shrink-0" />
              ) : (
                <OpenHandIcon className="w-4 h-4 text-[#F4EDE4] shrink-0" />
              )}
              {hoverLabel && (
                <span className="text-[9.5px] uppercase tracking-widest font-mono font-medium pl-0.5">
                  {isMouseDown ? (hoverLabel.includes('FLIP') ? 'FLIPPING' : 'DRAGGING') : hoverLabel}
                </span>
              )}
            </motion.div>
          )}

          {/* View / Showreel badge */}
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

      {/* Center dot (only visible in default ring state) */}
      <motion.div
        className="absolute top-0 left-0 w-1.5 h-1.5 bg-[#14100E] rounded-full -translate-x-1/2 -translate-y-1/2"
        style={{ x: mouseX, y: mouseY }}
        animate={{ opacity: (hoverType === null && !isMouseDown) ? 1 : 0 }}
        transition={{ duration: 0.15 }}
      />
    </div>
  );
}
