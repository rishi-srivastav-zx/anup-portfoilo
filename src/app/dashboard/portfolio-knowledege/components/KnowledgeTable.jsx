"use client";

import React from "react";
import {
    Edit3,
    Trash2,
    Globe,
    Lock,
    Archive,
    ChevronLeft,
    ChevronRight,
    AlertCircle,
} from "lucide-react";
import { TABLE_COLUMNS, KNOWLEDGE_STATUSES } from "../config/portfolioKnowledgeConfig";
import { usePortfolioKnowledge } from "../provider/PortfolioKnowledgeProvider";
import KnowledgeEmptyState from "./KnowledgeEmptyState";

export function getKnowledgeStatusBadge(status) {
    const s = (status || "draft").toLowerCase();

    switch (s) {
        case "published":
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <Globe className="w-2.5 h-2.5" />
                    <span>Published</span>
                </span>
            );
        case "archived":
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-neutral-100 text-neutral-700 border border-neutral-300">
                    <Archive className="w-2.5 h-2.5" />
                    <span>Archived</span>
                </span>
            );
        case "draft":
        default:
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                    <Lock className="w-2.5 h-2.5" />
                    <span>Draft</span>
                </span>
            );
    }
}

export default function KnowledgeTable() {
    const {
        items,
        loading,
        error,
        page,
        limit,
        total,
        totalPages,
        handleOpenEditModal,
        handleOpenDeleteModal,
        handleTogglePublish,
        handlePageChange,
        handleLimitChange,
        fetchKnowledge,
    } = usePortfolioKnowledge();

    if (error) {
        return (
            <div className="p-8 rounded-xl bg-red-50 border border-red-200 text-center space-y-3">
                <AlertCircle className="w-8 h-8 text-red-600 mx-auto" />
                <p className="text-xs text-red-700">{error}</p>
                <button
                    type="button"
                    onClick={() => fetchKnowledge()}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
                >
                    Retry Loading
                </button>
            </div>
        );
    }

    if (loading && items.length === 0) {
        return (
            <div className="p-4 rounded-xl bg-[#F4EDE4] border border-[#D6CDC2] space-y-2">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-12 rounded-lg bg-[#EAE2D7] animate-pulse" />
                ))}
            </div>
        );
    }

    if (items.length === 0) {
        return <KnowledgeEmptyState />;
    }

    return (
        <div className="rounded-xl border border-[#D6CDC2] bg-[#F4EDE4] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-xs text-[#14100E] border-collapse">
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
                        {items.map((item) => {
                            const updatedDate = item.updated_at
                                ? new Date(item.updated_at).toLocaleDateString([], {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                  })
                                : "—";

                            const rawKeywords = Array.isArray(item.keywords)
                                ? item.keywords
                                : typeof item.keywords === "string"
                                ? item.keywords.split(",").map((k) => k.trim())
                                : [];

                            const visibleKeywords = rawKeywords.slice(0, 3);
                            const extraCount = rawKeywords.length - visibleKeywords.length;

                            return (
                                <tr
                                    key={item.id}
                                    onClick={() => handleOpenEditModal(item)}
                                    className="hover:bg-[#EAE2D7]/60 cursor-pointer transition-colors group"
                                >
                                    {/* Title & Fact Snippet */}
                                    <td className="py-3 px-4 max-w-xs">
                                        <div className="font-semibold text-[#14100E] group-hover:underline truncate">
                                            {item.title}
                                        </div>
                                        <div className="text-[11px] text-[#6B625A] line-clamp-1 mt-0.5">
                                            {item.content || item.fact || "—"}
                                        </div>
                                    </td>

                                    {/* Category */}
                                    <td className="py-3 px-4">
                                        <span className="inline-block px-2.5 py-1 rounded-md bg-[#EAE2D7] border border-[#D6CDC2] text-[10px] font-mono text-[#6B625A] capitalize">
                                            {item.category || "General"}
                                        </span>
                                    </td>

                                    {/* Associated Project */}
                                    <td className="py-3 px-4 font-sans text-[#6B625A] truncate max-w-[140px]">
                                        {item.project || "—"}
                                    </td>

                                    {/* Keywords */}
                                    <td className="py-3 px-4">
                                        <div className="flex flex-wrap items-center gap-1 max-w-xs">
                                            {visibleKeywords.map((kw, idx) => (
                                                <span
                                                    key={idx}
                                                    className="px-1.5 py-0.5 rounded bg-[#EAE2D7] text-[10px] font-mono text-[#6B625A]"
                                                >
                                                    {kw}
                                                </span>
                                            ))}
                                            {extraCount > 0 && (
                                                <span className="text-[9px] font-mono text-[#8C8278]">
                                                    +{extraCount}
                                                </span>
                                            )}
                                        </div>
                                    </td>

                                    {/* Status Badge */}
                                    <td className="py-3 px-4">
                                        {getKnowledgeStatusBadge(item.status)}
                                    </td>

                                    {/* Updated Date */}
                                    <td className="py-3 px-4 text-[#8C8278] font-mono whitespace-nowrap">
                                        {updatedDate}
                                    </td>

                                    {/* Actions */}
                                    <td
                                        className="py-3 px-4 text-right"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <div className="flex items-center justify-end gap-1">
                                            <button
                                                type="button"
                                                onClick={() => handleTogglePublish(item)}
                                                className={`p-1.5 rounded-md transition-colors ${
                                                    (item.status || "").toLowerCase() === "published"
                                                        ? "text-emerald-700 hover:bg-emerald-50"
                                                        : "text-[#8C8278] hover:text-[#14100E] hover:bg-[#D6CDC2]"
                                                }`}
                                                title={
                                                    (item.status || "").toLowerCase() === "published"
                                                        ? "Unpublish (Make Draft)"
                                                        : "Publish (Make Live)"
                                                }
                                            >
                                                <Globe className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleOpenEditModal(item)}
                                                className="p-1.5 text-[#6B625A] hover:text-[#14100E] hover:bg-[#D6CDC2] rounded-md transition-colors"
                                                title="Edit knowledge record"
                                            >
                                                <Edit3 className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleOpenDeleteModal(item)}
                                                className="p-1.5 text-[#8C8278] hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                                                title="Delete record"
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
                        Showing {items.length > 0 ? (page - 1) * limit + 1 : 0} –{" "}
                        {Math.min(page * limit, total)} of {total} records
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

