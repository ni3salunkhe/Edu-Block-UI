import React, { useState } from "react";
import api from "../../services/api";
import { validate, required, fileRequired, fileType, fileSize } from "../../utils/validate";
import { showSuccess, showApiError } from "../../utils/toast";

const DOCUMENT_TYPES = [
    "Transcript",
    "Diploma",
    "Certificate",
    "Degree",
    "ID Proof",
    "Other",
];

// ── Circular SVG Progress Bar ─────────────────────────────────────────────────
const CircularProgress = ({ percent }) => {
    const r = 48;
    const circumference = 2 * Math.PI * r;
    const offset = circumference - (percent / 100) * circumference;

    return (
        <div className="flex flex-col items-center gap-3 py-4">
            <svg width="120" height="120" viewBox="0 0 120 120" className="rotate-[-90deg]">
                {/* Background ring */}
                <circle
                    cx="60" cy="60" r={r}
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="10"
                />
                {/* Progress ring */}
                <circle
                    cx="60" cy="60" r={r}
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    style={{ transition: "stroke-dashoffset 0.3s ease" }}
                />
            </svg>
            {/* Percentage label (un-rotate it) */}
            <div className="relative" style={{ marginTop: "-90px" }}>
                <span
                    className="absolute inset-0 flex items-center justify-center text-xl font-bold text-blue-600"
                    style={{ transform: "none", lineHeight: "80px" }}
                >
                    {percent}%
                </span>
            </div>
            <p className="text-sm text-gray-500 mt-10">Uploading document…</p>
        </div>
    );
};

// ── Main Component ────────────────────────────────────────────────────────────
const UploadDocument = () => {
    const [file, setFile] = useState(null);
    const [documentType, setDocumentType] = useState("");
    const [customType, setCustomType] = useState("");
    const [loading, setLoading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const [uploadPercent, setUploadPercent] = useState(0);

    const resolvedType = documentType === "Other" ? customType : documentType;

    const handleFileChange = (selectedFile) => {
        if (!selectedFile) return;
        if (!validate([fileType(selectedFile), fileSize(selectedFile)])) {
            setFile(null);
            return;
        }
        setFile(selectedFile);
    };

    const handleUpload = async (e) => {
        e.preventDefault();

        if (!validate([
            required(documentType, "Document type"),
            ...(documentType === "Other" ? [required(customType, "Custom document type")] : []),
            fileRequired(file),
            fileType(file),
            fileSize(file),
        ])) return;

        const formData = new FormData();
        formData.append("file", file);
        formData.append("documentType", resolvedType.trim());

        try {
            setLoading(true);
            setUploadPercent(0);

            await api.post("/documents/upload", formData, {
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const pct = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        setUploadPercent(pct);
                    }
                },
            });

            setUploadPercent(100);
            showSuccess("Document uploaded successfully! It is now being processed.");
            setFile(null);
            setDocumentType("");
            setCustomType("");
        } catch (err) {
            showApiError(err, "Upload failed. Please try again.");
        } finally {
            setLoading(false);
            setUploadPercent(0);
        }
    };

    return (
        <div className="w-full max-w-lg mx-auto">
            <div className="bg-white rounded-2xl shadow p-6 sm:p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-1">Upload Document</h2>
                <p className="text-sm text-gray-500 mb-6">Supported formats: PDF, JPG, PNG (max 10 MB)</p>

                {/* ── Upload Progress Overlay ── */}
                {loading ? (
                    <CircularProgress percent={uploadPercent} />
                ) : (
                    <form onSubmit={handleUpload} className="space-y-5" noValidate>

                        {/* Document Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Document Type <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={documentType}
                                onChange={(e) => setDocumentType(e.target.value)}
                                className="w-full border border-gray-300 px-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
                            >
                                <option value="">Select document type</option>
                                {DOCUMENT_TYPES.map((t) => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </div>

                        {documentType === "Other" && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Specify Type <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Internship Letter"
                                    value={customType}
                                    onChange={(e) => setCustomType(e.target.value)}
                                    className="w-full border border-gray-300 px-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                />
                            </div>
                        )}

                        {/* File Drop Zone */}
                        <div
                            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${dragOver ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400"
                                }`}
                            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={(e) => {
                                e.preventDefault();
                                setDragOver(false);
                                handleFileChange(e.dataTransfer.files[0]);
                            }}
                            onClick={() => document.getElementById("file-input").click()}
                        >
                            <input
                                id="file-input"
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                className="hidden"
                                onChange={(e) => handleFileChange(e.target.files[0])}
                            />
                            {file ? (
                                <div>
                                    <p className="text-sm font-medium text-blue-700">{file.name}</p>
                                    <p className="text-xs text-gray-400 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); setFile(null); }}
                                        className="mt-2 text-xs text-red-500 hover:underline"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <svg className="mx-auto h-10 w-10 text-gray-400 mb-2" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                        <path d="M28 8H12a4 4 0 00-4 4v20m0 0v4a4 4 0 004 4h24a4 4 0 004-4V28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4-4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    <p className="text-sm text-gray-500">
                                        <span className="text-blue-600 font-medium">Click to upload</span> or drag &amp; drop
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG up to 10 MB</p>
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg text-sm transition"
                        >
                            Upload Document
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default UploadDocument;
