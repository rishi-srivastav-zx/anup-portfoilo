/**
 * Base URL Resolution Utility
 * Resolves the backend server root and API endpoint root using environment variables.
 * Automatically enforces protocol (https:// or http://) to avoid relative URL misinterpretation.
 * Prioritizes NEXT_PUBLIC_API_URL as specified, with graceful fallbacks for NEXT_PUBLIC_BACKEND_URL and NEXT_PUBLIC_BASE_URL.
 */

const normalizeUrl = (url) => {
    if (!url || typeof url !== "string") return "";
    let clean = url.trim().replace(/\/+$/, "");
    if (!clean) return "";

    // Prepend protocol if omitted in environment variables
    if (!clean.startsWith("http://") && !clean.startsWith("https://")) {
        clean = clean.startsWith("localhost") || clean.startsWith("127.0.0.1")
            ? `http://${clean}`
            : `https://${clean}`;
    }
    return clean;
};

// Priority 1: NEXT_PUBLIC_API_URL
// Priority 2: Fallback to NEXT_PUBLIC_BACKEND_URL or NEXT_PUBLIC_BASE_URL
const configuredUrl =
    normalizeUrl(process.env.NEXT_PUBLIC_API_URL) ||
    normalizeUrl(process.env.NEXT_PUBLIC_BACKEND_URL) ||
    normalizeUrl(process.env.NEXT_PUBLIC_BASE_URL);

// Server root: Always strips any trailing /api and trailing slashes
export const SERVER_URL = configuredUrl
    ? configuredUrl.replace(/\/api\/?$/i, "")
    : "http://localhost:5000";

// API root: Always ends with /api (without duplicate /api or trailing slashes)
export const API_BASE_URL = `${SERVER_URL}/api`;

/**
 * Universal safe URL resolver to prevent double /api and leading/trailing slash issues
 * @param {string} endpoint - e.g. "/sketchbook", "/api/sketchbook", or full "https://..."
 * @returns {string} Fully resolved absolute URL
 */
export const resolveApiUrl = (endpoint) => {
    if (!endpoint || typeof endpoint !== "string") return API_BASE_URL;
    if (endpoint.startsWith("http://") || endpoint.startsWith("https://")) {
        return endpoint;
    }

    const trimmed = endpoint.trim();
    const cleanPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;

    if (cleanPath.toLowerCase().startsWith("/api/")) {
        return `${SERVER_URL}${cleanPath}`;
    }
    if (cleanPath.toLowerCase() === "/api") {
        return API_BASE_URL;
    }
    return `${API_BASE_URL}${cleanPath}`;
};

export default API_BASE_URL;
