import React, { useEffect, useState, useCallback } from "react";
import {
    listInstitutions,
    createInstitution,
    verifyInstitution,
    accreditInstitution,
    getAuditHistory,
    mapUserToInstitution,
    removeUserFromInstitution,
    listAllUsers,
} from "../../services/adminInstitutionService";
import { showSuccess, showApiError } from "../../utils/toast";

// ── Helpers ────────────────────────────────────────────────────────────────────

const formatDate = (iso) => {
    if (!iso) return "—";
    try {
        return new Date(iso).toLocaleDateString("en-IN", {
            day: "2-digit", month: "short", year: "numeric",
            hour: "2-digit", minute: "2-digit",
        });
    } catch { return iso; }
};

const trustBadge = (level) => {
    switch (level) {
        case "ACCREDITED":
            return "bg-indigo-50 text-indigo-700 border border-indigo-200";
        case "VERIFIED":
            return "bg-blue-50 text-blue-700 border border-blue-200";
        case "REGISTERED":
            return "bg-slate-50 text-slate-600 border border-slate-200";
        default:
            return "bg-rose-50 text-rose-600 border border-rose-200";
    }
};

const statusBadge = (s) => {
    if (s === "ACTIVE") return "bg-emerald-50 text-emerald-700 border border-emerald-200";
    return "bg-amber-50 text-amber-700 border border-amber-200";
};

