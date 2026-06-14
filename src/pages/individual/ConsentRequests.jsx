import React, { useCallback, useEffect, useState } from "react";
import {
  getMyConsents,
  approveConsent,
  rejectConsent,
  revokeConsent,
} from "../../services/consentService";
import { showSuccess, showApiError } from "../../utils/toast";

// ── Helpers ────────────────────────────────────────────────────────────────────

const formatDate = (isoString) => {
  if (!isoString) return "—";
  try {
    return new Date(isoString).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
    });
  } catch { return isoString; }
};

const daysUntil = (isoString) => {
  if (!isoString) return null;
  try {
    const diff = new Date(isoString) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  } catch { return null; }
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

// ── Validity Timer ────────────────────────────────────────────────────────────

const ValidityTimer = ({ validUntil }) => {
  const days = daysUntil(validUntil);
  if (days == null) return null;

  if (days <= 0) {
    return <span className="text-[10px] text-red-500 font-bold">Expired</span>;
  }
  if (days <= 7) {
    return <span className="text-[10px] text-amber-600 font-bold">⚠ {days}d remaining</span>;
  }
  return <span className="text-[10px] text-gray-400">{days}d remaining</span>;
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

// ── Consent Card ──────────────────────────────────────────────────────────────

const ConsentCard = ({ consent, onApprove, onReject, onRevoke }) => {
  const [acting, setActing] = useState(null);

  const handleAction = async (action, handler) => {
    setActing(action);
    try {
      await handler(consent.id);
    } finally {
      setActing(null);
    }
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Left Info */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-lg shrink-0">
            {consent.employerName?.charAt(0)?.toUpperCase() || "E"}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{consent.employerName}</p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <StatusBadge status={consent.status} />
              {consent.status === "APPROVED" && consent.validUntil && (
                <ValidityTimer validUntil={consent.validUntil} />
              )}
            </div>
            <div className="mt-1.5 text-[10px] text-gray-400 space-y-0.5">
              <p>Requested: {formatDate(consent.createdAt)}</p>
              {consent.decisionAt && consent.status !== "REQUESTED" && (
                <p>
                  {consent.status === "APPROVED" ? "Approved" : consent.status === "REJECTED" ? "Rejected" : "Revoked"}
                  : {formatDate(consent.decisionAt)}
                </p>
              )}
              {consent.status === "APPROVED" && consent.validUntil && (
                <p>Expires: {formatDate(consent.validUntil)}</p>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 shrink-0">
          {consent.status === "REQUESTED" && (
            <>
              <button
                type="button"
                disabled={!!acting}
                onClick={() => handleAction("approve", onApprove)}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-sm font-bold transition border border-emerald-200 disabled:opacity-50"
              >
                {acting === "approve" ? "…" : "Approve"}
              </button>
              <button
                type="button"
                disabled={!!acting}
                onClick={() => handleAction("reject", onReject)}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 text-sm font-bold transition border border-red-200 disabled:opacity-50"
              >
                {acting === "reject" ? "…" : "Reject"}
              </button>
            </>
          )}
          {consent.status === "APPROVED" && (
            <button
              type="button"
              disabled={!!acting}
              onClick={() => handleAction("revoke", onRevoke)}
              className="px-4 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 text-sm font-bold transition border border-red-200 disabled:opacity-50"
            >
              {acting === "revoke" ? "…" : "Revoke Access"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Tab Button ────────────────────────────────────────────────────────────────

const TabButton = ({ label, count, isActive, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-3.5 py-1.5 rounded-xl text-sm font-bold transition ${
      isActive
        ? "bg-white text-indigo-700 shadow-sm border border-gray-200"
        : "text-gray-500 hover:text-gray-800"
    }`}
  >
    {label} <span className="ml-1 opacity-60">{count}</span>
  </button>
);

// ── Empty State ───────────────────────────────────────────────────────────────

const EmptyState = ({ tab }) => {
  const messages = {
    pending: { icon: "📭", title: "No pending requests", desc: "Employer access requests will appear here." },
    active: { icon: "🔓", title: "No active consents", desc: "Approved consents will appear here." },
    history: { icon: "📜", title: "No history records", desc: "Rejected, revoked, and expired consents will appear here." },
  };
  const m = messages[tab] || messages.pending;
  return (
    <div className="py-12 text-center text-gray-400">
      <div className="text-4xl mb-3">{m.icon}</div>
      <p className="font-semibold text-gray-500 text-sm">{m.title}</p>
      <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">{m.desc}</p>
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────

const ConsentRequests = () => {
  const [pending, setPending] = useState([]);
  const [active, setActive] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");

  const fetchConsents = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getMyConsents();
      setPending(res.data.pending || []);
      setActive(res.data.active || []);
      setHistory(res.data.history || []);
    } catch (err) {
      showApiError(err, "Failed to load consent requests.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchConsents(); }, [fetchConsents]);

  // ── Action Handlers ─────────────────────────────────────────────────────────

  const handleApprove = async (id) => {
    try {
      await approveConsent(id);
      showSuccess("Consent approved successfully.");
      fetchConsents();
    } catch (err) {
      showApiError(err, "Failed to approve consent.");
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectConsent(id);
      showSuccess("Consent request rejected.");
      fetchConsents();
    } catch (err) {
      showApiError(err, "Failed to reject consent.");
    }
  };

  const handleRevoke = async (id) => {
    try {
      await revokeConsent(id);
      showSuccess("Consent revoked.");
      fetchConsents();
    } catch (err) {
      showApiError(err, "Failed to revoke consent.");
    }
  };

  const currentList = activeTab === "pending" ? pending : activeTab === "active" ? active : history;

  return (
    <div className="space-y-8 max-w-4xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Consent Management</h1>
        <p className="text-sm text-gray-500 mt-1.5">Control which employers can access your verified credentials.</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-4">
        <MetricCard label="Pending Requests" value={pending.length} color="text-amber-600" />
        <MetricCard label="Active Consents" value={active.length} color="text-emerald-600" />
        <MetricCard label="History Records" value={history.length} color="text-gray-500" />
      </div>

      {/* Tabs + Content */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Tabs */}
        <div className="px-5 py-3 border-b border-gray-100 flex gap-2 bg-gray-50/60">
          <TabButton label="Pending" count={pending.length} isActive={activeTab === "pending"} onClick={() => setActiveTab("pending")} />
          <TabButton label="Active" count={active.length} isActive={activeTab === "active"} onClick={() => setActiveTab("active")} />
          <TabButton label="History" count={history.length} isActive={activeTab === "history"} onClick={() => setActiveTab("history")} />
        </div>

        {/* Content */}
        <div className="p-5">
          {loading ? (
            <div className="flex justify-center items-center gap-3 py-12 text-gray-400 text-sm">
              <Spinner /> Loading consents…
            </div>
          ) : currentList.length === 0 ? (
            <EmptyState tab={activeTab} />
          ) : (
            <div className="space-y-3">
              {currentList.map(c => (
                <ConsentCard
                  key={c.id}
                  consent={c}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onRevoke={handleRevoke}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConsentRequests;
