import HeroSection from "./hero-section/page";
import { OriginSection } from "@/components/origin-section/components/OriginSection";
import MyImagesSection from "@/components/my-images-section";
import BestWorkSection from "@/components/best-work-section";
import ContactFooterSection from "@/components/footer-section/App";

const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "https://anuprawat.com"
).replace(/\/+$/, "");

export const metadata = {
    title: "Anup Rawat | Cinematographer & Director of Photography",
    description:
        "Official portfolio of Anup Rawat — Contemporary Cinematographer & Director of Photography specializing in feature and visual storytelling.",
    keywords: [
  "Anup Rawat",
  "Anup Rawat Cinematographer",
  "Anup Rawat Photographer",
  "Cinematographer in Dehradun",
  "Cinematographer in Rishikesh",
  "Photographer in Dehradun",
  "Photographer in Rishikesh",
  "Videographer in Dehradun",
  "Videographer in Rishikesh",
  "Professional Photographer in Uttarakhand",
  "Professional Videographer in Uttarakhand",
  "Photography Services in Dehradun",
  "Photography Services in Rishikesh",
  "Videography Services in Dehradun",
  "Videography Services in Rishikesh",
  "Photoshoot in Dehradun",
  "Photoshoot in Rishikesh",
  "Video Shoot in Dehradun",
  "Video Shoot in Rishikesh",
  "Commercial Photographer in Dehradun",
  "Commercial Photographer in Rishikesh",
  "Commercial Videographer in Dehradun",
  "Commercial Videographer in Rishikesh",
  "Commercial Cinematographer",
  "Commercial Video Production",
  "Brand Film Production",
  "Product Photographer in Dehradun",
  "Product Photographer in Rishikesh",
  "Product Photography",
  "Product Video Shoot",
  "Fashion Photographer in Dehradun",
  "Fashion Photographer in Rishikesh",
  "Fashion Videographer",
  "Model Photoshoot in Dehradun",
  "Portrait Photographer",
  "Outdoor Photoshoot in Dehradun",
  "Outdoor Photoshoot in Rishikesh",
  "Pre Wedding Photographer in Dehradun",
  "Pre Wedding Photographer in Rishikesh",
  "Cinematic Pre Wedding Shoot",
  "Wedding Videographer",
  "Couple Photoshoot in Dehradun",
  "Couple Photoshoot in Rishikesh",
  "Music Video Cinematographer",
  "Short Film Cinematographer",
  "Director of Photography",
  "Director of Photography in India",
  "Cinematography Services",
  "Narrative Film Cinematography",
  "Anamorphic Cinematography",
  "ARRI Alexa Mini LF",
  "Film Lighting Design",
  "Visual Storyteller",
  "Cinematic Video Production",
  "Photography and Videography Services in Uttarakhand",
  "Professional Film Production in Uttarakhand"
],
    authors: [{ name: "Anup Rawat", url: siteUrl }],
    creator: "Anup Rawat",
    publisher: "Anup Rawat",
    alternates: {
        canonical: siteUrl,
    },
    openGraph: {
        title: "Anup Rawat | Cinematographer & Director of Photography",
        description:
            "Official portfolio of Anup Rawat — Contemporary Cinematographer & Director of Photography specializing in feature films, commercials, and visual storytelling.",
        url: siteUrl,
        siteName: "Anup Rawat Cinematography",
        type: "profile",
        locale: "en_US",
        images: [
            {
                url: `${siteUrl}/images/anup_portrait.png`,
                width: 1200,
                height: 630,
                alt: "Anup Rawat — Cinematographer & Director of Photography",
            },
            {
                url: `${siteUrl}/images/ar-logo.png`,
                width: 1024,
                height: 682,
                alt: "Anup Rawat Logo",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Anup Rawat | Cinematographer & Director of Photography",
        description:
            "Contemporary Cinematographer specializing in feature films, commercials, and visual storytelling.",
        images: [`${siteUrl}/images/anup_portrait.png`],
        creator: "@anuprawat",
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
};

export default function Home() {
    // Structured Data (JSON-LD) for Person & ProfessionalService Schema
    const jsonLd = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Person",
                "@id": `${siteUrl}/#person`,
                name: "Anup Rawat",
                jobTitle: "Cinematographer & Director of Photography",
                description:
                    "Contemporary Cinematographer & Director of Photography specializing in feature films, commercials, and visual storytelling.",
                url: siteUrl,
                image: `${siteUrl}/images/anup_portrait.png`,
                sameAs: [
                    "https://instagram.com",
                    "https://vimeo.com",
                    "https://imdb.com",
                ],
                knowsAbout: [
                    "Cinematography",
                    "Lighting Architecture",
                    "Camera Choreography",
                    "Anamorphic Optics",
                    "Color Grading & ACES",
                    "Digital Cinema Cameras",
                ],
            },
            {
                "@type": "ProfessionalService",
                "@id": `${siteUrl}/#service`,
                name: "Anup Rawat Cinematography",
                description:
                    "Cinematography and Director of Photography services for feature films, commercials, documentaries, and music videos.",
                url: siteUrl,
                logo: `${siteUrl}/images/ar-logo.png`,
                image: `${siteUrl}/images/anup_portrait.png`,
                priceRange: "$$$$",
                address: {
                    "@type": "PostalAddress",
                    addressCountry: "IN",
                },
            },
            {
                "@type": "WebSite",
                "@id": `${siteUrl}/#website`,
                url: siteUrl,
                name: "Anup Rawat | Cinematographer",
                publisher: {
                    "@id": `${siteUrl}/#person`,
                },
            },
        ],
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <main className="flex flex-col">
                <HeroSection />
                <section id="about" aria-label="About Anup Rawat">
                    <OriginSection />
                </section>
                <section id="visuals" aria-label="Visual Gallery">
                    <MyImagesSection />
                </section>
                <section id="work" aria-label="Featured Cinematography Work">
                    <BestWorkSection />
                </section>
                <ContactFooterSection />
            </main>
        </>
    );
}
