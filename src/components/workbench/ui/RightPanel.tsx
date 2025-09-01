import React, { useState, useRef, useEffect } from "react";
import { getStreamStatusV2 } from "@/lib/api";

export default function RightPanel({workspace}: {workspace: any}) {
  const [expanded, setExpanded] = useState(false);
  const [controlNetsExpanded, setControlNetsExpanded] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const [panelLeft, setPanelLeft] = useState<number | null>(null);
  const iframeHeight = 200;
  const iframeWidth = '100%';

  // --- Stream status polling (copied from Preview) ---
  const [streamStatus, setStreamStatus] = useState<any>(null);
  useEffect(() => {
    let interval: NodeJS.Timeout;
    let stopped = false;
    async function poll() {
      if (workspace?.stream_id) {
        try {
          const status = await getStreamStatusV2(workspace.stream_id);
          if (!stopped) setStreamStatus(status);
        } catch (err) {
          if (!stopped) setStreamStatus(null);
        }
      }
    }
    poll();
    interval = setInterval(poll, 30000);
    return () => {
      stopped = true;
      clearInterval(interval);
    };
  }, [workspace?.stream_id]);

  // Determine live/offline using absence of gateway_status.error_message
  const isLive = !!(
    streamStatus &&
    streamStatus.data &&
    streamStatus.data.gateway_status &&
    !streamStatus.data.gateway_status.error_message
  );

  // Console bar state (collapsed/expanded)
  const [consoleOpen, setConsoleOpen] = useState(false);
  return (
    <aside ref={panelRef} className="w-80 bg-white rounded-2xl shadow-xl flex flex-col border border-gray-200 overflow-hidden " style={{ minWidth: 320, maxWidth: 360 }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <span className="text-gray-900 font-semibold text-lg">Create</span>
        <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-400 hover:bg-gray-200">
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#E5E7EB"/><path d="M12 8v4l2 2" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>
      {/* Stream status overlay (like Preview) */}
      {workspace?.output_playback_id && (
        <div className="w-full flex flex-col items-center my-2">
          <div className="w-full relative px-3 pb-2 pt-1">
            {/* Overlay status tab inside player */}
            <div className="absolute top-2 left-2 z-20 flex gap-2 px-3 py-1 items-center ">
              <span className="text-white text-sm font-light">Stream is <span className={`px-2 py-0.5 text-xs ${isLive ? 'text-green-400' : 'text-red-400'}`}>{isLive ? 'LIVE' : 'OFFLINE'}</span></span>
              <button
                className="ml-2 px-2 py-0.5 rounded text-xs bg-white/30 backdrop-blur-md text-green-600 font-semibold bg-gray-100 hover:bg-gray-200"
                onClick={() => setConsoleOpen(v => !v)}
              >
                Console
              </button>
            </div>
            <iframe
              src={`https://lvpr.tv/?v=${workspace.output_playback_id}`}
              className="rounded-lg border-0 w-full transition-all duration-300"
              style={{ aspectRatio: '16/9', height: 200, minHeight: 120, maxHeight: 480 }}
              allow="autoplay; encrypted-media"
              allowFullScreen
            ></iframe>
            <div className="relative group">
              <button
                className="absolute right-2 bottom-2 bg-white/80 hover:bg-white text-gray-700 border border-gray-200 rounded-full p-1 shadow transition"
                style={{ zIndex: 2 }}
                onClick={() => setExpanded(e => !e)}
                aria-label={expanded ? 'Collapse video' : 'Expand video'}
              >
                {expanded ? (
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                ) : (
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                )}
              </button>
              <div className="pointer-events-none absolute bottom-10 right-0 z-50 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs rounded px-3 py-2 shadow-lg whitespace-nowrap min-w-max">
                {expanded
                  ? 'Collapse video overlay (return to sidebar)'
                  : 'Expand video overlay (show at top right of screen)'}
              </div>
            </div>
          </div>
          {expanded && (
            <div
              className="fixed z-[1050] flex flex-col items-center"
              style={{ top: 88, right: 24, minWidth: 400, width: 640, maxWidth: '98vw', pointerEvents: 'auto' }}
            >
              <div className="relative bg-black rounded-2xl shadow-2xl flex flex-col items-center border-4 border-white overflow-hidden" style={{ width: '100%', height: 480, pointerEvents: 'auto' }}>
                <iframe
                  src={`https://lvpr.tv/?v=${workspace.output_playback_id}`}
                  className="rounded-2xl border-0 w-full h-full transition-all duration-300 bg-black"
                  style={{ aspectRatio: '1/1', minHeight: 320, maxHeight: 600, pointerEvents: 'none' }}
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                ></iframe>
                <button
                  className="absolute bottom-4 right-4 bg-white/80 hover:bg-white text-gray-700 border border-gray-200 rounded-full p-1 shadow transition"
                  style={{ zIndex: 2, pointerEvents: 'auto' }}
                  onClick={() => setExpanded(false)}
                  title={'Collapse'}
                >
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      {/* Stream console bar at bottom right inside panel */}
      <div
        className={`transition-all duration-300 ${consoleOpen ? 'h-40' : 'h-10'} bg-gray-50 border-t border-gray-200 flex flex-col justify-end absolute right-0 bottom-0 z-30 w-full`}
        style={{ minWidth: 320, maxWidth: 360, marginTop: 0, paddingTop: 0 }}
      >
        <div className="flex items-center px-4 py-2 cursor-pointer select-none" onClick={() => setConsoleOpen(v => !v)}>
          <span className="font-semibold text-xs mr-2">Stream Console</span>
          <span className={`text-xs font-semibold ${isLive ? 'text-green-600' : 'text-red-600'}`}>{isLive ? 'LIVE' : 'OFFLINE'}</span>
          <span className="ml-auto text-gray-400">{consoleOpen ? (
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M6 15l6-6 6 6" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          ) : (
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          )}</span>
        </div>
        {consoleOpen && (
          <div className="px-4 pb-2 pt-0 text-xs -mt-10 overflow-y-auto" style={{ maxHeight: 120 }}>
            {streamStatus && streamStatus.data ? (
              <div>
                <div className="mb-1">
                  <span className="font-semibold">Status: </span>
                  <span className={isLive ? 'text-green-600' : 'text-red-600'}>
                    {isLive ? 'LIVE (Stream is online and healthy)' : 'OFFLINE (Stream is not active)'}
                  </span>
                </div>
                {streamStatus.data.gateway_status?.error_message && (
                  <div className="mb-1">
                    <span className="font-semibold text-red-600">Error: </span>
                    <span className="text-red-600">{streamStatus.data.gateway_status.error_message}</span>
                  </div>
                )}
                {streamStatus.data.ingest_metrics && (
                  <div className="mb-1">
                    <span className="font-semibold">Connection Quality: </span>
                    <span>{streamStatus.data.ingest_metrics.stats?.conn_quality || 'Unknown'}</span>
                  </div>
                )}
                {typeof streamStatus.data.input_status?.fps === 'number' && (
                  <div className="mb-1">
                    <span className="font-semibold">Input FPS: </span>
                    <span>{streamStatus.data.input_status.fps}</span>
                  </div>
                )}
                {streamStatus.data.orchestrator_info?.address && (
                  <div className="mb-1">
                    <span className="font-semibold">Server: </span>
                    <span>{streamStatus.data.orchestrator_info.address}</span>
                  </div>
                )}
                {streamStatus.data.stream_id && (
                  <div className="mb-1">
                    <span className="font-semibold">Stream ID: </span>
                    <span>{streamStatus.data.stream_id}</span>
                  </div>
                )}
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs text-gray-500 underline">Show technical details</summary>
                  <pre className="text-xs mt-1 bg-gray-100 p-2 rounded border border-gray-200">{JSON.stringify(streamStatus, null, 2)}</pre>
                </details>
              </div>
            ) : (
              <span>No stream status available.</span>
            )}
          </div>
        )}
      </div>
      <div className="flex-1 overflow-y-auto px-5 pb-5" style={{paddingBottom: 0, marginBottom: 0}}>
        {/* Settings Controls */}
        <div className="space-y-4 mb-6">
          {/* Control Nets */}
          <div>
            <div className="flex items-center justify-between" onClick={() => setControlNetsExpanded(!controlNetsExpanded)}>
              <label className="flex items-center text-sm text-gray-700">
                Control Nets
                <button className="ml-1 text-gray-400 hover:text-gray-600">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                </button>
              </label>
              <div className="flex items-center gap-2">
                <svg 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    className={`transform transition-transform ${controlNetsExpanded ? 'rotate-180' : ''}`}
                    >
                    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>

            
            {/* Nested Controls */}
            <div className={`pl-4 mt-2 space-y-4 ${controlNetsExpanded ? '' : 'hidden'}`}>
              {/* Pose */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="flex items-center text-sm text-gray-700">Pose</label>
                  <span className="text-sm text-gray-600">0.14</span>
                </div>
                <input type="range" min="0" max="1" step="0.01" defaultValue="0.14"
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
              </div>

              {/* RED */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="flex items-center text-sm text-gray-700">RED</label>
                  <span className="text-sm text-gray-600">0.27</span>
                </div>
                <input type="range" min="0" max="1" step="0.01" defaultValue="0.27"
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
              </div>

              {/* Canny */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="flex items-center text-sm text-gray-700">Canny</label>
                  <span className="text-sm text-gray-600">0.34</span>
                </div>
                <input type="range" min="0" max="1" step="0.01" defaultValue="0.34"
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
              </div>

              {/* Depth */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="flex items-center text-sm text-gray-700">Depth</label>
                  <span className="text-sm text-gray-600">0.66</span>
                </div>
                <input type="range" min="0" max="1" step="0.01" defaultValue="0.66"
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
              </div>
            </div>
          </div>

          {/* Denoise */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center text-sm text-gray-700">
                Denoise
                <button className="ml-1 text-gray-400 hover:text-gray-600">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                </button>
              </label>
              <div className="flex gap-2">
                <button className="p-1 bg-gray-100 rounded">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
                </button>
                <button className="p-1 bg-gray-100 rounded">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h4v4H4zM12 4h4v4h-4zM4 12h4v4H4zM12 12h4v4h-4z"/></svg>
                </button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-1">X</div>
                <input type="number" value="2" className="w-full px-2 py-1 text-sm border rounded" />
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-1">Y</div>
                <input type="number" value="4" className="w-full px-2 py-1 text-sm border rounded" />
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-1">Z</div>
                <input type="number" value="6" className="w-full px-2 py-1 text-sm border rounded" />
              </div>
            </div>
          </div>
        </div>

        {/* Prompt */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs text-gray-500 font-medium">Prompt</label>
            <button className="text-xs text-indigo-500 font-semibold">Describe</button>
          </div>
          <textarea className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none" rows={3} defaultValue="photorealistic bag with green color" />
        </div>
        {/* Palette */}
        <div className="mb-4">
          <div className="flex items-center gap-1 mb-1">
            <label className="block text-xs text-gray-500 font-medium">Palette</label>
            <span className="text-xs text-gray-400 ml-1">&#9432;</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-gray-50 rounded-lg px-2 py-1 border border-gray-200">
              <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f3a8.svg" alt="palette" className="w-6 h-6 mr-2" />
              <span className="text-gray-900 text-sm font-medium">Vizcom General</span>
              <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-1 rounded">v2</span>
            </div>
            <span className="ml-auto text-gray-900 text-sm font-semibold">100%</span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-gray-400">Color-Match</span>
            <input type="checkbox" className="accent-indigo-500" disabled />
          </div>
        </div>
        {/* Reference */}
        <div className="mb-4">
          <div className="flex items-center gap-1 mb-1">
            <label className="block text-xs text-gray-500 font-medium">Reference</label>
            <span className="text-xs text-gray-400 ml-1">&#9432;</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-gray-50 rounded-lg px-2 py-1 border border-gray-200">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="4" fill="#E5E7EB"/><rect x="7" y="7" width="10" height="10" rx="2" fill="#fff"/></svg>
              <span className="ml-2 text-gray-400 text-sm">Add...</span>
            </div>
            <span className="ml-auto text-gray-900 text-sm font-semibold">100%</span>
          </div>
        </div>
        {/* Drawing */}
        <div className="mb-4">
          <label className="block text-xs text-gray-500 font-medium mb-1">Drawing</label>
          <div className="flex items-center gap-2">
            <select className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-gray-900 text-sm font-medium w-16">
              <option>1</option>
            </select>
            <span className="text-xs text-gray-400 ml-2">Influence</span>
            <input type="range" min={0} max={100} value={100} className="accent-indigo-500 mx-2" style={{ width: 80 }} readOnly />
            <span className="text-gray-900 text-sm font-semibold">100%</span>
          </div>
        </div>
        {/* Generate Button */}
        <button className="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold text-base hover:bg-indigo-700 transition mt-2">Generate</button>
      </div>
    </aside>
  );
}
