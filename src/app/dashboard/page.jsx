"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { userService, adminService } from "@/api";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import MetricsSection from "@/components/dashboard/MetricsSection";
import RecentProjectsSection, {
    initialProjects,
} from "@/components/dashboard/RecentProjectsSection";
import EnquiriesSection from "@/components/dashboard/EnquiriesSection";
import WebsitePerformanceSection from "@/components/dashboard/WebsitePerformanceSection";
import ActivityTimeline from "@/components/dashboard/ActivityTimeline";
import RegisteredUsersTable from "@/components/dashboard/RegisteredUsersTable";
import {
    Film,
    Play,
    Plus,
    Mail,
    Shield,
    Sparkles,
    Loader2,
    Calendar,
    Clock,
    Camera,
    Sliders,
    ArrowRight,
} from "lucide-react";

export default function DashboardPage() {
    const { user, loading, logout, authFetch, refreshAccessToken } = useAuth();
    const router = useRouter();

    const [activeView, setActiveView] = useState("overview");
    const [dashboardData, setDashboardData] = useState(null);
    const [adminData, setAdminData] = useState(null);
    const [fetching, setFetching] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [actionMsg, setActionMsg] = useState("");
    const [projectsList, setProjectsList] = useState(initialProjects);

    // Data fetching once authenticated user is resolved
    const fetchDashboardMetrics = async () => {
        if (!user) return;
        setFetching(true);
        setActionMsg("");

        try {
            // Fetch client/user data via userService
            const userJson = await userService.getDashboard();
            if (userJson?.data) {
                setDashboardData(userJson.data);
            }

            // If admin, also fetch administrative system metrics via adminService
            if (user.role === "admin") {
                const adminJson = await adminService.getDashboard();
                if (adminJson?.data) {
                    setAdminData(adminJson.data);
                }
            }
        } catch (err) {
            console.error("Dashboard metric fetch error:", err);
            setActionMsg(`Notice: Backend sync: ${err.message}`);
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchDashboardMetrics();
        }
    }, [user]);

    // Token Rotation Trigger
    const handleManualRefresh = async () => {
        setRefreshing(true);
        setActionMsg("");
        try {
            await refreshAccessToken();
            setActionMsg(
                "Session key rotated successfully via HttpOnly cookie!",
            );
            await fetchDashboardMetrics();
        } catch (err) {
            setActionMsg(`Rotation failed: ${err.message}`);
        } finally {
            setRefreshing(false);
        }
    };

    // Add new project
    const handleAddProject = (newProj) => {
        setProjectsList((prev) => [newProj, ...prev]);
        setActionMsg(`Project "${newProj.title}" slated successfully.`);
    };

    if (loading || (!user && fetching)) {
        return (
            <div className="min-h-screen bg-[#E6DDD2] flex items-center justify-center text-[#6B625A] font-mono text-xs">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-6 h-6 animate-spin text-[#14100E]" />
                    <span>SYNCING CINEMATIC ARCHIVES...</span>
                </div>
            </div>
        );
    }

    // Format current date in editorial cinematography style
    const now = new Date();
    const formattedDate = now.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return (
        <DashboardLayout
            activeView={activeView}
            onSelectView={setActiveView}
            user={user}
            onLogout={logout}
            onRefreshSession={handleManualRefresh}
            refreshing={refreshing}
            onAddProject={handleAddProject}
        >
            {({ onOpenScreening, onOpenQuickCreate }) => (
                <div className="space-y-10 pb-16">
                    {/* Editorial Welcome Header */}
                    <div className="border-b border-[#D6CDC2] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#6B625A]">
                                    {formattedDate} &bull; TC 01:24:08:16
                                </span>
                            </div>

                            <h1 className="font-sans font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-[#14100E]">
                                Your creative space.
                            </h1>

                            <p className="font-sans text-sm sm:text-base text-[#6B625A] mt-1.5 max-w-xl">
                                An overview of your projects, enquiries, and
                                digital presence.
                            </p>
                        </div>

                        {/* Quick Action Shortcuts */}
                        <div className="flex items-center gap-2.5 flex-wrap">
                            <button
                                onClick={onOpenQuickCreate}
                                className="px-3.5 py-2 rounded-lg bg-[#14100E] hover:bg-[#2A2420] text-[#F4EDE4] text-xs font-sans font-medium flex items-center gap-1.5 transition-colors shadow-sm"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Add Project</span>
                            </button>

                            <button
                                onClick={() => onOpenScreening(null)}
                                className="px-3.5 py-2 rounded-lg border border-[#D6CDC2] bg-[#F4EDE4] hover:bg-[#EAE2D7] text-[#14100E] text-xs font-sans font-medium flex items-center gap-1.5 transition-colors"
                            >
                                <Play className="w-3.5 h-3.5 fill-current" />
                                <span>Screening Room</span>
                            </button>

                            <button
                                onClick={() => setActiveView("enquiries")}
                                className="px-3.5 py-2 rounded-lg border border-[#D6CDC2] bg-[#F4EDE4] hover:bg-[#EAE2D7] text-[#14100E] text-xs font-sans font-medium flex items-center gap-1.5 transition-colors"
                            >
                                <Mail className="w-3.5 h-3.5" />
                                <span>Enquiries</span>
                            </button>
                        </div>
                    </div>

                    {/* Notification Banner */}
                    {actionMsg && (
                        <div className="p-4 rounded-xl bg-[#F4EDE4] border border-[#D6CDC2] text-xs font-mono text-[#14100E] flex items-center justify-between">
                            <span>{actionMsg}</span>
                            <button
                                onClick={() => setActionMsg("")}
                                className="text-[#8C8278] hover:text-[#14100E] underline ml-4"
                            >
                                Dismiss
                            </button>
                        </div>
                    )}

                    {/* Section 1: Refined Performance Overview (Metrics) */}
                    <MetricsSection
                        stats={adminData?.stats}
                        userRole={user?.role || "user"}
                        activeSessions={dashboardData?.activeSessionsCount ?? 1}
                    />

                    {/* Active View Filtering */}
                    {activeView === "overview" && (
                        <>
                            {/* Section 2: Recent Projects */}
                            <RecentProjectsSection
                                projects={projectsList}
                                onOpenScreening={onOpenScreening}
                                onOpenQuickCreate={onOpenQuickCreate}
                            />

                            {/* Section 3: Recent Enquiries */}
                            <EnquiriesSection />

                            {/* Section 4: Website Performance */}
                            <WebsitePerformanceSection />

                            {/* Section 5: Activity Timeline */}
                            <ActivityTimeline
                                onOpenScreening={onOpenScreening}
                            />

                            {/* Section 6: Registered Users (Superuser Only) */}
                            {user?.role === "admin" && (
                                <RegisteredUsersTable
                                    usersList={adminData?.recentUsers || []}
                                    stats={adminData?.stats || {}}
                                />
                            )}
                        </>
                    )}

                    {/* Specific Selected Views */}
                    {activeView === "projects" && (
                        <RecentProjectsSection
                            projects={projectsList}
                            onOpenScreening={onOpenScreening}
                            onOpenQuickCreate={onOpenQuickCreate}
                        />
                    )}

                    {activeView === "enquiries" && <EnquiriesSection />}

                    {activeView === "analytics" && (
                        <WebsitePerformanceSection />
                    )}

                    {activeView === "showreel" && (
                        <div className="border border-[#D6CDC2] rounded-xl p-8 bg-[#F4EDE4] text-center space-y-4">
                            <Film className="w-12 h-12 mx-auto text-[#14100E] opacity-70" />
                            <h3 className="font-sans font-bold text-xl text-[#14100E]">
                                Master Cinematography Showreel
                            </h3>
                            <p className="text-xs text-[#6B625A] max-w-md mx-auto">
                                High-bitrate 4K ProRes dailies,
                                behind-the-scenes film rolls, color grading
                                presets, and camera logs.
                            </p>
                            <button
                                onClick={() => onOpenScreening(null)}
                                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#14100E] text-[#F4EDE4] text-xs font-sans font-semibold uppercase tracking-wider hover:bg-[#2A2420] transition-colors"
                            >
                                <Play className="w-4 h-4 fill-current" />
                                <span>Launch Fullscreen Screening Room</span>
                            </button>
                        </div>
                    )}

                    {activeView === "media" && (
                        <div className="border border-[#D6CDC2] rounded-xl p-6 bg-[#F4EDE4] space-y-4">
                            <h3 className="font-sans font-bold text-lg text-[#14100E]">
                                RAW Dailies &amp; Color Lookbooks
                            </h3>
                            <p className="text-xs text-[#6B625A] font-mono">
                                ARRI LogC4, RED R3D, and Sony S-Log3 asset
                                archive.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                                {[
                                    {
                                        title: "Kodak 5219 Emulation Pack",
                                        size: "480 MB",
                                        format: ".CUBE 33x33",
                                    },
                                    {
                                        title: "The Last Monologue — Selected Takes",
                                        size: "12.4 GB",
                                        format: "ProRes 4444 XQ",
                                    },
                                    {
                                        title: "Varanasi Moonlight Grain Plate",
                                        size: "1.8 GB",
                                        format: "16mm Scan",
                                    },
                                ].map((m) => (
                                    <div
                                        key={m.title}
                                        className="p-4 rounded-lg bg-[#EAE2D7] border border-[#D6CDC2] space-y-2"
                                    >
                                        <div className="font-sans font-bold text-xs text-[#14100E]">
                                            {m.title}
                                        </div>
                                        <div className="flex justify-between text-[10px] font-mono text-[#6B625A]">
                                            <span>{m.format}</span>
                                            <span>{m.size}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeView === "settings" && (
                        <div className="space-y-6">
                            <div className="border border-[#D6CDC2] rounded-xl p-6 bg-[#F4EDE4] space-y-4">
                                <h3 className="font-sans font-bold text-lg text-[#14100E]">
                                    Session Security &amp; Identity Architecture
                                </h3>
                                <p className="text-xs text-[#6B625A]">
                                    Protected via memory-isolated access tokens,
                                    HttpOnly opaque refresh cookies, and
                                    Argon2id password hashing.
                                </p>
                                <div className="pt-2 flex items-center gap-3">
                                    <button
                                        onClick={handleManualRefresh}
                                        disabled={refreshing}
                                        className="px-4 py-2 rounded-lg bg-[#14100E] text-[#F4EDE4] text-xs font-mono uppercase tracking-wider hover:bg-[#2A2420] transition-colors disabled:opacity-50"
                                    >
                                        Test Token Rotation Now
                                    </button>
                                </div>
                            </div>

                            {user?.role === "admin" && (
                                <RegisteredUsersTable
                                    usersList={adminData?.recentUsers || []}
                                    stats={adminData?.stats || {}}
                                />
                            )}
                        </div>
                    )}
                </div>
            )}
        </DashboardLayout>
    );
}
