import React, { useEffect, useRef } from 'react';
import { useTransit } from '../context/TransitContext';

export const MetroDoorsOverlay: React.FC = () => {
  const {
    config,
    metroDoorsOverlayRef,
    metroDoorLeftRef,
    metroDoorRightRef,
    metroDoorTextRef,
    triggerMetroEntrance,
    areDoorsHidden,
  } = useTransit();

  const { welcomeDoors } = config;
  const autoOpenTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasTriggeredRef = useRef(false);

  // Automatically open in 3 seconds once user is in this section and hasn't clicked
  useEffect(() => {
    if (areDoorsHidden) return;

    const overlayEl = metroDoorsOverlayRef.current;
    if (!overlayEl) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !hasTriggeredRef.current) {
          if (!autoOpenTimerRef.current) {
            autoOpenTimerRef.current = setTimeout(() => {
              if (!hasTriggeredRef.current) {
                hasTriggeredRef.current = true;
                triggerMetroEntrance();
              }
            }, 3000);
          }
        } else {
          if (autoOpenTimerRef.current) {
            clearTimeout(autoOpenTimerRef.current);
            autoOpenTimerRef.current = null;
          }
        }
      },
      { threshold: 0.35 }
    );

    observer.observe(overlayEl);

    return () => {
      observer.disconnect();
      if (autoOpenTimerRef.current) {
        clearTimeout(autoOpenTimerRef.current);
        autoOpenTimerRef.current = null;
      }
    };
  }, [areDoorsHidden, metroDoorsOverlayRef, triggerMetroEntrance]);

  const handleEnterClick = () => {
    if (hasTriggeredRef.current) return;
    hasTriggeredRef.current = true;
    if (autoOpenTimerRef.current) {
      clearTimeout(autoOpenTimerRef.current);
      autoOpenTimerRef.current = null;
    }
    triggerMetroEntrance();
  };

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
        <div className="p-3 sm:p-6 text-[#14100E]/70 font-['DM_Mono'] text-[10px] sm:text-xs uppercase tracking-widest font-bold">
          GATE 01 // ENTRY
        </div>
        <div className="p-3 sm:p-6 text-[#6B625A] font-['DM_Mono'] text-[9px] sm:text-[11px] uppercase tracking-wider font-semibold">
          PLATFORM CLEARANCE REQUIRED
        </div>
      </div>

      <div
        id="metro-door-right"
        ref={metroDoorRightRef}
        className="absolute top-0 right-0 w-[50.5%] h-full bg-[#E6DDD2] border-l-[4px] border-[#14100E] shadow-[-5px_0_15px_rgba(20,16,14,0.2)] z-20 flex flex-col justify-between items-end overflow-hidden"
      >
        <div className="p-3 sm:p-6 text-[#14100E]/70 font-['DM_Mono'] text-[10px] sm:text-xs uppercase tracking-widest font-bold text-right">
          GATE 02 // ENTRY
        </div>
        <div className="p-3 sm:p-6 text-[#6B625A] font-['DM_Mono'] text-[9px] sm:text-[11px] uppercase tracking-wider font-semibold text-right">
          ANUP RAWAT // TRANSIT
        </div>
      </div>

      {/* Text */}
      <div
        id="metro-door-text"
        ref={metroDoorTextRef}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 text-center w-auto max-w-[92vw] px-3 sm:px-4 opacity-0 pointer-events-none drop-shadow-[0_2px_4px_rgba(20,16,14,0.1)] flex flex-col items-center justify-center"
      >
        <span className="font-['DM_Mono'] text-[9px] sm:text-[10px] md:text-xs font-bold tracking-widest text-[#E6DDD2] uppercase mb-2 sm:mb-3 bg-[#14100E] px-3 py-1 border border-[#14100E] shadow-sm whitespace-nowrap">
          ANUP RAWAT // CINEMA TRANSIT
        </span>

        <h2 className="font-['Bebas_Neue'] text-3xl sm:text-5xl md:text-6xl lg:text-7xl text-[#14100E] leading-[0.92] tracking-tight text-center uppercase">
          <span className="block whitespace-nowrap">{welcomeDoors.hindiHeadingLine1}</span>
          <span className="block whitespace-nowrap text-[#14100E]/85">{welcomeDoors.hindiHeadingLine2}</span>
        </h2>

        <p className="font-['Schoolbell'] font-bold text-xs sm:text-sm md:text-base text-[#6B625A] mt-2 mb-4 sm:mb-6 whitespace-nowrap">
          {welcomeDoors.englishSubtitle}
        </p>

        <button
          id="metro-enter-btn"
          onClick={handleEnterClick}
          data-cursor="pointer"
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14100E] pointer-events-auto bg-[#14100E] text-[#E6DDD2] font-['DM_Mono'] font-bold text-xs sm:text-sm md:text-base px-6 sm:px-8 py-2.5 md:py-3 border-[2px] border-[#14100E] shadow-[4px_4px_0_rgba(20,16,14,0.3)] hover:shadow-[2px_2px_0_rgba(20,16,14,0.3)] hover:translate-x-[1px] hover:translate-y-[1px] hover:bg-[#2B2721] hover:text-[#FFFFFF] transition-all duration-200 cursor-pointer whitespace-nowrap tracking-wider uppercase"
        >
          {welcomeDoors.enterButtonText}
        </button>
      </div>
    </div>
  );
};
