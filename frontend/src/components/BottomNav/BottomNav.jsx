"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const navLinks = [
    { label: "Home", href: "#home" },
    { label: "About", href: "#about" },
    { label: "Visuals", href: "#visuals" },
    { label: "Work", href: "#work" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "#contact" },
];

export default function BottomNav() {
    const pathname = usePathname();
    const [activeItem, setActiveItem] = useState(
        pathname?.startsWith("/blog") ? "/blog" : navLinks[0].href,
    );
    const [isMounted, setIsMounted] = useState(false);
    const isProgrammaticScrollRef = useRef(false);
    const scrollTimeoutRef = useRef(null);

    // Sync activeItem when pathname changes
    useEffect(() => {
        if (pathname?.startsWith("/blog")) {
            setActiveItem("/blog");
        }
    }, [pathname]);

    const activeItemRef = useRef(activeItem);
    activeItemRef.current = activeItem;

    // Cache section elements and observe them with IntersectionObserver
    useEffect(() => {
        setIsMounted(true);

        if (typeof window === "undefined" || pathname?.startsWith("/blog")) return;

        // Collect section DOM elements
        const sectionIds = ["home", "about", "visuals", "work", "contact"];
        const observedElements = [];
        const elementToHref = new Map();

        sectionIds.forEach((id) => {
            let el = document.getElementById(id);
            if (!el && id === "about") el = document.getElementById("origin");
            if (!el && id === "work") el = document.getElementById("featured-work") || document.getElementById("work-inner");
            if (el) {
                observedElements.push(el);
                elementToHref.set(el, `#${id}`);
            }
        });

        // Track visibility ratios of sections using IntersectionObserver
        const visibilityRatios = new Map();

        const observer = new IntersectionObserver(
            (entries) => {
                if (isProgrammaticScrollRef.current) return;

                entries.forEach((entry) => {
                    visibilityRatios.set(entry.target, entry.isIntersecting ? entry.intersectionRatio : 0);
                });

                // Check edge cases: top and bottom of page
                const scrollY = window.scrollY;
                const windowHeight = window.innerHeight;
                const docHeight = document.documentElement.scrollHeight;

                if (scrollY < 100) {
                    if (activeItemRef.current !== "#home") {
                        setActiveItem("#home");
                    }
                    return;
                }

                if (scrollY + windowHeight >= docHeight - 80) {
                    if (activeItemRef.current !== "#contact") {
                        setActiveItem("#contact");
                    }
                    return;
                }

                // Find section with the highest visibility ratio
                let maxRatio = 0;
                let mostVisibleElement = null;

                observedElements.forEach((el) => {
                    const ratio = visibilityRatios.get(el) || 0;
                    if (ratio > maxRatio) {
                        maxRatio = ratio;
                        mostVisibleElement = el;
                    }
                });

                if (mostVisibleElement && maxRatio > 0.1) {
                    const href = elementToHref.get(mostVisibleElement);
                    if (href && href !== activeItemRef.current) {
                        setActiveItem(href);
                    }
                }
            },
            {
                // Focal window matching the user's reading zone
                rootMargin: "-15% 0px -40% 0px",
                threshold: [0, 0.15, 0.3, 0.5, 0.75],
            }
        );

        observedElements.forEach((el) => observer.observe(el));

        // Initial hash check
        const initialHash = window.location.hash;
        if (initialHash && navLinks.some((l) => l.href === initialHash)) {
            setActiveItem(initialHash);
        }

        return () => {
            observer.disconnect();
            if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
        };
    }, [pathname]);

    const handleNavClick = (e, href) => {
        e.preventDefault();
        setActiveItem(href);

        if (href.startsWith("/")) {
            // Direct route navigation (e.g. /blog)
            if (pathname !== href) {
                window.location.href = href;
            }
            return;
        }

        // Hash navigation (e.g. #home, #about)
        if (pathname !== "/") {
            // If on /blog or another page, navigate back to home page with target hash
            window.location.href = `/${href}`;
            return;
        }

        // Temporarily pause scroll spy updates during instant navigation
        isProgrammaticScrollRef.current = true;
        if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);

        const targetId = href.replace(/^#\/?/, '').replace('#', '');

        // Find target element with fallback alias matching
        let el = null;
        if (targetId !== 'home') {
            el =
                document.getElementById(targetId) ||
                (targetId === 'origin' ? (document.getElementById('origin') || document.getElementById('about')) : null) ||
                (targetId === 'about' ? (document.getElementById('about') || document.getElementById('origin')) : null) ||
                (targetId === 'work' || targetId === 'featured' || targetId === 'featured-work' || targetId === 'services'
                    ? (document.getElementById('work') || document.getElementById('featured-work') || document.getElementById('work-inner'))
                    : null) ||
                (targetId === 'contact' ? document.getElementById('contact') : null);
        }

        if (targetId === 'home' || !el) {
            if (typeof window !== 'undefined' && window.lenis) {
                window.lenis.scrollTo(0, { offset: 0, immediate: true });
            }
            window.scrollTo({ top: 0, behavior: 'instant' });
        } else {
            // Direct section positioning using scrollIntoView
            el.scrollIntoView({ behavior: 'instant', block: 'start' });

            // Synchronize Lenis virtual scroll position immediately if present
            if (typeof window !== 'undefined' && window.lenis) {
                window.lenis.scrollTo(el, { offset: 0, immediate: true });
            }
        }

        try {
            window.history.replaceState(null, '', href);
        } catch {
            // Ignore if history state update not allowed in iframe
        }

        // Re-enable scroll spy after instant navigation settles
        scrollTimeoutRef.current = setTimeout(() => {
            isProgrammaticScrollRef.current = false;
        }, 80);
    };

    if (
        !isMounted ||
        pathname?.startsWith("/login-page") ||
        pathname?.startsWith("/dashboard")
    )
        return null;

    return (
        <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.6,
            }}
            className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-[100] w-full max-w-[calc(100%-16px)] sm:w-auto flex justify-center"
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
            <motion.nav
                aria-label="Primary Navigation"
                className="flex items-center p-1 sm:p-2 bg-[#F4EDE4] overflow-x-auto overflow-y-hidden rounded-full shadow-[0_12px_32px_rgba(0,0,0,0.35)]"
                style={{
                    border: "2px solid #14100E",
                    boxShadow: "6px 6px 0 #14100E",
                    msOverflowStyle: "none",
                    scrollbarWidth: "none",
                }}
                whileHover={{ boxShadow: "8px 8px 0 #14100E" }}
                whileTap={{
                    boxShadow: "3px 3px 0 #14100E",
                    x: 2,
                    y: 2,
                    transition: { duration: 0.1 },
                }}
            >
                <style
                    dangerouslySetInnerHTML={{
                        __html: `nav::-webkit-scrollbar { display: none; }`,
                    }}
                />

                {navLinks.map((link) => {
                    const isActive = activeItem === link.href;

                    return (
                        <a
                            key={link.label}
                            href={link.href}
                            onClick={(e) => handleNavClick(e, link.href)}
                            className="relative px-2.5 xs:px-3 sm:px-4 py-1.5 sm:py-2 mx-0.5 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[#14100E] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F4EDE4] flex-shrink-0 group cursor-pointer"
                            aria-current={isActive ? "page" : undefined}
                        >
                            {/* Active background pill */}
                            {isActive && (
                                <motion.div
                                    layoutId="nav-pill"
                                    className="absolute inset-0 bg-[#14100E] rounded-full"
                                    transition={{
                                        type: "spring",
                                        stiffness: 400,
                                        damping: 30,
                                    }}
                                />
                            )}

                            {/* Text label */}
                            <motion.span
                                className="relative z-10 font-sans uppercase tracking-[0.08em] select-none"
                                style={{
                                    fontSize: "clamp(10px, 2.2vw, 13px)",
                                    fontWeight: 600,
                                    color: isActive ? "#F4EDE4" : "#14100E",
                                }}
                                whileHover={!isActive ? { y: -1 } : {}}
                            >
                                {link.label}

                                {/* Hover underline for inactive items */}
                                {!isActive && (
                                    <motion.span
                                        className="absolute bottom-0 left-0 w-full h-[1px] bg-[#14100E] origin-left"
                                        initial={{ scaleX: 0 }}
                                        variants={{ hover: { scaleX: 1 } }}
                                        transition={{
                                            duration: 0.3,
                                            ease: [0.16, 1, 0.3, 1],
                                        }}
                                    />
                                )}
                            </motion.span>
                        </a>
                    );
                })}
            </motion.nav>
        </motion.div>
    );
}
