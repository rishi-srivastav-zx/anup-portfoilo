"use client";

import { useEffect, useRef, useState } from "react";
import { ImageManagerModal } from "./components/ImageManagerModal";
import { PlateIndexDrawer } from "./components/PlateIndexDrawer";
import { Scene } from "./components/Scene";
import { SketchbookControls } from "./components/SketchbookControls";
import { SketchbookHeader } from "./components/SketchbookHeader";
import { SketchbookProvider, useSketchbook } from "./provider/SketchbookProvider";

export {
    Scene,
    SketchbookProvider,
    SketchbookHeader,
    SketchbookControls,
    ImageManagerModal,
    PlateIndexDrawer,
};

function SketchbookSectionContent() {
    const { activePalette } = useSketchbook();
    const sectionRef = useRef<HTMLElement>(null);
    const [shouldMountScene, setShouldMountScene] = useState(false);

    // Lazy-mount the sketchbook scene when #my-images-section approaches the viewport
    useEffect(() => {
        const el = sectionRef.current;
        if (!el) return;

        if (typeof IntersectionObserver === "undefined") {
            setShouldMountScene(true);
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setShouldMountScene(true);
                    observer.disconnect();
                }
            },
            { rootMargin: "0px" }, // Keep Test A: mount only when section enters viewport
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <section
            ref={sectionRef}
            id="my-images-section"
            className="relative w-full h-[560px] sm:h-[660px] md:h-[100dvh] md:min-h-[500px] overflow-hidden select-none z-10 font-sans transition-colors duration-500"
            style={{ backgroundColor: activePalette?.paperColor || "#E6DDD2" }}
            aria-label="Visual Chronicles & Photographic Archive"
        >
            <h2 className="sr-only">Visual Chronicles — Curated Photographic Stills & Cinematography Archive</h2>

            {/* Seamless ambient transition from Origin Section (#010204 dark) */}
            <div className="absolute top-0 left-0 right-0 h-16 pointer-events-none z-20 bg-gradient-to-b from-[#010204]/40 via-transparent to-transparent" />

            {/* Seamless ambient transition to Best Work Section (#010204 dark) */}
            <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none z-20 bg-gradient-to-t from-[#010204]/40 via-transparent to-transparent" />

            {/* Botanical Watercolor Paper Canvas Ground */}
            <div
                className="absolute inset-0 pointer-events-none z-0 bg-cover bg-center bg-no-repeat opacity-100 transition-opacity duration-700"
                style={{ backgroundImage: `url('/images/botanical_sketchbook_bg.webp')` }}
                aria-hidden="true"
            />

            {/* 3D Curled Sketchbook Scene (lazy-mounted near viewport) */}
            {shouldMountScene ? (
                <Scene />
            ) : (
                <div className="w-full h-full" aria-hidden="true" />
            )}

            {/* Dynamic Fields & Typography Drawer */}
            <SketchbookControls />

            {/* Image Manager Modal (Add your own images, reorder, presets) */}
            <ImageManagerModal />

            {/* Table of Plates Index Drawer */}
            <PlateIndexDrawer />
        </section>
    );
}

export function MyImagesSection() {
    return (
        <SketchbookProvider>
            <SketchbookSectionContent />
        </SketchbookProvider>
    );
}

export default MyImagesSection;
