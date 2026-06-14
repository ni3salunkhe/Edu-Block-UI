import api from "./api";

// ── Document APIs ──────────────────────────────────────────────────────────────

/**
 * Fetch all documents for the authenticated individual.
 * Returns List<DocumentDTO> with trustMetadata fully populated.
 */
export const getMyDocuments = () => api.get("/documents/my");

/**
 * Fetch a single document by ID with full trust metadata.
 * Returns DocumentDTO.
 */
export const getDocumentById = (id) => api.get(`/documents/${id}`);

/**
 * Upload a new document.
 * formData should contain: file, documentType.
 */
export const uploadDocument = (formData) =>
    api.post("/documents/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });

/**
 * Acknowledge and remove a rejected document.
 */
export const acknowledgeRejection = (id) =>
    api.delete(`/documents/${id}/acknowledge-rejection`);

// ── Summary API ────────────────────────────────────────────────────────────────

/**
 * Fetch individual summary statistics.
 * Returns IndividualSummaryDTO: { totalDocuments, pendingConsents, activeEmployers }
 */
export const getIndividualSummary = () => api.get("/individual/summary");

// ── Association APIs ───────────────────────────────────────────────────────────

/**
 * Fetch all institution associations for the authenticated student.
 * Returns List<InstitutionAssociationResponseDTO>.
 */
export const getMyAssociations = () => api.get("/student/associations");
