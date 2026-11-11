"use client";

import React from "react";
import DeveloperCredit from "@/components/common/DeveloperCredit";

export const Footer: React.FC = () => {
    return (
        <footer
            id="contact"
            className="relative w-full py-16 px-6 md:px-12 bg-[#010204] text-[#F4EFE6]"
        >
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 border-t border-white/10 pt-12">
                <div className="flex flex-col items-center md:items-start">
                    <span className="text-lg font-black font-inter tracking-tight text-white uppercase">
                        ANUP RAWAT
                    </span>
                    <span className="text-xs font-dm-mono text-white/50 mt-1">
                        Software Engineer · Creative Technologist
                    </span>
                </div>

                <div className="flex items-center gap-6 text-xs font-dm-mono text-white/70">
                    <a
                        href="https://github.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-white hover:underline transition-colors"
                    >
                        GitHub
                    </a>
                    <span>·</span>
                    <a
                        href="https://twitter.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-white hover:underline transition-colors"
                    >
                        Twitter / X
                    </a>
                    <span>·</span>
                    <a
                        href="https://linkedin.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-white hover:underline transition-colors"
                    >
                        LinkedIn
                    </a>
                    <span>·</span>
                    <a
                        href="mailto:Anooprawat123123@gmail.com"
                        className="text-[11px] text-[#012CEB] font-medium hover:underline"
                    >
                        Anooprawat123123@gmail.com
                    </a>
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-dm-mono text-white/40">
                    <span>© {new Date().getFullYear()} ALL RIGHTS RESERVED</span>
                    <span>·</span>
                    <DeveloperCredit className="hover:text-white/80 transition-colors" />
                </div>
            </div>
        </footer>
    );
};
