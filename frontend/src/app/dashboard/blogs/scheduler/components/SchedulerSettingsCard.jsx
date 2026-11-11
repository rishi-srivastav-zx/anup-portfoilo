"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  Clock,
  Globe,
  Sliders,
  ShieldCheck,
  Save,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Power,
  Play,
  Activity,
  Loader2,
} from "lucide-react";

export default function SchedulerSettingsCard({
  settings,
  workerHealth,
  onSaveSettings,
  onTriggerCron,
  isSaving = false,
  isTriggering = false,
}) {
  const [enabled, setEnabled] = useState(true);
  const [publishingIntervalMinutes, setPublishingIntervalMinutes] = useState(360);
  const [dailyPublishLimit, setDailyPublishLimit] = useState(10);
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (settings) {
      setEnabled(settings.enabled ?? true);
      setPublishingIntervalMinutes(settings.publishing_interval_minutes || 360);
      setDailyPublishLimit(settings.daily_publish_limit || 10);
      setTimezone(settings.timezone || "Asia/Kolkata");
    }
  }, [settings]);

  const intervalPresets = [
    { label: "1h (60m)", value: 60 },
    { label: "3h (180m)", value: 180 },
    { label: "6h (360m)", value: 360, recommended: true },
    { label: "12h (720m)", value: 720 },
    { label: "24h (1440m)", value: 1440 },
  ];

  const commonTimezones = [
    { label: "Asia/Kolkata (IST +5:30)", value: "Asia/Kolkata" },
    { label: "UTC (Coordinated Universal Time)", value: "UTC" },
    { label: "America/New_York (EST/EDT)", value: "America/New_York" },
    { label: "America/Los_Angeles (PST/PDT)", value: "America/Los_Angeles" },
    { label: "Europe/London (GMT/BST)", value: "Europe/London" },
    { label: "Europe/Paris (CET)", value: "Europe/Paris" },
    { label: "Asia/Dubai (GST +4:00)", value: "Asia/Dubai" },
    { label: "Asia/Tokyo (JST +9:00)", value: "Asia/Tokyo" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveSuccess(false);

    await onSaveSettings({
      enabled,
      publishingIntervalMinutes: Number(publishingIntervalMinutes),
      dailyPublishLimit: Number(dailyPublishLimit),
      timezone,
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  const isWorkerRunning = workerHealth?.worker?.isRunning ?? true;

  return (
    <div className="bg-[#F4EFE6] border-2 border-[#14100E] rounded-2xl p-5 sm:p-7 shadow-[4px_4px_0_#14100E] space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#14100E]/15 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#6B625A]">
              SECTION 4 // AUTONOMOUS SCHEDULER CONTROLS
            </span>
          </div>
          <h2 className="font-editorial text-xl sm:text-2xl font-bold text-[#14100E]">
            Scheduler Settings &amp; Execution Frequency
          </h2>
          <p className="text-xs text-[#6B625A] mt-0.5">
            Configure automated interval windows, daily publication caps, and local time boundaries.
          </p>
        </div>

        {/* Master State Pill */}
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold uppercase inline-flex items-center gap-1.5 ${
              enabled
                ? "bg-emerald-500/10 text-emerald-800 border-emerald-500/30"
                : "bg-amber-500/10 text-amber-800 border-amber-500/30"
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{enabled ? "ENGINE ACTIVE" : "ENGINE PAUSED"}</span>
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Master Enable/Disable Switch */}
          <div className="p-4 rounded-xl border border-[#14100E]/20 bg-[#E6DDD2]/40 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-mono text-xs font-bold uppercase text-[#14100E] block">
                  Autonomous Publishing Engine
                </label>
                <p className="text-[11px] text-[#6B625A] mt-0.5">
                  When enabled, the background worker automatically checks eligibility and claims due blogs.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setEnabled(!enabled)}
                className={`relative inline-flex h-6 w-12 shrink-0 cursor-pointer rounded-full border-2 border-[#14100E] transition-colors duration-200 ease-in-out focus:outline-none ${
                  enabled ? "bg-emerald-600" : "bg-neutral-300"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out mt-0.5 ml-0.5 ${
                    enabled ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Daily Publish Limit */}
          <div className="p-4 rounded-xl border border-[#14100E]/20 bg-[#E6DDD2]/40 space-y-3">
            <div>
              <label className="font-mono text-xs font-bold uppercase text-[#14100E] block">
                Daily Publishing Limit (Articles / Day)
              </label>
              <p className="text-[11px] text-[#6B625A] mt-0.5">
                Maximum blogs that may be published within a single calendar day (1 to 100).
              </p>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="number"
                min="1"
                max="100"
                value={dailyPublishLimit}
                onChange={(e) => setDailyPublishLimit(Math.max(1, Math.min(100, Number(e.target.value) || 1)))}
                className="w-28 px-3 py-1.5 rounded-xl border border-[#14100E]/30 bg-[#F4EFE6] text-xs font-mono font-bold text-[#14100E]"
              />
              <span className="text-xs font-mono text-[#6B625A]">
                articles per day cap
              </span>
            </div>
          </div>

          {/* Publishing Interval */}
          <div className="p-4 rounded-xl border border-[#14100E]/20 bg-[#E6DDD2]/40 space-y-3 md:col-span-2">
            <div>
              <label className="font-mono text-xs font-bold uppercase text-[#14100E] block">
                Publishing Cadence / Interval (Minutes)
              </label>
              <p className="text-[11px] text-[#6B625A] mt-0.5">
                Time spacing between automatic publications. The system claims exactly 1 blog per slot.
              </p>
            </div>

            {/* Interval Quick Presets */}
            <div className="flex items-center gap-2 flex-wrap">
              {intervalPresets.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => setPublishingIntervalMinutes(preset.value)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all ${
                    publishingIntervalMinutes === preset.value
                      ? "bg-[#012CEB] text-white font-bold shadow-[2px_2px_0_#14100E]"
                      : "bg-[#F4EFE6] border border-[#14100E]/20 text-[#6B625A] hover:text-[#14100E]"
                  }`}
                >
                  {preset.label} {preset.recommended && "★"}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 pt-1">
              <span className="text-xs font-mono text-[#6B625A]">Custom minutes:</span>
              <input
                type="number"
                min="5"
                max="10080"
                value={publishingIntervalMinutes}
                onChange={(e) => setPublishingIntervalMinutes(Number(e.target.value) || 360)}
                className="w-32 px-3 py-1.5 rounded-xl border border-[#14100E]/30 bg-[#F4EFE6] text-xs font-mono font-bold text-[#14100E]"
              />
              <span className="text-xs font-mono text-[#6B625A]">
                (= {(publishingIntervalMinutes / 60).toFixed(1)} hours between articles)
              </span>
            </div>
          </div>

          {/* Timezone Selection */}
          <div className="p-4 rounded-xl border border-[#14100E]/20 bg-[#E6DDD2]/40 space-y-3 md:col-span-2">
            <div>
              <label className="font-mono text-xs font-bold uppercase text-[#14100E] block">
                Operational Timezone
              </label>
              <p className="text-[11px] text-[#6B625A] mt-0.5">
                Controls daily publication limit resets at midnight.
              </p>
            </div>

            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full max-w-md px-3 py-2 rounded-xl border border-[#14100E]/30 bg-[#F4EFE6] text-xs font-mono font-bold text-[#14100E] focus:outline-none focus:border-[#012CEB]"
            >
              {commonTimezones.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Controls & Feedback */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-[#14100E]/15">
          <div className="flex items-center gap-2">
            {saveSuccess && (
              <span className="text-xs font-mono text-emerald-700 font-bold inline-flex items-center gap-1 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Settings saved and applied to scheduler!
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onTriggerCron}
              disabled={isTriggering}
              className="px-4 py-2.5 rounded-xl border-2 border-[#14100E] bg-[#E6DDD2] hover:bg-[#14100E] text-[#14100E] hover:text-[#F4EDE4] text-xs font-mono font-bold inline-flex items-center gap-2 transition-colors shadow-[2px_2px_0_#14100E]"
            >
              <Play className={`w-3.5 h-3.5 ${isTriggering ? "animate-pulse" : ""}`} />
              <span>Trigger Manual Tick</span>
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-[#012CEB] hover:bg-[#0022BD] text-white text-xs font-mono font-bold inline-flex items-center gap-2 transition-all shadow-[3px_3px_0_#14100E]"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Settings...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Scheduler Settings</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

