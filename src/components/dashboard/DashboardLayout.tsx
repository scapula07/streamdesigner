import React from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-white">
      <Sidebar />
      <div className="flex-1 flex flex-col bg-white">
        <Topbar />
        <div className="flex flex-1 bg-white">
          <div className="flex-1 flex flex-col bg-white">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
