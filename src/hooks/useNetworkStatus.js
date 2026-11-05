"use client";

import { useEffect, useState, useRef } from "react";
import { useNotifications, NOTIFICATION_TYPES } from "@/context/NotificationContext";

export function useNetworkStatus() {
    const { addNotification, removeNotification } = useNotifications();
    const [isOnline, setIsOnline] = useState(true);
    const wasOfflineRef = useRef(false);

    useEffect(() => {
        // Initial online status check on mount (avoid hydration mismatch)
        const initialOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
        setIsOnline(initialOnline);

        // If user is already offline on load
        if (!initialOnline) {
            wasOfflineRef.current = true;
            addNotification({
                id: "offline-status",
                type: NOTIFICATION_TYPES.OFFLINE,
                title: "You're Offline",
                message: "Your internet connection has been interrupted. Check your connection and try again.",
                duration: 0, // persistent
                dismissable: false,
            });
        }

        const handleOffline = () => {
            setIsOnline(false);
            wasOfflineRef.current = true;
            addNotification({
                id: "offline-status",
                type: NOTIFICATION_TYPES.OFFLINE,
                title: "You're Offline",
                message: "Your internet connection has been interrupted. Check your connection and try again.",
                duration: 0, // persistent
                dismissable: false,
            });
        };

        const handleOnline = () => {
            setIsOnline(true);
            removeNotification("offline-status");

            // Only show "You're back online!" if user actually transitioned from offline
            if (wasOfflineRef.current) {
                wasOfflineRef.current = false;
                addNotification({
                    id: "online-status",
                    type: NOTIFICATION_TYPES.ONLINE_RECOVERED,
                    title: "You're back online!",
                    message: "Connection restored. All features are fully active.",
                    duration: 4000,
                    dismissable: true,
                });
            }
        };

        window.addEventListener("offline", handleOffline);
        window.addEventListener("online", handleOnline);

        return () => {
            window.removeEventListener("offline", handleOffline);
            window.removeEventListener("online", handleOnline);
        };
    }, [addNotification, removeNotification]);

    return { isOnline };
}

export default useNetworkStatus;

