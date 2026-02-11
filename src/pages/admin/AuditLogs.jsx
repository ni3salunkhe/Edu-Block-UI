import React, { useEffect, useState } from "react";
import api from "../../services/api";

const AuditLogs = () => {
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const res = await api.get("/admin/audit");
                setLogs(res.data);
            } catch (err) {
                console.error("Failed to fetch logs", err);
            }
        };
        fetchLogs();
    }, []);

    return (
        <div className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">
                Audit Logs
            </h2>

            <table className="w-full text-left text-sm">
                <thead>
                    <tr className="border-b">
                        <th className="p-2">Timestamp</th>
                        <th className="p-2">Actor</th>
                        <th className="p-2">Action</th>
                        <th className="p-2">Target</th>
                    </tr>
                </thead>

                <tbody>
                    {logs.map((log) => (
                        <tr key={log.id} className="border-b">
                            <td className="p-2">{log.timestamp}</td>
                            <td className="p-2">{log.actor}</td>
                            <td className="p-2">{log.action}</td>
                            <td className="p-2">{log.target}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AuditLogs;
