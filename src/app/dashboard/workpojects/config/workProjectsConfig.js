/**
 * Configuration and dynamic schemas for Work Projects (Videos & Transit World).
 */

export const MAX_VIDEO_BYTES = 80 * 1024 * 1024; // 80 MB

export const DEFAULT_FLOATING_TAGS = [
    "FEATURED",
    "INDIE",
    "CAMPAIGN",
    "SERIES",
    "FEATURE",
    "FICTION",
    "COMMERCIAL",
    "SHOWREEL",
    "DOCUMENTARY",
    "MUSIC VIDEO",
];

export const CAMERA_OPTIONS = [
    "ARRI LF",
    "ARRI Alexa Mini LF",
    "RED V-Raptor",
    "Sony Venice 2",
    "Sony FX6",
    "Sony FX3",
    "Blackmagic Ursa 12K",
    "16mm Arriflex 416",
    "35mm Arricam LT",
];

export const LENS_OPTIONS = [
    "ANAMORPHIC",
    "Cooke Anamorphic /i Full Frame Plus",
    "Atlas Orion 2x Anamorphic",
    "Arri Master Anamorphic",
    "Zeiss Supreme Prime Radiance",
    "Canon K35 Vintage Primes",
    "Tribe7 Blackwing7",
    "Hawk V-Lite 2x",
];

export const RATIO_OPTIONS = ["2.39:1", "16:9", "2.00:1", "4:3", "1.85:1", "9:16"];

export const WORK_PROJECT_FIELDS = {
    title: {
        key: "title",
        label: "Project Title",
        placeholder: "e.g. Delhi Metro Transit Campaign",
        required: true,
    },
    client: {
        key: "client",
        label: "Client / Production House",
        placeholder: "e.g. Netflix / Delhi Metro Rail Corporation",
        required: false,
    },
    stationName: {
        key: "stationName",
        label: "Transit Station / World Stop",
        placeholder: "e.g. Central Station / Connaught Place",
        required: false,
    },
    summary: {
        key: "summary",
        label: "Director & DP Statement / Summary",
        placeholder: "Cinematography visual approach, lighting schemes, optical mood...",
        required: false,
    },
    camera: {
        key: "camera",
        label: "Camera Package",
        options: CAMERA_OPTIONS,
        required: false,
    },
    lens: {
        key: "lens",
        label: "Glass / Lens Package",
        options: LENS_OPTIONS,
        required: false,
    },
    formatRatio: {
        key: "formatRatio",
        label: "Aspect Ratio",
        options: RATIO_OPTIONS,
        required: false,
    },
};

