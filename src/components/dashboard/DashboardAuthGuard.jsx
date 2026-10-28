"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Loader2, ShieldAlert, RefreshCw } from "lucide-react";

/**
 * Dashboard Authentication Guard (Client Component)
 * Ensures only authenticated users access protected dashboard routes.
 * Displays a branded cinematic loading state during initial session validation,
 * preventing layout flashing, empty state renders, or premature redirects.
 */
export default function DashboardAuthGuard({ children }) {
    const { isAuthenticated, isInitializing, networkError, checkAuth } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // Only redirect once initialization is strictly complete and user is confirmed unauthenticated
        if (!isInitializing && !isAuthenticated && !networkError) {
            router.replace("/login-page");
        }
    }, [isInitializing, isAuthenticated, networkError, router]);

    // 1. Initial Authentication Check in progress (refresh or initial boot)
    if (isInitializing) {
        return (
            <div className="min-h-screen bg-[#E6DDD2] text-[#14100E] flex flex-col items-center justify-center p-6 antialiased select-none">
                <div className="max-w-md w-full bg-[#F4EDE4] border border-[#D6CDC2] rounded-2xl p-8 shadow-xl text-center flex flex-col items-center">
                    {/* Visual pulse icon */}
                    <div className="w-12 h-12 rounded-xl bg-[#14100E] flex items-center justify-center text-[#F4EDE4] mb-5 shadow-md">
                        <Loader2 className="w-6 h-6 animate-spin" />
                    </div>

                    <h2 className="font-sans font-bold text-lg text-[#14100E] tracking-tight mb-2">
                        Authenticating Workspace
                    </h2>
                    <p className="font-mono text-xs text-[#6B625A] mb-6">
                        Verifying encrypted session credentials with security vault...
                    </p>

                    {/* Security telemetry strip */}
                    <div className="w-full bg-[#EAE2D7] border border-[#D6CDC2]/80 rounded-lg p-3 text-[10px] font-mono text-[#8C8278] flex items-center justify-between">
                        <span>SESSION: VALIDATING</span>
                        <span>&bull;</span>
                        <span>HTTPONLY &bull; ARGON2ID</span>
                    </div>
                </div>
            </div>
        );
    }

    // 2. Network or Backend Failure (prevent logging out on temporary server drops)
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

    // 3. Confirmed Unauthenticated: display placeholder while router.replace executes
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-[#E6DDD2] text-[#14100E] flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-[#8C8278]" />
            </div>
        );
    }

    // 4. Fully Authenticated: render protected dashboard pages
    return <>{children}</>;
}
