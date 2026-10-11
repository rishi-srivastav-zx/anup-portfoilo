"use client";

import React from "react";

export const HeroSection: React.FC = () => {
    const scrollToOrigin = () => {
        const el = document.getElementById("origin");
        if (el) {
            el.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <section
            id="hero"
            className="relative w-full min-h-screen flex flex-col justify-between pt-24 pb-12 px-6 md:px-12 bg-[#010204] overflow-hidden border-b border-[#012CEB]/30"
        >
            {/* Background Grid & Architectural Crosshairs */}
            <div className="absolute inset-0 pointer-events-none opacity-10">
                <div
                    className="w-full h-full"
                    style={{
                        backgroundImage: `
              linear-gradient(to right, rgba(1, 44, 235, 0.4) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(1, 44, 235, 0.4) 1px, transparent 1px)
            `,
                        backgroundSize: "48px 48px",
                    }}
                />
            </div>

            {/* Top Left Library Ticket / Spec Card */}
            <div className="relative z-10 max-w-sm mt-8 hidden sm:block">
                <div className="relative bg-[#ECE8E1] border-2 border-[#051024] p-3.5 shadow-[4px_4px_0_#012CEB] transform -rotate-2 w-max text-[#051024]">
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-10 h-4 scotch-tape rotate-2" />
                    <div className="text-[13px] font-black uppercase tracking-tight text-[#012CEB]">
                        SOFTWARE ENGINEER & BUILDER
                    </div>
                    <div className="text-[10px] font-dm-mono text-[#051024]/80 tracking-tight mt-0.5">
                        Full-Stack Systems · Creative Interfaces
                    </div>
                </div>
            </div>

            {/* Hero Central Typography Lockup */}
            <div className="relative z-10 my-auto py-12 max-w-5xl">
                <div className="flex items-center gap-3 mb-4">
                    <span className="w-2.5 h-2.5 bg-[#012CEB] animate-pulse" />
                    <span className="text-xs uppercase tracking-[0.25em] font-dm-mono text-white/60">
                        PORTFOLIO 2026 // ANUP RAWAT
                    </span>
                </div>

                <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black font-inter text-[#F4EFE6] leading-[0.9] tracking-[-0.04em] uppercase mb-6">
                    BUILDING <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#012CEB] via-[#4D7BFF] to-white">
                        SOFTWARE
                    </span>{" "}
                    <br />
                    THAT WORKS.
                </h1>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-4 border-t border-white/10">
                    <p className="max-w-xl text-sm md:text-base text-[#F4EFE6]/70 font-dm-sans leading-relaxed">
                        I don’t just write code — I turn complex distributed
                        systems, product logic, and high-fidelity interaction
                        design into robust digital realities that perform at
                        scale.
                    </p>

                    <div className="flex items-center gap-6 font-dm-mono text-xs text-white/50">
                        <div>
                            <span className="block text-white font-bold">
                                50+
                            </span>
                            <span>APPS SHIPPED</span>
                        </div>
                        <div className="w-[1px] h-6 bg-white/10" />
                        <div>
                            <span className="block text-white font-bold">
                                99.98%
                            </span>
                            <span>PROD UPTIME</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Scroll Prompt (Pointing into Origin) */}
            <div className="relative z-10 flex flex-col items-center justify-center pt-8 pb-4">
                <button
                    onClick={scrollToOrigin}
                    className="group flex flex-col items-center cursor-pointer transition-transform hover:translate-y-1"
                >
                    <div className="bg-[#051024] border-2 border-[#F4EFE6] text-[#F4EFE6] px-5 py-2 font-schoolbell font-bold uppercase tracking-[0.2em] text-[11px] shadow-[4px_4px_0_#012CEB] transform -rotate-1 mb-3 group-hover:bg-[#012CEB] group-hover:border-white transition-colors">
                        GO ON, SCROLL DOWN TO 01 — ORIGIN
                    </div>
                    <svg
                        className="w-6 h-8 text-[#F4EFE6] animate-bounce"
                        viewBox="0 0 24 32"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M12 2v26M5 21l7 7 7-7" />
                    </svg>
                </button>
            </div>
        </section>
    );
};
