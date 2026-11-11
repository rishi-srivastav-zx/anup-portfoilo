"use client";

import React from "react";
import { UserCheck, FilterX } from "lucide-react";
import { useChatbotLeads } from "../provider/ChatbotLeadsProvider";

export default function LeadEmptyState() {
    const { search, status, projectType, startDate, endDate, handleResetFilters } = useChatbotLeads();
    const hasActiveFilters = Boolean(search || status || projectType || startDate || endDate);

    return (
        <div className="p-12 rounded-xl bg-[#F4EDE4] border border-dashed border-[#D6CDC2] text-center space-y-3">
            <div className="p-3 rounded-full bg-[#EAE2D7] w-12 h-12 flex items-center justify-center mx-auto text-[#8C8278]">
                <UserCheck className="w-6 h-6" />
            </div>
            <h3 className="font-sans font-bold text-sm text-[#14100E]">
                No Chatbot Enquiries Found
            </h3>
            <p className="text-xs text-[#8C8278] max-w-sm mx-auto">
                No leads match your current search and filters. As visitors chat with the AI assistant, enquiries will appear here.
            </p>
            {hasActiveFilters && (
                <div className="pt-2">
                    <button
                        type="button"
                        onClick={handleResetFilters}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#D6CDC2] bg-[#EAE2D7] hover:bg-[#D6CDC2]/50 text-xs font-mono text-[#14100E] transition-colors"
                    >
                        <FilterX className="w-3.5 h-3.5 text-[#6B625A]" />
                        <span>Clear All Filters</span>
                    </button>
                </div>
            )}
        </div>
    );
}

