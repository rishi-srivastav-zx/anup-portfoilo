"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useHero } from "../provider/HeroProvider";

export default function Background() {
    const { config, mousePosition } = useHero();
    const { colors } = config;
    const containerRef = useRef(null);
    const [isVisible, setIsVisible] = useState(true);

    // Pause infinite animations when hero section is scrolled out of view or tab is hidden
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsVisible(entry.isIntersecting && !document.hidden);
            },
            { threshold: 0.05 }
        );

        observer.observe(container);

        const handleVisibilityChange = () => {
            if (document.hidden) {
                setIsVisible(false);
            } else if (container) {
                const rect = container.getBoundingClientRect();
                setIsVisible(rect.bottom > 0 && rect.top < window.innerHeight);
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            observer.disconnect();
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, []);

    const circleX = mousePosition.x * -4;
    const circleY = mousePosition.y * -4;

    return (
        <div
            ref={containerRef}
            className="absolute inset-0 z-0 overflow-hidden pointer-events-none"
            style={{
                background: `linear-gradient(to bottom right, ${colors.backgroundStart}, ${colors.backgroundEnd})`,
            }}
        >
            {/* Light streaks */}
            <motion.div
                animate={
                    isVisible
                        ? {
                              x: [0, -10, 0],
                              opacity: [0.2, 0.3, 0.2],
                          }
                        : { x: 0, opacity: 0.2 }
                }
                transition={
                    isVisible
                        ? {
                              duration: 10,
                              repeat: Infinity,
                              ease: "easeInOut",
                          }
                        : { duration: 0.3 }
                }
                className="absolute top-0 right-0 w-full h-full opacity-30 will-change-transform"
                style={{
                    background:
                        "linear-gradient(135deg, rgba(255,255,255,0) 30%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0) 70%)",
                    filter: "blur(40px)",
                    transform: "scale(1.5)",
                }}
            />

            {/* Center circle */}
            <motion.div
                animate={{
                    x: circleX,
                    y: circleY,
                }}
                transition={{
                    x: { type: "spring", stiffness: 50, damping: 20 },
                    y: { type: "spring", stiffness: 50, damping: 20 },
                }}
                className="absolute top-[52%] sm:top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 will-change-transform"
            >
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={
                        isVisible
                            ? {
                                  scale: [1, 1.03, 1],
                                  opacity: 1,
                              }
                            : { scale: 1, opacity: 1 }
                    }
                    transition={
                        isVisible
                            ? {
                                  opacity: { duration: 1.5 },
                                  scale: { duration: 6, repeat: Infinity, ease: "easeInOut" },
                              }
                            : { duration: 0.3 }
                    }
                    className="rounded-full w-[clamp(260px,84vw,370px)] h-[clamp(260px,84vw,370px)] sm:w-[clamp(210px,45vw,650px)] sm:h-[clamp(210px,45vw,650px)]"
                    style={{
                        backgroundColor: colors.circle,
                    }}
                />
            </motion.div>

            {/* Leaf Shadow */}
            <motion.div
                animate={
                    isVisible
                        ? {
                              rotate: [0, 2, -1, 0],
                              scale: [1, 1.02, 1],
                          }
                        : { rotate: 0, scale: 1 }
                }
                transition={
                    isVisible
                        ? {
                              duration: 12,
                              repeat: Infinity,
                              ease: "easeInOut",
                          }
                        : { duration: 0.3 }
                }
                className="absolute -bottom-20 -left-20 w-[400px] h-[400px] opacity-10 will-change-transform"
                style={{
                    backgroundImage:
                        "radial-gradient(ellipse at center, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 70%)",
                    filter: "blur(50px)",
                    borderRadius: "50% 50% 50% 0",
                }}
            />
        </div>
    );
}
