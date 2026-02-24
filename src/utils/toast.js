import { toast } from "react-toastify";

const defaultOptions = {
    position: "top-right",
    autoClose: 3500,
};

export const showSuccess = (msg, options = {}) =>
    toast.success(msg, { ...defaultOptions, ...options });

export const showError = (msg, options = {}) =>
    toast.error(msg, { ...defaultOptions, ...options });

export const showInfo = (msg, options = {}) =>
    toast.info(msg, { ...defaultOptions, ...options });

export const showWarn = (msg, options = {}) =>
    toast.warn(msg, { ...defaultOptions, ...options });

export const showApiError = (err, fallback = "Something went wrong. Please try again.") => {
    const msg =
        err?.response?.data?.message ||
        err?.response?.data ||
        (err?.request ? "No response from server. Is the backend running?" : fallback);
    toast.error(typeof msg === "string" ? msg : fallback, defaultOptions);
};

export default { showSuccess, showError, showInfo, showWarn, showApiError };
