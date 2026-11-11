"use client";

import React from "react";
import { Film, Users, Mail, Eye, Activity, ShieldCheck, ArrowUpRight } from "lucide-react";

export default function MetricsSection({ stats, userRole = "user", activeSessions = 1 }) {
    const isSuperuser = userRole === "admin";

    const metrics = [
        {
            label: "ACTIVE PRODUCTIONS",
            value: isSuperuser ? "18" : "3",
            subtext: "4 In Post-Production",
            trend: "+2 this quarter",
            icon: Film,
        },
        {
            label: "PREMIERED FILMS",
            value: "12",
            subtext: "7 Festival Selections",
            trend: "100% Delivery",
            icon: Activity,
        },
        {
            label: isSuperuser ? "CLIENT ENQUIRIES" : "ACTIVE SESSIONS",
            value: isSuperuser ? (stats?.totalUsers ? String(stats.totalUsers) : "5") : String(activeSessions),
            subtext: isSuperuser ? "3 Awaiting Response" : "Argon2id + JWT Active",
            trend: isSuperuser ? "48h avg turnaround" : "Encrypted",
            icon: isSuperuser ? Mail : ShieldCheck,
        },
        {
            label: "SHOWREEL RETENTION",
            value: "94.2%",
            subtext: "4.2k Unique Viewers",
            trend: "+12.4% vs last month",
            icon: Eye,
        },
    ];

    return (
        <section className="border-y border-[#D6CDC2] bg-[#EAE2D7]/40 py-6 px-4 sm:px-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0 lg:divide-x lg:divide-[#D6CDC2]">
                {metrics.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                        <div
                            key={item.label}
                            className={`${
                                idx !== 0 ? "lg:pl-6" : ""
                            } ${
                                idx !== metrics.length - 1 ? "lg:pr-6" : ""
                            } flex flex-col justify-between`}
                        >
                            <div>
                                <div className="flex items-center justify-between text-[#8C8278] mb-1.5">
                                    <span className="font-mono text-[10px] uppercase tracking-[0.16em]">
                                        {item.label}
                                    </span>
                                    <Icon className="w-3.5 h-3.5 opacity-60" />
                                </div>
                                <div className="font-sans font-bold text-3xl sm:text-4xl text-[#14100E] tracking-tight">
                                    {item.value}
                                </div>
                            </div>

                            <div className="mt-3 pt-2 border-t border-[#D6CDC2]/50 flex items-center justify-between text-[11px] font-mono text-[#6B625A]">
                                <span>{item.subtext}</span>
                                <span className="text-[#14100E] font-medium flex items-center">
                                    {item.trend}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
