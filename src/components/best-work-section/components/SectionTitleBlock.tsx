import React from 'react';
import { useTransit } from '../context/TransitContext';

export const SectionTitleBlock: React.FC = () => {
  const { config } = useTransit();
  const { sectionHeader } = config;

  return (
    <div className="absolute top-8 left-[82px] md:top-14 md:left-[98px] z-50 pointer-events-none leading-none flex flex-col">
      {/* Section badge */}
      <span className="font-['Schoolbell'] text-[11px] font-bold uppercase tracking-widest text-[var(--beige)] block mb-4 border-2 border-[var(--beige)] px-3 py-1.5 bg-black/30 w-max shadow-[3px_3px_0_var(--beige)]">
        {sectionHeader.badge}
      </span>

      {/* Heading — pointer-events-auto so hover works without blocking metro UI */}
      <div className="group relative font-['Schoolbell'] leading-[0.85] py-4 pl-3 md:pl-5 overflow-visible cursor-pointer pointer-events-auto">
        {/* Tilted box covers "Best" row only (fixed height = one line) */}
        <div
          id="vw-tilted-box"
          className="absolute top-1 left-0 right-4 h-[105px] md:h-[150px] bg-[var(--blue)] border-[4px] border-[#0A0A1A] shadow-[-7px_7px_0_#0A0A1A] transform -rotate-[3.5deg] group-hover:-rotate-[1deg] group-hover:scale-105 transition-all duration-300 z-0 origin-center"
        >
          {/* Tape mark */}
          <span className="absolute -top-3 left-[28%] w-10 h-4 bg-white/55 border border-black/10 rotate-[3deg] shadow-sm" />
          {/* Green star — matches Projects heading */}
          <svg
            className="absolute -bottom-4 -right-4 w-9 h-9 md:w-11 md:h-11 text-[#8DE254] drop-shadow-[2px_2px_0_#0A0A0A] z-30 transition-transform duration-500 group-hover:rotate-180"
            viewBox="0 0 24 24"
            fill="currentColor"
            stroke="#0A0A0A"
            strokeWidth="2"
            strokeLinejoin="round"
          >
            <path d="M12 2l2.4 7.4L22 9.6l-6 4.8 2.3 7.6-6.3-4.6-6.3 4.6 2.3-7.6-6-4.8 7.6-.2L12 2z" />
          </svg>
        </div>

        {/* "Best" — line 1 */}
        <div
          id="vw-best"
          className="relative z-10 text-[var(--beige)] text-[95px] md:text-[140px] lg:text-[115px] xl:text-[140px] font-bold capitalize will-change-transform"
        >
          {sectionHeader.titleFirstWord}
        </div>
        {/* "Work" — line 2 */}
        <div
          id="vw-work"
          className="relative z-10 text-[#0F35FF] text-[95px] md:text-[140px] lg:text-[115px] xl:text-[140px] font-bold capitalize will-change-transform"
          style={{ textShadow: '4px 4px 0px rgba(11,11,11,0.85)' }}
        >
          {sectionHeader.titleSecondWord}
        </div>
      </div>
    </div>
  );
};
