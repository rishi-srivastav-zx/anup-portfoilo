/**
 * Centralized API Module Barrel Export
 * Exposes the client engine, interceptors, endpoints, configuration, and domain services.
 */

export { default as axiosClient } from "./client/axiosclients";
export { default as apiClient } from "./client/axiosclients";
export {
    setupInterceptors,
    getAuthToken,
    setAuthToken,
    clearAuthToken,
    registerOnUnauthorized,
} from "./client/intercepters";

export { default as API_CONFIG } from "./config/api.config";
export { default as ENDPOINTS } from "./constants/apiEndpoints";
export { API_BASE_URL, SERVER_URL, resolveApiUrl } from "./utils/baseUrl";

export { default as AuthServices } from "./services/auth.services";
export { default as UserServices } from "./services/user.services";
export { default as AdminServices } from "./services/admin.services";
export { default as EnquiryServices, enquiryService } from "./services/enquiry.services";
export { default as ChatbotLeadServices, chatbotLeadService } from "./services/chatbotLead.services";
export { default as KnowledgeServices, knowledgeService } from "./services/knowledge.services";
export { default as SketchbookServices, sketchbookService } from "./services/sketchbook.services";
export { default as WorkProjectServices, workProjectService } from "./services/workProject.services";
export {
    default as BlogServices,
    BlogServices as blogServicesNamed,
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
} from "./services/blog.services";

// Backwards-compatible naming aliases
export { default as authService } from "./services/auth.services";
export { default as userService } from "./services/user.services";
export { default as adminService } from "./services/admin.services";
export { default as blogService } from "./services/blog.services";

import axiosClient from "./client/axiosclients";
export default axiosClient;
