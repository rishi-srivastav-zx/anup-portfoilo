"use client";

import { useEffect, useCallback, useState, useRef } from "react";
import { useNotifications, NOTIFICATION_TYPES } from "@/context/NotificationContext";
import { API_BASE_URL } from "@/api/utils/baseUrl";

export function useApiHealth() {
    const { addNotification, removeNotification, clearNotificationsByType, resetCooldowns } =
        useNotifications();
    const [isChecking, setIsChecking] = useState(false);
    const retryTimeoutRef = useRef(null);

    // Lightweight health verification check (re-using existing /api/health endpoint)
    const checkHealth = useCallback(async () => {
        if (typeof navigator !== "undefined" && !navigator.onLine) {
            return false;
        }

        setIsChecking(true);
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 6000);

            const res = await fetch(`${API_BASE_URL}/health`, {
                method: "GET",
                signal: controller.signal,
                headers: {
                    Accept: "application/json",
                },
            });
            clearTimeout(timeoutId);

            if (res.ok) {
                // Server is back!
                removeNotification("backend-status");
                resetCooldowns();
                addNotification({
                    id: "server-recovered",
                    type: NOTIFICATION_TYPES.ONLINE_RECOVERED,
                    title: "Server Reconnected",
                    message: "Backend communication has been successfully restored.",
                    duration: 3500,
                    dismissable: true,
                });
                return true;
            }
            return false;
        } catch {
            return false;
        } finally {
            setIsChecking(false);
        }
    }, [addNotification, removeNotification, resetCooldowns]);

    useEffect(() => {
        // 1. Handle slow network responses
        const handleSlowResponse = (e) => {
            if (typeof navigator !== "undefined" && !navigator.onLine) {
                return;
            }

            addNotification({
                id: "slow-connection",
                type: NOTIFICATION_TYPES.SLOW_CONNECTION,
                title: "Slow Connection",
                message: "Your connection is taking longer than usual. Some content may load slowly.",
                duration: 4500,
                dismissable: true,
            });
        };

        // 2. Handle server crashes / network errors from API client
        const handleNetworkError = (e) => {
            // If user's internet is dead, offline notification takes absolute priority!
            if (typeof navigator !== "undefined" && !navigator.onLine) {
                return;
            }

            const detail = e.detail || {};
            // Client errors (400, 401, 403, 404, 422) must never trigger "Server Unavailable"
            if (detail.status && detail.status < 500 && detail.status !== null) {
                return;
            }

            addNotification({
                id: "backend-status",
                type: NOTIFICATION_TYPES.BACKEND_UNAVAILABLE,
                title: "Server Temporarily Unavailable",
                message: "We're having trouble connecting to the server. Please try again shortly.",
                duration: 9000,
                actionLabel: "Retry",
                onAction: () => {
                    checkHealth();
                },
                dismissable: true,
            });
        };

        // 3. Clear backend unavailable toast when a subsequent API call succeeds
        const handleBackendSuccess = () => {
            removeNotification("backend-status");
        };

        window.addEventListener("network-slow-response", handleSlowResponse);
        window.addEventListener("universal-network-error", handleNetworkError);
        window.addEventListener("universal-backend-success", handleBackendSuccess);

        return () => {
            window.removeEventListener("network-slow-response", handleSlowResponse);
            window.removeEventListener("universal-network-error", handleNetworkError);
            window.removeEventListener("universal-backend-success", handleBackendSuccess);
            if (retryTimeoutRef.current) {
                clearTimeout(retryTimeoutRef.current);
            }
        };
    }, [addNotification, removeNotification, checkHealth]);

    return { checkHealth, isChecking };
}

export default useApiHealth;

