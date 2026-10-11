'use client';

import React from 'react';
import { HeroProvider } from './provider/HeroProvider';
import { heroConfig } from './config/hero.config';
import Navbar from './components/Navbar';
import Background from './components/Background';
import HeroText from './components/HeroText';
import Portrait from './components/Portrait';
import DetailsLeft from './components/DetailsLeft';
import DetailsRight from './components/DetailsRight';
import ScrollHint from '@/components/ScrollHint/ScrollHint';

export default function HeroSection() {
  return (
    <HeroProvider config={heroConfig}>
      <section 
        className="w-full h-[100svh] bg-[#E6DDD2] selection:bg-[#14100E] selection:text-[#F4EDE4] font-sans overflow-hidden relative grid"
        style={{ 
          color: heroConfig.colors.text,
          gridTemplateRows: 'auto 1fr',
          gridTemplateAreas: '"nav" "hero"'
        }}
      >
        <Background />
        
        <div style={{ gridArea: 'nav' }} className="relative z-50">
          <Navbar />
        </div>
        
        <div style={{ gridArea: 'hero' }} className="relative w-full h-full flex flex-col justify-end pb-6 sm:pb-12 px-6 md:px-12 pointer-events-none">
          <HeroText />
          <Portrait />
          
          <div className="absolute inset-0 pointer-events-none px-6 md:px-12 py-6 flex flex-col justify-between">
            {/* Top row under nav */}
            <div className="flex justify-between items-start w-full">
              <div className="hidden sm:block">
                {/* Desktop top left handled inside DetailsLeft now to keep structure, or we can leave it absolute there */}
              </div>
            </div>
          </div>
          
          <DetailsLeft />
          <DetailsRight />
          <ScrollHint />
          
          {/* Mobile bottom details */}
          <div className="sm:hidden z-40 pointer-events-auto flex flex-col space-y-4 mt-auto w-full relative pt-12">
             {heroConfig.content.careerSteps.map((step, idx) => (
               <div key={idx} className="flex flex-col">
                 <p className="text-[9px] uppercase tracking-wider mb-0.5" style={{ color: heroConfig.colors.secondary }}>{step.label}</p>
                 <div className="flex items-center space-x-2">
                   <div className="w-4 h-[1px]" style={{ backgroundColor: heroConfig.colors.lines }}></div>
                   <p className="text-xs font-medium tracking-wide" style={{ color: heroConfig.colors.text }}>{step.value}</p>
                 </div>
               </div>
             ))}
          </div>

        </div>
      </section>
    </HeroProvider>
  );
}