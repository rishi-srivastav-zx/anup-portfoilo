"use client";

import React, { useState } from "react";
import { X, Search, Sparkles, CheckCircle2, AlertCircle, Layers } from "lucide-react";
import { knowledgeService } from "@/api";

export default function KnowledgeSearchTestModal({ isOpen, onClose }) {
    const [query, setQuery] = useState("");
    const [searching, setSearching] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        const trimmed = query.trim();
        if (!trimmed) return;

        setSearching(true);
        setError(null);
        setResult(null);

        try {
            const res = await knowledgeService.testSearch(trimmed);
            setResult(res?.data || res);
        } catch (err) {
            console.error("Test search failed:", err);
            setError(err?.response?.data?.message || err.message || "Search test failed.");
        } finally {
            setSearching(false);
        }
    };

    if (!isOpen) return null;

    const matchedRecords = result?.results || [];

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div className="relative w-full max-w-xl bg-[#F4EDE4] border border-[#D6CDC2] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                {/* Header */}
                <div className="p-5 border-b border-[#D6CDC2] bg-[#EAE2D7] flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-[#14100E] text-amber-300">
                            <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                            <h2 className="font-sans font-bold text-base text-[#14100E]">
                                Test Knowledge Retrieval Engine
                            </h2>
                            <p className="text-[11px] font-mono text-[#8C8278]">
                                Simulates Smart Search &amp; intent matching used by the AI chatbot
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

                {/* Search Bar */}
                <form onSubmit={handleSearch} className="p-4 border-b border-[#D6CDC2] bg-[#F4EDE4] flex gap-2">
                    <div className="relative flex-1">
                        <Search className="w-4 h-4 text-[#8C8278] absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Type a visitor question (e.g. Which camera does Anup use?)"
                            className="w-full pl-9 pr-3 py-2 text-xs bg-[#EAE2D7] border border-[#D6CDC2] rounded-lg text-[#14100E] focus:outline-none focus:border-[#14100E]"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={searching || !query.trim()}
                        className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#14100E] text-[#F4EDE4] hover:bg-[#2A2420] disabled:opacity-50 transition-colors flex items-center gap-1.5"
                    >
                        {searching ? (
                            <div className="w-3.5 h-3.5 border-2 border-[#F4EDE4] border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Search className="w-3.5 h-3.5" />
                        )}
                        <span>Test</span>
                    </button>
                </form>

                {/* Results Viewport */}
                <div className="flex-1 overflow-y-auto p-5 space-y-3">
                    {error && (
                        <div className="p-3.5 rounded-xl bg-red-100 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {!result && !searching && !error && (
                        <div className="p-8 text-center text-xs text-[#8C8278] space-y-2">
                            <p>Type any visitor query above and press "Test" to inspect retrieved knowledge items.</p>
                            <div className="flex flex-wrap justify-center gap-1.5 pt-2">
                                {[
                                    "Which camera does he shoot with?",
                                    "What are your commercial rates?",
                                    "Tell me about Anup Rawat",
                                    "Best films shot by Anup",
                                ].map((sample, i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        onClick={() => {
                                            setQuery(sample);
                                            setTimeout(() => {
                                                const btn = document.querySelector("form button[type='submit']");
                                                if (btn) btn.click();
                                            }, 50);
                                        }}
                                        className="px-2 py-1 rounded-md bg-[#EAE2D7] hover:bg-[#D6CDC2] text-[10px] text-[#14100E] transition-colors"
                                    >
                                        "{sample}"
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {result && (
                        <div className="space-y-3">
                            <div className="p-2.5 rounded-lg bg-[#EAE2D7] border border-[#D6CDC2] flex items-center justify-between text-xs">
                                <span className="font-semibold text-[#14100E]">
                                    Found {matchedRecords.length} Match{matchedRecords.length === 1 ? "" : "es"}
                                </span>
                                <span className="text-[11px] font-mono text-[#8C8278]">
                                    Engine: {result.retrievalMethod || "hybrid_search"}
                                </span>
                            </div>

                            {matchedRecords.length === 0 ? (
                                <div className="p-6 rounded-xl bg-[#EAE2D7] border border-dashed border-[#D6CDC2] text-center text-xs text-[#8C8278]">
                                    No published knowledge matched this query with sufficient relevance score.
                                </div>
                            ) : (
                                matchedRecords.map((item, idx) => (
                                    <div
                                        key={item.id || idx}
                                        className="p-3.5 rounded-xl bg-[#F4EDE4] border border-[#D6CDC2] space-y-1.5 text-xs"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold text-[#14100E]">{item.title}</span>
                                            {typeof item.score === "number" && (
                                                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#EAE2D7] text-[#6B625A]">
                                                    score: {Math.round(item.score * 100)}%
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-[11px] text-[#6B625A] leading-relaxed line-clamp-3">
                                            {item.content}
                                        </p>

                                        <div className="pt-1 flex items-center gap-2 font-mono text-[10px] text-[#8C8278]">
                                            <span>Category: {item.category}</span>
                                            {item.project_name && <span>• Project: {item.project_name}</span>}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-3.5 border-t border-[#D6CDC2] bg-[#EAE2D7] flex justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-1.5 text-xs font-semibold text-[#14100E] hover:bg-[#F4EDE4] border border-[#D6CDC2] rounded-lg transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
