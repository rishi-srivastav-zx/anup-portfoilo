"use client";

import React, { useState } from "react";
import { X, Film, Check, Plus, Camera } from "lucide-react";

export default function QuickCreateModal({ isOpen, onClose, onAddProject }) {
    const [title, setTitle] = useState("");
    const [director, setDirector] = useState("");
    const [category, setCategory] = useState("Narrative Feature");
    const [cameraPackage, setCameraPackage] = useState("ARRI Alexa Mini LF");
    const [aspectRatio, setAspectRatio] = useState("2.39:1 Anamorphic");
    const [status, setStatus] = useState("In Production");
    const [submitted, setSubmitted] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim()) return;

        const newProject = {
            id: `proj-${Date.now()}`,
            title,
            director: director || "Independent Studio",
            category,
            camera: cameraPackage,
            ratio: aspectRatio,
            status,
            date: "Just Now",
            thumbnail: "/images/polaroid_sunset.jpg",
        };

        if (onAddProject) {
            onAddProject(newProject);
        }

        setSubmitted(true);
        setTimeout(() => {
            setSubmitted(false);
            setTitle("");
            setDirector("");
            onClose();
        }, 800);
    };

    return (
        <div
            className="fixed inset-0 z-50 bg-[#14100E]/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="w-full max-w-lg bg-[#F4EDE4] border border-[#D6CDC2] rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-5 py-4 border-b border-[#D6CDC2] bg-[#EAE2D7] flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-0.5">
                            <Camera className="w-3.5 h-3.5 text-[#14100E]" />
                            <span className="font-mono text-[9px] uppercase tracking-widest text-[#6B625A]">
                                PRODUCTION SLATE
                            </span>
                        </div>
                        <h2 className="font-sans font-bold text-base text-[#14100E]">
                            Register New Production
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-[#6B625A] hover:text-[#14100E] p-1.5 rounded-md hover:bg-black/5"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {submitted ? (
                    <div className="p-10 text-center space-y-2">
                        <div className="w-10 h-10 rounded-full bg-[#14100E] text-[#F4EDE4] mx-auto flex items-center justify-center">
                            <Check className="w-5 h-5" />
                        </div>
                        <h3 className="font-sans font-bold text-sm text-[#14100E]">
                            Production Slated Successfully
                        </h3>
                        <p className="text-xs text-[#6B625A] font-mono">
                            Added to cinematography dashboard index.
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs font-sans overflow-y-auto max-h-[calc(90vh-80px)]">
                        <div>
                            <label className="block text-[#4A423B] font-mono uppercase text-[10px] tracking-wider mb-1">
                                Film / Project Title *
                            </label>
                            <input
                                type="text"
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. Whispers of the Ghats"
                                className="w-full bg-[#EAE2D7]/70 border border-[#D6CDC2] rounded-lg px-3 py-2 text-[#14100E] placeholder-[#8C8278] outline-none focus:border-[#14100E]"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[#4A423B] font-mono uppercase text-[10px] tracking-wider mb-1">
                                    Director / Production House
                                </label>
                                <input
                                    type="text"
                                    value={director}
                                    onChange={(e) => setDirector(e.target.value)}
                                    placeholder="e.g. Dharma Ent. / Independent"
                                    className="w-full bg-[#EAE2D7]/70 border border-[#D6CDC2] rounded-lg px-3 py-2 text-[#14100E] placeholder-[#8C8278] outline-none focus:border-[#14100E]"
                                />
                            </div>

                            <div>
                                <label className="block text-[#4A423B] font-mono uppercase text-[10px] tracking-wider mb-1">
                                    Genre / Category
                                </label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full bg-[#EAE2D7]/70 border border-[#D6CDC2] rounded-lg px-3 py-2 text-[#14100E] outline-none focus:border-[#14100E]"
                                >
                                    <option>Narrative Feature</option>
                                    <option>Documentary</option>
                                    <option>Commercial</option>
                                    <option>Music Video</option>
                                    <option>Experimental / Short</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                                <label className="block text-[#4A423B] font-mono uppercase text-[10px] tracking-wider mb-1">
                                    Camera Package
                                </label>
                                <select
                                    value={cameraPackage}
                                    onChange={(e) => setCameraPackage(e.target.value)}
                                    className="w-full bg-[#EAE2D7]/70 border border-[#D6CDC2] rounded-lg px-2 py-2 text-[#14100E] outline-none focus:border-[#14100E]"
                                >
                                    <option>ARRI Alexa Mini LF</option>
                                    <option>ARRI 35</option>
                                    <option>RED V-Raptor 8K</option>
                                    <option>Sony Venice 2</option>
                                    <option>16mm Film (Arriflex)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-[#4A423B] font-mono uppercase text-[10px] tracking-wider mb-1">
                                    Aspect Ratio
                                </label>
                                <select
                                    value={aspectRatio}
                                    onChange={(e) => setAspectRatio(e.target.value)}
                                    className="w-full bg-[#EAE2D7]/70 border border-[#D6CDC2] rounded-lg px-2 py-2 text-[#14100E] outline-none focus:border-[#14100E]"
                                >
                                    <option>2.39:1 Anamorphic</option>
                                    <option>1.85:1 Flat</option>
                                    <option>1.33:1 Academy</option>
                                    <option>16:9 Standard</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-[#4A423B] font-mono uppercase text-[10px] tracking-wider mb-1">
                                    Slate Status
                                </label>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="w-full bg-[#EAE2D7]/70 border border-[#D6CDC2] rounded-lg px-2 py-2 text-[#14100E] outline-none focus:border-[#14100E]"
                                >
                                    <option>In Pre-Production</option>
                                    <option>In Production</option>
                                    <option>In Post-Production</option>
                                    <option>Color Grading</option>
                                    <option>Premiered</option>
                                </select>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-3 border-t border-[#D6CDC2] flex items-center justify-end gap-2.5">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 rounded-lg border border-[#D6CDC2] text-[#6B625A] hover:bg-black/5 uppercase font-mono text-[11px]"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-5 py-2 rounded-lg bg-[#14100E] hover:bg-[#2A2420] text-[#F4EDE4] font-medium font-sans uppercase text-[11px] tracking-wider flex items-center gap-1.5 transition-colors shadow-sm"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                Add Project
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
