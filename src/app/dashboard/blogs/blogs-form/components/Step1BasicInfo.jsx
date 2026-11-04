"use client";

import React, { useState } from "react";
import { useBlogForm } from "../context/BlogFormProvider";
import {
  BLOG_CATEGORIES,
  SUGGESTED_TAGS,
} from "../config/blogFormConfig";
import {
  Wand2,
  Clock,
  Tag,
  Star,
  User,
  FileText,
  AlertCircle,
  Plus,
  X,
} from "lucide-react";

export default function Step1BasicInfo() {
  const {
    formData,
    errors,
    updateField,
    updateAuthor,
    autoGenerateSlug,
    autoCalculateReadTime,
    addTag,
    removeTag,
  } = useBlogForm();

  const [tagInput, setTagInput] = useState("");

  const handleAddTagSubmit = (e) => {
    e.preventDefault();
    if (tagInput.trim()) {
      addTag(tagInput.trim());
      setTagInput("");
    }
  };

  const handleTagKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (tagInput.trim()) {
        addTag(tagInput.trim());
        setTagInput("");
      }
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Editorial Header Card */}
      <div className="border-2 border-[#14100E] bg-[#F4EFE6] p-6 rounded-2xl shadow-[3px_3px_0_#14100E] space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono-tech text-[#012CEB] font-semibold">
          <FileText className="w-4 h-4" />
          <span>STEP 01 // EDITORIAL FOUNDATION & METADATA</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-editorial font-bold text-[#14100E]">
          Article Title, Category &amp; Authorship
        </h2>
        <p className="text-xs sm:text-sm text-[#6B625A]">
          Establish the core taxonomy, URL slug, and technical baseline for this journal dispatch.
        </p>
      </div>

      <div className="border-2 border-[#14100E] bg-[#F4EFE6] p-6 sm:p-8 rounded-2xl shadow-[3px_3px_0_#14100E] space-y-6">
        {/* Title Input */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono-tech uppercase font-bold text-[#14100E] flex items-center gap-1.5">
              <span>Article Title</span>
              <span className="text-red-600">*</span>
            </label>
            <button
              type="button"
              onClick={autoGenerateSlug}
              className="text-[11px] font-mono-tech text-[#012CEB] hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <Wand2 className="w-3 h-3" />
              <span>Generate Slug &amp; SEO Title</span>
            </button>
          </div>
          <input
            type="text"
            value={formData.title || ""}
            onChange={(e) => updateField("title", e.target.value)}
            placeholder="e.g. The Art of Cinematic Lighting: Creating Emotion with Shadows"
            className={`w-full px-4 py-3 rounded-xl border-2 bg-white text-[#14100E] text-base sm:text-lg font-editorial font-medium placeholder:text-[#8C8278] focus:outline-none transition-all ${
              errors.title
                ? "border-red-500 focus:border-red-600"
                : "border-[#14100E] focus:border-[#012CEB] focus:shadow-[2px_2px_0_#012CEB]"
            }`}
          />
          {errors.title && (
            <p className="text-xs font-mono-tech text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{errors.title}</span>
            </p>
          )}
        </div>

        {/* Slug & URL preview */}
        <div className="space-y-1.5">
          <label className="text-xs font-mono-tech uppercase font-bold text-[#14100E] flex items-center gap-1.5">
            <span>Canonical Slug</span>
            <span className="text-red-600">*</span>
          </label>
          <div className="flex items-center rounded-xl border-2 border-[#14100E] bg-white overflow-hidden focus-within:border-[#012CEB]">
            <span className="px-3 py-2.5 bg-[#E6DDD2]/60 text-xs font-mono-tech text-[#6B625A] border-r border-[#14100E]/20 select-none">
              /blog/
            </span>
            <input
              type="text"
              value={formData.slug || ""}
              onChange={(e) => updateField("slug", e.target.value)}
              placeholder="cinematic-lighting-techniques"
              className="flex-1 px-3 py-2 text-xs font-mono-tech text-[#14100E] placeholder:text-[#8C8278] focus:outline-none"
            />
          </div>
          {errors.slug && (
            <p className="text-xs font-mono-tech text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{errors.slug}</span>
            </p>
          )}
        </div>

        {/* Category & Status Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono-tech uppercase font-bold text-[#14100E] flex items-center gap-1.5">
              <span>Category</span>
              <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              list="category-suggestions"
              value={formData.category || ""}
              onChange={(e) => updateField("category", e.target.value)}
              placeholder="Type category (e.g. Cinematography, Directing, Optics)"
              className="w-full px-3 py-2.5 rounded-xl border-2 border-[#14100E] bg-white text-xs font-mono-tech text-[#14100E] placeholder:text-[#8C8278] focus:outline-none focus:border-[#012CEB]"
            />
            <datalist id="category-suggestions">
              {BLOG_CATEGORIES.map((cat) => (
                <option key={cat} value={cat} />
              ))}
            </datalist>
            {errors.category && (
              <p className="text-xs font-mono-tech text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errors.category}</span>
              </p>
            )}
          </div>

          {/* Publishing Status */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono-tech uppercase font-bold text-[#14100E] flex items-center justify-between">
              <span>Publishing Status</span>
              <span className="text-[10px] font-mono-tech text-[#8C8278] lowercase">
                (permanent)
              </span>
            </label>
            <div className="relative flex items-center">
              <input
                type="text"
                readOnly
                disabled
                value="Published (Public)"
                className="w-full px-3 py-2.5 pl-8 rounded-xl border-2 border-[#14100E] bg-[#EAE2D7]/70 text-xs font-mono-tech font-bold text-[#14100E] cursor-not-allowed select-none"
              />
              <span className="absolute left-3 w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            </div>
            <p className="text-[11px] font-mono-tech text-[#6B625A]">
              Articles are always public upon saving.
            </p>
          </div>
        </div>

        {/* Featured Story & Reading Time row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
          {/* Featured Toggle */}
          <div className="p-4 rounded-xl border-2 border-[#14100E] bg-[#E6DDD2]/50 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-xs font-mono-tech font-bold text-[#14100E]">
                <Star
                  className={`w-4 h-4 ${
                    formData.isFeatured
                      ? "fill-[#012CEB] text-[#012CEB]"
                      : "text-[#8C8278]"
                  }`}
                />
                <span>Featured Lead Story</span>
              </div>
              <p className="text-[11px] text-[#6B625A]">
                Displays with grand hero typography on the blog landing page.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(formData.isFeatured)}
                onChange={(e) => updateField("isFeatured", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#C4B5A5] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#14100E] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#012CEB]"></div>
            </label>
          </div>

          {/* Reading Time */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono-tech uppercase font-bold text-[#14100E] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#6B625A]" />
                <span>Reading Time</span>
              </label>
              <button
                type="button"
                onClick={autoCalculateReadTime}
                className="text-[11px] font-mono-tech text-[#012CEB] hover:underline"
              >
                Auto-Calculate
              </button>
            </div>
            <input
              type="text"
              value={formData.readingTime || ""}
              onChange={(e) => updateField("readingTime", e.target.value)}
              placeholder="e.g. 9 min read"
              className="w-full px-3 py-2.5 rounded-xl border-2 border-[#14100E] bg-white text-xs font-mono-tech text-[#14100E] focus:outline-none focus:border-[#012CEB]"
            />
          </div>
        </div>


        {/* Excerpt */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono-tech uppercase font-bold text-[#14100E] flex items-center gap-1.5">
              <span>Editorial Excerpt / Abstract</span>
              <span className="text-red-600">*</span>
            </label>
            <span className="text-[10px] font-mono-tech text-[#8C8278]">
              {(formData.excerpt || "").length} characters
            </span>
          </div>
          <textarea
            rows={3}
            value={formData.excerpt || ""}
            onChange={(e) => updateField("excerpt", e.target.value)}
            placeholder="Lighting is less about illumination and more about selective concealment. Explore how contrast ratios shape psychological tension inside the frame."
            className={`w-full px-4 py-3 rounded-xl border-2 bg-white text-sm text-[#14100E] leading-relaxed placeholder:text-[#8C8278] focus:outline-none transition-all ${
              errors.excerpt
                ? "border-red-500"
                : "border-[#14100E] focus:border-[#012CEB] focus:shadow-[2px_2px_0_#012CEB]"
            }`}
          />
          {errors.excerpt && (
            <p className="text-xs font-mono-tech text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{errors.excerpt}</span>
            </p>
          )}
        </div>

        {/* Author Details */}
        <div className="p-5 rounded-xl border-2 border-[#14100E] bg-[#E6DDD2]/40 space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono-tech uppercase font-bold text-[#14100E]">
            <User className="w-4 h-4 text-[#012CEB]" />
            <span>Author Credit</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-mono-tech text-[#6B625A]">Author Name</label>
              <input
                type="text"
                value={formData.author?.name || ""}
                onChange={(e) => updateAuthor("name", e.target.value)}
                placeholder="Anup Rawat"
                className="w-full px-3 py-2 rounded-lg border-2 border-[#14100E] bg-white text-xs font-sans text-[#14100E] focus:outline-none focus:border-[#012CEB]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-mono-tech text-[#6B625A]">Author Role / Title</label>
              <input
                type="text"
                value={formData.author?.role || ""}
                onChange={(e) => updateAuthor("role", e.target.value)}
                placeholder="Cinematographer & Visual Storyteller"
                className="w-full px-3 py-2 rounded-lg border-2 border-[#14100E] bg-white text-xs font-sans text-[#14100E] focus:outline-none focus:border-[#012CEB]"
              />
            </div>
          </div>
        </div>

        {/* Tags Editor */}
        <div className="space-y-3">
          <label className="text-xs font-mono-tech uppercase font-bold text-[#14100E] flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-[#012CEB]" />
            <span>Cinematic Tags &amp; Topical Keywords</span>
          </label>

          {/* Current tags chips */}
          <div className="flex flex-wrap items-center gap-2 min-h-[36px] p-2.5 rounded-xl border-2 border-[#14100E] bg-white">
            {(formData.tags || []).map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono-tech bg-[#E6DDD2] text-[#14100E] border border-[#14100E]/20"
              >
                <span>#{t}</span>
                <button
                  type="button"
                  onClick={() => removeTag(t)}
                  className="hover:text-red-600 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            {/* Input inside chip box */}
            <div className="flex items-center gap-1 flex-1 min-w-[140px]">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="Type tag & press Enter..."
                className="w-full text-xs font-mono-tech text-[#14100E] placeholder:text-[#8C8278] focus:outline-none bg-transparent"
              />
              <button
                type="button"
                onClick={handleAddTagSubmit}
                className="px-2 py-0.5 bg-[#14100E] text-[#F4EDE4] text-xs font-mono-tech rounded hover:bg-[#012CEB]"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Quick Add Suggestions */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono-tech uppercase text-[#8C8278]">
              SUGGESTED CINEMATIC TAXONOMY (CLICK TO ADD):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED_TAGS.map((stag) => {
                const isSelected = (formData.tags || []).includes(stag);
                return (
                  <button
                    key={stag}
                    type="button"
                    disabled={isSelected}
                    onClick={() => addTag(stag)}
                    className={`text-[10px] font-mono-tech px-2 py-0.5 rounded-full border transition-all ${
                      isSelected
                        ? "bg-[#14100E] text-[#F4EDE4] border-[#14100E] opacity-50 cursor-default"
                        : "border-[#14100E]/30 bg-[#F4EFE6] hover:bg-[#012CEB] hover:text-white hover:border-[#012CEB]"
                    }`}
                  >
                    +{stag}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

