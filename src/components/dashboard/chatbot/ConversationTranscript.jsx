"use client";

import React from "react";
import { MessageSquare, Bot, User, Clock, Sparkles } from "lucide-react";

export default function ConversationTranscript({
    messages = [],
    conversation = null,
    loading = false,
}) {
    if (loading) {
        return (
            <div className="p-8 text-center space-y-3">
                <div className="w-6 h-6 border-2 border-[#14100E] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-mono text-[#8C8278]">Loading conversation transcript...</p>
            </div>
        );
    }

    if (!Array.isArray(messages) || messages.length === 0) {
        return (
            <div className="p-8 border border-dashed border-[#D6CDC2] rounded-xl text-center space-y-2 bg-[#EAE2D7]/50">
                <MessageSquare className="w-8 h-8 text-[#8C8278] mx-auto opacity-60" />
                <p className="text-xs font-medium text-[#14100E]">No conversation logs available</p>
                <p className="text-[11px] text-[#8C8278]">
                    This lead may have been submitted directly via public API without an active chat session.
                </p>
            </div>
        );
    }

    // Sort chronologically (oldest first for chat reading order)
    const sortedMessages = [...messages].sort(
        (a, b) => new Date(a.created_at || a.createdAt) - new Date(b.created_at || b.createdAt)
    );

    return (
        <div className="space-y-3">
            {/* Session Summary Header */}
            {conversation && (
                <div className="p-2.5 rounded-lg bg-[#EAE2D7] border border-[#D6CDC2] flex items-center justify-between text-[11px] font-mono text-[#6B625A]">
                    <div className="flex items-center gap-1.5 truncate">
                        <Sparkles className="w-3.5 h-3.5 text-[#14100E]" />
                        <span className="truncate">Session: {conversation.id}</span>
                    </div>
                    <span>{sortedMessages.length} Messages</span>
                </div>
            )}

            {/* Scrollable Message Bubbles */}
            <div className="max-h-96 overflow-y-auto space-y-3 p-3 rounded-xl bg-[#231C15] border border-[#3A3026] scrollbar-thin">
                {sortedMessages.map((m, idx) => {
                    const isUser = m.sender === "user";
                    const content = m.content || m.message_content || "";
                    const time = m.created_at
                        ? new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                        : "";

                    return (
                        <div
                            key={m.id || idx}
                            className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
                        >
                            <div className="flex items-center gap-1.5 mb-1 px-1">
                                {isUser ? (
                                    <>
                                        <span className="text-[10px] font-mono text-[#8C8278]">{time}</span>
                                        <span className="text-[10px] font-medium text-amber-200">Visitor</span>
                                        <User className="w-3 h-3 text-amber-300" />
                                    </>
                                ) : (
                                    <>
                                        <Bot className="w-3 h-3 text-amber-400" />
                                        <span className="text-[10px] font-medium text-amber-400">Assistant</span>
                                        <span className="text-[10px] font-mono text-[#8C8278]">{time}</span>
                                    </>
                                )}
                            </div>

                            <div
                                className={`p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed whitespace-pre-wrap ${
                                    isUser
                                        ? "bg-amber-600/30 text-[#F4EDE4] border border-amber-500/30 rounded-tr-none"
                                        : "bg-[#2F251E] text-[#F4EDE4] border border-[#4A3B30] rounded-tl-none"
                                }`}
                            >
                                {content}

                                {/* Intent & Action Tags in Metadata */}
                                {m.intent && (
                                    <div className="mt-2 pt-1.5 border-t border-[#4A3B30] flex flex-wrap items-center gap-1.5">
                                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-black/40 text-amber-300 border border-amber-500/20">
                                            intent: {m.intent}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
