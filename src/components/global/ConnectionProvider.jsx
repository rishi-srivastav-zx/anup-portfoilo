"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { NotificationProvider } from "@/context/NotificationContext";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { useApiHealth } from "@/hooks/useApiHealth";
import ConnectionToast from "./ConnectionToast";

function ConnectionWatcher() {
    const router = useRouter();

    // Activates network status listeners and API health listeners
    useNetworkStatus();
    useApiHealth();

    // Secret Admin shortcut: Ctrl + Shift + A (or Cmd + Shift + A on macOS)
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "A" || e.key === "a")) {
                e.preventDefault();
                router.push("/login-page");
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [router]);

    return null;
}

export default function ConnectionProvider({ children }) {
    return (
        <NotificationProvider>
            <ConnectionWatcher />
            {children}
            <ConnectionToast />
        </NotificationProvider>
    );
}

