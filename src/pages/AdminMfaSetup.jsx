import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { setupAdminMFA, verifyAdminMFA } from "../services/authService";
import { useAuth } from "../auth/useAuth";

const AdminMFASetup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const mfaToken = location.state?.mfaToken;

  const [qrCode, setQrCode] = useState("");
  const [manualKey, setManualKey] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!mfaToken) {
      navigate("/login");
      return;
    }

    const fetchSetup = async () => {
      try {
        const res = await setupAdminMFA();
        setQrCode(res.data.qrCodeUrl);
        setManualKey(res.data.manualKey);
      } catch {
        setError("Failed to load MFA setup.");
      }
    };

    fetchSetup();
  }, []);

  const handleVerify = async (e) => {
    e.preventDefault();

    try {
      const res = await verifyAdminMFA({
        mfaToken,
        otp: parseInt(otp)
      });

      login(res.data.token, res.data.role);
      navigate("/admin/dashboard");

    } catch {
      setError("Invalid OTP. Please try again.");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-muted">
      <div className="bg-white p-8 rounded-lg shadow-md w-[420px]">
        <h2 className="text-xl font-semibold mb-6">
          Setup Authenticator
        </h2>

        {error && (
          <p className="text-red-500 text-sm mb-3">
            {error}
          </p>
        )}

        <div className="mb-6 text-center">
          {qrCode ? (
            <img
              src={qrCode}
              alt="Scan QR Code"
              className="mx-auto mb-4"
            />
          ) : (
            <div className="text-gray-500">
              Loading QR...
            </div>
          )}

          <p className="text-xs text-gray-500">
            Or enter manual key:
          </p>

          <p className="text-sm font-mono mt-1">
            {manualKey}
          </p>
        </div>

        <form onSubmit={handleVerify}>
          <input
            type="text"
            maxLength="6"
            placeholder="Enter OTP to confirm"
            className="w-full border p-2 rounded mb-4 text-center tracking-widest"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />

          <button
            type="submit"
            className="w-full bg-accent text-white py-2 rounded hover:opacity-90 transition"
          >
            Verify & Activate
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminMFASetup;
