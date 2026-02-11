import React, { useState } from "react";
import api from "../../services/api";

const UploadDocument = () => {
    const [file, setFile] = useState(null);
    const [documentType, setDocumentType] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/png"
    ];

    const handleUpload = async (e) => {
        e.preventDefault();

        if (!file || !documentType.trim()) {
            setMessage("Please select a file and enter document type");
            return;
        }

        if (!allowedTypes.includes(file.type)) {
            setMessage("Only PDF or image files allowed");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("documentType", documentType.trim());

        try {
            setLoading(true);
            await api.post("/documents/upload", formData);
            setMessage("Uploaded successfully");
            setFile(null);
            setDocumentType("");
        } catch {
            setMessage("Upload failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded shadow max-w-lg">
            <h2 className="text-xl font-semibold mb-4">
                Upload Document
            </h2>

            {message && (
                <p className="mb-3 text-sm text-red-500">
                    {message}
                </p>
            )}

            <form onSubmit={handleUpload} className="space-y-4">
                <input
                    type="text"
                    placeholder="Document Type (e.g., Transcript, Diploma)"
                    className="w-full border p-2 rounded"
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value)}
                />

                <input
                    type="file"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="w-full"
                />

                <button
                    disabled={loading}
                    type="submit"
                    className="bg-accent text-white px-4 py-2 rounded"
                >
                    {loading ? "Uploading..." : "Upload"}
                </button>
            </form>
        </div>
    );
};

export default UploadDocument;
