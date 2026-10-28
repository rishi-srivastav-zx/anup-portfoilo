"use client";

import React, { useState } from "react";
import { Mail, Search, Check, Eye, MoreHorizontal, ArrowRight, X } from "lucide-react";

export const initialEnquiries = [
    {
        id: "enq-1",
        name: "Karan Malhotra",
        company: "Dharma Productions",
        subject: "Feature Narrative — 35 Shoot Days in Rajasthan (Alexa Mini LF)",
        date: "Today, 14:20",
        category: "Feature Film",
        budget: "Tier 1 Commercial / Feature",
        status: "New",
        email: "karan@dharmaprod.in",
        details:
            "Looking to attach Anup Rawat as Director of Photography for our upcoming period drama set in Rajasthan. Scheduled principal photography starts December 2026.",
    },
    {
        id: "enq-2",
        name: "Maya Sen",
        company: "Independent Cinema Guild",
        subject: "Experimental Short Film — 16mm Film Grain (Arriflex 416)",
        date: "Yesterday",
        category: "Short Film",
        budget: "Indie / Festival Grant",
        status: "In Discussion",
        email: "maya.sen@cinemaguild.org",
        details:
            "Script attached regarding a 15-minute nocturnal narrative. Interested in shooting on Kodak Vision3 500T 16mm stock.",
    },
    {
        id: "enq-3",
        name: "Aarav Kapoor",
        company: "Native Films Mumbai",
        subject: "Automotive Commercial TVC — Arri 35 High Speed 120fps",
        date: "Oct 24, 2026",
        category: "Commercial TVC",
        budget: "Corporate Commercial",
        status: "Confirmed",
        email: "aarav@nativefilms.com",
        details:
            "Confirmed 3-day car commercial tracking shots with Russian Arm and high speed Arri 35 setup. Tech recce on Nov 4.",
    },
    {
        id: "enq-4",
        name: "Elena Rostova",
        company: "Berlin Music Collective",
        subject: "International Music Video — Low light Venice 2 anamorphic",
        date: "Oct 21, 2026",
        category: "Music Video",
        budget: "European Label",
        status: "In Discussion",
        email: "elena@berlincollective.de",
        details:
            "Music video for an upcoming Berlin indie electronic artist. Shoot planned in old Delhi bazaars with available moonlight & neon.",
    },
];

