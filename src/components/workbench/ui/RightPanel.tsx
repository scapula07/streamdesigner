import React, { useState, useRef, useEffect } from "react";

export default function RightPanel({workspace}: {workspace: any}) {
  const [expanded, setExpanded] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const [panelLeft, setPanelLeft] = useState<number | null>(null);
  const iframeHeight = 200;
  const iframeWidth = '100%';

  useEffect(() => {
    if (expanded && panelRef.current) {
      const rect = panelRef.current.getBoundingClientRect();
      setPanelLeft(rect.right);
    }
  }, [expanded]);
  return (
    <aside ref={panelRef} className="w-80 bg-white rounded-2xl shadow-xl flex flex-col border border-gray-200 overflow-hidden " style={{ minWidth: 320, maxWidth: 360 }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <span className="text-gray-900 font-semibold text-lg">Create</span>
        <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-400 hover:bg-gray-200">
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#E5E7EB"/><path d="M12 8v4l2 2" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>
      {/* Tabs */}
      <div className="flex flex-col items-center  py-1 mx-4 rounded-xl mb-4 mt-1">
        {workspace?.output_playback_id && (
          <div className="w-full flex flex-col items-center my-2">
            <div className="w-full relative">
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
      </div>
      <div className="flex-1 overflow-y-auto px-5 pb-5">
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
