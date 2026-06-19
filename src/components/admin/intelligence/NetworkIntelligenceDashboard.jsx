import React, { useEffect, useState } from 'react';
import adminIntelligenceService from '../../../services/adminIntelligenceService';
import { showApiError } from '../../../utils/toast';

const NetworkIntelligenceDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState(null);
    const [clusters, setClusters] = useState([]);
    
    const [page, setPage] = useState(0);
    const [size] = useState(10);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const fetchNetworkData = async () => {
            setLoading(true);
            try {
                const [summaryRes, clustersRes] = await Promise.all([
                    adminIntelligenceService.getNetworkSummary(),
                    adminIntelligenceService.getClusters(page, size)
                ]);
                setSummary(summaryRes);
                setClusters(clustersRes.content || []);
                setTotalPages(clustersRes.totalPages || 1);
            } catch (err) {
                showApiError(err, 'Failed to load network intelligence.');
            } finally {
                setLoading(false);
            }
        };
        fetchNetworkData();
    }, [page]);

    if (loading && !summary) return <div className="text-gray-500 p-6">Loading Network Intelligence...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Network Intelligence Center</h2>
                    <p className="text-sm text-gray-500">AI-6 Graph Network layer showing entity connections and fraud clusters.</p>
                </div>
            </div>

            {/* Network Summary */}
            {summary && (
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <span className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Graph Ver.</span>
                        <span className="text-xl font-mono text-emerald-600">v{summary.graphVersion}</span>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <span className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Total Nodes</span>
                        <span className="text-xl font-black text-gray-900">{summary.totalNodes}</span>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <span className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Total Edges</span>
                        <span className="text-xl font-black text-gray-900">{summary.totalEdges}</span>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <span className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Clusters</span>
                        <span className="text-xl font-black text-gray-900">{summary.totalClusters}</span>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <span className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Avg Size</span>
                        <span className="text-xl font-black text-gray-900">{summary.averageClusterSize?.toFixed(1)}</span>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <span className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Max Size</span>
                        <span className="text-xl font-black text-gray-900">{summary.largestClusterSize}</span>
                    </div>
                </div>
            )}
            
            {/* Escalations Metrics */}
            {summary && summary.escalationsByType && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                    <h3 className="text-sm font-bold text-gray-900 mb-4">Recommendation Escalations (AI-6)</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        <div>
                            <span className="block text-xs uppercase text-gray-400 font-bold">Total Escalations</span>
                            <span className="text-2xl font-black text-gray-900">{summary.totalEscalations}</span>
                        </div>
                        <div>
                            <span className="block text-xs uppercase text-gray-400 font-bold">Active Escalations</span>
                            <span className="text-2xl font-black text-orange-600">{summary.activeEscalations}</span>
                        </div>
                        {Object.entries(summary.escalationsByType).map(([type, count]) => (
                            <div key={type}>
                                <span className="block text-xs uppercase text-gray-400 font-bold">{type}</span>
                                <span className="text-xl font-mono text-blue-600">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Cluster Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="p-4 border-b border-gray-200 bg-white/50 flex justify-between items-center">
                    <h3 className="font-bold text-gray-900">Detected Fraud Clusters</h3>
                </div>
                <table className="w-full text-left text-sm text-gray-700">
                    <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500 border-b border-gray-200">
                        <tr>
                            <th className="px-4 py-3">Cluster Name</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Score</th>
                            <th className="px-4 py-3">Members (Nodes)</th>
                            <th className="px-4 py-3">Density</th>
                            <th className="px-4 py-3">Fingerprint</th>
                            <th className="px-4 py-3 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading && clusters.length === 0 ? (
                            <tr><td colSpan="7" className="px-4 py-8 text-center text-gray-400">Loading clusters...</td></tr>
                        ) : clusters.length === 0 ? (
                            <tr><td colSpan="7" className="px-4 py-8 text-center text-gray-400">No clusters detected.</td></tr>
                        ) : clusters.map(c => (
                            <tr key={c.id} className="hover:bg-gray-100/30 transition">
                                <td className="px-4 py-3 font-semibold text-gray-900">{c.name}</td>
                                <td className="px-4 py-3 text-xs font-semibold">{c.status}</td>
                                <td className="px-4 py-3 font-mono font-bold text-red-600">{c.score}</td>
                                <td className="px-4 py-3">{c.nodeCount} nodes <span className="text-gray-400 text-xs">({c.edgeCount} edges)</span></td>
                                <td className="px-4 py-3 font-mono text-xs">{c.density?.toFixed(2)}</td>
                                <td className="px-4 py-3 font-mono text-[10px] text-gray-400 truncate max-w-[150px]" title={c.communityFingerprint}>
                                    {c.communityFingerprint}
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <button className="text-blue-600 hover:text-blue-600 text-xs font-semibold">Inspect</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="p-3 border-t border-gray-200 bg-gray-50 flex justify-between items-center text-xs">
                    <span className="text-gray-500">Page {page + 1} of {totalPages}</span>
                    <div className="flex gap-2">
                        <button 
                            disabled={page === 0} 
                            onClick={() => setPage(p => p - 1)}
                            className="px-3 py-1 bg-white text-gray-700 rounded border border-slate-600 disabled:opacity-50">Prev</button>
                        <button 
                            disabled={page >= totalPages - 1} 
                            onClick={() => setPage(p => p + 1)}
                            className="px-3 py-1 bg-white text-gray-700 rounded border border-slate-600 disabled:opacity-50">Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NetworkIntelligenceDashboard;
