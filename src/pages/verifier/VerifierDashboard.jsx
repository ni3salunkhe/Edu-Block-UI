
import React, { useEffect, useState } from "react";
import api from "../../services/api";

const VerifierDashboard = () => {
    const [summary, setSummary] = useState(null);

    useEffect(() => {
        const fetchSummary = async () => {
            const res = await api.get("/verifier/summary");
            setSummary(res.data);
        };
        fetchSummary();
    }, []);

    if (!summary) return <div>Loading...</div>;

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Verifier Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition">
                    <h3 className="text-gray-500 font-medium mb-2">Pending Verification</h3>
                    <p className="text-3xl font-bold text-orange-500">
                        {summary.pending}
                    </p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition">
                    <h3 className="text-gray-500 font-medium mb-2">Approved Documents</h3>
                    <p className="text-3xl font-bold text-green-600">
                        {summary.approved}
                    </p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition">
                    <h3 className="text-gray-500 font-medium mb-2">Rejected Documents</h3>
                    <p className="text-3xl font-bold text-red-500">
                        {summary.rejected}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default VerifierDashboard;
