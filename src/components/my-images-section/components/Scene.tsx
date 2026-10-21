import { useCallback, useEffect, useRef } from "react";
import { MengToSketchbookLandingPage } from "../shaders/landing-pages/LandingPages";
import "../shaders/threeui.css";
import { useSketchbook } from "../provider/SketchbookProvider";

export function Scene() {
    const { typography, generatedSrcDoc, registerFrame, currentPageIndex } =
        useSketchbook();
    const containerRef = useRef<HTMLDivElement>(null);

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
                    // 1. Hide the browser's default OS cursor inside the iframe
                    if (!doc.getElementById("custom-cursor-style")) {
                        const style = doc.createElement("style");
                        style.id = "custom-cursor-style";
                        style.textContent = `
                            *, html, body, button, a, input, div, span, svg, .sb-zone, .plate {
                                cursor: none !important;
                            }
                        `;
                        doc.head?.appendChild(style);
                    }

                    // 2. Attach mouse forwarding to keep the parent CustomCursor active and reactive
                    if (win && !win.__cursorBridgeInstalled) {
                        win.__cursorBridgeInstalled = true;

                        let isMouseDownState = false;

                        const forwardMove = (e: MouseEvent) => {
                            const rect = frame.getBoundingClientRect();
                            const target = e.target as HTMLElement | null;
                            let hoverType: "pointer" | "grab" | "input" | null = null;
                            let hoverLabel: string | null = null;

                            if (
                                target?.closest?.(
                                    'button, a, .plate, .sb-arrow, .tool, .icon-btn, [role="button"], [data-cursor="hover"], [data-cursor="pointer"]',
                                )
                            ) {
                                hoverType = 'pointer';
                                hoverLabel = null;
                            } else if (target?.closest?.('.loupe, .ring, .grip')) {
                                hoverType = 'grab';
                                hoverLabel = isMouseDownState ? 'DRAGGING' : 'MOVE';
                            } else if (target?.closest?.('.sb-next')) {
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
                                        clientX: e.clientX + rect.left,
                                        clientY: e.clientY + rect.top,
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
                }

                if (win && typeof win.goTo === "function") {
                    win.goTo(currentPageIndex);
                }
            } catch {
                // guard
            }
        },
        [currentPageIndex, registerFrame],
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
                {...(generatedSrcDoc ? { srcDoc: generatedSrcDoc } : {})}
            />
        </div>
    );
}
