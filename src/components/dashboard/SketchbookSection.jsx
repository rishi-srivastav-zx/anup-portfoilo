"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import {
    Image as ImageIcon,
    UploadCloud,
    Trash2,
    MoveUp,
    MoveDown,
    RefreshCw,
    Sparkles,
    AlertCircle,
    CheckCircle2,
    Eye,
    Plus,
    X,
    ExternalLink,
    Layers,
} from "lucide-react";
import { sketchbookService } from "@/api";

const MAX_PLATES = 10;

export default function SketchbookSection() {
    const [plates, setPlates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);

    // Form inputs for upload
    const [selectedFile, setSelectedFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);
    const [title, setTitle] = useState("");
    const [place, setPlace] = useState("");
    const [description, setDescription] = useState("");
    const [deleteModalItem, setDeleteModalItem] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const fileInputRef = useRef(null);

    // Fetch plates
    const fetchPlates = useCallback(async () => {
        setLoading(true);
        setErrorMsg(null);
        try {
            const res = await sketchbookService.getImages();
            if (res?.data) {
                setPlates(res.data);
            } else if (Array.isArray(res)) {
                setPlates(res);
            }
        } catch (err) {
            console.error("Failed to load plates:", err);
            setErrorMsg(err?.response?.data?.message || err.message || "Unable to load sketchbook plates.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPlates();
    }, [fetchPlates]);

    // File selection
    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setSelectedFile(file);
        const reader = new FileReader();
        reader.onload = () => setFilePreview(reader.result);
        reader.readAsDataURL(file);

        if (!title) {
            const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
            setTitle(nameWithoutExt);
        }
    };

    const clearSelectedFile = () => {
        setSelectedFile(null);
        setFilePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    // Upload Plate
    const handleUpload = async (e) => {
        e.preventDefault();
        if (!selectedFile) {
            setErrorMsg("Please choose an image file to upload.");
            return;
        }

        if (plates.length >= MAX_PLATES) {
            setErrorMsg(`Maximum limit of ${MAX_PLATES} plates reached. Delete an existing plate to upload a new one.`);
            return;
        }

        setUploading(true);
        setErrorMsg(null);
        setSuccessMsg(null);

        try {
            const formData = new FormData();
            formData.append("image", selectedFile);
            formData.append("title", title.trim() || "Untitled Plate");
            formData.append("place", place.trim());
            formData.append("description", description.trim());
            formData.append("sort_order", plates.length.toString());

            const res = await sketchbookService.uploadImage(formData);

            setSuccessMsg("Image converted to WebP and added to Curated Works successfully!");
            clearSelectedFile();
            setTitle("");
            setPlace("");
            setDescription("");
            fetchPlates();
        } catch (err) {
            console.error("Upload error:", err);
            setErrorMsg(err?.response?.data?.message || err.message || "Failed to upload image. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    // Delete Plate
    const confirmDelete = async () => {
        if (!deleteModalItem) return;
        setDeleting(true);

        try {
            await sketchbookService.deleteImage(deleteModalItem.id);
            setPlates((prev) => prev.filter((p) => p.id !== deleteModalItem.id));
            setDeleteModalItem(null);
            setSuccessMsg("Plate removed successfully.");
        } catch (err) {
            console.error("Delete error:", err);
            alert("Could not delete plate. Please try again.");
        } finally {
            setDeleting(false);
        }
    };

    // Reorder Plate (Move up/down)
    const movePlate = async (index, direction) => {
        const targetIndex = index + direction;
        if (targetIndex < 0 || targetIndex >= plates.length) return;

        const updated = [...plates];
        const [moved] = updated.splice(index, 1);
        updated.splice(targetIndex, 0, moved);

        setPlates(updated);

        try {
            const orderedIds = updated.map((p) => p.id);
            await sketchbookService.reorderImages(orderedIds);
        } catch (err) {
            console.error("Reorder error:", err);
            fetchPlates();
        }
    };

    const isLimitReached = plates.length >= MAX_PLATES;

    return (
        <section className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#D6CDC2]">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-[9px] uppercase tracking-widest text-[#8C8278]">
                            [ CHAPTER 02 // THE INFINITE PAGES ]
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-[#14100E] text-[#F4EDE4] font-semibold">
                            {plates.length} / {MAX_PLATES} PLATES
                        </span>
                    </div>
                    <h2 className="font-sans font-bold text-2xl text-[#14100E] tracking-tight">
                        Curated Works &amp; Sketchbook Plates
                    </h2>
                    <p className="text-xs text-[#6B625A] mt-0.5">
                        Upload custom plates for the interactive 3D book section. All images are automatically converted to optimized <strong>WebP</strong> format.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={fetchPlates}
                        disabled={loading}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#FAF7F2] border border-[#D6CDC2] hover:bg-[#14100E] hover:text-[#FAF7F2] text-xs font-mono uppercase transition-colors cursor-pointer shadow-xs"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                        <span>Refresh</span>
                    </button>
                </div>
            </div>

            {/* Notification Banners */}
            {errorMsg && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-900 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                        <span>{errorMsg}</span>
                    </div>
                    <button onClick={() => setErrorMsg(null)} className="text-red-700 underline text-xs">
                        Dismiss
                    </button>
                </div>
            )}

            {successMsg && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-900 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{successMsg}</span>
                    </div>
                    <button onClick={() => setSuccessMsg(null)} className="text-emerald-700 underline text-xs">
                        Dismiss
                    </button>
                </div>
            )}

            {/* Capacity Progress Bar */}
            <div className="p-4 rounded-xl bg-[#F4EDE4] border border-[#D6CDC2] space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[#6B625A]">
                        CAPACITY: <strong>{plates.length} of {MAX_PLATES}</strong> plates filled
                    </span>
                    <span className="text-[#8C8278]">
                        {isLimitReached ? "Maximum reached" : `${MAX_PLATES - plates.length} slots available`}
                    </span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#E0D6C8] overflow-hidden">
                    <div
                        className={`h-full transition-all duration-300 ${
                            isLimitReached ? "bg-amber-600" : "bg-[#14100E]"
                        }`}
                        style={{ width: `${(plates.length / MAX_PLATES) * 100}%` }}
                    />
                </div>
                {plates.length === 0 && (
                    <p className="text-[11px] text-[#8C8278] pt-1">
                        ℹ️ No custom images uploaded yet. The 3D Infinite Pages section is currently showing the <strong>15 built-in fallback plates</strong>.
                    </p>
                )}
            </div>

            {/* Upload New Plate Form */}
            <div className="p-6 rounded-2xl bg-[#F4EDE4] border border-[#D6CDC2] shadow-xs">
                <div className="flex items-center justify-between pb-4 border-b border-[#D6CDC2]/60 mb-5">
                    <div className="flex items-center gap-2">
                        <UploadCloud className="w-4 h-4 text-[#C5A059]" />
                        <h3 className="font-sans font-bold text-base text-[#14100E]">
                            Add New Plate (Converts to WebP)
                        </h3>
                    </div>
                    {isLimitReached && (
                        <span className="text-xs font-mono text-amber-800 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
                            Limit Reached (10/10)
                        </span>
                    )}
                </div>

                {isLimitReached ? (
                    <div className="text-center py-6 space-y-2 text-xs text-[#6B625A]">
                        <p className="font-semibold text-[#14100E]">
                            You have uploaded the maximum allowed 10 plates.
                        </p>
                        <p>
                            To add a new image, please delete or replace one of your existing plates below.
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleUpload} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                            {/* File Upload / Drop Area */}
                            <div className="md:col-span-5">
                                <label className="block text-xs font-mono uppercase text-[#6B625A] mb-1.5">
                                    Select Image <span className="text-red-600">*</span>
                                </label>
                                {filePreview ? (
                                    <div className="relative rounded-xl overflow-hidden border-2 border-[#14100E] bg-black/5 aspect-[4/3] flex items-center justify-center">
                                        <img
                                            src={filePreview}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={clearSelectedFile}
                                            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white hover:bg-black transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                        <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 text-[10px] font-mono text-white">
                                            Will convert to .webp
                                        </span>
                                    </div>
                                ) : (
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="rounded-xl border-2 border-dashed border-[#D6CDC2] hover:border-[#14100E] bg-[#FAF7F2] p-6 text-center cursor-pointer transition-colors aspect-[4/3] flex flex-col items-center justify-center space-y-2"
                                    >
                                        <ImageIcon className="w-8 h-8 text-[#8C8278]" />
                                        <div className="text-xs text-[#14100E] font-medium">
                                            Click to browse image
                                        </div>
                                        <p className="text-[11px] text-[#8C8278]">
                                            PNG, JPG, JPEG, WEBP, AVIF up to 20MB
                                        </p>
                                    </div>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </div>

                            {/* Metadata Inputs */}
                            <div className="md:col-span-7 space-y-3.5">
                                <div>
                                    <label className="block text-xs font-mono uppercase text-[#6B625A] mb-1">
                                        Plate Title <span className="text-red-600">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="e.g. Synchronized Asanas"
                                        className="w-full bg-[#FAF7F2] border border-[#D6CDC2] rounded-xl text-xs px-3.5 py-2.5 text-[#14100E] outline-none focus:border-[#14100E]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-mono uppercase text-[#6B625A] mb-1">
                                        Location / Place
                                    </label>
                                    <input
                                        type="text"
                                        value={place}
                                        onChange={(e) => setPlace(e.target.value)}
                                        placeholder="e.g. Ganges Riverbank, Rishikesh"
                                        className="w-full bg-[#FAF7F2] border border-[#D6CDC2] rounded-xl text-xs px-3.5 py-2.5 text-[#14100E] outline-none focus:border-[#14100E]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-mono uppercase text-[#6B625A] mb-1">
                                        Description / Brief Notes
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Brief artistic description of this plate..."
                                        className="w-full bg-[#FAF7F2] border border-[#D6CDC2] rounded-xl text-xs px-3.5 py-2 text-[#14100E] outline-none focus:border-[#14100E] resize-none"
                                    />
                                </div>

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={uploading || !selectedFile}
                                        className="px-6 py-2.5 rounded-xl bg-[#14100E] text-[#F4EDE4] text-xs font-mono uppercase tracking-wider font-semibold inline-flex items-center gap-2 hover:bg-[#2A2420] transition-colors cursor-pointer disabled:opacity-50"
                                    >
                                        {uploading ? (
                                            <>
                                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                                <span>Converting to WebP &amp; Uploading...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Plus className="w-3.5 h-3.5" />
                                                <span>Save Plate to Infinite Pages</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                )}
            </div>

            {/* Existing Plates Grid */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="font-sans font-bold text-base text-[#14100E]">
                        Current Plates in Infinite Pages ({plates.length})
                    </h3>
                    <span className="font-mono text-xs text-[#8C8278]">
                        Ordered by book page appearance
                    </span>
                </div>

                {loading ? (
                    <div className="p-12 text-center bg-[#F4EDE4] border border-[#D6CDC2] rounded-2xl">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#14100E]" />
                        <p className="font-mono text-xs uppercase text-[#8C8278] mt-2">Loading plates...</p>
                    </div>
                ) : plates.length === 0 ? (
                    <div className="p-12 text-center bg-[#F4EDE4] border border-[#D6CDC2] rounded-2xl space-y-3">
                        <Layers className="w-8 h-8 mx-auto text-[#8C8278]" />
                        <h4 className="font-sans font-bold text-base text-[#14100E]">
                            No Custom Plates Uploaded Yet
                        </h4>
                        <p className="text-xs text-[#6B625A] max-w-md mx-auto">
                            The portfolio is currently displaying the default 15 plates. Upload your first image above to customize the Curated Works book.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {plates.map((plate, index) => (
                            <div
                                key={plate.id}
                                className="bg-[#F4EDE4] border border-[#D6CDC2] rounded-2xl overflow-hidden flex flex-col justify-between group shadow-xs hover:border-[#14100E] transition-all"
                            >
                                <div>
                                    {/* Image with WebP badge and fallback error handling */}
                                    <div className="relative aspect-[4/3] bg-black/10 overflow-hidden">
                                        <img
                                            src={plate.image_url}
                                            alt={plate.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            onError={(e) => {
                                                // Fallback to local default plate if image fails to load
                                                e.currentTarget.src = "/landing-pages/meng-to-sketchbook/1956C3DE-266A-4B87-95D6-B5705F71403D_1_201_a.webp";
                                            }}
                                        />
                                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-xs text-[10px] font-mono text-white font-semibold">
                                            PAGE {String(index + 1).padStart(2, "0")}
                                        </div>
                                        <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-emerald-800 text-[9px] font-mono uppercase text-white font-bold">
                                            WEBP
                                        </div>
                                    </div>

                                    {/* Plate Metadata */}
                                    <div className="p-4 space-y-1">
                                        <h4 className="font-sans font-bold text-sm text-[#14100E] truncate">
                                            {plate.title}
                                        </h4>
                                        <p className="font-mono text-[11px] text-[#8C8278] truncate">
                                            {plate.place || "Unspecified Location"}
                                        </p>
                                        {plate.description && (
                                            <p className="text-xs text-[#6B625A] line-clamp-2 pt-1">
                                                {plate.description}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Actions Bar */}
                                <div className="p-3 bg-[#EAE2D7]/60 border-t border-[#D6CDC2]/60 flex items-center justify-between">
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => movePlate(index, -1)}
                                            disabled={index === 0}
                                            title="Move earlier in book"
                                            className="p-1 rounded text-[#6B625A] hover:text-[#14100E] disabled:opacity-30 cursor-pointer"
                                        >
                                            <MoveUp className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => movePlate(index, 1)}
                                            disabled={index === plates.length - 1}
                                            title="Move later in book"
                                            className="p-1 rounded text-[#6B625A] hover:text-[#14100E] disabled:opacity-30 cursor-pointer"
                                        >
                                            <MoveDown className="w-3.5 h-3.5" />
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <a
                                            href={plate.image_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            title="View WebP image"
                                            className="p-1 text-[#8C8278] hover:text-[#14100E]"
                                        >
                                            <ExternalLink className="w-3.5 h-3.5" />
                                        </a>
                                        <button
                                            onClick={() => setDeleteModalItem(plate)}
                                            title="Delete plate"
                                            className="p-1 text-red-600 hover:text-red-700 cursor-pointer"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {deleteModalItem && (
                <div
                    className="fixed inset-0 z-50 bg-[#14100E]/60 backdrop-blur-xs flex items-center justify-center p-4"
                    onClick={() => setDeleteModalItem(null)}
                >
                    <div
                        className="w-full max-w-sm bg-[#F4EDE4] border border-[#D6CDC2] rounded-2xl shadow-2xl p-6 text-center space-y-4 animate-in fade-in zoom-in-95"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 text-red-600 flex items-center justify-center mx-auto">
                            <Trash2 className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="font-sans font-bold text-lg text-[#14100E]">Delete Plate?</h4>
                            <p className="text-xs text-[#6B625A] mt-1">
                                Are you sure you want to remove <strong>{deleteModalItem.title}</strong> from the Infinite Pages book?
                            </p>
                        </div>
                        <div className="flex items-center justify-center gap-3 pt-2">
                            <button
                                onClick={() => setDeleteModalItem(null)}
                                className="px-4 py-2 rounded-xl border border-[#D6CDC2] text-xs font-mono uppercase text-[#6B625A] hover:bg-black/5 cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                disabled={deleting}
                                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-mono uppercase font-semibold transition-colors cursor-pointer disabled:opacity-60"
                            >
                                {deleting ? "Deleting..." : "Yes, Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}

