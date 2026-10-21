"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";

const navLinks = [
    { label: "Home", href: "#home" },
    { label: "About", href: "#about" },
    { label: "Visuals", href: "#visuals" },
    { label: "Work", href: "#work" },
    { label: "Contact", href: "#contact" },
];

export default function BottomNav() {
    const [activeItem, setActiveItem] = useState(navLinks[0].href);
    const [isMounted, setIsMounted] = useState(false);
    const isProgrammaticScrollRef = useRef(false);
    const scrollTimeoutRef = useRef(null);

    // Determine active section based on current viewport scroll position
    const updateActiveSection = useCallback(() => {
        if (typeof window === "undefined" || isProgrammaticScrollRef.current)
            return;

        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;
        const docHeight = document.documentElement.scrollHeight;

        // 1. Near very top of the page
        if (scrollY < 120) {
            setActiveItem("#home");
            return;
        }

        // 2. Near bottom of page (footer / contact section)
        if (scrollY + windowHeight >= docHeight - 120) {
            setActiveItem("#contact");
            return;
        }

        // 3. Focal zone (approx 38% down the viewport)
        const focalPoint = windowHeight * 0.38;
        let matchingHref = null;
        let minDistance = Infinity;

        for (const link of navLinks) {
            const id = link.href.replace("#", "");
            const el = document.getElementById(id);
            if (!el) continue;

            const rect = el.getBoundingClientRect();

            // If the focal point is within this section's bounding rectangle
            if (rect.top <= focalPoint && rect.bottom > focalPoint) {
                matchingHref = link.href;
                break;
            }

            // Fallback: check closest section to focal point
            const dist = Math.abs(rect.top - focalPoint);
            if (dist < minDistance) {
                minDistance = dist;
                matchingHref = link.href;
            }
        }

        if (matchingHref) {
            setActiveItem(matchingHref);
        }
    }, []);

    useEffect(() => {
        setIsMounted(true);

        // Initial check on mount
        if (typeof window !== "undefined") {
            const initialHash = window.location.hash;
            if (initialHash && navLinks.some((l) => l.href === initialHash)) {
                setActiveItem(initialHash);
            } else {
                updateActiveSection();
            }
        }

        // Update active section on scroll
        const handleScroll = () => {
            updateActiveSection();
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        window.addEventListener("resize", updateActiveSection, {
            passive: true,
        });

        return () => {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("resize", updateActiveSection);
            if (scrollTimeoutRef.current)
                clearTimeout(scrollTimeoutRef.current);
        };
    }, [updateActiveSection]);

    const handleNavClick = (e, href) => {
        e.preventDefault();
        setActiveItem(href);

        // Temporarily pause scroll spy updates during smooth scroll transition
        isProgrammaticScrollRef.current = true;
        if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);

        const targetId = href.replace("#", "");

        if (targetId === "home") {
            window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
            const el = document.getElementById(targetId);
            if (el) {
                el.scrollIntoView({ behavior: "smooth" });
            }
        }

        try {
            window.history.replaceState(null, "", href);
        } catch {
            // Ignore if history state update not allowed in iframe
        }

        scrollTimeoutRef.current = setTimeout(() => {
            isProgrammaticScrollRef.current = false;
            updateActiveSection();
        }, 900);
    };

    if (!isMounted) return null;

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
