'use client';

import React, { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';
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

/**
 * Checks whether an element or its nearest visible container has a dark background
 * by traversing up ancestors and checking attributes, classes, and computed color luminance.
 */
function isDarkBackground(element) {
  if (!element || typeof window === 'undefined') return false;

  let curr = element;
  let depth = 0;

  while (curr && curr !== document.documentElement && curr !== document.body && depth < 10) {
    depth++;

    // 1. Explicit data attributes
    if (curr.dataset) {
      if (
        curr.dataset.theme === 'dark' ||
        curr.dataset.theme === 'dark-section' ||
        curr.dataset.cursorDark === 'true' ||
        curr.dataset.cursorTheme === 'dark'
      ) {
        return true;
      }
      if (curr.dataset.theme === 'light' || curr.dataset.cursorDark === 'false') {
        return false;
      }
    }

    // 2. Common dark classes and video / dark media tags
    if (curr.tagName === 'VIDEO') return true;

    if (curr.classList) {
      if (
        curr.classList.contains('dark') ||
        curr.classList.contains('bg-black') ||
        curr.classList.contains('bg-ink') ||
        curr.classList.contains('bg-panel') ||
        curr.classList.contains('bg-zinc-900') ||
        curr.classList.contains('bg-zinc-950') ||
        curr.classList.contains('bg-neutral-900') ||
        curr.classList.contains('bg-neutral-950')
      ) {
        return true;
      }
    }

    // 3. Computed background color luminance calculation
    try {
      const style = window.getComputedStyle(curr);
      const bg = style.backgroundColor;
      if (bg && bg !== 'transparent' && bg !== 'rgba(0, 0, 0, 0)') {
        const rgb = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
        if (rgb) {
          const alpha = rgb[4] !== undefined ? parseFloat(rgb[4]) : 1;
          if (alpha > 0.25) {
            const r = parseInt(rgb[1], 10);
            const g = parseInt(rgb[2], 10);
            const b = parseInt(rgb[3], 10);
            // Perceived brightness (ITU-R BT.601)
            const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
            return luminance < 135; // Luminance < 135 qualifies as dark
          }
        }
      }
    } catch {
      // Ignore security or frame errors
    }

    curr = curr.parentElement;
  }

  // Check document.body computed background
  try {
    const bodyBg = window.getComputedStyle(document.body).backgroundColor;
    if (bodyBg && bodyBg !== 'transparent' && bodyBg !== 'rgba(0, 0, 0, 0)') {
      const rgb = bodyBg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
      if (rgb) {
        const r = parseInt(rgb[1], 10);
        const g = parseInt(rgb[2], 10);
        const b = parseInt(rgb[3], 10);
        return (0.299 * r + 0.587 * g + 0.114 * b) < 135;
      }
    }
  } catch {}

  return false;
}

export default function CustomCursor() {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard');

  const [mounted, setMounted] = useState(false);
  const [hoverType, setHoverType] = useState(null); // 'pointer', 'grab', 'link', 'view', 'input'
  const [hoverLabel, setHoverLabel] = useState(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isDark, setIsDark] = useState(false);
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

  const isVisibleRef = useRef(false);
  const hoverTypeRef = useRef(hoverType);
  const hoverLabelRef = useRef(hoverLabel);
  const isDarkRef = useRef(false);
  const lastTargetRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    
    // Check if device is purely a touch device with no mouse/hover
    if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) {
      document.body.style.cursor = 'auto';
      return;
    }

    // Never hide cursor in dashboard
    if (isDashboard) {
      document.body.style.cursor = 'auto';
      return;
    }
    
    // Hide default OS cursor so custom cursor takes over
    document.body.style.cursor = 'none';

    const updateHoverState = (nextType, nextLabel) => {
      if (hoverTypeRef.current !== nextType) {
        hoverTypeRef.current = nextType;
        setHoverType(nextType);
      }
      if (hoverLabelRef.current !== nextLabel) {
        hoverLabelRef.current = nextLabel;
        setHoverLabel(nextLabel);
      }
    };

    const updateDarkMode = (target) => {
      const dark = isDarkBackground(target);
      if (isDarkRef.current !== dark) {
        isDarkRef.current = dark;
        setIsDark(dark);
      }
    };

    const moveCursor = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isVisibleRef.current) {
        isVisibleRef.current = true;
        setIsVisible(true);
      }

      const target = e.target;
      if (!target || !target.closest) return;

      // Skip expensive DOM traversal if target element hasn't changed
      if (target === lastTargetRef.current) return;
      lastTargetRef.current = target;

      updateDarkMode(target);

      let nextType = null;
      let nextLabel = null;

      if (target.closest('[data-cursor="view"]')) {
        nextType = 'view';
        nextLabel = 'Showreel';
      } else if (target.closest('[data-cursor="grab"]')) {
        nextType = 'grab';
        nextLabel = 'DRAG';
      } else if (
        target.closest('a') || 
        target.closest('button') || 
        target.closest('[data-cursor="hover"]') ||
        target.closest('[data-cursor="pointer"]') ||
        target.closest('[role="button"]')
      ) {
        nextType = 'pointer';
      } else if (
        target.tagName && (
          target.tagName.toLowerCase() === 'input' || 
          target.tagName.toLowerCase() === 'textarea'
        )
      ) {
        nextType = 'input';
      }

      updateHoverState(nextType, nextLabel);
    };

    // When scrolling with mouse fixed, re-evaluate target element and dark section status
    let scrollRaf = null;
    const handleScroll = () => {
      if (scrollRaf) return;
      scrollRaf = requestAnimationFrame(() => {
        scrollRaf = null;
        const x = mouseX.get();
        const y = mouseY.get();
        if (x >= 0 && y >= 0 && x <= window.innerWidth && y <= window.innerHeight) {
          const el = document.elementFromPoint(x, y);
          if (el && el !== lastTargetRef.current) {
            lastTargetRef.current = el;
            updateDarkMode(el);
          }
        }
      });
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
        const el = document.elementFromPoint(clientX, clientY);
        if (el) updateDarkMode(el);
      }
      if (customHover !== undefined || customLabel !== undefined) {
        updateHoverState(
          customHover !== undefined ? customHover : hoverTypeRef.current,
          customLabel !== undefined ? customLabel : hoverLabelRef.current
        );
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
    window.addEventListener('pointermove', moveCursor, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true, capture: true });
    window.addEventListener('custom-cursor-move', handleCustomCursor);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      document.body.style.cursor = 'auto';
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('pointermove', moveCursor);
      window.removeEventListener('scroll', handleScroll, { capture: true });
      window.removeEventListener('custom-cursor-move', handleCustomCursor);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      if (scrollRaf) cancelAnimationFrame(scrollRaf);
    };
  }, [mouseX, mouseY, isDashboard]);

  if (!mounted || isDashboard) return null;
  if (typeof window !== 'undefined' && window.matchMedia('(hover: none) and (pointer: coarse)').matches) return null;

  // Variants for the outer cursor element with seamless dark/light section color adaptation
  const ringVariants = {
    default: {
      width: 36,
      minWidth: 36,
      height: 36,
      backgroundColor: 'rgba(20, 16, 14, 0)',
      border: isDark ? '1.5px solid #FFFFFF' : '1.5px solid #14100E',
      borderRadius: '50%',
      scale: isMouseDown ? 0.8 : 1,
      padding: '0px',
    },
    pointer: {
      width: 44,
      minWidth: 44,
      height: 44,
      backgroundColor: isDark ? '#FFFFFF' : '#14100E',
      border: isDark ? '1.5px solid rgba(20, 16, 14, 0.15)' : '1.5px solid rgba(244, 237, 228, 0.35)',
      borderRadius: '50%',
      scale: isMouseDown ? 0.85 : 1,
      padding: '0px',
    },
    link: {
      width: 44,
      minWidth: 44,
      height: 44,
      backgroundColor: isDark ? '#FFFFFF' : '#14100E',
      border: isDark ? '1.5px solid rgba(20, 16, 14, 0.15)' : '1.5px solid rgba(244, 237, 228, 0.35)',
      borderRadius: '50%',
      scale: isMouseDown ? 0.85 : 1,
      padding: '0px',
    },
    grab: {
      width: 'auto',
      minWidth: 48,
      height: 38,
      backgroundColor: isDark ? '#FFFFFF' : '#14100E',
      border: isDark ? '1.5px solid rgba(20, 16, 14, 0.15)' : '1.5px solid rgba(244, 237, 228, 0.35)',
      borderRadius: '20px',
      scale: isMouseDown ? 0.92 : 1,
      padding: '0 12px',
    },
    view: {
      width: 84,
      minWidth: 84,
      height: 84,
      backgroundColor: isDark ? '#FFFFFF' : '#14100E',
      border: isDark ? '0px solid #FFFFFF' : '0px solid #14100E',
      borderRadius: '50%',
      scale: isMouseDown ? 0.8 : 1,
      padding: '0px',
    },
    input: {
      width: 2,
      minWidth: 2,
      height: 24,
      backgroundColor: isDark ? '#FFFFFF' : '#14100E',
      border: '0px solid transparent',
      borderRadius: '0%',
      scale: 1,
      padding: '0px',
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ opacity: isVisible ? 1 : 0, transition: 'opacity 0.25s ease', zIndex: 2147483647 }}>
      <motion.div
        className="absolute top-0 left-0 flex items-center justify-center -translate-x-1/2 -translate-y-1/2"
        style={{
          x: smoothX,
          y: smoothY,
          scaleX: (hoverType || shouldReduceMotion) ? 1 : stretchX,
          scaleY: (hoverType || shouldReduceMotion) ? 1 : stretchY,
          rotate: (hoverType || shouldReduceMotion) ? 0 : rotation,
        }}
      >
        <motion.div
          variants={ringVariants}
          animate={hoverType || 'default'}
          transition={{ type: 'spring', stiffness: 350, damping: 26 }}
          className={`flex items-center justify-center overflow-hidden ${
            isDark
              ? 'shadow-[0_0_20px_rgba(255,255,255,0.35)]'
              : 'shadow-[0_4px_20px_rgba(0,0,0,0.22)]'
          } transition-shadow duration-200`}
        >
          {/* Pointer Hand (👆) for clickable items */}
          {(hoverType === 'pointer' || hoverType === 'link') && (
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: isMouseDown ? 0.85 : 1, opacity: 1 }}
              transition={{ duration: 0.15 }}
              className={`${isDark ? 'text-[#14100E]' : 'text-[#F4EDE4]'} flex items-center justify-center`}
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
              className={`flex items-center gap-1.5 ${isDark ? 'text-[#14100E]' : 'text-[#F4EDE4]'} whitespace-nowrap`}
            >
              {isMouseDown ? (
                <ClosedHandIcon className={`w-4 h-4 ${isDark ? 'text-[#14100E]' : 'text-[#F4EDE4]'} shrink-0`} />
              ) : (
                <OpenHandIcon className={`w-4 h-4 ${isDark ? 'text-[#14100E]' : 'text-[#F4EDE4]'} shrink-0`} />
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
              className={`${isDark ? 'text-[#14100E]' : 'text-[#F4EDE4]'} text-[9px] uppercase tracking-widest font-medium whitespace-nowrap font-sans`}
            >
              Showreel
            </motion.span>
          )}
        </motion.div>
      </motion.div>

      {/* Center dot (only visible in default ring state) */}
      <motion.div
        className="absolute top-0 left-0 w-1.5 h-1.5 rounded-full -translate-x-1/2 -translate-y-1/2"
        style={{ x: mouseX, y: mouseY }}
        animate={{
          opacity: (hoverType === null && !isMouseDown) ? 1 : 0,
          backgroundColor: isDark ? '#FFFFFF' : '#14100E',
        }}
        transition={{ duration: 0.15 }}
      />
    </div>
  );
}
