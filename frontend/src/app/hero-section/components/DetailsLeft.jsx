"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useHero } from "../provider/HeroProvider";

export default function DetailsLeft() {
    const { config } = useHero();
    const {
        content: { topLeftBox, careerSteps },
        colors,
    } = config;
    const shouldReduceMotion = useReducedMotion();

    return (
        <div className="absolute left-3 sm:left-6 md:left-12 top-2 sm:top-6 bottom-24 sm:bottom-28 md:bottom-12 z-30 pointer-events-none flex flex-col justify-between">
            {/* Top Left Box */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, delay: 1, ease: [0.16, 1, 0.3, 1] }}
                className="relative px-2.5 py-1.5 sm:px-4 sm:py-3 pointer-events-auto group max-w-fit"
                style={{ color: colors.text }}
            >
                <motion.div
                    className="absolute top-0 left-0 w-2.5 sm:w-3 h-2.5 sm:h-3 border-t border-l"
                    style={{ borderColor: colors.lines }}
                    variants={{
                        hover: {
                            top: -2,
                            left: -2,
                            transition: { duration: 0.3, ease: "easeOut" },
                        },
                    }}
                    whileHover="hover"
                    inherit={false}
                />
                <motion.div
                    className="absolute bottom-0 right-0 w-2.5 sm:w-3 h-2.5 sm:h-3 border-b border-r"
                    style={{ borderColor: colors.lines }}
                    variants={{
                        hover: {
                            bottom: -2,
                            right: -2,
                            transition: { duration: 0.3, ease: "easeOut" },
                        },
                    }}
                    whileHover="hover"
                    inherit={false}
                />
                {/* Transparent overlay for hover detection */}
                <div className="absolute inset-0 cursor-default" />

                <p className="text-xs sm:text-sm font-semibold tracking-wide uppercase relative z-10">
                    {topLeftBox.line1}
                </p>
                <p
                    className="text-[10px] sm:text-xs mt-0.5 sm:mt-1 relative z-10"
                    style={{ color: colors.secondary }}
                >
                    {topLeftBox.line2}
                </p>
            </motion.div>

            {/* Bottom Left Items (Desktop / Tablet only — replaced by continuous ticker on mobile) */}
            <div className="hidden sm:flex flex-col space-y-1 sm:space-y-4 md:space-y-6 max-w-[10.5rem] sm:max-w-[16rem] md:max-w-[22rem] mt-auto pb-1 sm:pb-4 bg-[#E6DDD2]/90 sm:bg-transparent backdrop-blur-[4px] sm:backdrop-blur-none p-1.5 sm:p-0 rounded-md border border-[#14100E]/10 sm:border-0 shadow-sm sm:shadow-none">
                {careerSteps.map((step, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            duration: 0.8,
                            delay: 1.2 + idx * 0.15,
                            ease: [0.16, 1, 0.3, 1],
                        }}
                        className="group pointer-events-auto cursor-default flex flex-col"
                        whileHover="hover"
                    >
                        <p
                            className="text-[8px] sm:text-[10px] uppercase tracking-wider mb-0.5 sm:mb-1"
                            style={{ color: colors.secondary }}
                        >
                            {step.label}
                        </p>
                        <div className="flex items-center">
                            <motion.div
                                className="h-[1px] mr-0"
                                style={{ backgroundColor: colors.lines }}
                                variants={{
                                    hover: {
                                        width: 40,
                                        marginRight: 12,
                                        transition: {
                                            duration: 0.4,
                                            ease: [0.16, 1, 0.3, 1],
                                        },
                                    },
                                }}
                                initial={{ width: 12, marginRight: 6 }}
                            />
                            <motion.p
                                className="text-[10.5px] sm:text-sm font-medium tracking-wide leading-tight"
                                style={{ color: colors.text }}
                                variants={{
                                    hover: {
                                        x: 6,
                                        transition: {
                                            duration: 0.4,
                                            ease: [0.16, 1, 0.3, 1],
                                        },
                                    },
                                }}
                            >
                                {step.value}
                            </motion.p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
