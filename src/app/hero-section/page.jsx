"use client";

import React from "react";
import { HeroProvider } from "./provider/HeroProvider";
import { heroConfig } from "./config/hero.config";
import Navbar from "./components/Navbar";
import Background from "./components/Background";
import HeroText from "./components/HeroText";
import Portrait from "./components/Portrait";
import DetailsLeft from "./components/DetailsLeft";
import DetailsRight from "./components/DetailsRight";
import ScrollHint from "@/components/ScrollHint/ScrollHint";

export default function HeroSection() {
    return (
        <HeroProvider config={heroConfig}>
            <section
                id="home"
                className="w-full h-[100svh] bg-[#E6DDD2] selection:bg-[#14100E] selection:text-[#F4EDE4] font-sans overflow-x-clip overflow-y-visible relative grid z-10"
                style={{
                    color: heroConfig.colors.text,
                    gridTemplateRows: "auto 1fr",
                    gridTemplateAreas: '"nav" "hero"',
                }}
            >
                <Background />

                <div
                    style={{ gridArea: "nav" }}
                    className="relative z-50 h-[68px] sm:h-[76px] w-full"
                >
                    <Navbar />
                </div>

                <div
                    style={{ gridArea: "hero" }}
                    className="relative w-full h-full flex flex-col justify-end pb-6 sm:pb-12 px-6 md:px-12 pointer-events-none"
                >
                    <HeroText />
                    <Portrait />

                    <DetailsLeft />
                    <DetailsRight />
                    <ScrollHint />
                </div>
            </section>
        </HeroProvider>
    );
}
