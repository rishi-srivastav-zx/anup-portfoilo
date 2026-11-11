"use client";

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    useMemo,
    useRef,
} from "react";
import { useRouter } from "next/navigation";
import { apiClient, SERVER_URL, API_BASE_URL, resolveApiUrl } from "@/api";

const AUTH_SESSION_KEY = "studio_auth_session";

const AuthContext = createContext(null);

// Module-level in-flight promise to deduplicate concurrent checkAuth calls across components & re-renders
let inFlightAuthPromise = null;
let lastVerifiedTimestamp = 0;
const VERIFY_THROTTLE_MS = 15000; // 15 seconds throttle for background validation

/**
 * Safely hydrate user from sessionStorage on client mount (NO tokens, only public profile metadata)
 */
const getInitialUser = () => {
    if (typeof window === "undefined") return null;
    try {
        const stored = sessionStorage.getItem(AUTH_SESSION_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed && parsed.id) return parsed;
        }
    } catch {
        // Ignore JSON or storage errors
    }
    return null;
};

export const AuthProvider = ({ children }) => {
    // Initialize user as null during SSR and initial hydration to guarantee 100% server-client parity
    const [user, setUser] = useState(null);
    const userRef = useRef(null);
    const [isInitializing, setIsInitializing] = useState(true);
    const [isValidating, setIsValidating] = useState(false);
    const [loading, setLoading] = useState(false);
    const [authError, setAuthError] = useState(null);
    const [networkError, setNetworkError] = useState(false);
    const router = useRouter();

    // Keep userRef synchronized with state without re-triggering effects
    useEffect(() => {
        userRef.current = user;
    }, [user]);

    /**
     * Persist public user info to sessionStorage
     */
    const saveUserSession = useCallback((userData) => {
        if (!userData) return;
        userRef.current = userData;
        setUser(userData);
        if (typeof window !== "undefined") {
            try {
                sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(userData));
            } catch {
                // Ignore storage exceptions
            }
        }
    }, []);

    /**
     * Clear user session from state and storage
     */
    const clearUserSession = useCallback(() => {
        userRef.current = null;
        setUser(null);
        lastVerifiedTimestamp = 0;
        if (typeof window !== "undefined") {
            try {
                sessionStorage.removeItem(AUTH_SESSION_KEY);
            } catch {
                // Ignore storage exceptions
            }
        }
    }, []);

    /**
     * Centralized, idempotent session validation via HttpOnly cookies.
     * Deduplicates in-flight calls and protects against concurrent token-reuse triggers.
     * Uses userRef to maintain a stable callback identity and prevent render loops.
     */
    const checkAuth = useCallback(
        async (force = false) => {
            const currentUser = userRef.current;
            // Fast return if already recently validated and user exists in memory
            if (!force && currentUser && Date.now() - lastVerifiedTimestamp < VERIFY_THROTTLE_MS) {
                return { success: true, user: currentUser };
            }

            // Deduplicate concurrent calls in flight
            if (inFlightAuthPromise && !force) {
                return inFlightAuthPromise;
            }

            inFlightAuthPromise = (async () => {
                setIsValidating(true);
                try {
                    setAuthError(null);
                    setNetworkError(false);

                    // 1. Query /api/auth/me (HttpOnly access cookie attached by browser automatically)
                    const meRes = await fetch(resolveApiUrl("/auth/me"), {
                        method: "GET",
                        credentials: "include",
                        headers: { "X-Requested-With": "XMLHttpRequest" },
                    });

                    if (meRes.ok) {
                        const meData = await meRes.json();
                        if (meData?.user) {
                            saveUserSession(meData.user);
                            lastVerifiedTimestamp = Date.now();
                            return { success: true, user: meData.user };
                        }
                    }

                    // 2. If 401, access token may have reached expiration. Attempt silent refresh via HttpOnly refreshToken cookie
                    if (meRes.status === 401) {
                        try {
                            const refreshRes = await fetch(
                                resolveApiUrl("/auth/refresh"),
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
                                    saveUserSession(refreshData.user);
                                    lastVerifiedTimestamp = Date.now();
                                    return { success: true, user: refreshData.user };
                                }
                            }

                            // Only confirmed 401 on refresh means the session has genuinely expired
                            if (refreshRes.status === 401) {
                                clearUserSession();
                                return { success: false, reason: "unauthorized" };
                            }

                            // 5xx or rate limit (429) on refresh: server hiccup, keep session
                            setNetworkError(true);
                            return { success: false, reason: "server_error" };
                        } catch {
                            // Network drop during refresh: preserve session
                            setNetworkError(true);
                            return { success: false, reason: "network_error" };
                        }
                    }

                    // 3. 403 Forbidden: User is authenticated but lacks access to a specific resource.
                    // DO NOT log user out on 403!
                    if (meRes.status === 403) {
                        return { success: true, user: userRef.current };
                    }

                    // 4. 5xx or 429: Server error or rate limit. DO NOT log user out!
                    if (meRes.status >= 500 || meRes.status === 429) {
                        setNetworkError(true);
                        return { success: false, reason: "server_error" };
                    }

                    // Other unexpected response: only clear if we had no cached session
                    if (!userRef.current) {
                        clearUserSession();
                        return { success: false, reason: "unauthorized" };
                    }

                    return { success: true, user: userRef.current };
                } catch (err) {
                    // Network error (offline, connection refused, temporary drop)
                    // Never clear user on network errors!
                    setNetworkError(true);
                    return {
                        success: Boolean(userRef.current),
                        reason: "network_error",
                        error: err.message,
                    };
                } finally {
                    setIsInitializing(false);
                    setIsValidating(false);
                    setLoading(false);
                    inFlightAuthPromise = null;
                }
            })();

            return inFlightAuthPromise;
        },
        [saveUserSession, clearUserSession]
    );

    // Initial auth verification and client-side session hydration (runs strictly ONCE on mount)
    useEffect(() => {
        let isMounted = true;

        // Synchronously rehydrate user session from client storage on mount
        const cached = getInitialUser();
        if (cached && isMounted) {
            setUser(cached);
            userRef.current = cached;
            setIsInitializing(false);
        }

        // Skip auth initialization on public login routes to avoid unnecessary calls
        if (
            typeof window !== "undefined" &&
            (window.location.pathname.startsWith("/login") || window.location.pathname.startsWith("/login-page"))
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
        // Empty dependency array ensures this effect executes strictly once on initial mount
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Listen for global unauthorized events from Axios interceptors
    useEffect(() => {
        if (apiClient?.onUnauthorized) {
            apiClient.onUnauthorized(() => {
                clearUserSession();
                setIsInitializing(false);
                router.push("/login-page");
            });
        }
    }, [clearUserSession, router]);

    /**
     * Authenticate user with credentials (browser receives HttpOnly cookies)
     */
    const login = useCallback(
        async ({ email, password }) => {
            setLoading(true);
            setAuthError(null);
            setNetworkError(false);

            try {
                const res = await fetch(resolveApiUrl("/auth/login"), {
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

                // Immediately establish authenticated state and cache
                saveUserSession(data.user);
                lastVerifiedTimestamp = Date.now();
                setIsInitializing(false);

                return { success: true, user: data.user };
            } catch (err) {
                setAuthError(err.message);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [saveUserSession]
    );

    /**
     * Register a new user account
     */
    const register = useCallback(
        async ({ name, email, password, confirmPassword }) => {
            setLoading(true);
            setAuthError(null);
            try {
                const res = await fetch(resolveApiUrl("/auth/register"), {
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
            await fetch(resolveApiUrl("/auth/logout"), {
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
            clearUserSession();
            setIsInitializing(false);
            setLoading(false);
            router.push("/login-page");
        }
    }, [clearUserSession, router]);

    /**
     * Invalidate all sessions across all devices
     */
    const logoutAll = useCallback(async () => {
        setLoading(true);
        try {
            await fetch(resolveApiUrl("/auth/logout-all"), {
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
            clearUserSession();
            setIsInitializing(false);
            setLoading(false);
            router.push("/login-page");
        }
    }, [clearUserSession, router]);

    /**
     * Authenticated fetch helper for backwards compatibility
     */
    const authFetch = useCallback(
        async (url, options = {}) => {
            const endpoint = resolveApiUrl(url);
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
                    clearUserSession();
                    router.push("/login-page");
                }
            }

            return response;
        },
        [checkAuth, clearUserSession, router]
    );

    const value = useMemo(
        () => ({
            user,
            isAuthenticated: Boolean(user),
            isLoading: loading,
            isInitializing,
            isValidating,
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
            isValidating,
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
