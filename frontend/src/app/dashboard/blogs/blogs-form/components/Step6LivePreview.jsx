"use client";

import React, { useState } from "react";
import { useBlogForm } from "../context/BlogFormProvider";
import {
  BookOpen,
  Calendar,
  Clock,
  User,
  Share2,
  Check,
  Sparkles,
  ArrowRight,
  Eye,
  Send,
  Save,
} from "lucide-react";

export default function Step6LivePreview() {
  const { formData, saveArticle, goToStep } = useBlogForm();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sections = formData.sections || [];
  const introduction = formData.introduction || [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Fidelity Banner */}
      <div className="p-4 rounded-2xl border-2 border-[#14100E] bg-[#F4EFE6] shadow-[3px_3px_0_#14100E] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-[#012CEB]" />
          <span className="text-xs font-mono-tech font-bold text-[#14100E]">
            REAL-TIME PUBLIC JOURNAL PREVIEW (EXACT DISPLAY ON /blog/{formData.slug || "slug"})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => goToStep(1)}
            className="px-3 py-1.5 text-xs font-mono-tech border border-[#14100E]/20 bg-white hover:bg-black/5 rounded-lg"
          >
            Edit Fields
          </button>
          <button
            type="button"
            onClick={() => saveArticle("published")}
            className="px-4 py-1.5 bg-[#012CEB] hover:bg-[#0022BD] text-white text-xs font-mono-tech font-semibold rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Publish Article Now</span>
          </button>
        </div>
      </div>

      {/* Public Article Replica Container */}
      <article className="border-2 border-[#14100E] bg-[#E6DDD2] text-[#14100E] rounded-3xl shadow-[5px_5px_0_#14100E] overflow-hidden">
        {/* Header & Hero */}
        <header className="border-b border-[#14100E]/15 pt-8 pb-10 sm:pt-12 sm:pb-14 px-5 sm:px-8 bg-[#E6DDD2]">
          <div className="max-w-[1140px] mx-auto space-y-6">
            {/* Breadcrumb Navigation */}
            <nav className="text-xs font-mono-tech text-[#6B625A]">
              <ol className="flex flex-wrap items-center gap-2">
                <li>Home</li>
                <li aria-hidden="true">/</li>
                <li>Journal</li>
                <li aria-hidden="true">/</li>
                <li className="text-[#012CEB] font-semibold">{formData.category}</li>
                <li aria-hidden="true">/</li>
                <li className="text-[#14100E] font-medium truncate max-w-[200px]">
                  {formData.title || "Untitled Article"}
                </li>
              </ol>
            </nav>

            {/* Technical Note Pill */}
            {formData.technicalNote && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#14100E]/20 bg-[#F4EFE6] text-xs font-mono-tech text-[#012CEB] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#012CEB] animate-pulse" />
                <span>{formData.technicalNote}</span>
              </div>
            )}

            {/* Main Editorial Title */}
            <h1
              className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-bold text-[#14100E] tracking-tight leading-[1.15]"
              style={{ textWrap: "balance" }}
            >
              {formData.title || "Untitled Article Headline"}
            </h1>

            {/* Excerpt / Lead Standfirst */}
            <p className="text-base sm:text-lg text-[#4A423B] leading-relaxed max-w-3xl">
              {formData.excerpt || "Editorial excerpt summary will display here."}
            </p>

            {/* Metadata Bar */}
            <div className="pt-4 border-t border-[#14100E]/15 flex flex-wrap items-center justify-between gap-4 text-xs font-mono-tech text-[#6B625A]">
              <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                <span className="flex items-center gap-1.5 text-[#14100E] font-semibold">
                  <User className="w-3.5 h-3.5 text-[#012CEB]" />
                  <span>{formData.author?.name || "Anup Rawat"}</span>
                  <span className="text-[#8C8278] font-normal">({formData.author?.role})</span>
                </span>

                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#012CEB]" />
                  <span>{formData.publishedAt || "Today"}</span>
                </span>

                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#012CEB]" />
                  <span>{formData.readingTime || "5 min read"}</span>
                </span>
              </div>

              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#14100E]/20 bg-[#F4EFE6] hover:bg-[#14100E] text-[#14100E] hover:text-[#F4EDE4] text-xs font-mono-tech font-semibold transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Link Copied</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5 text-[#012CEB]" />
                    <span>Copy Article URL</span>
                  </>
                )}
              </button>
            </div>

            {/* 16:9 Featured Hero Media */}
            <div className="pt-2">
              <div className="aspect-[16/9] w-full rounded-2xl overflow-hidden border-2 border-[#14100E] bg-[#14100E]/5 shadow-[3px_3px_0_#14100E] relative">
                {formData.featuredImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={formData.featuredImage}
                    alt={formData.featuredImageAlt || "Hero visual"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs font-mono-tech text-[#8C8278]">
                    No Featured Image Attached
                  </div>
                )}
              </div>
              {formData.featuredImageAlt && (
                <p className="mt-2 text-xs font-mono-tech text-[#6B625A] italic">
                  {formData.featuredImageAlt}
                </p>
              )}
            </div>
          </div>
        </header>

        {/* Body + Sidebar Table of Contents */}
        <div className="max-w-[1140px] mx-auto px-5 sm:px-8 py-10 sm:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Table of Contents Sidebar */}
            <aside className="lg:col-span-4 order-1 lg:order-2">
              <div className="lg:sticky lg:top-24 border-2 border-[#14100E] bg-[#F4EFE6] rounded-2xl shadow-[3px_3px_0_#14100E] p-6 space-y-4">
                <div className="flex items-center gap-2 text-xs font-mono-tech text-[#012CEB] font-semibold">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>IN THIS ARTICLE</span>
                </div>

                <ol className="space-y-2.5 text-sm">
                  {sections.map((sec, idx) => (
                    <li key={sec.id || idx}>
                      <a
                        href={`#preview-${sec.id || idx}`}
                        className="text-[#6B625A] hover:text-[#14100E] transition-colors flex items-baseline gap-2 leading-snug"
                      >
                        <span className="font-mono-tech text-xs text-[#012CEB] font-semibold shrink-0">
                          0{idx + 1}.
                        </span>
                        <span className="font-medium text-xs sm:text-sm">{sec.heading}</span>
                      </a>
                    </li>
                  ))}
                </ol>

                {formData.tags && formData.tags.length > 0 && (
                  <div className="pt-4 border-t border-[#14100E]/15 space-y-2">
                    <p className="text-xs font-mono-tech text-[#012CEB] font-semibold">
                      TOPICAL INDEX
                    </p>
                    <p className="text-xs text-[#6B625A] leading-relaxed font-mono-tech">
                      {formData.tags.join(" · ")}
                    </p>
                  </div>
                )}
              </div>
            </aside>

            {/* Editorial Reading Column */}
            <div className="lg:col-span-8 order-2 lg:order-1 max-w-[68ch] space-y-10">
              {/* Introduction paragraphs with Drop Cap */}
              <div className="space-y-5 text-base sm:text-lg text-[#14100E] leading-[1.8]">
                {introduction.map((para, i) => (
                  <p
                    key={i}
                    className={
                      i === 0
                        ? "first-letter:font-editorial first-letter:text-5xl first-letter:font-semibold first-letter:text-[#012CEB] first-letter:float-left first-letter:mr-3 first-letter:leading-none"
                        : ""
                    }
                  >
                    {para}
                  </p>
                ))}
              </div>

              {/* Sections or TinyMCE Rich Content */}
              {formData.content ? (
                <div
                  className="space-y-4 text-base text-[#3B342F] leading-[1.8] pt-6 border-t border-[#14100E]/15 prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: formData.content }}
                />
              ) : (
                sections.map((sec, sIdx) => (
                  <section
                    key={sec.id || sIdx}
                    id={`preview-${sec.id || sIdx}`}
                    className="space-y-6 pt-6 border-t border-[#14100E]/15"
                  >
                  <h2
                    className="font-editorial text-2xl sm:text-3xl font-semibold text-[#14100E] tracking-tight leading-snug"
                    style={{ textWrap: "balance" }}
                  >
                    {sec.heading}
                  </h2>

                  <div className="space-y-4 text-base text-[#3B342F] leading-[1.8]">
                    {(sec.paragraphs || []).map((paragraph, pIdx) => (
                      <p key={pIdx}>{paragraph}</p>
                    ))}
                  </div>

                  {/* SubSections (H3) */}
                  {sec.subSections &&
                    sec.subSections.map((sub, subIdx) => (
                      <div key={subIdx} className="pt-3 space-y-2">
                        <h3 className="font-sans text-lg font-bold text-[#14100E]">
                          {sub.title}
                        </h3>
                        {(sub.paragraphs || []).map((sp, spIdx) => (
                          <p key={spIdx} className="text-base text-[#3B342F] leading-[1.8]">
                            {sp}
                          </p>
                        ))}
                      </div>
                    ))}

                  {/* Pull Quote */}
                  {sec.pullQuote && (
                    <blockquote className="my-8 p-6 sm:p-8 border-2 border-[#012CEB] bg-[#F4EFE6] rounded-2xl shadow-[3px_3px_0_#012CEB] space-y-3">
                      <p className="font-editorial italic text-xl sm:text-2xl text-[#14100E] leading-relaxed">
                        &ldquo;{sec.pullQuote.text}&rdquo;
                      </p>
                      <footer className="text-xs font-mono-tech text-[#012CEB] font-semibold">
                        — {sec.pullQuote.context}
                      </footer>
                    </blockquote>
                  )}

                  {/* Technical Comparison Table */}
                  {sec.table && (
                    <div className="my-8 overflow-x-auto border-2 border-[#14100E] bg-[#F4EFE6] rounded-2xl shadow-[3px_3px_0_#14100E]">
                      <table className="w-full text-left border-collapse text-xs sm:text-sm">
                        <caption className="px-4 py-3 text-left text-xs font-mono-tech text-[#012CEB] font-semibold border-b border-[#14100E]/15 bg-[#E6DDD2]">
                          {sec.table.caption}
                        </caption>
                        <thead>
                          <tr className="border-b border-[#14100E]/15 text-[#14100E]">
                            {(sec.table.headers || []).map((header, hIdx) => (
                              <th key={hIdx} className="px-4 py-3 font-semibold whitespace-nowrap">
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#14100E]/10 font-mono-tech">
                          {(sec.table.rows || []).map((row, rIdx) => (
                            <tr key={rIdx} className="hover:bg-[#14100E]/[0.03]">
                              {row.map((cell, cIdx) => (
                                <td
                                  key={cIdx}
                                  className={`px-4 py-3.5 leading-relaxed ${
                                    cIdx === 0
                                      ? "text-[#012CEB] font-semibold whitespace-nowrap"
                                      : "text-[#14100E] font-sans"
                                  }`}
                                >
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Checklist */}
                  {sec.checklist && (
                    <div className="my-6 p-6 border-2 border-[#14100E] bg-[#F4EFE6] rounded-2xl shadow-[3px_3px_0_#14100E] space-y-4">
                      <p className="text-xs font-mono-tech text-[#012CEB] font-semibold">
                        ON-SET &amp; PREP VERIFICATION POINTS
                      </p>
                      <ul className="space-y-3 text-sm sm:text-base text-[#14100E]">
                        {sec.checklist.map((item, cIdx) => (
                          <li key={cIdx} className="flex items-start gap-3">
                            <span className="font-mono-tech text-xs text-[#012CEB] font-semibold mt-1 shrink-0">
                              0{cIdx + 1}.
                            </span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Inline Image */}
                  {sec.inlineImage && (
                    <figure className="my-8 space-y-2">
                      <div className="rounded-2xl overflow-hidden border-2 border-[#14100E] bg-[#14100E]/5 shadow-[3px_3px_0_#14100E]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={sec.inlineImage.src}
                          alt={sec.inlineImage.alt || "Diagram"}
                          className="w-full h-auto object-cover"
                        />
                      </div>
                      {sec.inlineImage.caption && (
                        <figcaption className="text-xs font-mono-tech text-[#6B625A] italic">
                          {sec.inlineImage.caption}
                        </figcaption>
                      )}
                    </figure>
                  )}
                </section>
              )))}

              {/* Author Bio Signoff */}
              <div className="pt-8 border-t-2 border-[#14100E] flex items-center gap-4 p-6 bg-[#F4EFE6] rounded-2xl">
                <div className="w-12 h-12 rounded-full bg-[#14100E] text-[#F4EDE4] flex items-center justify-center font-bold text-base">
                  AR
                </div>
                <div>
                  <h4 className="font-editorial text-base font-bold text-[#14100E]">
                    {formData.author?.name || "Anup Rawat"}
                  </h4>
                  <p className="text-xs font-mono-tech text-[#6B625A]">
                    {formData.author?.role || "Cinematographer"} · Writing for Field Notes Journal
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}

