import React, { useEffect, useState } from "react";
import { getStreamStatusV2,updatePrompt } from "@/lib/api";
interface PreviewProps {
  activeTab: string;
}
export default function Preview({ activeTab, workspace }: PreviewProps & { workspace: any }) {
  const [streamStatus, setStreamStatus] = useState<any>(null);

  // Poll stream status every 30s
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
    console.log("Stream Status:", streamStatus);

  // Determine live/offline using absence of gateway_status.error_message
  const isLive = !!(
    streamStatus &&
    streamStatus.data &&
    streamStatus.data.gateway_status &&
    !streamStatus.data.gateway_status.error_message
  );

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      {/* Preview Area with Overlay Status Tab inside */}
      <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-blue-200 to-green-200 relative">
        {/* Overlay Status Tab inside player */}
        <div className="absolute top-4 left-4 z-20 flex gap-2 px-4 py-1 rounded-xl   items-center">
          <span className="text-white">Stream is<span className={`px-2 py-0.5  text-xs  ${isLive ? 'text-green-700' : ' text-red-700'}`}>{isLive ? 'LIVE' : 'OFFLINE'}</span> </span>
          <button
            className="ml-4 px-2 py-0.5 rounded text-xs bg-white/30 backdrop-blur-md text-green-600 font-semibold bg-gray-100 hover:bg-gray-200 "
            onClick={() => setDrawerOpen(v => !v)}
          >
            Console
          </button>
        </div>
        <iframe
          src={`https://lvpr.tv/?v=${workspace?.output_playback_id}`}
          className="absolute inset-0 w-full h-full"
          style={{ border: 'none' }}
          allow="autoplay; encrypted-media"
          allowFullScreen
        ></iframe>
      </div>
      {/* Drawer for console */}
      {drawerOpen && (
        <div className="fixed top-0 right-0 w-full max-w-lg h-full bg-white shadow-2xl z-50 border-l border-white/30 overflow-y-auto">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <span className="font-semibold text-lg">Stream Console</span>
            <button className="text-gray-500 hover:text-black text-2xl" onClick={() => setDrawerOpen(false)}>&times;</button>
          </div>
          <div className="p-4 text-sm whitespace-pre-wrap break-words">
            {streamStatus && streamStatus.data ? (
              <div>
                <div className="mb-2">
                  <span className="font-semibold">Status: </span>
                  <span className={isLive ? 'text-green-600' : 'text-red-600'}>
                    {isLive ? 'LIVE (Stream is online and healthy)' : 'OFFLINE (Stream is not active)'}
                  </span>
                </div>
                {streamStatus.data.gateway_status?.error_message && (
                  <div className="mb-2">
                    <span className="font-semibold text-red-600">Error: </span>
                    <span className="text-red-600">{streamStatus.data.gateway_status.error_message}</span>
                  </div>
                )}
                {streamStatus.data.ingest_metrics && (
                  <div className="mb-2">
                    <span className="font-semibold">Connection Quality: </span>
                    <span>{streamStatus.data.ingest_metrics.stats?.conn_quality || 'Unknown'}</span>
                  </div>
                )}
                {typeof streamStatus.data.input_status?.fps === 'number' && (
                  <div className="mb-2">
                    <span className="font-semibold">Input FPS: </span>
                    <span>{streamStatus.data.input_status.fps}</span>
                  </div>
                )}
                {streamStatus.data.orchestrator_info?.address && (
                  <div className="mb-2">
                    <span className="font-semibold">Server: </span>
                    <span>{streamStatus.data.orchestrator_info.address}</span>
                  </div>
                )}
                {streamStatus.data.stream_id && (
                  <div className="mb-2">
                    <span className="font-semibold">Stream ID: </span>
                    <span>{streamStatus.data.stream_id}</span>
                  </div>
                )}
                <details className="mt-4">
                  <summary className="cursor-pointer text-xs text-gray-500 underline">Show technical details</summary>
                  <pre className="text-xs mt-2 bg-gray-50 p-2 rounded border border-gray-200">{JSON.stringify(streamStatus, null, 2)}</pre>
                </details>
              </div>
            ) : (
              <span>No stream status available.</span>
            )}
          </div>
        </div>
      )}
      {/* (Removed duplicate Preview Area and iframe) */}
    </>
  );
}
