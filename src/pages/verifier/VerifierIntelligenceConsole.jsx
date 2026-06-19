import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { showApiError } from "../../utils/toast";
import PriorityBadge from "../../components/verifier/PriorityBadge";
import RiskBadge from "../../components/verifier/RiskBadge";
import TrustBadge from "../../components/verifier/TrustBadge";
import InvestigationDrawer from "../../components/verifier/InvestigationDrawer";

const VerifierIntelligenceConsole = () => {
    const [queue, setQueue] = useState([]);
    const [filteredQueue, setFilteredQueue] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedDocId, setSelectedDocId] = useState(null);
    const [selectedRecId, setSelectedRecId] = useState(null);

    // Filters state
    const [searchTerm, setSearchTerm] = useState("");
    const [riskFilter, setRiskFilter] = useState("ALL");
    const [trustFilter, setTrustFilter] = useState("ALL");
    const [sourceFilter, setSourceFilter] = useState("ALL");
    const [campaignFilter, setCampaignFilter] = useState("ALL");

    const fetchQueue = async () => {
        setLoading(true);
        try {
            const res = await api.get("/verifier/queue/priority-list");
            setQueue(res.data);
            setFilteredQueue(res.data);
            // Automatically select first element if none is selected
            if (res.data.length > 0 && !selectedDocId) {
                setSelectedDocId(res.data[0].documentId);
                setSelectedRecId(res.data[0].recommendationId);
            }
        } catch (err) {
            showApiError(err, "Failed to load verifier intelligence queue.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQueue();
    }, []);

    // Filter logic
    useEffect(() => {
        let result = [...queue];

        // Search Filter (Student Name, Institution, Document ID)
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            result = result.filter(item => 
                (item.ownerName && item.ownerName.toLowerCase().includes(term)) ||
                (item.institutionName && item.institutionName.toLowerCase().includes(term)) ||
                (item.documentId && item.documentId.toLowerCase().includes(term)) ||
                (item.fileName && item.fileName.toLowerCase().includes(term))
            );
        }

        // Risk Filter
        if (riskFilter !== "ALL") {
            result = result.filter(item => item.riskLevel === riskFilter);
        }

        // Trust Filter
        if (trustFilter !== "ALL") {
            result = result.filter(item => item.trustTier === trustFilter);
        }

        // Source Filter
        if (sourceFilter !== "ALL") {
            result = result.filter(item => {
                if (sourceFilter === "INSTITUTION_ISSUED") return item.source === "INSTITUTION_ISSUED";
                if (sourceFilter === "INDIVIDUAL_UPLOAD") return item.source === "INDIVIDUAL_UPLOAD";
                return true;
            });
        }

        // Campaign Filter (Associated if there is any active campaign score or template cloned)
        if (campaignFilter !== "ALL") {
            result = result.filter(item => {
                const hasCampaign = item.escalationPoints > 0 || item.riskLevel === "CRITICAL" || item.riskLevel === "HIGH";
                if (campaignFilter === "CAMPAIGN") return hasCampaign;
                if (campaignFilter === "NO_CAMPAIGN") return !hasCampaign;
                return true;
            });
        }

        setFilteredQueue(result);
    }, [searchTerm, riskFilter, trustFilter, sourceFilter, campaignFilter, queue]);

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Verifier Intelligence Console</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Real-time risk priority, trust indicators, and network escalations queue.</p>
                </div>
                <button 
                    onClick={fetchQueue}
                    className="self-start px-3.5 py-1.5 bg-blue-50 text-blue-600 text-xs font-bold rounded-lg border border-blue-100 hover:bg-blue-100 transition shadow-sm"
                >
                    🔄 Refresh Queue
                </button>
            </div>

            {/* Split Screen Layout */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                
                {/* Left Queue Panel */}
                <div className="xl:col-span-7 bg-white border border-gray-150 rounded-xl shadow-md overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                        <h4 className="font-semibold text-gray-800">Review Priority Queue</h4>
                        <span className="text-xs font-bold text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
                            {filteredQueue.length} Active Items
                        </span>
                    </div>

                    {/* Filter Bar */}
                    <div className="p-4 border-b border-gray-100 bg-white grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                        <div className="lg:col-span-2">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                placeholder="Search Student, Institution, ID..."
                                className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <select
                                value={riskFilter}
                                onChange={e => setRiskFilter(e.target.value)}
                                className="w-full border border-gray-200 rounded-lg p-1.5 text-xs outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="ALL">All Risk Levels</option>
                                <option value="CRITICAL">Critical Risk</option>
                                <option value="HIGH">High Risk</option>
                                <option value="MEDIUM">Medium Risk</option>
                                <option value="LOW">Low Risk</option>
                            </select>
                        </div>
                        <div>
                            <select
                                value={trustFilter}
                                onChange={e => setTrustFilter(e.target.value)}
                                className="w-full border border-gray-200 rounded-lg p-1.5 text-xs outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="ALL">All Trust Tiers</option>
                                <option value="VERY_HIGH">Very High Trust</option>
                                <option value="HIGH">High Trust</option>
                                <option value="MEDIUM">Medium Trust</option>
                                <option value="LOW">Low Trust</option>
                                <option value="CRITICAL">Critical Trust</option>
                            </select>
                        </div>
                        <div>
                            <select
                                value={sourceFilter}
                                onChange={e => setSourceFilter(e.target.value)}
                                className="w-full border border-gray-200 rounded-lg p-1.5 text-xs outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="ALL">All Sources</option>
                                <option value="INSTITUTION_ISSUED">Institution Issued</option>
                                <option value="INDIVIDUAL_UPLOAD">Self Uploaded</option>
                            </select>
                        </div>
                    </div>

                    {/* Queue List Table */}
                    {loading ? (
                        <div className="p-8 text-center text-gray-500">
                            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                            Loading priority queue...
                        </div>
                    ) : filteredQueue.length === 0 ? (
                        <div className="p-8 text-center text-gray-400 text-sm">
                            No documents in priority queue match the filters.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-100 text-gray-400 font-medium uppercase bg-gray-50/50">
                                        <th className="p-3">Priority</th>
                                        <th className="p-3">Risk</th>
                                        <th className="p-3">Source</th>
                                        <th className="p-3">Student & Institution</th>
                                        <th className="p-3">Trust Tier</th>
                                        <th className="p-3">Recommendation</th>
                                        <th className="p-3 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredQueue.map((item, idx) => {
                                        const isSelected = selectedDocId === item.documentId;
                                        return (
                                            <tr 
                                                key={item.recommendationId || idx} 
                                                className={`border-b border-gray-50 hover:bg-blue-50/20 cursor-pointer transition ${
                                                    isSelected ? "bg-blue-50/40 font-medium" : ""
                                                }`}
                                                onClick={() => {
                                                    setSelectedDocId(item.documentId);
                                                    setSelectedRecId(item.recommendationId);
                                                }}
                                            >
                                                <td className="p-3 align-middle">
                                                    <PriorityBadge 
                                                        basePriority={item.basePriority} 
                                                        escalationPoints={item.escalationPoints} 
                                                        finalPriority={item.finalPriority} 
                                                    />
                                                </td>
                                                <td className="p-3 align-middle">
                                                    <RiskBadge riskLevel={item.riskLevel} />
                                                </td>
                                                <td className="p-3 align-middle text-gray-500">
                                                    {item.source === "INSTITUTION_ISSUED" ? (
                                                        <span className="flex items-center gap-1">🏛 <span className="text-[10px]">Institution</span></span>
                                                    ) : (
                                                        <span className="flex items-center gap-1">👤 <span className="text-[10px]">Self</span></span>
                                                    )}
                                                </td>
                                                <td className="p-3 align-middle">
                                                    <p className="font-bold text-gray-800">{item.ownerName}</p>
                                                    <p className="text-[10px] text-gray-400 mt-0.5 truncate max-w-[150px]">{item.institutionName}</p>
                                                </td>
                                                <td className="p-3 align-middle">
                                                    <TrustBadge trustTier={item.trustTier} trustScore={item.trustScore} />
                                                </td>
                                                <td className="p-3 align-middle">
                                                    <span className={`font-bold uppercase tracking-wider text-[9px] px-2 py-0.5 rounded ${
                                                        item.recommendation === "APPROVE" ? "text-green-700 bg-green-50 border border-green-100" :
                                                        item.recommendation === "REJECT" ? "text-red-700 bg-red-50 border border-red-100" :
                                                        "text-orange-700 bg-orange-50 border border-orange-100"
                                                    }`}>
                                                        {item.recommendation === "APPROVE" ? "Approve" :
                                                         item.recommendation === "REJECT" ? "Reject" : "Review"}
                                                    </span>
                                                    <span className="text-[9px] text-gray-400 block mt-1">Conf: {item.confidence}</span>
                                                </td>
                                                <td className="p-3 align-middle text-center">
                                                    <button 
                                                        className={`px-3 py-1 rounded text-[10px] font-bold border transition ${
                                                            isSelected 
                                                                ? "bg-blue-600 text-white border-blue-600 shadow-sm" 
                                                                : "bg-white text-blue-600 border-blue-200 hover:bg-blue-50"
                                                        }`}
                                                    >
                                                        Investigate
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Right Workspace Panel */}
                <div className="xl:col-span-5 h-[calc(100vh-140px)] min-h-[550px] sticky top-6">
                    <InvestigationDrawer 
                        docId={selectedDocId} 
                        recommendationId={selectedRecId}
                        onActionComplete={fetchQueue}
                        onClose={() => {
                            setSelectedDocId(null);
                            setSelectedRecId(null);
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default VerifierIntelligenceConsole;
