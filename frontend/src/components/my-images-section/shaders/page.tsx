import { ImageManagerModal } from "../components/ImageManagerModal";
import { PlateIndexDrawer } from "../components/PlateIndexDrawer";
import { Scene } from "../components/Scene";
import { SketchbookControls } from "../components/SketchbookControls";
import { SketchbookHeader } from "../components/SketchbookHeader";
import { SketchbookProvider } from "../provider/SketchbookProvider";

export { Scene };

export default function App() {
    return (
        <SketchbookProvider>
            <main className="relative w-screen h-screen overflow-hidden bg-[#ece7dc] select-none">
                {/* 3D Curled Sketchbook Scene */}
                <Scene />

                {/* Dynamic Fields & Typography Drawer */}
                <SketchbookControls />

                {/* Image Manager Modal (Add your own images, reorder, presets) */}
                <ImageManagerModal />

                {/* Table of Plates Index Drawer */}
                <PlateIndexDrawer />
            </main>
        </SketchbookProvider>
    );
}
