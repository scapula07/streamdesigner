import React from "react";
import SettingsSidebar from "@/components/settings/SettingsSidebar";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex bg-white min-h-screen">
      <SettingsSidebar />
      <main className="flex-1 flex flex-col px-12 py-12 h-full">{children}</main>
    </div>
  );
}
