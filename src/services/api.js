import axios from "axios";
import { showWarn, showError } from "../utils/toast";

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
            // Network-level error (backend unreachable)
            return Promise.reject(error);
        }

        const status = error.response.status;
        const requestUrl = error.config?.url || '';

        const isMFAEndpoint = requestUrl.includes('/mfa/') ||
            requestUrl.includes('/auth/admin/mfa');

        if (status === 401) {
            const currentPath = window.location.pathname;
            const isAuthPage = ["/login", "/register", "/admin/mfa", "/admin/mfa/setup"]
                .includes(currentPath);
            if (!isAuthPage && !isMFAEndpoint) {
                localStorage.clear();
                window.location.href = "/login";
            }
        }

        if (status === 403) {
            const currentPath = window.location.pathname;
            const isAuthPage = ["/login", "/register", "/admin/mfa", "/admin/mfa/setup"]
                .includes(currentPath);
            if (!isAuthPage && !isMFAEndpoint) {
                window.location.href = "/unauthorized";
            }
        }

        if (status === 429) {
            const retryAfter = error.response.headers?.["retry-after"];
            const seconds = retryAfter ? parseInt(retryAfter, 10) : 60;
            showWarn(
                `Too many requests. Please wait ${seconds} second${seconds !== 1 ? "s" : ""} and try again.`,
                { autoClose: seconds * 1000 > 10000 ? 10000 : seconds * 1000 }
            );
        }

        return Promise.reject(error);
    }
);

export default api;
