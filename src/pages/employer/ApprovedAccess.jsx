import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getEmployerConsents } from "../../services/consentService";
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

// ── Status Badge ──────────────────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
  const cfg = {
    REQUESTED: { label: "⏳ Pending", cls: "bg-amber-50 text-amber-700 border-amber-200" },
    APPROVED:  { label: "✅ Active", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    REJECTED:  { label: "✕ Rejected", cls: "bg-red-50 text-red-600 border-red-200" },
    REVOKED:   { label: "🔒 Revoked", cls: "bg-gray-100 text-gray-500 border-gray-200" },
    EXPIRED:   { label: "⏱ Expired", cls: "bg-orange-50 text-orange-700 border-orange-200" },
  };
  const c = cfg[status] || { label: status, cls: "bg-gray-100 text-gray-500 border-gray-200" };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border whitespace-nowrap ${c.cls}`}>
      {c.label}
    </span>
  );
};

// ── Spinner ───────────────────────────────────────────────────────────────────

const Spinner = () => (
  <svg className="animate-spin h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
  </svg>
);

// ── Metric Card ───────────────────────────────────────────────────────────────

const MetricCard = ({ label, value, color = "text-indigo-600" }) => (
  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{label}</span>
    <span className={`text-2xl font-black mt-2 ${color}`}>{value}</span>
  </div>
);

// ── Main Component ─────────────────────────────────────────────────────────────

const ApprovedAccess = () => {
    const [consents, setConsents] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchConsents = useCallback(async () => {
        try {
            setLoading(true);
            const res = await getEmployerConsents();
            const sorted = [...(res.data || [])].sort(
                (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
            );
            setConsents(sorted);
        } catch (err) {
            showApiError(err, "Failed to load access requests.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchConsents(); }, [fetchConsents]);

    const totalRequests   = consents.length;
    const approvedCount   = consents.filter(c => c.status === "APPROVED").length;
    const pendingCount    = consents.filter(c => c.status === "REQUESTED").length;

    return (
        <div className="space-y-8 max-w-5xl mx-auto p-4 sm:p-6">
            <div>
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Access Requests</h1>
                <p className="text-sm text-gray-500 mt-1.5">View all consent requests you've sent to credential holders.</p>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-4">
                <MetricCard label="Total Requests" value={totalRequests} color="text-indigo-600" />
                <MetricCard label="Approved" value={approvedCount} color="text-emerald-600" />
                <MetricCard label="Pending" value={pendingCount} color="text-amber-600" />
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="flex justify-center items-center gap-3 py-16 text-gray-400 text-sm">
                            <Spinner /> Loading access requests…
                        </div>
                    ) : consents.length === 0 ? (
                        <div className="py-16 text-center text-gray-400">
                            <div className="text-4xl mb-3">📋</div>
                            <p className="font-semibold text-gray-500 text-sm">No access requests yet.</p>
                            <p className="text-xs text-gray-400 mt-1">Search for individuals and request access to view their credentials.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/60 text-[10px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100">
                                    <th className="p-4 pl-6">Individual</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Requested</th>
                                    <th className="p-4 pr-6 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm">
                                {consents.map((c) => (
                                    <tr key={c.id} className="hover:bg-gray-50/50 transition">
                                        <td className="p-4 pl-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 font-bold shrink-0">
                                                    {c.individualName?.charAt(0)?.toUpperCase() || "U"}
                                                </div>
                                                <span className="font-semibold text-gray-900">{c.individualName}</span>
                                            </div>
                                        </td>
                                        <td className="p-4"><StatusBadge status={c.status} /></td>
                                        <td className="p-4">
                                            <span className="text-xs text-gray-500">{formatDate(c.createdAt)}</span>
                                        </td>
                                        <td className="p-4 pr-6 text-right">
                                            {c.status === "APPROVED" && (
                                                <button
                                                    id={`view-docs-${c.id}`}
                                                    onClick={() => navigate(`/employer/view/${c.id}`)}
                                                    className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold px-3.5 py-1.5 rounded-xl transition border border-indigo-100"
                                                >
                                                    View Documents
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ApprovedAccess;
