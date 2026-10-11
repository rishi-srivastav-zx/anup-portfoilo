"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

export const OriginSection: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const stRef = useRef<ScrollTrigger | null>(null);
    const notebookRef = useRef<HTMLDivElement>(null);
    const spotlightRef = useRef<HTMLDivElement>(null);
    const voidGrainRef = useRef<HTMLDivElement>(null);

    // SVG Trace Paths
    const pathRef = useRef<SVGPathElement>(null);
    const glowPathRef = useRef<SVGPathElement>(null);
    const circlePathRef = useRef<SVGPathElement>(null);

    // Directional Pen Arrows along the Path
    const arrow1Ref = useRef<SVGPathElement>(null);
    const arrow2Ref = useRef<SVGPathElement>(null);
    const arrow3Ref = useRef<SVGPathElement>(null);

    // Vector Signature Paths
    const sigLeadRef = useRef<SVGPathElement>(null);
    const sigAnupRef = useRef<SVGPathElement>(null);
    const sigRawatRef = useRef<SVGPathElement>(null);
    const sigFlourishRef = useRef<SVGPathElement>(null);

    // Epilogue Quote Ref
    const epilogueRef = useRef<HTMLDivElement>(null);

    const [isLocked, setIsLocked] = useState(false);

    // High-Precision Physics Refs (Virtual Camera Engine)
    const progressRef = useRef(0);
    const targetProgressRef = useRef(0);
    const velocityRef = useRef(0);
    const lastTimeRef = useRef(performance.now());

    // Path arc lengths
    const pathLengthRef = useRef(4000);
    const circleLengthRef = useRef(200);
    const sigLeadLenRef = useRef(350);
    const sigAnupLenRef = useRef(600);
    const sigRawatLenRef = useRef(550);
    const sigFlourishLenRef = useRef(400);

    // Interactive Tactile Stickers
    const [stickers, setStickers] = useState<{
        [key: string]: { x: number; y: number; rot: number };
    }>({
        figma: { x: 0, y: 0, rot: -12 },
        code: { x: 0, y: 0, rot: 15 },
        coffee: { x: 0, y: 0, rot: -8 },
        terminal: { x: 0, y: 0, rot: -18 },
        brand: { x: 0, y: 0, rot: 4 },
    });

    const dragRef = useRef<{
        id: string | null;
        startX: number;
        startY: number;
        origX: number;
        origY: number;
    }>({
        id: null,
        startX: 0,
        startY: 0,
        origX: 0,
        origY: 0,
    });

    const handlePointerDown = (id: string, e: React.PointerEvent) => {
        e.stopPropagation();
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
        dragRef.current = {
            id,
            startX: e.clientX,
            startY: e.clientY,
            origX: stickers[id].x,
            origY: stickers[id].y,
        };
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!dragRef.current.id) return;
        const dx = e.clientX - dragRef.current.startX;
        const dy = e.clientY - dragRef.current.startY;
        const id = dragRef.current.id;
        setStickers((prev) => ({
            ...prev,
            [id]: {
                ...prev[id],
                x: dragRef.current.origX + dx,
                y: dragRef.current.origY + dy,
            },
        }));
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        if (dragRef.current.id) {
            try {
                (e.target as HTMLElement).releasePointerCapture(e.pointerId);
            } catch {
                // pointer capture release fallback
            }
            dragRef.current.id = null;
        }
    };

    // Mathematical interpolation & easing curves
    const clamp = (val: number, min = 0, max = 1) =>
        Math.max(min, Math.min(max, val));
    const mapRange = (
        val: number,
        inMin: number,
        inMax: number,
        outMin = 0,
        outMax = 1,
    ) => {
        if (inMax === inMin) return outMin;
        const t = clamp((val - inMin) / (inMax - inMin), 0, 1);
        return outMin + t * (outMax - outMin);
    };
    // Quintic smootherstep spline (C2-continuous: zero velocity and zero jerk at endpoints)
    const smootherstep = (t: number) => {
        const c = clamp(t, 0, 1);
        return c * c * c * (c * (c * 6 - 15) + 10);
    };
    const easeInOutCubic = (t: number) =>
        t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    const easeOutQuad = (t: number) => 1 - (1 - t) * (1 - t);
    const easeInOutQuad = (t: number) =>
        t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

    // Smooth jump to progress (for HUD stage buttons)
    const jumpToProgress = useCallback((val: number) => {
        const clamped = clamp(val, 0, 1);
        targetProgressRef.current = clamped;
        if (stRef.current) {
            const scrollPos =
                stRef.current.start +
                clamped * (stRef.current.end - stRef.current.start);
            window.scrollTo({ top: scrollPos, behavior: "smooth" });
        }
    }, []);


    const updateVisuals = useCallback((p: number) => {
        const isDesktop = window.innerWidth > 768;

      
        const submergeProg = mapRange(p, 0.84, 0.88);
        const submergeEase = easeInOutQuad(submergeProg);
        const paperOpacity = 1 - submergeEase;

        // Void grain texture
        if (voidGrainRef.current) {
            voidGrainRef.current.style.opacity = `${0.03 + submergeEase * 0.12}`;
        }

       
        const pathLen = pathLengthRef.current;
        let lineFraction = 0;
        if (p <= 0.24) {
            lineFraction = 0; // Strictly 0% when camera is far or approaching
        } else if (p >= 0.84) {
            lineFraction = 1;
        } else {
            lineFraction = (p - 0.24) / (0.84 - 0.24);
        }
        const dashOffset = (1 - lineFraction) * pathLen;

        // Color transition from Royal Blue to Archival Pure White during the Submerge
        const colorT = mapRange(p, 0.84, 0.88);
        const r = Math.round(1 + (255 - 1) * colorT);
        const g = Math.round(44 + (255 - 44) * colorT);
        const b = Math.round(235 + (255 - 235) * colorT);
        const currentLineColor = `rgb(${r}, ${g}, ${b})`;

        if (pathRef.current) {
            pathRef.current.style.strokeDashoffset = `${dashOffset.toFixed(2)}px`;
            pathRef.current.style.stroke = currentLineColor;
        }
        if (glowPathRef.current) {
            glowPathRef.current.style.strokeDashoffset = `${dashOffset.toFixed(2)}px`;
            glowPathRef.current.style.stroke = currentLineColor;
            glowPathRef.current.style.opacity = `${(0.4 + colorT * 0.3) * (1 - submergeEase * 0.35)}`;
        }

        // Directional Arrowheads along the pen path (strictly scroll-controlled, no CSS transition delay)
        if (arrow1Ref.current) {
            const a1p = mapRange(p, 0.38, 0.44);
            arrow1Ref.current.style.opacity = `${(a1p * paperOpacity).toFixed(3)}`;
            arrow1Ref.current.style.stroke = currentLineColor;
        }
        if (arrow2Ref.current) {
            const a2p = mapRange(p, 0.58, 0.64);
            arrow2Ref.current.style.opacity = `${(a2p * paperOpacity).toFixed(3)}`;
            arrow2Ref.current.style.stroke = currentLineColor;
        }
        if (arrow3Ref.current) {
            const a3p = mapRange(p, 0.7, 0.76);
            arrow3Ref.current.style.opacity = `${(a3p * paperOpacity).toFixed(3)}`;
            arrow3Ref.current.style.stroke = currentLineColor;
        }

        // -------------------------------------------------------------------------
        // 3. HAND-DRAWN "SNEAKERS" CIRCLE (Headline hold: 0.28 -> 0.38)
        // -------------------------------------------------------------------------
        if (circlePathRef.current) {
            const circleLen = circleLengthRef.current;
            const circleProg = mapRange(p, 0.28, 0.38);
            circlePathRef.current.style.strokeDashoffset = `${((1 - circleProg) * circleLen).toFixed(2)}px`;
            circlePathRef.current.style.stroke =
                p > 0.84 ? currentLineColor : "#012CEB";
        }

      
        if (sigLeadRef.current) {
            const leadLen = sigLeadLenRef.current;
            const leadProg = mapRange(p, 0.85, 0.875);
            sigLeadRef.current.style.strokeDashoffset = `${((1 - leadProg) * leadLen).toFixed(2)}px`;
            sigLeadRef.current.style.stroke = currentLineColor;
        }

        if (sigAnupRef.current) {
            const anupLen = sigAnupLenRef.current;
            const anupProg = mapRange(p, 0.875, 0.905);
            sigAnupRef.current.style.strokeDashoffset = `${((1 - anupProg) * anupLen).toFixed(2)}px`;
        }

        if (sigRawatRef.current) {
            const rawatLen = sigRawatLenRef.current;
            const rawatProg = mapRange(p, 0.905, 0.93);
            sigRawatRef.current.style.strokeDashoffset = `${((1 - rawatProg) * rawatLen).toFixed(2)}px`;
        }

        if (sigFlourishRef.current) {
            const flourishLen = sigFlourishLenRef.current;
            const flourishProg = mapRange(p, 0.93, 0.945);
            sigFlourishRef.current.style.strokeDashoffset = `${((1 - flourishProg) * flourishLen).toFixed(2)}px`;
        }

        // Epilogue Quote below signature (Revealed during settle hold)
        if (epilogueRef.current) {
            const eqProg = mapRange(p, 0.935, 0.965);
            epilogueRef.current.style.opacity = `${eqProg.toFixed(3)}`;
            epilogueRef.current.style.transform = `translate(-50%, ${(1 - eqProg) * 8}px)`;
        }

      
        let camScale = isDesktop ? 0.46 : 0.38;
        let camX = 0;
        let camY = 8;
        let camRotX = 16;
        let camRotY = -3;
        let camRotZ = 0;
        let spotX = 50;
        let spotY = 50;

        if (p < 0.22) {
            // 1. OPENING CINEMATIC DOLLY IN
            // Continuous C2 Hermite curve: zero initial jerk, gentle acceleration, soft deceleration
            const u = smootherstep(p / 0.22);
            const initialScale = isDesktop ? 0.46 : 0.38;
            const targetScale = isDesktop ? 1.25 : 0.98;
            camScale = initialScale + u * (targetScale - initialScale);
            camX = 0;
            camY = 8 * (1 - u); // softly settles from 8% to 0%
            camRotX = 16 * (1 - u); // softly tilts from 16deg to 0deg
            camRotY = -3 * (1 - u); // softly aligns from -3deg to 0deg
            spotX = 50;
            spotY = 50;
        } else if (p < 0.4) {
            // 2. DIVE INTO HEADLINE & READING HOLD (Macro zoom into top-left)
            const u = smootherstep((p - 0.22) / (0.4 - 0.22));
            const startScale = isDesktop ? 1.25 : 0.98;
            const targetScale = isDesktop ? 2.2 : 1.7;
            camScale = startScale + u * (targetScale - startScale);
            camX = u * (isDesktop ? 25 : 18);
            camY = u * 20; // -> 20%
            camRotX = u * 4; // -> 4deg
            camRotY = u * -2; // -> -2deg
            spotX = 50 - u * 24; // -> 26%
            spotY = 50 - u * 26; // -> 24%
        } else if (p < 0.54) {
            // 3. PAN DOWN TO PORTRAIT RETICLE & MICRO-STORY
            const u = smootherstep((p - 0.4) / (0.54 - 0.4));
            const startScale = isDesktop ? 2.2 : 1.7;
            const targetScale = isDesktop ? 2.1 : 1.62;
            camScale = startScale + u * (targetScale - startScale);
            camX = (isDesktop ? 25 : 18) - u * 4; // -> 21%
            camY = 20 - u * 40; // -> -20%
            camRotX = 4 + u * 4; // -> 8deg
            camRotY = -2 + u * 2; // -> 0deg
            spotX = 26 - u * 6; // -> 20%
            spotY = 24 + u * 46; // -> 70%
        } else if (p < 0.68) {
            // 4. PAN ACROSS TO POLAROID & STRATEGY READING MOMENT
            const u = smootherstep((p - 0.54) / (0.68 - 0.54));
            const startScale = isDesktop ? 2.1 : 1.62;
            const targetScale = isDesktop ? 1.98 : 1.5;
            camScale = startScale + u * (targetScale - startScale);
            camX = (isDesktop ? 21 : 14) - u * 17; // -> 4%
            camY = -20 + u * 6; // -> -14%
            camRotX = 8 - u * 1; // -> 7deg
            camRotY = u * 2; // -> 2deg
            spotX = 20 + u * 22; // -> 42%
            spotY = 70 - u * 4; // -> 66%
        } else if (p < 0.78) {
            // 5. CROSS CENTRAL SPINE INTO RIGHT PAGE / PHILOSOPHY
            const u = smootherstep((p - 0.68) / (0.78 - 0.68));
            const startScale = isDesktop ? 1.98 : 1.5;
            const targetScale = isDesktop ? 2.1 : 1.62;
            camScale = startScale + u * (targetScale - startScale);
            camX = 4 - u * 28; // -> -24%
            camY = -14 + u * 22; // -> 8%
            camRotX = 7 + u * 3; // -> 10deg
            camRotY = 2 + u * 4; // -> 6deg
            spotX = 42 + u * 24; // -> 66%
            spotY = 66 - u * 34; // -> 32%
        } else if (p < 0.84) {
            // 6. PAN DOWN ACROSS EXPERIENCE & EVIDENCE STAMPS
            const u = smootherstep((p - 0.78) / (0.84 - 0.78));
            const startScale = isDesktop ? 2.1 : 1.62;
            const targetScale = isDesktop ? 1.95 : 1.47;
            camScale = startScale + u * (targetScale - startScale);
            camX = -24 + u * 4; // -> -20%
            camY = 8 - u * 26; // -> -18%
            camRotX = 10 - u * 2; // -> 8deg
            camRotY = 6 - u * 3; // -> 3deg
            spotX = 66 + u * 8; // -> 74%
            spotY = 32 + u * 38; // -> 70%
        } else if (p < 0.88) {
            // 7. SIGNATURE APPROACH & SUBMERGE: CAMERA RE-CENTERS AND SLOWS DOWN
            const u = smootherstep((p - 0.84) / (0.88 - 0.84));
            const startScale = isDesktop ? 1.95 : 1.47;
            const targetScale = isDesktop ? 1.05 : 0.85;
            camScale = startScale + u * (targetScale - startScale);
            camX = -20 * (1 - u); // -> 0%
            camY = -18 * (1 - u); // -> 0%
            camRotX = 8 * (1 - u); // -> 0deg
            camRotY = 3 * (1 - u); // -> 0deg
            camRotZ = 0;
            spotX = 74 - u * 24; // -> 50%
            spotY = 70 - u * 20; // -> 50%
        } else if (p < 0.96) {
            // 8. SIGNATURE DRAWING & BREATHING HOLD (Camera holds completely steady at center!)
            camScale = isDesktop ? 1.05 : 0.85;
            camX = 0;
            camY = 0;
            camRotX = 0;
            camRotY = 0;
            camRotZ = 0;
            spotX = 50;
            spotY = 50;
        } else {
            // 9. EXIT: CAMERA TRAVELS DOWNWARD, RELEASING TO SELECTED WORKS
            const u = smootherstep((p - 0.96) / (1.0 - 0.96));
            camScale = isDesktop ? 1.05 : 0.85;
            camX = 0;
            camY = -u * 8; // gentle subtle exit movement without leaving empty bottom gap
            camRotX = 0;
            camRotY = 0;
            camRotZ = 0;
            spotX = 50;
            spotY = 50;
        }

        if (notebookRef.current) {
            notebookRef.current.style.transform = `perspective(1800px) rotateX(${camRotX.toFixed(2)}deg) rotateY(${camRotY.toFixed(2)}deg) rotateZ(${camRotZ.toFixed(2)}deg) scale(${camScale.toFixed(3)}) translate3d(${camX.toFixed(2)}%, ${camY.toFixed(2)}%, 0)`;
        }

        if (spotlightRef.current) {
            spotlightRef.current.style.setProperty(
                "--spot-x",
                `${spotX.toFixed(2)}%`,
            );
            spotlightRef.current.style.setProperty(
                "--spot-y",
                `${spotY.toFixed(2)}%`,
            );
            const spotOpacity =
                p < 0.18 ? 0.95 : 0.85 * (1 - submergeEase * 0.75);
            spotlightRef.current.style.opacity = `${spotOpacity}`;
        }

      
        const leftBase = document.getElementById("left-page-base");
        const rightBase = document.getElementById("right-page-base");
        const spine = document.getElementById("central-spine-element");
        const stickersWrap = document.querySelectorAll(".draggable-sticker");

        if (leftBase) leftBase.style.opacity = `${paperOpacity.toFixed(3)}`;
        if (rightBase) rightBase.style.opacity = `${paperOpacity.toFixed(3)}`;
        if (spine) spine.style.opacity = `${paperOpacity.toFixed(3)}`;
        stickersWrap.forEach((st) => {
            (st as HTMLElement).style.opacity = `${paperOpacity.toFixed(3)}`;
        });

        // Scotch-taped Intro Note
        const introNote = document.getElementById("intro-sticky-note");
        if (introNote) {
            const enter = mapRange(p, 0.08, 0.2);
            introNote.style.opacity = `${(enter * paperOpacity).toFixed(3)}`;
            introNote.style.transform = `translateY(${(1 - enter) * -20}px) rotate(${-6 + enter * 4}deg) scale(${0.88 + enter * 0.12})`;
        }

        // Staggered Headline Lines
        const h1 = document.getElementById("origin-headline-line-1");
        const h2 = document.getElementById("origin-headline-line-2");
        const h3 = document.getElementById("origin-headline-line-3");
        const h4 = document.getElementById("origin-headline-line-4");
        const h5 = document.getElementById("origin-headline-line-5");
        const h6 = document.getElementById("origin-headline-line-6");
        const headlineLines = [h1, h2, h3, h4, h5, h6];
        headlineLines.forEach((h, idx) => {
            if (h) {
                const startP = 0.2 + idx * 0.022;
                const endP = startP + 0.06;
                const pr = mapRange(p, startP, endP);
                h.style.opacity = `${(0.15 + pr * 0.85).toFixed(3)}`;
                h.style.transform = `translateX(${(1 - pr) * -16}px)`;
                h.style.filter = `blur(${(1 - pr) * 3}px)`;
            }
        });

        // Cursive Tag "how it all started."
        const cursiveTag = document.getElementById("frag-origin-cursive");
        if (cursiveTag) {
            const cp = mapRange(p, 0.18, 0.28);
            cursiveTag.style.opacity = `${(cp * (p > 0.83 ? paperOpacity : 1)).toFixed(3)}`;
            cursiveTag.style.transform = `translateY(${(1 - cp) * -10}px) rotate(-2deg)`;
        }

        // Micro Story Paragraph
        const microStory = document.getElementById("origin-micro-story");
        if (microStory) {
            const mp = mapRange(p, 0.4, 0.52);
            microStory.style.opacity = `${((0.15 + mp * 0.85) * (p > 0.83 ? paperOpacity : 1)).toFixed(3)}`;
            microStory.style.filter = `blur(${(1 - mp) * 3}px)`;
        }

        // Personal Portrait Cutout
        const cutout = document.getElementById("personal-cutout");
        if (cutout) {
            const cup = mapRange(p, 0.44, 0.54);
            cutout.style.opacity = `${((0.15 + cup * 0.85) * (p > 0.83 ? paperOpacity : 1)).toFixed(3)}`;
            cutout.style.filter = `blur(${(1 - cup) * 3}px)`;
        }

        // Strategy Annotation Note
        const strategy = document.getElementById("frag-strategy-annot");
        if (strategy) {
            const sp = mapRange(p, 0.52, 0.64);
            strategy.style.opacity = `${((0.15 + sp * 0.85) * (p > 0.83 ? paperOpacity : 1)).toFixed(3)}`;
            strategy.style.filter = `blur(${(1 - sp) * 3}px)`;
        }

        // Polaroid Memory Flight & Settle
        const polaroid = document.getElementById("art-polaroid");
        if (polaroid) {
            if (p < 0.52) {
                polaroid.style.opacity = `${(mapRange(p, 0.44, 0.52) * 0.3).toFixed(3)}`;
                polaroid.style.transform = `translate(12px, 32px) rotate(10deg) scale(0.86)`;
                polaroid.style.filter = `blur(4px)`;
            } else if (p < 0.64) {
                const t = easeOutQuad(mapRange(p, 0.52, 0.64));
                const polY = 32 - t * 46;
                const polX = 12 - t * 16;
                const polRot = 10 - t * 4;
                const polScale = 0.86 + t * 0.26;
                polaroid.style.opacity = `${paperOpacity.toFixed(3)}`;
                polaroid.style.filter = "blur(0px)";
                polaroid.style.transform = `translate(${polX.toFixed(1)}px, ${polY.toFixed(1)}px) rotate(${polRot.toFixed(1)}deg) scale(${polScale.toFixed(2)})`;
            } else {
                const t = easeInOutCubic(mapRange(p, 0.64, 0.74));
                const polY = -14 + t * 14;
                const polX = -4 + t * 4;
                const polRot = 6 - t * 2;
                const polScale = 1.12 - t * 0.12;
                polaroid.style.opacity = `${paperOpacity.toFixed(3)}`;
                polaroid.style.filter = "blur(0px)";
                polaroid.style.transform = `translate(${polX.toFixed(1)}px, ${polY.toFixed(1)}px) rotate(${polRot.toFixed(1)}deg) scale(${polScale.toFixed(2)})`;
            }
        }

        // SCENE 02 ELEMENTS:
        // Core Philosophy Cutout (art-terminal)
        const terminal = document.getElementById("art-terminal");
        if (terminal) {
            const tp = mapRange(p, 0.68, 0.78);
            terminal.style.opacity = `${((0.15 + tp * 0.85) * paperOpacity).toFixed(3)}`;
            terminal.style.filter = `blur(${(1 - tp) * 3}px)`;
            terminal.style.transform = `translateX(${(1 - tp) * -14}px) rotate(-1.5deg)`;
        }

        // 186M+ Manila Tag (art-stats)
        const statsTag = document.getElementById("art-stats");
        if (statsTag) {
            const stp = mapRange(p, 0.72, 0.81);
            statsTag.style.opacity = `${((0.15 + stp * 0.85) * paperOpacity).toFixed(3)}`;
            statsTag.style.filter = `blur(${(1 - stp) * 3}px)`;
            statsTag.style.transform = `rotate(${9 - stp * 4}deg) translateY(${(1 - stp) * -12}px)`;
        }

        // Experience Typewriter
        const expType = document.getElementById("experience-typewriter");
        if (expType) {
            const ep = mapRange(p, 0.74, 0.82);
            expType.style.opacity = `${((0.15 + ep * 0.85) * paperOpacity).toFixed(3)}`;
            expType.style.filter = `blur(${(1 - ep) * 3}px)`;
        }

        // Clustered Evidence Stamps
        const stampBlue = document.querySelector(
            ".evidence-stamp-blue",
        ) as HTMLElement | null;
        const stampYellow = document.querySelector(
            ".evidence-stamp-yellow",
        ) as HTMLElement | null;
        const stampRed = document.querySelector(
            ".evidence-stamp-red",
        ) as HTMLElement | null;

        if (stampBlue) {
            const bp = mapRange(p, 0.77, 0.82);
            stampBlue.style.opacity = `${(bp * paperOpacity).toFixed(3)}`;
            stampBlue.style.transform = `scale(${(1.32 - bp * 0.32).toFixed(2)}) rotate(-2deg)`;
        }
        if (stampYellow) {
            const yp = mapRange(p, 0.79, 0.84);
            stampYellow.style.opacity = `${(yp * paperOpacity).toFixed(3)}`;
            stampYellow.style.transform = `scale(${(1.32 - yp * 0.32).toFixed(2)}) rotate(2.5deg)`;
        }
        if (stampRed) {
            const rp = mapRange(p, 0.81, 0.86);
            stampRed.style.opacity = `${(rp * paperOpacity).toFixed(3)}`;
            stampRed.style.transform = `scale(${(1.32 - rp * 0.32).toFixed(2)}) rotate(-3deg)`;
        }

        // Torn Signature Note
        const tornSig = document.getElementById("torn-signature-paper");
        if (tornSig) {
            const tsp = mapRange(p, 0.82, 0.87);
            tornSig.style.opacity = `${((0.15 + tsp * 0.85) * paperOpacity).toFixed(3)}`;
            tornSig.style.filter = `blur(${(1 - tsp) * 3}px)`;
            tornSig.style.transform = `translateY(${(1 - tsp) * 12}px) rotate(-1deg)`;
        }

        // Footnote highlights
        const footnote = document.getElementById("other-highlights-block");
        if (footnote) {
            const fnp = mapRange(p, 0.83, 0.88);
            footnote.style.opacity = `${((0.15 + fnp * 0.85) * paperOpacity).toFixed(3)}`;
        }

    }, []);

   
    useEffect(() => {
        let animId: number;
        lastTimeRef.current = performance.now();

        const tick = (now: number) => {
            // Calculate delta time (dt) in seconds, capped to 33ms to prevent frame jumps
            const dt = Math.min((now - lastTimeRef.current) / 1000, 0.033);
            lastTimeRef.current = now;

            const diff = targetProgressRef.current - progressRef.current;

            if (Math.abs(diff) > 0.00001) {
                // High-precision decay rate: immediate zero-latency start with buttery exponential settle
                const decayRate = 8.2;
                const factor = 1 - Math.exp(-decayRate * dt);
                const step = diff * factor;
                progressRef.current += step;
                velocityRef.current = step / dt;
            } else {
                progressRef.current = targetProgressRef.current;
                velocityRef.current = 0;
            }

            const p = progressRef.current;
            updateVisuals(p);

            animId = requestAnimationFrame(tick);
        };

        animId = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(animId);
    }, [updateVisuals]);

    // SVG Path lengths initialization & initial zero-state enforcement
    useEffect(() => {
        if (pathRef.current) {
            const len = pathRef.current.getTotalLength() || 3360;
            pathLengthRef.current = len;
            pathRef.current.style.strokeDasharray = `${len}px`;
            pathRef.current.style.strokeDashoffset = `${len}px`;
        }
        if (glowPathRef.current) {
            const len = pathLengthRef.current;
            glowPathRef.current.style.strokeDasharray = `${len}px`;
            glowPathRef.current.style.strokeDashoffset = `${len}px`;
        }
        if (circlePathRef.current) {
            circleLengthRef.current =
                circlePathRef.current.getTotalLength() || 200;
            circlePathRef.current.style.strokeDasharray = `${circleLengthRef.current}px`;
            circlePathRef.current.style.strokeDashoffset = `${circleLengthRef.current}px`;
        }
        if (sigLeadRef.current) {
            sigLeadLenRef.current = sigLeadRef.current.getTotalLength() || 350;
            sigLeadRef.current.style.strokeDasharray = `${sigLeadLenRef.current}px`;
            sigLeadRef.current.style.strokeDashoffset = `${sigLeadLenRef.current}px`;
        }
        if (sigAnupRef.current) {
            sigAnupLenRef.current = sigAnupRef.current.getTotalLength() || 600;
            sigAnupRef.current.style.strokeDasharray = `${sigAnupLenRef.current}px`;
            sigAnupRef.current.style.strokeDashoffset = `${sigAnupLenRef.current}px`;
        }
        if (sigRawatRef.current) {
            sigRawatLenRef.current =
                sigRawatRef.current.getTotalLength() || 550;
            sigRawatRef.current.style.strokeDasharray = `${sigRawatLenRef.current}px`;
            sigRawatRef.current.style.strokeDashoffset = `${sigRawatLenRef.current}px`;
        }
        if (sigFlourishRef.current) {
            sigFlourishLenRef.current =
                sigFlourishRef.current.getTotalLength() || 400;
            sigFlourishRef.current.style.strokeDasharray = `${sigFlourishLenRef.current}px`;
            sigFlourishRef.current.style.strokeDashoffset = `${sigFlourishLenRef.current}px`;
        }

        // Immediately run visual update at progress 0 so initial paint is pure 0%
        updateVisuals(0);
    }, [updateVisuals]);

    // =========================================================================
    // PINNED SCROLLTRIGGER CONTROLLER (LOCKS ORIGIN TO VIEWPORT)
    // Section stays 100% pinned to viewport while the entire internal animation
    // (entrance -> headline -> reticle -> polaroid -> spine -> stamps -> signature)
    // progresses from 0% to 100%. Only upon reaching 100% does the section release.
    // =========================================================================
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const prefersReducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
        ).matches;
        if (prefersReducedMotion) {
            targetProgressRef.current = 1.0;
            progressRef.current = 1.0;
            updateVisuals(1.0);
            return;
        }

        // Pin duration: 3.5 viewports (~2600px) gives sleek, responsive pacing without extra empty space at the end
        const st = ScrollTrigger.create({
            trigger: container,
            pin: true,
            start: "top top",
            end: () => `+=${Math.max(window.innerHeight * 3.5, 2600)}`,
            pinSpacing: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
                targetProgressRef.current = self.progress;
                setIsLocked(
                    self.isActive && self.progress > 0 && self.progress < 1,
                );
            },
            onToggle: (self) => {
                setIsLocked(self.isActive && self.progress < 1);
            },
        });

        stRef.current = st;

        return () => {
            st.kill();
            stRef.current = null;
        };
    }, [updateVisuals]);

    return (
        <section
            id="origin"
            ref={containerRef}
            className="relative w-full h-screen bg-[#E6DDD2] text-[#14100E] selection:bg-[#14100E] selection:text-[#F4EDE4] select-none overflow-hidden"
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
        >
            {/* Pinned Camera Viewport */}
            <div
                id="about-sticky-wrap"
                className="relative w-full h-full overflow-hidden flex items-center justify-center book-viewport"
            >
                {/* Deep Void Grain Overlay */}
                <div
                    id="void-grain"
                    ref={voidGrainRef}
                    className="absolute inset-0 z-[5] pointer-events-none opacity-[0.04] transition-opacity duration-700"
                    style={{
                        backgroundImage:
                            'url("data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjAwIDIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZmlsdGVyIGlkPSJuIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iMS42IiBudW1PY3RhdmVzPSIzIiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsdGVyPSJ1cmwoI24pIi8+PC9zdmc+")',
                        mixBlendMode: "overlay",
                    }}
                />





                {/* ================================================================= */}
                {/* THE LARGE DIARY WORLD CANVAS (Transformed by Virtual Camera)      */}
                {/* ================================================================= */}
                <div
                    id="notebook-container"
                    ref={notebookRef}
                    className="relative w-[95vw] max-w-[1440px] h-[86vh] max-h-[840px] flex overflow-visible origin-center book-container rounded-xl will-change-transform select-none"
                >
                    {/* Global Directional Lighting (Top-Left Desk Lamp) */}
                    <div className="absolute inset-0 z-[120] pointer-events-none mix-blend-overlay bg-gradient-to-br from-white/25 via-transparent to-black/60 rounded-xl" />

                    {/* DYNAMIC CINEMATIC SPOTLIGHT (Tracks with the Virtual Camera) */}
                    <div
                        id="cinematic-spotlight"
                        ref={spotlightRef}
                        className="absolute inset-0 pointer-events-none mix-blend-multiply z-[125] overflow-hidden rounded-xl opacity-[0.85] transition-opacity duration-300"
                        style={{
                            // @ts-expect-error CSS variable
                            "--spot-x": "50%",
                            "--spot-y": "50%",
                        }}
                    >
                        {/* Ambient Deep Shadow */}
                        <div className="absolute inset-0 bg-[#070b16] opacity-[0.52]" />

                        {/* Outer warm key light */}
                        <div
                            className="absolute mix-blend-screen pointer-events-none"
                            style={{
                                left: "var(--spot-x)",
                                top: "var(--spot-y)",
                                width: "48vw",
                                height: "44vw",
                                transform:
                                    "translate(-50%, -50%) rotate(-10deg)",
                                background:
                                    "radial-gradient(ellipse 55% 58% at 48% 50%, rgba(255,244,220,1) 0%, rgba(255,236,190,0.45) 35%, transparent 68%)",
                                filter: "blur(35px)",
                            }}
                        />

                        {/* Inner hot spot */}
                        <div
                            className="absolute mix-blend-screen pointer-events-none"
                            style={{
                                left: "var(--spot-x)",
                                top: "var(--spot-y)",
                                width: "22vw",
                                height: "20vw",
                                transform: "translate(-50%, -50%)",
                                background:
                                    "radial-gradient(circle at 50% 50%, rgba(255,255,245,0.95) 0%, rgba(255,245,210,0.3) 48%, transparent 70%)",
                                filter: "blur(12px)",
                            }}
                        />
                    </div>

                    {/* CENTRAL SPRAY SPINE & BINDING CREASE */}
                    <div
                        id="central-spine-element"
                        className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-8 md:w-12 bg-gradient-to-r from-[#010204] via-[#090f1e] to-[#010204] z-[110] shadow-[inset_0_0_20px_rgba(0,0,0,0.95),_20px_0_30px_rgba(0,0,0,0.8),_-20px_0_30px_rgba(0,0,0,0.8)] border-x border-white/5 rounded-sm pointer-events-none flex justify-center py-6 transition-opacity duration-500"
                        style={{ transform: "translateZ(3px)" }}
                    >
                        <div className="w-full flex flex-col justify-between items-center h-full opacity-40">
                            <div className="w-full h-1 bg-[#111] shadow-[0_2px_2px_rgba(0,0,0,0.9)]" />
                            <div className="w-full h-1 bg-[#111] shadow-[0_2px_2px_rgba(0,0,0,0.9)]" />
                            <div className="w-full h-1 bg-[#111] shadow-[0_2px_2px_rgba(0,0,0,0.9)]" />
                        </div>
                    </div>

                    {/* CONTINUOUS BLUEPRINT JOURNEY PATH SVG (Hand-Drawn Vector Route + Arrows + Signature) */}
                    <svg
                        className="absolute inset-0 w-full h-full pointer-events-none z-[60]"
                        viewBox="0 0 1500 850"
                        preserveAspectRatio="none"
                    >
                        <defs>
                            <filter
                                id="cinematic-glow"
                                x="-20%"
                                y="-20%"
                                width="140%"
                                height="140%"
                            >
                                <feGaussianBlur
                                    stdDeviation="3.5"
                                    result="coloredBlur"
                                />
                                <feMerge>
                                    <feMergeNode in="coloredBlur" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>

                        {/* Start dot on upper-right note */}
                        <circle cx="535" cy="140" r="5" fill="#012CEB" opacity="0.9" />

                        {/* Glowing Backdrop Line */}
                        <path
                            id="blueprint-trace-path-glow"
                            ref={glowPathRef}
                            className="map-line-path"
                            d="M 535,140 C 460,95 380,95 310,120 C 220,160 190,260 250,340 C 310,410 430,440 460,420 C 500,390 520,380 500,430 C 470,510 520,580 580,550 C 640,510 700,380 740,260 C 770,180 810,130 850,140 C 950,50 1150,50 1250,100 C 1320,130 1250,220 1200,320 C 1150,420 1350,550 1300,680 C 1250,750 1150,680 1075,680 C 1000,680 920,660 850,680 C 800,700 800,730 850,750 C 920,780 980,820 1050,800"
                            style={{
                                stroke: "#012CEB",
                                strokeWidth: "7px",
                                opacity: 0.35,
                                fill: "none",
                                filter: "url(#cinematic-glow)",
                                strokeDasharray: "4500px",
                                strokeDashoffset: "4500px",
                                transition: "none",
                            }}
                        />

                        {/* Primary Crisp Blueprint Trace Path */}
                        <path
                            id="blueprint-trace-path"
                            ref={pathRef}
                            className="map-line-path"
                            d="M 535,140 C 460,95 380,95 310,120 C 220,160 190,260 250,340 C 310,410 430,440 460,420 C 500,390 520,380 500,430 C 470,510 520,580 580,550 C 640,510 700,380 740,260 C 770,180 810,130 850,140 C 950,50 1150,50 1250,100 C 1320,130 1250,220 1200,320 C 1150,420 1350,550 1300,680 C 1250,750 1150,680 1075,680 C 1000,680 920,660 850,680 C 800,700 800,730 850,750 C 920,780 980,820 1050,800"
                            style={{
                                stroke: "#012CEB",
                                strokeWidth: "3.5px",
                                opacity: 0.9,
                                fill: "none",
                                strokeDasharray: "4500px",
                                strokeDashoffset: "4500px",
                                transition: "none",
                            }}
                        />

                        {/* Additional Reference Marker Arrows on Left Page */}
                        {/* Arrow curving towards 'It started as curiosity.' */}
                        <path
                            d="M 430,350 C 460,345 480,345 498,350"
                            fill="none"
                            stroke="#012CEB"
                            strokeWidth="3px"
                            strokeLinecap="round"
                            opacity="0.9"
                        />
                        <path
                            d="M 490,344 L 500,350 L 490,356"
                            fill="none"
                            stroke="#012CEB"
                            strokeWidth="3px"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            opacity="0.9"
                        />

                        {/* Arrow curving down towards the Polaroid */}
                        <path
                            d="M 570,445 C 585,485 580,525 565,560"
                            fill="none"
                            stroke="#012CEB"
                            strokeWidth="3px"
                            strokeLinecap="round"
                            opacity="0.9"
                        />
                        <path
                            d="M 558,550 L 565,560 L 574,552"
                            fill="none"
                            stroke="#012CEB"
                            strokeWidth="3px"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            opacity="0.9"
                        />

                        {/* Hand-Drawn Directional Pen Arrowheads along the path (pure scroll control) */}
                        {/* Arrow 1: pointing left on the top loop */}
                        <path
                            ref={arrow1Ref}
                            d="M 405,90 L 392,97 L 405,104"
                            fill="none"
                            stroke="#012CEB"
                            strokeWidth="3px"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            style={{ opacity: 0, transition: "none" }}
                        />
                        {/* Arrow 2: loop curve near camera */}
                        <path
                            ref={arrow2Ref}
                            d="M 450,422 L 460,420 L 456,432"
                            fill="none"
                            stroke="#012CEB"
                            strokeWidth="3px"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            style={{ opacity: 0, transition: "none" }}
                        />
                        {/* Arrow 3: sweeping across spine to Scene 02 */}
                        <path
                            ref={arrow3Ref}
                            d="M 838,152 L 850,140 L 840,130"
                            fill="none"
                            stroke="#012CEB"
                            strokeWidth="3px"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            style={{ opacity: 0, transition: "none" }}
                        />

                        {/* Signature Lead Curve connecting directly into Signature Origin */}
                        <path
                            id="sig-lead-path"
                            ref={sigLeadRef}
                            className="map-line-path"
                            d="M 1050,800 C 1090,775 1040,730 940,725 C 840,720 740,740 680,750"
                            style={{
                                stroke: "#012CEB",
                                strokeWidth: "3px",
                                fill: "none",
                                strokeDasharray: "350px",
                                strokeDashoffset: "350px",
                                transition: "none",
                            }}
                        />

                        {/* ======================================================== */}
                        {/* HANDWRITTEN SIGNATURE "ANUP RAWAT" (Pure White Vector)  */}
                        {/* ======================================================== */}
                        <g id="signature-vector-group">
                            {/* Stroke 1: "ANUP" Cursive Path */}
                            <path
                                id="sig-anup"
                                ref={sigAnupRef}
                                className="map-line-path"
                                d="M 680,750 C 670,740 675,690 690,650 C 702,620 715,610 720,615 C 725,620 735,670 740,740 C 720,700 690,705 750,695 C 758,695 764,735 768,735 C 772,705 782,705 786,735 C 790,710 800,710 804,735 C 808,742 816,742 820,715 C 824,705 826,775 828,790 C 830,765 842,715 836,715 C 830,715 828,730 848,730"
                                style={{
                                    stroke: "#FFFFFF",
                                    strokeWidth: "3.4px",
                                    strokeLinecap: "round",
                                    strokeLinejoin: "round",
                                    fill: "none",
                                    filter: "drop-shadow(0 0 6px rgba(255,255,255,0.5))",
                                    strokeDasharray: "600px",
                                    strokeDashoffset: "600px",
                                    transition: "none",
                                }}
                            />

                            {/* Stroke 2: "RAWAT" Cursive Path */}
                            <path
                                id="sig-rawat"
                                ref={sigRawatRef}
                                className="map-line-path"
                                d="M 865,735 C 860,735 864,670 870,620 C 872,610 894,615 892,650 C 890,675 870,675 880,682 C 890,690 902,735 912,735 C 918,710 930,710 934,735 C 938,712 946,712 950,735 C 954,712 962,712 966,735 C 970,710 980,710 984,735 C 988,690 992,650 994,650 C 996,680 998,735 1004,735"
                                style={{
                                    stroke: "#FFFFFF",
                                    strokeWidth: "3.4px",
                                    strokeLinecap: "round",
                                    strokeLinejoin: "round",
                                    fill: "none",
                                    filter: "drop-shadow(0 0 6px rgba(255,255,255,0.5))",
                                    strokeDasharray: "550px",
                                    strokeDashoffset: "550px",
                                    transition: "none",
                                }}
                            />

                            {/* Stroke 3: Terminal Cross Stroke & Sweeping Underline Flourish */}
                            <path
                                id="sig-flourish"
                                ref={sigFlourishRef}
                                className="map-line-path"
                                d="M 980,675 C 995,675 1010,670 1015,668 M 1006,735 C 1025,738 950,772 840,776 C 720,780 610,768 560,750"
                                style={{
                                    stroke: "#FFFFFF",
                                    strokeWidth: "3.0px",
                                    strokeLinecap: "round",
                                    strokeLinejoin: "round",
                                    fill: "none",
                                    filter: "drop-shadow(0 0 6px rgba(255,255,255,0.5))",
                                    strokeDasharray: "400px",
                                    strokeDashoffset: "400px",
                                    transition: "none",
                                }}
                            />
                        </g>
                    </svg>

                    {/* Epilogue Quote in the Deep Dark Space (Revealed during Submerge & Signature) */}
                    <div
                        id="epilogue-quote"
                        ref={epilogueRef}
                        className="absolute top-[80%] left-1/2 -translate-x-1/2 text-center pointer-events-none z-[140] w-full max-w-[620px] opacity-0 transition-opacity duration-500"
                    >
                        <p className="font-schoolbell text-xs md:text-sm text-[#F4EFE6]/90 leading-relaxed mb-1.5 px-4">
                            “If I ever write a book on how I see creativity, it
                            will have infinite pages. And I'll still be figuring
                            it out.”
                        </p>
                        <span className="text-[9px] font-dm-mono text-[#012CEB] tracking-[0.25em] uppercase font-bold">
                            CHAPTER 01 // ORIGIN COMPLETE
                        </span>
                    </div>                    {/* ======================================================== */}
                    {/* SCENE 01: LEFT PAGE BASE (Cinematic Filmmaking Notebook) */}
                    {/* ======================================================== */}
                    <div
                        id="left-page-base"
                        className="absolute left-0 w-1/2 h-full bg-[#FAF7F0] flex flex-col page-crease-left rounded-l-xl overflow-hidden border-r border-black/20 z-[40] transition-opacity duration-500"
                    >
                        {/* Authentic Paper Texture & Faint Ruled Lines */}
                        <div className="absolute inset-0 paper-texture opacity-70 z-0 pointer-events-none" />
                        <div className="absolute inset-0 ruled-paper-lines opacity-[0.16] z-0 pointer-events-none" />
                        {/* Red Notebook Margin Line */}
                        <div className="notebook-red-margin" />

                        {/* Top Margin Header */}
                        <div
                            id="origin-page-header"
                            aria-hidden="true"
                            className="absolute top-[3.2%] left-[10.5%] font-dm-mono text-[9px] uppercase tracking-[0.25em] text-[#051024]/40 font-bold z-10 select-none"
                        >
                            01 — THE BEGINNING
                        </div>

                        {/* Bottom Margin Note */}
                        <div
                            aria-hidden="true"
                            className="absolute bottom-[3.2%] left-[10.5%] font-dm-mono text-[8.5px] uppercase tracking-[0.22em] text-[#051024]/35 font-bold z-10 select-none"
                        >
                            GOD'S PLAN
                        </div>

                        {/* Left Margin Sketch Doodle */}
                        <svg
                            className="absolute top-[42%] left-[2%] w-6 h-36 opacity-20 pointer-events-none z-10"
                            viewBox="0 0 24 140"
                            fill="none"
                            stroke="#1c1c1c"
                            strokeWidth="1.2"
                        >
                            <path d="M 22,2 L 4,20 L 4,120 L 22,138" strokeLinecap="round" />
                        </svg>

                        {/* Upper Right Scotch-Taped Scrap Note ("I'm an open book.") */}
                        <div
                            id="intro-sticky-note"
                            className="absolute top-[5%] right-[6%] w-[215px] bg-[#FAF8F2] p-3.5 pt-4.5 rounded-[2px] shadow-[2px_8px_20px_rgba(0,0,0,0.12),_inset_0_0_12px_rgba(0,0,0,0.02)] border border-black/5 rotate-[-1.5deg] z-[30] transition-opacity duration-300"
                        >
                            {/* Beige Masking Tape */}
                            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-11 h-4 scotch-tape rotate-[1deg] z-40 bg-[#e8ded0]/80 border border-black/10" />
                            {/* Red mini-margin line */}
                            <div className="absolute top-0 bottom-0 left-[16px] w-[1px] bg-red-400/35" />
                            <div className="relative pl-3.5">
                                <p className="font-caveat font-bold text-[16px] text-[#14100E] leading-[1.25]">
                                    I'm an open book.
                                </p>
                                <p className="font-caveat font-semibold text-[13.5px] text-black/80 leading-[1.25] mt-0.5">
                                    Here's the unfiltered timeline of<br />how I figured things out.
                                </p>
                            </div>
                        </div>

                        {/* Middle Right Handwritten Annotation ("It started as curiosity...") */}
                        <div
                            id="frag-strategy-annot"
                            className="absolute top-[34%] right-[6%] max-w-[215px] font-caveat font-bold text-[17px] md:text-[19px] text-[#012CEB] leading-[1.22] rotate-[-0.5deg] z-[25] text-left select-none"
                        >
                            <p>It started as curiosity.</p>
                            <p>Then it became a way of seeing the world.</p>
                            <p>The craft came later.</p>
                        </div>

                        {/* Main Headline & Story Stack (Upper/Lower Left Quadrant) */}
                        <div className="relative z-[20] w-full h-full flex flex-col justify-start pl-[10.5%] pr-[44%] pt-[6%] pb-[4%]">
                            {/* Blue Handwritten Intro Tag */}
                            <div
                                id="frag-origin-cursive"
                                className="relative font-caveat font-bold text-[20px] md:text-[23px] text-[#012CEB] leading-none mb-1.5 w-fit"
                            >
                                <span>how it all started.</span>
                                <svg
                                    className="w-full h-2 mt-0.5 overflow-visible"
                                    viewBox="0 0 160 8"
                                    fill="none"
                                >
                                    <path
                                        d="M 2,4 Q 80,7 158,3"
                                        stroke="#012CEB"
                                        strokeWidth="2.2"
                                        strokeLinecap="round"
                                    />
                                </svg>
                            </div>

                            {/* Hand-Drawn Bold Headline */}
                            <div
                                id="origin-headline"
                                className="w-full font-kalam font-bold text-[26px] md:text-[32px] xl:text-[36px] text-[#14100E] leading-[1.08] tracking-tight mb-3 select-none"
                            >
                                <span
                                    id="origin-headline-line-1"
                                    className="block text-[#14100E]"
                                >
                                    I Started making
                                </span>
                                <span
                                    id="origin-headline-line-2"
                                    className="block text-[#012CEB] font-bold"
                                >
                                    Cinematic videos
                                </span>
                                <span
                                    id="origin-headline-line-3"
                                    className="block text-[#14100E]"
                                >
                                    four years ago
                                </span>
                                <span
                                    id="origin-headline-line-4"
                                    className="block text-[#14100E]"
                                >
                                    Coz' I wanted to
                                </span>
                                <span
                                    id="origin-headline-line-5"
                                    className="block text-[#14100E]"
                                >
                                    tell stories
                                </span>
                                <span
                                    id="origin-headline-line-6"
                                    className="inline-flex items-center text-[#14100E] flex-wrap"
                                >
                                    <span>through a</span>
                                    <span className="inline-block relative text-[#012CEB] px-3 py-0.5 mx-1 font-bold">
                                        camera
                                        {/* Hand-Drawn Blue Loop Circle */}
                                        <svg
                                            className="absolute inset-0 w-full h-full pointer-events-none scale-125 overflow-visible"
                                            viewBox="0 0 120 48"
                                            preserveAspectRatio="none"
                                        >
                                            <path
                                                ref={circlePathRef}
                                                className="map-line-path"
                                                d="M 12,24 C 8,10 45,4 85,8 C 112,11 116,34 96,40 C 64,48 8,44 6,26 C 4,14 32,8 65,8"
                                                fill="none"
                                                stroke="#012CEB"
                                                strokeWidth="3px"
                                                strokeLinecap="round"
                                                style={{
                                                    strokeDasharray: "280px",
                                                    strokeDashoffset: "280px",
                                                    transition: "none",
                                                }}
                                            />
                                        </svg>
                                    </span>
                                    <span>.)</span>
                                </span>
                            </div>

                            {/* Supporting Story Paragraph */}
                            <div
                                id="origin-micro-story"
                                className="w-full max-w-[340px] font-schoolbell text-[12px] md:text-[13px] text-[#222]/85 leading-[1.38] mt-1 select-none"
                            >
                                <p className="mb-2">
                                    I had no idea what a marketing strategy was in 9th grade. I was just making YouTube thumbnails and taking whatever freelance gigs I could find through Insta & Discord.
                                </p>
                                <p>
                                    I didn't know what a “value proposition” was. I kept making things because I liked seeing them work.
                                </p>
                                {/* Subtle pencil underline */}
                                <svg
                                    className="w-32 h-2 mt-2 opacity-50"
                                    viewBox="0 0 120 8"
                                    fill="none"
                                >
                                    <path
                                        d="M 4,4 Q 60,7 116,3"
                                        stroke="#222"
                                        strokeWidth="1.8"
                                        strokeLinecap="round"
                                    />
                                </svg>
                            </div>
                        </div>

                        {/* Cinematic Camera Operator Cutout (Lower Middle / Right) */}
                        <div
                            id="personal-cutout"
                            className="absolute bottom-0 left-[38%] md:left-[40%] w-[340px] md:w-[380px] pointer-events-none z-[22] flex flex-col items-center select-none"
                        >
                            <img
                                src="/images/camera_operator.png"
                                alt="Cinematic Camera Operator"
                                className="w-full h-auto object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.35)]"
                            />

                            {/* Taped paper label "MANUAL 1250N" */}
                            <div className="absolute right-[2%] bottom-[23%] bg-[#FAF6EE] border border-black/10 px-2 py-0.5 text-[8.5px] font-dm-mono text-black/80 font-bold shadow-sm rotate-[3deg] z-10 flex flex-col items-center">
                                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-3 scotch-tape rotate-[-2deg] bg-[#e8ded0]/80 border border-black/10" />
                                <span className="leading-tight">MANUAL</span>
                                <span className="leading-tight">1250N</span>
                            </div>
                        </div>

                        {/* Polaroid Memory Photo ("Behind the frame") - Layered behind camera operator */}
                        <div
                            id="art-polaroid"
                            className="absolute bottom-[2%] right-[3%] md:right-[5%] w-[160px] md:w-[175px] bg-[#FDFBF7] p-2.5 pb-4 rounded-[2px] shadow-[3px_10px_24px_rgba(0,0,0,0.14),0_2px_6px_rgba(0,0,0,0.06)] border border-black/5 rotate-[-6deg] flex flex-col z-[18] select-none"
                        >
                            {/* Beige Masking Tape on Top */}
                            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-9 h-4 scotch-tape rotate-[2deg] z-30 bg-[#e8ded0]/80 border border-black/10" />

                            {/* Sunset Skyline Photo Window */}
                            <div className="w-full aspect-[4/3] rounded-[1px] overflow-hidden shadow-inner relative bg-[#1c1815]">
                                <img
                                    src="/images/polaroid_sunset.jpg"
                                    alt="Behind the frame - Golden hour skyline"
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            {/* Handwritten Polaroid Caption */}
                            <div className="mt-2 flex flex-col items-center">
                                <div className="font-caveat font-bold text-[15px] text-black/85 text-center leading-none">
                                    Behind the frame
                                </div>
                                <div className="w-16 h-[1.5px] bg-black/40 mx-auto mt-1 rounded-full" />
                            </div>
                        </div>
                    </div>

                    {/* ======================================================== */}
                    {/* SCENE 02: RIGHT PAGE BASE (One Yes Led To Another)        */}
                    {/* ======================================================== */}
                    <div
                        id="right-page-base"
                        className="absolute right-0 w-1/2 h-full bg-[#f6f3eb] flex flex-col page-crease-right realistic-paper-stack-right rounded-r-xl overflow-hidden border-l border-black/10 z-[40] transition-opacity duration-500"
                    >
                        <div className="absolute inset-0 paper-texture opacity-60 z-0 pointer-events-none" />
                        <div className="absolute inset-0 ruled-paper-lines opacity-[0.14] z-0 pointer-events-none" />
                        <div className="notebook-red-margin" />

                        {/* Right Page Content Grid */}
                        <div className="relative z-[70] w-full h-full p-6 md:p-12 flex flex-col justify-between">
                            {/* Page Index Header */}
                            <div
                                id="origin-page-header-2"
                                aria-hidden="true"
                                className="flex justify-between items-center opacity-40 font-schoolbell text-[9px] uppercase tracking-[0.25em] font-bold text-[#051024]"
                            >
                                <span>02 — ONE YES LED TO ANOTHER</span>
                                <span>things that happened</span>
                            </div>

                            {/* Right Content Workspace */}
                            <div className="relative flex-grow mt-3 mb-2 flex flex-col justify-start">
                                {/* ARCHIVAL MANILA TAG (186M+ View Achievement Element) */}
                                <div
                                    id="art-stats"
                                    className="absolute top-[2%] right-[4%] w-full max-w-[145px] md:max-w-[165px] transform rotate-[5deg] origin-top-right flex flex-col z-30"
                                >
                                    {/* SVG String tying it to page */}
                                    <svg
                                        className="absolute -top-12 right-[18px] w-16 h-18 pointer-events-none z-0"
                                        viewBox="0 0 60 70"
                                    >
                                        <path
                                            d="M 40,0 C 35,25 20,30 18,65"
                                            fill="none"
                                            stroke="#b5af9f"
                                            strokeWidth="1.5"
                                        />
                                    </svg>

                                    {/* Manila Tag Body */}
                                    <div
                                        className="relative w-full bg-[#E5DCC5] shadow-[2px_6px_16px_rgba(0,0,0,0.18),_inset_0_0_20px_rgba(0,0,0,0.03)] z-10 p-3.5"
                                        style={{
                                            borderRadius: "4px 22px 4px 4px",
                                        }}
                                    >
                                        <div className="absolute top-2.5 right-3.5 w-4 h-4 rounded-full bg-[#f6f3eb] shadow-[inset_1px_2px_4px_rgba(0,0,0,0.3)] flex items-center justify-center border border-black/10">
                                            <div className="w-2.5 h-2.5 rounded-full border border-[#b8ae98]" />
                                        </div>

                                        <div className="text-[7.5px] font-schoolbell text-black/50 font-bold tracking-widest uppercase mb-0.5">
                                            IN 3 MONTHS
                                        </div>

                                        {/* Stamped 186M+ crimson number */}
                                        <h4
                                            className="font-bebas text-4xl text-[#A62B2B] leading-none transform -rotate-[2deg] opacity-95 mix-blend-multiply my-0.5"
                                            style={{
                                                textShadow:
                                                    "0px 0px 1px rgba(166,43,43,0.3)",
                                            }}
                                        >
                                            186M+
                                        </h4>

                                        <div className="w-full h-[1px] bg-black/10 my-1.5" />

                                        <div className="text-[8.5px] font-schoolbell uppercase tracking-wider text-black/75 font-bold leading-tight">
                                            VIEWS DRIVEN
                                        </div>
                                    </div>

                                    {/* Hand-drawn Arrow & Note */}
                                    <div className="relative mt-2 -left-8 font-gloria text-[8px] text-[#012CEB] tracking-tight -rotate-[4deg] leading-tight text-left">
                                        <svg
                                            className="absolute -right-4 -top-1 w-6 h-6 opacity-90"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.8"
                                        >
                                            <path
                                                d="M4 18 C12 16 16 11 18 5 M13 7 L18 5 L19 11"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                        crazy what happens
                                        <br />
                                        when you just make
                                        <br />
                                        weirdly creative stuff.
                                    </div>
                                </div>

                                {/* CORE PHILOSOPHY PRINT CUTOUT (art-terminal) */}
                                <div
                                    id="art-terminal"
                                    className="w-full max-w-[260px] md:max-w-[280px] bg-[#fdfbf7] p-4 transform -rotate-[1.5deg] z-20 shadow-[0_4px_12px_rgba(0,0,0,0.08)] border border-black/10 border-l-[3px] border-l-[#012CEB] rounded mb-4"
                                >
                                    <div className="absolute -top-2.5 left-5 w-8 h-3.5 scotch-tape rotate-[-4deg] z-30" />

                                    <div className="flex items-center gap-1.5 opacity-60 mb-1.5">
                                        <span className="font-schoolbell text-[7.5px] uppercase tracking-[0.2em] font-bold text-black">
                                            CORE PHILOSOPHY
                                        </span>
                                    </div>

                                    <h4 className="font-inter font-[900] text-sm md:text-base leading-tight mb-1.5 tracking-tight text-black uppercase">
                                        ART WITH A PURPOSE.
                                    </h4>

                                    <p className="font-dm-sans text-[10.5px] md:text-[11px] text-black/75 leading-relaxed">
                                        “The goal was never just to write code.
                                        It was to build things that actually
                                        work.” I obsess over aesthetics, but I
                                        love it even more when systems actually
                                        hold up under real-world load.
                                    </p>

                                    <div className="font-gloria text-[11px] text-[#012CEB] tracking-tight rotate-[2deg] text-right mt-2">
                                        beautiful design that actually works.
                                    </div>
                                </div>

                                {/* EXPERIENCE EVOLUTION TYPEWRITER BLOCK */}
                                <div
                                    id="experience-typewriter"
                                    className="w-full max-w-[280px] p-3 font-schoolbell text-[11px] text-[#222] leading-relaxed mb-3"
                                >
                                    <div className="text-[9px] font-bold text-[#051024] tracking-wider mb-1 uppercase opacity-60">
                                        // PLACES I'VE HUSTLED AT
                                    </div>
                                    <p className="mb-1 text-black/90 font-bold">
                                        Founding Engineer at RNTL · Distributed
                                        Systems Lead
                                    </p>
                                    <p className="text-[10px] text-black/60">
                                        From early freelance experiments to
                                        building scalable infrastructure serving
                                        millions of requests.
                                    </p>
                                </div>

                                {/* CLUSTERED EVIDENCE RUBBER STAMPS */}
                                <div
                                    id="metrics-stamps-group"
                                    className="w-full flex justify-between items-start gap-2.5 md:gap-3 z-20 my-2"
                                >
                                    {/* Blue Stamp */}
                                    <div className="evidence-stamp-blue flex-1 p-2 md:p-3 flex flex-col justify-between h-[85px] md:h-[95px] rounded">
                                        <div>
                                            <span className="font-bebas text-2xl md:text-3xl block leading-none tracking-tight">
                                                DU RANK 1
                                            </span>
                                            <span className="font-schoolbell font-bold text-[7px] md:text-[8px] leading-tight block uppercase">
                                                TOP 1% CRAFT
                                            </span>
                                        </div>
                                        <span className="font-gloria font-medium text-[8px] md:text-[9px] text-[#012CEB]/90 tracking-tight text-right leading-none">
                                            zero compromise
                                        </span>
                                    </div>

                                    {/* Yellow Stamp */}
                                    <div className="evidence-stamp-yellow flex-1 p-2 md:p-3 flex flex-col justify-between h-[85px] md:h-[95px] rounded">
                                        <div>
                                            <span className="font-bebas text-2xl md:text-3xl block leading-none tracking-tight">
                                                50+
                                            </span>
                                            <span className="font-schoolbell font-bold text-[7px] md:text-[8px] leading-tight block uppercase">
                                                APPS SHIPPED
                                            </span>
                                        </div>
                                        <span className="font-gloria font-medium text-[8px] md:text-[9px] text-yellow-900/80 tracking-tight text-right leading-none">
                                            40+ live launches
                                        </span>
                                    </div>

                                    {/* Red Stamp */}
                                    <div className="evidence-stamp-red flex-1 p-2 md:p-3 flex flex-col justify-between h-[85px] md:h-[95px] rounded">
                                        <div>
                                            <span className="font-bebas text-2xl md:text-3xl block leading-none tracking-tight">
                                                FULL-STACK
                                            </span>
                                            <span className="font-schoolbell font-bold text-[7px] md:text-[8px] leading-tight block uppercase">
                                                ARCHITECTURE
                                            </span>
                                        </div>
                                        <span className="font-gloria font-medium text-[8px] md:text-[9px] text-red-900/80 tracking-tight text-right leading-none">
                                            33M+ campaign reach
                                        </span>
                                    </div>
                                </div>

                                {/* TORN SIGNATURE SHEET & HIGHLIGHTS */}
                                <div className="relative mt-2 flex flex-col gap-2">
                                    <div
                                        id="torn-signature-paper"
                                        className="self-end bg-white/95 p-2 px-3 shadow-md border-t border-dashed border-gray-300 transform -rotate-1 origin-bottom-left z-20"
                                    >
                                        <div className="font-gloria font-medium text-[10px] text-[#012CEB] leading-tight">
                                            still figuring things out.
                                        </div>
                                    </div>

                                    <div
                                        id="other-highlights-block"
                                        aria-hidden="true"
                                        className="w-full text-left font-schoolbell text-[8.5px] text-[#222]/60 leading-relaxed"
                                    >
                                        <p>
                                            <span className="font-bold text-[#051024]">
                                                PS//
                                            </span>{" "}
                                            The goal is simple: find artists and
                                            brands making incredible things, and
                                            help them grow using our respective
                                            arts.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Bottom Right Footer */}
                            <div className="flex justify-between items-end font-schoolbell text-[7.5px] opacity-40 font-bold text-[#051024]">
                                <span>KEEP SCROLLING</span>
                                <span>DESTINATION // BEYOND</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
