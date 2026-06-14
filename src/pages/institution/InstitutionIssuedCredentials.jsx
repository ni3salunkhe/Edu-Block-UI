import React, { useCallback, useEffect, useState } from "react";
import { getIssuedCredentials } from "../../services/institutionService";
import { showApiError } from "../../utils/toast";

// ── Helpers ────────────────────────────────────────────────────────────────────

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

const truncateHash = (hash) => {
  if (!hash) return "—";
  if (hash.length <= 16) return hash;
  return `${hash.slice(0, 8)}…${hash.slice(-6)}`;
};

// ── Spinner ────────────────────────────────────────────────────────────────────

const Spinner = () => (
  <svg
    className="animate-spin h-5 w-5 text-indigo-600"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
  </svg>
);

// ── Blockchain Status Badge ────────────────────────────────────────────────────

const BlockchainBadge = ({ anchored }) =>
  anchored ? (
    <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-xs font-bold whitespace-nowrap">
      ⛓ Anchored
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full text-xs font-bold whitespace-nowrap">
      ⏳ Pending
    </span>
  );

// ── Copy to Clipboard ─────────────────────────────────────────────────────────

const CopyButton = ({ value }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: ignore
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={copied ? "Copied!" : "Copy transaction hash"}
      className={`ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded transition border ${
        copied
          ? "bg-emerald-50 text-emerald-600 border-emerald-200"
          : "bg-gray-50 text-gray-400 border-gray-200 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50"
      }`}
    >
      {copied ? "✓" : "⎘"}
    </button>
  );
};

// ── Metric Card ───────────────────────────────────────────────────────────────

const MetricCard = ({ label, value, color = "text-indigo-600" }) => (
  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{label}</span>
    <span className={`text-2xl font-black mt-2 ${color}`}>{value}</span>
  </div>
);

// ── Detail Drawer ─────────────────────────────────────────────────────────────

