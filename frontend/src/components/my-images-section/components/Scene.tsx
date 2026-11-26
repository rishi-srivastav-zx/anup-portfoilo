import { useCallback, useEffect, useRef } from "react";
import { MengToSketchbookLandingPage } from "../shaders/landing-pages/LandingPages";
import "../shaders/threeui.css";
import { useSketchbook } from "../provider/SketchbookProvider";

export function Scene() {
    const {
        typography,
        registerFrame,
        currentPageIndex,
        pages,
        toggleIndexDrawer,
    } = useSketchbook();
    const containerRef = useRef<HTMLDivElement>(null);
    const pagesRef = useRef(pages);
    pagesRef.current = pages;
    const currentPageIndexRef = useRef(currentPageIndex);
    currentPageIndexRef.current = currentPageIndex;

    // Keep live iframe synchronized when dynamic pages change
    useEffect(() => {
        try {
            const frame = containerRef.current?.querySelector("iframe");
            const win = frame?.contentWindow as any;
            if (win && typeof win.setPages === "function" && Array.isArray(pages) && pages.length > 0) {
                win.setPages(pages);
            }
        } catch {
            // guard
        }
    }, [pages]);

    // Forward wheel events from inside the iframe to parent window via native WheelEvent
    // so Lenis smooth scrolling receives and animates it with standard inertia and lerp
    useEffect(() => {
        const handleWheelMsg = (e: MessageEvent) => {
            if (e.data?.type === "SKETCHBOOK_WHEEL" && typeof e.data.deltaY === "number") {
                window.dispatchEvent(
                    new WheelEvent("wheel", {
                        deltaY: e.data.deltaY,
                        deltaX: e.data.deltaX || 0,
                        bubbles: true,
                        cancelable: true,
                    }),
                );
            }
        };

        window.addEventListener("message", handleWheelMsg, { passive: true });
        return () => window.removeEventListener("message", handleWheelMsg);
    }, []);

    // Sync active page into iframe once loaded and attach custom cursor bridge
    const handleApplyScene = useCallback(
        (frame: HTMLIFrameElement) => {
            registerFrame(frame);

            try {
                const doc = frame.contentDocument;
                const win = frame.contentWindow as any;

                if (doc) {
                    // 1. Hide the browser's default OS cursor inside the iframe and forcefully remove arrows
                    let customStyle = doc.getElementById("custom-cursor-style") as HTMLStyleElement | null;
                    if (!customStyle) {
                        customStyle = doc.createElement("style");
                        customStyle.id = "custom-cursor-style";
                        doc.head?.appendChild(customStyle);
                    }
                    customStyle.textContent = `
                        *, html, body, button, a, input, div, span, svg, .sb-zone, .plate {
                            cursor: none !important;
                        }
                        .sb-arrow, button.sb-arrow, #sbLeft, #sbRight {
                            display: none !important;
                            visibility: hidden !important;
                            pointer-events: none !important;
                            opacity: 0 !important;
                            width: 0 !important;
                            height: 0 !important;
                            margin: 0 !important;
                            padding: 0 !important;
                            overflow: hidden !important;
                        }
                    `;

                    // 2. Immediate DOM purge for arrow buttons and SVG chevrons
                    const purgeArrows = () => {
                        try {
                            doc.querySelectorAll(".sb-arrow, #sbLeft, #sbRight").forEach((el) => {
                                (el as HTMLElement).style.setProperty("display", "none", "important");
                                (el as HTMLElement).style.setProperty("visibility", "hidden", "important");
                                el.innerHTML = "";
                            });
                            doc.querySelectorAll("polyline").forEach((poly) => {
                                const pts = poly.getAttribute("points") || "";
                                if (pts.includes("22") || pts.includes("41")) {
                                    poly.closest("svg")?.remove();
                                }
                            });
                        } catch {}
                    };
                    purgeArrows();

                    const isTouchDevice =
                        typeof window !== "undefined" &&
                        (window.matchMedia("(hover: none) and (pointer: coarse)").matches ||
                            /iPad|iPhone|iPod/.test(navigator.userAgent));

                    // 3. Attach mouse forwarding to keep the parent CustomCursor active and reactive (desktop only)
                    if (!isTouchDevice && win && !win.__cursorBridgeInstalled) {
                        win.__cursorBridgeInstalled = true;

                        let isMouseDownState = false;
                        let cachedRect = frame.getBoundingClientRect();
                        let lastRectUpdate = performance.now();

                        const forwardMove = (e: MouseEvent) => {
                            const now = performance.now();
                            if (now - lastRectUpdate > 250) {
                                cachedRect = frame.getBoundingClientRect();
                                lastRectUpdate = now;
                            }
                            const target = e.target as HTMLElement | null;
                            let hoverType: "pointer" | "grab" | "input" | null = null;
                            let hoverLabel: string | null = null;

                            if (
                                target?.closest?.(
                                    'button, a, .plate, .tool, .icon-btn, [role="button"], [data-cursor="hover"], [data-cursor="pointer"]',
                                )
                            ) {
                                hoverType = 'pointer';
                                hoverLabel = null;
                            } else if (target?.closest?.('.loupe, .ring, .grip')) {
                                hoverType = 'grab';
                                hoverLabel = isMouseDownState ? 'DRAGGING' : 'MOVE';
                            } else if (target?.closest?.('.sb-next, .sb-turn-cue, .sb-corner-cue')) {
                                hoverType = 'grab';
                                hoverLabel = isMouseDownState ? 'FLIPPING' : 'FLIP';
                            } else if (target?.closest?.('.sb-prev')) {
                                hoverType = 'grab';
                                hoverLabel = isMouseDownState ? 'FLIPPING' : 'FLIP';
                            } else if (target?.closest?.('.sb-zone, .sb-book, .sb-tilt')) {
                                hoverType = 'grab';
                                hoverLabel = isMouseDownState ? 'DRAGGING' : 'DRAG';
                            } else if (
                                target?.tagName?.toLowerCase() === "input" ||
                                target?.tagName?.toLowerCase() === "textarea"
                            ) {
                                hoverType = "input";
                                hoverLabel = null;
                            }

                            window.dispatchEvent(
                                new CustomEvent("custom-cursor-move", {
                                    detail: {
                                        clientX: e.clientX + cachedRect.left,
                                        clientY: e.clientY + cachedRect.top,
                                        hoverType,
                                        hoverLabel,
                                    },
                                }),
                            );
                        };

                        const forwardDown = () => {
                            isMouseDownState = true;
                            window.dispatchEvent(
                                new CustomEvent("custom-cursor-move", {
                                    detail: { isDown: true },
                                }),
                            );
                        };

                        const forwardUp = () => {
                            isMouseDownState = false;
                            window.dispatchEvent(
                                new CustomEvent("custom-cursor-move", {
                                    detail: { isDown: false },
                                }),
                            );
                        };

                        win.addEventListener("mousemove", forwardMove, {
                            passive: true,
                        });
                        win.addEventListener("mousedown", forwardDown, {
                            passive: true,
                        });
                        win.addEventListener("mouseup", forwardUp, {
                            passive: true,
                        });
                    }

                    // 4. Attach touch forwarding coordinated with Lenis smooth scroll and touch momentum
                    if (win && !win.__touchBridgeInstalled) {
                        win.__touchBridgeInstalled = true;

                        let touchStartY = 0;
                        let touchStartX = 0;
                        let lastTouchY = 0;
                        let lastTouchTime = 0;
                        let touchVelocityY = 0;
                        let isVerticalScroll = false;
                        let isHorizontalTurn = false;

                        const handleTouchStart = (e: TouchEvent) => {
                            if (e.touches && e.touches.length === 1) {
                                touchStartY = e.touches[0].clientY;
                                touchStartX = e.touches[0].clientX;
                                lastTouchY = e.touches[0].clientY;
                                lastTouchTime = performance.now();
                                touchVelocityY = 0;
                                isVerticalScroll = false;
                                isHorizontalTurn = false;
                            }
                        };

                        const handleTouchMove = (e: TouchEvent) => {
                            if (e.touches && e.touches.length === 1) {
                                const curY = e.touches[0].clientY;
                                const curX = e.touches[0].clientX;
                                const dy = lastTouchY - curY;
                                const now = performance.now();
                                const dt = Math.max(1, now - lastTouchTime);
                                touchVelocityY = dy / dt;
                                lastTouchY = curY;
                                lastTouchTime = now;

                                const totalDy = Math.abs(curY - touchStartY);
                                const totalDx = Math.abs(curX - touchStartX);

                                if (!isVerticalScroll && !isHorizontalTurn) {
                                    if (totalDy > 8 && totalDy >= totalDx) {
                                        isVerticalScroll = true;
                                    } else if (totalDx > 12 && totalDx > totalDy) {
                                        isHorizontalTurn = true;
                                    }
                                }

                                if (isVerticalScroll) {
                                    const lenis = (window as any).lenis;
                                    if (lenis && typeof lenis.scrollTo === "function") {
                                        lenis.scrollTo(lenis.scroll + dy, { immediate: true });
                                    } else {
                                        window.scrollBy({ top: dy, behavior: "instant" });
                                    }
                                }
                            }
                        };

                        const handleTouchEnd = () => {
                            if (isVerticalScroll) {
                                const lenis = (window as any).lenis;
                                if (lenis && typeof lenis.scrollTo === "function" && Math.abs(touchVelocityY) > 0.1) {
                                    const momentumDelta = touchVelocityY * 260;
                                    lenis.scrollTo(lenis.scroll + momentumDelta, {
                                        duration: Math.min(1.2, Math.max(0.4, Math.abs(touchVelocityY) * 0.7)),
                                        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                                    });
                                }
                            }
                            isVerticalScroll = false;
                            isHorizontalTurn = false;
                        };

                        win.addEventListener("touchstart", handleTouchStart, {
                            passive: true,
                        });
                        win.addEventListener("touchmove", handleTouchMove, {
                            passive: true,
                        });
                        win.addEventListener("touchend", handleTouchEnd, {
                            passive: true,
                        });
                        win.addEventListener("touchcancel", handleTouchEnd, {
                            passive: true,
                        });
                    }
                }

                // Initial page and dynamic plates sync on mount
                if (win && typeof win.setPages === "function" && Array.isArray(pagesRef.current) && pagesRef.current.length > 0) {
                    win.setPages(pagesRef.current);
                }
                if (win && typeof win.goTo === "function" && currentPageIndexRef.current > 0) {
                    win.goTo(currentPageIndexRef.current);
                }
            } catch {
                // guard
            }
        },
        [registerFrame],
    );

    return (
        <div
            ref={containerRef}
            className="shader-frame w-full h-full relative overflow-hidden select-none pointer-events-auto"
        >
            <MengToSketchbookLandingPage
                headingFont={typography.headingFont}
                bodyFont={typography.bodyFont}
                headingWeight={typography.headingWeight}
                bodyWeight={typography.bodyWeight}
                primaryColor={typography.primaryColor}
                headingSize={typography.headingSize}
                bodySize={typography.bodySize}
                headingLetterSpacing={typography.headingLetterSpacing}
                applyScene={handleApplyScene}
            />

            {/* Table of Plates Index Trigger */}
            <button
                type="button"
                onClick={toggleIndexDrawer}
                aria-label="Open table of plates index"
                className="absolute top-3 right-3 sm:top-4 sm:right-4 z-30 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-[#14100E]/75 hover:bg-[#14100E] text-[#F4EFE6] backdrop-blur-md border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.2)] text-[11px] sm:text-xs font-mono tracking-wider uppercase transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer group focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:outline-hidden hover:scale-105 active:scale-95"
                title="Table of Plates"
            >
                <span className="w-1.5 h-1.5 rounded-full bg-[#9a6a3e] group-hover:scale-125 transition-transform" />
                <span className="hidden sm:inline">Plates</span>
                <span>({pages.length})</span>
            </button>
        </div>
    );
}
