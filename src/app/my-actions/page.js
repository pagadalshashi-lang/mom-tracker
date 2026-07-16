"use client";

import { useEffect, useState } from "react";

export default function MyActionsPage() {
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [view, setView] = useState("my");

  // Filters
  const [uploadedByFilter, setUploadedByFilter] = useState("All");
  const [accountFilter, setAccountFilter] = useState("");
  const [fprFilter, setFprFilter] = useState("");
  const [sprFilter, setSprFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [filterOptions, setFilterOptions] = useState({
    uploadedByList: [],
    accounts: [],
    fprList: [],
    sprList: [],
  });

  // Accounts pulled directly from HRMS (each employee's "Accounts" field
  // is a comma-separated list), rather than only what's already saved
  // in existing MOM records.
  const [hrmsAccounts, setHrmsAccounts] = useState([]);

  useEffect(() => {
    fetch("/api/hrms")
      .then((res) => res.json())
      .then((employees) => {
        const all = [];

        (employees || []).forEach((emp) => {
          if (emp.Accounts) {
            emp.Accounts.split(",").forEach((a) => {
              const trimmed = a.trim();
              if (trimmed) all.push(trimmed);
            });
          }
        });

        const unique = [...new Set(all)].sort((a, b) =>
          a.localeCompare(b)
        );

        setHrmsAccounts(unique);
      })
      .catch((err) => console.error("HRMS accounts fetch failed:", err));
  }, []);

  // Merge HRMS accounts with whatever's already in the DB, so nothing
  // that was previously selectable disappears even if HRMS data is
  // incomplete for some record.
  const accountOptions = [
    ...new Set([...hrmsAccounts, ...filterOptions.accounts]),
  ].sort((a, b) => a.localeCompare(b));

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
    }, 30000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, uploadedByFilter, accountFilter, fprFilter, sprFilter, statusFilter]);

  const loadActions = async () => {
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

      const response = await fetch(
        `/api/mom/my-actions?${params.toString()}`
      );

      const result = await response.json();

      if (result.success) {
        setActions(result.data);

        if (result.filterOptions) {
          setFilterOptions(result.filterOptions);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setUploadedByFilter("All");
    setAccountFilter("");
    setFprFilter("");
    setSprFilter("");
    setStatusFilter("All");
  };

  const updateField = (index, field, value) => {
    const temp = [...actions];
    temp[index][field] = value;
    setActions(temp);
  };

  const updateAction = async (row) => {
    // Mandatory fields before save
    if (!row.account) {
      alert("Account is mandatory");
      return;
    }

    if (!row.planStartDate) {
      alert("Plan Start Date is mandatory");
      return;
    }

    if (!row.planEndDate) {
      alert("Plan End Date is mandatory");
      return;
    }

    if (!row.status) {
      alert("Status is mandatory");
      return;
    }

    if (row.status !== "Open" && !row.actualStartDate?.trim()) {
      alert("Please Set Actual Start Date First");
      return;
    }

    if (row.status === "Closed" && !row.actualEndDate) {
      row.actualEndDate = new Date().toISOString().split("T")[0];
    }
    if (row.status === "In Process" || row.status === "Pending") {
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
        alert("Please select Actual End Date before closing task");
        return;
      }
    }

    try {
      const user = JSON.parse(localStorage.getItem("user"));

      const response = await fetch("/api/mom/update-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: row._id,

          account: row.account,

          status: row.status,
          remark: row.remark,

          planStartDate: row.planStartDate,
          actualStartDate: row.actualStartDate,

          planEndDate: row.planEndDate,

          actualEndDate: row.actualEndDate,

          updatedBy: user.name,

          updatedByEmail: user.email,
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert("Task Updated Successfully");

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

  const formatDate = (date) => {
    if (!date) return "";

    const d = new Date(date);

    if (isNaN(d.getTime())) {
      return "";
    }

    return d.toISOString().split("T")[0];
  };

  if (loading) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  return (
    <div className="w-full px-4 lg:px-8 py-6 bg-gray-100 min-h-screen text-black">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold text-[#3E7591]">
          {view === "my"
            ? "My Actions"
            : view === "uploaded"
            ? "Uploaded By Me"
            : "Team Actions"}
        </h1>
      </div>

      <div className="flex gap-4 mt-5 mb-6">
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
          onClick={() => setView("uploaded")}
          className={`px-6 py-2 rounded-lg font-semibold transition ${
            view === "uploaded"
              ? "bg-[#3E7591] text-white"
              : "bg-white border text-[#3E7591]"
          }`}
        >
          Uploaded By Me
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

      {/* Filters */}
      <div className="bg-white rounded-xl shadow border p-4 mb-6">
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
            list="my-actions-account-options"
            placeholder="Search / select Account"
            value={accountFilter}
            onChange={(e) => setAccountFilter(e.target.value)}
            className="border p-2.5 rounded-lg text-black"
          />
          <datalist id="my-actions-account-options">
            {accountOptions.map((acc) => (
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

      {actions.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-10 text-center">
          {view === "my"
            ? "No Assigned Tasks"
            : view === "uploaded"
            ? "No Uploaded Tasks"
            : "No Team Tasks"}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-x-auto border">
          <table className="w-full text-sm">
            <thead className="bg-[#3E7591] text-white">
              <tr>
                <th className="p-4 text-left w-[120px]">Account</th>
                <th className="p-4 text-left w-[120px]">Main Point</th>
                <th className="p-4 text-left">Sub Point</th>
                <th className="p-4 text-left w-[180px]">
                  {view === "my" ? "Assigned By" : "Uploaded By"}
                </th>
                <th className="p-4 text-left w-[180px]">FPR</th>
                <th className="p-4 text-left w-[180px]">SPR</th>
                <th className="p-4 text-center w-[130px]"> Plan End </th>
                <th className="p-4 text-center w-[120px]"> Status </th>
                <th className="p-4 text-center w-[100px]"> View</th>
              </tr>
            </thead>

            <tbody className="text-black">
              {actions.map((row) => (
                <tr
                  key={row._id}
                  className="border-b hover:bg-blue-50 text-black"
                >
                  <td className="p-4">{row.account || "-"}</td>

                  <td className="p-4 font-medium">{row.mainPoint}</td>

                  <td className="p-4 max-w-[400px] break-words">
                    {row.subPoint}
                  </td>

                  <td className="p-4">{row.uploadedBy || "-"}</td>

                  <td className="p-4">{row.fpr}</td>

                  <td className="p-4">{row.spr}</td>

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
                      onClick={() => setSelectedTask(row)}
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
                onClick={() => setSelectedTask(null)}
                className="text-red-500 text-3xl"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="font-semibold">
                  Account <span className="text-red-500">*</span>
                </label>

                <input
  type="text"
  list="modal-account-options"
  placeholder="Search / select Account"
  value={selectedTask.account || ""}
  onChange={(e) =>
    setSelectedTask({
      ...selectedTask,
      account: e.target.value,
    })
  }
  className="w-full border rounded-lg p-2"
/>
<datalist id="modal-account-options">
  {accountOptions.map((acc) => (
    <option key={acc} value={acc} />
  ))}
</datalist>
                 
              </div>

              <div>
                <label className="font-semibold">Main Point</label>

                <input
                  value={selectedTask.mainPoint}
                  readOnly
                  className="w-full border rounded-lg p-2 bg-gray-100"
                />
              </div>

              <div>
                <label className="font-semibold">Sub Point</label>

                <input
                  value={selectedTask.subPoint}
                  readOnly
                  className="w-full border rounded-lg p-2 bg-gray-100"
                />
              </div>

              <div>
                <label className="font-semibold">FPR</label>

                <input
                  value={selectedTask.fpr}
                  readOnly
                  className="w-full border rounded-lg p-2 bg-gray-100"
                />
              </div>

              <div>
                <label className="font-semibold">SPR</label>

                <input
                  value={selectedTask.spr}
                  readOnly
                  className="w-full border rounded-lg p-2 bg-gray-100"
                />
              </div>

              <div>
                <label className="font-semibold">Assigned By</label>

                <input
                  value={selectedTask.uploadedBy || ""}
                  readOnly
                  className="w-full border rounded-lg p-2 bg-gray-100"
                />
              </div>

              <div>
                <label className="font-semibold">
                  Plan Start Date <span className="text-red-500">*</span>
                </label>

                <input
                  value={selectedTask.planStartDate || ""}
                  readOnly
                  className="w-full border rounded-lg p-2 bg-gray-100"
                />
              </div>

              <div>
                <label className="font-semibold">
                  Actual Start Date <span className="text-red-500">*</span>
                </label>

                <input
                  type="date"
                  value={formatDate(selectedTask.actualStartDate)}
                  disabled={!!selectedTask.actualStartDate}
                  onChange={(e) => {
                    const selectedDate = e.target.value;

                    const planStart = new Date(selectedTask.planStartDate);

                    const actualStart = new Date(selectedDate);

                    if (actualStart < planStart) {
                      alert(
                        "Actual Start Date cannot be before Plan Start Date"
                      );
                      return;
                    }

                    setSelectedTask({
                      ...selectedTask,
                      actualStartDate: selectedDate,
                    });
                  }}
                  className="w-full border rounded-lg p-2"
                />
              </div>

              <div>
                <label className="font-semibold">
                  Plan End Date <span className="text-red-500">*</span>
                </label>
                <input
                  value={selectedTask.planEndDate || ""}
                  readOnly
                  className="w-full border rounded-lg p-2 bg-gray-100"
                />
              </div>

              <div>
                <label className="font-semibold">Actual End Date</label>

                <input
                  type="date"
                  value={formatDate(selectedTask.actualEndDate)}
                  readOnly
                  className="w-full border rounded-lg p-2 bg-gray-100"
                />
              </div>

              <div>
                <label className="font-semibold">
                  Status <span className="text-red-500">*</span>
                </label>

                <select
                  value={selectedTask.status}
                  onChange={(e) => {
                    const newStatus = e.target.value;

                    if (
                      newStatus !== "Open" &&
                      !selectedTask.actualStartDate
                    ) {
                      alert("Please Set Actual Start Date First");
                      return;
                    }

                    if (newStatus === "Closed") {
                      setSelectedTask({
                        ...selectedTask,
                        status: "Closed",
                        actualEndDate: new Date()
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
                <label className="font-semibold">Remark</label>

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
                onClick={() => updateAction(selectedTask)}
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