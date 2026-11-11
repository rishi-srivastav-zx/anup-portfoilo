"use client";

import React from "react";
import { Quote, Trash2 } from "lucide-react";

export default function PullQuoteEditor({
  sectionIndex,
  pullQuote,
  onUpdatePullQuote,
  onRemove,
}) {
  if (!pullQuote) return null;

  return (
    <div className="p-4 sm:p-5 rounded-xl border-2 border-[#012CEB] bg-[#012CEB]/5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-mono-tech uppercase font-bold text-[#012CEB]">
          <Quote className="w-4 h-4" />
          <span>EDITORIAL PULL QUOTE BLOCK</span>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="p-1 text-[#8C8278] hover:text-red-600 transition-colors"
          title="Remove pull quote"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-3">
        <div className="space-y-1">
          <label className="text-[10px] font-mono-tech uppercase text-[#6B625A]">
            Quote Text
          </label>
          <textarea
            rows={2}
            value={pullQuote.text || ""}
            onChange={(e) => onUpdatePullQuote(sectionIndex, "text", e.target.value)}
            placeholder="Contrast is not just the difference between light and dark; it is the emotional weight of what remains unseen."
            className="w-full p-3 rounded-lg border border-[#14100E]/30 bg-white font-editorial italic text-sm sm:text-base text-[#14100E] focus:outline-none focus:border-[#012CEB]"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-mono-tech uppercase text-[#6B625A]">
            Attribution / Context
          </label>
          <input
            type="text"
            value={pullQuote.context || ""}
            onChange={(e) => onUpdatePullQuote(sectionIndex, "context", e.target.value)}
            placeholder="On-set Notes & Lighting Philosophy"
            className="w-full px-3 py-1.5 rounded-lg border border-[#14100E]/30 bg-white text-xs font-mono-tech font-semibold text-[#012CEB] focus:outline-none focus:border-[#012CEB]"
          />
        </div>
      </div>

      {/* Mini preview */}
      <blockquote className="p-4 border-2 border-[#012CEB] bg-[#F4EFE6] rounded-xl shadow-[2px_2px_0_#012CEB] space-y-1">
        <p className="font-editorial italic text-sm sm:text-base text-[#14100E]">
          &ldquo;{pullQuote.text || "Quote text preview..."}&rdquo;
        </p>
        <footer className="text-[11px] font-mono-tech text-[#012CEB] font-semibold">
          — {pullQuote.context || "Attribution"}
        </footer>
      </blockquote>
    </div>
  );
}

