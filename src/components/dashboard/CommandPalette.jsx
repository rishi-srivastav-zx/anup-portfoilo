"use client";

import React, { useState, useEffect, useRef } from "react";
import {
    Search,
    Film,
    Mail,
    PlaySquare,
    BookOpen,
    Settings,
    ArrowRight,
    Command,
    X,
    Shield,
    Plus,
    Sparkles,
} from "lucide-react";

export const commandItems = [
    { id: "overview", label: "Dashboard Overview", category: "Navigation", icon: ArrowRight },
    { id: "leads", label: "Chatbot Leads & Enquiries", category: "AI Assistant", icon: Mail },
    { id: "knowledge", label: "Portfolio Knowledge Base", category: "AI Assistant", icon: Sparkles },
    { id: "projects", label: "View Production Projects", category: "Navigation", icon: Film },
    { id: "enquiries", label: "Review Client Enquiries", category: "Navigation", icon: Mail },
    { id: "showreel", label: "Launch Screening Room", category: "Cinematography", icon: PlaySquare },
    { id: "media", label: "Raw Dailies & Lookbooks", category: "Cinematography", icon: Film },
    { id: "blog", label: "Read Cinematography Articles", category: "Writing", icon: BookOpen },
    { id: "settings", label: "Session Security & Argon2id", category: "System", icon: Shield },
    { id: "quick_create", label: "Create New Project Entry", category: "Action", icon: Plus },
];

export default function CommandPalette({ isOpen, onClose, onSelectAction }) {
    const [query, setQuery] = useState("");
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            setQuery("");
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    // Filter items
    const filtered = commandItems.filter(
        (item) =>
            item.label.toLowerCase().includes(query.toLowerCase()) ||
            item.category.toLowerCase().includes(query.toLowerCase())
    );

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isOpen) return;

            if (e.key === "Escape") {
                e.preventDefault();
                onClose();
            } else if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelectedIndex((prev) =>
                    prev < filtered.length - 1 ? prev + 1 : 0
                );
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setSelectedIndex((prev) =>
                    prev > 0 ? prev - 1 : filtered.length - 1
                );
            } else if (e.key === "Enter" && filtered[selectedIndex]) {
                e.preventDefault();
                onSelectAction(filtered[selectedIndex].id);
                onClose();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, filtered, selectedIndex, onClose, onSelectAction]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 bg-[#14100E]/50 backdrop-blur-sm flex items-start justify-center pt-20 px-4"
            onClick={onClose}
        >
            <div
                className="w-full max-w-xl bg-[#F4EDE4] border border-[#D6CDC2] rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Search Bar */}
                <div className="p-3.5 border-b border-[#D6CDC2] flex items-center gap-3 bg-[#EAE2D7]">
                    <Search className="w-4 h-4 text-[#6B625A]" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setSelectedIndex(0);
                        }}
                        placeholder="Search commands, projects, archives... (↑↓ to navigate, Enter to select)"
                        className="w-full bg-transparent text-xs text-[#14100E] placeholder-[#8C8278] outline-none font-sans"
                    />
                    <button
                        onClick={onClose}
                        className="text-[#8C8278] hover:text-[#14100E] p-1 rounded"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Results list */}
                <div className="max-h-72 overflow-y-auto p-2 space-y-1">
                    {filtered.length === 0 ? (
                        <div className="py-8 text-center text-xs font-mono text-[#8C8278]">
                            No results found for &ldquo;{query}&rdquo;
                        </div>
                    ) : (
                        filtered.map((item, idx) => {
                            const Icon = item.icon;
                            const isSelected = idx === selectedIndex;

                            return (
                                <div
                                    key={item.id}
                                    onMouseEnter={() => setSelectedIndex(idx)}
                                    onClick={() => {
                                        onSelectAction(item.id);
                                        onClose();
                                    }}
                                    className={`px-3 py-2.5 rounded-lg text-xs flex items-center justify-between cursor-pointer transition-colors ${
                                        isSelected
                                            ? "bg-[#14100E] text-[#F4EDE4]"
                                            : "text-[#4A423B] hover:bg-[#EAE2D7]"
                                    }`}
                                >
                                    <div className="flex items-center gap-2.5">
                                        <Icon className="w-4 h-4 opacity-70" />
                                        <span className="font-medium font-sans">
                                            {item.label}
                                        </span>
                                    </div>
                                    <span
                                        className={`text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded ${
                                            isSelected
                                                ? "bg-white/20 text-[#F4EDE4]"
                                                : "bg-[#D6CDC2] text-[#6B625A]"
                                        }`}
                                    >
                                        {item.category}
                                    </span>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer instructions */}
                <div className="px-4 py-2 border-t border-[#D6CDC2] bg-[#EAE2D7]/50 flex items-center justify-between text-[10px] font-mono text-[#8C8278]">
                    <span>[ESC] TO EXIT</span>
                    <span>[ENTER] TO SELECT</span>
                </div>
            </div>
        </div>
    );
}
