import api from "./api";

// Login does NOT require token
export const loginRequest = (data) =>
    api.post("/auth/login", data);

export const verifyAdminMFA = (data) =>
    api.post("/auth/admin/mfa/verify", data);

export const setupAdminMFA = () =>
    api.post("/auth/admin/mfa/setup");
