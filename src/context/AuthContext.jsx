"use client";

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    useMemo,
} from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/api";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

const AuthContext = createContext(null);

// Module-level in-flight promise to deduplicate concurrent checkAuth calls (React StrictMode, concurrent components)
let inFlightAuthPromise = null;

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isInitializing, setIsInitializing] = useState(true);
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState(null);
    const [networkError, setNetworkError] = useState(false);
    const router = useRouter();

    /**
     * Centralized, idempotent session validation via HttpOnly cookies.
     * Deduplicates in-flight calls and protects against concurrent token-reuse triggers.
     * Separates 401 unauthorized from temporary network/server 5xx errors.
     */
    const checkAuth = useCallback(async (force = false) => {
        if (inFlightAuthPromise && !force) {
            return inFlightAuthPromise;
        }

        inFlightAuthPromise = (async () => {
            try {
                setAuthError(null);
                setNetworkError(false);

                // 1. Try /api/auth/me (browser attaches HttpOnly accessToken cookie)
                const meRes = await fetch(`${API_BASE}/api/auth/me`, {
                    method: "GET",
                    credentials: "include",
                    headers: { "X-Requested-With": "XMLHttpRequest" },
                });

                if (meRes.ok) {
                    const meData = await meRes.json();
                    if (meData?.user) {
                        setUser(meData.user);
                        return { success: true, user: meData.user };
                    }
                }

                // 2. If 401, accessToken may be expired. Attempt silent rotation via HttpOnly refreshToken cookie
                if (meRes.status === 401) {
                    try {
                        const refreshRes = await fetch(
                            `${API_BASE}/api/auth/refresh`,
                            {
                                method: "POST",
                                credentials: "include",
                                headers: {
                                    "Content-Type": "application/json",
                                    "X-Requested-With": "XMLHttpRequest",
                                },
                            }
                        );

                        if (refreshRes.ok) {
                            const refreshData = await refreshRes.json();
                            if (refreshData?.user) {
                                setUser(refreshData.user);
                                return { success: true, user: refreshData.user };
                            }
                        } else if (
                            refreshRes.status === 401 ||
                            refreshRes.status === 403
                        ) {
                            // Definitively unauthenticated: refresh token expired or invalid
                            setUser(null);
                            return { success: false, reason: "unauthorized" };
                        } else {
                            // 5xx on refresh: server error, do not clear existing session
                            setNetworkError(true);
                            return { success: false, reason: "server_error" };
                        }
                    } catch {
                        // Network drop during refresh
                        setNetworkError(true);
                        return { success: false, reason: "network_error" };
                    }
                } else if (meRes.status >= 500) {
                    // 5xx on /me: server error, do not log user out
                    setNetworkError(true);
                    return { success: false, reason: "server_error" };
                }

                // Other unexpected 4xx status
                setUser(null);
                return { success: false, reason: "unauthorized" };
            } catch (err) {
                // Network error (offline, connection refused, temporary drop)
                // Never clear user on network errors!
                setNetworkError(true);
                return {
                    success: false,
                    reason: "network_error",
                    error: err.message,
                };
            } finally {
                setIsInitializing(false);
                setLoading(false);
                inFlightAuthPromise = null;
            }
        })();

        return inFlightAuthPromise;
    }, []);

    // Initial auth verification on boot/refresh
    useEffect(() => {
        let isMounted = true;

        // Skip auth initialization on public login routes to avoid unnecessary calls
        if (
            typeof window !== "undefined" &&
            window.location.pathname.startsWith("/login")
        ) {
            setIsInitializing(false);
            setLoading(false);
            return;
        }

        checkAuth().then(() => {
            if (isMounted) {
                setIsInitializing(false);
                setLoading(false);
            }
        });

        return () => {
            isMounted = false;
        };
    }, [checkAuth]);

    // Listen for global unauthorized events from Axios interceptors
    useEffect(() => {
        if (apiClient?.onUnauthorized) {
            apiClient.onUnauthorized(() => {
                setUser(null);
                setIsInitializing(false);
                router.push("/login-page");
            });
        }
    }, [router]);

    /**
     * Authenticate user with credentials (browser receives HttpOnly cookies)
     */
    const login = useCallback(async ({ email, password }) => {
        setLoading(true);
        setAuthError(null);
        setNetworkError(false);

        try {
            const res = await fetch(`${API_BASE}/api/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                },
                credentials: "include",
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(data.message || "Failed to log in.");
            }

            // Immediately establish authenticated state
            setUser(data.user);
            setIsInitializing(false);

            return { success: true, user: data.user };
        } catch (err) {
            setAuthError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Register a new user account
     */
    const register = useCallback(
        async ({ name, email, password, confirmPassword }) => {
            setLoading(true);
            setAuthError(null);
            try {
                const res = await fetch(`${API_BASE}/api/auth/register`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-Requested-With": "XMLHttpRequest",
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        name,
                        email,
                        password,
                        confirmPassword,
                    }),
                });

                const data = await res.json();

                if (!res.ok || !data.success) {
                    const errorMsg =
                        data.errors && data.errors.length > 0
                            ? data.errors[0].message
                            : data.message || "Registration failed.";
                    throw new Error(errorMsg);
                }

                return { success: true, user: data.user };
            } catch (err) {
                setAuthError(err.message);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    /**
     * Logout from current session and clear HttpOnly cookies
     */
    const logout = useCallback(async () => {
        setLoading(true);
        try {
            await fetch(`${API_BASE}/api/auth/logout`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                },
                credentials: "include",
            });
        } catch (err) {
            console.error("Logout request error:", err);
        } finally {
            setUser(null);
            setIsInitializing(false);
            setLoading(false);
            router.push("/login-page");
        }
    }, [router]);

    /**
     * Invalidate all sessions across all devices
     */
    const logoutAll = useCallback(async () => {
        setLoading(true);
        try {
            await fetch(`${API_BASE}/api/auth/logout-all`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                },
                credentials: "include",
            });
        } catch (err) {
            console.error("Logout-all request error:", err);
        } finally {
            setUser(null);
            setIsInitializing(false);
            setLoading(false);
            router.push("/login-page");
        }
    }, [router]);

    /**
     * Authenticated fetch helper for backwards compatibility
     */
    const authFetch = useCallback(
        async (url, options = {}) => {
            const endpoint = url.startsWith("http") ? url : `${API_BASE}${url}`;
            const headers = {
                ...(options.headers || {}),
                "X-Requested-With": "XMLHttpRequest",
            };

            let response = await fetch(endpoint, {
                ...options,
                headers,
                credentials: "include",
            });

            if (response.status === 401) {
                const refreshed = await checkAuth(true);
                if (refreshed.success) {
                    response = await fetch(endpoint, {
                        ...options,
                        headers,
                        credentials: "include",
                    });
                } else {
                    setUser(null);
                    router.push("/login-page");
                }
            }

            return response;
        },
        [checkAuth, router]
    );

    const value = useMemo(
        () => ({
            user,
            isAuthenticated: Boolean(user),
            isLoading: loading,
            isInitializing,
            authError,
            networkError,
            checkAuth,
            login,
            register,
            logout,
            logoutAll,
            authFetch,
            refreshAccessToken: () => checkAuth(true),
        }),
        [
            user,
            loading,
            isInitializing,
            authError,
            networkError,
            checkAuth,
            login,
            register,
            logout,
            logoutAll,
            authFetch,
        ]
    );

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export default AuthContext;
