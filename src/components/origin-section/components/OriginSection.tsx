"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

// Single continuous blueprint journey path across both pages (Left Page -> Spine -> Right Page -> Signature)
const UNIFIED_JOURNEY_PATH =
    "M 700,165 C 620,110 520,110 430,135 C 320,175 280,290 350,395 C 420,480 560,510 610,480 C 660,450 690,450 670,520 C 640,610 700,680 760,660 C 830,640 920,530 1000,470 C 1100,400 1180,250 1280,210 C 1380,170 1490,220 1560,300 C 1630,380 1620,490 1560,570 C 1500,650 1510,740 1580,790 C 1630,830 1680,840 1720,845";

// Master Cursive Signature Paths & White Guide Curve for "Anup Rawat"
const WHITE_GUIDE_CURVE_PATH =
    "M 1080,290 C 980,310 820,315 670,270 C 520,225 410,160 300,165 C 220,170 170,210 135,238";

const SIGNATURE_ANUP_PATH =
    "M 135,238 C 145,235 165,185 190,110 C 198,84 204,60 212,58 C 218,58 226,90 236,150 C 244,195 250,228 252,234 C 250,210 238,168 214,170 C 196,172 198,194 220,192 C 236,190 252,185 264,180 C 272,176 280,170 286,182 C 290,192 290,215 292,230 C 294,202 304,172 318,172 C 328,172 332,198 334,228 C 336,234 344,232 352,218 C 358,206 364,176 370,174 C 372,192 374,226 388,226 C 398,226 404,192 408,176 C 410,196 412,216 418,226 C 424,212 430,178 436,174 C 436,195 432,250 428,295 C 424,302 420,285 422,245 C 424,215 430,192 436,180 C 444,168 472,170 470,198 C 468,220 448,224 436,222 C 448,222 468,216 488,206";

const SIGNATURE_RAWAT_PATH =
    "M 522,105 C 520,138 514,195 510,230 C 512,180 526,85 558,58 C 580,40 615,48 622,76 C 628,100 616,132 585,145 C 568,150 562,146 574,156 C 590,176 610,208 624,228 C 628,234 636,234 642,222 C 648,210 654,186 668,174 C 656,174 646,190 646,208 C 646,226 660,230 670,228 C 678,226 684,206 686,176 C 686,202 688,220 694,226 C 700,212 706,180 714,176 C 716,194 720,224 732,224 C 742,224 748,190 754,176 C 756,194 760,224 770,224 C 778,224 786,206 794,182 C 800,174 792,174 782,190 C 778,204 780,222 792,226 C 802,228 808,212 812,176 C 812,202 814,220 820,224 C 826,210 834,158 842,96 C 844,80 848,80 850,94 C 850,138 848,196 848,226 C 848,236 858,242 872,238 C 888,234 904,222 922,210";

const SIGNATURE_UNDERLINE_PATH =
    "M 922,210 C 945,230 955,258 932,282 C 885,322 765,346 610,348 C 450,350 280,342 165,320 C 115,310 85,296 82,282 C 78,268 94,260 114,262 C 138,264 168,276 208,284";

const SIGNATURE_CROSS_PATH = "M 822,144 C 836,140 858,136 878,133";

