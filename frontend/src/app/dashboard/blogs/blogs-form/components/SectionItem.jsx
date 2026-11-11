"use client";

import React, { useState } from "react";
import SubSectionEditor from "./SubSectionEditor";
import PullQuoteEditor from "./PullQuoteEditor";
import TableEditor from "./TableEditor";
import ChecklistEditor from "./ChecklistEditor";
import InlineImageEditor from "./InlineImageEditor";
import { generateSlug } from "../config/blogFormConfig";
import {
  ChevronUp,
  ChevronDown,
  Trash2,
  Plus,
  Layers,
  Quote,
  Table,
  CheckSquare,
  Image as ImageIcon,
  Heading3,
  Hash,
} from "lucide-react";

export default function SectionItem({
  section,
  index,
  totalSections,
  errors,
  onUpdateSection,
  onMoveSection,
  onRemoveSection,
  onAddParagraph,
  onUpdateParagraph,
  onRemoveParagraph,
  onAddSubSection,
  onUpdateSubSection,
  onRemoveSubSection,
  onToggleBlock,
  onUpdatePullQuote,
  onUpdateInlineImage,
  onUpdateTableCaption,
  onUpdateTableHeader,
  onAddTableColumn,
  onRemoveTableColumn,
  onUpdateTableCell,
  onAddTableRow,
  onRemoveTableRow,
  onAddChecklistItem,
  onUpdateChecklistItem,
  onRemoveChecklistItem,
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleHeadingChange = (val) => {
    onUpdateSection(index, "heading", val);
    if (!section.id || section.id.startsWith("section-")) {
      const autoId = generateSlug(val) || `section-${index + 1}`;
      onUpdateSection(index, "id", autoId);
    }
  };

  return (
    <div className="border-2 border-[#14100E] bg-[#F4EFE6] rounded-2xl shadow-[3px_3px_0_#14100E] overflow-hidden transition-all">
      {/* Section Header Bar */}
      <div className="p-4 sm:p-5 bg-[#E6DDD2] border-b border-[#14100E]/20 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <span className="w-7 h-7 rounded-lg bg-[#012CEB] text-white flex items-center justify-center text-xs font-mono-tech font-bold shrink-0">
            0{index + 1}
          </span>
          <div className="min-w-0 flex-1">
            <input
              type="text"
              value={section.heading || ""}
              onChange={(e) => handleHeadingChange(e.target.value)}
              placeholder="e.g. Motivated Light and Emotional Credibility"
              className="w-full bg-transparent font-editorial font-bold text-base sm:text-lg text-[#14100E] placeholder:text-[#8C8278] focus:outline-none"
            />
            <div className="flex items-center gap-1.5 text-[11px] font-mono-tech text-[#6B625A]">
              <Hash className="w-3 h-3 text-[#012CEB]" />
              <span>Anchor ID (TOC):</span>
              <input
                type="text"
                value={section.id || ""}
                onChange={(e) => onUpdateSection(index, "id", e.target.value)}
                placeholder="motivated-light-credibility"
                className="bg-transparent text-[#012CEB] font-mono-tech font-semibold focus:outline-none underline"
              />
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            disabled={index === 0}
            onClick={() => onMoveSection(index, "up")}
            className="p-1.5 rounded hover:bg-black/10 disabled:opacity-30 text-[#14100E]"
            title="Move Section Up"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <button
            type="button"
            disabled={index === totalSections - 1}
            onClick={() => onMoveSection(index, "down")}
            className="p-1.5 rounded hover:bg-black/10 disabled:opacity-30 text-[#14100E]"
            title="Move Section Down"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onRemoveSection(index)}
            className="p-1.5 rounded hover:bg-red-100 text-[#8C8278] hover:text-red-600 transition-colors"
            title="Delete Section"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Section Content Body */}
      <div className="p-4 sm:p-6 space-y-6">
        {/* Paragraphs Editor */}
        <div className="space-y-3">
          <label className="text-xs font-mono-tech uppercase font-bold text-[#14100E]">
            Section Body Paragraphs
          </label>
          <div className="space-y-3">
            {(section.paragraphs || [""]).map((para, pIdx) => (
              <div key={pIdx} className="flex items-start gap-2">
                <textarea
                  rows={3}
                  value={para}
                  onChange={(e) => onUpdateParagraph(index, pIdx, e.target.value)}
                  placeholder="Detail the technical breakdown, camera angles, color gamut, or blocking..."
                  className="flex-1 p-3 rounded-xl border border-[#14100E]/20 bg-white text-sm text-[#14100E] leading-relaxed placeholder:text-[#8C8278] focus:outline-none focus:border-[#012CEB]"
                />
                {(section.paragraphs || []).length > 1 && (
                  <button
                    type="button"
                    onClick={() => onRemoveParagraph(index, pIdx)}
                    className="p-2 text-[#8C8278] hover:text-red-600"
                    title="Remove paragraph"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => onAddParagraph(index)}
            className="text-xs font-mono-tech text-[#012CEB] hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Paragraph to Section 0{index + 1}</span>
          </button>
        </div>

        {/* Optional Rich Blocks Toolbar */}
        <div className="pt-2 border-t border-[#14100E]/15 space-y-2">
          <span className="text-[10px] font-mono-tech uppercase text-[#8C8278]">
            ATTACH RICH EDITORIAL BLOCKS TO SECTION 0{index + 1}:
          </span>
          <div className="flex flex-wrap gap-2">
            {/* Toggle H3 Subsections */}
            <button
              type="button"
              onClick={() => {
                if (section.subSections && section.subSections.length > 0) {
                  onUpdateSection(index, "subSections", []);
                } else {
                  onAddSubSection(index);
                }
              }}
              className={`px-3 py-1.5 rounded-lg border text-xs font-mono-tech font-semibold inline-flex items-center gap-1.5 transition-all ${
                section.subSections && section.subSections.length > 0
                  ? "bg-[#14100E] text-[#F4EDE4] border-[#14100E]"
                  : "border-[#14100E]/30 bg-white hover:bg-[#E6DDD2] text-[#14100E]"
              }`}
            >
              <Heading3 className="w-3.5 h-3.5" />
              <span>H3 Subsections</span>
            </button>

            {/* Toggle Pull Quote */}
            <button
              type="button"
              onClick={() => onToggleBlock(index, "pullQuote")}
              className={`px-3 py-1.5 rounded-lg border text-xs font-mono-tech font-semibold inline-flex items-center gap-1.5 transition-all ${
                section.pullQuote
                  ? "bg-[#012CEB] text-white border-[#012CEB]"
                  : "border-[#14100E]/30 bg-white hover:bg-[#E6DDD2] text-[#14100E]"
              }`}
            >
              <Quote className="w-3.5 h-3.5" />
              <span>Editorial Pull Quote</span>
            </button>

            {/* Toggle Table */}
            <button
              type="button"
              onClick={() => onToggleBlock(index, "table")}
              className={`px-3 py-1.5 rounded-lg border text-xs font-mono-tech font-semibold inline-flex items-center gap-1.5 transition-all ${
                section.table
                  ? "bg-[#14100E] text-[#F4EDE4] border-[#14100E]"
                  : "border-[#14100E]/30 bg-white hover:bg-[#E6DDD2] text-[#14100E]"
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Technical Table</span>
            </button>

            {/* Toggle Checklist */}
            <button
              type="button"
              onClick={() => onToggleBlock(index, "checklist")}
              className={`px-3 py-1.5 rounded-lg border text-xs font-mono-tech font-semibold inline-flex items-center gap-1.5 transition-all ${
                section.checklist
                  ? "bg-[#14100E] text-[#F4EDE4] border-[#14100E]"
                  : "border-[#14100E]/30 bg-white hover:bg-[#E6DDD2] text-[#14100E]"
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Verification Checklist</span>
            </button>

            {/* Toggle Inline Image */}
            <button
              type="button"
              onClick={() => onToggleBlock(index, "inlineImage")}
              className={`px-3 py-1.5 rounded-lg border text-xs font-mono-tech font-semibold inline-flex items-center gap-1.5 transition-all ${
                section.inlineImage
                  ? "bg-[#14100E] text-[#F4EDE4] border-[#14100E]"
                  : "border-[#14100E]/30 bg-white hover:bg-[#E6DDD2] text-[#14100E]"
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Inline Diagram</span>
            </button>
          </div>
        </div>

        {/* SubSection Editor */}
        {section.subSections && section.subSections.length > 0 && (
          <SubSectionEditor
            sectionIndex={index}
            subSections={section.subSections}
            onAddSubSection={onAddSubSection}
            onUpdateSubSection={onUpdateSubSection}
            onRemoveSubSection={onRemoveSubSection}
          />
        )}

        {/* Pull Quote Editor */}
        {section.pullQuote && (
          <PullQuoteEditor
            sectionIndex={index}
            pullQuote={section.pullQuote}
            onUpdatePullQuote={onUpdatePullQuote}
            onRemove={() => onToggleBlock(index, "pullQuote")}
          />
        )}

        {/* Table Editor */}
        {section.table && (
          <TableEditor
            sectionIndex={index}
            table={section.table}
            onUpdateCaption={onUpdateTableCaption}
            onUpdateHeader={onUpdateTableHeader}
            onAddColumn={onAddTableColumn}
            onRemoveColumn={onRemoveTableColumn}
            onUpdateCell={onUpdateTableCell}
            onAddRow={onAddTableRow}
            onRemoveRow={onRemoveTableRow}
            onRemove={() => onToggleBlock(index, "table")}
          />
        )}

        {/* Checklist Editor */}
        {section.checklist && (
          <ChecklistEditor
            sectionIndex={index}
            checklist={section.checklist}
            onAddChecklistItem={onAddChecklistItem}
            onUpdateChecklistItem={onUpdateChecklistItem}
            onRemoveChecklistItem={onRemoveChecklistItem}
            onRemove={() => onToggleBlock(index, "checklist")}
          />
        )}

        {/* Inline Image Editor */}
        {section.inlineImage && (
          <InlineImageEditor
            sectionIndex={index}
            inlineImage={section.inlineImage}
            onUpdateInlineImage={onUpdateInlineImage}
            onRemove={() => onToggleBlock(index, "inlineImage")}
          />
        )}
      </div>
    </div>
  );
}

