import React, { useState, useEffect } from "react";
import api from "../../../services/api";
import { showSuccess, showApiError } from "../../../utils/toast";

const EscalationManagementPanel = () => {
    const [escalations, setEscalations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterActive, setFilterActive] = useState("ACTIVE"); // "ACTIVE", "RESOLVED", "ALL"
    
    // Modal state for resolving/rejecting
    const [showActionModal, setShowActionModal] = useState(false);
    const [actionType, setActionType] = useState(""); // "RESOLVE" or "REJECT"
    const [selectedEscalation, setSelectedEscalation] = useState(null);
    const [actionNote, setActionNote] = useState("");

    const fetchEscalations = async () => {
        setLoading(true);
        try {
            let url = "/admin/intelligence/escalations";
            if (filterActive === "ACTIVE") url += "?active=true";
            if (filterActive === "RESOLVED") url += "?active=false";
            
            const res = await api.get(url);
            setEscalations(res.data);
        } catch (err) {
            showApiError(err, "Failed to load escalations");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEscalations();
    }, [filterActive]);

    const handleActionClick = (esc, type) => {
        setSelectedEscalation(esc);
        setActionType(type);
        setActionNote("");
        setShowActionModal(true);
    };

    const submitAction = async () => {
        if (!selectedEscalation) return;
        
        try {
            if (actionType === "REJECT") {
                await api.patch(`/admin/intelligence/escalations/${selectedEscalation.id}/reject`, {
                    note: actionNote.trim()
                });
                showSuccess("Document rejected and escalation resolved.");
            } else {
                await api.patch(`/admin/intelligence/escalations/${selectedEscalation.id}/resolve`, {
                    note: actionNote.trim()
                });
                showSuccess("Escalation resolved successfully.");
            }
            setShowActionModal(false);
            fetchEscalations(); // Refresh list
        } catch (err) {
            showApiError(err, `Failed to ${actionType.toLowerCase()} escalation`);
        }
    };

    if (loading && escalations.length === 0) {
        return (
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm text-center py-20 flex flex-col justify-center items-center">
                <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="font-semibold text-gray-700 mt-4">Loading Escalations...</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                <div>
                    <h3 className="font-bold text-gray-800 text-lg">Escalation Management Center</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Review, investigate, and resolve verifier manual escalations</p>
                </div>
                
                <div className="flex bg-white border border-gray-200 rounded-lg p-1">
                    <button 
                        onClick={() => setFilterActive("ACTIVE")}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${filterActive === "ACTIVE" ? "bg-yellow-100 text-yellow-800" : "text-gray-500 hover:bg-gray-50"}`}
                    >
                        Active
                    </button>
                    <button 
                        onClick={() => setFilterActive("RESOLVED")}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${filterActive === "RESOLVED" ? "bg-green-100 text-green-800" : "text-gray-500 hover:bg-gray-50"}`}
                    >
                        Resolved
                    </button>
                    <button 
                        onClick={() => setFilterActive("ALL")}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${filterActive === "ALL" ? "bg-gray-200 text-gray-800" : "text-gray-500 hover:bg-gray-50"}`}
                    >
                        All
                    </button>
                </div>
            </div>

            <div className="p-0 overflow-y-auto max-h-[600px]">
                {escalations.length === 0 ? (
                    <div className="text-center py-16 text-gray-400">
                        <span className="text-4xl block mb-2">✅</span>
                        <p className="font-bold text-gray-600">No {filterActive.toLowerCase()} escalations found.</p>
                        <p className="text-xs mt-1">The verification queue is running smoothly.</p>
                    </div>
                ) : (
                    <table className="w-full text-left text-xs">
                        <thead className="bg-gray-50 text-gray-500 border-b border-gray-100">
                            <tr>
                                <th className="p-4 font-bold uppercase tracking-wider">Escalation Details</th>
                                <th className="p-4 font-bold uppercase tracking-wider">Source Context</th>
                                <th className="p-4 font-bold uppercase tracking-wider text-center">Points</th>
                                <th className="p-4 font-bold uppercase tracking-wider text-center">Status</th>
                                <th className="p-4 font-bold uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {escalations.map(esc => (
                                <tr key={esc.id} className="hover:bg-gray-50/50 transition">
                                    <td className="p-4 align-top">
                                        <div className="font-bold text-gray-800 mb-1">{esc.reason.split(' (Notes:')[0]}</div>
                                        {esc.reason.includes('(Notes:') && (
                                            <div className="text-gray-500 italic bg-yellow-50/50 p-2 border-l-2 border-yellow-300 rounded text-[11px] mt-2">
                                                "{esc.reason.split('(Notes: ')[1].replace(')', '')}"
                                            </div>
                                        )}
                                        <div className="text-[10px] text-gray-400 font-mono mt-2">ID: {esc.id}</div>
                                    </td>
                                    <td className="p-4 align-top">
                                        <div className="font-mono text-[11px] text-gray-600"><span className="text-gray-400">Rec ID:</span> {esc.recommendationId.substring(0,8)}...</div>
                                        <div className="font-mono text-[11px] text-gray-600 mt-1"><span className="text-gray-400">Source Type:</span> {esc.sourceType}</div>
                                        <div className="font-mono text-[11px] text-gray-600 mt-1"><span className="text-gray-400">Date:</span> {new Date(esc.createdAt).toLocaleDateString()}</div>
                                    </td>
                                    <td className="p-4 align-top text-center">
                                        <span className="inline-flex items-center justify-center px-2 py-1 bg-red-100 text-red-700 rounded font-bold">
                                            +{esc.escalationPoints}
                                        </span>
                                    </td>
                                    <td className="p-4 align-top text-center">
                                        {esc.active ? (
                                            <span className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 rounded font-bold text-[10px] uppercase">Active</span>
                                        ) : (
                                            <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 rounded font-bold text-[10px] uppercase">Resolved</span>
                                        )}
                                    </td>
                                    <td className="p-4 align-top text-right">
                                        {esc.active && (
                                            <div className="flex justify-end gap-2">
                                                <button 
                                                    onClick={() => handleActionClick(esc, "REJECT")}
                                                    className="px-3 py-1.5 bg-red-600 text-white rounded font-bold text-[10px] hover:bg-red-700 transition shadow-sm"
                                                >
                                                    Reject Doc
                                                </button>
                                                <button 
                                                    onClick={() => handleActionClick(esc, "RESOLVE")}
                                                    className="px-3 py-1.5 bg-indigo-600 text-white rounded font-bold text-[10px] hover:bg-indigo-700 transition shadow-sm"
                                                >
                                                    Resolve Esc
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Action Modal */}
            {showActionModal && selectedEscalation && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-gray-200">
                        <h4 className="font-bold text-gray-800 text-lg mb-2">
                            {actionType === "REJECT" ? "Reject Document" : "Resolve Escalation"}
                        </h4>
                        <p className="text-xs text-gray-500 mb-4">
                            {actionType === "REJECT" 
                                ? "This will mark the original document as REJECTED and resolve the escalation. The student will be notified."
                                : "Marking this escalation as resolved will remove the penalty points from the priority queue. The verifier will proceed with verification."}
                        </p>
                        
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 mb-4 text-xs">
                            <span className="font-bold text-gray-700 block mb-1">Original Reason:</span>
                            <span className="text-gray-600">{selectedEscalation.reason}</span>
                        </div>

                        <textarea
                            value={actionNote}
                            onChange={e => setActionNote(e.target.value)}
                            placeholder={actionType === "REJECT" ? "Rejection reason / admin notes..." : "Optional: Admin resolution notes..."}
                            rows={3}
                            className="w-full border border-gray-200 rounded-lg p-3 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                        
                        <div className="flex justify-end gap-2 mt-4">
                            <button
                                onClick={() => setShowActionModal(false)}
                                className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded text-xs font-semibold hover:bg-gray-200 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={submitAction}
                                className={`px-3 py-1.5 text-white rounded text-xs font-semibold transition ${
                                    actionType === "REJECT" ? "bg-red-600 hover:bg-red-700" : "bg-indigo-600 hover:bg-indigo-700"
                                }`}
                            >
                                {actionType === "REJECT" ? "Confirm Rejection" : "Confirm Resolution"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EscalationManagementPanel;
