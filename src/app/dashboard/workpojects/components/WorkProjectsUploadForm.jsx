"use client";

import React from "react";
import {
    Video,
    UploadCloud,
    X,
    CheckCircle2,
    AlertCircle,
    Camera,
    Sliders,
    Tag,
    Clock,
    Plus,
} from "lucide-react";
import {
    DEFAULT_FLOATING_TAGS,
    CAMERA_OPTIONS,
    LENS_OPTIONS,
    RATIO_OPTIONS,
    WORK_PROJECT_FIELDS,
} from "../config/workProjectsConfig";
import { useWorkProjects } from "../provider/WorkProjectsProvider";

export default function WorkProjectsUploadForm() {
    const {
        submitting,
        uploadProgress,
        errorMsg,
        successMsg,
        title,
        floatingTag,
        customTag,
        stationName,
        client,
        summary,
        camera,
        lens,
        formatRatio,
        isFeatured,
        selectedVideo,
        videoPreviewUrl,
        videoMetadata,
        capturedThumbnailUrl,
        customThumbnailFile,
        isCapturingFrame,
        fileInputRef,
        setTitle,
        setFloatingTag,
        setCustomTag,
        setStationName,
        setClient,
        setSummary,
        setCamera,
        setLens,
        setFormatRatio,
        setIsFeatured,
        setCustomThumbnailFile,
        handleVideoSelect,
        clearSelectedVideo,
        handleSubmitProject,
    } = useWorkProjects();

    return (
        <div className="p-5 rounded-2xl bg-[#F4EDE4] border border-[#D6CDC2] space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#D6CDC2]/60 pb-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#14100E]">
                    <UploadCloud className="w-4 h-4 text-[#8C8278]" />
                    <span>Upload New Video Project</span>
                </div>
                <span className="text-[10px] font-mono text-[#8C8278]">
                    Max 80MB • MP4 / WebM / QuickTime
                </span>
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

            {/* Upload Progress */}
            {submitting && (
                <div className="space-y-1.5 p-3 rounded-xl bg-[#EAE2D7] border border-[#D6CDC2]">
                    <div className="flex justify-between text-xs font-mono text-[#14100E]">
                        <span>Uploading Video File...</span>
                        <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#D6CDC2] overflow-hidden">
                        <div
                            className="h-full bg-[#14100E] transition-all duration-200"
                            style={{ width: `${uploadProgress}%` }}
                        />
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmitProject} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                    {/* Left: Video Dropzone & Thumbnail */}
                    <div className="md:col-span-5 space-y-3">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="video/mp4,video/webm,video/quicktime,video/x-matroska"
                            onChange={handleVideoSelect}
                            className="hidden"
                            id="video-file-upload"
                            disabled={submitting}
                        />

                        {videoPreviewUrl ? (
                            <div className="relative rounded-xl border border-[#D6CDC2] bg-[#14100E] overflow-hidden aspect-video flex items-center justify-center group">
                                <video
                                    src={videoPreviewUrl}
                                    className="w-full h-full object-contain"
                                    controls
                                />
                                <button
                                    type="button"
                                    onClick={clearSelectedVideo}
                                    disabled={submitting}
                                    className="absolute top-2 right-2 p-1 rounded-full bg-[#14100E]/80 text-[#F4EDE4] hover:bg-red-600 transition-colors"
                                    title="Remove video"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ) : (
                            <label
                                htmlFor="video-file-upload"
                                className="w-full aspect-video rounded-xl border-2 border-dashed border-[#D6CDC2] hover:border-[#14100E] bg-[#EAE2D7]/40 hover:bg-[#EAE2D7] flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-colors"
                            >
                                <div className="p-3 rounded-full bg-[#D6CDC2]/50 text-[#8C8278] mb-2">
                                    <Video className="w-7 h-7" />
                                </div>
                                <span className="text-xs font-semibold text-[#14100E]">
                                    Click to select video
                                </span>
                                <span className="text-[10px] text-[#8C8278] font-mono mt-1">
                                    Up to 80MB • WebM / MP4 / MOV
                                </span>
                            </label>
                        )}

                        {/* Video Metadata Chip */}
                        {videoMetadata && (
                            <div className="p-2.5 rounded-lg bg-[#EAE2D7] border border-[#D6CDC2] text-[11px] font-mono text-[#6B625A] flex items-center justify-between">
                                <span>{videoMetadata.resolution || "HD"}</span>
                                <span>{videoMetadata.duration ? `${Math.round(videoMetadata.duration)}s` : ""}</span>
                                <span>{(videoMetadata.size / (1024 * 1024)).toFixed(1)} MB</span>
                            </div>
                        )}

                        {/* Thumbnail Preview / Custom Upload */}
                        {selectedVideo && (
                            <div className="p-3 rounded-xl bg-[#EAE2D7] border border-[#D6CDC2] space-y-2">
                                <span className="text-[10px] font-mono uppercase text-[#8C8278] block">
                                    Poster Thumbnail Frame
                                </span>
                                <div className="flex items-center gap-3">
                                    {capturedThumbnailUrl && (
                                        <div className="w-20 h-12 rounded border border-[#D6CDC2] overflow-hidden shrink-0 bg-black">
                                            <img
                                                src={capturedThumbnailUrl}
                                                alt="Captured frame"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    )}
                                    <div className="text-[10px] text-[#6B625A] flex-1">
                                        <span>
                                            {isCapturingFrame
                                                ? "Extracting frame..."
                                                : "Auto-captured 1.0s poster frame"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right: Metadata Inputs */}
                    <div className="md:col-span-7 space-y-3.5">
                        <div>
                            <label className="block text-[11px] font-mono uppercase text-[#6B625A] mb-1">
                                {WORK_PROJECT_FIELDS.title.label} <span className="text-red-600">*</span>
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder={WORK_PROJECT_FIELDS.title.placeholder}
                                disabled={submitting}
                                className="w-full px-3 py-2 text-xs bg-[#EAE2D7] border border-[#D6CDC2] rounded-lg text-[#14100E] placeholder-[#8C8278] focus:outline-none focus:border-[#14100E]"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[11px] font-mono uppercase text-[#6B625A] mb-1">
                                    {WORK_PROJECT_FIELDS.client.label}
                                </label>
                                <input
                                    type="text"
                                    value={client}
                                    onChange={(e) => setClient(e.target.value)}
                                    placeholder={WORK_PROJECT_FIELDS.client.placeholder}
                                    disabled={submitting}
                                    className="w-full px-3 py-2 text-xs bg-[#EAE2D7] border border-[#D6CDC2] rounded-lg text-[#14100E] placeholder-[#8C8278] focus:outline-none focus:border-[#14100E]"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-mono uppercase text-[#6B625A] mb-1">
                                    {WORK_PROJECT_FIELDS.stationName.label}
                                </label>
                                <input
                                    type="text"
                                    value={stationName}
                                    onChange={(e) => setStationName(e.target.value)}
                                    placeholder={WORK_PROJECT_FIELDS.stationName.placeholder}
                                    disabled={submitting}
                                    className="w-full px-3 py-2 text-xs bg-[#EAE2D7] border border-[#D6CDC2] rounded-lg text-[#14100E] placeholder-[#8C8278] focus:outline-none focus:border-[#14100E]"
                                />
                            </div>
                        </div>

                        {/* Floating Tag Selector */}
                        <div>
                            <label className="block text-[11px] font-mono uppercase text-[#6B625A] mb-1.5">
                                Primary Category Tag
                            </label>
                            <div className="flex flex-wrap gap-1.5">
                                {DEFAULT_FLOATING_TAGS.map((tag) => {
                                    const isSel = floatingTag === tag && !customTag;
                                    return (
                                        <button
                                            key={tag}
                                            type="button"
                                            onClick={() => {
                                                setFloatingTag(tag);
                                                setCustomTag("");
                                            }}
                                            className={`px-2.5 py-1 text-[10px] font-mono font-semibold rounded-md border transition-colors ${
                                                isSel
                                                    ? "bg-[#14100E] text-[#F4EDE4] border-[#14100E]"
                                                    : "bg-[#EAE2D7] text-[#6B625A] border-[#D6CDC2] hover:text-[#14100E]"
                                            }`}
                                        >
                                            {tag}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Technical Package Details */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                                <label className="block text-[10px] font-mono uppercase text-[#6B625A] mb-1">
                                    Camera
                                </label>
                                <select
                                    value={camera}
                                    onChange={(e) => setCamera(e.target.value)}
                                    className="w-full px-2.5 py-1.5 text-xs bg-[#EAE2D7] border border-[#D6CDC2] rounded-lg text-[#14100E] focus:outline-none"
                                >
                                    {CAMERA_OPTIONS.map((c) => (
                                        <option key={c} value={c}>
                                            {c}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-mono uppercase text-[#6B625A] mb-1">
                                    Glass
                                </label>
                                <select
                                    value={lens}
                                    onChange={(e) => setLens(e.target.value)}
                                    className="w-full px-2.5 py-1.5 text-xs bg-[#EAE2D7] border border-[#D6CDC2] rounded-lg text-[#14100E] focus:outline-none"
                                >
                                    {LENS_OPTIONS.map((l) => (
                                        <option key={l} value={l}>
                                            {l}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-mono uppercase text-[#6B625A] mb-1">
                                    Ratio
                                </label>
                                <select
                                    value={formatRatio}
                                    onChange={(e) => setFormatRatio(e.target.value)}
                                    className="w-full px-2.5 py-1.5 text-xs bg-[#EAE2D7] border border-[#D6CDC2] rounded-lg text-[#14100E] focus:outline-none"
                                >
                                    {RATIO_OPTIONS.map((r) => (
                                        <option key={r} value={r}>
                                            {r}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Summary */}
                        <div>
                            <label className="block text-[11px] font-mono uppercase text-[#6B625A] mb-1">
                                {WORK_PROJECT_FIELDS.summary.label}
                            </label>
                            <textarea
                                rows={2}
                                value={summary}
                                onChange={(e) => setSummary(e.target.value)}
                                placeholder={WORK_PROJECT_FIELDS.summary.placeholder}
                                className="w-full px-3 py-2 text-xs bg-[#EAE2D7] border border-[#D6CDC2] rounded-lg text-[#14100E] placeholder-[#8C8278] focus:outline-none focus:border-[#14100E] resize-none"
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="pt-2 flex justify-end">
                            <button
                                type="submit"
                                disabled={submitting || !selectedVideo || !title.trim()}
                                className="px-5 py-2.5 rounded-lg bg-[#14100E] hover:bg-[#2A2420] text-[#F4EDE4] text-xs font-mono uppercase tracking-wider font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                            >
                                <Plus className="w-4 h-4" />
                                <span>{submitting ? "Uploading Video..." : "Publish Video Project"}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}

