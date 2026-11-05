"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Wifi,
    WifiOff,
    Clock,
    AlertCircle,
    CheckCircle2,
    RotateCw,
    X,
} from "lucide-react";
import { useNotifications, NOTIFICATION_TYPES } from "@/context/NotificationContext";

export default function ConnectionToast() {
    const { notifications, removeNotification } = useNotifications();
    const [retryingId, setRetryingId] = useState(null);

    const getIconConfig = (type) => {
        switch (type) {
            case NOTIFICATION_TYPES.OFFLINE:
                return {
                    icon: WifiOff,
                    badgeBg: "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400",
                    accentBar: "bg-amber-500",
                };
            case NOTIFICATION_TYPES.ONLINE_RECOVERED:
                return {
                    icon: CheckCircle2,
                    badgeBg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400",
                    accentBar: "bg-emerald-500",
                };
            case NOTIFICATION_TYPES.SLOW_CONNECTION:
                return {
                    icon: Clock,
                    badgeBg: "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400",
                    accentBar: "bg-amber-500/80",
                };
            case NOTIFICATION_TYPES.BACKEND_UNAVAILABLE:
            default:
                return {
                    icon: AlertCircle,
                    badgeBg: "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400",
                    accentBar: "bg-rose-500",
                };
        }
    };

    const handleActionClick = async (item) => {
        if (!item.onAction) return;
        setRetryingId(item.id);
        try {
            await item.onAction();
        } finally {
            setRetryingId(null);
        }
    };

    return (
        <aside
            aria-live="polite"
            aria-label="Connection notifications"
            className="fixed top-5 left-1/2 -translate-x-1/2 z-[99999] pointer-events-none flex flex-col items-center gap-2.5 w-[calc(100vw-32px)] sm:w-auto sm:min-w-[340px] sm:max-w-[440px]"
        >
            <AnimatePresence mode="popLayout">
                {notifications.map((item) => {
                    const { icon: IconComponent, badgeBg, accentBar } = getIconConfig(item.type);
                    const isRetrying = retryingId === item.id;
                    const isOffline = item.type === NOTIFICATION_TYPES.OFFLINE;

                    return (
                        <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, y: -20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -16, scale: 0.95 }}
                            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                            className="pointer-events-auto relative w-full overflow-hidden rounded-xl border border-[#DCD3C7] bg-[#FAF7F2]/95 backdrop-blur-md p-3.5 sm:p-4 text-[#14100E] shadow-[0_16px_40px_rgba(20,16,14,0.14),0_2px_8px_rgba(20,16,14,0.06)] dark:border-[#2C2420] dark:bg-[#161210]/95 dark:text-[#FAF7F2]"
                        >
                            {/* Left cinematic accent line */}
                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${accentBar}`} />

                            <div className="flex items-start gap-3 pl-1.5">
                                {/* Visual Icon */}
                                <div
                                    className={`relative flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg border ${badgeBg}`}
                                >
                                    <IconComponent className="w-4 h-4" />
                                    {isOffline && (
                                        <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                                        </span>
                                    )}
                                </div>

                                {/* Body Content */}
                                <div className="flex-1 min-w-0 pr-1">
                                    <div className="flex items-center justify-between gap-2">
                                        <h4 className="text-[13px] font-semibold tracking-tight text-[#14100E] dark:text-[#FAF7F2]">
                                            {item.title}
                                        </h4>
                                        {isOffline && (
                                            <span className="text-[9px] font-mono uppercase tracking-wider text-amber-700 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                                                Reconnecting
                                            </span>
                                        )}
                                    </div>

                                    <p className="mt-1 text-[12px] leading-relaxed text-[#5C5248] dark:text-[#A89E94]">
                                        {item.message}
                                    </p>

                                    {/* Action button if present (e.g. Retry) */}
                                    {item.actionLabel && (
                                        <div className="mt-2.5 flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handleActionClick(item)}
                                                disabled={isRetrying}
                                                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider rounded-md border border-[#C8BEB0] bg-[#EFECE6] text-[#14100E] hover:bg-[#E5E0D7] active:scale-[0.98] transition-all disabled:opacity-50 dark:border-[#382E28] dark:bg-[#201A16] dark:text-[#FAF7F2] dark:hover:bg-[#28211D]"
                                            >
                                                <RotateCw
                                                    className={`w-3 h-3 ${isRetrying ? "animate-spin" : ""}`}
                                                />
                                                {isRetrying ? "Retrying..." : item.actionLabel}
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Dismiss button */}
                                {item.dismissable !== false && (
                                    <button
                                        type="button"
                                        onClick={() => removeNotification(item.id)}
                                        aria-label="Dismiss notification"
                                        className="flex-shrink-0 text-[#8C8074] hover:text-[#14100E] dark:text-[#7A7066] dark:hover:text-[#FAF7F2] p-1 -mr-1 -mt-1 rounded-md transition-colors"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </aside>
    );
}

