import React from "react";
import { useTransit } from "../context/TransitContext";

export const SectionTitleBlock: React.FC = () => {
    const { config } = useTransit();
    const { sectionHeader } = config;

    return (
        <div className="absolute top-3 left-3 sm:top-5 sm:left-5 md:top-7 md:left-8 lg:left-12 z-30 pointer-events-none leading-none flex flex-col">
            {/* Section badge */}
            <span className="font-['Schoolbell'] text-[9px] sm:text-[11px] md:text-[12px] font-bold uppercase tracking-widest text-[#14100E] block mb-1.5 sm:mb-2 md:mb-2 border-2 border-[#14100E] px-2 py-0.5 sm:px-3 sm:py-1 md:px-3 md:py-1 bg-[#E6DDD2] w-max shadow-[2px_2px_0_#14100E] md:shadow-[3px_3px_0_#14100E]">
                {sectionHeader.badge}
            </span>

            {/* Heading — pointer-events-auto so hover works without blocking metro UI */}
            <div className="group relative font-['Schoolbell'] leading-[0.85] py-1.5 pl-1.5 sm:py-2.5 sm:pl-2.5 md:py-2 md:pl-3 overflow-visible cursor-pointer pointer-events-auto">
                {/* Tilted box covers "Best" row only (fixed height = one line) */}
                <div
                    id="vw-tilted-box"
                    className="absolute top-0.5 sm:top-1 md:top-0.5 left-0 right-2 sm:right-3 md:right-3 h-[46px] sm:h-[62px] md:h-[80px] lg:h-[90px] xl:h-[100px] bg-[#14100E] border-[3px] md:border-[4px] border-[#14100E] shadow-[-4px_4px_0_rgba(20,16,14,0.3)] md:shadow-[-5px_5px_0_rgba(20,16,14,0.3)] transform -rotate-[3.5deg] group-hover:-rotate-[1deg] group-hover:scale-105 transition-all duration-300 z-0 origin-center"
                >
                    {/* Tape mark */}
                    <span className="absolute -top-2 sm:-top-3 md:-top-2.5 left-[28%] w-6 sm:w-8 md:w-9 h-2.5 sm:h-3 md:h-3.5 bg-white/70 border border-black/10 rotate-[3deg] shadow-sm" />
                    {/* Star — muted warm gold accent */}
                    <svg
                        className="absolute -bottom-2 -right-2 sm:-bottom-3 sm:-right-3 md:-bottom-3 md:-right-3 w-5 h-5 sm:w-7 sm:h-7 md:w-9 md:h-9 text-[#D4A017] drop-shadow-[2px_2px_0_#14100E] z-30 transition-transform duration-500 group-hover:rotate-180"
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
                    className="relative z-10 text-[#E6DDD2] text-[42px] sm:text-[56px] md:text-[75px] lg:text-[85px] xl:text-[95px] font-bold capitalize will-change-transform"
                >
                    {sectionHeader.titleFirstWord}
                </div>
                {/* "Work" — line 2 */}
                <div
                    id="vw-work"
                    className="relative z-10 text-[#14100E] text-[42px] sm:text-[56px] md:text-[75px] lg:text-[85px] xl:text-[95px] font-bold capitalize will-change-transform"
                    style={{ textShadow: "4px 4px 0px rgba(230,221,210,0.85)" }}
                >
                    {sectionHeader.titleSecondWord}
                </div>
            </div>
        </div>
    );
};
