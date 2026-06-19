import React, { useEffect, useState } from 'react';
import institutionIntelligenceService from '../../../services/institutionIntelligenceService';
import { showApiError } from '../../../utils/toast';

const TrustCommandCenter = () => {
    const [overview, setOverview] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await institutionIntelligenceService.getOverview();
                setOverview(data);
            } catch (err) {
                showApiError(err, "Failed to load Trust Overview");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="p-4 text-gray-500">Loading Trust Command Center...</div>;
    if (!overview) return null;

    const trendIndicator = overview.trend > 0 ? '↑ Improving' : (overview.trend < 0 ? '↓ Declining' : '→ Stable');
    const trendColor = overview.trend > 0 ? 'text-green-400' : (overview.trend < 0 ? 'text-red-600' : 'text-gray-500');

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Trust Command Center</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center items-center">
                    <span className="text-xs uppercase font-bold text-gray-500 mb-2">Trust Score</span>
                    <span className="text-4xl font-black text-blue-600">{overview.trustScore}</span>
                </div>
                
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center items-center">
                    <span className="text-xs uppercase font-bold text-gray-500 mb-2">Trust Tier</span>
                    <span className="text-2xl font-black text-emerald-600">{overview.trustTier}</span>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center items-center">
                    <span className="text-xs uppercase font-bold text-gray-500 mb-2">30 Day Trend</span>
                    <span className={`text-2xl font-black ${trendColor}`}>
                        {trendIndicator} ({overview.trend > 0 ? '+' : ''}{overview.trend})
                    </span>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center items-center">
                    <span className="text-xs uppercase font-bold text-gray-500 mb-2">Risk Level</span>
                    <span className={`text-2xl font-black ${
                        overview.riskLevel === 'HIGH' ? 'text-red-600' : 
                        overview.riskLevel === 'MEDIUM' ? 'text-orange-600' : 'text-green-400'
                    }`}>{overview.riskLevel}</span>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200">
                <h3 className="text-sm uppercase font-bold text-gray-400 mb-4">Trust Score Breakdown</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(overview.scoreBreakdown || {}).map(([key, value]) => (
                        <div key={key} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <span className="block text-xs text-gray-500 mb-1">{key}</span>
                            <span className={`text-lg font-mono font-bold ${typeof value === 'number' && value < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                                {typeof value === 'number' && value > 0 ? '+' : ''}{value}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TrustCommandCenter;
