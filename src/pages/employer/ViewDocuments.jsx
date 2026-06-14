import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../services/api";
import { showApiError } from "../../utils/toast";

// ── Helpers ────────────────────────────────────────────────────────────────────

const formatDate = (isoString) => {
    if (!isoString) return "—";
    try {
        return new Date(isoString).toLocaleDateString("en-IN", {
            day: "2-digit", month: "short", year: "numeric",
        });
    } catch { return isoString; }
};

const trustScoreBadge = (level) => {
    switch (level) {
        case "VERY_HIGH":
            return "bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold";
        case "HIGH":
            return "bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold";
        case "MEDIUM":
            return "bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold";
        default:
            return "bg-gray-50 text-gray-500 border border-gray-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold";
    }
};

const statusBadge = (status) => {
    const map = {
        APPROVED: "text-green-600 bg-green-50",
        REJECTED: "text-red-600 bg-red-50",
        AI_VERIFIED: "text-blue-600 bg-blue-50",
        AI_FLAGGED: "text-orange-600 bg-orange-50",
        BLOCKCHAIN_ANCHORED: "text-indigo-600 bg-indigo-50",
    };
    return `px-2 py-0.5 rounded-full text-xs font-semibold ${map[status] || "text-gray-600 bg-gray-50"}`;
};

const getDisplayName = (doc) => {
    if (doc.fileName && !doc.fileName.startsWith("edublock/")) return doc.fileName;
    return `Document-${String(doc.id).slice(0, 8).toUpperCase()}`;
};

// ── Main Component ─────────────────────────────────────────────────────────────

