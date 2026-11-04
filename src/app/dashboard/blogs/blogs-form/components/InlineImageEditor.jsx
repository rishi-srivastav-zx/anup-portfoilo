"use client";

import React, { useState } from "react";
import { Image as ImageIcon, Trash2 } from "lucide-react";

export default function InlineImageEditor({
  sectionIndex,
  inlineImage,
  onUpdateInlineImage,
  onRemove,
}) {
  const [imgErr, setImgErr] = useState(false);
  if (!inlineImage) return null;

  return (
    <div className="p-4 sm:p-5 rounded-xl border-2 border-[#14100E]/20 bg-[#E6DDD2]/40 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-mono-tech uppercase font-bold text-[#14100E]">
          <ImageIcon className="w-4 h-4 text-[#012CEB]" />
          <span>INLINE TECHNICAL DIAGRAM / IMAGE</span>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="p-1 text-[#8C8278] hover:text-red-600 transition-colors"
          title="Remove inline image"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-[10px] font-mono-tech uppercase text-[#6B625A]">
              Image Source Path / URL
            </label>
            <input
              type="text"
              value={inlineImage.src || ""}
              onChange={(e) => {
                onUpdateInlineImage(sectionIndex, "src", e.target.value);
                setImgErr(false);
              }}
              placeholder="/images/anamorphic-lens-geometry.svg"
              className="w-full px-3 py-1.5 rounded-lg border border-[#14100E]/30 bg-white text-xs font-mono-tech text-[#14100E] focus:outline-none focus:border-[#012CEB]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono-tech uppercase text-[#6B625A]">
              Descriptive Alt Text
            </label>
            <input
              type="text"
              value={inlineImage.alt || ""}
              onChange={(e) => onUpdateInlineImage(sectionIndex, "alt", e.target.value)}
              placeholder="Technical optical raytrace diagram"
              className="w-full px-3 py-1.5 rounded-lg border border-[#14100E]/30 bg-white text-xs text-[#14100E] focus:outline-none focus:border-[#012CEB]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono-tech uppercase text-[#6B625A]">
              Caption
            </label>
            <input
              type="text"
              value={inlineImage.caption || ""}
              onChange={(e) => onUpdateInlineImage(sectionIndex, "caption", e.target.value)}
              placeholder="Fig 2.2: Optical axis alignment and horizontal squeeze factor."
              className="w-full px-3 py-1.5 rounded-lg border border-[#14100E]/30 bg-white text-xs text-[#14100E] focus:outline-none focus:border-[#012CEB]"
            />
          </div>
        </div>

        {/* Thumbnail Preview */}
        <div className="rounded-xl border border-[#14100E]/30 bg-[#14100E]/5 overflow-hidden flex flex-col items-center justify-center p-2 min-h-[120px]">
          {inlineImage.src && !imgErr ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={inlineImage.src}
              alt={inlineImage.alt || "Diagram"}
              onError={() => setImgErr(true)}
              className="max-h-[140px] w-full object-contain"
            />
          ) : (
            <div className="text-center p-3 text-xs font-mono-tech text-[#8C8278]">
              {imgErr ? "Failed to render image path" : "Image preview"}
            </div>
          )}
          {inlineImage.caption && (
            <p className="text-[10px] font-mono-tech text-[#6B625A] italic text-center mt-2 px-2">
              {inlineImage.caption}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

