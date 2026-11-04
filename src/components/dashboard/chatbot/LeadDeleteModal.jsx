"use client";

import React from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";

export default function LeadDeleteModal({
    isOpen,
    onClose,
    onConfirm,
    lead = null,
    deleting = false,
}) {
    if (!isOpen || !lead) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="relative w-full max-w-md p-6 bg-[#F4EDE4] border border-[#D6CDC2] rounded-2xl shadow-2xl space-y-4">
                <button
                    onClick={onClose}
                    disabled={deleting}
                    className="absolute top-4 right-4 p-1 text-[#8C8278] hover:text-[#14100E] rounded-lg"
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-red-100 text-red-700 border border-red-200 shrink-0">
                        <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-sans font-bold text-base text-[#14100E]">
                            Delete Lead Enquiry?
                        </h3>
                        <p className="text-xs text-[#6B625A]">
                            This will permanently remove the record and cannot be undone.
                        </p>
                    </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#EAE2D7] border border-[#D6CDC2] space-y-1.5 text-xs">
                    <div className="flex justify-between">
                        <span className="text-[#8C8278]">Visitor:</span>
                        <span className="font-semibold text-[#14100E]">{lead.visitor_name}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-[#8C8278]">Phone:</span>
                        <span className="font-mono text-[#14100E]">{lead.phone}</span>
                    </div>
                    {lead.project_type && (
                        <div className="flex justify-between">
                            <span className="text-[#8C8278]">Project:</span>
                            <span className="text-[#14100E]">{lead.project_type}</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={deleting}
                        className="px-4 py-2 text-xs font-semibold text-[#6B625A] hover:text-[#14100E] rounded-lg border border-[#D6CDC2] hover:bg-[#EAE2D7] transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={deleting}
                        className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
                    >
                        {deleting ? (
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                        )}
                        <span>{deleting ? "Deleting..." : "Delete Lead"}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
