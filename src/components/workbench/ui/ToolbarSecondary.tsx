import React from "react";

export default function ToolbarSecondary({ active, setActive, size, setSize, opacity, setOpacity }: {
  active: string,
  setActive: (tool: string) => void,
  size: number,
  setSize: (n: number) => void,
  opacity: number,
  setOpacity: (n: number) => void,
}) {
  return (
    <div className="flex items-center justify-center gap-3 px-2 py-2 bg-white border border-t-0 border-gray-200 rounded-b-xl shadow-sm max-w-xl mx-auto">
      <button
        className={`flex items-center justify-center w-8 h-8 rounded-lg text-lg font-semibold transition border-2 ${
          active === "Draw"
            ? "border-indigo-600 bg-indigo-50 text-indigo-700"
            : "border-transparent text-gray-700 hover:bg-gray-100"
        }`}
        onClick={() => setActive("Draw")}
      >
        {/* Draw icon */}
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M19 11l-6 6-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M5 19h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
      </button>
      <span className="text-xs text-gray-500 ml-2">Size</span>
      <input
        type="range"
        min={1}
        max={32}
        value={size}
        onChange={e => setSize(Number(e.target.value))}
        className="accent-indigo-600 mx-2"
        style={{ width: 100 }}
      />
      <span className="text-xs text-gray-700 w-8 text-center">{size}px</span>
      <span className="text-xs text-gray-500 ml-4">Opacity</span>
      <input
        type="range"
        min={0}
        max={100}
        value={opacity}
        onChange={e => setOpacity(Number(e.target.value))}
        className="accent-indigo-600 mx-2"
        style={{ width: 100 }}
      />
      <span className="text-xs text-gray-700 w-10 text-center">{opacity}%</span>
      <button className="ml-4 w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 text-gray-500">
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
    </div>
  );
}
