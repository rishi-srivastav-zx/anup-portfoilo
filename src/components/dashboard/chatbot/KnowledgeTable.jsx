"use client";

import React from "react";
import {
    Edit3,
    Trash2,
    CheckCircle,
    FileEdit,
    Archive,
    ChevronLeft,
    ChevronRight,
    AlertCircle,
    BookOpen,
    Eye,
    Globe,
    Lock,
} from "lucide-react";

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

export default function KnowledgeTable({
    items = [],
    loading = false,
    error = null,
    onEditItem,
    onDeleteItem,
    onTogglePublish,
    pagination = { page: 1, limit: 20, total: 0, totalPages: 1 },
    onPageChange,
    onLimitChange,
    onRetry,
    onOpenCreateModal,
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
        return (
            <div className="p-12 rounded-xl bg-[#F4EDE4] border border-dashed border-[#D6CDC2] text-center space-y-3">
                <div className="p-3 rounded-full bg-[#EAE2D7] w-12 h-12 flex items-center justify-center mx-auto text-[#8C8278]">
                    <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="font-sans font-bold text-sm text-[#14100E]">No Knowledge Records Found</h3>
                <p className="text-xs text-[#8C8278] max-w-sm mx-auto">
                    Add facts, camera equipment details, project notes, or day rate information for the AI chatbot to reference.
                </p>
                {onOpenCreateModal && (
                    <button
                        type="button"
                        onClick={onOpenCreateModal}
                        className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#14100E] text-[#F4EDE4] hover:bg-[#2A2420] transition-colors"
                    >
                        Create First Knowledge Item
                    </button>
                )}
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
                            <th className="py-3 px-4">Title / Knowledge Fact</th>
                            <th className="py-3 px-4">Category</th>
                            <th className="py-3 px-4">Project</th>
                            <th className="py-3 px-4">Keywords</th>
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-4">Updated</th>
                            <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#D6CDC2]/60">
                        {items.map((k) => {
                            const updatedDate = k.updated_at
                                ? new Date(k.updated_at).toLocaleDateString([], {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                  })
                                : "—";

                            const isPublished = (k.status || "").toLowerCase() === "published";
                            const keywordsList = Array.isArray(k.keywords) ? k.keywords : [];

                            return (
                                <tr
                                    key={k.id}
                                    onClick={() => onEditItem(k)}
                                    className="hover:bg-[#EAE2D7]/60 cursor-pointer transition-colors group"
                                >
                                    {/* Title & Preview Content */}
                                    <td className="py-3 px-4 max-w-xs">
                                        <div className="font-semibold text-[#14100E] group-hover:underline truncate">
                                            {k.title}
                                        </div>
                                        <div className="text-[11px] text-[#6B625A] truncate line-clamp-1">
                                            {k.content}
                                        </div>
                                    </td>

                                    {/* Category */}
                                    <td className="py-3 px-4">
                                        <span className="inline-flex px-2 py-0.5 rounded bg-[#EAE2D7] border border-[#D6CDC2] font-mono text-[10px] text-[#14100E]">
                                            {k.category}
                                        </span>
                                    </td>

                                    {/* Project Name */}
                                    <td className="py-3 px-4 font-medium text-[#6B625A]">
                                        {k.project_name || k.projectName || "—"}
                                    </td>

                                    {/* Keywords Pills */}
                                    <td className="py-3 px-4 max-w-[200px]">
                                        <div className="flex flex-wrap gap-1">
                                            {keywordsList.slice(0, 3).map((kw, idx) => (
                                                <span
                                                    key={idx}
                                                    className="px-1.5 py-0.5 rounded text-[9px] bg-[#EAE2D7] text-[#6B625A]"
                                                >
                                                    {kw}
                                                </span>
                                            ))}
                                            {keywordsList.length > 3 && (
                                                <span className="text-[9px] text-[#8C8278] font-mono self-center">
                                                    +{keywordsList.length - 3}
                                                </span>
                                            )}
                                        </div>
                                    </td>

                                    {/* Status Badge */}
                                    <td className="py-3 px-4">
                                        {getKnowledgeStatusBadge(k.status)}
                                    </td>

                                    {/* Updated Date */}
                                    <td className="py-3 px-4 font-mono text-[11px] text-[#8C8278]">
                                        {updatedDate}
                                    </td>

                                    {/* Actions */}
                                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex items-center justify-end gap-1">
                                            {/* Toggle Publish / Draft */}
                                            <button
                                                type="button"
                                                onClick={() => onTogglePublish(k)}
                                                className={`p-1.5 rounded-md transition-colors ${
                                                    isPublished
                                                        ? "text-emerald-700 hover:bg-emerald-50"
                                                        : "text-[#8C8278] hover:text-[#14100E] hover:bg-[#D6CDC2]"
                                                }`}
                                                title={isPublished ? "Unpublish (Move to Draft)" : "Publish to AI Chatbot"}
                                            >
                                                {isPublished ? (
                                                    <Globe className="w-3.5 h-3.5" />
                                                ) : (
                                                    <Lock className="w-3.5 h-3.5" />
                                                )}
                                            </button>

                                            {/* Edit */}
                                            <button
                                                type="button"
                                                onClick={() => onEditItem(k)}
                                                className="p-1.5 text-[#6B625A] hover:text-[#14100E] rounded-md hover:bg-[#D6CDC2] transition-colors"
                                                title="Edit Knowledge Fact"
                                            >
                                                <Edit3 className="w-3.5 h-3.5" />
                                            </button>

                                            {/* Delete */}
                                            <button
                                                type="button"
                                                onClick={() => onDeleteItem(k)}
                                                className="p-1.5 text-red-500 hover:text-red-700 rounded-md hover:bg-red-50 transition-colors"
                                                title="Delete Knowledge Fact"
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
            <div className="p-3.5 border-t border-[#D6CDC2] bg-[#EAE2D7] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#6B625A]">
                <div className="flex items-center gap-2 font-mono text-[11px]">
                    <span>Showing</span>
                    <span className="font-semibold text-[#14100E]">
                        {items.length > 0 ? (page - 1) * limit + 1 : 0}
                    </span>
                    <span>to</span>
                    <span className="font-semibold text-[#14100E]">
                        {Math.min(page * limit, total)}
                    </span>
                    <span>of</span>
                    <span className="font-semibold text-[#14100E]">{total}</span>
                    <span>records</span>
                </div>

                <div className="flex items-center gap-2">
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
