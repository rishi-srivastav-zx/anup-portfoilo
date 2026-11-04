"use client";

import React, { useState, useEffect } from "react";
import {
    X,
    Save,
    Sparkles,
    Eye,
    Edit3,
    Tag,
    Globe,
    Lock,
    Archive,
    Check,
    AlertCircle,
} from "lucide-react";
import { getKnowledgeStatusBadge } from "./KnowledgeTable";

export default function KnowledgeFormModal({
    isOpen,
    onClose,
    onSave,
    initialData = null,
    categories = [],
    saving = false,
}) {
    const isEdit = Boolean(initialData?.id);

    const [form, setForm] = useState({
        title: "",
        category: "",
        content: "",
        projectName: "",
        keywordsInput: "",
        status: "published",
        intent: "",
        metadataJson: "{}",
    });

    const [customCategory, setCustomCategory] = useState(false);
    const [activeTab, setActiveTab] = useState("edit"); // 'edit' | 'preview'
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (!isOpen) return;

        if (initialData) {
            const kw = Array.isArray(initialData.keywords)
                ? initialData.keywords.join(", ")
                : initialData.keywords || "";

            const cat = initialData.category || "";
            const isExistingCat = categories.includes(cat);

            setForm({
                title: initialData.title || "",
                category: cat,
                content: initialData.content || "",
                projectName: initialData.project_name || initialData.projectName || "",
                keywordsInput: kw,
                status: initialData.status || "published",
                intent: initialData.metadata?.intent || "",
                metadataJson: JSON.stringify(initialData.metadata || {}, null, 2),
            });
            setCustomCategory(!isExistingCat && Boolean(cat));
        } else {
            setForm({
                title: "",
                category: categories[0] || "General Information",
                content: "",
                projectName: "",
                keywordsInput: "",
                status: "published",
                intent: "",
                metadataJson: "{}",
            });
            setCustomCategory(false);
        }

        setErrors({});
        setActiveTab("edit");
    }, [isOpen, initialData, categories]);

    const validate = () => {
        const errs = {};
        if (!form.title.trim()) {
            errs.title = "Title is required.";
        } else if (form.title.length > 255) {
            errs.title = "Title cannot exceed 255 characters.";
        }

        if (!form.category.trim()) {
            errs.category = "Category is required.";
        } else if (form.category.length > 100) {
            errs.category = "Category cannot exceed 100 characters.";
        }

        if (!form.content.trim()) {
            errs.content = "Knowledge content is required.";
        }

        if (form.projectName && form.projectName.length > 255) {
            errs.projectName = "Project name cannot exceed 255 characters.";
        }

        if (form.metadataJson) {
            try {
                JSON.parse(form.metadataJson);
            } catch {
                errs.metadataJson = "Metadata must be valid JSON.";
            }
        }

        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;

        // Process keywords
        const keywords = form.keywordsInput
            .split(/[,;\n]/)
            .map((k) => k.trim())
            .filter(Boolean);

        let parsedMetadata = {};
        try {
            parsedMetadata = JSON.parse(form.metadataJson || "{}");
        } catch {
            parsedMetadata = {};
        }

        if (form.intent) {
            parsedMetadata.intent = form.intent.trim();
        }

        const payload = {
            title: form.title.trim(),
            category: form.category.trim(),
            content: form.content.trim(),
            projectName: form.projectName.trim() || null,
            keywords,
            status: form.status,
            isPublished: form.status === "published",
            metadata: parsedMetadata,
        };

        onSave(payload, initialData?.id);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div className="relative w-full max-w-2xl bg-[#F4EDE4] border border-[#D6CDC2] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-5 border-b border-[#D6CDC2] bg-[#EAE2D7] flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-[#14100E] text-amber-300">
                            <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                            <h2 className="font-sans font-bold text-base text-[#14100E]">
                                {isEdit ? "Edit Knowledge Record" : "Add New Knowledge Record"}
                            </h2>
                            <p className="text-[11px] font-mono text-[#8C8278]">
                                Stored in Neon PostgreSQL for the AI chatbot knowledge engine
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 text-[#8C8278] hover:text-[#14100E] rounded-lg border border-[#D6CDC2] hover:bg-[#F4EDE4] transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Tabs: Form Editor vs Live Assistant Preview */}
                <div className="px-5 border-b border-[#D6CDC2] flex gap-4 text-xs font-medium text-[#8C8278] bg-[#F4EDE4]">
                    <button
                        type="button"
                        onClick={() => setActiveTab("edit")}
                        className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
                            activeTab === "edit"
                                ? "border-[#14100E] text-[#14100E] font-semibold"
                                : "border-transparent hover:text-[#14100E]"
                        }`}
                    >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Knowledge Fields</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab("preview")}
                        className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
                            activeTab === "preview"
                                ? "border-[#14100E] text-[#14100E] font-semibold"
                                : "border-transparent hover:text-[#14100E]"
                        }`}
                    >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Assistant Knowledge Preview</span>
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-5">
                    {activeTab === "edit" ? (
                        <form id="knowledge-form" onSubmit={handleSubmit} className="space-y-4 text-xs">
                            {/* Title */}
                            <div className="space-y-1">
                                <div className="flex justify-between items-center">
                                    <label className="text-[11px] font-mono uppercase tracking-wider text-[#6B625A]">
                                        Knowledge Title *
                                    </label>
                                    <span className="text-[10px] text-[#8C8278] font-mono">
                                        {form.title.length}/255
                                    </span>
                                </div>
                                <input
                                    type="text"
                                    required
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    placeholder="e.g., Sony FX3 and FX6 Primary Cinema Camera Package"
                                    className={`w-full px-3 py-2 bg-[#EAE2D7] border rounded-lg text-[#14100E] focus:outline-none ${
                                        errors.title ? "border-red-500" : "border-[#D6CDC2] focus:border-[#14100E]"
                                    }`}
                                />
                                {errors.title && <p className="text-[10px] text-red-600">{errors.title}</p>}
                            </div>

                            {/* Category & Status */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {/* Category with Custom Option */}
                                <div className="space-y-1">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[11px] font-mono uppercase tracking-wider text-[#6B625A]">
                                            Category *
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => setCustomCategory(!customCategory)}
                                            className="text-[10px] text-amber-700 hover:underline"
                                        >
                                            {customCategory ? "Select Existing" : "+ Custom Category"}
                                        </button>
                                    </div>

                                    {customCategory ? (
                                        <input
                                            type="text"
                                            required
                                            value={form.category}
                                            onChange={(e) => setForm({ ...form, category: e.target.value })}
                                            placeholder="Type custom category name..."
                                            className={`w-full px-3 py-2 bg-[#EAE2D7] border rounded-lg text-[#14100E] focus:outline-none ${
                                                errors.category ? "border-red-500" : "border-[#D6CDC2] focus:border-[#14100E]"
                                            }`}
                                        />
                                    ) : (
                                        <select
                                            value={form.category}
                                            onChange={(e) => setForm({ ...form, category: e.target.value })}
                                            className="w-full px-3 py-2 bg-[#EAE2D7] border border-[#D6CDC2] rounded-lg text-[#14100E] focus:outline-none cursor-pointer"
                                        >
                                            {categories.map((c) => (
                                                <option key={c} value={c}>
                                                    {c}
                                                </option>
                                            ))}
                                            {categories.length === 0 && (
                                                <option value="General Information">General Information</option>
                                            )}
                                        </select>
                                    )}
                                    {errors.category && <p className="text-[10px] text-red-600">{errors.category}</p>}
                                </div>

                                {/* Publication Status */}
                                <div className="space-y-1">
                                    <label className="text-[11px] font-mono uppercase tracking-wider text-[#6B625A]">
                                        Publication Status *
                                    </label>
                                    <select
                                        value={form.status}
                                        onChange={(e) => setForm({ ...form, status: e.target.value })}
                                        className="w-full px-3 py-2 bg-[#EAE2D7] border border-[#D6CDC2] rounded-lg text-[#14100E] focus:outline-none cursor-pointer font-medium"
                                    >
                                        <option value="published">Published (Live in AI Chatbot)</option>
                                        <option value="draft">Draft (Hidden from Public)</option>
                                        <option value="archived">Archived (Deprecated)</option>
                                    </select>
                                    <p className="text-[10px] text-[#8C8278]">
                                        {form.status === "published"
                                            ? "✓ Active in visitor retrieval engine."
                                            : "🔒 Strictly hidden from public visitor queries."}
                                    </p>
                                </div>
                            </div>

                            {/* Content Body */}
                            <div className="space-y-1">
                                <label className="text-[11px] font-mono uppercase tracking-wider text-[#6B625A]">
                                    Knowledge Content (Fact Source) *
                                </label>
                                <textarea
                                    required
                                    rows={5}
                                    value={form.content}
                                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                                    placeholder="Write factual, clear statements about Anup Rawat, gear, techniques, client deliverables, or projects..."
                                    className={`w-full px-3 py-2 bg-[#EAE2D7] border rounded-lg text-[#14100E] focus:outline-none leading-relaxed font-sans ${
                                        errors.content ? "border-red-500" : "border-[#D6CDC2] focus:border-[#14100E]"
                                    }`}
                                />
                                {errors.content && <p className="text-[10px] text-red-600">{errors.content}</p>}
                            </div>

                            {/* Project Name & Intent */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[11px] font-mono uppercase tracking-wider text-[#6B625A]">
                                        Linked Project Name (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={form.projectName}
                                        onChange={(e) => setForm({ ...form, projectName: e.target.value })}
                                        placeholder="e.g., Echoes of Silence, Mountain Trail"
                                        className="w-full px-3 py-2 bg-[#EAE2D7] border border-[#D6CDC2] rounded-lg text-[#14100E] focus:outline-none focus:border-[#14100E]"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[11px] font-mono uppercase tracking-wider text-[#6B625A]">
                                        Target Intent (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={form.intent}
                                        onChange={(e) => setForm({ ...form, intent: e.target.value })}
                                        placeholder="e.g., camera_inquiry, pricing_inquiry"
                                        className="w-full px-3 py-2 bg-[#EAE2D7] border border-[#D6CDC2] rounded-lg text-[#14100E] focus:outline-none focus:border-[#14100E]"
                                    />
                                </div>
                            </div>

                            {/* Keywords */}
                            <div className="space-y-1">
                                <label className="text-[11px] font-mono uppercase tracking-wider text-[#6B625A]">
                                    Keywords &amp; Aliases (Comma-separated)
                                </label>
                                <input
                                    type="text"
                                    value={form.keywordsInput}
                                    onChange={(e) => setForm({ ...form, keywordsInput: e.target.value })}
                                    placeholder="e.g., sony fx3, fx6, camera, gear, shoot setup, 4k 120fps"
                                    className="w-full px-3 py-2 bg-[#EAE2D7] border border-[#D6CDC2] rounded-lg text-[#14100E] focus:outline-none focus:border-[#14100E]"
                                />
                                <p className="text-[10px] text-[#8C8278]">
                                    Helps Smart Search match various visitor synonyms and casual phrases.
                                </p>
                            </div>

                            {/* Custom Metadata JSON (Collapsible) */}
                            <details className="p-3 rounded-lg bg-[#EAE2D7] border border-[#D6CDC2] text-[11px] text-[#6B625A]">
                                <summary className="cursor-pointer font-mono font-medium hover:text-[#14100E]">
                                    Advanced: Custom Metadata JSON
                                </summary>
                                <div className="mt-2 space-y-1">
                                    <textarea
                                        rows={3}
                                        value={form.metadataJson}
                                        onChange={(e) => setForm({ ...form, metadataJson: e.target.value })}
                                        className="w-full p-2 bg-[#F4EDE4] font-mono text-[10px] border border-[#D6CDC2] rounded text-[#14100E] focus:outline-none"
                                    />
                                    {errors.metadataJson && (
                                        <p className="text-[10px] text-red-600">{errors.metadataJson}</p>
                                    )}
                                </div>
                            </details>
                        </form>
                    ) : (
                        /* TAB 2: LIVE PREVIEW */
                        <div className="space-y-4">
                            <div className="p-4 rounded-xl bg-[#231C15] border border-[#3A3026] text-[#F4EDE4] space-y-3">
                                <div className="flex items-center justify-between border-b border-[#3A3026] pb-2">
                                    <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400">
                                        Knowledge Card Preview
                                    </span>
                                    <div>{getKnowledgeStatusBadge(form.status)}</div>
                                </div>

                                <h3 className="font-sans font-bold text-base text-[#F4EDE4]">
                                    {form.title || "Untitled Knowledge Record"}
                                </h3>

                                <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono">
                                    <span className="px-2 py-0.5 rounded bg-black/40 text-amber-300 border border-amber-500/20">
                                        Category: {form.category || "Unassigned"}
                                    </span>
                                    {form.projectName && (
                                        <span className="px-2 py-0.5 rounded bg-black/40 text-blue-300 border border-blue-500/20">
                                            Project: {form.projectName}
                                        </span>
                                    )}
                                </div>

                                <p className="text-xs text-[#D6CDC2] leading-relaxed whitespace-pre-wrap font-sans">
                                    {form.content || "No content entered yet."}
                                </p>

                                {form.keywordsInput && (
                                    <div className="pt-2 border-t border-[#3A3026] flex flex-wrap gap-1">
                                        {form.keywordsInput
                                            .split(",")
                                            .map((k) => k.trim())
                                            .filter(Boolean)
                                            .map((kw, i) => (
                                                <span
                                                    key={i}
                                                    className="px-1.5 py-0.5 rounded text-[9px] bg-black/40 text-[#8C8278]"
                                                >
                                                    #{kw}
                                                </span>
                                            ))}
                                    </div>
                                )}
                            </div>

                            <div className="p-3 rounded-lg bg-[#EAE2D7] border border-[#D6CDC2] text-xs text-[#6B625A] flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                                <span>
                                    {form.status === "published"
                                        ? "This knowledge will be indexed immediately for visitor inquiries upon saving."
                                        : "Draft records are excluded from public assistant queries until published."}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-[#D6CDC2] bg-[#EAE2D7] flex items-center justify-between">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving}
                        className="px-4 py-2 text-xs font-semibold text-[#6B625A] hover:text-[#14100E] rounded-lg border border-[#D6CDC2] hover:bg-[#F4EDE4] transition-colors"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        form="knowledge-form"
                        disabled={saving}
                        className="px-5 py-2 text-xs font-semibold text-[#F4EDE4] bg-[#14100E] hover:bg-[#2A2420] rounded-lg flex items-center gap-1.5 shadow-sm transition-colors disabled:opacity-50"
                    >
                        {saving ? (
                            <div className="w-3.5 h-3.5 border-2 border-[#F4EDE4] border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Save className="w-3.5 h-3.5" />
                        )}
                        <span>{saving ? "Saving..." : isEdit ? "Save Changes" : "Create Record"}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
