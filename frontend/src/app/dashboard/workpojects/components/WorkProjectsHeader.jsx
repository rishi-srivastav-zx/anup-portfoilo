"use client";

import React from "react";
import { RefreshCw, Video, Film } from "lucide-react";
import { useWorkProjects } from "../provider/WorkProjectsProvider";

export default function WorkProjectsHeader() {
    const { projects, loading, handleRefresh } = useWorkProjects();

    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D6CDC2] pb-4">
            <div>
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded bg-[#14100E] text-[#F4EDE4] font-semibold">
                        TRANSIT STATIONS &amp; WORK
                    </span>
                    <span className="font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded bg-[#EAE2D7] text-[#14100E] font-semibold border border-[#D6CDC2]">
                        {projects.length} FILMS LOADED
                    </span>
                </div>
                <h1 className="font-sans font-bold text-xl text-[#14100E]">
                    Work Projects (Featured Videos)
                </h1>
                <p className="text-xs text-[#6B625A] mt-0.5">
                    Manage high-bitrate video projects, transit stops, aspect ratios, and optical gear tags.
                </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                    type="button"
                    onClick={handleRefresh}
                    disabled={loading}
                    className="px-3.5 py-1.5 rounded-lg border border-[#D6CDC2] bg-[#EAE2D7] hover:bg-[#D6CDC2]/60 text-[#14100E] text-xs font-mono font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
                    title="Refresh video projects"
                >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                    <span>REFRESH</span>
                </button>
            </div>
        </div>
    );
}

