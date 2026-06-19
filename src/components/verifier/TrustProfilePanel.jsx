import React from "react";
import TrustBadge from "./TrustBadge";

const TrustProfilePanel = ({ trustData }) => {
    if (!trustData || !trustData.profile) {
        return (
            <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-6 text-center text-gray-500">
                No trust profile details available for this institution.
            </div>
        );
    }

    const { profile, history = [], riskEvents = [] } = trustData;

    const trendConfig = {
        STABLE: { text: "Stable", color: "text-gray-500" },
        IMPROVING: { text: "Improving", color: "text-green-600 font-bold" },
        DETERIORATING: { text: "Deteriorating", color: "text-red-600 font-bold animate-pulse" },
    };
    const trend = trendConfig[profile.trend] || { text: profile.trend || "Stable", color: "text-gray-500" };

    return (
        <div className="space-y-6">
            {/* Trust Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-150 shadow-sm flex flex-col justify-between">
                    <div>
                        <span className="text-xs font-semibold text-gray-400 uppercase">Trust Tier & Score</span>
                        <div className="mt-2">
                            <TrustBadge trustTier={profile.trustTier} trustScore={profile.trustScore} />
                        </div>
                    </div>
                    <div className="text-[10px] text-gray-400 mt-2">
                        Last Evaluated: {profile.lastEvaluatedAt ? new Date(profile.lastEvaluatedAt).toLocaleString() : "N/A"}
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-150 shadow-sm flex flex-col justify-between">
                    <div>
                        <span className="text-xs font-semibold text-gray-400 uppercase">Trend & Behavior</span>
                        <div className={`text-lg font-bold mt-1 ${trend.color}`}>
                            {trend.text}
                        </div>
                    </div>
                    <div className="text-[10px] text-gray-400 mt-2">
                        Fraud Occurrence Rate: {(profile.fraudRate * 100).toFixed(1)}%
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-150 shadow-sm flex flex-col justify-between">
                    <div>
                        <span className="text-xs font-semibold text-gray-400 uppercase">Verification Rate</span>
                        <div className="text-lg font-bold text-gray-800 mt-1">
                            {(profile.verificationSuccessRate * 100).toFixed(1)}%
                        </div>
                    </div>
                    <div className="text-[10px] text-gray-400 mt-2">
                        Confidence Average: {(profile.averageConfidence * 100).toFixed(1)}%
                    </div>
                </div>
            </div>

            {/* Institution Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <span className="text-[10px] uppercase font-bold text-gray-400">Total Issued</span>
                    <p className="text-xl font-bold text-gray-700 mt-1">{profile.credentialsIssuedCount}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <span className="text-[10px] uppercase font-bold text-gray-400">Verified</span>
                    <p className="text-xl font-bold text-green-600 mt-1">{profile.verifiedCount}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <span className="text-[10px] uppercase font-bold text-gray-400">Flagged Fraud</span>
                    <p className="text-xl font-bold text-red-600 mt-1">{profile.flaggedCount}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <span className="text-[10px] uppercase font-bold text-gray-400">Override Count</span>
                    <p className="text-xl font-bold text-orange-600 mt-1">{profile.overrideCount || 0}</p>
                </div>
            </div>

            {/* Historical Score History & Risk Events */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Score Adjustments History */}
                <div className="bg-white border border-gray-150 rounded-xl p-4 shadow-sm">
                    <h4 className="font-semibold text-gray-800 border-b border-gray-50 pb-2 mb-3">Trust Score History</h4>
                    {history.length === 0 ? (
                        <div className="text-center py-8 text-xs text-gray-400 italic">
                            No trust history modifications recorded. [K3 Historical Graph Placeholder]
                        </div>
                    ) : (
                        <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                            {/* Simple visual custom CSS trend line */}
                            <div className="flex items-center gap-1.5 h-10 px-2 bg-gray-50 rounded mb-4">
                                <span className="text-[10px] text-gray-400 uppercase font-bold mr-2">Trend Profile:</span>
                                {history.slice(0, 8).reverse().map((h, idx) => (
                                    <div key={idx} className="flex flex-col items-center flex-1">
                                        <div className="w-full bg-blue-100 rounded-full h-1.5 relative">
                                            <div 
                                                className="bg-blue-600 h-1.5 rounded-full" 
                                                style={{ width: `${h.scoreAfter !== undefined ? h.scoreAfter : 50}%` }}
                                            />
                                        </div>
                                        <span className="text-[8px] text-gray-400 mt-1 font-bold">{h.scoreAfter}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Details List */}
                            {history.map((h, idx) => (
                                <div key={h.id || idx} className="flex justify-between items-start text-xs border-b border-gray-50 pb-2">
                                    <div>
                                        <p className="font-medium text-gray-700">{h.reason}</p>
                                        <span className="text-[10px] text-gray-400">{new Date(h.timestamp).toLocaleString()}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="font-bold text-gray-800">{h.scoreAfter}</span>
                                        <span className="text-[10px] text-gray-400 block">
                                            (from {h.scoreBefore})
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Risk Events log */}
                <div className="bg-white border border-gray-150 rounded-xl p-4 shadow-sm">
                    <h4 className="font-semibold text-gray-800 border-b border-gray-50 pb-2 mb-3">Risk Events Log</h4>
                    {riskEvents.length === 0 ? (
                        <div className="text-center py-8 text-xs text-gray-400 italic">
                            No risk events registered for this institution.
                        </div>
                    ) : (
                        <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                            {riskEvents.map((re, idx) => (
                                <div key={re.id || idx} className="border-b border-gray-50 pb-2 text-xs">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                            re.severity === "CRITICAL" ? "bg-red-100 text-red-800" :
                                            re.severity === "HIGH" ? "bg-rose-100 text-rose-800" :
                                            re.severity === "MEDIUM" ? "bg-orange-100 text-orange-800" :
                                            "bg-blue-100 text-blue-800"
                                        }`}>
                                            {re.severity}
                                        </span>
                                        <span className="text-[10px] text-gray-400">{new Date(re.timestamp).toLocaleString()}</span>
                                    </div>
                                    <p className="font-semibold text-gray-800">{re.eventType}</p>
                                    <p className="text-gray-500 text-[11px] mt-0.5">{re.description}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TrustProfilePanel;
