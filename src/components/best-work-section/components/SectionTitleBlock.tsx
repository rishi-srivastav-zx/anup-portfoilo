import React from "react";
import { useTransit } from "../context/TransitContext";

export const SectionTitleBlock: React.FC = () => {
    const { config } = useTransit();
    const { sectionHeader } = config;

    return (
        <div className="absolute top-8 left-[82px] md:top-14 md:left-[98px] z-50 pointer-events-none leading-none flex flex-col">
            {/* Section badge */}
            <span className="font-['Schoolbell'] text-[11px] font-bold uppercase tracking-widest text-[#14100E] block mb-4 border-2 border-[#14100E] px-3 py-1.5 bg-[#E6DDD2] w-max shadow-[3px_3px_0_#14100E]">
                {sectionHeader.badge}
            </span>

            {/* Heading — pointer-events-auto so hover works without blocking metro UI */}
            <div className="group relative font-['Schoolbell'] leading-[0.85] py-4 pl-3 md:pl-5 overflow-visible cursor-pointer pointer-events-auto">
                {/* Tilted box covers "Best" row only (fixed height = one line) */}
                <div
                    id="vw-tilted-box"
                    className="absolute top-1 left-0 right-4 h-[105px] md:h-[150px] bg-[#14100E] border-[4px] border-[#14100E] shadow-[-7px_7px_0_rgba(20,16,14,0.3)] transform -rotate-[3.5deg] group-hover:-rotate-[1deg] group-hover:scale-105 transition-all duration-300 z-0 origin-center"
                >
                    {/* Tape mark */}
                    <span className="absolute -top-3 left-[28%] w-10 h-4 bg-white/70 border border-black/10 rotate-[3deg] shadow-sm" />
                    {/* Star — muted warm gold accent */}
                    <svg
                        className="absolute -bottom-4 -right-4 w-9 h-9 md:w-11 md:h-11 text-[#D4A017] drop-shadow-[2px_2px_0_#14100E] z-30 transition-transform duration-500 group-hover:rotate-180"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        stroke="#14100E"
                        strokeWidth="2"
                        strokeLinejoin="round"
                    >
                        <path d="M12 2l2.4 7.4L22 9.6l-6 4.8 2.3 7.6-6.3-4.6-6.3 4.6 2.3-7.6-6-4.8 7.6-.2L12 2z" />
                    </svg>
                </div>

                {/* "Best" — line 1 */}
                <div
                    id="vw-best"
                    className="relative z-10 text-[#E6DDD2] text-[95px] md:text-[140px] lg:text-[115px] xl:text-[140px] font-bold capitalize will-change-transform"
                >
                    {sectionHeader.titleFirstWord}
                </div>
                {/* "Work" — line 2 */}
                <div
                    id="vw-work"
                    className="relative z-10 text-[#14100E] text-[95px] md:text-[140px] lg:text-[115px] xl:text-[140px] font-bold capitalize will-change-transform"
                    style={{ textShadow: "4px 4px 0px rgba(230,221,210,0.85)" }}
                >
                    {sectionHeader.titleSecondWord}
                </div>
            </div>
        </div>
    );
};
