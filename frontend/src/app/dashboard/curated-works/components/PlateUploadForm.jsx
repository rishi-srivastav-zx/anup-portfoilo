"use client";

import React from "react";
import Image from "next/image";
import { Image as ImageIcon, Plus, X, UploadCloud, CheckCircle2, AlertCircle } from "lucide-react";
import { PLATE_FIELDS, MAX_PLATES, ACCEPTED_EXTENSIONS } from "../config/curatedWorksConfig";
import { useCuratedWorks } from "../provider/CuratedWorksProvider";

export default function PlateUploadForm() {
    const {
        plates,
        uploading,
        errorMsg,
        successMsg,
        selectedFile,
        filePreview,
        title,
        place,
        description,
        fileInputRef,
        setTitle,
        setPlace,
        setDescription,
        handleFileSelect,
        clearSelectedFile,
        handleSubmitPlate,
    } = useCuratedWorks();

    const isAtCapacity = plates.length >= MAX_PLATES;

    return (
        <div className="p-5 rounded-2xl bg-[#F4EDE4] border border-[#D6CDC2] space-y-4 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#14100E] border-b border-[#D6CDC2]/60 pb-3">
                <UploadCloud className="w-4 h-4 text-[#8C8278]" />
                <span>Add New Plate (Converts to WebP)</span>
            </div>

            {errorMsg && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2 text-xs text-red-700">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{errorMsg}</span>
                </div>
            )}

            {successMsg && (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-xs text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>{successMsg}</span>
                </div>
            )}

            <form onSubmit={handleSubmitPlate} className="grid grid-cols-1 md:grid-cols-12 gap-5">
                {/* Left: File Dropzone */}
                <div className="md:col-span-5 flex flex-col">
                    <label className="block text-[11px] font-mono uppercase text-[#6B625A] mb-1.5">
                        {PLATE_FIELDS.image.label} <span className="text-red-600">*</span>
                    </label>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept={ACCEPTED_EXTENSIONS.join(",")}
                        onChange={(e) => handleFileSelect(e.target.files?.[0])}
                        className="hidden"
                        id="plate-file-upload"
                        disabled={uploading || isAtCapacity}
                    />

                    {filePreview ? (
                        <div className="relative w-full h-48 rounded-xl border border-[#D6CDC2] bg-[#EAE2D7] overflow-hidden flex items-center justify-center group">
                            <img
                                src={filePreview}
                                alt="Preview"
                                className="w-full h-full object-contain"
                            />
                            <button
                                type="button"
                                onClick={clearSelectedFile}
                                className="absolute top-2 right-2 p-1 rounded-full bg-[#14100E]/80 text-[#F4EDE4] hover:bg-[#14100E] transition-colors"
                                title="Remove image"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    ) : (
                        <label
                            htmlFor="plate-file-upload"
                            className={`flex-1 min-h-[190px] rounded-xl border-2 border-dashed border-[#D6CDC2] hover:border-[#14100E] bg-[#EAE2D7]/40 hover:bg-[#EAE2D7] flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-colors ${
                                isAtCapacity ? "opacity-50 cursor-not-allowed pointer-events-none" : ""
                            }`}
                        >
                            <div className="p-2.5 rounded-full bg-[#D6CDC2]/50 text-[#8C8278] mb-2">
                                <ImageIcon className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-semibold text-[#14100E]">
                                Click to browse image
                            </span>
                            <span className="text-[10px] text-[#8C8278] font-mono mt-1">
                                PNG, JPG, JPEG, WEBP, AVIF up to 20MB
                            </span>
                        </label>
                    )}
                </div>

                {/* Right: Metadata Inputs */}
                <div className="md:col-span-7 flex flex-col justify-between space-y-3.5">
                    <div>
                        <label className="block text-[11px] font-mono uppercase text-[#6B625A] mb-1">
                            {PLATE_FIELDS.title.label} <span className="text-red-600">*</span>
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder={PLATE_FIELDS.title.placeholder}
                            disabled={uploading || isAtCapacity}
                            className="w-full px-3 py-2 text-xs bg-[#EAE2D7] border border-[#D6CDC2] rounded-lg text-[#14100E] placeholder-[#8C8278] focus:outline-none focus:border-[#14100E] transition-colors"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-[11px] font-mono uppercase text-[#6B625A] mb-1">
                            {PLATE_FIELDS.place.label}
                        </label>
                        <input
                            type="text"
                            value={place}
                            onChange={(e) => setPlace(e.target.value)}
                            placeholder={PLATE_FIELDS.place.placeholder}
                            disabled={uploading || isAtCapacity}
                            className="w-full px-3 py-2 text-xs bg-[#EAE2D7] border border-[#D6CDC2] rounded-lg text-[#14100E] placeholder-[#8C8278] focus:outline-none focus:border-[#14100E] transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-[11px] font-mono uppercase text-[#6B625A] mb-1">
                            {PLATE_FIELDS.description.label}
                        </label>
                        <textarea
                            rows={2}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder={PLATE_FIELDS.description.placeholder}
                            disabled={uploading || isAtCapacity}
                            className="w-full px-3 py-2 text-xs bg-[#EAE2D7] border border-[#D6CDC2] rounded-lg text-[#14100E] placeholder-[#8C8278] focus:outline-none focus:border-[#14100E] transition-colors resize-none"
                        />
                    </div>

                    <div className="pt-1">
                        <button
                            type="submit"
                            disabled={uploading || isAtCapacity || !selectedFile}
                            className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-[#635B54] hover:bg-[#14100E] text-[#F4EDE4] text-xs font-mono uppercase tracking-wider font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <Plus className="w-4 h-4" />
                            <span>
                                {uploading ? "CONVERTING & SAVING..." : "+ SAVE PLATE TO INFINITE PAGES"}
                            </span>
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}

