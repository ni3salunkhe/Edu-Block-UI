import React, { useEffect, useState } from 'react';
import employerIntelligenceService from '../../../services/employerIntelligenceService';
import { showApiError } from '../../../utils/toast';
import { Link } from 'react-router-dom';

const EmployerDecisionSupport = () => {
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                const data = await employerIntelligenceService.getRecommendations();
                setRecommendations(data);
            } catch (err) {
                showApiError(err, "Failed to load Decision Support");
            } finally {
                setLoading(false);
            }
        };
        fetchRecommendations();
    }, []);

    if (loading) return <div className="p-4 text-gray-500">Loading Decision Support Engine...</div>;

    const getCategoryColor = (category) => {
        switch (category) {
            case 'Investigate': return 'bg-red-50 text-red-600 border-red-200';
            case 'Await Verification': return 'bg-orange-50 text-orange-600 border-orange-200';
            case 'Proceed': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
            case 'Review': return 'bg-blue-50 text-blue-600 border-blue-200';
            default: return 'bg-white text-gray-500 border-gray-200';
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Employer Decision Support</h2>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="text-sm font-bold text-gray-700">Actionable Hiring Recommendations</h3>
                </div>
                {recommendations.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">No active candidates require decision support at this time.</div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {recommendations.map((rec, idx) => (
                            <div key={idx} className="p-5 hover:bg-gray-100 transition flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="space-y-2 flex-1">
                                    <div className="flex items-center gap-3">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getCategoryColor(rec.category)}`}>
                                            {rec.category.toUpperCase()}
                                        </span>
                                        <span className="text-xs font-mono text-gray-500">
                                            Candidate ID: {rec.candidateId.substring(0, 8)}...
                                        </span>
                                    </div>
                                    <p className="text-sm font-semibold text-gray-900 max-w-2xl">{rec.recommendation}</p>
                                </div>
                                <div className="md:text-right shrink-0">
                                    <Link 
                                        to={`/employer/view/${rec.candidateId}`} // Assuming this route exists or they can search it
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 text-sm font-medium rounded-lg transition-colors"
                                    >
                                        View Candidate
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                        </svg>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmployerDecisionSupport;
