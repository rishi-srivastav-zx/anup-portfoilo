export interface SketchbookPage {
    id: string;
    file: string; // Filename in public folder or full data URL / remote URL
    title: string;
    place: string;
    description?: string;
    date?: string;
    thumbnailUrl?: string;
    isCustom?: boolean;
}

export interface SketchbookTypography {
    headingFont: string;
    bodyFont: string;
    headingWeight: string;
    bodyWeight: string;
    primaryColor: string;
    headingSize: number;
    bodySize: number;
    headingLetterSpacing: number;
}

export interface SketchbookMetadata {
    title: string;
    author: string;
    subtitle: string;
    edition: string;
    year: string;
    location: string;
    introText: string;
}

export interface ColorPalette {
    id: string;
    name: string;
    color: string;
    paperColor: string;
    accent: string;
    description: string;
}

export interface FontOption {
    id: string;
    name: string;
    category: "Serif" | "Display" | "Sans" | "Monospace";
}

/**
 * All default dynamic fields for Meng To — Singapore Sketchbook
 */
export const DEFAULT_SKETCHBOOK_TYPOGRAPHY: SketchbookTypography = {
    headingFont: "instrument-serif",
    bodyFont: "newsreader",
    headingWeight: "400",
    bodyWeight: "400",
    primaryColor: "#2b2721",
    headingSize: 30,
    bodySize: 20,
    headingLetterSpacing: 0.01,
};

export const DEFAULT_SKETCHBOOK_METADATA: SketchbookMetadata = {
    title: "Singapore Sketchbook",
    author: "Meng To",
    subtitle: "An illustrated visual chronicle across the Lion City",
    edition: "First Edition",
    year: "2026",
    location: "Singapore, SG",
    introText:
        "Nine original plates depicting heritage shophouses, botanical sanctuaries, riverside quays, and the futuristic skyline of Singapore.",
};

export const INITIAL_SKETCHBOOK_PAGES: SketchbookPage[] = [
    {
        id: "plate-1",
        file: "marina-bay-sands.png",
        title: "Marina Bay Sands",
        place: "Bayfront",
        description:
            "Iconic curved towers crowned with the sky park floating above the bay water.",
        thumbnailUrl: "/landing-pages/meng-to-sketchbook/marina-bay-sands.png",
    },
    {
        id: "plate-2",
        file: "gardens-by-the-bay.png",
        title: "Gardens by the Bay",
        place: "Supertree Grove",
        description:
            "Living vertical garden supertrees draped in ferns, orchids, and tropical bromeliads.",
        thumbnailUrl:
            "/landing-pages/meng-to-sketchbook/gardens-by-the-bay.png",
    },
    {
        id: "plate-3",
        file: "merlion.png",
        title: "The Merlion",
        place: "Merlion Park",
        description:
            "Mythical guardian of the Lion City looking out across the sparkling marina basin.",
        thumbnailUrl: "/landing-pages/meng-to-sketchbook/merlion.png",
    },
    {
        id: "plate-4",
        file: "buddha-tooth.png",
        title: "Buddha Tooth Relic Temple",
        place: "Chinatown",
        description:
            "Tang dynasty architecture rendered in sacred red and gold lacquer on South Bridge Road.",
        thumbnailUrl: "/landing-pages/meng-to-sketchbook/buddha-tooth.png",
    },
    {
        id: "plate-5",
        file: "joo-chiat.png",
        title: "Joo Chiat Shophouses",
        place: "Katong",
        description:
            "Pastel Peranakan ceramic tile details and carved timber shutters along Koon Seng Road.",
        thumbnailUrl: "/landing-pages/meng-to-sketchbook/joo-chiat.png",
    },
    {
        id: "plate-6",
        file: "lau-pa-sat.png",
        title: "Lau Pa Sat",
        place: "Raffles Quay",
        description:
            "Victorian cast-iron octagonal market bustling with sizzling satay smoke at dusk.",
        thumbnailUrl: "/landing-pages/meng-to-sketchbook/lau-pa-sat.png",
    },
    {
        id: "plate-7",
        file: "marina-bay-skyline.png",
        title: "Marina Bay Skyline",
        place: "The Bay",
        description:
            "Financial skyscrapers reflecting deep cobalt hues and dusk illumination onto the water.",
        thumbnailUrl:
            "/landing-pages/meng-to-sketchbook/marina-bay-skyline.png",
    },
    {
        id: "plate-8",
        file: "singapore-river.png",
        title: "Singapore River",
        place: "Boat Quay",
        description:
            "Historic merchant bumboats moored along riverside shophouse bistros.",
        thumbnailUrl: "/landing-pages/meng-to-sketchbook/singapore-river.png",
    },
    {
        id: "plate-9",
        file: "botanic-gardens.png",
        title: "Botanic Gardens",
        place: "Tanglin",
        description:
            "UNESCO World Heritage tropical rainforest sanctuary, ancient trees, and swan lake.",
        thumbnailUrl: "/landing-pages/meng-to-sketchbook/botanic-gardens.png",
    },
];

