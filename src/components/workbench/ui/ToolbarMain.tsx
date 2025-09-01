import React, { useState, useRef } from "react";
import { FiSquare, FiPenTool, FiCircle } from "react-icons/fi";
import { PiEraserLight } from "react-icons/pi";
import { LuMousePointer2 } from "react-icons/lu";

const tools = [
  { icon: <LuMousePointer2 />, label: "Select" },
  { icon: <FiPenTool />, label: "Draw" },
  { icon: <FiSquare />, label: "Shapes" },
  { icon: <PiEraserLight />, label: "Erase" },
  { icon: <FiCircle />, label: "Ellipse" },
];

const shapeOptions = [
  { label: "Rectangle", value: "rect" },
  { label: "Circle", value: "circle" },
  { label: "Triangle", value: "triangle" },
  { label: "Line", value: "line" },
  { label: "Polygon", value: "polygon" },
];

type ToolbarMainProps = {
  active: string;
  setActive: (tool: string) => void;
  onShapeAdd?: (shape: string) => void;
  onAddText?: () => void;
};

export default function ToolbarMain({ active, setActive, onShapeAdd, onAddText }: ToolbarMainProps) {
  const [shapeDropdownOpen, setShapeDropdownOpen] = useState(false);
  const shapesBtnRef = useRef<HTMLButtonElement | null>(null);

  // Close dropdown on outside click
  React.useEffect(() => {
    if (!shapeDropdownOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (shapesBtnRef.current && !shapesBtnRef.current.contains(e.target as Node)) {
        setShapeDropdownOpen(false);
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [shapeDropdownOpen]);

  return (
    <div className="relative flex items-center justify-center bg-white border border-gray-200 rounded-xl shadow-sm max-w-xl mx-auto" style={{ minHeight: 56 }}>
      <div className="flex items-center gap-1 w-full justify-center gap-4 px-4 py-2">
        {tools.map((tool) => (
          <div key={tool.label} className="relative group">
            <button
              ref={tool.label === "Shapes" ? shapesBtnRef : undefined}
              onClick={() => {
                setActive(tool.label);
                if (tool.label === "Shapes") setShapeDropdownOpen((open) => !open);
                else setShapeDropdownOpen(false);
              }}
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
            {/* Tooltip */}
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 rounded bg-gray-800 text-white text-xs opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
              {tool.label}
            </div>
            {tool.label === "Shapes" && active === "Shapes" && shapeDropdownOpen && (
              <div className="absolute left-1/2 -translate-x-1/2 mt-2 z-70 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[120px] py-2 flex flex-col">
                {shapeOptions.map((shape) => (
                  <li
                    key={shape.value}
                    className="px-4 py-1 text-sm text-gray-700 hover:bg-indigo-50 text-left cursor-pointer"
                    onClick={() => {
                       
                      if (onShapeAdd) onShapeAdd(shape.value);
                      
                 
                    }}
                  >
                    {shape.label}
                  </li>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
