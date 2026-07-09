"use client";

import { useEffect, useState } from "react";

export default function MyActionsPage() {
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");
const [uploadedByFilter, setUploadedByFilter] = useState("All");
const [planStartFilter, setPlanStartFilter] = useState("");
const [planEndFilter, setPlanEndFilter] = useState("");

const [page, setPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);
const [uploadedByList, setUploadedByList] = useState([]);

const limit = 20;

 useEffect(() => {
  loadActions();
}, [
  statusFilter,
  uploadedByFilter,
  planStartFilter,
  planEndFilter,
  page,
]);

  const loadActions = async () => {
    try {
      const user = JSON.parse(
        localStorage.getItem("user")
      );

      if (!user) {
        setLoading(false);
        return;
      }

  
const response = await fetch(
  `/api/mom/my-actions?email=${encodeURIComponent(user.email)}
  &status=${statusFilter}
  &uploadedBy=${uploadedByFilter}
  &planStartDate=${planStartFilter}
  &planEndDate=${planEndFilter}
  &page=${page}
  &limit=${limit}`
);
      const result =
        await response.json();

      if (result.success) {
  setActions(result.data);
  setUploadedByList(result.uploadedByList);
  setTotalPages(result.totalPages);
}
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateField = (
    index,
    field,
    value
  ) => {
    const temp = [...actions];
    temp[index][field] = value;
    setActions(temp);
  };

 const updateAction = async (row) => {

  if (
    row.status !== "Open" &&
    !row.actualStartDate
  ) {
    alert(
      "Please Set Actual Start Date First"
    );
    return;
  }

  if (
    (row.status === "In Process" ||
      row.status === "Pending" ||
      row.status === "Closed") &&
    !row.remark?.trim()
  ) {
    alert("Remark is Mandatory");
    return;
  }

  if (
    row.status === "Closed" &&
    !row.actualEndDate
  ) {
    row.actualEndDate =
      new Date()
        .toISOString()
        .split("T")[0];
  }

  try {

    const user = JSON.parse(
      localStorage.getItem("user")
    );

    const response = await fetch(
      "/api/mom/update-status",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          id: row._id,
          status: row.status,
          remark: row.remark,
          actualStartDate:
            row.actualStartDate,
          actualEndDate:
            row.actualEndDate,
          updatedBy: user.name,
          updatedByEmail:
            user.email,
        }),
      }
    );

    const result =
      await response.json();

    if (result.success) {

      alert(
        "Task Updated Successfully"
      );

      setSelectedTask(null);

      loadActions();

    } else {

      alert(result.message);

    }

  } catch (error) {

    console.error(error);

    alert("Update Failed");

  }
};

  if (loading) {
    return (
      <div className="p-8">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">

      <div className="w-full mx-auto">

        <h1 className="text-4xl font-bold text-[#3E7591] mb-8">
          My Actions
        </h1>
<div className="bg-white p-4 rounded-lg shadow mb-6">

  <div className="grid md:grid-cols-4 gap-4">

    <select
      value={statusFilter}
      onChange={(e)=>setStatusFilter(e.target.value)}
      className="border rounded-lg p-2"
    >
      <option value="All">All Status</option>
      <option value="Open">Open</option>
      <option value="In Process">In Process</option>
      <option value="Pending">Pending</option>
      <option value="Closed">Closed</option>
    </select>

    <input
      type="date"
      value={planStartFilter}
      onChange={(e)=>setPlanStartFilter(e.target.value)}
      className="border rounded-lg p-2"
    />

    <input
      type="date"
      value={planEndFilter}
      onChange={(e)=>setPlanEndFilter(e.target.value)}
      className="border rounded-lg p-2"
    />

    <button
      onClick={()=>{
        setStatusFilter("All");
        setPlanStartFilter("");
        setPlanEndFilter("");
      }}
      className="bg-red-500 text-white rounded-lg"
    >
      Reset
    </button>

  </div>

</div>
        {actions.length === 0 ? (
          <div className="bg-white p-10 rounded-xl shadow text-center text-gray-500">
            No Assigned Tasks
          </div>
        ) : (
          <div className="grid gap-6">

            {actions.map(
              (
                row,
                index
              ) => (
                <div
                  key={row._id}
                  className="bg-white rounded-xl shadow-md p-4 border"
                >

                  <div className="flex flex-wrap justify-between items-center gap-3 mb-4">

                    <h2 className="text-2xl font-bold text-[#3E7591]">
                      {
                        row.mainPoint
                      }
                    </h2>

                    <span
                      className={`px-4 py-1 rounded-full text-sm font-semibold
                      ${
                        row.status ===
                        "Closed"
                          ? "bg-green-100 text-green-700"
                          : row.status ===
                            "Pending"
                          ? "bg-orange-100 text-orange-700"
                          : row.status ===
                            "In Process"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {
                        row.status
                      }
                    </span>

                  </div>

                  <div className="mb-4">
                    <label className="font-semibold text-gray-700">
                      Sub Point
                    </label>

                    <p className="text-black mt-1">
                      {
                        row.subPoint
                      }
                    </p>
                  </div>

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

                  <div className="grid md:grid-cols-2 gap-4 mb-4">

                    <div>

                      <label className="font-semibold text-gray-700">
                        Status
                      </label>

                      <select
                        value={
                          row.status ||
                          "Open"
                        }
                        disabled={
                          row.status ===
                          "Closed"
                        }
                        onChange={(
                          e
                        ) =>
                          updateField(
                            index,
                            "status",
                            e.target
                              .value
                          )
                        }
                        className="w-full border rounded-lg p-3 text-black mt-1"
                      >
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

                    <div>

                      <label className="font-semibold text-gray-700">
                        Remark
                      </label>

                      <textarea
                        rows="3"
                        value={
                          row.remark ||
                          ""
                        }
                        disabled={
                          row.status ===
                          "Closed"
                        }
                        onChange={(
                          e
                        ) =>
                          updateField(
                            index,
                            "remark",
                            e.target
                              .value
                          )
                        }
                        className="w-full border rounded-lg p-3 text-black mt-1"
                      />

                    </div>

                  </div>

                  <div className="grid md:grid-cols-4 gap-4 mb-6">

                    <div>
                      <label className="font-semibold text-gray-700">
                        Plan Start
                      </label>

                      <p className="text-black">
                        {
                          row.planStartDate
                        }
                      </p>
                    </div>

                   <div>
  <label className="font-semibold">
    Plan End Date
  </label>

  <input
    type="text"
    readOnly
    value={row.planEndDate || ""}
    className="w-full border rounded-lg p-2 bg-gray-100"
  />
</div>

                  <div>
  <label className="font-semibold">
    Actual Start Date
  </label>
<input
  type="date"
 value={row.actualStartDate || ""}
  onChange={(e) => {

    if (row.actualStartDate) {
      alert(
        "Actual Start Date already set"
      );
      return;
    }

    const selectedDate =
      e.target.value;

    const planStart = new Date(row.planStartDate);

    const actualStart =
      new Date(
        selectedDate
      );

    if (
      actualStart < planStart
    ) {
      alert(
        "Actual Start Date cannot be before Plan Start Date"
      );
      return;
    }

    updateField(
    index,
    "actualStartDate",
    selectedDate
);   
  }}
 readOnly={!!row.actualStartDate}
  className="w-full border rounded-lg p-2"
/>
</div>
<div>
  <label className="font-semibold">
    Actual End Date
  </label>

  <input
    type="date"
    value={row.actualEndDate || ""}
    readOnly
    className="w-full border rounded-lg p-2 bg-gray-100"
  />
</div>

</div>

<div className="flex gap-3">

  <button
  onClick={() => {
    setSelectedTask(row);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }}
  className="bg-[#3E7591] text-white px-6 py-3 rounded-lg"
>
  View
</button>
  {row.status !== "Closed" && (
    <button
      onClick={() => updateAction(row)}
      className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg"
    >
      Update
    </button>
  )}
</div>

</div>
   ))}
          </div>
        )}
console.log(selectedTask);
        {selectedTask && (
          <div
  className="fixed inset-0 bg-black/50 flex items-center justify-center p-4"
  style={{ zIndex: 99999 }}
>
            <div className="bg-white w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl p-6">

              <div className="flex justify-between items-center mb-5">
                <h2 className="text-2xl font-bold text-[#3E7591]">
                  MOM Details
                </h2>

                <button
                  onClick={() => setSelectedTask(null)}
                  className="text-red-500 text-3xl"
                >
                  ✕
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold">Main Point</label>
                  <input
                    value={selectedTask.mainPoint || ""}
                    readOnly
                    className="w-full border rounded p-2"
                  />
                </div>

                <div>
                  <label className="font-semibold">Sub Point</label>
                  <textarea
                    rows="3"
                    value={selectedTask.subPoint || ""}
                    readOnly
                    className="w-full border rounded p-2"
                  />
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}