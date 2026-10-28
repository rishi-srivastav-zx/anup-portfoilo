/**
 * Admin Services
 * Encapsulates superuser administrative command console operations.
 */

import axiosClient from "../client/axiosclients";
import { ENDPOINTS } from "../constants/apiEndpoints";

export const AdminServices = {
    /**
     * Retrieve admin analytics, active user counts, and registered accounts
     */
    getDashboard: async () => {
        const response = await axiosClient.get(ENDPOINTS.ADMIN.DASHBOARD);
        return response.data;
    },

    /**
     * Retrieve list of registered accounts
     */
    getUsers: async (params = {}) => {
        const response = await axiosClient.get(ENDPOINTS.ADMIN.USERS, { params });
        return response.data;
    },

    /**
     * Retrieve single user details
     */
    getUserById: async (id) => {
        const url = ENDPOINTS.ADMIN.USER_BY_ID.replace(":id", id);
        const response = await axiosClient.get(url);
        return response.data;
    },
};

export default AdminServices;
