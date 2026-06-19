import React, { useState } from 'react';
import employerIntelligenceService from '../../../services/employerIntelligenceService';
import { showApiError } from '../../../utils/toast';

const TrustComparisonWorkspace = () => {
    const [candidateA, setCandidateA] = useState('');
    const [candidateB, setCandidateB] = useState('');
    const [comparison, setComparison] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleCompare = async (e) => {
        e.preventDefault();
        if (!candidateA || !candidateB) return;
        setLoading(true);
        try {
            const data = await employerIntelligenceService.compareCandidates(candidateA, candidateB);
            setComparison(data);
        } catch (err) {
            showApiError(err, "Failed to compare candidates (ensure you have active consent for both)");
        } finally {
            setLoading(false);
        }
    };

    const renderCandidateCol = (title, metrics) => (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex-1">
            <div className="bg-gray-50 p-4 border-b border-gray-200 text-center">
                <h4 className="font-bold text-gray-900 uppercase tracking-wider text-sm">{title}</h4>
            </div>
            <div className="p-6 space-y-6">
                <div>
                    <span className="text-xs uppercase font-bold text-gray-400 block mb-1">Trust Score</span>
                    <span className={`text-3xl font-black ${metrics.trustScore >= 80 ? 'text-emerald-600' : metrics.trustScore >= 50 ? 'text-orange-600' : 'text-red-600'}`}>
                        {metrics.trustScore}
                    </span>
                </div>
                <div>
                    <span className="text-xs uppercase font-bold text-gray-400 block mb-1">Verification Success</span>
                    <span className="text-xl font-bold text-gray-700">{metrics.verificationSuccess}%</span>
                </div>
                <div>
                    <span className="text-xs uppercase font-bold text-gray-400 block mb-1">Anchored Credentials</span>
                    <span className="text-xl font-bold text-gray-700">{metrics.anchored}</span>
                </div>
                <div>
                    <span className="text-xs uppercase font-bold text-gray-400 block mb-1">Overall Confidence</span>
                    <span className={`inline-block px-3 py-1 text-xs font-bold rounded ${metrics.confidence === 'HIGH' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                        {metrics.confidence}
                    </span>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Trust Comparison Workspace</h2>
            
            <form onSubmit={handleCompare} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 space-y-1">
                    <label className="text-xs uppercase font-bold text-gray-500">Candidate A ID</label>
                    <input 
                        type="text" 
                        value={candidateA}
                        onChange={(e) => setCandidateA(e.target.value)}
                        placeholder="Enter Candidate ID (UUID)"
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition"
                        required
                    />
                </div>
                <div className="flex-1 space-y-1">
                    <label className="text-xs uppercase font-bold text-gray-500">Candidate B ID</label>
                    <input 
                        type="text" 
                        value={candidateB}
                        onChange={(e) => setCandidateB(e.target.value)}
                        placeholder="Enter Candidate ID (UUID)"
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition"
                        required
                    />
                </div>
                <button 
                    type="submit" 
                    disabled={loading}
                    className="bg-indigo-600 hover:bg-indigo-500 text-gray-900 px-6 py-2.5 rounded-lg text-sm font-bold transition disabled:opacity-50 h-[42px]"
                >
                    {loading ? 'Comparing...' : 'Compare Candidates'}
                </button>
            </form>

            {comparison && (
                <div className="flex flex-col md:flex-row gap-6 mt-8">
                    {renderCandidateCol("Candidate A", comparison.candidateA)}
                    
                    <div className="flex items-center justify-center shrink-0">
                        <div className="w-12 h-12 bg-white rounded-full border-4 border-slate-900 flex items-center justify-center text-gray-400 font-bold z-10 -mx-6 md:-mx-8">
                            VS
                        </div>
                    </div>

                    {renderCandidateCol("Candidate B", comparison.candidateB)}
                </div>
            )}
        </div>
    );
};

export default TrustComparisonWorkspace;
