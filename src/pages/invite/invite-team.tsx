
import React, { useState } from "react";
import { useRouter } from 'next/router';
import { sendEmail } from "@/lib/email";
import { userStore } from "@/recoil";
import { useRecoilValue } from "recoil";
import { workspaceApi } from "@/firebase/workspace";
import { invitationApi } from "@/firebase/invitation";
import { useEffect } from "react";


export default function InviteTeam() {
  const router = useRouter();
  const [emails, setEmails] = useState(["", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const user = useRecoilValue(userStore) as {id:""};
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [workspaceQuery, setWorkspaceQuery] = useState("");
  const [selectedWorkspace, setSelectedWorkspace] = useState<any>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Fetch workspaces owned by the user
  useEffect(() => {
    if (!user) return;
    workspaceApi.getWorkspaces(user?.id).then(setWorkspaces).catch(() => setWorkspaces([]));
  }, [user]);

  const handleEmailChange = (i: number, value: string) => {
    setEmails(emails => emails.map((e, idx) => (idx === i ? value : e)));
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    const validEmails = emails.filter(email => email.trim());
    if (validEmails.length === 0) {
      setError('Please enter at least one email.');
      return;
    }
    setIsLoading(true);
    const appUrl = typeof window !== 'undefined' ? window.location.origin : '';
    try {
      await Promise.all(
        validEmails.map(async email => {
          // You may want to pass workspaceId, inviterId, etc. Adjust as needed.
          const invitation = await invitationApi.createInvitation({
            email,
            workspaceId: selectedWorkspace?.id || '',
            inviterId: user.id,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        
          
          });
          const link = `${appUrl}/invite/accept?token=${invitation.token}`;
          await sendEmail({
            to: email,
            subject: 'You are invited to join the team!',
            text: `You have been invited to join a workspace. Click the link to get started: ${link}`,
          });
        })
      );
      setSuccess(true);
    } catch (err: any) {
      setError('Failed to send one or more invites.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left: Invite Form */}
      <div className="w-full max-w-lg flex flex-col justify-center px-12 py-10 bg-white shadow-2xl z-10">
        <div className="mb-10">
          <div className="text-4xl font-extrabold text-gray-900 font-serif mb-8">Kittl</div>
          <h2 className="text-2xl font-bold mb-1 text-gray-900">You're in! Now invite team members</h2>
          <p className="text-gray-500 mb-8">Set up a shared workspace where you and your team can work together</p>
          <form className="flex flex-col gap-3 mb-4" onSubmit={handleInvite}>
            {/* Workspace search/select */}
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Workspace</label>
              <input
                type="text"
                placeholder="Search workspace..."
                value={workspaceQuery}
                onChange={e => {
                  setWorkspaceQuery(e.target.value);
                  setDropdownOpen(true);
                }}
                onFocus={() => setDropdownOpen(true)}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black text-gray-800 text-base placeholder-gray-400 mb-2"
                autoComplete="off"
              />
              {dropdownOpen && (
                <div className="max-h-32 overflow-y-auto border border-gray-100 rounded-lg bg-white shadow-sm z-20">
                  {workspaces
                    .filter(w => w.name.toLowerCase().includes(workspaceQuery.toLowerCase()))
                    .map(w => (
                      <div
                        key={w.id}
                        className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${selectedWorkspace?.id === w.id ? 'bg-gray-200 font-semibold' : ''}`}
                        onClick={() => {
                          setSelectedWorkspace(w);
                          setWorkspaceQuery(w.name);
                          setDropdownOpen(false);
                        }}
                      >
                        {w.name}
                      </div>
                    ))}
                  {workspaces.length === 0 && <div className="px-4 py-2 text-gray-400">No workspaces found</div>}
                </div>
              )}
              {selectedWorkspace && (
                <div className="mt-1 text-xs text-gray-600">Selected: <span className="font-semibold">{selectedWorkspace.name}</span></div>
              )}
            </div>
            {emails.map((email, i) => (
              <div key={i} className="relative">
                <input
                  type="email"
                  placeholder={i === 0 ? "sera@example.com" : i === 1 ? "alex@company.com" : "maya@startup.io"}
                  value={email}
                  onChange={e => handleEmailChange(i, e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black text-gray-800 text-base placeholder-gray-400"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M2 6.5A2.5 2.5 0 014.5 4h15A2.5 2.5 0 0122 6.5v11a2.5 2.5 0 01-2.5 2.5h-15A2.5 2.5 0 012 17.5v-11z" stroke="currentColor" strokeWidth="1.5"/><path d="M3 7l8.293 6.293a1 1 0 001.414 0L21 7" stroke="currentColor" strokeWidth="1.5"/></svg>
                </span>
              </div>
            ))}
            {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
            {success && <div className="text-green-600 text-sm mt-2">Invites sent!</div>}
            <button
              type="submit"
              className="flex-1 py-2 rounded-lg bg-gray-900 text-white font-semibold hover:bg-black transition mt-4 disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? 'Sending...' : 'Continue'}
            </button>
          </form>
          <button className="flex items-center gap-2 text-blue-600 text-sm font-medium mb-6 hover:underline">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M7 12h10M12 7v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            Copy link to invite
          </button>
          <div className="flex gap-4 mt-2">
            <button
              type="button"
              className="flex-1 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-100 transition"
              onClick={() => router.back()}
            >
              Back
            </button>
          </div>
        </div>
        <div className="mt-auto bg-blue-50 rounded-lg px-4 py-3 text-xs text-gray-700">
          <span className="font-semibold">Prefer to keep things private?</span> You can always create a personal space later.
        </div>
      </div>
      {/* Right: Poster Previews */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 relative overflow-x-auto">
        <div className="flex gap-8">
          {/* Poster 1 */}
          <div className="relative w-56 h-72 bg-white rounded-xl shadow flex flex-col items-center justify-center">
            <div className="absolute top-3 right-3 bg-yellow-400 text-white text-xs font-bold px-3 py-1 rounded-full shadow">Kelly</div>
            <div className="flex flex-wrap gap-2">
              <span className="inline-block w-12 h-12 bg-yellow-200 rounded-full" />
              <span className="inline-block w-12 h-12 bg-yellow-300 rounded-full" />
              <span className="inline-block w-12 h-12 bg-yellow-400 rounded-full" />
              <span className="inline-block w-12 h-12 bg-yellow-200 rounded-full" />
            </div>
          </div>
          {/* Poster 2 */}
          <div className="relative w-56 h-72 bg-white rounded-xl shadow flex flex-col items-center justify-center">
            <div className="absolute top-3 left-3 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow">You</div>
            <div className="absolute top-3 right-3 bg-transparent text-black text-xs font-bold px-3 py-1 rounded">ABSTRACT</div>
            <div className="w-32 h-32 bg-yellow-300 rounded-lg flex items-center justify-center mt-8">
              <div className="w-20 h-20 bg-green-700 rounded" />
            </div>
            {/* Chat bubble */}
            <div className="absolute left-1/2 -translate-x-1/2 bottom-8 bg-white rounded-lg shadow-lg px-4 py-2 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                <img src="https://randomuser.me/api/portraits/men/6.jpg" alt="Karl" className="w-full h-full object-cover" />
              </div>
              <div>
                <span className="block text-xs text-gray-700 font-semibold">@Karl</span>
                <span className="block text-xs text-gray-700">let's add more shapes</span>
                <span className="block text-xs text-gray-500">Sure!</span>
              </div>
            </div>
          </div>
          {/* Poster 3 */}
          <div className="relative w-56 h-72 bg-white rounded-xl shadow flex flex-col items-center justify-center">
            <div className="absolute top-3 right-3 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow">Ben</div>
            <div className="flex flex-wrap gap-2">
              <span className="inline-block w-12 h-12 bg-pink-200 rounded-full" />
              <span className="inline-block w-12 h-12 bg-pink-300 rounded-full" />
              <span className="inline-block w-12 h-12 bg-pink-400 rounded-full" />
              <span className="inline-block w-12 h-12 bg-pink-200 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
