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
    ExternalLink,
    Copy,
    Check,
    Trash2,
    Edit3,
    Save,
    Sparkles,
    Clock,
    User,
    Shield,
} from "lucide-react";
import ConversationTranscript from "./ConversationTranscript";
import { PIPELINE_STATUSES } from "./LeadFiltersBar";
import { chatbotLeadService } from "@/api";

export default function LeadDetailsDrawer({
    isOpen,
    onClose,
    leadId,
    onStatusUpdated,
    onLeadUpdated,
    onDeleteRequest,
}) {
    const [lead, setLead] = useState(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [copiedPhone, setCopiedPhone] = useState(false);
    const [activeTab, setActiveTab] = useState("overview"); // 'overview' | 'transcript' | 'edit'

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
    });

    // Load full lead details and conversation transcript
    useEffect(() => {
        if (!isOpen || !leadId) {
            setLead(null);
            return;
        }

        let isMounted = true;
        setLoading(true);
        setError(null);
        setActiveTab("overview");

        chatbotLeadService
            .getLeadById(leadId)
            .then((res) => {
                if (!isMounted) return;
                const data = res?.data || res;
                setLead(data);
                setEditForm({
                    visitor_name: data.visitor_name || "",
                    phone: data.phone || "",
                    email: data.email || "",
                    project_type: data.project_type || "",
                    project_description: data.project_description || "",
                    budget: data.budget || "",
                    preferred_date: data.preferred_date || "",
                    location: data.location || "",
                });
            })
            .catch((err) => {
                if (!isMounted) return;
                setError(err?.response?.data?.message || err.message || "Failed to load lead details.");
            })
            .finally(() => {
                if (isMounted) setLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, [isOpen, leadId]);

    // Handle status update
    const handleStatusChange = async (newStatus) => {
        if (!lead) return;
        setLead((prev) => ({ ...prev, lead_status: newStatus }));

        try {
            await chatbotLeadService.updateLeadStatus(lead.id, newStatus);
            if (typeof onStatusUpdated === "function") {
                onStatusUpdated(lead.id, newStatus);
            }
        } catch (err) {
            console.error("Status update failed:", err);
            setError(err?.response?.data?.message || err.message || "Failed to update status.");
        }
    };

    // Handle save edits
    const handleSaveEdits = async (e) => {
        e.preventDefault();
        if (!lead) return;
        setSaving(true);
        setError(null);

        try {
            const res = await chatbotLeadService.updateLead(lead.id, editForm);
            const updated = res?.data || { ...lead, ...editForm };
            setLead((prev) => ({ ...prev, ...updated }));
            if (typeof onLeadUpdated === "function") {
                onLeadUpdated(updated);
            }
            setActiveTab("overview");
        } catch (err) {
            console.error("Edit save error:", err);
            setError(err?.response?.data?.message || err.message || "Failed to save edits.");
        } finally {
            setSaving(false);
        }
    };

    const copyPhone = () => {
        if (!lead?.phone) return;
        navigator.clipboard.writeText(lead.phone);
        setCopiedPhone(true);
        setTimeout(() => setCopiedPhone(false), 2000);
    };

    const whatsappUrl = lead?.phone
        ? `https://wa.me/${lead.phone.replace(/[^\d]/g, "")}?text=${encodeURIComponent(
              `Hi ${lead.visitor_name || "there"}, this is Anup Rawat following up on your cinematography project enquiry.`
          )}`
        : null;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end animate-fade-in">
            <div className="relative w-full max-w-xl h-full bg-[#F4EDE4] border-l border-[#D6CDC2] shadow-2xl flex flex-col">
                {/* Header */}
                <div className="p-5 border-b border-[#D6CDC2] flex items-center justify-between bg-[#EAE2D7]">
                    <div className="flex items-center gap-2.5 truncate">
                        <div className="p-2 rounded-lg bg-[#14100E] text-amber-300">
                            <Sparkles className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                            <h2 className="font-sans font-bold text-base text-[#14100E] truncate">
                                {lead?.visitor_name || "Lead Details"}
                            </h2>
                            <div className="flex items-center gap-2 text-[11px] font-mono text-[#8C8278]">
                                <span>Ref: {lead?.referenceId || "AR-LEAD"}</span>
                                <span>•</span>
                                <span>{lead?.source || "AI Assistant"}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-1.5 text-[#8C8278] hover:text-[#14100E] rounded-lg border border-[#D6CDC2] hover:bg-[#F4EDE4] transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="px-5 border-b border-[#D6CDC2] flex gap-4 text-xs font-medium text-[#8C8278] bg-[#F4EDE4]">
                    <button
                        type="button"
                        onClick={() => setActiveTab("overview")}
                        className={`py-3 border-b-2 transition-colors ${
                            activeTab === "overview"
                                ? "border-[#14100E] text-[#14100E] font-semibold"
                                : "border-transparent hover:text-[#14100E]"
                        }`}
                    >
                        Overview &amp; Scope
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab("transcript")}
                        className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
                            activeTab === "transcript"
                                ? "border-[#14100E] text-[#14100E] font-semibold"
                                : "border-transparent hover:text-[#14100E]"
                        }`}
                    >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Chat Transcript</span>
                        {lead?.recentMessages?.length > 0 && (
                            <span className="px-1.5 py-0.2 rounded-full bg-[#14100E] text-[#F4EDE4] text-[10px] font-mono">
                                {lead.recentMessages.length}
                            </span>
                        )}
                    </button>
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
                        <span>Edit Details</span>
                    </button>
                </div>

                {/* Scrollable Content Body */}
                <div className="flex-1 overflow-y-auto p-5 space-y-5">
                    {error && (
                        <div className="p-3.5 rounded-xl bg-red-100 border border-red-200 text-xs text-red-700">
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <div className="p-12 text-center space-y-3">
                            <div className="w-7 h-7 border-2 border-[#14100E] border-t-transparent rounded-full animate-spin mx-auto" />
                            <p className="text-xs font-mono text-[#8C8278]">Loading lead record...</p>
                        </div>
                    ) : (
                        <>
                            {/* TAB 1: OVERVIEW */}
                            {activeTab === "overview" && (
                                <div className="space-y-4">
                                    {/* Status & Pipeline Card */}
                                    <div className="p-4 rounded-xl bg-[#EAE2D7] border border-[#D6CDC2] space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] font-mono uppercase tracking-wider text-[#6B625A]">
                                                Pipeline Status
                                            </span>
                                            <select
                                                value={(lead?.lead_status || "new").toLowerCase()}
                                                onChange={(e) => handleStatusChange(e.target.value)}
                                                className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-[#D6CDC2] bg-[#F4EDE4] text-[#14100E] focus:outline-none cursor-pointer"
                                            >
                                                {PIPELINE_STATUSES.filter((s) => s.value).map((s) => (
                                                    <option key={s.value} value={s.value}>
                                                        {s.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Contact Actions Row */}
                                    <div className="grid grid-cols-2 gap-2.5">
                                        {whatsappUrl && (
                                            <a
                                                href={whatsappUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium flex items-center justify-center gap-2 shadow-sm transition-colors"
                                            >
                                                <ExternalLink className="w-3.5 h-3.5" />
                                                <span>WhatsApp Client</span>
                                            </a>
                                        )}

                                        <button
                                            type="button"
                                            onClick={copyPhone}
                                            className="p-3 rounded-xl bg-[#EAE2D7] hover:bg-[#D6CDC2] text-[#14100E] text-xs font-medium border border-[#D6CDC2] flex items-center justify-center gap-2 transition-colors"
                                        >
                                            {copiedPhone ? (
                                                <>
                                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                                    <span>Phone Copied</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="w-3.5 h-3.5" />
                                                    <span>Copy Phone</span>
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    {/* Key Details Grid */}
                                    <div className="p-4 rounded-xl bg-[#F4EDE4] border border-[#D6CDC2] space-y-3 text-xs">
                                        <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-[#6B625A]">
                                            Contact Information
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                            <div className="space-y-0.5">
                                                <span className="text-[11px] text-[#8C8278]">Visitor Name</span>
                                                <div className="font-medium text-[#14100E]">{lead?.visitor_name || "—"}</div>
                                            </div>
                                            <div className="space-y-0.5">
                                                <span className="text-[11px] text-[#8C8278]">Phone / WhatsApp</span>
                                                <div className="font-mono text-[#14100E]">{lead?.phone || "—"}</div>
                                            </div>
                                            <div className="space-y-0.5">
                                                <span className="text-[11px] text-[#8C8278]">Email Address</span>
                                                <div className="font-mono text-[#14100E]">{lead?.email || "Not provided"}</div>
                                            </div>
                                            <div className="space-y-0.5">
                                                <span className="text-[11px] text-[#8C8278]">Submission Date</span>
                                                <div className="font-mono text-[#14100E]">
                                                    {lead?.created_at ? new Date(lead.created_at).toLocaleString() : "—"}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Project Requirements & Creative Vision */}
                                    <div className="p-4 rounded-xl bg-[#F4EDE4] border border-[#D6CDC2] space-y-3 text-xs">
                                        <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-[#6B625A]">
                                            Project Scope &amp; Production Details
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                                            <div className="space-y-0.5">
                                                <span className="text-[11px] text-[#8C8278]">Project Type</span>
                                                <div className="font-semibold text-[#14100E]">{lead?.project_type || "Commercial"}</div>
                                            </div>
                                            <div className="space-y-0.5">
                                                <span className="text-[11px] text-[#8C8278]">Shoot Timeline / Date</span>
                                                <div className="font-medium text-[#14100E]">{lead?.preferred_date || "Flexible"}</div>
                                            </div>
                                            <div className="space-y-0.5">
                                                <span className="text-[11px] text-[#8C8278]">Budget Indication</span>
                                                <div className="font-mono font-medium text-[#14100E]">{lead?.budget || "To be discussed"}</div>
                                            </div>
                                            <div className="space-y-0.5 sm:col-span-3">
                                                <span className="text-[11px] text-[#8C8278]">Shoot Location</span>
                                                <div className="font-medium text-[#14100E]">{lead?.location || "Not specified"}</div>
                                            </div>
                                        </div>

                                        <div className="pt-2 border-t border-[#D6CDC2]">
                                            <span className="text-[11px] text-[#8C8278]">Creative Requirements &amp; Notes</span>
                                            <p className="mt-1 p-3 rounded-lg bg-[#EAE2D7] text-xs text-[#14100E] leading-relaxed whitespace-pre-wrap font-sans">
                                                {lead?.project_description || "No description provided."}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB 2: CHAT TRANSCRIPT */}
                            {activeTab === "transcript" && (
                                <ConversationTranscript
                                    messages={lead?.recentMessages || []}
                                    conversation={lead?.conversation || null}
                                />
                            )}

                            {/* TAB 3: EDIT DETAILS */}
                            {activeTab === "edit" && (
                                <form onSubmit={handleSaveEdits} className="space-y-4 text-xs">
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-mono text-[#6B625A]">Visitor Name *</label>
                                        <input
                                            type="text"
                                            required
                                            value={editForm.visitor_name}
                                            onChange={(e) => setEditForm({ ...editForm, visitor_name: e.target.value })}
                                            className="w-full px-3 py-2 bg-[#EAE2D7] border border-[#D6CDC2] rounded-lg text-[#14100E] focus:outline-none focus:border-[#14100E]"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <label className="text-[11px] font-mono text-[#6B625A]">Phone / WhatsApp *</label>
                                            <input
                                                type="text"
                                                required
                                                value={editForm.phone}
                                                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                                className="w-full px-3 py-2 bg-[#EAE2D7] border border-[#D6CDC2] rounded-lg text-[#14100E] focus:outline-none focus:border-[#14100E]"
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-[11px] font-mono text-[#6B625A]">Email Address</label>
                                            <input
                                                type="email"
                                                value={editForm.email}
                                                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                                className="w-full px-3 py-2 bg-[#EAE2D7] border border-[#D6CDC2] rounded-lg text-[#14100E] focus:outline-none focus:border-[#14100E]"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <label className="text-[11px] font-mono text-[#6B625A]">Project Type</label>
                                            <input
                                                type="text"
                                                value={editForm.project_type}
                                                onChange={(e) => setEditForm({ ...editForm, project_type: e.target.value })}
                                                className="w-full px-3 py-2 bg-[#EAE2D7] border border-[#D6CDC2] rounded-lg text-[#14100E] focus:outline-none focus:border-[#14100E]"
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-[11px] font-mono text-[#6B625A]">Budget</label>
                                            <input
                                                type="text"
                                                value={editForm.budget}
                                                onChange={(e) => setEditForm({ ...editForm, budget: e.target.value })}
                                                className="w-full px-3 py-2 bg-[#EAE2D7] border border-[#D6CDC2] rounded-lg text-[#14100E] focus:outline-none focus:border-[#14100E]"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <label className="text-[11px] font-mono text-[#6B625A]">Timeline / Dates</label>
                                            <input
                                                type="text"
                                                value={editForm.preferred_date}
                                                onChange={(e) => setEditForm({ ...editForm, preferred_date: e.target.value })}
                                                className="w-full px-3 py-2 bg-[#EAE2D7] border border-[#D6CDC2] rounded-lg text-[#14100E] focus:outline-none focus:border-[#14100E]"
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-[11px] font-mono text-[#6B625A]">Shoot Location</label>
                                            <input
                                                type="text"
                                                value={editForm.location}
                                                onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                                                className="w-full px-3 py-2 bg-[#EAE2D7] border border-[#D6CDC2] rounded-lg text-[#14100E] focus:outline-none focus:border-[#14100E]"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[11px] font-mono text-[#6B625A]">Requirements &amp; Notes</label>
                                        <textarea
                                            rows={4}
                                            value={editForm.project_description}
                                            onChange={(e) => setEditForm({ ...editForm, project_description: e.target.value })}
                                            className="w-full px-3 py-2 bg-[#EAE2D7] border border-[#D6CDC2] rounded-lg text-[#14100E] focus:outline-none focus:border-[#14100E]"
                                        />
                                    </div>

                                    <div className="pt-2 flex justify-end gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setActiveTab("overview")}
                                            className="px-4 py-2 text-xs font-semibold text-[#6B625A] hover:text-[#14100E] rounded-lg border border-[#D6CDC2] hover:bg-[#EAE2D7] transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="px-4 py-2 text-xs font-semibold text-[#F4EDE4] bg-[#14100E] hover:bg-[#2A2420] rounded-lg flex items-center gap-1.5 disabled:opacity-50 transition-colors"
                                        >
                                            <Save className="w-3.5 h-3.5" />
                                            <span>{saving ? "Saving..." : "Save Changes"}</span>
                                        </button>
                                    </div>
                                </form>
                            )}
                        </>
                    )}
                </div>

                {/* Footer Controls */}
                <div className="p-4 border-t border-[#D6CDC2] bg-[#EAE2D7] flex items-center justify-between">
                    <button
                        type="button"
                        onClick={() => onDeleteRequest(lead)}
                        className="px-3 py-2 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1.5"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Lead</span>
                    </button>

                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-semibold text-[#14100E] hover:bg-[#F4EDE4] border border-[#D6CDC2] rounded-lg transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
