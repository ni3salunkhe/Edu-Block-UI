import React from "react";
import { Outlet } from "react-router-dom";
import TopNav from "../components/TopNav";
import SideNav from "../components/SideNav";

const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <TopNav onMenuClick={() => setSidebarOpen(true)} />

      <div className="flex flex-1 overflow-hidden relative">

        {/* ── Overlay (mobile only) ── */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-20 bg-black bg-opacity-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── Sidebar ── */}
        <SideNav isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* ── Main Content ── */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
