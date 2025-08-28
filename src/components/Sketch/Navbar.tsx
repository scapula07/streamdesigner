import React, { useState, useRef, useEffect } from "react";
import { MdLanguage, MdExpandMore, MdDarkMode } from "react-icons/md";


export default function Navbar({ user,workspace }: { user: { email: string } ,workspace:any}) {
  // Abbreviate email: first 2 + ... + last 2 before @, then @domain
  const getAbbreviatedEmail = (email: string) => {
    if (!email) return '';
    const [userPart, domain] = email.split('@');
    if (!userPart || !domain) return email;
    if (userPart.length <= 4) return email;
    return `${userPart.slice(0,2)}...${userPart.slice(-2)}@${domain}`;
  };

  const abbrEmail = getAbbreviatedEmail(user?.email);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  return (
    <nav className="w-full flex justify-center mt-4">
      <div className="flex items-center w-[900px] bg-white rounded-xl shadow px-6 py-2 border border-gray-200">
        {/* Logo */}
        <span className="font-bold text-xl mr-2">Sketchstream</span>
        {/* <MdLanguage className="ml-1 text-lg text-gray-500" /> */}
        {/* Nav links */}
        <div className="flex items-center ml-8 gap-6 flex-1">
          <span className="cursor-pointer">Dashboard</span>
          <div className="relative" ref={dropdownRef}>
            <span
              className="cursor-pointer flex items-center gap-1"
              onClick={() => setDropdownOpen(v => !v)}
            >
              Teammate <MdExpandMore className="text-base" />
            </span>
            {dropdownOpen && (
              <div className="absolute left-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-30">
                <div className="p-3 border-b font-semibold text-gray-700">Workspace Members</div>
                <ul className="max-h-60 overflow-y-auto">
                  {workspace?.members?.length ? (
                    workspace.members.map((member: any, idx: number) => (
                      <li key={idx} className="px-4 py-2 flex items-center gap-2 hover:bg-gray-50">
                        {/* <span className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold">
                          {member.email?.[0]?.toUpperCase() || member.userId?.[0]?.toUpperCase() || '?'}
                        </span> */}
                        <span className="flex-1 text-sm text-gray-800">{member.email || member.userId}</span>
                        <span
                          className={`text-xs px-2 py-1 rounded font-semibold border ${member.role === 'admin'
                            ? 'bg-green-100 text-green-700 border-green-200'
                            : 'bg-gray-100 text-gray-600 border-gray-200'}`}
                        >
                          {member.role}
                        </span>
                      </li>
                    ))
                  ) : (
                    <li className="px-4 py-2 text-gray-400">No members found</li>
                  )}
                </ul>
              </div>
            )}
          </div>
          <span className="cursor-pointer">Share</span>
          <span className="cursor-pointer">Contact</span>
        </div>
        {/* Right side */}
        <button className="flex items-center bg-black text-white rounded-lg px-4 py-2 font-semibold ml-2">
          <span className="bg-gray-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-2">{user?.email.slice(0,1)}</span>
          <span className="mr-1">{abbrEmail}</span>
          <MdExpandMore className="text-base" />
        </button>
      </div>
    </nav>
  );
}
