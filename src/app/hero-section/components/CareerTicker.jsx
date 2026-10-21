'use client';

import React from 'react';
import { useHero } from '../provider/HeroProvider';

export default function CareerTicker() {
  const { config } = useHero();
  const { content: { careerSteps }, colors } = config;

  if (!careerSteps || careerSteps.length === 0) return null;

  // Render sequence of items:
  // STARTED AS — Cinematographer Trainee  •  BECAME — Focus Puller  •  CURRENTLY — Cinematographer  •  
  const renderItemSequence = (keyPrefix) => (
    <div key={keyPrefix} className="flex items-center shrink-0 space-x-3 pr-3">
      {careerSteps.map((step, idx) => (
        <React.Fragment key={`${keyPrefix}-${idx}`}>
          <div className="flex items-center space-x-1.5 whitespace-nowrap">
            <span 
              className="text-[9.5px] font-sans font-semibold uppercase tracking-[0.12em]"
              style={{ color: colors.secondary }}
            >
              {step.label}
            </span>
            <span 
              className="text-[10px] font-sans font-medium"
              style={{ color: colors.lines, opacity: 0.7 }}
            >
              —
            </span>
            <span 
              className="text-[10.5px] font-sans font-semibold tracking-wide"
              style={{ color: colors.text }}
            >
              {step.value}
            </span>
          </div>
          {/* Separator dot */}
          <span 
            className="text-[10px] font-bold select-none px-1"
            style={{ color: colors.lines, opacity: 0.5 }}
          >
            •
          </span>
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes ticker-slide {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-50%, 0, 0);
          }
        }
        .career-ticker-track {
          display: flex;
          width: max-content;
          animation: ticker-slide 20s linear infinite;
          will-change: transform;
        }
        .career-ticker-container:hover .career-ticker-track,
        .career-ticker-container:active .career-ticker-track {
          animation-play-state: paused;
        }
        @media (prefers-reduced-motion: reduce) {
          .career-ticker-track {
            animation: none !important;
            transform: none !important;
            width: 100%;
            justify-content: center;
            flex-wrap: wrap;
          }
        }
      `}} />
      <div 
        className="career-ticker-container sm:hidden absolute left-0 right-0 bottom-[74px] z-30 pointer-events-auto py-1.5 overflow-hidden border-y border-[#14100E]/10 bg-[#E6DDD2]/80 backdrop-blur-[2px]"
        style={{
          maskImage: 'linear-gradient(to right, transparent 0%, black 7%, black 93%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 7%, black 93%, transparent 100%)',
        }}
        title="Career Milestones (hover to pause)"
        aria-label="Career Milestones"
      >
        <div className="career-ticker-track">
          {renderItemSequence('seq1')}
          {renderItemSequence('seq2')}
        </div>
      </div>
    </>
  );
}
