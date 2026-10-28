"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
    Menu,
    Search,
    Bell,
    Plus,
    User,
    LogOut,
    Sliders,
    ChevronDown,
} from "lucide-react";
import NotificationsPanel from "./NotificationsPanel";

export default function DashboardHeader({
    activeView = "overview",
    onToggleSidebar,
    onOpenSearch,
    onOpenQuickCreate,
    user,
    onLogout,
    onRefreshSession,
    refreshing = false,
    onOpenScreening,
}) {
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const headerRef = useRef(null);

    // Close dropdowns on outside click or escape
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (headerRef.current && !headerRef.current.contains(e.target)) {
                setNotificationsOpen(false);
                setProfileOpen(false);
            }
        };

        const handleEscape = (e) => {
            if (e.key === "Escape") {
                setNotificationsOpen(false);
                setProfileOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEscape);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleEscape);
        };
    }, []);

    const viewTitles = {
        overview: "Overview",
        projects: "Projects",
        showreel: "Showreel & Visuals",
        blog: "Blog & Articles",
        media: "Media Library",
        enquiries: "Leads & Enquiries",
        contacts: "Contacts & Clients",
        services: "Services",
        bookings: "Bookings",
        content: "Pages & Content",
        seo: "SEO Overview",
        analytics: "Analytics",
        settings: "Settings & Security",
    };

    const currentTitle = viewTitles[activeView] || "Dashboard";

    return (
        <header
            ref={headerRef}
            className="h-14 bg-[#E6DDD2]/95 backdrop-blur-md border-b border-[#D6CDC2] sticky top-0 z-30 px-3 sm:px-6 flex items-center justify-between"
        >
            {/* Left Section: Sidebar Toggle & Breadcrumbs */}
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <button
                    onClick={onToggleSidebar}
                    className="p-1.5 rounded-md border border-[#D6CDC2] hover:bg-[#D6CDC2]/60 text-[#4A423B] transition-colors"
                    aria-label="Toggle Navigation"
                >
                    <Menu className="w-4 h-4" />
                </button>

                {/* Breadcrumbs */}
                <nav
                    aria-label="Breadcrumbs"
                    className="flex items-center gap-1.5 text-xs font-mono text-[#6B625A] truncate"
                >
                    <span className="hidden sm:inline hover:text-[#14100E] transition-colors">
                        STUDIO
                    </span>
                    <span className="hidden sm:inline text-[#8C8278]">/</span>
                    <span className="hover:text-[#14100E] transition-colors">
                        WORKSPACE
                    </span>
                    <span className="text-[#8C8278]">/</span>
                    <span className="font-semibold text-[#14100E] truncate">
                        {currentTitle.toUpperCase()}
                    </span>
                </nav>

                {/* Telemetry pill */}
                <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-[#D6CDC2] text-[10px] font-mono text-[#8C8278]">
                    <span>ARRI ALEXA MINI LF</span>
                    <span>&bull;</span>
                    <span>24.00 FPS</span>
                </div>
            </div>

            {/* Right Section: Actions, Search, Notifications, Profile */}
            <div className="flex items-center gap-2 sm:gap-3">
                {/* Global Command Search */}
                <button
                    onClick={onOpenSearch}
                    className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#D6CDC2] bg-[#E0D6C8]/40 hover:bg-[#D6CDC2]/60 text-[#6B625A] hover:text-[#14100E] transition-colors text-xs font-mono"
                    title="Press Cmd+K or Ctrl+K to search"
                >
                    <Search className="w-3.5 h-3.5" />
                    <span>Search</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-[#D6CDC2] text-[9px] text-[#14100E] font-semibold">
                        ⌘K
                    </kbd>
                </button>

                {/* Quick Add Project / Slate Button */}
                <button
                    onClick={onOpenQuickCreate}
                    className="px-3 py-1.5 rounded-lg bg-[#14100E] hover:bg-[#2A2420] text-[#F4EDE4] text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm"
                >
                    <Plus className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline uppercase text-[11px] tracking-wider font-mono">
                        New Slate
                    </span>
                </button>

                {/* Notifications Button & Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => {
                            setNotificationsOpen(!notificationsOpen);
                            setProfileOpen(false);
                        }}
                        className={`p-2 rounded-lg border border-[#D6CDC2] transition-colors relative ${
                            notificationsOpen
                                ? "bg-[#14100E] text-[#F4EDE4]"
                                : "hover:bg-[#D6CDC2]/60 text-[#4A423B]"
                        }`}
                        aria-label="Notifications"
                    >
                        <Bell className="w-4 h-4" />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-600 ring-2 ring-[#E6DDD2]" />
                    </button>

                    <NotificationsPanel
                        isOpen={notificationsOpen}
                        onClose={() => setNotificationsOpen(false)}
                    />
                </div>

                {/* User Avatar & Profile Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => {
                            setProfileOpen(!profileOpen);
                            setNotificationsOpen(false);
                        }}
                        className={`flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-lg border border-[#D6CDC2] transition-colors ${
                            profileOpen
                                ? "bg-[#14100E] text-[#F4EDE4]"
                                : "hover:bg-[#D6CDC2]/60 text-[#14100E]"
                        }`}
                        aria-label="Account Settings"
                    >
                        <div className="w-7 h-7 rounded-md bg-[#D6CDC2] overflow-hidden flex items-center justify-center font-bold text-xs uppercase text-[#14100E]">
                            {user?.name ? (
                                user.name.slice(0, 2).toUpperCase()
                            ) : (
                                <User className="w-3.5 h-3.5" />
                            )}
                        </div>
                        <span className="hidden md:inline text-xs font-medium font-sans max-w-[100px] truncate">
                            {user?.name || "Anup Rawat"}
                        </span>
                        <ChevronDown className="w-3 h-3 text-[#8C8278]" />
                    </button>

                    {/* Profile Dropdown */}
                    {profileOpen && (
                        <div
                            className="absolute right-0 top-full mt-2 w-72 bg-[#F4EDE4] border border-[#D6CDC2] rounded-xl shadow-xl z-50 overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Profile Info */}
                            <div className="p-4 border-b border-[#D6CDC2] bg-[#EAE2D7]">
                                <div className="flex items-center justify-between mb-1">
                                    <h4 className="font-sans font-bold text-sm text-[#14100E]">
                                        {user?.name || "Anup Rawat"}
                                    </h4>
                                    <span className="font-mono text-[9px] uppercase px-2 py-0.5 rounded bg-[#14100E] text-[#F4EDE4] font-semibold">
                                        {user?.role === "admin"
                                            ? "Superuser"
                                            : "Client"}
                                    </span>
                                </div>
                                <p className="text-xs text-[#6B625A] font-mono truncate">
                                    {user?.email || "director@rawatfilms.com"}
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="p-2 space-y-1">
                                <Link
                                    href="/"
                                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-sans text-[#4A423B] hover:bg-[#EAE2D7] hover:text-[#14100E] transition-colors"
                                >
                                    <Sliders className="w-3.5 h-3.5" />
                                    <span>View Public Portfolio</span>
                                </Link>

                                <button
                                    onClick={onLogout}
                                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-sans text-red-700 hover:bg-red-500/10 transition-colors"
                                >
                                    <LogOut className="w-3.5 h-3.5" />
                                    <span>Sign Out</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
