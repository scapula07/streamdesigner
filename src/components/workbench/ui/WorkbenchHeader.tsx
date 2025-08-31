import React from "react";
import Image from "next/image";

export default function WorkbenchHeader() {
  return (
    <header className="flex items-center justify-between px-6 py-2 bg-white border-b border-gray-200 h-16">
      {/* Left: Logo and nav */}
      <div className="flex items-center gap-6">
        <Image src="/logo.svg" alt="Logo" width={32} height={32} className="mr-2" />
        <nav className="flex items-center gap-2">
          <button className="px-3 py-1 rounded text-sm font-semibold text-gray-700 hover:bg-gray-100 focus:bg-gray-100">Dashboard</button>
          <button className="px-3 py-1 rounded text-sm font-semibold text-gray-700 hover:bg-gray-100 focus:bg-gray-100">Teammate</button>
          <button className="px-3 py-1 rounded text-sm font-semibold text-gray-700 hover:bg-gray-100 focus:bg-gray-100">Share</button>
          <button className="px-3 py-1 rounded text-sm font-semibold text-gray-700 hover:bg-gray-100 focus:bg-gray-100">Contact</button>
        </nav>
      </div>
      {/* Right: User and share */}
      <div className="flex items-center gap-4">
        <button className="px-4 py-1 rounded bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition">Share</button>
        <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold text-white">
          B
        </div>
      </div>
    </header>
  );
}
