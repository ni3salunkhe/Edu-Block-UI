import React, { useEffect, useState } from 'react';
import adminIntelligenceService from '../../../services/adminIntelligenceService';
import { showApiError } from '../../../utils/toast';

const DriftAnalyticsPanel = () => {
    const [loading, setLoading] = useState(true);
    const [trends, setTrends] = useState([]);
    const [verifiers, setVerifiers] = useState([]);
    const [rules, setRules] = useState([]);
    const [driftSummary, setDriftSummary] = useState(null);

    useEffect(() => {
        const fetchLearningData = async () => {
            try {
                const [trendRes, verifRes, ruleRes, driftRes] = await Promise.all([
                    adminIntelligenceService.getInstitutionTrends(),
                    adminIntelligenceService.getVerifierQualityMetrics(),
                    adminIntelligenceService.getRulePerformance(),
                    adminIntelligenceService.getDriftAnalytics()
                ]);
                setTrends(trendRes);
                setVerifiers(verifRes);
                setRules(ruleRes);
                setDriftSummary(driftRes);
            } catch (err) {
                showApiError(err, 'Failed to load learning & drift intelligence.');
            } finally {
                setLoading(false);
            }
        };
        fetchLearningData();
    }, []);

    if (loading) return <div className="text-gray-500 p-6">Loading Drift Analytics...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Learning & Drift Intelligence</h2>
                    <p className="text-sm text-gray-500">Monitor AI-5 learning loop, verifier override rates, and systemic drift.</p>
                </div>
            </div>

            {driftSummary && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-xl border border-gray-200">
                        <span className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Global Override Rate</span>
                        <span className="text-xl font-black text-orange-600">{(driftSummary.globalOverrideRate * 100).toFixed(1)}%</span>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-200">
                        <span className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Total Overrides</span>
                        <span className="text-xl font-black text-gray-900">{driftSummary.totalOverrides}</span>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-200">
                        <span className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Total Signals Processed</span>
                        <span className="text-xl font-black text-gray-900">{driftSummary.totalSignals}</span>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-200">
                        <span className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Active Rules</span>
                        <span className="text-xl font-black text-gray-900">{driftSummary.activeRules}</span>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Institution Drift Warning Table */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                    <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <span className="text-orange-600">⚠</span> Institution Drift Warnings
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-gray-700">
                            <thead className="bg-gray-50 uppercase text-gray-500 border-b border-gray-200">
                                <tr>
                                    <th className="px-3 py-2">Entity</th>
                                    <th className="px-3 py-2">Override Rate</th>
                                    <th className="px-3 py-2">Trend</th>
                                    <th className="px-3 py-2">Severity</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {trends.length === 0 ? (
                                    <tr><td colSpan="4" className="px-3 py-4 text-center">No drift warnings.</td></tr>
                                ) : trends.map(t => (
                                    <tr key={t.institutionId} className="hover:bg-gray-100/30">
                                        <td className="px-3 py-2 font-semibold">{t.institutionName}</td>
                                        <td className="px-3 py-2 font-mono text-orange-600">{(t.overrideRate * 100).toFixed(1)}%</td>
                                        <td className="px-3 py-2 text-gray-500">{t.trendType}</td>
                                        <td className="px-3 py-2">
                                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                                t.driftSeverity === 'SEVERE' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-yellow-900/50 text-yellow-400 border border-yellow-800'
                                            }`}>
                                                {t.driftSeverity}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Verifier Effectiveness Table */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                    <h3 className="text-sm font-bold text-gray-900 mb-3">Reviewer Effectiveness Analytics</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-gray-700">
                            <thead className="bg-gray-50 uppercase text-gray-500 border-b border-gray-200">
                                <tr>
                                    <th className="px-3 py-2">Verifier</th>
                                    <th className="px-3 py-2">Reviews</th>
                                    <th className="px-3 py-2">Overrides</th>
                                    <th className="px-3 py-2">Override Rate</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {verifiers.length === 0 ? (
                                    <tr><td colSpan="4" className="px-3 py-4 text-center">No verifier data.</td></tr>
                                ) : verifiers.map(v => (
                                    <tr key={v.verifierId} className="hover:bg-gray-100/30">
                                        <td className="px-3 py-2 font-semibold text-blue-600">{v.verifierUsername}</td>
                                        <td className="px-3 py-2 font-mono">{v.totalReviews}</td>
                                        <td className="px-3 py-2 font-mono">{v.overrideCount}</td>
                                        <td className="px-3 py-2 font-mono">{(v.overrideRate * 100).toFixed(1)}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Rule Performance Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                <h3 className="text-sm font-bold text-gray-900 mb-3">Recommendation Accuracy & Rule Performance</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-gray-700">
                        <thead className="bg-gray-50 uppercase text-gray-500 border-b border-gray-200">
                            <tr>
                                <th className="px-3 py-2">Rule / Signal</th>
                                <th className="px-3 py-2">Target Type</th>
                                <th className="px-3 py-2">Evaluations</th>
                                <th className="px-3 py-2">Precision</th>
                                <th className="px-3 py-2">Override Rate</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {rules.length === 0 ? (
                                <tr><td colSpan="5" className="px-3 py-4 text-center">No rule performance data.</td></tr>
                            ) : rules.map((r, i) => (
                                <tr key={i} className="hover:bg-gray-100/30">
                                    <td className="px-3 py-2 font-mono text-emerald-600">{r.ruleName}</td>
                                    <td className="px-3 py-2">{r.targetType}</td>
                                    <td className="px-3 py-2 font-mono">{r.totalEvaluations}</td>
                                    <td className="px-3 py-2 font-bold text-green-400">{(r.precisionRate * 100).toFixed(1)}%</td>
                                    <td className="px-3 py-2 font-bold text-orange-600">{(r.overrideRate * 100).toFixed(1)}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DriftAnalyticsPanel;
