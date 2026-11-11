"use client";

import React from "react";
import { Table, Plus, Trash2, Columns, Rows } from "lucide-react";

export default function TableEditor({
  sectionIndex,
  table,
  onUpdateCaption,
  onUpdateHeader,
  onAddColumn,
  onRemoveColumn,
  onUpdateCell,
  onAddRow,
  onRemoveRow,
  onRemove,
}) {
  if (!table) return null;

  const headers = table.headers || ["Column 1", "Column 2"];
  const rows = table.rows || [["", ""]];

  return (
    <div className="p-4 sm:p-5 rounded-xl border-2 border-[#14100E] bg-[#F4EFE6] space-y-4 shadow-[2px_2px_0_#14100E]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-mono-tech uppercase font-bold text-[#012CEB]">
          <Table className="w-4 h-4" />
          <span>TECHNICAL COMPARISON TABLE</span>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="p-1 text-[#8C8278] hover:text-red-600 transition-colors"
          title="Remove table"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Caption */}
      <div className="space-y-1">
        <label className="text-[10px] font-mono-tech uppercase text-[#6B625A]">
          Table Caption (All Caps Header)
        </label>
        <input
          type="text"
          value={table.caption || ""}
          onChange={(e) => onUpdateCaption(sectionIndex, e.target.value)}
          placeholder="e.g. TECHNICAL EXPOSURE & FIXTURE SPECIFICATION"
          className="w-full px-3 py-1.5 rounded-lg border border-[#14100E]/30 bg-white text-xs font-mono-tech font-bold text-[#14100E] focus:outline-none focus:border-[#012CEB]"
        />
      </div>

      {/* Table Editor */}
      <div className="overflow-x-auto border border-[#14100E]/20 rounded-xl bg-white">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#E6DDD2]/60 border-b border-[#14100E]/20">
              {headers.map((header, hIdx) => (
                <th key={hIdx} className="p-2 min-w-[120px]">
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={header}
                      onChange={(e) => onUpdateHeader(sectionIndex, hIdx, e.target.value)}
                      className="w-full px-2 py-1 bg-white border border-[#14100E]/20 rounded font-mono-tech font-semibold text-xs text-[#012CEB] focus:outline-none focus:border-[#012CEB]"
                      placeholder={`Header ${hIdx + 1}`}
                    />
                    {headers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => onRemoveColumn(sectionIndex, hIdx)}
                        className="text-[#8C8278] hover:text-red-600 p-1"
                        title="Delete column"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </th>
              ))}
              <th className="p-2 w-10 text-center">
                <button
                  type="button"
                  onClick={() => onAddColumn(sectionIndex)}
                  className="p-1.5 bg-[#012CEB] text-white rounded hover:bg-[#0022BD]"
                  title="Add column"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#14100E]/10">
            {rows.map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-black/[0.02]">
                {row.map((cell, cIdx) => (
                  <td key={cIdx} className="p-2">
                    <input
                      type="text"
                      value={cell}
                      onChange={(e) =>
                        onUpdateCell(sectionIndex, rIdx, cIdx, e.target.value)
                      }
                      placeholder={cIdx === 0 ? "Param name" : "Spec / value"}
                      className={`w-full px-2 py-1 rounded border border-[#14100E]/15 text-xs focus:outline-none focus:border-[#012CEB] ${
                        cIdx === 0
                          ? "font-mono-tech text-[#012CEB] font-semibold"
                          : "font-sans text-[#14100E]"
                      }`}
                    />
                  </td>
                ))}
                <td className="p-2 text-center">
                  {rows.length > 1 && (
                    <button
                      type="button"
                      onClick={() => onRemoveRow(sectionIndex, rIdx)}
                      className="text-[#8C8278] hover:text-red-600 p-1"
                      title="Delete row"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Row add action */}
      <button
        type="button"
        onClick={() => onAddRow(sectionIndex)}
        className="text-xs font-mono-tech text-[#012CEB] hover:underline inline-flex items-center gap-1.5 cursor-pointer"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>Add Table Row</span>
      </button>
    </div>
  );
}

