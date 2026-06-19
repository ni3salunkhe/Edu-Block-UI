import React, { useEffect, useState } from 'react';
import employerIntelligenceService from '../../../services/employerIntelligenceService';

const HiringRiskCenter = ({ candidateId }) => {
    const [risk, setRisk] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!candidateId) return;
        employerIntelligenceService.getCandidateRisk(candidateId)
            .then(setRisk)
            .finally(() => setLoading(false));
    }, [candidateId]);

    if (loading) return <div className="text-gray-500 text-sm">Loading risk intelligence...</div>;
    if (!risk) return null;

    const isHighRisk = risk.riskSignal === 'High Risk';
    const isMediumRisk = risk.riskSignal === 'Medium Risk';

    return (
        <div className={`rounded-xl border shadow-sm p-6 mb-6 ${
            isHighRisk ? 'bg-red-50 border-red-200' : 
            isMediumRisk ? 'bg-orange-50 border-orange-200' : 
            'bg-emerald-50 border-emerald-200'
        }`}>
            <h3 className="text-sm font-bold mb-4 uppercase tracking-wider text-gray-700">Hiring Risk Intelligence</h3>
            
            <div className="flex items-center gap-4 mb-4">
                <div className={`text-sm font-bold px-3 py-1 rounded-full border ${
                    isHighRisk ? 'bg-red-500/20 text-red-600 border-red-500/50' : 
                    isMediumRisk ? 'bg-orange-500/20 text-orange-600 border-orange-500/50' : 
                    'bg-emerald-500/20 text-emerald-600 border-emerald-500/50'
                }`}>
                    {risk.riskSignal}
                </div>
            </div>

            <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Risk Explanation</span>
                <ul className="space-y-1">
                    {risk.explanations?.map((exp, idx) => (
                        <li key={idx} className={`text-sm flex items-start gap-2 ${
                            isHighRisk ? 'text-red-200' : 
                            isMediumRisk ? 'text-orange-200' : 
                            'text-emerald-200'
                        }`}>
                            <span className="mt-0.5">•</span> {exp}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default HiringRiskCenter;
