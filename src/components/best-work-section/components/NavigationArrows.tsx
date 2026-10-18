import React from 'react';
import { useTransit } from '../context/TransitContext';

export const NavigationArrows: React.FC = () => {
  const { nextStation, prevStation } = useTransit();

  return (
    <>
      <div className="absolute right-4 md:right-8 top-[45%] -translate-y-1/2 z-[90] pointer-events-auto">
        <button
          id="transit-next-btn"
          onClick={nextStation}
          aria-label="Next Station"
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F35FF] w-20 h-20 md:w-24 md:h-24 border-[3px] border-[#0B0B0B] bg-[#ECE8E1] flex items-center justify-center cursor-pointer hover:bg-[#0F35FF] hover:text-white hover:border-[#0F35FF] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-150 group shadow-[5px_5px_0_#0B0B0B]"
        >
          <svg
            width="34"
            height="34"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="square"
            strokeLinejoin="miter"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
      <div className="absolute left-4 md:left-8 top-[45%] -translate-y-1/2 z-[90] pointer-events-auto">
        <button
          id="transit-prev-btn"
          onClick={prevStation}
          aria-label="Previous Station"
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F35FF] w-20 h-20 md:w-24 md:h-24 border-[3px] border-[#0B0B0B] bg-[#ECE8E1] flex items-center justify-center cursor-pointer hover:bg-[#0F35FF] hover:text-white hover:border-[#0F35FF] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-150 group shadow-[5px_5px_0_#0B0B0B]"
        >
          <svg
            width="34"
            height="34"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="square"
            strokeLinejoin="miter"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      </div>
    </>
  );
};
