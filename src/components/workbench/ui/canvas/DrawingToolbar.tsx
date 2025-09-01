import { FC } from 'react';

interface DrawingToolbarProps {
  isDrawingMode: boolean;
  setIsDrawingMode: (isDrawing: boolean) => void;
  brushColor: string;
  setBrushColor: (color: string) => void;
  brushWidth: number;
  setBrushWidth: (width: number) => void;
  isEraser: boolean;
}

const DrawingToolbar: FC<DrawingToolbarProps> = ({
  isDrawingMode,
  setIsDrawingMode,
  brushColor,
  setBrushColor,
  brushWidth,
  setBrushWidth,
  isEraser,
}) => {
  return (
    <div className="absolute left-[260px] top-1/2 -translate-y-1/2 bg-white border border-gray-200 rounded-lg shadow-lg p-2 flex flex-col gap-2">
      <button
        onClick={() => setIsDrawingMode(!isDrawingMode)}
        className={`flex items-center justify-center w-10 h-10 rounded ${
          isDrawingMode ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'
        } transition-colors`}
        title={isDrawingMode ? "Disable drawing" : "Enable drawing"}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      </button>
      
      {isDrawingMode && (
        <>
          <div className="h-px w-full bg-gray-200"></div>

          {/* Color picker (disabled when eraser is active) */}
          <input
            type="color"
            value={brushColor}
            onChange={(e) => setBrushColor(e.target.value)}
            className={`w-10 h-10 rounded cursor-pointer ${isEraser ? 'opacity-50' : ''}`}
            disabled={isEraser}
            title={isEraser ? "Disabled in eraser mode" : "Brush color"}
          />
          <div className="relative flex flex-col items-center gap-2">
            {/* Brush size indicator at the top */}
            <div 
              className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center bg-white"
              style={{ 
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
              }}
            >
              <div 
                className="rounded-full bg-black"
                style={{ 
                  width: `${Math.max(4, brushWidth)}px`,
                  height: `${Math.max(4, brushWidth)}px`
                }}
              />
            </div>

            {/* Range input with blue dot above */}
            <div className="relative">
              <div 
                className="absolute -top-3 left-1/2 w-3 h-3 bg-indigo-600 rounded-full -translate-x-1/2 transform pointer-events-none"
                style={{
                  transition: 'transform 0.1s',
                  top: `${((20 - brushWidth) / 19) * 100}%`
                }}
              />
              <input
                type="range"
                min="1"
                max="20"
                value={brushWidth}
                onChange={(e) => setBrushWidth(Number(e.target.value))}
                className="w-10 h-20 appearance-none bg-transparent cursor-pointer [&::-webkit-slider-runnable-track]:w-1 [&::-webkit-slider-runnable-track]:h-20 [&::-webkit-slider-runnable-track]:bg-gray-200 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-600 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:-mt-2 hover:[&::-webkit-slider-thumb]:bg-indigo-500"
                style={{ 
                  writingMode: 'vertical-lr',
                  transform: 'rotate(-180deg)',
                  padding: '8px 0'
                }}
                title={`Brush size: ${brushWidth}px`}
              />
            </div>

            {/* Size display */}
            <div className="text-xs text-gray-500 font-medium">
              {brushWidth}px
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DrawingToolbar;
