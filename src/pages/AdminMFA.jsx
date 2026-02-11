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

        try {
            const res = await verifyAdminMFA({
                mfaToken,
                otp: parseInt(otp)
            });

            login(res.data.token, res.data.role);
            navigate("/admin/dashboard");

        } catch (err) {
            setError("Invalid or expired OTP");
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
