import React, { useEffect, useRef, useState, useCallback } from "react";
import { useLoading } from "../../context/LoadingContext";
import { getInstitutionAssociations, issueCredential } from "../../services/institutionService";
import { showSuccess, showApiError } from "../../utils/toast";

// ── Helpers ────────────────────────────────────────────────────────────────────

const ACCEPTED_MIME = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
const ACCEPTED_EXT  = [".pdf", ".jpg", ".jpeg", ".png"];
const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB

const formatBytes = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const formatDate = (isoString) => {
  if (!isoString) return "—";
  try {
    return new Date(isoString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoString;
  }
};

// ── Spinner ────────────────────────────────────────────────────────────────────

const Spinner = ({ size = "h-5 w-5", color = "text-indigo-600" }) => (
  <svg
    className={`animate-spin ${size} ${color}`}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
  </svg>
);

// ── Main Component ─────────────────────────────────────────────────────────────

const InstitutionCredentialCenter = () => {
  const { showLoading, hideLoading } = useLoading();
  const dropzoneRef = useRef(null);

  // ── Data Loading State ───────────────────────────────────────────────────────
  const [associations, setAssociations] = useState([]);
  const [assocLoading, setAssocLoading] = useState(true);

  // ── Form State ───────────────────────────────────────────────────────────────
  const [selectedAssocId, setSelectedAssocId] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [credentialReference, setCredentialReference] = useState("");
  const [file, setFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // ── Dialog State ─────────────────────────────────────────────────────────────
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ── Result State ─────────────────────────────────────────────────────────────
  const [lastIssued, setLastIssued] = useState(null);

  // ── Load Approved Associations ────────────────────────────────────────────────
  const loadAssociations = useCallback(async () => {
    try {
      setAssocLoading(true);
      const res = await getInstitutionAssociations();
      if (res && res.data) {
        const approved = res.data.filter((a) => a.status === "APPROVED");
        // Sort newest first
        approved.sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt));
        setAssociations(approved);
      }
    } catch (err) {
      showApiError(err, "Failed to load student associations.");
    } finally {
      setAssocLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAssociations();
  }, [loadAssociations]);

  // ── File Validation ───────────────────────────────────────────────────────────
  const validateFile = (f) => {
    if (!f) return "A document file is required.";
    if (!ACCEPTED_MIME.includes(f.type)) return "Only PDF, JPG, JPEG, and PNG files are accepted.";
    if (f.size > MAX_FILE_BYTES) return `File must not exceed 10 MB. Current: ${formatBytes(f.size)}.`;
    return null;
  };

  const applyFile = (f) => {
    const error = validateFile(f);
    if (error) {
      setFormErrors((prev) => ({ ...prev, file: error }));
      setFile(null);
    } else {
      setFormErrors((prev) => ({ ...prev, file: null }));
      setFile(f);
    }
  };

  // ── Drag & Drop Handlers ──────────────────────────────────────────────────────
  const onDragOver = (e) => { e.preventDefault(); setIsDragOver(true); };
  const onDragLeave = () => setIsDragOver(false);
  const onDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) applyFile(dropped);
  };

  // ── Form Validation ────────────────────────────────────────────────────────────
  const validateForm = () => {
    const errors = {};
    if (!selectedAssocId) errors.assoc = "Please select a student candidate.";
    if (!documentType.trim()) errors.documentType = "Document type is required.";
    else if (documentType.trim().length > 255) errors.documentType = "Document type must not exceed 255 characters.";
    if (!credentialReference.trim()) errors.credentialReference = "Credential reference is required.";
    else if (credentialReference.trim().length > 255) errors.credentialReference = "Reference must not exceed 255 characters.";
    const fileError = validateFile(file);
    if (fileError) errors.file = fileError;
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ── Open Confirm Dialog ────────────────────────────────────────────────────────
  const handleSubmitIntent = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setShowConfirm(true);
  };

  // ── Confirmed Submission ───────────────────────────────────────────────────────
  const handleConfirmedIssue = async () => {
    const selectedAssoc = associations.find((a) => a.id === selectedAssocId);
    if (!selectedAssoc || !file) return;

    const fd = new FormData();
    fd.append("file", file);
    fd.append("studentId", selectedAssoc.studentId);
    fd.append("associationId", selectedAssoc.id);
    fd.append("documentType", documentType.trim());
    fd.append("credentialReference", credentialReference.trim());

    setShowConfirm(false);
    setSubmitting(true);
    showLoading();

    try {
      const res = await issueCredential(fd);
      const issued = res.data;
      setLastIssued(issued);
      showSuccess("Credential issued successfully.");
      // Reset form
      setSelectedAssocId("");
      setDocumentType("");
      setCredentialReference("");
      setFile(null);
      setFormErrors({});
    } catch (err) {
      showApiError(err, "Failed to issue credential. Please try again.");
    } finally {
      setSubmitting(false);
      hideLoading();
    }
  };

  // ── Derived values ────────────────────────────────────────────────────────────
  const selectedAssoc = associations.find((a) => a.id === selectedAssocId) || null;
  const hasNoApproved = !assocLoading && associations.length === 0;

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8 max-w-4xl mx-auto p-4 sm:p-6">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Credential Center</h1>
        <p className="text-sm text-gray-500 mt-1.5">
          Issue official, cryptographically verifiable credentials directly to approved students.
        </p>
      </div>

      {/* No Approved Associations Banner */}
      {hasNoApproved && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-4">
          <div className="text-amber-500 text-2xl mt-0.5">⚠️</div>
          <div>
            <p className="font-bold text-amber-800 text-sm">No approved student associations available.</p>
            <p className="text-xs text-amber-700 mt-1 leading-relaxed">
              Approve student association requests from the{" "}
              <strong>Student Associations</strong> workspace before issuing credentials.
            </p>
          </div>
        </div>
      )}

      {/* ── Issuance Form ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="border-b border-gray-100 px-6 py-4 flex items-center gap-3">
          <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600 text-xl">🎓</div>
          <div>
            <h2 className="font-bold text-gray-900 text-base">Issue New Credential</h2>
            <p className="text-xs text-gray-400 mt-0.5">Complete all fields and attach the credential document.</p>
          </div>
        </div>

        <form onSubmit={handleSubmitIntent} className="p-6 space-y-6" noValidate>

          {/* Student Candidate Selector */}
          <div className="space-y-1.5">
            <label htmlFor="cred-student" className="block text-xs font-bold text-gray-400 uppercase tracking-wide">
              Student Candidate <span className="text-rose-500">*</span>
            </label>
            {assocLoading ? (
              <div className="flex items-center gap-2 text-xs text-gray-400 py-2">
                <Spinner size="h-4 w-4" />
                Loading approved students…
              </div>
            ) : (
              <select
                id="cred-student"
                value={selectedAssocId}
                onChange={(e) => {
                  setSelectedAssocId(e.target.value);
                  setFormErrors((prev) => ({ ...prev, assoc: null }));
                }}
                disabled={hasNoApproved || submitting}
                className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition disabled:bg-gray-50 disabled:text-gray-400 ${
                  formErrors.assoc ? "border-rose-400" : "border-gray-200"
                }`}
              >
                <option value="">— Select an approved student —</option>
                {associations.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.studentName} ({a.studentEmail}){a.enrollmentNumber ? ` — ${a.enrollmentNumber}` : ""}
                  </option>
                ))}
              </select>
            )}
            {formErrors.assoc && (
              <p className="text-xs text-rose-600 font-semibold">{formErrors.assoc}</p>
            )}
          </div>

          {/* Document Type & Credential Reference — Two Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Document Type */}
            <div className="space-y-1.5">
              <label htmlFor="cred-doc-type" className="block text-xs font-bold text-gray-400 uppercase tracking-wide">
                Document Type <span className="text-rose-500">*</span>
              </label>
              <input
                id="cred-doc-type"
                type="text"
                value={documentType}
                onChange={(e) => {
                  setDocumentType(e.target.value);
                  setFormErrors((prev) => ({ ...prev, documentType: null }));
                }}
                disabled={submitting}
                placeholder="e.g. Degree Certificate, Transcript…"
                maxLength={255}
                className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition ${
                  formErrors.documentType ? "border-rose-400" : "border-gray-200"
                }`}
              />
              {formErrors.documentType && (
                <p className="text-xs text-rose-600 font-semibold">{formErrors.documentType}</p>
              )}
            </div>

            {/* Credential Reference */}
            <div className="space-y-1.5">
              <label htmlFor="cred-reference" className="block text-xs font-bold text-gray-400 uppercase tracking-wide">
                Credential Reference <span className="text-rose-500">*</span>
              </label>
              <input
                id="cred-reference"
                type="text"
                value={credentialReference}
                onChange={(e) => {
                  setCredentialReference(e.target.value);
                  setFormErrors((prev) => ({ ...prev, credentialReference: null }));
                }}
                disabled={submitting}
                placeholder="e.g. MCA-2025-0012"
                maxLength={255}
                className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition ${
                  formErrors.credentialReference ? "border-rose-400" : "border-gray-200"
                }`}
              />
              {formErrors.credentialReference && (
                <p className="text-xs text-rose-600 font-semibold">{formErrors.credentialReference}</p>
              )}
            </div>
          </div>

          {/* File Drop Zone */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide">
              Credential Document <span className="text-rose-500">*</span>
            </label>
            <div
              ref={dropzoneRef}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => !submitting && document.getElementById("cred-file-input").click()}
              className={`relative cursor-pointer border-2 border-dashed rounded-2xl p-8 text-center transition-all select-none ${
                isDragOver
                  ? "border-indigo-500 bg-indigo-50"
                  : formErrors.file
                  ? "border-rose-400 bg-rose-50/30"
                  : file
                  ? "border-emerald-400 bg-emerald-50/30"
                  : "border-gray-200 bg-gray-50/40 hover:border-indigo-300 hover:bg-indigo-50/20"
              } ${submitting ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <input
                id="cred-file-input"
                type="file"
                accept={ACCEPTED_EXT.join(",")}
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) applyFile(f);
                  e.target.value = ""; // allow re-select same file
                }}
              />

              {file ? (
                <div className="space-y-2">
                  <div className="text-3xl">📄</div>
                  <p className="text-sm font-bold text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-400">{formatBytes(file.size)}</p>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={(e) => { e.stopPropagation(); setFile(null); setFormErrors((prev) => ({ ...prev, file: null })); }}
                    className="text-xs text-rose-500 hover:text-rose-700 font-semibold underline transition"
                  >
                    Remove file
                  </button>
                </div>
              ) : (
                <div className="space-y-2 pointer-events-none">
                  <div className="text-4xl text-gray-300">☁️</div>
                  <p className="text-sm font-semibold text-gray-500">
                    {isDragOver ? "Drop it here!" : "Drag & drop your document here, or click to browse"}
                  </p>
                  <p className="text-xs text-gray-400">PDF, PNG, JPG, JPEG · Max 10 MB</p>
                </div>
              )}
            </div>
            {formErrors.file && (
              <p className="text-xs text-rose-600 font-semibold">{formErrors.file}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              id="cred-issue-btn"
              type="submit"
              disabled={submitting || assocLoading || hasNoApproved}
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed text-white font-bold px-8 py-3 rounded-xl transition flex items-center justify-center gap-2 text-sm"
            >
              {submitting ? (
                <>
                  <Spinner size="h-4 w-4" color="text-white" />
                  Issuing Credential…
                </>
              ) : (
                <>
                  <span>🎓</span>
                  Issue Credential
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* ── Success Summary Card ── */}
      {lastIssued && (
        <div className="bg-white rounded-2xl border border-emerald-200 shadow-sm overflow-hidden">
          <div className="border-b border-emerald-100 px-6 py-4 flex items-center gap-3 bg-emerald-50/60">
            <div className="p-2 bg-emerald-100 rounded-xl text-emerald-600 text-xl">✅</div>
            <div>
              <h2 className="font-bold text-emerald-800 text-base">Credential Issued Successfully</h2>
              <p className="text-xs text-emerald-600 mt-0.5">The credential has been recorded and anchored below.</p>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Document ID */}
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Document ID</span>
              <p className="text-xs font-mono text-gray-700 bg-gray-50 border border-gray-100 rounded-lg px-2 py-1 break-all">
                {lastIssued.documentId}
              </p>
            </div>

            {/* Student Name */}
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Issued To</span>
              <p className="text-sm font-semibold text-gray-900">{lastIssued.studentName}</p>
            </div>

            {/* Document Type */}
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Document Type</span>
              <p className="text-sm text-gray-800">{lastIssued.documentType}</p>
            </div>

            {/* Credential Reference */}
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Credential Reference</span>
              <p className="text-sm font-mono text-indigo-700 font-semibold">{lastIssued.credentialReference}</p>
            </div>

            {/* Issued At */}
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Issued At</span>
              <p className="text-sm text-gray-700">{formatDate(lastIssued.issuedAt)}</p>
            </div>

            {/* Blockchain Anchor Status */}
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Blockchain Anchored</span>
              <div>
                {lastIssued.blockchainAnchored ? (
                  <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-xs font-bold">
                    ⛓ Anchored
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full text-xs font-bold">
                    ⏳ Pending Anchor
                  </span>
                )}
              </div>
            </div>

            {/* Transaction Hash — Full width */}
            {lastIssued.blockchainTransactionHash && (
              <div className="col-span-1 sm:col-span-2 space-y-0.5">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Transaction Hash</span>
                <p className="text-xs font-mono text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-2 break-all leading-relaxed">
                  {lastIssued.blockchainTransactionHash}
                </p>
              </div>
            )}
          </div>

          {/* Dismiss */}
          <div className="px-6 pb-5">
            <button
              type="button"
              onClick={() => setLastIssued(null)}
              className="text-xs text-gray-400 hover:text-gray-700 font-semibold underline transition"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* ── Confirm Issuance Dialog ── */}
      {showConfirm && selectedAssoc && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-50 p-2 rounded-full text-indigo-600 text-xl">🎓</div>
              <h4 className="font-bold text-gray-900 text-lg">Issue Credential?</h4>
            </div>

            <p className="text-sm text-gray-500 leading-relaxed">
              You are about to issue an official credential to{" "}
              <strong className="text-gray-900">{selectedAssoc.studentName}</strong>. Please verify the details below before confirming.
            </p>

            {/* Summary Table */}
            <div className="rounded-xl border border-gray-100 divide-y divide-gray-100 text-sm overflow-hidden">
              <div className="flex justify-between px-4 py-2.5 bg-gray-50">
                <span className="text-gray-400 font-medium text-xs uppercase tracking-wide">Student</span>
                <span className="font-semibold text-gray-900 text-right">{selectedAssoc.studentName}</span>
              </div>
              {selectedAssoc.enrollmentNumber && (
                <div className="flex justify-between px-4 py-2.5">
                  <span className="text-gray-400 font-medium text-xs uppercase tracking-wide">Enrollment</span>
                  <span className="font-mono text-gray-700">{selectedAssoc.enrollmentNumber}</span>
                </div>
              )}
              <div className="flex justify-between px-4 py-2.5 bg-gray-50">
                <span className="text-gray-400 font-medium text-xs uppercase tracking-wide">Document Type</span>
                <span className="font-semibold text-gray-900 text-right max-w-[180px] break-words">{documentType}</span>
              </div>
              <div className="flex justify-between px-4 py-2.5">
                <span className="text-gray-400 font-medium text-xs uppercase tracking-wide">Reference</span>
                <span className="font-mono text-indigo-700 font-semibold">{credentialReference}</span>
              </div>
              <div className="flex justify-between px-4 py-2.5 bg-gray-50">
                <span className="text-gray-400 font-medium text-xs uppercase tracking-wide">File</span>
                <span className="text-gray-600 text-right max-w-[180px] truncate">{file?.name}</span>
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                disabled={submitting}
                className="flex-1 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-semibold py-2.5 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                id="cred-confirm-btn"
                type="button"
                onClick={handleConfirmedIssue}
                disabled={submitting}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed text-white text-sm font-semibold py-2.5 rounded-xl transition flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Spinner size="h-4 w-4" color="text-white" />
                    Issuing…
                  </>
                ) : (
                  "Confirm & Issue"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstitutionCredentialCenter;
