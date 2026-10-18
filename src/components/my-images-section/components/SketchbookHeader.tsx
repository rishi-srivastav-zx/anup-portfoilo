import {
    BookOpen,
    ChevronLeft,
    ChevronRight,
    Image as ImageIcon,
    Layers,
    Plus,
    Sliders,
    Sparkles,
} from "lucide-react";
import { useSketchbook } from "../provider/SketchbookProvider";

export function SketchbookHeader() {
    const {
        pages,
        currentPageIndex,
        currentPage,
        metadata,
        typography,
        prevPage,
        nextPage,
        toggleImageManager,
        toggleIndexDrawer,
        toggleControls,
    } = useSketchbook();

    const formattedIndex = String(currentPageIndex + 1).padStart(2, "0");
    const totalPages = String(pages.length).padStart(2, "0");

    return (
        <header className="fixed top-0 left-0 right-0 z-30 pointer-events-none px-3 sm:px-6 py-3 sm:py-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
                {/* Left: Branding & Title */}
                <div className="pointer-events-auto flex items-center gap-3 bg-[#ece7dc]/85 backdrop-blur-md px-3.5 py-2 rounded-full border border-[#2b2721]/12 shadow-[0_4px_20px_rgba(43,39,33,0.08)]">
                    <div className="w-7 h-7 rounded-full bg-[#2b2721] text-[#ece7dc] flex items-center justify-center shadow-xs">
                        <BookOpen className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                            <span className="text-xs font-serif tracking-widest uppercase text-[#2b2721] font-medium">
                                {metadata.title}
                            </span>
                            <span className="text-[10px] text-[#2b2721]/40 hidden sm:inline">
                                •
                            </span>
                            <span className="text-[11px] text-[#2b2721]/60 font-serif italic hidden sm:inline">
                                {metadata.author}
                            </span>
                        </div>
                        <div className="text-[10px] text-[#2b2721]/50 font-serif hidden md:block">
                            {metadata.edition} • {metadata.year}
                        </div>
                    </div>
                </div>

                {/* Center: Interactive Plate Controller & Current Location */}
                <div className="pointer-events-auto hidden md:flex items-center gap-2 bg-[#ece7dc]/85 backdrop-blur-md px-4 py-2 rounded-full border border-[#2b2721]/12 shadow-[0_4px_20px_rgba(43,39,33,0.08)]">
                    <button
                        onClick={prevPage}
                        aria-label="Previous plate"
                        className="p-1 rounded-full text-[#2b2721]/70 hover:text-[#2b2721] hover:bg-[#2b2721]/6 transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>

                    <div className="flex items-center gap-2 px-1">
                        <span className="font-mono text-xs font-medium text-[#2b2721]">
                            {formattedIndex}
                        </span>
                        <span className="text-xs text-[#2b2721]/30">/</span>
                        <span className="font-mono text-xs text-[#2b2721]/50">
                            {totalPages}
                        </span>
                        <span className="text-[#2b2721]/20 mx-1">|</span>
                        <span className="text-xs font-serif font-medium text-[#2b2721] max-w-[160px] truncate">
                            {currentPage?.title || "Plate"}
                        </span>
                        {currentPage?.place && (
                            <span className="text-[10px] uppercase tracking-wider text-[#9a6a3e] bg-[#9a6a3e]/10 px-1.5 py-0.5 rounded font-mono">
                                {currentPage.place}
                            </span>
                        )}
                    </div>

                    <button
                        onClick={nextPage}
                        aria-label="Next plate"
                        className="p-1 rounded-full text-[#2b2721]/70 hover:text-[#2b2721] hover:bg-[#2b2721]/6 transition-colors"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>

                {/* Right: Actions */}
                <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2">
                    {/* Add My Images Button */}
                    <button
                        onClick={toggleImageManager}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#2b2721] text-[#ece7dc] text-xs font-serif tracking-wide shadow-md hover:bg-[#3d372e] transition-all hover:scale-[1.02] active:scale-[0.98]"
                        title="Add your own images into the sketchbook"
                    >
                        <Plus className="w-3.5 h-3.5 text-[#e0b07b]" />
                        <span className="font-medium hidden sm:inline">
                            Add My Images
                        </span>
                        <span className="font-medium sm:hidden">Images</span>
                    </button>

                    {/* Table of Plates Index */}
                    <button
                        onClick={toggleIndexDrawer}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#ece7dc]/85 backdrop-blur-md border border-[#2b2721]/12 text-[#2b2721] text-xs font-serif tracking-wide hover:bg-[#ece7dc] transition-all shadow-xs"
                        title="Browse all plates in the sketchbook"
                    >
                        <Layers className="w-3.5 h-3.5 text-[#2b2721]/70" />
                        <span className="hidden md:inline font-medium">
                            Plates Index
                        </span>
                    </button>

                    {/* Dynamic Fields & Typography Controls */}
                    <button
                        onClick={toggleControls}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#ece7dc]/85 backdrop-blur-md border border-[#2b2721]/12 text-[#2b2721] text-xs font-serif tracking-wide hover:bg-[#ece7dc] transition-all shadow-xs"
                        title="Configure dynamic fields and typography"
                    >
                        <Sliders className="w-3.5 h-3.5 text-[#2b2721]/70" />
                        <span className="hidden lg:inline font-medium">
                            Customize
                        </span>
                    </button>
                </div>
            </div>
        </header>
    );
}
