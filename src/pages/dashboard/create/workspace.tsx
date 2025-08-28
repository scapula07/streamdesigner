import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { userStore } from '@/recoil';
import { useRecoilValue } from 'recoil';
import { workspaceApi } from '@/firebase/workspace';
import { createStream } from '@/lib/api';
export default function CreateWorkspacePage() {
  const [step, setStep] = useState(0);
  const [workspaceName, setWorkspaceName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const user = useRecoilValue(userStore);
  const router = useRouter();

  const [error, setError] = useState<string | null>(null);

  const [workspaceId, setWorkspaceId] = useState<string | null>(null);

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!workspaceName.trim()) return;
    if (!user?.id) {
      setError('User not found.');
      return;
    }
    setIsLoading(true);
    try {
      // 1. Create workspace
      const ws = await workspaceApi.createWorkspace(user.id, { name: workspaceName, email: user?.email });
      setWorkspaceId(ws.id);
      // 2. Create stream
      const streamRes = await createStream();
      // 3. Update workspace with stream fields
      if (streamRes && ws.id) {
        await workspaceApi.updateWorkspace(ws.id, {
          stream_id: streamRes.id,
          stream_key: streamRes.stream_key,
          output_stream_url: streamRes.output_stream_url,
          output_playback_id: streamRes.output_playback_id,
          whip_url: streamRes.whip_url,
          },user?.id
        );
      }
      setStep(1);
    } catch (err) {
      setError('Failed to create workspace. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccessContinue = () => {
    if (workspaceId) {
      router.push(`/sketch?workspaceId=${workspaceId}`);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-white">
      <div className="w-full max-w-lg mx-auto flex flex-col items-center justify-center min-h-screen">
        {step === 0 && (
          <form
            onSubmit={handleContinue}
            className="w-full flex flex-col items-center justify-center"
          >
            <h1 className="text-3xl font-bold text-center mb-4 mt-12">Create a new workspace</h1>
            <p className="text-center text-gray-500 mb-8 max-w-md">
              Workspaces are shared environments where teams can collaborate on files.<br />
              After creating a workspace, you can invite members to join.
            </p>
            <div className="w-full mb-6">
              <label htmlFor="workspaceName" className="block text-base font-medium mb-2">Workspace name</label>
              <input
                id="workspaceName"
                type="text"
                className="w-full px-4 py-2 rounded-md border border-[#6c63ff] focus:outline-none focus:ring-2 focus:ring-[#6c63ff] text-lg bg-white"
                value={workspaceName}
                onChange={e => setWorkspaceName(e.target.value)}
                placeholder="Barth's Workspace"
                required
              />
            </div>
            {error && <div className="text-red-500 text-sm mb-2 w-full">{error}</div>}
            <button
              type="submit"
              className="w-full py-3 rounded-md bg-[#3a32d1] text-white font-semibold text-lg shadow hover:bg-[#2d259c] transition mb-4 disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={!workspaceName.trim() || isLoading}
            >
              {isLoading ? 'Creating...' : 'Continue'}
            </button>
            <a href="#" className="text-[#23272e] underline text-base mt-2">Join an existing workspace</a>
            {/* Progress bar */}
            <div className="w-full flex justify-center mt-16">
              <div className="w-1/2 h-1 rounded-full bg-[#e5e5e5]">
                <div className="h-1 rounded-full bg-[#3a32d1] transition-all" style={{ width: '50%' }} />
              </div>
            </div>
          </form>
        )}
        {step === 1 && (
          <div className="w-full flex flex-col items-center justify-center mt-24">
            <h1 className="text-3xl font-bold text-center mb-6">You're all set</h1>
            <p className="text-center text-gray-500 mb-8 max-w-md">
              We sent you an email to help you get started. It contains helpful video tutorials and links to download our desktop app.<br /><br />
              You can update workspace roles on the members page after setting up.
            </p>
            <button
              className="w-full py-3 rounded-md bg-[#3a32d1] text-white font-semibold text-lg shadow hover:bg-[#2d259c] transition mb-4"
              onClick={handleSuccessContinue}
            >
              Continue to Workspace
            </button>
            {/* Progress bar */}
            <div className="w-full flex justify-center mt-16">
              <div className="w-1/2 h-1 rounded-full bg-[#e5e5e5]">
                <div className="h-1 rounded-full bg-[#3a32d1] transition-all" style={{ width: '100%' }} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
