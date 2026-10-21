import React from "react";
import { useTransit } from "../context/TransitContext";

export const CaseStudyView: React.FC = () => {
    const { config, transitCsViewRef, transitCsContentRef, returnToTransit } =
        useTransit();

    return (
        <div
            id="transit-case-study-view"
            ref={transitCsViewRef}
            data-lenis-prevent="true"
            className="absolute inset-0 w-full h-full overflow-y-auto px-4 md:px-12 pt-24 z-[100] hidden opacity-0 bg-[#E6DDD2] pointer-events-auto"
            style={{ overscrollBehavior: "contain" }}
        >
            {/* Action Bar */}
            <div className="sticky top-6 z-[9999] mb-8 flex justify-end w-full max-w-[1400px] mx-auto">
                <button
                    id="back-to-transit-btn"
                    onClick={returnToTransit}
                    data-cursor="pointer"
                    aria-label="Back to Transit Map"
                    className="focus-visible:outline-none group flex items-center gap-3 bg-[var(--beige)] text-[#14100E] font-['Schoolbell'] text-[13px] md:text-[15px] font-bold uppercase tracking-widest px-5 md:px-7 py-3 md:py-3.5 border-[3px] border-[#14100E] shadow-[5px_5px_0_#14100E] hover:shadow-[2px_2px_0_#14100E] hover:translate-x-[3px] hover:translate-y-[3px] hover:bg-[#14100E] hover:text-[#ECE8E1] hover:border-[#14100E] transition-all duration-200 cursor-pointer rotate-[2deg] hover:rotate-0 rounded-none"
                >
                    <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="square"
                        strokeLinejoin="miter"
                    >
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    {config.train.returnButtonText}
                </button>
            </div>

            {/* Injected Deep Dive Content */}
            <div
                id="transit-cs-content"
                ref={transitCsContentRef}
                className="w-full max-w-[1400px] mx-auto bg-white rounded-[12px] shadow-[0_12px_48px_rgba(11,11,11,0.08)] border-[1px] border-[rgba(11,11,11,0.1)] p-0 mb-24 transform-gpu overflow-hidden"
            />
        </div>
    );
};
