import React, { useEffect, useState } from 'react';
import institutionIntelligenceService from '../../../services/institutionIntelligenceService';
import { showApiError } from '../../../utils/toast';

const BenchmarkingCenter = () => {
    const [benchmark, setBenchmark] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await institutionIntelligenceService.getBenchmark();
                setBenchmark(data);
            } catch (err) {
                showApiError(err, "Failed to load Benchmarking Data");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="p-4 text-gray-500">Loading Benchmarking Center...</div>;
    if (!benchmark) return null;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end mb-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Benchmarking Center</h2>
                    <p className="text-sm text-gray-500">Compare your institution's trust performance against the anonymized network average.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center items-center">
                    <span className="text-xs uppercase font-bold text-gray-500 mb-2">Your Trust Score</span>
                    <span className="text-4xl font-black text-blue-600">{benchmark.yourScore}</span>
                </div>
                
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center items-center">
                    <span className="text-xs uppercase font-bold text-gray-500 mb-2">Industry Average</span>
                    <span className="text-2xl font-black text-gray-700">{benchmark.industryAverage.toFixed(1)}</span>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center items-center">
                    <span className="text-xs uppercase font-bold text-gray-500 mb-2">Top Quartile</span>
                    <span className="text-2xl font-black text-emerald-600">{benchmark.topQuartile}</span>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center items-center">
                    <span className="text-xs uppercase font-bold text-gray-500 mb-2">Percentile Rank</span>
                    <span className="text-2xl font-black text-purple-400">{benchmark.percentileRank.toFixed(1)}th</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-sm uppercase font-bold text-gray-400 mb-6">Verification Success Comparison</h3>
                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="font-bold text-blue-600">Your Institution</span>
                                <span className="font-mono">{benchmark.yourVerificationSuccess.toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-gray-50 rounded-full h-3">
                                <div className="bg-blue-500 h-3 rounded-full" style={{ width: `${benchmark.yourVerificationSuccess}%` }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="font-bold text-gray-500">Industry Average</span>
                                <span className="font-mono text-gray-500">{benchmark.industryVerificationSuccess.toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-gray-50 rounded-full h-3">
                                <div className="bg-slate-600 h-3 rounded-full" style={{ width: `${benchmark.industryVerificationSuccess}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-sm uppercase font-bold text-gray-400 mb-6">Fraud Exposure Comparison</h3>
                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="font-bold text-red-600">Your Institution</span>
                                <span className="font-mono text-red-600">{benchmark.yourFraudRate.toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-gray-50 rounded-full h-3">
                                <div className="bg-red-500 h-3 rounded-full" style={{ width: `${Math.min(benchmark.yourFraudRate * 10, 100)}%` }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="font-bold text-gray-500">Industry Average</span>
                                <span className="font-mono text-gray-500">{benchmark.industryFraudRate.toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-gray-50 rounded-full h-3">
                                <div className="bg-slate-600 h-3 rounded-full" style={{ width: `${Math.min(benchmark.industryFraudRate * 10, 100)}%` }}></div>
                            </div>
                        </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-4 italic">* Lower fraud exposure is better. Chart scaled for visibility.</p>
                </div>
            </div>
        </div>
    );
};

export default BenchmarkingCenter;
