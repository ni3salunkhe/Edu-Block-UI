import React, { useEffect, useState } from "react";
import { getInstitutionProfile, getPendingAssociations, getIssuedCredentials, getInstitutionAssociations } from "../../services/institutionService";

const InstitutionDashboard = () => {
    const [profile, setProfile] = useState(null);
    const [profileLoading, setProfileLoading] = useState(true);

    const [counts, setCounts] = useState({
        associations: 0,
        pendingRequests: 0,
        issuedCredentials: 0
    });

    useEffect(() => {
        const fetchDashboardData = async () => {
            // Fetch all data in parallel
            const results = await Promise.allSettled([
                getInstitutionProfile(),
                getPendingAssociations(),
                getIssuedCredentials(),
                getInstitutionAssociations(),
            ]);

            // 1. Profile
            if (results[0].status === "fulfilled" && results[0].value?.data) {
                setProfile(results[0].value.data);
            }
            setProfileLoading(false);

            // 2. Pending count
            let pendingCount = 0;
            if (results[1].status === "fulfilled" && results[1].value?.data) {
                pendingCount = results[1].value.data.length;
            }

            // 3. Issued count
            let issuedCount = 0;
            if (results[2].status === "fulfilled" && results[2].value?.data) {
                issuedCount = results[2].value.data.length;
            }

            // 4. Total associations count
            let totalAssociations = 0;
            if (results[3].status === "fulfilled" && results[3].value?.data) {
                totalAssociations = results[3].value.data.length;
            }

            setCounts({
                associations: totalAssociations,
                pendingRequests: pendingCount,
                issuedCredentials: issuedCount
            });
        };

        fetchDashboardData();
    }, []);

    // Status Styling Helpers
    const getStatusStyle = (status) => {
        if (status === "ACTIVE") {
            return "bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide";
        }
        return "bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide";
    };

    const getTrustLevelStyle = (level) => {
        switch (level) {
            case "ACCREDITED":
                return "bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide";
            case "VERIFIED":
                return "bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide";
            case "REGISTERED":
                return "bg-slate-50 text-slate-700 border border-slate-200 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide";
            default:
                return "bg-rose-50 text-rose-700 border border-rose-200 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide";
        }
    };

    return (
        <div className="space-y-8 max-w-5xl mx-auto p-4 sm:p-6">
            
            {/* Header section */}
            <div>
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Institution Workspace</h1>
                <p className="text-sm text-gray-500 mt-1.5">Configure institutional profiles, verify student enrollment connections, and issue academic credentials.</p>
            </div>

            {/* Profile Card Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 hover:shadow-md transition duration-300">
                {profileLoading ? (
                    <div className="flex items-center justify-center py-6 text-gray-400">
                        <svg className="animate-spin h-5 w-5 mr-3 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        Loading profile...
                    </div>
                ) : profile ? (
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <span className="text-3xl">🏛️</span>
                                <h2 className="text-2xl font-bold text-gray-900">{profile.name}</h2>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 pt-2 text-sm text-gray-600">
                                <p className="flex items-center gap-2">
                                    <span className="text-gray-400 font-medium">Accreditation Code:</span>
                                    <span className="font-mono bg-gray-50 px-2 py-0.5 rounded border text-gray-700">{profile.code}</span>
                                </p>
                                <p className="flex items-center gap-2">
                                    <span className="text-gray-400 font-medium">Official Email:</span>
                                    <span className="font-medium text-gray-800">{profile.officialEmail}</span>
                                </p>
                                {profile.city && (
                                    <p className="flex items-center gap-2">
                                        <span className="text-gray-400 font-medium">Location:</span>
                                        <span className="font-medium text-gray-800">{profile.city}{profile.state ? `, ${profile.state}` : ""}</span>
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex sm:flex-row flex-col gap-3 shrink-0 self-start md:self-center">
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider pl-1">Operational State</span>
                                <span className={getStatusStyle(profile.status)}>{profile.status}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider pl-1">Trust Status</span>
                                <span className={getTrustLevelStyle(profile.trustLevel)}>{profile.trustLevel}</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-6">
                        <div className="text-3xl mb-2">⚠️</div>
                        <p className="text-sm text-amber-700 font-semibold">Institution profile not linked.</p>
                        <p className="text-xs text-gray-500 mt-1">Contact your system administrator to map your account to an institution.</p>
                    </div>
                )}
            </div>

            {/* Metrics Row Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Metric: Student Associations */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition duration-300 flex items-center justify-between">
                    <div>
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Student Associations</h3>
                        <p className="text-3xl font-extrabold text-indigo-600 mt-2">
                            {counts.associations}
                        </p>
                    </div>
                    <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-xl text-xl font-bold select-none leading-none">
                        👥
                    </div>
                </div>

                {/* Metric: Pending Requests */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition duration-300 flex items-center justify-between">
                    <div>
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Pending Requests</h3>
                        <p className="text-3xl font-extrabold text-indigo-600 mt-2">
                            {counts.pendingRequests}
                        </p>
                    </div>
                    <div className="p-3.5 bg-amber-50 text-amber-600 rounded-xl text-xl font-bold select-none leading-none">
                        📋
                    </div>
                </div>

                {/* Metric: Issued Credentials */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition duration-300 flex items-center justify-between">
                    <div>
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Issued Credentials</h3>
                        <p className="text-3xl font-extrabold text-indigo-600 mt-2">
                            {counts.issuedCredentials}
                        </p>
                    </div>
                    <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-xl text-xl font-bold select-none leading-none">
                        🎓
                    </div>
                </div>

            </div>

        </div>
    );
};

export default InstitutionDashboard;
