import React, { useEffect, useState } from "react";
import api from "../../services/api";

const SearchIndividual = () => {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const fetchIndividuals = async (searchQuery = "") => {
        try {
            setLoading(true);
            // If query is empty, this endpoint should return all individuals
            // or a default list. Adjust based on backend behavior.
            const res = await api.get(`/employer/search?query=${searchQuery}`);
            setResults(res.data);
            setMessage("");
        } catch (err) {
            console.error("Search failed", err);
            setMessage("Failed to fetch individuals");
        } finally {
            setLoading(false);
        }
    };

    // Fetch all on mount
    useEffect(() => {
        fetchIndividuals();
    }, []);

    const handleSearch = () => {
        fetchIndividuals(query);
    };

    const requestConsent = async (userId) => {
        try {
            await api.post("/consent/request", {
                individualId: userId
            });
            alert("Consent request sent successfully!");
            // Optionally refresh list or update UI state
        } catch (err) {
            console.error("Request failed", err);
            alert("Failed to send consent request");
        }
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
                Find Individuals
            </h2>

            {/* Search Bar */}
            <div className="flex gap-4 mb-8 max-w-2xl">
                <input
                    className="border p-3 flex-1 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Search by username or email..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button
                    onClick={handleSearch}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium shadow-sm transition"
                    disabled={loading}
                >
                    {loading ? "Searching..." : "Search"}
                </button>
            </div>

            {message && (
                <p className="text-red-500 mb-4 bg-red-50 p-3 rounded border border-red-200">
                    {message}
                </p>
            )}

            {/* Card Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.length > 0 ? (
                    results.map((user) => (
                        <div
                            key={user.id}
                            className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition border border-gray-100 flex flex-col items-center text-center"
                        >
                            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4 text-2xl font-bold text-gray-500">
                                {user.username.charAt(0).toUpperCase()}
                            </div>

                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                {user.username}
                            </h3>
                            <p className="text-sm text-gray-500 mb-6">
                                {user.email}
                            </p>

                            <button
                                onClick={() => requestConsent(user.id)}
                                className="mt-auto w-full bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg font-medium transition flex items-center justify-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3.75 15a2.25 2.25 0 0 1 2.25-2.25h6a2.25 2.25 0 0 1 2.25 2.25v2.85A2.25 2.25 0 0 1 12 21.75H6a2.25 2.25 0 0 1-2.25-2.25V15Z" />
                                </svg>
                                Request Access
                            </button>
                        </div>
                    ))
                ) : (
                    !loading && (
                        <div className="col-span-full text-center text-gray-500 py-10">
                            No individuals found matching your criteria.
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default SearchIndividual;
