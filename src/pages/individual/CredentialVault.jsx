import React, { useCallback, useEffect, useState } from "react";
import { getMyDocuments } from "../../services/individualService";
import { showApiError } from "../../utils/toast";

// ── Helpers ────────────────────────────────────────────────────────────────────

const formatDate = (isoString) => {
  if (!isoString) return "—";
  try {
    return new Date(isoString).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch { return isoString; }
};

const truncateHash = (hash) => {
  if (!hash) return "—";
  return hash.length <= 16 ? hash : `${hash.slice(0, 8)}…${hash.slice(-6)}`;
};

// ── Trust Score Badge ──────────────────────────────────────────────────────────

const TrustBadge = ({ score }) => {
  const cfg = {
    VERY_HIGH: { label: "🏆 Very High", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    HIGH:      { label: "⭐ High",      cls: "bg-blue-50 text-blue-700 border-blue-200" },
    LOW:       { label: "Low",          cls: "bg-gray-100 text-gray-500 border-gray-200" },
  };
  const c = cfg[score] || cfg.LOW;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border whitespace-nowrap ${c.cls}`}>
      {c.label}
    </span>
  );
};

// ── Source Badge ───────────────────────────────────────────────────────────────

const SourceBadge = ({ source }) =>
  source === "INSTITUTION_ISSUED" ? (
    <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full text-xs font-bold whitespace-nowrap">
      🏛️ Institution
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 border border-gray-200 px-2 py-0.5 rounded-full text-xs font-bold whitespace-nowrap">
      📤 Self-Uploaded
    </span>
  );

// ── Blockchain Badge ──────────────────────────────────────────────────────────

const BlockchainBadge = ({ anchored }) =>
  anchored ? (
    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full text-xs font-bold whitespace-nowrap">
      ⛓ Anchored
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full text-xs font-bold whitespace-nowrap">
      ⏳ Pending
    </span>
  );

// ── Verification Status Badge ─────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
  const cfg = {
    BLOCKCHAIN_ANCHORED: { label: "Anchored",    cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    APPROVED:            { label: "Approved",     cls: "bg-green-50 text-green-700 border-green-200" },
    AI_VERIFIED:         { label: "AI Verified",  cls: "bg-blue-50 text-blue-700 border-blue-200" },
    AI_FLAGGED:          { label: "AI Flagged",   cls: "bg-orange-50 text-orange-700 border-orange-200" },
    REJECTED:            { label: "Rejected",     cls: "bg-red-50 text-red-600 border-red-200" },
    UPLOADED:            { label: "Uploaded",      cls: "bg-gray-100 text-gray-600 border-gray-200" },
  };
  const c = cfg[status] || { label: status || "Unknown", cls: "bg-gray-100 text-gray-500 border-gray-200" };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border whitespace-nowrap ${c.cls}`}>
      {c.label}
    </span>
  );
};

// ── Copy Button ───────────────────────────────────────────────────────────────

const CopyButton = ({ value }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };
  return (
    <button type="button" onClick={handleCopy}
      className={`ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded transition border ${
        copied ? "bg-emerald-50 text-emerald-600 border-emerald-200"
               : "bg-gray-50 text-gray-400 border-gray-200 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50"
      }`}>{copied ? "✓" : "⎘"}</button>
  );
};

// ── Metric Card ───────────────────────────────────────────────────────────────

const MetricCard = ({ label, value, color = "text-indigo-600" }) => (
  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{label}</span>
    <span className={`text-2xl font-black mt-2 ${color}`}>{value}</span>
  </div>
);

// ── Spinner ───────────────────────────────────────────────────────────────────

const Spinner = () => (
  <svg className="animate-spin h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
  </svg>
);

// ── Detail Drawer ─────────────────────────────────────────────────────────────

