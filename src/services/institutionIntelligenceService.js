import api from './api';

const institutionIntelligenceService = {
    getOverview: async () => {
        const response = await api.get('/institution/intelligence/overview');
        return response.data;
    },
    getTrustHistory: async () => {
        const response = await api.get('/institution/intelligence/trust-history');
        return response.data;
    },
    getRiskEvents: async () => {
        const response = await api.get('/institution/intelligence/risk-events');
        return response.data;
    },
    getQualityAnalytics: async () => {
        const response = await api.get('/institution/intelligence/quality');
        return response.data;
    },
    getBenchmark: async () => {
        const response = await api.get('/institution/intelligence/benchmark');
        return response.data;
    },
    getReputation: async () => {
        const response = await api.get('/institution/intelligence/reputation');
        return response.data;
    },
    getRecommendations: async () => {
        const response = await api.get('/institution/intelligence/recommendations');
        return response.data;
    },
    getSimulation: async (fraudDelta = 0, verificationDelta = 0) => {
        const response = await api.get(`/institution/intelligence/simulate?fraudDelta=${fraudDelta}&verificationDelta=${verificationDelta}`);
        return response.data;
    }
};

export default institutionIntelligenceService;
