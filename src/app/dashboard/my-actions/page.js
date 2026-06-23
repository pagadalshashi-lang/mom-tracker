"use client";

import { useEffect, useState } from "react";

export default function MyActionsPage() {
const [actions, setActions] = useState([]);
const [loading, setLoading] = useState(true);
const [selectedTask, setSelectedTask] = useState(null);
 useEffect(() => {
  if (selectedTask) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "auto";
  }

  return () => {
    document.body.style.overflow = "auto";
  };
}, [selectedTask]);


  useEffect(() => {
  loadActions();

  const interval = setInterval(() => {
    loadActions();
  }, 30000); // 30 sec

  return () => clearInterval(interval);
}, []);
  const loadActions = async () => {
    try {
      const user = JSON.parse(
        localStorage.getItem("user")
      );

      if (!user) return;

      const response = await fetch(
  `/api/mom/my-actions?email=${encodeURIComponent(
    user.email
  )}`
);

      const result = await response.json();

      if (result.success) {
        setActions(result.data);
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
  status !== "Open" &&
  !row.actualStartDate?.trim()
) {
  alert(
    "Please Set Actual Start Date First"
  );
  return;
}
if (
  row.status === "Closed" &&
  !row.actualEndDate
) {
  row.actualEndDate = new Date()
    .toISOString()
    .split("T")[0];
}
  if (
    row.status === "In Process" ||
    row.status === "Pending"
  ) {

    if (!row.remark?.trim()) {
      alert("Remark is mandatory");
      return;
    }

    if (!row.planEndDate) {
      alert("Plan End Date is mandatory");
      return;
    }
  }

  if (row.status === "Closed") {

    if (!row.remark?.trim()) {
      alert("Remark is mandatory");
      return;
    }

    if (!row.actualEndDate) {
      alert(
        "Please select Actual End Date before closing task"
      );
      return;
    }
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

  planEndDate:
    row.planEndDate,

  actualEndDate:
    row.actualEndDate,

  updatedBy:
    user.name,

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

      alert(
        result.message
      );
    }

  } catch (error) {

    console.error(error);

    alert("Update Failed");
  }
};

const formatDate = (date) => {

  if (!date) return "";

  const d = new Date(date);

  if (isNaN(d.getTime())) {
    return "";
  }

  return d.toISOString().split("T")[0];
};

  if (loading) {
    return (
      <div className="p-10 text-center">
        Loading...
      </div>
    );
  }
