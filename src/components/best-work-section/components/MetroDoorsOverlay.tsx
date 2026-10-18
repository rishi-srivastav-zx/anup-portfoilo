import React from 'react';
import { useTransit } from '../context/TransitContext';

export const MetroDoorsOverlay: React.FC = () => {
  const {
    config,
    metroDoorsOverlayRef,
    metroDoorLeftRef,
    metroDoorRightRef,
    metroDoorTextRef,
    triggerMetroEntrance,
  } = useTransit();

  const { welcomeDoors } = config;

  return (
    <div
      id="metro-doors-overlay"
      ref={metroDoorsOverlayRef}
      className="absolute inset-0 z-[1000] w-full h-full pointer-events-auto overflow-hidden"
    >
      {/* Doors */}
      <div
        id="metro-door-left"
        ref={metroDoorLeftRef}
        className="absolute top-0 left-0 w-[50.5%] h-full bg-[#0F35FF] border-r-[4px] border-[#0A0A1A] shadow-[5px_0_15px_rgba(0,0,0,0.5)] z-20"
      />
      <div
        id="metro-door-right"
        ref={metroDoorRightRef}
        className="absolute top-0 right-0 w-[50.5%] h-full bg-[#0F35FF] border-l-[4px] border-[#0A0A1A] shadow-[-5px_0_15px_rgba(0,0,0,0.5)] z-20"
      />

      {/* Text */}
      <div
        id="metro-door-text"
        ref={metroDoorTextRef}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 text-center w-full px-4 opacity-0 pointer-events-none drop-shadow-[0_4px_4px_rgba(10,10,26,0.5)] flex flex-col items-center justify-center"
      >
        <h2 className="font-['Teko'] font-semibold text-[80px] md:text-[140px] lg:text-[100px] xl:text-[120px] text-white leading-[1.1] tracking-wide">
          {welcomeDoors.hindiHeadingLine1}
          <br />
          {welcomeDoors.hindiHeadingLine2}
        </h2>
        <p className="font-['Schoolbell'] font-bold text-[30px] md:text-[50px] text-[#FFCC00] mt-2 mb-8">
          {welcomeDoors.englishSubtitle}
        </p>
        <button
          id="metro-enter-btn"
          onClick={triggerMetroEntrance}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white pointer-events-auto bg-[#FFCC00] text-[#0A0A1A] font-['Schoolbell'] font-bold text-xl md:text-2xl px-10 py-3 rounded-md hover:scale-105 hover:bg-white hover:text-[#0A0A1A] transition-all duration-300 shadow-[4px_4px_0_#0A0A1A]"
        >
          {welcomeDoors.enterButtonText}
        </button>
      </div>
    </div>
  );
};
