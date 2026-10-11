'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'Work', href: '#work' },
  { label: 'Showreel', href: '#showreel' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
];

export default function BottomNav() {
  const [activeItem, setActiveItem] = useState(navLinks[0].href);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // Hide on scroll down, show on scroll up
    const handleScroll = () => {
      if (typeof window !== 'undefined') {
        const currentScrollY = window.scrollY;
        
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
          setIsVisible(false); // scrolling down
        } else {
          setIsVisible(true);  // scrolling up
        }
        
        setLastScrollY(currentScrollY);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Intersection observer could be added here to update activeItem based on scroll
  
  if (!isMounted) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ 
            type: "spring", 
            stiffness: 260, 
            damping: 20, 
            delay: isMounted && !lastScrollY ? 1.2 : 0 // Delay only on initial load
          }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-full max-w-[calc(100%-32px)] sm:w-auto"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          <motion.nav 
            aria-label="Primary"
            className="flex items-center p-1.5 sm:p-2 bg-[#F4EDE4] overflow-x-auto overflow-y-hidden rounded-full"
            style={{
              border: '2px solid #14100E',
              boxShadow: '8px 8px 0 #14100E',
              msOverflowStyle: 'none',
              scrollbarWidth: 'none',
            }}
            whileHover={{ boxShadow: '10px 10px 0 #14100E' }}
            whileTap={{ 
              boxShadow: '3px 3px 0 #14100E', 
              x: 2, 
              y: 2,
              transition: { duration: 0.1 }
            }}
          >
            <style dangerouslySetInnerHTML={{__html: `
              nav::-webkit-scrollbar { display: none; }
            `}} />
            
            {navLinks.map((link) => {
              const isActive = activeItem === link.href;
              
              return (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveItem(link.href);
                    // Smooth scroll to section logic would go here
                  }}
                  className="relative px-4 py-2 mx-0.5 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[#14100E] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F4EDE4] flex-shrink-0 group"
                  aria-current={isActive ? 'page' : undefined}
                >
                  {/* Active background pill */}
                  {isActive && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-[#14100E] rounded-full"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  
                  {/* Text label */}
                  <motion.span
                    className="relative z-10 font-sans uppercase tracking-[0.08em]"
                    style={{ 
                      fontSize: 'clamp(11px, 2vw, 13px)',
                      fontWeight: 500,
                      color: isActive ? '#F4EDE4' : '#14100E'
                    }}
                    whileHover={!isActive ? { y: -2 } : {}}
                  >
                    {link.label}
                    
                    {/* Hover underline for inactive items */}
                    {!isActive && (
                      <motion.span 
                        className="absolute bottom-0 left-0 w-full h-[1px] bg-[#14100E] origin-left"
                        initial={{ scaleX: 0 }}
                        variants={{ hover: { scaleX: 1 } }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      />
                    )}
                  </motion.span>
                </a>
              );
            })}
          </motion.nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
