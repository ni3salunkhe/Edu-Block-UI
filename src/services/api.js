import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8081/api"
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
            console.error("Network error");
            return Promise.reject(error);
        }

        const status = error.response.status;

        if (status === 401) {
            localStorage.clear();
            window.location.href = "/login";
        }

        if (status === 403) {
            window.location.href = "/unauthorized";
        }

        if (status === 429) {
            alert("Too many requests. Please try again later.");
        }

        return Promise.reject(error);
    }
);

export default api;
