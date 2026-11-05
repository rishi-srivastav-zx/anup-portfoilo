"use client";

import React from "react";
import { RefreshCw, MessageSquareCode, ShieldCheck } from "lucide-react";
import { useChatbotLeads } from "../provider/ChatbotLeadsProvider";

export default function ChatbotLeadsHeader() {
    const { refreshing, handleRefresh, stats, total } = useChatbotLeads();

    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D6CDC2] pb-4">
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#6B625A]">
                        CONVERSATIONAL AI PIPELINE // {stats.total || total || 0} ENQUIRIES LOGGED
                    </span>
                </div>
                <h1 className="font-sans font-bold text-xl text-[#14100E]">
                    Chatbot Leads &amp; Project Enquiries
                </h1>
                <p className="text-xs text-[#6B625A] mt-0.5">
                    Manage incoming client enquiries captured by your portfolio AI assistant.
                </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                    type="button"
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="px-3.5 py-1.5 rounded-lg border border-[#D6CDC2] bg-[#EAE2D7] hover:bg-[#D6CDC2]/60 text-[#14100E] text-xs font-mono font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
                    title="Refresh leads and pipeline metrics"
                >
                    <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
                    <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
                </button>
            </div>
        </div>
    );
}

