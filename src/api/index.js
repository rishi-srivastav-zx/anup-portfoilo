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
export { API_BASE_URL, SERVER_URL } from "./utils/baseUrl";

export { default as AuthServices } from "./services/auth.services";
export { default as UserServices } from "./services/user.services";
export { default as AdminServices } from "./services/admin.services";

// Backwards-compatible naming aliases
export { default as authService } from "./services/auth.services";
export { default as userService } from "./services/user.services";
export { default as adminService } from "./services/admin.services";

import axiosClient from "./client/axiosclients";
export default axiosClient;
