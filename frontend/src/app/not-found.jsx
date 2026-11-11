import React from "react";
import NotFoundContent from "@/components/not-found/NotFoundContent";

export const metadata = {
    title: "404 — Lost Frame | Anup Rawat Cinematographer",
    description: "The scene you're looking for isn't in this cut. Return to the cinematic portfolio of Anup Rawat.",
    robots: {
        index: false,
        follow: false,
    },
};

export default function NotFound() {
    return <NotFoundContent />;
}
