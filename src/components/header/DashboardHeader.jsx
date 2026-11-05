"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
    Menu,
    User,
    LogOut,
    Sliders,
    ChevronDown,
} from "lucide-react";

export default function DashboardHeader({
    activeView = "blog",
    onToggleSidebar,
    onOpenSearch,
    onOpenQuickCreate,
    user,
    onLogout,
    onRefreshSession,
    refreshing = false,
    onOpenScreening,
}) {
    const [profileOpen, setProfileOpen] = useState(false);
    const headerRef = useRef(null);

    // Close dropdown on click outside or escape key
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (headerRef.current && !headerRef.current.contains(e.target)) {
                setProfileOpen(false);
            }
        };

        const handleEscape = (e) => {
            if (e.key === "Escape") {
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

    return (
        <header
            ref={headerRef}
            className="h-14 bg-[#E6DDD2]/95 backdrop-blur-md border-b border-[#D6CDC2] sticky top-0 z-30 px-3 sm:px-6 flex items-center justify-between"
        >
            {/* Left Section: Sidebar Toggle & Brand */}
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <button
                    onClick={onToggleSidebar}
                    className="p-1.5 rounded-md border border-[#D6CDC2] hover:bg-[#D6CDC2]/60 text-[#4A423B] transition-colors"
                    aria-label="Toggle Navigation"
                >
                    <Menu className="w-4 h-4" />
                </button>

                <Link href="/" className="flex items-center gap-2 group">
                    <img
                        src="/ar-monogram.webp"
                        alt="AR"
                        className="w-6 h-6 object-contain transition-transform group-hover:scale-105"
                    />
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#6B625A] hidden sm:inline">
                        STUDIO CONSOLE
                    </span>
                </Link>
            </div>

            {/* Right Section: Profile */}
            <div className="flex items-center gap-2 sm:gap-3">
                {/* User Avatar & Profile Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => {
                            setProfileOpen(!profileOpen);
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

                    {/* Profile Dropdown Panel */}
                    {profileOpen && (
                        <div
                            className="absolute right-0 top-full mt-2 w-72 bg-[#F4EDE4] border border-[#D6CDC2] rounded-xl shadow-xl z-50 overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
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

                            <div className="p-2 space-y-1">
                                <Link
                                    href="/"
                                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-sans text-[#4A423B] hover:bg-[#EAE2D7] hover:text-[#14100E] transition-colors"
                                >
                                    <Sliders className="w-3.5 h-3.5" />
                                    <span>View Public Portfolio</span>
                                </Link>

                                {onLogout && (
                                    <button
                                        onClick={onLogout}
                                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-sans text-red-700 hover:bg-red-500/10 transition-colors"
                                    >
                                        <LogOut className="w-3.5 h-3.5" />
                                        <span>Sign Out</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
