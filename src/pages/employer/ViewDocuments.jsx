import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../services/api";

const ViewDocuments = () => {
    const { consentId } = useParams();
    const [docs, setDocs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedDoc, setSelectedDoc] = useState(null);

    useEffect(() => {
        const fetchDocs = async () => {
            try {
                setLoading(true);
                const res = await api.get(`/documents/by-consent/${consentId}`);
                setDocs(res.data);
            } catch (err) {
                console.error("Failed to fetch documents", err);
                setError("Failed to load documents.");
            } finally {
                setLoading(false);
            }
        };
        fetchDocs();
    }, [consentId]);

    const handleView = (doc) => {
        if (!doc.filePath) {
            alert("Document URL not found");
            return;
        }
        let url = doc.filePath;
        if (url.startsWith("http://")) url = url.replace("http://", "https://");
        setSelectedDoc({ ...doc, viewerUrl: url });
    };

    const closeViewer = () => setSelectedDoc(null);

    const getDisplayName = (doc) => {
        if (doc.fileName && !doc.fileName.startsWith("edublock/")) return doc.fileName;
        return `Document-${String(doc.id).slice(0, 8).toUpperCase()}`;
    };

    const statusBadge = (status) => {
        const map = {
            APPROVED: "text-green-600 bg-green-50",
            REJECTED: "text-red-600 bg-red-50",
            AI_VERIFIED: "text-blue-600 bg-blue-50",
            AI_FLAGGED: "text-orange-600 bg-orange-50",
        };
        return `px-2 py-0.5 rounded-full text-xs font-semibold ${map[status] || "text-gray-600 bg-gray-50"}`;
    };

    const formatDate = (isoString) => {
        if (!isoString) return "—";
        try {
            return new Date(isoString).toLocaleDateString("en-IN", {
                day: "2-digit", month: "short", year: "numeric"
            });
        } catch { return isoString; }
    };

    return (
        <div className="bg-white p-6 rounded shadow relative">
            <h2 className="text-xl font-semibold mb-4">Verified Documents</h2>

            {loading && (
                <div className="flex justify-center items-center py-10 text-gray-500">
                    <svg className="animate-spin h-5 w-5 mr-2 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Loading documents...
                </div>
            )}

            {!loading && error && (
                <div className="py-8 text-center text-red-500">{error}</div>
            )}

            {!loading && !error && docs.length === 0 && (
                <div className="py-12 text-center text-gray-400">
                    <p className="text-sm">No documents available for this consent.</p>
                </div>
            )}

            {!loading && !error && docs.length > 0 && (
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b bg-gray-50">
                            <th className="p-3 text-sm font-semibold text-gray-600">Name</th>
                            <th className="p-3 text-sm font-semibold text-gray-600">Status</th>
                            <th className="p-3 text-sm font-semibold text-gray-600">Uploaded On</th>
                            <th className="p-3 text-sm font-semibold text-gray-600">Blockchain</th>
                            <th className="p-3 text-sm font-semibold text-gray-600">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {docs.map((doc) => (
                            <tr key={doc.id} className="border-b hover:bg-gray-50 transition">
                                <td className="p-3 text-sm text-gray-800">{getDisplayName(doc)}</td>
                                <td className="p-3">
                                    <span className={statusBadge(doc.status)}>{doc.status}</span>
                                </td>
                                <td className="p-3 text-sm text-gray-500">{formatDate(doc.createdAt)}</td>
                                <td className="p-3 text-sm text-gray-500">
                                    {doc.blockchainHash ? (
                                        <span className="text-green-600 font-medium">✓ Anchored</span>
                                    ) : "—"}
                                </td>
                                <td className="p-3">
                                    <button
                                        onClick={() => handleView(doc)}
                                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                                        title="View Document"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                        </svg>
                                        View
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {/* PDF / Image Viewer Modal */}
            {selectedDoc && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
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
