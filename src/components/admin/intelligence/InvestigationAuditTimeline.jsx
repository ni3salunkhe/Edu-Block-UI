import React, { useEffect, useState } from 'react';
import adminIntelligenceService from '../../../services/adminIntelligenceService';
import { showApiError } from '../../../utils/toast';

const InvestigationAuditTimeline = () => {
    const [loading, setLoading] = useState(true);
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const res = await adminIntelligenceService.getAuditLogs();
                setLogs(res);
            } catch (err) {
                showApiError(err, 'Failed to load investigation audit logs.');
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, []);

    if (loading) return <div className="text-gray-500 p-6">Loading Audit Timeline...</div>;

    return (
        <div className="space-y-4 max-w-5xl mx-auto">
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Investigation Audit Timeline</h2>
                    <p className="text-sm text-gray-500">Cross-system investigation history across Trust, Campaigns, and Rules.</p>
                </div>
            </div>

            <div className="relative border-l border-gray-200 ml-3 space-y-8 pb-8">
                {logs.length === 0 ? (
                    <div className="pl-8 text-gray-400">No audit logs available.</div>
                ) : logs.map((log) => (
                    <div key={log.id} className="relative pl-8">
                        {/* Timeline dot */}
                        <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-[6.5px] top-1.5 shadow-[0_0_0_4px_rgba(59,130,246,0.2)]"></div>
                        
                        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="bg-gray-50 text-gray-700 text-[10px] uppercase font-bold px-2 py-0.5 rounded border border-gray-200">
                                        {log.actionType}
                                    </span>
                                    <span className="text-gray-900 font-semibold text-sm">{log.actionDescription}</span>
                                </div>
                                <span className="text-xs font-mono text-gray-400">{new Date(log.timestamp).toLocaleString()}</span>
                            </div>
                            
                            <div className="text-sm text-gray-500 mb-2">
                                User: <span className="text-gray-700 font-mono">{log.username || 'SYSTEM'}</span>
                            </div>

                            {log.details && (
                                <div className="bg-gray-50 rounded p-2 text-xs font-mono text-gray-500 break-all border border-gray-200">
                                    {log.details}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default InvestigationAuditTimeline;
