"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import DashboardHeader from "./DashboardHeader";
import CommandPalette from "./CommandPalette";
import QuickCreateModal from "./QuickCreateModal";
import ScreeningRoomModal from "./ScreeningRoomModal";

export default function DashboardLayout({
    children,
    activeView = "overview",
    onSelectView,
    user,
    onLogout,
    onRefreshSession,
    refreshing = false,
    onAddProject,
    customProject,
}) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [quickCreateOpen, setQuickCreateOpen] = useState(false);
    const [screeningOpen, setScreeningOpen] = useState(false);
    const [activeScreeningProject, setActiveScreeningProject] = useState(null);

    // Global keyboard shortcut for Cmd+K / Ctrl+K
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                setSearchOpen((prev) => !prev);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    const handleOpenScreening = (project = null) => {
        setActiveScreeningProject(project);
        setScreeningOpen(true);
    };

    return (
        <div className="min-h-screen bg-[#E6DDD2] text-[#14100E] font-sans flex antialiased selection:bg-[#14100E] selection:text-[#F4EDE4]">
            {/* Sidebar */}
            <Sidebar
                activeView={activeView}
                onSelectView={onSelectView}
                isCollapsed={isCollapsed}
                onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
                mobileOpen={mobileOpen}
                onCloseMobile={() => setMobileOpen(false)}
                userRole={user?.role || "user"}
            />

            {/* Main Area */}
            <div
                className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
                    isCollapsed ? "md:pl-16" : "md:pl-64"
                }`}
            >
                {/* Header */}
                <DashboardHeader
                    activeView={activeView}
                    onToggleSidebar={() => {
                        if (typeof window !== "undefined" && window.innerWidth < 768) {
                            setMobileOpen(true);
                        } else {
                            setIsCollapsed(!isCollapsed);
                        }
                    }}
                    onOpenSearch={() => setSearchOpen(true)}
                    onOpenQuickCreate={() => setQuickCreateOpen(true)}
                    user={user}
                    onLogout={onLogout}
                    onRefreshSession={onRefreshSession}
                    refreshing={refreshing}
                    onOpenScreening={() => handleOpenScreening(null)}
                />

                {/* Page Content Viewport */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
                    {typeof children === "function"
                        ? children({
                              onOpenScreening: handleOpenScreening,
                              onOpenQuickCreate: () => setQuickCreateOpen(true),
                          })
                        : children}
                </main>
            </div>

            {/* Command Palette Modal */}
            <CommandPalette
                isOpen={searchOpen}
                onClose={() => setSearchOpen(false)}
                onSelectAction={(actionId) => {
                    if (actionId === "quick_create") {
                        setQuickCreateOpen(true);
                    } else if (actionId === "showreel") {
                        handleOpenScreening(null);
                    } else if (onSelectView) {
                        onSelectView(actionId);
                    }
                }}
            />

            {/* Quick Create Project Modal */}
            <QuickCreateModal
                isOpen={quickCreateOpen}
                onClose={() => setQuickCreateOpen(false)}
                onAddProject={(newProj) => {
                    if (onAddProject) onAddProject(newProj);
                }}
            />

            {/* Screening Room Modal */}
            <ScreeningRoomModal
                isOpen={screeningOpen}
                onClose={() => setScreeningOpen(false)}
                project={activeScreeningProject}
            />
        </div>
    );
}
