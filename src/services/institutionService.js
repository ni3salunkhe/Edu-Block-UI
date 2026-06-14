import api from "./api";

/**
 * Fetch the profile info for the logged-in institution.
 * Returns DTO: { institutionId, name, code, status, trustLevel, officialEmail }
 */
export const getInstitutionProfile = () =>
    api.get("/institution/profile");

/**
 * Fetch pending student association requests.
 * Returns array of InstitutionAssociationResponseDTO.
 */
export const getPendingAssociations = () =>
    api.get("/institution/associations/pending");

/**
 * Fetch issued credential documents for this institution.
 * Returns array of InstitutionIssuedDocumentDTO.
 */
export const getIssuedCredentials = () =>
    api.get("/institution/credentials");

/**
 * Fetch all student association requests.
 * Returns array of InstitutionAssociationResponseDTO.
 */
export const getInstitutionAssociations = () =>
    api.get("/institution/associations");

/**
 * Approve student association request.
 */
export const approveAssociation = (associationId) =>
    api.post(`/institution/associations/${associationId}/approve`);

/**
 * Reject student association request with reason.
 */
export const rejectAssociation = (associationId, reason) =>
    api.post(`/institution/associations/${associationId}/reject`, { reason });

/**
 * Revoke student association request with reason.
 */
export const revokeAssociation = (associationId, reason) =>
    api.post(`/institution/associations/${associationId}/revoke`, { reason });

/**
 * Issue a credential document.
 * formData should contain: file, studentId, associationId, documentType, credentialReference.
 */
export const issueCredential = (formData) =>
    api.post("/institution/credentials/issue", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

