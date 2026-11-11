"use client";

import React, { createContext, useContext, useState, useRef, useCallback } from "react";

const NotificationContext = createContext(null);

export const NOTIFICATION_TYPES = {
    OFFLINE: "offline",
    ONLINE_RECOVERED: "online-recovered",
    SLOW_CONNECTION: "slow-connection",
    BACKEND_UNAVAILABLE: "backend-unavailable",
};

export function NotificationProvider({ children }) {
    const [notifications, setNotifications] = useState([]);
    const timersRef = useRef({});
    const cooldownRef = useRef({
        lastBackendErrorTime: 0,
        lastSlowWarningTime: 0,
    });

    const removeNotification = useCallback((id) => {
        if (timersRef.current[id]) {
            clearTimeout(timersRef.current[id]);
            delete timersRef.current[id];
        }
        setNotifications((prev) => prev.filter((item) => item.id !== id));
    }, []);

    const addNotification = useCallback((notification) => {
        const {
            id = `${notification.type}`,
            type,
            title,
            message,
            duration = 5000,
            actionLabel,
            onAction,
            dismissable = true,
            priority = 1,
        } = notification;

        const now = Date.now();

        // 1. Cooldown & throttling checks
        if (type === NOTIFICATION_TYPES.BACKEND_UNAVAILABLE) {
            // Check if user is offline — offline takes absolute priority!
            if (typeof navigator !== "undefined" && !navigator.onLine) {
                return;
            }
            if (now - cooldownRef.current.lastBackendErrorTime < 12000) {
                // Ignore repeated server errors within 12s window to avoid spam
                return;
            }
            cooldownRef.current.lastBackendErrorTime = now;
        }

        if (type === NOTIFICATION_TYPES.SLOW_CONNECTION) {
            if (typeof navigator !== "undefined" && !navigator.onLine) {
                return;
            }
            if (now - cooldownRef.current.lastSlowWarningTime < 25000) {
                // Ignore repeated slow warnings within 25s window
                return;
            }
            cooldownRef.current.lastSlowWarningTime = now;
        }

        setNotifications((prev) => {
            // If going offline, remove any slow connection or server unavailable toasts
            if (type === NOTIFICATION_TYPES.OFFLINE) {
                const filtered = prev.filter(
                    (n) =>
                        n.type !== NOTIFICATION_TYPES.SLOW_CONNECTION &&
                        n.type !== NOTIFICATION_TYPES.BACKEND_UNAVAILABLE &&
                        n.type !== NOTIFICATION_TYPES.ONLINE_RECOVERED
                );
                const existing = filtered.find((n) => n.id === id);
                if (existing) return filtered; // Already showing offline
                return [
                    ...filtered,
                    {
                        id,
                        type,
                        title,
                        message,
                        duration,
                        actionLabel,
                        onAction,
                        dismissable,
                        priority,
                        createdAt: now,
                    },
                ];
            }

            // If internet recovered, remove offline toast immediately
            if (type === NOTIFICATION_TYPES.ONLINE_RECOVERED) {
                const filtered = prev.filter((n) => n.type !== NOTIFICATION_TYPES.OFFLINE);
                return [
                    ...filtered,
                    {
                        id,
                        type,
                        title,
                        message,
                        duration,
                        actionLabel,
                        onAction,
                        dismissable,
                        priority,
                        createdAt: now,
                    },
                ];
            }

            // Prevent stacking identical notification types
            const filtered = prev.filter((n) => n.type !== type && n.id !== id);
            return [
                ...filtered,
                {
                    id,
                    type,
                    title,
                    message,
                    duration,
                    actionLabel,
                    onAction,
                    dismissable,
                    priority,
                    createdAt: now,
                },
            ];
        });

        // Set auto-dismiss timer if duration > 0
        if (timersRef.current[id]) {
            clearTimeout(timersRef.current[id]);
        }

        if (duration && duration > 0) {
            timersRef.current[id] = setTimeout(() => {
                removeNotification(id);
            }, duration);
        }
    }, [removeNotification]);

    const clearNotificationsByType = useCallback((type) => {
        setNotifications((prev) => {
            prev.forEach((n) => {
                if (n.type === type && timersRef.current[n.id]) {
                    clearTimeout(timersRef.current[n.id]);
                    delete timersRef.current[n.id];
                }
            });
            return prev.filter((n) => n.type !== type);
        });
    }, []);

    const resetCooldowns = useCallback(() => {
        cooldownRef.current = {
            lastBackendErrorTime: 0,
            lastSlowWarningTime: 0,
        };
    }, []);

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                addNotification,
                removeNotification,
                clearNotificationsByType,
                resetCooldowns,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error("useNotifications must be used within a NotificationProvider");
    }
    return context;
}

