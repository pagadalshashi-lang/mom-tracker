"use client";

import { useState } from "react";

export default function SelfMomPage() {
  const [view, setView] = useState("my");

  return (
    <div className="p-6">

      <h1 className="text-3xl font-bold text-[#3E7591] mb-6">
        Self MOM
      </h1>

      {/* Toggle Buttons */}

      <div className="flex gap-4 mb-8">

        <button
          onClick={() => setView("my")}
          className={`px-6 py-2 rounded-lg font-semibold transition ${
            view === "my"
              ? "bg-[#3E7591] text-white"
              : "bg-white border text-[#3E7591]"
          }`}
        >
          My Tasks
        </button>

        <button
          onClick={() => setView("team")}
          className={`px-6 py-2 rounded-lg font-semibold transition ${
            view === "team"
              ? "bg-[#3E7591] text-white"
              : "bg-white border text-[#3E7591]"
          }`}
        >
          My Team Tasks
        </button>

      </div>

      {/* Card */}

      <div className="bg-white rounded-xl shadow border p-5">

        <h2 className="text-2xl font-bold text-[#3E7591] mb-2">
          {view === "my"
            ? "Self MOM Assigned To Me"
            : "Self MOM Assigned To My Team"}
        </h2>

        <p className="text-gray-500">
          {view === "my"
            ? "Here you can view all MOM pointers assigned to you."
            : "Here you can view all MOM pointers assigned to your team."}
        </p>

      </div>

    </div>
  );
}