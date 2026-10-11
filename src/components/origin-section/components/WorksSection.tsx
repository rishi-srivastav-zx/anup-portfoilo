"use client";

import React from "react";

interface Project {
    num: string;
    title: string;
    category: string;
    description: string;
    metrics: string;
    tags: string[];
}

const PROJECTS: Project[] = [
    {
        num: "01",
        title: "AETHER RUNTIME",
        category: "Cloud Engine · Distributed Systems",
        description:
            "High-throughput edge orchestration engine processing 14k req/sec with sub-5ms cold starts.",
        metrics: "14k RPS · Sub-5ms",
        tags: ["Go", "Rust", "gRPC", "PostgreSQL"],
    },
    {
        num: "02",
        title: "NEXUS SPATIAL CANVAS",
        category: "Collaborative WebGL Canvas",
        description:
            "Infinite collaborative whiteboard featuring real-time multiplayer CRDT sync and 60fps WebGL rendering.",
        metrics: "250k MAU · 60fps",
        tags: ["TypeScript", "WebGL", "WebSockets", "Tailwind"],
    },
    {
        num: "03",
        title: "KINETIC SYNTHESIS",
        category: "Motion & Physics Interface",
        description:
            "Experimental audio-visual reactive synthesizer exploring physical spring systems in the browser.",
        metrics: "Featured on Awwwards",
        tags: ["React", "Tone.js", "Canvas API", "GLSL"],
    },
];

export const WorksSection: React.FC = () => {
    return (
        <section
            id="works"
            className="relative w-full py-28 px-6 md:px-12 bg-[#010204] border-b border-[#012CEB]/30"
        >
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                    <div>
                        <div className="flex items-center gap-2 font-dm-mono text-xs uppercase tracking-[0.25em] text-[#012CEB] mb-2">
                            <span>02 // SELECTED WORKS</span>
                            <span>·</span>
                            <span className="text-white/40">
                                SYSTEMS & INTERFACES
                            </span>
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black font-inter text-[#F4EFE6] uppercase tracking-tight">
                            FROM ORIGIN TO PRODUCTION.
                        </h2>
                    </div>
                    <p className="max-w-md text-sm text-[#F4EFE6]/60 font-dm-sans">
                        Here are selected systems engineered with the same
                        philosophy: uncompromising craft, high reliability, and
                        purpose-driven utility.
                    </p>
                </div>

                {/* Project Cards Bento/List */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {PROJECTS.map((p) => (
                        <div
                            key={p.num}
                            className="group relative bg-[#050811] border border-white/10 hover:border-[#012CEB] p-8 rounded-lg transition-all duration-300 flex flex-col justify-between hover:shadow-[0_12px_30px_rgba(1,44,235,0.15)] hover:-translate-y-1"
                        >
                            <div>
                                <div className="flex items-center justify-between text-xs font-dm-mono text-white/40 mb-6">
                                    <span>{p.num} // ARCHIVE</span>
                                    <span className="text-[#012CEB] font-bold">
                                        {p.metrics}
                                    </span>
                                </div>
                                <h3 className="text-2xl font-black font-inter text-[#F4EFE6] group-hover:text-white uppercase tracking-tight mb-2">
                                    {p.title}
                                </h3>
                                <div className="text-xs text-[#012CEB] font-dm-mono uppercase tracking-wider mb-4">
                                    {p.category}
                                </div>
                                <p className="text-sm text-[#F4EFE6]/70 font-dm-sans leading-relaxed mb-6">
                                    {p.description}
                                </p>
                            </div>

                            <div>
                                <div className="flex flex-wrap gap-2 pt-4 border-t border-white/10 text-[11px] font-dm-mono text-white/50">
                                    {p.tags.map((t, idx) => (
                                        <span key={t}>
                                            {t} {idx < p.tags.length - 1 && "·"}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
