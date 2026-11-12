"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Volume2, VolumeX, Maximize2, Play, Pause, X } from "lucide-react";

interface CinematicVideoDisplayProps {
    title: string;
    videoMp4?: string;
    videoWebm?: string;
    videoMov?: string;
    badgeLabel?: string;
    className?: string;
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
    videoMp4,
    videoWebm,
    videoMov,
    badgeLabel = "24 FPS",
    className = "",
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const modalVideoRef = useRef<HTMLVideoElement>(null);

    const [isMuted, setIsMuted] = useState(true);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [isInView, setIsInView] = useState(false);
    const [videoMeta, setVideoMeta] = useState<VideoMeta | null>(null);

    // Resolve MP4 path with automatic fallback if not explicitly provided
    const resolvedMp4 = videoMp4 || (videoMov ? videoMov.replace(/\.mov$/i, ".mp4") : undefined);

    useEffect(() => {
        setIsMounted(true);
    }, []);

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
        if (modalVideoRef.current && videoRef.current) {
            videoRef.current.currentTime = modalVideoRef.current.currentTime;
            if (isPlaying && isInView) {
                const p = videoRef.current.play();
                if (p !== undefined) {
                    p.catch(() => {});
                }
            }
        }
        setIsModalOpen(false);
    };

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

    // Intersection observer for container visibility to prevent loading off-screen videos
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                const intersecting = entry.isIntersecting && entry.intersectionRatio >= 0.25;
                setIsInView(intersecting);

                const video = videoRef.current;
                if (!video) return;

                if (intersecting && isPlaying) {
                    const p = video.play();
                    if (p !== undefined) {
                        p.catch((err) => {
                            if (err?.name !== "AbortError") {
                                // Silently ignore autoplay rejections
                            }
                        });
                    }
                } else if (!intersecting) {
                    video.pause();
                }
            },
            { threshold: [0, 0.25, 0.5] }
        );

        observer.observe(container);
        return () => observer.disconnect();
    }, [isPlaying]);

    // Handle tab visibility to stop decoder when backgrounded
    useEffect(() => {
        const handleVisibilityChange = () => {
            const video = videoRef.current;
            if (!video) return;

            if (document.hidden) {
                video.pause();
            } else if (isInView && isPlaying) {
                const p = video.play();
                if (p !== undefined) {
                    p.catch(() => {});
                }
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
    }, [isInView, isPlaying]);

    if (!resolvedMp4 && !videoWebm && !videoMov) {
        return (
            <div className={`w-full h-full flex items-center justify-center bg-[#14100E] ${className}`}>
                <h3 className="font-sans text-[32px] md:text-[50px] text-white/90 text-center">
                    {title}
                </h3>
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
                {/* 100% Pure, Crisp Video with Zero Dimming & Zero Scanlines */}
                <video
                    ref={videoRef}
                    autoPlay
                    loop
                    muted={isMuted}
                    playsInline
                    preload={isInView ? "metadata" : "none"}
                    onLoadedMetadata={handleLoadedMetadata}
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500 ease-out"
                >
                    {resolvedMp4 && <source src={resolvedMp4} type="video/mp4" />}
                    {videoWebm && <source src={videoWebm} type="video/webm" />}
                    {videoMov && <source src={videoMov} type="video/quicktime" />}
                </video>

                {/* Minimal Top Corner Broadcast Badges (Non-intrusive) */}
                <div className="absolute top-2 left-2 right-2 flex items-center justify-between z-20 pointer-events-none">
                    {/* Live REC indicator */}
                    <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-2 py-0.5 rounded border border-white/10 opacity-80 group-hover:opacity-100 transition-opacity">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        <span className="font-['DM_Mono'] text-[9px] text-white tracking-widest uppercase font-medium">
                            {badgeLabel}
                        </span>
                    </div>

                    {/* Minimal Audio & Fullscreen Buttons */}
                    <div className="flex items-center gap-1 pointer-events-auto">
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

                {/* Subtle Hover Play/Pause overlay */}
                <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                        type="button"
                        onClick={togglePlay}
                        className="pointer-events-auto p-3 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-white shadow-xl hover:scale-110 active:scale-95 transition-all cursor-pointer"
                    >
                        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                    </button>
                </div>
            </div>

            {/* FULLSCREEN CINEMA MASTER MODAL VIA PORTAL TO BODY (White blur backdrop) */}
            {isMounted && isModalOpen && typeof document !== "undefined" && createPortal(
                <div
                    className="fixed inset-0 z-[99990] bg-white/75 backdrop-blur-2xl flex items-center justify-center p-3 sm:p-6 select-none animate-fade-in"
                    onClick={() => closeModal()}
                >
                    {/* Top Right Quick Close Button on White Backdrop */}
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
                                    {videoMeta
                                        ? `${videoMeta.width}×${videoMeta.height} • ${videoMeta.ratioString} • ${badgeLabel || "24 FPS"}`
                                        : `${badgeLabel || "CINEMA MASTER"} • 24 FPS`}
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

                        {/* Modal Video Player with Native HTML5 Controls */}
                        <div className="relative flex-1 w-full h-full bg-black flex items-center justify-center overflow-hidden">
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
                                {resolvedMp4 && <source src={resolvedMp4} type="video/mp4" />}
                                {videoWebm && <source src={videoWebm} type="video/webm" />}
                                {videoMov && <source src={videoMov} type="video/quicktime" />}
                            </video>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
};
