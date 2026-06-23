"use client";

import { useEffect, useState } from "react";

export default function PendingPage() {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("All");

  useEffect(() => {
    loadTasks();
  }, []);


  
  useEffect(() => {
    let temp = [...tasks];

    if (search) {
      temp = temp.filter(
        (item) =>
          item.mainPoint
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
            )
      );
    }

    if (statusFilter !== "All") {
      temp = temp.filter(
        (item) =>
          item.status ===
          statusFilter
      );
    }

    setFilteredTasks(temp);
  }, [
    search,
    statusFilter,
    tasks,
  ]);

  const loadTasks = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        "/api/mom/pending"
      );

      const result =
        await response.json();

      if (result.success) {
        setTasks(result.data);
        setFilteredTasks(
          result.data
        );
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

const sendReminder = async (task) => {
  try {

    const response = await fetch(
      "/api/mom/send-reminder",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(task),
      }
    );

    const result = await response.json();

    if (result.success) {
      alert("Reminder Mail Sent Successfully");
    } else {
      alert(result.message);
    }

  } catch (error) {
    console.error(error);
    alert("Mail Sending Failed");
  }
};

 const formatDate = (
    date
  ) => {
    if (!date) return "-";

    const d = new Date(date);

    if (
      isNaN(
        d.getTime()
      )
    )
      return "-";

    return d.toLocaleDateString(
      "en-GB"
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 text-black">

      <div className="flex justify-between items-center mb-6">

        <h1 className="text-4xl font-bold text-[#3E7591]">
          Pending Tasks
        </h1>

        <button
          onClick={loadTasks}
          className="bg-[#3E7591] text-white px-6 py-3 rounded-lg"
        >
          Refresh
        </button>

      </div>

      <div className="bg-white rounded-xl shadow p-5 mb-6">

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
            value={
              statusFilter
            }
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

      <div className="mb-5 text-lg font-semibold text-[#1f3a5f]">
        Total Pending Tasks :
        {" "}
        {filteredTasks.length}
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow p-10 text-center">
          Loading...
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-10 text-center">
          No Pending Tasks
        </div>
      ) : (
        <div className="grid gap-6">

          {filteredTasks.map(
            (task) => (
              <div
                key={
                  task._id
                }
                className="bg-white rounded-xl shadow-lg p-6"
              >

                <div className="flex justify-between items-center mb-5">

                  <h2 className="text-3xl font-bold text-[#3E7591]">
                    {
                      task.mainPoint
                    }
                  </h2>

                  <span
    className={`px-4 py-2 rounded-full font-semibold
      ${
        task.status === "Open"
          ? "bg-red-100 text-red-600"
          : task.status === "Pending"
          ? "bg-orange-100 text-orange-600"
          : task.status === "In Process"
          ? "bg-yellow-100 text-yellow-700"
          : "bg-green-100 text-green-700"
      }`}
  >
    {task.status}
  </span>

  <button
    onClick={() => sendReminder(task)}
    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
  >
    📧 Send Reminder
  </button>

</div>





                <div className="mb-4">

                  <p className="font-bold text-[#1f3a5f]">
                    Sub Point
                  </p>

                  <p className="text-black text-lg">
                    {
                      task.subPoint
                    }
                  </p>

                </div>

                <div className="grid md:grid-cols-4 gap-5 mb-4">

                  <div>
                    <p className="font-bold text-[#1f3a5f]">
                      FPR
                    </p>

                    <p className="text-black">
                      {
                        task.fpr
                      }
                    </p>
                  </div>

                  <div>
                    <p className="font-bold text-[#1f3a5f]">
                      SPR
                    </p>

                    <p className="text-black">
                      {
                        task.spr
                      }
                    </p>
                  </div>

                  <div>
                    <p className="font-bold text-[#1f3a5f]">
                      Plan End Date
                    </p>

                    <p className="text-black">
                      {formatDate(
                        task.planEndDate
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="font-bold text-[#1f3a5f]">
                      Actual End Date
                    </p>

                    <p className="text-black">
                      {formatDate(
                        task.actualEndDate
                      )}
                    </p>
                  </div>

                </div>

                <div>

                  <p className="font-bold text-[#1f3a5f]">
                    Remark
                  </p>

                  <p className="text-black">
                    {
                      task.remark
                    }
                  </p>

                </div>

              </div>
            )
          )}

        </div>
      )}

    </div>
  );
}