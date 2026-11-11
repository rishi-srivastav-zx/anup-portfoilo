import axiosClient from "../client/axiosclients";
import { ENDPOINTS } from "../constants/apiEndpoints";

export const sketchbookService = {
    /**
     * Fetch up to 10 curated sketchbook plates
     */
    async getImages() {
        const response = await axiosClient.get(ENDPOINTS.SKETCHBOOK.LIST);
        return response.data;
    },

    /**
     * Upload a new plate (converted to WebP, max 10 plates)
     * @param {FormData} formData - contains 'image' file, 'title', 'place', 'description'
     */
    async uploadImage(formData) {
        const response = await axiosClient.post(ENDPOINTS.SKETCHBOOK.UPLOAD, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    },

    /**
     * Delete a plate by ID
     * @param {string} id
     */
    async deleteImage(id) {
        const endpoint = ENDPOINTS.SKETCHBOOK.DELETE.replace(":id", id);
        const response = await axiosClient.delete(endpoint);
        return response.data;
    },

    /**
     * Reorder plates by array of ordered IDs
     * @param {string[]} orderedIds
     */
    async reorderImages(orderedIds) {
        const response = await axiosClient.put(ENDPOINTS.SKETCHBOOK.REORDER, { orderedIds });
        return response.data;
    },
};

export default sketchbookService;

