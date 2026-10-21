"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useHero } from "../provider/HeroProvider";

const CINEMATOGRAPHY_QUOTES = [
    "Framing by light, more critical by moonlight.",
    "Light is the ink with which we write cinema.",
    "Every frame is a choice: what to reveal, what to hide in shadows.",
    "Light makes photography. Embrace light, but above all, know light.",
    "Cinematography is infinite in its possibilities.",
    "The camera doesn’t just record reality; it creates emotional truth.",
    "A great shot is not merely observed — it is felt deeply.",
];

export default function Navbar() {
    const { config } = useHero();
    const {
        content: { navbar },
        colors,
    } = config;

    const [scrollPercent, setScrollPercent] = useState(0);
    const [isScrolled, setIsScrolled] = useState(false);
    const [quoteIndex, setQuoteIndex] = useState(0);
    const [isQuoteVisible, setIsQuoteVisible] = useState(true);
    const [isQuoteHovered, setIsQuoteHovered] = useState(false);

    // Track live scroll percentage
    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;
            const docHeight = document.documentElement.scrollHeight;
            const winHeight = window.innerHeight;
            const totalScrollable = docHeight - winHeight;

            setIsScrolled(scrollY > 25);

            if (totalScrollable <= 0) {
                setScrollPercent(0);
                return;
            }

            const rawProgress = (scrollY / totalScrollable) * 100;
            const clamped = Math.min(100, Math.max(0, Math.round(rawProgress)));
            setScrollPercent(clamped);
        };

        handleScroll();
        window.addEventListener("scroll", handleScroll, { passive: true });
        window.addEventListener("resize", handleScroll, { passive: true });

        return () => {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("resize", handleScroll);
        };
    }, []);

    // Cycle cinematography quotes with a deliberate pause between each
    useEffect(() => {
        if (isQuoteHovered) return;

        // Display current quote for 5.8s
        const displayTimer = setTimeout(() => {
            // 1. Gently dissolve out
            setIsQuoteVisible(false);

            // 2. Graceful breathing pause of 850ms before the next quote fades in
            const pauseTimer = setTimeout(() => {
                setQuoteIndex(
                    (prev) => (prev + 1) % CINEMATOGRAPHY_QUOTES.length,
                );
                setIsQuoteVisible(true);
            }, 850);

            return () => clearTimeout(pauseTimer);
        }, 5800);

        return () => clearTimeout(displayTimer);
    }, [quoteIndex, isQuoteHovered]);

    const handleBrandClick = (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleNextQuote = () => {
        setIsQuoteVisible(false);
        setTimeout(() => {
            setQuoteIndex((prev) => (prev + 1) % CINEMATOGRAPHY_QUOTES.length);
            setIsQuoteVisible(true);
        }, 350);
    };

    // SVG circular circumference: 2 * PI * 9 ≈ 56.55
    const circleRadius = 9;
    const circumference = 2 * Math.PI * circleRadius;
    const strokeOffset = circumference - (scrollPercent / 100) * circumference;

    return (
        <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className={`fixed top-0 left-0 right-0 z-50 w-full flex justify-between items-center px-3 sm:px-6 md:px-12 transition-all duration-300 font-sans ${
                isScrolled
                    ? "py-2.5 sm:py-3.5 bg-[#E6DDD2]/85 backdrop-blur-md shadow-[0_4px_24px_rgba(20,16,14,0.06)] border-b border-[#14100E]/10"
                    : "py-3 sm:py-5 bg-transparent border-b border-transparent"
            }`}
            style={{ color: colors.text }}
        >
            {/* 1. LEFT: Brand Name & Divider Line */}
            <div className="flex items-center space-x-4 sm:space-x-6 shrink-0">
                <a
                    href="#home"
                    onClick={handleBrandClick}
                    className="flex items-center text-base sm:text-lg cursor-pointer select-none group"
                    style={{ letterSpacing: "0.08em" }}
                    aria-label="Back to top"
                >
                    <span className="font-light transition-opacity group-hover:opacity-75">
                        {navbar.firstName}
                    </span>
                    <span className="font-semibold ml-1.5 transition-opacity group-hover:opacity-75">
                        {navbar.lastName}
                    </span>
                </a>

                <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.8 }}
                    className="hidden xl:block w-20 h-[1px] origin-left"
                    style={{ backgroundColor: colors.lines, opacity: 0.4 }}
                />
            </div>

            {/* 2. MIDDLE: Curated Cinematography Quotes (Bigger text, no numbers, gentle pause between quotes) */}
            <div
                className="hidden sm:flex flex-1 items-center justify-center px-4 sm:px-6 max-w-lg md:max-w-xl lg:max-w-2xl mx-auto overflow-hidden cursor-pointer"
                onMouseEnter={() => setIsQuoteHovered(true)}
                onMouseLeave={() => setIsQuoteHovered(false)}
                onClick={handleNextQuote}
                title="Click to advance quote"
            >
                <AnimatePresence mode="wait">
                    {isQuoteVisible && (
                        <motion.div
                            key={quoteIndex}
                            initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
                            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                            exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
                            transition={{
                                duration: 0.7,
                                ease: [0.16, 1, 0.3, 1],
                            }}
                            className="flex items-center justify-center text-center"
                        >
                            <p className="font-serif-italic italic text-base sm:text-lg md:text-[19px] lg:text-[21px] font-normal tracking-tight text-[#14100E] leading-snug drop-shadow-xs select-none">
                                &ldquo;{CINEMATOGRAPHY_QUOTES[quoteIndex]}
                                &rdquo;
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* 3. RIGHT: Live Scroll Percentage & Circular Dial Indicator */}
            <div className="flex items-center space-x-3 sm:space-x-3.5 select-none font-mono shrink-0">
                <span className="text-[10px] sm:text-xs tracking-[0.18em] uppercase opacity-60 font-sans hidden xs:inline-block">
                    Scroll
                </span>

                {/* Live numerical percentage */}
                <span
                    className="text-xs sm:text-sm font-semibold tabular-nums tracking-wider"
                    style={{ minWidth: "36px", textAlign: "right" }}
                >
                    {scrollPercent}%
                </span>

                {/* Circular Progress Meter with Center Dot */}
                <div
                    className="relative w-6 h-6 flex items-center justify-center shrink-0"
                    title={`Page scroll progress: ${scrollPercent}%`}
                >
                    <svg
                        className="w-6 h-6 -rotate-90 transform"
                        viewBox="0 0 24 24"
                    >
                        {/* Background track circle */}
                        <circle
                            cx="12"
                            cy="12"
                            r={circleRadius}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            className="opacity-20"
                        />
                        {/* Animated progress ring */}
                        <circle
                            cx="12"
                            cy="12"
                            r={circleRadius}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeOffset}
                            strokeLinecap="round"
                            className="transition-[stroke-dashoffset] duration-150 ease-out"
                        />
                    </svg>
                    {/* Concentric center dot */}
                    <span
                        className="w-1.5 h-1.5 rounded-full absolute transition-transform duration-150"
                        style={{
                            backgroundColor: colors.text,
                            transform:
                                scrollPercent === 100
                                    ? "scale(1.3)"
                                    : "scale(1)",
                        }}
                    />
                </div>
            </div>

            {/* Hairline Bottom Progress Bar */}
            <div
                className="absolute bottom-0 left-0 h-[1.5px] bg-[#14100E] transition-all duration-150 ease-out origin-left pointer-events-none"
                style={{
                    width: `${scrollPercent}%`,
                    opacity: isScrolled ? 0.35 : 0.15,
                }}
            />
        </motion.header>
    );
}
