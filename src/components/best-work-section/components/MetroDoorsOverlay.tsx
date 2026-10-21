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
        className="absolute top-0 left-0 w-[50.5%] h-full bg-[#E6DDD2] border-r-[4px] border-[#14100E] shadow-[5px_0_15px_rgba(20,16,14,0.2)] z-20 flex flex-col justify-between overflow-hidden"
      >
        <div className="p-6 text-[#14100E]/70 font-['DM_Mono'] text-xs uppercase tracking-widest font-bold">
          GATE 01 // ENTRY
        </div>
        <div className="p-6 text-[#6B625A] font-['DM_Mono'] text-[11px] uppercase tracking-wider font-semibold">
          PLATFORM CLEARANCE REQUIRED
        </div>
      </div>

      <div
        id="metro-door-right"
        ref={metroDoorRightRef}
        className="absolute top-0 right-0 w-[50.5%] h-full bg-[#E6DDD2] border-l-[4px] border-[#14100E] shadow-[-5px_0_15px_rgba(20,16,14,0.2)] z-20 flex flex-col justify-between items-end overflow-hidden"
      >
        <div className="p-6 text-[#14100E]/70 font-['DM_Mono'] text-xs uppercase tracking-widest font-bold text-right">
          GATE 02 // ENTRY
        </div>
        <div className="p-6 text-[#6B625A] font-['DM_Mono'] text-[11px] uppercase tracking-wider font-semibold text-right">
          ANUP RAWAT // TRANSIT
        </div>
      </div>

      {/* Text */}
      <div
        id="metro-door-text"
        ref={metroDoorTextRef}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 text-center w-auto max-w-[90vw] px-4 opacity-0 pointer-events-none drop-shadow-[0_2px_4px_rgba(20,16,14,0.1)] flex flex-col items-center justify-center"
      >
        <span className="font-['DM_Mono'] text-[10px] md:text-xs font-semibold tracking-widest text-[#E6DDD2] uppercase mb-2 bg-[#14100E] px-3 py-1 border border-[#14100E] shadow-sm whitespace-nowrap">
          DELHI METRO // CAREER TRANSIT
        </span>

        <h2 className="font-['Schoolbell'] font-bold text-xl sm:text-2xl md:text-3xl text-[#14100E] leading-snug tracking-wide text-center">
          <span className="block whitespace-nowrap">{welcomeDoors.hindiHeadingLine1}</span>
          <span className="block whitespace-nowrap text-[#2B2721]">{welcomeDoors.hindiHeadingLine2}</span>
        </h2>

        <p className="font-['Schoolbell'] font-bold text-xs sm:text-sm md:text-base text-[#6B625A] mt-2 mb-6 whitespace-nowrap">
          {welcomeDoors.englishSubtitle}
        </p>

        <button
          id="metro-enter-btn"
          onClick={triggerMetroEntrance}
          data-cursor="pointer"
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14100E] pointer-events-auto bg-[#14100E] text-[#E6DDD2] font-['Schoolbell'] font-bold text-xs sm:text-sm md:text-base px-6 md:px-8 py-2 md:py-2.5 border-[2px] border-[#14100E] shadow-[4px_4px_0_rgba(20,16,14,0.3)] hover:shadow-[2px_2px_0_rgba(20,16,14,0.3)] hover:translate-x-[1px] hover:translate-y-[1px] hover:bg-[#2B2721] hover:text-[#FFFFFF] transition-all duration-200 cursor-pointer whitespace-nowrap"
        >
          {welcomeDoors.enterButtonText}
        </button>
      </div>
    </div>
  );
};
