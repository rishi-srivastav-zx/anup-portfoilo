"use client";

import React from "react";
import Link from "next/link";
import { Plus, BookOpen, ExternalLink, RefreshCw } from "lucide-react";

export default function BlogDashboardHeader({ onRefresh, isRefreshing, totalCount }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#14100E]/15">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#6B625A]">
            EDITORIAL ARCHIVE // {totalCount} ARTICLES RECORDED
          </span>
        </div>
        <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-[#14100E]">
          Journal &amp; Technical Articles Console
        </h1>
        <p className="text-xs sm:text-sm text-[#6B625A] mt-1">
          Manage cinematography field notes, lighting ratios, optical studies, and published essays.
        </p>
      </div>

      <div className="flex items-center gap-2.5 flex-wrap">
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="p-2.5 rounded-xl border border-[#14100E]/20 bg-[#F4EFE6] hover:bg-black/5 text-[#6B625A] hover:text-[#14100E] transition-colors"
          title="Refresh article index"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
        </button>

        <Link
          href="/blog"
          target="_blank"
          className="px-4 py-2.5 rounded-xl border-2 border-[#14100E] bg-[#F4EFE6] hover:bg-[#14100E] text-[#14100E] hover:text-[#F4EDE4] text-xs font-mono-tech font-semibold inline-flex items-center gap-1.5 transition-colors shadow-[2px_2px_0_#14100E]"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Live Journal</span>
        </Link>

        <Link
          href="/dashboard/blogs/blogs-form"
          className="px-5 py-2.5 rounded-xl bg-[#012CEB] hover:bg-[#0022BD] text-white text-xs font-mono-tech font-bold inline-flex items-center gap-2 transition-all shadow-[3px_3px_0_#14100E]"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Article</span>
        </Link>
      </div>
    </div>
  );
}

