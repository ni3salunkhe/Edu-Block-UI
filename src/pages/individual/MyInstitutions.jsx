import React, { useEffect, useState, useCallback } from "react";
import { useLoading } from "../../context/LoadingContext";
import { listInstitutions, requestAssociation, getMyAssociations } from "../../services/associationService";
import { showSuccess, showApiError } from "../../utils/toast";

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

const trustBadge = (level) => {
  switch (level) {
    case "ACCREDITED":
      return "bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide";
    case "VERIFIED":
      return "bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide";
    case "REGISTERED":
      return "bg-slate-50 text-slate-600 border border-slate-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide";
    default:
      return "bg-gray-50 text-gray-500 border border-gray-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide";
  }
};

const statusBadge = (status) => {
  switch (status) {
    case "PENDING":
      return "bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full text-xs font-semibold";
    case "APPROVED":
      return "bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-xs font-semibold";
    case "REJECTED":
      return "bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-0.5 rounded-full text-xs font-semibold";
    case "REVOKED":
      return "bg-gray-100 text-gray-600 border border-gray-200 px-2.5 py-0.5 rounded-full text-xs font-semibold";
    default:
      return "bg-slate-50 text-slate-600 border border-slate-200 px-2.5 py-0.5 rounded-full text-xs font-semibold";
  }
};

// ── Spinner ────────────────────────────────────────────────────────────────────

