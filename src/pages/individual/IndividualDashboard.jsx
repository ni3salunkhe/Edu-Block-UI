import React, { useEffect, useState } from "react";
import { getIndividualSummary } from "../../services/individualService";
import { showApiError } from "../../utils/toast";

const IndividualDashboard = () => {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                setLoading(true);
                const res = await getIndividualSummary();
                setSummary(res.data);
            } catch (err) {
                console.error("Failed to fetch summary", err);
                setError("Failed to load dashboard data.");
                showApiError(err, "Failed to load dashboard data.");
            } finally {
                setLoading(false);
            }
        };
        fetchSummary();
    }, []);

    if (loading) {
        return (
            <div className="p-6 flex justify-center items-center py-20 text-gray-400">
                <svg className="animate-spin h-5 w-5 mr-3 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Loading dashboard...
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center">
                    <div className="text-3xl mb-2">⚠️</div>
                    <p className="text-sm text-rose-700 font-semibold">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-3 text-xs text-rose-600 hover:text-rose-800 font-semibold underline transition"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition">
                    <h3 className="text-gray-500 font-medium mb-2">My Documents</h3>
                    <p className="text-3xl font-bold text-gray-900">
                        {summary?.totalDocuments ?? 0}
                    </p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition">
                    <h3 className="text-gray-500 font-medium mb-2">Pending Consents</h3>
                    <p className="text-3xl font-bold text-indigo-600">
                        {summary?.pendingConsents ?? 0}
                    </p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition">
                    <h3 className="text-gray-500 font-medium mb-2">Active Employers</h3>
                    <p className="text-3xl font-bold text-green-600">
                        {summary?.activeEmployers ?? 0}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default IndividualDashboard;
