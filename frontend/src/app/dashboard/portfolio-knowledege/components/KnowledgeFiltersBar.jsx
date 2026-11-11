"use client";

import React from "react";
import { Search, Plus, Sparkles, RefreshCw, X } from "lucide-react";
import { KNOWLEDGE_STATUSES } from "../config/portfolioKnowledgeConfig";
import { usePortfolioKnowledge } from "../provider/PortfolioKnowledgeProvider";

export default function KnowledgeFiltersBar() {
    const {
        search,
        category,
        categories,
        status,
        refreshing,
        handleSearchChange,
        handleCategoryChange,
        handleStatusChange,
        handleResetFilters,
        handleRefresh,
        handleOpenCreateModal,
        setTestSearchOpen,
    } = usePortfolioKnowledge();

    const hasActiveFilters = Boolean(search || category || status);

    return (
        <div className="p-3.5 rounded-xl bg-[#F4EDE4] border border-[#D6CDC2] space-y-3">
            <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3">
                {/* Search & Select Filters */}
                <div className="flex-1 flex flex-col sm:flex-row md:flex-wrap lg:flex-nowrap items-stretch sm:items-center gap-2.5">
                    {/* Search Input */}
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="w-4 h-4 text-[#8C8278] absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            placeholder="Search knowledge title, facts, keywords, projects..."
                            className="w-full pl-9 pr-8 py-2 text-xs bg-[#EAE2D7] border border-[#D6CDC2] rounded-lg text-[#14100E] placeholder-[#8C8278] focus:outline-none focus:border-[#14100E] transition-colors"
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={() => handleSearchChange("")}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8C8278] hover:text-[#14100E]"
                                title="Clear search"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    {/* Category Dropdown */}
                    <div className="w-full sm:w-48">
                        <select
                            value={category}
                            onChange={(e) => handleCategoryChange(e.target.value)}
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

                    {/* Status Dropdown */}
                    <div className="w-full sm:w-40">
                        <select
                            value={status}
                            onChange={(e) => handleStatusChange(e.target.value)}
                            className="w-full px-3 py-2 text-xs bg-[#EAE2D7] border border-[#D6CDC2] rounded-lg text-[#14100E] focus:outline-none focus:border-[#14100E] transition-colors cursor-pointer"
                        >
                            {KNOWLEDGE_STATUSES.map((s) => (
                                <option key={s.value} value={s.value}>
                                    {s.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Reset & Refresh */}
                    <div className="flex items-center gap-1.5 self-end sm:self-auto">
                        {hasActiveFilters && (
                            <button
                                type="button"
                                onClick={handleResetFilters}
                                className="p-2 text-xs text-[#8C8278] hover:text-[#14100E] rounded-lg border border-[#D6CDC2] bg-[#EAE2D7] hover:bg-[#D6CDC2]/50 transition-colors"
                                title="Reset filters"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="p-2 text-xs text-[#6B625A] hover:text-[#14100E] rounded-lg border border-[#D6CDC2] bg-[#EAE2D7] hover:bg-[#D6CDC2]/50 transition-colors"
                            title="Reload knowledge records"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
                        </button>
                    </div>
                </div>

                {/* Right Action Buttons */}
                <div className="flex items-center gap-2 self-end xl:self-auto">
                    <button
                        type="button"
                        onClick={() => setTestSearchOpen(true)}
                        className="px-3 py-2 rounded-lg border border-[#D6CDC2] bg-[#EAE2D7] hover:bg-[#D6CDC2]/60 text-xs font-mono font-medium text-[#14100E] flex items-center gap-1.5 transition-colors"
                        title="Test how the AI retrieves matching facts"
                    >
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        <span>Test AI Search</span>
                    </button>

                    <button
                        type="button"
                        onClick={handleOpenCreateModal}
                        className="px-3.5 py-2 rounded-lg bg-[#14100E] hover:bg-[#2A2420] text-[#F4EDE4] text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Knowledge</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

