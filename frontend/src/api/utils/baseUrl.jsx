/**
 * Base URL Resolution Utility
 * Resolves the backend server root and API endpoint root using environment variables.
 * Supports NEXT_PUBLIC_API_URL, NEXT_PUBLIC_BACKEND_URL, and NEXT_PUBLIC_BASE_URL.
 */

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL;
const rawBackendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.NEXT_PUBLIC_BASE_URL;

export const SERVER_URL =
    (rawBackendUrl ? rawBackendUrl.replace(/\/+$/, "") : "") ||
    (rawApiUrl ? rawApiUrl.replace(/\/api\/?$/i, "") : "") ||
    "http://localhost:5000";

export const API_BASE_URL =
    (rawApiUrl ? rawApiUrl.replace(/\/+$/, "") : "") ||
    `${SERVER_URL.replace(/\/+$/, "")}/api`;

export default API_BASE_URL;
