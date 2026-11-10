"use client";

import React, { useEffect, useState } from "react";
import { X, History, Clock, CheckCircle2, AlertOctagon, RotateCw, Loader2, ArrowRight } from "lucide-react";
import BlogServices from "@/api/services/blog.services";

export default function BlogHistoryModal({ blogId, isOpen, onClose }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen || !blogId) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    BlogServices.getBlogPublishingHistory(blogId)
      .then((res) => {
        if (isMounted) {
          setData(res.data || res);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.response?.data?.message || err.message || "Failed to load publishing history");
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, blogId]);

  if (!isOpen) return null;

  const blog = data?.blog;
  const queueItems = data?.queueItems || [];
  const logs = data?.logs || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[85vh] flex flex-col bg-[#F4EFE6] border-2 border-[#14100E] rounded-2xl shadow-[6px_6px_0_#14100E] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#14100E]/15 bg-[#E6DDD2]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#14100E] text-[#F4EDE4]">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-editorial text-base sm:text-lg font-bold text-[#14100E]">
                Publication Timeline &amp; Audit
              </h3>
              <p className="text-[11px] font-mono text-[#6B625A]">
                ARTICLE ID: {blogId}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#6B625A] hover:text-[#14100E] hover:bg-black/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-2 text-[#6B625A]">
              <Loader2 className="w-6 h-6 animate-spin text-[#012CEB]" />
              <span className="text-xs font-mono">Loading publication history...</span>
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl border border-rose-600/30 bg-rose-500/10 text-rose-800 text-xs font-mono">
              {error}
            </div>
          ) : (
            <>
              {/* Blog summary */}
              {blog && (
                <div className="p-4 rounded-xl border border-[#14100E]/15 bg-[#E6DDD2]/60 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#6B625A]">
                      {blog.category}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-bold uppercase ${
                        blog.status === "published"
                          ? "bg-emerald-500/10 text-emerald-800 border border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-800 border border-amber-500/20"
                      }`}
                    >
                      {blog.status}
                    </span>
                  </div>
                  <h4 className="font-editorial text-base font-bold text-[#14100E]">
                    {blog.title}
                  </h4>
                  <p className="text-xs text-[#6B625A] font-mono">
                    /{blog.slug}
                  </p>
                </div>
              )}

              {/* Queue Items */}
              <div className="space-y-2">
                <h5 className="font-mono text-xs uppercase tracking-wider text-[#14100E] font-bold">
                  Queue Entries ({queueItems.length})
                </h5>
                {queueItems.length === 0 ? (
                  <p className="text-xs text-[#6B625A] italic">No queue entries found for this article.</p>
                ) : (
                  <div className="space-y-2">
                    {queueItems.map((q) => (
                      <div
                        key={q.id}
                        className="p-3 rounded-xl border border-[#14100E]/10 bg-white/70 text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono font-bold uppercase text-[10px] text-[#14100E]">
                            STATUS: {q.status}
                          </span>
                          <span className="font-mono text-[10px] text-[#6B625A]">
                            ATTEMPTS: {q.attempt_count} / {q.max_attempts}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-[#6B625A] font-mono">
                          <div>Scheduled: {q.scheduled_at ? new Date(q.scheduled_at).toLocaleString() : "Immediate"}</div>
                          <div>Published: {q.published_at ? new Date(q.published_at).toLocaleString() : "Not yet"}</div>
                        </div>
                        {q.last_error && (
                          <div className="p-2 rounded bg-rose-50 text-rose-700 text-[11px] font-mono">
                            Last Error: {q.last_error}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Publish Logs */}
              <div className="space-y-2">
                <h5 className="font-mono text-xs uppercase tracking-wider text-[#14100E] font-bold">
                  Execution &amp; Audit Logs ({logs.length})
                </h5>
                {logs.length === 0 ? (
                  <p className="text-xs text-[#6B625A] italic">No execution logs recorded yet.</p>
                ) : (
                  <div className="space-y-2">
                    {logs.map((log) => (
                      <div
                        key={log.id}
                        className="p-3 rounded-xl border border-[#14100E]/10 bg-white/70 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            {log.status === "success" ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            ) : log.status === "retrying" ? (
                              <RotateCw className="w-3.5 h-3.5 text-amber-600" />
                            ) : (
                              <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
                            )}
                            <span className="font-mono font-bold uppercase text-[10px]">
                              {log.status} · Attempt #{log.attempt_number}
                            </span>
                          </div>
                          <span className="font-mono text-[10px] text-[#6B625A]">
                            {log.created_at ? new Date(log.created_at).toLocaleString() : ""}
                          </span>
                        </div>
                        <p className="text-[12px] text-[#14100E]">
                          {log.message}
                        </p>
                        <div className="flex items-center gap-3 text-[10px] font-mono text-[#6B625A]">
                          <span>Trigger: {log.triggered_by}</span>
                          {log.execution_duration_ms !== null && (
                            <span>Duration: {log.execution_duration_ms}ms</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#14100E]/15 bg-[#E6DDD2] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#14100E] text-[#F4EDE4] text-xs font-mono font-bold hover:bg-[#012CEB] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

