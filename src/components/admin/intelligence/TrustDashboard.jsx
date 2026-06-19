import React, { useEffect, useState } from 'react';
import adminIntelligenceService from '../../../services/adminIntelligenceService';
import { showApiError } from '../../../utils/toast';

const TrustDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [institutions, setInstitutions] = useState([]);
    const [stats, setStats] = useState(null);
    
    const [selectedInstId, setSelectedInstId] = useState(null);
    const [instDetails, setInstDetails] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);

    useEffect(() => {
        const fetchTrustData = async () => {
            try {
                const [instRes, statRes] = await Promise.all([
                    adminIntelligenceService.getInstitutionTrustProfiles(),
                    adminIntelligenceService.getTrustStatistics()
                ]);
                setInstitutions(instRes);
                setStats(statRes);
            } catch (err) {
                showApiError(err, 'Failed to load trust intelligence data.');
            } finally {
                setLoading(false);
            }
        };
        fetchTrustData();
    }, []);

    const handleViewDetails = async (id) => {
        setSelectedInstId(id);
        setDetailsLoading(true);
        try {
            const details = await adminIntelligenceService.getInstitutionTrustDetails(id);
            setInstDetails(details);
        } catch (err) {
            showApiError(err, 'Failed to load institution details.');
        } finally {
            setDetailsLoading(false);
        }
    };

    const closeDrawer = () => {
        setSelectedInstId(null);
        setInstDetails(null);
    };

    if (loading) return <div className="text-gray-500 p-6">Loading Trust Intelligence...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Institution Trust Intelligence</h2>
                    <p className="text-sm text-gray-500">Monitor AI-3 Trust Engine evaluations across the registry.</p>
                </div>
            </div>

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-gray-200">
                        <span className="text-xs uppercase font-bold text-gray-500 block mb-1">Average Trust</span>
                        <span className="text-2xl font-black text-gray-900">{stats.averageTrustScore.toFixed(1)}</span>
                    </div>
                    {Object.entries(stats.tierDistribution || {}).map(([tier, count]) => (
                        <div key={tier} className="bg-white p-4 rounded-xl border border-gray-200">
                            <span className="text-xs uppercase font-bold text-gray-500 block mb-1">{tier}</span>
                            <span className="text-2xl font-black text-gray-900">{count}</span>
                        </div>
                    ))}
                </div>
            )}

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm text-gray-700">
                    <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500 border-b border-gray-200">
                        <tr>
                            <th className="px-4 py-3">Institution</th>
                            <th className="px-4 py-3">Trust Score</th>
                            <th className="px-4 py-3">Trust Tier</th>
                            <th className="px-4 py-3">Verification Success</th>
                            <th className="px-4 py-3">Fraud Rate</th>
                            <th className="px-4 py-3 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {institutions.map(inst => (
                            <tr key={inst.id} className="hover:bg-gray-100/30 transition">
                                <td className="px-4 py-3 font-semibold text-gray-900">{inst.institutionName || 'Unknown'}</td>
                                <td className="px-4 py-3 font-mono font-bold text-blue-600">{inst.trustScore}</td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                                        inst.trustTier === 'VERY_HIGH' ? 'bg-green-900/50 text-green-400 border border-green-800' :
                                        inst.trustTier === 'HIGH' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                                        inst.trustTier === 'MEDIUM' ? 'bg-blue-50 text-blue-600 border border-blue-200' :
                                        inst.trustTier === 'LOW' ? 'bg-orange-50 text-orange-600 border border-orange-200' :
                                        'bg-red-50 text-red-600 border border-red-200'
                                    }`}>
                                        {inst.trustTier}
                                    </span>
                                </td>
                                <td className="px-4 py-3">{inst.verificationSuccessRate.toFixed(1)}%</td>
                                <td className="px-4 py-3">{inst.fraudDetectionRate.toFixed(1)}%</td>
                                <td className="px-4 py-3 text-center">
                                    <button 
                                        onClick={() => handleViewDetails(inst.id)}
                                        className="text-blue-600 hover:text-blue-600 text-xs font-semibold px-3 py-1 bg-blue-900/20 rounded">
                                        Details
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Inspect Drawer/Modal */}
            {selectedInstId && (
                <div className="fixed inset-0 bg-black/60 z-50 flex justify-end">
                    <div className="w-full max-w-lg bg-gray-50 border-l border-gray-200 h-full p-6 overflow-y-auto shadow-2xl">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-2xl font-black text-gray-900">Trust Details</h3>
                                <p className="text-gray-500 text-xs font-mono mt-1">{selectedInstId}</p>
                            </div>
                            <button onClick={closeDrawer} className="text-gray-400 hover:text-gray-900 text-xl">&times;</button>
                        </div>
                        
                        {detailsLoading || !instDetails ? (
                            <div className="text-center text-gray-400 mt-10">Loading profile history...</div>
                        ) : (
                            <div className="space-y-6">
                                <div className="bg-white p-4 rounded-xl border border-gray-200">
                                    <h4 className="text-xs uppercase font-bold text-gray-400 mb-2">Current Profile</h4>
                                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                                        <div>
                                            <span className="block text-gray-500 text-xs">Trust Score</span>
                                            <span className="font-bold text-blue-600 text-2xl">{instDetails.profile.trustScore}</span>
                                        </div>
                                        <div>
                                            <span className="block text-gray-500 text-xs">Trust Tier</span>
                                            <span className="font-bold text-gray-900">{instDetails.profile.trustTier}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-4">
                                        <span className="block text-gray-500 text-xs mb-1">Score Breakdown</span>
                                        <div className="space-y-2">
                                            {instDetails.profile.scoreBreakdown && Object.entries(instDetails.profile.scoreBreakdown.components || {}).map(([key, val]) => (
                                                <div key={key} className="flex justify-between text-xs">
                                                    <span className="text-gray-700">{key}</span>
                                                    <span className="font-mono text-emerald-600">{val} pts</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Trust History Visualization (Timeline) */}
                                <div className="bg-white p-4 rounded-xl border border-gray-200">
                                    <h4 className="text-xs uppercase font-bold text-gray-400 mb-4">Trust History Timeline</h4>
                                    <div className="relative border-l border-gray-200 ml-2 space-y-6">
                                        {instDetails.history && instDetails.history.length > 0 ? instDetails.history.map((hist, idx) => (
                                            <div key={idx} className="relative pl-6">
                                                <div className="absolute w-2 h-2 bg-blue-500 rounded-full -left-[4.5px] top-1.5"></div>
                                                <div className="text-xs text-gray-500 mb-1">{new Date(hist.timestamp).toLocaleDateString()}</div>
                                                <div className="text-sm">
                                                    <span className="font-bold text-gray-900">Score {hist.newScore}</span>
                                                    <span className="text-gray-400 mx-2">←</span>
                                                    <span className="text-gray-400">{hist.previousScore}</span>
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1">{hist.reason}</div>
                                            </div>
                                        )) : (
                                            <div className="pl-6 text-sm text-gray-400">No historical changes.</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TrustDashboard;
