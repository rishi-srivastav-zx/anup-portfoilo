"use client";

import React from "react";
import { MoveUp, MoveDown, Trash2, MapPin, Eye } from "lucide-react";

export default function PlateItemCard({
    plate,
    index,
    total,
    onMove,
    onDelete,
}) {
    const isFirst = index === 0;
    const isLast = index === total - 1;

    return (
        <div className="p-3 rounded-xl bg-[#F4EDE4] border border-[#D6CDC2] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all hover:shadow-sm group">
            {/* Left: Thumbnail & Info */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-8 h-8 rounded-lg bg-[#EAE2D7] text-[#14100E] font-mono font-bold text-xs flex items-center justify-center shrink-0 border border-[#D6CDC2]">
                    #{index + 1}
                </div>

                <div className="w-16 h-16 rounded-lg bg-[#EAE2D7] overflow-hidden shrink-0 border border-[#D6CDC2] relative flex items-center justify-center">
                    {plate.url || plate.imageUrl ? (
                        <img
                            src={plate.url || plate.imageUrl}
                            alt={plate.title || "Plate"}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <span className="text-[10px] font-mono text-[#8C8278]">No img</span>
                    )}
                </div>

                <div className="min-w-0">
                    <h4 className="font-semibold text-xs text-[#14100E] truncate">
                        {plate.title}
                    </h4>
                    {plate.place && (
                        <div className="flex items-center gap-1 text-[11px] text-[#6B625A] mt-0.5 truncate">
                            <MapPin className="w-3 h-3 text-[#8C8278] shrink-0" />
                            <span className="truncate">{plate.place}</span>
                        </div>
                    )}
                    {plate.description && (
                        <p className="text-[10px] text-[#8C8278] line-clamp-1 mt-0.5">
                            {plate.description}
                        </p>
                    )}
                </div>
            </div>

            {/* Right: Order & Actions */}
            <div className="flex items-center gap-1 self-end sm:self-auto shrink-0">
                <button
                    type="button"
                    onClick={() => onMove(index, "up")}
                    disabled={isFirst}
                    className="p-1.5 rounded-md border border-[#D6CDC2] bg-[#EAE2D7] hover:bg-[#D6CDC2]/50 text-[#14100E] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Move earlier in book"
                >
                    <MoveUp className="w-3.5 h-3.5" />
                </button>
                <button
                    type="button"
                    onClick={() => onMove(index, "down")}
                    disabled={isLast}
                    className="p-1.5 rounded-md border border-[#D6CDC2] bg-[#EAE2D7] hover:bg-[#D6CDC2]/50 text-[#14100E] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Move later in book"
                >
                    <MoveDown className="w-3.5 h-3.5" />
                </button>
                <button
                    type="button"
                    onClick={() => onDelete(plate)}
                    className="p-1.5 rounded-md border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 transition-colors"
                    title="Delete plate"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    );
}

