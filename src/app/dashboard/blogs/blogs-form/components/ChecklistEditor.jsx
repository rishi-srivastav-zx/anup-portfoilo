"use client";

import React from "react";
import { CheckSquare, Plus, Trash2 } from "lucide-react";

export default function ChecklistEditor({
  sectionIndex,
  checklist = [],
  onAddChecklistItem,
  onUpdateChecklistItem,
  onRemoveChecklistItem,
  onRemove,
}) {
  if (!checklist) return null;

  return (
    <div className="p-4 sm:p-5 rounded-xl border-2 border-[#14100E] bg-[#F4EFE6] space-y-4 shadow-[2px_2px_0_#14100E]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-mono-tech uppercase font-bold text-[#012CEB]">
          <CheckSquare className="w-4 h-4" />
          <span>ON-SET &amp; PREP VERIFICATION POINTS CHECKLIST</span>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="p-1 text-[#8C8278] hover:text-red-600 transition-colors"
          title="Remove checklist"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-2.5">
        {checklist.map((item, itemIdx) => (
          <div key={itemIdx} className="flex items-center gap-2.5">
            <span className="font-mono-tech text-xs text-[#012CEB] font-semibold shrink-0">
              0{itemIdx + 1}.
            </span>
            <input
              type="text"
              value={item}
              onChange={(e) =>
                onUpdateChecklistItem(sectionIndex, itemIdx, e.target.value)
              }
              placeholder="e.g. Verify negative fill does not cast unwanted ambient bounce into actor eye lines"
              className="flex-1 px-3 py-2 rounded-lg border border-[#14100E]/20 bg-white text-xs font-sans text-[#14100E] focus:outline-none focus:border-[#012CEB]"
            />
            {checklist.length > 1 && (
              <button
                type="button"
                onClick={() => onRemoveChecklistItem(sectionIndex, itemIdx)}
                className="text-[#8C8278] hover:text-red-600 p-1"
                title="Remove item"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => onAddChecklistItem(sectionIndex, "")}
        className="text-xs font-mono-tech text-[#012CEB] hover:underline inline-flex items-center gap-1.5 cursor-pointer"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>Add Verification Point</span>
      </button>
    </div>
  );
}

