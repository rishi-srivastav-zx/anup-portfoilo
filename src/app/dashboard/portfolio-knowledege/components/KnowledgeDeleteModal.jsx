"use client";

import React from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { usePortfolioKnowledge } from "../provider/PortfolioKnowledgeProvider";

export default function KnowledgeDeleteModal() {
    const {
        deleteCandidate,
        deleteModalOpen,
        deleting,
        handleCloseDeleteModal,
        handleConfirmDelete,
    } = usePortfolioKnowledge();

    if (!deleteModalOpen || !deleteCandidate) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="relative w-full max-w-md p-6 bg-[#F4EDE4] border border-[#D6CDC2] rounded-2xl shadow-2xl space-y-4">
                <button
                    type="button"
                    onClick={handleCloseDeleteModal}
                    disabled={deleting}
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
                            Delete Knowledge Fact?
                        </h3>
                        <p className="text-xs text-[#6B625A]">
                            This will remove the fact from the AI retrieval index permanently.
                        </p>
                    </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#EAE2D7] border border-[#D6CDC2] space-y-1.5 text-xs">
                    <div className="font-semibold text-[#14100E] line-clamp-1">
                        {deleteCandidate.title}
                    </div>
                    <div className="text-[#6B625A] line-clamp-2 text-[11px]">
                        {deleteCandidate.content || deleteCandidate.fact}
                    </div>
                    {deleteCandidate.category && (
                        <div className="text-[10px] font-mono text-[#8C8278] pt-1">
                            Category: {deleteCandidate.category}
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                    <button
                        type="button"
                        onClick={handleCloseDeleteModal}
                        disabled={deleting}
                        className="px-4 py-2 text-xs font-semibold rounded-lg border border-[#D6CDC2] bg-[#EAE2D7] hover:bg-[#D6CDC2]/50 text-[#14100E] transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleConfirmDelete}
                        disabled={deleting}
                        className="px-4 py-2 text-xs font-semibold rounded-lg bg-red-600 hover:bg-red-700 text-white flex items-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{deleting ? "Deleting..." : "Delete Permanently"}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

