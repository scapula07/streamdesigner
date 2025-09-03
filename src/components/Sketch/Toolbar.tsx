import React from "react";
import { MdOpenWith, MdBrush, MdAutoFixNormal, MdFormatColorFill, MdTextFields, MdUndo, MdRedo, MdDelete, MdArrowBack, MdCreate } from "react-icons/md";

export type ToolType = "select" | "brush" | "pencil" | "eraser" | "fill" | "text";

interface ToolbarProps {
  activeTool: ToolType;
  onToolChange: (tool: ToolType) => void;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const tools = [
  { icon: <MdOpenWith size={24} />, label: "Select", value: "select" as ToolType },
  { icon: <MdBrush size={24} />, label: "Brush", value: "brush" as ToolType },
  { icon: <MdCreate size={24} />, label: "Pencil", value: "pencil" as ToolType },
  { icon: <MdAutoFixNormal size={24} />, label: "Eraser", value: "eraser" as ToolType },
  { icon: <MdFormatColorFill size={24} />, label: "Fill", value: "fill" as ToolType },
  { icon: <MdTextFields size={24} />, label: "Text", value: "text" as ToolType }
];

export default function Toolbar({ 
  activeTool, 
  onToolChange, 
  onUndo, 
  onRedo, 
  onClear,
  canUndo,
  canRedo 
}: ToolbarProps) {
  return (
    <aside className="w-20 flex flex-col items-center py-4 gap-4 mr-2 select-none">
      {/* Toolbar group with icons and tooltips */}
      <div className="flex flex-col gap-2 bg-white rounded-2xl shadow p-2 w-full items-center">
        {tools.map((tool) => (
          <div key={tool.label} className="relative group w-full flex justify-center">
            <button
              onClick={() => onToolChange(tool.value)}
              className={`flex flex-col items-center w-12 h-12 justify-center rounded-xl transition ${
                activeTool === tool.value 
                  ? "bg-indigo-600 text-white hover:bg-indigo-700" 
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {tool.icon}
            </button>
            <span className="absolute left-14 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 pointer-events-none bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10 transition-opacity">
              {tool.label}
            </span>
          </div>
        ))}
      </div>

      {/* Actions group with icons and tooltips */}
      <div className="flex flex-col gap-2 bg-white rounded-2xl shadow p-2 w-full items-center mt-2">
        <div className="relative group w-full flex justify-center">
          <button 
            onClick={onUndo}
            disabled={!canUndo}
            className={`flex flex-col items-center w-12 h-12 justify-center rounded-xl transition
              ${canUndo ? "text-gray-700 hover:bg-gray-100" : "text-gray-300 cursor-not-allowed"}
            `}
          >
            <MdUndo size={24} />
          </button>
          <span className="absolute left-14 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 pointer-events-none bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10 transition-opacity">
            Undo
          </span>
        </div>

        <div className="relative group w-full flex justify-center">
          <button 
            onClick={onRedo}
            disabled={!canRedo}
            className={`flex flex-col items-center w-12 h-12 justify-center rounded-xl transition
              ${canRedo ? "text-gray-700 hover:bg-gray-100" : "text-gray-300 cursor-not-allowed"}
            `}
          >
            <MdRedo size={24} />
          </button>
          <span className="absolute left-14 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 pointer-events-none bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10 transition-opacity">
            Redo
          </span>
        </div>

        <div className="relative group w-full flex justify-center">
          <button 
            onClick={onClear}
            className="flex flex-col items-center w-12 h-12 justify-center rounded-xl transition text-gray-700 hover:bg-gray-100"
          >
            <MdDelete size={24} />
          </button>
          <span className="absolute left-14 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 pointer-events-none bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10 transition-opacity">
            Clear
          </span>
        </div>
      </div>
    </aside>
  );
}
