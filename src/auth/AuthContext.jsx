// eslint-disable-next-line no-unused-vars
import React, { createContext, useState, useEffect } from "react";

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(
        localStorage.getItem("token")
    );
    const [role, setRole] = useState(
        localStorage.getItem("role")
    );

    const login = (jwt, userRole) => {
        localStorage.setItem("token", jwt);
        localStorage.setItem("role", userRole);
        setToken(jwt);
        setRole(userRole);
    };

    const logout = () => {
        localStorage.clear();
        setToken(null);
        setRole(null);
    };

    return (
        <AuthContext.Provider
            value={{ token, role, login, logout }}
        >
            {children}
        </AuthContext.Provider>
    );
};
