"use client";

import React from "react";
import { Plus, Trash2, Heading3 } from "lucide-react";

export default function SubSectionEditor({
  sectionIndex,
  subSections = [],
  onAddSubSection,
  onUpdateSubSection,
  onRemoveSubSection,
}) {
  return (
    <div className="p-4 sm:p-5 rounded-xl border-2 border-[#14100E]/20 bg-[#E6DDD2]/40 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-mono-tech uppercase font-bold text-[#14100E]">
          <Heading3 className="w-4 h-4 text-[#012CEB]" />
          <span>H3 Subsections ({subSections.length})</span>
        </div>
        <button
          type="button"
          onClick={() => onAddSubSection(sectionIndex)}
          className="text-xs font-mono-tech text-[#012CEB] hover:underline inline-flex items-center gap-1 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Subsection</span>
        </button>
      </div>

      {subSections.length === 0 ? (
        <p className="text-xs font-mono-tech text-[#8C8278] italic">
          No subsections added yet. Click &quot;Add Subsection&quot; to divide this topic into subheadings.
        </p>
      ) : (
        <div className="space-y-4">
          {subSections.map((sub, subIdx) => (
            <div
              key={subIdx}
              className="p-4 rounded-xl border border-[#14100E]/20 bg-white space-y-3"
            >
              <div className="flex items-center justify-between gap-3">
                <input
                  type="text"
                  value={sub.title || ""}
                  onChange={(e) =>
                    onUpdateSubSection(sectionIndex, subIdx, "title", e.target.value)
                  }
                  placeholder="e.g. Sub-concept: Inverse Square Law at Close Range"
                  className="w-full px-3 py-1.5 rounded-lg border border-[#14100E]/30 text-xs font-sans font-bold text-[#14100E] focus:outline-none focus:border-[#012CEB]"
                />
                <button
                  type="button"
                  onClick={() => onRemoveSubSection(sectionIndex, subIdx)}
                  className="p-1 text-[#8C8278] hover:text-red-600 transition-colors"
                  title="Remove subsection"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-mono-tech uppercase text-[#6B625A]">
                  Subsection Paragraphs
                </label>
                {(sub.paragraphs || [""]).map((sp, spIdx) => (
                  <textarea
                    key={spIdx}
                    rows={3}
                    value={sp}
                    onChange={(e) => {
                      const newParas = [...(sub.paragraphs || [""])];
                      newParas[spIdx] = e.target.value;
                      onUpdateSubSection(sectionIndex, subIdx, "paragraphs", newParas);
                    }}
                    placeholder="Write detailed technical breakdown for this subsection..."
                    className="w-full p-2.5 rounded-lg border border-[#14100E]/20 text-xs text-[#14100E] leading-relaxed placeholder:text-[#8C8278] focus:outline-none focus:border-[#012CEB]"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

