"use client";

import React from "react";
import Link from "next/link";
import {
  Edit,
  ExternalLink,
  Trash2,
  Star,
  Clock,
  Calendar,
  Layers,
  Sparkles,
} from "lucide-react";

export default function BlogTable({
  articles = [],
  onToggleStatus,
  onToggleFeatured,
  onRequestDelete,
}) {
  return (
    <div className="border-2 border-[#14100E] bg-[#F4EFE6] rounded-2xl shadow-[3px_3px_0_#14100E] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[850px] text-left border-collapse text-xs">
          <thead>
            <tr className="border-b-2 border-[#14100E] bg-[#E6DDD2] text-[#14100E] font-mono-tech uppercase">
              <th className="py-3 px-4 min-w-[280px]">Article &amp; Taxonomy</th>
              <th className="py-3 px-4 min-w-[140px]">Category &amp; Tags</th>
              <th className="py-3 px-4 min-w-[130px]">Author &amp; Meta</th>
              <th className="py-3 px-4 min-w-[110px] text-center">Featured</th>
              <th className="py-3 px-4 min-w-[120px] text-center">Status</th>
              <th className="py-3 px-4 min-w-[140px] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#14100E]/15">
            {articles.map((article) => {
              const isPublished = article.status === "published";
              const isFeatured = Boolean(article.isFeatured);
              const sectionCount = (article.sections || []).length;

              return (
                <tr
                  key={article.id}
                  className="hover:bg-[#14100E]/[0.03] transition-colors"
                >
                  {/* Article & Taxonomy */}
                  <td className="py-4 px-4">
                    <div className="flex items-start gap-3">
                      {/* Thumbnail frame */}
                      <div className="w-16 h-11 rounded-lg border border-[#14100E]/20 bg-[#14100E]/10 overflow-hidden shrink-0 relative">
                        {article.featuredImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={article.featuredImage}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[9px] font-mono-tech text-[#8C8278]">
                            NO IMG
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/dashboard/blogs/blogs-form?edit=${article.id}`}
                          className="font-editorial text-sm sm:text-base font-bold text-[#14100E] hover:text-[#012CEB] transition-colors line-clamp-1"
                        >
                          {article.title || "Untitled Article"}
                        </Link>
                        <p className="text-[11px] text-[#6B625A] line-clamp-1 mt-0.5">
                          {article.excerpt}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-[10px] font-mono-tech text-[#8C8278]">
                          <span className="text-[#012CEB]">/blog/{article.slug}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Layers className="w-3 h-3" />
                            {sectionCount} section{sectionCount !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Category & Tags */}
                  <td className="py-4 px-4">
                    <div className="space-y-1">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono-tech font-bold bg-[#E6DDD2] text-[#012CEB] border border-[#14100E]/10">
                        {article.category}
                      </span>
                      {article.tags && article.tags.length > 0 && (
                        <div className="text-[10px] font-mono-tech text-[#8C8278] truncate max-w-[140px]">
                          #{article.tags.slice(0, 2).join(" #")}
                          {article.tags.length > 2 ? "..." : ""}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Author & Meta */}
                  <td className="py-4 px-4">
                    <div className="space-y-0.5 font-mono-tech text-[11px]">
                      <div className="font-semibold text-[#14100E]">
                        {article.author?.name || "Anup Rawat"}
                      </div>
                      <div className="text-[#6B625A] flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{article.readingTime || "5 min read"}</span>
                      </div>
                      <div className="text-[#8C8278] text-[10px] flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{article.publishedAt || "—"}</span>
                      </div>
                    </div>
                  </td>

                  {/* Featured Toggle */}
                  <td className="py-4 px-4 text-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onToggleFeatured(article);
                      }}
                      className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                        isFeatured
                          ? "bg-[#012CEB]/10 border-[#012CEB] text-[#012CEB]"
                          : "border-transparent text-[#8C8278] hover:text-[#14100E] hover:bg-black/5"
                      }`}
                      title={isFeatured ? "Featured Lead (Click to demote)" : "Click to feature as lead"}
                    >
                      <Star
                        className={`w-4 h-4 ${isFeatured ? "fill-[#012CEB]" : ""}`}
                      />
                    </button>
                  </td>

                  {/* Status Toggle */}
                  <td className="py-4 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => onToggleStatus(article.id)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-mono-tech uppercase font-bold border transition-all cursor-pointer ${
                        isPublished
                          ? "bg-emerald-100 text-emerald-900 border-emerald-300 hover:bg-emerald-200"
                          : "bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200"
                      }`}
                      title="Click to toggle status (Draft <-> Published)"
                    >
                      {article.status || "draft"}
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* View live public journal */}
                      <Link
                        href={`/blog/${article.slug}`}
                        target="_blank"
                        className="p-1.5 rounded-lg border border-[#14100E]/20 bg-white hover:bg-[#14100E] text-[#14100E] hover:text-[#F4EDE4] transition-colors"
                        title="View on public journal"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>

                      {/* Edit article */}
                      <Link
                        href={`/dashboard/blogs/blogs-form?edit=${article.id}`}
                        className="p-1.5 rounded-lg border border-[#14100E]/20 bg-white hover:bg-[#012CEB] text-[#14100E] hover:text-white transition-colors"
                        title="Edit article"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Link>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onRequestDelete(article);
                        }}
                        className="p-1.5 rounded-lg border border-[#14100E]/20 bg-white hover:bg-red-50 text-[#8C8278] hover:text-red-700 transition-colors cursor-pointer"
                        title="Delete article"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

