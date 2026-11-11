"use client";

import React, { useState } from "react";
import { useBlogForm } from "../context/BlogFormProvider";
import { generateSlug } from "../config/blogFormConfig";
import {
  Globe,
  Share2,
  Search,
  Link as LinkIcon,
  RotateCcw,
  Smartphone,
  Monitor,
  CheckCircle2,
  Tag,
  KeyRound,
} from "lucide-react";

export default function Step5SEO() {
  const { formData, errors, updateField } = useBlogForm();
  const [devicePreview, setDevicePreview] = useState("desktop");

  const seoTitle = formData.seoTitle || (formData.title ? `${formData.title} | Anup Rawat` : "");
  const seoDesc = formData.seoDescription || formData.excerpt || "";

  // Automatically pick canonical URL from title or slug: url/blog/title
  const autoSlug = formData.slug || (formData.title ? generateSlug(formData.title) : "");
  const autoCanonicalUrl = autoSlug ? `https://anuprawat.com/blog/${autoSlug}` : "https://anuprawat.com/blog/";
  const canonicalUrl = formData.canonicalUrl || autoCanonicalUrl;

  // Length calculations
  const titleLen = (formData.seoTitle || "").length;
  const descLen = (formData.seoDescription || "").length;

  // Keywords count & resolution
  const keywordsStr = formData.seoKeywords ?? (formData.tags ? formData.tags.join(", ") : "");
  const keywordsList = keywordsStr
    ? keywordsStr.split(",").map((k) => k.trim()).filter(Boolean)
    : [];

  const handleAddTagToKeywords = (tag) => {
    const current = (formData.seoKeywords || "").split(",").map((k) => k.trim()).filter(Boolean);
    if (!current.includes(tag.toLowerCase())) {
      const updated = [...current, tag.toLowerCase()].join(", ");
      updateField("seoKeywords", updated);
    }
  };

  const handleSyncAllTags = () => {
    if (formData.tags && formData.tags.length > 0) {
      updateField("seoKeywords", formData.tags.join(", "));
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Editorial Header Card */}
      <div className="border-2 border-[#14100E] bg-[#F4EFE6] p-6 rounded-2xl shadow-[3px_3px_0_#14100E] space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono-tech text-[#012CEB] font-semibold">
          <Globe className="w-4 h-4" />
          <span>STEP 04 // SEARCH ENGINE OPTIMIZATION &amp; SOCIAL GRAPH</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-editorial font-bold text-[#14100E]">
          Metadata, Canonical URL &amp; Keywords
        </h2>
        <p className="text-xs sm:text-sm text-[#6B625A]">
          Configure high-performing search snippets, automatic canonical URLs, meta keywords, and social preview cards.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Inputs */}
        <div className="lg:col-span-7 space-y-6 border-2 border-[#14100E] bg-[#F4EFE6] p-6 sm:p-8 rounded-2xl shadow-[3px_3px_0_#14100E]">
          {/* SEO Meta Title */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono-tech uppercase font-bold text-[#14100E]">
                SEO Meta Title
              </label>
              <span
                className={`text-[10px] font-mono-tech ${
                  titleLen > 60 ? "text-amber-600 font-bold" : "text-[#8C8278]"
                }`}
              >
                {titleLen}/60 recommended
              </span>
            </div>
            <input
              type="text"
              value={formData.seoTitle || ""}
              onChange={(e) => updateField("seoTitle", e.target.value)}
              placeholder={formData.title ? `${formData.title} | Anup Rawat` : "e.g. Article Title | Anup Rawat"}
              className={`w-full px-4 py-2.5 rounded-xl border-2 bg-white text-xs font-mono-tech text-[#14100E] placeholder:text-[#8C8278] focus:outline-none transition-all ${
                errors.seoTitle
                  ? "border-red-500"
                  : "border-[#14100E] focus:border-[#012CEB]"
              }`}
            />
            {/* Length progress */}
            <div className="w-full bg-[#14100E]/10 h-1 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  titleLen > 65 ? "bg-amber-500" : titleLen >= 40 ? "bg-emerald-500" : "bg-[#012CEB]"
                }`}
                style={{ width: `${Math.min(100, (titleLen / 60) * 100)}%` }}
              />
            </div>
          </div>

          {/* SEO Meta Description */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono-tech uppercase font-bold text-[#14100E]">
                SEO Meta Description
              </label>
              <span
                className={`text-[10px] font-mono-tech ${
                  descLen > 160 ? "text-amber-600 font-bold" : "text-[#8C8278]"
                }`}
              >
                {descLen}/160 recommended
              </span>
            </div>
            <textarea
              rows={3}
              value={formData.seoDescription || ""}
              onChange={(e) => updateField("seoDescription", e.target.value)}
              placeholder={formData.excerpt || "Enter a compelling meta description summarizing the article for search results..."}
              className={`w-full px-4 py-2.5 rounded-xl border-2 bg-white text-xs text-[#14100E] placeholder:text-[#8C8278] focus:outline-none leading-relaxed transition-all ${
                errors.seoDescription
                  ? "border-red-500"
                  : "border-[#14100E] focus:border-[#012CEB]"
              }`}
            />
            {/* Length progress */}
            <div className="w-full bg-[#14100E]/10 h-1 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  descLen > 165 ? "bg-amber-500" : descLen >= 120 ? "bg-emerald-500" : "bg-[#012CEB]"
                }`}
                style={{ width: `${Math.min(100, (descLen / 160) * 100)}%` }}
              />
            </div>
          </div>

          {/* SEO Meta Keywords */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono-tech uppercase font-bold text-[#14100E] flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-[#012CEB]" />
                <span>SEO Meta Keywords</span>
              </label>
              <div className="flex items-center gap-2">
                {formData.tags && formData.tags.length > 0 && (
                  <button
                    type="button"
                    onClick={handleSyncAllTags}
                    className="text-[10px] font-mono-tech text-[#012CEB] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Tag className="w-3 h-3" />
                    <span>Sync from Tags</span>
                  </button>
                )}
                <span className="text-[10px] font-mono-tech text-[#8C8278]">
                  {keywordsList.length} {keywordsList.length === 1 ? "keyword" : "keywords"}
                </span>
              </div>
            </div>
            <input
              type="text"
              value={formData.seoKeywords || ""}
              onChange={(e) => updateField("seoKeywords", e.target.value)}
              placeholder="cinematography, lighting techniques, chiaroscuro, 35mm lens, color grading"
              className="w-full px-4 py-2.5 rounded-xl border-2 border-[#14100E] bg-white text-xs font-mono-tech text-[#14100E] placeholder:text-[#8C8278] focus:outline-none focus:border-[#012CEB] transition-all"
            />
            <p className="text-[11px] font-mono-tech text-[#6B625A]">
              Comma-separated target search keywords for search crawler indexing.
            </p>

            {/* Quick tag click suggestions */}
            {formData.tags && formData.tags.length > 0 && (
              <div className="pt-1 flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-mono-tech text-[#8C8278] uppercase">Suggestions:</span>
                {formData.tags.map((tag) => {
                  const isAdded = keywordsList.includes(tag.toLowerCase());
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleAddTagToKeywords(tag)}
                      className={`text-[10px] font-mono-tech px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                        isAdded
                          ? "bg-[#012CEB]/10 border-[#012CEB]/30 text-[#012CEB] font-semibold"
                          : "bg-white border-[#14100E]/20 text-[#6B625A] hover:border-[#012CEB] hover:text-[#012CEB]"
                      }`}
                    >
                      {isAdded ? "✓ " : "+ "}
                      {tag}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Canonical Index Target (Auto-generated url/blog/title) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono-tech uppercase font-bold text-[#14100E] flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-[#012CEB]" />
                <span>Canonical URL</span>
              </label>
              <button
                type="button"
                onClick={() => updateField("canonicalUrl", autoCanonicalUrl)}
                className="text-[10px] font-mono-tech text-[#012CEB] hover:underline flex items-center gap-1 cursor-pointer"
                title="Automatically resets to url/blog/title"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Auto-pick from Title</span>
              </button>
            </div>
            <input
              type="text"
              value={formData.canonicalUrl || ""}
              onChange={(e) => updateField("canonicalUrl", e.target.value)}
              placeholder={autoSlug ? autoCanonicalUrl : "https://anuprawat.com/blog/[slug]"}
              className="w-full px-4 py-2.5 rounded-xl border-2 border-[#14100E] bg-white text-xs font-mono-tech text-[#14100E] placeholder:text-[#8C8278] focus:outline-none focus:border-[#012CEB] transition-all"
            />

            {/* Canonical Path info box */}
            <div className="p-3.5 rounded-xl border border-[#14100E]/20 bg-[#E6DDD2]/50 space-y-1 text-xs font-mono-tech">
              <div className="flex items-center justify-between text-[#6B625A] text-[10px] uppercase font-bold">
                <span>Canonical Index Target:</span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Auto-Resolved
                </span>
              </div>
              <div className="text-[#012CEB] font-bold truncate select-all">{canonicalUrl}</div>
              <p className="text-[10px] text-[#6B625A] pt-0.5">
                {autoSlug ? (
                  <>Picks automatically based on domain + <span className="font-semibold text-[#14100E]">/blog/{autoSlug}</span></>
                ) : (
                  <>Type an article title or slug to auto-generate the canonical target URL.</>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Right Live Preview Cards */}
        <div className="lg:col-span-5 space-y-6">
          {/* Google SERP Snippet Simulator */}
          <div className="border-2 border-[#14100E] bg-white p-5 rounded-2xl shadow-[3px_3px_0_#14100E] space-y-3">
            <div className="flex items-center justify-between text-xs font-mono-tech text-[#6B625A] border-b pb-2">
              <span className="flex items-center gap-1.5 font-bold text-[#14100E]">
                <Search className="w-3.5 h-3.5 text-[#012CEB]" />
                <span>GOOGLE SEARCH SNIPPET</span>
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setDevicePreview("desktop")}
                  className={`p-1 rounded ${devicePreview === "desktop" ? "bg-black/10 text-black" : "text-gray-400"}`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setDevicePreview("mobile")}
                  className={`p-1 rounded ${devicePreview === "mobile" ? "bg-black/10 text-black" : "text-gray-400"}`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="space-y-1 font-sans">
              <div className="flex items-center gap-2 text-xs text-[#202124]">
                <div className="w-4 h-4 rounded-full bg-[#14100E] text-white flex items-center justify-center text-[8px] font-bold">
                  AR
                </div>
                <div className="leading-tight">
                  <div className="text-[12px] text-[#202124]">anuprawat.com</div>
                  <div className="text-[10px] text-[#5f6368] truncate">
                    https://anuprawat.com &gt; blog &gt; {autoSlug || "article-slug"}
                  </div>
                </div>
              </div>

              <h3 className="text-base sm:text-lg text-[#1a0dab] hover:underline cursor-pointer line-clamp-1 font-medium">
                {seoTitle || (formData.title ? `${formData.title} | Anup Rawat` : "Article Title Preview")}
              </h3>

              <p className="text-xs text-[#4d5156] line-clamp-2 leading-relaxed">
                {seoDesc || "Meta description snippet will appear here in Google search engine result pages."}
              </p>
            </div>

            {keywordsList.length > 0 && (
              <div className="pt-2 border-t border-[#14100E]/10 space-y-1">
                <span className="text-[10px] font-mono-tech uppercase text-[#8C8278]">
                  Indexed Keywords ({keywordsList.length}):
                </span>
                <div className="flex flex-wrap gap-1">
                  {keywordsList.slice(0, 5).map((k) => (
                    <span
                      key={k}
                      className="text-[10px] font-mono-tech px-2 py-0.5 bg-[#E6DDD2]/60 text-[#14100E] rounded"
                    >
                      {k}
                    </span>
                  ))}
                  {keywordsList.length > 5 && (
                    <span className="text-[10px] font-mono-tech text-[#8C8278] self-center">
                      +{keywordsList.length - 5} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Social OpenGraph Card Preview */}
          <div className="border-2 border-[#14100E] bg-[#F4EFE6] p-5 rounded-2xl shadow-[3px_3px_0_#14100E] space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-mono-tech font-bold text-[#012CEB]">
              <Share2 className="w-3.5 h-3.5" />
              <span>OPEN GRAPH SOCIAL CARD</span>
            </div>

            <div className="rounded-xl border border-[#14100E]/20 bg-white overflow-hidden shadow-sm">
              <div className="aspect-[16/9] w-full bg-[#14100E]/10 relative overflow-hidden">
                {formData.featuredImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={formData.featuredImage}
                    alt={formData.title || "Social banner"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs font-mono-tech text-[#8C8278]">
                    No Featured Image
                  </div>
                )}
              </div>
              <div className="p-3 space-y-1">
                <span className="text-[10px] font-mono-tech uppercase text-[#8C8278]">
                  ANUPRAWAT.COM
                </span>
                <h4 className="text-xs font-sans font-bold text-[#14100E] line-clamp-1">
                  {formData.title || "Article Title Preview"}
                </h4>
                <p className="text-[11px] text-[#6B625A] line-clamp-2 leading-snug">
                  {formData.excerpt || "Excerpt appears in social feed preview."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
