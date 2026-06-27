"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function DashboardPage() {
const [summary, setSummary] = useState(null);
const [loading, setLoading] = useState(true);
const [user, setUser] = useState(null);
const [view, setView] = useState("my");
const loadDashboard = async () => {
try {
const loggedUser = JSON.parse(
  localStorage.getItem("user")
);

setUser(loggedUser);

if (!loggedUser) {
    setLoading(false);
    return;
  }

  const response = await fetch(
  `/api/dashboard/summary?email=${loggedUser.email}&view=${view}`
)

  const result = await response.json();

  if (result.success) {
    setSummary(result);
  }
} catch (error) {
  console.error(error);
} finally {
  setLoading(false);
}

};

useEffect(() => {
  loadDashboard();
}, [view]);

if (loading) {
return ( <div className="min-h-screen flex justify-center items-center">
Loading... </div>
);
}

return ( <div className="min-h-screen bg-gray-100 p-8">

  <h1 className="text-5xl font-bold text-center text-[#3E7591] mb-10">
    MOM Tracker Dashboard
  </h1>

<div className="flex justify-center gap-4 mb-8">

  <button
    onClick={() => setView("my")}
    className={`px-8 py-3 rounded-lg font-semibold transition ${
      view === "my"
        ? "bg-[#3E7591] text-white"
        : "bg-white border text-[#3E7591]"
    }`}
  >
    My Tasks
  </button>

  <button
    onClick={() => setView("team")}
    className={`px-8 py-3 rounded-lg font-semibold transition ${
      view === "team"
        ? "bg-[#3E7591] text-white"
        : "bg-white border text-[#3E7591]"
    }`}
  >
    My Team Tasks
  </button>

</div>


  {/* Top Cards */}

  <div className="grid md:grid-cols-2 gap-6 mb-8">

    <Link
      href="/dashboard/assigned-mom"
      className="bg-white rounded-xl shadow border p-6 hover:shadow-lg transition"
    >
      <div className="flex justify-between items-center">

        <div>
          <h2 className="text-2xl font-bold text-[#3E7591]">
            Assigned MOM Pointer
          </h2>

        <p className="text-gray-600 mt-2">
  {view === "my"
    ? "MOM uploaded by me"
    : "MOM uploaded by my team"}
</p>
        </div>

        <div className="text-8xl font-extrabold text-[#3E7591]">
          {summary?.assignedCount || 0}
        </div>

      </div>
    </Link>

    <Link
      href="/dashboard/self-mom"
      className="bg-white rounded-xl shadow border p-6 hover:shadow-lg transition"
    >
      <div className="flex justify-between items-center">

        <div>
          <h2 className="text-2xl font-bold text-[#3E7591]">
            Self MOM Pointer
          </h2>

        <p className="text-gray-600 mt-2">
  {view === "my"
    ? "MOM assigned to me"
    : "MOM assigned to my team"}
</p>

        </div>

        <div className="text-8xl font-extrabold text-[#3E7591]">
          {summary?.selfCount || 0}
        </div>

      </div>
    </Link>

  </div>

  {/* Status Cards */}

  <div className="grid md:grid-cols-2 gap-6">

    {/* Assigned MOM */}

    <div className="bg-white rounded-xl shadow border p-6">

      <h2 className="text-2xl font-bold text-[#3E7591] mb-5">
        Assigned MOM Status
      </h2>

      <div className="grid grid-cols-2 gap-4">

        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
        <p className="text-black font-bold text-xl">
            Open
          </p>

          <p className="text-5xl font-extrabold text-black mt-2">
            {summary?.assignedStatus?.open || 0}
          </p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
        <p className="text-black font-bold text-xl">
            In Process
          </p>

          <p className="text-5xl font-extrabold text-black mt-2">
            {summary?.assignedStatus?.inProcess || 0}
          </p>
        </div>

        <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
          <p className="text-black font-bold text-xl">
            Pending
          </p>

          <p className="text-5xl font-extrabold text-black mt-2">
            {summary?.assignedStatus?.pending || 0}
          </p>
        </div>

        <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
        <p className="text-black font-bold text-xl">
            Closed
          </p>

          <p className="text-5xl font-extrabold text-black mt-2">
            {summary?.assignedStatus?.closed || 0}
          </p>
        </div>

      </div>

    </div>

    {/* Self MOM */}

    <div className="bg-white rounded-xl shadow border p-6">

      <h2 className="text-2xl font-bold text-[#3E7591] mb-5">
        Self MOM Status
      </h2>

      <div className="grid grid-cols-2 gap-4">

        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
        <p className="text-black font-bold text-xl">
            Open
          </p>

          <p className="text-5xl font-extrabold text-black mt-2">
            {summary?.selfStatus?.open || 0}
          </p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
        <p className="text-black font-bold text-xl">
            In Process
          </p>

          <p className="text-5xl font-extrabold text-black mt-2">
            {summary?.selfStatus?.inProcess || 0}
          </p>
        </div>

        <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
        <p className="text-black font-bold text-xl">
            Pending
          </p>

          <p className="text-5xl font-extrabold text-black mt-2">
            {summary?.selfStatus?.pending || 0}
          </p>
        </div>

        <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
        <p className="text-black font-bold text-xl">
            Closed
          </p>

          <p className="text-5xl font-extrabold text-black mt-2">
            {summary?.selfStatus?.closed || 0}
          </p>
        </div>

      </div>

    </div>

  </div>

</div>

);
}
