"use client";

import React from "react";
import { Search, Plus, Sparkles, RefreshCw, X, Filter } from "lucide-react";

export default function KnowledgeFiltersBar({
    search = "",
    onSearchChange,
    category = "",
    onCategoryChange,
    categories = [],
    status = "",
    onStatusChange,
    onResetFilters,
    onRefresh,
    refreshing = false,
    onOpenCreateModal,
    onOpenTestSearchModal,
}) {
    const hasActiveFilters = Boolean(search || category || status);

    return (
        <div className="p-3.5 rounded-xl bg-[#F4EDE4] border border-[#D6CDC2] space-y-3">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
                {/* Search & Select Filters */}
                <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="w-4 h-4 text-[#8C8278] absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => onSearchChange(e.target.value)}
                            placeholder="Search knowledge title, facts, keywords, projects..."
                            className="w-full pl-9 pr-8 py-2 text-xs bg-[#EAE2D7] border border-[#D6CDC2] rounded-lg text-[#14100E] placeholder-[#8C8278] focus:outline-none focus:border-[#14100E] transition-colors"
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={() => onSearchChange("")}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8C8278] hover:text-[#14100E]"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    {/* Category Filter */}
                    <div className="w-full sm:w-48">
                        <select
                            value={category}
                            onChange={(e) => onCategoryChange(e.target.value)}
                            className="w-full px-3 py-2 text-xs bg-[#EAE2D7] border border-[#D6CDC2] rounded-lg text-[#14100E] focus:outline-none focus:border-[#14100E] transition-colors cursor-pointer"
                        >
                            <option value="">All Categories</option>
                            {categories.map((c) => (
                                <option key={c} value={c}>
                                    {c}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Status Filter */}
                    <div className="w-full sm:w-36">
                        <select
                            value={status}
                            onChange={(e) => onStatusChange(e.target.value)}
                            className="w-full px-3 py-2 text-xs bg-[#EAE2D7] border border-[#D6CDC2] rounded-lg text-[#14100E] focus:outline-none focus:border-[#14100E] transition-colors cursor-pointer"
                        >
                            <option value="">All Statuses</option>
                            <option value="published">Published</option>
                            <option value="draft">Draft</option>
                            <option value="archived">Archived</option>
                        </select>
                    </div>

                    {/* Reset Button */}
                    {hasActiveFilters && (
                        <button
                            type="button"
                            onClick={onResetFilters}
                            className="px-2.5 py-2 text-xs font-mono text-[#8C8278] hover:text-[#14100E] rounded-lg border border-[#D6CDC2] hover:bg-[#EAE2D7] transition-colors flex items-center gap-1 self-start sm:self-auto"
                            title="Reset Filters"
                        >
                            <X className="w-3.5 h-3.5" />
                            <span>Clear</span>
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={onRefresh}
                        disabled={refreshing}
                        className="p-2 text-[#14100E] hover:bg-[#EAE2D7] rounded-lg border border-[#D6CDC2] transition-colors disabled:opacity-50 self-start sm:self-auto"
                        title="Refresh Knowledge Records"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
                    </button>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex items-center gap-2 self-end lg:self-auto">
                    <button
                        type="button"
                        onClick={onOpenTestSearchModal}
                        className="px-3.5 py-2 rounded-lg bg-[#EAE2D7] hover:bg-[#D6CDC2] border border-[#D6CDC2] text-[#14100E] text-xs font-semibold flex items-center gap-1.5 transition-colors"
                        title="Test Assistant Retrieval Query"
                    >
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        <span>Test AI Search</span>
                    </button>

                    <button
                        type="button"
                        onClick={onOpenCreateModal}
                        className="px-4 py-2 rounded-lg bg-[#14100E] hover:bg-[#2A2420] text-[#F4EDE4] text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Knowledge</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
