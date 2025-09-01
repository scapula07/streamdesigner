import React, { useRef, useEffect, useState } from 'react';
import { fabric } from 'fabric';

type CanvasBaseProps = {
  onCanvasInitialized: (canvas: fabric.Canvas) => void;
  isDrawingMode?: boolean;
  className?: string;
  onObjectModified?: () => void;
  onObjectAdded?: () => void;
  onObjectRemoved?: () => void;
  onPathCreated?: () => void;
};

export function CanvasBase({ 
  onCanvasInitialized, 
  isDrawingMode = false, 
  className = '',
  onObjectModified,
  onObjectAdded,
  onObjectRemoved,
  onPathCreated,
}: CanvasBaseProps) {
  const canvasElRef = useRef<HTMLCanvasElement | null>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);

  // Initial canvas setup
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

    setCanvas(canvas);
    onCanvasInitialized(canvas);

    return () => {
      try {
        canvas.dispose();
      } catch (err) {
        console.warn('Error disposing canvas:', err);
      }
    };
  }, [onCanvasInitialized]);

  // Handle drawing mode changes
  useEffect(() => {
    if (!canvas) return;
    canvas.isDrawingMode = isDrawingMode;
  }, [canvas, isDrawingMode]);

  // Event handlers
  useEffect(() => {
    if (!canvas) return;

    if (onObjectModified) canvas.on('object:modified', onObjectModified);
    if (onObjectAdded) canvas.on('object:added', onObjectAdded);
    if (onObjectRemoved) canvas.on('object:removed', onObjectRemoved);
    if (onPathCreated) canvas.on('path:created', onPathCreated);

    return () => {
      if (onObjectModified) canvas.off('object:modified', onObjectModified);
      if (onObjectAdded) canvas.off('object:added', onObjectAdded);
      if (onObjectRemoved) canvas.off('object:removed', onObjectRemoved);
      if (onPathCreated) canvas.off('path:created', onPathCreated);
    };
  }, [canvas, onObjectModified, onObjectAdded, onObjectRemoved, onPathCreated]);

  return <canvas ref={canvasElRef} id="fabricCanvas" className={className} />;
}
