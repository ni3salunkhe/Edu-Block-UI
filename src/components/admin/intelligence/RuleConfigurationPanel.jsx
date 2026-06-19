import React, { useEffect, useState } from 'react';
import adminIntelligenceService from '../../../services/adminIntelligenceService';
import { showApiError, showSuccess } from '../../../utils/toast';

const RuleConfigurationPanel = () => {
    const [loading, setLoading] = useState(true);
    const [rules, setRules] = useState([]);

    const [showModal, setShowModal] = useState(false);
    const [selectedRule, setSelectedRule] = useState(null);
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchRules();
    }, []);

    const fetchRules = async () => {
        try {
            const res = await adminIntelligenceService.getRules();
            setRules(res);
        } catch (err) {
            showApiError(err, 'Failed to load rule configurations.');
        } finally {
            setLoading(false);
        }
    };

    const handleInitiateToggle = (rule) => {
        setSelectedRule(rule);
        setReason('');
        setShowModal(true);
    };

    const confirmToggleRule = async () => {
        if (!reason || reason.trim().length < 15 || reason.trim().length > 500) {
            showApiError({ response: { data: "A valid reason between 15 and 500 characters is required." } });
            return;
        }

        setIsSubmitting(true);
        try {
            await adminIntelligenceService.updateRule(selectedRule.ruleName, { 
                enabled: !selectedRule.enabled,
                reason: reason.trim()
            });
            showSuccess(`Rule ${!selectedRule.enabled ? 'enabled' : 'disabled'} successfully.`);
            setShowModal(false);
            fetchRules();
        } catch (err) {
            showApiError(err, 'Failed to toggle rule.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="text-gray-500 p-6">Loading Rule Configurations...</div>;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Rule Configuration Center</h2>
                    <p className="text-sm text-gray-500">Administrative controls for AI-2 Fraud Detection rules and score modifiers.</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm text-gray-700">
                    <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500 border-b border-gray-200">
                        <tr>
                            <th className="px-4 py-3">Rule Name</th>
                            <th className="px-4 py-3">Score Modifier</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {rules.length === 0 ? (
                            <tr><td colSpan="4" className="px-4 py-8 text-center text-gray-400">No rules configured.</td></tr>
                        ) : rules.map(r => (
                            <tr key={r.ruleName} className="hover:bg-gray-100/30 transition">
                                <td className="px-4 py-3 font-mono font-semibold text-emerald-600">{r.ruleName}</td>
                                <td className="px-4 py-3 font-mono">
                                    <span className={r.scoreModifier < 0 ? 'text-red-600' : 'text-green-400'}>
                                        {r.scoreModifier > 0 ? '+' : ''}{r.scoreModifier}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    {r.enabled ? (
                                        <span className="bg-green-900/50 text-green-400 border border-green-800 text-[10px] font-bold px-2 py-1 rounded">ENABLED</span>
                                    ) : (
                                        <span className="bg-gray-100 text-gray-500 border border-slate-600 text-[10px] font-bold px-2 py-1 rounded">DISABLED</span>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <button 
                                        onClick={() => handleInitiateToggle(r)}
                                        className={`text-xs font-semibold px-3 py-1 rounded transition ${
                                            r.enabled ? 'bg-orange-900/20 text-orange-600 hover:bg-orange-900/40' : 'bg-green-900/20 text-green-400 hover:bg-green-900/40'
                                        }`}
                                    >
                                        {r.enabled ? 'Disable' : 'Enable'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Audit Reason Modal */}
            {showModal && selectedRule && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-gray-50 border border-gray-200 rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
                        <div className="p-5 border-b border-gray-200">
                            <h3 className="text-lg font-bold text-gray-900">Confirm Rule Change</h3>
                            <p className="text-sm text-gray-500 mt-1">
                                You are about to {selectedRule.enabled ? <span className="text-orange-600 font-bold">DISABLE</span> : <span className="text-green-400 font-bold">ENABLE</span>} the rule <span className="font-mono text-emerald-600">{selectedRule.ruleName}</span>.
                            </p>
                        </div>
                        <div className="p-5 space-y-4">
                            <div>
                                <label className="block text-xs uppercase font-bold text-gray-400 mb-2">Audit Reason (Required)</label>
                                <textarea 
                                    className="w-full bg-white border border-gray-200 rounded-lg p-3 text-sm text-gray-900 placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    rows="4"
                                    placeholder="Enter reason for modifying AI detection rule... (min 15 chars)"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                ></textarea>
                                <div className="text-right mt-1">
                                    <span className={`text-xs font-mono ${reason.length < 15 || reason.length > 500 ? 'text-red-600' : 'text-emerald-600'}`}>
                                        {reason.length} / 500
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="p-5 border-t border-gray-200 bg-white/50 flex justify-end gap-3">
                            <button 
                                onClick={() => setShowModal(false)}
                                disabled={isSubmitting}
                                className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-gray-900 transition">
                                Cancel
                            </button>
                            <button 
                                onClick={confirmToggleRule}
                                disabled={isSubmitting || reason.trim().length < 15 || reason.trim().length > 500}
                                className="px-4 py-2 text-sm font-semibold bg-blue-600 text-gray-900 rounded-lg hover:bg-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed">
                                {isSubmitting ? 'Processing...' : 'Confirm Change'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RuleConfigurationPanel;
