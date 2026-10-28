"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Play, Film, MoreHorizontal, ArrowUpRight, Camera } from "lucide-react";

export const initialProjects = [
    {
        id: "proj-1",
        title: "The Last Monologue",
        client: "Karan Malhotra / Dharma Ent.",
        category: "Narrative Feature",
        camera: "ARRI Alexa Mini LF",
        lens: "Cooke Anamorphic /i 2x",
        ratio: "2.39:1 Anamorphic",
        status: "Post-Production",
        date: "Oct 2026",
        thumbnail: "/images/Cinematic Filmmaking Storyboard Workspace.png",
    },
    {
        id: "proj-2",
        title: "Monsoon in Varanasi",
        client: "Independent Arts Trust",
        category: "Documentary",
        camera: "RED V-Raptor 8K VV",
        lens: "Leitz Summilux-C Primes",
        ratio: "1.85:1 Flat",
        status: "Color Grading",
        date: "Sep 2026",
        thumbnail: "/images/polaroid_sunset.jpg",
    },
    {
        id: "proj-3",
        title: "Nocturne in Neon",
        client: "Universal Music Group",
        category: "Music Video",
        camera: "Sony Venice 2",
        lens: "Atlas Orion Anamorphic",
        ratio: "2.39:1 Anamorphic",
        status: "Premiered",
        date: "Aug 2026",
        thumbnail: "/images/camera_operator.png",
    },
    {
        id: "proj-4",
        title: "Echoes of the Valley",
        client: "Audi India / Luxury Brand",
        category: "Commercial",
        camera: "ARRI 35",
        lens: "Angenieux Optimo Ultra",
        ratio: "2.39:1 Anamorphic",
        status: "Delivered",
        date: "Jul 2026",
        thumbnail: "/images/Cinematic Filmmaking Storyboard Workspace.png",
    },
];

export default function RecentProjectsSection({
    projects = initialProjects,
    onOpenScreening,
    onOpenQuickCreate,
}) {
    const [selectedCategory, setSelectedCategory] = useState("All");

    const categories = ["All", "Narrative Feature", "Documentary", "Commercial", "Music Video"];

    const filtered =
        selectedCategory === "All"
            ? projects
            : projects.filter((p) => p.category === selectedCategory);

    return (
        <section className="space-y-4">
            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#D6CDC2]">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-[9px] uppercase tracking-widest text-[#8C8278]">
                            [ 01 // PRODUCTION ARCHIVE ]
                        </span>
                    </div>
                    <h2 className="font-sans font-bold text-xl text-[#14100E] tracking-tight">
                        Selected Works &amp; Active Slates
                    </h2>
                </div>

                {/* Filter pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-3 py-1 rounded-full text-[11px] font-mono uppercase whitespace-nowrap transition-colors ${
                                selectedCategory === cat
                                    ? "bg-[#14100E] text-[#F4EDE4] font-medium"
                                    : "bg-[#E0D6C8]/60 hover:bg-[#D6CDC2] text-[#6B625A]"
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Project Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filtered.map((proj) => (
                    <div
                        key={proj.id}
                        className="group border border-[#D6CDC2] rounded-xl overflow-hidden bg-[#F4EDE4] hover:border-[#14100E] transition-all duration-200 flex flex-col justify-between"
                    >
                        {/* Cinematic Aspect Ratio Frame Thumbnail */}
                        <div className="relative aspect-[2.39/1] bg-[#14100E] overflow-hidden">
                            <div
                                className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                                style={{
                                    backgroundImage: `url(${proj.thumbnail})`,
                                }}
                            />

                            {/* Viewfinder framing marks */}
                            <div className="absolute inset-2 sm:inset-3 border border-white/20 pointer-events-none flex flex-col justify-between p-1.5 text-[8px] font-mono text-white/60">
                                <div className="flex justify-between">
                                    <span>┌ {proj.ratio}</span>
                                    <span>{proj.status} ┐</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>└ {proj.camera}</span>
                                    <span>{proj.date} ┘</span>
                                </div>
                            </div>

                            {/* Screening Button Overlay */}
                            <button
                                onClick={() => onOpenScreening(proj)}
                                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 backdrop-blur-xs transition-opacity duration-200"
                            >
                                <span className="px-4 py-2 rounded-full bg-[#F4EDE4] text-[#14100E] text-xs font-sans font-bold flex items-center gap-1.5 shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform">
                                    <Play className="w-3.5 h-3.5 fill-current" />
                                    <span>Screen Footage</span>
                                </span>
                            </button>
                        </div>

                        {/* Project Details */}
                        <div className="p-4 sm:p-5 flex flex-col justify-between flex-1">
                            <div>
                                <div className="flex items-center justify-between text-[10px] font-mono text-[#8C8278] uppercase mb-1">
                                    <span>{proj.category}</span>
                                    <span>{proj.status}</span>
                                </div>
                                <h3 className="font-sans font-bold text-lg text-[#14100E] group-hover:underline">
                                    {proj.title}
                                </h3>
                                <p className="text-xs text-[#6B625A] font-sans mt-0.5">
                                    Director: {proj.client}
                                </p>
                            </div>

                            <div className="mt-4 pt-3 border-t border-[#D6CDC2]/60 flex items-center justify-between text-xs font-mono text-[#6B625A]">
                                <span className="truncate max-w-[200px]">
                                    {proj.lens}
                                </span>
                                <button
                                    onClick={() => onOpenScreening(proj)}
                                    className="text-[#14100E] font-medium hover:underline flex items-center gap-1 text-[11px]"
                                >
                                    <span>Screening</span>
                                    <ArrowUpRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
