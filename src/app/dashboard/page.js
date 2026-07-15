"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [view, setView] = useState("my");

  // Filters
  const [uploadedByFilter, setUploadedByFilter] = useState("");
  const [accountFilter, setAccountFilter] = useState("");
  const [fprFilter, setFprFilter] = useState("");
  const [sprFilter, setSprFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const loadDashboard = async () => {
    try {
      const loggedUser = JSON.parse(localStorage.getItem("user"));

      setUser(loggedUser);

      if (!loggedUser) {
        setLoading(false);
        return;
      }

      const params = new URLSearchParams({
        email: loggedUser.email,
        view,
      });

      if (uploadedByFilter) params.set("uploadedBy", uploadedByFilter);
      if (accountFilter) params.set("account", accountFilter);
      if (fprFilter) params.set("fpr", fprFilter);
      if (sprFilter) params.set("spr", sprFilter);
      if (statusFilter && statusFilter !== "All")
        params.set("status", statusFilter);

      const response = await fetch(
        `/api/dashboard/summary?${params.toString()}`
      );

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, uploadedByFilter, accountFilter, fprFilter, sprFilter, statusFilter]);

  const clearFilters = () => {
    setUploadedByFilter("");
    setAccountFilter("");
    setFprFilter("");
    setSprFilter("");
    setStatusFilter("All");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        Loading...
      </div>
    );
  }

  const options = summary?.filterOptions || {
    accounts: [],
    uploadedByList: [],
    fprList: [],
    sprList: [],
  };

  const AccountWiseTable = ({ title, rows }) => (
    <div className="bg-white rounded-xl shadow border p-6">
      <h2 className="text-2xl font-bold text-[#3E7591] mb-5">{title}</h2>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-[#3E7591] text-white">
            <tr>
              <th className="p-3 border text-left">Account</th>
              <th className="p-3 border">Open</th>
              <th className="p-3 border">In Process</th>
              <th className="p-3 border">Pending</th>
              <th className="p-3 border">Closed</th>
              <th className="p-3 border">Due By</th>
              <th className="p-3 border">Total</th>
            </tr>
          </thead>

          <tbody>
            {!rows || rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center p-6 text-gray-500">
                  No records found
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.account} className="hover:bg-gray-50">
                  <td className="p-2 border text-black font-medium text-left">
                    {r.account}
                  </td>
                  <td className="p-2 border text-black text-center">
                    {r.open}
                  </td>
                  <td className="p-2 border text-black text-center">
                    {r.inProcess}
                  </td>
                  <td className="p-2 border text-black text-center">
                    {r.pending}
                  </td>
                  <td className="p-2 border text-black text-center">
                    {r.closed}
                  </td>
                  <td
                    className={`p-2 border text-center font-semibold ${
                      r.dueBy > 0 ? "text-red-600" : "text-black"
                    }`}
                  >
                    {r.dueBy}
                  </td>
                  <td className="p-2 border text-black text-center font-semibold">
                    {r.total}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-8">
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

      {/* Filters */}
      <div className="bg-white rounded-xl shadow border p-4 mb-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-[#3E7591]">Filters</h3>
          <button
            onClick={clearFilters}
            className="text-sm text-[#3E7591] underline hover:text-[#2f617a]"
          >
            Clear Filters
          </button>
        </div>

        <div className="grid md:grid-cols-5 gap-4">
          <select
            value={uploadedByFilter}
            onChange={(e) => setUploadedByFilter(e.target.value)}
            className="border p-2.5 rounded-lg text-black"
          >
            <option value="">All Uploaded By</option>
            {options.uploadedByList.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>

          <input
            type="text"
            list="account-options"
            placeholder="Search / select Account"
            value={accountFilter}
            onChange={(e) => setAccountFilter(e.target.value)}
            className="border p-2.5 rounded-lg text-black"
          />
          <datalist id="account-options">
            {options.accounts.map((acc) => (
              <option key={acc} value={acc} />
            ))}
          </datalist>

          <select
            value={fprFilter}
            onChange={(e) => setFprFilter(e.target.value)}
            className="border p-2.5 rounded-lg text-black"
          >
            <option value="">All FPR</option>
            {options.fprList.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>

          <select
            value={sprFilter}
            onChange={(e) => setSprFilter(e.target.value)}
            className="border p-2.5 rounded-lg text-black"
          >
            <option value="">All SPR</option>
            {options.sprList.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border p-2.5 rounded-lg text-black"
          >
            <option value="All">All Status</option>
            <option value="Open">Open</option>
            <option value="In Process">In Process</option>
            <option value="Pending">Pending</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Top Cards */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
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
                {view === "my" ? "MOM uploaded by me" : "MOM uploaded by my team"}
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
                {view === "my" ? "MOM assigned to me" : "MOM assigned to my team"}
              </p>
            </div>

            <div className="text-8xl font-extrabold text-[#3E7591]">
              {summary?.selfCount || 0}
            </div>
          </div>
        </Link>
      </div>

      {/* Due By Cards */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow border-2 border-red-200 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-red-600">
                Assigned Due By
              </h2>
              <p className="text-gray-600 mt-1 text-sm">
                Past Plan End Date, not yet Closed
              </p>
            </div>
            <div className="text-6xl font-extrabold text-red-600">
              {summary?.assignedDueCount || 0}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow border-2 border-red-200 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-red-600">Self Due By</h2>
              <p className="text-gray-600 mt-1 text-sm">
                Past Plan End Date, not yet Closed
              </p>
            </div>
            <div className="text-6xl font-extrabold text-red-600">
              {summary?.selfDueCount || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Assigned MOM */}
        <div className="bg-white rounded-xl shadow border p-6">
          <h2 className="text-2xl font-bold text-[#3E7591] mb-5">
            Assigned MOM Status
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <p className="text-black font-bold text-xl">Open</p>
              <p className="text-5xl font-extrabold text-black mt-2">
                {summary?.assignedStatus?.open || 0}
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <p className="text-black font-bold text-xl">In Process</p>
              <p className="text-5xl font-extrabold text-black mt-2">
                {summary?.assignedStatus?.inProcess || 0}
              </p>
            </div>

            <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
              <p className="text-black font-bold text-xl">Pending</p>
              <p className="text-5xl font-extrabold text-black mt-2">
                {summary?.assignedStatus?.pending || 0}
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <p className="text-black font-bold text-xl">Closed</p>
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
              <p className="text-black font-bold text-xl">Open</p>
              <p className="text-5xl font-extrabold text-black mt-2">
                {summary?.selfStatus?.open || 0}
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <p className="text-black font-bold text-xl">In Process</p>
              <p className="text-5xl font-extrabold text-black mt-2">
                {summary?.selfStatus?.inProcess || 0}
              </p>
            </div>

            <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
              <p className="text-black font-bold text-xl">Pending</p>
              <p className="text-5xl font-extrabold text-black mt-2">
                {summary?.selfStatus?.pending || 0}
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <p className="text-black font-bold text-xl">Closed</p>
              <p className="text-5xl font-extrabold text-black mt-2">
                {summary?.selfStatus?.closed || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Account-wise Tables */}
      <div className="grid md:grid-cols-2 gap-6">
        <AccountWiseTable
          title="Assigned MOM — Account Wise"
          rows={summary?.assignedAccountWise}
        />

        <AccountWiseTable
          title="Self MOM — Account Wise"
          rows={summary?.selfAccountWise}
        />
      </div>
    </div>
  );
}