"use client";

import React from "react";
import { Film, CheckCircle2, ShieldCheck, Mail, ArrowUpRight, Camera } from "lucide-react";

export const initialActivities = [
    {
        id: "1",
        time: "14:20 IST",
        title: "Dharma Productions Enquiry Logged",
        desc: "Feature film principal photography availability inquiry received for Rajasthan shoot.",
        category: "Enquiry",
        icon: Mail,
    },
    {
        id: "2",
        time: "11:05 IST",
        title: "4K Color Graded Master Exported",
        desc: "Final rec709 and HDR10 deliverables uploaded for 'The Last Monologue' (2.39:1 Anamorphic).",
        category: "Production",
        icon: Film,
    },
    {
        id: "3",
        time: "08:30 IST",
        title: "Security Token Rotated Silently",
        desc: "HttpOnly opaque refresh token rotated via Argon2id hash with 0ms downtime.",
        category: "Security",
        icon: ShieldCheck,
    },
    {
        id: "4",
        time: "Yesterday",
        title: "Dailies Screening Link Accessed",
        desc: "Director streamed 10-bit Log footage from Mumbai production office.",
        category: "Screening",
        icon: Camera,
    },
];

export default function ActivityTimeline({ onOpenScreening }) {
    return (
        <section className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#D6CDC2]">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-[9px] uppercase tracking-widest text-[#8C8278]">
                            [ 04 // TIMELINE ]
                        </span>
                    </div>
                    <h2 className="font-sans font-bold text-xl text-[#14100E] tracking-tight">
                        Production Log &amp; Slate History
                    </h2>
                </div>
                <span className="text-[10px] font-mono uppercase text-[#8C8278]">
                    Live Synced
                </span>
            </div>

            <div className="border border-[#D6CDC2] rounded-xl p-5 bg-[#F4EDE4]">
                <div className="space-y-6">
                    {initialActivities.map((act, index) => {
                        const Icon = act.icon;
                        const isLast = index === initialActivities.length - 1;

                        return (
                            <div key={act.id} className="relative flex gap-4">
                                {/* Vertical line */}
                                {!isLast && (
                                    <div className="absolute left-4 top-8 bottom-[-16px] w-[1px] bg-[#D6CDC2]" />
                                )}

                                {/* Icon bubble */}
                                <div className="w-8 h-8 rounded-full bg-[#EAE2D7] border border-[#D6CDC2] flex items-center justify-center flex-shrink-0 text-[#14100E] z-10">
                                    <Icon className="w-3.5 h-3.5" />
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0 pt-0.5">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                                        <h4 className="font-sans font-bold text-xs text-[#14100E]">
                                            {act.title}
                                        </h4>
                                        <span className="text-[10px] font-mono text-[#8C8278]">
                                            {act.time}
                                        </span>
                                    </div>
                                    <p className="text-xs text-[#6B625A] leading-relaxed">
                                        {act.desc}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
