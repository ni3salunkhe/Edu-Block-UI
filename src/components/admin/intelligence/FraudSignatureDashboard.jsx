import React, { useEffect, useState } from 'react';
import adminIntelligenceService from '../../../services/adminIntelligenceService';
import { showApiError } from '../../../utils/toast';

const FraudSignatureDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [signatures, setSignatures] = useState([]);

    useEffect(() => {
        const fetchSignatures = async () => {
            try {
                const res = await adminIntelligenceService.getSignatures();
                setSignatures(res);
            } catch (err) {
                showApiError(err, 'Failed to load fraud signatures.');
            } finally {
                setLoading(false);
            }
        };
        fetchSignatures();
    }, []);

    if (loading) return <div className="text-gray-500 p-6">Loading Fraud Signatures...</div>;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Fraud Signature Library</h2>
                    <p className="text-sm text-gray-500">Library of known fraud patterns, templates, and reference recycling techniques.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {signatures.length === 0 ? (
                    <div className="col-span-full p-8 text-center text-gray-400 bg-white rounded-xl border border-gray-200">
                        No fraud signatures registered.
                    </div>
                ) : signatures.map(sig => (
                    <div key={sig.id} className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 flex flex-col relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-3">
                            <span className="bg-red-50 text-red-600 border border-red-200 text-[10px] font-bold px-2 py-1 rounded">
                                ACTIVE
                            </span>
                        </div>
                        <h3 className="font-bold text-gray-900 text-lg mb-1 pr-16">{sig.name}</h3>
                        <p className="text-gray-500 text-xs mb-4 flex-1">{sig.description}</p>
                        
                        <div className="bg-gray-50 rounded p-3 mb-4">
                            <span className="text-xs font-semibold text-gray-400 uppercase block mb-1">Pattern Rules</span>
                            <pre className="text-[10px] text-emerald-600 font-mono overflow-hidden text-ellipsis whitespace-pre-wrap max-h-24">
                                {sig.patternRulesJson}
                            </pre>
                        </div>
                        
                        <div className="flex justify-between items-center mt-auto border-t border-gray-200 pt-3">
                            <div>
                                <span className="block text-[10px] uppercase font-bold text-gray-400">Historical Campaigns</span>
                                <span className="font-mono text-gray-900">{sig.historicalCampaignsCount}</span>
                            </div>
                            <button className="text-blue-600 hover:text-blue-600 text-xs font-semibold px-3 py-1 bg-blue-900/20 rounded hover:bg-blue-900/40 transition">
                                Inspect
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FraudSignatureDashboard;
