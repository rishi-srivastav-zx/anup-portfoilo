import axiosClient from "../client/axiosclients";
import { ENDPOINTS } from "../constants/apiEndpoints";

export const workProjectService = {
    /**
     * Fetch all work transit projects
     */
    async getProjects() {
        const response = await axiosClient.get(ENDPOINTS.WORK_PROJECTS.LIST);
        return response.data;
    },

    /**
     * Get single project by ID
     */
    async getProjectById(id) {
        const endpoint = ENDPOINTS.WORK_PROJECTS.DETAIL.replace(":id", id);
        const response = await axiosClient.get(endpoint);
        return response.data;
    },

    /**
     * Create work project with video upload (up to 80MB) and thumbnail
     * @param {FormData} formData
     * @param {Function} [onUploadProgress]
     */
    async createProject(formData, onUploadProgress) {
        const response = await axiosClient.post(ENDPOINTS.WORK_PROJECTS.CREATE, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
            onUploadProgress,
        });
        return response.data;
    },

    /**
     * Update project metadata or replace video/thumbnail
     * @param {string} id
     * @param {FormData|object} data
     */
    async updateProject(id, data) {
        const endpoint = ENDPOINTS.WORK_PROJECTS.UPDATE.replace(":id", id);
        const isFormData = data instanceof FormData;
        const response = await axiosClient.put(endpoint, data, {
            headers: isFormData ? { "Content-Type": "multipart/form-data" } : {},
        });
        return response.data;
    },

    /**
     * Delete project by ID
     * @param {string} id
     */
    async deleteProject(id) {
        const endpoint = ENDPOINTS.WORK_PROJECTS.DELETE.replace(":id", id);
        const response = await axiosClient.delete(endpoint);
        return response.data;
    },

    /**
     * Reorder projects
     * @param {string[]} orderedIds
     */
    async reorderProjects(orderedIds) {
        const response = await axiosClient.put(ENDPOINTS.WORK_PROJECTS.REORDER, { orderedIds });
        return response.data;
    },
};

export default workProjectService;

