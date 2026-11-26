"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Volume2, VolumeX, Maximize2, Play, Pause, X } from "lucide-react";

interface CinematicVideoDisplayProps {
    title: string;
    videoUrl?: string;
    videoMp4?: string;
    videoWebm?: string;
    videoMov?: string;
    imageUrl?: string;
    badgeLabel?: string;
    className?: string;
    stationIndex?: number;
    isActive?: boolean;
    isLoading?: boolean;
    isServerError?: boolean;
}

interface VideoMeta {
    width: number;
    height: number;
    aspectRatio: number;
    ratioString: string;
    isPortrait: boolean;
}

export const CinematicVideoDisplay: React.FC<CinematicVideoDisplayProps> = ({
    title,
    videoUrl,
    videoMp4,
    videoWebm,
    videoMov,
    imageUrl,
    badgeLabel = "24 FPS",
    className = "",
    stationIndex,
    isActive = true,
    isLoading = false,
    isServerError = false,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const modalVideoRef = useRef<HTMLVideoElement | null>(null);

    // Dynamic media sources only — no static fallbacks
    const resolvedVideo = videoUrl || videoMp4 || videoWebm || videoMov || null;
    const resolvedImage = imageUrl || null;

    // Track dynamic loading & error states
    const [videoFailed, setVideoFailed] = useState(false);
    const [imageFailed, setImageFailed] = useState(false);

    const [isMuted, setIsMuted] = useState(true);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [isInView, setIsInView] = useState(false);
    const [videoMeta, setVideoMeta] = useState<VideoMeta | null>(null);

    // Reset error state when dynamic source props change
    useEffect(() => {
        setVideoFailed(false);
        setImageFailed(false);
    }, [resolvedVideo, resolvedImage]);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Active media determination:
    // 1. Dynamic video if available and healthy
    // 2. Dynamic image if video fails or unavailable and image is healthy
    // 3. Server Error if neither is available or both fail
    const canShowVideo = Boolean(resolvedVideo && !videoFailed);
    const canShowImage = Boolean(resolvedImage && !imageFailed);
    const hasMedia = canShowVideo || canShowImage;

    const isMobileOrTouch =
        isMounted &&
        typeof navigator !== "undefined" &&
        (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
            (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1) ||
            window.matchMedia("(hover: none) and (pointer: coarse)").matches ||
            window.innerWidth < 768);

    // Mount video only when active AND in view on mobile (both iOS and Android) to prevent decoder OOM/starvation;
    // on desktop, require (isActive || stationIndex === undefined) && isInView as well so offscreen videos stay unmounted.
    const shouldMountVideo =
        canShowVideo &&
        (isMobileOrTouch
            ? (isActive || stationIndex === undefined) && isInView
            : (isActive || stationIndex === undefined) && isInView);

    const updateVideoMetadata = useCallback((videoElement: HTMLVideoElement) => {
        if (!videoElement.videoWidth || !videoElement.videoHeight) return;
        const w = videoElement.videoWidth;
        const h = videoElement.videoHeight;
        const ratio = w / h;
        const isPortrait = h > w;

        let ratioStr = `${ratio.toFixed(2)}:1`;
        if (Math.abs(ratio - 16 / 9) < 0.05) ratioStr = "16:9 DCI";
        else if (Math.abs(ratio - 9 / 16) < 0.05) ratioStr = "9:16 VERTICAL";
        else if (Math.abs(ratio - 2.39) < 0.1 || Math.abs(ratio - 2.4) < 0.1) ratioStr = "2.39:1 SCOPE";
        else if (Math.abs(ratio - 4 / 3) < 0.05) ratioStr = "4:3 ACADEMY";
        else if (Math.abs(ratio - 1) < 0.05) ratioStr = "1:1 SQUARE";

        setVideoMeta({
            width: w,
            height: h,
            aspectRatio: ratio,
            ratioString: ratioStr,
            isPortrait,
        });
    }, []);

    const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
        updateVideoMetadata(e.currentTarget);
    };

    const togglePlay = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!videoRef.current) return;
        if (videoRef.current.paused) {
            const playPromise = videoRef.current.play();
            if (playPromise !== undefined) {
                playPromise.catch((err) => {
                    if (err?.name !== "AbortError") {
                        console.warn("Video playback error:", err);
                    }
                });
            }
            setIsPlaying(true);
        } else {
            videoRef.current.pause();
            setIsPlaying(false);
        }
    };

    const toggleMute = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!videoRef.current) return;
        const nextMuted = !isMuted;
        videoRef.current.muted = nextMuted;
        setIsMuted(nextMuted);
    };

    const openModal = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (videoRef.current) {
            updateVideoMetadata(videoRef.current);
        }
        setIsModalOpen(true);
    };

    const closeModal = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (modalVideoRef.current) {
            modalVideoRef.current.pause();
            modalVideoRef.current.removeAttribute("src");
            modalVideoRef.current.load();
        }
        if (videoRef.current) {
            if (isPlaying && isInView) {
                const p = videoRef.current.play();
                if (p !== undefined) {
                    p.catch(() => {});
                }
            }
        }
        setIsModalOpen(false);
    };

    // Callback ref to guarantee immediate hardware decoder purge when unmounting
    const setVideoElementRef = useCallback((node: HTMLVideoElement | null) => {
        if (videoRef.current && !node) {
            videoRef.current.pause();
            videoRef.current.removeAttribute("src");
            videoRef.current.load();
        }
        videoRef.current = node;
    }, []);

    // Synchronize playback position and unlock audio when modal opens
    useEffect(() => {
        if (isModalOpen && modalVideoRef.current && videoRef.current) {
            modalVideoRef.current.currentTime = videoRef.current.currentTime;
            const p = modalVideoRef.current.play();
            if (p !== undefined) {
                p.catch(() => {});
            }
        }
    }, [isModalOpen]);

    // Lock body scroll and listen for escape key
    useEffect(() => {
        if (!isModalOpen) return;

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                closeModal();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => {
            document.body.style.overflow = originalOverflow;
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isModalOpen]);

    // Cleanup decoder on unmount
    useEffect(() => {
        return () => {
            const v = videoRef.current;
            if (v) {
                v.pause();
                v.removeAttribute("src");
                v.load();
            }
        };
    }, []);

    // Manage active playback state
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        if (shouldMountVideo && isInView && isPlaying) {
            const p = video.play();
            if (p !== undefined) {
                p.catch(() => {});
            }
        } else {
            video.pause();
        }
    }, [shouldMountVideo, isInView, isPlaying]);

    // Intersection observer for container visibility
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                const intersecting = entry.isIntersecting && entry.intersectionRatio >= 0.25;
                setIsInView(intersecting);
            },
            { threshold: [0, 0.25, 0.5] }
        );

        observer.observe(container);
        return () => observer.disconnect();
    }, []);

    // Pause video when document is hidden
    useEffect(() => {
        const handleVisibilityChange = () => {
            const video = videoRef.current;
            if (!video) return;

            if (document.hidden) {
                video.pause();
            } else if (shouldMountVideo && isInView && isPlaying) {
                const p = video.play();
                if (p !== undefined) {
                    p.catch(() => {});
                }
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
    }, [shouldMountVideo, isInView, isPlaying]);

    // 1. Loading State: Preserve loading behavior while API request is in-flight (avoid showing Server Error prematurely)
    if (isLoading) {
        return (
            <div className={`w-full h-full flex flex-col items-center justify-center bg-[#0C0A09] text-center p-4 select-none ${className}`}>
                <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-[#D4A017] animate-spin mb-3" />
                <span className="font-['DM_Mono'] text-[10px] text-white/50 tracking-widest uppercase">
                    Loading Media...
                </span>
            </div>
        );
    }

    // 2. Server Error State: Rendered when dynamic media is unavailable, failed, or API returned error
    if (isServerError || !hasMedia) {
        return (
            <div className={`w-full h-full flex flex-col items-center justify-center bg-[#0C0A09] text-center p-4 select-none ${className}`}>
                <div className="flex flex-col items-center justify-center">
                    <span className="font-['DM_Mono'] text-xs sm:text-sm md:text-base text-red-500/90 font-bold tracking-widest uppercase">
                        Server Error
                    </span>
                    <span className="font-sans text-[10px] sm:text-[11px] text-white/40 mt-1 max-w-[85%] truncate">
                        {title}
                    </span>
                </div>
            </div>
        );
    }

    return (
        <>
            <div
                ref={containerRef}
                className={`relative w-full h-full bg-black overflow-hidden group select-none cursor-pointer ${className}`}
                onClick={openModal}
                title="Click to view full cinema master"
            >
                {/* 3. Dynamic Video Mode */}
                {canShowVideo ? (
                    shouldMountVideo ? (
                        <video
                            ref={setVideoElementRef}
                            loop
                            muted={isMuted}
                            playsInline
                            preload={isInView ? "metadata" : "none"}
                            onError={() => setVideoFailed(true)}
                            onLoadedMetadata={handleLoadedMetadata}
                            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500 ease-out"
                        >
                            <source src={resolvedVideo!} type={resolvedVideo!.endsWith(".webm") ? "video/webm" : resolvedVideo!.endsWith(".mov") ? "video/quicktime" : "video/mp4"} />
                        </video>
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#181412] to-[#0A0A0A] p-4 text-center select-none">
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-2 border border-white/15">
                                <Play className="w-4 h-4 text-[#D4A017] ml-0.5" />
                            </div>
                            <span className="font-sans text-xs text-white/80 font-bold tracking-wider uppercase truncate max-w-[90%]">
                                {title}
                            </span>
                            <span className="font-['DM_Mono'] text-[9px] text-[#D4A017] tracking-widest mt-1">
                                {badgeLabel}
                            </span>
                        </div>
                    )
                ) : (
                    /* 4. Dynamic Photo / Image Mode (When video unavailable/failed, but dynamic image exists) */
                    <img
                        src={resolvedImage!}
                        alt={title}
                        onError={() => setImageFailed(true)}
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500 ease-out"
                    />
                )}

                {/* Minimal Top Corner Broadcast Badges */}
                <div className="absolute top-2 left-2 right-2 flex items-center justify-between z-20 pointer-events-none">
                    {/* Live REC indicator */}
                    <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-2 py-0.5 rounded border border-white/10 opacity-80 group-hover:opacity-100 transition-opacity">
                        <span className={`w-1.5 h-1.5 rounded-full ${canShowVideo ? "bg-red-500" : "bg-[#D4A017]"} animate-pulse`} />
                        <span className="font-['DM_Mono'] text-[9px] text-white tracking-widest uppercase font-medium">
                            {canShowVideo ? badgeLabel : `${badgeLabel} // STILL`}
                        </span>
                    </div>

                    {/* Audio & Fullscreen Buttons */}
                    <div className="flex items-center gap-1 pointer-events-auto">
                        {canShowVideo && (
                            <button
                                type="button"
                                onClick={toggleMute}
                                title={isMuted ? "Click to unmute audio" : "Mute audio"}
                                className="p-1.5 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/15 backdrop-blur-md transition-all hover:scale-110 active:scale-95 cursor-pointer"
                            >
                                {isMuted ? (
                                    <VolumeX className="w-3.5 h-3.5 text-white/70" />
                                ) : (
                                    <Volume2 className="w-3.5 h-3.5 text-[#D4A017]" />
                                )}
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={openModal}
                            title="Fullscreen Cinema Player"
                            className="p-1.5 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/15 backdrop-blur-md transition-all hover:scale-110 active:scale-95 cursor-pointer"
                        >
                            <Maximize2 className="w-3.5 h-3.5 text-white/70" />
                        </button>
                    </div>
                </div>

                {/* Subtle Hover Play/Pause overlay for video */}
                {canShowVideo && (
                    <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                            type="button"
                            onClick={togglePlay}
                            className="pointer-events-auto p-3 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-white shadow-xl hover:scale-110 active:scale-95 transition-all cursor-pointer"
                        >
                            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                        </button>
                    </div>
                )}
            </div>

            {/* FULLSCREEN CINEMA MASTER MODAL VIA PORTAL TO BODY */}
            {isMounted && isModalOpen && typeof document !== "undefined" && createPortal(
                <div
                    className="fixed inset-0 z-[99990] bg-white/75 backdrop-blur-2xl flex items-center justify-center p-3 sm:p-6 select-none animate-fade-in"
                    onClick={() => closeModal()}
                >
                    <button
                        type="button"
                        onClick={() => closeModal()}
                        data-cursor="pointer"
                        className="absolute top-4 right-4 sm:top-6 sm:right-6 z-40 p-2.5 rounded-full bg-black/10 hover:bg-black/20 text-black/70 hover:text-black transition-all hover:scale-110 active:scale-95 cursor-pointer backdrop-blur-md border border-black/5"
                        aria-label="Close modal"
                        title="Close (Esc)"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div
                        className={`relative bg-black rounded-2xl overflow-hidden border border-black/10 shadow-[0_25px_80px_rgba(0,0,0,0.35)] flex flex-col transition-all duration-300 ${
                            videoMeta?.isPortrait
                                ? "w-full max-w-[420px] sm:max-w-[460px] max-h-[92vh]"
                                : "w-full max-w-4xl lg:max-w-5xl xl:max-w-6xl max-h-[92vh]"
                        }`}
                        style={{
                            aspectRatio: videoMeta
                                ? `${videoMeta.width} / ${videoMeta.height}`
                                : undefined,
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Cinema Header */}
                        <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between p-3.5 sm:p-4 bg-gradient-to-b from-black/95 via-black/60 to-transparent pointer-events-auto">
                            <div className="flex flex-col pr-3 min-w-0">
                                <span className="font-sans text-base sm:text-xl text-white font-bold leading-tight drop-shadow truncate">
                                    {title}
                                </span>
                                <span className="font-['DM_Mono'] text-[9px] sm:text-[10px] text-[#D4A017] tracking-widest uppercase mt-0.5 sm:mt-1 truncate">
                                    {canShowVideo
                                        ? (videoMeta
                                            ? `${videoMeta.width}×${videoMeta.height} • ${videoMeta.ratioString} • ${badgeLabel || "24 FPS"}`
                                            : `${badgeLabel || "CINEMA MASTER"} • 24 FPS`)
                                        : `${badgeLabel || "CINEMA STILL"} • PHOTOGRAPHY`}
                                </span>
                            </div>

                            <button
                                type="button"
                                onClick={() => closeModal()}
                                data-cursor="pointer"
                                className="p-1.5 sm:p-2 rounded-full bg-white/10 hover:bg-white/25 text-white transition-all hover:scale-105 active:scale-95 shrink-0 cursor-pointer"
                                aria-label="Close modal"
                            >
                                <X className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                        </div>

                        {/* Modal Media Player / Viewer */}
                        <div className="relative flex-1 w-full h-full bg-black flex items-center justify-center overflow-hidden">
                            {canShowVideo ? (
                                <video
                                    ref={modalVideoRef}
                                    autoPlay
                                    loop
                                    controls
                                    playsInline
                                    preload="metadata"
                                    onLoadedMetadata={handleLoadedMetadata}
                                    className="w-full h-full object-contain"
                                >
                                    <source src={resolvedVideo!} type={resolvedVideo!.endsWith(".webm") ? "video/webm" : resolvedVideo!.endsWith(".mov") ? "video/quicktime" : "video/mp4"} />
                                </video>
                            ) : (
                                <img
                                    src={resolvedImage!}
                                    alt={title}
                                    className="w-full h-full object-contain"
                                />
                            )}
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
};
