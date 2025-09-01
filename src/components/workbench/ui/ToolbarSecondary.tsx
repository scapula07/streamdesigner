import React from "react";

export default function ToolbarSecondary({ active, setActive }: {
  active: string,
  setActive: (tool: string) => void,
}) {
  return (
    <div className="flex items-center justify-center gap-6 px-6 py-2 bg-white border border-t-0 border-gray-200 rounded-b-xl shadow-sm" style={{ minWidth: 520, maxWidth: 700, margin: '0 auto' }}>
      {/* Only streaming, record, screenshot icons remain */}
      {/* Streaming Controls */}
      <div className="flex items-center gap-10 w-full justify-center">
        <button
          className="min-w-[110px] h-10 flex items-center justify-start rounded hover:bg-indigo-50 text-indigo-600 px-2"
          title="Start/Stop Streaming"
          onClick={() => setActive(active === "Stream" ? "" : "Stream")}
        >
          {active === "Stream" ? (
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor"/></svg>
          ) : (
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><polygon points="6,4 20,12 6,20" fill="currentColor"/></svg>
          )}
          <span className="text-xs text-slate-600 ml-2">Stream</span>
        </button>
        <button
          className="min-w-[110px] h-10 flex items-center justify-start rounded hover:bg-red-50 text-red-500 px-2"
          title="Record"
          onClick={() => setActive(active === "Record" ? "" : "Record")}
        >
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="6" fill="currentColor"/></svg>
          <span className="text-xs text-slate-600 ml-2">Record</span>
        </button>
        <button
          className="min-w-[110px] h-10 flex items-center justify-start rounded hover:bg-green-50 text-green-600 px-2"
          title="Screenshot"
          onClick={() => setActive(active === "Screenshot" ? "" : "Screenshot")}
        >
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="12" r="3" fill="currentColor"/></svg>
          <span className="text-xs text-slate-600 ml-2">Screenshot</span>
        </button>
      </div>
    </div>
  );
}
