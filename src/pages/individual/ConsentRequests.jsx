import React, { useEffect, useState } from "react";
import api from "../../services/api";

const ConsentRequests = () => {
    const [pending, setPending] = useState([]);
    const [active, setActive] = useState([]);

    const fetchConsents = async () => {
        try {
            const res = await api.get("/individual/consents");
            setPending(res.data.pending);
            setActive(res.data.active);
        } catch (err) {
            console.error("Failed to fetch consents", err);
        }
    };

    useEffect(() => {
        fetchConsents();
    }, []);

    const approve = async (id) => {
        try {
            await api.post(`/individual/consents/${id}/approve`);
            fetchConsents();
        } catch (err) {
            console.error("Failed to approve consent", err);
        }
    };



    const reject = async (id) => {
        try {
            await api.post(`/individual/consents/${id}/reject`);
            fetchConsents();
        } catch (err) {
            console.error("Failed to reject consent", err);
        }
    };

    const revoke = async (id) => {
        try {
            await api.post(`/individual/consents/${id}/revoke`);
            fetchConsents();
        } catch (err) {
            console.error("Failed to revoke consent", err);
        }
    };

    return (
        <div className="space-y-8">

            <div>
                <h2 className="text-xl font-semibold mb-4">
                    Pending Requests
                </h2>

                {pending.length === 0 && <p className="text-gray-500">No pending requests.</p>}

                {pending.map((c) => (
                    <div
                        key={c.id}
                        className="bg-white p-4 rounded shadow mb-3 flex justify-between items-center"
                    >
                        <span>{c.employerName}</span>

                        <div className="space-x-3">
                            <button
                                onClick={() => approve(c.id)}
                                className="text-green-600 hover:text-green-800"
                            >
                                Approve
                            </button>

                            <button
                                onClick={() => reject(c.id)}
                                className="text-red-600 hover:text-red-800"
                            >
                                Reject
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div>
                <h2 className="text-xl font-semibold mb-4">
                    Active Consents
                </h2>

                {active.length === 0 && <p className="text-gray-500">No active consents.</p>}

                {active.map((c) => (
                    <div
                        key={c.id}
                        className="bg-white p-4 rounded shadow mb-3 flex justify-between items-center"
                    >
                        <span>{c.employerName}</span>

                        <button
                            onClick={() => revoke(c.id)}
                            className="text-red-600 hover:text-red-800"
                        >
                            Revoke
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ConsentRequests;
