"use client";

import React from "react";
import { useBlogForm } from "../context/BlogFormProvider";
import {
  Type,
  Plus,
  Trash2,
  AlertCircle,
  Sparkles,
} from "lucide-react";

export default function Step3Introduction() {
  const {
    formData,
    errors,
    addIntroParagraph,
    updateIntroParagraph,
    removeIntroParagraph,
  } = useBlogForm();

  const paragraphs = formData.introduction || [""];

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Editorial Header Card */}
      <div className="border-2 border-[#14100E] bg-[#F4EFE6] p-6 rounded-2xl shadow-[3px_3px_0_#14100E] space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono-tech text-[#012CEB] font-semibold">
          <Type className="w-4 h-4" />
          <span>STEP 03 // EDITORIAL INTRODUCTION &amp; LEAD HOOK</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-editorial font-bold text-[#14100E]">
          The Opening Thesis &amp; Drop-Cap Hook
        </h2>
        <p className="text-xs sm:text-sm text-[#6B625A]">
          The opening paragraphs establish narrative atmosphere before diving into technical tables and lighting geometry. Paragraph 1 automatically receives the signature electric-blue drop cap.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Paragraphs Inputs */}
        <div className="lg:col-span-7 space-y-5 border-2 border-[#14100E] bg-[#F4EFE6] p-6 sm:p-8 rounded-2xl shadow-[3px_3px_0_#14100E]">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono-tech uppercase font-bold text-[#14100E] flex items-center gap-1.5">
              <span>Introduction Paragraphs</span>
              <span className="text-red-600">*</span>
            </label>
            <span className="text-[10px] font-mono-tech text-[#8C8278]">
              {paragraphs.length} paragraph{paragraphs.length > 1 ? "s" : ""}
            </span>
          </div>

          {errors.introduction && (
            <p className="text-xs font-mono-tech text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{errors.introduction}</span>
            </p>
          )}

          <div className="space-y-4">
            {paragraphs.map((para, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border-2 border-[#14100E]/20 bg-white space-y-2 focus-within:border-[#012CEB] transition-all"
              >
                <div className="flex items-center justify-between text-xs font-mono-tech text-[#6B625A]">
                  <span className="font-bold flex items-center gap-1.5">
                    {idx === 0 ? (
                      <span className="inline-flex items-center gap-1 text-[#012CEB]">
                        <Sparkles className="w-3 h-3" />
                        Paragraph 01 (Drop-Cap Lead)
                      </span>
                    ) : (
                      <span>Paragraph 0{idx + 1}</span>
                    )}
                  </span>
                  {paragraphs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeIntroParagraph(idx)}
                      className="p-1 text-[#8C8278] hover:text-red-600 transition-colors"
                      title="Remove paragraph"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <textarea
                  rows={4}
                  value={para}
                  onChange={(e) => updateIntroParagraph(idx, e.target.value)}
                  placeholder={
                    idx === 0
                      ? "When beginning a lighting setup, the instinctive impulse is often to add illumination until every corner registers cleanly on the sensor..."
                      : "Continue developing the cinematic thesis..."
                  }
                  className="w-full text-sm text-[#14100E] leading-relaxed placeholder:text-[#8C8278] focus:outline-none resize-y bg-transparent"
                />
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addIntroParagraph}
            className="w-full py-2.5 px-4 border-2 border-dashed border-[#14100E]/30 hover:border-[#012CEB] bg-white/50 hover:bg-[#F4EDE4] text-xs font-mono-tech text-[#14100E] hover:text-[#012CEB] rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Additional Introductory Paragraph</span>
          </button>
        </div>

        {/* Right: Live Editorial Drop-Cap Preview */}
        <div className="lg:col-span-5 space-y-3">
          <div className="border-2 border-[#14100E] bg-[#F4EFE6] p-6 rounded-2xl shadow-[3px_3px_0_#14100E] space-y-4">
            <div className="flex items-center gap-1.5 text-xs font-mono-tech text-[#012CEB] font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>LIVE EDITORIAL DROP-CAP PREVIEW</span>
            </div>

            <div className="space-y-4 text-base text-[#14100E] leading-[1.8] font-sans">
              {paragraphs.map((p, i) => (
                <p
                  key={i}
                  className={
                    i === 0
                      ? "first-letter:font-editorial first-letter:text-5xl first-letter:font-semibold first-letter:text-[#012CEB] first-letter:float-left first-letter:mr-3 first-letter:leading-none"
                      : ""
                  }
                >
                  {p || (i === 0 ? "Your introductory paragraph will render here with an editorial drop cap." : "")}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

