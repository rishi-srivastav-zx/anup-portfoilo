"use client";

import React, { Suspense } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import CuratedWorksView from "./CuratedWorksView";
import { Loader2 } from "lucide-react";

export default function CuratedWorksPage() {
    const { user, logout, refreshAccessToken } = useAuth();

    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="w-8 h-8 animate-spin text-[#14100E]" />
                </div>
            }
        >
            <DashboardLayout
                activeView="sketchbook"
                user={user}
                onLogout={logout}
                onRefreshSession={refreshAccessToken}
            >
                <CuratedWorksView />
            </DashboardLayout>
        </Suspense>
    );
}

