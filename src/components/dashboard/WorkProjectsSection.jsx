"use client";

import React, { useState, useEffect, useRef } from "react";
import {
    Video,
    UploadCloud,
    Trash2,
    Edit3,
    ArrowUp,
    ArrowDown,
    Play,
    Pause,
    CheckCircle2,
    AlertCircle,
    Info,
    Film,
    Sparkles,
    Loader2,
    RefreshCw,
    X,
    Clock,
    Monitor,
    Tag,
    Globe,
    Check,
} from "lucide-react";
import { workProjectService } from "@/api";
import {
    getVideoMetadata,
    captureVideoFrame,
    isWebmVP9Supported,
} from "@/app/utils/videoConverter";

const MAX_VIDEO_BYTES = 80 * 1024 * 1024; // 80 MB

const DEFAULT_FLOATING_TAGS = [
    "FEATURED",
    "INDIE",
    "CAMPAIGN",
    "SERIES",
    "FEATURE",
    "FICTION",
    "COMMERCIAL",
    "SHOWREEL",
    "DOCUMENTARY",
    "MUSIC VIDEO",
];

export default function WorkProjectsSection() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    // Form states
    const [title, setTitle] = useState("");
    const [floatingTag, setFloatingTag] = useState("FEATURED");
    const [customTag, setCustomTag] = useState("");
    const [stationName, setStationName] = useState("");
    const [client, setClient] = useState("");
    const [summary, setSummary] = useState("");
    const [seoTitle, setSeoTitle] = useState("");
    const [seoDescription, setSeoDescription] = useState("");
    const [keyword, setKeyword] = useState("Cinematography");
    const [camera, setCamera] = useState("ARRI LF");
    const [lens, setLens] = useState("ANAMORPHIC");
    const [formatRatio, setFormatRatio] = useState("2.39:1");
    const [isFeatured, setIsFeatured] = useState(false);

    // Video & Thumbnail files
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [videoPreviewUrl, setVideoPreviewUrl] = useState("");
    const [videoMetadata, setVideoMetadata] = useState(null);
    const [capturedThumbnailBlob, setCapturedThumbnailBlob] = useState(null);
    const [capturedThumbnailUrl, setCapturedThumbnailUrl] = useState("");
    const [customThumbnailFile, setCustomThumbnailFile] = useState(null);
    const [isCapturingFrame, setIsCapturingFrame] = useState(false);

    // Edit modal
    const [editingProject, setEditingProject] = useState(null);
    const [editSubmitting, setEditSubmitting] = useState(false);

    // Delete confirmation modal
    const [deletingProject, setDeletingProject] = useState(null);
    const [deleteSubmitting, setDeleteSubmitting] = useState(false);

    // Playing preview ID
    const [playingId, setPlayingId] = useState(null);

    const fileInputRef = useRef(null);

    const fetchProjects = async () => {
        setLoading(true);
        setErrorMsg("");
        try {
            const res = await workProjectService.getProjects();
            if (res?.success) {
                setProjects(res.data || []);
            }
        } catch (err) {
            console.error("Fetch work projects failed:", err);
            setErrorMsg(
                err.response?.data?.message || "Failed to load work projects."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    // Handle video selection and inspect with videoConverter
    const handleVideoSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setErrorMsg("");
        setSuccessMsg("");

        // 80MB Max Validation
        if (file.size > MAX_VIDEO_BYTES) {
            setErrorMsg(
                `File is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum allowed video size is 80MB.`
            );
            e.target.value = "";
            return;
        }

        setSelectedVideo(file);
        const url = URL.createObjectURL(file);
        setVideoPreviewUrl(url);

        // Auto-fill title from filename if empty
        if (!title) {
            const cleanName = file.name
                .replace(/\.[^/.]+$/, "")
                .replace(/[_-]/g, " ")
                .toUpperCase();
            setTitle(cleanName);
            if (!seoTitle) setSeoTitle(`${cleanName} | Cinematography`);
        }

        // Run videoConverter utilities
        try {
            setIsCapturingFrame(true);
            const meta = await getVideoMetadata(file);
            setVideoMetadata(meta);

            // Auto-capture a WebP still poster frame from 0.5s
            const frameBlob = await captureVideoFrame(file, {
                timestampSeconds: 0.5,
                format: "image/webp",
                quality: 0.9,
            });
            setCapturedThumbnailBlob(frameBlob);
            const thumbUrl = URL.createObjectURL(frameBlob);
            setCapturedThumbnailUrl(thumbUrl);
        } catch (convErr) {
            console.warn("Video inspection / frame capture fallback:", convErr);
        } finally {
            setIsCapturingFrame(false);
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg("");
        setSuccessMsg("");

        if (!selectedVideo) {
            setErrorMsg("Please select a video file (max 80MB).");
            return;
        }

        if (selectedVideo.size > MAX_VIDEO_BYTES) {
            setErrorMsg(
                `File exceeds 80MB limit (${(selectedVideo.size / (1024 * 1024)).toFixed(1)}MB). Please choose a file under 80MB.`
            );
            return;
        }

        if (!title.trim()) {
            setErrorMsg("Project Title is required.");
            return;
        }

        try {
            setSubmitting(true);
            setUploadProgress(0);

            const formData = new FormData();
            formData.append("video", selectedVideo);

            // Append WebP thumbnail blob or custom file
            if (customThumbnailFile) {
                formData.append("thumbnail", customThumbnailFile);
            } else if (capturedThumbnailBlob) {
                formData.append(
                    "thumbnail",
                    capturedThumbnailBlob,
                    `${title.trim().toLowerCase().replace(/\s+/g, "-")}-poster.webp`
                );
            }

            const activeTag =
                floatingTag === "OTHER"
                    ? customTag.trim().toUpperCase() || "FEATURED"
                    : floatingTag;

            formData.append("title", title.trim());
            formData.append("floating_tag", activeTag);
            formData.append("station_name", stationName.trim() || title.trim());
            formData.append("client", client.trim() || "Anup Rawat Works");
            formData.append("summary", summary.trim());
            formData.append("seo_title", seoTitle.trim() || title.trim());
            formData.append(
                "seo_description",
                seoDescription.trim() || summary.trim()
            );
            formData.append("keyword", keyword.trim() || "Cinematography");
            formData.append("camera", camera.trim() || "ARRI LF");
            formData.append("lens", lens.trim() || "ANAMORPHIC");
            formData.append("format_ratio", formatRatio.trim() || "2.39:1");
            formData.append("sort_order", String(projects.length));
            formData.append("is_featured", String(isFeatured));

            const res = await workProjectService.createProject(formData, (progressEvent) => {
                const total = progressEvent.total || selectedVideo.size;
                const percent = Math.round((progressEvent.loaded * 100) / total);
                setUploadProgress(percent);
            });

            if (res?.success) {
                setSuccessMsg("Work project & video uploaded successfully!");
                // Reset form
                setTitle("");
                setStationName("");
                setClient("");
                setSummary("");
                setSeoTitle("");
                setSeoDescription("");
                setSelectedVideo(null);
                setVideoPreviewUrl("");
                setVideoMetadata(null);
                setCapturedThumbnailBlob(null);
                setCapturedThumbnailUrl("");
                setCustomThumbnailFile(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
                await fetchProjects();
            }
        } catch (err) {
            console.error("Create project error:", err);
            setErrorMsg(
                err.response?.data?.message ||
                    err.message ||
                    "Failed to upload video project."
            );
        } finally {
            setSubmitting(false);
            setUploadProgress(0);
        }
    };

    // Delete confirmed project
    const handleConfirmDelete = async () => {
        if (!deletingProject) return;
        setDeleteSubmitting(true);
        setErrorMsg("");
        try {
            await workProjectService.deleteProject(deletingProject.id);
            setSuccessMsg(`Project "${deletingProject.title}" deleted.`);
            setDeletingProject(null);
            await fetchProjects();
        } catch (err) {
            console.error("Delete failed:", err);
            setErrorMsg(
                err.response?.data?.message || "Failed to delete project."
            );
        } finally {
            setDeleteSubmitting(false);
        }
    };

    // Reorder projects
    const handleMove = async (index, direction) => {
        const targetIndex = index + direction;
        if (targetIndex < 0 || targetIndex >= projects.length) return;

        const updated = [...projects];
        const temp = updated[index];
        updated[index] = updated[targetIndex];
        updated[targetIndex] = temp;

        setProjects(updated);
        try {
            const ids = updated.map((p) => p.id);
            await workProjectService.reorderProjects(ids);
        } catch (err) {
            console.error("Reorder failed:", err);
            await fetchProjects(); // rollback
        }
    };

    // Edit modal submit
    const handleEditSubmit = async (e) => {
        e.preventDefault();
        if (!editingProject) return;
        setEditSubmitting(true);
        setErrorMsg("");

        try {
            const formData = new FormData();
            formData.append("title", editingProject.title);
            formData.append("floating_tag", editingProject.floating_tag);
            formData.append("station_name", editingProject.station_name || "");
            formData.append("client", editingProject.client || "");
            formData.append("summary", editingProject.summary || "");
            formData.append("seo_title", editingProject.seo_title || "");
            formData.append(
                "seo_description",
                editingProject.seo_description || ""
            );
            formData.append("keyword", editingProject.keyword || "");
            formData.append("camera", editingProject.camera || "");
            formData.append("lens", editingProject.lens || "");
            formData.append("format_ratio", editingProject.format_ratio || "");
            formData.append(
                "is_featured",
                String(Boolean(editingProject.is_featured))
            );

            await workProjectService.updateProject(editingProject.id, formData);
            setSuccessMsg(`Project "${editingProject.title}" updated.`);
            setEditingProject(null);
            await fetchProjects();
        } catch (err) {
            console.error("Update failed:", err);
            setErrorMsg(
                err.response?.data?.message || "Failed to update project."
            );
        } finally {
            setEditSubmitting(false);
        }
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-16">
            {/* Header Banner */}
            <div className="border border-[#D6CDC2] rounded-xl p-6 bg-[#F4EDE4] shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#14100E] text-[#ECE8E1] text-[10px] font-mono uppercase tracking-widest">
                            <Film className="w-3 h-3 text-[#D4A017]" />
                            <span>Section 04 • Transit System</span>
                        </div>
                        <h2 className="text-2xl font-bold font-sans text-[#14100E] tracking-tight">
                            Work Projects &amp; Video Showcase
                        </h2>
                        <p className="text-xs text-[#6B625A] max-w-2xl font-mono">
                            Upload high-definition cinematography videos (up to 80MB).
                            The system automatically inspects video metadata, extracts a WebP poster frame via{" "}
                            <span className="text-[#14100E] font-semibold">videoConverter</span>,
                            and dynamically syncs the floating tag with the Delhi Metro subway route board.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={fetchProjects}
                            disabled={loading}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#EAE2D7] text-[#14100E] text-xs font-mono border border-[#D6CDC2] hover:bg-[#DDD3C5] transition-colors"
                        >
                            <RefreshCw
                                className={`w-3.5 h-3.5 ${
                                    loading ? "animate-spin" : ""
                                }`}
                            />
                            <span>Sync</span>
                        </button>
                    </div>
                </div>

                {/* Notifications */}
                {errorMsg && (
                    <div className="mt-4 p-3 rounded-lg bg-red-100/80 border border-red-300 text-red-900 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
                        <span>{errorMsg}</span>
                    </div>
                )}
                {successMsg && (
                    <div className="mt-4 p-3 rounded-lg bg-green-100/80 border border-green-300 text-green-900 text-xs flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-green-600" />
                        <span>{successMsg}</span>
                    </div>
                )}
            </div>

            {/* Upload & Create Form */}
            <form
                onSubmit={handleFormSubmit}
                className="border border-[#D6CDC2] rounded-xl p-6 bg-[#F4EDE4] shadow-sm space-y-6"
            >
                <div className="flex items-center justify-between border-b border-[#D6CDC2] pb-4">
                    <div className="flex items-center gap-2">
                        <UploadCloud className="w-5 h-5 text-[#14100E]" />
                        <h3 className="font-bold text-sm text-[#14100E] uppercase tracking-wider font-mono">
                            Add New Work Video (Max 80MB)
                        </h3>
                    </div>
                    <span className="text-[11px] font-mono text-[#6B625A] bg-[#EAE2D7] px-2.5 py-1 rounded border border-[#D6CDC2]">
                        Strict 80MB Client &amp; Server Validation
                    </span>
                </div>

                {/* Video Dropzone */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-6 space-y-3">
                        <label className="block text-xs font-mono uppercase font-semibold text-[#14100E]">
                            1. Select Video File (.webm, .mp4, .mov - Max 80MB) *
                        </label>
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[220px] ${
                                selectedVideo
                                    ? "border-[#14100E] bg-[#EAE2D7]"
                                    : "border-[#B8ADA0] hover:border-[#14100E] bg-[#EFE9E0]"
                            }`}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="video/webm,video/mp4,video/quicktime,video/*"
                                onChange={handleVideoSelect}
                                className="hidden"
                            />

                            {selectedVideo ? (
                                <div className="space-y-2 text-center">
                                    <Video className="w-10 h-10 mx-auto text-[#14100E]" />
                                    <div className="font-bold text-xs text-[#14100E] max-w-[320px] truncate">
                                        {selectedVideo.name}
                                    </div>
                                    <div className="text-[11px] font-mono text-[#6B625A]">
                                        Size:{" "}
                                        {(
                                            selectedVideo.size /
                                            (1024 * 1024)
                                        ).toFixed(2)}{" "}
                                        MB / 80 MB
                                    </div>
                                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-green-200 text-green-900 text-[10px] font-mono font-semibold">
                                        <Check className="w-3 h-3" /> Size Validated
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <Video className="w-10 h-10 mx-auto text-[#8A7E72]" />
                                    <p className="font-semibold text-xs text-[#14100E]">
                                        Click to browse or drop cinematography video
                                    </p>
                                    <p className="text-[11px] font-mono text-[#6B625A]">
                                        WebM VP9, MP4 or ProRes MOV • Max 80 MB
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Video metadata inspector pill */}
                        {isCapturingFrame && (
                            <div className="flex items-center gap-2 p-2 bg-[#EAE2D7] rounded-lg text-xs font-mono text-[#14100E]">
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>
                                    Running videoConverter: inspecting metadata &amp; generating WebP poster...
                                </span>
                            </div>
                        )}

                        {videoMetadata && (
                            <div className="grid grid-cols-3 gap-2 p-3 rounded-lg bg-[#14100E] text-white text-[11px] font-mono">
                                <div>
                                    <span className="text-[#A0988D] block text-[9px] uppercase">
                                        Resolution
                                    </span>
                                    <span className="font-bold">
                                        {videoMetadata.width} × {videoMetadata.height}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[#A0988D] block text-[9px] uppercase">
                                        Duration
                                    </span>
                                    <span className="font-bold">
                                        {videoMetadata.duration.toFixed(1)}s
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[#A0988D] block text-[9px] uppercase">
                                        Aspect Ratio
                                    </span>
                                    <span className="font-bold">
                                        {videoMetadata.aspectRatio.toFixed(2)}:1
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Preview Player & Captured Poster */}
                    <div className="lg:col-span-6 space-y-3">
                        <label className="block text-xs font-mono uppercase font-semibold text-[#14100E]">
                            2. Live Video &amp; Auto WebP Frame Preview
                        </label>
                        <div className="relative rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center border border-[#14100E] shadow-inner">
                            {videoPreviewUrl ? (
                                <video
                                    src={videoPreviewUrl}
                                    controls
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="text-center p-6 space-y-2 text-white/50">
                                    <Monitor className="w-8 h-8 mx-auto opacity-40" />
                                    <p className="text-xs font-mono">
                                        Select a video to see live cinema playback and extracted frame
                                    </p>
                                </div>
                            )}

                            {/* Floating tag preview badge */}
                            <div className="absolute top-2 left-2 z-10 bg-[#14100E]/90 text-white font-mono text-[9px] uppercase px-2 py-0.5 rounded border border-white/20 tracking-wider">
                                TAG:{" "}
                                {floatingTag === "OTHER"
                                    ? customTag || "TAG"
                                    : floatingTag}
                            </div>
                        </div>

                        {capturedThumbnailUrl && (
                            <div className="flex items-center gap-3 p-2 bg-[#EAE2D7] rounded-lg border border-[#D6CDC2]">
                                <img
                                    src={capturedThumbnailUrl}
                                    alt="Poster Frame"
                                    className="w-14 h-10 object-cover rounded border border-[#14100E]"
                                />
                                <div className="text-[11px] font-mono text-[#14100E] space-y-0.5">
                                    <div className="font-bold flex items-center gap-1">
                                        <Sparkles className="w-3 h-3 text-[#D4A017]" />
                                        <span>Auto-Captured WebP Video Poster</span>
                                    </div>
                                    <div className="text-[10px] text-[#6B625A]">
                                        Extracted at 0.5s with videoConverter.ts (Format: WebP)
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Metadata Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-[#D6CDC2]">
                    {/* Project Title */}
                    <div className="space-y-1">
                        <label className="text-xs font-mono uppercase font-semibold text-[#14100E]">
                            Project Title *
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. KRISHNA SHUKLA"
                            required
                            className="w-full px-3 py-2 rounded-lg bg-[#EAE2D7] border border-[#D6CDC2] text-xs font-sans text-[#14100E] focus:outline-none focus:border-[#14100E]"
                        />
                    </div>

                    {/* Floating Tag (Displays on Route Line Map) */}
                    <div className="space-y-1">
                        <label className="text-xs font-mono uppercase font-semibold text-[#14100E] flex items-center gap-1">
                            <Tag className="w-3.5 h-3.5 text-[#D4A017]" />
                            <span>Floating Tag (Subway Line) *</span>
                        </label>
                        <select
                            value={floatingTag}
                            onChange={(e) => setFloatingTag(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-[#EAE2D7] border border-[#D6CDC2] text-xs font-mono text-[#14100E] focus:outline-none focus:border-[#14100E]"
                        >
                            {DEFAULT_FLOATING_TAGS.map((t) => (
                                <option key={t} value={t}>
                                    {t}
                                </option>
                            ))}
                            <option value="OTHER">CUSTOM TAG...</option>
                        </select>
                        {floatingTag === "OTHER" && (
                            <input
                                type="text"
                                value={customTag}
                                onChange={(e) => setCustomTag(e.target.value)}
                                placeholder="Enter custom floating tag"
                                className="w-full mt-1 px-3 py-1.5 rounded-lg bg-[#EAE2D7] border border-[#D6CDC2] text-xs font-mono uppercase"
                            />
                        )}
                    </div>

                    {/* Metro Station Name */}
                    <div className="space-y-1">
                        <label className="text-xs font-mono uppercase font-semibold text-[#14100E]">
                            Station Name (LED Sign)
                        </label>
                        <input
                            type="text"
                            value={stationName}
                            onChange={(e) => setStationName(e.target.value)}
                            placeholder="e.g. KASHMERE GATE"
                            className="w-full px-3 py-2 rounded-lg bg-[#EAE2D7] border border-[#D6CDC2] text-xs font-sans text-[#14100E] focus:outline-none focus:border-[#14100E]"
                        />
                    </div>

                    {/* Client / Studio */}
                    <div className="space-y-1">
                        <label className="text-xs font-mono uppercase font-semibold text-[#14100E]">
                            Client / Production
                        </label>
                        <input
                            type="text"
                            value={client}
                            onChange={(e) => setClient(e.target.value)}
                            placeholder="e.g. Netflix India / JioCinema"
                            className="w-full px-3 py-2 rounded-lg bg-[#EAE2D7] border border-[#D6CDC2] text-xs font-sans text-[#14100E] focus:outline-none focus:border-[#14100E]"
                        />
                    </div>
                </div>

                {/* Technical Specs & SEO Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Camera */}
                    <div className="space-y-1">
                        <label className="text-xs font-mono uppercase font-semibold text-[#14100E]">
                            Camera Package
                        </label>
                        <input
                            type="text"
                            value={camera}
                            onChange={(e) => setCamera(e.target.value)}
                            placeholder="e.g. ARRI ALEXA LF"
                            className="w-full px-3 py-2 rounded-lg bg-[#EAE2D7] border border-[#D6CDC2] text-xs font-sans text-[#14100E]"
                        />
                    </div>

                    {/* Lens */}
                    <div className="space-y-1">
                        <label className="text-xs font-mono uppercase font-semibold text-[#14100E]">
                            Lens / Optics
                        </label>
                        <input
                            type="text"
                            value={lens}
                            onChange={(e) => setLens(e.target.value)}
                            placeholder="e.g. COOKE ANAMORPHIC"
                            className="w-full px-3 py-2 rounded-lg bg-[#EAE2D7] border border-[#D6CDC2] text-xs font-sans text-[#14100E]"
                        />
                    </div>

                    {/* Format Ratio */}
                    <div className="space-y-1">
                        <label className="text-xs font-mono uppercase font-semibold text-[#14100E]">
                            Aspect Ratio
                        </label>
                        <input
                            type="text"
                            value={formatRatio}
                            onChange={(e) => setFormatRatio(e.target.value)}
                            placeholder="e.g. 2.39:1"
                            className="w-full px-3 py-2 rounded-lg bg-[#EAE2D7] border border-[#D6CDC2] text-xs font-sans text-[#14100E]"
                        />
                    </div>

                    {/* Background Faded Keyword */}
                    <div className="space-y-1">
                        <label className="text-xs font-mono uppercase font-semibold text-[#14100E]">
                            Watermark Keyword
                        </label>
                        <input
                            type="text"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            placeholder="e.g. Cinematography"
                            className="w-full px-3 py-2 rounded-lg bg-[#EAE2D7] border border-[#D6CDC2] text-xs font-sans text-[#14100E]"
                        />
                    </div>
                </div>

                {/* Summary & SEO Meta */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Summary Pitch */}
                    <div className="space-y-1">
                        <label className="text-xs font-mono uppercase font-semibold text-[#14100E]">
                            Billboard Synopsis / Summary
                        </label>
                        <textarea
                            rows={3}
                            value={summary}
                            onChange={(e) => setSummary(e.target.value)}
                            placeholder="Brief uppercase cinematic summary displayed on the billboard..."
                            className="w-full px-3 py-2 rounded-lg bg-[#EAE2D7] border border-[#D6CDC2] text-xs font-sans text-[#14100E]"
                        />
                    </div>

                    {/* SEO Fields */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-1 text-xs font-mono uppercase font-semibold text-[#14100E]">
                            <Globe className="w-3.5 h-3.5 text-[#012CEB]" />
                            <span>SEO Metadata (Title &amp; Meta Description)</span>
                        </div>
                        <input
                            type="text"
                            value={seoTitle}
                            onChange={(e) => setSeoTitle(e.target.value)}
                            placeholder="SEO Title (e.g. Krishna Shukla - Narrative Short Film Cinematography)"
                            className="w-full px-3 py-1.5 rounded-lg bg-[#EAE2D7] border border-[#D6CDC2] text-xs font-sans text-[#14100E]"
                        />
                        <textarea
                            rows={2}
                            value={seoDescription}
                            onChange={(e) => setSeoDescription(e.target.value)}
                            placeholder="SEO Meta Description for Google search indexing..."
                            className="w-full px-3 py-1.5 rounded-lg bg-[#EAE2D7] border border-[#D6CDC2] text-xs font-sans text-[#14100E]"
                        />
                    </div>
                </div>

                {/* Progress Bar during 80MB Upload */}
                {submitting && (
                    <div className="space-y-1.5 p-4 rounded-xl bg-[#14100E] text-white">
                        <div className="flex justify-between text-xs font-mono">
                            <span className="flex items-center gap-2">
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D4A017]" />
                                Uploading &amp; processing video on ImageKit CDN...
                            </span>
                            <span className="font-bold text-[#D4A017]">
                                {uploadProgress}%
                            </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-white/20 overflow-hidden">
                            <div
                                className="h-full bg-[#D4A017] transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#D6CDC2]">
                    <button
                        type="submit"
                        disabled={submitting || !selectedVideo}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#14100E] text-[#F4EDE4] text-xs font-mono font-semibold uppercase tracking-wider hover:bg-[#2A2420] transition-colors disabled:opacity-50"
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Uploading Video ({uploadProgress}%)...</span>
                            </>
                        ) : (
                            <>
                                <UploadCloud className="w-4 h-4" />
                                <span>Publish Work Video to Transit Line</span>
                            </>
                        )}
                    </button>
                </div>
            </form>

            {/* List of Dynamic Work Projects */}
            <div className="border border-[#D6CDC2] rounded-xl p-6 bg-[#F4EDE4] shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-[#D6CDC2] pb-4">
                    <div className="flex items-center gap-2">
                        <Film className="w-5 h-5 text-[#14100E]" />
                        <h3 className="font-bold text-sm text-[#14100E] uppercase tracking-wider font-mono">
                            Live Work Stations ({projects.length})
                        </h3>
                    </div>
                    <span className="text-xs font-mono text-[#6B625A]">
                        Order determines sequence on the Delhi Metro transit line
                    </span>
                </div>

                {loading ? (
                    <div className="py-12 flex flex-col items-center justify-center space-y-2 text-[#6B625A]">
                        <Loader2 className="w-6 h-6 animate-spin text-[#14100E]" />
                        <span className="text-xs font-mono">
                            Loading work projects...
                        </span>
                    </div>
                ) : projects.length === 0 ? (
                    <div className="py-12 text-center space-y-3">
                        <Film className="w-12 h-12 mx-auto text-[#A0988D] opacity-60" />
                        <h4 className="font-bold text-sm text-[#14100E]">
                            No custom work projects uploaded yet
                        </h4>
                        <p className="text-xs font-mono text-[#6B625A] max-w-md mx-auto">
                            The portfolio is currently displaying the default built-in
                            showcase works. Upload your first video above to activate live dynamic stations!
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {projects.map((proj, idx) => (
                            <div
                                key={proj.id}
                                className="p-4 rounded-xl bg-[#EAE2D7] border border-[#D6CDC2] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 transition-all hover:border-[#14100E]"
                            >
                                {/* Left Info & Thumbnail */}
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                    {/* Video / Poster thumbnail */}
                                    <div className="relative w-28 h-16 rounded-lg overflow-hidden bg-black flex-shrink-0 border border-[#14100E]">
                                        {proj.thumbnail_url ? (
                                            <img
                                                src={proj.thumbnail_url}
                                                alt={proj.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <video
                                                src={proj.video_url}
                                                className="w-full h-full object-cover"
                                            />
                                        )}
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setPlayingId(
                                                    playingId === proj.id
                                                        ? null
                                                        : proj.id
                                                )
                                            }
                                            className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/20 text-white transition-colors"
                                        >
                                            {playingId === proj.id ? (
                                                <Pause className="w-5 h-5" />
                                            ) : (
                                                <Play className="w-5 h-5 fill-white" />
                                            )}
                                        </button>
                                    </div>

                                    {/* Station Details */}
                                    <div className="min-w-0 space-y-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="font-mono text-[10px] font-bold bg-[#14100E] text-[#ECE8E1] px-2 py-0.5 rounded">
                                                STOP 0{idx + 1}
                                            </span>
                                            <h4 className="font-bold text-sm text-[#14100E] truncate">
                                                {proj.title}
                                            </h4>
                                            {/* Rotated Tag Badge */}
                                            <span className="font-mono text-[10px] font-bold bg-[#D4A017] text-[#14100E] px-2 py-0.5 rounded uppercase tracking-wider">
                                                TAG: {proj.floating_tag}
                                            </span>
                                        </div>

                                        <p className="text-xs text-[#6B625A] font-mono truncate">
                                            Station:{" "}
                                            <span className="text-[#14100E] font-semibold">
                                                {proj.station_name || "CENTRAL"}
                                            </span>{" "}
                                            • Client:{" "}
                                            <span className="text-[#14100E]">
                                                {proj.client || "Anup Rawat Works"}
                                            </span>
                                        </p>

                                        <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono text-[#6B625A]">
                                            <span>CAM: {proj.camera}</span>
                                            <span>LENS: {proj.lens}</span>
                                            <span>RATIO: {proj.format_ratio}</span>
                                            {proj.seo_title && (
                                                <span className="text-[#012CEB] truncate max-w-[200px]">
                                                    SEO: {proj.seo_title}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Reorder & Action Controls */}
                                <div className="flex items-center gap-2 self-end lg:self-center">
                                    {/* Move Up */}
                                    <button
                                        type="button"
                                        disabled={idx === 0}
                                        onClick={() => handleMove(idx, -1)}
                                        className="p-1.5 rounded-lg bg-[#EFE9E0] text-[#14100E] hover:bg-[#D6CDC2] disabled:opacity-30 border border-[#D6CDC2]"
                                        title="Move earlier on route"
                                    >
                                        <ArrowUp className="w-4 h-4" />
                                    </button>

                                    {/* Move Down */}
                                    <button
                                        type="button"
                                        disabled={idx === projects.length - 1}
                                        onClick={() => handleMove(idx, 1)}
                                        className="p-1.5 rounded-lg bg-[#EFE9E0] text-[#14100E] hover:bg-[#D6CDC2] disabled:opacity-30 border border-[#D6CDC2]"
                                        title="Move later on route"
                                    >
                                        <ArrowDown className="w-4 h-4" />
                                    </button>

                                    {/* Edit Button */}
                                    <button
                                        type="button"
                                        onClick={() => setEditingProject(proj)}
                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#14100E] text-white text-xs font-mono hover:bg-[#2A2420] transition-colors"
                                    >
                                        <Edit3 className="w-3.5 h-3.5" />
                                        <span>Edit</span>
                                    </button>

                                    {/* Delete Button */}
                                    <button
                                        type="button"
                                        onClick={() => setDeletingProject(proj)}
                                        className="p-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 border border-red-300 transition-colors"
                                        title="Delete project"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Video Inline Modal Preview */}
            {playingId && (
                <div
                    className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm"
                    onClick={() => setPlayingId(null)}
                >
                    <div
                        className="relative max-w-4xl w-full bg-[#14100E] rounded-xl overflow-hidden border border-white/20 p-2"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setPlayingId(null)}
                            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/70 text-white hover:bg-black"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <div className="aspect-video w-full bg-black rounded-lg overflow-hidden">
                            <video
                                src={
                                    projects.find((p) => p.id === playingId)
                                        ?.video_url
                                }
                                autoPlay
                                controls
                                className="w-full h-full object-contain"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Project Modal */}
            {editingProject && (
                <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="max-w-2xl w-full bg-[#F4EDE4] rounded-xl border border-[#14100E] shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b border-[#D6CDC2] pb-3">
                            <h3 className="font-bold text-sm uppercase font-mono text-[#14100E]">
                                Edit Project: {editingProject.title}
                            </h3>
                            <button
                                onClick={() => setEditingProject(null)}
                                className="p-1 rounded text-[#14100E] hover:bg-[#D6CDC2]"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-mono uppercase font-semibold text-[#14100E]">
                                        Title
                                    </label>
                                    <input
                                        type="text"
                                        value={editingProject.title}
                                        onChange={(e) =>
                                            setEditingProject({
                                                ...editingProject,
                                                title: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-1.5 rounded-lg bg-[#EAE2D7] border border-[#D6CDC2] text-xs font-sans text-[#14100E]"
                                        required
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-mono uppercase font-semibold text-[#14100E]">
                                        Floating Tag (Subway Line)
                                    </label>
                                    <input
                                        type="text"
                                        value={editingProject.floating_tag}
                                        onChange={(e) =>
                                            setEditingProject({
                                                ...editingProject,
                                                floating_tag:
                                                    e.target.value.toUpperCase(),
                                            })
                                        }
                                        className="w-full px-3 py-1.5 rounded-lg bg-[#EAE2D7] border border-[#D6CDC2] text-xs font-mono text-[#14100E]"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-mono uppercase font-semibold text-[#14100E]">
                                        Station Name
                                    </label>
                                    <input
                                        type="text"
                                        value={editingProject.station_name || ""}
                                        onChange={(e) =>
                                            setEditingProject({
                                                ...editingProject,
                                                station_name: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-1.5 rounded-lg bg-[#EAE2D7] border border-[#D6CDC2] text-xs font-sans text-[#14100E]"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-mono uppercase font-semibold text-[#14100E]">
                                        Client
                                    </label>
                                    <input
                                        type="text"
                                        value={editingProject.client || ""}
                                        onChange={(e) =>
                                            setEditingProject({
                                                ...editingProject,
                                                client: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-1.5 rounded-lg bg-[#EAE2D7] border border-[#D6CDC2] text-xs font-sans text-[#14100E]"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-mono uppercase font-semibold text-[#14100E]">
                                        Camera
                                    </label>
                                    <input
                                        type="text"
                                        value={editingProject.camera || ""}
                                        onChange={(e) =>
                                            setEditingProject({
                                                ...editingProject,
                                                camera: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-1.5 rounded-lg bg-[#EAE2D7] border border-[#D6CDC2] text-xs font-sans text-[#14100E]"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-mono uppercase font-semibold text-[#14100E]">
                                    Synopsis / Summary
                                </label>
                                <textarea
                                    rows={2}
                                    value={editingProject.summary || ""}
                                    onChange={(e) =>
                                        setEditingProject({
                                            ...editingProject,
                                            summary: e.target.value,
                                        })
                                    }
                                    className="w-full px-3 py-1.5 rounded-lg bg-[#EAE2D7] border border-[#D6CDC2] text-xs font-sans text-[#14100E]"
                                />
                            </div>

                            <div className="space-y-2 border-t border-[#D6CDC2] pt-3">
                                <div className="text-xs font-mono uppercase font-semibold text-[#14100E] flex items-center gap-1">
                                    <Globe className="w-3.5 h-3.5 text-[#012CEB]" />
                                    <span>SEO Title &amp; Description</span>
                                </div>
                                <input
                                    type="text"
                                    value={editingProject.seo_title || ""}
                                    onChange={(e) =>
                                        setEditingProject({
                                            ...editingProject,
                                            seo_title: e.target.value,
                                        })
                                    }
                                    placeholder="SEO Title"
                                    className="w-full px-3 py-1.5 rounded-lg bg-[#EAE2D7] border border-[#D6CDC2] text-xs font-sans text-[#14100E]"
                                />
                                <textarea
                                    rows={2}
                                    value={editingProject.seo_description || ""}
                                    onChange={(e) =>
                                        setEditingProject({
                                            ...editingProject,
                                            seo_description: e.target.value,
                                        })
                                    }
                                    placeholder="SEO Description"
                                    className="w-full px-3 py-1.5 rounded-lg bg-[#EAE2D7] border border-[#D6CDC2] text-xs font-sans text-[#14100E]"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#D6CDC2]">
                                <button
                                    type="button"
                                    onClick={() => setEditingProject(null)}
                                    className="px-4 py-2 rounded-lg bg-[#EAE2D7] text-xs font-mono text-[#14100E] hover:bg-[#D6CDC2]"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={editSubmitting}
                                    className="px-5 py-2 rounded-lg bg-[#14100E] text-white text-xs font-mono uppercase font-semibold hover:bg-[#2A2420] disabled:opacity-50"
                                >
                                    {editSubmitting ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Popup Modal */}
            {deletingProject && (
                <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="max-w-md w-full bg-[#F4EDE4] rounded-xl border border-red-400 shadow-2xl p-6 space-y-4">
                        <div className="flex items-center gap-3 text-red-600">
                            <AlertCircle className="w-6 h-6 flex-shrink-0" />
                            <h3 className="font-bold text-base font-sans text-[#14100E]">
                                Delete Work Project?
                            </h3>
                        </div>

                        <p className="text-xs text-[#6B625A] font-mono leading-relaxed">
                            Are you sure you want to permanently delete{" "}
                            <span className="font-bold text-[#14100E]">
                                &quot;{deletingProject.title}&quot;
                            </span>
                            ? This will remove its video asset from ImageKit and its
                            station from the Delhi Metro route line.
                        </p>

                        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#D6CDC2]">
                            <button
                                type="button"
                                onClick={() => setDeletingProject(null)}
                                disabled={deleteSubmitting}
                                className="px-4 py-2 rounded-lg bg-[#EAE2D7] text-xs font-mono text-[#14100E] hover:bg-[#D6CDC2]"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmDelete}
                                disabled={deleteSubmitting}
                                className="px-5 py-2 rounded-lg bg-red-600 text-white text-xs font-mono uppercase font-semibold hover:bg-red-700 disabled:opacity-50 flex items-center gap-1.5"
                            >
                                {deleteSubmitting ? (
                                    <>
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        <span>Deleting...</span>
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="w-3.5 h-3.5" />
                                        <span>Yes, Delete Project</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

