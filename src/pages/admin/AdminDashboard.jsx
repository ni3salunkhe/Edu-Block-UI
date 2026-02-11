import React, { useEffect, useState } from "react";
import api from "../../services/api";

const AdminDashboard = () => {
    const [summary, setSummary] = useState(null);

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const res = await api.get("/admin/summary");
                setSummary(res.data);
            } catch (err) {
                console.error("Failed to fetch summary", err);
            }
        };
        fetchSummary();
    }, []);

    if (!summary) return <div>Loading...</div>;

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Admin Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition">
                    <h3 className="text-gray-500 font-medium mb-2">Total Users</h3>
                    <p className="text-3xl font-bold text-gray-900">{summary.totalUsers}</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition">
                    <h3 className="text-gray-500 font-medium mb-2">Verifiers</h3>
                    <p className="text-3xl font-bold text-accent">{summary.verifiers}</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition">
                    <h3 className="text-gray-500 font-medium mb-2">Active Consents</h3>
                    <p className="text-3xl font-bold text-purple-600">{summary.activeConsents}</p>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
