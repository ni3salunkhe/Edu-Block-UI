import React from "react";

const RecommendationCard = ({ recommendation }) => {
    if (!recommendation) {
        return (
            <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-6 text-center text-gray-500">
                No active recommendation available. Run a check to generate one.
            </div>
        );
    }

    const {
        recommendation: recType,
        confidence,
        explanationSummary = [],
        modelVersion = "AI4_v1",
        generatedAt,
        generationNumber = 1,
    } = recommendation;

    const config = {
        APPROVE: {
            title: "Approve Candidate",
            color: "text-green-700 bg-green-50 border-green-200",
            icon: "✓",
        },
        REVIEW: {
            title: "Investigate Further",
            color: "text-orange-700 bg-orange-50 border-orange-200",
            icon: "⚠",
        },
        REJECT: {
            title: "Reject Document",
            color: "text-red-700 bg-red-50 border-red-200",
            icon: "✗",
        },
    };

    const recConfig = config[recType] || {
        title: recType || "Needs Review",
        color: "text-gray-700 bg-gray-50 border-gray-200",
        icon: "ℹ",
    };

    return (
        <div className="border border-gray-100 rounded-xl p-5 shadow-sm bg-white">
            <div className="flex items-start justify-between mb-4 pb-3 border-b border-gray-50">
                <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">AI Recommendation</span>
                    <h4 className={`text-xl font-bold mt-1 flex items-center gap-2 px-3 py-1 rounded-lg border ${recConfig.color}`}>
                        <span className="text-lg">{recConfig.icon}</span>
                        {recConfig.title}
                    </h4>
                </div>
                <div className="text-right">
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Confidence</span>
                    <div className="text-lg font-bold text-gray-800 mt-1">
                        {confidence === "HIGH" ? "89% (HIGH)" : confidence === "MEDIUM" ? "64% (MEDIUM)" : "35% (LOW)"}
                    </div>
                </div>
            </div>

            {/* Explanations */}
            <div className="mb-4">
                <h5 className="text-sm font-semibold text-gray-700 mb-2">Reasoning & Evidence Checklist:</h5>
                {explanationSummary.length === 0 ? (
                    <p className="text-xs text-gray-500 italic">No specific explanations generated.</p>
                ) : (
                    <ul className="space-y-2">
                        {explanationSummary.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs text-gray-600">
                                <span className="text-blue-500 font-bold mt-0.5">✓</span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Metadata */}
            <div className="border-t border-gray-100 pt-3 mt-3 flex flex-wrap justify-between text-[10px] text-gray-400">
                <div>
                    Model Version: <span className="font-semibold">{modelVersion}</span>
                </div>
                <div>
                    Generated At: <span className="font-semibold">{generatedAt ? new Date(generatedAt).toLocaleString() : "N/A"}</span>
                </div>
                <div>
                    Evidence Snapshot: <span className="font-semibold">v{generationNumber}</span>
                </div>
            </div>
        </div>
    );
};

export default RecommendationCard;
