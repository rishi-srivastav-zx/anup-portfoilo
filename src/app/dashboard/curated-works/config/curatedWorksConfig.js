/**
 * Configuration and dynamic field schema for Curated Works & 3D Sketchbook Plates.
 */

export const MAX_PLATES = 10;
export const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB
export const FALLBACK_PLATES_COUNT = 15;

export const ACCEPTED_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp", ".avif"];
export const ACCEPTED_MIME_TYPES = [
    "image/png",
    "image/jpeg",
    "image/webp",
    "image/avif",
];

export const PLATE_FIELDS = {
    image: {
        key: "image",
        label: "Select Image",
        description: "Click to browse image PNG, JPG, JPEG, WEBP, AVIF up to 20MB",
        required: true,
    },
    title: {
        key: "title",
        label: "Plate Title",
        placeholder: "e.g. Synchronized Asanas",
        required: true,
    },
    place: {
        key: "place",
        label: "Location / Place",
        placeholder: "e.g. Ganges Riverbank, Rishikesh",
        required: false,
    },
    description: {
        key: "description",
        label: "Description / Brief Notes",
        placeholder: "Brief artistic description of this plate...",
        required: false,
    },
};