export default function EnquiriesSection() {
    const [enquiries, setEnquiries] = useState(initialEnquiries);
    const [filterStatus, setFilterStatus] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedEnquiry, setSelectedEnquiry] = useState(null);

    const filtered = enquiries.filter((item) => {
        const matchesStatus =
            filterStatus === "All" || item.status === filterStatus;
        const matchesQuery =
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.subject.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesQuery;
    });

    const markStatus = (id, newStatus) => {
        setEnquiries((prev) =>
            prev.map((e) => (e.id === id ? { ...e, status: newStatus } : e))
        );
        if (selectedEnquiry && selectedEnquiry.id === id) {
            setSelectedEnquiry((prev) => ({ ...prev, status: newStatus }));
        }
    };

    return (
        <section className="space-y-4">
            {/* Header & Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#D6CDC2]">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-[9px] uppercase tracking-widest text-[#8C8278]">
                            [ 02 // COMMUNICATIONS ]
                        </span>
                    </div>
                    <h2 className="font-sans font-bold text-xl text-[#14100E] tracking-tight">
                        Client Leads &amp; Shoot Bookings
                    </h2>
                </div>

                {/* Filter and Search */}
                <div className="flex items-center gap-2 flex-wrap">
                    <div className="relative">
                        <Search className="w-3.5 h-3.5 text-[#8C8278] absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search enquiries..."
                            className="bg-[#F4EDE4] border border-[#D6CDC2] rounded-lg text-xs px-3 py-1.5 pl-8 text-[#14100E] placeholder-[#8C8278] outline-none focus:border-[#14100E]"
                        />
                    </div>

                    <div className="flex items-center gap-1 bg-[#E0D6C8]/60 p-1 rounded-lg border border-[#D6CDC2]">
                        {["All", "New", "In Discussion", "Confirmed"].map(
                            (st) => (
                                <button
                                    key={st}
                                    onClick={() => setFilterStatus(st)}
                                    className={`px-2.5 py-1 rounded text-[10px] font-mono uppercase transition-colors ${
                                        filterStatus === st
                                            ? "bg-[#14100E] text-[#F4EDE4] font-semibold"
                                            : "text-[#6B625A] hover:text-[#14100E]"
                                    }`}
                                >
                                    {st}
                                </button>
                            )
                        )}
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="border border-[#D6CDC2] rounded-xl overflow-hidden bg-[#F4EDE4] shadow-xs">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-sans">
                        <thead className="bg-[#EAE2D7] text-[#6B625A] font-mono text-[10px] uppercase tracking-wider border-b border-[#D6CDC2]">
                            <tr>
                                <th className="px-5 py-3">Client &amp; Studio</th>
                                <th className="px-5 py-3">Project Scope</th>
                                <th className="px-5 py-3">Category</th>
                                <th className="px-5 py-3">Status</th>
                                <th className="px-5 py-3">Received</th>
                                <th className="px-5 py-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#D6CDC2]/60 text-[#4A423B]">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="6"
                                        className="px-5 py-8 text-center text-[#8C8278] font-mono text-xs"
                                    >
                                        No enquiries found matching filter criteria.
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="hover:bg-[#EAE2D7]/50 transition-colors cursor-pointer group"
                                        onClick={() => setSelectedEnquiry(item)}
                                    >
                                        <td className="px-5 py-3.5">
                                            <div className="font-bold text-[#14100E] group-hover:underline">
                                                {item.name}
                                            </div>
                                            <div className="text-[11px] font-mono text-[#8C8278]">
                                                {item.company}
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5 max-w-xs">
                                            <div className="truncate font-medium text-[#14100E]">
                                                {item.subject}
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5 font-mono text-[11px] text-[#6B625A]">
                                            {item.category}
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span
                                                className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold ${
                                                    item.status === "New"
                                                        ? "bg-[#14100E] text-[#F4EDE4]"
                                                        : item.status === "In Discussion"
                                                        ? "bg-amber-800/10 text-amber-900 border border-amber-800/20"
                                                        : "bg-emerald-800/10 text-emerald-900 border border-emerald-800/20"
                                                }`}
                                            >
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 font-mono text-[11px] text-[#8C8278]">
                                            {item.date}
                                        </td>
                                        <td className="px-5 py-3.5 text-right">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedEnquiry(item);
                                                }}
                                                className="px-2.5 py-1 rounded border border-[#D6CDC2] hover:bg-[#14100E] hover:text-[#F4EDE4] text-[10px] font-mono uppercase transition-colors"
                                            >
                                                View Brief
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Detail Drawer Modal */}
            {selectedEnquiry && (
                <div
                    className="fixed inset-0 z-50 bg-[#14100E]/50 backdrop-blur-xs flex items-center justify-center p-4"
                    onClick={() => setSelectedEnquiry(null)}
                >
                    <div
                        className="w-full max-w-lg bg-[#F4EDE4] border border-[#D6CDC2] rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-5 border-b border-[#D6CDC2] bg-[#EAE2D7] flex items-center justify-between">
                            <div>
                                <span className="font-mono text-[9px] uppercase tracking-widest text-[#8C8278]">
                                    ENQUIRY DOSSIER
                                </span>
                                <h3 className="font-sans font-bold text-base text-[#14100E]">
                                    {selectedEnquiry.name} &bull; {selectedEnquiry.company}
                                </h3>
                            </div>
                            <button
                                onClick={() => setSelectedEnquiry(null)}
                                className="p-1 rounded text-[#6B625A] hover:text-[#14100E]"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-5 space-y-4 text-xs font-sans">
                            <div>
                                <label className="font-mono text-[10px] uppercase text-[#8C8278] block mb-1">
                                    Subject / Scope
                                </label>
                                <p className="font-bold text-[#14100E] text-sm">
                                    {selectedEnquiry.subject}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3 py-3 border-y border-[#D6CDC2]/60 font-mono text-[11px]">
                                <div>
                                    <span className="text-[#8C8278] block">Email:</span>
                                    <span className="text-[#14100E] font-medium">
                                        {selectedEnquiry.email}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[#8C8278] block">Budget Bracket:</span>
                                    <span className="text-[#14100E] font-medium">
                                        {selectedEnquiry.budget}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <label className="font-mono text-[10px] uppercase text-[#8C8278] block mb-1">
                                    Production Brief &amp; Notes
                                </label>
                                <p className="text-[#4A423B] leading-relaxed bg-[#EAE2D7]/60 p-3 rounded-lg border border-[#D6CDC2]/50">
                                    {selectedEnquiry.details}
                                </p>
                            </div>

                            <div className="pt-2 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-[10px] uppercase text-[#8C8278]">
                                        Update Status:
                                    </span>
                                    <div className="flex gap-1">
                                        {["New", "In Discussion", "Confirmed"].map((st) => (
                                            <button
                                                key={st}
                                                onClick={() => markStatus(selectedEnquiry.id, st)}
                                                className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase ${
                                                    selectedEnquiry.status === st
                                                        ? "bg-[#14100E] text-[#F4EDE4]"
                                                        : "border border-[#D6CDC2] text-[#6B625A] hover:bg-black/5"
                                                }`}
                                            >
                                                {st}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <a
                                    href={`mailto:${selectedEnquiry.email}?subject=Re: ${selectedEnquiry.subject}`}
                                    className="px-3.5 py-1.5 rounded-lg bg-[#14100E] text-[#F4EDE4] text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 hover:bg-[#2A2420]"
                                >
                                    <span>Reply Email</span>
                                    <ArrowRight className="w-3 h-3" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
