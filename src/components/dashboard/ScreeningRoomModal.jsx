"use client";

import React, { useState } from "react";
import { X, Play, Pause, Volume2, Maximize2, Sliders, Film } from "lucide-react";

export default function ScreeningRoomModal({ isOpen, onClose, project }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [activeLut, setActiveLut] = useState("Kodak 5219 Vision3");
    const [aspectRatio, setAspectRatio] = useState("2.39:1");

    if (!isOpen) return null;

    const currentProject = project || {
        title: "The Last Monologue",
        director: "Karan Malhotra",
        camera: "ARRI Alexa Mini LF",
        lens: "Cooke Anamorphic /i Full Frame Plus",
        colorSpace: "ARRI Wide Gamut / LogC4",
        fps: "24.000",
        shutter: "180.0° (1/48s)",
    };

    return (
        <div
            className="fixed inset-0 z-50 bg-[#14100E]/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
            onClick={onClose}
        >
            <div
                className="w-full max-w-4xl bg-[#14100E] border border-[#3E3832] rounded-2xl shadow-2xl overflow-hidden text-[#E6DDD2] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Top Viewfinder Bar */}
                <div className="px-5 py-3 border-b border-[#2C2723] flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1.5 text-red-500 font-semibold">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            LIVE SCREENING
                        </span>
                        <span className="text-[#8C8278] hidden sm:inline">|</span>
                        <span className="text-[#A3988E] hidden sm:inline">
                            TC 01:24:08:16
                        </span>
                        <span className="text-[#8C8278] hidden sm:inline">|</span>
                        <span className="text-[#A3988E] font-sans font-medium">
                            {currentProject.title}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-[10px] bg-[#2A2420] text-[#D6CDC2] px-2 py-0.5 rounded border border-[#3E3832]">
                            PRORES 4444 XQ
                        </span>
                        <button
                            onClick={onClose}
                            className="p-1 rounded-md text-[#8C8278] hover:text-white hover:bg-white/10 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Viewfinder Video Frame Area */}
                <div className="relative bg-[#0A0807] aspect-video w-full flex items-center justify-center overflow-hidden group">
                    {/* Viewfinder crosshairs and framing overlay */}
                    <div className="absolute inset-4 sm:inset-8 border border-white/15 pointer-events-none flex flex-col justify-between">
                        <div className="flex justify-between p-2 text-[9px] font-mono text-white/40">
                            <span>┌ [ {aspectRatio} ]</span>
                            <span>SHUTTER: {currentProject.shutter || "1/48"} ┐</span>
                        </div>
                        <div className="flex items-center justify-center text-white/20 text-lg">
                            +
                        </div>
                        <div className="flex justify-between p-2 text-[9px] font-mono text-white/40">
                            <span>└ ISO 800 • 3200K</span>
                            <span>FPS: {currentProject.fps || "24.00"} ┘</span>
                        </div>
                    </div>

                    {/* Simulated Cinema Frame */}
                    <div
                        className="w-full h-full bg-cover bg-center transition-all duration-300"
                        style={{
                            backgroundImage: `url(${
                                currentProject.thumbnail ||
                                "/images/Cinematic Filmmaking Storyboard Workspace.png"
                            })`,
                            filter:
                                activeLut === "Monochrome Noir"
                                    ? "grayscale(100%) contrast(120%)"
                                    : activeLut === "Teal & Amber"
                                    ? "sepia(25%) hue-rotate(170deg) saturate(130%)"
                                    : "none",
                        }}
                    />

                    {/* Center Play Button Overlay */}
                    <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="absolute w-16 h-16 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:scale-105 transition-all shadow-xl group-hover:bg-black/80"
                    >
                        {isPlaying ? (
                            <Pause className="w-6 h-6" />
                        ) : (
                            <Play className="w-6 h-6 ml-1" />
                        )}
                    </button>
                </div>

                {/* Bottom Control Deck */}
                <div className="p-4 sm:p-5 border-t border-[#2C2723] bg-[#171310] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="text-xs font-mono text-[#8C8278]">
                            CAMERA:{" "}
                            <span className="text-[#E6DDD2]">
                                {currentProject.camera}
                            </span>{" "}
                            &bull; LENS:{" "}
                            <span className="text-[#E6DDD2]">
                                {currentProject.lens}
                            </span>
                        </div>
                        <div className="text-[11px] text-[#A3988E]">
                            Client Review Stream: High-bitrate 10-bit Log Preview
                        </div>
                    </div>

                    {/* LUT Selector */}
                    <div className="flex items-center gap-2">
                        <Sliders className="w-3.5 h-3.5 text-[#8C8278]" />
                        <span className="text-[10px] font-mono uppercase text-[#8C8278]">
                            EMULATION:
                        </span>
                        <div className="flex items-center gap-1.5 bg-[#2A2420] p-1 rounded-lg border border-[#3E3832]">
                            {[
                                "Kodak 5219 Vision3",
                                "Teal & Amber",
                                "Monochrome Noir",
                            ].map((lut) => (
                                <button
                                    key={lut}
                                    onClick={() => setActiveLut(lut)}
                                    className={`px-2 py-1 rounded text-[10px] font-mono transition-colors ${
                                        activeLut === lut
                                            ? "bg-[#E6DDD2] text-[#14100E] font-semibold"
                                            : "text-[#8C8278] hover:text-[#E6DDD2]"
                                    }`}
                                >
                                    {lut.split(" ")[0]}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
