import React from "react";
import { FiEdit2, FiSquare, FiPenTool, FiCircle } from "react-icons/fi";
import { PiEraserLight } from "react-icons/pi";

const tools = [
  { icon: <FiEdit2 />, label: "Select" },
  { icon: <FiPenTool />, label: "Draw" },
  { icon: <FiSquare />, label: "Rect" },
  { icon: <FiCircle />, label: "Ellipse" },
  { icon: <PiEraserLight />, label: "Erase" },
];

export default function ToolbarMain({ active, setActive }: { active: string, setActive: (tool: string) => void }) {
  return (
    <div className="relative flex items-center justify-center bg-white border border-gray-200 rounded-xl shadow-sm max-w-xl mx-auto" style={{ minHeight: 56 }}>
      <div className="flex items-center gap-1 w-full justify-center gap-4 px-4 py-2">
        {tools.map((tool) => (
          <button
            key={tool.label}
            onClick={() => setActive(tool.label)}
            className={`flex flex-col items-center px-3 py-1 rounded-lg text-lg font-semibold transition border-2 ${
              active === tool.label
                ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                : "border-transparent text-gray-700 hover:bg-gray-100"
            }`}
            style={{ minWidth: 44 }}
          >
            {tool.icon}
            <span className="text-[10px] mt-0.5">{tool.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
