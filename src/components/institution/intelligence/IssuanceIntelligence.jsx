import React, { useEffect, useState } from 'react';
import institutionIntelligenceService from '../../../services/institutionIntelligenceService';
import { showApiError } from '../../../utils/toast';

const IssuanceIntelligence = () => {
    const [quality, setQuality] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await institutionIntelligenceService.getQualityAnalytics();
                setQuality(data);
            } catch (err) {
                showApiError(err, "Failed to load Issuance Intelligence");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="p-4 text-gray-500">Loading Issuance Intelligence...</div>;
    if (!quality) return null;

    const trends = quality.issuanceTrends || { daily: 0, weekly: 0, monthly: 0 };
    const types = quality.credentialTypes || {};

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Issuance Intelligence</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center items-center">
                    <span className="text-xs uppercase font-bold text-gray-500 mb-2">Daily Issuance</span>
                    <span className="text-3xl font-black text-blue-600">{trends.daily}</span>
                </div>
                
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center items-center">
                    <span className="text-xs uppercase font-bold text-gray-500 mb-2">Weekly Issuance</span>
                    <span className="text-3xl font-black text-emerald-600">{trends.weekly}</span>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center items-center">
                    <span className="text-xs uppercase font-bold text-gray-500 mb-2">Monthly Issuance</span>
                    <span className="text-3xl font-black text-purple-400">{trends.monthly}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-sm uppercase font-bold text-gray-400 mb-4">Verification Outcomes</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                            <span className="text-emerald-600 font-bold text-sm">Verified</span>
                            <span className="font-mono text-gray-900">{quality.verified}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                            <span className="text-red-600 font-bold text-sm">Flagged</span>
                            <span className="font-mono text-gray-900">{quality.aiFlagged}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                            <span className="text-orange-600 font-bold text-sm">Pending</span>
                            <span className="font-mono text-gray-900">{quality.pending}</span>
                        </div>
                        <div className="flex justify-between items-center pb-2">
                            <span className="text-gray-500 font-bold text-sm">Total Issued</span>
                            <span className="font-mono text-gray-900">{quality.totalIssued}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-sm uppercase font-bold text-gray-400 mb-4">Credential Types</h3>
                    <div className="space-y-3">
                        {Object.entries(types).map(([type, count]) => (
                            <div key={type} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-200">
                                <span className="text-xs font-mono font-bold text-blue-600">{type}</span>
                                <span className="font-mono text-gray-900">{count}</span>
                            </div>
                        ))}
                        {Object.keys(types).length === 0 && (
                            <div className="text-gray-400 text-sm italic">No credentials issued.</div>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-sm uppercase font-bold text-gray-400 mb-4">Blockchain Anchoring Metrics</h3>
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <span className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Total Anchored</span>
                        <span className="text-2xl font-black text-gray-900">{quality.anchored}</span>
                    </div>
                    <div>
                        <span className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Pending Anchor</span>
                        <span className="text-2xl font-black text-orange-600">{quality.totalIssued - quality.anchored}</span>
                    </div>
                    <div>
                        <span className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Anchor Success Rate</span>
                        <span className="text-2xl font-black text-emerald-600">
                            {quality.totalIssued > 0 ? ((quality.anchored / quality.totalIssued) * 100).toFixed(1) : 0}%
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IssuanceIntelligence;
