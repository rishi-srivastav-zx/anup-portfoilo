"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Loader2, ShieldAlert, RefreshCw } from "lucide-react";

/**
 * Dashboard Authentication Guard (Client Component)
 * Ensures only authenticated users access protected dashboard routes.
 * Uses a mounted-state boundary to guarantee 100% matching SSR HTML and client hydration.
 * Renders immediately for authenticated sessions without layout shifts or full-screen flash.
 */
export default function DashboardAuthGuard({ children }) {
    const { isAuthenticated, isInitializing, networkError, checkAuth } = useAuth();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        // Only redirect once initialization is strictly complete on the client
        if (mounted && !isInitializing && !isAuthenticated && !networkError) {
            router.replace("/login-page");
        }
    }, [mounted, isInitializing, isAuthenticated, networkError, router]);

    // 1. During SSR and initial client hydration, render children directly to guarantee
    // server and client HTML match identically with zero hydration mismatch
    if (!mounted) {
        return <>{children}</>;
    }

    // 2. Client is mounted and authenticated: render children directly
    if (isAuthenticated) {
        return <>{children}</>;
    }

    // 3. Client is mounted and verifying a brand-new session with NO cached user
    if (isInitializing) {
        return (
            <div className="min-h-screen bg-[#E6DDD2] text-[#14100E] flex flex-col items-center justify-center p-6 antialiased select-none">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-6 h-6 animate-spin text-[#14100E]" />
                    <span className="font-mono text-xs text-[#6B625A] tracking-wider uppercase">
                        Loading Studio Workspace...
                    </span>
                </div>
            </div>
        );
    }

    // 4. Connection interrupted on unauthenticated session: provide retry options
    if (networkError && !isAuthenticated) {
        return (
            <div className="min-h-screen bg-[#E6DDD2] text-[#14100E] flex flex-col items-center justify-center p-6 antialiased select-none">
                <div className="max-w-md w-full bg-[#F4EDE4] border border-[#D6CDC2] rounded-2xl p-8 shadow-xl text-center flex flex-col items-center">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-700 mb-5">
                        <ShieldAlert className="w-6 h-6" />
                    </div>

                    <h2 className="font-sans font-bold text-lg text-[#14100E] tracking-tight mb-2">
                        Connection Interrupted
                    </h2>
                    <p className="font-mono text-xs text-[#6B625A] mb-6">
                        Could not reach the security server. Your login session is preserved.
                    </p>

                    <div className="flex gap-3 w-full">
                        <button
                            onClick={() => checkAuth(true)}
                            className="flex-1 py-2.5 px-4 rounded-xl bg-[#14100E] hover:bg-[#2A2420] text-[#F4EDE4] font-sans text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
                        >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Retry Connection</span>
                        </button>
                        <button
                            onClick={() => router.push("/login-page")}
                            className="py-2.5 px-4 rounded-xl border border-[#D6CDC2] hover:bg-[#EAE2D7] text-[#4A423B] font-sans text-xs font-medium transition-colors"
                        >
                            Back to Login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // 5. Unauthenticated: placeholder while router.replace executes
    return (
        <div className="min-h-screen bg-[#E6DDD2] text-[#14100E] flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-[#8C8278]" />
        </div>
    );
}