const Spinner = ({ size = "h-5 w-5", color = "text-indigo-600" }) => (
    <svg className={`animate-spin ${size} ${color}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
);

// ── Main Component ─────────────────────────────────────────────────────────────

const ManageInstitutions = () => {
    // ── Data ──
    const [institutions, setInstitutions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [allUsers, setAllUsers] = useState([]);

    // ── View mode ──
    const [activeTab, setActiveTab] = useState("list"); // list | create

    // ── Create Form ──
    const [form, setForm] = useState({
        name: "", code: "", website: "", officialEmail: "",
        city: "", state: "", country: "",
    });
    const [creating, setCreating] = useState(false);

    // ── Expanded Row ──
    const [expandedId, setExpandedId] = useState(null);
    const [auditHistory, setAuditHistory] = useState([]);
    const [auditLoading, setAuditLoading] = useState(false);

    // ── Verify/Accredit Dialog ──
    const [actionDialog, setActionDialog] = useState(null); // { type: 'verify'|'accredit', inst }
    const [actionReason, setActionReason] = useState("");
    const [actionLoading, setActionLoading] = useState(false);

    // ── Map User Dialog ──
    const [mapDialog, setMapDialog] = useState(null); // institution
    const [selectedUserId, setSelectedUserId] = useState("");
    const [mapLoading, setMapLoading] = useState(false);

    // ── Load ──
    const loadInstitutions = useCallback(async () => {
        try {
            setLoading(true);
            const res = await listInstitutions();
            setInstitutions(res.data || []);
        } catch (err) {
            showApiError(err, "Failed to load institutions.");
        } finally {
            setLoading(false);
        }
    }, []);

    const loadUsers = useCallback(async () => {
        try {
            const res = await listAllUsers();
            setAllUsers(res.data || []);
        } catch { /* silent */ }
    }, []);

    useEffect(() => {
        loadInstitutions();
        loadUsers();
    }, [loadInstitutions, loadUsers]);

    // ── Derived: INSTITUTION-role users ──
    const institutionUsers = allUsers.filter(
        (u) => u.role === "INSTITUTION"
    );

    // ── Create Handler ──
    const handleCreate = async (e) => {
        e.preventDefault();
        if (!form.name.trim() || !form.code.trim() || !form.officialEmail.trim()) {
            showApiError(null, "Name, Code, and Official Email are required.");
            return;
        }
        setCreating(true);
        try {
            await createInstitution(form);
            showSuccess("Institution created successfully!");
            setForm({ name: "", code: "", website: "", officialEmail: "", city: "", state: "", country: "" });
            setActiveTab("list");
            await loadInstitutions();
        } catch (err) {
            showApiError(err, "Failed to create institution.");
        } finally {
            setCreating(false);
        }
    };

    // ── Expand/Collapse Row ──
    const toggleExpand = async (inst) => {
        if (expandedId === inst.id) {
            setExpandedId(null);
            return;
        }
        setExpandedId(inst.id);
        setAuditLoading(true);
        try {
            const res = await getAuditHistory(inst.id);
            setAuditHistory(res.data || []);
        } catch {
            setAuditHistory([]);
        } finally {
            setAuditLoading(false);
        }
    };

    // ── Verify / Accredit ──
    const openActionDialog = (type, inst) => {
        setActionDialog({ type, inst });
        setActionReason("");
    };

    const executeAction = async () => {
        if (!actionReason.trim() || actionReason.trim().length < 5) {
            showApiError(null, "Please provide a reason (min 5 characters).");
            return;
        }
        setActionLoading(true);
        try {
            if (actionDialog.type === "verify") {
                await verifyInstitution(actionDialog.inst.id, actionReason.trim());
                showSuccess(`${actionDialog.inst.name} verified successfully!`);
            } else {
                await accreditInstitution(actionDialog.inst.id, actionReason.trim());
                showSuccess(`${actionDialog.inst.name} accredited successfully!`);
            }
            setActionDialog(null);
            await loadInstitutions();
        } catch (err) {
            showApiError(err, `Failed to ${actionDialog.type} institution.`);
        } finally {
            setActionLoading(false);
        }
    };

    // ── Map User ──
    const openMapDialog = (inst) => {
        setMapDialog(inst);
        setSelectedUserId("");
    };

    const executeMap = async () => {
        if (!selectedUserId) {
            showApiError(null, "Please select an institution user.");
            return;
        }
        setMapLoading(true);
        try {
            await mapUserToInstitution(mapDialog.id, selectedUserId);
            showSuccess(`User mapped to ${mapDialog.name} successfully!`);
            setMapDialog(null);
            await loadUsers();
        } catch (err) {
            showApiError(err, "Failed to map user to institution.");
        } finally {
            setMapLoading(false);
        }
    };

    // ── Remove User Mapping ──
    const handleRemoveMapping = async (userId, username) => {
        if (!window.confirm(`Remove ${username}'s institution mapping? They will lose access to institution operations.`)) return;
        try {
            await removeUserFromInstitution(userId);
            showSuccess(`User mapping removed.`);
            await loadUsers();
        } catch (err) {
            showApiError(err, "Failed to remove user mapping.");
        }
    };

    // ── Metrics ──
    const metrics = {
        total: institutions.length,
        registered: institutions.filter((i) => i.trustLevel === "REGISTERED").length,
        verified: institutions.filter((i) => i.trustLevel === "VERIFIED").length,
        accredited: institutions.filter((i) => i.trustLevel === "ACCREDITED").length,
    };

    const inputCls = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition";
    const labelCls = "block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1";

    return (
        <div className="space-y-8 max-w-6xl mx-auto p-4 sm:p-6">

            {/* Header */}
            <div>
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Manage Institutions</h1>
                <p className="text-sm text-gray-500 mt-1.5">
                    Create, verify, accredit institutions and map operator accounts.
                </p>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Total", value: metrics.total, color: "text-gray-800" },
                    { label: "Registered", value: metrics.registered, color: "text-slate-600" },
                    { label: "Verified", value: metrics.verified, color: "text-blue-600" },
                    { label: "Accredited", value: metrics.accredited, color: "text-indigo-600" },
                ].map((m) => (
                    <div key={m.label} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{m.label}</span>
                        <p className={`text-2xl font-black mt-2 ${m.color}`}>{m.value}</p>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex border-b border-gray-100 bg-gray-50">
                    {[
                        { key: "list", label: "All Institutions", icon: "🏛️" },
                        { key: "create", label: "Create New", icon: "➕" },
                        { key: "mapping", label: "User Mapping", icon: "🔗" },
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex-1 px-5 py-3.5 text-xs font-bold uppercase tracking-wider border-b-2 transition flex items-center justify-center gap-2 ${
                                activeTab === tab.key
                                    ? "border-indigo-600 text-indigo-700 bg-white"
                                    : "border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                            }`}
                        >
                            <span className="text-base">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* ═══ LIST TAB ═══ */}
                {activeTab === "list" && (
                    <div>
                        {loading ? (
                            <div className="flex justify-center items-center py-12 text-gray-400">
                                <Spinner /> <span className="ml-3 text-sm">Loading institutions...</span>
                            </div>
                        ) : institutions.length === 0 ? (
                            <div className="py-12 text-center text-gray-400">
                                <div className="text-4xl mb-3">🏛️</div>
                                <p className="text-sm font-medium">No institutions yet.</p>
                                <p className="text-xs mt-1">Use the "Create New" tab to register one.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {institutions.map((inst) => (
                                    <React.Fragment key={inst.id}>
                                        <div className="p-5 hover:bg-gray-50/50 transition">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                <div className="space-y-1.5 min-w-0">
                                                    <div className="flex items-center gap-2.5 flex-wrap">
                                                        <span className="text-xl">🏛️</span>
                                                        <h3 className="font-bold text-gray-900 text-sm">{inst.name}</h3>
                                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${trustBadge(inst.trustLevel)}`}>
                                                            {inst.trustLevel}
                                                        </span>
                                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${statusBadge(inst.status)}`}>
                                                            {inst.status}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-gray-500">
                                                        <span>Code: <span className="font-mono bg-gray-50 border px-1.5 py-0.5 rounded text-gray-700">{inst.code}</span></span>
                                                        <span>✉️ {inst.officialEmail}</span>
                                                        {inst.city && <span>📍 {inst.city}{inst.state ? `, ${inst.state}` : ""}</span>}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                                                    {inst.trustLevel === "REGISTERED" && (
                                                        <button
                                                            onClick={() => openActionDialog("verify", inst)}
                                                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition"
                                                        >
                                                            ✓ Verify
                                                        </button>
                                                    )}
                                                    {inst.trustLevel === "VERIFIED" && (
                                                        <button
                                                            onClick={() => openActionDialog("accredit", inst)}
                                                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition"
                                                        >
                                                            🏆 Accredit
                                                        </button>
                                                    )}
                                                    {inst.trustLevel === "ACCREDITED" && (
                                                        <span className="text-[10px] text-indigo-500 font-bold bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-lg">
                                                            ✓ Fully Accredited
                                                        </span>
                                                    )}
                                                    <button
                                                        onClick={() => openMapDialog(inst)}
                                                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold px-3 py-1.5 rounded-lg transition"
                                                        title="Map a user to this institution"
                                                    >
                                                        🔗 Map User
                                                    </button>
                                                    <button
                                                        onClick={() => toggleExpand(inst)}
                                                        className="text-gray-500 hover:text-gray-800 text-xs font-bold px-2 py-1.5 rounded-lg transition"
                                                    >
                                                        {expandedId === inst.id ? "Hide ▲" : "Audit ▼"}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Expanded Audit History */}
                                        {expandedId === inst.id && (
                                            <div className="bg-indigo-50/30 px-6 py-4 border-t border-indigo-100">
                                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Trust Level Audit History</h4>
                                                {auditLoading ? (
                                                    <div className="flex items-center gap-2 py-4 text-gray-400 text-sm"><Spinner size="h-4 w-4" /> Loading...</div>
                                                ) : auditHistory.length === 0 ? (
                                                    <p className="text-xs text-gray-400 py-2">No audit entries.</p>
                                                ) : (
                                                    <div className="space-y-2">
                                                        {auditHistory.map((a, i) => (
                                                            <div key={i} className="bg-white rounded-xl border border-gray-100 p-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-xs">
                                                                <span className="shrink-0">
                                                                    <span className={`px-2 py-0.5 rounded-full font-bold ${trustBadge(a.oldTrustLevel)}`}>{a.oldTrustLevel}</span>
                                                                    <span className="text-gray-400 mx-1">→</span>
                                                                    <span className={`px-2 py-0.5 rounded-full font-bold ${trustBadge(a.newTrustLevel)}`}>{a.newTrustLevel}</span>
                                                                </span>
                                                                <span className="text-gray-600 font-medium flex-1 break-words">{a.reason}</span>
                                                                <span className="text-gray-400 shrink-0">{formatDate(a.changedAt)}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </React.Fragment>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ═══ CREATE TAB ═══ */}
                {activeTab === "create" && (
                    <div className="p-6 max-w-lg mx-auto">
                        <h3 className="text-lg font-bold text-gray-900 mb-5">Register New Institution</h3>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className={labelCls}>Institution Name <span className="text-rose-500">*</span></label>
                                <input type="text" className={inputCls} value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    placeholder="e.g. Indian Institute of Technology Delhi" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelCls}>Code <span className="text-rose-500">*</span></label>
                                    <input type="text" className={inputCls} value={form.code}
                                        onChange={(e) => setForm({ ...form, code: e.target.value })}
                                        placeholder="e.g. IIT-D" />
                                </div>
                                <div>
                                    <label className={labelCls}>Official Email <span className="text-rose-500">*</span></label>
                                    <input type="email" className={inputCls} value={form.officialEmail}
                                        onChange={(e) => setForm({ ...form, officialEmail: e.target.value })}
                                        placeholder="admin@iitd.ac.in" />
                                </div>
                            </div>
                            <div>
                                <label className={labelCls}>Website</label>
                                <input type="text" className={inputCls} value={form.website}
                                    onChange={(e) => setForm({ ...form, website: e.target.value })}
                                    placeholder="https://iitd.ac.in" />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className={labelCls}>City</label>
                                    <input type="text" className={inputCls} value={form.city}
                                        onChange={(e) => setForm({ ...form, city: e.target.value })}
                                        placeholder="New Delhi" />
                                </div>
                                <div>
                                    <label className={labelCls}>State</label>
                                    <input type="text" className={inputCls} value={form.state}
                                        onChange={(e) => setForm({ ...form, state: e.target.value })}
                                        placeholder="Delhi" />
                                </div>
                                <div>
                                    <label className={labelCls}>Country</label>
                                    <input type="text" className={inputCls} value={form.country}
                                        onChange={(e) => setForm({ ...form, country: e.target.value })}
                                        placeholder="India" />
                                </div>
                            </div>
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-semibold py-2.5 rounded-xl text-sm transition flex items-center justify-center gap-2"
                                >
                                    {creating ? <><Spinner size="h-4 w-4" color="text-white" /> Creating...</> : "Create Institution"}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* ═══ USER MAPPING TAB ═══ */}
                {activeTab === "mapping" && (
                    <div className="p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Institution User Mappings</h3>
                        <p className="text-xs text-gray-500 mb-5">
                            Users with the <strong>INSTITUTION</strong> role must be mapped to an institution entity to manage associations and issue credentials.
                        </p>

                        {institutionUsers.length === 0 ? (
                            <div className="py-8 text-center text-gray-400 text-sm">
                                No users with INSTITUTION role found.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50/50 text-[10px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100">
                                            <th className="p-4">Username</th>
                                            <th className="p-4">Email</th>
                                            <th className="p-4">Status</th>
                                            <th className="p-4">User ID</th>
                                            <th className="p-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 text-sm">
                                        {institutionUsers.map((u) => (
                                            <tr key={u.id} className="hover:bg-gray-50/50 transition">
                                                <td className="p-4 font-semibold text-gray-900">{u.username}</td>
                                                <td className="p-4 text-gray-500">{u.email}</td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                                        u.active !== false
                                                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                                            : "bg-red-50 text-red-700 border border-red-200"
                                                    }`}>
                                                        {u.active !== false ? "Active" : "Suspended"}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <span className="font-mono text-xs text-gray-400 bg-gray-50 border px-2 py-0.5 rounded">
                                                        {String(u.id).slice(0, 8)}...
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <button
                                                        onClick={() => handleRemoveMapping(u.id, u.username)}
                                                        className="text-rose-600 hover:text-rose-800 text-xs font-bold transition"
                                                    >
                                                        Remove Mapping
                                                    </button>
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

            {/* ═══ VERIFY/ACCREDIT DIALOG ═══ */}
            {actionDialog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-5">
                        <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-xl text-xl ${
                                actionDialog.type === "verify"
                                    ? "bg-blue-50 text-blue-600"
                                    : "bg-indigo-50 text-indigo-600"
                            }`}>
                                {actionDialog.type === "verify" ? "✓" : "🏆"}
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 text-lg capitalize">{actionDialog.type} Institution</h4>
                                <p className="text-xs text-gray-400 mt-0.5">{actionDialog.inst.name}</p>
                            </div>
                        </div>

                        <p className="text-sm text-gray-500 leading-relaxed">
                            {actionDialog.type === "verify"
                                ? "Verifying will promote this institution from REGISTERED to VERIFIED. Documents issued by verified institutions receive a HIGH trust score."
                                : "Accrediting will promote this institution from VERIFIED to ACCREDITED. Documents issued by accredited institutions receive a VERY_HIGH trust score."
                            }
                        </p>

                        <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl p-3">
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Current Level:</span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${trustBadge(actionDialog.inst.trustLevel)}`}>
                                {actionDialog.inst.trustLevel}
                            </span>
                            <span className="text-gray-400 mx-1">→</span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${trustBadge(actionDialog.type === "verify" ? "VERIFIED" : "ACCREDITED")}`}>
                                {actionDialog.type === "verify" ? "VERIFIED" : "ACCREDITED"}
                            </span>
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
                                Reason <span className="text-rose-500">*</span>
                            </label>
                            <textarea
                                value={actionReason}
                                onChange={(e) => setActionReason(e.target.value)}
                                disabled={actionLoading}
                                rows={3}
                                placeholder="Provide justification for this trust level change..."
                                className={`${inputCls} resize-none`}
                            />
                        </div>

                        <div className="flex gap-3 pt-1">
                            <button onClick={() => setActionDialog(null)} disabled={actionLoading}
                                className="flex-1 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-semibold py-2.5 rounded-xl transition">
                                Cancel
                            </button>
                            <button onClick={executeAction} disabled={actionLoading}
                                className={`flex-1 text-white text-sm font-semibold py-2.5 rounded-xl transition flex items-center justify-center gap-2 ${
                                    actionDialog.type === "verify"
                                        ? "bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300"
                                        : "bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300"
                                }`}>
                                {actionLoading
                                    ? <><Spinner size="h-4 w-4" color="text-white" /> Processing...</>
                                    : `${actionDialog.type === "verify" ? "Verify" : "Accredit"} Institution`
                                }
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ MAP USER DIALOG ═══ */}
            {mapDialog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-5">
                        <div className="flex items-center gap-3">
                            <div className="bg-indigo-50 p-2.5 rounded-xl text-indigo-600 text-xl">🔗</div>
                            <div>
                                <h4 className="font-bold text-gray-900 text-lg">Map User to Institution</h4>
                                <p className="text-xs text-gray-400 mt-0.5">{mapDialog.name}</p>
                            </div>
                        </div>

                        <p className="text-sm text-gray-500 leading-relaxed">
                            Select a user with the <strong>INSTITUTION</strong> role to link as an operator of{" "}
                            <strong>{mapDialog.name}</strong>. Each user can only be mapped to one institution.
                        </p>

                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
                                Institution User <span className="text-rose-500">*</span>
                            </label>
                            <select
                                value={selectedUserId}
                                onChange={(e) => setSelectedUserId(e.target.value)}
                                disabled={mapLoading}
                                className={inputCls}
                            >
                                <option value="">— Select a user —</option>
                                {institutionUsers.map((u) => (
                                    <option key={u.id} value={u.id}>
                                        {u.username} ({u.email})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex gap-3 pt-1">
                            <button onClick={() => setMapDialog(null)} disabled={mapLoading}
                                className="flex-1 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-semibold py-2.5 rounded-xl transition">
                                Cancel
                            </button>
                            <button onClick={executeMap} disabled={mapLoading}
                                className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white text-sm font-semibold py-2.5 rounded-xl transition flex items-center justify-center gap-2">
                                {mapLoading
                                    ? <><Spinner size="h-4 w-4" color="text-white" /> Mapping...</>
                                    : "Map User"
                                }
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageInstitutions;
