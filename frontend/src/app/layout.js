import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "https://anuprawat.com"
).replace(/\/+$/, "");

export const metadata = {
    metadataBase: new URL(siteUrl),
    title: {
        default: "Anup Rawat | Cinematographer & Director of Photography",
        template: "%s | Anup Rawat",
    },
    description: "Official portfolio of Anup Rawat — Contemporary Cinematographer & Director of Photography specializing in feature films, commercials, and visual storytelling.",
    keywords: [
        "Anup Rawat",
        "Cinematographer",
        "Director of Photography",
        "DP Portfolio",
        "Film Lighting",
        "Camera Operator",
        "Visual Storyteller",
    ],
    authors: [{ name: "Anup Rawat", url: siteUrl }],
    creator: "Anup Rawat",
    icons: {
        icon: [
            { url: "/favicon.ico" },
            { url: "/favicon.webp", type: "image/webp" },
            { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
            { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
        ],
        apple: [
            { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
        ],
    },
    manifest: "/manifest.json",
};

import CustomCursor from "@/components/CustomCursor/CustomCursor";
import BottomNav from "@/components/BottomNav/BottomNav";
import SmoothScroll from "@/components/SmoothScroll";
import { AuthProvider } from "@/context/AuthContext";
import ChatAssistant from "@/components/chat-assistant/ChatAssistant";
import ConnectionProvider from "@/components/global/ConnectionProvider";
import { CookieConsentProvider } from "@/context/CookieConsentContext";
import CookieConsentBanner from "@/components/legal/CookieConsentBanner";

export default function RootLayout({ children }) {
    return (
        <html
            lang="en"
            className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
        >
            <head>
                <link rel="icon" href="/favicon.ico" sizes="any" />
                <link rel="icon" href="/favicon.webp" type="image/webp" />
                <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link
                    rel="preconnect"
                    href="https://fonts.gstatic.com"
                    crossOrigin="anonymous" />
                <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=Jost:wght@400;500;600&display=swap"
                />
                <link
                    href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Jost:wght@400;500;600&family=Montserrat:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,600&family=Bebas+Neue&family=Caveat:wght@400;600;700&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,400&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Dr+Sugiyama&family=Gloria+Hallelujah&family=Homemade+Apple&family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&family=Kalam:wght@400;700&family=Kaushan+Script&family=Patrick+Hand&family=Permanent+Marker&family=Plus+Jakarta+Sans:wght@400;600;800;900&family=Rock+Salt&family=Schoolbell&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body className="min-h-full flex flex-col font-sans">
                <CookieConsentProvider>
                    <AuthProvider>
                        <ConnectionProvider>
                            <SmoothScroll>{children}</SmoothScroll>
                            <CustomCursor />
                            <BottomNav />
                            <ChatAssistant />
                            <CookieConsentBanner />
                        </ConnectionProvider>
                    </AuthProvider>
                </CookieConsentProvider>
            </body>
        </html>
    );
}
