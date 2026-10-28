

import axios from "axios";
import { API_CONFIG } from "../config/api.config";
import {
    setupInterceptors,
    setAuthToken,
    getAuthToken,
    clearAuthToken,
    registerOnUnauthorized,
} from "./intercepters";

const axiosClient = axios.create({
    baseURL: API_CONFIG.baseURL,
    timeout: API_CONFIG.timeout,
    withCredentials: API_CONFIG.withCredentials,
    headers: API_CONFIG.headers,
});

// Attach enterprise request/response interceptors
setupInterceptors(axiosClient);

// Convenient token accessors directly on instance
axiosClient.setToken = setAuthToken;
axiosClient.getToken = getAuthToken;
axiosClient.clearToken = clearAuthToken;
axiosClient.onUnauthorized = registerOnUnauthorized;

export default axiosClient;
