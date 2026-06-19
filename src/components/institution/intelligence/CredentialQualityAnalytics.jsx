import React, { useEffect, useState } from 'react';
import institutionIntelligenceService from '../../../services/institutionIntelligenceService';
import { showApiError } from '../../../utils/toast';

const CredentialQualityAnalytics = () => {
    const [quality, setQuality] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await institutionIntelligenceService.getQualityAnalytics();
                setQuality(data);
            } catch (err) {
                showApiError(err, "Failed to load Credential Quality Analytics");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="p-4 text-gray-500">Loading Quality Analytics...</div>;
    if (!quality) return null;

    const conf = quality.confidenceDistribution || {};
    const statuses = quality.statusBreakdown || {};

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Credential Quality Analytics</h2>

            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <span className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Issued</span>
                    <span className="text-2xl font-black text-gray-900">{quality.totalIssued}</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <span className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Verified</span>
                    <span className="text-2xl font-black text-emerald-600">{quality.verified}</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <span className="block text-[10px] uppercase font-bold text-gray-500 mb-1">AI Verified</span>
                    <span className="text-2xl font-black text-blue-600">{quality.aiVerified}</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <span className="block text-[10px] uppercase font-bold text-gray-500 mb-1">AI Flagged</span>
                    <span className="text-2xl font-black text-red-600">{quality.aiFlagged}</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <span className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Pending</span>
                    <span className="text-2xl font-black text-orange-600">{quality.pending}</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <span className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Anchored</span>
                    <span className="text-2xl font-black text-purple-400">{quality.anchored}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                    <h3 className="text-sm uppercase font-bold text-gray-400 mb-4">AI Verification Confidence</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                            <span className="text-emerald-600 font-bold text-sm">Very High (90-100)</span>
                            <span className="font-mono text-gray-900">{conf.VERY_HIGH || 0}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                            <span className="text-blue-600 font-bold text-sm">High (80-89)</span>
                            <span className="font-mono text-gray-900">{conf.HIGH || 0}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                            <span className="text-yellow-400 font-bold text-sm">Medium (60-79)</span>
                            <span className="font-mono text-gray-900">{conf.MEDIUM || 0}</span>
                        </div>
                        <div className="flex justify-between items-center pb-2">
                            <span className="text-red-600 font-bold text-sm">Low (&lt; 60)</span>
                            <span className="font-mono text-gray-900">{conf.LOW || 0}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200">
                    <h3 className="text-sm uppercase font-bold text-gray-400 mb-4">Credential Status Breakdown</h3>
                    <div className="space-y-3">
                        {Object.entries(statuses).map(([status, count]) => (
                            <div key={status} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-200">
                                <span className="text-xs font-mono font-bold text-gray-700">{status}</span>
                                <span className="font-mono text-gray-900">{count}</span>
                            </div>
                        ))}
                        {Object.keys(statuses).length === 0 && (
                            <div className="text-gray-400 text-sm italic">No credentials issued.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CredentialQualityAnalytics;
