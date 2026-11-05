"use client";

import React from "react";
import { RefreshCw, Sparkles, BookOpen } from "lucide-react";
import { usePortfolioKnowledge } from "../provider/PortfolioKnowledgeProvider";

export default function KnowledgeHeader() {
    const { refreshing, handleRefresh, stats } = usePortfolioKnowledge();

    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D6CDC2] pb-4">
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#6B625A]">
                        AI VECTOR RETRIEVAL // {stats.total || 0} FACTS INDEXED
                    </span>
                </div>
                <h1 className="font-sans font-bold text-xl text-[#14100E]">
                    Portfolio Knowledge Base
                </h1>
                <p className="text-xs text-[#6B625A] mt-0.5">
                    Manage factual knowledge, gear packages, and project details referenced by the AI assistant.
                </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                    type="button"
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="px-3.5 py-1.5 rounded-lg border border-[#D6CDC2] bg-[#EAE2D7] hover:bg-[#D6CDC2]/60 text-[#14100E] text-xs font-mono font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
                    title="Refresh knowledge base"
                >
                    <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
                    <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
                </button>
            </div>
        </div>
    );
}