const ViewDocuments = () => {
    const { consentId } = useParams();
    const [docs, setDocs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [expandedDoc, setExpandedDoc] = useState(null);

    useEffect(() => {
        const fetchDocs = async () => {
            try {
                setLoading(true);
                const res = await api.get(`/documents/by-consent/${consentId}`);
                setDocs(res.data);
            } catch (err) {
                console.error("Failed to fetch documents", err);
                setError("Failed to load documents.");
                showApiError(err, "Failed to load documents.");
            } finally {
                setLoading(false);
            }
        };
        fetchDocs();
    }, [consentId]);

    const handleView = (doc) => {
        if (!doc.filePath) {
            showApiError(null, "Document URL not found.");
            return;
        }
        let url = doc.filePath;
        if (url.startsWith("http://")) url = url.replace("http://", "https://");
        setSelectedDoc({ ...doc, viewerUrl: url });
    };

    const closeViewer = () => setSelectedDoc(null);

    const toggleExpand = (docId) => {
        setExpandedDoc(expandedDoc === docId ? null : docId);
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto p-4 sm:p-6">

            {/* Header */}
            <div>
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Verified Documents</h1>
                <p className="text-sm text-gray-500 mt-1.5">
                    Documents shared with you through an approved consent. Trust metadata is evaluated in real-time.
                </p>
            </div>

            {/* Loading */}
            {loading && (
                <div className="flex justify-center items-center py-12 text-gray-400">
                    <svg className="animate-spin h-5 w-5 mr-3 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Loading documents...
                </div>
            )}

            {/* Error */}
            {!loading && error && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 text-center text-rose-600 text-sm font-semibold">
                    {error}
                </div>
            )}

            {/* Empty */}
            {!loading && !error && docs.length === 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-12 text-center text-gray-400">
                    <div className="text-4xl mb-3">📄</div>
                    <p className="text-sm font-medium">No documents available for this consent.</p>
                </div>
            )}

            {/* Documents */}
            {!loading && !error && docs.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 text-[10px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100">
                                    <th className="p-4 pl-6">Document</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Trust Score</th>
                                    <th className="p-4">Blockchain</th>
                                    <th className="p-4">Uploaded</th>
                                    <th className="p-4 pr-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm">
                                {docs.map((doc) => {
                                    const t = doc.trustMetadata;
                                    const isExpanded = expandedDoc === doc.id;
                                    return (
                                        <React.Fragment key={doc.id}>
                                            <tr className="hover:bg-gray-50/50 transition">
                                                <td className="p-4 pl-6">
                                                    <div className="font-semibold text-gray-900">{getDisplayName(doc)}</div>
                                                    {t?.documentType && (
                                                        <div className="text-xs text-gray-400 mt-0.5">{t.documentType}</div>
                                                    )}
                                                </td>
                                                <td className="p-4">
                                                    <span className={statusBadge(t?.verificationStatus || doc.status)}>
                                                        {t?.verificationStatus || doc.status}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    {t?.trustScore ? (
                                                        <span className={trustScoreBadge(t.trustScore)}>
                                                            {t.trustScore === "VERY_HIGH" ? "🏆 Very High" :
                                                             t.trustScore === "HIGH" ? "✅ High" :
                                                             t.trustScore === "MEDIUM" ? "⚡ Medium" : "⚠️ Low"}
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-gray-400">—</span>
                                                    )}
                                                </td>
                                                <td className="p-4">
                                                    {t?.blockchainAnchored ? (
                                                        <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-semibold">
                                                            ⛓ Anchored
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-gray-400">—</span>
                                                    )}
                                                </td>
                                                <td className="p-4 text-xs text-gray-500">{formatDate(doc.createdAt)}</td>
                                                <td className="p-4 pr-6 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => handleView(doc)}
                                                            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-semibold transition"
                                                            title="View Document"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                                            </svg>
                                                            View
                                                        </button>
                                                        {t && (
                                                            <button
                                                                onClick={() => toggleExpand(doc.id)}
                                                                className="text-indigo-600 hover:text-indigo-800 text-xs font-semibold transition"
                                                                title="Trust Details"
                                                            >
                                                                {isExpanded ? "Hide Trust ▲" : "Trust ▼"}
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>

                                            {/* Expanded Trust Details Row */}
                                            {isExpanded && t && (
                                                <tr className="bg-indigo-50/30">
                                                    <td colSpan={6} className="px-6 py-4">
                                                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 text-xs">
                                                            {/* Source */}
                                                            <div className="space-y-0.5">
                                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Source</span>
                                                                <p className="font-semibold text-gray-800">
                                                                    {t.documentSource === "INSTITUTION_ISSUED" ? "🏛️ Institution Issued" : "👤 Individual Upload"}
                                                                </p>
                                                            </div>

                                                            {/* Institution */}
                                                            {t.issuingInstitutionName && (
                                                                <div className="space-y-0.5">
                                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Institution</span>
                                                                    <p className="font-semibold text-gray-800">{t.issuingInstitutionName}</p>
                                                                    {t.institutionTrustLevel && (
                                                                        <span className="inline-block bg-indigo-50 text-indigo-600 border border-indigo-100 px-1.5 py-0.5 rounded text-[10px] font-bold mt-0.5">
                                                                            {t.institutionTrustLevel}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            )}

                                                            {/* Credential Reference */}
                                                            {t.credentialReference && (
                                                                <div className="space-y-0.5">
                                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Credential Ref</span>
                                                                    <p className="font-mono text-indigo-700 font-semibold">{t.credentialReference}</p>
                                                                </div>
                                                            )}

                                                            {/* Verified Badge */}
                                                            <div className="space-y-0.5">
                                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Institution Verified</span>
                                                                <p className="font-semibold">
                                                                    {t.institutionVerified ? (
                                                                        <span className="text-emerald-600">✓ Verified</span>
                                                                    ) : (
                                                                        <span className="text-gray-400">Not Verified</span>
                                                                    )}
                                                                </p>
                                                            </div>

                                                            {/* Transaction Hash */}
                                                            {t.transactionHash && (
                                                                <div className="col-span-2 sm:col-span-3 lg:col-span-4 space-y-0.5">
                                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Blockchain Transaction Hash</span>
                                                                    <p className="font-mono text-indigo-600 bg-white border border-indigo-100 rounded-lg px-3 py-2 break-all text-[11px] leading-relaxed">
                                                                        {t.transactionHash}
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* PDF / Image Viewer Modal */}
            {selectedDoc && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-2xl w-11/12 max-w-4xl h-5/6 flex flex-col">
                        <div className="flex justify-between items-center px-5 py-3 border-b">
                            <h3 className="text-base font-semibold text-gray-800 truncate max-w-xs">
                                {getDisplayName(selectedDoc)}
                            </h3>
                            <div className="flex items-center gap-3">
                                <a
                                    href={
                                        (selectedDoc.viewerUrl.toLowerCase().includes(".pdf") ||
                                            selectedDoc.filePath?.toLowerCase().includes("/raw/upload/"))
                                            ? `https://docs.google.com/viewer?url=${encodeURIComponent(selectedDoc.viewerUrl)}&embedded=false`
                                            : selectedDoc.viewerUrl
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-600 hover:underline"
                                >
                                    Open in new tab ↗
                                </a>
                                <button
                                    onClick={closeViewer}
                                    className="text-gray-400 hover:text-gray-700 text-xl font-bold leading-none"
                                    title="Close"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-hidden bg-gray-100 rounded-b-xl">
                            {selectedDoc.viewerUrl.toLowerCase().includes(".pdf") ||
                                selectedDoc.filePath?.toLowerCase().includes("/raw/upload/") ? (
                                <iframe
                                    src={`https://docs.google.com/viewer?url=${encodeURIComponent(selectedDoc.viewerUrl)}&embedded=true`}
                                    className="w-full h-full border-none"
                                    title="Document Viewer"
                                />
                            ) : (
                                <img
                                    src={selectedDoc.viewerUrl}
                                    alt="Document"
                                    className="max-w-full max-h-full object-contain mx-auto block py-4"
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ViewDocuments;
