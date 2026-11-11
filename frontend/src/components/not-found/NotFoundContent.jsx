"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Film } from "lucide-react";

export default function NotFoundContent() {
    const router = useRouter();
    const shouldReduceMotion = useReducedMotion();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleGoBack = () => {
        if (typeof window !== "undefined" && window.history.length > 1) {
            router.back();
        } else {
            router.push("/");
        }
    };

    // Stagger animation container
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: shouldReduceMotion ? 0 : 0.12,
                delayChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.8,
                ease: [0.16, 1, 0.3, 1],
            },
        },
    };

    const num404Variants = {
        hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 30, scale: 0.98 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                duration: 1.1,
                ease: [0.16, 1, 0.3, 1],
            },
        },
    };

    return (
        <main
            role="main"
            className="relative min-h-screen w-full bg-[#E6DDD2] text-[#14100E] flex flex-col justify-between items-center overflow-x-hidden select-none px-4 sm:px-6 md:px-10 pt-6 pb-24 sm:pb-28 md:pb-12"
        >
            {/* 1. ATMOSPHERIC CINEMATIC BACKGROUND */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 overflow-hidden z-0"
            >
                {/* Slow drifting cinematic ambient visual */}
                <motion.div
                    animate={
                        shouldReduceMotion
                            ? {}
                            : {
                                  scale: [1, 1.04, 1],
                                  opacity: [0.38, 0.46, 0.38],
                              }
                    }
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage: `radial-gradient(circle at 50% 45%, rgba(244, 239, 230, 0.92) 0%, rgba(230, 221, 210, 0.82) 45%, rgba(214, 203, 190, 0.95) 100%), url('/origin-images/Cinematic Filmmaking Storyboard Workspace.png')`,
                        filter: "blur(20px)",
                    }}
                />

                {/* Smoky vignette & muted cobalt atmospheric glow */}
                <div
                    className="absolute inset-0"
                    style={{
                        background:
                            "radial-gradient(ellipse 70% 60% at 50% 48%, rgba(1, 44, 235, 0.06) 0%, rgba(20, 16, 14, 0.03) 55%, rgba(20, 16, 14, 0.16) 100%)",
                    }}
                />

                {/* Delicate film grain texture */}
                <div className="absolute inset-0 studio-film-grain opacity-60 mix-blend-multiply" />

                {/* Cinematic 2.39:1 Anamorphic Framing Mask lines (Desktop subtle guides) */}
                <div className="hidden lg:block absolute inset-x-8 xl:inset-x-16 top-12 bottom-12 border border-[#14100E]/10 pointer-events-none" />

                {/* Center crosshair for optical alignment */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 pointer-events-none opacity-20">
                    <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[1px] bg-[#14100E]" />
                    <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[1px] bg-[#14100E]" />
                </div>
            </div>

            {/* 2. TOP METADATA BAR / VIEWFINDER HUD */}
            <motion.header
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.15 }}
                className="relative z-10 w-full max-w-6xl mx-auto flex items-center justify-between text-[10px] sm:text-[11px] font-mono tracking-wider text-[#6B625A] pt-1"
            >
                {/* Brand Logo & Studio Mark */}
                <Link
                    href="/"
                    className="flex items-center gap-2.5 group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#012CEB] rounded-lg p-1"
                    title="Return to Anup Rawat Portfolio"
                >
                    <img
                        src="/ar-monogram.webp"
                        alt="Anup Rawat"
                        className="w-7 h-7 sm:w-8 sm:h-8 object-contain transition-transform group-hover:scale-105 duration-300"
                    />
                    <div className="flex flex-col text-left">
                        <span className="font-sans font-bold text-xs text-[#14100E] tracking-tight leading-tight group-hover:text-[#012CEB] transition-colors">
                            ANUP RAWAT
                        </span>
                        <span className="text-[9px] uppercase tracking-[0.2em] text-[#8C8278]">
                            CINEMATOGRAPHER
                        </span>
                    </div>
                </Link>

                {/* Viewfinder Status / Timecode */}
                <div className="flex items-center gap-3 sm:gap-6">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                        <span className="font-semibold text-red-700 uppercase tracking-widest hidden xs:inline">
                            LOST TAKE
                        </span>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 text-[#8C8278]">
                        <span>TC</span>
                        <span className="text-[#14100E] font-semibold tabular-nums">
                            00:04:04:00
                        </span>
                    </div>
                    <div className="px-2.5 py-1 rounded-md border border-[#D6CDC2] bg-[#F4EDE4]/70 text-[10px] uppercase font-semibold text-[#14100E] shadow-2xs">
                        2.39:1 ANAMORPHIC
                    </div>
                </div>
            </motion.header>

            {/* 3. CENTER HERO COMPOSITION */}
            <div className="relative z-10 w-full max-w-4xl mx-auto my-auto py-6 sm:py-10 flex flex-col items-center text-center">
                {/* Viewfinder Framing Marks (Top Left & Top Right) */}
                <div className="w-full flex justify-between text-[#8C8278] text-[11px] sm:text-xs font-mono select-none px-2 sm:px-6 mb-2 opacity-50">
                    <span>┌ S35 · 50MM T1.3</span>
                    <span>ISO 800 · 5600K ┐</span>
                </div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex flex-col items-center w-full"
                >
                    {/* Small Eyebrow */}
                    <motion.div
                        variants={itemVariants}
                        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#14100E]/15 bg-[#F4EDE4]/85 backdrop-blur-xs mb-3 sm:mb-5 shadow-xs"
                    >
                        <Film className="w-3.5 h-3.5 text-[#012CEB]" />
                        <span className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.24em] font-bold text-[#14100E]">
                            AN UNEXPECTED FRAME
                        </span>
                    </motion.div>

                    {/* Massive Elegant 404 Visual Element */}
                    <motion.div
                        variants={num404Variants}
                        className="relative my-1 sm:my-2 flex items-center justify-center"
                    >
                        {/* Soft atmospheric gradient glow behind 404 */}
                        <div
                            aria-hidden="true"
                            className="absolute -inset-10 rounded-full bg-gradient-to-r from-blue-600/10 via-amber-500/10 to-blue-600/10 blur-3xl opacity-75 pointer-events-none"
                        />

                        <h1
                            className="relative text-[105px] xs:text-[120px] sm:text-[160px] md:text-[210px] lg:text-[250px] font-bold font-editorial text-[#14100E] leading-none tracking-[-0.03em] select-none"
                            style={{
                                textShadow:
                                    "0 18px 45px rgba(20, 16, 14, 0.12), 0 2px 4px rgba(20, 16, 14, 0.08)",
                            }}
                        >
                            4
                            <span className="relative inline-block mx-1 sm:mx-2">
                                <span className="text-[#012CEB]/90 italic font-editorial">
                                    0
                                </span>
                                {/* Subtle anamorphic lens iris line through the zero */}
                                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[2px] bg-[#012CEB]/30 rotate-45 pointer-events-none" />
                            </span>
                            4
                        </h1>
                    </motion.div>

                    {/* Main Heading */}
                    <motion.h2
                        variants={itemVariants}
                        className="font-sans font-bold text-2xl sm:text-3xl md:text-4xl text-[#14100E] tracking-tight leading-snug max-w-2xl px-4"
                        style={{ textWrap: "balance" }}
                    >
                        Looks like you&apos;ve wandered off script.
                    </motion.h2>

                    {/* Supporting Text */}
                    <motion.p
                        variants={itemVariants}
                        className="text-xs sm:text-sm md:text-base text-[#6B625A] font-sans max-w-lg mt-3 sm:mt-4 leading-relaxed px-4"
                        style={{ textWrap: "balance" }}
                    >
                        The scene you&apos;re looking for isn&apos;t in this cut.
                        Let&apos;s get you back to the story.
                    </motion.p>

                    {/* 4. INTERACTIVE ACTIONS (Primary Button & Secondary Action) */}
                    <motion.div
                        variants={itemVariants}
                        className="mt-7 sm:mt-9 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto px-4"
                    >
                        {/* Primary Button: Return to Homepage */}
                        <Link
                            href="/"
                            className="group relative inline-flex items-center justify-center gap-2.5 w-full sm:w-auto min-w-[210px] px-7 py-3.5 rounded-xl bg-[#14100E] hover:bg-[#012CEB] active:bg-[#0022b8] text-[#F4EDE4] font-semibold text-xs sm:text-sm font-sans tracking-wide transition-all duration-300 shadow-[0_8px_24px_rgba(20,16,14,0.18)] hover:shadow-[0_12px_32px_rgba(1,44,235,0.32)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#012CEB] focus-visible:ring-offset-2 cursor-pointer"
                        >
                            <span>Return to Homepage</span>
                            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                        </Link>

                        {/* Secondary Action: Go Back */}
                        <button
                            type="button"
                            onClick={handleGoBack}
                            className="group inline-flex items-center justify-center gap-2 w-full sm:w-auto min-w-[150px] px-6 py-3.5 rounded-xl border-2 border-[#14100E]/20 hover:border-[#14100E] bg-[#F4EDE4]/80 hover:bg-[#F4EDE4] text-[#14100E] font-semibold text-xs sm:text-sm font-sans tracking-wide transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#14100E] cursor-pointer"
                            aria-label="Go back to previous page"
                        >
                            <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1" />
                            <span>Go Back</span>
                        </button>
                    </motion.div>
                </motion.div>

                {/* Viewfinder Framing Marks (Bottom Left & Bottom Right) */}
                <div className="w-full flex justify-between text-[#8C8278] text-[11px] sm:text-xs font-mono select-none px-2 sm:px-6 mt-6 sm:mt-8 opacity-50">
                    <span>└ FRAME BUFFER: NULL</span>
                    <span>ROLL: UNARCHIVED ┘</span>
                </div>
            </div>

            {/* 5. FOOTER CINEMATIC METADATA LINE */}
            <motion.footer
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="relative z-10 w-full max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left border-t border-[#14100E]/15 pt-4 text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-[#6B625A]"
            >
                <div>
                    <span className="text-[#14100E] font-semibold">
                        FRAME 404
                    </span>{" "}
                    | <span>SCENE NOT FOUND</span> |{" "}
                    <span className="text-[#14100E] font-semibold">
                        ANUP RAWAT
                    </span>
                </div>

                <div className="flex items-center gap-4 text-[#8C8278]">
                    <span>STUDIO ARCHIVE // 2026</span>
                    <span className="opacity-40">•</span>
                    <Link
                        href="/blog"
                        className="text-[#14100E] hover:text-[#012CEB] underline underline-offset-2 transition-colors cursor-pointer"
                    >
                        Cinematic Journal
                    </Link>
                </div>
            </motion.footer>
        </main>
    );
}

