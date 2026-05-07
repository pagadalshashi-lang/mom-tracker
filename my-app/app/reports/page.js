"use client";

import Sidebar from "@/app/components/Sidebar";
import { useEffect, useState } from "react";

export default function ReportsPage() {

  const [assignedTasks, setAssignedTasks] = useState([]);
  const [selfTasks, setSelfTasks] = useState([]);

  // FETCH TASKS

  const fetchTasks = async () => {

    try {

      const res = await fetch("/api/tasks");

      const data = await res.json();

      const loggedUser = JSON.parse(
        localStorage.getItem("user")
      );

      // TASKS CREATED BY ME

      const creatorTasks = data.filter(

        (task) =>

          task.createdBy?.toLowerCase() ===
          loggedUser?.fullName?.toLowerCase()

      );

      // TASKS ASSIGNED TO ME

      const myTasks = data.filter(

        (task) =>

          task.fpr?.toLowerCase() ===
            loggedUser?.fullName?.toLowerCase()

          ||

          task.spr?.toLowerCase() ===
            loggedUser?.fullName?.toLowerCase()

      );

      setAssignedTasks(creatorTasks);

      setSelfTasks(myTasks);

    } catch (error) {

      console.log(error);

    }

  };

  // INITIAL LOAD

  useEffect(() => {

    fetchTasks();

  }, []);

  // UPDATE TASK

  const updateTask = async (

    taskId,
    updatedFields

  ) => {

    try {

      const res = await fetch(

        `/api/tasks/${taskId}`,

        {

          method: "PUT",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(updatedFields),

        }

      );

      const data = await res.json();

      if (data.success) {

        await fetchTasks();

        alert("Task Updated Successfully");

      }

    } catch (error) {

      console.log(error);

    }

  };

  return (

    <div className="flex min-h-screen bg-gray-100">

      {/* SIDEBAR */}

      <Sidebar />

      {/* MAIN */}

      <div className="flex-1 p-8 overflow-auto">

        {/* ASSIGNED TASKS */}

        <h1 className="text-3xl font-bold text-gray-800 mb-5">

          Assigned Tasks

        </h1>

        <div className="bg-white rounded-3xl shadow-lg overflow-auto mb-14">

          <table className="w-full text-sm">

            <thead className="bg-blue-700 text-white">

              <tr>

                <th className="p-3 text-left">
                  Account
                </th>

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
                  Plan Start
                </th>

                <th className="p-3 text-left">
                  Actual Start
                </th>

                <th className="p-3 text-left">
                  Plan End
                </th>

                <th className="p-3 text-left">
                  Actual End
                </th>

                <th className="p-3 text-left">
                  Status
                </th>

                <th className="p-3 text-left">
                  Remark
                </th>

              </tr>

            </thead>

            <tbody>

              {

                assignedTasks.map((task, index) => (

                  <tr
                    key={index}
                    className="border-b hover:bg-gray-50"
                  >

                    <td className="p-3">
                      {task.account}
                    </td>

                    <td className="p-3">
                      {task.mainPoint}
                    </td>

                    <td className="p-3">
                      {task.subPoint}
                    </td>

                    <td className="p-3">
                      {task.fpr}
                    </td>

                    <td className="p-3">
                      {task.spr}
                    </td>

                    <td className="p-3">
                      {task.plannedStartDate}
                    </td>

                    <td className="p-3">
                      {task.actualStartDate || "-"}
                    </td>

                    <td className="p-3">
                      {task.plannedEndDate}
                    </td>

                    <td className="p-3">
                      {task.actualEndDate || "-"}
                    </td>

                    <td className="p-3">
                      {task.status}
                    </td>

                    <td className="p-3">
                      {task.remark || "-"}
                    </td>

                  </tr>

                ))

              }

            </tbody>

          </table>

        </div>

        {/* SELF TASKS */}

        <h1 className="text-3xl font-bold text-gray-800 mb-5">

          Self Tasks

        </h1>

        <div className="bg-white rounded-3xl shadow-lg overflow-auto">

          <table className="w-full text-sm">

            <thead className="bg-green-700 text-white">

              <tr>

                <th className="p-3 text-left">
                  Account
                </th>

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
                  Plan Start
                </th>

                <th className="p-3 text-left">
                  Actual Start
                </th>

                <th className="p-3 text-left">
                  Plan End
                </th>

                <th className="p-3 text-left">
                  Actual End
                </th>

                <th className="p-3 text-left">
                  Status
                </th>

                <th className="p-3 text-left">
                  Remark
                </th>

                <th className="p-3 text-left">
                  Save
                </th>

              </tr>

            </thead>

            <tbody>

              {

                selfTasks.map((task, index) => (

                  <tr
                    key={index}
                    className="border-b hover:bg-gray-50"
                  >

                    <td className="p-3">
                      {task.account}
                    </td>

                    <td className="p-3">
                      {task.mainPoint}
                    </td>

                    <td className="p-3">
                      {task.subPoint}
                    </td>

                    <td className="p-3">
                      {task.fpr}
                    </td>

                    <td className="p-3">
                      {task.spr}
                    </td>

                    <td className="p-3">
                      {task.plannedStartDate}
                    </td>

                    {/* ACTUAL START */}

                    <td className="p-3">

                      <input
                        type="date"
                        disabled={
                          task.status === "Closed"
                        }
                        value={
                          task.actualStartDate || ""
                        }
                        onChange={(e) => {

                          const updatedTasks =
                            [...selfTasks];

                          updatedTasks[index]
                            .actualStartDate =
                              e.target.value;

                          setSelfTasks(updatedTasks);

                        }}
                        className="border p-2 rounded-lg text-sm"
                      />

                    </td>

                    <td className="p-3">
                      {task.plannedEndDate}
                    </td>

                    {/* ACTUAL END */}

                    <td className="p-3">

                      <input
                        type="date"
                        disabled={
                          task.status === "Closed"
                        }
                        value={
                          task.actualEndDate || ""
                        }
                        onChange={(e) => {

                          const updatedTasks =
                            [...selfTasks];

                          updatedTasks[index]
                            .actualEndDate =
                              e.target.value;

                          setSelfTasks(updatedTasks);

                        }}
                        className="border p-2 rounded-lg text-sm"
                      />

                    </td>

                    {/* STATUS */}

                    <td className="p-3">

                      <select

                        disabled={
                          task.status === "Closed"
                        }

                        value={task.status}

                        onChange={(e) => {

                          const updatedTasks =
                            [...selfTasks];

                          updatedTasks[index].status =
                            e.target.value;

                          setSelfTasks(updatedTasks);

                        }}

                        className="border p-2 rounded-lg text-sm"
                      >

                        <option value="Pending">
                          Pending
                        </option>

                        <option value="In Progress">
                          In Progress
                        </option>

                        <option value="Closed">
                          Closed
                        </option>

                      </select>

                    </td>

                    {/* REMARK */}

                    <td className="p-3">

                      <input
                        type="text"

                        disabled={
                          task.status === "Closed"
                        }

                        value={task.remark || ""}

                        onChange={(e) => {

                          const updatedTasks =
                            [...selfTasks];

                          updatedTasks[index].remark =
                            e.target.value;

                          setSelfTasks(updatedTasks);

                        }}

                        className="border p-2 rounded-lg text-sm"

                        placeholder="Remark"
                      />

                    </td>

                    {/* SAVE */}

                    <td className="p-3">

                      <button

                        disabled={
                          task.status === "Closed"
                        }

                        onClick={async () => {

                          await updateTask(

                            task._id,

                            {

                              status:
                                task.status,

                              actualStartDate:
                                task.actualStartDate,

                              actualEndDate:
                                task.actualEndDate,

                              remark:
                                task.remark,

                            }

                          );

                        }}

                        className={`px-3 py-2 rounded-lg text-sm text-white

                        ${
                          task.status === "Closed"

                            ? "bg-gray-400 cursor-not-allowed"

                            : "bg-green-600 hover:bg-green-700"
                        }
                        
                        `}
                      >

                        Save

                      </button>

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