"use client";

import React, { useState, useEffect } from "react";
import { X, Save, Sparkles } from "lucide-react";
import { KNOWLEDGE_FIELDS, KNOWLEDGE_STATUSES } from "../config/portfolioKnowledgeConfig";
import { usePortfolioKnowledge } from "../provider/PortfolioKnowledgeProvider";

export default function KnowledgeFormModal() {
    const {
        formModalOpen,
        editingItem,
        saving,
        categories,
        handleCloseFormModal,
        handleSaveKnowledge,
    } = usePortfolioKnowledge();

    const [formData, setFormData] = useState({
        title: "",
        content: "",
        category: "Camera Equipment",
        project: "",
        keywords: "",
        status: "published",
    });

    useEffect(() => {
        if (editingItem) {
            setFormData({
                title: editingItem.title || "",
                content: editingItem.content || editingItem.fact || "",
                category: editingItem.category || "Camera Equipment",
                project: editingItem.project || "",
                keywords: Array.isArray(editingItem.keywords)
                    ? editingItem.keywords.join(", ")
                    : editingItem.keywords || "",
                status: editingItem.status || "published",
            });
        } else {
            setFormData({
                title: "",
                content: "",
                category: categories[0] || "Camera Equipment",
                project: "",
                keywords: "",
                status: "published",
            });
        }
    }, [editingItem, formModalOpen, categories]);

    if (!formModalOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            ...formData,
            keywords: formData.keywords
                .split(",")
                .map((k) => k.trim())
                .filter(Boolean),
            is_published: formData.status === "published",
        };
        await handleSaveKnowledge(payload, editingItem?.id);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 bg-[#F4EDE4] border border-[#D6CDC2] rounded-2xl shadow-2xl space-y-4">
                <button
                    type="button"
                    onClick={handleCloseFormModal}
                    disabled={saving}
                    className="absolute top-4 right-4 p-1 text-[#8C8278] hover:text-[#14100E] rounded-lg transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-2.5 pb-2 border-b border-[#D6CDC2]">
                    <div className="p-2 rounded-xl bg-[#14100E] text-[#F4EDE4]">
                        <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="font-sans font-bold text-base text-[#14100E]">
                            {editingItem ? "Edit Knowledge Fact" : "Add New Knowledge Fact"}
                        </h3>
                        <p className="text-xs text-[#6B625A]">
                            Provide structured facts for the AI assistant to reference during visitor conversations.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3.5">
                    {/* Title */}
                    <div>
                        <label className="block text-[11px] font-mono uppercase text-[#6B625A] mb-1">
                            {KNOWLEDGE_FIELDS.title.label} *
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder={KNOWLEDGE_FIELDS.title.placeholder}
                            className="w-full px-3 py-2 text-xs bg-[#EAE2D7] border border-[#D6CDC2] rounded-lg text-[#14100E] focus:outline-none focus:border-[#14100E]"
                            required
                        />
                    </div>

                    {/* Content / Fact */}
                    <div>
                        <label className="block text-[11px] font-mono uppercase text-[#6B625A] mb-1">
                            {KNOWLEDGE_FIELDS.content.label} *
                        </label>
                        <textarea
                            rows={4}
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            placeholder={KNOWLEDGE_FIELDS.content.placeholder}
                            className="w-full px-3 py-2 text-xs bg-[#EAE2D7] border border-[#D6CDC2] rounded-lg text-[#14100E] focus:outline-none focus:border-[#14100E]"
                            required
                        />
                    </div>

                    {/* Category & Status */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[11px] font-mono uppercase text-[#6B625A] mb-1">
                                {KNOWLEDGE_FIELDS.category.label} *
                            </label>
                            <input
                                type="text"
                                list="categories-list"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                placeholder="Choose or type category..."
                                className="w-full px-3 py-2 text-xs bg-[#EAE2D7] border border-[#D6CDC2] rounded-lg text-[#14100E] focus:outline-none focus:border-[#14100E]"
                                required
                            />
                            <datalist id="categories-list">
                                {categories.map((c) => (
                                    <option key={c} value={c} />
                                ))}
                            </datalist>
                        </div>

                        <div>
                            <label className="block text-[11px] font-mono uppercase text-[#6B625A] mb-1">
                                {KNOWLEDGE_FIELDS.status.label}
                            </label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="w-full px-3 py-2 text-xs bg-[#EAE2D7] border border-[#D6CDC2] rounded-lg text-[#14100E] focus:outline-none focus:border-[#14100E] cursor-pointer"
                            >
                                {KNOWLEDGE_STATUSES.filter((s) => s.value !== "").map((s) => (
                                    <option key={s.value} value={s.value}>
                                        {s.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Associated Project & Keywords */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[11px] font-mono uppercase text-[#6B625A] mb-1">
                                {KNOWLEDGE_FIELDS.project.label}
                            </label>
                            <input
                                type="text"
                                value={formData.project}
                                onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                                placeholder={KNOWLEDGE_FIELDS.project.placeholder}
                                className="w-full px-3 py-2 text-xs bg-[#EAE2D7] border border-[#D6CDC2] rounded-lg text-[#14100E] focus:outline-none focus:border-[#14100E]"
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-mono uppercase text-[#6B625A] mb-1">
                                {KNOWLEDGE_FIELDS.keywords.label}
                            </label>
                            <input
                                type="text"
                                value={formData.keywords}
                                onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                                placeholder={KNOWLEDGE_FIELDS.keywords.placeholder}
                                className="w-full px-3 py-2 text-xs bg-[#EAE2D7] border border-[#D6CDC2] rounded-lg text-[#14100E] focus:outline-none focus:border-[#14100E]"
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-3 border-t border-[#D6CDC2] flex items-center justify-end gap-2.5">
                        <button
                            type="button"
                            onClick={handleCloseFormModal}
                            disabled={saving}
                            className="px-4 py-2 text-xs font-semibold rounded-lg border border-[#D6CDC2] bg-[#EAE2D7] hover:bg-[#D6CDC2]/50 text-[#14100E] transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#14100E] hover:bg-[#2A2420] text-[#F4EDE4] flex items-center gap-1.5 transition-colors disabled:opacity-50"
                        >
                            <Save className="w-3.5 h-3.5" />
                            <span>{saving ? "Saving Fact..." : "Save Knowledge Fact"}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

