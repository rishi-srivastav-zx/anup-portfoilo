'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useHero } from '../provider/HeroProvider';

export default function HeroText() {
  const { config, mousePosition } = useHero();
  const { content: { heroName } } = config;
  const shouldReduceMotion = useReducedMotion();

  // Parallax opposite to portrait
  const textX = shouldReduceMotion ? 0 : mousePosition.x * -16;
  const textY = shouldReduceMotion ? 0 : mousePosition.y * -16;

  const containerVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.08, delayChildren: 0.3 }
    },
    hover: {
      transition: { staggerChildren: 0.03 }
    }
  };

  const wordLeftVariants = {
    hidden: { opacity: 0, x: shouldReduceMotion ? 0 : -60 },
    visible: { 
      opacity: 1, 
      x: 0, 
      transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] } 
    },
  };
  
  const wordRightVariants = {
    hidden: { opacity: 0, x: shouldReduceMotion ? 0 : 60 },
    visible: { 
      opacity: 1, 
      x: 0, 
      transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] } 
    },
  };

  const letterHoverVariants = {
    hidden: { filter: shouldReduceMotion ? 'none' : 'blur(20px)' },
    visible: { filter: 'blur(0px)', transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } },
    hover: { y: shouldReduceMotion ? 0 : -6, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .hero-name-container {
          position: absolute;
          left: 0;
          right: 0;
          top: 52%;
          transform: translateY(-50%);
          padding: 0 clamp(16px, 4vw, 80px);
          z-index: 1;
        }
        .hero-title-grid {
          --name-gap: 32vw;
          display: grid;
          grid-template-columns: 1fr var(--name-gap) 1fr;
          font-size: clamp(56px, 10vw, 190px);
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 0.9;
          white-space: nowrap;
          color: #14100E;
          opacity: 1;
        }
        .word-left {
          grid-column: 1;
          justify-self: end;
        }
        .word-right {
          grid-column: 3;
          justify-self: start;
          position: relative;
          top: clamp(-54px, -3.8vw, -18px);
        }
        @media (max-width: 1024px) {
          .hero-name-container {
            top: 50%;
            padding: 0 clamp(16px, 3vw, 40px);
          }
          .hero-title-grid {
            --name-gap: clamp(210px, 30vw, 300px);
            font-size: clamp(34px, 5.6vw, 64px);
          }
          .word-right {
            top: clamp(-24px, -2.5vw, -12px);
          }
        }
        @media (max-width: 639px) {
          .hero-name-container {
            display: none !important;
          }
        }
      `}} />
      
      <div className="hero-name-container pointer-events-auto hidden sm:flex justify-center">
        <motion.div
          animate={{ x: textX, y: textY }}
          transition={{ type: "spring", stiffness: 40, damping: 20 }}
          className="w-full"
        >
          <motion.h1
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            className="hero-title-grid w-full m-0 p-0"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            {/* First Name */}
            <motion.span variants={wordLeftVariants} className="word-left flex">
              {heroName.first.split('').map((char, index) => (
                <motion.span key={`first-${index}`} variants={letterHoverVariants} className="inline-block">
                  {char}
                </motion.span>
              ))}
            </motion.span>
            
            {/* Last Name */}
            <motion.span variants={wordRightVariants} className="word-right flex">
              {heroName.last.split('').map((char, index) => (
                <motion.span key={`last-${index}`} variants={letterHoverVariants} className="inline-block">
                  {char}
                </motion.span>
              ))}
            </motion.span>
          </motion.h1>
        </motion.div>
      </div>
    </>
  );
}
