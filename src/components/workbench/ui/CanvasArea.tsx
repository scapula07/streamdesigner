import React, { useEffect, useRef, useState } from "react";

import { fabric } from "fabric";
import { MdCloudUpload } from "react-icons/md";
import Toolbar from "./Toolbar";
// Add Workspace type for whip_url
type Workspace = {
  whip_url: string;
};

export default function CanvasArea({ 
  workspace, 
  active, 
  setActive, 
  imageLoaded, 
  setImageLoaded,
  setCanUndo,
  setCanRedo,
  setUndoRedoState
}: { 
  workspace: Workspace, 
  active: string, 
  setActive: (tool: string) => void, 
  imageLoaded: boolean, 
  setImageLoaded: (v: boolean) => void,
  setCanUndo: (can: boolean) => void,
  setCanRedo: (can: boolean) => void,
  setUndoRedoState: (state: { onUndo?: () => void, onRedo?: () => void, onAddText?: () => void }) => void
}) {
    // Context menu position and visibility state
    console.log(active,"active")
type MenuState = {
  visible: boolean;
  x: number;
  y: number;
};
  const canvasRef = useRef<fabric.Canvas | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  // No need for imageRegion
  const [dragActive, setDragActive] = useState(false);
  // Streaming state/refs
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [streaming, setStreaming] = useState(false);
  const [streamLoading, setStreamLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const outgoingStreamRef = useRef<MediaStream | null>(null);
  const whipResourceUrlRef = useRef<string | null>(null);
  const silentAudioCtxRef = useRef<AudioContext | null>(null);
  const silentAudioOscRef = useRef<OscillatorNode | null>(null);
  // Context menu state
  const [menuState, setMenuState] = useState<MenuState>({ visible: false, x: 0, y: 0 });
  const [selectedObj, setSelectedObj] = useState<fabric.Object | null>(null);

  // Drawing mode state
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [brushColor, setBrushColor] = useState('#000000');
  const [brushWidth, setBrushWidth] = useState(5);
  const [isEraser, setIsEraser] = useState(false);
  
  // State history management
  const undoStack = useRef<string[]>([]);
  const redoStack = useRef<string[]>([]);
  const isUndoRedoing = useRef(false); // Flag to prevent save during undo/redo
  
  // Combine canvas initialization and menu event wiring
  useEffect(() => {
    if (!containerRef.current) return;
    // Initialize Fabric.js canvas
    const canvas = new fabric.Canvas("fabricCanvas", {
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
    
    // Initialize drawing brush
    if (canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.color = brushColor;
      canvas.freeDrawingBrush.width = brushWidth;
      canvas.freeDrawingBrush.strokeLineCap = 'round';
      canvas.freeDrawingBrush.strokeLineJoin = 'round';
    }
    // Enable selection on all objects by default
    canvas.forEachObject((obj) => {
      obj.selectable = true;
      obj.evented = true;
    });
    // Responsive resize logic
    const resizeCanvas = () => {
      const container = containerRef.current;
      if (container) {
        const width = container.clientWidth;
        const height = container.clientHeight;
        canvas.setWidth(width);
        canvas.setHeight(height);
        canvas.requestRenderAll();
      }
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    canvasRef.current = canvas;

    // --- Context menu event wiring ---
    const showMenuForObject = (obj: fabric.Object, pointer?: { x: number; y: number }) => {
      setSelectedObj(obj);
      // Get object's bounding rect and position menu above it
      const bound = obj.getBoundingRect();
      const canvasEl = (canvas as any).lowerCanvasEl as HTMLCanvasElement;
      const rect = canvasEl.getBoundingClientRect();
      let x = rect.left + bound.left + bound.width / 2;
      let y = rect.top + bound.top - 48; // Position above the object
      // If pointer provided (right-click), use pointer position
      if (pointer) {
        x = rect.left + pointer.x;
        y = rect.top + pointer.y - 48;
      }
      // Clamp to canvas container instead of window
      const container = containerRef.current;
      if (container) {
        const cRect = container.getBoundingClientRect();
        x = Math.max(cRect.left + 150, Math.min(cRect.right - 150, x));
        y = Math.max(cRect.top + 10, y);
      }
      setMenuState({ visible: true, x, y });
    };

    const handleSelection = (e: fabric.IEvent) => {
      const obj = canvas.getActiveObject();
      console.log('[Menu] Selection event occurred, object:', obj);
      if (obj && obj.selectable !== false) {
        // Prevent any existing timeout from hiding the menu
        // Update both the menu position and the selected object reference
        setSelectedObj(obj);
        showMenuForObject(obj);
        canvas.renderAll(); // Force an immediate canvas update
        // Stop event propagation to prevent document click from immediately hiding the menu
        if (e.e) {
          e.e.stopPropagation();
        }
      }
    };

    // Hide menu only if user clicks outside the canvas area
    const handleClear = () => {
      setMenuState(s => ({ ...s, visible: false }));
      setSelectedObj(null);
    };

    // Hide menu if user clicks outside the canvas (document click)
    const handleDocumentClick = (e: MouseEvent) => {
      const canvasEl = (canvas as any).lowerCanvasEl as HTMLCanvasElement | undefined;
      const menuEl = document.querySelector('.context-menu');
      // Don't hide menu if click is on the menu itself
      if (menuEl && menuEl.contains(e.target as Node)) {
        return;
      }
      // Only hide if click is outside both canvas and menu
      if (canvasEl && !canvasEl.contains(e.target as Node)) {
        console.log('[Menu] Document click outside canvas and menu');
        setMenuState(s => ({ ...s, visible: false }));
        setSelectedObj(null);
      }
    };
    // Right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      if (!canvas) return;
      const pointer = canvas.getPointer(e);
      // Find object at pointer
      const target = canvas.findTarget(e, false);
      if (target) {
        e.preventDefault();
        canvas.setActiveObject(target);
        showMenuForObject(target, pointer);
        console.log('[Menu] handleContextMenu', { target, pointer });
      }
    };
    // Add all selection-related event handlers
    canvas.on('mouse:up', handleSelection);
    canvas.on('mouse:down', handleSelection);
    canvas.on('selection:created', handleSelection);
    canvas.on('selection:updated', handleSelection);
    canvas.on('selection:cleared', handleClear);
    canvas.on('mouse:over', (e) => {
      if (e.target) {
        e.target.set('hoverCursor', 'pointer');
      }
    });
    // Attach native contextmenu event to canvas element (if available)
    const canvasEl = (canvas as any).lowerCanvasEl as HTMLCanvasElement | undefined;
    if (canvasEl && canvasEl.addEventListener) {
      canvasEl.addEventListener('contextmenu', handleContextMenu);
    }
    document.addEventListener('mousedown', handleDocumentClick);

    // Cleanup
    return () => {
      canvas.off('selection:created', handleSelection);
      canvas.off('selection:updated', handleSelection);
      canvas.off('selection:cleared', handleClear);
      if (canvasEl && canvasEl.removeEventListener) {
        canvasEl.removeEventListener('contextmenu', handleContextMenu);
      }
      document.removeEventListener('mousedown', handleDocumentClick);
      window.removeEventListener('resize', resizeCanvas);
      try {
        canvas.dispose();
      } catch (err) {
        console.warn('[Menu] canvas.dispose() error:', err);
      }
      canvasRef.current = null;
    };
  }, []);
  // Delete selected object
  const handleDelete = () => {
    console.log('[Menu] Delete event occurred, object:', selectedObj);
    const canvas = canvasRef.current;
    if (canvas && selectedObj) {
      try {
        // Remove the object from any active selection first
        canvas.discardActiveObject();
        // Remove the object from canvas
        canvas.remove(selectedObj);
        // Clear selection state
        setSelectedObj(null);
        setMenuState(s => ({ ...s, visible: false }));
        // Force a canvas update
        canvas.renderAll();
        console.log('Object deleted:', selectedObj);
      } catch (err) {
        console.error('Error deleting object:', err);
      }
    }
  };


  // Add shape to canvas
  const handleAddShape = (shape: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let obj: fabric.Object | null = null;
    switch (shape) {
      case "rect":
        obj = new fabric.Rect({
          left: 100,
          top: 100,
          width: 120,
          height: 80,
          fill: "#e0e7ff",
          stroke: "#6366f1",
          strokeWidth: 2,
          rx: 8,
          ry: 8,
          selectable: true,
        });
        break;
      case "circle":
        obj = new fabric.Circle({
          left: 140,
          top: 140,
          radius: 60,
          fill: "#fef9c3",
          stroke: "#f59e42",
          strokeWidth: 2,
          selectable: true,
        });
        break;
      case "triangle":
        obj = new fabric.Triangle({
          left: 180,
          top: 120,
          width: 100,
          height: 100,
          fill: "#d1fae5",
          stroke: "#10b981",
          strokeWidth: 2,
          selectable: true,
        });
        break;
      case "line":
        obj = new fabric.Line([60, 60, 200, 200], {
          left: 60,
          top: 60,
          stroke: "#6366f1",
          strokeWidth: 4,
          selectable: true,
        });
        break;
      case "polygon":
        obj = new fabric.Polygon([
          { x: 100, y: 50 },
          { x: 140, y: 100 },
          { x: 120, y: 160 },
          { x: 80, y: 160 },
          { x: 60, y: 100 },
        ], {
          fill: "#fbcfe8",
          stroke: "#db2777",
          strokeWidth: 2,
          selectable: true,
        });
        break;
      default:
        break;
    }
    if (obj) {
      // Ensure the object is interactive
      obj.set({
        selectable: true,
        evented: true,
        hasControls: true,
        hasBorders: true,
      });
      canvas.add(obj);
      canvas.setActiveObject(obj);
      canvas.requestRenderAll();
      
      // Consider canvas loaded when shape is added
      setImageLoaded(true);
    }
  };
  



  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleImageUpload = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result as string;
      fabric.Image.fromURL(data, (img: any) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        // Resize canvas to fit image exactly
        canvas.setWidth(img.width);
        canvas.setHeight(img.height);
        // Set as background image (always behind shapes)
        canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
          scaleX: 1,
          scaleY: 1,
          left: 0,
          top: 0,
        });
        setImageLoaded(true);
      });
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleImageUpload(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files[0]);
    }
  };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const captureDesignArea = () => {
    if (!canvasRef.current) return;

    // Define the region you want to capture (x, y, width, height)
    const captureArea = {
      left: 100,
      top: 100,
      width: 600,
      height: 400,
    };

    const dataURL = canvasRef.current.toDataURL({
      format: "png",
      left: captureArea.left,
      top: captureArea.top,
      width: captureArea.width,
      height: captureArea.height,
    });

  };

  // --- Silent audio track helper ---
  const createSilentAudioTrack = async (): Promise<MediaStreamTrack | null> => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      silentAudioCtxRef.current = audioCtx;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      gain.gain.value = 0;
      osc.connect(gain);
      const dst = audioCtx.createMediaStreamDestination();
      gain.connect(dst);
      osc.start();
      silentAudioOscRef.current = osc;
      const [track] = dst.stream.getAudioTracks();
      return track;
    } catch (err) {
      console.warn("Could not create silent audio track:", err);
      return null;
    }
  };

  // --- Start Streaming (WHIP) ---
  // --- Animation loop to keep canvas stream live ---
  const animationFrameRef = useRef<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // This function will force the canvas to update, ensuring captureStream is live
  const animateCanvas = () => {
    if (!canvasRef.current) return;
    canvasRef.current.requestRenderAll();
    animationFrameRef.current = requestAnimationFrame(animateCanvas);
  };

  // Start the animation loop when streaming starts
  useEffect(() => {
    if (streaming && !isAnimating) {
      setIsAnimating(true);
      animationFrameRef.current = requestAnimationFrame(animateCanvas);
    } else if (!streaming && isAnimating) {
      setIsAnimating(false);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [streaming]);

  const startStreaming = async () => {
    setError(null);
    if (!workspace?.whip_url) {
      setError("No WHIP URL configured on workspace.");
      return;
    }
    if (!imageLoaded) {
      setError("No image loaded to stream.");
      return;
    }
    setStreamLoading(true);

    // Stream the entire canvas
    const fabricCanvas = canvasRef.current;
    if (!fabricCanvas) {
      setError("No canvas to stream.");
      setStreamLoading(false);
      return;
    }
    const canvasEl = (fabricCanvas as any).lowerCanvasEl as HTMLCanvasElement;

    try {
      // 1) capture full canvas stream (video)
      const stream = canvasEl.captureStream(30);
      outgoingStreamRef.current = stream;

      // 2) add silent audio track for compatibility
      const audioTrack = await createSilentAudioTrack();
      if (audioTrack) stream.addTrack(audioTrack);

      // 3) create RTCPeerConnection
      const pc = new RTCPeerConnection();
      pcRef.current = pc;
      pc.oniceconnectionstatechange = () => {
        console.debug("ICE state:", pc.iceConnectionState);
      };
      stream.getTracks().forEach((t) => pc.addTrack(t, stream));
      try { pc.createDataChannel("whip-control"); } catch {}

      // 4) create offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // 5) POST offer.sdp to the WHIP endpoint
      const resp = await fetch(workspace.whip_url, {
        method: "POST",
        headers: { "Content-Type": "application/sdp" },
        body: offer.sdp,
      });
      if (!resp.ok) throw new Error(`WHIP POST failed: ${resp.status} ${resp.statusText}`);

      const location = resp.headers.get("Location");
      if (location) whipResourceUrlRef.current = location;
      const answerSDP = await resp.text();
      if (!answerSDP) throw new Error("Empty answer SDP from WHIP server");
      await pc.setRemoteDescription({ type: "answer", sdp: answerSDP });

      setStreaming(true);
      setStreamLoading(false);
      setActive("Stream");
      console.log("Streaming started to WHIP URL");
    } catch (err: any) {
      setError(String(err?.message || err));
      await stopStreamingInternal();
      setStreamLoading(false);
    }
  };

  // --- Stop Streaming (WHIP) ---
  const stopStreamingInternal = async () => {
    try {
      const resource = whipResourceUrlRef.current;
      if (resource) {
        try {
          await fetch(resource, { method: "DELETE" });
        } catch (err) {
          console.warn("Failed to DELETE WHIP resource:", err);
        }
        whipResourceUrlRef.current = null;
      }
      if (pcRef.current) {
        try {
          pcRef.current.getSenders().forEach((s) => {
            try { s.track?.stop(); } catch {}
          });
          pcRef.current.close();
        } catch {}
        pcRef.current = null;
      }
      if (outgoingStreamRef.current) {
        outgoingStreamRef.current.getTracks().forEach((t) => {
          try { t.stop(); } catch {}
        });
        outgoingStreamRef.current = null;
      }
      if (silentAudioOscRef.current) {
        try { silentAudioOscRef.current.stop(); } catch {}
        silentAudioOscRef.current = null;
      }
      if (silentAudioCtxRef.current) {
        try { silentAudioCtxRef.current.close(); } catch {}
        silentAudioCtxRef.current = null;
      }
    } catch (err) {
      console.warn("Error during stopStreamingInternal cleanup:", err);
    } finally {
      setStreaming(false);
      setStreamLoading(false);
    }
  };
  const stopStreaming = async () => {
    setStreamLoading(true);
    await stopStreamingInternal();
    setStreamLoading(false);
  };

  // --- Effect: respond to toolbar Stream button ---
  useEffect(() => {
    if (active === "Stream" && !streaming && !streamLoading) {
      startStreaming();
    } else if (active !== "Stream" && streaming) {
      stopStreaming();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  // Duplicate selected object
  const handleDuplicate = () => {
    const canvas = canvasRef.current;
    if (canvas && selectedObj) {
      selectedObj.clone((cloned: fabric.Object) => {
        cloned.set({
          left: selectedObj.left! + 20,
          top: selectedObj.top! + 20,
          evented: true,
        });
        canvas.add(cloned);
        canvas.setActiveObject(cloned);
        canvas.requestRenderAll();
      });
    }
  };

  // Change object color
  const handleColorChange = (color: string) => {
    const canvas = canvasRef.current;
    if (canvas && selectedObj) {
      selectedObj.set({
        fill: color
      });
      canvas.requestRenderAll();
    }
  };

  // Add comment to object
  const handleAddComment = () => {
    const canvas = canvasRef.current;
    if (canvas && selectedObj) {
      const text = new fabric.IText('Add comment...', {
        left: selectedObj.left! + selectedObj.width! + 10,
        top: selectedObj.top,
        fontSize: 14,
        fill: '#374151',
        backgroundColor: '#fff',
        padding: 8,
        editingBorderColor: '#6366f1',
      });
      canvas.add(text);
      canvas.setActiveObject(text);
      text.enterEditing();
      canvas.requestRenderAll();
    }
  };

  // Drawing mode settings
  const updateDrawingSettings = () => {
      console.log('Updating drawing settings:', { isDrawingMode, brushColor, brushWidth, isEraser });
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.isDrawingMode = isDrawingMode;
      canvas.freeDrawingBrush.width = brushWidth;
      
      // Set color based on eraser mode
      if (isEraser) {
        canvas.freeDrawingBrush.color = '#ffffff'; // White for eraser
        if (canvas.freeDrawingBrush instanceof fabric.PencilBrush) {
          (canvas.freeDrawingBrush as any).globalCompositeOperation = 'destination-out';
        }
      } else {
        canvas.freeDrawingBrush.color = brushColor;
        if (canvas.freeDrawingBrush instanceof fabric.PencilBrush) {
          (canvas.freeDrawingBrush as any).globalCompositeOperation = 'source-over';
        }
      }
      
      // Use pencil brush for smoother lines
      if (canvas.freeDrawingBrush) {
        canvas.freeDrawingBrush.strokeLineCap = 'round';
        canvas.freeDrawingBrush.strokeLineJoin = 'round';
      }
    }
  };

  // Handle drawing mode changes
  const toggleDrawingMode = (enable: boolean) => {
    console.log('Toggling drawing mode:', enable);
    const canvas = canvasRef.current;
    if (canvas) {
      // Discard any active selection when entering drawing mode
      if (enable) {
        canvas.discardActiveObject();
        setMenuState(s => ({ ...s, visible: false }));
        setSelectedObj(null);
      }
      setIsDrawingMode(enable);
      canvas.isDrawingMode = enable;
      canvas.renderAll();
    }
  };

  // Effect to update drawing settings when they change
  useEffect(() => {
    updateDrawingSettings();
  }, [isDrawingMode, brushColor, brushWidth, isEraser]);

  // Effect to handle drawing mode based on active tool
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (active === 'Draw') {
      toggleDrawingMode(true);
    } else {
      toggleDrawingMode(false);
    }
  }, [active]);

  // Handle adding text to canvas
const handleAddText = () => {
    console.log("Adding text to canvas");
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Create a new IText object for editable text
    const text = new fabric.IText('Double click to edit', {
      left: (canvas.getWidth() || 0) / 2,
      top: (canvas.getHeight() || 0) / 2,
      fontSize: 24,
      fill: '#111827',
      fontFamily: 'Inter, sans-serif',
      padding: 8,
      editingBorderColor: '#6366f1',
      selectable: true,
      hasControls: true,
      originX: 'center',
      originY: 'center'
    });

    // Add the text to canvas and activate it
    canvas.add(text);
    canvas.setActiveObject(text);
    text.enterEditing();
    canvas.requestRenderAll();
    
    // Consider canvas loaded when text is added
    setImageLoaded(true);
    
    // Save state after adding text
    saveCanvasState();
  };  // Save canvas state after each change
  const saveCanvasState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Don't save if we're in the middle of an undo/redo operation
    if (isUndoRedoing.current) {
      console.log('Skipping save during undo/redo operation');
      return;
    }
    
    const currentState = JSON.stringify(canvas.toJSON());
    
    // Check if this is a new state
    const lastState = undoStack.current[undoStack.current.length - 1];
    console.log('Saving state:', {
      stackSize: undoStack.current.length,
      isDuplicate: currentState === lastState,
      currentState: currentState.substring(0, 100) + '...'
    });
    
    if (currentState === lastState) {
      console.log('Skipping duplicate state');
      return; // Don't save duplicate states
    }
    
    // Add the new state to the undo stack
    undoStack.current.push(currentState);
    
    // Clear redo stack since we're creating a new branch of history
    redoStack.current = [];
    
    // Update UI state
    setCanUndo(true);
    setCanRedo(false);
    
    console.log('State saved, new stack size:', undoStack.current.length);
  };

  // Handle undo action
  const handleUndo = () => {
    console.log('Handling undo action', {
      undoStackSize: undoStack.current.length,
      redoStackSize: redoStack.current.length
    });
    
    const canvas = canvasRef.current;
    if (!canvas || undoStack.current.length === 0) {
      console.log('Cannot undo: no canvas or empty stack');
      return;
    }

    // Get current state for redo stack
    const currentState = JSON.stringify(canvas.toJSON());
    
    // Get the previous state from undo stack
    const previousState = undoStack.current.pop();
    if (!previousState) {
      console.log('No previous state found after pop');
      return;
    }
    
    // Add the current state to redo stack
    redoStack.current.push(currentState);
    
    // Set flag to prevent state saving during undo
    isUndoRedoing.current = true;
    
    // Load the previous state
    console.log('Loading previous state');
    canvas.loadFromJSON(JSON.parse(previousState), () => {
      canvas.renderAll();
      setCanUndo(undoStack.current.length > 0);
      setCanRedo(true);
      console.log('Undo complete', {
        newUndoStackSize: undoStack.current.length,
        newRedoStackSize: redoStack.current.length
      });
      
      // Reset flag after state is loaded
      isUndoRedoing.current = false;
    });
  };  // Handle redo action
  const handleRedo = () => {
    console.log('Handling redo action', {
      undoStackSize: undoStack.current.length,
      redoStackSize: redoStack.current.length
    });

    const canvas = canvasRef.current;
    if (!canvas || redoStack.current.length === 0) {
      console.log('Cannot redo: no canvas or empty redo stack');
      return;
    }

    // Get the state to redo to
    const nextState = redoStack.current.pop();
    if (!nextState) {
      console.log('No next state found after pop');
      return;
    }
    
    // Get current state before applying redo
    const currentState = JSON.stringify(canvas.toJSON());
    
    // Save current state to undo stack
    undoStack.current.push(currentState);
    
    // Set flag to prevent state saving during redo
    isUndoRedoing.current = true;
    
    // Apply the redo state
    console.log('Loading next state');
    canvas.loadFromJSON(JSON.parse(nextState), () => {
      canvas.renderAll();
      setCanUndo(true);
      setCanRedo(redoStack.current.length > 0);
      console.log('Redo complete', {
        newUndoStackSize: undoStack.current.length,
        newRedoStackSize: redoStack.current.length
      });
      
      // Reset flag after state is loaded
      isUndoRedoing.current = false;
    });
  };

  // Share undo/redo handlers with parent
  useEffect(() => {
    setUndoRedoState({
      onUndo: handleUndo,
      onRedo: handleRedo,
      onAddText: handleAddText
    });
  }, [setUndoRedoState]);

  // Add event listener for canvas changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleObjectModified = () => {
      saveCanvasState();
    };

    // Save initial state
    saveCanvasState();

    // Listen for various modification events and update image loaded state
    const saveState = () => {
      console.log('Canvas modification detected');
      // If anything is added to canvas, consider it "loaded"
      if (canvas.getObjects().length > 0) {
        setImageLoaded(true);
      }
      saveCanvasState();
    };

    canvas.on('object:modified', saveState);
    canvas.on('object:added', saveState);
    canvas.on('object:removed', saveState);
    canvas.on('path:created', saveState);
    // Additional events that might trigger state changes
    canvas.on('canvas:cleared', saveState);
    canvas.on('erasing:end', saveState);

    // Save initial state
    console.log('Saving initial canvas state');
    saveCanvasState();

    return () => {
      canvas.off('object:modified', saveState);
      canvas.off('object:added', saveState);
      canvas.off('object:removed', saveState);
      canvas.off('path:created', saveState);
      canvas.off('canvas:cleared', saveState);
      canvas.off('erasing:end', saveState);
    };
  }, []);
  

  return (
    <>
      <Toolbar
        workspace={workspace}
        active={active}
        setActive={setActive}
        imageLoaded={imageLoaded}
        onShapeAdd={handleAddShape}
        onAddText={handleAddText}
      />
      <div
        ref={containerRef}
        style={{
          position: "relative",
          width: "100vw",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          paddingLeft: 240, // match LayerPanel width
          paddingRight: 320, // match RightPanel width
          boxSizing: "border-box",
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <canvas id="fabricCanvas" style={{ border: "1px solid #ccc", display: "block", background: "#fff" }}></canvas>

        {/* Drawing toolbar */}
        {active === 'Draw' && (
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
                        writingMode: 'vertical-lr' as const, 
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
        )}

        {/* Context menu for selected object */}
        {menuState.visible && (
          <div
            className="context-menu fixed z-[100] bg-white border border-gray-200 rounded-lg shadow-lg p-2 transform -translate-x-1/2 flex items-center gap-2"
            style={{ left: menuState.x, top: menuState.y }}
          >
            <button
              onClick={() => handleDelete()}
              className="flex items-center justify-center w-8 h-8 rounded bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
              title="Delete"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
            <button
              onClick={() => handleDuplicate()}
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
                  onClick={() => handleColorChange(color)}
                  className="w-6 h-6 rounded border border-gray-200 hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  title="Change color"
                />
              ))}
            </div>
            <div className="h-5 w-px bg-gray-200 mx-1"></div>
            <button
              onClick={() => handleAddComment()}
              className="flex items-center justify-center w-8 h-8 rounded text-gray-700 hover:bg-gray-50 transition-colors"
              title="Add comment"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </button>
          </div>
        )}

        {/* Stream loading and error UI */}
        {streamLoading && (
          <div className="absolute top-6 right-6 z-30 px-4 py-2 bg-white/90 rounded shadow text-indigo-700 font-semibold">
            Starting stream...
          </div>
        )}
        {error && (
          <div className="absolute top-6 right-6 z-30 px-4 py-2 bg-red-100 rounded shadow text-red-700 font-semibold">
            {error}
          </div>
        )}

        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <div
              className={`bg-white px-8 py-8 rounded-2xl shadow-xl min-w-[320px] max-w-[360px] flex flex-col items-center  transition-all duration-200 pointer-events-auto ${
                dragActive ? 'border-indigo-500 bg-indigo-50/80 opacity-95' : ''
              }`}
              onClick={() => inputRef.current?.click()}
              style={{ cursor: 'pointer' }}
            >
              <MdCloudUpload size={40} className="mb-3 text-slate-300" />
              <div className="font-light text-slate-800 text-lg text-center">
                Click to upload <span className="font-normal text-slate-400">or drag</span> your sketch here
              </div>
              <div className="text-slate-400 text-xs mt-1 mb-4 text-center">
                PNG, JPEG, GIF, MP4, WEBM - Max. 4MB
              </div>
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={handleInputChange}
                className="hidden"
              />
              {/* <input
                type="text"
                placeholder="https://..."
                className="w-60 px-4 py-2 border border-gray-200 rounded-lg text-sm text-slate-500 bg-slate-50 outline-none shadow-sm mt-0 mb-0 text-left"
                disabled
              /> */}
            </div>
          </div>
        )}
      </div>
    </>
  );
}



