import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";

const ApprovedAccess = () => {
    const [consents, setConsents] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchConsents = async () => {
            const res = await api.get("/consent/employer");
            setConsents(res.data);
        };
        fetchConsents();
    }, []);

    return (
        <div className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">
                Access Requests
            </h2>

            <table className="w-full text-left">
                <thead>
                    <tr className="border-b">
                        <th className="p-2">Individual</th>
                        <th className="p-2">Status</th>
                        <th className="p-2">Action</th>
                    </tr>
                </thead>

                <tbody>
                    {consents.map((c) => (
                        <tr key={c.id} className="border-b">
                            <td className="p-2">{c.individualName}</td>
                            <td className="p-2">{c.status}</td>
                            <td className="p-2">
                                {c.status === "APPROVED" && (
                                    <button
                                        onClick={() =>
                                            navigate(`/employer/view/${c.id}`)
                                        }
                                        className="text-blue-600"
                                    >
                                        View Documents
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ApprovedAccess;
