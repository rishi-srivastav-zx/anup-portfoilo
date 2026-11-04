"use client";

import React, { useMemo } from "react";
import { useBlogForm } from "../context/BlogFormProvider";
import BlogServices from "@/api/services/blog.services";
import TinyMCEEditor from "@/components/TinyMCEEditor";
import { FileEdit, AlertCircle, Sparkles } from "lucide-react";

export default function Step4Sections() {
  const { formData, errors, updateField } = useBlogForm();

  // Compute initial content from formData.content or combine paragraphs from existing sections
  const initialContent = useMemo(() => {
    if (formData.content) return formData.content;
    if (formData.sections && formData.sections.length > 0) {
      return formData.sections
        .map((s) => `<h2>${s.heading}</h2>${(s.paragraphs || []).map((p) => `<p>${p}</p>`).join("")}`)
        .join("");
    }
    return "";
  }, [formData.content, formData.sections]);

  const handleEditorChange = (newHtml) => {
    updateField("content", newHtml);

    // Keep sections array synchronized so public view and database schemas remain fully functional
    const fallbackHeading = formData.title || "Article Content";
    updateField("sections", [
      {
        id: "section-main",
        heading: fallbackHeading,
        paragraphs: [newHtml],
        subSections: [],
        pullQuote: null,
        inlineImage: null,
        table: null,
        checklist: null,
      },
    ]);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Editorial Header Card */}
      <div className="border-2 border-[#14100E] bg-[#F4EFE6] p-6 rounded-2xl shadow-[3px_3px_0_#14100E] space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono-tech text-[#012CEB] font-semibold">
          <FileEdit className="w-4 h-4" />
          <span>STEP 03 // ARTICLE CONTENT &amp; RICH TEXT EDITOR</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-editorial font-bold text-[#14100E]">
          Full Article Content &amp; Media Body
        </h2>
        <p className="text-xs sm:text-sm text-[#6B625A]">
          Compose your complete article with full typography formatting, subheadings, pull quotes, tables, code snippets, and embedded media using the editor below.
        </p>
      </div>

      {errors.sections && (
        <div className="p-4 rounded-xl border border-red-300 bg-red-50 text-red-900 text-xs font-mono-tech flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errors.sections}</span>
        </div>
      )}

      {/* Single Rich Text Editor Box */}
      <div className="border-2 border-[#14100E] bg-white rounded-2xl shadow-[3px_3px_0_#14100E] overflow-hidden p-2 sm:p-4 space-y-3">
        <div className="flex items-center justify-between px-2 pt-1 text-xs font-mono-tech text-[#6B625A] border-b border-[#14100E]/10 pb-2">
          <div className="flex items-center gap-2 font-bold text-[#14100E]">
            <Sparkles className="w-3.5 h-3.5 text-[#012CEB]" />
            <span>TINYMCE RICH TEXT COMPOSER</span>
          </div>
          <span className="text-[10px] bg-[#EAE2D7] text-[#14100E] px-2 py-0.5 rounded font-mono-tech">
            Rich HTML Output
          </span>
        </div>

        <div className="min-h-[500px]">
          <TinyMCEEditor
            value={formData.content || initialContent}
            onChange={handleEditorChange}
            height={550}
            config={{
              images_upload_handler: async (blobInfo) => {
                try {
                  const res = await BlogServices.uploadMedia(blobInfo.blob());
                  if (res?.data?.url) return res.data.url;
                  return "data:" + blobInfo.blob().type + ";base64," + blobInfo.base64();
                } catch {
                  return "data:" + blobInfo.blob().type + ";base64," + blobInfo.base64();
                }
              },
            }}
            placeholder="Write your article body here... Use the toolbar to insert headings, styles, lists, quotes, tables, media, and code blocks."
          />
        </div>
      </div>
    </div>
  );
}
