import React, { useEffect, useState } from 'react';
import institutionIntelligenceService from '../../../services/institutionIntelligenceService';
import { showApiError } from '../../../utils/toast';

const ImprovementRecommendations = () => {
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await institutionIntelligenceService.getRecommendations();
                setRecommendations(data);
            } catch (err) {
                showApiError(err, "Failed to load Improvement Recommendations");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="p-4 text-gray-500">Loading Recommendations...</div>;

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'CRITICAL': return 'bg-red-50 text-red-600 border border-red-200';
            case 'HIGH': return 'bg-orange-50 text-orange-600 border border-orange-200';
            case 'MEDIUM': return 'bg-yellow-900/50 text-yellow-400 border border-yellow-800';
            default: return 'bg-white text-gray-500 border border-gray-200';
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Improvement Recommendations</h2>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="text-sm font-bold text-gray-700">Actionable Intelligence</h3>
                </div>
                {recommendations.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">No active recommendations.</div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {recommendations.map((rec, idx) => (
                            <div key={idx} className="p-5 hover:bg-gray-100 transition flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${getPriorityColor(rec.priority)}`}>
                                            {rec.priority}
                                        </span>
                                        <span className="text-xs uppercase font-bold text-gray-500 tracking-wider">
                                            {rec.category}
                                        </span>
                                    </div>
                                    <p className="text-sm font-semibold text-gray-900">{rec.description}</p>
                                </div>
                                <div className="md:text-right shrink-0">
                                    <span className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Expected Impact</span>
                                    <span className="text-sm font-bold text-emerald-600 bg-emerald-900/20 px-3 py-1 rounded border border-emerald-200/50">
                                        {rec.expectedImpact}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImprovementRecommendations;
