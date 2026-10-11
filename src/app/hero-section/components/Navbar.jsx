'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useHero } from '../provider/HeroProvider';

export default function Navbar() {
  const { config } = useHero();
  const { content: { navbar }, colors } = config;

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
      className="w-full flex justify-between items-center px-6 md:px-12 py-5 font-sans"
      style={{ color: colors.text }}
    >
      {/* Left */}
      <div className="flex items-center space-x-6">
        <div className="flex items-center text-lg" style={{ letterSpacing: '0.08em' }}>
          <span className="font-light">{navbar.firstName}</span>
          <span className="font-semibold ml-1.5">{navbar.lastName}</span>
        </div>
        <motion.div 
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.8 }}
          className="hidden md:block w-32 h-[1px] origin-left"
          style={{ backgroundColor: colors.lines }}
        />
      </div>

      {/* Right */}
      <div className="hidden md:flex space-x-8 text-sm" style={{ letterSpacing: '0.08em' }}>
        {navbar.links.map((link, idx) => (
          <motion.a
            key={idx}
            href={link.href}
            className="relative group py-1 flex items-center"
            whileHover="hover"
          >
            <span>{link.label.replace('→', '').trim()}</span>
            {link.label.includes('→') && (
              <motion.span 
                className="ml-1 inline-block"
                variants={{
                  hover: { x: 4, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } }
                }}
              >
                →
              </motion.span>
            )}
            <motion.span 
              className="absolute bottom-0 left-0 w-full h-[1px] origin-left"
              style={{ backgroundColor: colors.text }}
              variants={{
                hover: { scaleX: 1, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }
              }}
              initial={{ scaleX: 0 }}
            />
          </motion.a>
        ))}
      </div>

      {/* Mobile Hamburger */}
      <div className="md:hidden flex flex-col space-y-1.5 cursor-pointer">
        <span className="w-6 h-[1px] block" style={{ backgroundColor: colors.text }}></span>
        <span className="w-6 h-[1px] block" style={{ backgroundColor: colors.text }}></span>
      </div>

      {/* Bottom Border */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
        className="absolute bottom-0 left-0 w-full h-[1px] origin-left"
        style={{ backgroundColor: colors.lines, opacity: 0.3 }}
      />
    </motion.nav>
  );
}
