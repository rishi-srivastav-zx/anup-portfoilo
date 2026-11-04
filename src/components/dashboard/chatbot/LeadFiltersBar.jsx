"use client";

import React from "react";
import { Search, RefreshCw, X, Filter, Calendar } from "lucide-react";

export const PIPELINE_STATUSES = [
    { value: "", label: "All Statuses" },
    { value: "new", label: "New" },
    { value: "contacted", label: "Contacted" },
    { value: "in_discussion", label: "In Discussion" },
    { value: "qualified", label: "Qualified" },
    { value: "converted", label: "Converted" },
    { value: "closed", label: "Closed" },
    { value: "rejected", label: "Rejected" },
    { value: "spam", label: "Spam" },
];

export const PROJECT_TYPES = [
    { value: "", label: "All Project Types" },
    { value: "Commercial", label: "Commercial" },
    { value: "Music Video", label: "Music Video" },
    { value: "Documentary", label: "Documentary" },
    { value: "Brand Film", label: "Brand Film" },
    { value: "Narrative Film", label: "Narrative Film" },
    { value: "Corporate", label: "Corporate" },
];

export default function LeadFiltersBar({
    search = "",
    onSearchChange,
    status = "",
    onStatusChange,
    projectType = "",
    onProjectTypeChange,
    startDate = "",
    onStartDateChange,
    endDate = "",
    onEndDateChange,
    onResetFilters,
    onRefresh,
    refreshing = false,
}) {
    const hasActiveFilters = Boolean(search || status || projectType || startDate || endDate);

    return (
        <div className="p-3.5 rounded-xl bg-[#F4EDE4] border border-[#D6CDC2] space-y-3">
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5">
                {/* Search Bar */}
                <div className="relative flex-1">
                    <Search className="w-4 h-4 text-[#8C8278] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Search by visitor name, phone, location, requirements..."
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

                {/* Status Dropdown */}
                <div className="w-full sm:w-44">
                    <select
                        value={status}
                        onChange={(e) => onStatusChange(e.target.value)}
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
                        onChange={(e) => onProjectTypeChange(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-[#EAE2D7] border border-[#D6CDC2] rounded-lg text-[#14100E] focus:outline-none focus:border-[#14100E] transition-colors cursor-pointer"
                    >
                        {PROJECT_TYPES.map((p) => (
                            <option key={p.value} value={p.value}>
                                {p.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Action Controls */}
                <div className="flex items-center gap-2 self-end md:self-auto">
                    {hasActiveFilters && (
                        <button
                            type="button"
                            onClick={onResetFilters}
                            className="px-2.5 py-2 text-xs font-mono text-[#8C8278] hover:text-[#14100E] rounded-lg border border-[#D6CDC2] hover:bg-[#EAE2D7] transition-colors flex items-center gap-1"
                            title="Reset All Filters"
                        >
                            <X className="w-3.5 h-3.5" />
                            <span>Clear</span>
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={onRefresh}
                        disabled={refreshing}
                        className="p-2 text-[#14100E] hover:bg-[#EAE2D7] rounded-lg border border-[#D6CDC2] transition-colors disabled:opacity-50"
                        title="Refresh Leads"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
                    </button>
                </div>
            </div>

            {/* Date Range Collapsible Filters */}
            <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-[#D6CDC2]/50 text-xs text-[#6B625A]">
                <div className="flex items-center gap-1.5 font-mono text-[11px]">
                    <Calendar className="w-3.5 h-3.5 text-[#8C8278]" />
                    <span>Date Range:</span>
                </div>

                <div className="flex items-center gap-2">
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => onStartDateChange(e.target.value)}
                        className="px-2 py-1 text-xs bg-[#EAE2D7] border border-[#D6CDC2] rounded text-[#14100E] focus:outline-none"
                    />
                    <span className="text-[#8C8278] font-mono">to</span>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => onEndDateChange(e.target.value)}
                        className="px-2 py-1 text-xs bg-[#EAE2D7] border border-[#D6CDC2] rounded text-[#14100E] focus:outline-none"
                    />
                </div>
            </div>
        </div>
    );
}
