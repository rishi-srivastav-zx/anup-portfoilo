"use client";

import React, { useState } from "react";
import { Download, Package, FileCode, Check, X, Sparkles } from "lucide-react";

export const Navbar: React.FC = () => {
    const [showExportModal, setShowExportModal] = useState(false);
    const [copiedCmd, setCopiedCmd] = useState(false);

    const copyInstallCommand = () => {
        navigator.clipboard.writeText("npm install gsap lucide-react");
        setCopiedCmd(true);
        setTimeout(() => setCopiedCmd(false), 2000);
    };

    return (
        <>
            <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 bg-[#010204]/80 backdrop-blur-md border-b border-white/10">
                {/* Zone 1: Single text element wordmark */}
                <a
                    href="#hero"
                    className="text-base md:text-lg font-bold tracking-tight text-[#F4EFE6] font-inter flex items-center gap-2"
                >
                    <span>ANUP RAWAT</span>
                </a>

                {/* Zone 2: clean text navigation links */}
                <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-[#F4EFE6]/70 uppercase tracking-widest font-dm-mono">
                    <a
                        href="#origin"
                        className="hover:text-white hover:underline underline-offset-4 transition-colors"
                    >
                        01 // Origin
                    </a>
                    <a
                        href="#works"
                        className="hover:text-white hover:underline underline-offset-4 transition-colors"
                    >
                        02 // Works
                    </a>
                    <a
                        href="#philosophy"
                        className="hover:text-white hover:underline underline-offset-4 transition-colors"
                    >
                        03 // Philosophy
                    </a>
                    <a
                        href="#contact"
                        className="hover:text-white hover:underline underline-offset-4 transition-colors"
                    >
                        04 // Contact
                    </a>
                </nav>

                {/* Zone 3: primary actions + Download ZIP */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowExportModal(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 text-xs font-semibold uppercase tracking-wider text-[#012CEB] bg-[#012CEB]/10 hover:bg-[#012CEB]/20 border border-[#012CEB]/40 rounded transition-all cursor-pointer shadow-[0_0_15px_rgba(1,44,235,0.2)]"
                        title="Download ZIP for your project"
                    >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download ZIP</span>
                    </button>

                    <a
                        href="#contact"
                        className="hidden sm:inline-block px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white bg-[#012CEB] hover:bg-[#0022b8] rounded transition-colors whitespace-nowrap shadow-[3px_3px_0_rgba(255,255,255,0.2)]"
                    >
                        Get in Touch
                    </a>
                </div>
            </header>

            {/* Export / Download Modal */}
            {showExportModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
                    <div className="relative w-full max-w-2xl bg-[#0a0d14] border border-white/20 rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] overflow-hidden text-[#F4EFE6]">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 rounded-lg bg-[#012CEB]/20 text-[#012CEB] border border-[#012CEB]/30">
                                    <Sparkles className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold font-inter text-white">
                                        Origin Component & Project ZIPs
                                    </h3>
                                    <p className="text-xs text-white/50 font-dm-mono">
                                        Ready to drop into your Next.js or React
                                        project
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowExportModal(false)}
                                className="p-1.5 text-white/50 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">
                            {/* Option Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Option 1: Standalone Component Package */}
                                <div className="flex flex-col justify-between p-4 rounded-lg bg-white/[0.03] border border-white/10 hover:border-[#012CEB]/50 transition-colors">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2 text-[#012CEB]">
                                            <FileCode className="w-5 h-5" />
                                            <span className="text-xs font-mono font-semibold uppercase tracking-wider">
                                                Component Only
                                            </span>
                                        </div>
                                        <h4 className="text-sm font-semibold text-white mb-1">
                                            Origin Component Package
                                        </h4>
                                        <p className="text-xs text-white/60 mb-3 leading-relaxed">
                                            Contains{" "}
                                            <code className="text-[#012CEB] font-mono">
                                                OriginSection.tsx
                                            </code>
                                            , standalone styles, font links, and
                                            integration guide.
                                        </p>
                                    </div>
                                    <a
                                        href="/origin-component-package.zip"
                                        download="origin-component-package.zip"
                                        className="flex items-center justify-center gap-2 w-full py-2.5 px-3 bg-[#012CEB] hover:bg-[#0022b8] text-white text-xs font-semibold uppercase tracking-wider rounded transition-colors shadow-md"
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                        Download Component ZIP (23 KB)
                                    </a>
                                </div>

                                {/* Option 2: Full Project Repository */}
                                <div className="flex flex-col justify-between p-4 rounded-lg bg-white/[0.03] border border-white/10 hover:border-[#012CEB]/50 transition-colors">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2 text-emerald-400">
                                            <Package className="w-5 h-5" />
                                            <span className="text-xs font-mono font-semibold uppercase tracking-wider">
                                                Full Codebase
                                            </span>
                                        </div>
                                        <h4 className="text-sm font-semibold text-white mb-1">
                                            Full Project Repository
                                        </h4>
                                        <p className="text-xs text-white/60 mb-3 leading-relaxed">
                                            Complete working React + Vite +
                                            Tailwind CSS repository ready to run
                                            with{" "}
                                            <code className="text-emerald-400 font-mono">
                                                npm install && npm run dev
                                            </code>
                                            .
                                        </p>
                                    </div>
                                    <a
                                        href="/origin-full-project.zip"
                                        download="origin-full-project.zip"
                                        className="flex items-center justify-center gap-2 w-full py-2.5 px-3 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold uppercase tracking-wider rounded border border-white/20 transition-colors"
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                        Download Full Project ZIP (58 KB)
                                    </a>
                                </div>
                            </div>

                            {/* Instructions checklist */}
                            <div className="p-4 rounded-lg bg-black/40 border border-white/5 space-y-3">
                                <div className="text-xs font-mono uppercase tracking-wider text-white/80 font-bold flex items-center justify-between">
                                    <span>
                                        How to use in your project without
                                        breaking:
                                    </span>
                                    <button
                                        onClick={copyInstallCommand}
                                        className="flex items-center gap-1 text-[11px] text-[#012CEB] hover:underline normal-case"
                                    >
                                        {copiedCmd ? (
                                            <Check className="w-3 h-3" />
                                        ) : null}
                                        {copiedCmd
                                            ? "Copied!"
                                            : "Copy install command"}
                                    </button>
                                </div>
                                <div className="text-xs font-mono text-white/70 space-y-1.5">
                                    <div className="flex items-start gap-2">
                                        <span className="text-[#012CEB] font-bold">
                                            1.
                                        </span>
                                        <span>
                                            Install dependencies:{" "}
                                            <code className="text-white bg-white/10 px-1 py-0.5 rounded">
                                                npm install gsap lucide-react
                                            </code>
                                        </span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <span className="text-[#012CEB] font-bold">
                                            2.
                                        </span>
                                        <span>
                                            Add Google Fonts (
                                            <code className="text-white">
                                                Schoolbell
                                            </code>
                                            ,{" "}
                                            <code className="text-white">
                                                Gloria Hallelujah
                                            </code>
                                            ,{" "}
                                            <code className="text-white">
                                                Dr Sugiyama
                                            </code>
                                            ,{" "}
                                            <code className="text-white">
                                                DM Mono
                                            </code>
                                            ,{" "}
                                            <code className="text-white">
                                                DM Sans
                                            </code>
                                            ) to your head.
                                        </span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <span className="text-[#012CEB] font-bold">
                                            3.
                                        </span>
                                        <span>
                                            Import{" "}
                                            <code className="text-white">
                                                OriginSection.tsx
                                            </code>{" "}
                                            and include the perspective/texture
                                            CSS rules from{" "}
                                            <code className="text-white">
                                                origin-styles.css
                                            </code>
                                            .
                                        </span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <span className="text-[#012CEB] font-bold">
                                            4.
                                        </span>
                                        <span>
                                            Do NOT place inside a container with{" "}
                                            <code className="text-red-400">
                                                overflow: hidden
                                            </code>{" "}
                                            or a fixed height, so the sticky
                                            camera track can pin seamlessly!
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-3 border-t border-white/10 bg-white/[0.01] flex justify-end">
                            <button
                                onClick={() => setShowExportModal(false)}
                                className="px-4 py-1.5 text-xs font-medium text-white/70 hover:text-white hover:bg-white/10 rounded transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
