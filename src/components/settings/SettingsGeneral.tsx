'use client'
import React, { useRef, useState, useEffect } from "react";
import { FiArrowLeft } from 'react-icons/fi';
import { useRecoilValue } from "recoil";
import { userStore } from '@/recoil';
import { workspaceApi } from "@/firebase/workspace";

interface Workspace {
  id: string;
  name?: string;
  logo?: string;
  [key: string]: any;
}

import { useRouter } from 'next/router';

export default function SettingsGeneral() {
  const fileInput = useRef<HTMLInputElement>(null);
  const user = useRecoilValue(userStore) as { id: string };
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [workspaceName, setWorkspaceName] = useState('Workspace');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const router = useRouter();

  const handleDeleteWorkspace = async () => {
    if (!selectedWorkspace) return;
    setDeleting(true);
    try {
      await workspaceApi.deleteWorkspace(selectedWorkspace.id, user.id);
      setWorkspaces(wsArr => wsArr.filter(ws => ws.id !== selectedWorkspace.id));
      setSelectedWorkspace(null);
      setWorkspaceName('Workspace');
      setShowDeleteConfirm(false);
      // Optionally, close modal or redirect
      // router.push('/dashboard');
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    if (!user?.id) return;
    workspaceApi.getWorkspaces(user.id).then(setWorkspaces);
  }, [user]);

  const handleWorkspaceSelect = (ws: any) => {
    setSelectedWorkspace(ws);
    setWorkspaceName(ws.name || 'Workspace');
    setDropdownOpen(false);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !selectedWorkspace) return;
    const file = e.target.files[0];
    setUploading(true);
    try {
      const updated = await workspaceApi.updateWorkspaceLogo(selectedWorkspace.id, file) as any;
      setSelectedWorkspace((prev: any) => prev ? { ...prev, logo: updated?.logo } : updated);
      setWorkspaces(wsArr => wsArr.map(ws => ws.id === updated.id ? { ...ws, logo: updated?.logo } : ws));
    } finally {
      setUploading(false);
    }
  };

  const handleSaveName = async () => {
    if (!selectedWorkspace) return;
    setSaving(true);
    try {
      await workspaceApi.updateWorkspace(selectedWorkspace.id, { name: workspaceName }, user.id);
      setSelectedWorkspace((prev: any) => prev ? { ...prev, name: workspaceName } : { name: workspaceName });
      setWorkspaces(wsArr => wsArr.map(ws => ws.id === selectedWorkspace.id ? { ...ws, name: workspaceName } : ws));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl">

      {/* Workspace select dropdown - moved above name */}
      <div className="mb-8">
        <div className="text-lg font-semibold text-gray-900 mb-2">Select workspace</div>
        <div className="mb-3 relative">
          <button
            type="button"
            className="px-4 py-2 rounded bg-gray-100 text-gray-800 font-semibold border border-gray-200 w-64 text-left"
            onClick={() => setDropdownOpen(v => !v)}
          >
            {selectedWorkspace ? selectedWorkspace.name : 'Select a workspace'}
          </button>
          {dropdownOpen && (
            <div className="absolute left-0 mt-1 w-64 bg-white border border-gray-200 rounded shadow z-10 max-h-60 overflow-y-auto">
              {workspaces.length ? workspaces.map(ws => (
                <div
                  key={ws.id}
                  className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${selectedWorkspace?.id === ws.id ? 'bg-gray-200 font-semibold' : ''}`}
                  onClick={() => handleWorkspaceSelect(ws)}
                >
                  {ws.name}
                </div>
              )) : <div className="px-4 py-2 text-gray-400">No workspaces found</div>}
            </div>
          )}
        </div>
      </div>
      <div className="mb-8">
        <div className="text-lg font-semibold text-gray-900 mb-2">Workspace name</div>
        <input
          type="text"
          value={workspaceName}
          onChange={e => setWorkspaceName(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black text-gray-800 text-base mb-3"
        />
        <div className="flex gap-2">
          <button
            className="px-5 py-2 rounded-lg bg-indigo-700 text-white font-semibold hover:bg-indigo-800 transition disabled:opacity-60"
            onClick={handleSaveName}
            disabled={saving || !selectedWorkspace || !workspaceName.trim()}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button className="px-5 py-2 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition">Cancel</button>
        </div>
      </div>
      <div className="mb-8">
        <div className="text-lg font-semibold text-gray-900 mb-2">Workspace logo</div>
        <div className="flex items-center gap-4 mb-2">
          <div className="w-14 h-14 rounded-lg bg-purple-500 flex items-center justify-center text-white font-bold text-2xl overflow-hidden">
            {selectedWorkspace && selectedWorkspace.logo ? (
              <img src={selectedWorkspace.logo} alt="Logo" className="w-full h-full object-cover rounded-lg" />
            ) : (
              selectedWorkspace ? (selectedWorkspace.name?.[0]?.toUpperCase() || 'W') : 'W'
            )}
          </div>
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleLogoUpload}
          />
          <button
            className="px-4 py-2 rounded bg-gray-900 text-white font-semibold hover:bg-black transition disabled:opacity-60"
            onClick={() => fileInput.current?.click()}
            type="button"
            disabled={!selectedWorkspace || uploading}
          >
            {uploading ? 'Uploading...' : 'Upload logo'}
          </button>
        </div>
        <div className="text-xs text-gray-400">Recommended size is 256×256px</div>
      </div>
      <div className="mb-8">
        <div className="text-lg font-semibold text-gray-900 mb-2">Delete workspace</div>
        <p className="text-sm text-gray-500 mb-3">Deleting a workspace will permanently delete all of its data, including all files and folders. This action is irreversible.</p>
        <button
          className="px-5 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition disabled:opacity-60"
          onClick={() => setShowDeleteConfirm(true)}
          disabled={deleting || !selectedWorkspace}
        >
          {deleting ? 'Deleting...' : 'Delete Workspace'}
        </button>
      </div>

      {/* Delete confirmation popup */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full">
            <h2 className="text-lg font-bold mb-2">Confirm Workspace Deletion</h2>
            <p className="mb-4 text-gray-600">Are you sure you want to delete this workspace? This action cannot be undone.</p>
            <div className="flex gap-2 justify-end">
              <button
                className="px-4 py-2 rounded bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-red-600 text-white font-semibold hover:bg-red-700"
                onClick={handleDeleteWorkspace}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
