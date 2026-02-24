import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { showSuccess, showError, showApiError } from "../../utils/toast";

const ConsentRequests = () => {
    const [pending, setPending] = useState([]);
    const [active, setActive] = useState([]);

    const fetchConsents = async () => {
        try {
            const res = await api.get("/individual/consents");
            setPending(res.data.pending);
            setActive(res.data.active);
        } catch (err) {
            showApiError(err, "Failed to load consent requests.");
        }
    };

    useEffect(() => { fetchConsents(); }, []);

    const approve = async (id) => {
        try {
            await api.post(`/individual/consents/${id}/approve`);
            showSuccess("Consent approved successfully.");
            fetchConsents();
        } catch (err) {
            showApiError(err, "Failed to approve consent.");
        }
    };

    const reject = async (id) => {
        try {
            await api.post(`/individual/consents/${id}/reject`);
            showSuccess("Consent request rejected.");
            fetchConsents();
        } catch (err) {
            showApiError(err, "Failed to reject consent.");
        }
    };

    const revoke = async (id) => {
        if (!window.confirm("Are you sure you want to revoke this access?")) return;
        try {
            await api.post(`/individual/consents/${id}/revoke`);
            showSuccess("Consent revoked.");
            fetchConsents();
        } catch (err) {
            showApiError(err, "Failed to revoke consent.");
        }
    };

    return (
        <div className="space-y-8">
            {/* Pending Requests */}
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Pending Requests</h2>
                {pending.length === 0 ? (
                    <div className="bg-white rounded-xl p-6 text-center text-gray-400 text-sm shadow-sm">
                        No pending requests at the moment.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {pending.map((c) => (
                            <div
                                key={c.id}
                                className="bg-white p-4 rounded-xl shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                            >
                                <div>
                                    <p className="font-medium text-gray-800">{c.employerName}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">is requesting access to your documents</p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => approve(c.id)}
                                        className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 text-sm font-semibold transition"
                                    >
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => reject(c.id)}
                                        className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 text-sm font-semibold transition"
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Active Consents */}
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Active Consents</h2>
                {active.length === 0 ? (
                    <div className="bg-white rounded-xl p-6 text-center text-gray-400 text-sm shadow-sm">
                        No active consents.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {active.map((c) => (
                            <div
                                key={c.id}
                                className="bg-white p-4 rounded-xl shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                            >
                                <div>
                                    <p className="font-medium text-gray-800">{c.employerName}</p>
                                    <p className="text-xs text-green-600 mt-0.5 font-medium">✓ Has access to your documents</p>
                                </div>
                                <button
                                    onClick={() => revoke(c.id)}
                                    className="px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 text-sm font-semibold transition"
                                >
                                    Revoke Access
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ConsentRequests;
