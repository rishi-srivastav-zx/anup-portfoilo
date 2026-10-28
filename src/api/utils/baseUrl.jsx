/**
 * Base URL Resolution Utility
 * Resolves the backend server root and api endpoint root.
 */

export const SERVER_URL =
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    "http://localhost:5000";

export const API_BASE_URL = SERVER_URL.endsWith("/api")
    ? SERVER_URL
    : `${SERVER_URL.replace(/\/+$/, "")}/api`;

export default API_BASE_URL;
