import React, { useEffect, useState } from 'react';
import employerIntelligenceService from '../../../services/employerIntelligenceService';

const InstitutionReputationCard = ({ candidateId }) => {
    const [institutions, setInstitutions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!candidateId) return;
        employerIntelligenceService.getCandidateInstitutionReputation(candidateId)
            .then(setInstitutions)
            .finally(() => setLoading(false));
    }, [candidateId]);

    if (loading) return <div className="text-gray-500 text-sm">Loading institution reputation...</div>;
    if (institutions.length === 0) return null;

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
            <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider">Institution Reputation Intelligence</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {institutions.map(inst => (
                    <div key={inst.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <h4 className="text-lg font-bold text-gray-900 mb-3">{inst.name}</h4>
                        
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <div>
                                <span className="text-[10px] uppercase font-bold text-gray-400 block">Trust Tier</span>
                                <span className="text-sm font-bold text-indigo-600">{inst.trustTier}</span>
                            </div>
                            <div>
                                <span className="text-[10px] uppercase font-bold text-gray-400 block">Trust Score</span>
                                <span className="text-sm font-bold text-gray-900">{inst.trustScore}</span>
                            </div>
                            <div>
                                <span className="text-[10px] uppercase font-bold text-gray-400 block">Verification Success</span>
                                <span className="text-sm font-bold text-emerald-600">{inst.verificationSuccessRate}%</span>
                            </div>
                            <div>
                                <span className="text-[10px] uppercase font-bold text-gray-400 block">Fraud Exposure</span>
                                <span className={`text-sm font-bold ${inst.fraudExposureCategory === 'Low' ? 'text-emerald-600' : 'text-orange-600'}`}>
                                    {inst.fraudExposureCategory}
                                </span>
                            </div>
                        </div>

                        <div className="bg-indigo-50 rounded p-3 border border-indigo-100">
                            <span className="text-[10px] uppercase font-bold text-indigo-600 block mb-1">Reputation Summary</span>
                            <p className="text-xs text-indigo-100 italic">"{inst.reputationSummary}"</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default InstitutionReputationCard;
