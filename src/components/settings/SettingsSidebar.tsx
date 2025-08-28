import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { authApi } from "@/firebase/auth";
import { IoIosArrowRoundBack } from "react-icons/io"; 
const navItems = [
  { label: "General", href: "/settings/general" },
  { label: "Members", href: "/settings/members" },
  { label: "Plans & Billing", href: "/settings/plans-billing" },
  { label: "Profile", href: "/settings/profile", section: "Account" },
];

export default function SettingsSidebar() {
  const router = useRouter();
  return (
    <aside className="w-64 border-r border-gray-200 bg-white flex flex-col py-8 px-4">
      <div className="text-lg font-bold mb-8">Settings</div>
      <nav className="flex flex-col gap-1">
        <div className="text-xs text-gray-400 mb-2">Workspace</div>
        {navItems.filter(i => !i.section).map(item => {
          const active = router.pathname === item.href;
          return (
            <Link href={item.href} key={item.label} legacyBehavior>
              <a className={`text-left px-3 py-2 rounded font-semibold transition ${active ? "bg-gray-100 text-gray-900" : "text-gray-700 hover:bg-gray-100"}`}>{item.label}</a>
            </Link>
          );
        })}
        <div className="mt-6 text-xs text-gray-400 mb-2">Account</div>
        {navItems.filter(i => i.section === "Account").map(item => {
          const active = router.pathname === item.href;
          return (
            <Link href={item.href} key={item.label} legacyBehavior>
              <a className={`text-left px-3 py-2 rounded font-semibold transition ${active ? "bg-gray-100 text-gray-900" : "text-gray-700 hover:bg-gray-100"}`}>{item.label}</a>
            </Link>
          );
        })}

       <div className=" bg-white flex justify-start ">
          <button
            className="block w-full flex items-center   space-x-2 text-left font-semibold py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={async () => {
             
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
      </nav>


    </aside>
  );
}
