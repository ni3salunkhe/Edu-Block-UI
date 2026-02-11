import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../services/api";

const ViewDocuments = () => {
    const { consentId } = useParams();
    const [docs, setDocs] = useState([]);

    useEffect(() => {
        const fetchDocs = async () => {
            const res = await api.get(
                `/documents/by-consent/${consentId}`
            );
            setDocs(res.data);
        };
        fetchDocs();
    }, [consentId]);

    return (
        <div className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">
                Verified Documents
            </h2>

            <table className="w-full text-left">
                <thead>
                    <tr className="border-b">
                        <th className="p-2">File Name</th>
                        <th className="p-2">Status</th>
                        <th className="p-2">Blockchain</th>
                    </tr>
                </thead>

                <tbody>
                    {docs.map((doc) => (
                        <tr key={doc.id} className="border-b">
                            <td className="p-2">{doc.fileName}</td>
                            <td className="p-2">{doc.status}</td>
                            <td className="p-2">
                                {doc.blockchainHash ? "Anchored" : "—"}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ViewDocuments;
