import React from "react";
import { MdOpenWith, MdBrush, MdAutoFixNormal, MdFormatColorFill, MdTextFields, MdUndo, MdRedo, MdDelete, MdArrowBack } from "react-icons/md";

const tools = [
  { icon: <MdOpenWith size={24} className="text-gray-500" />, label: "Move" },
  { icon: <MdBrush size={24} className="text-white" />, label: "Brush", active: true },
  { icon: <MdAutoFixNormal size={24} className="text-gray-500" />, label: "Eraser" },
  { icon: <MdFormatColorFill size={24} className="text-blue-600" />, label: "Fill" },
  { icon: <MdTextFields size={24} className="text-gray-500" />, label: "Text" },
];

const actions = [
  { icon: <MdUndo size={24} className="text-gray-400" />, label: "Undo" },
  { icon: <MdRedo size={24} className="text-gray-400" />, label: "Redo" },
  { icon: <MdDelete size={24} className="text-red-500" />, label: "Clear" },
];

export default function Toolbar() {
  return (
    <aside className="w-20 flex flex-col items-center py-4 gap-4 mr-2 select-none">
      {/* Top logo/back button */}
      <button className="mb-2 p-2 rounded-full bg-white shadow border border-gray-100 flex items-center justify-center">
        <MdArrowBack size={28} className="text-gray-700" />
      </button>
      {/* Toolbar group with icons and tooltips */}
      <div className="flex flex-col gap-2 bg-white rounded-2xl shadow p-2 w-full items-center">
        {tools.map((tool, idx) => (
          <div key={tool.label} className="relative group w-full flex justify-center">
            <button
              className={`flex flex-col items-center w-12 h-12 justify-center rounded-xl transition ${tool.active ? "bg-blue-600 hover:bg-blue-700" : tool.label === "Fill" ? "bg-blue-100 hover:bg-blue-200" : "hover:bg-gray-100"}`}
            >
              {tool.icon}
            </button>
            <span className="absolute left-14 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 pointer-events-none bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10 transition-opacity">
              {tool.label}
            </span>
          </div>
        ))}
      </div>
      {/* Undo/Redo/Clear group with icons and tooltips */}
      <div className="flex flex-col gap-2 bg-white rounded-2xl shadow p-2 w-full items-center mt-2">
        {actions.map((action) => (
          <div key={action.label} className="relative group w-full flex justify-center">
            <button className={`flex flex-col items-center w-12 h-12 justify-center rounded-xl transition ${action.label === "Clear" ? "hover:bg-red-100" : "hover:bg-gray-100"}`}>
              {action.icon}
            </button>
            <span className="absolute left-14 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 pointer-events-none bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10 transition-opacity">
              {action.label}
            </span>
          </div>
        ))}
      </div>
    </aside>
  );
}
