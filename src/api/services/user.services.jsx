/**
 * User Services
 * Encapsulates client portal and user dashboard data operations.
 */

import axiosClient from "../client/axiosclients";
import { ENDPOINTS } from "../constants/apiEndpoints";

export const UserServices = {
    /**
     * Retrieve user dashboard data, screening rooms, and session count
     */
    getDashboard: async () => {
        const response = await axiosClient.get(ENDPOINTS.USER.DASHBOARD);
        return response.data;
    },

    /**
     * Retrieve profile metadata
     */
    getProfile: async () => {
        const response = await axiosClient.get(ENDPOINTS.USER.PROFILE);
        return response.data;
    },
};

export default UserServices;
