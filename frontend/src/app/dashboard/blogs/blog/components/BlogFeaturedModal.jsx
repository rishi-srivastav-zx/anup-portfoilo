"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Star, X, Sparkles, Loader2 } from "lucide-react";

export default function BlogFeaturedModal({
  article,
  isOpen,
  onClose,
  onConfirm,
  isSubmitting = false,
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen || !article || !mounted) return null;

  const isAlreadyFeatured = Boolean(article.isFeatured);

  const modalContent = (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md p-6 bg-[#F4EFE6] border-2 border-[#14100E] rounded-2xl shadow-[6px_6px_0_#14100E] space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[#8C8278] hover:text-[#14100E] hover:bg-black/5 transition-colors disabled:opacity-50 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 shadow-xs ${
              isAlreadyFeatured
                ? "bg-amber-100 border-amber-300 text-amber-700"
                : "bg-[#012CEB]/10 border-[#012CEB]/30 text-[#012CEB]"
            }`}
          >
            <Star
              className={`w-5 h-5 ${isAlreadyFeatured ? "fill-amber-600 text-amber-600" : "fill-[#012CEB] text-[#012CEB]"}`}
            />
          </div>
          <div>
            <h3 className="font-editorial text-lg font-bold text-[#14100E]">
              {isAlreadyFeatured ? "Remove from Featured Lead" : "Set as Featured Lead"}
            </h3>
            <span
              className={`text-[10px] font-mono-tech uppercase font-bold tracking-wider ${
                isAlreadyFeatured ? "text-amber-800" : "text-[#012CEB]"
              }`}
            >
              {isAlreadyFeatured ? "DEMOTE FROM TOP HERO" : "EXCLUSIVE HERO SPOTLIGHT"}
            </span>
          </div>
        </div>

        <p className="text-xs text-[#4A423B] leading-relaxed">
          {isAlreadyFeatured ? (
            <>
              Are you sure you want to remove{" "}
              <strong className="text-[#14100E]">&quot;{article.title}&quot;</strong> from
              featured status?
              <br />
              The public journal top hero will return to the default overview plate until another
              article is featured.
            </>
          ) : (
            <>
              Are you sure you want to feature{" "}
              <strong className="text-[#14100E]">&quot;{article.title}&quot;</strong>?
              <br />
              <span className="text-[#012CEB] font-bold">
                Note: Only one article can be featured at a time.
              </span>{" "}
              This will place this essay at the top hero of your journal landing page and remove
              featured status from any other article.
            </>
          )}
        </p>

        <div className="p-3 rounded-lg border border-[#14100E]/20 bg-[#E6DDD2]/60 text-[11px] font-mono-tech text-[#6B625A] flex items-center justify-between">
          <span className="truncate max-w-[260px] font-semibold text-[#14100E]">
            /blog/{article.slug}
          </span>
          <span className="uppercase text-[10px] font-bold text-[#14100E] px-2 py-0.5 rounded bg-white/70 border border-[#14100E]/15">
            {article.category || "General"}
          </span>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl border border-[#14100E]/20 bg-white hover:bg-black/5 text-xs font-mono-tech font-semibold text-[#14100E] transition-colors disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(article.id)}
            disabled={isSubmitting}
            className={`px-4 py-2 rounded-xl text-white text-xs font-mono-tech font-bold transition-all inline-flex items-center gap-1.5 shadow-[2px_2px_0_#14100E] cursor-pointer disabled:opacity-60 ${
              isAlreadyFeatured
                ? "bg-[#14100E] hover:bg-black"
                : "bg-[#012CEB] hover:bg-[#0022b8]"
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Updating...</span>
              </>
            ) : isAlreadyFeatured ? (
              <>
                <Star className="w-3.5 h-3.5" />
                <span>Yes, Remove</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Yes, Set as Featured</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
