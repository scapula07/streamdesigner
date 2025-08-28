import React from "react";

interface PreviewProps {
  activeTab: string;
}

export default function Preview({ activeTab }: PreviewProps) {
  return (
    <>
      {/* Tabs */}
      <div className="flex gap-2 px-4 py-2 border-b">
        <button className={`px-3 py-1 rounded-t ${activeTab === "sketch" ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-500"}`}>Sketch</button>
        <button className={`px-3 py-1 rounded-t ${activeTab === "mockup" ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-500"}`}>Mockup</button>
      </div>
      {/* Preview Area */}
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-200 to-green-200 relative">
        {activeTab === "sketch" ? (
          <div className="w-80 h-80 bg-white/80 rounded-lg flex items-center justify-center">
            <span className="text-gray-400">Sketch Preview</span>
          </div>
        ) : (
          <div className="w-80 h-80 bg-white/80 rounded-lg flex items-center justify-center">
            <svg width="100%" height="100%" viewBox="0 0 320 320">
              <ellipse cx="160" cy="180" rx="90" ry="120" fill="#222" />
              <ellipse cx="160" cy="120" rx="60" ry="40" fill="#333" />
              <rect x="110" y="180" width="100" height="60" rx="20" fill="#444" />
              <circle cx="160" cy="120" r="18" fill="#555" />
              <rect x="145" y="200" width="30" height="30" rx="8" fill="#666" />
              <circle cx="120" cy="110" r="6" fill="#7be97b" />
              <circle cx="200" cy="110" r="6" fill="#7be97b" />
              <circle cx="160" cy="250" r="6" fill="#7be97b" />
            </svg>
          </div>
        )}
      </div>
    </>
  );
}
