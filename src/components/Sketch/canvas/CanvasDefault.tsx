import React, { useEffect, useRef, useState } from "react";
import { MdCloudUpload } from "react-icons/md";
import { fabric } from "fabric";

import { ToolType } from "../Toolbar";

type Workspace = {
  whip_url: string;
};

interface CanvasDefaultProps {
  workspace: Workspace;
  activeTool: ToolType;
  brushColor?: string;
  brushWidth?: number;
}

export default function CanvasDefault({ 
  workspace, 
  activeTool = 'select',
  brushColor = '#000000',
  brushWidth = 5 
}: CanvasDefaultProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);

  // WebRTC / streaming refs
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const outgoingStreamRef = useRef<MediaStream | null>(null);
  const whipResourceUrlRef = useRef<string | null>(null);
  const silentAudioCtxRef = useRef<AudioContext | null>(null);
  const silentAudioOscRef = useRef<OscillatorNode | null>(null);

  // UI state
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [streamLoading, setStreamLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- File handling / UI ---
  const handleClick = () => inputRef.current?.click();

  const handleFile = (file: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      setError("Unsupported file type (image/video only).");
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setError("File too large (max 4MB).");
      return;
    }
    setError(null);
    setFileType(file.type);

    // For images, read the file directly instead of creating a blob URL
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setFileUrl(e.target.result as string);
        }
      };
      reader.onerror = () => {
        setError("Failed to read file");
      };
      reader.readAsDataURL(file);
    } else {
      // For videos, we still need to use blob URL
      const url = URL.createObjectURL(file);
      setFileUrl(url);
    }

    // small delay to allow canvas to draw then start streaming if desired
    // but we won't auto-start streaming here; user must press Start Stream button
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) handleFile(e.target.files[0]);
  };

  const handleUrlInput = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const url = (e.target as HTMLInputElement).value.trim();
      if (!url) return;
      
      try {
        setError(null);
        setStreamLoading(true);
        
        // For Firebase Storage or other problematic URLs, fetch first
        if (url.includes('firebasestorage.googleapis.com') || url.includes('alt=media')) {
          const response = await fetch(url);
          if (!response.ok) throw new Error('Failed to fetch image');
          
          const blob = await response.blob();
          const blobUrl = URL.createObjectURL(blob);
          setFileUrl(blobUrl);
          setFileType(blob.type || "image/png");
          return;
        }
        
        // Handle regular URLs with extensions
        if (!url.match(/\.(jpeg|jpg|png|gif|webp|mp4|webm)$/i)) {
          throw new Error("URL must point to an image or video (jpeg/jpg/png/gif/webp/mp4/webm).");
        }
        
        setFileUrl(url);
        setFileType(url.match(/\.(mp4|webm)$/i) ? "video/mp4" : "image/png");
      } catch (err: any) {
        setError(err.message || "Failed to load image");
      } finally {
        setStreamLoading(false);
      }
    }
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

  // --- Canvas drawing (with fabric.js integration) ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Initialize fabric.js Canvas if not already
    if (!fabricRef.current) {
      fabricRef.current = new fabric.Canvas(canvas);
      fabricRef.current.setWidth(350);
      fabricRef.current.setHeight(350);
      fabricRef.current.setBackgroundColor('#fff', fabricRef.current.renderAll.bind(fabricRef.current));
      fabricRef.current.renderOnAddRemove = true;
      fabricRef.current.selection = activeTool === 'select';
      fabricRef.current.isDrawingMode = activeTool === 'brush' || activeTool === 'pencil';
    }
    const fabricCanvas = fabricRef.current;

    // Helper to clear fabric and set size
    const resetFabric = (w: number, h: number) => {
      const bgImage = fabricCanvas.backgroundImage;
      fabricCanvas.clear();
      fabricCanvas.setWidth(w);
      fabricCanvas.setHeight(h);
      if (bgImage) {
        fabricCanvas.setBackgroundImage(bgImage, fabricCanvas.renderAll.bind(fabricCanvas));
      } else {
        fabricCanvas.setBackgroundColor('#fff', fabricCanvas.renderAll.bind(fabricCanvas));
      }
    };

    let intervalId: NodeJS.Timeout | null = null;
    let rafId = 0;

    if (fileUrl && fileType && fileType.startsWith("image/")) {
      console.log("Loading image from URL:", fileUrl);

      // Load image using fabric.js with crossOrigin
      fabric.Image.fromURL(fileUrl, (fabricImg) => {
        if (!fabricImg) {
          console.error("Failed to load image");
          setError("Failed to load image");
          return;
        }

        const imgWidth = fabricImg.width || 350;
        const imgHeight = fabricImg.height || 350;
        console.log("Image loaded successfully", { width: imgWidth, height: imgHeight });

        // Calculate dimensions maintaining aspect ratio
        const maxW = Math.min(700, window.innerWidth * 0.9);
        const maxH = Math.min(500, window.innerHeight * 0.7);
        let finalWidth = imgWidth;
        let finalHeight = imgHeight;

        // Scale down if image is too large
        if (imgWidth > maxW || imgHeight > maxH) {
          const scaleW = maxW / imgWidth;
          const scaleH = maxH / imgHeight;
          const scale = Math.min(scaleW, scaleH);
          finalWidth = Math.round(imgWidth * scale);
          finalHeight = Math.round(imgHeight * scale);
          console.log("Scaling image to fit", { finalWidth, finalHeight });
        }

        // Clear canvas and set new dimensions
        fabricCanvas.clear();
        fabricCanvas.setDimensions({ width: finalWidth, height: finalHeight });

        // Scale image proportionally using width
        fabricImg.scaleToWidth(finalWidth, true);
        console.log("Final image scale", { 
          scaleX: fabricImg.scaleX, 
          scaleY: fabricImg.scaleY 
        });

        // Set as background image
        fabricCanvas.setBackgroundImage(fabricImg, fabricCanvas.renderAll.bind(fabricCanvas), {
          originX: 'left',
          originY: 'top'
        });

        // Setup interval for stream
        intervalId = setInterval(() => fabricCanvas.renderAll(), 1000);
      }, { 
        crossOrigin: 'anonymous'  // Always set crossOrigin for remote images
      });
    }

    if (fileUrl && fileType && fileType.startsWith("video/")) {
      const video = videoRef.current;
      if (!video) return;
      video.src = fileUrl;
      video.muted = true;
      video.playsInline = true;

      const drawFrame = () => {
        if (!canvas || !video) return;
        if (video.videoWidth === 0 || video.videoHeight === 0) {
          rafId = requestAnimationFrame(drawFrame);
          return;
        }
        const maxW = 350;
        const maxH = 350;
        let w = video.videoWidth;
        let h = video.videoHeight;
        if (w > maxW || h > maxH) {
          const scale = Math.min(maxW / w, maxH / h);
          w *= scale;
          h *= scale;
        }
        resetFabric(w, h);
        // Draw video frame to a temp canvas, then to fabric as image
        const temp = document.createElement('canvas');
        temp.width = w;
        temp.height = h;
        const tctx = temp.getContext('2d');
        if (tctx) {
          tctx.clearRect(0, 0, w, h);
          tctx.drawImage(video, 0, 0, w, h);
          fabric.Image.fromURL(temp.toDataURL(), (fabricImg) => {
            fabricImg.set({
              left: 0,
              top: 0,
              selectable: false,
              evented: false,
              scaleX: w / video.videoWidth,
              scaleY: h / video.videoHeight
            });
            fabricCanvas.clear();
            fabricCanvas.setBackgroundImage(fabricImg, fabricCanvas.renderAll.bind(fabricCanvas));
          });
        }
        rafId = requestAnimationFrame(drawFrame);
      };
      const onPlay = () => {
        cancelAnimationFrame(rafId);
        drawFrame();
      };
      video.addEventListener("play", onPlay);
      video.addEventListener("pause", () => cancelAnimationFrame(rafId));
      video.addEventListener("ended", () => cancelAnimationFrame(rafId));
      if (!video.paused) onPlay();
      video.play().catch(() => {});
      return () => {
        cancelAnimationFrame(rafId);
        video.removeEventListener("play", onPlay);
        if (intervalId) clearInterval(intervalId);
      };
    }

    // If no file, just clear fabric
    if (!fileUrl) {
      resetFabric(350, 350);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [fileUrl, fileType]);

  // --- Silent audio track helper ---
  const createSilentAudioTrack = async (): Promise<MediaStreamTrack | null> => {
    try {
      // Use WebAudio to create a silent stream (oscillator at 0 volume)
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      silentAudioCtxRef.current = audioCtx;

      // create silent oscillator -> gain 0
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      gain.gain.value = 0; // silent
      osc.connect(gain);
      const dst = audioCtx.createMediaStreamDestination();
      gain.connect(dst);
      osc.start();

      // keep ref to stop later
      silentAudioOscRef.current = osc;

      const [track] = dst.stream.getAudioTracks();
      return track;
    } catch (err) {
      console.warn("Could not create silent audio track:", err);
      return null;
    }
  };

  // --- Start Streaming (WHIP) ---
  const startStreaming = async () => {
    setError(null);
    if (!workspace?.whip_url) {
      setError("No WHIP URL configured on workspace.");
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      setError("Canvas not available to capture.");
      return;
    }

    setStreamLoading(true);

    try {
      // 1) capture canvas stream (video)
      const stream = canvas.captureStream(30); // fps 30
      outgoingStreamRef.current = stream;

      // 2) add silent audio track for compatibility
      const audioTrack = await createSilentAudioTrack();
      if (audioTrack) {
        stream.addTrack(audioTrack);
      }

      // 3) create RTCPeerConnection
      const pc = new RTCPeerConnection();
      pcRef.current = pc;

      // Optional: handle ICE connection state for debugging
      pc.oniceconnectionstatechange = () => {
        console.debug("ICE state:", pc.iceConnectionState);
      };

      // 4) add tracks to pc
      stream.getTracks().forEach((t) => pc.addTrack(t, stream));

      // 5) create a data channel (optional - not used further here)
      try {
        pc.createDataChannel("whip-control");
      } catch (e) {
        // ignore; not critical
      }

      // 6) create offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // 7) POST offer.sdp to the WHIP endpoint (workspace.whip_url).
      // WHIP expects application/sdp body. Some servers return Location header with resource URL.
      const resp = await fetch(workspace.whip_url, {
        method: "POST",
        headers: {
          "Content-Type": "application/sdp",
        },
        body: offer.sdp,
      });

      if (!resp.ok) {
        const body = await resp.text().catch(() => "");
        throw new Error(`WHIP POST failed: ${resp.status} ${resp.statusText} ${body}`);
      }

      // Save resource URL if WHIP returns Location header (recommended).
      const location = resp.headers.get("Location");
      if (location) {
        whipResourceUrlRef.current = location;
      }

      // 8) read answer SDP from response body
      const answerSDP = await resp.text();
      if (!answerSDP) {
        throw new Error("Empty answer SDP from WHIP server");
      }

      await pc.setRemoteDescription({ type: "answer", sdp: answerSDP });

      setStreaming(true);
      setStreamLoading(false);
      console.log("Streaming started to WHIP URL");
    } catch (err: any) {
      console.error("Error starting streaming:", err);
      setError(String(err?.message || err));
      // cleanup partial resources
      await stopStreamingInternal();
      setStreamLoading(false);
    }
  };

  // --- Stop (internal) ---
  const stopStreamingInternal = async () => {
    try {
      // 1) if WHIP provided a resource URL, try DELETE it to stop ingestion
      const resource = whipResourceUrlRef.current;
      if (resource) {
        try {
          await fetch(resource, { method: "DELETE" });
        } catch (err) {
          // not fatal
          console.warn("Failed to DELETE WHIP resource:", err);
        }
        whipResourceUrlRef.current = null;
      }

      // 2) close RTCPeerConnection and remove tracks
      if (pcRef.current) {
        try {
          pcRef.current.getSenders().forEach((s) => {
            try {
              s.track?.stop();
            } catch {}
          });
          pcRef.current.close();
        } catch {}
        pcRef.current = null;
      }

      // 3) stop outgoing stream tracks
      if (outgoingStreamRef.current) {
        outgoingStreamRef.current.getTracks().forEach((t) => {
          try {
            t.stop();
          } catch {}
        });
        outgoingStreamRef.current = null;
      }

      // 4) stop silent audio oscillator and close AudioContext
      if (silentAudioOscRef.current) {
        try {
          silentAudioOscRef.current.stop();
        } catch {}
        silentAudioOscRef.current = null;
      }
      if (silentAudioCtxRef.current) {
        try {
          silentAudioCtxRef.current.close();
        } catch {}
        silentAudioCtxRef.current = null;
      }
    } catch (err) {
      console.warn("Error during stopStreamingInternal cleanup:", err);
    } finally {
      setStreaming(false);
      setStreamLoading(false);
    }
  };

  // --- Public Stop action ---
  const stopStreaming = async () => {
    setStreamLoading(true);
    await stopStreamingInternal();
    setStreamLoading(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // revoke object URL if it's a blob URL (used for videos)
      if (fileUrl && fileUrl.startsWith("blob:") && fileType?.startsWith("video/")) {
        URL.revokeObjectURL(fileUrl);
      }
      // stop streaming if active
      stopStreamingInternal();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Simple UI to remove loaded file ---
  const removeFile = () => {
    // Only revoke blob URLs for videos
    if (fileUrl && fileUrl.startsWith("blob:") && fileType?.startsWith("video/")) {
      URL.revokeObjectURL(fileUrl);
    }
    setFileUrl(null);
    setFileType(null);
    
    // Reset canvas to default state
    if (fabricRef.current) {
      fabricRef.current.clear();
      fabricRef.current.setWidth(350);
      fabricRef.current.setHeight(350);
      fabricRef.current.setBackgroundColor('#fff', fabricRef.current.renderAll.bind(fabricRef.current));
      fabricRef.current.renderAll();
    }
  };

  // Handle tool changes
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    canvas.isDrawingMode = activeTool === 'brush' || activeTool === 'pencil';
    canvas.selection = activeTool === 'select';

    if (canvas.isDrawingMode) {
      // Create brush based on tool type
      if (activeTool === 'brush') {
        canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
        canvas.freeDrawingBrush.width = brushWidth;
        canvas.freeDrawingBrush.color = brushColor;
      } else if (activeTool === 'pencil') {
        canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
        canvas.freeDrawingBrush.width = brushWidth * 0.5; // Thinner for pencil
        canvas.freeDrawingBrush.color = brushColor;
      }

      // Set brush properties
      if (canvas.freeDrawingBrush) {
        canvas.freeDrawingBrush.strokeLineCap = activeTool === 'brush' ? 'round' : 'square';
        canvas.freeDrawingBrush.strokeLineJoin = activeTool === 'brush' ? 'round' : 'miter';
      }
    }

    // Update cursor based on tool
    canvas.defaultCursor = activeTool === 'select' ? 'default' : 'crosshair';
    canvas.hoverCursor = activeTool === 'select' ? 'move' : 'crosshair';

  }, [activeTool, brushColor, brushWidth]);

  // Helper function to safely perform canvas operations
  const withCanvas = (callback: (canvas: fabric.Canvas) => void) => {
    const canvas = fabricRef.current;
    if (canvas) {
      callback(canvas);
    }
  };

  // Reset canvas to specified dimensions
  const resetCanvas = (w: number, h: number) => {
    withCanvas(canvas => {
      const bgImage = canvas.backgroundImage;
      canvas.clear();
      canvas.setWidth(w);
      canvas.setHeight(h);
      if (bgImage) {
        canvas.setBackgroundImage(bgImage, canvas.renderAll.bind(canvas));
      } else {
        canvas.setBackgroundColor('#fff', canvas.renderAll.bind(canvas));
      }
    });
  };

  return (
    <div
      className={`w-full h-full flex flex-col items-center justify-center border-2 border-dashed rounded-xl min-h-[400px] min-w-[350px] bg-white/80 transition-colors duration-200 ${
        dragActive ? "border-indigo-500 bg-indigo-50/80" : "border-gray-300"
      }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={handleClick}
      style={{
        cursor: fileUrl ? "default" : "pointer",
        position: "relative",
        overflow: "auto",
        justifyContent: "center",
        alignItems: "center",
        display: "flex",
      }}
    >
      {streamLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/85 z-20">
          <span className="text-lg font-semibold text-gray-700">Processing...</span>
        </div>
      )}

      {!fileUrl ? (
        <>
          <MdCloudUpload className="text-4xl text-gray-400 mb-2" />
          <div className="text-center">
            <span className="font-semibold text-gray-600 cursor-pointer hover:underline">Click to upload</span>
            <span className="text-gray-400"> or drag</span>
          </div>
          <div className="text-xs text-gray-400 mt-1">PNG, JPEG, GIF, MP4, WEBM - Max. 4MB</div>
          <input ref={inputRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleInputChange} />
          <input
            type="text"
            placeholder="https://..."
            className="mt-6 w-72 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 text-gray-700 bg-white shadow-sm"
            onKeyDown={handleUrlInput}
          />
          {error && <div className="text-red-600 mt-2 text-sm">{error}</div>}
        </>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-4">
          <canvas
            ref={canvasRef}
            className="rounded-lg shadow bg-white"
            style={{
              maxWidth: "90vw",
              maxHeight: "70vh",
              width: "auto",
              height: "auto",
              display: "block",
              margin: "0 auto"
            }}
          />

          {/* hidden video element used for video->canvas draw */}
          {fileType && fileType.startsWith("video/") && (
            <video ref={videoRef} src={fileUrl} controls className="hidden" />
          )}

          <div className="flex gap-3 mt-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeFile();
              }}
              className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition"
            >
              Remove
            </button>

            {!streaming ? (
              <button
                onClick={async (e) => {
                  e.stopPropagation();
                  await startStreaming();
                }}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
                disabled={streamLoading}
              >
                Start Stream
              </button>
            ) : (
              <button
                onClick={async (e) => {
                  e.stopPropagation();
                  await stopStreaming();
                }}
                className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition"
                disabled={streamLoading}
              >
                Stop Stream
              </button>
            )}
          </div>

          {error && <div className="text-red-600 mt-2 text-sm">{error}</div>}
          {streaming && <div className="text-xs text-green-600 mt-2">Streaming to WHIP URL</div>}
        </div>
      )}
    </div>
  );
}

