import React from "react";
import { useTransit } from "../context/TransitContext";

export const MetroTrain: React.FC = () => {
    const { config, transitTrainRef } = useTransit();
    const { train } = config;

    return (
        <div
            id="transit-train"
            ref={transitTrainRef}
            className="relative flex flex-row-reverse items-end mb-[2px] transform translate-x-[5vw] will-change-transform transition-transform duration-[1.5s] h-[133px] pr-[5vw] md:pr-[10vw]"
            style={{ filter: "drop-shadow(0 12px 32px rgba(11,11,11,0.25))" }}
        >
            <div className="flex flex-row-reverse items-end w-full h-full">
                {/* Right Carriage (Engine - Adjusted Spread) */}
                <div className="relative w-[68vw] md:w-[68vw] h-full flex flex-col justify-end flex-shrink-0">
                    <div className="relative w-full h-[85%] bg-[#F4EFE6] border-[3px] md:border-[4px] border-[#14100E] border-b-0 rounded-tr-[60px] flex items-end overflow-hidden shadow-[inset_-4px_-10px_20px_rgba(0,0,0,0.1)]">
                        {/* Fun Graffiti */}
                        <div
                            aria-hidden="true"
                            className="absolute top-[20%] md:top-[16%] left-[45%] -translate-x-1/2 font-['Schoolbell'] text-[10px] md:text-[14px] text-[#14100E]/70 z-20 whitespace-nowrap"
                        >
                            {train.graffitiText}
                        </div>

                        {/* Accent Stripe (Runs across the entire body below windows) */}
                        <div className="absolute top-0 w-full h-[8px] md:h-[12px] bg-[#14100E] z-20 shadow-[0_2px_4px_rgba(0,0,0,0.2)] border-b-[2px] border-[#14100E]" />

                        {/* Windows & Gates (Authentic Delhi Metro) */}
                        <div className="w-full px-2 md:px-8 flex flex-row-reverse h-[85%] relative z-10 gap-2 md:gap-6 overflow-hidden mr-12 md:mr-24 justify-between items-end">
                            {/* Front Gate */}
                            <div className="w-[12vw] md:w-[9vw] h-full flex-shrink-0 bg-[#E5DFC8] border-[2px] md:border-[3px] border-[#14100E] border-b-0 rounded-t-[4px] relative flex justify-center pt-2 md:pt-4 gap-[2px] shadow-[inset_0_2px_8px_rgba(255,255,255,0.8)] z-10">
                                <div className="absolute top-0 bottom-0 left-1/2 w-[2px] bg-[#14100E] -translate-x-1/2 opacity-60 z-0" />
                                <div className="w-[38%] h-[55%] bg-[#0A101D] border-[2px] border-[#14100E] rounded-sm z-10 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)] relative overflow-hidden">
                                    <div className="absolute top-0 right-[10%] w-[30%] h-[150%] bg-white/10 rotate-[35deg] transform translate-y-[-20%] pointer-events-none" />
                                </div>
                                <div className="w-[38%] h-[55%] bg-[#0A101D] border-[2px] border-[#14100E] rounded-sm z-10 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)] relative overflow-hidden">
                                    <div className="absolute top-0 right-[10%] w-[30%] h-[150%] bg-white/10 rotate-[35deg] transform translate-y-[-20%] pointer-events-none" />
                                </div>
                            </div>

                            {/* Long Mirror (Middle Window Panel) */}
                            <div className="flex-grow h-[60%] bg-[#0A101D] shadow-[inset_0_4px_15px_rgba(0,0,0,0.9)] border-[3px] md:border-[4px] border-[#14100E] rounded-[8px] relative overflow-hidden self-start mt-[3%] z-10">
                                <div className="absolute top-0 left-0 w-full h-1/2 bg-white/10 backdrop-blur-sm" />
                            </div>

                            {/* Back Gate */}
                            <div className="w-[12vw] md:w-[9vw] h-full flex-shrink-0 bg-[#E5DFC8] border-[2px] md:border-[3px] border-[#14100E] border-b-0 rounded-t-[4px] relative flex justify-center pt-2 md:pt-4 gap-[2px] shadow-[inset_0_2px_8px_rgba(255,255,255,0.8)] z-10">
                                <div className="absolute top-0 bottom-0 left-1/2 w-[2px] bg-[#14100E] -translate-x-1/2 opacity-60 z-0" />
                                <div className="w-[38%] h-[55%] bg-[#0A101D] border-[2px] border-[#14100E] rounded-sm z-10 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)] relative overflow-hidden">
                                    <div className="absolute top-0 right-[10%] w-[30%] h-[150%] bg-white/10 rotate-[35deg] transform translate-y-[-20%] pointer-events-none" />
                                </div>
                                <div className="w-[38%] h-[55%] bg-[#0A101D] border-[2px] border-[#14100E] rounded-sm z-10 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)] relative overflow-hidden">
                                    <div className="absolute top-0 right-[10%] w-[30%] h-[150%] bg-white/10 rotate-[35deg] transform translate-y-[-20%] pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        {/* Typography below windows */}
                        <div
                            aria-hidden="true"
                            className="absolute top-[60%] left-[45%] -translate-x-1/2 font-['DM_Mono'] text-[6px] md:text-[8px] text-[#14100E] opacity-60 font-bold tracking-widest z-10"
                        >
                            {train.bodyLabel}
                        </div>
                    </div>

                    <div className="w-full h-[18%] bg-[#050505] border-[3px] md:border-[4px] border-[#14100E] rounded-tr-[10px] shadow-[inset_0_4px_10px_rgba(0,0,0,0.8)]" />
                </div>

                {/* Connector */}
                <div className="w-[4vw] md:w-[3vw] h-[60%] bg-[#080808] border-[2px] border-[#111] flex flex-col justify-evenly opacity-95 z-0 flex-shrink-0 self-center">
                    <div className="w-full h-[4px] bg-[#1a1a1a]" />
                    <div className="w-full h-[4px] bg-[#1a1a1a]" />
                    <div className="w-full h-[4px] bg-[#1a1a1a]" />
                </div>

                {/* Middle Carriage (Cropped) */}
                <div className="relative w-[50vw] md:w-[55vw] h-full flex flex-col justify-end flex-shrink-0">
                    <div className="relative w-full h-[85%] bg-[#F4EFE6] border-[3px] md:border-[4px] border-[#14100E] border-b-0 flex items-end overflow-hidden shadow-[inset_0_-10px_20px_rgba(0,0,0,0.1)]">
                        {/* Accent Stripe */}
                        <div className="absolute top-0 w-full h-[8px] md:h-[12px] bg-[#14100E] z-20 shadow-[0_2px_4px_rgba(0,0,0,0.2)] border-b-[2px] border-[#14100E]" />

                        {/* Windows & Gates (Authentic Delhi Metro) */}
                        <div className="w-full px-2 md:px-8 flex h-[85%] relative z-10 gap-2 md:gap-6 justify-between items-end">
                            {/* Back Gate */}
                            <div className="w-[12vw] md:w-[9vw] h-full flex-shrink-0 bg-[#E5DFC8] border-[2px] md:border-[3px] border-[#14100E] border-b-0 rounded-t-[4px] relative flex justify-center pt-2 md:pt-4 gap-[2px] shadow-[inset_0_2px_8px_rgba(255,255,255,0.8)] z-10">
                                <div className="absolute top-0 bottom-0 left-1/2 w-[2px] bg-[#14100E] -translate-x-1/2 opacity-60 z-0" />
                                <div className="w-[38%] h-[55%] bg-[#0A101D] border-[2px] border-[#14100E] rounded-sm z-10 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)] relative overflow-hidden">
                                    <div className="absolute top-0 right-[10%] w-[30%] h-[150%] bg-white/10 rotate-[35deg] transform translate-y-[-20%] pointer-events-none" />
                                </div>
                                <div className="w-[38%] h-[55%] bg-[#0A101D] border-[2px] border-[#14100E] rounded-sm z-10 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)] relative overflow-hidden">
                                    <div className="absolute top-0 right-[10%] w-[30%] h-[150%] bg-white/10 rotate-[35deg] transform translate-y-[-20%] pointer-events-none" />
                                </div>
                            </div>

                            {/* Long Mirror (Middle Window Panel) */}
                            <div className="flex-grow h-[60%] bg-[#0A101D] shadow-[inset_0_4px_15px_rgba(0,0,0,0.9)] border-[3px] md:border-[4px] border-[#0B0B0B] rounded-[8px] relative overflow-hidden self-start mt-[3%] z-10">
                                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-50 pointer-events-none" />
                                <div className="absolute top-0 right-[25%] w-[10%] h-[150%] bg-white/10 rotate-[35deg] transform translate-y-[-20%] pointer-events-none" />
                                <div className="absolute top-0 right-[15%] w-[3%] h-[150%] bg-white/10 rotate-[35deg] transform translate-y-[-20%] pointer-events-none" />
                                <div className="absolute top-0 left-0 w-full h-1/2 bg-white/5 backdrop-blur-sm pointer-events-none" />
                            </div>

                            {/* Front Gate */}
                            <div className="w-[12vw] md:w-[9vw] h-full flex-shrink-0 bg-[#D1D5DB] border-[2px] md:border-[3px] border-[#0B0B0B] border-b-0 rounded-t-[4px] relative flex justify-center pt-2 md:pt-4 gap-[2px] shadow-[inset_0_2px_8px_rgba(255,255,255,1)] z-10">
                                <div className="absolute top-0 bottom-0 left-1/2 w-[2px] bg-[#0B0B0B] -translate-x-1/2 opacity-60 z-0" />
                                <div className="w-[38%] h-[55%] bg-[#0A101D] border-[2px] border-[#0B0B0B] rounded-sm z-10 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)] relative overflow-hidden">
                                    <div className="absolute top-0 right-[10%] w-[30%] h-[150%] bg-white/10 rotate-[35deg] transform translate-y-[-20%] pointer-events-none" />
                                </div>
                                <div className="w-[38%] h-[55%] bg-[#0A101D] border-[2px] border-[#0B0B0B] rounded-sm z-10 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)] relative overflow-hidden">
                                    <div className="absolute top-0 right-[10%] w-[30%] h-[150%] bg-white/10 rotate-[35deg] transform translate-y-[-20%] pointer-events-none" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="w-full h-[18%] bg-[#050505] border-[3px] md:border-[4px] border-[#0B0B0B] shadow-[inset_0_4px_10px_rgba(0,0,0,0.8)]" />
                </div>
            </div>
        </div>
    );
};
