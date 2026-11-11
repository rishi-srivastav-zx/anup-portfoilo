import axiosClient from "../client/axiosclients";
import { ENDPOINTS } from "../constants/apiEndpoints";

/**
 * Chatbot Lead Management API Service (Admin)
 * Step 11: Connects to backend Express /api/admin/leads endpoints
 */
export const chatbotLeadService = {
    /**
     * Fetch paginated leads with filtering and search
     * @param {object} params
     * @param {string} [params.status]
     * @param {string} [params.projectType]
     * @param {string} [params.search]
     * @param {string} [params.startDate]
     * @param {string} [params.endDate]
     * @param {number} [params.page]
     * @param {number} [params.limit]
     */
    async getLeads(params = {}) {
        const response = await axiosClient.get(ENDPOINTS.ADMIN.LEADS, { params });
        return response.data;
    },

    /**
     * Fetch aggregated pipeline status metrics
     */
    async getLeadStats() {
        const response = await axiosClient.get(ENDPOINTS.ADMIN.LEADS_STATS);
        return response.data;
    },

    /**
     * Fetch single lead with full details and conversation transcript
     * @param {string} id - Lead UUID
     */
    async getLeadById(id) {
        const url = ENDPOINTS.ADMIN.LEAD_BY_ID.replace(":id", id);
        const response = await axiosClient.get(url);
        return response.data;
    },

    /**
     * Update lead pipeline status
     * @param {string} id - Lead UUID
     * @param {string} status - Pipeline status
     */
    async updateLeadStatus(id, status) {
        const url = ENDPOINTS.ADMIN.LEAD_STATUS.replace(":id", id);
        const response = await axiosClient.patch(url, { status });
        return response.data;
    },

    /**
     * Update editable lead attributes
     * @param {string} id - Lead UUID
     * @param {object} data - Fields to update
     */
    async updateLead(id, data = {}) {
        const url = ENDPOINTS.ADMIN.LEAD_BY_ID.replace(":id", id);
        const response = await axiosClient.patch(url, data);
        return response.data;
    },

    /**
     * Delete lead record
     * @param {string} id - Lead UUID
     */
    async deleteLead(id) {
        const url = ENDPOINTS.ADMIN.LEAD_BY_ID.replace(":id", id);
        const response = await axiosClient.delete(url);
        return response.data;
    },
};

export default chatbotLeadService;
