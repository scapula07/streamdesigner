import React, { useRef, useState, useEffect } from "react";
import { MdCloudUpload } from "react-icons/md";
// import { createStream } from "@/lib/api";
export default function CanvasDefault() {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  // Remove streaming/WHIP logic and related state, as it's not used in this component

  const handleFile = (file: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) return;
    if (file.size > 4 * 1024 * 1024) return; // 4MB limit
    setFileType(file.type);
    setFileUrl(URL.createObjectURL(file));
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
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

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleUrlInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const url = (e.target as HTMLInputElement).value;
      if (url.match(/\.(jpeg|jpg|png|gif|webp|mp4|webm)$/i)) {
        setFileUrl(url);
        setFileType(url.match(/\.(mp4|webm)$/i) ? "video" : "image");
      }
    }
  };

  // Draw image on canvas when fileUrl and fileType are set
  useEffect(() => {
    if (!fileUrl || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (fileType && fileType.startsWith("image/")) {
      const img = new window.Image();
      img.onload = () => {
        // Fit image to canvas
        let w = img.width;
        let h = img.height;
        const maxW = 350, maxH = 350;
        if (w > maxW || h > maxH) {
          const scale = Math.min(maxW / w, maxH / h);
          w = w * scale;
          h = h * scale;
        }
        canvas.width = w;
        canvas.height = h;
        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
      };
      img.src = fileUrl;
    }
  }, [fileUrl, fileType]);

  // For video: draw current frame to canvas as video plays
  useEffect(() => {
    if (!fileUrl || !canvasRef.current || !(fileType && fileType.startsWith("video/"))) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const video = videoRef.current;
    if (!ctx || !video) return;

    let animationId: number;
    const drawFrame = () => {
      // Fit video to canvas
      let w = video.videoWidth;
      let h = video.videoHeight;
      const maxW = 350, maxH = 350;
      if (w > maxW || h > maxH) {
        const scale = Math.min(maxW / w, maxH / h);
        w = w * scale;
        h = h * scale;
      }
      canvas.width = w;
      canvas.height = h;
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(video, 0, 0, w, h);
      animationId = requestAnimationFrame(drawFrame);
    };
    if (!video.paused) drawFrame();
    video.addEventListener("play", drawFrame);
    video.addEventListener("pause", () => cancelAnimationFrame(animationId));
    video.addEventListener("ended", () => cancelAnimationFrame(animationId));
    return () => {
      cancelAnimationFrame(animationId);
      video.removeEventListener("play", drawFrame);
      video.removeEventListener("pause", () => cancelAnimationFrame(animationId));
      video.removeEventListener("ended", () => cancelAnimationFrame(animationId));
    };
  }, [fileUrl, fileType]);

  return (
    <div
      className={`w-full h-full flex flex-col items-center justify-center border-2 border-dashed rounded-xl min-h-[400px] min-w-[350px] bg-white/80 transition-colors duration-200 ${dragActive ? "border-indigo-500 bg-indigo-50/80" : "border-gray-300"}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={handleClick}
      style={{ cursor: fileUrl ? "default" : "pointer" }}
    >
      {!fileUrl ? (
        <>
          <MdCloudUpload className="text-4xl text-gray-400 mb-2" />
          <div className="text-center">
            <span className="font-semibold text-gray-600 cursor-pointer hover:underline">Click to upload</span>
            <span className="text-gray-400"> or drag</span>
          </div>
          <div className="text-xs text-gray-400 mt-1">PNG, JPEG, GIF, MP4, WEBM - Max. 4MB</div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={handleInputChange}
          />
          <input
            type="text"
            placeholder="https://..."
            className="mt-6 w-72 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 text-gray-700 bg-white shadow-sm"
            onKeyDown={handleUrlInput}
          />
        </>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center">
          {/* Canvas for image or video frame */}
          <canvas ref={canvasRef} className="max-h-[350px] max-w-full rounded-lg shadow bg-black" />
          {/* Hidden video for drawing frames to canvas */}
          {fileType && fileType.startsWith("video/") && (
            <video
              ref={videoRef}
              src={fileUrl}
              controls
              className="hidden"
              onPlay={() => {
                // trigger useEffect
                if (canvasRef.current && videoRef.current) {
                  // nothing needed, handled by effect
                }
              }}
            />
          )}
          <button
            className="mt-4 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition"
            onClick={e => {
              e.stopPropagation();
              setFileUrl(null);
              setFileType(null);
              if (canvasRef.current) {
                const ctx = canvasRef.current.getContext("2d");
                if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
              }
            }}
          >Remove</button>
        </div>
      )}
    </div>
  );
}

