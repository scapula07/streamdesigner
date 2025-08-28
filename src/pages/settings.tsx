import React from "react";
import SettingsSidebar from "@/components/settings/SettingsSidebar";
import SettingsGeneral from "@/components/settings/SettingsGeneral";

export default function SettingsPage() {
  return (
    <div className="min-h-screen flex bg-white">
      <SettingsSidebar />
      <main className="flex-1 flex flex-col px-12 py-12 bg-white">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">General</h1>
        <SettingsGeneral />
      </main>
    </div>
  );
}