export const OriginSection: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const stRef = useRef<ScrollTrigger | null>(null);
    const notebookRef = useRef<HTMLDivElement>(null);
    const diaryContentRef = useRef<HTMLDivElement>(null);
    const spotlightRef = useRef<HTMLDivElement>(null);
    const voidGrainRef = useRef<HTMLDivElement>(null);
    const darkThemeRef = useRef<HTMLDivElement>(null);
    const personalCutoutRef = useRef<HTMLDivElement>(null);

    // Blue Atmosphere Wash & Grand Signature Overlay Refs
    const blueAtmosphereRef = useRef<HTMLDivElement>(null);
    const grandSignatureOverlayRef = useRef<HTMLDivElement>(null);

    // Animated White Curved Line Refs
    const whiteGuideLineRef = useRef<SVGPathElement>(null);
    const whiteGuideTipRef = useRef<SVGCircleElement>(null);
    const lenGuideCurveRef = useRef(1100);

    // Large Animated "Anup Rawat" Signature Stroke Refs
    const sigMainAnupRef = useRef<SVGPathElement>(null);
    const sigGlowAnupRef = useRef<SVGPathElement>(null);
    const lenSigAnupRef = useRef(1350);

    const sigMainRawatRef = useRef<SVGPathElement>(null);
    const sigGlowRawatRef = useRef<SVGPathElement>(null);
    const lenSigRawatRef = useRef(1850);

    const sigUnderlineRef = useRef<SVGPathElement>(null);
    const sigGlowUnderlineRef = useRef<SVGPathElement>(null);
    const lenSigUnderlineRef = useRef(1150);

    const sigMainCrossRef = useRef<SVGPathElement>(null);
    const sigGlowCrossRef = useRef<SVGPathElement>(null);
    const lenSigCrossRefRef = useRef(70);

    // Luminous Artist Pen Tip & Dynamic Glow Group Refs
    const sigPenTipRef = useRef<SVGGElement>(null);
    const sigGlowGroupRef = useRef<SVGGElement>(null);

    // Page-Level Depth of Field (Rack Focus across the spread)
    const leftPageRef = useRef<HTMLDivElement>(null);
    const rightPageRef = useRef<HTMLDivElement>(null);

    // Storyboard Zone Depth of Field Refs
    const startNoteZoneRef = useRef<HTMLDivElement>(null);
    const headlineZoneRef = useRef<HTMLDivElement>(null);
    const curiosityZoneRef = useRef<HTMLDivElement>(null);
    const polaroidZoneRef = useRef<HTMLDivElement>(null);
    const cinematographyZoneRef = useRef<HTMLDivElement>(null);
    const placesZoneRef = useRef<HTMLDivElement>(null);
    const crazyNoteZoneRef = useRef<HTMLDivElement>(null);
    const psGoalZoneRef = useRef<HTMLDivElement>(null);
    const stillFiguringZoneRef = useRef<HTMLDivElement>(null);

    const startPulseCircleRef = useRef<SVGCircleElement>(null);

    // Single Continuous Blueprint Journey Path across the entire 2-page notebook
    const startDotRef = useRef<SVGCircleElement>(null);
    const unifiedPathRef = useRef<SVGPathElement>(null);
    const unifiedGlowPathRef = useRef<SVGPathElement>(null);
    const unifiedPathLengthRef = useRef(3200);

    // Headline circle annotation
    const circlePathRef = useRef<SVGPathElement>(null);
    const circleLengthRef = useRef(200);

    // Directional pen arrows along the single continuous path
    const arrow1Ref = useRef<SVGPathElement>(null);
    const arrow2Ref = useRef<SVGPathElement>(null);
    const arrow3Ref = useRef<SVGPathElement>(null);
    const arrowSpineRef = useRef<SVGPathElement>(null);
    const arrow4Ref = useRef<SVGPathElement>(null);
    const arrow5Ref = useRef<SVGPathElement>(null);
    const arrowEndRef = useRef<SVGPathElement>(null);

    // Epilogue Quote Ref
    const epilogueRef = useRef<HTMLDivElement>(null);

    // High-Precision Physics Refs (Virtual Camera Engine)
    const progressRef = useRef(0);
    const targetProgressRef = useRef(0);
    const lastTimeRef = useRef(performance.now());

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

    // Quintic smootherstep spline
    const smootherstep = (t: number) => {
        const c = clamp(t, 0, 1);
        return c * c * c * (c * (c * 6 - 15) + 10);
    };
    const easeInOutQuad = (t: number) =>
        t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

    // Organic Camera Lens Rack Focus Calculation with Depth of Field Plateau (0 = defocused, 1 = razor sharp)
    const calcZoneFocus = (
        p: number,
        start: number,
        plateauStart: number,
        plateauEnd: number,
        end: number,
    ) => {
        // When pulling out into full spread overview at the end (p >= 0.92),
        // all sections smoothly transition into 100% crystal-clear focus!
        if (p >= 0.92) {
            const spreadProgress = smootherstep((p - 0.92) / (0.97 - 0.92));
            const local =
                p >= start && p <= end
                    ? p < plateauStart
                        ? smootherstep((p - start) / (plateauStart - start))
                        : p <= plateauEnd
                          ? 1
                          : 1 -
                            smootherstep((p - plateauEnd) / (end - plateauEnd))
                    : 0;
            return Math.max(local, spreadProgress);
        }
        if (p < start || p > end) return 0;
        if (p < plateauStart)
            return smootherstep((p - start) / (plateauStart - start));
        if (p <= plateauEnd) return 1;
        return 1 - smootherstep((p - plateauEnd) / (end - plateauEnd));
    };

    const applyFocusEffect = (
        el: HTMLElement | null,
        focus: number,
        maxBlur: number,
        baseOpacity = 1,
    ) => {
        if (!el) return;
        const blur = (1 - focus) * maxBlur;
        const opacity = (0.36 + focus * 0.64) * baseOpacity;

        if (blur < 0.25) {
            el.style.filter = "none";
            el.style.opacity = `${baseOpacity}`;
        } else {
            el.style.filter = `blur(${blur.toFixed(1)}px)`;
            el.style.opacity = `${opacity.toFixed(2)}`;
        }
    };

    const updateVisuals = useCallback(
        (rawP: number) => {
            const isDesktop =
                typeof window !== "undefined" && window.innerWidth > 768;
            // Scale raw progress so that the entire animation finishes comfortably before unpinning
            const p = isDesktop
                ? Math.min(1, Math.max(0, rawP / 0.93))
                : Math.min(1, Math.max(0, rawP / 0.97));

            // Void grain texture
            if (voidGrainRef.current) {
                voidGrainRef.current.style.opacity = `${0.03 + (1 - p) * 0.02}`;
            }

            // =========================================================================
            // 1. ONE CONTINUOUS BLUE LINE ANIMATION (Across Left Page -> Spine -> Right Page)
            // =========================================================================
            const pathLen = unifiedPathLengthRef.current;

            // Progress of line drawing: starts drawing around p=0.08, completes around p=0.88
            let lineFraction = 0;
            if (p <= 0.08) {
                lineFraction = 0;
            } else if (p >= 0.88) {
                lineFraction = 1;
            } else {
                lineFraction = (p - 0.08) / (0.88 - 0.08);
            }

            const dashOffset = (1 - lineFraction) * pathLen;

            // Phase E: Ending transition
            // Line transitions smoothly from blueprint blue (#012CEB) to refined warm ivory (#FFFDF8) (p: 0.82 -> 0.90)
            let currentLineColor = "#012CEB";
            const lineAlpha = 1;

            if (p > 0.82 && p <= 0.9) {
                const whiteRatio = (p - 0.82) / (0.9 - 0.82);
                const r = Math.round(1 + (255 - 1) * whiteRatio);
                const g = Math.round(44 + (253 - 44) * whiteRatio);
                const b = Math.round(235 + (248 - 235) * whiteRatio);
                currentLineColor = `rgb(${r}, ${g}, ${b})`;
            } else if (p > 0.9) {
                currentLineColor = "#FFFDF8";
            }

            if (startDotRef.current) {
                const dotAlpha = p < 0.02 ? 0 : Math.min(1, (p - 0.02) / 0.04);
                startDotRef.current.style.opacity = `${(dotAlpha * lineAlpha * 0.95).toFixed(3)}`;
                startDotRef.current.style.fill = currentLineColor;
            }

            // Radar beacon pulse on the start dot as camera focuses on where the blue line starts
            if (startPulseCircleRef.current) {
                if (p < 0.18) {
                    const cycle = (p / 0.06) % 1;
                    const r = 5 + cycle * 20;
                    const o = (1 - cycle) * 0.85;
                    startPulseCircleRef.current.setAttribute(
                        "r",
                        `${r.toFixed(1)}`,
                    );
                    startPulseCircleRef.current.style.opacity = `${o.toFixed(2)}`;
                    startPulseCircleRef.current.style.stroke = currentLineColor;
                } else {
                    startPulseCircleRef.current.style.opacity = "0";
                }
            }

            if (unifiedPathRef.current) {
                unifiedPathRef.current.style.strokeDashoffset = `${dashOffset.toFixed(2)}px`;
                unifiedPathRef.current.style.stroke = currentLineColor;
                unifiedPathRef.current.style.opacity = `${(0.95 * lineAlpha).toFixed(3)}`;
            }
            if (unifiedGlowPathRef.current) {
                unifiedGlowPathRef.current.style.strokeDashoffset = `${dashOffset.toFixed(2)}px`;
                unifiedGlowPathRef.current.style.stroke = currentLineColor;
                unifiedGlowPathRef.current.style.opacity = `${(0.4 * lineAlpha).toFixed(3)}`;
            }

            // Directional Arrowheads revealed organically as the continuous line tip advances
            if (arrow1Ref.current) {
                const a1 = mapRange(lineFraction, 0.08, 0.14);
                arrow1Ref.current.style.opacity = `${(a1 * lineAlpha).toFixed(3)}`;
                arrow1Ref.current.style.stroke = currentLineColor;
            }
            if (arrow2Ref.current) {
                const a2 = mapRange(lineFraction, 0.24, 0.3);
                arrow2Ref.current.style.opacity = `${(a2 * lineAlpha).toFixed(3)}`;
                arrow2Ref.current.style.stroke = currentLineColor;
            }
            if (arrow3Ref.current) {
                const a3 = mapRange(lineFraction, 0.38, 0.44);
                arrow3Ref.current.style.opacity = `${(a3 * lineAlpha).toFixed(3)}`;
                arrow3Ref.current.style.stroke = currentLineColor;
            }
            if (arrowSpineRef.current) {
                const as = mapRange(lineFraction, 0.48, 0.54);
                arrowSpineRef.current.style.opacity = `${(as * lineAlpha).toFixed(3)}`;
                arrowSpineRef.current.style.stroke = currentLineColor;
            }
            if (arrow4Ref.current) {
                const a4 = mapRange(lineFraction, 0.58, 0.65);
                arrow4Ref.current.style.opacity = `${(a4 * lineAlpha).toFixed(3)}`;
                arrow4Ref.current.style.stroke = currentLineColor;
            }
            if (arrow5Ref.current) {
                const a5 = mapRange(lineFraction, 0.74, 0.8);
                arrow5Ref.current.style.opacity = `${(a5 * lineAlpha).toFixed(3)}`;
                arrow5Ref.current.style.stroke = currentLineColor;
            }
            if (arrowEndRef.current) {
                const ae = mapRange(lineFraction, 0.88, 0.95);
                arrowEndRef.current.style.opacity = `${(ae * lineAlpha).toFixed(3)}`;
                arrowEndRef.current.style.stroke = currentLineColor;
            }

            // Hand-drawn blue loop circle around 'camera.' in headline
            if (circlePathRef.current) {
                const circleLen = circleLengthRef.current;
                const circleProg = mapRange(lineFraction, 0.12, 0.24);
                circlePathRef.current.style.strokeDashoffset = `${((1 - circleProg) * circleLen).toFixed(2)}px`;
                circlePathRef.current.style.stroke = currentLineColor;
                circlePathRef.current.style.opacity = `${(0.95 * lineAlpha).toFixed(3)}`;
            }

            // =========================================================================
            // 2. CAMERA OPERATOR TRANSITION (Single existing camera asset)
            // =========================================================================
            if (personalCutoutRef.current) {
                if (p < 0.45) {
                    personalCutoutRef.current.style.transform = `translate3d(0, 0, 0) scale(1)`;
                } else if (p < 0.75) {
                    const shiftProg = smootherstep((p - 0.45) / (0.75 - 0.45));
                    const transX = shiftProg * (isDesktop ? -24 : -12);
                    const transY = shiftProg * 8;
                    const scaleVal = 1 - shiftProg * 0.06;
                    personalCutoutRef.current.style.transform = `translate3d(${transX}px, ${transY}px, 0) scale(${scaleVal})`;
                } else {
                    personalCutoutRef.current.style.transform = `translate3d(${isDesktop ? -24 : -12}px, 8px, 0) scale(0.94)`;
                }
            }

            // Epilogue Quote settled naturally below signature
            if (epilogueRef.current) {
                const eqProg = mapRange(p, 0.93, 0.98);
                epilogueRef.current.style.opacity = `${eqProg.toFixed(3)}`;
                epilogueRef.current.style.transform = isDesktop
                    ? `translate(-50%, ${(1 - eqProg) * 8}px)`
                    : `translateY(${(1 - eqProg) * 8}px)`;
            }

            // =========================================================================
            // 3. VIRTUAL CAMERA TRAJECTORY ENGINE (Cinematic Focal Tracking Navigation)
            // Camera navigates straight to where the blue line starts, then follows the line
            // =========================================================================
            let camScale = isDesktop ? 0.95 : 0.85;
            let camX = 0;
            let camY = 4;
            let camRotX = 6;
            let camRotY = -1;
            let camRotZ = 0;
            let spotX = 50;
            let spotY = 50;

            if (isDesktop) {
                if (p < 0.04) {
                    // Step 0: Initial opening dolly from desk toward book
                    const u = smootherstep(p / 0.04);
                    const s0 = 0.95;
                    const s1 = 1.25;
                    camScale = s0 + u * (s1 - s0);
                    camX = u * 6;
                    camY = 4 + u * 12;
                    camRotX = 6 * (1 - u);
                    camRotY = -1;
                    spotX = 50 - u * 8;
                    spotY = 50 - u * 34;
                } else if (p < 0.16) {
                    // Step 1: CAMERA GOES DIRECTLY TO WHERE THE BLUE LINE STARTS!
                    // Target: The "I'm an open book." taped note & blue start dot at (700, 165)
                    const u = smootherstep((p - 0.04) / (0.16 - 0.04));
                    const s0 = 1.25;
                    const s1 = 1.54;
                    camScale = s0 + u * (s1 - s0);
                    camX = 6 + u * 4; // Center ~+10%
                    camY = 16 + u * 8; // Center ~+24% (focused right on start note)
                    camRotX = 1;
                    camRotY = -1;
                    camRotZ = 0.5 * u;
                    spotX = 42;
                    spotY = 16;
                } else if (p < 0.36) {
                    // Step 2: TRACK BLUE LINE AS IT LOOPS ACROSS TO THE HEADLINE ("how it all started.")
                    // Target: Left headline & "camera." loop & micro-story
                    const u = smootherstep((p - 0.16) / (0.36 - 0.16));
                    const s0 = 1.54;
                    const s1 = 1.5;
                    camScale = s0 + u * (s1 - s0);
                    camX = 10 + u * 14; // Pan across to left headline (~+24%)
                    camY = 24 - u * 14; // Shift down slightly (~+10%)
                    camRotX = 1 + u * 1;
                    camRotY = -1 - u * 1;
                    camRotZ = 0.5 - u * 1;
                    spotX = 42 - u * 20; // Spot shifts from 42% to 22%
                    spotY = 16 + u * 12; // Spot shifts from 16% to 28%
                } else if (p < 0.54) {
                    // Step 3: FOLLOW LINE DOWN TO CAMERA OPERATOR & POLAROID & CURIOSITY
                    // Target: Camera operator cutout, sunset polaroid, "It started as curiosity..."
                    const u = smootherstep((p - 0.36) / (0.54 - 0.36));
                    const s0 = 1.5;
                    const s1 = 1.44;
                    camScale = s0 + u * (s1 - s0);
                    camX = 24 - u * 14; // Move towards center-left (~+10%)
                    camY = 10 - u * 25; // Move down to bottom half of left page (~ -15%)
                    camRotX = 2 - u * 3;
                    camRotY = -2 + u * 1;
                    camRotZ = -0.5 + u * 0.5;
                    spotX = 22 + u * 14; // Spot moves to ~36%
                    spotY = 28 + u * 36; // Spot moves to ~64%
                } else if (p < 0.7) {
                    // Step 4: BLUE LINE CROSSES SPINE -> CAMERA PANS TO RIGHT PAGE
                    // Target: Top-left of Right Page ("CINEMATOGRAPHY WITH A PURPOSE" & camera sketches)
                    const u = smootherstep((p - 0.54) / (0.7 - 0.54));
                    const s0 = 1.44;
                    const s1 = 1.46;
                    camScale = s0 + u * (s1 - s0);
                    camX = 10 - u * 24; // Crosses over to right page (~ -14%)
                    camY = -15 + u * 29; // Pan up to top of right page (~ +14%)
                    camRotX = -1 + u * 2;
                    camRotY = -1 + u * 3;
                    camRotZ = u * 0.5;
                    spotX = 36 + u * 26; // Spot moves to ~62%
                    spotY = 64 - u * 42; // Spot moves to ~22%
                } else if (p < 0.88) {
                    // Step 5: FOLLOW LINE DOWN RIGHT PAGE TO PLACES SHOT & CREATIVE NOTE
                    // Target: "// PLACES I'VE SHOT AT", skyline, "crazy what happens...", "PS//"
                    const u = smootherstep((p - 0.7) / (0.88 - 0.7));
                    const s0 = 1.46;
                    const s1 = 1.4;
                    camScale = s0 + u * (s1 - s0);
                    camX = -14 - u * 8; // Move further right (~ -22%)
                    camY = 14 - u * 20; // Move down to middle-bottom (~ -6%)
                    camRotX = 1 - u * 1;
                    camRotY = 2 - u * 1;
                    camRotZ = 0.5 - u * 0.5;
                    spotX = 62 + u * 10; // Spot moves to ~72%
                    spotY = 22 + u * 34; // Spot moves to ~56%
                } else {
                    // Step 6 & 7: CINEMATIC EXIT & PULL-OUT TO DREAMY MEMORY OVERVIEW
                    // Smoothly pulls back from the bottom right to a calm, balanced overview
                    // framing the blurred diary silhouette behind the signature
                    const u = smootherstep((p - 0.88) / (0.96 - 0.88));
                    const s0 = 1.4;
                    const s1 = 0.95;
                    camScale = s0 + u * (s1 - s0);
                    camX = -22 * (1 - u);
                    camY = -6 * (1 - u);
                    camRotX = 0;
                    camRotY = 1 * (1 - u);
                    camRotZ = 0;
                    spotX = 72 - u * 22; // Centers to 50%
                    spotY = 56 - u * 6; // Centers to 50%
                }
            } else {
                // MOBILE CAMERA WINDOW TRAJECTORY:
                // Sits inside the dedicated mobile viewport, tracking the active page and animation.
                const mf = Math.min(1.06, Math.max(0.76, window.innerWidth / 390));

                if (p < 0.04) {
                    // Step 0: Opening dolly towards the start note on Left Page
                    const u = smootherstep(p / 0.04);
                    const s0 = 0.98 * mf;
                    const s1 = 1.04 * mf;
                    camScale = s0 + u * (s1 - s0);
                    camX = 14 + u * 5;
                    camY = 6 + u * 12;
                    camRotX = 4 * (1 - u);
                    camRotY = -0.5;
                    spotX = 44;
                    spotY = 38 - u * 20;
                } else if (p < 0.16) {
                    // Step 1: Camera focuses right on start note & start dot (700, 165)
                    const u = smootherstep((p - 0.04) / (0.16 - 0.04));
                    const s0 = 1.04 * mf;
                    const s1 = 1.10 * mf;
                    camScale = s0 + u * (s1 - s0);
                    camX = 19 + u * 3; // ~ +22%
                    camY = 18 + u * 4; // ~ +22%
                    camRotX = 0.5;
                    camRotY = -0.5;
                    camRotZ = 0.3 * u;
                    spotX = 42;
                    spotY = 16;
                } else if (p < 0.36) {
                    // Step 2: Track blue line loop across to Left Headline ("how it all started.")
                    const u = smootherstep((p - 0.16) / (0.36 - 0.16));
                    const s0 = 1.10 * mf;
                    const s1 = 1.06 * mf;
                    camScale = s0 + u * (s1 - s0);
                    camX = 22 + u * 11; // Pans across to Left Headline: ~ +33%
                    camY = 22 - u * 14; // Shifts down to ~ +8% (frames headline and story)
                    camRotX = 0.5 + u * 0.5;
                    camRotY = -0.5 - u * 0.5;
                    camRotZ = 0.3 - u * 0.6;
                    spotX = 42 - u * 18;
                    spotY = 16 + u * 14;
                } else if (p < 0.54) {
                    // Step 3: Follow line down to Camera Operator cutout & Polaroid
                    const u = smootherstep((p - 0.36) / (0.54 - 0.36));
                    const s0 = 1.06 * mf;
                    const s1 = 1.04 * mf;
                    camScale = s0 + u * (s1 - s0);
                    camX = 33 - u * 13; // Centers camera operator and polaroid: ~ +20%
                    camY = 8 - u * 22;  // Shifts up to show bottom half: ~ -14%
                    camRotX = 1 - u * 1.5;
                    camRotY = -1 + u * 0.5;
                    camRotZ = -0.3 + u * 0.3;
                    spotX = 24 + u * 16;
                    spotY = 30 + u * 34;
                } else if (p < 0.7) {
                    // Step 4: BLUE LINE CROSSES SPINE -> SMOOTH CAMERA GLIDE ACROSS TO RIGHT PAGE
                    // Spine glides through the viewport smoothly, landing on Right Page top-left
                    const u = smootherstep((p - 0.54) / (0.7 - 0.54));
                    const s0 = 1.04 * mf;
                    const s1 = 1.08 * mf;
                    camScale = s0 + u * (s1 - s0);
                    camX = 20 - u * 40; // Glides from +20% (Left Page) to -20% (Right Page)!
                    camY = -14 + u * 28; // Glides up to top of Right Page (+14%)!
                    camRotX = -0.5 + u * 1.5;
                    camRotY = -0.5 + u * 1.5;
                    camRotZ = u * 0.4;
                    spotX = 40 + u * 24;
                    spotY = 64 - u * 42;
                } else if (p < 0.88) {
                    // Step 5: Follow line down Right Page to "// PLACES I'VE SHOT AT" and notes
                    const u = smootherstep((p - 0.7) / (0.88 - 0.7));
                    const s0 = 1.08 * mf;
                    const s1 = 1.02 * mf;
                    camScale = s0 + u * (s1 - s0);
                    camX = -20 - u * 7; // Centers Right Page contents: ~ -27%
                    camY = 14 - u * 22; // Pans down to middle/bottom: ~ -8%
                    camRotX = 1 - u * 1;
                    camRotY = 1 - u * 0.5;
                    camRotZ = 0.4 - u * 0.4;
                    spotX = 64 + u * 8;
                    spotY = 22 + u * 34;
                } else {
                    // Step 6 & 7: Cinematic Exit & Pull-Out to Center Signature
                    const u = smootherstep((p - 0.88) / (0.96 - 0.88));
                    const s0 = 1.02 * mf;
                    const s1 = 0.58 * mf; // Pulls back to frame the signature with generous margins
                    camScale = s0 + u * (s1 - s0);
                    camX = -27 * (1 - u); // Smoothly centers to 0%
                    camY = -8 * (1 - u) + u * 3; // Centers vertically with comfortable breathing room
                    camRotX = 0;
                    camRotY = 0.5 * (1 - u);
                    camRotZ = 0;
                    spotX = 72 - u * 22;
                    spotY = 56 - u * 6;
                }
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
                const baseSpot = p < 0.18 ? 0.95 : 0.85;
                const exitSpotFade =
                    p > 0.88 ? 1 - smootherstep((p - 0.88) / 0.08) : 1;
                spotlightRef.current.style.opacity = `${(baseSpot * exitSpotFade).toFixed(2)}`;
            }

            // =========================================================================
            // 4. DYNAMIC DEPTH-OF-FIELD (RACK FOCUS) & CLEAR IN-FOCUS ENGINE
            // =========================================================================
            const maxBlur = isDesktop ? 5.8 : 3.6;

            // Compute focus levels for each story zone (0 = blurred out, 1 = crystal clear)
            const fStartNote = calcZoneFocus(p, 0.0, 0.04, 0.14, 0.2);
            const fHeadline = calcZoneFocus(p, 0.12, 0.18, 0.34, 0.4);
            const fCuriosity = calcZoneFocus(p, 0.28, 0.34, 0.52, 0.58);
            const fOperatorPolaroid = calcZoneFocus(p, 0.3, 0.36, 0.52, 0.58);
            const fCinematography = calcZoneFocus(p, 0.5, 0.56, 0.68, 0.74);
            const fPlaces = calcZoneFocus(p, 0.66, 0.7, 0.82, 0.88);
            const fSignature = calcZoneFocus(p, 0.8, 0.84, 0.92, 0.96);

            // Page-Level Depth of Field (Left Page vs Right Page defocus)
            let leftPageFocus = 1;
            let rightPageFocus = 1;
            if (p < 0.48) {
                leftPageFocus = 1;
                rightPageFocus = 0.12;
            } else if (p < 0.58) {
                const crossProgress = smootherstep((p - 0.48) / (0.58 - 0.48));
                leftPageFocus = 1 - crossProgress * 0.88;
                rightPageFocus = 0.12 + crossProgress * 0.88;
            } else {
                leftPageFocus = 0.12;
                rightPageFocus = 1;
            }

            applyFocusEffect(
                leftPageRef.current,
                leftPageFocus,
                isDesktop ? 4.2 : 2.5,
            );
            applyFocusEffect(
                rightPageRef.current,
                rightPageFocus,
                isDesktop ? 4.2 : 2.5,
            );

            // Apply Section-Level Depth of Field
            applyFocusEffect(startNoteZoneRef.current, fStartNote, maxBlur);
            applyFocusEffect(headlineZoneRef.current, fHeadline, maxBlur);
            applyFocusEffect(curiosityZoneRef.current, fCuriosity, maxBlur);
            applyFocusEffect(
                polaroidZoneRef.current,
                fOperatorPolaroid,
                maxBlur,
            );
            applyFocusEffect(
                cinematographyZoneRef.current,
                fCinematography,
                maxBlur,
            );
            applyFocusEffect(placesZoneRef.current, fPlaces, maxBlur);
            applyFocusEffect(crazyNoteZoneRef.current, fPlaces, maxBlur);
            applyFocusEffect(psGoalZoneRef.current, fPlaces, maxBlur);
            applyFocusEffect(stillFiguringZoneRef.current, fSignature, maxBlur);

            // Operator cutout blur & crisp focus
            if (personalCutoutRef.current) {
                const opBlur = (1 - fOperatorPolaroid) * maxBlur;
                const opOpacity = 0.45 + fOperatorPolaroid * 0.55;
                if (opBlur < 0.25) {
                    personalCutoutRef.current.style.filter = "none";
                    personalCutoutRef.current.style.opacity = "1";
                } else {
                    personalCutoutRef.current.style.filter = `blur(${opBlur.toFixed(1)}px)`;
                    personalCutoutRef.current.style.opacity = `${opOpacity.toFixed(2)}`;
                }
            }

            // Notebook Content Blur (STRICTLY CONTAINED INSIDE DIARY):
            // The inner diary content (pages, textures, sketches, cutout, spine) smoothly becomes heavily blurred
            // starting at 8-10px and increasing up to 18-22px, while the outer page and UI remain 100% sharp!
            if (diaryContentRef.current) {
                if (p <= 0.88) {
                    diaryContentRef.current.style.filter = "none";
                    diaryContentRef.current.style.opacity = "1";
                } else {
                    const blurProg = smootherstep((p - 0.88) / (0.96 - 0.88));
                    const maxExitBlur = isDesktop ? 22 : 16;
                    const curBlur = 8 + blurProg * (maxExitBlur - 8);
                    const curOpacity = 1 - blurProg * 0.08; // Preserves creamy paper appearance beneath blur
                    diaryContentRef.current.style.filter = `blur(${curBlur.toFixed(1)}px) saturate(${(1 - blurProg * 0.15).toFixed(2)}) brightness(${(1 + blurProg * 0.04).toFixed(2)})`;
                    diaryContentRef.current.style.opacity = `${curOpacity.toFixed(2)}`;
                }
            }

            // Notebook container itself is NOT blurred (keeps transforms clean and outer page sharp)
            if (notebookRef.current) {
                notebookRef.current.style.filter = "none";
                notebookRef.current.style.opacity = "1";
            }

            // =========================================================================
            // 5. PHASE E: CINEMATIC BLUE DIARY EXIT & ANIMATED SIGNATURE REVEAL
            // =========================================================================

            // A. Keep surrounding section background steady & sharp (never blur outside)
            if (containerRef.current) {
                containerRef.current.style.backgroundColor = "#E6DDD2";
            }

            // B. Blue Atmosphere Wash Overlay (Inside diary only)
            if (blueAtmosphereRef.current) {
                if (p <= 0.88) {
                    blueAtmosphereRef.current.style.opacity = "0";
                } else {
                    const washProg = smootherstep((p - 0.88) / (0.95 - 0.88));
                    blueAtmosphereRef.current.style.opacity = `${(washProg * 0.85).toFixed(3)}`;
                }
            }

            if (darkThemeRef.current) {
                darkThemeRef.current.style.opacity = "0";
            }

            // C. Grand Signature Overlay Container Opacity
            if (grandSignatureOverlayRef.current) {
                const overOp = mapRange(p, 0.89, 0.93);
                grandSignatureOverlayRef.current.style.opacity = `${overOp.toFixed(3)}`;
            }

            // D. Animated White Curved Guide Line (p: 0.90 -> 0.932)
            const pCurve = mapRange(p, 0.9, 0.932);
            if (whiteGuideLineRef.current && lenGuideCurveRef.current) {
                const len = lenGuideCurveRef.current;
                whiteGuideLineRef.current.style.strokeDashoffset = `${((1 - pCurve) * len).toFixed(2)}px`;
                whiteGuideLineRef.current.style.opacity = `${(pCurve > 0 ? (p < 0.98 ? 0.92 : 0.8) : 0).toFixed(2)}`;
            }
            if (
                whiteGuideTipRef.current &&
                whiteGuideLineRef.current &&
                lenGuideCurveRef.current
            ) {
                if (pCurve > 0.01 && pCurve < 0.99) {
                    try {
                        const pt = whiteGuideLineRef.current.getPointAtLength(
                            pCurve * lenGuideCurveRef.current,
                        );
                        whiteGuideTipRef.current.setAttribute(
                            "cx",
                            `${pt.x.toFixed(1)}`,
                        );
                        whiteGuideTipRef.current.setAttribute(
                            "cy",
                            `${pt.y.toFixed(1)}`,
                        );
                        whiteGuideTipRef.current.style.opacity = "1";
                    } catch (_) {}
                } else {
                    whiteGuideTipRef.current.style.opacity = "0";
                }
            }

            // E. Bespoke Cinematic "Anup Rawat" Signature Handwriting Animation
            // 1. "Anup" cursive stroke: p: 0.930 -> 0.954
            const pAnup = mapRange(p, 0.93, 0.954);
            if (sigMainAnupRef.current && lenSigAnupRef.current) {
                const dash = (1 - pAnup) * lenSigAnupRef.current;
                sigMainAnupRef.current.style.strokeDashoffset = `${dash.toFixed(2)}px`;
                if (sigGlowAnupRef.current) {
                    sigGlowAnupRef.current.style.strokeDashoffset = `${dash.toFixed(2)}px`;
                }
            }

            // 2. "Rawat" cursive stroke: p: 0.954 -> 0.974
            const pRawat = mapRange(p, 0.954, 0.974);
            if (sigMainRawatRef.current && lenSigRawatRef.current) {
                const dash = (1 - pRawat) * lenSigRawatRef.current;
                sigMainRawatRef.current.style.strokeDashoffset = `${dash.toFixed(2)}px`;
                if (sigGlowRawatRef.current) {
                    sigGlowRawatRef.current.style.strokeDashoffset = `${dash.toFixed(2)}px`;
                }
            }

            // 3. Sweeping Underline Flourish: p: 0.972 -> 0.988
            const pUnderline = mapRange(p, 0.972, 0.988);
            if (sigUnderlineRef.current && lenSigUnderlineRef.current) {
                const dash = (1 - pUnderline) * lenSigUnderlineRef.current;
                sigUnderlineRef.current.style.strokeDashoffset = `${dash.toFixed(2)}px`;
                if (sigGlowUnderlineRef.current) {
                    sigGlowUnderlineRef.current.style.strokeDashoffset = `${dash.toFixed(2)}px`;
                }
            }

            // 4. 't' Crossbar flick: p: 0.987 -> 0.995
            const pCross = mapRange(p, 0.987, 0.995);
            if (sigMainCrossRef.current && lenSigCrossRefRef.current) {
                const dash = (1 - pCross) * lenSigCrossRefRef.current;
                sigMainCrossRef.current.style.strokeDashoffset = `${dash.toFixed(2)}px`;
                if (sigGlowCrossRef.current) {
                    sigGlowCrossRef.current.style.strokeDashoffset = `${dash.toFixed(2)}px`;
                }
            }

            // 5. Luminous Artist Pen Tip (Active Drawing Flare tracking the live pen point)
            if (sigPenTipRef.current) {
                if (p >= 0.93 && p < 0.996) {
                    let px = 135;
                    let py = 238;
                    let penOp = 1;

                    if (
                        p < 0.954 &&
                        sigMainAnupRef.current &&
                        lenSigAnupRef.current
                    ) {
                        try {
                            const pt = sigMainAnupRef.current.getPointAtLength(
                                pAnup * lenSigAnupRef.current,
                            );
                            px = pt.x;
                            py = pt.y;
                            penOp = Math.min(1, (p - 0.93) / 0.004);
                        } catch (_) {}
                    } else if (p < 0.956) {
                        // Air glide from 'p' exit flick to 'R' start
                        const tAir = (p - 0.954) / 0.002;
                        px = 488 + tAir * (522 - 488);
                        py = 206 + tAir * (105 - 206);
                        penOp = 0.85;
                    } else if (
                        p < 0.974 &&
                        sigMainRawatRef.current &&
                        lenSigRawatRef.current
                    ) {
                        try {
                            const pt = sigMainRawatRef.current.getPointAtLength(
                                pRawat * lenSigRawatRef.current,
                            );
                            px = pt.x;
                            py = pt.y;
                            penOp = 1;
                        } catch (_) {}
                    } else if (
                        p < 0.988 &&
                        sigUnderlineRef.current &&
                        lenSigUnderlineRef.current
                    ) {
                        try {
                            const pt = sigUnderlineRef.current.getPointAtLength(
                                pUnderline * lenSigUnderlineRef.current,
                            );
                            px = pt.x;
                            py = pt.y;
                            penOp = 1;
                        } catch (_) {}
                    } else if (
                        p < 0.996 &&
                        sigMainCrossRef.current &&
                        lenSigCrossRefRef.current
                    ) {
                        try {
                            const pt = sigMainCrossRef.current.getPointAtLength(
                                pCross * lenSigCrossRefRef.current,
                            );
                            px = pt.x;
                            py = pt.y;
                            penOp = 1 - Math.max(0, (p - 0.992) / 0.004);
                        } catch (_) {}
                    }

                    sigPenTipRef.current.setAttribute(
                        "transform",
                        `translate(${px.toFixed(1)}, ${py.toFixed(1)})`,
                    );
                    sigPenTipRef.current.style.opacity = `${penOp.toFixed(2)}`;
                } else {
                    sigPenTipRef.current.style.opacity = "0";
                }
            }

            // 6. Subtle Glow Intensity Bloom during final flourish settling into stable elegance
            if (sigGlowGroupRef.current) {
                if (p < 0.93) {
                    sigGlowGroupRef.current.style.opacity = "0";
                } else if (p < 0.974) {
                    sigGlowGroupRef.current.style.opacity = "0.55";
                } else if (p < 0.988) {
                    // Flourish bloom
                    const bloomProg = (p - 0.974) / 0.014;
                    sigGlowGroupRef.current.style.opacity = `${(0.55 + bloomProg * 0.18).toFixed(2)}`;
                } else {
                    // Settling into calm, luminous permanence
                    const settleProg = Math.min(1, (p - 0.988) / 0.012);
                    sigGlowGroupRef.current.style.opacity = `${(0.73 - settleProg * 0.15).toFixed(2)}`;
                }
            }
        },
        [easeInOutQuad, mapRange, smootherstep],
    );

    useEffect(() => {
        let animId: number;
        lastTimeRef.current = performance.now();

        const tick = (now: number) => {
            const dt = Math.min((now - lastTimeRef.current) / 1000, 0.033);
            lastTimeRef.current = now;

            const diff = targetProgressRef.current - progressRef.current;

            if (Math.abs(diff) > 0.00001) {
                const decayRate = targetProgressRef.current > 0.9 ? 18.0 : 12.0;
                const factor = 1 - Math.exp(-decayRate * dt);
                progressRef.current += diff * factor;
                updateVisuals(progressRef.current);
            } else if (progressRef.current !== targetProgressRef.current) {
                progressRef.current = targetProgressRef.current;
                updateVisuals(progressRef.current);
            }

            animId = requestAnimationFrame(tick);
        };

        animId = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(animId);
    }, [updateVisuals]);

    // SVG Path length initialization
    useEffect(() => {
        if (unifiedPathRef.current) {
            const len = unifiedPathRef.current.getTotalLength() || 3200;
            unifiedPathLengthRef.current = len;
            unifiedPathRef.current.style.strokeDasharray = `${len}px`;
            unifiedPathRef.current.style.strokeDashoffset = `${len}px`;
        }
        if (unifiedGlowPathRef.current) {
            const len = unifiedPathLengthRef.current;
            unifiedGlowPathRef.current.style.strokeDasharray = `${len}px`;
            unifiedGlowPathRef.current.style.strokeDashoffset = `${len}px`;
        }
        if (circlePathRef.current) {
            const cLen = circlePathRef.current.getTotalLength() || 200;
            circleLengthRef.current = cLen;
            circlePathRef.current.style.strokeDasharray = `${cLen}px`;
            circlePathRef.current.style.strokeDashoffset = `${cLen}px`;
        }
        if (whiteGuideLineRef.current) {
            const len = whiteGuideLineRef.current.getTotalLength() || 1100;
            lenGuideCurveRef.current = len;
            whiteGuideLineRef.current.style.strokeDasharray = `${len}px`;
            whiteGuideLineRef.current.style.strokeDashoffset = `${len}px`;
        }
        if (sigMainAnupRef.current) {
            const len = sigMainAnupRef.current.getTotalLength() || 1350;
            lenSigAnupRef.current = len;
            sigMainAnupRef.current.style.strokeDasharray = `${len}px`;
            sigMainAnupRef.current.style.strokeDashoffset = `${len}px`;
            if (sigGlowAnupRef.current) {
                sigGlowAnupRef.current.style.strokeDasharray = `${len}px`;
                sigGlowAnupRef.current.style.strokeDashoffset = `${len}px`;
            }
        }
        if (sigMainRawatRef.current) {
            const len = sigMainRawatRef.current.getTotalLength() || 1850;
            lenSigRawatRef.current = len;
            sigMainRawatRef.current.style.strokeDasharray = `${len}px`;
            sigMainRawatRef.current.style.strokeDashoffset = `${len}px`;
            if (sigGlowRawatRef.current) {
                sigGlowRawatRef.current.style.strokeDasharray = `${len}px`;
                sigGlowRawatRef.current.style.strokeDashoffset = `${len}px`;
            }
        }
        if (sigUnderlineRef.current) {
            const len = sigUnderlineRef.current.getTotalLength() || 1150;
            lenSigUnderlineRef.current = len;
            sigUnderlineRef.current.style.strokeDasharray = `${len}px`;
            sigUnderlineRef.current.style.strokeDashoffset = `${len}px`;
            if (sigGlowUnderlineRef.current) {
                sigGlowUnderlineRef.current.style.strokeDasharray = `${len}px`;
                sigGlowUnderlineRef.current.style.strokeDashoffset = `${len}px`;
            }
        }
        if (sigMainCrossRef.current) {
            const len = sigMainCrossRef.current.getTotalLength() || 70;
            lenSigCrossRefRef.current = len;
            sigMainCrossRef.current.style.strokeDasharray = `${len}px`;
            sigMainCrossRef.current.style.strokeDashoffset = `${len}px`;
            if (sigGlowCrossRef.current) {
                sigGlowCrossRef.current.style.strokeDasharray = `${len}px`;
                sigGlowCrossRef.current.style.strokeDashoffset = `${len}px`;
            }
        }

        updateVisuals(0);
    }, [updateVisuals]);

    // ScrollTrigger to pin the section
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

        const isMobile =
            typeof window !== "undefined" && window.innerWidth <= 768;

        const st = ScrollTrigger.create({
            trigger: container,
            pin: true,
            start: "top top",
            end: () =>
                isMobile
                    ? `+=${Math.max(window.innerHeight * 2.2, 1600)}`
                    : `+=${Math.max(window.innerHeight * 3.6, 2700)}`,
            pinSpacing: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
                targetProgressRef.current = self.progress;
            },
        });

        stRef.current = st;

        return () => {
            st.kill();
            stRef.current = null;
        };
    }, [updateVisuals]);

    // Handle viewport resize and orientation changes
    useEffect(() => {
        const handleResize = () => {
            updateVisuals(progressRef.current);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [updateVisuals]);

    return (
        <section
            id="origin"
            ref={containerRef}
            className="relative w-full h-screen bg-[#E6DDD2] text-[#14100E] selection:bg-[#14100E] selection:text-[#F4EDE4] select-none overflow-hidden"
        >
            {/* Pinned Camera Viewport */}
            <div
                id="about-sticky-wrap"
                className="relative w-full h-full overflow-hidden flex flex-col items-center justify-center pt-6 pb-4 md:pt-0 md:pb-0 book-viewport"
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

                {/* Dedicated Mobile Viewport Container:
                    On mobile, acts like a camera window that reveals only the specific portion
                    of the full-size diary involved in the animation, cleanly clipping the rest.
                    On desktop, passes through transparently to preserve the original 2-page spread. */}
                <div
                    id="mobile-diary-viewport"
                    className="relative w-[94vw] max-w-[430px] h-[66vh] max-h-[560px] min-h-[420px] overflow-hidden flex items-center justify-center rounded-2xl mx-auto md:w-full md:h-full md:max-w-none md:max-h-none md:min-h-0 md:rounded-none md:overflow-visible book-viewport"
                >
                    {/* ================================================================= */}
                    {/* THE NOTEBOOK WORLD CANVAS (Controlled by Virtual Camera Engine)   */}
                    {/* ================================================================= */}
                    <div
                        id="notebook-container"
                        ref={notebookRef}
                        className="relative flex-shrink-0 w-[880px] min-w-[880px] h-[580px] min-h-[580px] md:w-[95vw] md:max-w-[1440px] md:h-[86vh] md:max-h-[840px] md:min-w-0 md:min-h-0 flex overflow-visible origin-center book-container rounded-xl will-change-transform select-none shadow-[0_30px_70px_-20px_rgba(0,0,0,0.35)]"
                    >
                    {/* Inner Diary Pages & Content Wrapper (Uniformly heavily blurred during exit) */}
                    <div
                        id="diary-inner-content"
                        ref={diaryContentRef}
                        className="absolute inset-0 flex rounded-xl overflow-hidden will-change-[filter,opacity]"
                    >
                        {/* Ambient Directional Lighting (Top-Left Desk Lamp) */}
                        <div className="absolute inset-0 z-[120] pointer-events-none mix-blend-overlay bg-gradient-to-br from-white/20 via-transparent to-black/40 rounded-xl" />

                        {/* DYNAMIC CINEMATIC SPOTLIGHT (Tracks with the Virtual Camera) */}
                        <div
                            id="cinematic-spotlight"
                            ref={spotlightRef}
                            className="absolute inset-0 pointer-events-none mix-blend-screen z-[125] overflow-hidden rounded-xl opacity-[0.85] transition-opacity duration-300"
                            style={{
                                ["--spot-x" as string]: "50%",
                                ["--spot-y" as string]: "50%",
                            }}
                        >
                            {/* Outer warm key light */}
                            <div
                                className="absolute mix-blend-screen pointer-events-none"
                                style={{
                                    left: "var(--spot-x)",
                                    top: "var(--spot-y)",
                                    width: "52vw",
                                    height: "48vw",
                                    transform:
                                        "translate(-50%, -50%) rotate(-10deg)",
                                    background:
                                        "radial-gradient(ellipse 55% 58% at 48% 50%, rgba(255,244,220,0.45) 0%, rgba(255,236,190,0.2) 35%, transparent 68%)",
                                    filter: "blur(35px)",
                                }}
                            />

                            {/* Inner hot spot */}
                            <div
                                className="absolute mix-blend-screen pointer-events-none"
                                style={{
                                    left: "var(--spot-x)",
                                    top: "var(--spot-y)",
                                    width: "24vw",
                                    height: "22vw",
                                    transform: "translate(-50%, -50%)",
                                    background:
                                        "radial-gradient(circle at 50% 50%, rgba(255,255,245,0.4) 0%, rgba(255,245,210,0.15) 48%, transparent 70%)",
                                    filter: "blur(15px)",
                                }}
                            />
                        </div>

                        {/* CENTRAL BOOK SPINE & BINDING CREASE */}
                        <div
                            id="central-spine-element"
                            className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-8 md:w-12 bg-gradient-to-r from-[#010204]/90 via-[#090f1e]/80 to-[#010204]/90 z-[110] shadow-[inset_0_0_20px_rgba(0,0,0,0.95),_20px_0_30px_rgba(0,0,0,0.4),_-20px_0_30px_rgba(0,0,0,0.4)] border-x border-white/5 rounded-sm pointer-events-none flex justify-center py-6"
                            style={{ transform: "translateZ(3px)" }}
                        >
                            <div className="w-full flex flex-col justify-between items-center h-full opacity-40">
                                <div className="w-full h-1 bg-[#111] shadow-[0_2px_2px_rgba(0,0,0,0.9)]" />
                                <div className="w-full h-1 bg-[#111] shadow-[0_2px_2px_rgba(0,0,0,0.9)]" />
                                <div className="w-full h-1 bg-[#111] shadow-[0_2px_2px_rgba(0,0,0,0.9)]" />
                            </div>
                        </div>

                        {/* ========================================================================= */}
                        {/* SECTION 1: LEFT PAGE BASE (A Handwritten Journey Behind the Camera)       */}
                        {/* ========================================================================= */}
                        <div
                            id="left-page-base"
                            ref={leftPageRef}
                            className="absolute left-0 w-1/2 h-full bg-[#FAF7F0] flex flex-col page-crease-left rounded-l-xl overflow-hidden border-r border-black/20 z-[40] select-none relative shadow-[15px_0_30px_-10px_rgba(0,0,0,0.15)] will-change-[filter,opacity]"
                        >
                            {/* Authentic Blank Paper Texture Mirrored so spine shadow faces the spine */}
                            <img
                                src="/images/blank_notebook_page.png"
                                alt="Notebook Page Paper Base"
                                className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none select-none opacity-[0.95]"
                                style={{ transform: "scaleX(-1)" }}
                            />
                            <div className="absolute inset-0 paper-texture opacity-70 z-[1] pointer-events-none" />
                            <div className="absolute inset-0 ruled-paper-lines opacity-[0.16] z-[1] pointer-events-none" />

                            {/* Spine Crease Shadow on inner edge */}
                            <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-black/25 via-black/8 to-transparent pointer-events-none z-[2]" />

                            {/* Red Notebook Margin Line on far left */}
                            <div className="notebook-red-margin" />

                            {/* Top Margin Header */}
                            <div
                                id="origin-page-header"
                                aria-hidden="true"
                                className="absolute top-[3.2%] left-[4.8%] font-dm-mono text-[9px] md:text-[9.5px] uppercase tracking-[0.25em] text-[#051024]/45 font-bold z-10 select-none"
                            >
                                01 — THE BEGINNING
                            </div>

                            {/* Bottom Margin Note */}
                            <div
                                aria-hidden="true"
                                className="absolute bottom-[3.2%] left-[4.8%] font-dm-mono text-[8.5px] md:text-[9px] uppercase tracking-[0.22em] text-[#051024]/40 font-bold z-10 select-none"
                            >
                                GOD'S PLAN
                            </div>

                            {/* Left Margin Bracket Sketch Doodle */}
                            <svg
                                className="absolute top-[40%] left-[2.2%] w-5 h-36 opacity-25 pointer-events-none z-10"
                                viewBox="0 0 24 140"
                                fill="none"
                                stroke="#1c1c1c"
                                strokeWidth="1.2"
                            >
                                <path
                                    d="M 22,2 L 4,20 L 4,120 L 22,138"
                                    strokeLinecap="round"
                                />
                            </svg>

                            {/* Upper Right Scotch-Taped Scrap Note ("I'm an open book.") - WHERE BLUE LINE STARTS */}
                            <div
                                id="intro-sticky-note"
                                ref={startNoteZoneRef}
                                className="absolute top-[5%] right-[5%] md:right-[6%] w-[210px] md:w-[240px] bg-[#FAF8F2] p-3.5 md:p-4 pt-5 rounded-[2px] shadow-[2px_8px_20px_rgba(0,0,0,0.12),_inset_0_0_12px_rgba(0,0,0,0.02)] border border-black/5 rotate-[-1.5deg] z-[30] will-change-[filter,opacity]"
                            >
                                {/* Beige Masking Tape */}
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-4.5 scotch-tape rotate-[1deg] z-40 bg-[#e8ded0]/80 border border-black/10" />
                                {/* Red mini-margin line */}
                                <div className="absolute top-0 bottom-0 left-[16px] w-[1px] bg-red-400/35" />
                                <div className="relative pl-3.5">
                                    <p className="font-caveat font-bold text-[17px] md:text-[18px] text-[#14100E] leading-[1.25]">
                                        I'm an open book.
                                    </p>
                                    <p className="font-caveat font-semibold text-[13.5px] md:text-[14.5px] text-black/80 leading-[1.25] mt-0.5">
                                        Here's the unfiltered timeline of
                                        <br />
                                        how I figured things out.
                                    </p>
                                </div>
                            </div>

                            {/* Middle Right Handwritten Annotation ("It started as curiosity...") */}
                            <div
                                id="frag-strategy-annot"
                                ref={curiosityZoneRef}
                                className="absolute top-[33%] right-[5%] md:right-[7%] max-w-[230px] md:max-w-[260px] font-caveat font-bold text-[17px] md:text-[20px] text-[#012CEB] leading-[1.22] rotate-[-0.5deg] z-[25] text-left select-none will-change-[filter,opacity]"
                            >
                                <p>It started as curiosity.</p>
                                <p>Then it became a way of seeing the world.</p>
                                <p>The craft came later.</p>
                            </div>

                            {/* Main Headline & Story Stack (Left Side of Page 1) */}
                            <div
                                id="origin-headline-story-zone"
                                ref={headlineZoneRef}
                                className="relative z-[20] w-full h-full flex flex-col justify-start pl-[12%] pr-[46%] pt-[6.5%] pb-[4%] will-change-[filter,opacity]"
                            >
                                {/* Blue Handwritten Intro Tag */}
                                <div
                                    id="frag-origin-cursive"
                                    className="relative font-caveat font-bold text-[22px] md:text-[26px] text-[#012CEB] leading-none mb-1.5 w-fit"
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
                                            strokeWidth="2.5"
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                </div>

                                {/* Hand-Drawn Bold Headline */}
                                <div
                                    id="origin-headline"
                                    className="w-full font-kalam font-bold text-[24px] sm:text-[28px] md:text-[34px] xl:text-[38px] text-[#14100E] leading-[1.08] tracking-tight mb-2.5 select-none"
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
                                        <span className="inline-block relative text-[#012CEB] px-3.5 py-0.5 mx-1 font-bold">
                                            camera.
                                            {/* Hand-Drawn Blue Loop Circle */}
                                            <svg
                                                className="absolute -inset-1.5 w-[calc(100%+12px)] h-[calc(100%+12px)] pointer-events-none overflow-visible"
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
                                                />
                                            </svg>
                                        </span>
                                        <span>)</span>
                                    </span>
                                </div>

                                {/* Supporting Story Paragraph */}
                                <div
                                    id="origin-micro-story"
                                    className="w-full max-w-[340px] font-schoolbell text-[11.5px] md:text-[13px] text-[#1c1c1c]/90 leading-[1.38] mt-1.5 select-none"
                                >
                                    <p className="mb-1.5">
                                        I had no idea what a marketing strategy
                                        was in 9th grade. I was just making
                                        YouTube thumbnails and faking whatever
                                        freelance gigs I could find through
                                        Insta & Discord.
                                    </p>
                                    <p>
                                        I didn't know what a “value proposition”
                                        was. I kept making things because I
                                        liked seeing them work.
                                    </p>
                                    {/* Subtle pencil underline */}
                                    <svg
                                        className="w-36 h-2 mt-1.5 opacity-60"
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

                            {/* Cinematic Camera Operator Cutout (The single camera asset) */}
                            <div
                                id="personal-cutout"
                                ref={personalCutoutRef}
                                className="absolute bottom-0 left-[38%] md:left-[40%] w-[310px] md:w-[370px] pointer-events-none z-[22] flex flex-col items-center select-none will-change-transform"
                            >
                                <img
                                    src="/images/camera_operator.png"
                                    alt="Cinematic Camera Operator"
                                    className="w-full h-auto object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.25)]"
                                />

                                {/* Taped paper label "MANUAL 1250N" */}
                                <div className="absolute right-[4%] bottom-[23%] bg-[#FAF6EE] border border-black/10 px-2 py-0.5 text-[8.5px] font-dm-mono text-black/80 font-bold shadow-sm rotate-[3deg] z-10 flex flex-col items-center">
                                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-3 scotch-tape rotate-[-2deg] bg-[#e8ded0]/80 border border-black/10" />
                                    <span className="leading-tight">
                                        MANUAL
                                    </span>
                                    <span className="leading-tight">1250N</span>
                                </div>
                            </div>

                            {/* Polaroid Memory Photo ("Behind the frame") */}
                            <div
                                id="art-polaroid"
                                ref={polaroidZoneRef}
                                className="absolute bottom-[4%] right-[3%] md:right-[5%] w-[160px] md:w-[180px] bg-[#FDFBF7] p-2.5 pb-4 rounded-[2px] shadow-[3px_12px_28px_rgba(0,0,0,0.16)] border border-black/5 rotate-[-6deg] flex flex-col z-[18] select-none will-change-[filter,opacity]"
                            >
                                {/* Beige Masking Tape on Top */}
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-10 h-4.5 scotch-tape rotate-[2deg] z-30 bg-[#e8ded0]/80 border border-black/10" />

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
                                    <div className="font-caveat font-bold text-[16px] text-black/85 text-center leading-none">
                                        Behind the frame
                                    </div>
                                    <div className="w-16 h-[1.5px] bg-black/40 mx-auto mt-1 rounded-full" />
                                </div>
                            </div>
                        </div>

                        {/* ========================================================================= */}
                        {/* SECTION 2: RIGHT PAGE BASE (Cinematic Filmmaking Storyboard Workspace)   */}
                        {/* ========================================================================= */}
                        <div
                            id="right-page-base"
                            ref={rightPageRef}
                            className="absolute right-0 w-1/2 h-full bg-[#FAF7F0] flex flex-col page-crease-right rounded-r-xl overflow-hidden border-l border-black/10 z-[40] select-none relative shadow-[-15px_0_30px_-10px_rgba(0,0,0,0.12)] will-change-[filter,opacity]"
                        >
                            {/* High-Resolution Storyboard Workspace as Background */}
                            <img
                                src="/origin-images/Cinematic%20Filmmaking%20Storyboard%20Workspace.png"
                                alt="Cinematic Filmmaking Storyboard Workspace"
                                className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none select-none opacity-[0.98]"
                            />

                            {/* Faint Natural Texture & Paper Lines */}
                            <div className="absolute inset-0 paper-texture opacity-40 z-[1] pointer-events-none" />
                            <div className="absolute inset-0 ruled-paper-lines opacity-[0.10] z-[1] pointer-events-none" />

                            {/* Spine Crease Shadow Overlay for realistic 3D depth */}
                            <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-black/25 via-black/8 to-transparent pointer-events-none z-[2]" />

                            {/* Top Margin Header */}
                            <div
                                aria-hidden="true"
                                className="absolute top-[3.2%] left-[6%] font-dm-mono text-[9px] md:text-[9.5px] uppercase tracking-[0.25em] text-[#051024]/45 font-bold z-10 select-none"
                            >
                                02 — ONE EYE LED TO ANOTHER
                            </div>

                            {/* Top Left Spiral-Paper Note: CINEMATOGRAPHY WITH A PURPOSE */}
                            <div
                                id="cinematography-note"
                                ref={cinematographyZoneRef}
                                className="absolute top-[7.5%] left-[6.5%] w-[33%] max-w-[240px] z-[25] select-none pointer-events-none will-change-[filter,opacity]"
                            >
                                <div className="relative mb-2">
                                    <h3 className="font-kalam font-bold text-[13px] sm:text-[15px] md:text-[17px] text-[#14100E] leading-tight tracking-tight uppercase">
                                        CINEMATOGRAPHY
                                        <br />
                                        WITH A PURPOSE
                                    </h3>
                                    <div className="w-[85%] h-2 bg-[#FACC15]/45 rounded-sm -mt-1.5 pointer-events-none" />
                                </div>

                                <p className="font-schoolbell text-[10px] sm:text-[11.5px] md:text-[13px] text-[#14100E]/90 leading-[1.38]">
                                    I am a cinematographer at heart. I observe
                                    light, chase real moments, and love turning
                                    ordinary stories into cinematic visuals that
                                    make people feel something.
                                </p>

                                <div className="mt-2.5">
                                    <span className="font-schoolbell text-[9.5px] sm:text-[11px] md:text-[12px] text-[#1c1c1c]/80 italic">
                                        beautiful visuals that actually work.
                                    </span>
                                </div>
                            </div>

                            {/* Middle Right Cursive Annotation ("crazy what happens when...") */}
                            <div
                                id="crazy-creative-note"
                                ref={crazyNoteZoneRef}
                                className="absolute top-[30%] right-[16%] md:right-[18%] max-w-[210px] md:max-w-[240px] z-[25] select-none pointer-events-none text-left will-change-[filter,opacity]"
                            >
                                <p className="font-caveat font-bold text-[16px] sm:text-[18px] md:text-[21px] text-[#012CEB] leading-[1.18] rotate-[-1.5deg]">
                                    crazy what happens when you just make
                                    weirdly creative cinematography stuff.
                                </p>
                            </div>

                            {/* Bottom Left Section: PLACES I'VE SHOT AT */}
                            <div
                                id="places-ive-shot"
                                ref={placesZoneRef}
                                className="absolute bottom-[22%] left-[6%] w-[42%] max-w-[320px] z-[25] select-none pointer-events-none will-change-[filter,opacity]"
                            >
                                <div className="relative mb-2 inline-block">
                                    <span className="font-kalam font-bold text-[13px] sm:text-[15px] md:text-[17px] text-[#14100E] tracking-tight uppercase">
                                        // PLACES I'VE SHOT AT
                                    </span>
                                    <div className="w-full h-2 bg-[#FACC15]/45 rounded-sm -mt-2 pointer-events-none" />
                                </div>

                                <ul className="space-y-1 font-schoolbell text-[9.5px] sm:text-[11px] md:text-[12.5px] text-[#14100E]/90 leading-[1.35]">
                                    <li className="flex items-start">
                                        <span className="mr-1.5 text-black/60">
                                            —
                                        </span>
                                        <span>
                                            Commercial shoots for top brands at
                                            premium locations.
                                        </span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="mr-1.5 text-black/60">
                                            —
                                        </span>
                                        <span>
                                            Music videos with independent
                                            artists.
                                        </span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="mr-1.5 text-black/60">
                                            —
                                        </span>
                                        <span>
                                            Short films and documentaries.
                                        </span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="mr-1.5 text-black/60">
                                            —
                                        </span>
                                        <span>
                                            Travel & lifestyle content across
                                            cities and mountains.
                                        </span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="mr-1.5 text-black/60">
                                            —
                                        </span>
                                        <span>
                                            Behind-the-scenes for events, ad
                                            films and brand campaigns.
                                        </span>
                                    </li>
                                </ul>
                            </div>

                            {/* Bottom Middle PS// Note ("The goal is simple...") */}
                            <div
                                id="ps-goal-note"
                                ref={psGoalZoneRef}
                                className="absolute bottom-[20%] left-[51%] w-[32%] max-w-[250px] z-[25] select-none pointer-events-none will-change-[filter,opacity]"
                            >
                                <span className="font-kalam font-bold text-[12px] sm:text-[14px] md:text-[15px] text-[#14100E] uppercase block mb-0.5">
                                    PS//
                                </span>
                                <p className="font-schoolbell text-[9.5px] sm:text-[11px] md:text-[12.5px] text-[#14100E]/90 leading-[1.35]">
                                    The goal is simple—find artists and brands
                                    making incredible things, and grow, together
                                    using our respective arts.
                                </p>
                            </div>

                            {/* Bottom Margin Note */}
                            <div
                                aria-hidden="true"
                                className="absolute bottom-[10.5%] left-[13%] font-dm-mono text-[8.5px] md:text-[9px] uppercase tracking-[0.22em] text-[#051024]/40 font-bold z-10 select-none"
                            >
                                GOD'S PLAN
                            </div>

                            {/* Bottom Right Taped Note: "Still figuring out things..." */}
                            <div
                                id="still-figuring-note"
                                ref={stillFiguringZoneRef}
                                className="absolute bottom-[6.5%] right-[5%] w-[180px] md:w-[210px] z-[30] select-none pointer-events-none text-center will-change-[filter,opacity]"
                            >
                                <p className="font-caveat font-bold text-[17px] sm:text-[19px] md:text-[22px] text-[#14100E] leading-tight rotate-[-2deg]">
                                    Still figuring
                                    <br />
                                    out things
                                    <br />
                                    <span className="text-[14px] tracking-widest">
                                        ...
                                    </span>
                                </p>
                            </div>
                        </div>

                        {/* ========================================================================= */}
                        {/* ONE UNIFIED CONTINUOUS BLUE SVG PATH SPANNING ENTIRE TWO-PAGE SPREAD      */}
                        {/* Spans Page 1 (0..1000) -> Spine (1000) -> Page 2 (1000..2000)              */}
                        {/* ========================================================================= */}
                        <svg
                            className="absolute inset-0 w-full h-full pointer-events-none z-[65]"
                            viewBox="0 0 2000 1000"
                            preserveAspectRatio="none"
                        >
                            <defs>
                                <filter
                                    id="unified-cinematic-glow"
                                    x="-20%"
                                    y="-20%"
                                    width="140%"
                                    height="140%"
                                >
                                    <feGaussianBlur
                                        stdDeviation="4.5"
                                        result="coloredBlur"
                                    />
                                    <feMerge>
                                        <feMergeNode in="coloredBlur" />
                                        <feMergeNode in="SourceGraphic" />
                                    </feMerge>
                                </filter>
                            </defs>

                            {/* Start dot on upper-right note of Left Page */}
                            <circle
                                ref={startDotRef}
                                cx="700"
                                cy="165"
                                r="5"
                                fill="#012CEB"
                                opacity="0"
                            />

                            {/* Radiant Radar Beacon Pulse at Start Dot */}
                            <circle
                                ref={startPulseCircleRef}
                                cx="700"
                                cy="165"
                                r="6"
                                fill="none"
                                stroke="#012CEB"
                                strokeWidth="2px"
                                opacity="0"
                            />

                            {/* Glowing Continuous Path */}
                            <path
                                id="unified-blueprint-glow"
                                ref={unifiedGlowPathRef}
                                className="map-line-path"
                                d={UNIFIED_JOURNEY_PATH}
                                style={{
                                    stroke: "#012CEB",
                                    strokeWidth: "7.5px",
                                    opacity: 0.38,
                                    fill: "none",
                                    filter: "url(#unified-cinematic-glow)",
                                    strokeDasharray: "3200px",
                                    strokeDashoffset: "3200px",
                                    transition: "none",
                                }}
                            />

                            {/* Primary Crisp Continuous Path */}
                            <path
                                id="unified-blueprint-path"
                                ref={unifiedPathRef}
                                className="map-line-path"
                                d={UNIFIED_JOURNEY_PATH}
                                style={{
                                    stroke: "#012CEB",
                                    strokeWidth: "3.5px",
                                    opacity: 0.95,
                                    fill: "none",
                                    strokeLinecap: "round",
                                    strokeLinejoin: "round",
                                    strokeDasharray: "3200px",
                                    strokeDashoffset: "3200px",
                                    transition: "none",
                                }}
                            />

                            {/* Integrated Directional Markers along the Single Path */}
                            {/* 1. Page 1 loop above headline */}
                            <path
                                ref={arrow1Ref}
                                d="M 540,110 L 525,118 L 540,126"
                                fill="none"
                                stroke="#012CEB"
                                strokeWidth="3.2px"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                style={{ opacity: 0 }}
                            />
                            {/* 2. Page 1 towards curiosity annotation */}
                            <path
                                ref={arrow2Ref}
                                d="M 590,485 L 608,485 L 600,498"
                                fill="none"
                                stroke="#012CEB"
                                strokeWidth="3.2px"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                style={{ opacity: 0 }}
                            />
                            {/* 3. Page 1 along camera operator / polaroid */}
                            <path
                                ref={arrow3Ref}
                                d="M 748,646 L 760,660 L 772,648"
                                fill="none"
                                stroke="#012CEB"
                                strokeWidth="3.2px"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                style={{ opacity: 0 }}
                            />
                            {/* Spine crossing arrow */}
                            <path
                                ref={arrowSpineRef}
                                d="M 985,482 L 1002,468 L 1005,486"
                                fill="none"
                                stroke="#012CEB"
                                strokeWidth="3.2px"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                style={{ opacity: 0 }}
                            />
                            {/* 4. Page 2 into cinematography note */}
                            <path
                                ref={arrow4Ref}
                                d="M 1245,232 L 1264,220 L 1268,238"
                                fill="none"
                                stroke="#012CEB"
                                strokeWidth="3.2px"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                style={{ opacity: 0 }}
                            />
                            {/* 5. Page 2 towards places shot & creative note */}
                            <path
                                ref={arrow5Ref}
                                d="M 1585,530 L 1572,548 L 1592,554"
                                fill="none"
                                stroke="#012CEB"
                                strokeWidth="3.2px"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                style={{ opacity: 0 }}
                            />
                            {/* End arrow guiding naturally into signature */}
                            <path
                                ref={arrowEndRef}
                                d="M 1690,832 L 1708,842 L 1694,854"
                                fill="none"
                                stroke="#012CEB"
                                strokeWidth="3.4px"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                style={{ opacity: 0 }}
                            />
                        </svg>

                        {/* Preserved Theme: Dark overlay disabled so notebook pages, sketches & camera remain 100% visible */}
                        <div
                            id="diary-dark-theme-overlay"
                            ref={darkThemeRef}
                            className="absolute inset-0 z-[130] pointer-events-none rounded-xl opacity-0 transition-opacity duration-300"
                        />
                    </div>

                    {/* ========================================================================= */}
                    {/* DEDICATED DIARY-BOUNDED CINEMATIC OVERLAY                                 */}
                    {/* Positioned strictly inside the diary with rounded corners & overflow clip  */}
                    {/* ========================================================================= */}
                    <div
                        id="diary-cinematic-overlay"
                        ref={grandSignatureOverlayRef}
                        className="absolute inset-0 z-[150] rounded-xl overflow-hidden pointer-events-none opacity-0 select-none"
                    >
                        {/* Subtle cool-blue haze inside the diary area */}
                        <div
                            id="diary-blue-wash"
                            ref={blueAtmosphereRef}
                            className="absolute inset-0 pointer-events-none rounded-xl opacity-0 transition-opacity duration-300"
                            style={{
                                background:
                                    "radial-gradient(ellipse 75% 65% at 50% 50%, rgba(96, 165, 250, 0.28) 0%, rgba(147, 197, 253, 0.16) 45%, rgba(220, 235, 250, 0.25) 80%, transparent 100%), linear-gradient(180deg, rgba(147, 197, 253, 0.18) 0%, transparent 35%, transparent 65%, rgba(147, 197, 253, 0.2) 100%)",
                            }}
                        />

                        {/* Crisp White Curved Line & Signature SVG - strictly contained within the diary bounds */}
                        <div className="absolute inset-0 flex items-center justify-center p-6 md:p-10 lg:p-14 pointer-events-none">
                            <svg
                                className="w-full max-w-[760px] md:max-w-[880px] lg:max-w-[960px] xl:max-w-[1040px] h-auto overflow-visible select-none pointer-events-none drop-shadow-[0_4px_18px_rgba(15,35,75,0.32)] drop-shadow-[0_1px_4px_rgba(15,35,75,0.22)]"
                                viewBox="0 0 1240 440"
                                fill="none"
                            >
                                <defs>
                                    <filter
                                        id="white-curve-glow"
                                        x="-20%"
                                        y="-20%"
                                        width="140%"
                                        height="140%"
                                    >
                                        <feGaussianBlur
                                            stdDeviation="1.8"
                                            result="blur1"
                                        />
                                        <feGaussianBlur
                                            stdDeviation="4.5"
                                            result="blur2"
                                        />
                                        <feMerge>
                                            <feMergeNode in="blur2" />
                                            <feMergeNode in="blur1" />
                                            <feMergeNode in="SourceGraphic" />
                                        </feMerge>
                                    </filter>
                                    <filter
                                        id="signature-icy-glow"
                                        x="-30%"
                                        y="-30%"
                                        width="160%"
                                        height="160%"
                                    >
                                        <feGaussianBlur
                                            stdDeviation="7.5"
                                            result="coloredBlur"
                                        />
                                        <feMerge>
                                            <feMergeNode in="coloredBlur" />
                                            <feMergeNode in="SourceGraphic" />
                                        </feMerge>
                                    </filter>
                                    <filter
                                        id="sig-pen-flare"
                                        x="-60%"
                                        y="-60%"
                                        width="220%"
                                        height="220%"
                                    >
                                        <feGaussianBlur
                                            stdDeviation="3.5"
                                            result="flareBlur"
                                        />
                                        <feMerge>
                                            <feMergeNode in="flareBlur" />
                                            <feMergeNode in="SourceGraphic" />
                                        </feMerge>
                                    </filter>
                                    <linearGradient
                                        id="curveWhiteGrad"
                                        x1="0%"
                                        y1="0%"
                                        x2="100%"
                                        y2="100%"
                                    >
                                        <stop
                                            offset="0%"
                                            stopColor="#FFFFFF"
                                            stopOpacity="0.08"
                                        />
                                        <stop
                                            offset="40%"
                                            stopColor="#E2EFFF"
                                            stopOpacity="0.85"
                                        />
                                        <stop
                                            offset="100%"
                                            stopColor="#FFFFFF"
                                            stopOpacity="1"
                                        />
                                    </linearGradient>
                                </defs>

                                {/* 1. Animated White Curved Line leading into signature */}
                                <path
                                    ref={whiteGuideLineRef}
                                    d={WHITE_GUIDE_CURVE_PATH}
                                    stroke="url(#curveWhiteGrad)"
                                    strokeWidth="2.2px"
                                    strokeLinecap="round"
                                    opacity="0"
                                    filter="url(#white-curve-glow)"
                                />
                                {/* Glowing tip of curved line */}
                                <circle
                                    ref={whiteGuideTipRef}
                                    r="3.5"
                                    fill="#FFFFFF"
                                    opacity="0"
                                    filter="url(#white-curve-glow)"
                                />

                                {/* 2. Soft Ethereal Icy-Blue Ambient Glow Duplicate */}
                                <g
                                    ref={sigGlowGroupRef}
                                    filter="url(#signature-icy-glow)"
                                    opacity="0.55"
                                >
                                    <path
                                        ref={sigGlowAnupRef}
                                        d={SIGNATURE_ANUP_PATH}
                                        stroke="#60A5FA"
                                        strokeWidth="6.5px"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        fill="none"
                                    />
                                    <path
                                        ref={sigGlowRawatRef}
                                        d={SIGNATURE_RAWAT_PATH}
                                        stroke="#60A5FA"
                                        strokeWidth="6.5px"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        fill="none"
                                    />
                                    <path
                                        ref={sigGlowUnderlineRef}
                                        d={SIGNATURE_UNDERLINE_PATH}
                                        stroke="#60A5FA"
                                        strokeWidth="5.5px"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        fill="none"
                                    />
                                    <path
                                        ref={sigGlowCrossRef}
                                        d={SIGNATURE_CROSS_PATH}
                                        stroke="#60A5FA"
                                        strokeWidth="4.5px"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        fill="none"
                                    />
                                </g>

                                {/* 3. Crisp Pure White / Soft Luminous Signature Stroke */}
                                <g filter="url(#white-curve-glow)">
                                    <path
                                        ref={sigMainAnupRef}
                                        d={SIGNATURE_ANUP_PATH}
                                        stroke="#FFFFFF"
                                        strokeWidth="3.2px"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        fill="none"
                                    />
                                    <path
                                        ref={sigMainRawatRef}
                                        d={SIGNATURE_RAWAT_PATH}
                                        stroke="#FFFFFF"
                                        strokeWidth="3.2px"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        fill="none"
                                    />
                                    <path
                                        ref={sigUnderlineRef}
                                        d={SIGNATURE_UNDERLINE_PATH}
                                        stroke="#FFFFFF"
                                        strokeWidth="2.5px"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        fill="none"
                                    />
                                    <path
                                        ref={sigMainCrossRef}
                                        d={SIGNATURE_CROSS_PATH}
                                        stroke="#FFFFFF"
                                        strokeWidth="2.4px"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        fill="none"
                                    />
                                </g>

                                {/* 4. Luminous Artist Pen Tip (Active Drawing Flare tracking the live pen point) */}
                                <g
                                    ref={sigPenTipRef}
                                    opacity="0"
                                    className="pointer-events-none"
                                >
                                    <circle
                                        r="8.5"
                                        fill="#60A5FA"
                                        opacity="0.45"
                                        filter="url(#sig-pen-flare)"
                                    />
                                    <circle
                                        r="4.2"
                                        fill="#E2EFFF"
                                        opacity="0.85"
                                        filter="url(#white-curve-glow)"
                                    />
                                    <circle r="2.2" fill="#FFFFFF" />
                                </g>
                            </svg>
                        </div>
                    </div>
                </div>
                </div>

                {/* Epilogue Quote settled gracefully on the warm desk beneath the notebook spread */}
                <div
                    id="epilogue-quote"
                    ref={epilogueRef}
                    className="relative md:absolute md:bottom-4 md:left-1/2 mt-3 md:mt-0 text-center pointer-events-none z-[165] w-full max-w-[500px] px-4 opacity-0 transition-opacity duration-500"
                >
                    <p className="font-schoolbell text-xs md:text-sm text-[#14100E]/85 leading-relaxed mb-0.5 px-4 drop-shadow-sm">
                        “If I ever write a book on how I see creativity, it will
                        have infinite pages. And I'll still be figuring it out.”
                    </p>
                    <div className="flex flex-col items-center justify-center gap-1">
                        <span className="text-[9px] font-dm-mono text-[#012CEB] tracking-[0.25em] uppercase font-bold">
                            CHAPTER 01 // ORIGIN COMPLETE
                        </span>
                        <div className="flex items-center gap-1.5 opacity-55 text-[8px] font-dm-mono tracking-[0.2em] uppercase text-[#14100E]/70 mt-0.5">
                            <span>Scroll for Chapter 02</span>
                            <svg
                                className="w-2.5 h-2.5 animate-bounce"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                            >
                                <path d="M7 10l5 5 5-5" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Seamless gradient floor connecting into Chapter 02 */}
                <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none z-[160] bg-gradient-to-b from-transparent to-[#E6DDD2]" />
            </div>
        </section>
    );
};
