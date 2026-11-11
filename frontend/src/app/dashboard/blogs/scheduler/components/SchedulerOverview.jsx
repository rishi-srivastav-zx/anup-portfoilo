"use client";

import React, { useMemo } from "react";
import {
  Layers,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Calendar,
  Activity,
  Gauge,
} from "lucide-react";

export default function SchedulerOverview({
  stats,
  workerHealth,
  settings,
  isLoading = false,
}) {
  const counts = stats?.counts || {};
  const total = counts.total || 0;
  const pending = counts.pending || 0;
  const published = counts.published || 0;
  const failed = counts.failed || 0;
  const processing = counts.processing || 0;
  const cancelled = counts.cancelled || 0;

  const publishedToday = stats?.publishedToday || 0;
  const dailyLimit = stats?.dailyPublishLimit || settings?.daily_publish_limit || 10;
  const dailyUsagePercent = Math.min(100, Math.round((publishedToday / dailyLimit) * 100));

  const nextJobTime = stats?.nextScheduledJob;
  const nextSlotTime = settings?.next_publish_at;

  const formattedNextPublish = useMemo(() => {
    const target = nextSlotTime || nextJobTime;
    if (!target) return "None scheduled";
    try {
      const d = new Date(target);
      const isPast = d.getTime() <= Date.now();
      const timeStr = d.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
      const dateStr = d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      return isPast ? `Due now (${dateStr} ${timeStr})` : `${dateStr} at ${timeStr}`;
    } catch {
      return String(target);
    }
  }, [nextSlotTime, nextJobTime]);

  const cards = [
    {
      label: "TOTAL QUEUED",
      value: total,
      subtext: `${cancelled} cancelled`,
      icon: Layers,
      iconColor: "text-[#14100E]",
      bg: "bg-[#F4EFE6]",
    },
    {
      label: "PENDING QUEUE",
      value: pending,
      subtext: "Awaiting next slots",
      icon: Clock,
      iconColor: "text-amber-600",
      bg: "bg-[#F4EFE6]",
    },
    {
      label: "ACTIVE PROCESSING",
      value: processing,
      subtext: processing > 0 ? "Worker currently claiming" : "Idle standby",
      icon: RotateCw,
      iconColor: "text-[#012CEB]",
      bg: "bg-[#F4EFE6]",
      pulsing: processing > 0,
    },
    {
      label: "PUBLISHED LIVE",
      value: published,
      subtext: `${publishedToday} published today`,
      icon: CheckCircle2,
      iconColor: "text-emerald-600",
      bg: "bg-[#F4EFE6]",
    },
    {
      label: "FAILED / EXHAUSTED",
      value: failed,
      subtext: failed > 0 ? "Requires admin review" : "0 execution errors",
      icon: AlertTriangle,
      iconColor: failed > 0 ? "text-rose-600" : "text-[#6B625A]",
      bg: "bg-[#F4EFE6]",
    },
    {
      label: "NEXT SCHEDULED EXECUTION",
      valueText: formattedNextPublish,
      subtext: `Interval: ${settings?.publishing_interval_minutes || 360}m · 1 article`,
      icon: Calendar,
      iconColor: "text-[#012CEB]",
      bg: "bg-[#F4EFE6]",
    },
  ];

  return (
    <div className="space-y-4">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`p-4 rounded-2xl border-2 border-[#14100E] ${card.bg} shadow-[3px_3px_0_#14100E] flex flex-col justify-between transition-all hover:-translate-y-0.5`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#6B625A]">
                  {card.label}
                </span>
                <Icon
                  className={`w-4 h-4 ${card.iconColor} ${
                    card.pulsing ? "animate-spin" : ""
                  }`}
                />
              </div>

              <div className="my-1">
                {isLoading ? (
                  <div className="h-8 w-16 bg-[#14100E]/10 rounded animate-pulse" />
                ) : card.valueText ? (
                  <div className="font-editorial text-sm font-bold text-[#14100E] leading-tight line-clamp-2">
                    {card.valueText}
                  </div>
                ) : (
                  <div className="font-editorial text-2xl lg:text-3xl font-bold text-[#14100E]">
                    {card.value}
                  </div>
                )}
              </div>

              <div className="text-[11px] font-mono text-[#6B625A] truncate mt-1">
                {isLoading ? (
                  <div className="h-3 w-24 bg-[#14100E]/10 rounded animate-pulse mt-1" />
                ) : (
                  card.subtext
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Daily Publishing Limit Progress & Worker Heartbeat Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* Daily Capacity Meter */}
        <div className="p-4 rounded-2xl border-2 border-[#14100E] bg-[#F4EFE6] shadow-[3px_3px_0_#14100E] space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="font-bold text-[#14100E] inline-flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-[#012CEB]" />
              DAILY PUBLISHING CAPACITY ({settings?.timezone || "Asia/Kolkata"})
            </span>
            <span className="text-[#6B625A]">
              <strong>{publishedToday}</strong> of <strong>{dailyLimit}</strong> articles published today
            </span>
          </div>

          <div className="w-full h-2.5 rounded-full bg-[#14100E]/10 overflow-hidden border border-[#14100E]/20">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                dailyUsagePercent >= 100
                  ? "bg-rose-500"
                  : dailyUsagePercent >= 75
                  ? "bg-amber-500"
                  : "bg-[#012CEB]"
              }`}
              style={{ width: `${dailyUsagePercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-[#6B625A]">
            <span>Resets midnight {settings?.timezone || "Asia/Kolkata"}</span>
            <span>{Math.max(0, dailyLimit - publishedToday)} publication slots remaining today</span>
          </div>
        </div>

        {/* Worker Daemon Diagnostics */}
        <div className="p-4 rounded-2xl border-2 border-[#14100E] bg-[#F4EFE6] shadow-[3px_3px_0_#14100E] flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  workerHealth?.worker?.isRunning
                    ? "bg-emerald-500 animate-pulse"
                    : "bg-amber-500"
                }`}
              />
              <span className="font-mono text-[10px] uppercase font-bold text-[#14100E]">
                BACKGROUND WORKER DAEMON:{" "}
                {workerHealth?.worker?.isRunning ? "HEALTHY & POLLING" : "STANDBY"}
              </span>
            </div>
            <p className="text-[11px] font-mono text-[#6B625A]">
              Uptime: {Math.floor((workerHealth?.worker?.uptimeSeconds || 0) / 60)}m · Total Ticks:{" "}
              {workerHealth?.worker?.totalTicks || 0} · Publishes:{" "}
              {workerHealth?.worker?.successfulPublishes || 0} ok /{" "}
              {workerHealth?.worker?.failedPublishes || 0} err
            </p>
          </div>

          <div className="text-right">
            <span className="px-2.5 py-1 rounded-lg border border-[#14100E]/20 bg-[#E6DDD2] text-[10px] font-mono font-bold text-[#14100E]">
              INTERVAL: {settings?.publishing_interval_minutes || 360}M
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

