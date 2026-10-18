import React, { useRef, useState } from "react";
import {
    ArrowDown,
    ArrowUp,
    Check,
    Eye,
    FileImage,
    Image as ImageIcon,
    Plus,
    RotateCcw,
    Sparkles,
    Trash2,
    UploadCloud,
    X,
} from "lucide-react";
import { SAMPLE_ADDITIONAL_PLATES } from "../config/sketchbook.config";
import { useSketchbook } from "../provider/SketchbookProvider";

export function ImageManagerModal() {
    const {
        pages,
        isImageManagerOpen,
        setIsImageManagerOpen,
        addPage,
        removePage,
        reorderPages,
        resetToDefaults,
        goToPage,
        currentPageIndex,
    } = useSketchbook();

    // New Image Form State
    const [title, setTitle] = useState("");
    const [place, setPlace] = useState("");
    const [description, setDescription] = useState("");
    const [imageSourceType, setImageSourceType] = useState<"upload" | "url">(
        "upload",
    );
    const [imageUrl, setImageUrl] = useState("");
    const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [formError, setFormError] = useState("");
    const [isSuccessToast, setIsSuccessToast] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isImageManagerOpen) return null;

    const handleFileChange = (file: File) => {
        if (!file.type.startsWith("image/")) {
            setFormError(
                "Please select a valid image file (PNG, JPG, WebP, SVG).",
            );
            return;
        }
        setFormError("");
        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result as string;
            setPreviewDataUrl(result);
            if (!title) {
                // Auto-fill title from filename
                const cleanName = file.name
                    .replace(/\.[^/.]+$/, "")
                    .replace(/[-_]/g, " ")
                    .replace(/\b\w/g, (c) => c.toUpperCase());
                setTitle(cleanName);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileChange(e.dataTransfer.files[0]);
        }
    };

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalFile =
            imageSourceType === "upload" ? previewDataUrl : imageUrl.trim();

        if (!finalFile) {
            setFormError("Please provide an image file or URL.");
            return;
        }
        if (!title.trim()) {
            setFormError("Please enter a title for this plate.");
            return;
        }

        addPage({
            file: finalFile,
            title: title.trim(),
            place: place.trim() || "Custom Studio",
            description: description.trim() || undefined,
            thumbnailUrl: finalFile,
        });

        // Reset form
        setTitle("");
        setPlace("");
        setDescription("");
        setPreviewDataUrl(null);
        setImageUrl("");
        setFormError("");
        setIsSuccessToast(true);
        setTimeout(() => setIsSuccessToast(false), 3000);
    };

    const handleAddPreset = (
        preset: (typeof SAMPLE_ADDITIONAL_PLATES)[number],
    ) => {
        addPage({
            ...preset,
            thumbnailUrl: preset.file,
        });
        setIsSuccessToast(true);
        setTimeout(() => setIsSuccessToast(false), 3000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#1a1714]/60 backdrop-blur-sm animate-fade-in">
            <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#ece7dc] rounded-2xl border border-[#2b2721]/15 shadow-2xl flex flex-col overflow-hidden text-[#2b2721]">
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#2b2721]/10 bg-[#ece7dc]/90 backdrop-blur-xs">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#2b2721] text-[#ece7dc] flex items-center justify-center shadow-xs">
                            <FileImage className="w-4 h-4" />
                        </div>
                        <div>
                            <h2 className="text-lg font-serif font-semibold tracking-wide text-[#2b2721]">
                                Sketchbook Plates & Image Manager
                            </h2>
                            <p className="text-xs text-[#2b2721]/60 font-serif">
                                Add your own images, reorder spreads, or curate
                                Singapore illustrated plates.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsImageManagerOpen(false)}
                        className="p-1.5 rounded-full hover:bg-[#2b2721]/8 text-[#2b2721]/70 hover:text-[#2b2721] transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Modal Content - Scrollable */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {/* Section 1: Add New Image Form */}
                    <div className="bg-white/70 border border-[#2b2721]/12 rounded-xl p-5 shadow-xs">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-serif font-semibold uppercase tracking-wider text-[#2b2721] flex items-center gap-2">
                                <Plus className="w-4 h-4 text-[#9a6a3e]" />
                                Add Image To Book
                            </h3>
                            <div className="flex bg-[#ece7dc] p-0.5 rounded-lg border border-[#2b2721]/10 text-xs">
                                <button
                                    type="button"
                                    onClick={() => setImageSourceType("upload")}
                                    className={`px-3 py-1 rounded-md transition-all font-serif ${
                                        imageSourceType === "upload"
                                            ? "bg-[#2b2721] text-[#ece7dc] shadow-xs"
                                            : "text-[#2b2721]/70 hover:text-[#2b2721]"
                                    }`}
                                >
                                    Upload File
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setImageSourceType("url")}
                                    className={`px-3 py-1 rounded-md transition-all font-serif ${
                                        imageSourceType === "url"
                                            ? "bg-[#2b2721] text-[#ece7dc] shadow-xs"
                                            : "text-[#2b2721]/70 hover:text-[#2b2721]"
                                    }`}
                                >
                                    Image URL / Path
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleAddSubmit} className="space-y-4">
                            {/* Image Input Area */}
                            {imageSourceType === "upload" ? (
                                <div>
                                    <div
                                        onDragOver={(e) => {
                                            e.preventDefault();
                                            setIsDragging(true);
                                        }}
                                        onDragLeave={() => setIsDragging(false)}
                                        onDrop={handleDrop}
                                        onClick={() =>
                                            fileInputRef.current?.click()
                                        }
                                        className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                                            isDragging
                                                ? "border-[#9a6a3e] bg-[#9a6a3e]/10"
                                                : "border-[#2b2721]/20 hover:border-[#2b2721]/40 bg-[#f9f8f4]"
                                        }`}
                                    >
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                if (
                                                    e.target.files &&
                                                    e.target.files[0]
                                                ) {
                                                    handleFileChange(
                                                        e.target.files[0],
                                                    );
                                                }
                                            }}
                                        />

                                        {previewDataUrl ? (
                                            <div className="flex flex-col items-center gap-3">
                                                <img
                                                    src={previewDataUrl}
                                                    alt="Preview"
                                                    className="max-h-36 object-contain rounded border border-[#2b2721]/15 shadow-sm"
                                                />
                                                <span className="text-xs font-serif text-[#9a6a3e] font-medium">
                                                    Click or drag another image
                                                    to replace
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-2 text-[#2b2721]/70">
                                                <div className="w-10 h-10 rounded-full bg-[#ece7dc] flex items-center justify-center text-[#2b2721]/60">
                                                    <UploadCloud className="w-5 h-5" />
                                                </div>
                                                <p className="text-xs font-serif font-medium text-[#2b2721]">
                                                    Click to browse or drag &
                                                    drop your image here
                                                </p>
                                                <p className="text-[11px] text-[#2b2721]/50 font-serif">
                                                    PNG, JPG, WebP with
                                                    transparent or botanical
                                                    background works best
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-xs font-serif uppercase tracking-wider text-[#2b2721]/70 mb-1">
                                        Image URL or local asset path
                                    </label>
                                    <input
                                        type="text"
                                        value={imageUrl}
                                        onChange={(e) =>
                                            setImageUrl(e.target.value)
                                        }
                                        placeholder="e.g. https://example.com/art.png or meng-to-sketchbook/marina-bay-sands.png"
                                        className="w-full px-3 py-2 text-xs font-serif bg-[#f9f8f4] border border-[#2b2721]/20 rounded-lg focus:outline-hidden focus:border-[#2b2721] text-[#2b2721]"
                                    />
                                </div>
                            )}

                            {/* Title & Place Fields */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-serif uppercase tracking-wider text-[#2b2721]/70 mb-1">
                                        Plate Title *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={title}
                                        onChange={(e) =>
                                            setTitle(e.target.value)
                                        }
                                        placeholder="e.g. Victorian Shophouses"
                                        className="w-full px-3 py-2 text-xs font-serif bg-[#f9f8f4] border border-[#2b2721]/20 rounded-lg focus:outline-hidden focus:border-[#2b2721] text-[#2b2721]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-serif uppercase tracking-wider text-[#2b2721]/70 mb-1">
                                        Location / Place Subtitle
                                    </label>
                                    <input
                                        type="text"
                                        value={place}
                                        onChange={(e) =>
                                            setPlace(e.target.value)
                                        }
                                        placeholder="e.g. Emerald Hill"
                                        className="w-full px-3 py-2 text-xs font-serif bg-[#f9f8f4] border border-[#2b2721]/20 rounded-lg focus:outline-hidden focus:border-[#2b2721] text-[#2b2721]"
                                    />
                                </div>
                            </div>

                            {formError && (
                                <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded p-2">
                                    {formError}
                                </div>
                            )}

                            <div className="flex items-center justify-between pt-1">
                                <span className="text-[11px] text-[#2b2721]/50 font-serif italic">
                                    New plates are immediately bound into the 3D
                                    curled-page sketchbook.
                                </span>
                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded-lg bg-[#2b2721] text-[#ece7dc] text-xs font-serif font-medium tracking-wide hover:bg-[#3d372e] transition-all flex items-center gap-1.5 shadow-sm"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    Insert Into Sketchbook
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Section 2: Preset Library (1-Click Add) */}
                    <div className="bg-white/50 border border-[#2b2721]/10 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="w-4 h-4 text-[#9a6a3e]" />
                            <h3 className="text-xs font-serif font-semibold uppercase tracking-wider text-[#2b2721]">
                                Quick Sample Plates
                            </h3>
                            <span className="text-[11px] text-[#2b2721]/50 font-serif">
                                (Click any plate to add it instantly)
                            </span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                            {SAMPLE_ADDITIONAL_PLATES.map((sample, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => handleAddPreset(sample)}
                                    className="group flex flex-col items-start p-2 rounded-lg border border-[#2b2721]/10 bg-[#f9f8f4] hover:border-[#9a6a3e] hover:shadow-sm transition-all text-left"
                                >
                                    <div className="w-full h-20 rounded bg-[#ece7dc] overflow-hidden mb-1.5 relative">
                                        <img
                                            src={sample.file}
                                            alt={sample.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                                    </div>
                                    <span className="text-[11px] font-serif font-medium text-[#2b2721] truncate w-full">
                                        {sample.title}
                                    </span>
                                    <span className="text-[10px] text-[#9a6a3e] font-mono">
                                        {sample.place}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Section 3: Current Book Plates List & Reordering */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <ImageIcon className="w-4 h-4 text-[#2b2721]/70" />
                                <h3 className="text-xs font-serif font-semibold uppercase tracking-wider text-[#2b2721]">
                                    Current Plates in Sketchbook ({pages.length}
                                    )
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={resetToDefaults}
                                className="text-xs font-serif text-[#2b2721]/60 hover:text-[#2b2721] flex items-center gap-1 transition-colors"
                                title="Restore initial 9 Meng To Singapore plates"
                            >
                                <RotateCcw className="w-3 h-3" />
                                Reset to Original 9
                            </button>
                        </div>

                        <div className="space-y-2">
                            {pages.map((plate, index) => {
                                const isCurrent = index === currentPageIndex;
                                const isFirst = index === 0;
                                const isLast = index === pages.length - 1;

                                // Resolve thumbnail URL
                                const resolvedThumb =
                                    plate.thumbnailUrl ||
                                    (plate.file.startsWith("http") ||
                                    plate.file.startsWith("/") ||
                                    plate.file.startsWith("data:")
                                        ? plate.file
                                        : `/landing-pages/meng-to-sketchbook/${plate.file}`);

                                return (
                                    <div
                                        key={plate.id || index}
                                        className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                                            isCurrent
                                                ? "border-[#9a6a3e] bg-[#9a6a3e]/10 shadow-xs"
                                                : "border-[#2b2721]/10 bg-white/60 hover:bg-white/90"
                                        }`}
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            {/* Plate number */}
                                            <span className="font-mono text-xs text-[#2b2721]/40 w-6 text-center font-medium">
                                                {String(index + 1).padStart(
                                                    2,
                                                    "0",
                                                )}
                                            </span>

                                            {/* Thumbnail preview */}
                                            <div className="w-12 h-10 rounded overflow-hidden bg-[#ece7dc] border border-[#2b2721]/10 shrink-0">
                                                <img
                                                    src={resolvedThumb}
                                                    alt={plate.title}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        // fallback icon
                                                        (
                                                            e.target as HTMLElement
                                                        ).style.display =
                                                            "none";
                                                    }}
                                                />
                                            </div>

                                            {/* Plate Details */}
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="text-xs font-serif font-semibold text-[#2b2721] truncate">
                                                        {plate.title}
                                                    </h4>
                                                    {plate.isCustom && (
                                                        <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-[#9a6a3e]/15 text-[#9a6a3e] font-mono">
                                                            Custom
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-[11px] font-mono text-[#2b2721]/60 truncate">
                                                    {plate.place}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Actions: Jump to page, Move up/down, Delete */}
                                        <div className="flex items-center gap-1 shrink-0">
                                            <button
                                                type="button"
                                                onClick={() => goToPage(index)}
                                                className={`p-1.5 rounded hover:bg-[#2b2721]/8 transition-colors ${
                                                    isCurrent
                                                        ? "text-[#9a6a3e] font-bold"
                                                        : "text-[#2b2721]/60"
                                                }`}
                                                title="View this plate in the book"
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                            </button>

                                            <button
                                                type="button"
                                                disabled={isFirst}
                                                onClick={() =>
                                                    reorderPages(
                                                        index,
                                                        index - 1,
                                                    )
                                                }
                                                className="p-1.5 rounded hover:bg-[#2b2721]/8 text-[#2b2721]/50 disabled:opacity-20 transition-colors"
                                                title="Move plate up"
                                            >
                                                <ArrowUp className="w-3.5 h-3.5" />
                                            </button>

                                            <button
                                                type="button"
                                                disabled={isLast}
                                                onClick={() =>
                                                    reorderPages(
                                                        index,
                                                        index + 1,
                                                    )
                                                }
                                                className="p-1.5 rounded hover:bg-[#2b2721]/8 text-[#2b2721]/50 disabled:opacity-20 transition-colors"
                                                title="Move plate down"
                                            >
                                                <ArrowDown className="w-3.5 h-3.5" />
                                            </button>

                                            <button
                                                type="button"
                                                disabled={pages.length <= 1}
                                                onClick={() =>
                                                    removePage(plate.id)
                                                }
                                                className="p-1.5 rounded hover:bg-red-50 text-[#2b2721]/40 hover:text-red-700 disabled:opacity-20 transition-colors"
                                                title="Remove plate"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-between px-6 py-3.5 border-t border-[#2b2721]/10 bg-[#ece7dc]/90 backdrop-blur-xs">
                    {isSuccessToast ? (
                        <div className="flex items-center gap-1.5 text-xs font-serif text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded">
                            <Check className="w-3.5 h-3.5" />
                            Sketchbook pages updated!
                        </div>
                    ) : (
                        <div className="text-xs text-[#2b2721]/50 font-serif">
                            Total {pages.length} spreads active in the tactile
                            3D viewer.
                        </div>
                    )}
                    <button
                        onClick={() => setIsImageManagerOpen(false)}
                        className="px-4 py-1.5 rounded-lg bg-[#2b2721] text-[#ece7dc] text-xs font-serif font-medium hover:bg-[#3d372e] transition-colors"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
}
