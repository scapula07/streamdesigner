import React from 'react';
import { fabric } from 'fabric';

type ContextMenuProps = {
  visible: boolean;
  x: number;
  y: number;
  onDelete: () => void;
  onDuplicate: () => void;
  onColorChange: (color: string) => void;
  onAddComment: () => void;
};

export function ContextMenu({
  visible,
  x,
  y,
  onDelete,
  onDuplicate,
  onColorChange,
  onAddComment,
}: ContextMenuProps) {
  if (!visible) return null;

  return (
    <div
      className="context-menu fixed z-[100] bg-white border border-gray-200 rounded-lg shadow-lg p-2 transform -translate-x-1/2 flex items-center gap-2"
      style={{ left: x, top: y }}
    >
      <button
        onClick={onDelete}
        className="flex items-center justify-center w-8 h-8 rounded bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
        title="Delete"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
      <button
        onClick={onDuplicate}
        className="flex items-center justify-center w-8 h-8 rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
        title="Duplicate"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      </button>
      <div className="h-5 w-px bg-gray-200 mx-1"></div>
      <div className="flex items-center gap-1">
        {['#e0e7ff', '#fef9c3', '#d1fae5', '#fbcfe8'].map((color) => (
          <button
            key={color}
            onClick={() => onColorChange(color)}
            className="w-6 h-6 rounded border border-gray-200 hover:scale-110 transition-transform"
            style={{ backgroundColor: color }}
            title="Change color"
          />
        ))}
      </div>
      <div className="h-5 w-px bg-gray-200 mx-1"></div>
      <button
        onClick={onAddComment}
        className="flex items-center justify-center w-8 h-8 rounded text-gray-700 hover:bg-gray-50 transition-colors"
        title="Add comment"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
      </button>
    </div>
  );
}
