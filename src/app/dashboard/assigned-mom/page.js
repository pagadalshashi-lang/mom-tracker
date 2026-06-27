"use client";

import { useEffect, useState } from "react";

export default function AssignedMomPage() {
  const [view, setView] = useState("my");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));

      if (!user) return;

      const res = await fetch(
        `/api/mom/list?email=${encodeURIComponent(
          user.email
        )}&view=${view}`
      );

      const result = await res.json();

      if (result.success) {
        setData(result.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [view]);

  if (loading) {
    return (
      <div className="p-10 text-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="p-6">

      <h1 className="text-3xl font-bold text-[#3E7591] mb-6">
        Assigned MOM
      </h1>

      {/* Toggle */}

      <div className="flex gap-4 mb-8">

        <button
          onClick={() => setView("my")}
          className={`px-6 py-2 rounded-lg font-semibold ${
            view === "my"
              ? "bg-[#3E7591] text-white"
              : "bg-white border text-[#3E7591]"
          }`}
        >
          My Tasks
        </button>

        <button
          onClick={() => setView("team")}
          className={`px-6 py-2 rounded-lg font-semibold ${
            view === "team"
              ? "bg-[#3E7591] text-white"
              : "bg-white border text-[#3E7591]"
          }`}
        >
          My Team Tasks
        </button>

      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-x-auto">

        <table className="w-full">

          <thead className="bg-[#3E7591] text-white">

            <tr>

              <th className="p-3 text-left">
                Main Point
              </th>

              <th className="p-3 text-left">
                Sub Point
              </th>

              <th className="p-3 text-left">
                FPR
              </th>

              <th className="p-3 text-left">
                SPR
              </th>

              <th className="p-3 text-left">
                Status
              </th>

              <th className="p-3 text-left">
                Uploaded By
              </th>

            </tr>

          </thead>

          <tbody>

            {data.length === 0 ? (

              <tr>

                <td
                  colSpan={6}
                  className="text-center p-8"
                >
                  No Records Found
                </td>

              </tr>

            ) : (

              data.map((row) => (

                <tr
                  key={row._id}
                  className="border-b hover:bg-gray-50"
                >

                  <td className="p-3">
                    {row.mainPoint}
                  </td>

                  <td className="p-3">
                    {row.subPoint}
                  </td>

                  <td className="p-3">
                    {row.fpr}
                  </td>

                  <td className="p-3">
                    {row.spr}
                  </td>

                  <td className="p-3">
                    {row.status}
                  </td>

                  <td className="p-3">
                    {row.uploadedBy}
                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}