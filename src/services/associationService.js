import api from "./api";

// ── Institution APIs ───────────────────────────────────────────────────────────

/**
 * Fetch all registered institutions.
 * Returns List<InstitutionResponseDTO>.
 */
export const listInstitutions = () => api.get("/institutions");

/**
 * Request association with an institution.
 * @param {string} institutionId - UUID of the institution
 * @param {string} enrollmentNumber - Student enrollment number
 * Returns InstitutionAssociationResponseDTO.
 */
export const requestAssociation = (institutionId, enrollmentNumber) =>
    api.post(`/student/institutions/${institutionId}/associate`, { enrollmentNumber });

/**
 * Fetch all associations for the authenticated student.
 * Returns List<InstitutionAssociationResponseDTO>.
 */
export const getMyAssociations = () => api.get("/student/associations");
