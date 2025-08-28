import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { FiHome, FiFile, FiSettings, FiUsers, FiHelpCircle } from "react-icons/fi";
import { RiUserAddLine } from "react-icons/ri";
import { userStore } from "@/recoil";
import { useRecoilValue } from "recoil";
import { authApi } from "@/firebase/auth";
import { IoIosArrowRoundBack } from "react-icons/io";

const navItems = [
  { icon: <FiUsers />, label: "All Workspace", href: "/dashboard/workspaces" },
];

export default function Sidebar() {
  const router = useRouter();
  const user = useRecoilValue(userStore);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }
    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);
  return (
    <aside className="flex flex-col h-full w-64 bg-white text-gray-900 py-6 px-4 gap-4 border-r border-gray-200">
      <div className="text-lg font-semibold mb-8 pl-1">Sketchstream <span className="text-xs bg-gray-100 text-gray-600 rounded px-2 py-0.5 ml-2">Free plan</span></div>
      <button
        className="mb-4 px-3 py-2 rounded bg-gray-500 text-white font-medium hover:bg-black transition"
        onClick={() => router.push('/dashboard/create/workspace')}
      >
        + Add Workspace
      </button>
      <nav className="flex flex-col gap-1 mb-6">
        {navItems.map((item) => {
          const active = router.pathname === item.href;
          return (
            <Link href={item.href} key={item.label} legacyBehavior>
              <span
                className={`flex items-center gap-3 px-3 py-2 rounded text-base w-full text-left transition ${active ? "text-gray-900 " : "-gray-700 hover:bg-gray-100"}`} >
              
                {item.icon}
                {item.label}
              </span>
            </Link>
          );
        })}
          <button
            className="w-full px-3 py-1 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-50 transition flex items-center justify-center gap-2"
            onClick={() => router.push('/invite-team')}
          >
            <RiUserAddLine />
            <span className="text-sm">Invite Members</span>
        </button>
      </nav>

      <div className="mt-auto flex flex-col gap-2">
        <button
          className="flex items-center gap-3 px-3 py-2 rounded text-gray-700 hover:bg-gray-100 transition text-base w-full text-left"
          onClick={() => router.push('/settings/general')}
        >
          <FiSettings />
          Settings
        </button>
        <button
          className="flex items-center gap-3 px-3 py-2 rounded text-gray-700 hover:bg-gray-100 transition text-base w-full text-left"
          onClick={() => window.open('https://docs.google.com/forms/d/e/1FAIpQLSftSmulKTBDvHx_bjcP52sgAAJiIdYwUBu3LifyKxpLQAoZnA/viewform', '_blank')}
        >
          <FiHelpCircle />
          Help & feedback
        </button>
        <div className="flex flex-col gap-2 mt-4" ref={userMenuRef}>
          <div
            className="flex items-center gap-2 px-3 py-2 rounded bg-gray-100 cursor-pointer"
            onClick={() => setShowUserMenu(v => !v)}
          >
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-lg">{user?.email?.slice(0,1)}</div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-900">{user?.email}</span>
            </div>
          </div>
          {showUserMenu && (
            <div className=" bg-white flex justify-center border border-gray-200 rounded shadow z-20 ml-12">
              <button
                className="block w-full flex items-center justify-center  space-x-2 text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={async () => {
                  setShowUserMenu(false);
                  if (typeof window !== 'undefined') {
                    await authApi.logout();
                     localStorage.clear();
                    router.replace('/auth/login');
                  }
                 }}
              >
               <IoIosArrowRoundBack className="text-xl" />
               <span> Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
