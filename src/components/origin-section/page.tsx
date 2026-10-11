"use client";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Navbar } from "./components/Navbar";
import { HeroSection } from "./components/HeroSection";
import { OriginSection } from "./components/OriginSection";
import { WorksSection } from "./components/WorksSection";
import { Footer } from "./components/Footer";

export default function App() {
    return (
        <div className="relative min-h-screen bg-[#010204] text-[#F4EFE6] selection:bg-[#012CEB] selection:text-white">
            {/* Top Navigation */}
            <Navbar />

            {/* Main Experience */}
            <main>
                {/* 1. Hero / Home Section */}
                <HeroSection />

                {/* 2. 01 — ORIGIN / THE BEGINNING (Scroll-driven 3D Storytelling Experience) */}
                <OriginSection />

                {/* 3. 02 — Selected Works / Systems Architecture */}
                <WorksSection />
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
}
