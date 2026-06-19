import React from "react";

const NetworkIntelligencePanel = ({ networkData }) => {
    if (!networkData) {
        return (
            <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-6 text-center text-gray-500">
                Loading network intelligence data...
            </div>
        );
    }

    const { cluster, membership, campaign, escalations = [] } = networkData;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Cluster Card */}
                <div className="bg-white border border-gray-150 rounded-xl p-5 shadow-sm">
                    <span className="text-[10px] uppercase font-bold text-gray-400">Coordinated Threat Cluster</span>
                    {cluster ? (
                        <div className="mt-2 space-y-3">
                            <h4 className="font-bold text-lg text-red-700">{cluster.name}</h4>
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-500">Cluster Score:</span>
                                <span className="font-bold text-red-600">{cluster.score} / 100</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-500">Node Count:</span>
                                <span className="font-bold text-gray-800">{cluster.nodeCount}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-500">Edge Count:</span>
                                <span className="font-bold text-gray-800">{cluster.edgeCount}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-500">Status:</span>
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 uppercase">
                                    {cluster.status}
                                </span>
                            </div>
                            {membership && (
                                <div className="text-[10px] text-gray-400 bg-gray-50 p-2 rounded mt-2 border border-gray-100">
                                    Member Membership Weight: {(membership.membershipScore * 100).toFixed(0)}%
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-xs text-gray-400 italic mt-3">Node is isolated. Not associated with any macro threat ring.</p>
                    )}
                </div>

                {/* Campaign Card */}
                <div className="bg-white border border-gray-150 rounded-xl p-5 shadow-sm">
                    <span className="text-[10px] uppercase font-bold text-gray-400">Emerging Fraud Campaign</span>
                    {campaign ? (
                        <div className="mt-2 space-y-3">
                            <h4 className="font-bold text-lg text-orange-700">{campaign.name}</h4>
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-500">Severity:</span>
                                <span className={`font-bold ${
                                    campaign.severity === "CRITICAL" || campaign.severity === "HIGH" ? "text-red-600" : "text-orange-600"
                                }`}>
                                    {campaign.severity}
                                </span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-500">Campaign Score:</span>
                                <span className="font-bold text-gray-800">{campaign.campaignScore}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-500">Confidence:</span>
                                <span className="font-bold text-gray-800">{(campaign.confidenceScore * 100).toFixed(0)}%</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-500">Matched Signature:</span>
                                <span className="font-semibold text-blue-700">
                                    {campaign.matchedSignatureId ? "Credential Reference Farming" : "Visual Template Clone"}
                                </span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-500">Status:</span>
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-800 uppercase">
                                    {campaign.status}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <p className="text-xs text-gray-400 italic mt-3">No active campaign tracking matches this template or institution.</p>
                    )}
                </div>

                {/* Escalation Card */}
                <div className="bg-white border border-gray-150 rounded-xl p-5 shadow-sm flex flex-col justify-between">
                    <div>
                        <span className="text-[10px] uppercase font-bold text-gray-400">Priority Escalation Track</span>
                        {escalations.length === 0 ? (
                            <p className="text-xs text-gray-400 italic mt-3">No current escalations active. Baseline reviewer queue priority applies.</p>
                        ) : (
                            <div className="space-y-3 mt-2 max-h-40 overflow-y-auto pr-1">
                                {escalations.map((esc, idx) => (
                                    <div key={esc.id || idx} className="text-xs border-b border-gray-50 pb-2">
                                        <div className="flex justify-between font-bold text-red-600">
                                            <span>+{esc.escalationPoints} Points</span>
                                            <span className="text-[9px] text-gray-400 uppercase font-semibold">{esc.sourceType}</span>
                                        </div>
                                        <p className="text-gray-600 text-[10px] mt-0.5">{esc.reason}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Relationship Summary */}
            <div className="bg-white border border-gray-150 rounded-xl p-5 shadow-sm">
                <h4 className="font-semibold text-gray-800 border-b border-gray-50 pb-2 mb-3">Graph Relationship Summary</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 bg-gray-50 rounded-lg">
                        <span className="text-xs text-gray-500 font-medium">Connected Institutions</span>
                        <p className="text-lg font-bold text-gray-800 mt-1">{cluster ? "1" : "0"}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                        <span className="text-xs text-gray-500 font-medium">Connected Credentials</span>
                        <p className="text-lg font-bold text-gray-800 mt-1">{cluster ? cluster.edgeCount : "0"}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                        <span className="text-xs text-gray-500 font-medium">Connected Students</span>
                        <p className="text-lg font-bold text-gray-800 mt-1">{cluster ? Math.max(1, cluster.nodeCount - 2) : "0"}</p>
                    </div>
                </div>
                <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-700 flex items-center gap-2">
                    <span className="font-bold text-sm">ℹ</span>
                    <span>Interactive network visual graphs, cluster modularity adjustments, and node-link traces belong to **Phase K6 (Modality Interface)**.</span>
                </div>
            </div>
        </div>
    );
};

export default NetworkIntelligencePanel;
