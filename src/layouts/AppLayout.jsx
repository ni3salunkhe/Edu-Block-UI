import React from "react";
import { Outlet } from "react-router-dom";
import TopNav from "../components/TopNav";
import SideNav from "../components/SideNav";

const AppLayout = () => {
  return (
    <div className="h-screen flex flex-col bg-muted">
      <TopNav />

      <div className="flex flex-1 overflow-hidden">
        <SideNav />

        <main className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
