import api from './api';

const adminIntelligenceService = {
    // Global Intelligence
    getGlobalOverview: async () => {
        const response = await api.get('/admin/intelligence/global-overview');
        return response.data;
    },

    // Fraud Campaign Intelligence
    getCampaigns: async (page = 0, size = 10) => {
        const response = await api.get(`/admin/intelligence/campaigns?page=${page}&size=${size}`);
        return response.data;
    },
    getCampaignDetails: async (id) => {
        const response = await api.get(`/admin/intelligence/campaigns/${id}`);
        return response.data;
    },

    // Trust Intelligence
    getInstitutionTrustProfiles: async () => {
        const response = await api.get('/admin/trust/institutions');
        return response.data;
    },
    getInstitutionTrustDetails: async (id) => {
        const response = await api.get(`/admin/trust/institutions/${id}`);
        return response.data;
    },
    getTrustStatistics: async () => {
        const response = await api.get('/admin/trust/statistics');
        return response.data;
    },

    // Learning & Drift Intelligence
    getDriftAnalytics: async () => {
        const response = await api.get('/admin/copilot/drift');
        return response.data;
    },
    getVerifierQualityMetrics: async () => {
        const response = await api.get('/admin/learning/verifiers/quality');
        return response.data;
    },
    getInstitutionTrends: async () => {
        const response = await api.get('/admin/learning/institutions/trends');
        return response.data;
    },
    getRulePerformance: async () => {
        const response = await api.get('/admin/learning/rules/performance');
        return response.data;
    },

    // Network Intelligence
    getNetworkSummary: async () => {
        const response = await api.get('/admin/intelligence/network-summary');
        return response.data;
    },
    getClusters: async (page = 0, size = 10) => {
        const response = await api.get(`/admin/intelligence/clusters?page=${page}&size=${size}`);
        return response.data;
    },
    getClusterDetails: async (id) => {
        const response = await api.get(`/admin/intelligence/clusters/${id}`);
        return response.data;
    },

    // Intelligence Evidence Explorer
    getEvidence: async (page = 0, size = 10) => {
        const response = await api.get(`/admin/intelligence/evidence?page=${page}&size=${size}`);
        return response.data;
    },
    getEvidenceDetails: async (id) => {
        const response = await api.get(`/admin/intelligence/evidence/${id}`);
        return response.data;
    },

    // Fraud Signature Library
    getSignatures: async (page = 0, size = 10) => {
        const response = await api.get(`/admin/intelligence/signatures?page=${page}&size=${size}`);
        return response.data;
    },

    // Rule Configuration Center
    getRules: async () => {
        const response = await api.get('/admin/intelligence/rules');
        return response.data;
    },
    updateRule: async (ruleName, data) => {
        const response = await api.patch(`/admin/intelligence/rules/${ruleName}`, data);
        return response.data;
    },

    // Investigation Audit Center
    getAuditLogs: async () => {
        const response = await api.get('/admin/audit');
        return response.data;
    }
};

export default adminIntelligenceService;
