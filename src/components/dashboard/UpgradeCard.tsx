import React from "react";

export default function UpgradeCard() {
  return (
    <div className="bg-gray-100 rounded-lg p-6 flex flex-col items-center gap-3 mt-8">
      <div className="text-blue-600 text-2xl font-bold">⚡</div>
      <div className="text-gray-900 font-semibold">Upgrade to unlock more features</div>
      <button className="mt-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition">Upgrade</button>
    </div>
  );
}
