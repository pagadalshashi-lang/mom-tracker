"use client";

import { useEffect, useState } from "react";
import * as XLSX from "xlsx";


export default function MomListPage() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
 const [statusFilter, setStatusFilter] =
  useState("All");

const [view, setView] = useState("my");

 const loadData = async () => {
  try {

    const user = JSON.parse(
      localStorage.getItem("user")
    );
      if (!user) return;

  const response = await fetch(
  `/api/mom/list?email=${encodeURIComponent(
    user.email
  )}&view=${view}`
);
      const result =
        await response.json();

      if (result.success) {
        setData(result.data);
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

},[view]);

const downloadExcel = () => {

  const exportData = filteredData.map((row) => ({
    "Main Point": row.mainPoint,
    "Sub Point": row.subPoint,
    "FPR": row.fpr,
    "SPR": row.spr,
    "Uploaded By": row.uploadedBy || row.uploadedByName || row.uploadedByEmail,
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

  const filteredData = data.filter(
    (item) => {
      const matchesSearch =
        item.mainPoint
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||
        item.subPoint
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||
        item.fpr
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||
        item.spr
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          );

      const matchesStatus =
        statusFilter === "All"
          ? true
          : item.status ===
            statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    }
  );

  return (
    <div className="min-h-screen bg-gray-100 p-8">

      <div className="max-w-7xl mx-auto">

        <div className="flex justify-between items-center mb-6">

          <h1 className="text-4xl font-bold text-[#3E7591]">
            MOM Actions
          </h1>

          

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

          <div className="grid md:grid-cols-2 gap-4">

            <input
              type="text"
              placeholder="Search Main Point, FPR, SPR..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              className="border p-3 rounded-lg text-black"
            />

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value
                )
              }
              className="border p-3 rounded-lg text-black"
            >
              <option value="All">
                All Status
              </option>

              <option value="Open">
                Open
              </option>

              <option value="In Process">
                In Process
              </option>

              <option value="Pending">
                Pending
              </option>

              <option value="Closed">
                Closed
              </option>

            </select>

          </div>

        </div>

        {/* Count */}

        <div className="mb-4 text-gray-700 font-semibold">
          Total Actions :
          {" "}
          {filteredData.length}
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

filteredData.map((row,index)=>(

<tr
key={row._id}
className={`hover:bg-blue-50 ${
index % 2 === 0 ? "bg-white" : "bg-gray-50"
}`}
>

<td className="border p-2 text-black">{row.mainPoint}</td>

<td className="border p-2 text-black">{row.subPoint}</td>

<td className="border p-2 text-black">{row.fpr}</td>

<td className="border p-2 text-black">{row.spr}</td>

<td className="border p-2 text-black">
  {row.uploadedBy || row.uploadedByName}
</td>

<td className="border p-2 text-black">{row.planStartDate}</td>

<td className="border p-2 text-black">{row.planEndDate}</td>

<td className="border p-2 text-black">{row.actualStartDate}</td>

<td className="border p-2 text-black">{row.actualEndDate}</td>

<td className="border p-2 text-black">

<span
className={`px-3 py-1 rounded-full text-xs font-semibold
${
row.status==="Closed"
?"bg-green-100 text-green-700"
:row.status==="In Process"
?"bg-yellow-100 text-yellow-700"
:row.status==="Pending"
?"bg-orange-100 text-orange-700"
:"bg-red-100 text-red-700"
}`}
>

{row.status}

</span>

</td>

<td className="border p-2 whitespace-pre-wrap">
{row.remark}
</td>

</tr>

))

):(


<tr>

<td
colSpan="10"
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