import { ENDPOINTS } from "../constants/apiEndpoints";
import { API_BASE_URL } from "../utils/baseUrl";

// Concurrency control for silent refresh
let isRefreshing = false;
let refreshSubscribers = [];

// Registered unauthorized callback (e.g. from React context or navigation)
let onUnauthorizedCallback = null;

// Backwards-compatible stubs for exports (no raw JWT in JS)
export const getAuthToken = () => null;
export const setAuthToken = () => {};
export const clearAuthToken = () => {};

export const registerOnUnauthorized = (callback) => {
    onUnauthorizedCallback = callback;
};

const onRefreshed = () => {
    refreshSubscribers.forEach((callback) => callback());
    refreshSubscribers = [];
};

const onRefreshFailed = (error) => {
    refreshSubscribers.forEach((callback) => callback(error));
    refreshSubscribers = [];
};

/**
 * Queue a request waiting for an in-flight token refresh
 */
const subscribeTokenRefresh = (callback) => {
    refreshSubscribers.push(callback);
};

/**
 * Broadcast network or server crash event to window
 */
const broadcastNetworkError = (error) => {
    if (typeof window !== "undefined") {
        const event = new CustomEvent("universal-network-error", {
            detail: {
                message: error?.message || "Server connection lost",
                status: error?.response?.status || null,
                timestamp: Date.now(),
            },
        });
        window.dispatchEvent(event);
    }
};

/**
 * Configure and attach interceptors to the Axios client instance.
 * Pure HttpOnly Cookie-based: Axios uses withCredentials: true,
 * and the browser attaches HttpOnly cookies automatically.
 */
export const setupInterceptors = (axiosInstance) => {
    // -------------------------------------------------------------------------
    // 1. REQUEST INTERCEPTOR
    // -------------------------------------------------------------------------
    axiosInstance.interceptors.request.use(
        (config) => {
            // Anti-caching: attach _t timestamp on all GET requests
            if (config.method?.toLowerCase() === "get") {
                config.params = {
                    ...config.params,
                    _t: Date.now(),
                };
            }

            // Always send credentials with cross-origin requests
            config.withCredentials = true;

            // CSRF defense-in-depth: custom header prevents simple cross-site form submission
            config.headers["X-Requested-With"] = "XMLHttpRequest";

            // Strip any accidental manual Authorization header — auth is 100% cookie-driven
            delete config.headers.Authorization;

            return config;
        },
        (error) => Promise.reject(error),
    );

    // -------------------------------------------------------------------------
    // 2. RESPONSE INTERCEPTOR
    // -------------------------------------------------------------------------
    axiosInstance.interceptors.response.use(
        (response) => response,
        async (error) => {
            const originalRequest = error.config;

            // Handle network drops, CORS failures, or 502/503/504 server crashes
            if (
                !error.response ||
                [502, 503, 504].includes(error.response?.status)
            ) {
                broadcastNetworkError(error);
                return Promise.reject(error);
            }

            const status = error.response?.status;
            const requestUrl = originalRequest?.url || "";

            const isAuthRoute =
                requestUrl.includes(ENDPOINTS.AUTH.LOGIN) ||
                requestUrl.includes(ENDPOINTS.AUTH.REFRESH) ||
                requestUrl.includes(ENDPOINTS.AUTH.REGISTER);

            // Handle 401 Unauthorized (Access token expired in HttpOnly cookie)
            if (status === 401 && !originalRequest._retry && !isAuthRoute) {
                originalRequest._retry = true;

                if (!isRefreshing) {
                    isRefreshing = true;

                    try {
                        // Issue silent refresh via HttpOnly cookie
                        const refreshResponse = await fetch(
                            `${API_BASE_URL}${ENDPOINTS.AUTH.REFRESH}`,
                            {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                    "X-Requested-With": "XMLHttpRequest",
                                },
                                credentials: "include", // Sends HttpOnly refreshToken cookie
                            },
                        );

                        if (!refreshResponse.ok) {
                            throw new Error(
                                "Session expired. Please log in again.",
                            );
                        }

                        // Express sets the new accessToken cookie automatically in response
                        isRefreshing = false;
                        onRefreshed();

                        // Retry original request — browser will automatically include updated cookie
                        return axiosInstance(originalRequest);
                    } catch (refreshError) {
                        isRefreshing = false;
                        onRefreshFailed(refreshError);

                        if (onUnauthorizedCallback) {
                            onUnauthorizedCallback(refreshError);
                        }

                        return Promise.reject(refreshError);
                    }
                }

                // If already refreshing, enqueue original request
                return new Promise((resolve, reject) => {
                    subscribeTokenRefresh((refreshErr) => {
                        if (refreshErr) {
                            reject(refreshErr);
                        } else {
                            resolve(axiosInstance(originalRequest));
                        }
                    });
                });
            }

            return Promise.reject(error);
        },
    );

    return axiosInstance;
};

export default setupInterceptors;
