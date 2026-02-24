/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { loginRequest } from "../services/authService";
import { useLoading } from "../context/LoadingContext";
import { validate, required, minLength } from "../utils/validate";
import { showSuccess, showApiError } from "../utils/toast";

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const { showLoading, hideLoading } = useLoading();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!validate([
            required(username, "Username"),
            minLength(username, 3, "Username"),
            required(password, "Password"),
        ])) return;

        showLoading();
        try {
            const res = await loginRequest({ username: username.trim(), password: password.trim() });

            if (res.data.mfaSetupRequired) {
                navigate("/admin/mfa/setup", { state: { mfaToken: res.data.mfaToken } });
                return;
            }
            if (res.data.mfaRequired) {
                navigate("/admin/mfa", { state: { mfaToken: res.data.mfaToken } });
                return;
            }

            login(res.data.token, res.data.role);
            showSuccess("Login successful! Welcome back.");

            const role = res.data.role;
            if (role === "INDIVIDUAL") navigate("/individual/dashboard");
            else if (role === "EMPLOYER") navigate("/employer/dashboard");
            else if (role === "VERIFIER") navigate("/verifier/dashboard");
            else if (role === "ADMIN") navigate("/admin/dashboard");
            else navigate("/");

        } catch (err) {
            showApiError(err, "Login failed. Please check your credentials.");
        } finally {
            hideLoading();
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
            <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8">
                {/* Logo / Brand */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">EduBlock</h1>
                    <p className="text-sm text-gray-500 mt-1">Sign in to your account</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5" noValidate>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Username
                        </label>
                        <input
                            type="text"
                            placeholder="Enter your username"
                            className="w-full border border-gray-300 px-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            autoComplete="username"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            placeholder="Enter your password"
                            className="w-full border border-gray-300 px-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold py-3 rounded-lg text-sm transition"
                    >
                        Sign In
                    </button>

                    <p className="text-center text-sm text-gray-600">
                        Don&apos;t have an account?{" "}
                        <Link to="/register" className="text-blue-600 font-medium hover:underline">
                            Create one
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;
