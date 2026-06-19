import React, { useEffect, useState } from 'react';
import employerIntelligenceService from '../../../services/employerIntelligenceService';
import { showApiError } from '../../../utils/toast';

const EmployerTrustDashboard = () => {
    const [overview, setOverview] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOverview = async () => {
            try {
                const data = await employerIntelligenceService.getOverview();
                setOverview(data);
            } catch (err) {
                showApiError(err, "Failed to load Trust Dashboard");
            } finally {
                setLoading(false);
            }
        };
        fetchOverview();
    }, []);

    if (loading) return <div className="p-4 text-gray-500">Loading Employer Trust Dashboard...</div>;
    if (!overview) return null;

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Employer Trust Dashboard</h2>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center items-center">
                    <span className="text-xs uppercase font-bold text-gray-500 mb-2">Candidates Reviewed</span>
                    <span className="text-4xl font-black text-indigo-600">{overview.candidatesReviewed}</span>
                </div>
                
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center items-center">
                    <span className="text-xs uppercase font-bold text-gray-500 mb-2">Verification Requests</span>
                    <span className="text-4xl font-black text-blue-600">{overview.verificationRequests}</span>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center items-center">
                    <span className="text-xs uppercase font-bold text-gray-500 mb-2">Approved Accesses</span>
                    <span className="text-4xl font-black text-emerald-600">{overview.approvedAccesses}</span>
                </div>
            </div>

            <h3 className="text-lg font-bold text-gray-900 mt-8 mb-4">Candidate Risk Profile</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center items-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-emerald-500/10 blur-xl"></div>
                    <span className="relative z-10 text-xs uppercase font-bold text-emerald-500 mb-2">High Trust Candidates</span>
                    <span className="relative z-10 text-3xl font-black text-gray-900">{overview.highTrustCandidates}</span>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center items-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-orange-500/10 blur-xl"></div>
                    <span className="relative z-10 text-xs uppercase font-bold text-orange-500 mb-2">Medium Risk Candidates</span>
                    <span className="relative z-10 text-3xl font-black text-gray-900">{overview.mediumRiskCandidates}</span>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center items-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-red-500/10 blur-xl"></div>
                    <span className="relative z-10 text-xs uppercase font-bold text-red-500 mb-2">High Risk Candidates</span>
                    <span className="relative z-10 text-3xl font-black text-gray-900">{overview.highRiskCandidates}</span>
                </div>
            </div>
        </div>
    );
};

export default EmployerTrustDashboard;
