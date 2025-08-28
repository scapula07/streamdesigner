import SettingsLayout from "../../components/settings/SettingsLayout";
import React, { useEffect, useState } from "react";
import { workspaceApi } from "@/firebase/workspace";
import { useRouter } from "next/router";
import { FiArrowLeft } from "react-icons/fi";
import { userStore } from "@/recoil";
import { useRecoilValue } from "recoil";
export default function MembersSettingsPage() {
  const router = useRouter();
  const user = useRecoilValue(userStore) as { id: string };
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>("");
  const [members, setMembers] = useState<any[]>([]);
  const [menuOpenIdx, setMenuOpenIdx] = useState<number | null>(null);

  // Fetch workspaces owned by the user
  useEffect(() => {
    if (!user?.id) return;
    const fetchWorkspaces = async () => {
      const ws = await workspaceApi.getWorkspaces(user?.id);
      setWorkspaces(ws || []);
    };
    fetchWorkspaces();
  }, [user?.id]);

  // Fetch members for selected workspace
  useEffect(() => {
    if (!selectedWorkspaceId) return;
    const fetchMembers = async () => {
      const ws = workspaces.find((w) => w.id === selectedWorkspaceId);
      setMembers(ws?.members || []);
    };
    fetchMembers();
  }, [selectedWorkspaceId, workspaces]);
  return (
    <SettingsLayout>
      <div className="h-screen w-full">
        <button
            className="flex items-center gap-2 text-gray-700 hover:text-black mb-6 text-base font-medium"
            onClick={() => router.push('/dashboard')}
            type="button"
          >
            <FiArrowLeft className="text-xl" />
            Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Members</h1>
          <p className="text-gray-500 mb-8">Manage who has access to this workspace</p>

      {/* Members Table */}
      <div className="bg-white rounded-xl p-6 h-full">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <select
            className="px-3 py-2 rounded bg-gray-50 border border-gray-200 text-gray-800 focus:outline-none w-full md:w-64"
            value={selectedWorkspaceId}
            onChange={e => setSelectedWorkspaceId(e.target.value)}
          >
            <option value="" disabled>
              Select workspace
            </option>
            {workspaces.map((ws) => (
              <option key={ws.id} value={ws.id}>
                {ws.name || ws.id}
              </option>
            ))}
          </select>
        </div>
        <div className="overflow-x-auto h-full relative" style={{ position: 'relative' }}>
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-gray-500 text-xs uppercase bg-gray-50">
                <th className="px-2 py-2 font-semibold text-left"> </th>
                <th className="px-2 py-2 font-semibold text-left">Name</th>
                <th className="px-2 py-2 font-semibold text-left">Date added</th>
                <th className="px-2 py-2 font-semibold text-left">Last active</th>
                <th className="px-2 py-2 font-semibold text-left">Workspace</th>
                <th className="px-2 py-2 font-semibold text-left">Role</th>
                <th className="px-2 py-2 font-semibold text-left"> </th>
              </tr>
            </thead>
            <tbody>
              {members.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-gray-400 py-6">No members found for this workspace.</td>
                </tr>
              ) : (
                members.map((member, idx) => (
                  <tr key={member.id || idx} className="border-t border-gray-100 hover:bg-gray-50 transition relative">
                    <td className="px-2 py-3">
                      <input type="checkbox" className="accent-indigo-500" />
                    </td>
                    <td className="px-2 py-3">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-sm">
                          {member.name ? member.name[0].toUpperCase() : "?"}
                        </span>
                        <div>
                          <div className="font-medium text-gray-900 text-sm">{member.name || member.email}</div>
                          <div className="text-xs text-gray-500">{member.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-3 text-xs text-gray-700">{member.dateAdded ? member.dateAdded : "-"}</td>
                    <td className="px-2 py-3 text-xs text-gray-700">{member.lastActive ? member.lastActive : "-"}</td>
                    <td className="px-2 py-3 text-xs text-gray-700">{workspaces.find(w => w.id === selectedWorkspaceId)?.name || "-"}</td>
                    <td className="px-2 py-3 text-xs text-gray-700">{member.role || "-"}</td>
                    <td className="px-2 py-3 relative">
                      <button
                        className="text-gray-400 hover:text-gray-700 p-1"
                        onClick={e => {
                          e.stopPropagation();
                          setMenuOpenIdx(menuOpenIdx === idx ? null : idx);
                        }}
                      >
                        <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="5" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="12" cy="19" r="1.5" fill="currentColor"/></svg>
                      </button>
                      {menuOpenIdx === idx && (
                        <div className="absolute right-0 z-10 mt-2 w-32 bg-white border border-gray-200 rounded shadow-lg py-1">
                          <button
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => {
                              // TODO: Remove member logic
                              setMenuOpenIdx(null);
                            }}
                          >
                            Remove
                          </button>
                          <button
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => {
                              // TODO: Change role logic
                              setMenuOpenIdx(null);
                            }}
                          >
                            Change role
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      </div>
    </SettingsLayout>
  );
}
