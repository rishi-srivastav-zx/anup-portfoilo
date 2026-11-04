/**
 * Blog Services
 * Client-side interface for all Blog API endpoints (public & administrative).
 * Integrates directly with the Express backend REST API and supports JSON & multipart operations.
 */

import axiosClient from "../client/axiosclients";
import { ENDPOINTS } from "../constants/apiEndpoints";

export const BlogServices = {
   
    getBlogs: async (params = {}) => {
        const response = await axiosClient.get(ENDPOINTS.BLOGS.LIST, { params });
        return response.data;
    },

 
    getFeaturedBlogs: async (params = { limit: 5 }) => {
        const response = await axiosClient.get(ENDPOINTS.BLOGS.FEATURED, { params });
        return response.data;
    },

 
    getBlogBySlug: async (slug) => {
        const url = ENDPOINTS.BLOGS.DETAIL_SLUG.replace(":slug", encodeURIComponent(slug));
        const response = await axiosClient.get(url);
        return response.data;
    },

 
    getBlogById: async (id) => {
        const url = ENDPOINTS.BLOGS.DETAIL_ADMIN.replace(":id", encodeURIComponent(id));
        const response = await axiosClient.get(url);
        return response.data;
    },

 
    getCategories: async (params = {}) => {
        const response = await axiosClient.get(ENDPOINTS.BLOGS.CATEGORIES, { params });
        return response.data;
    },


    getTags: async (params = {}) => {
        const response = await axiosClient.get(ENDPOINTS.BLOGS.TAGS, { params });
        return response.data;
    },

    
    getStats: async () => {
        const response = await axiosClient.get(ENDPOINTS.BLOGS.STATS);
        return response.data;
    },


    createBlog: async (data) => {
        const isFormData = typeof FormData !== "undefined" && data instanceof FormData;
        const config = isFormData
            ? { headers: { "Content-Type": "multipart/form-data" } }
            : {};
        const response = await axiosClient.post(ENDPOINTS.BLOGS.CREATE, data, config);
        return response.data;
    },


    updateBlog: async (id, data) => {
        const url = ENDPOINTS.BLOGS.UPDATE.replace(":id", encodeURIComponent(id));
        const isFormData = typeof FormData !== "undefined" && data instanceof FormData;
        const config = isFormData
            ? { headers: { "Content-Type": "multipart/form-data" } }
            : {};
        const response = await axiosClient.put(url, data, config);
        return response.data;
    },

    updateStatus: async (id, status) => {
        const url = ENDPOINTS.BLOGS.UPDATE_STATUS.replace(":id", encodeURIComponent(id));
        const response = await axiosClient.patch(url, { status });
        return response.data;
    },


    updateBlogStatus: async (id, status) => {
        return BlogServices.updateStatus(id, status);
    },


    toggleFeatured: async (id) => {
        const url = ENDPOINTS.BLOGS.TOGGLE_FEATURED.replace(":id", encodeURIComponent(id));
        const response = await axiosClient.patch(url);
        return response.data;
    },


    deleteBlog: async (id) => {
        const url = ENDPOINTS.BLOGS.DELETE.replace(":id", encodeURIComponent(id));
        const response = await axiosClient.delete(url);
        return response.data;
    },


    bulkUpdateStatus: async (ids, status) => {
        const response = await axiosClient.post(ENDPOINTS.BLOGS.BULK_STATUS, { ids, status });
        return response.data;
    },

    
    bulkDelete: async (ids) => {
        const response = await axiosClient.post(ENDPOINTS.BLOGS.BULK_DELETE, { ids });
        return response.data;
    },

 
    bulkDeleteBlogs: async (ids) => {
        return BlogServices.bulkDelete(ids);
    },

    
    uploadMedia: async (fileOrFormData, onUploadProgress) => {
        let payload;
        if (typeof FormData !== "undefined" && fileOrFormData instanceof FormData) {
            payload = fileOrFormData;
        } else {
            payload = new FormData();
            payload.append("file", fileOrFormData);
        }

        const response = await axiosClient.post(ENDPOINTS.BLOGS.UPLOAD, payload, {
            headers: { "Content-Type": "multipart/form-data" },
            onUploadProgress,
        });
        return response.data;
    },
};

// Convenience named method exports
export const {
    getBlogs,
    getFeaturedBlogs,
    getBlogBySlug,
    getBlogById,
    getCategories,
    getTags,
    getStats,
    createBlog,
    updateBlog,
    updateStatus,
    updateBlogStatus,
    toggleFeatured,
    deleteBlog,
    bulkUpdateStatus,
    bulkDelete,
    bulkDeleteBlogs,
    uploadMedia,
} = BlogServices;

export default BlogServices;
