import React, { useEffect, useState } from "react";
import { useLoading } from "../../context/LoadingContext";
import { getInstitutionAssociations, approveAssociation, rejectAssociation, revokeAssociation } from "../../services/institutionService";
import { showSuccess, showApiError } from "../../utils/toast";

const InstitutionStudents = () => {
  const { showLoading, hideLoading } = useLoading();
  const [associations, setAssociations] = useState([]);
  const [selectedTab, setSelectedTab] = useState("ALL");
  const [loading, setLoading] = useState(true);

  // Dialog and Modal state
  const [activeDialog, setActiveDialog] = useState(null); // 'approve', 'reject', 'revoke'
  const [selectedAssoc, setSelectedAssoc] = useState(null);
  const [reason, setReason] = useState("");
  const [validationError, setValidationError] = useState("");

  const loadAssociations = async () => {
    try {
      setLoading(true);
      const res = await getInstitutionAssociations();
      if (res && res.data) {
        // Sort client-side by requestedAt descending (newest requests first)
        const sorted = [...res.data].sort(
          (a, b) => new Date(b.requestedAt) - new Date(a.requestedAt)
        );
        setAssociations(sorted);
      }
    } catch (err) {
      showApiError(err, "Failed to load student associations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssociations();
  }, []);

  // Action Dispatchers with Single-State Refresh Strategy
  const handleApprove = async () => {
    if (!selectedAssoc) return;
    showLoading();
    try {
      await approveAssociation(selectedAssoc.id);
      showSuccess("Association request approved successfully.");
      closeDialog();
      await loadAssociations(); // Single-state refresh
    } catch (err) {
      showApiError(err, "Failed to approve student association.");
    } finally {
      hideLoading();
    }
  };

  const handleReject = async () => {
    if (!selectedAssoc) return;
    const trimmedReason = reason.trim();
    if (trimmedReason.length < 10) {
      setValidationError("Rejection reason must be at least 10 characters.");
      return;
    }
    if (trimmedReason.length > 1000) {
      setValidationError("Rejection reason must not exceed 1000 characters.");
      return;
    }

    showLoading();
    try {
      await rejectAssociation(selectedAssoc.id, trimmedReason);
      showSuccess("Association request rejected successfully.");
      closeDialog();
      await loadAssociations(); // Single-state refresh
    } catch (err) {
      showApiError(err, "Failed to reject student association.");
    } finally {
      hideLoading();
    }
  };

  const handleRevoke = async () => {
    if (!selectedAssoc) return;
    const trimmedReason = reason.trim();
    if (trimmedReason.length < 10) {
      setValidationError("Revocation reason must be at least 10 characters.");
      return;
    }
    if (trimmedReason.length > 1000) {
      setValidationError("Revocation reason must not exceed 1000 characters.");
      return;
    }

    showLoading();
    try {
      await revokeAssociation(selectedAssoc.id, trimmedReason);
      showSuccess("Student association revoked successfully.");
      closeDialog();
      await loadAssociations(); // Single-state refresh
    } catch (err) {
      showApiError(err, "Failed to revoke student association.");
    } finally {
      hideLoading();
    }
  };

  const openConfirmation = (assoc, type) => {
    setSelectedAssoc(assoc);
    setActiveDialog(type);
    setReason("");
    setValidationError("");
  };

  const closeDialog = () => {
    setActiveDialog(null);
    setSelectedAssoc(null);
    setReason("");
    setValidationError("");
  };

  // Metrics derivation
  const getCounts = () => {
    return {
      pending: associations.filter((a) => a.status === "PENDING").length,
      approved: associations.filter((a) => a.status === "APPROVED").length,
      rejected: associations.filter((a) => a.status === "REJECTED").length,
      revoked: associations.filter((a) => a.status === "REVOKED").length,
    };
  };

  const counts = getCounts();

  // Client-side filtering
  const filteredAssociations = associations.filter((assoc) => {
    if (selectedTab === "ALL") return true;
    return assoc.status === selectedTab;
  });

  // Date Formatting Helper
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

  // Status Style Helper
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

  return (
    <div className="space-y-8 max-w-5xl mx-auto p-4 sm:p-6">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Student Associations</h1>
        <p className="text-sm text-gray-500 mt-1.5">Manage enrollment link requests and association statuses securely.</p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Pending Requests</span>
          <span className="text-2xl font-black text-amber-600 mt-2">{counts.pending}</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Approved Active</span>
          <span className="text-2xl font-black text-emerald-600 mt-2">{counts.approved}</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Rejected Requests</span>
          <span className="text-2xl font-black text-rose-600 mt-2">{counts.rejected}</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Revoked Access</span>
          <span className="text-2xl font-black text-gray-600 mt-2">{counts.revoked}</span>
        </div>
      </div>

      {/* Filters Tabs & Actions */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        
        {/* Tab Header */}
        <div className="flex border-b border-gray-100 overflow-x-auto bg-gray-50">
          {["ALL", "PENDING", "APPROVED", "REJECTED", "REVOKED"].map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition shrink-0 ${
                selectedTab === tab
                  ? "border-indigo-600 text-indigo-700 bg-white"
                  : "border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              {tab.charAt(0) + tab.slice(1).toLowerCase()}
              <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full bg-gray-200 text-gray-600">
                {tab === "ALL" && String(associations.length)}
                {tab === "PENDING" && String(counts.pending)}
                {tab === "APPROVED" && String(counts.approved)}
                {tab === "REJECTED" && String(counts.rejected)}
                {tab === "REVOKED" && String(counts.revoked)}
              </span>
            </button>
          ))}
        </div>

        {/* Association List */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center py-12 text-gray-400">
              <svg className="animate-spin h-5 w-5 mr-3 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Loading associations...
            </div>
          ) : filteredAssociations.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-sm">
              No association records found for this tab.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-[10px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100">
                  <th className="p-4 pl-6">Student</th>
                  <th className="p-4">Enrollment Number</th>
                  <th className="p-4">Status & Action Audit</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredAssociations.map((assoc) => (
                  <tr key={assoc.id} className="hover:bg-gray-50/50 transition">
                    <td className="p-4 pl-6">
                      <div className="font-semibold text-gray-950">{assoc.studentName}</div>
                      <div className="text-xs text-gray-400 mt-0.5 font-medium">{assoc.studentEmail}</div>
                    </td>
                    <td className="p-4">
                      <span className="font-mono bg-gray-50 border border-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs">
                        {assoc.enrollmentNumber}
                      </span>
                    </td>
                    <td className="p-4 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className={statusBadge(assoc.status)}>{assoc.status}</span>
                      </div>
                      
                      {/* Detailed Metadata Audit */}
                      {assoc.status === "PENDING" && (
                        <div className="text-[10px] text-gray-400 font-medium">
                          Requested: {formatDate(assoc.requestedAt)}
                        </div>
                      )}
                      {assoc.status === "APPROVED" && (
                        <div className="text-[10px] text-gray-400 font-medium">
                          Approved: {formatDate(assoc.reviewedAt)}
                        </div>
                      )}
                      {(assoc.status === "REJECTED" || assoc.status === "REVOKED") && (
                        <div className="space-y-1">
                          {assoc.reviewReason && (
                            <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded border border-gray-100 font-medium max-w-xs break-words">
                              <strong>Reason:</strong> {assoc.reviewReason}
                            </div>
                          )}
                          <div className="text-[10px] text-gray-400 font-medium">
                            Reviewed: {formatDate(assoc.reviewedAt)}
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="p-4 pr-6 text-right">
                      {assoc.status === "PENDING" && (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openConfirmation(assoc, "approve")}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => openConfirmation(assoc, "reject")}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold px-3 py-1.5 rounded-lg transition border border-rose-100"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      {assoc.status === "APPROVED" && (
                        <button
                          onClick={() => openConfirmation(assoc, "revoke")}
                          className="bg-white hover:bg-gray-50 text-gray-600 text-xs font-bold px-3 py-1.5 rounded-lg transition border border-gray-200"
                        >
                          Revoke Access
                        </button>
                      )}
                      {(assoc.status === "REJECTED" || assoc.status === "REVOKED") && (
                        <span className="text-xs text-gray-400 italic">No actions</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>

      {/* ── APPROVE CONFIRMATION DIALOG ── */}
      {activeDialog === "approve" && selectedAssoc && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-50 p-2 rounded-full text-indigo-600 text-lg">
                ❓
              </div>
              <h4 className="font-bold text-gray-900 text-lg">Approve Association</h4>
            </div>
            <p className="text-sm text-gray-500">
              Are you sure you want to approve this student association request for <strong>{selectedAssoc.studentName}</strong> ({selectedAssoc.enrollmentNumber})?
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={closeDialog}
                className="flex-1 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-semibold py-2.5 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-2.5 rounded-xl transition"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── REJECT MODAL ── */}
      {activeDialog === "reject" && selectedAssoc && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-rose-50 p-2 rounded-full text-rose-600 text-lg">
                ⚠️
              </div>
              <h4 className="font-bold text-gray-900 text-lg">Reject Student Association</h4>
            </div>
            <p className="text-xs text-gray-500 leading-normal">
              You are rejecting the association request submitted by <strong>{selectedAssoc.studentName}</strong>. This requires a formal reason.
            </p>
            
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide">
                Rejection Reason <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain the reason for rejecting (10 - 1000 characters)..."
                rows={4}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none transition"
              />
              {validationError && (
                <p className="text-xs text-rose-600 font-semibold">{validationError}</p>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={closeDialog}
                className="flex-1 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-semibold py-2.5 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold py-2.5 rounded-xl transition"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── REVOKE MODAL ── */}
      {activeDialog === "revoke" && selectedAssoc && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-gray-100 p-2 rounded-full text-gray-600 text-lg">
                ⚠️
              </div>
              <h4 className="font-bold text-gray-900 text-lg">Revoke Student Association</h4>
            </div>
            <p className="text-xs text-gray-500 leading-normal">
              Revoking association removes <strong>{selectedAssoc.studentName}</strong>'s enrollment link. This action requires a formal reason.
            </p>
            
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide">
                Revocation Reason <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain the reason for revoking (10 - 1000 characters)..."
                rows={4}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent resize-none transition"
              />
              {validationError && (
                <p className="text-xs text-rose-600 font-semibold">{validationError}</p>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={closeDialog}
                className="flex-1 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-semibold py-2.5 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleRevoke}
                className="flex-1 bg-gray-800 hover:bg-gray-900 text-white text-sm font-semibold py-2.5 rounded-xl transition"
              >
                Confirm Revoke
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default InstitutionStudents;
