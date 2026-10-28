
export const ENDPOINTS = {
    AUTH: {
        LOGIN: "/auth/login",
        REGISTER: "/auth/register",
        REFRESH: "/auth/refresh",
        LOGOUT: "/auth/logout",
        LOGOUT_ALL: "/auth/logout-all",
        ME: "/auth/me",
    },
    USER: {
        DASHBOARD: "/user/dashboard",
        PROFILE: "/user/profile",
    },
    ADMIN: {
        DASHBOARD: "/admin/dashboard",
        USERS: "/admin/users",
        USER_BY_ID: "/admin/users/:id",
        SESSIONS: "/admin/sessions",
    },
    PROJECTS: {
        LIST: "/projects",
        DETAIL: "/projects/:id",
        CREATE: "/projects",
        UPDATE: "/projects/:id",
        DELETE: "/projects/:id",
    },
    ENQUIRIES: {
        LIST: "/enquiries",
        DETAIL: "/enquiries/:id",
        CREATE: "/enquiries",
        UPDATE_STATUS: "/enquiries/:id/status",
    },
};

export default ENDPOINTS;
