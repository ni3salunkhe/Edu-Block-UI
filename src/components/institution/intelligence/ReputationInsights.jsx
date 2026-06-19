import React, { useEffect, useState } from 'react';
import institutionIntelligenceService from '../../../services/institutionIntelligenceService';
import { showApiError } from '../../../utils/toast';

const ReputationInsights = () => {
    const [reputation, setReputation] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await institutionIntelligenceService.getReputation();
                setReputation(data);
            } catch (err) {
                showApiError(err, "Failed to load Reputation Insights");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="p-4 text-gray-500">Loading Reputation Insights...</div>;
    if (!reputation) return null;

    const getStatusColor = (status) => {
        if (status === 'Positive' || status === 'Excellent' || status === 'High' || status === 'Low') return 'text-emerald-600';
        if (status === 'Stable') return 'text-blue-600';
        return 'text-orange-600'; // Elevated, Needs Improvement
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end mb-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Reputation Insights</h2>
                    <p className="text-sm text-gray-500">High-level semantic analysis of your institution's standing in the ecosystem.</p>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center items-center">
                    <span className="text-xs uppercase font-bold text-gray-500 mb-2">Trust Growth</span>
                    <span className={`text-xl font-black ${getStatusColor(reputation.trustGrowth)}`}>{reputation.trustGrowth}</span>
                </div>
                
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center items-center">
                    <span className="text-xs uppercase font-bold text-gray-500 mb-2">Verification Quality</span>
                    <span className={`text-xl font-black text-center ${getStatusColor(reputation.verificationQuality)}`}>{reputation.verificationQuality}</span>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center items-center">
                    <span className="text-xs uppercase font-bold text-gray-500 mb-2">Credential Reliability</span>
                    <span className={`text-xl font-black ${getStatusColor(reputation.credentialReliability)}`}>{reputation.credentialReliability}</span>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center items-center">
                    <span className="text-xs uppercase font-bold text-gray-500 mb-2">Risk Exposure</span>
                    <span className={`text-xl font-black ${getStatusColor(reputation.riskExposure)}`}>{reputation.riskExposure}</span>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-sm uppercase font-bold text-gray-400 mb-4">AI Derived Summary</h3>
                <div className="space-y-3">
                    {reputation.summaries && reputation.summaries.length > 0 ? (
                        reputation.summaries.map((summary, idx) => (
                            <div key={idx} className="flex items-start gap-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <span className="text-blue-600 mt-0.5">✦</span>
                                <span className="text-gray-700 font-semibold">{summary}</span>
                            </div>
                        ))
                    ) : (
                        <div className="text-gray-400 italic">No reputation summaries available.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReputationInsights;
