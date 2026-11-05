"use client";

import React from "react";
import PlateItemCard from "./PlateItemCard";
import { useCuratedWorks } from "../provider/CuratedWorksProvider";
import { Layers } from "lucide-react";

export default function PlatesList() {
    const {
        plates,
        loading,
        handleMovePlate,
        handleOpenDeleteModal,
    } = useCuratedWorks();

    return (
        <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
                <h3 className="font-sans font-bold text-sm text-[#14100E]">
                    Current Plates in Infinite Pages ({plates.length})
                </h3>
                <span className="text-[11px] font-mono text-[#8C8278]">
                    Ordered by book page appearance
                </span>
            </div>

            {loading && plates.length === 0 ? (
                <div className="p-4 rounded-xl bg-[#F4EDE4] border border-[#D6CDC2] space-y-2">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-16 rounded-lg bg-[#EAE2D7] animate-pulse" />
                    ))}
                </div>
            ) : plates.length > 0 ? (
                <div className="space-y-2">
                    {plates.map((plate, index) => (
                        <PlateItemCard
                            key={plate.id || index}
                            plate={plate}
                            index={index}
                            total={plates.length}
                            onMove={handleMovePlate}
                            onDelete={handleOpenDeleteModal}
                        />
                    ))}
                </div>
            ) : (
                <div className="p-8 rounded-xl bg-[#F4EDE4] border border-dashed border-[#D6CDC2] text-center space-y-2">
                    <Layers className="w-6 h-6 text-[#8C8278] mx-auto opacity-70" />
                    <p className="text-xs text-[#6B625A]">
                        No custom plates uploaded yet.
                    </p>
                    <p className="text-[10px] text-[#8C8278] font-mono">
                        Upload custom 3D sketchbook plates above to replace the built-in fallbacks.
                    </p>
                </div>
            )}
        </div>
    );
}

