"use client";

import React, { useState, useRef } from "react";
import { useBlogForm } from "../context/BlogFormProvider";
import BlogServices from "@/api/services/blog.services";
import {
  convertToWebP,
  fileToDataUrl,
  getImageDimensions,
} from "@/app/utils/imageConverter";
import {
  UploadCloud,
  Image as ImageIcon,
  AlertCircle,
  Maximize2,
  Trash2,
  CheckCircle2,
  Loader2,
  Layers,
  Sparkles,
} from "lucide-react";

const MAX_IMAGES = 10;

export default function Step2Media() {
  const { formData, errors, updateField } = useBlogForm();
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef(null);

  // Gallery images array (fallback to existing featuredImage if any)
  const gallery = Array.isArray(formData.galleryImages)
    ? formData.galleryImages
    : formData.featuredImage
    ? [
        {
          id: "initial-hero",
          url: formData.featuredImage,
          name: "Featured Image",
          alt: formData.featuredImageAlt || "",
        },
      ]
    : [];

  const activeImage =
    gallery.find((img) => img.url === formData.featuredImage) || gallery[0] || null;

  // Process selected or dropped image files using imageConverter.ts
  const handleFiles = async (filesList) => {
    if (!filesList || filesList.length === 0) return;
    setUploadError("");

    const currentCount = gallery.length;
    const incomingFiles = Array.from(filesList).filter((f) =>
      f.type.startsWith("image/")
    );

    if (incomingFiles.length === 0) {
      setUploadError("Please select valid image files (JPG, PNG, WebP, AVIF).");
      return;
    }

    if (currentCount >= MAX_IMAGES) {
      setUploadError(`Maximum limit of ${MAX_IMAGES} images already reached.`);
      return;
    }

    // Limit to remaining capacity up to 10
    const availableSlots = MAX_IMAGES - currentCount;
    const filesToProcess = incomingFiles.slice(0, availableSlots);

    if (incomingFiles.length > availableSlots) {
      setUploadError(
        `Only ${availableSlots} more image(s) allowed. Excess images were omitted.`
      );
    }

    setIsProcessing(true);

    try {
      const processedImages = [];

      for (let i = 0; i < filesToProcess.length; i++) {
        const file = filesToProcess[i];
        setProcessingStatus(
          `Converting & optimizing ${i + 1}/${filesToProcess.length}: ${file.name}...`
        );

        // 1. Convert to WebP using imageConverter.ts
        const webpFile = await convertToWebP(file, 0.88, 2000, 2000);

        // 2. Read into Data URL for immediate zero-latency local preview and persistence
        const dataUrl = await fileToDataUrl(webpFile);

        // 3. Extract dimensions via imageConverter.ts
        let dimensions = null;
        try {
          dimensions = await getImageDimensions(webpFile);
        } catch {
          // ignore dimension calculation failure
        }

        const sizeKb = Math.round(webpFile.size / 1024);

        // Upload to Backend Image API with local preview fallback
        let targetUrl = dataUrl;
        let remoteFileId = null;
        try {
          setProcessingStatus(`Uploading ${file.name} to media server...`);
          const uploadRes = await BlogServices.uploadMedia(webpFile);
          if (uploadRes?.data?.url) {
            targetUrl = uploadRes.data.url;
            remoteFileId = uploadRes.data.fileId || null;
          }
        } catch (apiErr) {
          console.warn("Media upload API notice (using local conversion):", apiErr.message);
        }

        processedImages.push({
          id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          url: targetUrl,
          fileId: remoteFileId,
          name: webpFile.name,
          size: `${sizeKb} KB`,
          width: dimensions?.width,
          height: dimensions?.height,
          aspectRatio: dimensions?.aspectRatio
            ? dimensions.aspectRatio.toFixed(2)
            : null,
        });
      }

      const updatedGallery = [...gallery, ...processedImages];
      updateField("galleryImages", updatedGallery);

      // If no featured image set yet, set the first newly added image as featured
      if (!formData.featuredImage && updatedGallery.length > 0) {
        updateField("featuredImage", updatedGallery[0].url);
        if (updatedGallery[0].fileId) {
          updateField("featuredImageFileId", updatedGallery[0].fileId);
        }
        if (!formData.featuredImageAlt) {
          updateField("featuredImageAlt", updatedGallery[0].name.replace(/\.[^/.]+$/, ""));
        }
      }
    } catch (err) {
      console.error("Image processing error:", err);
      setUploadError(`Failed to process image: ${err.message}`);
    } finally {
      setIsProcessing(false);
      setProcessingStatus("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const setAsPrimaryHero = (img) => {
    updateField("featuredImage", img.url);
    if (img.fileId) {
      updateField("featuredImageFileId", img.fileId);
    }
  };

  const removeImage = (idToRemove) => {
    const remaining = gallery.filter((img) => img.id !== idToRemove);
    updateField("galleryImages", remaining);

    // If removed image was the active featured image, reassign to next available
    const removedImg = gallery.find((img) => img.id === idToRemove);
    if (removedImg && formData.featuredImage === removedImg.url) {
      updateField("featuredImage", remaining.length > 0 ? remaining[0].url : "");
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Editorial Header Card */}
      <div className="border-2 border-[#14100E] bg-[#F4EFE6] p-6 rounded-2xl shadow-[3px_3px_0_#14100E] space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono-tech text-[#012CEB] font-semibold">
          <ImageIcon className="w-4 h-4" />
          <span>STEP 02 // HERO ASSET &amp; CINEMATIC MEDIA</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-editorial font-bold text-[#14100E]">
          Featured Key Visual &amp; Media Gallery
        </h2>
        <p className="text-xs sm:text-sm text-[#6B625A]">
          Upload multiple images (up to 10 max). Files are automatically optimized and converted to WebP using client-side conversion.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Upload Zone & Gallery */}
        <div className="lg:col-span-7 space-y-6 border-2 border-[#14100E] bg-[#F4EFE6] p-6 sm:p-8 rounded-2xl shadow-[3px_3px_0_#14100E]">
          {/* Header with counter */}
          <div className="flex items-center justify-between border-b border-[#14100E]/15 pb-3">
            <div className="flex items-center gap-2 text-xs font-mono-tech uppercase font-bold text-[#14100E]">
              <Layers className="w-4 h-4 text-[#012CEB]" />
              <span>Article Images ({gallery.length}/{MAX_IMAGES})</span>
            </div>
            <span className="text-[10px] font-mono-tech bg-[#14100E] text-[#F4EDE4] px-2 py-0.5 rounded">
              Max 10 Images
            </span>
          </div>

          {/* Drag & Drop Upload Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => {
              if (!isProcessing && gallery.length < MAX_IMAGES) {
                fileInputRef.current?.click();
              }
            }}
            className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all ${
              gallery.length >= MAX_IMAGES
                ? "border-[#14100E]/20 bg-[#E6DDD2]/40 opacity-70 cursor-not-allowed"
                : dragActive
                ? "border-[#012CEB] bg-[#012CEB]/10 cursor-pointer scale-[1.01]"
                : "border-[#14100E] bg-white hover:bg-[#E6DDD2]/40 cursor-pointer"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleFiles(e.target.files)}
              disabled={isProcessing || gallery.length >= MAX_IMAGES}
              className="hidden"
            />

            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#012CEB]/10 border border-[#012CEB]/30 flex items-center justify-center text-[#012CEB]">
                {isProcessing ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <UploadCloud className="w-6 h-6" />
                )}
              </div>

              {isProcessing ? (
                <div className="space-y-1">
                  <p className="text-xs font-mono-tech font-bold text-[#012CEB]">
                    Optimizing via imageConverter.ts...
                  </p>
                  <p className="text-[11px] font-mono-tech text-[#6B625A]">
                    {processingStatus}
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm font-sans font-bold text-[#14100E]">
                    {gallery.length >= MAX_IMAGES
                      ? "Maximum 10 images reached"
                      : "Drag & drop images here or click to browse"}
                  </p>
                  <p className="text-[11px] font-mono-tech text-[#6B625A]">
                    Supports JPG, PNG, WebP, AVIF &bull; Auto-converted to high-res WebP
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Error Message */}
          {(uploadError || errors.featuredImage) && (
            <p className="text-xs font-mono-tech text-red-600 flex items-center gap-1.5 p-3 rounded-lg bg-red-50 border border-red-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{uploadError || errors.featuredImage}</span>
            </p>
          )}

          {/* Uploaded Images Gallery Grid */}
          {gallery.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-[#14100E]/15">
              <div className="flex items-center justify-between text-xs font-mono-tech text-[#6B625A]">
                <span>Click an image to set as Primary Hero</span>
                <span>{gallery.length} / {MAX_IMAGES} uploaded</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {gallery.map((img, idx) => {
                  const isHero = formData.featuredImage === img.url;

                  return (
                    <div
                      key={img.id || idx}
                      onClick={() => setAsPrimaryHero(img)}
                      className={`group relative aspect-[16/9] rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                        isHero
                          ? "border-[#012CEB] ring-2 ring-[#012CEB] shadow-md"
                          : "border-[#14100E] hover:border-[#012CEB]/60"
                      }`}
                    >
                      {/* Thumbnail */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.url}
                        alt={img.name || `Image ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />

                      {/* Primary Hero Badge */}
                      {isHero ? (
                        <span className="absolute top-1.5 left-1.5 bg-[#012CEB] text-white text-[9px] font-mono-tech font-bold px-1.5 py-0.5 rounded shadow flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          <span>Hero</span>
                        </span>
                      ) : (
                        <span className="absolute top-1.5 left-1.5 bg-[#14100E]/70 text-[#F4EDE4] text-[9px] font-mono-tech px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                          Set Hero
                        </span>
                      )}

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage(img.id);
                        }}
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-md bg-red-600 hover:bg-red-700 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                        title="Delete image"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      {/* File Details bar */}
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-1.5 pt-4 text-[9px] font-mono-tech text-white truncate">
                        <span className="truncate block">{img.name || `Shot ${idx + 1}`}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Descriptive Alt Text & Caption */}
          <div className="space-y-1.5 pt-2 border-t border-[#14100E]/15">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono-tech uppercase font-bold text-[#14100E] flex items-center gap-1.5">
                <span>Descriptive Alt Text &amp; Caption</span>
                <span className="text-red-600">*</span>
              </label>
              <span className="text-[10px] font-mono-tech text-[#8C8278]">
                {(formData.featuredImageAlt || "").length} chars
              </span>
            </div>
            <textarea
              rows={3}
              value={formData.featuredImageAlt || ""}
              onChange={(e) => updateField("featuredImageAlt", e.target.value)}
              placeholder="Chiaroscuro lighting diagram showing a warm tungsten key lamp, architectural window, and negative fill frame shaping shadow falloff across subject."
              className={`w-full px-4 py-2.5 rounded-xl border-2 bg-white text-xs text-[#14100E] placeholder:text-[#8C8278] focus:outline-none leading-relaxed transition-all ${
                errors.featuredImageAlt
                  ? "border-red-500"
                  : "border-[#14100E] focus:border-[#012CEB]"
              }`}
            />
            {errors.featuredImageAlt ? (
              <p className="text-xs font-mono-tech text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errors.featuredImageAlt}</span>
              </p>
            ) : (
              <p className="text-[11px] font-mono-tech text-[#6B625A]">
                Accessible for screen readers and serves as the figure caption beneath the hero frame on the public journal page.
              </p>
            )}
          </div>
        </div>

        {/* Right Preview Frame */}
        <div className="lg:col-span-5 space-y-3">
          <div className="border-2 border-[#14100E] bg-[#F4EFE6] p-4 rounded-2xl shadow-[3px_3px_0_#14100E] space-y-3">
            <div className="flex items-center justify-between text-xs font-mono-tech text-[#012CEB] font-semibold">
              <span className="flex items-center gap-1.5">
                <Maximize2 className="w-3.5 h-3.5" />
                <span>16:9 CINEMATIC HERO PREVIEW</span>
              </span>
              <span className="text-[10px] bg-[#14100E] text-[#F4EDE4] px-2 py-0.5 rounded font-mono-tech">
                {activeImage?.width ? `${activeImage.width}×${activeImage.height}` : "2.39:1 / 16:9"}
              </span>
            </div>

            {/* Media wrapper matching CinematicMedia in public blog */}
            <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden border-2 border-[#14100E] bg-[#14100E]/10 flex items-center justify-center">
              {formData.featuredImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={formData.featuredImage}
                  alt={formData.featuredImageAlt || "Hero visual"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-4 space-y-2">
                  <ImageIcon className="w-10 h-10 text-[#8C8278] mx-auto" />
                  <p className="text-xs font-mono-tech text-[#6B625A]">
                    No image uploaded yet
                  </p>
                </div>
              )}
            </div>

            {/* Telemetry info */}
            {activeImage && (
              <div className="px-3 py-2 rounded-lg bg-[#EAE2D7] border border-[#14100E]/15 flex items-center justify-between text-[10px] font-mono-tech text-[#6B625A]">
                <div className="flex items-center gap-2 truncate">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  <span className="font-bold text-[#14100E] uppercase">WEBP FORMAT</span>
                  {activeImage.size && <span>&bull; {activeImage.size}</span>}
                </div>
                {activeImage.aspectRatio && (
                  <span className="font-semibold text-[#012CEB]">
                    Ratio: {activeImage.aspectRatio}:1
                  </span>
                )}
              </div>
            )}

            {/* Caption rendering matching public blog */}
            <div className="p-3 rounded-lg bg-[#E6DDD2]/60 border border-[#14100E]/15">
              <p className="text-[11px] font-mono-tech text-[#6B625A] leading-relaxed italic">
                {formData.featuredImageAlt || "Figure caption appears here in public view."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
