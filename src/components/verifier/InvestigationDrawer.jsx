import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { showSuccess, showApiError } from "../../utils/toast";
import PriorityBadge from "./PriorityBadge";
import RiskBadge from "./RiskBadge";
import TrustBadge from "./TrustBadge";
import RecommendationCard from "./RecommendationCard";
import FraudSignalsPanel from "./FraudSignalsPanel";
import TrustProfilePanel from "./TrustProfilePanel";
import NetworkIntelligencePanel from "./NetworkIntelligencePanel";
import EvidenceTimeline from "./EvidenceTimeline";

const InvestigationDrawer = ({ docId, recommendationId, onActionComplete, onClose }) => {
    const [activeTab, setActiveTab] = useState("Overview");
    const [loading, setLoading] = useState(false);
    const [docData, setDocData] = useState(null);
    const [verificationData, setVerificationData] = useState(null);
    const [recData, setRecData] = useState(null);
    const [networkData, setNetworkData] = useState(null);
    const [trustData, setTrustData] = useState(null);

    // Modals & Action States
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectComment, setRejectComment] = useState("");
    const [showDocumentPreviewModal, setShowDocumentPreviewModal] = useState(false);
    
    const [showEscalateModal, setShowEscalateModal] = useState(false);
    const [escalateReason, setEscalateReason] = useState("");
    const [escalateNotes, setEscalateNotes] = useState("");

    useEffect(() => {
        if (!docId) return;

        const loadAllIntelligence = async () => {
            setLoading(true);
            try {
                // 1. Fetch document basic details
                const docRes = await api.get(`/verifier/document/${docId}`);
                setDocData(docRes.data);

                // 2. Fetch recommendation
                let activeRec = null;
                try {
                    const recRes = await api.get(`/verifier/document/${docId}/recommendation`);
                    activeRec = recRes.data;
                    setRecData(activeRec);
                } catch (err) {
                    console.error("Failed to load recommendation", err);
                }

                // 3. Fetch static verification results & fraud signals
                let verif = null;
                try {
                    const verRes = await api.get(`/documents/${docId}/verification`);
                    verif = verRes.data;
                    setVerificationData(verif);
                } catch (err) {
                    console.error("Failed to load verification data", err);
                }

                // 4. Fetch network intelligence details (cluster, campaign, escalations)
                try {
                    const netRes = await api.get(`/verifier/queue/network/details/${docId}`);
                    setNetworkData(netRes.data);
                } catch (err) {
                    console.error("Failed to load network intelligence details", err);
                }

                // 5. Fetch full DocumentDTO to resolve issuingInstitutionId & trust score
                try {
                    const fullDocRes = await api.get(`/documents/${docId}`);
                    const fullDoc = fullDocRes.data;
                    if (fullDoc && fullDoc.trustMetadata && fullDoc.trustMetadata.issuingInstitutionId) {
                        const instId = fullDoc.trustMetadata.issuingInstitutionId;
                        const trustRes = await api.get(`/verifier/queue/trust/institution/${instId}`);
                        setTrustData(trustRes.data);
                    }
                } catch (err) {
                    console.error("Failed to load trust profile data", err);
                }

            } catch (err) {
                showApiError(err, "Failed to load intelligence workspace data.");
            } finally {
                setLoading(false);
            }
        };

        loadAllIntelligence();
        setActiveTab("Overview");
    }, [docId]);

    if (!docId) {
        return (
            <div className="bg-white p-6 rounded-xl border border-gray-150 shadow-sm text-center text-gray-500 h-96 flex flex-col justify-center items-center">
                <span className="text-3xl mb-2">🔍</span>
                <p className="font-semibold text-gray-700">No Document Selected</p>
                <p className="text-xs text-gray-400 mt-1 max-w-xs">Select a document from the queue on the left to load the verifier investigation workspace.</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="bg-white p-6 rounded-xl border border-gray-150 shadow-sm text-center text-gray-500 h-96 flex flex-col justify-center items-center">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="font-semibold text-gray-700 mt-4">Loading Intelligence Console Workspace...</p>
                <p className="text-xs text-gray-400 mt-1">Fetching AI-2, AI-3, AI-4, and AI-6 data layers.</p>
            </div>
        );
    }

    // Handlers
    const checkIsOverride = (action) => {
        if (!recData) return false;
        if (recData.recommendation === "APPROVE" && action === "REJECTED") return true;
        if (recData.recommendation === "REJECT" && action === "APPROVED") return true;
        return false;
    };

    const handleApprove = async () => {
        const isOverride = checkIsOverride("APPROVED");
        if (isOverride) {
            // Re-route to override reasoning dialog or confirm
            if (!window.confirm("WARNING: This action overrides the AI's recommendation to REJECT. Proceed?")) return;
        } else {
            if (!window.confirm("Approve this document?")) return;
        }

        try {
            if (recData) {
                await api.post(`/verifier/document/${docId}/feedback`, {
                    actualDecision: "APPROVED",
                    comment: isOverride ? "Accepting document despite AI risk warning." : "AI recommendation accepted.",
                    overrideReason: isOverride ? "ADMIN_DECISION" : ""
                });
            }
            await api.patch(`/verifier/document/${docId}/approve`);
            showSuccess("Document approved successfully.");
            onActionComplete();
            onClose();
        } catch (err) {
            showApiError(err, "Failed to approve document.");
        }
    };

    const handleRejectSubmit = async () => {
        if (!rejectComment.trim() || rejectComment.trim().length < 10) {
            showApiError(null, "Please write an explanation comment of at least 10 characters.");
            return;
        }

        try {
            if (recData) {
                await api.post(`/verifier/document/${docId}/feedback`, {
                    actualDecision: "REJECTED",
                    comment: rejectComment.trim(),
                    overrideReason: checkIsOverride("REJECTED") ? "AI_OVERRIDE" : ""
                });
            }
            await api.patch(`/verifier/document/${docId}/reject`, { comment: rejectComment.trim() });
            showSuccess("Document rejected successfully.");
            setShowRejectModal(false);
            onActionComplete();
            onClose();
        } catch (err) {
            showApiError(err, "Failed to reject document.");
        }
    };

    const handleEscalateSubmit = async () => {
        if (!escalateReason.trim()) {
            showApiError(null, "Please select or write a reason for escalation.");
            return;
        }

        try {
            await api.post(`/verifier/queue/escalate`, {
                recommendationId: recommendationId || (recData ? recData.id : null),
                reason: escalateReason.trim(),
                notes: escalateNotes.trim()
            });
            showSuccess("Document successfully escalated and priority queue updated.");
            setShowEscalateModal(false);
            onActionComplete();
            onClose();
        } catch (err) {
            showApiError(err, "Failed to escalate document.");
        }
    };

    const tabs = ["Overview", "AI Recommendation", "Fraud Signals", "Trust Profile", "Network Intelligence", "Evidence Timeline"];

    return (
        <div className="bg-white rounded-xl border border-gray-150 shadow-md flex flex-col h-full overflow-hidden">
            {/* Header info */}
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                <div>
                    <h3 className="font-bold text-gray-800 text-base">Investigation Workspace</h3>
                    <p className="text-[11px] text-gray-400 font-mono mt-0.5">ID: {docId}</p>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 font-bold text-lg">×</button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-gray-100 text-xs overflow-x-auto bg-gray-50/50">
                {tabs.map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-3 font-semibold border-b-2 transition whitespace-nowrap ${
                            activeTab === tab ? "border-blue-500 text-blue-600 bg-white" : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Scrollable Content Workspace */}
            <div className="p-5 flex-1 overflow-y-auto min-h-0 bg-white">
                {activeTab === "Overview" && docData && (
                    <div className="space-y-6">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-center shadow-sm">
                                <span className="text-[10px] uppercase font-bold text-gray-400 block">AI Confidence</span>
                                <span className="text-lg font-black text-gray-800 block mt-1">
                                    {recData && recData.confidence === "HIGH" ? "89% (HIGH)" : recData && recData.confidence === "MEDIUM" ? "64% (MEDIUM)" : "35% (LOW)"}
                                </span>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-center shadow-sm">
                                <span className="text-[10px] uppercase font-bold text-gray-400 block">Risk Level</span>
                                <div className="mt-1">
                                    <RiskBadge riskLevel={verificationData ? verificationData.riskLevel : "LOW"} />
                                </div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-center shadow-sm">
                                <span className="text-[10px] uppercase font-bold text-gray-400 block">Trust Tier</span>
                                <div className="mt-1">
                                    <span className="text-xs font-bold text-gray-800">
                                        {trustData && trustData.profile ? trustData.profile.trustTier : "MEDIUM"}
                                    </span>
                                </div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-center shadow-sm">
                                <span className="text-[10px] uppercase font-bold text-gray-400 block">AI Recommendation</span>
                                <span className={`text-xs font-bold block mt-1 uppercase ${
                                    recData && recData.recommendation === "APPROVE" ? "text-green-600" :
                                    recData && recData.recommendation === "REJECT" ? "text-red-600" : "text-orange-600"
                                }`}>
                                    {recData ? recData.recommendation : "REVIEW"}
                                </span>
                            </div>
                        </div>

                        {/* Metadata Details */}
                        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm space-y-4">
                            <h4 className="font-semibold text-gray-800 border-b border-gray-50 pb-2">Credential Metadata</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                <div>
                                    <span className="text-gray-400 font-medium block">Document Name:</span>
                                    <span className="text-gray-800 font-semibold">{docData.fileName}</span>
                                </div>
                                <div>
                                    <span className="text-gray-400 font-medium block">Student Name:</span>
                                    <span className="text-gray-800 font-semibold">{docData.ownerName}</span>
                                </div>
                                <div>
                                    <span className="text-gray-400 font-medium block">Institution Name:</span>
                                    <span className="text-gray-800 font-semibold">
                                        {trustData && trustData.profile ? trustData.profile.institutionName : "Academic Institution"}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-400 font-medium block">Credential Reference:</span>
                                    <span className="text-gray-800 font-semibold font-mono">
                                        {verificationData && verificationData.ocrTextHash ? verificationData.ocrTextHash.substring(0, 16) : "N/A"}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-400 font-medium block">Verification Status:</span>
                                    <span className="text-gray-800 font-semibold uppercase">{docData.status}</span>
                                </div>
                                <div>
                                    <span className="text-gray-400 font-medium block">Blockchain Status:</span>
                                    <span className={`font-semibold uppercase ${docData.blockchainHash ? "text-green-600" : "text-orange-500"}`}>
                                        {docData.blockchainHash ? "✓ Anchored" : "Pending Anchor"}
                                    </span>
                                </div>
                            </div>
                            
                            {docData.previewUrl && (
                                <div className="pt-4 border-t border-gray-50">
                                    <span className="text-gray-400 font-medium block mb-2 text-xs">Document Preview:</span>
                                    <button
                                        onClick={() => setShowDocumentPreviewModal(true)}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 text-xs rounded font-bold border border-blue-100 hover:bg-blue-100 transition"
                                    >
                                        <span>👁</span> View Document
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}



                {activeTab === "AI Recommendation" && (
                    <RecommendationCard recommendation={recData} />
                )}

                {activeTab === "Fraud Signals" && (
                    <FraudSignalsPanel fraudSignals={verificationData ? verificationData.fraudSignals : []} />
                )}

                {activeTab === "Trust Profile" && (
                    <TrustProfilePanel trustData={trustData} />
                )}

                {activeTab === "Network Intelligence" && (
                    <NetworkIntelligencePanel networkData={networkData} />
                )}

                {activeTab === "Evidence Timeline" && (
                    <EvidenceTimeline
                        doc={docData}
                        verification={verificationData}
                        recommendation={recData}
                        networkData={networkData}
                    />
                )}
            </div>

            {/* Bottom Actions Drawer Panel */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3">
                <button
                    onClick={() => setShowEscalateModal(true)}
                    className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-xs font-bold shadow-sm transition"
                >
                    Request Investigation
                </button>
                <button
                    onClick={() => setShowRejectModal(true)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow-sm transition"
                >
                    Reject
                </button>
                <button
                    onClick={handleApprove}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold shadow-sm transition"
                >
                    Approve
                </button>
            </div>

            {/* Reject Modal dialog */}
            {showRejectModal && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
                        <h4 className="font-bold text-gray-800 text-lg mb-2">Reject Document Registration</h4>
                        <p className="text-xs text-gray-500 mb-4">You are about to reject this document. Please enter a valid reason (minimum 10 characters) which will be logged and visible to the candidate.</p>
                        
                        <textarea
                            value={rejectComment}
                            onChange={e => setRejectComment(e.target.value)}
                            placeholder="e.g. Document copy is illegible. Or credential reference verification failed."
                            rows={4}
                            className="w-full border border-gray-200 rounded-lg p-3 text-xs focus:ring-2 focus:ring-red-500 outline-none"
                        />
                        
                        <div className="flex justify-end gap-2 mt-4">
                            <button
                                onClick={() => setShowRejectModal(false)}
                                className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded text-xs font-semibold"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRejectSubmit}
                                className="px-3 py-1.5 bg-red-600 text-white rounded text-xs font-semibold hover:bg-red-700 transition"
                            >
                                Reject Document
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Manual Escalation Modal */}
            {showEscalateModal && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-gray-150">
                        <h4 className="font-bold text-gray-800 text-lg mb-2">Request Investigation (Manual Escalation)</h4>
                        <p className="text-xs text-gray-500 mb-4">Request a deep review by the administrator. This adds +50 escalation points to the dynamic reviewer priority queue, instantly bubbling this document to the top.</p>
                        
                        <div className="space-y-3">
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Escalation Reason</label>
                                <select
                                    value={escalateReason}
                                    onChange={e => setEscalateReason(e.target.value)}
                                    className="w-full border border-gray-200 rounded-lg p-2 text-xs focus:ring-2 focus:ring-yellow-500 outline-none"
                                >
                                    <option value="">-- Select Reason --</option>
                                    <option value="SUSPICIOUS_SIGNATURE">Suspicious credential formatting/reference signature</option>
                                    <option value="INSTITUTION_DRIFT">Suspected institution trust score drift / anomalous activity</option>
                                    <option value="CLONE_TEMPLATE">Perceptual template clones detected across nodes</option>
                                    <option value="MANUAL_AUDIT">Random workload audit selection</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Detailed Investigation Notes</label>
                                <textarea
                                    value={escalateNotes}
                                    onChange={e => setEscalateNotes(e.target.value)}
                                    placeholder="Provide notes for the administrator case investigator..."
                                    rows={3}
                                    className="w-full border border-gray-200 rounded-lg p-3 text-xs focus:ring-2 focus:ring-yellow-500 outline-none"
                                />
                            </div>
                        </div>
                        
                        <div className="flex justify-end gap-2 mt-5">
                            <button
                                onClick={() => setShowEscalateModal(false)}
                                className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded text-xs font-semibold"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleEscalateSubmit}
                                className="px-3 py-1.5 bg-yellow-500 text-white rounded text-xs font-semibold hover:bg-yellow-600 transition"
                            >
                                Escalate to Admin
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Document Preview Modal */}
            {showDocumentPreviewModal && docData && (
                <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl overflow-hidden">
                        <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50">
                            <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                                <span>📄</span> Document Preview: {docData.fileName || "Unknown"}
                            </h3>
                            <button onClick={() => setShowDocumentPreviewModal(false)} className="text-gray-400 hover:text-gray-800 font-bold text-3xl leading-none transition">&times;</button>
                        </div>
                        <div className="flex-1 p-4 bg-gray-100 overflow-hidden flex flex-col">
                            {(() => {
                                const fileUrl = docData.previewUrl ? docData.previewUrl.replace("http://", "https://") : null;
                                const isPdf = fileUrl && (
                                    fileUrl.toLowerCase().includes(".pdf") ||
                                    fileUrl.toLowerCase().includes("/raw/upload/")
                                );

                                return (
                                    <div className="flex flex-col h-full bg-white rounded border border-gray-200">
                                        {!fileUrl ? (
                                            <div className="flex items-center justify-center flex-1 text-gray-400 text-sm">
                                                No document URL available
                                            </div>
                                        ) : isPdf ? (
                                            <iframe
                                                src={`https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`}
                                                title="Document Preview"
                                                className="w-full flex-1 border-0"
                                            />
                                        ) : (
                                            <div className="flex-1 overflow-auto flex items-center justify-center bg-gray-50 p-4">
                                                <img src={fileUrl} alt="Document" className="max-w-full max-h-full object-contain shadow-sm border border-gray-200" />
                                            </div>
                                        )}
                                        {fileUrl && (
                                            <div className="p-3 bg-gray-50 border-t border-gray-200 flex justify-end">
                                                <a
                                                    href={isPdf ? `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=false` : fileUrl}
                                                    target="_blank" rel="noopener noreferrer"
                                                    className="text-xs bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700 transition inline-flex items-center gap-1.5"
                                                >
                                                    <span>↗</span> Open External Viewer
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InvestigationDrawer;
