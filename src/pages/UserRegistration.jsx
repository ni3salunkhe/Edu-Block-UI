import React, { useState } from 'react';
import api from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import { useLoading } from '../context/LoadingContext';
import { validate, required, isEmail, minLength, passwordStrength, passwordsMatch } from '../utils/validate';
import { showSuccess, showApiError } from '../utils/toast';

const UserRegistration = () => {
    const [role, setRole] = useState('INDIVIDUAL');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { showLoading, hideLoading } = useLoading();

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        dob: '',
        phone: '',
        address: '',
        companyName: '',
        companyDomain: '',
        registrationNumber: '',
        institutionName: '',
        accreditationId: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Common validations
        const commonRules = [
            required(formData.username, "Username"),
            minLength(formData.username, 3, "Username"),
            required(formData.email, "Email"),
            isEmail(formData.email),
            required(formData.password, "Password"),
            passwordStrength(formData.password),
            passwordsMatch(formData.password, formData.confirmPassword),
        ];

        // Role-specific validations
        const roleRules = role === 'INDIVIDUAL'
            ? [required(formData.fullName, "Full Name"), required(formData.dob, "Date of Birth")]
            : role === 'EMPLOYER'
                ? [required(formData.companyName, "Company Name"), required(formData.registrationNumber, "Registration Number")]
                : [required(formData.institutionName, "Institution Name"), required(formData.accreditationId, "Accreditation ID")];

        if (!validate([...commonRules, ...roleRules])) return;

        setLoading(true);
        showLoading();

        const params = new URLSearchParams({
            username: formData.username,
            email: formData.email,
            password: formData.password
        }).toString();

        let endpoint = '';
        let body = {};

        if (role === 'INDIVIDUAL') {
            endpoint = `/users/register/individual?${params}`;
            body = { fullName: formData.fullName, dob: formData.dob, phone: formData.phone, address: formData.address };
        } else if (role === 'EMPLOYER') {
            endpoint = `/users/register/employer?${params}`;
            body = { companyName: formData.companyName, companyDomain: formData.companyDomain, registrationNumber: formData.registrationNumber };
        } else if (role === 'INSTITUTION') {
            endpoint = `/users/register/institution?${params}`;
            body = { institutionName: formData.institutionName, accreditationId: formData.accreditationId };
        }

        try {
            await api.post(endpoint, body);
            showSuccess('Registration successful! Redirecting to login...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (error) {
            showApiError(error, 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
            hideLoading();
        }
    };

    const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition";
    const labelCls = "block text-sm font-medium text-gray-700 mb-1";

    return (
        <div className="min-h-screen bg-gray-50 flex items-start justify-center py-10 px-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 sm:p-8 space-y-6">

                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900">Create an Account</h2>
                    <p className="text-sm text-gray-500 mt-1">Select your account type to get started</p>
                </div>

                {/* Role Tabs */}
                <div className="flex rounded-lg overflow-hidden border border-gray-200">
                    {['INDIVIDUAL', 'EMPLOYER', 'INSTITUTION'].map((r) => (
                        <button
                            key={r}
                            type="button"
                            onClick={() => setRole(r)}
                            className={`flex-1 py-2.5 text-xs font-semibold transition ${role === r
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            {r.charAt(0) + r.slice(1).toLowerCase()}
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                    {/* Common Fields */}
                    <div>
                        <label className={labelCls}>Username</label>
                        <input name="username" type="text" className={inputCls} placeholder="Choose a username" value={formData.username} onChange={handleChange} />
                    </div>
                    <div>
                        <label className={labelCls}>Email</label>
                        <input name="email" type="email" className={inputCls} placeholder="you@example.com" value={formData.email} onChange={handleChange} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className={labelCls}>Password</label>
                            <input name="password" type="password" className={inputCls} placeholder="Min 8 characters" value={formData.password} onChange={handleChange} />
                        </div>
                        <div>
                            <label className={labelCls}>Confirm Password</label>
                            <input name="confirmPassword" type="password" className={inputCls} placeholder="Repeat password" value={formData.confirmPassword} onChange={handleChange} />
                        </div>
                    </div>

                    {/* Role-specific Fields */}
                    <div className="border-t pt-4">
                        <h3 className="text-sm font-semibold text-gray-800 mb-3">
                            {role === 'INDIVIDUAL' && 'Personal Details'}
                            {role === 'EMPLOYER' && 'Company Details'}
                            {role === 'INSTITUTION' && 'Institution Details'}
                        </h3>

                        {role === 'INDIVIDUAL' && (
                            <div className="space-y-4">
                                <div>
                                    <label className={labelCls}>Full Name</label>
                                    <input name="fullName" type="text" className={inputCls} placeholder="As on official documents" onChange={handleChange} />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelCls}>Date of Birth</label>
                                        <input name="dob" type="date" className={inputCls} onChange={handleChange} />
                                    </div>
                                    <div>
                                        <label className={labelCls}>Phone (optional)</label>
                                        <input name="phone" type="tel" className={inputCls} placeholder="+91 xxxxxxxx" onChange={handleChange} />
                                    </div>
                                </div>
                                <div>
                                    <label className={labelCls}>Address (optional)</label>
                                    <textarea name="address" rows="2" className={inputCls} onChange={handleChange} />
                                </div>
                            </div>
                        )}

                        {role === 'EMPLOYER' && (
                            <div className="space-y-4">
                                <div>
                                    <label className={labelCls}>Company Name</label>
                                    <input name="companyName" type="text" className={inputCls} onChange={handleChange} />
                                </div>
                                <div>
                                    <label className={labelCls}>Company Domain (optional)</label>
                                    <input name="companyDomain" type="text" className={inputCls} placeholder="example.com" onChange={handleChange} />
                                </div>
                                <div>
                                    <label className={labelCls}>Registration Number</label>
                                    <input name="registrationNumber" type="text" className={inputCls} onChange={handleChange} />
                                </div>
                            </div>
                        )}

                        {role === 'INSTITUTION' && (
                            <div className="space-y-4">
                                <div>
                                    <label className={labelCls}>Institution Name</label>
                                    <input name="institutionName" type="text" className={inputCls} onChange={handleChange} />
                                </div>
                                <div>
                                    <label className={labelCls}>Accreditation ID</label>
                                    <input name="accreditationId" type="text" className={inputCls} onChange={handleChange} />
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg text-sm transition"
                    >
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>

                    <p className="text-center text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link to="/login" className="text-blue-600 font-medium hover:underline">Sign in</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default UserRegistration;
