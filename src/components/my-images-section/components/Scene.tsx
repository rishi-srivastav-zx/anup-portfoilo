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

    // Memoize handleApplyScene to prevent re-rendering loops and DOM thrashing during scroll
    const handleApplyScene = useCallback(
        (frame: HTMLIFrameElement) => {
            registerFrame(frame);
            try {
                const win = frame.contentWindow as any;
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
