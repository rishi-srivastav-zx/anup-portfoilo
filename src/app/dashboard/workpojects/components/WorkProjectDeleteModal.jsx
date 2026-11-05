"use client";

import React from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { useWorkProjects } from "../provider/WorkProjectsProvider";

export default function WorkProjectDeleteModal() {
    const {
        deletingProject,
        deleteSubmitting,
        setDeletingProject,
        handleDeleteProject,
    } = useWorkProjects();

    if (!deletingProject) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="relative w-full max-w-md p-6 bg-[#F4EDE4] border border-[#D6CDC2] rounded-2xl shadow-2xl space-y-4">
                <button
                    type="button"
                    onClick={() => setDeletingProject(null)}
                    disabled={deleteSubmitting}
                    className="absolute top-4 right-4 p-1 text-[#8C8278] hover:text-[#14100E] rounded-lg transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-red-100 text-red-700 border border-red-200 shrink-0">
                        <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-sans font-bold text-base text-[#14100E]">
                            Delete Video Project?
                        </h3>
                        <p className="text-xs text-[#6B625A]">
                            This will permanently remove the video and transit station data.
                        </p>
                    </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#EAE2D7] border border-[#D6CDC2] space-y-1.5 text-xs">
                    <div className="flex justify-between">
                        <span className="text-[#8C8278]">Title:</span>
                        <span className="font-semibold text-[#14100E]">{deletingProject.title}</span>
                    </div>
                    {deletingProject.client && (
                        <div className="flex justify-between">
                            <span className="text-[#8C8278]">Client:</span>
                            <span className="text-[#14100E]">{deletingProject.client}</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                    <button
                        type="button"
                        onClick={() => setDeletingProject(null)}
                        disabled={deleteSubmitting}
                        className="px-4 py-2 text-xs font-semibold rounded-lg border border-[#D6CDC2] bg-[#EAE2D7] hover:bg-[#D6CDC2]/50 text-[#14100E] transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={() => handleDeleteProject(deletingProject.id)}
                        disabled={deleteSubmitting}
                        className="px-4 py-2 text-xs font-semibold rounded-lg bg-red-600 hover:bg-red-700 text-white flex items-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{deleteSubmitting ? "Deleting..." : "Delete Project"}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

