"use client";

import React, { useState } from "react";
import Link from "next/link";
import { RefreshCw, Play, ExternalLink, CalendarClock, Activity, BookOpen } from "lucide-react";
import SchedulerConfirmModal from "./SchedulerConfirmModal";

export default function SchedulerHeader({
  onRefresh,
  isRefreshing,
  onTriggerCron,
  isTriggeringCron,
  workerStatus,
  settings,
}) {
  const [showCronConfirm, setShowCronConfirm] = useState(false);

  const isEnabled = settings?.enabled ?? true;
  const isWorkerRunning = workerStatus?.isRunning ?? true;

  return (
    <>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[#14100E]/15">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isEnabled && isWorkerRunning
                  ? "bg-emerald-500 animate-pulse"
                  : "bg-amber-500"
              }`}
            />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#6B625A]">
              AUTONOMOUS QUEUE ENGINE //{" "}
              {isEnabled ? "SCHEDULER ONLINE" : "SCHEDULER PAUSED"} · TZ:{" "}
              {settings?.timezone || "Asia/Kolkata"}
            </span>
          </div>
          <h1 className="font-editorial text-2xl sm:text-3xl lg:text-4xl font-bold text-[#14100E]">
            Bulk Blog Scheduler &amp; Queue Console
          </h1>
          <p className="text-xs sm:text-sm text-[#6B625A] mt-1 max-w-2xl">
            Automated publishing pipeline for cinematography essays, optical field tests, and lighting masterclasses. Configured to publish 1 blog every {settings?.publishing_interval_minutes || 360} minutes.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Refresh button */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2.5 rounded-xl border-2 border-[#14100E] bg-[#F4EFE6] hover:bg-black/5 text-[#6B625A] hover:text-[#14100E] transition-colors shadow-[2px_2px_0_#14100E]"
            title="Refresh queue and metrics"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </button>

          {/* Trigger Cron Manual Tick */}
          <button
            type="button"
            onClick={() => setShowCronConfirm(true)}
            disabled={isTriggeringCron}
            className="px-4 py-2.5 rounded-xl border-2 border-[#14100E] bg-[#E6DDD2] hover:bg-[#14100E] text-[#14100E] hover:text-[#F4EDE4] text-xs font-mono font-bold inline-flex items-center gap-1.5 transition-colors shadow-[2px_2px_0_#14100E]"
            title="Execute worker tick immediately"
          >
            <Play className={`w-3.5 h-3.5 ${isTriggeringCron ? "animate-pulse" : ""}`} />
            <span>Trigger Tick Now</span>
          </button>

          {/* All Articles */}
          <Link
            href="/dashboard/blogs"
            className="px-4 py-2.5 rounded-xl border-2 border-[#14100E] bg-[#F4EFE6] hover:bg-[#14100E] text-[#14100E] hover:text-[#F4EDE4] text-xs font-mono font-semibold inline-flex items-center gap-1.5 transition-colors shadow-[2px_2px_0_#14100E]"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>All Articles</span>
          </Link>

          {/* Live Journal */}
          <Link
            href="/blog"
            target="_blank"
            className="px-4 py-2.5 rounded-xl bg-[#012CEB] hover:bg-[#0022BD] text-white text-xs font-mono font-bold inline-flex items-center gap-1.5 transition-all shadow-[3px_3px_0_#14100E]"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Live Journal</span>
          </Link>
        </div>
      </div>

      <SchedulerConfirmModal
        isOpen={showCronConfirm}
        title="Trigger Background Worker Tick"
        message="This will immediately execute a scheduler tick. If the interval is due and an eligible pending blog exists, it will claim and publish the next article immediately."
        confirmLabel="Execute Tick"
        confirmVariant="primary"
        isLoading={isTriggeringCron}
        onConfirm={async () => {
          await onTriggerCron();
          setShowCronConfirm(false);
        }}
        onClose={() => setShowCronConfirm(false)}
      />
    </>
  );
}

