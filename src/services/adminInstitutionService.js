import api from "./api";

// ── Institution CRUD ───────────────────────────────────────────────────────────

/**
 * List all institutions.
 * Returns List<InstitutionResponseDTO>.
 */
export const listInstitutions = () => api.get("/admin/institutions");

/**
 * Get a single institution by ID.
 * Returns InstitutionResponseDTO.
 */
export const getInstitution = (id) => api.get(`/admin/institutions/${id}`);

/**
 * Create a new institution.
 * @param {object} data - { name, code, website, officialEmail, city, state, country }
 * Returns InstitutionResponseDTO.
 */
export const createInstitution = (data) => api.post("/admin/institutions", data);

// ── Trust Level Operations ─────────────────────────────────────────────────────

/**
 * Verify an institution (REGISTERED → VERIFIED).
 * @param {string} id - Institution UUID
 * @param {string} reason - Reason for verification
 */
export const verifyInstitution = (id, reason) =>
    api.post(`/admin/institutions/${id}/verify`, { reason });

/**
 * Accredit an institution (VERIFIED → ACCREDITED).
 * @param {string} id - Institution UUID
 * @param {string} reason - Reason for accreditation
 */
export const accreditInstitution = (id, reason) =>
    api.post(`/admin/institutions/${id}/accredit`, { reason });

// ── Audit History ──────────────────────────────────────────────────────────────

/**
 * Get trust level audit history for an institution.
 * Returns List<InstitutionAuditResponseDTO>.
 */
export const getAuditHistory = (id) =>
    api.get(`/admin/institutions/${id}/audit-history`);

// ── User Mapping ───────────────────────────────────────────────────────────────

/**
 * Map a user (with INSTITUTION role) to an institution entity.
 * @param {string} institutionId - Institution UUID
 * @param {string} userId - User UUID
 */
export const mapUserToInstitution = (institutionId, userId) =>
    api.post(`/admin/institutions/${institutionId}/users/${userId}`);

/**
 * Remove a user's institution mapping.
 * @param {string} userId - User UUID
 */
export const removeUserFromInstitution = (userId) =>
    api.delete(`/admin/institutions/users/${userId}`);

// ── Admin User List (for picker) ───────────────────────────────────────────────

/**
 * Fetch all users (admin). Used to pick INSTITUTION-role users for mapping.
 * Returns List<UserDTO>.
 */
export const listAllUsers = () => api.get("/admin/users");
