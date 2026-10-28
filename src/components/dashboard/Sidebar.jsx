"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    LayoutDashboard,
    Film,
    PlaySquare,
    BookOpen,
    Image as ImageIcon,
    Mail,
    Users,
    Briefcase,
    Calendar,
    FileText,
    Globe,
    BarChart3,
    Settings,
    ChevronLeft,
    ChevronRight,
    X,
    Shield,
    Camera,
    Sparkles,
    Sliders,
} from "lucide-react";

export const navSections = [
    {
        title: "WORKSPACE",
        items: [
            { id: "overview", label: "Dashboard", icon: LayoutDashboard, badge: null },
            { id: "projects", label: "Projects", icon: Film, badge: "18" },
            { id: "showreel", label: "Showreel & Visuals", icon: PlaySquare, badge: null },
            { id: "blog", label: "Blog & Articles", icon: BookOpen, badge: null },
            { id: "media", label: "Media Library", icon: ImageIcon, badge: "RAW" },
        ],
    },
    {
        title: "BUSINESS",
        items: [
            { id: "enquiries", label: "Leads & Enquiries", icon: Mail, badge: "3" },
            { id: "contacts", label: "Contacts & Clients", icon: Users, badge: null },
            { id: "services", label: "Services & Rates", icon: Briefcase, badge: null },
            { id: "bookings", label: "Bookings & Slate", icon: Calendar, badge: "Upcoming" },
        ],
    },
    {
        title: "WEBSITE & SYSTEM",
        items: [
            { id: "content", label: "Pages & Content", icon: FileText, badge: null },
            { id: "seo", label: "SEO Overview", icon: Globe, badge: null },
            { id: "analytics", label: "Analytics", icon: BarChart3, badge: "Live" },
            { id: "settings", label: "Settings & Security", icon: Settings, badge: null },
        ],
    },
];

