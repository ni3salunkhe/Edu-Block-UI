import React from "react";
import { useNavigate } from "react-router-dom";

const Unauthorized = () => {
    const navigate = useNavigate();

    return (
        <div className="h-screen flex items-center justify-center bg-muted">
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <h2 className="text-xl font-semibold mb-4">
                    Access Denied
                </h2>
                <p className="text-gray-600 mb-6">
                    You do not have permission to access this resource.
                </p>
                <button
                    onClick={() => navigate("/")}
                    className="bg-accent text-white px-4 py-2 rounded"
                >
                    Go Back
                </button>
            </div>
        </div>
    );
};

export default Unauthorized;
