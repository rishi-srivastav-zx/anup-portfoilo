import React from 'react';
import { useTransit } from '../context/TransitContext';
import { TransitBackground } from './TransitBackground';
import { MetroDoorsOverlay } from './MetroDoorsOverlay';
import { TransitWorld } from './TransitWorld';
import { MetroTrain } from './MetroTrain';
import { PlatformSurface } from './PlatformSurface';
import { NavigationArrows } from './NavigationArrows';
import { CaseStudyView } from './CaseStudyView';

export const BestWorkSection: React.FC = () => {
  const { config, transitMapViewRef } = useTransit();
  const { theme } = config;

  return (
    <section
      id="vending"
      className="w-full relative h-[100vh] min-h-[750px] max-h-[1100px] overflow-hidden z-20 border-b-[2px] border-[#0B0B0B]"
      style={
        {
          '--beige': theme.beige,
          '--blue': theme.blue,
          '--navy': theme.navy,
          backgroundColor: 'var(--beige)',
          color: 'var(--navy)',
        } as React.CSSProperties
      }
    >
      {/* CREATIVE TRANSIT BACKGROUND (Includes Best Work Header & Route Map Board) */}
      <TransitBackground />

      {/* The Welcome Overlay */}
      <MetroDoorsOverlay />

      {/* TRANSIT IMMERSIVE WORLD */}
      <div
        id="transit-map-view"
        ref={transitMapViewRef}
        className="absolute top-0 bottom-0 -left-[3vw] w-[106vw] h-full z-20 overflow-hidden pointer-events-auto scale-[0.95] origin-bottom"
      >
        <TransitWorld />

        {/* THE PLATFORM AND TRAIN */}
        <div className="absolute bottom-0 left-0 w-full h-[35vh] z-[80] pointer-events-none flex flex-col justify-end overflow-visible">
          <MetroTrain />
          <PlatformSurface />
        </div>

        {/* Navigation Arrows (Brutalist Square) */}
        <NavigationArrows />
      </div>

      {/* CASE STUDY EXPANDED VIEW (Step Out Mode) */}
      <CaseStudyView />
    </section>
  );
};
