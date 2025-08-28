import React, { useState, useEffect } from "react";
import { useRouter } from 'next/router';
import { workspaceApi } from '@/firebase/workspace';
import Toolbar from "@/components/Sketch/Toolbar";
import Navbar from "@/components/Sketch/Navbar";
import CanvasDefault from "@/components/Sketch/canvas/CanvasDefault";
import Scene from "@/components/Sketch/Scene";
import Preview from "@/components/Sketch/Preview";
import Settings from "@/components/Sketch/Settings";
import { FiSettings, FiX } from "react-icons/fi";
import { userStore } from "@/recoil";
import { useRecoilValue } from "recoil";


export default function Sketch() {
  const [prompt, setPrompt] = useState("");
  const [creativity, setCreativity] = useState(60);
  const [activeTab, setActiveTab] = useState("sketch");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [workspace, setWorkspace] = useState<any>(null);
  const [wsLoading, setWsLoading] = useState(true);
  const user = useRecoilValue(userStore) as { email: string } ;
  const router = useRouter();
  const { workspaceId } = router.query;

  useEffect(() => {
    if (!workspaceId) return;
    setWsLoading(true);
    workspaceApi.getWorkspaceByID(workspaceId as string)
      .then(ws => setWorkspace(ws))
      .finally(() => setWsLoading(false));
  }, [workspaceId]);

  if (wsLoading) {
    return <div className="flex items-center justify-center min-h-screen text-gray-500">Loading workspace...</div>;
  }
  if (!workspace) {
    return <div className="flex items-center justify-center min-h-screen text-red-500">Workspace not found.</div>;
  }



  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <Navbar user={user} workspace={workspace}/>

      {/* Main Content */}
      <main className="flex-1 flex flex-row gap-4 p-6 relative overflow-x-hidden">
        {/* Left Pane: Toolbar */}
        <Toolbar />
        {/* Middle: Sketch/Canvas Area */}
        <section className="flex-1 bg-white rounded-lg shadow flex flex-col">
          {/* Canvas Area */}
          <div className="flex-1 flex items-center justify-center bg-blue-50 relative">
            <CanvasDefault />
          </div>
        </section>

        {/* Right: Mockup Preview Area */}
        <section className="w-1/2 bg-white rounded-lg shadow flex flex-col">
          <Preview activeTab={activeTab} />
          {/* Controls */}
          <div className="px-4 py-3 border-t flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700 mb-1">Prompt</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Describe your design..."
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
            />
            <div className="flex items-center gap-3 mt-2">
              <span className="text-sm text-gray-600">Creativity</span>
              <input
                type="range"
                min={0}
                max={100}
                value={creativity}
                onChange={e => setCreativity(Number(e.target.value))}
                className="w-40 accent-indigo-500"
              />
              <span className="text-xs text-gray-500">{creativity}</span>
              <button className="ml-auto px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition">Generate</button>
            </div>
          </div>
        </section>
        {/* Scene sidebar */}
        <Scene />

        {/* Settings Button (fixed to right edge) */}
        {!settingsOpen && (
          <button
            className="fixed top-24 right-6 z-30 bg-indigo-600 text-white p-2 rounded-full shadow-lg hover:bg-indigo-700 transition"
            onClick={() => setSettingsOpen(true)}
            aria-label="Open Settings"
          >
            <FiSettings size={22} />
          </button>
        )}

        {/* Settings sidebar (slide-in) */}
        <div
          className={`fixed top-0 right-0 h-full w-80 max-w-full z-40 bg-white shadow-lg border-l border-gray-200 transform transition-transform duration-300 ${settingsOpen ? 'translate-x-0' : 'translate-x-full'}`}
          style={{ boxShadow: settingsOpen ? '0 0 24px 0 rgba(0,0,0,0.08)' : 'none' }}
        >
          <div className="flex justify-end p-3">
            <button
              className="text-gray-500 hover:text-indigo-600"
              onClick={() => setSettingsOpen(false)}
              aria-label="Close Settings"
            >
              <FiX size={22} />
            </button>
          </div>
          <div className="h-[calc(100%-48px)] overflow-y-auto">
            <Settings />
          </div>
        </div>
      </main>
    </div>
  );
}