const Spinner = ({ size = "h-5 w-5", color = "text-indigo-600" }) => (
  <svg className={`animate-spin ${size} ${color}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
  </svg>
);

// ── Main Component ─────────────────────────────────────────────────────────────

const MyInstitutions = () => {
  const { showLoading, hideLoading } = useLoading();

  // ── Tab State ──
  const [activeView, setActiveView] = useState("browse"); // 'browse' | 'associations'

  // ── Institutions State ──
  const [institutions, setInstitutions] = useState([]);
  const [instLoading, setInstLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // ── Associations State ──
  const [associations, setAssociations] = useState([]);
  const [assocLoading, setAssocLoading] = useState(true);

  // ── Association Dialog State ──
  const [showDialog, setShowDialog] = useState(false);
  const [selectedInst, setSelectedInst] = useState(null);
  const [enrollmentNumber, setEnrollmentNumber] = useState("");
  const [dialogError, setDialogError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // ── Load Data ──
  const loadInstitutions = useCallback(async () => {
    try {
      setInstLoading(true);
      const res = await listInstitutions();
      if (res?.data) {
        // Only show ACTIVE institutions
        const active = res.data.filter((i) => i.status === "ACTIVE");
        active.sort((a, b) => a.name.localeCompare(b.name));
        setInstitutions(active);
      }
    } catch (err) {
      showApiError(err, "Failed to load institutions.");
    } finally {
      setInstLoading(false);
    }
  }, []);

  const loadAssociations = useCallback(async () => {
    try {
      setAssocLoading(true);
      const res = await getMyAssociations();
      if (res?.data) {
        const sorted = [...res.data].sort(
          (a, b) => new Date(b.requestedAt) - new Date(a.requestedAt)
        );
        setAssociations(sorted);
      }
    } catch (err) {
      showApiError(err, "Failed to load your associations.");
    } finally {
      setAssocLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInstitutions();
    loadAssociations();
  }, [loadInstitutions, loadAssociations]);

  // ── Derived: which institutions already have associations ──
  const associatedInstitutionIds = new Set(
    associations
      .filter((a) => a.status === "PENDING" || a.status === "APPROVED")
      .map((a) => a.institutionId)
  );

  // ── Search Filter ──
  const filteredInstitutions = institutions.filter((inst) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      inst.name?.toLowerCase().includes(q) ||
      inst.code?.toLowerCase().includes(q) ||
      inst.city?.toLowerCase().includes(q) ||
      inst.state?.toLowerCase().includes(q)
    );
  });

  // ── Dialog Handlers ──
  const openAssociationDialog = (inst) => {
    setSelectedInst(inst);
    setEnrollmentNumber("");
    setDialogError("");
    setShowDialog(true);
  };

  const closeDialog = () => {
    setShowDialog(false);
    setSelectedInst(null);
    setEnrollmentNumber("");
    setDialogError("");
  };

  const handleSubmitAssociation = async () => {
    const trimmed = enrollmentNumber.trim();
    if (!trimmed) {
      setDialogError("Enrollment number is required.");
      return;
    }
    if (trimmed.length < 3) {
      setDialogError("Enrollment number must be at least 3 characters.");
      return;
    }
    if (trimmed.length > 100) {
      setDialogError("Enrollment number must not exceed 100 characters.");
      return;
    }

    setSubmitting(true);
    showLoading();
    try {
      await requestAssociation(selectedInst.id, trimmed);
      showSuccess(`Association request sent to ${selectedInst.name}!`);
      closeDialog();
      await loadAssociations(); // Refresh
    } catch (err) {
      showApiError(err, "Failed to submit association request.");
    } finally {
      setSubmitting(false);
      hideLoading();
    }
  };

  // ── Metrics ──
  const counts = {
    pending: associations.filter((a) => a.status === "PENDING").length,
    approved: associations.filter((a) => a.status === "APPROVED").length,
    rejected: associations.filter((a) => a.status === "REJECTED").length,
    revoked: associations.filter((a) => a.status === "REVOKED").length,
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto p-4 sm:p-6">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">My Institutions</h1>
        <p className="text-sm text-gray-500 mt-1.5">
          Browse accredited institutions and manage your enrollment associations.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Pending</span>
          <span className="text-2xl font-black text-amber-600 mt-2">{counts.pending}</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Approved</span>
          <span className="text-2xl font-black text-emerald-600 mt-2">{counts.approved}</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Rejected</span>
          <span className="text-2xl font-black text-rose-600 mt-2">{counts.rejected}</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Revoked</span>
          <span className="text-2xl font-black text-gray-600 mt-2">{counts.revoked}</span>
        </div>
      </div>

      {/* View Tabs */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-100 bg-gray-50">
          {[
            { key: "browse", label: "Browse Institutions", icon: "🏛️" },
            { key: "associations", label: "My Associations", icon: "🔗" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveView(tab.key)}
              className={`flex-1 px-5 py-3.5 text-xs font-bold uppercase tracking-wider border-b-2 transition flex items-center justify-center gap-2 ${
                activeView === tab.key
                  ? "border-indigo-600 text-indigo-700 bg-white"
                  : "border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <span className="text-base">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Browse Institutions Tab ── */}
        {activeView === "browse" && (
          <div>
            {/* Search Bar */}
            <div className="p-4 border-b border-gray-100">
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                  </svg>
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, code, city, or state..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>
            </div>

            {instLoading ? (
              <div className="flex justify-center items-center py-12 text-gray-400">
                <Spinner /> <span className="ml-3 text-sm">Loading institutions...</span>
              </div>
            ) : filteredInstitutions.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-sm">
                {searchQuery.trim()
                  ? "No institutions match your search."
                  : "No institutions available at this time."}
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredInstitutions.map((inst) => {
                  const alreadyAssociated = associatedInstitutionIds.has(inst.id);
                  return (
                    <div key={inst.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 hover:bg-gray-50/50 transition gap-4">
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="text-xl">🏛️</span>
                          <h3 className="font-bold text-gray-900 text-sm">{inst.name}</h3>
                          <span className={trustBadge(inst.trustLevel)}>{inst.trustLevel}</span>
                        </div>
                        <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <span className="text-gray-400 font-medium">Code:</span>
                            <span className="font-mono bg-gray-50 border border-gray-100 px-1.5 py-0.5 rounded text-gray-700">{inst.code}</span>
                          </span>
                          {inst.city && (
                            <span className="flex items-center gap-1">
                              <span className="text-gray-400 font-medium">📍</span>
                              {inst.city}{inst.state ? `, ${inst.state}` : ""}
                            </span>
                          )}
                          {inst.officialEmail && (
                            <span className="flex items-center gap-1">
                              <span className="text-gray-400 font-medium">✉️</span>
                              {inst.officialEmail}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="shrink-0">
                        {alreadyAssociated ? (
                          <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-bold">
                            ✓ Associated
                          </span>
                        ) : (
                          <button
                            onClick={() => openAssociationDialog(inst)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition flex items-center gap-1.5"
                          >
                            <span>🔗</span>
                            Request Association
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── My Associations Tab ── */}
        {activeView === "associations" && (
          <div>
            {assocLoading ? (
              <div className="flex justify-center items-center py-12 text-gray-400">
                <Spinner /> <span className="ml-3 text-sm">Loading associations...</span>
              </div>
            ) : associations.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                <div className="text-4xl mb-3">🔗</div>
                <p className="text-sm font-medium">No associations yet.</p>
                <p className="text-xs mt-1">Browse institutions and submit an enrollment request to get started.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 text-[10px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100">
                      <th className="p-4 pl-6">Institution</th>
                      <th className="p-4">Enrollment Number</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Dates</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {associations.map((assoc) => (
                      <tr key={assoc.id} className="hover:bg-gray-50/50 transition">
                        <td className="p-4 pl-6">
                          <div className="font-semibold text-gray-950">{assoc.institutionName}</div>
                        </td>
                        <td className="p-4">
                          <span className="font-mono bg-gray-50 border border-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs">
                            {assoc.enrollmentNumber}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={statusBadge(assoc.status)}>{assoc.status}</span>
                          {(assoc.status === "REJECTED" || assoc.status === "REVOKED") && assoc.reviewReason && (
                            <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded border border-gray-100 font-medium max-w-xs break-words mt-1.5">
                              <strong>Reason:</strong> {assoc.reviewReason}
                            </div>
                          )}
                        </td>
                        <td className="p-4 space-y-1">
                          <div className="text-[10px] text-gray-400 font-medium">
                            Requested: {formatDate(assoc.requestedAt)}
                          </div>
                          {assoc.reviewedAt && (
                            <div className="text-[10px] text-gray-400 font-medium">
                              Reviewed: {formatDate(assoc.reviewedAt)}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Association Request Dialog ── */}
      {showDialog && selectedInst && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-50 p-2.5 rounded-xl text-indigo-600 text-xl">🏛️</div>
              <div>
                <h4 className="font-bold text-gray-900 text-lg">Request Association</h4>
                <p className="text-xs text-gray-400 mt-0.5">{selectedInst.name}</p>
              </div>
            </div>

            <p className="text-sm text-gray-500 leading-relaxed">
              Submit your enrollment number to request verification from{" "}
              <strong className="text-gray-900">{selectedInst.name}</strong>. The institution will review and approve your request.
            </p>

            {/* Trust Badge */}
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl p-3">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Trust Level:</span>
              <span className={trustBadge(selectedInst.trustLevel)}>{selectedInst.trustLevel}</span>
            </div>

            {/* Enrollment Number Input */}
            <div className="space-y-1.5">
              <label htmlFor="assoc-enrollment" className="block text-xs font-bold text-gray-400 uppercase tracking-wide">
                Enrollment Number <span className="text-rose-500">*</span>
              </label>
              <input
                id="assoc-enrollment"
                type="text"
                value={enrollmentNumber}
                onChange={(e) => {
                  setEnrollmentNumber(e.target.value);
                  setDialogError("");
                }}
                disabled={submitting}
                placeholder="e.g. MCA-2025-0012"
                maxLength={100}
                className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition ${
                  dialogError ? "border-rose-400" : "border-gray-200"
                }`}
              />
              {dialogError && (
                <p className="text-xs text-rose-600 font-semibold">{dialogError}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={closeDialog}
                disabled={submitting}
                className="flex-1 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-semibold py-2.5 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitAssociation}
                disabled={submitting}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed text-white text-sm font-semibold py-2.5 rounded-xl transition flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Spinner size="h-4 w-4" color="text-white" />
                    Submitting…
                  </>
                ) : (
                  "Submit Request"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyInstitutions;
