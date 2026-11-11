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
    title: "Visual Chronicles",
    author: "Anup Rawat",
    subtitle: "A photographic visual chronicle & creative archive",
    edition: "Portfolio Edition",
    year: "2026",
    location: "Rishikesh & Beyond",
    introText:
        "Fifteen original plates capturing mindful retreats, creative workshops, nature walks, and intimate portrait studies.",
};

export const INITIAL_SKETCHBOOK_PAGES: SketchbookPage[] = [
    {
        id: "plate-1",
        file: "1956C3DE-266A-4B87-95D6-B5705F71403D_1_201_a.webp",
        title: "Synchronized Asanas",
        place: "Ganges Riverbank",
        description:
            "Morning yoga practitioners finding balance and union along the sacred river valley.",
        thumbnailUrl:
            "/landing-pages/meng-to-sketchbook/1956C3DE-266A-4B87-95D6-B5705F71403D_1_201_a.webp",
    },
    {
        id: "plate-2",
        file: "32E40AED-445C-4C30-BE11-CF56C53DB3B3.webp",
        title: "Creative Dialogue",
        place: "Retreat Pavillion",
        description:
            "Designers and storytellers gathered in warm morning light sharing drafts and ideas.",
        thumbnailUrl:
            "/landing-pages/meng-to-sketchbook/32E40AED-445C-4C30-BE11-CF56C53DB3B3.webp",
    },
    {
        id: "plate-3",
        file: "90FAD19F-0B33-4498-9988-80A4EC7F916E.webp",
        title: "Circle of Stories",
        place: "Open Veranda",
        description:
            "Candid reflections, shared laughter, and intimate discussions during the workshop.",
        thumbnailUrl:
            "/landing-pages/meng-to-sketchbook/90FAD19F-0B33-4498-9988-80A4EC7F916E.webp",
    },
    {
        id: "plate-4",
        file: "929C8E5F-4089-4A7E-8A55-B4DD4BF9E3CE_1_201_a.webp",
        title: "Valley Harmony",
        place: "Himalayan Foothills",
        description:
            "Outdoor movement practice framed against mountain peaks and gentle breeze.",
        thumbnailUrl:
            "/landing-pages/meng-to-sketchbook/929C8E5F-4089-4A7E-8A55-B4DD4BF9E3CE_1_201_a.webp",
    },
    {
        id: "plate-5",
        file: "BC6B84CC-A454-4FFD-BED9-50603DC17A27.webp",
        title: "Evening Reflections",
        place: "Gathering Lounge",
        description:
            "Deep focus and collective listening as dusk settles over the retreat grounds.",
        thumbnailUrl:
            "/landing-pages/meng-to-sketchbook/BC6B84CC-A454-4FFD-BED9-50603DC17A27.webp",
    },
    {
        id: "plate-6",
        file: "BF6EEE2F-E74B-4CCA-8066-59CB3E28EA00.webp",
        title: "Shared Perspectives",
        place: "Studio Workshop",
        description:
            "Active discourse, handwritten notes, and shared blueprints for new creative ventures.",
        thumbnailUrl:
            "/landing-pages/meng-to-sketchbook/BF6EEE2F-E74B-4CCA-8066-59CB3E28EA00.webp",
    },
    {
        id: "plate-7",
        file: "C4299386-1599-4DD7-B54C-787F7F4C05EE.webp",
        title: "Golden Hour Gathering",
        place: "Garden Hall",
        description:
            "Warm ambient lantern light and lively discussions following the afternoon session.",
        thumbnailUrl:
            "/landing-pages/meng-to-sketchbook/C4299386-1599-4DD7-B54C-787F7F4C05EE.webp",
    },
    {
        id: "plate-8",
        file: "DSC06133.webp",
        title: "Mindful Serenity",
        place: "Yoga Sanctuary",
        description:
            "A serene seated moment adorned with marigold garlands in quiet joy and clarity.",
        thumbnailUrl:
            "/landing-pages/meng-to-sketchbook/DSC06133.webp",
    },
    {
        id: "plate-9",
        file: "DSC06149.webp",
        title: "Morning Sunburst",
        place: "Veranda Studio",
        description:
            "Radiant natural lighting illuminating personal stories and shared spiritual practice.",
        thumbnailUrl:
            "/landing-pages/meng-to-sketchbook/DSC06149.webp",
    },
    {
        id: "plate-10",
        file: "F60F25E7-9F10-4D0A-9C18-9B8D9582ECFA.webp",
        title: "Collaborative Mindset",
        place: "Courtyard Session",
        description:
            "Community members examining ideas with passion, camaraderie, and curiosity.",
        thumbnailUrl:
            "/landing-pages/meng-to-sketchbook/F60F25E7-9F10-4D0A-9C18-9B8D9582ECFA.webp",
    },
    {
        id: "plate-11",
        file: "P1000926.webp",
        title: "Earth & Sunlight",
        place: "Forest Trail",
        description:
            "A barefoot walk bathed in golden sunshine under canopy foliage.",
        thumbnailUrl:
            "/landing-pages/meng-to-sketchbook/P1000926.webp",
    },
    {
        id: "plate-12",
        file: "P1000931.webp",
        title: "Canopy Walk",
        place: "Woodland Path",
        description:
            "Sunlit dirt trails lined with ancient trees offering peace and contemplation.",
        thumbnailUrl:
            "/landing-pages/meng-to-sketchbook/P1000931.webp",
    },
    {
        id: "plate-13",
        file: "P1000941.webp",
        title: "Quiet Presence",
        place: "Green Canopy",
        description:
            "Graceful contemplation among wild leaves and dappled forest shadows.",
        thumbnailUrl:
            "/landing-pages/meng-to-sketchbook/P1000941.webp",
    },
    {
        id: "plate-14",
        file: "P1001077.webp",
        title: "River Stones & Flow",
        place: "Mountain Stream",
        description:
            "Clear flowing water caressing riverbed boulders under crisp mountain air.",
        thumbnailUrl:
            "/landing-pages/meng-to-sketchbook/P1001077.webp",
    },
    {
        id: "plate-15",
        file: "P1001082.webp",
        title: "Breeze & Shallows",
        place: "Riverside Bank",
        description:
            "Standing ankle-deep in pure Himalayan currents soaking in nature's stillness.",
        thumbnailUrl:
            "/landing-pages/meng-to-sketchbook/P1001082.webp",
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