export default function Sidebar({
    activeView = "overview",
    onSelectView,
    isCollapsed = false,
    onToggleCollapse,
    mobileOpen = false,
    onCloseMobile,
    userRole = "user",
}) {
    const [collapsedGroups, setCollapsedGroups] = useState({});

    const toggleGroup = (title) => {
        setCollapsedGroups((prev) => ({
            ...prev,
            [title]: !prev[title],
        }));
    };

    const sidebarContent = (
        <div className="h-full flex flex-col justify-between select-none">
            {/* Top Section / Wordmark */}
            <div>
                <div
                    className={`p-4 border-b border-[#D6CDC2] flex items-center ${
                        isCollapsed ? "justify-center" : "justify-between"
                    }`}
                >
                    {!isCollapsed ? (
                        <div className="overflow-hidden">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                                <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#6B625A]">
                                    REC [24.00 FPS]
                                </span>
                            </div>
                            <Link href="/" className="group block">
                                <h1 className="font-sans font-bold text-lg tracking-tight text-[#14100E] group-hover:opacity-80 transition-opacity">
                                    ANUP RAWAT
                                </h1>
                                <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#8C8278]">
                                    CINEMATOGRAPHER / STUDIO
                                </p>
                            </Link>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center">
                            <span className="w-2 h-2 rounded-full bg-red-600 mb-1 animate-pulse" />
                            <span className="font-bold font-sans text-xs text-[#14100E] tracking-tighter">
                                AR
                            </span>
                        </div>
                    )}

                    {/* Mobile close button */}
                    {onCloseMobile && (
                        <button
                            onClick={onCloseMobile}
                            className="md:hidden p-1.5 text-[#6B625A] hover:text-[#14100E] rounded-lg hover:bg-black/5"
                            aria-label="Close menu"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>

                {/* Editorial Framing Bar */}
                {!isCollapsed && (
                    <div className="px-4 py-2 border-b border-[#D6CDC2]/60 bg-[#E0D6C8]/40 flex items-center justify-between text-[10px] font-mono text-[#8C8278]">
                        <span>FORMAT: 2.39:1</span>
                        <span>REEL #04</span>
                    </div>
                )}

                {/* Navigation Sections */}
                <div className="px-2 py-4 space-y-6 overflow-y-auto max-h-[calc(100vh-210px)] scrollbar-none">
                    {navSections.map((section) => {
                        const isGroupClosed = collapsedGroups[section.title];

                        return (
                            <div key={section.title} className="space-y-1">
                                {!isCollapsed && (
                                    <div
                                        onClick={() => toggleGroup(section.title)}
                                        className="px-2 py-1 flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.18em] text-[#8C8278] cursor-pointer hover:text-[#14100E] transition-colors"
                                    >
                                        <span>{section.title}</span>
                                        <span className="text-[9px] opacity-60">
                                            {isGroupClosed ? "+" : "—"}
                                        </span>
                                    </div>
                                )}

                                {!isGroupClosed && (
                                    <div className="space-y-0.5">
                                        {section.items.map((item) => {
                                            const Icon = item.icon;
                                            const isActive = activeView === item.id;

                                            return (
                                                <button
                                                    key={item.id}
                                                    onClick={() => {
                                                        onSelectView(item.id);
                                                        if (onCloseMobile) onCloseMobile();
                                                    }}
                                                    title={isCollapsed ? item.label : undefined}
                                                    className={`w-full flex items-center ${
                                                        isCollapsed
                                                            ? "justify-center px-0 py-2.5"
                                                            : "justify-between px-2.5 py-2"
                                                    } rounded-md text-xs font-sans transition-all duration-150 relative group ${
                                                        isActive
                                                            ? "bg-[#14100E] text-[#F4EDE4] font-medium shadow-sm"
                                                            : "text-[#4A423B] hover:bg-[#D6CDC2]/50 hover:text-[#14100E]"
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-2.5 min-w-0">
                                                        <Icon
                                                            className={`w-4 h-4 flex-shrink-0 transition-transform ${
                                                                isActive
                                                                    ? "text-[#F4EDE4]"
                                                                    : "text-[#6B625A] group-hover:scale-105"
                                                            }`}
                                                        />
                                                        {!isCollapsed && (
                                                            <span className="truncate">
                                                                {item.label}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {!isCollapsed && item.badge && (
                                                        <span
                                                            className={`ml-2 text-[9px] font-mono px-1.5 py-0.5 rounded ${
                                                                isActive
                                                                    ? "bg-white/20 text-[#F4EDE4]"
                                                                    : item.id === "enquiries"
                                                                    ? "bg-[#14100E] text-[#F4EDE4] font-semibold"
                                                                    : "bg-[#D6CDC2] text-[#4A423B]"
                                                            }`}
                                                        >
                                                            {item.badge}
                                                        </span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Bottom Section / System & Collapse Button */}
            <div className="p-3 border-t border-[#D6CDC2] bg-[#E0D6C8]/30">
                {!isCollapsed ? (
                    <div className="mb-2 px-1 flex items-center justify-between text-[10px] font-mono text-[#8C8278]">
                        <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                            <span className="uppercase">SYSTEM OK</span>
                        </div>
                        <span className="uppercase">{userRole}</span>
                    </div>
                ) : null}

                {/* Desktop Collapse Toggle */}
                <button
                    onClick={onToggleCollapse}
                    className="hidden md:flex w-full items-center justify-center p-2 rounded-md border border-[#D6CDC2] hover:bg-[#D6CDC2]/60 text-[#6B625A] hover:text-[#14100E] transition-colors text-xs font-mono"
                    title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    {isCollapsed ? (
                        <ChevronRight className="w-4 h-4" />
                    ) : (
                        <div className="flex items-center gap-2">
                            <ChevronLeft className="w-4 h-4" />
                            <span className="text-[11px] tracking-wider uppercase">
                                Collapse
                            </span>
                        </div>
                    )}
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Persistent Sidebar */}
            <aside
                className={`hidden md:block fixed top-0 left-0 h-screen z-40 bg-[#E6DDD2] border-r border-[#D6CDC2] transition-all duration-300 ease-in-out ${
                    isCollapsed ? "w-16" : "w-64"
                }`}
            >
                {sidebarContent}
            </aside>

            {/* Mobile Drawer Backdrop & Drawer */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={onCloseMobile}
                            className="md:hidden fixed inset-0 z-50 bg-[#14100E]/40 backdrop-blur-sm"
                        />
                        <motion.aside
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 30,
                            }}
                            className="md:hidden fixed top-0 left-0 bottom-0 z-50 w-72 bg-[#E6DDD2] border-r border-[#D6CDC2] shadow-2xl"
                        >
                            {sidebarContent}
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