const DetailDrawer = ({ credential, onClose }) => {
  if (!credential) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/60">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600 text-lg">📋</div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">Credential Detail</h3>
              <p className="text-xs text-gray-400 mt-0.5">Full issuance record</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition text-gray-400 hover:text-gray-700"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-3">
          {[
            { label: "Document ID", value: credential.documentId, mono: true },
            { label: "Issued To", value: credential.studentName },
            { label: "Document Type", value: credential.documentType || "—" },
            {
              label: "Credential Reference",
              value: credential.credentialReference || "—",
              mono: true,
              accent: true,
            },
            { label: "Issued At", value: formatDate(credential.issuedAt) },
          ].map(({ label, value, mono, accent }) => (
            <div key={label} className="flex justify-between items-start gap-4 py-2.5 border-b border-gray-50 last:border-0">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider shrink-0 mt-0.5">
                {label}
              </span>
              <span
                className={`text-sm text-right break-all ${
                  mono ? "font-mono" : ""
                } ${accent ? "text-indigo-700 font-semibold" : "text-gray-800"}`}
              >
                {value}
              </span>
            </div>
          ))}

          {/* Blockchain Status */}
          <div className="flex justify-between items-center py-2.5 border-b border-gray-50">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Blockchain Status
            </span>
            <BlockchainBadge anchored={credential.blockchainAnchored} />
          </div>

          {/* Full Transaction Hash */}
          <div className="py-2.5">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
              Transaction Hash
            </span>
            {credential.blockchainTransactionHash ? (
              <div className="flex items-start gap-2 bg-indigo-50 border border-indigo-100 rounded-xl px-3 py-2.5">
                <p className="text-xs font-mono text-indigo-700 break-all flex-1 leading-relaxed">
                  {credential.blockchainTransactionHash}
                </p>
                <CopyButton value={credential.blockchainTransactionHash} />
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">Not yet anchored</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-5">
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm py-2.5 rounded-xl transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────

const InstitutionIssuedCredentials = () => {
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Detail drawer
  const [selectedCredential, setSelectedCredential] = useState(null);

  // ── Load Data ───────────────────────────────────────────────────────────────
  const loadCredentials = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getIssuedCredentials();
      if (res && res.data) {
        // Sort newest first by issuedAt
        const sorted = [...res.data].sort(
          (a, b) => new Date(b.issuedAt) - new Date(a.issuedAt)
        );
        setCredentials(sorted);
      }
    } catch (err) {
      showApiError(err, "Failed to load issued credentials.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCredentials();
  }, [loadCredentials]);

  // ── Metrics ─────────────────────────────────────────────────────────────────
  const total        = credentials.length;
  const anchored     = credentials.filter((c) => c.blockchainAnchored).length;
  const pending      = credentials.filter((c) => !c.blockchainAnchored).length;
  const uniqueStudents = new Set(credentials.map((c) => c.studentId).filter(Boolean)).size;

  // ── Client-Side Filtering ────────────────────────────────────────────────────
  const filtered = credentials.filter((c) => {
    const q = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !q ||
      (c.credentialReference || "").toLowerCase().includes(q) ||
      (c.studentName || "").toLowerCase().includes(q) ||
      (c.documentType || "").toLowerCase().includes(q);

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "ANCHORED" && c.blockchainAnchored) ||
      (statusFilter === "PENDING" && !c.blockchainAnchored);

    return matchesSearch && matchesStatus;
  });

  // ── Count helper that always renders 0 ──────────────────────────────────────
  const tabCount = (tab) => {
    if (tab === "ALL") return total;
    if (tab === "ANCHORED") return anchored;
    if (tab === "PENDING") return pending;
    return 0;
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8 max-w-6xl mx-auto p-4 sm:p-6">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Issued Credentials</h1>
        <p className="text-sm text-gray-500 mt-1.5">
          Audit log and blockchain anchor status of all credentials issued by this institution.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Total Issued"          value={total}          color="text-indigo-600" />
        <MetricCard label="Blockchain Anchored"   value={anchored}       color="text-emerald-600" />
        <MetricCard label="Pending Anchor"         value={pending}        color="text-amber-600" />
        <MetricCard label="Students Served"        value={uniqueStudents} color="text-gray-700" />
      </div>

      {/* Registry Panel */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        {/* Toolbar */}
        <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 pointer-events-none text-sm">
              🔍
            </span>
            <input
              id="cred-registry-search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by reference, student name, or document type…"
              className="w-full border border-gray-200 rounded-xl pl-8 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-700 transition text-sm"
              >
                ✕
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
            {["ALL", "ANCHORED", "PENDING"].map((tab) => (
              <button
                key={tab}
                type="button"
                id={`cred-filter-${tab.toLowerCase()}`}
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition ${
                  statusFilter === tab
                    ? "bg-white text-indigo-700 shadow-sm"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                {tab === "ALL" ? "All" : tab === "ANCHORED" ? "⛓ Anchored" : "⏳ Pending"}
                <span className="ml-1 opacity-60">{tabCount(tab)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center gap-3 py-16 text-gray-400 text-sm">
              <Spinner />
              Loading credentials…
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <div className="text-4xl mb-3">📭</div>
              <p className="font-semibold text-gray-500 text-sm">
                {credentials.length === 0
                  ? "No credentials have been issued yet."
                  : "No results match your search or filter."}
              </p>
              {credentials.length === 0 && (
                <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
                  Issue credentials from the Credential Center to see them appear here.
                </p>
              )}
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/60 text-[10px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100">
                  <th className="p-4 pl-6">Credential Reference</th>
                  <th className="p-4">Student</th>
                  <th className="p-4">Document Type</th>
                  <th className="p-4">Issued Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Transaction Hash</th>
                  <th className="p-4 pr-6 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filtered.map((cred) => (
                  <tr
                    key={cred.documentId}
                    className="hover:bg-gray-50/50 transition cursor-pointer"
                    onClick={() => setSelectedCredential(cred)}
                  >
                    {/* Credential Reference */}
                    <td className="p-4 pl-6">
                      <span className="font-mono font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-lg text-xs">
                        {cred.credentialReference || "—"}
                      </span>
                    </td>

                    {/* Student */}
                    <td className="p-4">
                      <div className="font-semibold text-gray-900">{cred.studentName || "—"}</div>
                    </td>

                    {/* Document Type */}
                    <td className="p-4">
                      <span className="text-gray-700 text-sm">
                        {cred.documentType || "—"}
                      </span>
                    </td>

                    {/* Issued Date */}
                    <td className="p-4">
                      <span className="text-gray-500 text-xs whitespace-nowrap">
                        {formatDate(cred.issuedAt)}
                      </span>
                    </td>

                    {/* Blockchain Status */}
                    <td className="p-4">
                      <BlockchainBadge anchored={cred.blockchainAnchored} />
                    </td>

                    {/* Transaction Hash */}
                    <td className="p-4">
                      {cred.blockchainTransactionHash ? (
                        <div className="flex items-center gap-1">
                          <span className="font-mono text-xs text-gray-500 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded">
                            {truncateHash(cred.blockchainTransactionHash)}
                          </span>
                          <CopyButton value={cred.blockchainTransactionHash} />
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Not anchored</span>
                      )}
                    </td>

                    {/* Details */}
                    <td className="p-4 pr-6 text-right">
                      <button
                        type="button"
                        id={`cred-detail-btn-${cred.documentId}`}
                        onClick={(e) => { e.stopPropagation(); setSelectedCredential(cred); }}
                        className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-lg transition border border-indigo-100"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Table Footer — result count */}
        {!loading && filtered.length > 0 && (
          <div className="px-6 py-3 border-t border-gray-50 text-xs text-gray-400">
            Showing <strong className="text-gray-600">{filtered.length}</strong>{" "}
            of <strong className="text-gray-600">{total}</strong> credential{total !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      {/* Detail Drawer */}
      <DetailDrawer
        credential={selectedCredential}
        onClose={() => setSelectedCredential(null)}
      />
    </div>
  );
};

export default InstitutionIssuedCredentials;
