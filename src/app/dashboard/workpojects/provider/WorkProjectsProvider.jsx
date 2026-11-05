"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { workProjectService } from "@/api";
import {
    getVideoMetadata,
    captureVideoFrame,
    isWebmVP9Supported,
} from "@/app/utils/videoConverter";
import { MAX_VIDEO_BYTES } from "../config/workProjectsConfig";

const WorkProjectsContext = createContext(null);

export function WorkProjectsProvider({ children }) {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    // Upload Form states
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

    // Delete modal
    const [deletingProject, setDeletingProject] = useState(null);
    const [deleteSubmitting, setDeleteSubmitting] = useState(false);

    // Playing preview ID
    const [playingId, setPlayingId] = useState(null);

    const fileInputRef = useRef(null);

    // API Call: Fetch Projects
    const fetchProjects = useCallback(async () => {
        setLoading(true);
        setErrorMsg("");
        try {
            const res = await workProjectService.getProjects();
            if (res?.success) {
                setProjects(res.data || []);
            } else if (Array.isArray(res)) {
                setProjects(res);
            }
        } catch (err) {
            console.error("[WorkProjectsProvider] Failed to fetch projects:", err);
            setErrorMsg(err?.message || "Failed to load projects.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    // Video File Handler
    const handleVideoSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > MAX_VIDEO_BYTES) {
            setErrorMsg("Video file exceeds the 80MB limit.");
            return;
        }

        setErrorMsg("");
        setSelectedVideo(file);
        const objectUrl = URL.createObjectURL(file);
        setVideoPreviewUrl(objectUrl);

        try {
            const meta = await getVideoMetadata(file);
            setVideoMetadata(meta);
        } catch (err) {
            console.warn("Could not read video metadata:", err);
        }

        setIsCapturingFrame(true);
        try {
            const frameBlob = await captureVideoFrame(file, 1.0);
            setCapturedThumbnailBlob(frameBlob);
            setCapturedThumbnailUrl(URL.createObjectURL(frameBlob));
        } catch (err) {
            console.warn("Auto-frame capture failed:", err);
        } finally {
            setIsCapturingFrame(false);
        }

        if (!title) {
            const cleanName = file.name
                .replace(/\.[^/.]+$/, "")
                .replace(/[_-]/g, " ")
                .replace(/\b\w/g, (c) => c.toUpperCase());
            setTitle(cleanName);
        }
    };

    const clearSelectedVideo = () => {
        setSelectedVideo(null);
        setVideoPreviewUrl("");
        setVideoMetadata(null);
        setCapturedThumbnailBlob(null);
        setCapturedThumbnailUrl("");
        setCustomThumbnailFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    // API Call: Create Project
    const handleSubmitProject = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        setErrorMsg("");
        setSuccessMsg("");

        if (!selectedVideo) {
            setErrorMsg("Please select a video file.");
            return;
        }
        if (!title.trim()) {
            setErrorMsg("Please enter a project title.");
            return;
        }

        const chosenTag = customTag.trim() || floatingTag;
        setSubmitting(true);
        setUploadProgress(0);

        try {
            const formData = new FormData();
            formData.append("video", selectedVideo);
            formData.append("title", title.trim());
            formData.append("tag", chosenTag);
            if (stationName.trim()) formData.append("stationName", stationName.trim());
            if (client.trim()) formData.append("client", client.trim());
            if (summary.trim()) formData.append("summary", summary.trim());
            if (seoTitle.trim()) formData.append("seoTitle", seoTitle.trim());
            if (seoDescription.trim()) formData.append("seoDescription", seoDescription.trim());
            if (keyword.trim()) formData.append("keyword", keyword.trim());
            formData.append("camera", camera);
            formData.append("lens", lens);
            formData.append("formatRatio", formatRatio);
            formData.append("isFeatured", String(isFeatured));

            if (customThumbnailFile) {
                formData.append("thumbnail", customThumbnailFile);
            } else if (capturedThumbnailBlob) {
                formData.append(
                    "thumbnail",
                    capturedThumbnailBlob,
                    `${title.trim().replace(/\s+/g, "-")}-thumb.jpg`
                );
            }

            const res = await workProjectService.createProject(formData, (evt) => {
                if (evt.total) {
                    const pct = Math.round((evt.loaded * 100) / evt.total);
                    setUploadProgress(pct);
                }
            });

            if (res?.success) {
                setSuccessMsg(`Project "${title}" published to Transit World!`);
                clearSelectedVideo();
                setTitle("");
                setClient("");
                setSummary("");
                setStationName("");
                setCustomTag("");
                setSeoTitle("");
                setSeoDescription("");
                setIsFeatured(false);
                await fetchProjects();
                setTimeout(() => setSuccessMsg(""), 5000);
            }
        } catch (err) {
            console.error("[WorkProjectsProvider] Upload error:", err);
            setErrorMsg(err?.response?.data?.message || err.message || "Failed to upload project.");
        } finally {
            setSubmitting(false);
            setUploadProgress(0);
        }
    };

    // API Call: Update Project
    const handleUpdateProject = async (id, updatedData) => {
        setEditSubmitting(true);
        try {
            const res = await workProjectService.updateProject(id, updatedData);
            if (res?.success) {
                setEditingProject(null);
                setSuccessMsg("Project updated successfully.");
                await fetchProjects();
                setTimeout(() => setSuccessMsg(""), 3000);
            }
        } catch (err) {
            console.error("[WorkProjectsProvider] Update error:", err);
            alert(err?.response?.data?.message || "Failed to update project.");
        } finally {
            setEditSubmitting(false);
        }
    };

    // API Call: Delete Project
    const handleDeleteProject = async (id) => {
        setDeleteSubmitting(true);
        try {
            const res = await workProjectService.deleteProject(id);
            if (res?.success) {
                setDeletingProject(null);
                setSuccessMsg("Project deleted.");
                await fetchProjects();
                setTimeout(() => setSuccessMsg(""), 3000);
            }
        } catch (err) {
            console.error("[WorkProjectsProvider] Delete error:", err);
            alert(err?.response?.data?.message || "Failed to delete project.");
        } finally {
            setDeleteSubmitting(false);
        }
    };

    // API Call: Reorder Projects
    const handleMoveProject = async (index, direction) => {
        const targetIndex = direction === "up" ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= projects.length) return;

        const next = [...projects];
        const temp = next[index];
        next[index] = next[targetIndex];
        next[targetIndex] = temp;
        setProjects(next);

        try {
            const orderedIds = next.map((p) => p.id);
            await workProjectService.reorderProjects(orderedIds);
        } catch (err) {
            console.error("[WorkProjectsProvider] Reorder error:", err);
            fetchProjects();
        }
    };

    const handleRefresh = () => fetchProjects();

    const value = {
        // State
        projects,
        loading,
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
        seoTitle,
        seoDescription,
        keyword,
        camera,
        lens,
        formatRatio,
        isFeatured,
        selectedVideo,
        videoPreviewUrl,
        videoMetadata,
        capturedThumbnailBlob,
        capturedThumbnailUrl,
        customThumbnailFile,
        isCapturingFrame,
        editingProject,
        editSubmitting,
        deletingProject,
        deleteSubmitting,
        playingId,
        fileInputRef,

        // Setters / Handlers
        setTitle,
        setFloatingTag,
        setCustomTag,
        setStationName,
        setClient,
        setSummary,
        setSeoTitle,
        setSeoDescription,
        setKeyword,
        setCamera,
        setLens,
        setFormatRatio,
        setIsFeatured,
        setCustomThumbnailFile,
        setEditingProject,
        setDeletingProject,
        setPlayingId,
        handleVideoSelect,
        clearSelectedVideo,
        handleSubmitProject,
        handleUpdateProject,
        handleDeleteProject,
        handleMoveProject,
        handleRefresh,
    };

    return (
        <WorkProjectsContext.Provider value={value}>
            {children}
        </WorkProjectsContext.Provider>
    );
}

export function useWorkProjects() {
    const context = useContext(WorkProjectsContext);
    if (!context) {
        throw new Error("useWorkProjects must be used within a WorkProjectsProvider");
    }
    return context;
}

