import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

const navConfig = {
  INDIVIDUAL: [
    { name: "Dashboard", path: "/individual/dashboard", icon: "🏠" },
    { name: "My Documents", path: "/individual/documents", icon: "📄" },
    { name: "Upload Document", path: "/individual/upload", icon: "⬆️" },
    { name: "My Institutions", path: "/individual/institutions", icon: "🏛️" },
    { name: "Credential Vault", path: "/individual/vault", icon: "🏆" },
    { name: "Consents", path: "/individual/consents", icon: "🔐" },
  ],
  EMPLOYER: [
    { name: "Dashboard", path: "/employer/dashboard", icon: "🏠" },
    { name: "Hiring Intelligence", path: "/employer/intelligence", icon: "⚡" },
    { name: "Search Individual", path: "/employer/search", icon: "🔍" },
    { name: "Approved Access", path: "/employer/approved", icon: "✅" },
  ],
  VERIFIER: [
    { name: "Dashboard", path: "/verifier/dashboard", icon: "🏠" },
    { name: "Verification Queue", path: "/verifier/queue", icon: "📋" },
  ],
  ADMIN: [
    { name: "Intelligence Center", path: "/admin/intelligence", icon: "⚡" },
    { name: "Dashboard", path: "/admin/dashboard", icon: "🏠" },
    { name: "Create Verifier", path: "/admin/create", icon: "➕" },
    { name: "Manage Users", path: "/admin/users", icon: "👥" },
    { name: "Manage Institutions", path: "/admin/institutions", icon: "🏛️" },
    { name: "Audit Logs", path: "/admin/audit", icon: "📜" },
  ],
  INSTITUTION: [
    { name: "Dashboard", path: "/institution/dashboard", icon: "🏠" },
    { name: "Intelligence Portal", path: "/institution/intelligence", icon: "⚡" },
    { name: "Student Associations", path: "/institution/students", icon: "👥" },
    { name: "Credential Center", path: "/institution/credentials", icon: "🎓" },
    { name: "Issued Credentials", path: "/institution/issued", icon: "📜" },
  ],
};

/**
 * SideNav
 * - Desktop (lg+): always visible on the left, fixed width
 * - Mobile (<lg):  hidden by default, slides in from left as a drawer
 *                  controlled by parent via `isOpen` + `onClose` props
 */
const SideNav = ({ isOpen, onClose }) => {
  const { role, user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = navConfig[role] || [];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      {/*
        The sidebar itself.
        - On lg+: static left column (translate-x-0 always).
        - On mobile: positioned fixed, slides in/out with translate-x.
      */}
      <aside
        className={`
          fixed top-0 left-0 z-30 h-full w-72 bg-white border-r border-gray-200
          flex flex-col shadow-xl
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:static lg:translate-x-0 lg:w-64 lg:shadow-none lg:z-auto
        `}
      >
        {/* ── Header: close button (mobile) + user info ── */}
        <div className="p-5 border-b border-gray-100 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg shrink-0">
              {user?.username?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-gray-800 truncate max-w-[140px] text-sm">
                {user?.username || "User"}
              </p>
              <p className="text-xs text-gray-400 capitalize">
                {role ? role.toLowerCase() : "Guest"}
              </p>
            </div>
          </div>

          {/* Close button — mobile only */}
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
            aria-label="Close menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ── Nav Links ── */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={onClose}   /* close drawer on mobile after navigation */
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive
                  ? "bg-blue-50 text-blue-700 font-semibold"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`
              }
            >
              <span className="text-base leading-none">{item.icon}</span>
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* ── Logout ── */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center w-full gap-2 px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default SideNav;
