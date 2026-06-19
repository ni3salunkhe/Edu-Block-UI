import React, { useEffect, useState } from 'react';
import adminIntelligenceService from '../../../services/adminIntelligenceService';
import { showApiError } from '../../../utils/toast';

const CampaignDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [size] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    
    const [campaigns, setCampaigns] = useState([]);
    const [statusFilter, setStatusFilter] = useState('All');
    const [severityFilter, setSeverityFilter] = useState('All');

    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);

    useEffect(() => {
        fetchCampaigns(page);
    }, [page]);

    const fetchCampaigns = async (pageIndex) => {
        setLoading(true);
        try {
            const res = await adminIntelligenceService.getCampaigns(pageIndex, size);
            setCampaigns(res.content || []);
            setTotalPages(res.totalPages || 1);
        } catch (err) {
            showApiError(err, 'Failed to load campaigns.');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenCampaign = async (id) => {
        setDetailsLoading(true);
        setSelectedCampaign({ id }); // Show drawer skeleton immediately
        try {
            const details = await adminIntelligenceService.getCampaignDetails(id);
            setSelectedCampaign(details);
        } catch (err) {
            showApiError(err, 'Failed to load campaign details.');
            setSelectedCampaign(null);
        } finally {
            setDetailsLoading(false);
        }
    };

    const filteredCampaigns = campaigns.filter(c => {
        if (statusFilter !== 'All' && c.status !== statusFilter) return false;
        if (severityFilter !== 'All' && c.severity !== severityFilter) return false;
        return true;
    });

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Fraud Campaign Command Center</h2>
                    <p className="text-sm text-gray-500">Monitor active and historical coordinated fraud campaigns detected by AI-6.</p>
                </div>
                <div className="flex gap-2">
                    <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-white border border-gray-200 text-gray-700 text-xs rounded p-2 focus:ring-blue-500 focus:border-blue-500">
                        <option value="All">Status: All</option>
                        <option value="ACTIVE">Status: ACTIVE</option>
                        <option value="MITIGATED">Status: MITIGATED</option>
                        <option value="DORMANT">Status: DORMANT</option>
                    </select>
                    <select 
                        value={severityFilter}
                        onChange={(e) => setSeverityFilter(e.target.value)}
                        className="bg-white border border-gray-200 text-gray-700 text-xs rounded p-2 focus:ring-blue-500 focus:border-blue-500">
                        <option value="All">Severity: All</option>
                        <option value="CRITICAL">Severity: CRITICAL</option>
                        <option value="HIGH">Severity: HIGH</option>
                        <option value="MEDIUM">Severity: MEDIUM</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm text-gray-700">
                    <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500 border-b border-gray-200">
                        <tr>
                            <th className="px-4 py-3">Campaign Name</th>
                            <th className="px-4 py-3">Severity</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Matched Signature</th>
                            <th className="px-4 py-3">Confidence</th>
                            <th className="px-4 py-3">Created</th>
                            <th className="px-4 py-3 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading && campaigns.length === 0 ? (
                            <tr><td colSpan="7" className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
                        ) : filteredCampaigns.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="px-4 py-8 text-center text-gray-400">No campaigns match criteria.</td>
                            </tr>
                        ) : filteredCampaigns.map(c => (
                            <tr key={c.id} className="hover:bg-gray-100/30 transition">
                                <td className="px-4 py-3 font-semibold text-gray-900">{c.name}</td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                                        c.severity === 'CRITICAL' ? 'bg-red-50 text-red-600 border border-red-200' :
                                        c.severity === 'HIGH' ? 'bg-orange-50 text-orange-600 border border-orange-200' :
                                        'bg-yellow-900/50 text-yellow-400 border border-yellow-800'
                                    }`}>
                                        {c.severity}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-xs font-semibold">{c.status}</td>
                                <td className="px-4 py-3 font-mono text-xs text-blue-600">{c.matchedSignature || 'N/A'}</td>
                                <td className="px-4 py-3 font-bold">{c.confidenceScore}%</td>
                                <td className="px-4 py-3 text-gray-500 text-xs">{new Date(c.createdAt).toLocaleDateString()}</td>
                                <td className="px-4 py-3 text-center">
                                    <button 
                                        onClick={() => handleOpenCampaign(c.id)}
                                        className="text-blue-600 hover:text-blue-600 text-xs font-semibold px-3 py-1 bg-blue-900/20 rounded">
                                        Open
                                    </button>
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

            {/* Inspect Drawer/Modal */}
            {selectedCampaign && (
                <div className="fixed inset-0 bg-black/60 z-50 flex justify-end">
                    <div className="w-full max-w-lg bg-gray-50 border-l border-gray-200 h-full p-6 overflow-y-auto shadow-2xl">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-2xl font-black text-gray-900">{selectedCampaign.name}</h3>
                                <p className="text-gray-500 text-sm font-mono mt-1">{selectedCampaign.id}</p>
                            </div>
                            <button onClick={() => setSelectedCampaign(null)} className="text-gray-400 hover:text-gray-900 text-xl">&times;</button>
                        </div>
                        
                        {detailsLoading ? (
                            <div className="text-center text-gray-400 mt-10">Loading campaign intelligence...</div>
                        ) : (
                            <div className="space-y-6">
                                <div className="bg-white p-4 rounded-xl border border-gray-200">
                                    <h4 className="text-xs uppercase font-bold text-gray-400 mb-2">Campaign Details</h4>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="block text-gray-500 text-xs">Severity</span>
                                            <span className="font-bold text-red-600">{selectedCampaign.severity}</span>
                                        </div>
                                        <div>
                                            <span className="block text-gray-500 text-xs">Status</span>
                                            <span className="font-bold text-gray-900">{selectedCampaign.status}</span>
                                        </div>
                                        <div>
                                            <span className="block text-gray-500 text-xs">Confidence</span>
                                            <span className="font-bold text-gray-900">{selectedCampaign.confidenceScore}%</span>
                                        </div>
                                        <div>
                                            <span className="block text-gray-500 text-xs">Target Entity</span>
                                            <span className="font-bold text-blue-600">{selectedCampaign.targetEntityId || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white p-4 rounded-xl border border-gray-200">
                                    <h4 className="text-xs uppercase font-bold text-gray-400 mb-2">Description</h4>
                                    <p className="text-gray-700 text-sm leading-relaxed">{selectedCampaign.description || 'No detailed description available.'}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CampaignDashboard;
