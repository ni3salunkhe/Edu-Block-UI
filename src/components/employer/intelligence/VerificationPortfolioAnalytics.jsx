import React, { useEffect, useState } from 'react';
import employerIntelligenceService from '../../../services/employerIntelligenceService';
import { showApiError } from '../../../utils/toast';

const VerificationPortfolioAnalytics = () => {
    const [portfolio, setPortfolio] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPortfolio = async () => {
            try {
                const data = await employerIntelligenceService.getPortfolioAnalytics();
                setPortfolio(data);
            } catch (err) {
                showApiError(err, "Failed to load Portfolio Analytics");
            } finally {
                setLoading(false);
            }
        };
        fetchPortfolio();
    }, []);

    if (loading) return <div className="p-4 text-gray-500">Loading Portfolio Analytics...</div>;
    if (!portfolio) return null;

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Verification Portfolio Analytics</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center items-center">
                    <span className="text-xs uppercase font-bold text-gray-500 mb-2">Total Candidates</span>
                    <span className="text-3xl font-black text-indigo-600">{portfolio.totalCandidates}</span>
                </div>
                
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center items-center">
                    <span className="text-xs uppercase font-bold text-gray-500 mb-2">Verified Candidates</span>
                    <span className="text-3xl font-black text-emerald-600">{portfolio.verifiedCandidates}</span>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center items-center">
                    <span className="text-xs uppercase font-bold text-gray-500 mb-2">Flagged Candidates</span>
                    <span className="text-3xl font-black text-red-600">{portfolio.flaggedCandidates}</span>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center items-center">
                    <span className="text-xs uppercase font-bold text-gray-500 mb-2">Institution Diversity</span>
                    <span className="text-3xl font-black text-purple-400">{portfolio.institutionDiversity}</span>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-sm uppercase font-bold text-gray-400 mb-4">Portfolio Trust Health</h3>
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="font-bold text-emerald-600">Verified</span>
                            <span className="font-mono text-emerald-600">
                                {portfolio.totalCandidates > 0 ? Math.round((portfolio.verifiedCandidates / portfolio.totalCandidates) * 100) : 0}%
                            </span>
                        </div>
                        <div className="w-full bg-gray-50 rounded-full h-4">
                            <div className="bg-emerald-500 h-4 rounded-full" style={{ width: `${portfolio.totalCandidates > 0 ? (portfolio.verifiedCandidates / portfolio.totalCandidates) * 100 : 0}%` }}></div>
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="font-bold text-red-600">Flagged</span>
                            <span className="font-mono text-red-600">
                                {portfolio.totalCandidates > 0 ? Math.round((portfolio.flaggedCandidates / portfolio.totalCandidates) * 100) : 0}%
                            </span>
                        </div>
                        <div className="w-full bg-gray-50 rounded-full h-4">
                            <div className="bg-red-500 h-4 rounded-full" style={{ width: `${portfolio.totalCandidates > 0 ? (portfolio.flaggedCandidates / portfolio.totalCandidates) * 100 : 0}%` }}></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerificationPortfolioAnalytics;
