"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useBlogForm } from "../context/BlogFormProvider";
import {
  ArrowLeft,
  Send,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react";

export default function FormHeader() {
  const router = useRouter();
  const {
    formData,
    currentStep,
    isDirty,
    isSaving,
    lastSaved,
    toastMessage,
    saveArticle,
    goToStep,
  } = useBlogForm();

  const handlePublish = async () => {
    await saveArticle("published");
  };

  return (
    <div className="sticky top-0 z-20 bg-[#E6DDD2]/95 backdrop-blur-md border-b border-[#14100E]/15 py-3 px-4 sm:px-6">
      {/* Toast banner */}
      {toastMessage && (
        <div
          className={`mb-3 py-2 px-4 rounded-xl text-xs font-mono-tech flex items-center gap-2 border transition-all ${
            toastMessage.type === "error"
              ? "bg-red-50 text-red-900 border-red-300"
              : toastMessage.type === "success"
              ? "bg-emerald-50 text-emerald-900 border-emerald-300"
              : "bg-blue-50 text-blue-900 border-blue-300"
          }`}
        >
          {toastMessage.type === "error" ? (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          )}
          <span className="flex-1">{toastMessage.text}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Back & Title */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/dashboard/blogs"
            className="p-2 border border-[#14100E]/20 bg-[#F4EFE6] hover:bg-[#14100E] text-[#14100E] hover:text-[#F4EDE4] rounded-lg transition-colors shrink-0"
            title="Return to Articles Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono-tech tracking-wider uppercase text-[#012CEB] font-semibold">
                JOURNAL COMPOSER
              </span>
              <span
                className="text-[10px] font-mono-tech uppercase px-2.5 py-0.5 rounded-full border bg-emerald-100 text-emerald-900 border-emerald-300 font-semibold inline-flex items-center gap-1"
              >
                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-700" />
                <span>Published (Public)</span>
              </span>
              {formData.isFeatured && (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono-tech bg-[#012CEB]/10 text-[#012CEB] border border-[#012CEB]/30 px-2 py-0.5 rounded-full">
                  <Sparkles className="w-2.5 h-2.5" /> Featured Lead
                </span>
              )}
            </div>

            <h1 className="text-base sm:text-lg font-sans font-bold text-[#14100E] truncate max-w-[280px] sm:max-w-md lg:max-w-xl">
              {formData.title ? formData.title : "Untitled Journal Entry"}
            </h1>
          </div>
        </div>

        {/* Right: Autosave status & Action buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Last saved indicator */}
          <div className="hidden md:flex items-center gap-1.5 text-xs font-mono-tech text-[#6B625A]">
            <Clock className="w-3.5 h-3.5 text-[#8C8278]" />
            <span>
              {isSaving
                ? "Saving..."
                : lastSaved
                ? `Saved at ${lastSaved}`
                : isDirty
                ? "Unsaved changes"
                : "All changes synced"}
            </span>
          </div>

          {/* Publish Live */}
          <button
            type="button"
            disabled={isSaving}
            onClick={handlePublish}
            className="px-4 py-1.5 bg-[#012CEB] hover:bg-[#0022BD] text-white text-xs font-mono-tech font-semibold rounded-lg shadow-[2px_2px_0_#14100E] transition-all disabled:opacity-50 inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Publish Live</span>
          </button>
        </div>
      </div>
    </div>
  );
}

