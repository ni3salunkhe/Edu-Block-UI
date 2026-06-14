import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { requestConsentAccess } from "../../services/consentService";
import { showSuccess, showApiError } from "../../utils/toast";

const SearchIndividual = () => {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [requestedIds, setRequestedIds] = useState(new Set());

    const fetchIndividuals = async (searchQuery = "") => {
        try {
            setLoading(true);
            const res = await api.get(`/employer/search?query=${encodeURIComponent(searchQuery)}`);
            setResults(res.data);
        } catch (err) {
            showApiError(err, "Failed to fetch individuals.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIndividuals();
    }, []);

    const handleSearch = () => {
        fetchIndividuals(query);
    };

    const requestConsent = async (userId) => {
        try {
            await requestConsentAccess(userId);
            showSuccess("Consent request sent successfully!");
            setRequestedIds((prev) => new Set([...prev, userId]));
        } catch (err) {
            showApiError(err, "Failed to send consent request.");
        }
    };

    return (
        <div className="space-y-8 max-w-5xl mx-auto p-4 sm:p-6">
            <div>
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Find Individuals</h1>
                <p className="text-sm text-gray-500 mt-1.5">Search for credential holders and request access to view their verified documents.</p>
            </div>

            {/* Search Bar */}
            <div className="flex gap-3 max-w-2xl">
                <div className="relative flex-1">
                    <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 pointer-events-none text-sm">🔍</span>
                    <input
                        id="employer-search-input"
                        className="w-full border border-gray-200 rounded-xl pl-8 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition shadow-sm"
                        placeholder="Search by username or email…"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    />
                </div>
                <button
                    id="employer-search-btn"
                    onClick={handleSearch}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-sm transition disabled:opacity-50"
                    disabled={loading}
                >
                    {loading ? "Searching…" : "Search"}
                </button>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {results.length > 0 ? (
                    results.map((user) => {
                        const alreadyRequested = requestedIds.has(user.id);
                        return (
                            <div
                                key={user.id}
                                className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition border border-gray-100 flex flex-col items-center text-center"
                            >
                                <div className="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center mb-4 text-xl font-bold text-indigo-600">
                                    {user.username?.charAt(0)?.toUpperCase() || "U"}
                                </div>

                                <h3 className="text-base font-bold text-gray-900 mb-1">{user.username}</h3>
                                <p className="text-sm text-gray-400 mb-5">{user.email}</p>

                                <button
                                    id={`request-consent-${user.id}`}
                                    onClick={() => requestConsent(user.id)}
                                    disabled={alreadyRequested}
                                    className={`mt-auto w-full px-4 py-2.5 rounded-xl font-bold text-sm transition border flex items-center justify-center gap-2 ${
                                        alreadyRequested
                                            ? "bg-emerald-50 text-emerald-600 border-emerald-200 cursor-default"
                                            : "bg-white border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                                    }`}
                                >
                                    {alreadyRequested ? (
                                        <>✓ Requested</>
                                    ) : (
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3.75 15a2.25 2.25 0 0 1 2.25-2.25h6a2.25 2.25 0 0 1 2.25 2.25v2.85A2.25 2.25 0 0 1 12 21.75H6a2.25 2.25 0 0 1-2.25-2.25V15Z" />
                                            </svg>
                                            Request Access
                                        </>
                                    )}
                                </button>
                            </div>
                        );
                    })
                ) : (
                    !loading && (
                        <div className="col-span-full text-center py-12 text-gray-400">
                            <div className="text-4xl mb-3">🔍</div>
                            <p className="font-semibold text-gray-500 text-sm">No individuals found matching your criteria.</p>
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default SearchIndividual;
