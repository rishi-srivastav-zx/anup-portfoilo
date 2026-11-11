"use client";

import React, { useState } from "react";
import { Eye, Globe, Play, Film, ArrowUpRight, TrendingUp } from "lucide-react";

export default function WebsitePerformanceSection() {
    const [period, setPeriod] = useState("30D");

    // Monthly data points
    const dataPoints = [24, 38, 42, 35, 58, 62, 54, 78, 86, 94, 88, 102];
    const months = ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"];

    const maxValue = Math.max(...dataPoints);
    const chartHeight = 160;
    const chartWidth = 500;

    // Build SVG path
    const points = dataPoints.map((val, idx) => {
        const x = (idx / (dataPoints.length - 1)) * chartWidth;
        const y = chartHeight - (val / maxValue) * (chartHeight - 20) - 10;
        return `${x},${y}`;
    });

    const pathD = `M ${points.join(" L ")}`;
    const areaD = `${pathD} L ${chartWidth},${chartHeight} L 0,${chartHeight} Z`;

    return (
        <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#D6CDC2]">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-[9px] uppercase tracking-widest text-[#8C8278]">
                            [ 03 // AUDIENCE ANALYTICS ]
                        </span>
                    </div>
                    <h2 className="font-sans font-bold text-xl text-[#14100E] tracking-tight">
                        Showreel &amp; Audience Telemetry
                    </h2>
                </div>

                <div className="flex items-center gap-1 bg-[#E0D6C8]/60 p-1 rounded-lg border border-[#D6CDC2]">
                    {["7D", "30D", "90D", "1Y"].map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`px-2.5 py-1 rounded text-[10px] font-mono uppercase transition-colors ${
                                period === p
                                    ? "bg-[#14100E] text-[#F4EDE4] font-semibold"
                                    : "text-[#6B625A] hover:text-[#14100E]"
                            }`}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Understated Line Chart */}
                <div className="lg:col-span-2 border border-[#D6CDC2] rounded-xl p-5 bg-[#F4EDE4] flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <span className="text-[10px] font-mono uppercase tracking-wider text-[#8C8278]">
                                Unique Showreel Stream Sessions
                            </span>
                            <div className="font-sans font-bold text-2xl text-[#14100E] mt-0.5">
                                4,248 Plays{" "}
                                <span className="text-xs font-mono font-normal text-emerald-800 ml-2">
                                    ↑ 14.2% vs previous period
                                </span>
                            </div>
                        </div>

                        <span className="font-mono text-[10px] uppercase text-[#6B625A] bg-[#EAE2D7] px-2.5 py-1 rounded border border-[#D6CDC2]">
                            Avg Completion: 94.2%
                        </span>
                    </div>

                    {/* SVG Chart */}
                    <div className="w-full overflow-hidden pt-2">
                        <svg
                            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                            className="w-full h-44 overflow-visible"
                        >
                            <defs>
                                <linearGradient
                                    id="chartGradient"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >
                                    <stop
                                        offset="0%"
                                        stopColor="#14100E"
                                        stopOpacity="0.15"
                                    />
                                    <stop
                                        offset="100%"
                                        stopColor="#14100E"
                                        stopOpacity="0"
                                    />
                                </linearGradient>
                            </defs>

                            {/* Horizontal guide lines */}
                            <line
                                x1="0"
                                y1="30"
                                x2={chartWidth}
                                y2="30"
                                stroke="#D6CDC2"
                                strokeDasharray="3 3"
                            />
                            <line
                                x1="0"
                                y1="80"
                                x2={chartWidth}
                                y2="80"
                                stroke="#D6CDC2"
                                strokeDasharray="3 3"
                            />
                            <line
                                x1="0"
                                y1="130"
                                x2={chartWidth}
                                y2="130"
                                stroke="#D6CDC2"
                                strokeDasharray="3 3"
                            />

                            {/* Area fill */}
                            <path d={areaD} fill="url(#chartGradient)" />

                            {/* Stroke line */}
                            <path
                                d={pathD}
                                fill="none"
                                stroke="#14100E"
                                strokeWidth="2"
                                strokeLinecap="round"
                            />

                            {/* Data points */}
                            {points.map((p, i) => {
                                const [cx, cy] = p.split(",");
                                return (
                                    <circle
                                        key={i}
                                        cx={cx}
                                        cy={cy}
                                        r="3"
                                        fill="#F4EDE4"
                                        stroke="#14100E"
                                        strokeWidth="2"
                                    />
                                );
                            })}
                        </svg>

                        {/* Month labels */}
                        <div className="flex justify-between text-[10px] font-mono text-[#8C8278] mt-2 pt-2 border-t border-[#D6CDC2]/50">
                            {months.map((m) => (
                                <span key={m}>{m}</span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Regional & Device Breakdown */}
                <div className="border border-[#D6CDC2] rounded-xl p-5 bg-[#F4EDE4] flex flex-col justify-between space-y-4">
                    <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[#8C8278] block mb-1">
                            Geographic Agency Engagement
                        </span>
                        <h3 className="font-sans font-bold text-base text-[#14100E]">
                            Top Film Markets
                        </h3>
                    </div>

                    <div className="space-y-3 font-mono text-xs">
                        <div>
                            <div className="flex justify-between text-[#4A423B] mb-1">
                                <span>Mumbai / Bollywood Hub</span>
                                <span className="font-bold text-[#14100E]">
                                    48%
                                </span>
                            </div>
                            <div className="w-full bg-[#E0D6C8] h-1.5 rounded-full overflow-hidden">
                                <div
                                    className="bg-[#14100E] h-full rounded-full"
                                    style={{ width: "48%" }}
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between text-[#4A423B] mb-1">
                                <span>London / UK Commercials</span>
                                <span className="font-bold text-[#14100E]">
                                    26%
                                </span>
                            </div>
                            <div className="w-full bg-[#E0D6C8] h-1.5 rounded-full overflow-hidden">
                                <div
                                    className="bg-[#14100E] h-full rounded-full"
                                    style={{ width: "26%" }}
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between text-[#4A423B] mb-1">
                                <span>Los Angeles / US Indie</span>
                                <span className="font-bold text-[#14100E]">
                                    16%
                                </span>
                            </div>
                            <div className="w-full bg-[#E0D6C8] h-1.5 rounded-full overflow-hidden">
                                <div
                                    className="bg-[#14100E] h-full rounded-full"
                                    style={{ width: "16%" }}
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between text-[#4A423B] mb-1">
                                <span>Berlin / European Narrative</span>
                                <span className="font-bold text-[#14100E]">
                                    10%
                                </span>
                            </div>
                            <div className="w-full bg-[#E0D6C8] h-1.5 rounded-full overflow-hidden">
                                <div
                                    className="bg-[#14100E] h-full rounded-full"
                                    style={{ width: "10%" }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="p-3 bg-[#EAE2D7] rounded-lg border border-[#D6CDC2]/60 text-[11px] font-mono text-[#6B625A]">
                        <span className="font-bold text-[#14100E]">
                            PRIMARY FORMAT:
                        </span>{" "}
                        High bitrate 4K HDR streams on desktop colorist displays.
                    </div>
                </div>
            </div>
        </section>
    );
}
