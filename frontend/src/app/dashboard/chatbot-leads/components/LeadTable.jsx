"use client";

import React from "react";
import {
    Eye,
    Trash2,
    ChevronLeft,
    ChevronRight,
    AlertCircle,
} from "lucide-react";
import { TABLE_COLUMNS, PIPELINE_STATUSES } from "../config/chatbotLeadsConfig";
import { useChatbotLeads } from "../provider/ChatbotLeadsProvider";
import LeadEmptyState from "./LeadEmptyState";

/**
 * Returns color-coded status badge from config
 */
export function getStatusBadge(status) {
    const s = (status || "new").toLowerCase();
    const configStatus = PIPELINE_STATUSES.find((item) => item.value === s);

    if (configStatus && configStatus.badgeBg) {
        return (
            <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${configStatus.badgeBg}`}
            >
                {configStatus.label}
            </span>
        );
    }

    return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-neutral-100 text-neutral-700 border border-neutral-200">
            {status || "New"}
        </span>
    );
}

export default function LeadTable() {
    const {
        leads,
        loading,
        error,
        page,
        limit,
        total,
        totalPages,
        handleOpenDrawer,
        handleOpenDeleteModal,
        handlePageChange,
        handleLimitChange,
        fetchLeads,
    } = useChatbotLeads();

    if (error) {
        return (
            <div className="p-8 rounded-xl bg-red-50 border border-red-200 text-center space-y-3">
                <AlertCircle className="w-8 h-8 text-red-600 mx-auto" />
                <p className="text-xs text-red-700">{error}</p>
                <button
                    type="button"
                    onClick={() => fetchLeads()}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
                >
                    Retry Loading
                </button>
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
        return <LeadEmptyState />;
    }

    return (
        <div className="rounded-xl border border-[#D6CDC2] bg-[#F4EDE4] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-left text-xs text-[#14100E] border-collapse">
                    <thead>
                        <tr className="bg-[#EAE2D7] border-b border-[#D6CDC2] text-[11px] font-mono uppercase tracking-wider text-[#6B625A]">
                            {TABLE_COLUMNS.map((col) => (
                                <th
                                    key={col.key}
                                    className={`py-3 px-4 ${col.key === "actions" ? "text-right" : ""}`}
                                >
                                    {col.label}
                                </th>
                            ))}
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
                                    onClick={() => handleOpenDrawer(lead.id)}
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
                                    <td className="py-3 px-4 text-[#8C8278] font-mono">
                                        {createdDate}
                                    </td>

                                    {/* Actions */}
                                    <td
                                        className="py-3 px-4 text-right"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <div className="flex items-center justify-end gap-1">
                                            <button
                                                type="button"
                                                onClick={() => handleOpenDrawer(lead.id)}
                                                className="p-1.5 text-[#6B625A] hover:text-[#14100E] hover:bg-[#D6CDC2] rounded-md transition-colors"
                                                title="View lead details & transcript"
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleOpenDeleteModal(lead)}
                                                className="p-1.5 text-[#8C8278] hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                                                title="Delete enquiry"
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

            {/* Pagination Controls */}
            <div className="p-3.5 bg-[#EAE2D7] border-t border-[#D6CDC2] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#6B625A]">
                <div className="flex items-center gap-2 font-mono text-[11px]">
                    <span>
                        Showing {leads.length > 0 ? (page - 1) * limit + 1 : 0} –{" "}
                        {Math.min(page * limit, total)} of {total} enquiries
                    </span>
                    <span className="text-[#8C8278]">|</span>
                    <div className="flex items-center gap-1">
                        <span>Per page:</span>
                        <select
                            value={limit}
                            onChange={(e) => handleLimitChange(Number(e.target.value))}
                            className="bg-[#F4EDE4] border border-[#D6CDC2] rounded px-1.5 py-0.5 text-xs text-[#14100E] focus:outline-none"
                        >
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        onClick={() => handlePageChange(Math.max(1, page - 1))}
                        disabled={page <= 1}
                        className="p-1.5 rounded-lg border border-[#D6CDC2] bg-[#F4EDE4] hover:bg-[#D6CDC2]/50 text-[#14100E] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="Previous page"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="px-2 font-mono text-[11px] text-[#14100E]">
                        Page {page} of {totalPages || 1}
                    </span>
                    <button
                        type="button"
                        onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                        disabled={page >= totalPages}
                        className="p-1.5 rounded-lg border border-[#D6CDC2] bg-[#F4EDE4] hover:bg-[#D6CDC2]/50 text-[#14100E] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="Next page"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}

