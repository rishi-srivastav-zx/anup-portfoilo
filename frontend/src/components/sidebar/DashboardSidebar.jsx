"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    BookOpen,
    PlusCircle,
    ExternalLink,
    ChevronLeft,
    ChevronRight,
    X,
    PhoneCall,
    Layers,
    Video,
    Sparkles,
    CalendarClock,
} from "lucide-react";

export const navSections = [
    {
        title: "AI CHATBOT ASSISTANT",
        items: [
            {
                id: "leads",
                label: "Chatbot Leads",
                icon: PhoneCall,
                badge: null,
                href: "/dashboard?view=leads",
            },
            {
                id: "knowledge",
                label: "Portfolio Knowledge",
                icon: Sparkles,
                badge: "AI",
                href: "/dashboard?view=knowledge",
            },
        ],
    },
    {
        title: "PORTFOLIO VISUALS",
        items: [
            {
                id: "sketchbook",
                label: "Curated Works (10 Plates)",
                icon: Layers,
                badge: "WebP",
                href: "/dashboard?view=sketchbook",
            },
            {
                id: "work",
                label: "Work Projects (Videos)",
                icon: Video,
                badge: "80MB",
                href: "/dashboard?view=work",
            },
        ],
    },
    {
        title: "JOURNAL & BLOG",
        items: [
            {
                id: "blog",
                label: "All Articles",
                icon: BookOpen,
                badge: null,
                href: "/dashboard/blogs",
            },
            {
                id: "blog-create",
                label: "Create Article",
                icon: PlusCircle,
                badge: "New",
                href: "/dashboard/blogs/blogs-form",
            },
            {
                id: "blog-scheduler",
                label: "Scheduler & Queue",
                icon: CalendarClock,
                badge: "Auto",
                href: "/dashboard/blogs/scheduler",
            },
        ],
    },
    {
        title: "PUBLIC SITE",
        items: [
            {
                id: "public-blog",
                label: "View Live Journal",
                icon: ExternalLink,
                badge: "Live",
                href: "/blog",
            },
        ],
    },
];

/**
 * Calculates exactly ONE active navigation item ID
 * based on current pathname, query parameters, and optional activeView.
 */
function useActiveNavId(activeView) {
    const pathname = usePathname();

    // 1. Public site route
    if (pathname && pathname.startsWith("/blog") && !pathname.startsWith("/dashboard")) {
        return "public-blog";
    }

    // 2. Create/edit article routes
    if (pathname && (pathname.includes("/blogs-form") || pathname.includes("/blog-form"))) {
        return "blog-create";
    }

    // 2b. Blog Scheduler route
    if (pathname && pathname.includes("/blogs/scheduler")) {
        return "blog-scheduler";
    }

    // 3. Leads & Knowledge views
    if (activeView === "leads" || activeView === "enquiries") {
        return "leads";
    }

    if (activeView === "knowledge") {
        return "knowledge";
    }

    // 4. Sketchbook / Curated Works view
    if (activeView === "sketchbook" || activeView === "plates") {
        return "sketchbook";
    }

    // 5. Work section / videos view
    if (activeView === "work" || activeView === "work-projects") {
        return "work";
    }

    // 3. Explicit activeView prop override if set to specific actions
    if (activeView === "blog-create") return "blog-create";
    if (activeView === "public-blog") return "public-blog";

    // 4. Default blogs index or dashboard default view
    if (
        pathname === "/dashboard/blogs" ||
        pathname === "/dashboard/blogs/blog" ||
        (pathname === "/dashboard" && (!activeView || activeView === "blog"))
    ) {
        return "blog";
    }

    // 5. Fallback to activeView or default to "blog"
    return activeView || "blog";
}

function SidebarInner({
    activeView = "blog",
    onSelectView,
    isCollapsed = false,
    onToggleCollapse,
    mobileOpen = false,
    onCloseMobile,
    userRole = "user",
}) {
    const router = useRouter();
    const activeNavId = useActiveNavId(activeView);
    const [collapsedGroups, setCollapsedGroups] = useState({});

    const toggleGroup = (title) => {
        setCollapsedGroups((prev) => ({
            ...prev,
            [title]: !prev[title],
        }));
    };

    const handleItemClick = (item) => {
        if (onSelectView) {
            onSelectView(item.id);
        }
        if (item.href) {
            router.push(item.href);
        }
        if (onCloseMobile) {
            onCloseMobile();
        }
    };

    const sidebarContent = (
        <div className="h-full flex flex-col justify-between select-none">
            {/* Top Brand / Wordmark Header */}
            <div>
                <div
                    className={`p-4 border-b border-[#D6CDC2] flex items-center ${
                        isCollapsed ? "justify-center" : "justify-between"
                    }`}
                >
                    {!isCollapsed ? (
                        <div className="overflow-hidden">
                            <div className="flex items-center gap-2 mb-1.5">
                                <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                                <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#6B625A]">
                                    REC [24.00 FPS]
                                </span>
                            </div>
                            <Link href="/" className="group flex items-center gap-2.5">
                                <img
                                    src="/ar-monogram.webp"
                                    alt="AR"
                                    className="w-8 h-8 object-contain shrink-0 transition-transform group-hover:scale-105"
                                />
                                <div className="min-w-0">
                                    <h1 className="font-sans font-bold text-sm tracking-tight text-[#14100E] leading-tight group-hover:opacity-80 transition-opacity truncate">
                                        ANUP RAWAT
                                    </h1>
                                    <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-[#8C8278] truncate">
                                        CINEMATOGRAPHER
                                    </p>
                                </div>
                            </Link>
                        </div>
                    ) : (
                        <Link href="/" className="flex flex-col items-center group">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-600 mb-1 animate-pulse" />
                            <img
                                src="/ar-monogram.webp"
                                alt="AR"
                                className="w-7 h-7 object-contain transition-transform group-hover:scale-110"
                            />
                        </Link>
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

                {/* Editorial Framing Metadata Bar */}
                {!isCollapsed && (
                    <div className="px-4 py-2 border-b border-[#D6CDC2]/60 bg-[#E0D6C8]/40 flex items-center justify-between text-[10px] font-mono text-[#8C8278]">
                        <span>FORMAT: 2.39:1</span>
                        <span>JOURNAL CONSOLE</span>
                    </div>
                )}

                {/* Navigation Menu Sections */}
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
                                            // EXACTLY ONE item is active across the entire sidebar
                                            const isActive = item.id === activeNavId;

                                            return (
                                                <button
                                                    key={item.id}
                                                    onClick={() => handleItemClick(item)}
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

            {/* Bottom Status & Desktop Collapse Toggle */}
            <div className="p-3 border-t border-[#D6CDC2] bg-[#E0D6C8]/30">
                {!isCollapsed && (
                    <div className="mb-2 px-1 flex items-center justify-between text-[10px] font-mono text-[#8C8278]">
                        <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                            <span className="uppercase">SYSTEM OK</span>
                        </div>
                        <span className="uppercase">{userRole}</span>
                    </div>
                )}

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

export default function DashboardSidebar(props) {
    return (
        <Suspense fallback={null}>
            <SidebarInner {...props} />
        </Suspense>
    );
}

