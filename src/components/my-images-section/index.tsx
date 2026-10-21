"use client";

import { ImageManagerModal } from "./components/ImageManagerModal";
import { PlateIndexDrawer } from "./components/PlateIndexDrawer";
import { Scene } from "./components/Scene";
import { SketchbookControls } from "./components/SketchbookControls";
import { SketchbookHeader } from "./components/SketchbookHeader";
import { SketchbookProvider } from "./provider/SketchbookProvider";

export {
    Scene,
    SketchbookProvider,
    SketchbookHeader,
    SketchbookControls,
    ImageManagerModal,
    PlateIndexDrawer,
};

export function MyImagesSection() {
    return (
        <SketchbookProvider>
            <section
                id="my-images-section"
                className="relative w-full h-screen overflow-hidden bg-[#E6DDD2] select-none"
            >
                {/* Seamless ambient transition from Origin Section */}
                <div className="absolute top-0 left-0 right-0 h-16 pointer-events-none z-20 bg-gradient-to-b from-[#E6DDD2] to-transparent" />

                {/* Seamless ambient transition to Best Work Section */}
                <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none z-20 bg-gradient-to-t from-[#E6DDD2] to-transparent" />

                {/* 3D Curled Sketchbook Scene */}
                <Scene />

                {/* Dynamic Fields & Typography Drawer */}
                <SketchbookControls />

                {/* Image Manager Modal (Add your own images, reorder, presets) */}
                <ImageManagerModal />

                {/* Table of Plates Index Drawer */}
                <PlateIndexDrawer />
            </section>
        </SketchbookProvider>
    );
}

export default MyImagesSection;
