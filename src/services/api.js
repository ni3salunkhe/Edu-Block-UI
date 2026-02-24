import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL
});

// REQUEST INTERCEPTOR
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// RESPONSE INTERCEPTOR
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (!error.response) {
            console.error("Network error - Unable to reach backend:", error.message);
            console.error("API Base URL:", api.defaults.baseURL);
            return Promise.reject(error);
        }

        const status = error.response.status;
        const requestUrl = error.config?.url || '';

        console.error(`API Error ${status}:`, error.response.data);

        // Check if this is an MFA-related endpoint
        const isMFAEndpoint = requestUrl.includes('/mfa/') ||
            requestUrl.includes('/auth/admin/mfa');

        if (status === 401) {
            // Only clear and redirect if not on login/register/MFA pages
            const currentPath = window.location.pathname;
            const isAuthPage = currentPath === "/login" ||
                currentPath === "/register" ||
                currentPath === "/admin/mfa" ||
                currentPath === "/admin/mfa/setup";

            // Don't redirect if it's an MFA endpoint or we're on an auth page
            if (!isAuthPage && !isMFAEndpoint) {
                localStorage.clear();
                window.location.href = "/login";
            }
        }

        if (status === 403) {
            // Only redirect to unauthorized if not on login/register/MFA pages
            const currentPath = window.location.pathname;
            const isAuthPage = currentPath === "/login" ||
                currentPath === "/register" ||
                currentPath === "/admin/mfa" ||
                currentPath === "/admin/mfa/setup";

            if (!isAuthPage && !isMFAEndpoint) {
                window.location.href = "/unauthorized";
            }
        }

        if (status === 429) {
            alert("Too many requests. Please try again later.");
        }

        return Promise.reject(error);
    }
);

export default api;
