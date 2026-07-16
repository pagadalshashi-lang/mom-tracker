"use client";

import { useEffect, useState } from "react";
import * as XLSX from "xlsx";


export default function MomListPage() {
  const [data, setData] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");

  const [view, setView] = useState("my");

  // New filters
  const [uploadedByFilter, setUploadedByFilter] = useState("All");
  const [accountFilter, setAccountFilter] = useState("");
  const [fprFilter, setFprFilter] = useState("");
  const [sprFilter, setSprFilter] = useState("");

  const [filterOptions, setFilterOptions] = useState({
    uploadedByList: [],
    accounts: [],
    fprList: [],
    sprList: [],
  });

  const loadData = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) return;

      const params = new URLSearchParams({
        email: user.email,
        view,
      });

      if (statusFilter && statusFilter !== "All")
        params.set("status", statusFilter);
      if (uploadedByFilter && uploadedByFilter !== "All")
        params.set("uploadedBy", uploadedByFilter);
      if (accountFilter) params.set("account", accountFilter);
      if (fprFilter) params.set("fpr", fprFilter);
      if (sprFilter) params.set("spr", sprFilter);

      const response = await fetch(`/api/mom/list?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        setData(result.data);

        if (result.filterOptions) {
          setFilterOptions(result.filterOptions);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadData();

    const interval = setInterval(() => {
      loadData();
    }, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, statusFilter, uploadedByFilter, accountFilter, fprFilter, sprFilter]);

  const clearFilters = () => {
    setUploadedByFilter("All");
    setAccountFilter("");
    setFprFilter("");
    setSprFilter("");
    setStatusFilter("All");
  };

  const downloadExcel = () => {
    const exportData = filteredData.map((row) => ({
      "Main Point": row.mainPoint,
      "Sub Point": row.subPoint,
      FPR: row.fpr,
      SPR: row.spr,
      "Uploaded By":
        row.uploadedBy || row.uploadedByName || row.uploadedByEmail,
      "Plan Start": row.planStartDate,
      "Plan End": row.planEndDate,
      "Actual Start": row.actualStartDate,
      "Actual End": row.actualEndDate,
      Status: row.status,
      Remark: row.remark,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, "MOM List");

    XLSX.writeFile(wb, "MOM_List.xlsx");
  };

  // All filtering now happens server-side (Uploaded By / Account / FPR /
  // SPR / Status), so this is just the data as returned from the API.
  const filteredData = data;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold text-[#3E7591]">MOM Actions</h1>
        </div>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setView("my")}
            className={`px-5 py-2 rounded-lg font-semibold ${
              view === "my"
                ? "bg-[#3E7591] text-white"
                : "bg-white border text-[#3E7591]"
            }`}
          >
            My MOMs
          </button>

          <button
            onClick={() => setView("uploaded")}
            className={`px-5 py-2 rounded-lg font-semibold ${
              view === "uploaded"
                ? "bg-[#3E7591] text-white"
                : "bg-white border text-[#3E7591]"
            }`}
          >
            Uploaded By Me
          </button>

          <button
            onClick={() => setView("team")}
            className={`px-5 py-2 rounded-lg font-semibold ${
              view === "team"
                ? "bg-[#3E7591] text-white"
                : "bg-white border text-[#3E7591]"
            }`}
          >
            My Team MOMs
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow p-4 mb-6">
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
              <option value="All">All Uploaded By</option>
              {filterOptions.uploadedByList.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>

            <input
              type="text"
              list="mom-list-account-options"
              placeholder="Search / select Account"
              value={accountFilter}
              onChange={(e) => setAccountFilter(e.target.value)}
              className="border p-2.5 rounded-lg text-black"
            />
            <datalist id="mom-list-account-options">
              {filterOptions.accounts.map((acc) => (
                <option key={acc} value={acc} />
              ))}
            </datalist>

            <select
              value={fprFilter}
              onChange={(e) => setFprFilter(e.target.value)}
              className="border p-2.5 rounded-lg text-black"
            >
              <option value="">All FPR</option>
              {filterOptions.fprList.map((name) => (
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
              {filterOptions.sprList.map((name) => (
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

        {/* Count */}
        <div className="mb-4 text-gray-700 font-semibold flex items-center gap-4">
          Total Actions : {filteredData.length}
          <button
            onClick={downloadExcel}
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg"
          >
            Download Excel
          </button>
        </div>

        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead className="bg-[#3E7591] text-white sticky top-0">
              <tr>
                <th className="p-3 border">Main Point</th>
                <th className="p-3 border">Sub Point</th>
                <th className="p-3 border">FPR</th>
                <th className="p-3 border">SPR</th>
                <th className="p-3 border">Uploaded By</th>
                <th className="p-3 border">Plan Start</th>
                <th className="p-3 border">Plan End</th>
                <th className="p-3 border">Actual Start</th>
                <th className="p-3 border">Actual End</th>
                <th className="p-3 border">Status</th>
                <th className="p-3 border">Remark</th>
              </tr>
            </thead>

            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((row, index) => (
                  <tr
                    key={row._id}
                    className={`hover:bg-blue-50 ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="border p-2 text-black">
                      {row.mainPoint}
                    </td>

                    <td className="border p-2 text-black">{row.subPoint}</td>

                    <td className="border p-2 text-black">{row.fpr}</td>

                    <td className="border p-2 text-black">{row.spr}</td>

                    <td className="border p-2 text-black">
                      {row.uploadedBy || row.uploadedByName}
                    </td>

                    <td className="border p-2 text-black">
                      {row.planStartDate}
                    </td>

                    <td className="border p-2 text-black">
                      {row.planEndDate}
                    </td>

                    <td className="border p-2 text-black">
                      {row.actualStartDate}
                    </td>

                    <td className="border p-2 text-black">
                      {row.actualEndDate}
                    </td>

                    <td className="border p-2 text-black">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold
${
  row.status === "Closed"
    ? "bg-green-100 text-green-700"
    : row.status === "In Process"
    ? "bg-yellow-100 text-yellow-700"
    : row.status === "Pending"
    ? "bg-orange-100 text-orange-700"
    : "bg-red-100 text-red-700"
}`}
                      >
                        {row.status}
                      </span>
                    </td>

                    <td className="border p-2 text-black whitespace-pre-wrap">
                      {row.remark}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="11"
                    className="text-center p-10 text-gray-500"
                  >
                    No MOM Actions Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}