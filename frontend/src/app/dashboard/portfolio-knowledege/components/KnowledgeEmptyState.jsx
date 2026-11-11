"use client";

import React from "react";
import { BookOpen, FilterX, Plus } from "lucide-react";
import { usePortfolioKnowledge } from "../provider/PortfolioKnowledgeProvider";

export default function KnowledgeEmptyState() {
    const {
        search,
        category,
        status,
        handleResetFilters,
        handleOpenCreateModal,
    } = usePortfolioKnowledge();

    const hasActiveFilters = Boolean(search || category || status);

    return (
        <div className="p-12 rounded-xl bg-[#F4EDE4] border border-dashed border-[#D6CDC2] text-center space-y-3">
            <div className="p-3 rounded-full bg-[#EAE2D7] w-12 h-12 flex items-center justify-center mx-auto text-[#8C8278]">
                <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="font-sans font-bold text-sm text-[#14100E]">
                No Knowledge Facts Found
            </h3>
            <p className="text-xs text-[#8C8278] max-w-sm mx-auto">
                {hasActiveFilters
                    ? "No knowledge records match your current filter parameters."
                    : "No portfolio knowledge records have been added yet. Add factual items to empower the AI assistant."}
            </p>
            <div className="pt-2 flex items-center justify-center gap-2">
                {hasActiveFilters && (
                    <button
                        type="button"
                        onClick={handleResetFilters}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#D6CDC2] bg-[#EAE2D7] hover:bg-[#D6CDC2]/50 text-xs font-mono text-[#14100E] transition-colors"
                    >
                        <FilterX className="w-3.5 h-3.5 text-[#6B625A]" />
                        <span>Clear Filters</span>
                    </button>
                )}
                <button
                    type="button"
                    onClick={handleOpenCreateModal}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#14100E] hover:bg-[#2A2420] text-xs font-semibold text-[#F4EDE4] transition-colors"
                >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add First Fact</span>
                </button>
            </div>
        </div>
    );
}

