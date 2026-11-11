import React from "react";
import { useTransit } from "../context/TransitContext";

export const NavigationArrows: React.FC = () => {
    const { nextStation, prevStation } = useTransit();

    return (
        <>
            <div className="absolute right-1 sm:right-2 md:right-8 top-[48%] sm:top-[47%] md:top-[45%] -translate-y-1/2 z-[90] pointer-events-auto">
                <button
                    id="transit-next-btn"
                    onClick={nextStation}
                    data-cursor="pointer"
                    aria-label="Next Station"
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14100E] w-8 h-8 sm:w-10 sm:h-10 md:w-20 lg:w-24 md:h-20 lg:h-24 border-[2px] sm:border-[2.5px] md:border-[3px] border-[#14100E] bg-[#E6DDD2] text-[#14100E] flex items-center justify-center cursor-pointer hover:bg-[#14100E] hover:text-[#ECE8E1] hover:border-[#14100E] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-150 group shadow-[2px_2px_0_#14100E] sm:shadow-[2.5px_2.5px_0_#14100E] md:shadow-[5px_5px_0_#14100E]"
                >
                    <svg
                        className="w-3.5 h-3.5 sm:w-5 sm:h-5 md:w-[28px] lg:w-[34px] md:h-[28px] lg:h-[34px]"
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
            <div className="absolute left-1 sm:left-2 md:left-8 top-[48%] sm:top-[47%] md:top-[45%] -translate-y-1/2 z-[90] pointer-events-auto">
                <button
                    id="transit-prev-btn"
                    onClick={prevStation}
                    data-cursor="pointer"
                    aria-label="Previous Station"
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14100E] w-8 h-8 sm:w-10 sm:h-10 md:w-20 lg:w-24 md:h-20 lg:h-24 border-[2px] sm:border-[2.5px] md:border-[3px] border-[#14100E] bg-[#E6DDD2] text-[#14100E] flex items-center justify-center cursor-pointer hover:bg-[#14100E] hover:text-[#ECE8E1] hover:border-[#14100E] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-150 group shadow-[2px_2px_0_#14100E] sm:shadow-[2.5px_2.5px_0_#14100E] md:shadow-[5px_5px_0_#14100E]"
                >
                    <svg
                        className="w-3.5 h-3.5 sm:w-5 sm:h-5 md:w-[28px] lg:w-[34px] md:h-[28px] lg:h-[34px]"
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
