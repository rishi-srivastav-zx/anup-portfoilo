"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useHero } from "../provider/HeroProvider";

export default function Portrait() {
    const { config, mousePosition, setHoveringPortrait } = useHero();
    const { images, content: { heroName } } = config;
    const shouldReduceMotion = useReducedMotion();

    const portraitX = shouldReduceMotion ? 0 : mousePosition.x * 8;
    const portraitY = shouldReduceMotion ? 0 : mousePosition.y * 8;

    const containerVariants = {
        hidden: {},
        visible: {
            transition: { staggerChildren: 0.08, delayChildren: 0.3 }
        },
        hover: {
            transition: { staggerChildren: 0.03 }
        }
    };

    const wordLeftVariants = {
        hidden: { opacity: 0, x: shouldReduceMotion ? 0 : -30 },
        visible: { 
            opacity: 1, 
            x: 0, 
            transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] } 
        },
    };
    
    const wordRightVariants = {
        hidden: { opacity: 0, x: shouldReduceMotion ? 0 : 30 },
        visible: { 
            opacity: 1, 
            x: 0, 
            transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] } 
        },
    };

    const letterHoverVariants = {
        hidden: { filter: shouldReduceMotion ? 'none' : 'blur(12px)' },
        visible: { filter: 'blur(0px)', transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
        hover: { y: shouldReduceMotion ? 0 : -4, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } }
    };

    return (
        <>
            {/* 1. Mobile Dedicated Portrait Wrapper with Anchored Names (sm:hidden) */}
            <div className="sm:hidden absolute inset-x-0 top-[52%] -translate-y-[46%] z-20 flex justify-center pointer-events-none">
                <motion.div
                    initial={{ y: shouldReduceMotion ? 0 : 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1, x: portraitX, y: portraitY }}
                    whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
                    onHoverStart={() => setHoveringPortrait(true)}
                    onHoverEnd={() => setHoveringPortrait(false)}
                    transition={{
                        y: { duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 },
                        opacity: { duration: 1.2, delay: 0.2 },
                        scale: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
                        x: { type: "spring", stiffness: 50, damping: 25 },
                    }}
                    className="relative pointer-events-auto w-[clamp(300px,95vw,390px)] aspect-[836/712] select-none"
                    style={{ cursor: "none" }}
                >
                    {/* Name: ANUP — positioned upward above the hair/forehead */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        whileHover="hover"
                        className="absolute -top-7 sm:-top-8 left-0.5 sm:left-0 z-30 pointer-events-auto"
                        style={{ fontFamily: "'Montserrat', sans-serif" }}
                    >
                        <motion.span
                            variants={wordLeftVariants}
                            className="flex font-black tracking-[-0.03em] uppercase leading-none text-[#14100E]"
                            style={{
                                fontSize: "clamp(22px, 7.2vw, 32px)",
                                fontWeight: 800,
                            }}
                        >
                            {heroName.first.split('').map((char, index) => (
                                <motion.span key={`m-first-${index}`} variants={letterHoverVariants} className="inline-block">
                                    {char}
                                </motion.span>
                            ))}
                        </motion.span>
                    </motion.div>

                    {/* Mobile Portrait Cutout Image */}
                    <div
                        className="relative w-full h-full z-10"
                        style={{
                            maskImage:
                                "linear-gradient(to bottom, black 0%, black 76%, rgba(0,0,0,0.7) 88%, transparent 100%)",
                            WebkitMaskImage:
                                "linear-gradient(to bottom, black 0%, black 76%, rgba(0,0,0,0.7) 88%, transparent 100%)",
                        }}
                    >
                        <Image
                            src={images?.portrait || "/images/anup_portrait.png"}
                            alt="Anup Rawat"
                            fill
                            priority
                            sizes="(max-width: 640px) 95vw, 50vw"
                            style={{
                                objectFit: "contain",
                                objectPosition: "center center",
                                filter: "contrast(1.02)",
                            }}
                        />
                    </div>

                    {/* Soft natural bottom gradient overlay */}
                    <div
                        className="absolute inset-x-0 bottom-0 z-20 pointer-events-none h-16"
                        style={{
                            background:
                                "linear-gradient(to bottom, rgba(230, 221, 210, 0) 0%, rgba(230, 221, 210, 0.45) 40%, rgba(230, 221, 210, 0.9) 78%, #E6DDD2 100%)",
                        }}
                    />

                    {/* Name: RAWAT — positioned on the right side flanking head/shoulder */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        whileHover="hover"
                        className="absolute top-[22%] right-1.5 sm:right-2 z-30 pointer-events-auto"
                        style={{ fontFamily: "'Montserrat', sans-serif" }}
                    >
                        <motion.span
                            variants={wordRightVariants}
                            className="flex font-black tracking-[-0.03em] uppercase leading-none text-[#14100E]"
                            style={{
                                fontSize: "clamp(24px, 8vw, 36px)",
                                fontWeight: 800,
                            }}
                        >
                            {heroName.last.split('').map((char, index) => (
                                <motion.span key={`m-last-${index}`} variants={letterHoverVariants} className="inline-block">
                                    {char}
                                </motion.span>
                            ))}
                        </motion.span>
                    </motion.div>
                </motion.div>
            </div>

            {/* 2. Desktop / Tablet Portrait (hidden sm:flex) */}
            <div className="hidden sm:flex absolute inset-x-0 top-[52%] -translate-y-[46%] z-20 justify-center pointer-events-none">
                <motion.div
                    initial={{ y: shouldReduceMotion ? 0 : 60, opacity: 0 }}
                    animate={{ y: 0, opacity: 1, x: portraitX, y: portraitY }}
                    whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
                    onHoverStart={() => setHoveringPortrait(true)}
                    onHoverEnd={() => setHoveringPortrait(false)}
                    transition={{
                        y: { duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 },
                        opacity: { duration: 1.2, delay: 0.2 },
                        scale: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
                        x: { type: "spring", stiffness: 50, damping: 25 },
                    }}
                    className="relative pointer-events-auto w-[clamp(440px,55vw,680px)] aspect-[836/712] select-none"
                    style={{ cursor: "none" }}
                >
                    <div
                        className="relative w-full h-full"
                        style={{
                            maskImage:
                                "linear-gradient(to bottom, black 0%, black 76%, rgba(0,0,0,0.7) 88%, transparent 100%)",
                            WebkitMaskImage:
                                "linear-gradient(to bottom, black 0%, black 76%, rgba(0,0,0,0.7) 88%, transparent 100%)",
                        }}
                    >
                        <Image
                            src={images?.portrait || "/images/anup_portrait.png"}
                            alt="Anup Rawat"
                            fill
                            priority
                            sizes="(max-width: 1024px) 75vw, 50vw"
                            style={{
                                objectFit: "contain",
                                objectPosition: "center center",
                                filter: "contrast(1.02)",
                            }}
                        />
                    </div>

                    {/* Soft natural vertical gradient overlay matching the warm beige background exactly */}
                    <div
                        className="absolute inset-x-0 bottom-0 pointer-events-none h-20 sm:h-24 md:h-28"
                        style={{
                            background:
                                "linear-gradient(to bottom, rgba(230, 221, 210, 0) 0%, rgba(230, 221, 210, 0.45) 40%, rgba(230, 221, 210, 0.9) 78%, #E6DDD2 100%)",
                        }}
                    />
                </motion.div>
            </div>
        </>
    );
}
