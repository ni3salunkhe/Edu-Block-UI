import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { showSuccess, showApiError } from "../../utils/toast";
import { validate, required, minLength } from "../../utils/validate";

const ReviewDocument = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [doc, setDoc] = useState(null);
    const [rec, setRec] = useState(null);
    const [loading, setLoading] = useState(false);
    
    // Refresh states
    const [refreshLoading, setRefreshLoading] = useState(false);
    const [refreshError, setRefreshError] = useState("");

    // Normal Rejection Modal (non-override)
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectComment, setRejectComment] = useState("");

    // Override Modal
    const [showOverrideModal, setShowOverrideModal] = useState(false);
    const [overrideAction, setOverrideAction] = useState(""); // "APPROVED" or "REJECTED"
    const [overrideReason, setOverrideReason] = useState("");
    const [overrideComment, setOverrideComment] = useState("");

    // Accordion states for Evidence Drawer
    const [openSection, setOpenSection] = useState("");

    useEffect(() => {
        const fetchDocAndRec = async () => {
            try {
                const docRes = await api.get(`/verifier/document/${id}`);
                setDoc(docRes.data);
                
                const recRes = await api.get(`/verifier/document/${id}/recommendation`);
                setRec(recRes.data);
            } catch (err) {
                showApiError(err, "Failed to load document and recommendation details.");
            }
        };
        fetchDocAndRec();
    }, [id]);

    const checkIsOverride = (action) => {
        if (!rec) return false;
        if (rec.recommendation === "APPROVE" && action === "REJECTED") return true;
        if (rec.recommendation === "REJECT" && action === "APPROVED") return true;
        return false;
    };

    const approve = async () => {
        if (checkIsOverride("APPROVED")) {
            setOverrideAction("APPROVED");
            setOverrideReason("");
            setOverrideComment("");
            setShowOverrideModal(true);
            return;
        }

        if (!window.confirm("Approve this document?")) return;
        setLoading(true);
        try {
            // Submit agreed feedback silently
            if (rec) {
                await api.post(`/verifier/document/${id}/feedback`, {
                    actualDecision: "APPROVED",
                    comment: "AI recommendation accepted.",
                    overrideReason: ""
                });
            }
            await api.patch(`/verifier/document/${id}/approve`);
            showSuccess("Document approved successfully.");
            navigate("/verifier/queue");
        } catch (err) {
            showApiError(err, "Failed to approve document.");
        } finally {
            setLoading(false);
        }
    };

    const handleRejectClick = () => {
        if (checkIsOverride("REJECTED")) {
            setOverrideAction("REJECTED");
            setOverrideReason("");
            setOverrideComment("");
            setShowOverrideModal(true);
        } else {
            setRejectComment("");
            setShowRejectModal(true);
        }
    };

    const submitRejection = async () => {
        if (!validate([
            required(rejectComment, "Rejection reason"),
            minLength(rejectComment, 10, "Rejection reason"),
        ])) return;

        setLoading(true);
        try {
            if (rec) {
                await api.post(`/verifier/document/${id}/feedback`, {
                    actualDecision: "REJECTED",
                    comment: rejectComment.trim(),
                    overrideReason: ""
                });
            }
            await api.patch(`/verifier/document/${id}/reject`, { comment: rejectComment.trim() });
            showSuccess("Document rejected and file permanently removed from server.");
            setShowRejectModal(false);
            navigate("/verifier/queue");
        } catch (err) {
            showApiError(err, "Failed to reject document.");
        } finally {
            setLoading(false);
        }
    };

    const submitOverride = async () => {
        if (!overrideReason) {
            showApiError(null, "Please select an override reason.");
            return;
        }
        if (overrideComment.trim().length < 20) {
            showApiError(null, "Please write an explanation comment of at least 20 characters.");
            return;
        }

        setLoading(true);
        try {
            // 1. Save feedback override
            await api.post(`/verifier/document/${id}/feedback`, {
                actualDecision: overrideAction,
                comment: overrideComment.trim(),
                overrideReason: overrideReason
            });

            // 2. Perform core action
            if (overrideAction === "APPROVED") {
                await api.patch(`/verifier/document/${id}/approve`);
                showSuccess("Recommendation overridden and document approved.");
            } else {
                await api.patch(`/verifier/document/${id}/reject`, { comment: overrideComment.trim() });
                showSuccess("Recommendation overridden and document rejected.");
            }

            setShowOverrideModal(false);
            navigate("/verifier/queue");
        } catch (err) {
            showApiError(err, "Failed to complete override action.");
        } finally {
            setLoading(false);
        }
    };

    const refreshRecommendation = async () => {
        setRefreshLoading(true);
        setRefreshError("");
        try {
            const res = await api.post(`/verifier/document/${id}/recommendation/refresh`);
            setRec(res.data);
            showSuccess("Recommendation refreshed successfully.");
        } catch (err) {
            const msg = err.response?.data?.error || "Failed to refresh recommendation.";
            setRefreshError(msg);
        } finally {
            setRefreshLoading(false);
        }
    };

    const toggleSection = (section) => {
        setOpenSection(openSection === section ? "" : section);
    };

    if (!doc) return <div className="p-6 text-gray-500">Loading...</div>;

    const fileUrl = doc.previewUrl ? doc.previewUrl.replace("http://", "https://") : null;
    const isPdf = fileUrl && (
        fileUrl.toLowerCase().includes(".pdf") ||
        fileUrl.toLowerCase().includes("/raw/upload/")
    );

    const isExpired = rec && new Date(rec.expiresAt) < new Date();

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4">

            {/* Document Preview */}
            <div className="bg-white p-4 rounded-xl shadow flex flex-col h-fit">
                <h3 className="font-semibold text-gray-800 mb-3">Document Preview</h3>

                {!fileUrl ? (
                    <div className="flex items-center justify-center h-[500px] bg-gray-100 rounded text-gray-400 text-sm">
                        No document URL available
                    </div>
                ) : isPdf ? (
                    <iframe
                        src={`https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`}
                        title="Document Preview"
                        className="w-full h-[500px] border rounded"
                    />
                ) : (
                    <img src={fileUrl} alt="Document" className="w-full object-contain max-h-[500px] rounded border" />
                )}

                {fileUrl && (
                    <a
                        href={isPdf ? `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=false` : fileUrl}
                        target="_blank" rel="noopener noreferrer"
                        className="mt-3 text-sm text-blue-600 hover:underline self-start"
                    >
                        Open in new tab ↗
                    </a>
                )}
            </div>

            {/* Review Panel with Copilot Assistance */}
            <div className="space-y-6 flex flex-col">
                
                {/* AI Reviewer Copilot Panel */}
                {rec && (
                    <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="font-bold text-slate-800 text-base flex items-center gap-2">
                                <span className="flex h-2.5 w-2.5 rounded-full bg-indigo-600 animate-pulse"></span>
                                AI Reviewer Copilot Assistance
                            </h4>
                            <span className="text-xs text-slate-500 font-mono">
                                {rec.modelVersion} (v{rec.generationNumber})
                            </span>
                        </div>

                        {/* Freshness Alert */}
                        {isExpired && (
                            <div className="bg-amber-50 border-l-4 border-amber-500 p-3 rounded text-amber-800 text-xs">
                                ⚠ Stale recommendation. The trust scores or models may have changed. Click Refresh below.
                            </div>
                        )}

                        {/* Contradictory Warning */}
                        {rec.contradictorySignals && (
                            <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded text-red-800 text-xs font-semibold">
                                ⚠ Mixed signals detected: Document validation results heavily conflict with institution trust.
                            </div>
                        )}

                        {/* Action Badge & Scores */}
                        <div className="grid grid-cols-3 gap-4 bg-white p-4 rounded-xl border border-slate-200">
                            <div>
                                <p className="text-[10px] text-slate-400 font-medium uppercase">Recommendation</p>
                                <span className={`inline-block mt-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                                    rec.recommendation === "APPROVE" ? "bg-green-100 text-green-700" :
                                    rec.recommendation === "REJECT" ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"
                                }`}>
                                    {rec.recommendation}
                                </span>
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400 font-medium uppercase">AI Confidence</p>
                                <span className="inline-block mt-1 text-sm font-bold text-slate-700">
                                    {rec.confidence}
                                </span>
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400 font-medium uppercase">Priority Score</p>
                                <span className="inline-block mt-1 text-sm font-bold text-indigo-700">
                                    {rec.reviewPriority}/100
                                </span>
                            </div>
                        </div>

                        {/* Breakdown Summary */}
                        {rec.scoreBreakdown && (
                            <div className="text-[11px] text-slate-500 space-y-1 bg-slate-50 p-3 rounded border border-slate-200">
                                <p className="font-semibold text-slate-600 mb-1">Score Breakdown (Score: {rec.recommendationScore}/100)</p>
                                <div className="grid grid-cols-2 gap-x-4">
                                    <p>Institution Trust: <span className={rec.scoreBreakdown.trustContribution >= 0 ? "text-green-600 font-bold" : "text-red-600 font-bold"}>{rec.scoreBreakdown.trustContribution >= 0 ? "+" : ""}{rec.scoreBreakdown.trustContribution}</span></p>
                                    <p>Validation Rules: <span className={rec.scoreBreakdown.verificationContribution >= 0 ? "text-green-600 font-bold" : "text-red-600 font-bold"}>{rec.scoreBreakdown.verificationContribution >= 0 ? "+" : ""}{rec.scoreBreakdown.verificationContribution}</span></p>
                                    <p>Active Fraud: <span className={rec.scoreBreakdown.fraudContribution >= 0 ? "text-green-600 font-bold" : "text-red-600 font-bold"}>{rec.scoreBreakdown.fraudContribution >= 0 ? "+" : ""}{rec.scoreBreakdown.fraudContribution}</span></p>
                                    <p>Blockchain: <span className="text-green-600 font-bold">+{rec.scoreBreakdown.blockchainContribution}</span></p>
                                    <p>Risk Events: <span className={rec.scoreBreakdown.riskContribution >= 0 ? "text-green-600 font-bold" : "text-red-600 font-bold"}>{rec.scoreBreakdown.riskContribution >= 0 ? "+" : ""}{rec.scoreBreakdown.riskContribution}</span></p>
                                </div>
                            </div>
                        )}

                        {/* Natural Explanations */}
                        <div className="space-y-1.5">
                            <p className="text-xs font-semibold text-slate-700">Explanations:</p>
                            <ul className="text-xs space-y-1 text-slate-600">
                                {rec.explanationSummary && rec.explanationSummary.map((exp, index) => (
                                    <li key={index} className="flex items-start gap-1">
                                        <span>•</span>
                                        <span>{exp}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Throttled Refresh Button */}
                        <div className="pt-2 flex items-center gap-2">
                            <button
                                disabled={refreshLoading}
                                onClick={refreshRecommendation}
                                className="text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 disabled:opacity-50 px-3 py-1.5 rounded-lg border border-indigo-200 transition font-semibold"
                            >
                                {refreshLoading ? "Recalculating..." : "Refresh Recommendation ↻"}
                            </button>
                            {refreshError && (
                                <span className="text-[10px] text-red-500 font-medium">
                                    {refreshError}
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* Evidence Drawer Component */}
                {rec && rec.evidenceSnapshot && (
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
                        <h4 className="font-semibold text-sm text-slate-800 mb-2">Evidence Drawer</h4>

                        {/* OCR Summary Accordion */}
                        <div className="border border-slate-100 rounded-lg overflow-hidden">
                            <button
                                onClick={() => toggleSection("ocr")}
                                className="w-full bg-slate-50 hover:bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 flex justify-between items-center transition"
                            >
                                <span>OCR Content Summary</span>
                                <span>{openSection === "ocr" ? "▲" : "▼"}</span>
                            </button>
                            {openSection === "ocr" && (
                                <div className="p-3 text-xs text-slate-600 space-y-1 bg-white border-t border-slate-100">
                                    <p><strong>OCR Hash:</strong> <span className="font-mono text-[10px]">{rec.evidenceSnapshot.ocrTextHash || "N/A"}</span></p>
                                    <p><strong>Average Word Confidence:</strong> {rec.evidenceSnapshot.ocrWordConfidence.toFixed(1)}%</p>
                                </div>
                            )}
                        </div>

                        {/* Institution Trust Accordion */}
                        <div className="border border-slate-100 rounded-lg overflow-hidden">
                            <button
                                onClick={() => toggleSection("trust")}
                                className="w-full bg-slate-50 hover:bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 flex justify-between items-center transition"
                            >
                                <span>Institution Trust Details</span>
                                <span>{openSection === "trust" ? "▲" : "▼"}</span>
                            </button>
                            {openSection === "trust" && (
                                <div className="p-3 text-xs text-slate-600 space-y-1 bg-white border-t border-slate-100">
                                    <p><strong>Name:</strong> {rec.evidenceSnapshot.institutionName}</p>
                                    <p><strong>Trust Score:</strong> {rec.evidenceSnapshot.institutionTrustScore}/100 ({rec.evidenceSnapshot.institutionTrustTier})</p>
                                    <p><strong>Active Risk Events:</strong> {rec.evidenceSnapshot.hasActiveRiskEvents ? "YES (PENALIZED)" : "NONE"}</p>
                                </div>
                            )}
                        </div>

                        {/* Fraud Findings Accordion */}
                        <div className="border border-slate-100 rounded-lg overflow-hidden">
                            <button
                                onClick={() => toggleSection("fraud")}
                                className="w-full bg-slate-50 hover:bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 flex justify-between items-center transition"
                            >
                                <span>Fraud Findings</span>
                                <span>{openSection === "fraud" ? "▲" : "▼"}</span>
                            </button>
                            {openSection === "fraud" && (
                                <div className="p-3 text-xs text-slate-600 space-y-1 bg-white border-t border-slate-100">
                                    <p><strong>Visual Duplicate Match:</strong> {rec.evidenceSnapshot.hasDuplicateSimilarity ? "YES (MUTED)" : "NO"}</p>
                                    <p><strong>Active Fraud Signals:</strong></p>
                                    {rec.evidenceSnapshot.activeFraudSignals && rec.evidenceSnapshot.activeFraudSignals.length > 0 ? (
                                        <ul className="list-disc pl-4 space-y-0.5 mt-1">
                                            {rec.evidenceSnapshot.activeFraudSignals.map((fs, idx) => (
                                                <li key={idx} className="text-red-600 font-semibold">{fs}</li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <span className="text-green-600">None detected</span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Core Review Details & Decision Panel */}
                <div className="bg-white p-6 rounded-xl shadow border border-slate-100 space-y-4">
                    <h3 className="font-semibold text-base text-gray-900">Final Verification Decisions</h3>

                    <div className="space-y-2 text-sm text-gray-700 bg-slate-50 p-4 rounded-lg">
                        <p><strong>Owner:</strong> {doc.ownerName || "—"}</p>
                        <p>
                            <strong>AI Verification Result:</strong>{" "}
                            <span className={doc.status === "AI_FLAGGED" ? "text-red-600 font-semibold" : "text-blue-600 font-semibold"}>
                                {doc.status || "—"}
                            </span>
                        </p>
                        <p className="break-all">
                            <strong>SHA256:</strong>{" "}
                            <span className="font-mono text-xs text-gray-500">{doc.sha256Hash || "—"}</span>
                        </p>
                        <p>
                            <strong>Blockchain:</strong>{" "}
                            {doc.blockchainTx
                                ? <span className="text-green-600 font-semibold">✓ Anchored</span>
                                : <span className="text-gray-400">Not Anchored</span>}
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <button
                            disabled={loading}
                            onClick={approve}
                            className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold px-5 py-3 rounded-lg transition"
                        >
                            ✓ Approve Document
                        </button>
                        <button
                            disabled={loading}
                            onClick={handleRejectClick}
                            className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold px-5 py-3 rounded-lg transition"
                        >
                            ✕ Reject Document
                        </button>
                    </div>
                </div>
            </div>

            {/* Rejection Modal (Regular Flow) */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="bg-red-100 p-2 rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-red-600">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900">Reject Document</h4>
                                <p className="text-sm text-gray-500 mt-0.5">
                                    The file will be <span className="text-red-600 font-medium">permanently deleted</span> from Cloudinary.
                                </p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Rejection Reason <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                rows={4}
                                value={rejectComment}
                                onChange={(e) => setRejectComment(e.target.value)}
                                placeholder="Explain why this document is being rejected (min. 10 characters)..."
                                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent resize-none"
                            />
                        </div>

                        <div className="flex gap-3 pt-1">
                            <button
                                onClick={() => setShowRejectModal(false)}
                                className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2.5 rounded-lg text-sm transition"
                            >
                                Cancel
                            </button>
                            <button
                                disabled={loading}
                                onClick={submitRejection}
                                className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg text-sm transition"
                            >
                                {loading ? "Rejecting..." : "Confirm Reject"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Recommendation Override Feedback Modal */}
            {showOverrideModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="bg-amber-100 p-2 rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-amber-600">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900">Override AI Recommendation</h4>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    You are changing the recommendation from <span className="font-semibold uppercase text-indigo-700">{rec.recommendation}</span> to <span className="font-semibold uppercase text-indigo-700">{overrideAction}</span>. Strict feedback quality validations apply.
                                </p>
                            </div>
                        </div>

                        {/* Reason Dropdown */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Reason for Override <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={overrideReason}
                                onChange={(e) => setOverrideReason(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            >
                                <option value="">-- Select Reason --</option>
                                <option value="FALSE_POSITIVE_FRAUD">False Positive Fraud Signal</option>
                                <option value="TRUST_PROFILE_OUTDATED">Trust Profile is Outdated</option>
                                <option value="ALTERNATIVE_VALID_FORMAT">Alternative Valid Format Checked</option>
                                <option value="LEGITIMATE_STUDENT_MATCH">Legitimate Student Registry Match</option>
                                <option value="OTHER">Other Reason</option>
                            </select>
                        </div>

                        {/* Detailed Comments */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Explain Override Decisions (Min. 20 chars) <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                rows={4}
                                value={overrideComment}
                                onChange={(e) => setOverrideComment(e.target.value)}
                                placeholder="Explain why you are overriding this AI recommendation. Provide detailed auditing information..."
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                            />
                            <div className="flex justify-between items-center mt-1">
                                <span className={`text-[10px] font-semibold ${overrideComment.trim().length >= 20 ? "text-green-600" : "text-red-500"}`}>
                                    {overrideComment.trim().length}/20 characters
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-1">
                            <button
                                onClick={() => setShowOverrideModal(false)}
                                className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2 rounded-lg text-xs transition"
                            >
                                Cancel
                            </button>
                            <button
                                disabled={loading || !overrideReason || overrideComment.trim().length < 20}
                                onClick={submitOverride}
                                className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold py-2 rounded-lg text-xs transition"
                            >
                                {loading ? "Saving Override..." : "Submit Decision"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReviewDocument;
