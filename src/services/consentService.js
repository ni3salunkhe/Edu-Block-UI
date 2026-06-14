import api from "./api";

// ── Individual Consent APIs ────────────────────────────────────────────────────

/**
 * Fetch consent view model for the authenticated individual.
 * Returns ConsentViewModel: { pending: ConsentDTO[], active: ConsentDTO[], history: ConsentDTO[] }
 */
export const getMyConsents = () => api.get("/individual/consents");

/**
 * Approve a consent request by ID.
 */
export const approveConsent = (consentId) =>
    api.post(`/individual/consents/${consentId}/approve`);

/**
 * Reject a consent request by ID.
 */
export const rejectConsent = (consentId) =>
    api.post(`/individual/consents/${consentId}/reject`);

/**
 * Revoke an active consent by ID.
 */
export const revokeConsent = (consentId) =>
    api.post(`/individual/consents/${consentId}/revoke`);

// ── Employer Consent APIs ──────────────────────────────────────────────────────

/**
 * Fetch all consent requests made by the authenticated employer.
 * Returns List<EmployerConsentListDTO>.
 */
export const getEmployerConsents = () => api.get("/consent/employer");

/**
 * Request consent from an individual (employer action).
 */
export const requestConsentAccess = (individualId) =>
    api.post("/consent/request", { individualId });
