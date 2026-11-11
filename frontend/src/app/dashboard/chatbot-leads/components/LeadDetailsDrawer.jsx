"use client";

import React, { useState, useEffect } from "react";
import {
    X,
    Phone,
    Mail,
    Calendar,
    MapPin,
    DollarSign,
    Layers,
    MessageSquare,
    Copy,
    Check,
    Trash2,
    Edit3,
    Save,
    Sparkles,
    User,
    Shield,
} from "lucide-react";
import ConversationTranscript from "./ConversationTranscript";
import { PIPELINE_STATUSES, LEAD_FIELDS } from "../config/chatbotLeadsConfig";
import { useChatbotLeads } from "../provider/ChatbotLeadsProvider";

export default function LeadDetailsDrawer() {
    const {
        drawerOpen,
        selectedLead,
        loadingLeadDetails,
        handleCloseDrawer,
        handleUpdateStatus,
        handleUpdateLead,
        handleOpenDeleteModal,
        savingLead,
        activeDrawerTab,
        setActiveDrawerTab,
    } = useChatbotLeads();

    const [copiedPhone, setCopiedPhone] = useState(false);

    // Editable form state
    const [editForm, setEditForm] = useState({
        visitor_name: "",
        phone: "",
        email: "",
        project_type: "",
        project_description: "",
        budget: "",
        preferred_date: "",
        location: "",
        notes: "",
    });

    useEffect(() => {
        if (selectedLead) {
            setEditForm({
                visitor_name: selectedLead.visitor_name || "",
                phone: selectedLead.phone || "",
                email: selectedLead.email || "",
                project_type: selectedLead.project_type || "",
                project_description: selectedLead.project_description || "",
                budget: selectedLead.budget || "",
                preferred_date: selectedLead.preferred_date || "",
                location: selectedLead.location || "",
                notes: selectedLead.notes || "",
            });
        }
    }, [selectedLead]);

    if (!drawerOpen) return null;

    const handleCopyPhone = (phone) => {
        if (!phone) return;
        navigator.clipboard.writeText(phone);
        setCopiedPhone(true);
        setTimeout(() => setCopiedPhone(false), 2000);
    };

    const handleSaveEdit = async (e) => {
        e.preventDefault();
        if (!selectedLead?.id) return;
        const res = await handleUpdateLead(selectedLead.id, editForm);
        if (res.success) {
            setActiveDrawerTab("overview");
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-fade-in flex justify-end">
            <div className="w-full max-w-xl h-full bg-[#F4EDE4] border-l border-[#D6CDC2] shadow-2xl flex flex-col">
                {/* Drawer Top Header */}
                <div className="p-4 sm:p-6 border-b border-[#D6CDC2] bg-[#EAE2D7] flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-[#14100E] text-[#F4EDE4] flex items-center justify-center font-bold text-sm uppercase shrink-0">
                            {selectedLead?.visitor_name
                                ? selectedLead.visitor_name.slice(0, 2).toUpperCase()
                                : "AR"}
                        </div>
                        <div className="truncate">
                            <h2 className="font-sans font-bold text-base text-[#14100E] truncate">
                                {selectedLead?.visitor_name || "Enquiry Record"}
                            </h2>
                            <div className="flex items-center gap-2 text-xs font-mono text-[#8C8278]">
                                <span>{selectedLead?.referenceId || "AR-LEAD"}</span>
                                <span>•</span>
                                <span>
                                    {selectedLead?.created_at
                                        ? new Date(selectedLead.created_at).toLocaleDateString([], {
                                              month: "short",
                                              day: "numeric",
                                              year: "numeric",
                                          })
                                        : "Recent"}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {selectedLead && (
                            <button
                                type="button"
                                onClick={() => handleOpenDeleteModal(selectedLead)}
                                className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete enquiry"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={handleCloseDrawer}
                            className="p-2 text-[#8C8278] hover:text-[#14100E] hover:bg-[#D6CDC2]/60 rounded-lg transition-colors"
                            aria-label="Close"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Status Bar */}
                <div className="p-3 bg-[#E0D6C8] border-b border-[#D6CDC2] flex items-center justify-between gap-3 text-xs shrink-0">
                    <div className="flex items-center gap-2 font-mono text-[#6B625A]">
                        <span>Pipeline Status:</span>
                    </div>
                    <select
                        value={selectedLead?.lead_status || "new"}
                        onChange={(e) => selectedLead && handleUpdateStatus(selectedLead.id, e.target.value)}
                        className="px-3 py-1.5 rounded-lg border border-[#D6CDC2] bg-[#F4EDE4] text-xs font-semibold text-[#14100E] focus:outline-none cursor-pointer"
                    >
                        {PIPELINE_STATUSES.filter((s) => s.value !== "").map((s) => (
                            <option key={s.value} value={s.value}>
                                {s.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Tab Navigation */}
                <div className="flex border-b border-[#D6CDC2] bg-[#EAE2D7] shrink-0">
                    <button
                        type="button"
                        onClick={() => setActiveDrawerTab("overview")}
                        className={`flex-1 py-2.5 text-xs font-mono uppercase tracking-wider text-center border-b-2 transition-colors ${
                            activeDrawerTab === "overview"
                                ? "border-[#14100E] text-[#14100E] font-bold bg-[#F4EDE4]"
                                : "border-transparent text-[#8C8278] hover:text-[#14100E]"
                        }`}
                    >
                        Overview
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveDrawerTab("transcript")}
                        className={`flex-1 py-2.5 text-xs font-mono uppercase tracking-wider text-center border-b-2 transition-colors ${
                            activeDrawerTab === "transcript"
                                ? "border-[#14100E] text-[#14100E] font-bold bg-[#F4EDE4]"
                                : "border-transparent text-[#8C8278] hover:text-[#14100E]"
                        }`}
                    >
                        Transcript ({selectedLead?.messages?.length || 0})
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveDrawerTab("edit")}
                        className={`flex-1 py-2.5 text-xs font-mono uppercase tracking-wider text-center border-b-2 transition-colors ${
                            activeDrawerTab === "edit"
                                ? "border-[#14100E] text-[#14100E] font-bold bg-[#F4EDE4]"
                                : "border-transparent text-[#8C8278] hover:text-[#14100E]"
                        }`}
                    >
                        Edit Details
                    </button>
                </div>

                {/* Tab Contents */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                    {loadingLeadDetails ? (
                        <div className="p-12 text-center space-y-3">
                            <div className="w-8 h-8 border-2 border-[#14100E] border-t-transparent rounded-full animate-spin mx-auto" />
                            <p className="text-xs font-mono text-[#8C8278]">Loading lead record...</p>
                        </div>
                    ) : activeDrawerTab === "overview" ? (
                        <div className="space-y-4">
                            {/* Contact Card */}
                            <div className="p-4 rounded-xl border border-[#D6CDC2] bg-[#EAE2D7] space-y-2.5">
                                <span className="text-[10px] font-mono uppercase tracking-wider text-[#8C8278]">
                                    Direct Contact Information
                                </span>
                                <div className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2 text-[#14100E] font-mono font-medium">
                                        <Phone className="w-3.5 h-3.5 text-[#6B625A]" />
                                        <span>{selectedLead?.phone || "No phone provided"}</span>
                                    </div>
                                    {selectedLead?.phone && (
                                        <button
                                            type="button"
                                            onClick={() => handleCopyPhone(selectedLead.phone)}
                                            className="px-2 py-1 rounded bg-[#D6CDC2] hover:bg-[#C4B9AC] text-[10px] font-mono text-[#14100E] flex items-center gap-1 transition-colors"
                                        >
                                            {copiedPhone ? (
                                                <>
                                                    <Check className="w-3 h-3 text-emerald-700" />
                                                    <span>Copied</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="w-3 h-3" />
                                                    <span>Copy</span>
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>

                                {selectedLead?.email && (
                                    <div className="flex items-center gap-2 text-xs text-[#14100E] font-mono">
                                        <Mail className="w-3.5 h-3.5 text-[#6B625A]" />
                                        <span>{selectedLead.email}</span>
                                    </div>
                                )}
                            </div>

                            {/* Project Scope Grid */}
                            <div className="grid grid-cols-2 gap-3 text-xs">
                                <div className="p-3 rounded-xl border border-[#D6CDC2] bg-[#EAE2D7] space-y-1">
                                    <span className="text-[10px] font-mono uppercase text-[#8C8278] flex items-center gap-1">
                                        <Layers className="w-3 h-3" />
                                        <span>Project Type</span>
                                    </span>
                                    <p className="font-semibold text-[#14100E]">
                                        {selectedLead?.project_type || "Commercial"}
                                    </p>
                                </div>

                                <div className="p-3 rounded-xl border border-[#D6CDC2] bg-[#EAE2D7] space-y-1">
                                    <span className="text-[10px] font-mono uppercase text-[#8C8278] flex items-center gap-1">
                                        <DollarSign className="w-3 h-3" />
                                        <span>Estimated Budget</span>
                                    </span>
                                    <p className="font-semibold text-[#14100E] font-mono">
                                        {selectedLead?.budget || "Flexible"}
                                    </p>
                                </div>

                                <div className="p-3 rounded-xl border border-[#D6CDC2] bg-[#EAE2D7] space-y-1">
                                    <span className="text-[10px] font-mono uppercase text-[#8C8278] flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        <span>Shoot Timeline</span>
                                    </span>
                                    <p className="font-semibold text-[#14100E]">
                                        {selectedLead?.preferred_date || "Not specified"}
                                    </p>
                                </div>

                                <div className="p-3 rounded-xl border border-[#D6CDC2] bg-[#EAE2D7] space-y-1">
                                    <span className="text-[10px] font-mono uppercase text-[#8C8278] flex items-center gap-1">
                                        <MapPin className="w-3 h-3" />
                                        <span>Location</span>
                                    </span>
                                    <p className="font-semibold text-[#14100E]">
                                        {selectedLead?.location || "Dehradun / Remote"}
                                    </p>
                                </div>
                            </div>

                            {/* Creative Brief */}
                            {selectedLead?.project_description && (
                                <div className="p-4 rounded-xl border border-[#D6CDC2] bg-[#EAE2D7] space-y-2">
                                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#8C8278]">
                                        Creative Brief / Project Summary
                                    </span>
                                    <p className="text-xs text-[#14100E] leading-relaxed whitespace-pre-wrap font-sans">
                                        {selectedLead.project_description}
                                    </p>
                                </div>
                            )}

                            {/* Internal Notes */}
                            {selectedLead?.notes && (
                                <div className="p-4 rounded-xl border border-amber-200 bg-amber-50 space-y-1">
                                    <span className="text-[10px] font-mono uppercase tracking-wider text-amber-800">
                                        Internal Studio Notes
                                    </span>
                                    <p className="text-xs text-amber-900 leading-relaxed whitespace-pre-wrap">
                                        {selectedLead.notes}
                                    </p>
                                </div>
                            )}
                        </div>
                    ) : activeDrawerTab === "transcript" ? (
                        <ConversationTranscript
                            messages={selectedLead?.messages || []}
                            conversation={selectedLead?.conversation || null}
                            loading={loadingLeadDetails}
                        />
                    ) : (
                        <form onSubmit={handleSaveEdit} className="space-y-3.5">
                            <div>
                                <label className="block text-[11px] font-mono uppercase text-[#6B625A] mb-1">
                                    {LEAD_FIELDS.visitor_name.label}
                                </label>
                                <input
                                    type="text"
                                    value={editForm.visitor_name}
                                    onChange={(e) =>
                                        setEditForm({ ...editForm, visitor_name: e.target.value })
                                    }
                                    className="w-full px-3 py-2 text-xs bg-[#EAE2D7] border border-[#D6CDC2] rounded-lg text-[#14100E] focus:outline-none focus:border-[#14100E]"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-mono uppercase text-[#6B625A] mb-1">
                                        {LEAD_FIELDS.phone.label}
                                    </label>
                                    <input
                                        type="text"
                                        value={editForm.phone}
                                        onChange={(e) =>
                                            setEditForm({ ...editForm, phone: e.target.value })
                                        }
                                        className="w-full px-3 py-2 text-xs bg-[#EAE2D7] border border-[#D6CDC2] rounded-lg text-[#14100E] font-mono focus:outline-none focus:border-[#14100E]"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-mono uppercase text-[#6B625A] mb-1">
                                        {LEAD_FIELDS.email.label}
                                    </label>
                                    <input
                                        type="email"
                                        value={editForm.email}
                                        onChange={(e) =>
                                            setEditForm({ ...editForm, email: e.target.value })
                                        }
                                        className="w-full px-3 py-2 text-xs bg-[#EAE2D7] border border-[#D6CDC2] rounded-lg text-[#14100E] font-mono focus:outline-none focus:border-[#14100E]"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-mono uppercase text-[#6B625A] mb-1">
                                        {LEAD_FIELDS.project_type.label}
                                    </label>
                                    <input
                                        type="text"
                                        value={editForm.project_type}
                                        onChange={(e) =>
                                            setEditForm({ ...editForm, project_type: e.target.value })
                                        }
                                        className="w-full px-3 py-2 text-xs bg-[#EAE2D7] border border-[#D6CDC2] rounded-lg text-[#14100E] focus:outline-none focus:border-[#14100E]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-mono uppercase text-[#6B625A] mb-1">
                                        {LEAD_FIELDS.budget.label}
                                    </label>
                                    <input
                                        type="text"
                                        value={editForm.budget}
                                        onChange={(e) =>
                                            setEditForm({ ...editForm, budget: e.target.value })
                                        }
                                        className="w-full px-3 py-2 text-xs bg-[#EAE2D7] border border-[#D6CDC2] rounded-lg text-[#14100E] font-mono focus:outline-none focus:border-[#14100E]"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-mono uppercase text-[#6B625A] mb-1">
                                        {LEAD_FIELDS.preferred_date.label}
                                    </label>
                                    <input
                                        type="text"
                                        value={editForm.preferred_date}
                                        onChange={(e) =>
                                            setEditForm({ ...editForm, preferred_date: e.target.value })
                                        }
                                        className="w-full px-3 py-2 text-xs bg-[#EAE2D7] border border-[#D6CDC2] rounded-lg text-[#14100E] focus:outline-none focus:border-[#14100E]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-mono uppercase text-[#6B625A] mb-1">
                                        {LEAD_FIELDS.location.label}
                                    </label>
                                    <input
                                        type="text"
                                        value={editForm.location}
                                        onChange={(e) =>
                                            setEditForm({ ...editForm, location: e.target.value })
                                        }
                                        className="w-full px-3 py-2 text-xs bg-[#EAE2D7] border border-[#D6CDC2] rounded-lg text-[#14100E] focus:outline-none focus:border-[#14100E]"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-mono uppercase text-[#6B625A] mb-1">
                                    {LEAD_FIELDS.project_description.label}
                                </label>
                                <textarea
                                    rows={3}
                                    value={editForm.project_description}
                                    onChange={(e) =>
                                        setEditForm({ ...editForm, project_description: e.target.value })
                                    }
                                    className="w-full px-3 py-2 text-xs bg-[#EAE2D7] border border-[#D6CDC2] rounded-lg text-[#14100E] focus:outline-none focus:border-[#14100E]"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-mono uppercase text-[#6B625A] mb-1">
                                    Studio Notes
                                </label>
                                <textarea
                                    rows={2}
                                    value={editForm.notes}
                                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                                    className="w-full px-3 py-2 text-xs bg-[#EAE2D7] border border-[#D6CDC2] rounded-lg text-[#14100E] focus:outline-none focus:border-[#14100E]"
                                    placeholder="Internal notes, meeting outcomes, call summary..."
                                />
                            </div>

                            <div className="pt-2 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setActiveDrawerTab("overview")}
                                    className="px-4 py-2 text-xs font-semibold rounded-lg border border-[#D6CDC2] bg-[#EAE2D7] hover:bg-[#D6CDC2]/50 text-[#14100E] transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={savingLead}
                                    className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#14100E] hover:bg-[#2A2420] text-[#F4EDE4] flex items-center gap-1.5 transition-colors disabled:opacity-50"
                                >
                                    <Save className="w-3.5 h-3.5" />
                                    <span>{savingLead ? "Saving..." : "Save Changes"}</span>
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

