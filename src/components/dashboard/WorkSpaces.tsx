import React, { useEffect, useState } from "react";
import { useRouter } from 'next/router';
import { useRecoilValue } from "recoil";
import { userStore } from '@/recoil';
import { db } from '@/firebase/config';
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";

export default function WorkSpaces() {
  const user = useRecoilValue(userStore);
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    // Listen to all workspaces where user is a member (admin or editor)
    const adminMember = { userId: user.id, email: user.email, role: 'admin' };
    const editorMember = { userId: user.id, email: user.email, role: 'editor' };
    const q = query(
      collection(db, 'workspaces'),
      // Firestore does not support 'or' queries with array-contains, so we need two listeners and merge results
      orderBy('dateCreated', 'desc')
    );
    const adminQ = query(
      collection(db, 'workspaces'),
      where('members', 'array-contains', adminMember),
      orderBy('dateCreated', 'desc')
    );
    const editorQ = query(
      collection(db, 'workspaces'),
      where('members', 'array-contains', editorMember),
      orderBy('dateCreated', 'desc')
    );
    // Listen to both admin and editor memberships and merge results
    const adminUnsub = onSnapshot(adminQ, (adminSnap) => {
      const adminWs = adminSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setWorkspaces(prev => {
        // Merge with editor results (if any)
        return [...adminWs];
      });
      setLoading(false);
    });
    const editorUnsub = onSnapshot(editorQ, (editorSnap) => {
      const editorWs = editorSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setWorkspaces(prev => {
        // Merge with admin results, avoid duplicates
        const ids = new Set(prev.map(w => w.id));
        return [...prev, ...editorWs.filter(w => !ids.has(w.id))];
      });
      setLoading(false);
    });
    return () => {
      adminUnsub();
      editorUnsub();
    };
  }, [user?.id]);
  console.log('Workspaces:', workspaces);

  return (
    <div className="flex-1 px-8 py-6 overflow-auto bg-white">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">All Workspace</h2>
        <div className="w-full rounded-xl overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-5 items-center bg-gray-50 px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <div className="col-span-2">Name</div>
            <div>Created</div>
            <div>Edited by</div>
            <div>Location</div>
          </div>
          {/* Table rows */}
          {loading ? (
            <div className="text-center py-8 text-gray-400">Loading...</div>
          ) : workspaces.length === 0 ? (
            <div className="text-center py-8 text-gray-400">No workspaces found.</div>
          ) : workspaces.map((ws, i) => (
            <div
              key={ws.id || i}
              className="grid grid-cols-5 items-center px-6 py-4 bg-white border-t border-gray-100 hover:bg-gray-50 transition cursor-pointer"
              onClick={() => router.push(`/sketch?workspaceId=${ws.id}`)}
            >
              {/* Name + avatar */}
              <div className="flex items-center gap-3 col-span-2">
                <div className="w-10 h-10 rounded bg-gray-200 flex items-center justify-center text-lg font-bold text-gray-500">
                  {ws.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{ws.name}</div>
                  {/* <div className="text-xs text-gray-500">{ws.edited}</div> */}
                </div>
              </div>
              {/* Created */}
              <div>
                <div className="flex items-center space-x-1">
                  <span className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-xs">
                    {ws.members?.[0]?.email?.[0]?.toUpperCase() || 'U'}
                  </span>
                  <span className="text-xs text-gray-700">{ws.members?.[0]?.email || ws.creator}</span>
                </div>
                <div className="text-xs text-gray-400">{ws.dateCreated ? new Date(ws.dateCreated).toLocaleDateString() : ''}</div>
              </div>
              {/* Edited by (not tracked in schema) */}
              <div>
                <div className="flex items-center space-x-1">
                  <span className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-xs">
                    {ws.members?.[0]?.email?.[0]?.toUpperCase() || 'U'}
                  </span>
                  <span className="text-xs text-gray-700">{ws.members?.[0]?.email || ws.creator}</span>
                </div>
              </div>
              {/* Location */}
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-xs">{ws.name?.[0]?.toUpperCase() || '?'}</span>
                <span className="text-xs text-purple-700 font-semibold">{ws.name}</span>
                <button className="ml-auto text-gray-400 hover:text-gray-700 p-1" onClick={e => e.stopPropagation()}>
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="5" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="12" cy="19" r="1.5" fill="currentColor"/></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
