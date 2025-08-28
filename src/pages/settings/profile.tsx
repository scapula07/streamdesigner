import SettingsLayout from "../../components/settings/SettingsLayout";
import React, { useState } from "react";
import { userStore } from "@/recoil";
import { useRecoilValue } from "recoil";
import { userApi } from "@/firebase/user";
import { useRouter } from "next/router";
import { FiArrowLeft } from "react-icons/fi";
export default function ProfileSettingsPage() {
  const [name, setName] = useState("");
  const user = useRecoilValue(userStore) as { id: string, email: string };
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = require('next/router').useRouter();

  const handleDeleteAccount = async () => {
    setDeleting(true);
    const res = await userApi.deleteUserAccount(user.id);
    setDeleting(false);
    if (res.success) {
      router.replace('/auth/signup');
    } else {
      alert(res.message || 'Failed to delete account.');
    }
  };
  return (
    <SettingsLayout>
             <button
               className="flex items-center gap-2 text-gray-700 hover:text-black mb-6 text-base font-medium"
               onClick={() => router.push('/dashboard')}
               type="button"
             >
               <FiArrowLeft className="text-xl" />
               Back to Dashboard
             </button>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Profile</h1>
      <p className="text-gray-500 mb-8">Manage your SketchStream profile</p>

      {/* Email */}
      <div className="mb-8">
        <div className="text-xs text-gray-500 mb-1">Email</div>
        <div className="text-base text-gray-900 mb-4">bartholomewscapula@gmail.com</div>
        <div className="text-xs text-gray-500 mb-1">Name</div>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black text-gray-800 text-base mb-3"
        />
        <div className="flex gap-2 mb-2">
          <button className="px-5 py-2 rounded-lg bg-indigo-700 text-white font-semibold hover:bg-indigo-800 transition">Save</button>
          <button className="px-5 py-2 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition">Cancel</button>
        </div>
      </div>

      {/* Password */}
      {/* <div className="mb-8">
        <div className="text-xs text-gray-500 mb-1">Password</div>
        <div className="flex flex-col md:flex-row gap-2 mb-2">
          <input
            type="password"
            placeholder="Current password"
            value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
            className="flex-1 px-4 py-2 rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black text-gray-800 text-base"
          />
          <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            className="flex-1 px-4 py-2 rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black text-gray-800 text-base"
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            className="flex-1 px-4 py-2 rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black text-gray-800 text-base"
          />
        </div>
        <div className="flex gap-2 mb-2">
          <button className="px-5 py-2 rounded-lg bg-indigo-700 text-white font-semibold hover:bg-indigo-800 transition">Save</button>
          <button className="px-5 py-2 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition">Cancel</button>
        </div>
      </div> */}

      {/* Delete account */}
      <div className="mt-8">
        <div className="text-xs text-gray-500 mb-1">Delete my account</div>
        <button
          className="px-5 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition"
          onClick={() => setShowDeleteConfirm(true)}
          disabled={deleting}
        >
          {deleting ? 'Deleting...' : 'Delete account'}
        </button>
      </div>

      {/* Delete confirmation popup */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full">
            <h2 className="text-lg font-bold mb-2">Confirm Account Deletion</h2>
            <p className="mb-4 text-gray-600">Are you sure you want to delete your account? This action cannot be undone.</p>
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
                onClick={handleDeleteAccount}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </SettingsLayout>
  );
}
