import React from "react";

export default function ToolbarLeft() {
  return (
    <div className="flex items-center bg-white border border-gray-200 rounded-xl shadow-sm px-4 py-1 h-10 mr-4" style={{ minWidth: 220 }}>
      <span className="font-bold text-xl text-gray-800 mr-2">miro</span>
      <span className="text-yellow-400 text-lg mr-2">✦</span>
      <span className="font-medium text-gray-700 mr-4">My First Board</span>
      <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 text-gray-500 mr-1">
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M19 13v6a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 17V3m0 0l-4 4m4-4l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
      <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 text-gray-500">
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="19" cy="12" r="1" fill="currentColor"/><circle cx="5" cy="12" r="1" fill="currentColor"/></svg>
      </button>
      <button className="ml-3 px-3 py-1 rounded bg-gray-100 text-gray-700 font-semibold text-xs hover:bg-gray-200 transition">Upgrade</button>
    </div>
  );
}
