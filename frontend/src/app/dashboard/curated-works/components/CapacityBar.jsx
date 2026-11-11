"use client";

import React from "react";
import { Info } from "lucide-react";
import { MAX_PLATES, FALLBACK_PLATES_COUNT } from "../config/curatedWorksConfig";
import { useCuratedWorks } from "../provider/CuratedWorksProvider";

export default function CapacityBar() {
    const { plates } = useCuratedWorks();
    const count = plates.length;
    const available = Math.max(0, MAX_PLATES - count);
    const percentage = Math.min(100, (count / MAX_PLATES) * 100);

    return (
        <div className="p-4 rounded-xl bg-[#F4EDE4] border border-[#D6CDC2] space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-semibold text-[#14100E]">
                    CAPACITY: {count} of {MAX_PLATES} plates filled
                </span>
                <span className="text-[#6B625A]">{available} slots available</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 rounded-full bg-[#EAE2D7] overflow-hidden border border-[#D6CDC2]/50">
                <div
                    className="h-full bg-[#14100E] rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                />
            </div>

            {/* Notice Alert if empty */}
            {count === 0 && (
                <div className="p-2.5 rounded-lg bg-[#EAE2D7] border border-[#D6CDC2] flex items-center gap-2 text-xs text-[#6B625A]">
                    <Info className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>
                        No custom images uploaded yet. The 3D Infinite Pages section is currently showing the{" "}
                        <strong className="text-[#14100E] font-semibold">{FALLBACK_PLATES_COUNT} built-in fallback plates</strong>.
                    </span>
                </div>
            )}
        </div>
    );
}

