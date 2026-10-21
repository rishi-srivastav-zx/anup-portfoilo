"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useHero } from "../provider/HeroProvider";

export default function Portrait() {
    const { config, mousePosition, setHoveringPortrait } = useHero();
    const { images } = config;
    const shouldReduceMotion = useReducedMotion();

    const portraitX = shouldReduceMotion ? 0 : mousePosition.x * 8;
    const portraitY = shouldReduceMotion ? 0 : mousePosition.y * 8;

    return (
        <div className="absolute inset-x-0 top-[46%] -translate-y-[44%] sm:translate-y-0 sm:top-0 sm:bottom-0 sm:-bottom-8 md:-bottom-16 z-20 flex justify-center sm:items-end pointer-events-none">
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
        className="relative pointer-events-auto w-[clamp(195px,62vw,255px)] aspect-[836/712] sm:aspect-auto sm:w-full sm:max-w-[76vw] md:max-w-[46vw] lg:max-w-[56vw] xl:max-w-[50vw] sm:h-[95%] md:h-[102%] lg:h-[105%]"
        style={{ cursor: "none" }} // Custom cursor logic can be added here or via global styles
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
                        sizes="(max-width: 640px) 120vw, (max-width: 1024px) 75vw, 50vw"
                        style={{
                            objectFit: "contain",
                            objectPosition: "bottom center",
                            filter: "contrast(1.02)",
                        }}
                    />
                </div>

                {/* Soft natural vertical gradient overlay matching the warm beige background exactly */}
                <div
                    className="absolute inset-x-0 bottom-0 pointer-events-none h-20 sm:h-40 md:h-48"
                    style={{
                        background:
                            "linear-gradient(to bottom, rgba(230, 221, 210, 0) 0%, rgba(230, 221, 210, 0.45) 40%, rgba(230, 221, 210, 0.9) 78%, #E6DDD2 100%)",
                    }}
                />
            </motion.div>
        </div>
    );
}
