import React, { useEffect, useState } from 'react';
import adminIntelligenceService from '../../../services/adminIntelligenceService';
import { showApiError } from '../../../utils/toast';

const EvidenceExplorer = () => {
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [size] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    
    const [evidence, setEvidence] = useState([]);
    const [sourceTypeFilter, setSourceTypeFilter] = useState('All');
    
    const [selectedEvidence, setSelectedEvidence] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);

    useEffect(() => {
        fetchEvidence(page);
    }, [page]);

    const fetchEvidence = async (pageIndex) => {
        setLoading(true);
        try {
            const res = await adminIntelligenceService.getEvidence(pageIndex, size);
            setEvidence(res.content || []);
            setTotalPages(res.totalPages || 1);
        } catch (err) {
            showApiError(err, 'Failed to load intelligence evidence.');
        } finally {
            setLoading(false);
        }
    };

    const handleViewSource = async (id) => {
        setDetailsLoading(true);
        try {
            const details = await adminIntelligenceService.getEvidenceDetails(id);
            setSelectedEvidence(details);
        } catch (err) {
            showApiError(err, 'Failed to load evidence details.');
        } finally {
            setDetailsLoading(false);
        }
    };

    const filteredEvidence = evidence.filter(e => {
        if (sourceTypeFilter !== 'All' && e.sourceType !== sourceTypeFilter) return false;
        return true;
    });

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Intelligence Evidence Explorer</h2>
                    <p className="text-sm text-gray-500">Searchable audit log of metric decisions, rule triggers, and risk derivations.</p>
                </div>
                <div className="flex gap-2">
                    <select 
                        value={sourceTypeFilter}
                        onChange={(e) => setSourceTypeFilter(e.target.value)}
                        className="bg-white border border-gray-200 text-gray-700 text-xs rounded p-2">
                        <option value="All">Source Type: All</option>
                        <option value="INSTITUTION">INSTITUTION</option>
                        <option value="CAMPAIGN">CAMPAIGN</option>
                        <option value="CLUSTER">CLUSTER</option>
                        <option value="DOCUMENT">DOCUMENT</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm text-gray-700">
                    <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500 border-b border-gray-200">
                        <tr>
                            <th className="px-4 py-3">Source Type</th>
                            <th className="px-4 py-3">Evidence Code</th>
                            <th className="px-4 py-3">Metric</th>
                            <th className="px-4 py-3">Value</th>
                            <th className="px-4 py-3">Created</th>
                            <th className="px-4 py-3 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading && evidence.length === 0 ? (
                            <tr><td colSpan="6" className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
                        ) : filteredEvidence.length === 0 ? (
                            <tr><td colSpan="6" className="px-4 py-8 text-center text-gray-400">No evidence matches criteria.</td></tr>
                        ) : filteredEvidence.map(e => (
                            <tr key={e.id} className="hover:bg-gray-100/30 transition">
                                <td className="px-4 py-3 font-semibold text-gray-700">{e.sourceType}</td>
                                <td className="px-4 py-3 font-mono text-xs text-blue-600">{e.evidenceCode}</td>
                                <td className="px-4 py-3">{e.metricName}</td>
                                <td className="px-4 py-3 font-mono text-emerald-600">{e.metricValue}</td>
                                <td className="px-4 py-3 text-gray-400 text-xs">{new Date(e.createdAt).toLocaleString()}</td>
                                <td className="px-4 py-3 text-center">
                                    <button 
                                        onClick={() => handleViewSource(e.id)}
                                        className="text-blue-600 hover:text-blue-600 text-xs font-semibold px-3 py-1 bg-blue-900/20 rounded">
                                        View Source
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
            {selectedEvidence && (
                <div className="fixed inset-0 bg-black/60 z-50 flex justify-end">
                    <div className="w-full max-w-md bg-gray-50 border-l border-gray-200 h-full p-6 overflow-y-auto shadow-2xl">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-xl font-black text-gray-900">Evidence Detail</h3>
                                <p className="text-gray-500 text-xs font-mono mt-1">{selectedEvidence.id}</p>
                            </div>
                            <button onClick={() => setSelectedEvidence(null)} className="text-gray-400 hover:text-gray-900 text-xl">&times;</button>
                        </div>
                        
                        {detailsLoading || !selectedEvidence ? (
                            <div className="text-center text-gray-400 mt-10">Loading evidence source...</div>
                        ) : (
                            <div className="space-y-4">
                                <div className="bg-white p-4 rounded-xl border border-gray-200 text-sm">
                                    <span className="block text-gray-500 text-xs uppercase mb-1">Source Type</span>
                                    <span className="font-bold text-blue-600">{selectedEvidence.sourceType}</span>
                                </div>
                                <div className="bg-white p-4 rounded-xl border border-gray-200 text-sm">
                                    <span className="block text-gray-500 text-xs uppercase mb-1">Evidence Code</span>
                                    <span className="font-mono text-emerald-600">{selectedEvidence.evidenceCode}</span>
                                </div>
                                <div className="bg-white p-4 rounded-xl border border-gray-200 text-sm">
                                    <span className="block text-gray-500 text-xs uppercase mb-1">Metric</span>
                                    <span className="text-gray-900">{selectedEvidence.metricName}</span>
                                </div>
                                <div className="bg-white p-4 rounded-xl border border-gray-200 text-sm">
                                    <span className="block text-gray-500 text-xs uppercase mb-1">Value Captured</span>
                                    <span className="font-mono font-bold text-gray-900 text-lg">{selectedEvidence.metricValue}</span>
                                </div>
                                {selectedEvidence.rawPayload && (
                                    <div className="bg-white p-4 rounded-xl border border-gray-200 text-sm">
                                        <span className="block text-gray-500 text-xs uppercase mb-1">Raw Payload</span>
                                        <pre className="text-xs text-gray-700 font-mono overflow-auto mt-2 max-h-64 whitespace-pre-wrap">{selectedEvidence.rawPayload}</pre>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default EvidenceExplorer;