export const FONT_OPTIONS: FontOption[] = [
    { id: "instrument-serif", name: "Instrument Serif", category: "Display" },
    { id: "newsreader", name: "Newsreader", category: "Serif" },
    { id: "Georgia", name: "Georgia", category: "Serif" },
    { id: "Times New Roman", name: "Times New Roman", category: "Serif" },
    { id: "system-ui", name: "System Sans", category: "Sans" },
    { id: "monospace", name: "Monospace", category: "Monospace" },
];

export const COLOR_PALETTES: ColorPalette[] = [
    {
        id: "classic-ink",
        name: "Singapore Sepia",
        color: "#2b2721",
        paperColor: "#ece7dc",
        accent: "#9a6a3e",
        description: "The authentic warm paper and rich carbon ink palette",
    },
    {
        id: "botanical-herbarium",
        name: "Botanical Moss",
        color: "#1d3324",
        paperColor: "#ebede4",
        accent: "#47684d",
        description: "Forest reserve inspired herbal green tone",
    },
    {
        id: "peranakan-rose",
        name: "Katong Terracotta",
        color: "#3c231e",
        paperColor: "#f0e8e4",
        accent: "#a25542",
        description: "Warm glazed tile and clay shophouse tones",
    },
    {
        id: "midnight-quay",
        name: "Marina Midnight",
        color: "#16202c",
        paperColor: "#e4e7ea",
        accent: "#395777",
        description: "Dusk riverside blues with cool crisp paper",
    },
    {
        id: "monochrome-press",
        name: "Archival Charcoal",
        color: "#1a1918",
        paperColor: "#f4f2ec",
        accent: "#5a554c",
        description: "High-contrast editorial lithograph look",
    },
];

export const SAMPLE_ADDITIONAL_PLATES: Omit<SketchbookPage, "id">[] = [
    {
        file: "https://images.unsplash.com/photo-1506351421178-63b52a2d2562?auto=format&fit=crop&w=1200&q=80",
        title: "Sentosa Coastal Cove",
        place: "Palawan Beach",
        description:
            "Sun-dappled coastal palm trees and suspension bridge over emerald waters.",
    },
    {
        file: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1200&q=80",
        title: "Cloud Forest Waterfall",
        place: "Bay South Garden",
        description:
            "Thirty-five meter indoor mountain waterfall surrounded by highland tropical mist.",
    },
    {
        file: "https://images.unsplash.com/photo-1565967511849-76a60a516170?auto=format&fit=crop&w=1200&q=80",
        title: "Heritage Rain Tree",
        place: "Fort Canning Green",
        description:
            "Sprawling century-old rain tree canopy sheltered against evening rainfall.",
    },
    {
        file: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1200&q=80",
        title: "Sultan Mosque Minarets",
        place: "Kampong Glam",
        description:
            "Golden dome and palm tree alley glowing under equatorial afternoon light.",
    },
];
