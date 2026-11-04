import axiosClient from "../client/axiosclients";
import { ENDPOINTS } from "../constants/apiEndpoints";

/**
 * Leads & Enquiries Service
 * Manages public lead submissions and admin inquiries retrieval/management.
 */
export const enquiryService = {
    /**
     * Submit a new lead / contact form inquiry
     * @param {{ name: string, phone: string, message?: string, source?: string }} payload
     */
    async createEnquiry(payload) {
        // Try direct backend first via axiosClient, or relative Next.js route fallback
        try {
            const response = await axiosClient.post(ENDPOINTS.ENQUIRIES.CREATE, payload);
            return response.data;
        } catch (error) {
            // Fallback to Next.js route if running in client
            const fallbackRes = await fetch("/api/contact/enquiry", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await fallbackRes.json();
            if (!fallbackRes.ok) {
                throw new Error(data?.error || "Failed to submit lead");
            }
            return data;
        }
    },

    /**
     * Fetch all leads (admin only)
     * @param {{ limit?: number, offset?: number, status?: string, search?: string }} params
     */
    async getEnquiries(params = {}) {
        const response = await axiosClient.get(ENDPOINTS.ENQUIRIES.LIST, { params });
        return response.data;
    },

    /**
     * Update lead status (admin only)
     * @param {string} id
     * @param {string} status - 'New' | 'Contacted' | 'In Discussion' | 'Confirmed' | 'Closed'
     */
    async updateStatus(id, status) {
        const endpoint = ENDPOINTS.ENQUIRIES.UPDATE_STATUS.replace(":id", id);
        const response = await axiosClient.patch(endpoint, { status });
        return response.data;
    },

    /**
     * Delete a lead (admin only)
     * @param {string} id
     */
    async deleteEnquiry(id) {
        const endpoint = `/enquiries/${id}`;
        const response = await axiosClient.delete(endpoint);
        return response.data;
    },
};

export default enquiryService;

