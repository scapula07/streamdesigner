import React from "react";

export default function Topbar() {
  return (
    <header className="flex items-center justify-between px-8 py-4 border-b border-gray-200 bg-white text-gray-900">
      <div className="text-2xl font-bold"></div>
      <div className="flex items-center gap-2">
        <button className="px-4 py-2 bg-gray-900 rounded text-sm font-medium text-white hover:bg-black transition">Buy More Credits</button>
      </div>
    </header>
  );
}
