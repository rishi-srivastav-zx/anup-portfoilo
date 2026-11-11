"use client";

import React, { useState } from "react";
import { Bell, Check, Clock, Film, Mail, ShieldCheck, Trash2 } from "lucide-react";

export const initialNotifications = [
    {
        id: "1",
        title: "New Production Enquiry",
        description: "Dharma Ent. requested cinematography availability for a 4-day shoot in Rajasthan.",
        time: "18m ago",
        type: "enquiry",
        read: false,
    },
    {
        id: "2",
        title: "Session Key Rotated",
        description: "HttpOnly opaque refresh token rotated successfully via secure Argon2id hash.",
        time: "1h ago",
        type: "security",
        read: false,
    },
    {
        id: "3",
        title: "Dailies Stream Viewed",
        description: "Director previewed 'The Last Monologue' 4K HDR ProRes dailies.",
        time: "4h ago",
        type: "film",
        read: true,
    },
    {
        id: "4",
        title: "Reel Milestone",
        description: "Showreel reached 4,200 unique plays across Mumbai & London agencies.",
        time: "Yesterday",
        type: "stats",
        read: true,
    },
];

export default function NotificationsPanel({ isOpen, onClose }) {
    const [notifications, setNotifications] = useState(initialNotifications);

    const unreadCount = notifications.filter((n) => !n.read).length;

    const markAllRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    };

    const clearAll = () => {
        setNotifications([]);
    };

    const toggleRead = (id) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
        );
    };

    if (!isOpen) return null;

    const getIcon = (type) => {
        switch (type) {
            case "enquiry":
                return <Mail className="w-3.5 h-3.5 text-amber-700" />;
            case "security":
                return <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />;
            case "film":
                return <Film className="w-3.5 h-3.5 text-[#14100E]" />;
            default:
                return <Clock className="w-3.5 h-3.5 text-[#6B625A]" />;
        }
    };

    return (
        <div
            className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-[#F4EDE4] border border-[#D6CDC2] rounded-lg shadow-xl z-50 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
        >
            {/* Header */}
            <div className="px-4 py-3 border-b border-[#D6CDC2] flex items-center justify-between bg-[#EAE2D7]">
                <div className="flex items-center gap-2">
                    <span className="font-sans font-bold text-xs uppercase tracking-wider text-[#14100E]">
                        NOTIFICATIONS
                    </span>
                    {unreadCount > 0 && (
                        <span className="bg-[#14100E] text-[#F4EDE4] font-mono text-[10px] px-1.5 py-0.2 rounded-full font-semibold">
                            {unreadCount} NEW
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-3 text-[11px] font-mono">
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllRead}
                            className="text-[#6B625A] hover:text-[#14100E] underline transition-colors"
                        >
                            Mark read
                        </button>
                    )}
                    {notifications.length > 0 && (
                        <button
                            onClick={clearAll}
                            className="text-[#8C8278] hover:text-red-700 transition-colors"
                            title="Clear all"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-[#D6CDC2]/60">
                {notifications.length === 0 ? (
                    <div className="p-8 text-center text-[#8C8278]">
                        <Bell className="w-6 h-6 mx-auto mb-2 opacity-40" />
                        <p className="text-xs font-mono uppercase">
                            No notifications
                        </p>
                    </div>
                ) : (
                    notifications.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => toggleRead(item.id)}
                            className={`p-3.5 transition-colors cursor-pointer flex gap-3 ${
                                item.read
                                    ? "bg-transparent hover:bg-[#EAE2D7]/50"
                                    : "bg-[#E6DDD2]/70 hover:bg-[#E6DDD2]"
                            }`}
                        >
                            <div className="mt-0.5 w-6 h-6 rounded-md bg-[#D6CDC2]/50 flex items-center justify-center flex-shrink-0">
                                {getIcon(item.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-0.5">
                                    <h4
                                        className={`text-xs font-sans ${
                                            item.read
                                                ? "text-[#4A423B]"
                                                : "text-[#14100E] font-semibold"
                                        }`}
                                    >
                                        {item.title}
                                    </h4>
                                    <span className="text-[10px] font-mono text-[#8C8278]">
                                        {item.time}
                                    </span>
                                </div>
                                <p className="text-[11px] text-[#6B625A] leading-relaxed line-clamp-2">
                                    {item.description}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-[#D6CDC2] bg-[#EAE2D7]/60 text-center">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#8C8278]">
                    LIVE AUDIT DISPATCH &bull; ENCRYPTED LOGS
                </span>
            </div>
        </div>
    );
}
