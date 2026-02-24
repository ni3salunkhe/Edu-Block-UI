import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { verifyAdminMFA } from "../services/authService";

const AdminMFA = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { login } = useAuth();

    const mfaToken = location.state?.mfaToken;
    const [otp, setOtp] = useState("");
    const [error, setError] = useState("");

    if (!mfaToken) {
        // If accessed directly without token, redirect to login
        // Using useEffect to avoid side-effects in render
        React.useEffect(() => {
            navigate("/login");
        }, [navigate]);
        return null;
    }

    const handleVerify = async (e) => {
        e.preventDefault();
        setError(""); // Clear previous errors

        try {
            console.log("Verifying MFA with token:", mfaToken);
            const res = await verifyAdminMFA({
                mfaToken,
                otp: parseInt(otp)
            });

            console.log("=== MFA VERIFICATION RESPONSE DEBUG ===");
            console.log("Full response object:", res);
            console.log("Response data:", res.data);
            console.log("Response status:", res.status);
            console.log("Response headers:", res.headers);

            // Check different possible response structures
            const token = res.data?.token || res.data?.jwt || res.token;
            const userRole = res.data?.role || res.data?.userRole || res.role;

            console.log("Extracted token:", token);
            console.log("Extracted role:", userRole);

            if (!token || !userRole) {
                console.error("ERROR: Token or role missing from response!");
                console.log("Available keys in res.data:", Object.keys(res.data || {}));
                setError("Login successful but token not received. Please contact support.");
                return;
            }

            login(token, userRole);

            console.log("After login - localStorage token:", localStorage.getItem("token"));
            console.log("After login - localStorage role:", localStorage.getItem("role"));

            navigate("/admin/dashboard");

        } catch (err) {
            console.error("MFA verification error:", err);
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else if (err.response?.status === 401) {
                setError("Invalid or expired OTP. Please try again.");
            } else if (err.response?.status === 400) {
                setError("Invalid OTP format. Please enter a 6-digit code.");
            } else {
                setError("Verification failed. Please try again.");
            }
        }
    };

    return (
        <div className="h-screen flex items-center justify-center bg-muted">
            <form
                onSubmit={handleVerify}
                className="bg-white p-8 rounded-lg shadow-md w-96"
            >
                <h2 className="text-xl font-semibold mb-6">
                    Admin MFA Verification
                </h2>

                {error && (
                    <p className="text-red-500 text-sm mb-3">
                        {error}
                    </p>
                )}

                <input
                    type="text"
                    maxLength="6"
                    placeholder="Enter 6-digit OTP"
                    className="w-full border p-2 rounded mb-6 text-center tracking-widest"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                />

                <button
                    type="submit"
                    className="w-full bg-accent text-white py-2 rounded hover:opacity-90 transition"
                >
                    Verify
                </button>
            </form>
        </div>
    );
};

export default AdminMFA;
