import React, { useState } from "react";

export default function GenerationHistory({workspace}: {workspace: any}) {
  const [open, setOpen] = useState(false);

  // Dummy images for illustration
  const images = [
    "https://placehold.co/48x48/eee/green?text=1",
    "https://placehold.co/48x48/eee/green?text=2",
    "https://placehold.co/48x48/eee/gray?text=3",
    "https://placehold.co/48x48/eee/gray?text=4",
    "https://placehold.co/48x48/eee/gray?text=5",
    "https://placehold.co/48x48/eee/gray?text=6",
  ];

  return (
    <div className="absolute left-0 bottom-0 mb-6 ml-2 z-30">
      {/* Collapsed bar */}
      {!open && (
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white shadow border border-gray-200 hover:bg-gray-50 transition group"
          onClick={() => setOpen(true)}
        >
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" className="text-gray-500"><circle cx="12" cy="12" r="10" stroke="#6366F1" strokeWidth="2" fill="none"/><path d="M12 8v4l2 2" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span className="text-gray-800 font-medium text-sm">Generation History</span>
        </button>
      )}
      {/* Expanded card */}
      {open && (
        <div className="w-80 bg-white rounded-2xl shadow-xl border border-gray-200 p-4 animate-fade-in flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" className="text-gray-500"><circle cx="12" cy="12" r="10" stroke="#6366F1" strokeWidth="2" fill="none"/><path d="M12 8v4l2 2" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span className="text-gray-800 font-medium text-base">Generation History</span>
            </div>
            <button onClick={() => setOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M6 6l12 12M6 18L18 6" stroke="#6B7280" strokeWidth="2" strokeLinecap="round"/></svg>
            </button>
          </div>
          <div className="grid grid-cols-4 gap-2 mb-4">
            {images.map((img, i) => (
              <img key={i} src={img} alt="history" className="w-12 h-12 rounded object-cover border border-gray-200" />
            ))}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 text-gray-500">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 text-gray-500">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>
            <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 text-gray-500">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" stroke="#6B7280" strokeWidth="2" strokeLinecap="round"/></svg>
            </button>
            <button className="ml-auto px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition">Add</button>
          </div>
        </div>
      )}
    </div>
  );
}