return (
  <div className="w-full px-4 lg:px-8 py-6 bg-gray-100 min-h-screen text-black">

    {/* Header */}
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-4xl font-bold text-[#3E7591]">
        My Actions
      </h1>

      
    </div>

    {actions.length === 0 ? (

      <div className="bg-white rounded-xl shadow-lg p-10 text-center">
        No Assigned Tasks
      </div>

    ) : (

      <div className="bg-white rounded-xl shadow-lg overflow-x-auto border">

        <table className="w-full text-sm">

         <thead className="bg-[#3E7591] text-white">
  <tr>
    <th className="p-4 text-left w-[120px]">Main Point</th>
    <th className="p-4 text-left">Sub Point</th>
    <th className="p-4 text-left w-[180px]">Assigned By</th>
    <th className="p-4 text-left w-[180px]">FPR</th>
    <th className="p-4 text-left w-[180px]">SPR</th>
    <th className="p-4 text-center w-[130px]"> Plan End </th>
    <th className="p-4 text-center w-[120px]"> Status </th>
    <th className="p-4 text-center w-[100px]">  View</th>
  </tr>
</thead>

         <tbody className="text-black">

            {actions.map((row) => (

             <tr
  key={row._id}
  className="border-b hover:bg-blue-50 text-black"
>

                <td className="p-4 font-medium">
                  {row.mainPoint}
                </td>

                <td className="p-4 max-w-[400px] break-words">
                  {row.subPoint}
                </td>

                <td className="p-4">
                  {row.uploadedBy || "-"}
                </td>

                <td className="p-4">
                  {row.fpr}
                </td>

                <td className="p-4">
                  {row.spr}
                </td>

               <td className="p-4 text-center whitespace-nowrap">
  {row.planEndDate || "-"}
</td>
                <td className="p-4 text-center">

                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap
                    ${
                      row.status === "Closed"
                        ? "bg-green-100 text-green-700"
                        : row.status === "Pending"
                        ? "bg-orange-100 text-orange-700"
                        : row.status === "In Process"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {row.status}
                  </span>

                </td>

                <td className="p-4 text-center">

                  <button
                    onClick={() =>
                      setSelectedTask(row)
                    }
                    className="bg-[#3E7591] hover:bg-[#2f6078] text-white px-4 py-2 rounded-lg"
                  >
                    View
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    )}

    {/* Modal */}

 {selectedTask && (

  <div
    onClick={() => setSelectedTask(null)}
    style={{
      position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0,0,0,0.7)",
    zIndex: 999999,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  }}
>

   <div
  onClick={(e) => e.stopPropagation()}
  style={{
    background: "white",
    width: "90%",
    maxWidth: "1200px",
    maxHeight: "85vh",
    overflowY: "auto",
    borderRadius: "16px",
    padding: "24px",
  }}
>

          <div className="flex justify-between items-center mb-5">

            <h2 className="text-3xl font-bold text-[#3E7591]">
              MOM Details
            </h2>

            <button
              onClick={() =>
                setSelectedTask(null)
              }
              className="text-red-500 text-3xl"
            >
              ×
            </button>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <div>
              <label className="font-semibold">
                Main Point
              </label>

              <input
                value={selectedTask.mainPoint}
                readOnly
                className="w-full border rounded-lg p-2 bg-gray-100"
              />
            </div>

            <div>
              <label className="font-semibold">
                Sub Point
              </label>

              <input
                value={selectedTask.subPoint}
                readOnly
                className="w-full border rounded-lg p-2 bg-gray-100"
              />
            </div>

            <div>
              <label className="font-semibold">
                FPR
              </label>

              <input
                value={selectedTask.fpr}
                readOnly
                className="w-full border rounded-lg p-2 bg-gray-100"
              />
            </div>

            <div>
              <label className="font-semibold">
                SPR
              </label>

              <input
                value={selectedTask.spr}
                readOnly
                className="w-full border rounded-lg p-2 bg-gray-100"
              />
            </div>

            <div>
              <label className="font-semibold">
                Assigned By
              </label>

              <input
                value={selectedTask.uploadedBy || ""}
                readOnly
                className="w-full border rounded-lg p-2 bg-gray-100"
              />
            </div>
             <div>
  <label className="font-semibold">
    Actual Start Date
  </label>

 <input
  type="date"
  value={
    formatDate(
      selectedTask.actualStartDate
    )
  }
  disabled={
    !!selectedTask.actualStartDate
  }
  onChange={(e) => {

    const selectedDate =
      e.target.value;

    const planStart =
      new Date(
        selectedTask.planStartDate
      );

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

    setSelectedTask({
      ...selectedTask,
      actualStartDate:
        selectedDate,
    });

  }}
  className="w-full border rounded-lg p-2"
/>

</div>


            <div>
              <label className="font-semibold">
                Plan End Date
              </label>
    <input
  value={selectedTask.planEndDate || ""}
  readOnly
  className="w-full border rounded-lg p-2 bg-gray-100"
/>
            </div>

            <div>
              <label className="font-semibold">
                Actual End Date
              </label>

             <input
  type="date"
  value={formatDate(selectedTask.actualEndDate)}
  readOnly
  className="w-full border rounded-lg p-2 bg-gray-100"
/>
            </div>

            <div>
              <label className="font-semibold">
                Status
              </label>

              <select
  value={selectedTask.status}
  onChange={(e) => {

    const newStatus =
      e.target.value;

    if (
      newStatus !== "Open" &&
      !selectedTask.actualStartDate
    ) {
      alert(
        "Please Set Actual Start Date First"
      );
      return;
    }

    if (
      newStatus === "Closed"
    ) {

      setSelectedTask({
        ...selectedTask,
        status: "Closed",
        actualEndDate:
          new Date()
            .toISOString()
            .split("T")[0],
      });

      return;
    }

    setSelectedTask({
      ...selectedTask,
      status: newStatus,
    });

  }}
  className="w-full border rounded-lg p-2"
>
                <option>Open</option>
                <option>In Process</option>
                <option>Pending</option>
                <option>Closed</option>
              </select>
            </div>

            <div className="col-span-2">

              <label className="font-semibold">
                Remark
              </label>

              <textarea
                rows={4}
                value={selectedTask.remark || ""}
                onChange={(e) =>
                  setSelectedTask({
                    ...selectedTask,
                    remark: e.target.value,
                  })
                }
                className="w-full border rounded-lg p-3"
              />

            </div>

          </div>

          <div className="mt-6 pt-4 border-t flex justify-end">

            <button
              onClick={() =>
                updateAction(selectedTask)
              }
              className="bg-[#3E7591] hover:bg-[#2f6078] text-white px-6 py-3 rounded-lg font-semibold"
            >
              Save Changes
            </button>

          </div>

        </div>

      </div>

    )}

  </div>
);
}