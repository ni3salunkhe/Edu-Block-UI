import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { showSuccess, showApiError } from "../../utils/toast";
import { validate, required, minLength } from "../../utils/validate";

const ReviewDocument = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [doc, setDoc] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectComment, setRejectComment] = useState("");

    useEffect(() => {
        const fetchDoc = async () => {
            try {
                const res = await api.get(`/verifier/document/${id}`);
                setDoc(res.data);
            } catch (err) {
                showApiError(err, "Failed to load document.");
            }
        };
        fetchDoc();
    }, [id]);

    const approve = async () => {
        if (!window.confirm("Approve this document?")) return;
        setLoading(true);
        try {
            await api.patch(`/verifier/document/${id}/approve`);
            showSuccess("Document approved successfully.");
            navigate("/verifier/queue");
        } catch (err) {
            showApiError(err, "Failed to approve document.");
        } finally {
            setLoading(false);
        }
    };

    const openRejectModal = () => {
        setRejectComment("");
        setShowRejectModal(true);
    };

    const submitRejection = async () => {
        if (!validate([
            required(rejectComment, "Rejection reason"),
            minLength(rejectComment, 10, "Rejection reason"),
        ])) return;

        setLoading(true);
        try {
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

    if (!doc) return <div className="p-6 text-gray-500">Loading...</div>;

    const fileUrl = doc.previewUrl ? doc.previewUrl.replace("http://", "https://") : null;
    const isPdf = fileUrl && (
        fileUrl.toLowerCase().includes(".pdf") ||
        fileUrl.toLowerCase().includes("/raw/upload/")
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Document Preview */}
            <div className="bg-white p-4 rounded-xl shadow flex flex-col">
                <h3 className="font-semibold text-gray-800 mb-3">Document Preview</h3>

                {!fileUrl ? (
                    <div className="flex items-center justify-center h-64 bg-gray-100 rounded text-gray-400 text-sm">
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

            {/* Review Panel */}
            <div className="bg-white p-6 rounded-xl shadow space-y-4">
                <h3 className="font-semibold text-lg text-gray-900">Review Details</h3>

                <div className="space-y-2 text-sm text-gray-700">
                    <p><strong>Owner:</strong> {doc.ownerName || "—"}</p>
                    <p>
                        <strong>AI Result:</strong>{" "}
                        <span className={doc.aiStatus === "AI_FLAGGED" ? "text-orange-600 font-semibold" : "text-blue-600 font-semibold"}>
                            {doc.aiStatus || "—"}
                        </span>
                    </p>
                    <p className="break-all">
                        <strong>SHA256:</strong>{" "}
                        <span className="font-mono text-xs text-gray-500">{doc.sha256Hash || "—"}</span>
                    </p>
                    <p>
                        <strong>Blockchain:</strong>{" "}
                        {doc.blockchainHash
                            ? <span className="text-green-600 font-semibold">✓ Anchored</span>
                            : <span className="text-gray-400">Not Anchored</span>}
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <button
                        disabled={loading}
                        onClick={approve}
                        className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold px-5 py-3 rounded-lg transition"
                    >
                        ✓ Approve
                    </button>
                    <button
                        disabled={loading}
                        onClick={openRejectModal}
                        className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold px-5 py-3 rounded-lg transition"
                    >
                        ✕ Reject
                    </button>
                </div>
            </div>

            {/* Rejection Comment Modal */}
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
                                    The file will be <span className="text-red-600 font-medium">permanently deleted</span> from Cloudinary. The user will see your reason.
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
                                {loading ? "Rejecting..." : "Confirm Reject & Delete File"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReviewDocument;
