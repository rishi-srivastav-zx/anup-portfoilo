'use client';

import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export default function ScrollHint({ label = "Go on, scroll down", targetId = "work" }) {
  const [isVisible, setIsVisible] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    setIsMounted(true);
    
    const handleScroll = () => {
      if (typeof window !== 'undefined') {
        if (window.scrollY > 80) {
          setIsVisible(false);
        } else {
          setIsVisible(true);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleClick = () => {
    if (typeof document !== 'undefined') {
      const target = document.getElementById(targetId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      } else {
        // Fallback if target doesn't exist yet
        window.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
      }
    }
  };

  if (!isMounted) return null;

  const arrowDraw = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: { 
      pathLength: 1, 
      opacity: 1,
      transition: { pathLength: { delay: 1.6, type: "spring", duration: 1.5, bounce: 0 }, opacity: { delay: 1.6, duration: 0.1 } }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 12 }}
      animate={{ 
        opacity: isVisible ? 1 : 0, 
        scale: isVisible ? 1 : 0.95,
        y: isVisible ? 0 : 12
      }}
      transition={{ 
        opacity: { duration: 0.4, delay: isVisible && isMounted ? 1.6 : 0 },
        scale: { type: "spring", stiffness: 300, damping: 20, delay: isVisible && isMounted ? 1.6 : 0 },
        y: { duration: 0.4 }
      }}
      style={{ 
        pointerEvents: isVisible ? 'auto' : 'none',
        bottom: 'max(14%, 100px)'
      }}
      className="absolute left-1/2 -translate-x-1/2 z-30 flex flex-col items-center"
    >
      <motion.button
        type="button"
        onClick={handleClick}
        aria-label="Scroll to next section"
        data-cursor="hover"
        className="group relative outline-none focus-visible:ring-2 focus-visible:ring-[#14100E] focus-visible:ring-offset-2 focus-visible:ring-offset-[#E6DDD2] flex flex-col items-center cursor-pointer bg-transparent border-0 p-0 m-0"
        whileHover={shouldReduceMotion ? {} : "hover"}
        whileTap={shouldReduceMotion ? {} : "press"}
      >
        {/* Sticker Box */}
        <motion.div
          initial={{ rotate: -2 }}
          variants={{
            hover: { rotate: 0, y: -2, boxShadow: '7px 7px 0 #14100E' },
            press: { rotate: 0, y: 3, x: 3, boxShadow: '2px 2px 0 #14100E' }
          }}
          className="bg-[#F4EDE4] text-[#14100E] px-3 py-1.5 sm:px-4 sm:py-2 flex items-center justify-center whitespace-nowrap"
          style={{
            border: '1.5px solid #14100E',
            boxShadow: '5px 5px 0 #14100E',
          }}
        >
          <span className="font-mono uppercase font-semibold" style={{ fontSize: 'clamp(10px, 1.5vw, 13px)', letterSpacing: '0.14em' }}>
            {label}
          </span>
        </motion.div>

        {/* Hand-drawn Arrow */}
        <div className="mt-3 relative w-6 h-10 sm:h-12 overflow-visible">
          <svg 
            width="24" 
            height="100%" 
            viewBox="0 0 24 48" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="absolute top-0 left-0 overflow-visible"
            aria-hidden="true"
          >
            <motion.path
              d="M12 2 C 14 15, 10 30, 12 44"
              stroke="#14100E"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="transparent"
              variants={shouldReduceMotion ? {} : arrowDraw}
              initial="hidden"
              animate="visible"
            />
            <motion.path
              d="M6 36 L12 45 L18 35"
              stroke="#14100E"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="transparent"
              variants={shouldReduceMotion ? {} : arrowDraw}
              initial="hidden"
              animate="visible"
            />
          </svg>
          
          {/* Bobbing animation wrapper for the arrow */}
          <motion.div 
            className="absolute inset-0"
            animate={shouldReduceMotion ? {} : { y: [0, 6, 0] }}
            transition={{ duration: 1.6, ease: "easeInOut", repeat: Infinity }}
            variants={{
              hover: { y: [0, 12, 0], transition: { duration: 0.8, ease: "easeInOut", repeat: Infinity } }
            }}
          />
        </div>
      </motion.button>
    </motion.div>
  );
}
