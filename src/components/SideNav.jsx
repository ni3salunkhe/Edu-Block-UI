import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

const navConfig = {
  INDIVIDUAL: [
    { name: "Dashboard", path: "/individual/dashboard" },
    { name: "My Documents", path: "/individual/documents" },
    { name: "Upload Document", path: "/individual/upload" },
    { name: "Consents", path: "/individual/consents" }
  ],
  EMPLOYER: [
    { name: "Dashboard", path: "/employer/dashboard" },
    { name: "Search Individual", path: "/employer/search" },
    { name: "Approved Access", path: "/employer/approved" }
  ],
  VERIFIER: [
    { name: "Dashboard", path: "/verifier/dashboard" },
    { name: "Verification Queue", path: "/verifier/queue" }
  ],
  ADMIN: [
    { name: "Dashboard", path: "/admin/dashboard" },
    { name: "Create Verifier", path: "/admin/create" },
    { name: "Manage Users", path: "/admin/users" },
    { name: "Audit Logs", path: "/admin/audit" }
  ]
};

const SideNav = () => {
  const { role, user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = navConfig[role] || [];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-full flex flex-col">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
            {user?.username?.charAt(0).toUpperCase() || "U"}
          </div>
          <div>
            <p className="font-semibold text-gray-800 truncate max-w-[140px]">
              {user?.username || "User"}
            </p>
            <p className="text-xs text-gray-500 capitalize">
              {role ? role.toLowerCase() : "Guest"}
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive
                ? "bg-blue-50 text-blue-600"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`
            }
          >
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5 mr-2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
            />
          </svg>
          Logout
        </button>
      </div>
    </aside>
  );
};

export default SideNav;
