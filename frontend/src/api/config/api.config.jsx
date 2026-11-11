
import { API_BASE_URL, SERVER_URL } from "../utils/baseUrl";

export const API_CONFIG = {
    baseURL: API_BASE_URL,
    serverURL: SERVER_URL,
    timeout: 30000, // 30 seconds
    withCredentials: true, // Enables HttpOnly cookie transmission
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
};

export default API_CONFIG;
