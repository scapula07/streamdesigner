import React from "react";

export default function ToolbarRight() {
  return (
    <div className="flex items-center bg-white border border-gray-200 rounded-xl shadow-sm px-2 py-1 ml-4 gap-1 h-10" style={{ minWidth: 320 }}>
      <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 text-gray-700">
        {/* Timer icon */}
        <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="13" r="8" stroke="currentColor" strokeWidth="2"/><path d="M12 9v4l2 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 5V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
      </button>
      <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 text-gray-700">
        {/* Chat icon */}
        <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/><circle cx="9" cy="10" r="1" fill="currentColor"/><circle cx="15" cy="10" r="1" fill="currentColor"/></svg>
      </button>
      <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 text-gray-700">
        {/* Video icon */}
        <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><rect x="3" y="7" width="13" height="10" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M16 9l4-2v10l-4-2V9z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/></svg>
      </button>
      <div className="flex items-center bg-gray-100 rounded-full px-2 py-1 ml-2">
        <span className="w-6 h-6 flex items-center justify-center rounded-full bg-purple-600 text-white font-bold text-sm">b</span>
        <svg className="ml-1" width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </div>
      <button className="ml-2 px-3 py-1 rounded bg-gray-100 text-gray-700 font-semibold text-xs hover:bg-gray-200 transition flex items-center">
        <svg className="mr-1" width="16" height="16" fill="none" viewBox="0 0 24 24"><polygon points="5,3 19,12 5,21" fill="currentColor"/></svg>
        Present
      </button>
      <button className="ml-2 px-3 py-1 rounded bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700 transition">Share</button>
    </div>
  );
}
