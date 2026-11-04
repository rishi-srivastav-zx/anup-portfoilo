"use client";

import React from "react";
import {
    Users,
    Sparkles,
    MessageCircle,
    CheckCircle2,
    Trophy,
    TrendingUp,
} from "lucide-react";

export default function LeadOverviewCards({ stats = {}, loading = false }) {
    const total = stats.total || 0;
    const newCount = stats.new || 0;
    const inDiscussion = stats.in_discussion || 0;
    const qualified = stats.qualified || 0;
    const converted = stats.converted || 0;

    const cards = [
        {
            label: "Total Leads",
            value: total,
            icon: Users,
            color: "text-[#14100E]",
            bgColor: "bg-[#EAE2D7]",
            subtext: "All AI assistant enquiries",
        },
        {
            label: "New Enquiries",
            value: newCount,
            icon: Sparkles,
            color: "text-blue-700",
            bgColor: "bg-blue-50 border-blue-200",
            subtext: "Awaiting first response",
        },
        {
            label: "In Discussion",
            value: inDiscussion,
            icon: MessageCircle,
            color: "text-purple-700",
            bgColor: "bg-purple-50 border-purple-200",
            subtext: "Active conversations",
        },
        {
            label: "Qualified",
            value: qualified,
            icon: CheckCircle2,
            color: "text-indigo-700",
            bgColor: "bg-indigo-50 border-indigo-200",
            subtext: "Budget & date aligned",
        },
        {
            label: "Converted",
            value: converted,
            icon: Trophy,
            color: "text-emerald-700",
            bgColor: "bg-emerald-50 border-emerald-200",
            subtext: "Booked productions",
        },
    ];

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {cards.map((c, i) => {
                const Icon = c.icon;
                return (
                    <div
                        key={i}
                        className={`p-4 rounded-xl border border-[#D6CDC2] bg-[#F4EDE4] flex flex-col justify-between transition-all duration-200 hover:shadow-sm ${
                            loading ? "animate-pulse" : ""
                        }`}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-mono uppercase tracking-wider text-[#6B625A]">
                                {c.label}
                            </span>
                            <div className={`p-1.5 rounded-lg ${c.bgColor} border border-[#D6CDC2]/50`}>
                                <Icon className={`w-3.5 h-3.5 ${c.color}`} />
                            </div>
                        </div>

                        <div className="mt-1">
                            <div className="text-2xl font-bold font-sans text-[#14100E]">
                                {loading ? "—" : c.value}
                            </div>
                            <p className="text-[10px] text-[#8C8278] mt-0.5 truncate">
                                {c.subtext}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
