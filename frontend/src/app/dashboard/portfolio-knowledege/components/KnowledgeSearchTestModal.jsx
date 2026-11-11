"use client";

import React, { useState } from "react";
import { X, Search, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
import { usePortfolioKnowledge } from "../provider/PortfolioKnowledgeProvider";

export default function KnowledgeSearchTestModal() {
    const { testSearchOpen, setTestSearchOpen, handleTestSearch } = usePortfolioKnowledge();

    const [query, setQuery] = useState("");
    const [results, setResults] = useState(null);
    const [searching, setSearching] = useState(false);

    if (!testSearchOpen) return null;

    const handleRunSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        setSearching(true);
        setResults(null);
        try {
            const data = await handleTestSearch(query);
            setResults(data?.data || data?.results || data || []);
        } catch (err) {
            console.error("Test search error:", err);
            setResults([]);
        } finally {
            setSearching(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 bg-[#F4EDE4] border border-[#D6CDC2] rounded-2xl shadow-2xl space-y-4">
                <button
                    type="button"
                    onClick={() => {
                        setTestSearchOpen(false);
                        setResults(null);
                        setQuery("");
                    }}
                    className="absolute top-4 right-4 p-1 text-[#8C8278] hover:text-[#14100E] rounded-lg transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-2.5 pb-2 border-b border-[#D6CDC2]">
                    <div className="p-2 rounded-xl bg-amber-100 text-amber-800 border border-amber-200">
                        <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="font-sans font-bold text-base text-[#14100E]">
                            Test AI Vector &amp; Trigram Retrieval
                        </h3>
                        <p className="text-xs text-[#6B625A]">
                            Type a natural question in English, Hindi, or Hinglish to see matched facts.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleRunSearch} className="flex gap-2">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="e.g. Kaunse camera use karta hai? Or 'Commercial day rates'"
                        className="flex-1 px-3.5 py-2 text-xs bg-[#EAE2D7] border border-[#D6CDC2] rounded-lg text-[#14100E] focus:outline-none focus:border-[#14100E]"
                        autoFocus
                    />
                    <button
                        type="submit"
                        disabled={searching || !query.trim()}
                        className="px-4 py-2 rounded-lg bg-[#14100E] text-[#F4EDE4] text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                        <Search className="w-3.5 h-3.5" />
                        <span>{searching ? "Searching..." : "Search"}</span>
                    </button>
                </form>

                {/* Pre-canned Suggestions */}
                <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono text-[#8C8278]">
                    <span>Suggestions:</span>
                    {["Camera gear", "Day rates", "Delhi Metro", "Music video packages"].map((s) => (
                        <button
                            key={s}
                            type="button"
                            onClick={() => {
                                setQuery(s);
                            }}
                            className="px-2 py-0.5 rounded bg-[#EAE2D7] hover:bg-[#D6CDC2] text-[#14100E] transition-colors"
                        >
                            {s}
                        </button>
                    ))}
                </div>

                {/* Results Section */}
                {results !== null && (
                    <div className="pt-2 space-y-2.5">
                        <h4 className="text-[11px] font-mono uppercase tracking-wider text-[#6B625A]">
                            Retrieved Facts ({Array.isArray(results) ? results.length : 0} Matches)
                        </h4>

                        {Array.isArray(results) && results.length > 0 ? (
                            <div className="space-y-2 max-h-72 overflow-y-auto">
                                {results.map((r, i) => (
                                    <div
                                        key={r.id || i}
                                        className="p-3 rounded-xl bg-[#EAE2D7] border border-[#D6CDC2] space-y-1 text-xs"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold text-[#14100E]">{r.title}</span>
                                            {r.similarity !== undefined && (
                                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                                                    Score: {(r.similarity * 100).toFixed(0)}%
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[#6B625A] text-[11px] leading-relaxed">
                                            {r.content || r.fact}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="p-6 text-center text-xs text-[#8C8278] bg-[#EAE2D7] rounded-xl border border-dashed border-[#D6CDC2]">
                                No matching knowledge facts retrieved for this query.
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

