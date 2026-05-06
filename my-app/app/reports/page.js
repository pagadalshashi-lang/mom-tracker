"use client";

import Sidebar from "@/app/components/Sidebar";
import { useEffect, useState } from "react";

export default function ReportsPage() {

  const [tasks, setTasks] = useState([]);

  const [user, setUser] = useState(null);

  // Logged User

  useEffect(() => {

    const loggedUser = localStorage.getItem("user");

    if (loggedUser) {

      setUser(JSON.parse(loggedUser));

    }

  }, []);

  // Fetch Tasks

  const fetchTasks = async () => {

    try {

      const res = await fetch("/api/tasks");

      const data = await res.json();

      setTasks(data);

    } catch (error) {

      console.log(error);

    }

  };

  useEffect(() => {

    fetchTasks();

  }, []);

  // Update Status

  const updateTaskStatus = async (taskId, newStatus) => {

    try {

      const actualStartDate =
        newStatus === "In Process"
          ? new Date().toISOString().split("T")[0]
          : "";

      const actualEndDate =
        newStatus === "Closed"
          ? new Date().toISOString().split("T")[0]
          : "";

      const res = await fetch(`/api/tasks/${taskId}`, {

        method: "PUT",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({

          status: newStatus,

          actualStartDate,

          actualEndDate,

        }),

      });

      const data = await res.json();

      if (data.success) {

        fetchTasks();

      }

    } catch (error) {

      console.log(error);

    }

  };

  return (

    <div className="flex min-h-screen bg-gray-100">

      {/* Sidebar */}

      <Sidebar />

      {/* Main */}

      <div className="flex-1 p-10">

        <h1 className="text-5xl font-bold text-gray-800 mb-10">
          Reports
        </h1>

        {/* Table */}

        <div className="bg-white rounded-3xl shadow-lg overflow-auto">

          <table className="w-full">

            <thead className="bg-blue-600 text-white">

              <tr>

                <th className="p-5 text-left">
                  Pointer
                </th>

                <th className="p-5 text-left">
                  Assigned To
                </th>

                <th className="p-5 text-left">
                  Status
                </th>

                <th className="p-5 text-left">
                  Planned End
                </th>

                <th className="p-5 text-left">
                  Actual Start
                </th>

                <th className="p-5 text-left">
                  Actual End
                </th>

                <th className="p-5 text-left">
                  Action
                </th>

              </tr>

            </thead>

            <tbody>

              {
                tasks.map((task, index) => (

                  <tr
                    key={index}
                    className="border-b hover:bg-gray-50"
                  >

                    {/* Pointer */}

                    <td className="p-5">
                      {task.pointer}
                    </td>

                    {/* Assigned */}

                    <td className="p-5">
                      {task.assignedTo}
                    </td>

                    {/* Status */}

                    <td className="p-5">

                      <span
                        className={`px-4 py-2 rounded-xl text-white text-sm

                          ${
                            task.status === "Assigned"
                              ? "bg-blue-500"
                              : task.status === "In Process"
                              ? "bg-yellow-500"
                              : "bg-green-600"
                          }

                        `}
                      >

                        {task.status}

                      </span>

                    </td>

                    {/* Planned End */}

                    <td className="p-5">
                      {task.plannedEndDate}
                    </td>

                    {/* Actual Start */}

                    <td className="p-5">
                      {task.actualStartDate || "-"}
                    </td>

                    {/* Actual End */}

                    <td className="p-5">
                      {task.actualEndDate || "-"}
                    </td>

                    {/* Action */}

                    <td className="p-5">

                      {
                        user?.name?.toLowerCase() ===
                        task.assignedTo?.toLowerCase() && (

                          <select
                            value={task.status}
                            onChange={(e) =>
                              updateTaskStatus(
                                task._id,
                                e.target.value
                              )
                            }
                            className="border p-3 rounded-xl"
                          >

                            <option value="Assigned">
                              Assigned
                            </option>

                            <option value="In Process">
                              In Process
                            </option>

                            <option value="Closed">
                              Closed
                            </option>

                          </select>

                        )
                      }

                    </td>

                  </tr>

                ))
              }

            </tbody>

          </table>

        </div>

      </div>

    </div>

  );

}