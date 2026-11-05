"use client";

import React from "react";
import {
    Play,
    Pause,
    Edit3,
    Trash2,
    ArrowUp,
    ArrowDown,
    Film,
    Camera,
    Sparkles,
    Star,
} from "lucide-react";

export default function WorkProjectCard({
    project,
    index,
    total,
    playingId,
    onTogglePlay,
    onMove,
    onEdit,
    onDelete,
}) {
    const isPlaying = playingId === project.id;
    const isFirst = index === 0;
    const isLast = index === total - 1;

    return (
        <div className="p-4 rounded-xl bg-[#F4EDE4] border border-[#D6CDC2] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all hover:shadow-sm group">
            {/* Left: Video Preview & Details */}
            <div className="flex items-center gap-3.5 min-w-0 flex-1">
                <div className="w-8 h-8 rounded-lg bg-[#EAE2D7] text-[#14100E] font-mono font-bold text-xs flex items-center justify-center shrink-0 border border-[#D6CDC2]">
                    #{index + 1}
                </div>

                {/* Video / Thumbnail Container */}
                <div className="relative w-28 h-18 sm:w-32 sm:h-20 rounded-lg overflow-hidden shrink-0 border border-[#D6CDC2] bg-black flex items-center justify-center group/video">
                    {project.videoUrl && isPlaying ? (
                        <video
                            src={project.videoUrl}
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-full h-full object-cover"
                        />
                    ) : project.thumbnailUrl ? (
                        <img
                            src={project.thumbnailUrl}
                            alt={project.title}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <Film className="w-6 h-6 text-[#8C8278]" />
                    )}

                    {project.videoUrl && (
                        <button
                            type="button"
                            onClick={() => onTogglePlay(project.id)}
                            className="absolute inset-0 bg-black/40 hover:bg-black/20 flex items-center justify-center text-white transition-colors"
                            title={isPlaying ? "Pause preview" : "Play preview"}
                        >
                            {isPlaying ? (
                                <Pause className="w-5 h-5 fill-current" />
                            ) : (
                                <Play className="w-5 h-5 fill-current ml-0.5" />
                            )}
                        </button>
                    )}
                </div>

                {/* Project Metadata */}
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-sans font-bold text-sm text-[#14100E] truncate">
                            {project.title}
                        </h4>
                        {project.isFeatured && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[9px] font-mono font-semibold">
                                <Star className="w-2.5 h-2.5 fill-current" />
                                <span>Featured</span>
                            </span>
                        )}
                        <span className="px-1.5 py-0.5 rounded bg-[#EAE2D7] text-[#6B625A] text-[9px] font-mono font-semibold uppercase">
                            {project.tag || "FEATURED"}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-[#6B625A] font-mono mt-1 flex-wrap">
                        {project.client && <span>Client: {project.client}</span>}
                        {project.stationName && (
                            <>
                                <span>•</span>
                                <span>Station: {project.stationName}</span>
                            </>
                        )}
                        {project.camera && (
                            <>
                                <span>•</span>
                                <span>{project.camera}</span>
                            </>
                        )}
                        {project.lens && (
                            <>
                                <span>•</span>
                                <span>{project.lens}</span>
                            </>
                        )}
                        {project.formatRatio && (
                            <>
                                <span>•</span>
                                <span>{project.formatRatio}</span>
                            </>
                        )}
                    </div>

                    {project.summary && (
                        <p className="text-[11px] text-[#8C8278] line-clamp-1 mt-1 font-sans">
                            {project.summary}
                        </p>
                    )}
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-1 self-end sm:self-auto shrink-0">
                <button
                    type="button"
                    onClick={() => onMove(index, "up")}
                    disabled={isFirst}
                    className="p-1.5 rounded-md border border-[#D6CDC2] bg-[#EAE2D7] hover:bg-[#D6CDC2]/50 text-[#14100E] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Move earlier"
                >
                    <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                    type="button"
                    onClick={() => onMove(index, "down")}
                    disabled={isLast}
                    className="p-1.5 rounded-md border border-[#D6CDC2] bg-[#EAE2D7] hover:bg-[#D6CDC2]/50 text-[#14100E] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Move later"
                >
                    <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button
                    type="button"
                    onClick={() => onEdit(project)}
                    className="p-1.5 rounded-md border border-[#D6CDC2] bg-[#EAE2D7] hover:bg-[#D6CDC2]/50 text-[#14100E] transition-colors"
                    title="Edit project"
                >
                    <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                    type="button"
                    onClick={() => onDelete(project)}
                    className="p-1.5 rounded-md border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 transition-colors"
                    title="Delete project"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    );
}

