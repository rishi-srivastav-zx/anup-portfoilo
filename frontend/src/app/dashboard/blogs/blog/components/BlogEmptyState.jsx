"use client";

import React from "react";
import Link from "next/link";
import { BookOpen, Plus, RotateCcw } from "lucide-react";

export default function BlogEmptyState({
  isFiltered,
  onResetFilters,
}) {
  return (
    <div className="p-12 text-center rounded-2xl border-2 border-dashed border-[#14100E]/30 bg-[#F4EFE6] space-y-4 max-w-xl mx-auto">
      <div className="w-14 h-14 rounded-2xl bg-[#E6DDD2] border-2 border-[#14100E] flex items-center justify-center mx-auto text-[#012CEB] shadow-[2px_2px_0_#14100E]">
        <BookOpen className="w-7 h-7" />
      </div>

      <div className="space-y-1">
        <h3 className="font-editorial text-xl font-bold text-[#14100E]">
          {isFiltered ? "No matching journal entries found" : "Your Journal Archive is Empty"}
        </h3>
        <p className="text-xs text-[#6B625A] max-w-md mx-auto">
          {isFiltered
            ? "Try broadening your search keywords or resetting active category filters."
            : "No articles published or drafted yet. Click below to compose your first article."}
        </p>
      </div>

      <div className="flex items-center justify-center gap-3 pt-2">
        {isFiltered ? (
          <button
            type="button"
            onClick={onResetFilters}
            className="px-4 py-2 rounded-xl border border-[#14100E] bg-white hover:bg-black/5 text-xs font-mono-tech font-bold text-[#14100E] inline-flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Search &amp; Filters</span>
          </button>
        ) : (
          <Link
            href="/dashboard/blogs/blogs-form"
            className="px-5 py-2.5 rounded-xl bg-[#012CEB] hover:bg-[#0022BD] text-white text-xs font-mono-tech font-bold inline-flex items-center gap-2 shadow-[2px_2px_0_#14100E]"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Entry</span>
          </Link>
        )}
      </div>
    </div>
  );
}

