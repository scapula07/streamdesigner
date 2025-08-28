import React from "react";
import { MdInfoOutline, MdRefresh, MdGridView } from "react-icons/md";

export default function Settings() {
  return (
    <aside className="w-80 bg-white text-gray-800 rounded-xl  flex flex-col px-6 py-6 gap-6 max-h-[90vh] overflow-y-auto">
      <div>
        <h2 className="text-lg font-semibold mb-2 text-gray-900">Settings</h2>
        <div className="text-sm text-gray-500">We're at max capacity, please try again later.</div>
      </div>
      <hr className="border-gray-200" />
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="font-semibold">Control Nets</span>
          <MdInfoOutline className="text-gray-400" />
        </div>
        <div className="flex flex-col gap-4">
          {['Pose', 'HED', 'Canny', 'Depth', 'Color'].map((label) => (
            <div key={label} className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span>{label}</span>
                <MdInfoOutline className="text-gray-400 text-xs" />
                <input type="number" min={0} max={100} defaultValue={0} className="ml-auto w-12 bg-gray-100 border border-gray-300 rounded px-2 py-1 text-right text-gray-800 text-xs" />
              </div>
              <input type="range" min={0} max={100} defaultValue={0} className="w-full accent-indigo-500" />
            </div>
          ))}
          <button className="self-end mt-2 p-2 rounded bg-gray-100 hover:bg-gray-200 transition text-gray-700"><MdRefresh /></button>
        </div>
      </div>
      <hr className="border-gray-200" />
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="font-semibold">Denoise</span>
          <MdInfoOutline className="text-gray-400" />
          <button className="ml-auto p-1 rounded bg-gray-100 hover:bg-gray-200 transition text-gray-700"><MdGridView /></button>
        </div>
        <div className="flex items-center gap-2 text-xs mb-1">
          <span className="text-gray-700">X: </span>
          <input type="number" min={0} max={100} defaultValue={2} className="w-10 bg-gray-100 border border-gray-300 rounded px-1 py-0.5 text-right text-gray-800" />
          <span className="text-gray-700">Y: </span>
          <input type="number" min={0} max={100} defaultValue={4} className="w-10 bg-gray-100 border border-gray-300 rounded px-1 py-0.5 text-right text-gray-800" />
        </div>
        <input type="range" min={0} max={100} defaultValue={0} className="w-full accent-indigo-500" />
      </div>
    </aside>
  );
}
