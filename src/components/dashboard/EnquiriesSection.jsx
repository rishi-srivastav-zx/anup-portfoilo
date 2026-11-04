"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
    Phone,
    PhoneCall,
    MessageSquare,
    Search,
    Check,
    Eye,
    X,
    Trash2,
    RefreshCw,
    ExternalLink,
    Copy,
    Clock,
    Calendar,
    Sparkles,
    AlertCircle,
    CheckCircle2,
    Send,
} from "lucide-react";
import { enquiryService } from "@/api";

export default function EnquiriesSection() {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const [filterStatus, setFilterStatus] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedLead, setSelectedLead] = useState(null);
    const [deleteCandidate, setDeleteCandidate] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [copiedPhoneId, setCopiedPhoneId] = useState(null);

    // Fetch leads from backend
    const fetchLeads = useCallback(async (isSilent = false) => {
        if (!isSilent) setLoading(true);
        else setRefreshing(true);
        setErrorMessage(null);

        try {
            const res = await enquiryService.getEnquiries();
            if (res?.data) {
                setLeads(res.data);
            } else if (Array.isArray(res)) {
                setLeads(res);
            }
        } catch (err) {
            console.error("Failed to load leads:", err);
            setErrorMessage(err?.response?.data?.message || err.message || "Failed to load leads from database.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchLeads();
    }, [fetchLeads]);

    // Format phone for WhatsApp
    const formatWhatsAppUrl = (rawPhone, name) => {
        const cleaned = (rawPhone || "").replace(/[^\d]/g, "");
        const text = encodeURIComponent(`Hi ${name || "there"}, this is Anup Rawat following up on your portfolio inquiry.`);
        return `https://wa.me/${cleaned}?text=${text}`;
    };

    // Copy phone to clipboard
    const copyPhone = (phone, id, e) => {
        if (e) e.stopPropagation();
        if (!phone) return;
        navigator.clipboard.writeText(phone);
        setCopiedPhoneId(id);
        setTimeout(() => setCopiedPhoneId(null), 2000);
    };

    // Update status
    const handleUpdateStatus = async (id, newStatus, e) => {
        if (e) e.stopPropagation();
        // Optimistic update
        setLeads((prev) =>
            prev.map((lead) => (lead.id === id ? { ...lead, status: newStatus } : lead))
        );
        if (selectedLead && selectedLead.id === id) {
            setSelectedLead((prev) => ({ ...prev, status: newStatus }));
        }

        try {
            await enquiryService.updateStatus(id, newStatus);
        } catch (err) {
            console.error("Status update error:", err);
            fetchLeads(true);
        }
    };

    // Delete lead
    const confirmDeleteLead = async () => {
        if (!deleteCandidate) return;
        setDeleting(true);

        try {
            await enquiryService.deleteEnquiry(deleteCandidate.id);
            setLeads((prev) => prev.filter((l) => l.id !== deleteCandidate.id));
            if (selectedLead?.id === deleteCandidate.id) {
                setSelectedLead(null);
            }
            setDeleteCandidate(null);
        } catch (err) {
            console.error("Failed to delete lead:", err);
            alert("Could not delete lead. Please try again.");
        } finally {
            setDeleting(false);
        }
    };

    // Filtered list
    const filtered = leads.filter((item) => {
        const matchesStatus =
            filterStatus === "All" || item.status === filterStatus;
        const query = searchQuery.toLowerCase().trim();
        const matchesQuery =
            !query ||
            item.name?.toLowerCase().includes(query) ||
            item.phone?.toLowerCase().includes(query) ||
            item.message?.toLowerCase().includes(query) ||
            item.source?.toLowerCase().includes(query);
        return matchesStatus && matchesQuery;
    });

    // Counts for stats strip
    const stats = {
        total: leads.length,
        new: leads.filter((l) => l.status === "New").length,
        contacted: leads.filter((l) => l.status === "Contacted" || l.status === "In Discussion").length,
        confirmed: leads.filter((l) => l.status === "Confirmed").length,
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "Just now";
        try {
            const date = new Date(dateStr);
            return new Intl.DateTimeFormat("en-IN", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            }).format(date);
        } catch {
            return dateStr;
        }
    };

    return (
        <section className="space-y-6">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#D6CDC2]">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-[9px] uppercase tracking-widest text-[#8C8278]">
                            [ 02 // DIRECT CLIENT COMMUNICATIONS ]
                        </span>
                        {stats.new > 0 && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-red-600 text-white font-bold animate-pulse">
                                {stats.new} NEW
                            </span>
                        )}
                    </div>
                    <h2 className="font-sans font-bold text-2xl text-[#14100E] tracking-tight">
                        Client Inquiries &amp; Leads
                    </h2>
                    <p className="text-xs text-[#6B625A] mt-0.5">
                        Direct submissions from website forms. Only Name and Phone are compulsory.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => fetchLeads(true)}
                        disabled={refreshing || loading}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#FAF7F2] border border-[#D6CDC2] hover:bg-[#14100E] hover:text-[#FAF7F2] text-xs font-mono uppercase transition-colors disabled:opacity-60 cursor-pointer shadow-xs"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
                        <span>{refreshing ? "Syncing..." : "Sync Leads"}</span>
                    </button>
                </div>
            </div>

            {/* Metrics Ribbon */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-[#F4EDE4] border border-[#D6CDC2]">
                    <span className="font-mono text-[10px] uppercase text-[#8C8278] block">Total Inquiries</span>
                    <span className="font-sans font-bold text-xl text-[#14100E]">{stats.total}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#F4EDE4] border border-[#D6CDC2]">
                    <span className="font-mono text-[10px] uppercase text-[#8C8278] block">New Unread</span>
                    <span className={`font-sans font-bold text-xl ${stats.new > 0 ? "text-red-600" : "text-[#14100E]"}`}>
                        {stats.new}
                    </span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#F4EDE4] border border-[#D6CDC2]">
                    <span className="font-mono text-[10px] uppercase text-[#8C8278] block">In Discussion</span>
                    <span className="font-sans font-bold text-xl text-amber-700">{stats.contacted}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#F4EDE4] border border-[#D6CDC2]">
                    <span className="font-mono text-[10px] uppercase text-[#8C8278] block">Confirmed</span>
                    <span className="font-sans font-bold text-xl text-emerald-700">{stats.confirmed}</span>
                </div>
            </div>

            {/* Search and Status Filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                    <Search className="w-3.5 h-3.5 text-[#8C8278] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by name, phone, message content, or source..."
                        className="w-full bg-[#F4EDE4] border border-[#D6CDC2] rounded-lg text-xs px-3 py-2 pl-8 text-[#14100E] placeholder-[#8C8278] outline-none focus:border-[#14100E]"
                    />
                </div>

                <div className="flex items-center gap-1 bg-[#E0D6C8]/60 p-1 rounded-lg border border-[#D6CDC2] overflow-x-auto">
                    {["All", "New", "Contacted", "In Discussion", "Confirmed", "Closed"].map((st) => (
                        <button
                            key={st}
                            onClick={() => setFilterStatus(st)}
                            className={`px-2.5 py-1 rounded text-[10px] font-mono uppercase whitespace-nowrap transition-colors cursor-pointer ${
                                filterStatus === st
                                    ? "bg-[#14100E] text-[#F4EDE4] font-semibold"
                                    : "text-[#6B625A] hover:text-[#14100E]"
                            }`}
                        >
                            {st}
                        </button>
                    ))}
                </div>
            </div>

            {/* Error Banner */}
            {errorMessage && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-900 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                        <span>{errorMessage}</span>
                    </div>
                    <button
                        onClick={() => fetchLeads()}
                        className="underline font-mono text-[11px] hover:text-red-700"
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* Leads Table */}
            <div className="border border-[#D6CDC2] rounded-xl overflow-hidden bg-[#F4EDE4] shadow-xs">
                {loading ? (
                    <div className="p-12 text-center space-y-3">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#14100E]" />
                        <p className="font-mono text-xs uppercase text-[#8C8278]">Loading incoming leads...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs font-sans">
                            <thead className="bg-[#EAE2D7] text-[#6B625A] font-mono text-[10px] uppercase tracking-wider border-b border-[#D6CDC2]">
                                <tr>
                                    <th className="px-5 py-3.5">Lead Name</th>
                                    <th className="px-5 py-3.5">Phone &amp; Quick Contact</th>
                                    <th className="px-5 py-3.5">Message / Details</th>
                                    <th className="px-5 py-3.5">Source</th>
                                    <th className="px-5 py-3.5">Status</th>
                                    <th className="px-5 py-3.5">Received</th>
                                    <th className="px-5 py-3.5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#D6CDC2]/60 text-[#4A423B]">
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="7"
                                            className="px-5 py-12 text-center text-[#8C8278] font-mono text-xs"
                                        >
                                            No leads found matching your criteria. When visitors submit any form on the portfolio, their inquiries appear here immediately.
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((item) => (
                                        <tr
                                            key={item.id}
                                            className="hover:bg-[#EAE2D7]/50 transition-colors cursor-pointer group"
                                            onClick={() => setSelectedLead(item)}
                                        >
                                            {/* Name */}
                                            <td className="px-5 py-3.5">
                                                <div className="font-bold text-[#14100E] group-hover:underline flex items-center gap-1.5">
                                                    {item.status === "New" && (
                                                        <span className="w-2 h-2 rounded-full bg-red-600 shrink-0" />
                                                    )}
                                                    <span>{item.name}</span>
                                                </div>
                                            </td>

                                            {/* Phone & Instant Contact */}
                                            <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-xs font-semibold text-[#14100E]">
                                                        {item.phone}
                                                    </span>
                                                    <button
                                                        onClick={(e) => copyPhone(item.phone, item.id, e)}
                                                        title="Copy phone"
                                                        className="p-1 rounded text-[#8C8278] hover:text-[#14100E] hover:bg-black/5 transition-colors cursor-pointer"
                                                    >
                                                        {copiedPhoneId === item.id ? (
                                                            <Check className="w-3 h-3 text-emerald-600" />
                                                        ) : (
                                                            <Copy className="w-3 h-3" />
                                                        )}
                                                    </button>
                                                    <a
                                                        href={`tel:${item.phone}`}
                                                        title="Call client"
                                                        className="p-1 rounded text-emerald-800 hover:bg-emerald-600/10 transition-colors"
                                                    >
                                                        <PhoneCall className="w-3.5 h-3.5" />
                                                    </a>
                                                    <a
                                                        href={formatWhatsAppUrl(item.phone, item.name)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        title="Open WhatsApp chat"
                                                        className="p-1 rounded text-emerald-800 hover:bg-emerald-600/10 transition-colors"
                                                    >
                                                        <MessageSquare className="w-3.5 h-3.5" />
                                                    </a>
                                                </div>
                                            </td>

                                            {/* Message */}
                                            <td className="px-5 py-3.5 max-w-xs">
                                                <div className="truncate font-sans text-xs text-[#14100E]">
                                                    {item.message || <span className="text-[#8C8278] italic">No message provided</span>}
                                                </div>
                                            </td>

                                            {/* Source */}
                                            <td className="px-5 py-3.5 font-mono text-[10px] text-[#6B625A]">
                                                <span className="px-2 py-0.5 rounded bg-[#EAE2D7] border border-[#D6CDC2]">
                                                    {item.source || "Website Form"}
                                                </span>
                                            </td>

                                            {/* Status */}
                                            <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                                                <select
                                                    value={item.status || "New"}
                                                    onChange={(e) => handleUpdateStatus(item.id, e.target.value, e)}
                                                    className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold border outline-none cursor-pointer transition-colors ${
                                                        item.status === "New"
                                                            ? "bg-red-600/10 text-red-900 border-red-600/30 font-bold"
                                                            : item.status === "In Discussion"
                                                            ? "bg-amber-800/10 text-amber-900 border-amber-800/30"
                                                            : item.status === "Confirmed"
                                                            ? "bg-emerald-800/10 text-emerald-900 border-emerald-800/30"
                                                            : item.status === "Contacted"
                                                            ? "bg-blue-800/10 text-blue-900 border-blue-800/30"
                                                            : "bg-gray-800/10 text-gray-800 border-gray-800/20"
                                                    }`}
                                                >
                                                    <option value="New">New</option>
                                                    <option value="Contacted">Contacted</option>
                                                    <option value="In Discussion">In Discussion</option>
                                                    <option value="Confirmed">Confirmed</option>
                                                    <option value="Closed">Closed</option>
                                                </select>
                                            </td>

                                            {/* Date */}
                                            <td className="px-5 py-3.5 font-mono text-[11px] text-[#8C8278] whitespace-nowrap">
                                                {formatDate(item.created_at)}
                                            </td>

                                            {/* Actions */}
                                            <td className="px-5 py-3.5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        onClick={() => setSelectedLead(item)}
                                                        className="px-2.5 py-1 rounded border border-[#D6CDC2] hover:bg-[#14100E] hover:text-[#F4EDE4] text-[10px] font-mono uppercase transition-colors cursor-pointer"
                                                    >
                                                        View
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteCandidate(item)}
                                                        title="Delete Lead"
                                                        className="p-1.5 rounded text-red-600/70 hover:text-red-700 hover:bg-red-500/10 transition-colors cursor-pointer"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Dossier Modal */}
            {selectedLead && (
                <div
                    className="fixed inset-0 z-50 bg-[#14100E]/60 backdrop-blur-xs flex items-center justify-center p-4"
                    onClick={() => setSelectedLead(null)}
                >
                    <div
                        className="w-full max-w-lg bg-[#F4EDE4] border border-[#D6CDC2] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-5 border-b border-[#D6CDC2] bg-[#EAE2D7] flex items-center justify-between">
                            <div>
                                <span className="font-mono text-[9px] uppercase tracking-widest text-[#8C8278]">
                                    LEAD DOSSIER // {selectedLead.source || "WEBSITE"}
                                </span>
                                <h3 className="font-sans font-bold text-lg text-[#14100E]">
                                    {selectedLead.name}
                                </h3>
                            </div>
                            <button
                                onClick={() => setSelectedLead(null)}
                                className="p-1 rounded text-[#6B625A] hover:text-[#14100E] cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-5 text-xs font-sans">
                            {/* Phone Strip with Direct Actions */}
                            <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#D6CDC2] flex items-center justify-between gap-3">
                                <div>
                                    <span className="font-mono text-[10px] uppercase text-[#8C8278] block">
                                        Phone / WhatsApp Number
                                    </span>
                                    <span className="font-mono font-bold text-base text-[#14100E]">
                                        {selectedLead.phone}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={(e) => copyPhone(selectedLead.phone, "modal", e)}
                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#D6CDC2] hover:bg-[#14100E] hover:text-[#FAF7F2] font-mono text-[10px] uppercase transition-colors cursor-pointer"
                                    >
                                        <Copy className="w-3 h-3" />
                                        <span>{copiedPhoneId === "modal" ? "Copied!" : "Copy"}</span>
                                    </button>
                                    <a
                                        href={`tel:${selectedLead.phone}`}
                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-800 text-white font-mono text-[10px] uppercase hover:bg-emerald-900 transition-colors"
                                    >
                                        <Phone className="w-3 h-3" />
                                        <span>Call</span>
                                    </a>
                                    <a
                                        href={formatWhatsAppUrl(selectedLead.phone, selectedLead.name)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#25D366] text-black font-semibold font-mono text-[10px] uppercase hover:opacity-90 transition-opacity"
                                    >
                                        <MessageSquare className="w-3 h-3" />
                                        <span>WhatsApp</span>
                                    </a>
                                </div>
                            </div>

                            {/* Message / Brief */}
                            <div>
                                <label className="font-mono text-[10px] uppercase text-[#8C8278] block mb-1">
                                    Message / Requirements
                                </label>
                                <div className="text-[#3A322C] leading-relaxed bg-[#FAF7F2] p-4 rounded-xl border border-[#D6CDC2] whitespace-pre-wrap font-sans text-sm min-h-[90px]">
                                    {selectedLead.message || "No specific message provided."}
                                </div>
                            </div>

                            {/* Metadata Grid */}
                            <div className="grid grid-cols-2 gap-3 py-3 border-y border-[#D6CDC2]/60 font-mono text-[11px]">
                                <div>
                                    <span className="text-[#8C8278] block">Source:</span>
                                    <span className="text-[#14100E] font-medium">{selectedLead.source || "Website Form"}</span>
                                </div>
                                <div>
                                    <span className="text-[#8C8278] block">Received At:</span>
                                    <span className="text-[#14100E] font-medium">{formatDate(selectedLead.created_at)}</span>
                                </div>
                            </div>

                            {/* Status and Action Buttons */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-[10px] uppercase text-[#8C8278]">
                                        Status:
                                    </span>
                                    <div className="flex flex-wrap gap-1">
                                        {["New", "Contacted", "In Discussion", "Confirmed", "Closed"].map((st) => (
                                            <button
                                                key={st}
                                                onClick={() => handleUpdateStatus(selectedLead.id, st)}
                                                className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase cursor-pointer transition-colors ${
                                                    selectedLead.status === st
                                                        ? "bg-[#14100E] text-[#F4EDE4] font-semibold"
                                                        : "border border-[#D6CDC2] text-[#6B625A] hover:bg-black/5"
                                                }`}
                                            >
                                                {st}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        setDeleteCandidate(selectedLead);
                                    }}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/40 text-red-700 hover:bg-red-500/10 font-mono text-[10px] uppercase transition-colors cursor-pointer shrink-0"
                                >
                                    <Trash2 className="w-3 h-3" />
                                    <span>Delete</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteCandidate && (
                <div
                    className="fixed inset-0 z-50 bg-[#14100E]/60 backdrop-blur-xs flex items-center justify-center p-4"
                    onClick={() => setDeleteCandidate(null)}
                >
                    <div
                        className="w-full max-w-sm bg-[#F4EDE4] border border-[#D6CDC2] rounded-2xl shadow-2xl p-6 text-center space-y-4 animate-in fade-in zoom-in-95"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 text-red-600 flex items-center justify-center mx-auto">
                            <Trash2 className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="font-sans font-bold text-lg text-[#14100E]">Delete Lead Record?</h4>
                            <p className="text-xs text-[#6B625A] mt-1">
                                Are you sure you want to remove the inquiry from <strong>{deleteCandidate.name}</strong> ({deleteCandidate.phone})? This cannot be undone.
                            </p>
                        </div>
                        <div className="flex items-center justify-center gap-3 pt-2">
                            <button
                                onClick={() => setDeleteCandidate(null)}
                                className="px-4 py-2 rounded-xl border border-[#D6CDC2] text-xs font-mono uppercase text-[#6B625A] hover:bg-black/5 cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDeleteLead}
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
