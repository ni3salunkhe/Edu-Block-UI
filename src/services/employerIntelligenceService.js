import api from './api';

const employerIntelligenceService = {
    getOverview: async () => {
        const response = await api.get('/employer/intelligence/overview');
        return response.data;
    },
    getCandidateTrust: async (id) => {
        const response = await api.get(`/employer/intelligence/candidate/${id}`);
        return response.data;
    },
    getCandidateCredentials: async (id) => {
        const response = await api.get(`/employer/intelligence/candidate/${id}/credentials`);
        return response.data;
    },
    getCandidateTimeline: async (id) => {
        const response = await api.get(`/employer/intelligence/candidate/${id}/timeline`);
        return response.data;
    },
    getCandidateInstitutionReputation: async (id) => {
        const response = await api.get(`/employer/intelligence/candidate/${id}/institution`);
        return response.data;
    },
    getCandidateRisk: async (id) => {
        const response = await api.get(`/employer/intelligence/candidate/${id}/risk`);
        return response.data;
    },
    getPortfolioAnalytics: async () => {
        const response = await api.get('/employer/intelligence/portfolio');
        return response.data;
    },
    compareCandidates: async (candidateA, candidateB) => {
        const response = await api.get(`/employer/intelligence/compare?candidateA=${candidateA}&candidateB=${candidateB}`);
        return response.data;
    },
    getRecommendations: async () => {
        const response = await api.get('/employer/intelligence/recommendations');
        return response.data;
    }
};

export default employerIntelligenceService;
