import React from "react";
import RiskBadge from "./RiskBadge";

const FraudSignalsPanel = ({ fraudSignals = [] }) => {
    const counts = {
        CRITICAL: 0,
        HIGH: 0,
        MEDIUM: 0,
        LOW: 0
    };

    fraudSignals.forEach(sig => {
        const sev = (sig.severity || "LOW").toUpperCase();
        if (counts[sev] !== undefined) {
            counts[sev]++;
        } else {
            counts.LOW++;
        }
    });

    return (
        <div className="space-y-6">
            {/* Severity Counts Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-red-50 border border-red-100 p-4 rounded-xl shadow-sm text-center">
                    <h5 className="text-red-500 font-semibold text-xs uppercase tracking-wider">Critical Signals</h5>
                    <p className="text-2xl font-black text-red-700 mt-1">{counts.CRITICAL}</p>
                </div>
                <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl shadow-sm text-center">
                    <h5 className="text-rose-500 font-semibold text-xs uppercase tracking-wider">High Signals</h5>
                    <p className="text-2xl font-black text-rose-700 mt-1">{counts.HIGH}</p>
                </div>
                <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl shadow-sm text-center">
                    <h5 className="text-orange-500 font-semibold text-xs uppercase tracking-wider">Medium Signals</h5>
                    <p className="text-2xl font-black text-orange-700 mt-1">{counts.MEDIUM}</p>
                </div>
                <div className="bg-green-50 border border-green-100 p-4 rounded-xl shadow-sm text-center">
                    <h5 className="text-green-500 font-semibold text-xs uppercase tracking-wider">Low Signals</h5>
                    <p className="text-2xl font-black text-green-700 mt-1">{counts.LOW}</p>
                </div>
            </div>

            {/* Signals Table */}
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                    <h4 className="font-semibold text-gray-800">Fraud Signals Details</h4>
                    <span className="text-xs text-gray-500">{fraudSignals.length} Active Alerts</span>
                </div>

                {fraudSignals.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 text-sm">
                        No fraud signals detected. Document passes all core static rules.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 text-gray-400 font-medium uppercase bg-gray-50">
                                    <th className="p-3">Severity</th>
                                    <th className="p-3">Signal Type</th>
                                    <th className="p-3">Description</th>
                                    <th className="p-3">Evidence</th>
                                </tr>
                            </thead>
                            <tbody>
                                {fraudSignals.map((sig, idx) => (
                                    <tr key={sig.id || idx} className="border-b border-gray-50 hover:bg-gray-50/50">
                                        <td className="p-3 align-top">
                                            <RiskBadge riskLevel={sig.severity} />
                                        </td>
                                        <td className="p-3 align-top font-bold text-gray-800">
                                            {sig.signalType}
                                        </td>
                                        <td className="p-3 align-top text-gray-600">
                                            {sig.description}
                                        </td>
                                        <td className="p-3 align-top text-gray-500">
                                            <pre className="whitespace-pre-wrap font-mono text-[10px] bg-gray-50 p-2 rounded border border-gray-100 max-h-40 overflow-y-auto">
                                                {typeof sig.evidenceJson === "string" ? sig.evidenceJson : JSON.stringify(sig.evidenceJson, null, 2)}
                                            </pre>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FraudSignalsPanel;
