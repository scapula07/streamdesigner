import React from "react";

const styles = [
  { label: "Picture", selected: true },
  { label: "Anime" },
  { label: "Pixar" },
  { label: "Raw" },
  { label: "Cinematic" },
];

export default function Scene() {
  return (
    <aside className="flex flex-col items-center gap-3 py-4 w-28 select-none">
      {/* Top actions */}
      <div className="flex flex-col gap-2 mb-2">
        <button className="flex flex-col items-center bg-white rounded-xl shadow px-3 py-2 mb-1">
          <span className="text-2xl mb-1">🪄</span>
          <span className="text-xs font-medium text-gray-700">Enhance</span>
        </button>
        <button className="flex flex-col items-center bg-white rounded-xl shadow px-3 py-2">
          <span className="text-xl mb-1">🔁</span>
          <span className="text-xs font-medium text-gray-700">Variate</span>
        </button>
      </div>
      {/* Style options */}
      <div className="flex flex-col gap-2 w-full">
        {styles.map((style) => (
          <button
            key={style.label}
            className={`flex items-center bg-white rounded-xl shadow overflow-hidden px-0 py-0 border-2 ${style.selected ? "border-indigo-400" : "border-transparent"}`}
          >
            <div className={`w-16 h-16 bg-gray-200 flex items-center justify-center ${style.selected ? "ring-2 ring-indigo-400" : ""}`}>
              {/* Image placeholder */}
              <span className="text-xs text-gray-400">{style.label}</span>
            </div>
            <span className={`absolute left-0 right-0 bottom-1 text-xs font-semibold text-white text-center pointer-events-none ${style.selected ? "" : "hidden"}`}></span>
          </button>
        ))}
      </div>
    </aside>
  );
}
