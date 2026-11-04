"use client";

import React from "react";
import {
    Eye,
    Trash2,
    ExternalLink,
    ChevronLeft,
    ChevronRight,
    AlertCircle,
    UserCheck,
    Clock,
    Phone,
} from "lucide-react";

/**
 * Maps pipeline status to Tailwind color-coded pill
 */
export function getStatusBadge(status) {
    const s = (status || "new").toLowerCase();

    switch (s) {
        case "new":
            return (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                    New
                </span>
            );
        case "contacted":
            return (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                    Contacted
                </span>
            );
        case "in_discussion":
            return (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-100 text-purple-800 border border-purple-200">
                    In Discussion
                </span>
            );
        case "qualified":
            return (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200">
                    Qualified
                </span>
            );
        case "converted":
            return (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Converted
                </span>
            );
        case "closed":
            return (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-neutral-100 text-neutral-700 border border-neutral-300">
                    Closed
                </span>
            );
        case "rejected":
            return (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 text-rose-700 border border-rose-200">
                    Rejected
                </span>
            );
        case "spam":
            return (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-100 text-red-800 border border-red-200">
                    Spam
                </span>
            );
        default:
            return (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-neutral-100 text-neutral-700 border border-neutral-200">
                    {status}
                </span>
            );
    }
}

export default function LeadTable({
    leads = [],
    loading = false,
    error = null,
    onSelectLead,
    onDeleteLead,
    pagination = { page: 1, limit: 20, total: 0, totalPages: 1 },
    onPageChange,
    onLimitChange,
    onRetry,
}) {
    if (error) {
        return (
            <div className="p-8 rounded-xl bg-red-50 border border-red-200 text-center space-y-3">
                <AlertCircle className="w-8 h-8 text-red-600 mx-auto" />
                <p className="text-xs text-red-700">{error}</p>
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
                    >
                        Retry Loading
                    </button>
                )}
            </div>
        );
    }

    if (loading && leads.length === 0) {
        return (
            <div className="p-4 rounded-xl bg-[#F4EDE4] border border-[#D6CDC2] space-y-2">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-12 rounded-lg bg-[#EAE2D7] animate-pulse" />
                ))}
            </div>
        );
    }

    if (leads.length === 0) {
        return (
            <div className="p-12 rounded-xl bg-[#F4EDE4] border border-dashed border-[#D6CDC2] text-center space-y-3">
                <div className="p-3 rounded-full bg-[#EAE2D7] w-12 h-12 flex items-center justify-center mx-auto text-[#8C8278]">
                    <UserCheck className="w-6 h-6" />
                </div>
                <h3 className="font-sans font-bold text-sm text-[#14100E]">No Chatbot Enquiries Found</h3>
                <p className="text-xs text-[#8C8278] max-w-sm mx-auto">
                    No leads match your current search and filters. As visitors chat with the AI assistant, enquiries will appear here.
                </p>
            </div>
        );
    }

    const { page, total, totalPages, limit } = pagination;

    return (
        <div className="rounded-xl border border-[#D6CDC2] bg-[#F4EDE4] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-[#14100E] border-collapse">
                    <thead>
                        <tr className="bg-[#EAE2D7] border-b border-[#D6CDC2] text-[11px] font-mono uppercase tracking-wider text-[#6B625A]">
                            <th className="py-3 px-4">Visitor / Client</th>
                            <th className="py-3 px-4">Phone / WhatsApp</th>
                            <th className="py-3 px-4">Project Type</th>
                            <th className="py-3 px-4">Budget</th>
                            <th className="py-3 px-4">Timeline</th>
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-4">Submitted</th>
                            <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#D6CDC2]/60">
                        {leads.map((lead) => {
                            const createdDate = lead.created_at
                                ? new Date(lead.created_at).toLocaleDateString([], {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                  })
                                : "—";

                            return (
                                <tr
                                    key={lead.id}
                                    onClick={() => onSelectLead(lead.id)}
                                    className="hover:bg-[#EAE2D7]/60 cursor-pointer transition-colors group"
                                >
                                    {/* Visitor Name & Ref */}
                                    <td className="py-3 px-4">
                                        <div className="font-semibold text-[#14100E] group-hover:underline">
                                            {lead.visitor_name}
                                        </div>
                                        <div className="text-[10px] font-mono text-[#8C8278]">
                                            {lead.referenceId || "AR-LEAD"}
                                        </div>
                                    </td>

                                    {/* Phone */}
                                    <td className="py-3 px-4 font-mono text-[#14100E]">
                                        {lead.phone || "—"}
                                    </td>

                                    {/* Project Type */}
                                    <td className="py-3 px-4 font-medium text-[#14100E]">
                                        {lead.project_type || "Commercial"}
                                    </td>

                                    {/* Budget */}
                                    <td className="py-3 px-4 font-mono text-[#6B625A]">
                                        {lead.budget || "—"}
                                    </td>

                                    {/* Preferred Date */}
                                    <td className="py-3 px-4 text-[#6B625A]">
                                        {lead.preferred_date || "Flexible"}
                                    </td>

                                    {/* Status Badge */}
                                    <td className="py-3 px-4">
                                        {getStatusBadge(lead.lead_status)}
                                    </td>

                                    {/* Created Date */}
                                    <td className="py-3 px-4 font-mono text-[11px] text-[#8C8278]">
                                        {createdDate}
                                    </td>

                                    {/* Actions */}
                                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex items-center justify-end gap-1">
                                            <button
                                                type="button"
                                                onClick={() => onSelectLead(lead.id)}
                                                className="p-1.5 text-[#6B625A] hover:text-[#14100E] rounded-md hover:bg-[#D6CDC2] transition-colors"
                                                title="View Details"
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => onDeleteLead(lead)}
                                                className="p-1.5 text-red-500 hover:text-red-700 rounded-md hover:bg-red-50 transition-colors"
                                                title="Delete Lead"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Pagination Toolbar */}
            <div className="p-3.5 border-t border-[#D6CDC2] bg-[#EAE2D7] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#6B625A]">
                <div className="flex items-center gap-2 font-mono text-[11px]">
                    <span>Showing</span>
                    <span className="font-semibold text-[#14100E]">
                        {leads.length > 0 ? (page - 1) * limit + 1 : 0}
                    </span>
                    <span>to</span>
                    <span className="font-semibold text-[#14100E]">
                        {Math.min(page * limit, total)}
                    </span>
                    <span>of</span>
                    <span className="font-semibold text-[#14100E]">{total}</span>
                    <span>enquiries</span>
                </div>

                <div className="flex items-center gap-2">
                    {/* Rows per page selector */}
                    <div className="flex items-center gap-1 font-mono text-[11px]">
                        <span>Rows:</span>
                        <select
                            value={limit}
                            onChange={(e) => onLimitChange(Number(e.target.value))}
                            className="px-1.5 py-1 text-xs bg-[#F4EDE4] border border-[#D6CDC2] rounded text-[#14100E] focus:outline-none"
                        >
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>
                    </div>

                    {/* Pagination Buttons */}
                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            onClick={() => onPageChange(page - 1)}
                            disabled={page <= 1}
                            className="p-1.5 rounded-lg border border-[#D6CDC2] hover:bg-[#F4EDE4] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="px-2 font-mono text-[11px] text-[#14100E]">
                            Page {page} of {totalPages || 1}
                        </span>
                        <button
                            type="button"
                            onClick={() => onPageChange(page + 1)}
                            disabled={page >= totalPages}
                            className="p-1.5 rounded-lg border border-[#D6CDC2] hover:bg-[#F4EDE4] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
