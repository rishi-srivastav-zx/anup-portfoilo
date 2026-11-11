"use client";

import React from "react";
import WorkProjectCard from "./WorkProjectCard";
import { useWorkProjects } from "../provider/WorkProjectsProvider";
import { Film } from "lucide-react";

export default function WorkProjectsList() {
    const {
        projects,
        loading,
        playingId,
        setPlayingId,
        handleMoveProject,
        setEditingProject,
        setDeletingProject,
    } = useWorkProjects();

    const handleTogglePlay = (id) => {
        setPlayingId((prev) => (prev === id ? null : id));
    };

    return (
        <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
                <h3 className="font-sans font-bold text-sm text-[#14100E]">
                    Current Transit Stations &amp; Films ({projects.length})
                </h3>
                <span className="text-[11px] font-mono text-[#8C8278]">
                    Ordered by metro train journey sequence
                </span>
            </div>

            {loading && projects.length === 0 ? (
                <div className="p-4 rounded-xl bg-[#F4EDE4] border border-[#D6CDC2] space-y-2">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-20 rounded-lg bg-[#EAE2D7] animate-pulse" />
                    ))}
                </div>
            ) : projects.length > 0 ? (
                <div className="space-y-2.5">
                    {projects.map((project, index) => (
                        <WorkProjectCard
                            key={project.id || index}
                            project={project}
                            index={index}
                            total={projects.length}
                            playingId={playingId}
                            onTogglePlay={handleTogglePlay}
                            onMove={handleMoveProject}
                            onEdit={setEditingProject}
                            onDelete={setDeletingProject}
                        />
                    ))}
                </div>
            ) : (
                <div className="p-8 rounded-xl bg-[#F4EDE4] border border-dashed border-[#D6CDC2] text-center space-y-2">
                    <Film className="w-7 h-7 text-[#8C8278] mx-auto opacity-70" />
                    <p className="text-xs text-[#6B625A]">
                        No video projects uploaded yet.
                    </p>
                    <p className="text-[10px] text-[#8C8278] font-mono">
                        Upload your master film reels above to populate the interactive Metro Transit World.
                    </p>
                </div>
            )}
        </div>
    );
}

