import React, { useEffect, useState } from 'react';
import employerIntelligenceService from '../../../services/employerIntelligenceService';

const CredentialIntelligence = ({ candidateId }) => {
    const [credentials, setCredentials] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!candidateId) return;
        employerIntelligenceService.getCandidateCredentials(candidateId)
            .then(setCredentials)
            .finally(() => setLoading(false));
    }, [candidateId]);

    if (loading) return <div className="text-gray-500 text-sm">Loading credentials...</div>;
    if (credentials.length === 0) return null;

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
            <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider">Credential Intelligence</h3>
            
            <div className="space-y-4">
                {credentials.map(cred => (
                    <div key={cred.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <div className="flex flex-wrap justify-between items-start gap-4 mb-3">
                            <div>
                                <span className="text-xs uppercase font-bold text-gray-400 block">Type</span>
                                <span className="font-semibold text-gray-900">{cred.type || 'Unknown Type'}</span>
                            </div>
                            <div>
                                <span className="text-xs uppercase font-bold text-gray-400 block">Institution</span>
                                <span className="font-semibold text-gray-700">{cred.institution}</span>
                            </div>
                            <div>
                                <span className="text-xs uppercase font-bold text-gray-400 block">Status</span>
                                <span className="font-bold text-indigo-600">{cred.status}</span>
                            </div>
                            <div>
                                <span className="text-xs uppercase font-bold text-gray-400 block">Confidence</span>
                                <span className={`font-bold ${cred.confidenceLevel === 'HIGH' ? 'text-emerald-600' : 'text-orange-600'}`}>
                                    {cred.confidenceLevel}
                                </span>
                            </div>
                            <div>
                                <span className="text-xs uppercase font-bold text-gray-400 block">Blockchain</span>
                                <span className={`font-bold ${cred.blockchainStatus === 'ANCHORED' ? 'text-blue-600' : 'text-gray-500'}`}>
                                    {cred.blockchainStatus}
                                </span>
                            </div>
                        </div>
                        
                        <div className="mt-3 pt-3 border-t border-gray-200">
                            <span className="text-xs uppercase font-bold text-gray-400 block mb-1">Explainability</span>
                            <div className="flex gap-2 text-xs">
                                {cred.explanations?.map((exp, idx) => (
                                    <span key={idx} className="bg-white px-2 py-1 rounded text-gray-700 border border-gray-200">
                                        {exp}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CredentialIntelligence;
