import React from "react";

// You can replace these SVGs with react-icons or your own SVGs for production
const icons = [
  { key: "magic", label: "Magic", svg: <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="#A78BFA" strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="12" r="4" fill="#F3F4F6" stroke="#A78BFA" strokeWidth="2"/></svg> },
//   { key: "frame", label: "Frame", svg: <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2" stroke="#111827" strokeWidth="2"/></svg> },
//   { key: "comment", label: "Comment", svg: <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2" stroke="#111827" strokeWidth="2"/><circle cx="9" cy="12" r="1" fill="#111827"/><circle cx="15" cy="12" r="1" fill="#111827"/></svg> },
  { key: "text", label: "Text", svg: <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><text x="3" y="20" fontSize="20" fontWeight="bold" fill="#111827">T</text></svg> },
  { key: "media", label: "Media", svg: <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2" stroke="#111827" strokeWidth="2"/><circle cx="9" cy="15" r="2" fill="#111827"/><path d="M15 11l2 2-4 4" stroke="#111827" strokeWidth="2"/></svg> },
  { key: "crop", label: "Crop", svg: <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="2" stroke="#111827" strokeWidth="2"/></svg> },
//   { key: "palette", label: "Palette", svg: <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" stroke="#111827" strokeWidth="2"/><circle cx="9" cy="10" r="1" fill="#111827"/><circle cx="15" cy="10" r="1" fill="#111827"/></svg> },
  { key: "undo", label: "Undo", svg: <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M12 19c-3.866 0-7-3.134-7-7s3.134-7 7-7c2.485 0 4.675 1.28 5.93 3.22M12 19v-4m0 4l-4-4m4 4l4-4" stroke="#111827" strokeWidth="2" strokeLinecap="round"/></svg> },
  { key: "redo", label: "Redo", svg: <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M12 5c3.866 0 7 3.134 7 7s-3.134 7-7 7c-2.485 0-4.675-1.28-5.93-3.22M12 5v4m0-4l4 4m-4-4l-4 4" stroke="#111827" strokeWidth="2" strokeLinecap="round"/></svg> },
];

type LayerPanelProps = {
  workspace: any;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onAddText?: () => void;
};

export default function LayerPanel({ workspace, onUndo, onRedo, canUndo = false, canRedo = false, onAddText }: LayerPanelProps) {
  return (
    <nav className="flex flex-col items-center py-2 px-1 bg-white rounded-2xl shadow border border-gray-200 gap-1 mt-4 ml-2 select-none" style={{ width: 56 }}>
      {icons.map((icon, idx) => (
        <div key={icon.key} className="relative group">
          <button
            className={`w-12 h-12 flex items-center justify-center rounded-xl transition 
              ${icon.key === "chat" ? "bg-indigo-50 border border-indigo-200" : ""} 
              ${(icon.key === "undo" && !canUndo) || (icon.key === "redo" && !canRedo) 
                ? "opacity-40 cursor-not-allowed" 
                : "hover:bg-gray-100"}`}
            style={{ outline: icon.key === "select" ? "2px solid #6366F1" : undefined }}
            onClick={() => {
              console.log("Clicked", icon.key, { hasTextHandler: !!onAddText });
              if (icon.key === "undo" && onUndo && canUndo) {
                onUndo();
              } else if (icon.key === "redo" && onRedo && canRedo) {
                onRedo();
              } else if (icon.key === "text" && onAddText) {
                console.log("Calling onAddText");
                onAddText();
              }
            }}
            disabled={(icon.key === "undo" && !canUndo) || (icon.key === "redo" && !canRedo)}
            tabIndex={0}
          >
            {icon.svg}
          </button>
          <span className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2 z-20 whitespace-nowrap bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity shadow-lg">
            {icon.label}
          </span>
        </div>
      ))}
    </nav>
  );
}
