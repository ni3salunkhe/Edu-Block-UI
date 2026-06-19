import React, { useEffect, useState } from 'react';
import institutionIntelligenceService from '../../../services/institutionIntelligenceService';
import { showApiError } from '../../../utils/toast';

const TrustTimeline = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await institutionIntelligenceService.getTrustHistory();
                setHistory(data);
            } catch (err) {
                showApiError(err, "Failed to load Trust Timeline");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="p-4 text-gray-500">Loading Trust Timeline...</div>;

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Trust Timeline</h2>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
                {history.length === 0 ? (
                    <div className="text-gray-400 italic">No trust history events recorded yet.</div>
                ) : (
                    <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-600 before:to-transparent">
                        {history.map((event, idx) => (
                            <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-gray-50 text-gray-400 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                                    <span className="text-xs font-bold">{event.newScore}</span>
                                </div>
                                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-gray-50 p-4 rounded-xl border border-gray-200 shadow">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="font-bold text-gray-900">{event.changeReason}</div>
                                        <time className="font-mono text-xs text-gray-500">{new Date(event.timestamp).toLocaleDateString()}</time>
                                    </div>
                                    <div className="text-sm text-gray-700">
                                        Trust score changed from <span className="font-bold text-gray-500">{event.previousScore}</span> to <span className="font-bold text-blue-600">{event.newScore}</span>.
                                        <br />
                                        <span className="text-xs text-gray-400 mt-1 block">Triggered by: {event.triggerSource}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrustTimeline;
