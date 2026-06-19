import React, { useEffect, useState } from 'react';
import employerIntelligenceService from '../../../services/employerIntelligenceService';
import { showApiError } from '../../../utils/toast';

const CandidateTrustIntelligence = ({ candidateId }) => {
    const [trust, setTrust] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!candidateId) return;
        const fetchTrust = async () => {
            try {
                const data = await employerIntelligenceService.getCandidateTrust(candidateId);
                setTrust(data);
            } catch (err) {
                showApiError(err, "Failed to load candidate trust intelligence");
            } finally {
                setLoading(false);
            }
        };
        fetchTrust();
    }, [candidateId]);

    if (loading) return <div className="p-4 text-gray-500">Loading Candidate Trust...</div>;
    if (!trust) return null;

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
            <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider">Candidate Trust Intelligence</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div>
                    <span className="text-xs uppercase font-bold text-gray-400 block">Trust Score</span>
                    <span className="text-3xl font-black text-indigo-600">{trust.trustScore}</span>
                </div>
                <div>
                    <span className="text-xs uppercase font-bold text-gray-400 block">Trust Tier</span>
                    <span className="text-xl font-bold text-gray-900 mt-1 block">{trust.trustTier}</span>
                </div>
                <div>
                    <span className="text-xs uppercase font-bold text-gray-400 block">Verification</span>
                    <span className="text-xl font-bold text-emerald-600 mt-1 block">{trust.verificationSuccess}%</span>
                </div>
                <div>
                    <span className="text-xs uppercase font-bold text-gray-400 block">Confidence</span>
                    <span className="text-xl font-bold text-blue-600 mt-1 block">{trust.credentialConfidence}</span>
                </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="text-xs uppercase font-bold text-gray-400 mb-2">Trust Explanation</h4>
                <ul className="space-y-1">
                    {trust.explanations?.map((exp, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                            <span className="text-indigo-600 mt-0.5">✓</span> {exp}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default CandidateTrustIntelligence;
