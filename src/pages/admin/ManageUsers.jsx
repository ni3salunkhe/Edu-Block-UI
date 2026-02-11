/* eslint-disable react-hooks/set-state-in-effect */
import React, { useEffect, useState } from "react";
import api from "../../services/api";

const ManageUsers = () => {
    const [users, setUsers] = useState([]);

    const fetchUsers = async () => {
        try {
            const res = await api.get("/admin/users");
            setUsers(res.data);
        } catch (err) {
            console.error("Failed to fetch users", err);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const suspendUser = async (id) => {
        try {
            await api.post(`/admin/users/${id}/suspend`);
            fetchUsers();
        } catch (err) {
            console.error("Failed to suspend user", err);
        }
    };

    const activateUser = async (id) => {
        try {
            await api.post(`/admin/users/${id}/activate`);
            fetchUsers();
        } catch (err) {
            console.error("Failed to activate user", err);
        }
    };

    return (
        <div className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">
                Manage Users
            </h2>

            <table className="w-full text-left">
                <thead>
                    <tr className="border-b">
                        <th className="p-2">Username</th>
                        <th className="p-2">Role</th>
                        <th className="p-2">Status</th>
                        <th className="p-2">Action</th>
                    </tr>
                </thead>

                <tbody>
                    {users.map((u) => (
                        <tr key={u.id} className="border-b">
                            <td className="p-2">{u.username}</td>
                            <td className="p-2">{u.role}</td>
                            <td className="p-2">{u.active ? "Active" : "Suspended"}</td>
                            <td className="p-2">
                                {u.active ? (
                                    <button
                                        onClick={() => suspendUser(u.id)}
                                        className="text-red-600"
                                    >
                                        Suspend
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => activateUser(u.id)}
                                        className="text-green-600"
                                    >
                                        Activate
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ManageUsers;
