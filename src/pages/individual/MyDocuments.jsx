/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import api from "../../services/api";

const MyDocuments = () => {
    const [docs, setDocs] = useState([]);
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [docUrl, setDocUrl] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchDocs = async () => {
            try {
                const res = await api.get("/documents/my");
                setDocs(res.data);
            } catch (err) {
                console.error("Failed to fetch documents", err);
            }
        };
        fetchDocs();
    }, []);

    const handleView = (doc) => {
        if (!doc.filePath) {
            alert("Document URL not found");
            return;
        }

        let url = doc.filePath;
        // Ensure HTTPS for mixed content safety
        if (url.startsWith("http://")) {
            url = url.replace("http://", "https://");
        }


        setDocUrl(url);
        setSelectedDoc(doc);
    };

    const closeViewer = () => {
        if (docUrl) {
            URL.revokeObjectURL(docUrl);
        }
        setDocUrl(null);
        setSelectedDoc(null);
    };

    const statusColor = (status) => {
        switch (status) {
            case "APPROVED":
                return "text-green-600";
            case "REJECTED":
                return "text-red-600";
            case "AI_VERIFIED":
                return "text-blue-600";
            default:
                return "text-gray-600";
        }
    };

    return (
        <div className="bg-white p-6 rounded shadow relative">
            <h2 className="text-xl font-semibold mb-4">
                My Documents
            </h2>

            <table className="w-full text-left">
                <thead>
                    <tr className="border-b">
                        <th className="p-2">Name</th>
                        <th className="p-2">Status</th>
                        <th className="p-2">Uploaded</th>
                        <th className="p-2">Action</th>
                    </tr>
                </thead>

                <tbody>
                    {docs.map((doc) => (
                        <tr key={doc.id} className="border-b">
                            <td className="p-2">{doc.fileName}</td>
                            <td className={`p-2 ${statusColor(doc.status)}`}>
                                {doc.status}
                            </td>
                            <td className="p-2">{doc.createdAt}</td>
                            <td className="p-2">
                                <button
                                    onClick={() => handleView(doc)}
                                    className="text-blue-600 hover:text-blue-800"
                                    title="View Document"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                    </svg>
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Document Viewer Modal */}
            {selectedDoc && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-11/12 h-5/6 flex flex-col">
                        <div className="flex justify-between items-center p-4 border-b">
                            <h3 className="text-lg font-semibold">{selectedDoc.fileName}</h3>
                            <button
                                onClick={closeViewer}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="flex-1 p-4 bg-gray-100 overflow-hidden relative">
                            {loading || !docUrl ? (
                                <div className="flex items-center justify-center h-full">Loading document...</div>
                            ) : (
                                <>
                                    {selectedDoc.fileName.toLowerCase().endsWith(".pdf") ? (
                                        <object
                                            data={docUrl}
                                            type="application/pdf"
                                            className="w-full h-full border-none"
                                        >
                                            <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                                                <p className="mb-2">Unable to display PDF directly.</p>
                                                <a
                                                    href={docUrl}
                                                    download={selectedDoc.fileName}
                                                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                                                >
                                                    Download PDF
                                                </a>
                                            </div>
                                        </object>
                                    ) : (
                                        <img
                                            src={docUrl}
                                            alt="Document"
                                            className="max-w-full max-h-full object-contain mx-auto"
                                        />
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyDocuments;
