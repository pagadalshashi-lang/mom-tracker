"use client";

import { useEffect, useState } from "react";

export default function MomListPage() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("All");

 const loadData = async () => {
  try {

    const user = JSON.parse(
      localStorage.getItem("user")
    );
      if (!user) return;

    const response = await fetch(
      `/api/mom/list?email=${encodeURIComponent(
        user.email
      )}`
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
  const interval = setInterval(() => {
    loadData();
  }, 10000);

  return () => clearInterval(interval);
}, []);

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
        </div>

        {/* Cards */}

        <div className="grid gap-5">

          {filteredData.length >
          0 ? (

            filteredData.map(
              (row) => (

                <div
                  key={row._id}
                  className="bg-white rounded-xl shadow-lg p-6 border"
                >

                  {/* Header */}

                  <div className="flex justify-between items-center mb-4">

                    <h2 className="text-2xl font-bold text-[#3E7591]">
                      {row.mainPoint}
                    </h2>

                    <span
                      className={`px-4 py-1 rounded-full text-sm font-semibold
                      ${
                        row.status ===
                        "Closed"
                          ? "bg-green-100 text-green-700"

                          : row.status ===
                            "In Process"
                          ? "bg-yellow-100 text-yellow-700"

                          : row.status ===
                            "Pending"
                          ? "bg-orange-100 text-orange-700"

                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {row.status}
                    </span>

                  </div>

                  {/* Sub Point */}

                  <div className="mb-4">

                    <label className="font-semibold text-gray-700">
                      Sub Point
                    </label>

                    <p className="text-black mt-1">
                      {row.subPoint}
                    </p>

                  </div>

                  {/* FPR SPR */}

                  <div className="grid md:grid-cols-2 gap-4 mb-4">

                    <div>

                      <label className="font-semibold text-gray-700">
                        FPR
                      </label>

                      <p className="text-black">
                        {row.fpr}
                      </p>

                    </div>

                    <div>

                      <label className="font-semibold text-gray-700">
                        SPR
                      </label>

                      <p className="text-black">
                        {row.spr}
                      </p>

                    </div>

                  </div>

                  {/* Dates */}

                  <div className="grid md:grid-cols-4 gap-4 mb-4">

                    <div>

                      <label className="font-semibold text-gray-700">
                        Plan Start
                      </label>

                      <p className="text-black">
                        {row.planStartDate}
                      </p>

                    </div>

                    <div>

                      <label className="font-semibold text-gray-700">
                        Actual Start
                      </label>

                      <p className="text-black">
                        {row.actualStartDate}
                      </p>

                    </div>

                    <div>

                      <label className="font-semibold text-gray-700">
                        Plan End
                      </label>

                      <p className="text-black">
                        {row.planEndDate}
                      </p>

                    </div>

                    <div>

                      <label className="font-semibold text-gray-700">
                        Actual End
                      </label>

                      <p className="text-black">
                        {row.actualEndDate}
                      </p>

                    </div>

                  </div>

                  {/* Remark */}

                  <div>

                    <label className="font-semibold text-gray-700">
                      Remark
                    </label>

                    <p className="text-black mt-1">
                      {row.remark}
                    </p>

                  </div>

                </div>
              )
            )

          ) : (

            <div className="bg-white p-10 rounded-xl text-center text-gray-500">
              No MOM Actions Found
            </div>

          )}

        </div>

      </div>

    </div>
  );
}