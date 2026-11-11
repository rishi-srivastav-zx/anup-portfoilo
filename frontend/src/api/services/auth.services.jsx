/**
 * Authentication Services
 * Encapsulates login, registration, token refresh, and session revocation using HttpOnly cookies.
 */

import axiosClient from "../client/axiosclients";
import { ENDPOINTS } from "../constants/apiEndpoints";

export const AuthServices = {
    /**
     * Authenticate user with credentials (browser receives HttpOnly cookies)
     * @param {{ email: string, password: string }} credentials
     */
    login: async (credentials) => {
        const response = await axiosClient.post(
            ENDPOINTS.AUTH.LOGIN,
            credentials
        );
        return response.data;
    },

    /**
     * Register a new user account
     * @param {{ name: string, email: string, password: string, confirmPassword?: string }} data
     */
    register: async (data) => {
        const response = await axiosClient.post(ENDPOINTS.AUTH.REGISTER, data);
        return response.data;
    },

    /**
     * Rotate access token silently via HttpOnly cookie
     */
    refreshToken: async () => {
        const response = await axiosClient.post(ENDPOINTS.AUTH.REFRESH);
        return response.data;
    },

    /**
     * Terminate current active session and clear HttpOnly cookies
     */
    logout: async () => {
        const response = await axiosClient.post(ENDPOINTS.AUTH.LOGOUT);
        return response.data;
    },

    /**
     * Invalidate all sessions across all devices
     */
    logoutAll: async () => {
        const response = await axiosClient.post(ENDPOINTS.AUTH.LOGOUT_ALL);
        return response.data;
    },

    /**
     * Retrieve authenticated user profile from /auth/me via HttpOnly cookie
     */
    getMe: async () => {
        const response = await axiosClient.get(ENDPOINTS.AUTH.ME);
        return response.data;
    },
};

export default AuthServices;
