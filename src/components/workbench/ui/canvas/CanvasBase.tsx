import React, { useRef, useEffect } from 'react';
import { fabric } from 'fabric';

type CanvasBaseProps = {
  onCanvasInitialized: (canvas: fabric.Canvas) => void;
  isDrawingMode?: boolean;
  className?: string;
};

export function CanvasBase({ onCanvasInitialized, isDrawingMode = false, className = '' }: CanvasBaseProps) {
  const canvasElRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasElRef.current) return;

    const canvas = new fabric.Canvas(canvasElRef.current, {
      backgroundColor: "#fff",
      selection: true,
      selectionBorderColor: '#6366f1',
      selectionLineWidth: 2,
      interactive: true,
      enableRetinaScaling: true,
      preserveObjectStacking: true,
      hoverCursor: 'pointer',
      defaultCursor: 'default',
      selectionColor: 'rgba(99, 102, 241, 0.1)',
      selectionDashArray: [6, 6],
      centeredScaling: true,
      stopContextMenu: true,
      isDrawingMode: isDrawingMode,
    });

    onCanvasInitialized(canvas);

    return () => {
      try {
        canvas.dispose();
      } catch (err) {
        console.warn('Error disposing canvas:', err);
      }
    };
  }, [onCanvasInitialized, isDrawingMode]);

  return <canvas ref={canvasElRef} id="fabricCanvas" className={className} />;
}
