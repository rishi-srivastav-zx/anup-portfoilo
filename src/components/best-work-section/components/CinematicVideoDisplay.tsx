"use client";

import React, { useRef, useState, useEffect } from "react";
import { Volume2, VolumeX, Maximize2, Play, Pause, X } from "lucide-react";

interface CinematicVideoDisplayProps {
    title: string;
    videoWebm?: string;
    videoMov?: string;
    badgeLabel?: string;
    className?: string;
}

export const CinematicVideoDisplay: React.FC<CinematicVideoDisplayProps> = ({
    title,
    videoWebm,
    videoMov,
    badgeLabel = "24 FPS",
    className = "",
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const modalVideoRef = useRef<HTMLVideoElement>(null);

    const [isMuted, setIsMuted] = useState(true);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const togglePlay = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!videoRef.current) return;
        if (videoRef.current.paused) {
            videoRef.current.play();
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
        setIsModalOpen(true);
    };

    const closeModal = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setIsModalOpen(false);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isModalOpen) {
                closeModal();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isModalOpen]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    if (isPlaying) {
                        video.play().catch(() => {});
                    }
                } else {
                    video.pause();
                }
            },
            { rootMargin: "300px 0px" }
        );

        observer.observe(video);
        return () => observer.disconnect();
    }, [isPlaying]);

    if (!videoWebm && !videoMov) {
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
                    src={videoWebm || videoMov}
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500 ease-out"
                >
                    {videoWebm && <source src={videoWebm} type="video/webm" />}
                    {videoWebm && <source src={videoWebm} type="video/mp4" />}
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
                            className="p-1.5 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/15 backdrop-blur-md transition-all hover:scale-110 active:scale-95"
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
                            className="p-1.5 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/15 backdrop-blur-md transition-all hover:scale-110 active:scale-95"
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
                        className="pointer-events-auto p-3 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-white shadow-xl hover:scale-110 active:scale-95 transition-all"
                    >
                        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                    </button>
                </div>
            </div>

            {/* FULLSCREEN CINEMA MASTER MODAL */}
            {isModalOpen && (
                <div
                    className="fixed inset-0 z-[99999] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-3 sm:p-6 animate-fade-in select-none"
                    onClick={() => closeModal()}
                >
                    <div
                        className="relative w-full max-w-md max-h-[92vh] aspect-[9/16] bg-black rounded-2xl overflow-hidden border border-white/20 shadow-[0_25px_70px_rgba(0,0,0,1)] flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Cinema Header */}
                        <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black/90 to-transparent">
                            <div className="flex flex-col">
                                <span className="font-sans text-xl text-white font-bold leading-none drop-shadow">
                                    {title}
                                </span>
                                <span className="font-['DM_Mono'] text-[10px] text-[#D4A017] tracking-widest uppercase mt-1">
                                    1080×1920 • VP9 MASTER • 24 FPS
                                </span>
                            </div>

                            <button
                                type="button"
                                onClick={() => closeModal()}
                                className="p-2 rounded-full bg-white/10 hover:bg-white/25 text-white transition-all hover:scale-105 active:scale-95"
                                aria-label="Close"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Video Player with Native HTML5 Controls */}
                        <div className="relative flex-1 w-full h-full bg-black flex items-center justify-center">
                            <video
                                ref={modalVideoRef}
                                autoPlay
                                loop
                                controls
                                playsInline
                                src={videoWebm || videoMov}
                                className="w-full h-full object-contain"
                            >
                                {videoWebm && <source src={videoWebm} type="video/webm" />}
                                {videoWebm && <source src={videoWebm} type="video/mp4" />}
                                {videoMov && <source src={videoMov} type="video/quicktime" />}
                            </video>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