const DetailDrawer = ({ doc, onClose, onViewDocument }) => {
  if (!doc) return null;
  const t = doc?.trustMetadata;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/60 sticky top-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600 text-lg">🏆</div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">Credential Detail</h3>
              <p className="text-xs text-gray-400 mt-0.5">Trust & blockchain metadata</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition text-gray-400 hover:text-gray-700" aria-label="Close">✕</button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-3">
          {/* Document Info */}
          {[
            { label: "Document ID", value: doc.id, mono: true },
            { label: "File Name", value: doc.fileName || "—" },
            { label: "Uploaded", value: formatDate(doc.createdAt) },
          ].map(({ label, value, mono }) => (
            <div key={label} className="flex justify-between items-start gap-4 py-2 border-b border-gray-50">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider shrink-0 mt-0.5">{label}</span>
              <span className={`text-sm text-right break-all ${mono ? "font-mono" : ""} text-gray-800`}>{value}</span>
            </div>
          ))}

          {/* Verification Status */}
          <div className="flex justify-between items-center py-2 border-b border-gray-50">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Verification Status</span>
            <StatusBadge status={doc.status} />
          </div>

          {/* Trust Section */}
          {t && (
            <>
              <div className="pt-2 pb-1">
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Trust Metadata</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Source</span>
                <SourceBadge source={t.documentSource} />
              </div>

              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Trust Score</span>
                <TrustBadge score={t.trustScore} />
              </div>

              {t.documentType && (
                <div className="flex justify-between items-start gap-4 py-2 border-b border-gray-50">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider shrink-0">Document Type</span>
                  <span className="text-sm text-gray-800">{t.documentType}</span>
                </div>
              )}

              {t.credentialReference && (
                <div className="flex justify-between items-start gap-4 py-2 border-b border-gray-50">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider shrink-0">Credential Ref</span>
                  <span className="text-sm font-mono text-indigo-700 font-semibold">{t.credentialReference}</span>
                </div>
              )}

              {t.issuingInstitutionName && (
                <div className="flex justify-between items-start gap-4 py-2 border-b border-gray-50">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider shrink-0">Institution</span>
                  <div className="text-right">
                    <span className="text-sm text-gray-800">{t.issuingInstitutionName}</span>
                    {t.institutionTrustLevel && (
                      <span className="ml-2 text-xs text-indigo-600 font-bold">({t.institutionTrustLevel})</span>
                    )}
                    {t.institutionVerified && (
                      <span className="ml-1 text-emerald-600 text-xs font-bold">✓ Verified</span>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Blockchain</span>
                <BlockchainBadge anchored={t.blockchainAnchored} />
              </div>

              {t.transactionHash && (
                <div className="py-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Transaction Hash</span>
                  <div className="flex items-start gap-2 bg-indigo-50 border border-indigo-100 rounded-xl px-3 py-2.5">
                    <p className="text-xs font-mono text-indigo-700 break-all flex-1 leading-relaxed">{t.transactionHash}</p>
                    <CopyButton value={t.transactionHash} />
                  </div>
                </div>
              )}
            </>
          )}

          {/* File Viewer */}
          {doc.filePath && (
            <div className="pt-3">
              <button
                type="button"
                onClick={() => onViewDocument(doc)}
                className="inline-flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-bold px-4 py-2.5 rounded-xl transition border border-indigo-100"
              >
                📄 View Document
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 sticky bottom-0 bg-white pt-2">
          <button type="button" onClick={onClose} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm py-2.5 rounded-xl transition">Close</button>
        </div>
      </div>
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────

const CredentialVault = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [sourceFilter, setSourceFilter] = useState("ALL");
  const [trustFilter, setTrustFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [selectedDoc, setSelectedDoc] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);

  const loadDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getMyDocuments();
      if (res?.data) {
        const sorted = [...res.data].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setDocuments(sorted);
      }
    } catch (err) {
      showApiError(err, "Failed to load your credentials.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadDocuments(); }, [loadDocuments]);

  // ── Metrics ─────────────────────────────────────────────────────────────────
  const total = documents.length;
  const veryHigh = documents.filter(d => d.trustMetadata?.trustScore === "VERY_HIGH").length;
  const high = documents.filter(d => d.trustMetadata?.trustScore === "HIGH").length;
  const low = documents.filter(d => !d.trustMetadata?.trustScore || d.trustMetadata?.trustScore === "LOW").length;
  const institutionIssued = documents.filter(d => d.trustMetadata?.documentSource === "INSTITUTION_ISSUED").length;

  // ── Filtering ───────────────────────────────────────────────────────────────
  const filtered = documents.filter(d => {
    const t = d.trustMetadata;
    const q = searchTerm.trim().toLowerCase();

    const matchesSearch = !q ||
      (t?.documentType || "").toLowerCase().includes(q) ||
      (t?.credentialReference || "").toLowerCase().includes(q) ||
      (t?.issuingInstitutionName || "").toLowerCase().includes(q) ||
      (d.fileName || "").toLowerCase().includes(q);

    const matchesSource =
      sourceFilter === "ALL" ||
      (sourceFilter === "INSTITUTION_ISSUED" && t?.documentSource === "INSTITUTION_ISSUED") ||
      (sourceFilter === "INDIVIDUAL_UPLOAD" && t?.documentSource !== "INSTITUTION_ISSUED");

    const matchesTrust =
      trustFilter === "ALL" ||
      (trustFilter === "VERY_HIGH" && t?.trustScore === "VERY_HIGH") ||
      (trustFilter === "HIGH" && t?.trustScore === "HIGH") ||
      (trustFilter === "LOW" && (!t?.trustScore || t?.trustScore === "LOW"));

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "ANCHORED" && t?.blockchainAnchored) ||
      (statusFilter === "PENDING" && !t?.blockchainAnchored);

    return matchesSearch && matchesSource && matchesTrust && matchesStatus;
  });

  // ── Document Viewer ─────────────────────────────────────────────────────────
  const handleViewDocument = (doc) => {
    if (!doc.filePath) {
      alert("Document URL not found");
      return;
    }
    let url = doc.filePath;
    if (url.startsWith("http://")) {
      url = url.replace("http://", "https://");
    }
    setPreviewDoc({ ...doc, viewerUrl: url });
  };

  const closeViewer = () => setPreviewDoc(null);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8 max-w-6xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Credential Vault</h1>
        <p className="text-sm text-gray-500 mt-1.5">Your verified academic credentials and document portfolio with trust metadata.</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <MetricCard label="Total Credentials" value={total} color="text-indigo-600" />
        <MetricCard label="Very High Trust" value={veryHigh} color="text-emerald-600" />
        <MetricCard label="High Trust" value={high} color="text-blue-600" />
        <MetricCard label="Low Trust" value={low} color="text-gray-500" />
        <MetricCard label="Institution Issued" value={institutionIssued} color="text-indigo-700" />
      </div>

      {/* Registry Panel */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="px-5 py-4 border-b border-gray-100 space-y-3">
          {/* Search */}
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 pointer-events-none text-sm">🔍</span>
            <input
              id="vault-search"
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by type, reference, institution, or file name…"
              className="w-full border border-gray-200 rounded-xl pl-8 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
            {searchTerm && (
              <button type="button" onClick={() => setSearchTerm("")} className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-700 transition text-sm">✕</button>
            )}
          </div>

          {/* Filter Rows */}
          <div className="flex flex-wrap gap-2">
            {/* Source Filter */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
              {[
                { key: "ALL", label: "All Sources" },
                { key: "INSTITUTION_ISSUED", label: "🏛️ Institution" },
                { key: "INDIVIDUAL_UPLOAD", label: "📤 Self" },
              ].map(({ key, label }) => (
                <button key={key} type="button" onClick={() => setSourceFilter(key)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${sourceFilter === key ? "bg-white text-indigo-700 shadow-sm" : "text-gray-500 hover:text-gray-800"}`}
                >{label}</button>
              ))}
            </div>

            {/* Trust Filter */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
              {[
                { key: "ALL", label: "All Trust" },
                { key: "VERY_HIGH", label: "🏆 V.High" },
                { key: "HIGH", label: "⭐ High" },
                { key: "LOW", label: "Low" },
              ].map(({ key, label }) => (
                <button key={key} type="button" onClick={() => setTrustFilter(key)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${trustFilter === key ? "bg-white text-indigo-700 shadow-sm" : "text-gray-500 hover:text-gray-800"}`}
                >{label}</button>
              ))}
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
              {[
                { key: "ALL", label: "All Status" },
                { key: "ANCHORED", label: "⛓ Anchored" },
                { key: "PENDING", label: "⏳ Pending" },
              ].map(({ key, label }) => (
                <button key={key} type="button" onClick={() => setStatusFilter(key)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${statusFilter === key ? "bg-white text-indigo-700 shadow-sm" : "text-gray-500 hover:text-gray-800"}`}
                >{label}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center gap-3 py-16 text-gray-400 text-sm"><Spinner /> Loading credentials…</div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <div className="text-4xl mb-3">🏆</div>
              <p className="font-semibold text-gray-500 text-sm">
                {total === 0 ? "No credentials in your vault yet." : "No credentials match your filters."}
              </p>
              {total === 0 && <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">Upload documents or receive credentials from an institution to get started.</p>}
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/60 text-[10px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100">
                  <th className="p-4 pl-6">Document</th>
                  <th className="p-4">Source</th>
                  <th className="p-4">Trust</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Institution</th>
                  <th className="p-4">Blockchain</th>
                  <th className="p-4 pr-6 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filtered.map(doc => {
                  const t = doc.trustMetadata;
                  return (
                    <tr key={doc.id} className="hover:bg-gray-50/50 transition cursor-pointer" onClick={() => setSelectedDoc(doc)}>
                      <td className="p-4 pl-6">
                        <div className="font-semibold text-gray-900 text-sm">{t?.documentType || doc.fileName || "—"}</div>
                        {t?.credentialReference && (
                          <span className="font-mono text-[10px] text-indigo-600 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded mt-1 inline-block">
                            {t.credentialReference}
                          </span>
                        )}
                      </td>
                      <td className="p-4"><SourceBadge source={t?.documentSource} /></td>
                      <td className="p-4"><TrustBadge score={t?.trustScore} /></td>
                      <td className="p-4"><StatusBadge status={t?.verificationStatus || doc.status} /></td>
                      <td className="p-4">
                        <span className="text-gray-700 text-sm">{t?.issuingInstitutionName || "—"}</span>
                        {t?.institutionVerified && <span className="ml-1 text-emerald-600 text-xs font-bold">✓</span>}
                      </td>
                      <td className="p-4"><BlockchainBadge anchored={t?.blockchainAnchored} /></td>
                      <td className="p-4 pr-6 text-right">
                        <button type="button" onClick={e => { e.stopPropagation(); setSelectedDoc(doc); }}
                          className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-lg transition border border-indigo-100">View</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        {!loading && filtered.length > 0 && (
          <div className="px-6 py-3 border-t border-gray-50 text-xs text-gray-400">
            Showing <strong className="text-gray-600">{filtered.length}</strong> of <strong className="text-gray-600">{total}</strong> credential{total !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      <DetailDrawer doc={selectedDoc} onClose={() => setSelectedDoc(null)} onViewDocument={handleViewDocument} />

      {/* PDF / Image Viewer Modal */}
      {previewDoc && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-5 py-3 border-b bg-gray-50 rounded-t-xl">
              <h3 className="text-base font-semibold text-gray-800 truncate max-w-xs">
                {previewDoc.trustMetadata?.documentType || previewDoc.fileName || "Document"}
              </h3>
              <div className="flex items-center gap-3">
                <a
                  href={
                    (previewDoc.viewerUrl.toLowerCase().includes(".pdf") ||
                      previewDoc.filePath?.toLowerCase().includes("/raw/upload/"))
                      ? `https://docs.google.com/viewer?url=${encodeURIComponent(previewDoc.viewerUrl)}&embedded=false`
                      : previewDoc.viewerUrl
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition"
                >
                  Open in new tab ↗
                </a>
                <button
                  onClick={closeViewer}
                  className="p-1 hover:bg-gray-200 text-gray-500 hover:text-gray-800 rounded transition"
                  title="Close"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-hidden bg-gray-100 rounded-b-xl flex items-center justify-center">
              {previewDoc.viewerUrl.toLowerCase().includes(".pdf") ||
                previewDoc.filePath?.toLowerCase().includes("/raw/upload/") ? (
                // Use Google Docs viewer for PDFs
                <iframe
                  src={`https://docs.google.com/viewer?url=${encodeURIComponent(previewDoc.viewerUrl)}&embedded=true`}
                  className="w-full h-full border-none"
                  title="Document Viewer"
                />
              ) : (
                <img
                  src={previewDoc.viewerUrl}
                  alt="Document Preview"
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

export default CredentialVault;
