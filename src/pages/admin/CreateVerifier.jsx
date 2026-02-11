import React, { useState } from "react";
import api from "../../services/api";

const CreateVerifier = () => {
    const [form, setForm] = useState({
        username: "",
        email: "",
        password: "",
        authorityName: "",
        jurisdiction: ""
    });

    const [message, setMessage] = useState("");

    const validate = () => {
        if (!form.username || !form.email || !form.password || !form.authorityName || !form.jurisdiction)
            return "All fields required";

        if (form.password.length < 8)
            return "Password must be at least 8 characters";

        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const error = validate();
        if (error) {
            setMessage(error);
            return;
        }

        try {
            await api.post("/admin/verifiers",
                {
                    authorityName: form.authorityName,
                    jurisdiction: form.jurisdiction
                },
                {
                    params: {
                        username: form.username,
                        email: form.email,
                        password: form.password
                    }
                }
            );
            setMessage("Verifier created successfully");
            setForm({ username: "", email: "", password: "", authorityName: "", jurisdiction: "" });
        } catch (err) {
            console.error(err);
            setMessage("Creation failed");
        }
    };

    return (
        <div className="bg-white p-8 rounded shadow max-w-lg">
            <h2 className="text-xl font-semibold mb-6">
                Create Verifier
            </h2>

            {message && (
                <p className="mb-4 text-sm text-red-500">{message}</p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    className="w-full border p-2 rounded"
                    placeholder="Username"
                    value={form.username}
                    onChange={(e) =>
                        setForm({ ...form, username: e.target.value })
                    }
                />

                <input
                    className="w-full border p-2 rounded"
                    placeholder="Email"
                    value={form.email}
                    onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                    }
                />

                <input
                    type="password"
                    className="w-full border p-2 rounded"
                    placeholder="Password"
                    value={form.password}
                    onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                    }
                />

                <input
                    className="w-full border p-2 rounded"
                    placeholder="Authority Name (e.g., John Doe)"
                    value={form.authorityName}
                    onChange={(e) =>
                        setForm({ ...form, authorityName: e.target.value })
                    }
                />

                <input
                    className="w-full border p-2 rounded"
                    placeholder="Jurisdiction"
                    value={form.jurisdiction}
                    onChange={(e) =>
                        setForm({ ...form, jurisdiction: e.target.value })
                    }
                />

                <button
                    type="submit"
                    className="bg-accent text-white px-4 py-2 rounded"
                >
                    Create
                </button>
            </form>
        </div>
    );
};

export default CreateVerifier;
