"use client";

import React from "react";
import { Search, RefreshCw, X, Filter, Calendar } from "lucide-react";
import { PIPELINE_STATUSES, PROJECT_TYPES } from "../config/chatbotLeadsConfig";
import { useChatbotLeads } from "../provider/ChatbotLeadsProvider";

export default function LeadFiltersBar() {
    const {
        search,
        status,
        projectType,
        startDate,
        endDate,
        refreshing,
        handleSearchChange,
        handleStatusChange,
        handleProjectTypeChange,
        handleStartDateChange,
        handleEndDateChange,
        handleResetFilters,
        handleRefresh,
    } = useChatbotLeads();

    const hasActiveFilters = Boolean(search || status || projectType || startDate || endDate);

    return (
        <div className="p-3.5 rounded-xl bg-[#F4EDE4] border border-[#D6CDC2] space-y-3">
            <div className="flex flex-col sm:flex-row md:flex-wrap lg:flex-nowrap items-stretch sm:items-center gap-2.5">
                {/* Search Bar */}
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="w-4 h-4 text-[#8C8278] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        placeholder="Search by visitor name, phone, location, requirements..."
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

                {/* Status Dropdown */}
                <div className="w-full sm:w-44">
                    <select
                        value={status}
                        onChange={(e) => handleStatusChange(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-[#EAE2D7] border border-[#D6CDC2] rounded-lg text-[#14100E] focus:outline-none focus:border-[#14100E] transition-colors cursor-pointer"
                    >
                        {PIPELINE_STATUSES.map((s) => (
                            <option key={s.value} value={s.value}>
                                {s.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Project Type Dropdown */}
                <div className="w-full sm:w-44">
                    <select
                        value={projectType}
                        onChange={(e) => handleProjectTypeChange(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-[#EAE2D7] border border-[#D6CDC2] rounded-lg text-[#14100E] focus:outline-none focus:border-[#14100E] transition-colors cursor-pointer"
                    >
                        {PROJECT_TYPES.map((p) => (
                            <option key={p.value} value={p.value}>
                                {p.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Refresh & Reset Controls */}
                <div className="flex items-center gap-2 self-end md:self-auto">
                    {hasActiveFilters && (
                        <button
                            type="button"
                            onClick={handleResetFilters}
                            className="px-2.5 py-2 text-xs text-[#8C8278] hover:text-[#14100E] rounded-lg border border-[#D6CDC2] bg-[#EAE2D7] hover:bg-[#D6CDC2]/50 flex items-center gap-1 transition-colors"
                            title="Reset all filters"
                        >
                            <X className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Reset</span>
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="p-2 text-xs text-[#6B625A] hover:text-[#14100E] rounded-lg border border-[#D6CDC2] bg-[#EAE2D7] hover:bg-[#D6CDC2]/50 transition-colors"
                        title="Reload enquiries"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
                    </button>
                </div>
            </div>

            {/* Date Range Sub-Bar */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-[#D6CDC2]/50 text-xs">
                <div className="flex items-center gap-1.5 text-[#6B625A] font-mono text-[11px]">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Date Range:</span>
                </div>
                <input
                    type="date"
                    value={startDate}
                    onChange={(e) => handleStartDateChange(e.target.value)}
                    className="px-2.5 py-1 text-xs bg-[#EAE2D7] border border-[#D6CDC2] rounded-md text-[#14100E] focus:outline-none focus:border-[#14100E]"
                />
                <span className="text-[#8C8278] text-[11px]">to</span>
                <input
                    type="date"
                    value={endDate}
                    onChange={(e) => handleEndDateChange(e.target.value)}
                    className="px-2.5 py-1 text-xs bg-[#EAE2D7] border border-[#D6CDC2] rounded-md text-[#14100E] focus:outline-none focus:border-[#14100E]"
                />
            </div>
        </div>
    );
}

