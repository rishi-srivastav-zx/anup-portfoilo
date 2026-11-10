"use client";

import React, { useState } from "react";
import {
  History,
  CheckCircle2,
  AlertOctagon,
  RotateCw,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Search,
} from "lucide-react";

export default function SchedulerHistoryTable({
  logs = [],
  pagination = {},
  isLoading = false,
  statusFilter = "all",
  onStatusChange,
  onPageChange,
}) {
  const [expandedLogId, setExpandedLogId] = useState(null);

  const statuses = [
    { id: "all", label: "ALL LOGS" },
    { id: "success", label: "SUCCESS" },
    { id: "failed", label: "FAILED" },
    { id: "retrying", label: "RETRYING" },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case "success":
        return (
          <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-800 border border-emerald-500/20 inline-flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> SUCCESS
          </span>
        );
      case "failed":
        return (
          <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold uppercase bg-rose-500/10 text-rose-800 border border-rose-500/20 inline-flex items-center gap-1">
            <AlertOctagon className="w-3 h-3 text-rose-600" /> FAILED
          </span>
        );
      case "retrying":
        return (
          <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold uppercase bg-amber-500/10 text-amber-800 border border-amber-500/20 inline-flex items-center gap-1">
            <RotateCw className="w-3 h-3 text-amber-600" /> RETRYING
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold uppercase bg-neutral-100 text-[#14100E]">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="bg-[#F4EFE6] border-2 border-[#14100E] rounded-2xl shadow-[4px_4px_0_#14100E] overflow-hidden space-y-4">
      {/* Table Header & Controls */}
      <div className="p-5 border-b border-[#14100E]/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#E6DDD2]/40">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#6B625A]">
              SECTION 5 // IMMUTABLE AUDIT TRAIL
            </span>
          </div>
          <h2 className="font-editorial text-lg sm:text-xl font-bold text-[#14100E]">
            Scheduler Execution &amp; Publishing Audit Logs
          </h2>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {statuses.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onStatusChange(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-mono font-bold transition-all ${
                statusFilter === tab.id
                  ? "bg-[#14100E] text-[#F4EDE4] shadow-[2px_2px_0_#012CEB]"
                  : "bg-[#F4EFE6] border border-[#14100E]/20 text-[#6B625A] hover:text-[#14100E]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#14100E]/15 bg-[#E6DDD2]/60 font-mono text-[10px] text-[#6B625A] uppercase tracking-wider">
              <th className="py-3 px-4">TIMESTAMP</th>
              <th className="py-3 px-4">ARTICLE</th>
              <th className="py-3 px-4">STATUS</th>
              <th className="py-3 px-4 text-center">ATTEMPT</th>
              <th className="py-3 px-4">TRIGGER</th>
              <th className="py-3 px-4 text-right">DURATION</th>
              <th className="py-3 px-4 text-right">DETAILS</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#14100E]/10">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="py-3.5 px-4"><div className="w-24 h-4 bg-[#14100E]/10 rounded" /></td>
                  <td className="py-3.5 px-4"><div className="w-48 h-4 bg-[#14100E]/10 rounded" /></td>
                  <td className="py-3.5 px-4"><div className="w-16 h-4 bg-[#14100E]/10 rounded" /></td>
                  <td className="py-3.5 px-4 text-center"><div className="w-6 h-4 bg-[#14100E]/10 rounded mx-auto" /></td>
                  <td className="py-3.5 px-4"><div className="w-20 h-4 bg-[#14100E]/10 rounded" /></td>
                  <td className="py-3.5 px-4 text-right"><div className="w-12 h-4 bg-[#14100E]/10 rounded ml-auto" /></td>
                  <td className="py-3.5 px-4 text-right"><div className="w-8 h-4 bg-[#14100E]/10 rounded ml-auto" /></td>
                </tr>
              ))
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-[#6B625A]">
                  <History className="w-8 h-8 mx-auto text-[#6B625A]/40 mb-2" />
                  <p className="font-editorial text-sm font-bold text-[#14100E]">
                    No audit logs recorded for this view.
                  </p>
                </td>
              </tr>
            ) : (
              logs.map((log) => {
                const isExpanded = expandedLogId === log.id;
                return (
                  <React.Fragment key={log.id}>
                    <tr className="hover:bg-[#E6DDD2]/30 transition-colors">
                      {/* Timestamp */}
                      <td className="py-3 px-4 font-mono text-[11px] text-[#14100E]">
                        {log.createdAt || log.created_at
                          ? new Date(log.createdAt || log.created_at).toLocaleString([], {
                              month: "short",
                              day: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                              second: "2-digit",
                            })
                          : "-"}
                      </td>

                      {/* Article Title */}
                      <td className="py-3 px-4">
                        <div className="font-editorial font-bold text-xs text-[#14100E] truncate max-w-xs sm:max-w-md">
                          {log.title || `Article #${log.blog_id?.slice(0, 8)}`}
                        </div>
                        <div className="text-[10px] font-mono text-[#6B625A] truncate">
                          {log.message}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">{getStatusBadge(log.status)}</td>

                      {/* Attempt */}
                      <td className="py-3 px-4 text-center font-mono text-[11px] text-[#14100E]">
                        #{log.attemptNumber || log.attempt_number || 1}
                      </td>

                      {/* Trigger Source */}
                      <td className="py-3 px-4 font-mono text-[11px]">
                        <span className="px-2 py-0.5 rounded border border-[#14100E]/15 bg-white/70 text-[#14100E]">
                          {log.triggeredBy || log.triggered_by || "scheduler"}
                        </span>
                      </td>

                      {/* Duration */}
                      <td className="py-3 px-4 text-right font-mono text-[11px] text-[#6B625A]">
                        {log.executionDurationMs !== null && log.executionDurationMs !== undefined
                          ? `${log.executionDurationMs}ms`
                          : log.execution_duration_ms !== null && log.execution_duration_ms !== undefined
                          ? `${log.execution_duration_ms}ms`
                          : "-"}
                      </td>

                      {/* Expand Details */}
                      <td className="py-3 px-4 text-right">
                        {(log.errorDetails || log.error_details) && (
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedLogId(isExpanded ? null : log.id)
                            }
                            className="p-1 rounded text-[#6B625A] hover:text-[#14100E]"
                            title="Toggle error details"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </td>
                    </tr>

                    {/* Expandable Error Details Drawer */}
                    {isExpanded && (log.errorDetails || log.error_details) && (
                      <tr className="bg-rose-50/50">
                        <td colSpan={7} className="p-4 border-b border-[#14100E]/10">
                          <div className="font-mono text-[11px] text-rose-900 space-y-1">
                            <span className="font-bold">Error Stack / Diagnostics:</span>
                            <pre className="p-3 rounded-lg bg-white border border-rose-200 overflow-x-auto text-[10px] leading-relaxed">
                              {typeof (log.errorDetails || log.error_details) === "string"
                                ? log.errorDetails || log.error_details
                                : JSON.stringify(log.errorDetails || log.error_details, null, 2)}
                            </pre>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
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
          <strong>{pagination.totalPages || 1}</strong> ({pagination.total || 0} total log entries)
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
    </div>
  );
}

