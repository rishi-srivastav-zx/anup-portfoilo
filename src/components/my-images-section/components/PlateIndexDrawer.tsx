import { BookOpen, Check, ChevronRight, Layers, Plus, X } from "lucide-react";
import { useSketchbook } from "../provider/SketchbookProvider";

export function PlateIndexDrawer() {
    const {
        pages,
        currentPageIndex,
        isIndexDrawerOpen,
        setIsIndexDrawerOpen,
        goToPage,
        toggleImageManager,
        metadata,
    } = useSketchbook();

    if (!isIndexDrawerOpen) return null;

    return (
        <div className="fixed inset-y-0 left-0 z-50 w-full max-w-sm sm:max-w-md bg-[#ece7dc] border-r border-[#2b2721]/15 shadow-2xl flex flex-col overflow-hidden text-[#2b2721] animate-slide-right">
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#2b2721]/10 bg-[#ece7dc]/90 backdrop-blur-xs">
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-[#2b2721] text-[#ece7dc] flex items-center justify-center">
                        <Layers className="w-3.5 h-3.5" />
                    </div>
                    <div>
                        <h2 className="text-base font-serif font-semibold text-[#2b2721]">
                            Table of Plates
                        </h2>
                        <p className="text-[11px] text-[#2b2721]/60 font-serif">
                            {pages.length} illustrated spreads •{" "}
                            {metadata.title}
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setIsIndexDrawerOpen(false)}
                    className="p-1 rounded-full hover:bg-[#2b2721]/8 text-[#2b2721]/70 hover:text-[#2b2721]"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Plates Grid List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
                {pages.map((plate, index) => {
                    const isCurrent = index === currentPageIndex;
                    const resolvedThumb =
                        plate.thumbnailUrl ||
                        (plate.file.startsWith("http") ||
                        plate.file.startsWith("/") ||
                        plate.file.startsWith("data:")
                            ? plate.file
                            : `/landing-pages/meng-to-sketchbook/${plate.file}`);

                    return (
                        <button
                            key={plate.id || index}
                            onClick={() => {
                                goToPage(index);
                                setIsIndexDrawerOpen(false);
                            }}
                            className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-center gap-3.5 ${
                                isCurrent
                                    ? "border-[#9a6a3e] bg-[#9a6a3e]/15 shadow-sm"
                                    : "border-[#2b2721]/10 bg-white/50 hover:bg-white hover:border-[#2b2721]/30"
                            }`}
                        >
                            <div className="w-6 font-mono text-xs text-[#2b2721]/40 text-center font-medium">
                                {String(index + 1).padStart(2, "0")}
                            </div>

                            <div className="w-14 h-11 rounded-lg overflow-hidden bg-[#ece7dc] border border-[#2b2721]/15 shrink-0 relative">
                                <img
                                    src={resolvedThumb}
                                    alt={plate.title}
                                    className="w-full h-full object-cover"
                                />
                                {isCurrent && (
                                    <div className="absolute inset-0 bg-[#9a6a3e]/20 border-2 border-[#9a6a3e] rounded-lg" />
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-serif font-semibold text-[#2b2721] truncate">
                                        {plate.title}
                                    </h4>
                                    {isCurrent && (
                                        <span className="text-[10px] font-mono font-medium text-[#9a6a3e] bg-[#9a6a3e]/10 px-1.5 py-0.5 rounded">
                                            Current
                                        </span>
                                    )}
                                </div>
                                <p className="text-[11px] font-mono text-[#2b2721]/60 truncate">
                                    {plate.place}
                                </p>
                            </div>

                            <ChevronRight className="w-4 h-4 text-[#2b2721]/30 shrink-0" />
                        </button>
                    );
                })}

                {/* Add Plate Card in List */}
                <button
                    onClick={() => {
                        setIsIndexDrawerOpen(false);
                        toggleImageManager();
                    }}
                    className="w-full p-3 rounded-xl border border-dashed border-[#2b2721]/20 hover:border-[#9a6a3e] bg-white/30 hover:bg-white/70 transition-all flex items-center justify-center gap-2 text-xs font-serif text-[#2b2721]/70 hover:text-[#2b2721]"
                >
                    <Plus className="w-4 h-4 text-[#9a6a3e]" />
                    <span>Add New Plate to Sketchbook</span>
                </button>
            </div>

            {/* Drawer Footer */}
            <div className="px-5 py-3 border-t border-[#2b2721]/10 bg-white/40 flex items-center justify-between text-xs font-serif">
                <span className="text-[#2b2721]/50 italic">
                    Curled paper spreads with realistic physics
                </span>
                <button
                    onClick={() => setIsIndexDrawerOpen(false)}
                    className="px-3 py-1 rounded bg-[#2b2721] text-[#ece7dc] hover:bg-[#3d372e]"
                >
                    Close
                </button>
            </div>
        </div>
    );
}
