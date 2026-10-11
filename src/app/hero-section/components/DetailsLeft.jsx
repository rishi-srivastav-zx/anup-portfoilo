'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useHero } from '../provider/HeroProvider';

export default function DetailsLeft() {
  const { config } = useHero();
  const { content: { topLeftBox, careerSteps }, colors } = config;
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="absolute left-6 md:left-12 top-6 bottom-12 z-30 pointer-events-none flex flex-col justify-between hidden sm:flex">
      
      {/* Top Left Box */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, delay: 1, ease: [0.16, 1, 0.3, 1] }}
        className="relative px-4 py-3 pointer-events-auto group max-w-fit"
        style={{ color: colors.text }}
      >
        <motion.div 
          className="absolute top-0 left-0 w-3 h-3 border-t border-l" 
          style={{ borderColor: colors.lines }}
          variants={{
            hover: { top: -2, left: -2, transition: { duration: 0.3, ease: "easeOut" } }
          }}
          whileHover="hover"
          inherit={false}
        />
        <motion.div 
          className="absolute bottom-0 right-0 w-3 h-3 border-b border-r" 
          style={{ borderColor: colors.lines }}
          variants={{
            hover: { bottom: -2, right: -2, transition: { duration: 0.3, ease: "easeOut" } }
          }}
          whileHover="hover"
          inherit={false}
        />
        {/* Transparent overlay for hover detection */}
        <div className="absolute inset-0 cursor-default" />
        
        <p className="text-sm font-semibold tracking-wide uppercase relative z-10">{topLeftBox.line1}</p>
        <p className="text-xs mt-1 relative z-10" style={{ color: colors.secondary }}>{topLeftBox.line2}</p>
      </motion.div>

      {/* Bottom Left Items */}
      <div className="flex flex-col space-y-6 max-w-[22rem] mt-auto pb-4">
        {careerSteps.map((step, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 + idx * 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="group pointer-events-auto cursor-default flex flex-col"
            whileHover="hover"
          >
            <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: colors.secondary }}>{step.label}</p>
            <div className="flex items-center">
              <motion.div 
                className="h-[1px] mr-0" 
                style={{ backgroundColor: colors.lines }}
                variants={{
                  hover: { width: 40, marginRight: 12, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }
                }}
                initial={{ width: 16, marginRight: 8 }}
              />
              <motion.p 
                className="text-sm font-medium tracking-wide"
                style={{ color: colors.text }}
                variants={{
                  hover: { x: 6, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }
                }}
              >
                {step.value}
              </motion.p>
            </div>
          </motion.div>
        ))}
      </div>

    </div>
  );
}
