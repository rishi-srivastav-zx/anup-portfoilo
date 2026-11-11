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
                    This lead may have been captured or submitted without an archived chat session.
                </p>
            </div>
        );
    }

    // Sort chronologically (oldest first for natural chat reading order)
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
                            className={`flex gap-2.5 items-start ${isUser ? "flex-row-reverse" : "flex-row"}`}
                        >
                            {/* Avatar */}
                            <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-mono ${
                                    isUser
                                        ? "bg-amber-600 text-white"
                                        : "bg-[#3A3026] text-[#E6DDD2] border border-[#524436]"
                                }`}
                            >
                                {isUser ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                            </div>

                            {/* Bubble */}
                            <div
                                className={`max-w-[80%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                                    isUser
                                        ? "bg-amber-600/90 text-white rounded-tr-none"
                                        : "bg-[#2D241C] text-[#F4EDE4] border border-[#3A3026] rounded-tl-none font-sans"
                                }`}
                            >
                                <div className="text-[10px] font-mono opacity-60 mb-0.5 flex items-center gap-1 justify-between">
                                    <span>{isUser ? "Visitor" : "AI Assistant"}</span>
                                    {time && <span>{time}</span>}
                                </div>
                                <div className="whitespace-pre-wrap">{content}</div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

