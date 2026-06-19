import React, { useEffect, useState } from 'react';
import institutionIntelligenceService from '../../../services/institutionIntelligenceService';
import { showApiError } from '../../../utils/toast';

const RiskIntelligenceCenter = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await institutionIntelligenceService.getRiskEvents();
                setEvents(data);
            } catch (err) {
                showApiError(err, "Failed to load Risk Events");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="p-4 text-gray-500">Loading Risk Intelligence...</div>;

    const activeRisks = events.filter(e => !e.resolved);
    const resolvedRisks = events.filter(e => e.resolved);

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'CRITICAL': return 'bg-red-50 text-red-600 border border-red-200';
            case 'HIGH': return 'bg-orange-50 text-orange-600 border border-orange-200';
            case 'MEDIUM': return 'bg-yellow-900/50 text-yellow-400 border border-yellow-800';
            default: return 'bg-white text-gray-500 border border-gray-200';
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Risk Intelligence Center</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
                    <span className="block text-xs uppercase font-bold text-gray-500 mb-1">Open Risks</span>
                    <span className="text-2xl font-black text-red-600">{activeRisks.length}</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
                    <span className="block text-xs uppercase font-bold text-gray-500 mb-1">Resolved Risks</span>
                    <span className="text-2xl font-black text-emerald-600">{resolvedRisks.length}</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
                    <span className="block text-xs uppercase font-bold text-gray-500 mb-1">Critical Risks</span>
                    <span className="text-2xl font-black text-red-500">
                        {activeRisks.filter(r => r.severity === 'CRITICAL').length}
                    </span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
                    <span className="block text-xs uppercase font-bold text-gray-500 mb-1">High Risks</span>
                    <span className="text-2xl font-black text-orange-500">
                        {activeRisks.filter(r => r.severity === 'HIGH').length}
                    </span>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="text-sm font-bold text-gray-900">Active Risk Events</h3>
                </div>
                {activeRisks.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">No active risk events. Your institution is in good standing.</div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {activeRisks.map(r => (
                            <div key={r.id} className="p-4 hover:bg-gray-100 transition flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${getSeverityColor(r.severity)}`}>
                                            {r.severity}
                                        </span>
                                        <span className="font-bold text-gray-900">{r.eventType}</span>
                                    </div>
                                    <p className="text-sm text-gray-700">{r.description}</p>
                                    <div className="text-xs text-gray-400 mt-2 font-mono">
                                        Triggered: {new Date(r.timestamp).toLocaleString()}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs font-bold text-red-600">ACTION REQUIRED</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {resolvedRisks.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden opacity-75">
                    <div className="p-4 border-b border-gray-200 bg-gray-50">
                        <h3 className="text-sm font-bold text-gray-500">Historical / Resolved Risks</h3>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {resolvedRisks.map(r => (
                            <div key={r.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className="text-gray-400 font-bold text-sm">{r.eventType}</span>
                                    </div>
                                    <p className="text-xs text-gray-500">{r.description}</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-green-900/30 text-green-400 border border-green-800/50">
                                        RESOLVED
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default RiskIntelligenceCenter;
