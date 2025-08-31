import React, { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import { MdCloudUpload } from "react-icons/md";

export default function CanvasArea({workspace}: {workspace: any}) {
  const canvasRef = useRef<fabric.Canvas | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageRegion, setImageRegion] = useState<{left: number, top: number, width: number, height: number} | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [streaming, setStreaming] = useState(false);

  useEffect(() => {
    if (containerRef.current) {
      // Initialize Fabric.js canvas
      const canvas = new fabric.Canvas("fabricCanvas", {
        backgroundColor: "#f4f4f4",
        selection: true,
      });

      canvas.setWidth(window.innerWidth);
      canvas.setHeight(window.innerHeight);

      canvasRef.current = canvas;

      // No sample design objects

      return () => {
        canvas.dispose();
      };
    }
  }, []);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleImageUpload = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result as string;
      fabric.Image.fromURL(data, (img:any) => {
        // Center and scale image to fit canvas
        const canvas = canvasRef.current;
        if (!canvas) return;
        const maxW = canvas.getWidth();
        const maxH = canvas.getHeight();
        let scale = 1;
        if (img?.width > maxW || img.height > maxH) {
          scale = Math.min(maxW / img.width, maxH / img.height);
        }
        const left = (maxW - img.width * scale) / 2;
        const top = (maxH - img.height * scale) / 2;
        const width = img.width * scale;
        const height = img.height * scale;
        img.set({
          left,
          top,
          scaleX: scale,
          scaleY: scale,
          selectable: true,
        });
        canvas.clear();
        canvas.add(img);
        setImageLoaded(true);
        setImageRegion({ left, top, width, height });

        // Listen for move/transform events to update region
        img.on('modified', () => {
          const newLeft = img.left ?? 0;
          const newTop = img.top ?? 0;
          const newWidth = (img.width ?? 0) * (img.scaleX ?? 1);
          const newHeight = (img.height ?? 0) * (img.scaleY ?? 1);
          setImageRegion({ left: newLeft, top: newTop, width: newWidth, height: newHeight });
        });
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
const startPartialStream = () => {
    if (!imageRegion) return;
    const region = imageRegion;
    const fabricCanvas = canvasRef.current;
    if (!fabricCanvas) return;

    // Create a temp canvas
    const temp = document.createElement("canvas");
    temp.width = region.width;
    temp.height = region.height;
    const tctx = temp.getContext("2d");

    // Function to copy region from fabric to temp canvas
    let rafId = 0;
    const drawRegion = () => {
      if (!fabricCanvas || !tctx) return;
      tctx.clearRect(0, 0, region.width, region.height);
      tctx.drawImage(
        (fabricCanvas as any).lowerCanvasEl,
        region.left, region.top, region.width, region.height, // source rect
        0, 0, region.width, region.height // dest rect
      );
      rafId = requestAnimationFrame(drawRegion);
    };
    drawRegion();

    // Capture stream from temp canvas
    const mediaStream = temp.captureStream(30); // 30 FPS
    setStream(mediaStream);
    setStreaming(true);

    // Cleanup function to stop streaming
    const stop = () => {
      setStreaming(false);
      setStream(null);
      cancelAnimationFrame(rafId);
      mediaStream.getTracks().forEach((t) => t.stop());
    };
    // Optionally expose stop function or use a button to stop
    return stop;
  };

  return (
    <div
      ref={containerRef}
      style={{ position: "relative", width: "100vw", height: "100vh" }}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >

      <canvas id="fabricCanvas" style={{ border: "1px solid #ccc", display: "block" }}></canvas>

      {/* Visualize streaming region as overlay */}
      {imageRegion && (
        <div
          className="absolute z-20 pointer-events-none"
          style={{
            left: imageRegion.left,
            top: imageRegion.top,
            width: imageRegion.width,
            height: imageRegion.height,
            border: '2px dashed #6366f1',
            background: 'rgba(99,102,241,0.08)',
            boxSizing: 'border-box',
            borderRadius: 8,
            transition: 'all 0.2s',
          }}
        >
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-xs text-indigo-700 bg-white/80 px-2 py-1 rounded shadow">Streaming Region</span>
          </div>
        </div>
      )}

      {/* Stream region button */}
      <button
        className="absolute top-6 right-6 z-30 px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition"
        onClick={startPartialStream}
        disabled={streaming}
      >
        {streaming ? "Streaming..." : "Stream Region"}
      </button>

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
  );
}


