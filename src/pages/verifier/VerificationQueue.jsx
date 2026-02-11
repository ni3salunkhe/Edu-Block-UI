
import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";

const VerificationQueue = () => {
    const [documents, setDocuments] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchQueue = async () => {
            const res = await api.get("/verifier/queue");
            setDocuments(res.data);
        };
        fetchQueue();
    }, []);

    return (
        <div className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">
                Verification Queue
            </h2>

            <table className="w-full text-left">
                <thead>
                    <tr className="border-b">
                        <th className="p-2">File</th>
                        <th className="p-2">Owner</th>
                        <th className="p-2">AI Status</th>
                        <th className="p-2">Action</th>
                    </tr>
                </thead>

                <tbody>
                    {documents.map((doc) => (
                        <tr key={doc.id} className="border-b">
                            <td className="p-2">{doc.fileName}</td>
                            <td className="p-2">{doc.ownerName}</td>
                            <td className="p-2">{doc.status}</td>
                            <td className="p-2">
                                <button
                                    onClick={() =>
                                        navigate(`/verifier/review/${doc.id}`)
                                    }
                                    className="text-blue-600"
                                >
                                    Review
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default VerificationQueue;
