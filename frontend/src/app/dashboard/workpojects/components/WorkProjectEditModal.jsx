"use client";

import React, { useState, useEffect } from "react";
import { X, Save, Film, Star } from "lucide-react";
import {
    CAMERA_OPTIONS,
    LENS_OPTIONS,
    RATIO_OPTIONS,
    DEFAULT_FLOATING_TAGS,
} from "../config/workProjectsConfig";
import { useWorkProjects } from "../provider/WorkProjectsProvider";

export default function WorkProjectEditModal() {
    const {
        editingProject,
        editSubmitting,
        setEditingProject,
        handleUpdateProject,
    } = useWorkProjects();

    const [form, setForm] = useState({
        title: "",
        tag: "FEATURED",
        client: "",
        stationName: "",
        summary: "",
        camera: "ARRI LF",
        lens: "ANAMORPHIC",
        formatRatio: "2.39:1",
        isFeatured: false,
    });

    useEffect(() => {
        if (editingProject) {
            setForm({
                title: editingProject.title || "",
                tag: editingProject.tag || "FEATURED",
                client: editingProject.client || "",
                stationName: editingProject.stationName || "",
                summary: editingProject.summary || "",
                camera: editingProject.camera || "ARRI LF",
                lens: editingProject.lens || "ANAMORPHIC",
                formatRatio: editingProject.formatRatio || "2.39:1",
                isFeatured: Boolean(editingProject.isFeatured),
            });
        }
    }, [editingProject]);

    if (!editingProject) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        await handleUpdateProject(editingProject.id, form);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 bg-[#F4EDE4] border border-[#D6CDC2] rounded-2xl shadow-2xl space-y-4">
                <button
                    type="button"
                    onClick={() => setEditingProject(null)}
                    disabled={editSubmitting}
                    className="absolute top-4 right-4 p-1 text-[#8C8278] hover:text-[#14100E] rounded-lg transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-2.5 pb-2 border-b border-[#D6CDC2]">
                    <div className="p-2 rounded-xl bg-[#14100E] text-[#F4EDE4]">
                        <Film className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="font-sans font-bold text-base text-[#14100E]">
                            Edit Project Metadata
                        </h3>
                        <p className="text-xs text-[#6B625A]">
                            Update client, camera package, aspect ratio, or station title.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3.5">
                    <div>
                        <label className="block text-[11px] font-mono uppercase text-[#6B625A] mb-1">
                            Title *
                        </label>
                        <input
                            type="text"
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            className="w-full px-3 py-2 text-xs bg-[#EAE2D7] border border-[#D6CDC2] rounded-lg text-[#14100E] focus:outline-none focus:border-[#14100E]"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[11px] font-mono uppercase text-[#6B625A] mb-1">
                                Client
                            </label>
                            <input
                                type="text"
                                value={form.client}
                                onChange={(e) => setForm({ ...form, client: e.target.value })}
                                className="w-full px-3 py-2 text-xs bg-[#EAE2D7] border border-[#D6CDC2] rounded-lg text-[#14100E] focus:outline-none focus:border-[#14100E]"
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-mono uppercase text-[#6B625A] mb-1">
                                Station Name
                            </label>
                            <input
                                type="text"
                                value={form.stationName}
                                onChange={(e) => setForm({ ...form, stationName: e.target.value })}
                                className="w-full px-3 py-2 text-xs bg-[#EAE2D7] border border-[#D6CDC2] rounded-lg text-[#14100E] focus:outline-none focus:border-[#14100E]"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className="block text-[10px] font-mono uppercase text-[#6B625A] mb-1">
                                Camera
                            </label>
                            <select
                                value={form.camera}
                                onChange={(e) => setForm({ ...form, camera: e.target.value })}
                                className="w-full px-2.5 py-1.5 text-xs bg-[#EAE2D7] border border-[#D6CDC2] rounded-lg text-[#14100E]"
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
                                value={form.lens}
                                onChange={(e) => setForm({ ...form, lens: e.target.value })}
                                className="w-full px-2.5 py-1.5 text-xs bg-[#EAE2D7] border border-[#D6CDC2] rounded-lg text-[#14100E]"
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
                                Aspect Ratio
                            </label>
                            <select
                                value={form.formatRatio}
                                onChange={(e) => setForm({ ...form, formatRatio: e.target.value })}
                                className="w-full px-2.5 py-1.5 text-xs bg-[#EAE2D7] border border-[#D6CDC2] rounded-lg text-[#14100E]"
                            >
                                {RATIO_OPTIONS.map((r) => (
                                    <option key={r} value={r}>
                                        {r}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[11px] font-mono uppercase text-[#6B625A] mb-1">
                            Summary &amp; Cine Notes
                        </label>
                        <textarea
                            rows={3}
                            value={form.summary}
                            onChange={(e) => setForm({ ...form, summary: e.target.value })}
                            className="w-full px-3 py-2 text-xs bg-[#EAE2D7] border border-[#D6CDC2] rounded-lg text-[#14100E] focus:outline-none focus:border-[#14100E] resize-none"
                        />
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                        <input
                            type="checkbox"
                            id="edit-featured-toggle"
                            checked={form.isFeatured}
                            onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                            className="rounded border-[#D6CDC2] text-[#14100E] focus:ring-0"
                        />
                        <label htmlFor="edit-featured-toggle" className="text-xs text-[#14100E] font-medium cursor-pointer flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 text-amber-600 fill-current" />
                            <span>Mark as Featured Project on Top Train Line</span>
                        </label>
                    </div>

                    <div className="pt-3 border-t border-[#D6CDC2] flex items-center justify-end gap-2.5">
                        <button
                            type="button"
                            onClick={() => setEditingProject(null)}
                            disabled={editSubmitting}
                            className="px-4 py-2 text-xs font-semibold rounded-lg border border-[#D6CDC2] bg-[#EAE2D7] hover:bg-[#D6CDC2]/50 text-[#14100E] transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={editSubmitting}
                            className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#14100E] hover:bg-[#2A2420] text-[#F4EDE4] flex items-center gap-1.5 transition-colors disabled:opacity-50"
                        >
                            <Save className="w-3.5 h-3.5" />
                            <span>{editSubmitting ? "Saving..." : "Save Project"}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

