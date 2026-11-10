"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  SlidersHorizontal,
  ArrowUp,
  ArrowDown,
  Play,
  RotateCw,
  XCircle,
  History,
  RefreshCw,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sparkles,
} from "lucide-react";
import SchedulerConfirmModal from "./SchedulerConfirmModal";
import BlogHistoryModal from "./BlogHistoryModal";

export default function SchedulerQueueTable({
  items = [],
  pagination = {},
  isLoading = false,
  statusFilter = "all",
  searchQuery = "",
  onStatusChange,
  onSearchChange,
  onPageChange,
  onManualPublish,
  onCancelItem,
  onRetryItem,
  onReorderItem,
  onRevalidateItem,
}) {
  const [activeModal, setActiveModal] = useState(null); // { type, item }
  const [historyBlogId, setHistoryBlogId] = useState(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const statuses = [
    { id: "all", label: "ALL STATUSES" },
    { id: "pending", label: "PENDING" },
    { id: "processing", label: "PROCESSING" },
    { id: "published", label: "PUBLISHED" },
    { id: "failed", label: "FAILED" },
    { id: "cancelled", label: "CANCELLED" },
  ];

  const handleConfirmAction = async () => {
    if (!activeModal) return;
    setIsActionLoading(true);
    try {
      const { type, item } = activeModal;
      if (type === "publish") {
        await onManualPublish(item.id);
      } else if (type === "cancel") {
        await onCancelItem(item.id);
      } else if (type === "retry") {
        await onRetryItem(item.id);
      } else if (type === "revalidate") {
        await onRevalidateItem(item.slug);
      }
      setActiveModal(null);
    } catch {
      // Handled by parent toast
    } finally {
      setIsActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "published":
        return (
          <span className="px-2.5 py-0.5 rounded-md font-mono text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-800 border border-emerald-500/20 inline-flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> PUBLISHED
          </span>
        );
      case "processing":
        return (
          <span className="px-2.5 py-0.5 rounded-md font-mono text-[10px] font-bold uppercase bg-blue-500/10 text-blue-800 border border-blue-500/20 inline-flex items-center gap-1 animate-pulse">
            <RotateCw className="w-3 h-3 text-blue-600 animate-spin" /> PROCESSING
          </span>
        );
      case "pending":
        return (
          <span className="px-2.5 py-0.5 rounded-md font-mono text-[10px] font-bold uppercase bg-amber-500/10 text-amber-800 border border-amber-500/20 inline-flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-600" /> PENDING
          </span>
        );
      case "failed":
        return (
          <span className="px-2.5 py-0.5 rounded-md font-mono text-[10px] font-bold uppercase bg-rose-500/10 text-rose-800 border border-rose-500/20 inline-flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-rose-600" /> FAILED
          </span>
        );
      case "cancelled":
        return (
          <span className="px-2.5 py-0.5 rounded-md font-mono text-[10px] font-bold uppercase bg-neutral-500/10 text-neutral-600 border border-neutral-500/20 inline-flex items-center gap-1">
            <XCircle className="w-3 h-3 text-neutral-500" /> CANCELLED
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-md font-mono text-[10px] font-bold uppercase bg-black/5 text-[#14100E]">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="bg-[#F4EFE6] border-2 border-[#14100E] rounded-2xl shadow-[4px_4px_0_#14100E] overflow-hidden space-y-4">
      {/* Table Controls: Search & Status Filter Pills */}
      <div className="p-5 border-b border-[#14100E]/15 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#E6DDD2]/40">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B625A]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by article title, slug, or category..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#14100E]/30 bg-[#F4EFE6] text-xs font-mono text-[#14100E] placeholder:text-[#6B625A] focus:outline-none focus:border-[#012CEB]"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {statuses.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onStatusChange(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-mono font-bold transition-all ${
                statusFilter === tab.id
                  ? "bg-[#14100E] text-[#F4EDE4] shadow-[2px_2px_0_#012CEB]"
                  : "bg-[#F4EFE6] border border-[#14100E]/20 text-[#6B625A] hover:text-[#14100E] hover:bg-black/5"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#14100E]/15 bg-[#E6DDD2]/60 font-mono text-[10px] text-[#6B625A] uppercase tracking-wider">
              <th className="py-3 px-4 w-12 text-center">ORDER</th>
              <th className="py-3 px-4">ARTICLE</th>
              <th className="py-3 px-4">CATEGORY</th>
              <th className="py-3 px-4">SCHEDULED SLOT</th>
              <th className="py-3 px-4">STATUS</th>
              <th className="py-3 px-4 text-center">ATTEMPTS</th>
              <th className="py-3 px-4 text-right">ACTIONS</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#14100E]/10">
            {isLoading ? (
              // Skeleton loading rows
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="py-4 px-4 text-center">
                    <div className="w-5 h-5 bg-[#14100E]/10 rounded mx-auto" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-[#14100E]/10 rounded-lg shrink-0" />
                      <div className="space-y-1.5 flex-1">
                        <div className="w-48 h-3.5 bg-[#14100E]/10 rounded" />
                        <div className="w-32 h-2.5 bg-[#14100E]/10 rounded" />
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="w-20 h-4 bg-[#14100E]/10 rounded" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="w-28 h-4 bg-[#14100E]/10 rounded" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="w-16 h-4 bg-[#14100E]/10 rounded" />
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="w-8 h-4 bg-[#14100E]/10 rounded mx-auto" />
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="w-20 h-6 bg-[#14100E]/10 rounded ml-auto" />
                  </td>
                </tr>
              ))
            ) : items.length === 0 ? (
              // Empty state
              <tr>
                <td colSpan={7} className="py-16 text-center text-[#6B625A]">
                  <Layers className="w-10 h-10 mx-auto text-[#6B625A]/40 mb-3" />
                  <p className="font-editorial text-base font-bold text-[#14100E]">
                    No queue items match your filter.
                  </p>
                  <p className="text-xs font-mono text-[#6B625A] mt-1">
                    Upload new articles via Section 2 or reset status filters to view queued entries.
                  </p>
                </td>
              </tr>
            ) : (
              // Render real queue items
              items.map((row, index) => {
                const isPending = row.status === "pending";
                const isFailed = row.status === "failed";
                const isPublished = row.status === "published";

                return (
                  <tr
                    key={row.id}
                    className="hover:bg-[#E6DDD2]/30 transition-colors"
                  >
                    {/* Reorder / Rank */}
                    <td className="py-3 px-4 text-center font-mono">
                      {isPending ? (
                        <div className="flex flex-col items-center gap-1">
                          <button
                            type="button"
                            onClick={() => onReorderItem(row.id, "up")}
                            disabled={index === 0}
                            className="p-1 rounded hover:bg-black/10 text-[#6B625A] disabled:opacity-30 disabled:hover:bg-transparent"
                            title="Move up in queue"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <span className="text-[10px] font-bold text-[#14100E]">
                            #{index + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => onReorderItem(row.id, "down")}
                            disabled={index === items.length - 1}
                            className="p-1 rounded hover:bg-black/10 text-[#6B625A] disabled:opacity-30 disabled:hover:bg-transparent"
                            title="Move down in queue"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-[#6B625A]">
                          #{index + 1}
                        </span>
                      )}
                    </td>

                    {/* Article Info */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg border border-[#14100E]/20 overflow-hidden bg-[#E6DDD2] shrink-0 relative">
                          {row.featuredImage || row.featured_image ? (
                            <img
                              src={row.featuredImage || row.featured_image}
                              alt={row.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[9px] font-mono text-[#6B625A]">
                              NO IMG
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 max-w-xs sm:max-w-md">
                          <div className="font-editorial font-bold text-sm text-[#14100E] truncate">
                            {row.title}
                          </div>
                          <div className="text-[11px] font-mono text-[#6B625A] truncate">
                            /{row.slug}
                          </div>
                          {row.lastError && (
                            <div className="text-[10px] font-mono text-rose-700 truncate mt-0.5">
                              Err: {row.lastError}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category & Tags */}
                    <td className="py-3 px-4">
                      <span className="font-mono text-[11px] font-semibold text-[#14100E] block">
                        {row.category || "Cinematography"}
                      </span>
                      {Array.isArray(row.tags) && row.tags.length > 0 && (
                        <span className="text-[10px] font-mono text-[#6B625A] truncate block max-w-[120px]">
                          {row.tags.slice(0, 2).join(", ")}
                        </span>
                      )}
                    </td>

                    {/* Scheduled Slot */}
                    <td className="py-3 px-4 font-mono text-[11px]">
                      {row.publishedAt || row.published_at ? (
                        <div className="text-emerald-800 font-bold">
                          Published:{" "}
                          {new Date(row.publishedAt || row.published_at).toLocaleString([], {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </div>
                      ) : row.scheduledAt || row.scheduled_at ? (
                        <div>
                          <span className="text-[#14100E] font-bold block">
                            {new Date(row.scheduledAt || row.scheduled_at).toLocaleDateString([], {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                          <span className="text-[10px] text-[#6B625A]">
                            {new Date(row.scheduledAt || row.scheduled_at).toLocaleTimeString([], {
                              hour: "numeric",
                              minute: "2-digit",
                              hour12: true,
                            })}{" "}
                            (Asia/Kolkata)
                          </span>
                        </div>
                      ) : (
                        <span className="text-[#6B625A]">Immediate</span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4">{getStatusBadge(row.status)}</td>

                    {/* Attempts */}
                    <td className="py-3 px-4 text-center font-mono text-xs">
                      <span
                        className={
                          row.attemptCount >= row.maxAttempts
                            ? "text-rose-700 font-bold"
                            : "text-[#14100E]"
                        }
                      >
                        {row.attemptCount || row.attempt_count || 0} /{" "}
                        {row.maxAttempts || row.max_attempts || 3}
                      </span>
                    </td>

                    {/* Action Buttons */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        {/* Manual Publish Action */}
                        {isPending && (
                          <button
                            type="button"
                            onClick={() =>
                              setActiveModal({
                                type: "publish",
                                item: row,
                                title: `Publish "${row.title}" Now?`,
                                message:
                                  "This executes real transactional publication immediately. The blog will be marked 'published', the next automated slot will advance by 360m, and public cache will invalidate instantly.",
                                confirmLabel: "Publish Now",
                                variant: "primary",
                              })
                            }
                            className="p-1.5 rounded-lg border border-[#14100E]/20 bg-[#F4EFE6] hover:bg-[#012CEB] text-[#14100E] hover:text-white transition-colors"
                            title="Publish immediately"
                          >
                            <Play className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Retry Failed Action */}
                        {isFailed && (
                          <button
                            type="button"
                            onClick={() =>
                              setActiveModal({
                                type: "retry",
                                item: row,
                                title: `Retry Job "${row.title}"?`,
                                message:
                                  "This will reset the queue item status to 'pending', clear the lock token, and schedule an immediate retry slot.",
                                confirmLabel: "Retry Job",
                                variant: "warning",
                              })
                            }
                            className="p-1.5 rounded-lg border border-amber-600/30 bg-amber-50 hover:bg-amber-600 text-amber-800 hover:text-white transition-colors"
                            title="Retry failed job"
                          >
                            <RotateCw className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Cancel Pending Action */}
                        {isPending && (
                          <button
                            type="button"
                            onClick={() =>
                              setActiveModal({
                                type: "cancel",
                                item: row,
                                title: `Cancel Queue Slot for "${row.title}"?`,
                                message:
                                  "This cancels the scheduled publication. The blog will remain in unpublished draft status in the database.",
                                confirmLabel: "Cancel Slot",
                                variant: "danger",
                              })
                            }
                            className="p-1.5 rounded-lg border border-[#14100E]/20 hover:border-rose-600 bg-[#F4EFE6] hover:bg-rose-50 text-[#6B625A] hover:text-rose-700 transition-colors"
                            title="Cancel pending publication"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Revalidate Cache Action for Published */}
                        {isPublished && (
                          <button
                            type="button"
                            onClick={() =>
                              setActiveModal({
                                type: "revalidate",
                                item: row,
                                title: `Purge & Revalidate Cache for "${row.slug}"?`,
                                message:
                                  "This clears the Express in-memory cache and triggers Next.js on-demand route revalidation without publishing the blog twice.",
                                confirmLabel: "Revalidate Cache",
                                variant: "primary",
                              })
                            }
                            className="p-1.5 rounded-lg border border-[#14100E]/20 bg-[#F4EFE6] hover:bg-emerald-600 text-[#14100E] hover:text-white transition-colors"
                            title="Purge cache & revalidate"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Live Link for Published */}
                        {isPublished && (
                          <Link
                            href={`/blog/${row.slug}`}
                            target="_blank"
                            className="p-1.5 rounded-lg border border-[#14100E]/20 bg-[#F4EFE6] hover:bg-[#14100E] text-[#14100E] hover:text-white transition-colors"
                            title="View on live site"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        )}

                        {/* View History Audit Log */}
                        <button
                          type="button"
                          onClick={() => setHistoryBlogId(row.blogId || row.blog_id)}
                          className="p-1.5 rounded-lg border border-[#14100E]/20 bg-[#F4EFE6] hover:bg-black/10 text-[#6B625A] hover:text-[#14100E] transition-colors"
                          title="View audit history"
                        >
                          <History className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-[#14100E]/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono text-[#6B625A]">
        <div>
          Showing page <strong>{pagination.page || 1}</strong> of{" "}
          <strong>{pagination.totalPages || 1}</strong> ({pagination.total || 0} total queue records)
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onPageChange((pagination.page || 1) - 1)}
            disabled={!pagination.hasPrev && (pagination.page || 1) <= 1}
            className="px-3 py-1.5 rounded-lg border border-[#14100E]/20 bg-[#F4EFE6] text-[#14100E] disabled:opacity-30 disabled:hover:bg-transparent hover:bg-black/5 transition-colors inline-flex items-center gap-1"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Previous
          </button>

          <button
            type="button"
            onClick={() => onPageChange((pagination.page || 1) + 1)}
            disabled={!pagination.hasNext && (pagination.page || 1) >= (pagination.totalPages || 1)}
            className="px-3 py-1.5 rounded-lg border border-[#14100E]/20 bg-[#F4EFE6] text-[#14100E] disabled:opacity-30 disabled:hover:bg-transparent hover:bg-black/5 transition-colors inline-flex items-center gap-1"
          >
            Next <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {activeModal && (
        <SchedulerConfirmModal
          isOpen={true}
          title={activeModal.title}
          message={activeModal.message}
          confirmLabel={activeModal.confirmLabel}
          confirmVariant={activeModal.variant}
          isLoading={isActionLoading}
          onConfirm={handleConfirmAction}
          onClose={() => setActiveModal(null)}
        />
      )}

      {/* Historical Audit Modal */}
      {historyBlogId && (
        <BlogHistoryModal
          blogId={historyBlogId}
          isOpen={true}
          onClose={() => setHistoryBlogId(null)}
        />
      )}
    </div>
  );
}

