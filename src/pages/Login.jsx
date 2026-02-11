/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { loginRequest } from "../services/authService";
import { useLoading } from "../context/LoadingContext";

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const { showLoading, hideLoading } = useLoading();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(""); // Clear previous errors
        showLoading();

        try {
            const payload = {
                username: username.trim(),
                password: password.trim()
            };



            const res = await loginRequest(payload);

            if (res.data.mfaSetupRequired) {
                navigate("/admin/mfa/setup", {
                    state: { mfaToken: res.data.mfaToken }
                });
                return;
            }

            if (res.data.mfaRequired) {
                navigate("/admin/mfa", {
                    state: { mfaToken: res.data.mfaToken }
                });
                return;
            }


            login(res.data.token, res.data.role);

            // Redirect based on role
            const role = res.data.role;
            if (role === "INDIVIDUAL") {
                navigate("/individual/dashboard");
            } else if (role === "EMPLOYER") {
                navigate("/employer/dashboard");
            } else if (role === "VERIFIER") {
                navigate("/verifier/dashboard");
            } else if (role === "ADMIN") {
                navigate("/admin/dashboard");
            } else {
                navigate("/"); // Fallback
            }

        } catch (err) {
            console.error("Login error:", err);
            if (err.response && err.response.data) {
                // Try to display the server's error message
                setError(err.response.data.message || err.response.data || "Login failed");
            } else if (err.request) {
                setError("No response from server. Check if backend is running.");
            } else {
                setError("An error occurred. Please try again.");
            }
        } finally {
            hideLoading();
        }
    };

    return (
        <div className="h-screen flex items-center justify-center bg-muted">
            <form
                onSubmit={handleLogin}
                className="bg-white p-8 rounded-lg shadow-md w-96"
            >
                <h2 className="text-xl font-semibold mb-6">
                    Login
                </h2>

                {error && (
                    <p className="text-red-500 text-sm mb-3">
                        {error}
                    </p>
                )}

                <input
                    type="text"
                    placeholder="Username"
                    className="w-full border p-2 rounded mb-4"
                    value={username}
                    onChange={(e) =>
                        setUsername(e.target.value)
                    }
                />

                <input
                    type="password"
                    placeholder="Password"
                    className="w-full border p-2 rounded mb-6"
                    value={password}
                    onChange={(e) =>
                        setPassword(e.target.value)
                    }
                />

                <button
                    type="submit"
                    className="w-full bg-accent text-white py-2 rounded hover:opacity-90 transition"
                >
                    Login
                </button>
                <div className="text-center mt-4">
                    <p className="text-sm text-gray-600">
                        Don't have an account?{' '}
                        <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
                            Create new account
                        </Link>
                    </p>
                </div>
            </form>

        </div>
    );
};

export default Login;
