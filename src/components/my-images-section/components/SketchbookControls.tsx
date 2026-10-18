import React, { useState } from "react";
import {
    BookOpen,
    Check,
    Palette,
    RotateCcw,
    Sliders,
    Type,
    X,
} from "lucide-react";
import { COLOR_PALETTES, FONT_OPTIONS } from "../config/sketchbook.config";
import { useSketchbook } from "../provider/SketchbookProvider";

export function SketchbookControls() {
    const {
        typography,
        metadata,
        activePaletteId,
        isControlsOpen,
        setIsControlsOpen,
        updateTypography,
        updateMetadata,
        applyPalette,
        resetToDefaults,
    } = useSketchbook();

    const [activeTab, setActiveTab] = useState<
        "typography" | "metadata" | "palettes"
    >("typography");

    if (!isControlsOpen) return null;

    return (
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[#ece7dc] border-l border-[#2b2721]/15 shadow-2xl flex flex-col overflow-hidden text-[#2b2721] animate-slide-left">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#2b2721]/10 bg-[#ece7dc]/90 backdrop-blur-xs">
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-[#2b2721] text-[#ece7dc] flex items-center justify-center">
                        <Sliders className="w-3.5 h-3.5" />
                    </div>
                    <div>
                        <h2 className="text-base font-serif font-semibold text-[#2b2721]">
                            Dynamic Fields & Styles
                        </h2>
                        <p className="text-[11px] text-[#2b2721]/60 font-serif">
                            Fine-tune typography, paper palettes, and book
                            metadata
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setIsControlsOpen(false)}
                    className="p-1 rounded-full hover:bg-[#2b2721]/8 text-[#2b2721]/70 hover:text-[#2b2721]"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-[#2b2721]/10 px-5 pt-2 bg-white/30 text-xs">
                <button
                    onClick={() => setActiveTab("typography")}
                    className={`pb-2 px-3 font-serif font-medium border-b-2 flex items-center gap-1.5 transition-all ${
                        activeTab === "typography"
                            ? "border-[#2b2721] text-[#2b2721]"
                            : "border-transparent text-[#2b2721]/50 hover:text-[#2b2721]"
                    }`}
                >
                    <Type className="w-3.5 h-3.5" />
                    Typography
                </button>
                <button
                    onClick={() => setActiveTab("palettes")}
                    className={`pb-2 px-3 font-serif font-medium border-b-2 flex items-center gap-1.5 transition-all ${
                        activeTab === "palettes"
                            ? "border-[#2b2721] text-[#2b2721]"
                            : "border-transparent text-[#2b2721]/50 hover:text-[#2b2721]"
                    }`}
                >
                    <Palette className="w-3.5 h-3.5" />
                    Ink & Paper
                </button>
                <button
                    onClick={() => setActiveTab("metadata")}
                    className={`pb-2 px-3 font-serif font-medium border-b-2 flex items-center gap-1.5 transition-all ${
                        activeTab === "metadata"
                            ? "border-[#2b2721] text-[#2b2721]"
                            : "border-transparent text-[#2b2721]/50 hover:text-[#2b2721]"
                    }`}
                >
                    <BookOpen className="w-3.5 h-3.5" />
                    Book Info
                </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
                {activeTab === "typography" && (
                    <div className="space-y-5">
                        {/* Heading Font */}
                        <div>
                            <label className="block text-xs font-serif uppercase tracking-wider text-[#2b2721]/70 mb-1.5">
                                Heading Font Family
                            </label>
                            <select
                                value={typography.headingFont}
                                onChange={(e) =>
                                    updateTypography({
                                        headingFont: e.target.value,
                                    })
                                }
                                className="w-full px-3 py-2 text-xs font-serif bg-white border border-[#2b2721]/20 rounded-lg text-[#2b2721] focus:outline-hidden focus:border-[#2b2721]"
                            >
                                {FONT_OPTIONS.map((f) => (
                                    <option key={f.id} value={f.id}>
                                        {f.name} ({f.category})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Body Font */}
                        <div>
                            <label className="block text-xs font-serif uppercase tracking-wider text-[#2b2721]/70 mb-1.5">
                                Body Font Family
                            </label>
                            <select
                                value={typography.bodyFont}
                                onChange={(e) =>
                                    updateTypography({
                                        bodyFont: e.target.value,
                                    })
                                }
                                className="w-full px-3 py-2 text-xs font-serif bg-white border border-[#2b2721]/20 rounded-lg text-[#2b2721] focus:outline-hidden focus:border-[#2b2721]"
                            >
                                {FONT_OPTIONS.map((f) => (
                                    <option key={f.id} value={f.id}>
                                        {f.name} ({f.category})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Weights */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-serif uppercase tracking-wider text-[#2b2721]/70 mb-1.5">
                                    Heading Weight
                                </label>
                                <select
                                    value={typography.headingWeight}
                                    onChange={(e) =>
                                        updateTypography({
                                            headingWeight: e.target.value,
                                        })
                                    }
                                    className="w-full px-3 py-2 text-xs font-serif bg-white border border-[#2b2721]/20 rounded-lg text-[#2b2721] focus:outline-hidden focus:border-[#2b2721]"
                                >
                                    <option value="300">300 (Light)</option>
                                    <option value="400">400 (Regular)</option>
                                    <option value="500">500 (Medium)</option>
                                    <option value="600">600 (Semibold)</option>
                                    <option value="700">700 (Bold)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-serif uppercase tracking-wider text-[#2b2721]/70 mb-1.5">
                                    Body Weight
                                </label>
                                <select
                                    value={typography.bodyWeight}
                                    onChange={(e) =>
                                        updateTypography({
                                            bodyWeight: e.target.value,
                                        })
                                    }
                                    className="w-full px-3 py-2 text-xs font-serif bg-white border border-[#2b2721]/20 rounded-lg text-[#2b2721] focus:outline-hidden focus:border-[#2b2721]"
                                >
                                    <option value="300">300 (Light)</option>
                                    <option value="400">400 (Regular)</option>
                                    <option value="500">500 (Medium)</option>
                                    <option value="600">600 (Semibold)</option>
                                </select>
                            </div>
                        </div>

                        {/* Heading Size Slider */}
                        <div>
                            <div className="flex items-center justify-between text-xs font-serif mb-1">
                                <span className="text-[#2b2721]/70 uppercase tracking-wider">
                                    Heading Size
                                </span>
                                <span className="font-mono text-[#2b2721] font-medium">
                                    {typography.headingSize}px
                                </span>
                            </div>
                            <input
                                type="range"
                                min="20"
                                max="48"
                                step="1"
                                value={typography.headingSize}
                                onChange={(e) =>
                                    updateTypography({
                                        headingSize: Number(e.target.value),
                                    })
                                }
                                className="w-full accent-[#2b2721]"
                            />
                        </div>

                        {/* Body Size Slider */}
                        <div>
                            <div className="flex items-center justify-between text-xs font-serif mb-1">
                                <span className="text-[#2b2721]/70 uppercase tracking-wider">
                                    Body Size
                                </span>
                                <span className="font-mono text-[#2b2721] font-medium">
                                    {typography.bodySize}px
                                </span>
                            </div>
                            <input
                                type="range"
                                min="14"
                                max="28"
                                step="1"
                                value={typography.bodySize}
                                onChange={(e) =>
                                    updateTypography({
                                        bodySize: Number(e.target.value),
                                    })
                                }
                                className="w-full accent-[#2b2721]"
                            />
                        </div>

                        {/* Heading Letter Spacing Slider */}
                        <div>
                            <div className="flex items-center justify-between text-xs font-serif mb-1">
                                <span className="text-[#2b2721]/70 uppercase tracking-wider">
                                    Letter Spacing
                                </span>
                                <span className="font-mono text-[#2b2721] font-medium">
                                    {typography.headingLetterSpacing.toFixed(3)}
                                    em
                                </span>
                            </div>
                            <input
                                type="range"
                                min="-0.02"
                                max="0.05"
                                step="0.002"
                                value={typography.headingLetterSpacing}
                                onChange={(e) =>
                                    updateTypography({
                                        headingLetterSpacing: Number(
                                            e.target.value,
                                        ),
                                    })
                                }
                                className="w-full accent-[#2b2721]"
                            />
                        </div>

                        {/* Primary Ink Color */}
                        <div>
                            <label className="block text-xs font-serif uppercase tracking-wider text-[#2b2721]/70 mb-1.5">
                                Primary Ink Color
                            </label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    value={typography.primaryColor}
                                    onChange={(e) =>
                                        updateTypography({
                                            primaryColor: e.target.value,
                                        })
                                    }
                                    className="w-9 h-9 rounded-lg border border-[#2b2721]/20 cursor-pointer p-0.5 bg-white"
                                />
                                <input
                                    type="text"
                                    value={typography.primaryColor}
                                    onChange={(e) =>
                                        updateTypography({
                                            primaryColor: e.target.value,
                                        })
                                    }
                                    className="w-28 px-2.5 py-1.5 text-xs font-mono uppercase bg-white border border-[#2b2721]/20 rounded-lg text-[#2b2721]"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "palettes" && (
                    <div className="space-y-4">
                        <p className="text-xs font-serif text-[#2b2721]/70">
                            Curated ink & paper tone pairings inspired by
                            Singaporean botanicals and heritage architecture:
                        </p>
                        <div className="space-y-2.5">
                            {COLOR_PALETTES.map((pal) => {
                                const isSelected = activePaletteId === pal.id;
                                return (
                                    <button
                                        key={pal.id}
                                        onClick={() => applyPalette(pal.id)}
                                        className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                                            isSelected
                                                ? "border-[#2b2721] bg-white shadow-sm"
                                                : "border-[#2b2721]/15 bg-white/50 hover:bg-white"
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center -space-x-1">
                                                <div
                                                    className="w-5 h-5 rounded-full border border-black/10 shadow-xs"
                                                    style={{
                                                        backgroundColor:
                                                            pal.color,
                                                    }}
                                                    title="Ink Color"
                                                />
                                                <div
                                                    className="w-5 h-5 rounded-full border border-black/10 shadow-xs"
                                                    style={{
                                                        backgroundColor:
                                                            pal.paperColor,
                                                    }}
                                                    title="Paper Tone"
                                                />
                                            </div>
                                            <div>
                                                <div className="text-xs font-serif font-medium text-[#2b2721]">
                                                    {pal.name}
                                                </div>
                                                <div className="text-[10px] text-[#2b2721]/50 font-serif">
                                                    {pal.description}
                                                </div>
                                            </div>
                                        </div>
                                        {isSelected && (
                                            <div className="w-5 h-5 rounded-full bg-[#2b2721] text-[#ece7dc] flex items-center justify-center">
                                                <Check className="w-3 h-3" />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {activeTab === "metadata" && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-serif uppercase tracking-wider text-[#2b2721]/70 mb-1">
                                Book Title
                            </label>
                            <input
                                type="text"
                                value={metadata.title}
                                onChange={(e) =>
                                    updateMetadata({ title: e.target.value })
                                }
                                className="w-full px-3 py-2 text-xs font-serif bg-white border border-[#2b2721]/20 rounded-lg text-[#2b2721]"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-serif uppercase tracking-wider text-[#2b2721]/70 mb-1">
                                Artist / Author
                            </label>
                            <input
                                type="text"
                                value={metadata.author}
                                onChange={(e) =>
                                    updateMetadata({ author: e.target.value })
                                }
                                className="w-full px-3 py-2 text-xs font-serif bg-white border border-[#2b2721]/20 rounded-lg text-[#2b2721]"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-serif uppercase tracking-wider text-[#2b2721]/70 mb-1">
                                Subtitle
                            </label>
                            <input
                                type="text"
                                value={metadata.subtitle}
                                onChange={(e) =>
                                    updateMetadata({ subtitle: e.target.value })
                                }
                                className="w-full px-3 py-2 text-xs font-serif bg-white border border-[#2b2721]/20 rounded-lg text-[#2b2721]"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-serif uppercase tracking-wider text-[#2b2721]/70 mb-1">
                                    Edition
                                </label>
                                <input
                                    type="text"
                                    value={metadata.edition}
                                    onChange={(e) =>
                                        updateMetadata({
                                            edition: e.target.value,
                                        })
                                    }
                                    className="w-full px-3 py-2 text-xs font-serif bg-white border border-[#2b2721]/20 rounded-lg text-[#2b2721]"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-serif uppercase tracking-wider text-[#2b2721]/70 mb-1">
                                    Year
                                </label>
                                <input
                                    type="text"
                                    value={metadata.year}
                                    onChange={(e) =>
                                        updateMetadata({ year: e.target.value })
                                    }
                                    className="w-full px-3 py-2 text-xs font-serif bg-white border border-[#2b2721]/20 rounded-lg text-[#2b2721]"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-serif uppercase tracking-wider text-[#2b2721]/70 mb-1">
                                Location
                            </label>
                            <input
                                type="text"
                                value={metadata.location}
                                onChange={(e) =>
                                    updateMetadata({ location: e.target.value })
                                }
                                className="w-full px-3 py-2 text-xs font-serif bg-white border border-[#2b2721]/20 rounded-lg text-[#2b2721]"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-serif uppercase tracking-wider text-[#2b2721]/70 mb-1">
                                Intro Bio / Foreword
                            </label>
                            <textarea
                                rows={3}
                                value={metadata.introText}
                                onChange={(e) =>
                                    updateMetadata({
                                        introText: e.target.value,
                                    })
                                }
                                className="w-full px-3 py-2 text-xs font-serif bg-white border border-[#2b2721]/20 rounded-lg text-[#2b2721]"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-[#2b2721]/10 bg-white/40 flex items-center justify-between">
                <button
                    onClick={resetToDefaults}
                    className="text-xs font-serif text-[#2b2721]/60 hover:text-[#2b2721] flex items-center gap-1.5 transition-colors"
                >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset All
                </button>
                <button
                    onClick={() => setIsControlsOpen(false)}
                    className="px-4 py-1.5 rounded-lg bg-[#2b2721] text-[#ece7dc] text-xs font-serif font-medium hover:bg-[#3d372e]"
                >
                    Close
                </button>
            </div>
        </div>
    );
}
