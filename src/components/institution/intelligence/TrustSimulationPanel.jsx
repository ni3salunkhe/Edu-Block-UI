import React, { useEffect, useState, useCallback } from 'react';
import institutionIntelligenceService from '../../../services/institutionIntelligenceService';
import { showApiError } from '../../../utils/toast';

const TrustSimulationPanel = () => {
    const [loading, setLoading] = useState(true);
    const [fraudDelta, setFraudDelta] = useState(0); // -10 to +10
    const [verificationDelta, setVerificationDelta] = useState(0); // -20 to +20
    const [simulationResult, setSimulationResult] = useState(null);

    const fetchSimulation = useCallback(async (fDelta, vDelta) => {
        try {
            const data = await institutionIntelligenceService.getSimulation(fDelta, vDelta);
            setSimulationResult(data);
        } catch (err) {
            showApiError(err, 'Failed to run trust simulation');
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial load
    useEffect(() => {
        fetchSimulation(0, 0);
    }, [fetchSimulation]);

    // Debounced slider changes
    useEffect(() => {
        const handler = setTimeout(() => {
            fetchSimulation(fraudDelta, verificationDelta);
        }, 300); // 300ms debounce
        return () => clearTimeout(handler);
    }, [fraudDelta, verificationDelta, fetchSimulation]);

    if (loading && !simulationResult) return <div className="p-4 text-gray-500">Loading Trust Simulator...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end mb-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Trust Score Simulator</h2>
                    <p className="text-sm text-gray-500">Forecast your institution's Trust Score based on projected quality improvements.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Sliders Panel */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-8">
                    <h3 className="text-sm uppercase font-bold text-gray-400">Adjust Target Metrics</h3>
                    
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-sm font-bold text-gray-700">Target Fraud Rate Change</label>
                            <span className={`font-mono font-bold ${fraudDelta < 0 ? 'text-emerald-600' : fraudDelta > 0 ? 'text-red-600' : 'text-gray-500'}`}>
                                {fraudDelta > 0 ? '+' : ''}{fraudDelta}%
                            </span>
                        </div>
                        <input 
                            type="range" 
                            min="-10" max="10" step="1" 
                            value={fraudDelta} 
                            onChange={(e) => setFraudDelta(Number(e.target.value))}
                            className="w-full accent-blue-500"
                        />
                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                            <span>-10% (Better)</span>
                            <span>0%</span>
                            <span>+10% (Worse)</span>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-sm font-bold text-gray-700">Target Verification Success Change</label>
                            <span className={`font-mono font-bold ${verificationDelta > 0 ? 'text-emerald-600' : verificationDelta < 0 ? 'text-orange-600' : 'text-gray-500'}`}>
                                {verificationDelta > 0 ? '+' : ''}{verificationDelta}%
                            </span>
                        </div>
                        <input 
                            type="range" 
                            min="-20" max="20" step="1" 
                            value={verificationDelta} 
                            onChange={(e) => setVerificationDelta(Number(e.target.value))}
                            className="w-full accent-emerald-500"
                        />
                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                            <span>-20% (Worse)</span>
                            <span>0%</span>
                            <span>+20% (Better)</span>
                        </div>
                    </div>
                </div>

                {/* Results Panel */}
                <div className="bg-gray-50 border border-gray-200 p-6 rounded-xl flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
                    {/* Background glow effects based on outcome */}
                    {simulationResult && simulationResult.scoreDelta > 0 && (
                        <div className="absolute inset-0 bg-emerald-500/10 blur-3xl rounded-full"></div>
                    )}
                    {simulationResult && simulationResult.scoreDelta < 0 && (
                        <div className="absolute inset-0 bg-red-500/10 blur-3xl rounded-full"></div>
                    )}

                    <div className="relative z-10 text-center space-y-6 w-full">
                        <div className="flex justify-between items-center w-full max-w-sm mx-auto">
                            <div className="text-center">
                                <span className="block text-xs uppercase font-bold text-gray-400 mb-1">Current Score</span>
                                <span className="text-3xl font-black text-gray-500">{simulationResult?.currentScore || '--'}</span>
                            </div>
                            <div className="text-slate-600 text-2xl font-black">→</div>
                            <div className="text-center">
                                <span className="block text-xs uppercase font-bold text-blue-600 mb-1">Projected Score</span>
                                <span className="text-5xl font-black text-gray-900">{simulationResult?.projectedScore || '--'}</span>
                            </div>
                        </div>

                        {simulationResult && simulationResult.scoreDelta !== 0 && (
                            <div className="pt-4 border-t border-gray-200 max-w-sm mx-auto">
                                <span className={`inline-block px-4 py-2 rounded-full font-bold text-lg border ${
                                    simulationResult.scoreDelta > 0 ? 'bg-emerald-900/30 text-emerald-600 border-emerald-200' : 'bg-red-900/30 text-red-600 border-red-200'
                                }`}>
                                    {simulationResult.scoreDelta > 0 ? 'TRUST SCORE +' : 'TRUST SCORE '}{simulationResult.scoreDelta}
                                </span>
                            </div>
                        )}
                        
                        {simulationResult && simulationResult.scoreDelta === 0 && (
                            <div className="pt-4 border-t border-gray-200 max-w-sm mx-auto">
                                <span className="text-sm font-bold text-gray-400">No projected change to Trust Score.</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrustSimulationPanel;
