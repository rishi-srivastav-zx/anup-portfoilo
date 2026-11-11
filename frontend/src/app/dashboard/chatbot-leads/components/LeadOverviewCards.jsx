"use client";

import React from "react";
import {
    Users,
    Sparkles,
    MessageCircle,
    CheckCircle2,
    Trophy,
} from "lucide-react";
import { OVERVIEW_CARDS_CONFIG } from "../config/chatbotLeadsConfig";
import { useChatbotLeads } from "../provider/ChatbotLeadsProvider";

const ICON_MAP = {
    Users,
    Sparkles,
    MessageCircle,
    CheckCircle2,
    Trophy,
};

export default function LeadOverviewCards() {
    const { stats, loading } = useChatbotLeads();

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-3.5">
            {OVERVIEW_CARDS_CONFIG.map((card) => {
                const Icon = ICON_MAP[card.iconName] || Users;
                const value = stats?.[card.statKey] ?? 0;

                return (
                    <div
                        key={card.id}
                        className={`p-4 rounded-xl border border-[#D6CDC2] bg-[#F4EDE4] flex flex-col justify-between transition-all duration-200 hover:shadow-sm ${
                            loading && !stats.total ? "animate-pulse" : ""
                        }`}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-mono uppercase tracking-wider text-[#6B625A]">
                                {card.label}
                            </span>
                            <div className={`p-1.5 rounded-lg ${card.bgColor} border border-[#D6CDC2]/50`}>
                                <Icon className={`w-3.5 h-3.5 ${card.color}`} />
                            </div>
                        </div>

                        <div className="mt-1">
                            <div className="text-2xl font-bold font-sans text-[#14100E]">
                                {loading && !stats.total ? "—" : value}
                            </div>
                            <p className="text-[10px] text-[#8C8278] mt-0.5 truncate">
                                {card.subtext}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

