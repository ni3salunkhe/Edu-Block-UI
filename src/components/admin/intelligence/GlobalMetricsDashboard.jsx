import React, { useEffect, useState } from 'react';
import adminIntelligenceService from '../../../services/adminIntelligenceService';
import { showApiError } from '../../../utils/toast';

const GlobalMetricsDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    useEffect(() => {
        const fetchOverview = async () => {
            try {
                const res = await adminIntelligenceService.getGlobalOverview();
                setData(res);
            } catch (err) {
                showApiError(err, 'Failed to load global intelligence overview.');
            } finally {
                setLoading(false);
            }
        };
        fetchOverview();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64 text-gray-500">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-4 font-semibold">Loading Global Intelligence...</span>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="space-y-6">
            {/* Health Score Banner */}
            <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl p-6 border border-blue-200 shadow-lg flex items-center justify-between">
                <div>
                    <h2 className="text-blue-200 text-sm font-bold tracking-widest uppercase">Platform Intelligence Score</h2>
                    <p className="text-gray-700 text-sm mt-1 max-w-lg">
                        This score reflects the overall health, trust stability, and operational security of the registry network based on AI-2 and AI-6 indicators.
                    </p>
                </div>
                <div className="flex flex-col items-end">
                    <div className="text-5xl font-black text-gray-900">{data.platformIntelligenceScore}<span className="text-2xl text-blue-600">/100</span></div>
                    {data.platformIntelligenceScore >= 80 ? (
                        <span className="text-green-400 text-sm font-bold uppercase mt-1">Healthy</span>
                    ) : data.platformIntelligenceScore >= 50 ? (
                        <span className="text-yellow-400 text-sm font-bold uppercase mt-1">Degraded</span>
                    ) : (
                        <span className="text-red-600 text-sm font-bold uppercase mt-1">Critical</span>
                    )}
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard title="Documents Processed" value={data.documentsProcessed} icon="📄" trend="↑ +12%" trendColor="text-green-400" />
                <KPICard title="AI Verified" value={data.aiVerified} icon="✓" trend="↑ +15%" trendColor="text-green-400" />
                <KPICard title="AI Flagged" value={data.aiFlagged} icon="⚠" trend="↓ -2%" trendColor="text-green-400" />
                <KPICard title="Institutions Mapped" value={data.institutions} icon="🏛" trend="↑ +3" trendColor="text-green-400" />
                
                <KPICard title="Active Campaigns" value={data.activeCampaigns} icon="🕸" trend="↑ +1" trendColor="text-red-600" />
                <KPICard title="Active Clusters" value={data.activeClusters} icon="🔄" trend="↑ +2" trendColor="text-orange-600" />
                <KPICard title="Average Trust Score" value={data.averageTrustScore.toFixed(1)} icon="⭐" trend="↓ -1.2" trendColor="text-orange-600" />
                <KPICard title="Reviewer Overrides" value={data.reviewerOverrides} icon="⚖" trend="↑ +5%" trendColor="text-red-600" />
            </div>
        </div>
    );
};

const KPICard = ({ title, value, icon, trend, trendColor }) => (
    <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm flex flex-col relative overflow-hidden">
        <div className="flex justify-between items-start">
            <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">{title}</span>
            <span className="text-xl opacity-80">{icon}</span>
        </div>
        <div className="mt-3 text-3xl font-black text-gray-900">{value}</div>
        {trend && (
            <div className={`mt-2 text-xs font-semibold ${trendColor}`}>
                {trend} <span className="text-gray-400 font-medium">vs last month</span>
            </div>
        )}
    </div>
);

export default GlobalMetricsDashboard;
