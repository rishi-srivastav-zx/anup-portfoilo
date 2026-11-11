import axiosClient from "../client/axiosclients";
import { ENDPOINTS } from "../constants/apiEndpoints";

/**
 * Portfolio Knowledge Management API Service (Admin)
 * Step 11: Connects to backend Express /api/admin/knowledge endpoints
 */
export const knowledgeService = {
    /**
     * Fetch paginated knowledge records with filtering and search
     * @param {object} params
     * @param {string} [params.category]
     * @param {string} [params.status]
     * @param {string} [params.search]
     * @param {number} [params.page]
     * @param {number} [params.limit]
     */
    async getKnowledge(params = {}) {
        const response = await axiosClient.get(ENDPOINTS.ADMIN.KNOWLEDGE, { params });
        return response.data;
    },

    /**
     * Retrieve all active and suggested knowledge categories
     */
    async getCategories() {
        const response = await axiosClient.get(ENDPOINTS.ADMIN.KNOWLEDGE_CATEGORIES);
        return response.data;
    },

    /**
     * Fetch single knowledge record by UUID
     * @param {string} id
     */
    async getKnowledgeById(id) {
        const url = ENDPOINTS.ADMIN.KNOWLEDGE_BY_ID.replace(":id", id);
        const response = await axiosClient.get(url);
        return response.data;
    },

    /**
     * Create a new knowledge record
     * @param {object} data
     */
    async createKnowledge(data) {
        const response = await axiosClient.post(ENDPOINTS.ADMIN.KNOWLEDGE, data);
        return response.data;
    },

    /**
     * Update an existing knowledge record
     * @param {string} id
     * @param {object} data
     */
    async updateKnowledge(id, data) {
        const url = ENDPOINTS.ADMIN.KNOWLEDGE_BY_ID.replace(":id", id);
        const response = await axiosClient.put(url, data);
        return response.data;
    },

    /**
     * Update publication status ('draft', 'published', 'archived')
     * @param {string} id
     * @param {string} status
     * @param {boolean} [isPublished]
     */
    async updateStatus(id, status, isPublished) {
        const url = ENDPOINTS.ADMIN.KNOWLEDGE_STATUS.replace(":id", id);
        const response = await axiosClient.patch(url, { status, isPublished });
        return response.data;
    },

    /**
     * Delete a knowledge record
     * @param {string} id
     */
    async deleteKnowledge(id) {
        const url = ENDPOINTS.ADMIN.KNOWLEDGE_BY_ID.replace(":id", id);
        const response = await axiosClient.delete(url);
        return response.data;
    },

    /**
     * Test knowledge retrieval search engine
     * @param {string} query
     */
    async testSearch(query) {
        const response = await axiosClient.post(ENDPOINTS.ADMIN.KNOWLEDGE_SEARCH, { query });
        return response.data;
    },
};

export default knowledgeService;
