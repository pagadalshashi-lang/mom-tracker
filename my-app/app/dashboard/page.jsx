"use client";

import Sidebar from "@/app/components/Sidebar";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function DashboardPage() {

  const [showProfile, setShowProfile] = useState(false);

  const [user, setUser] = useState(null);

  const [tasks, setTasks] = useState([]);

  // Get Logged User

  useEffect(() => {

    const loggedUser = localStorage.getItem("user");

    if (loggedUser) {

      setUser(JSON.parse(loggedUser));

    }

  }, []);

  // Fetch Tasks

  useEffect(() => {

    const fetchTasks = async () => {

      try {

        const res = await fetch("/api/tasks");

        const data = await res.json();

        setTasks(data);

      } catch (error) {

        console.log(error);

      }

    };

    fetchTasks();

  }, []);

  // USER WISE TASKS

  const userTasks = tasks.filter(

    (task) =>

      task.assignedTo?.toLowerCase() ===
      user?.fullName?.toLowerCase()

  );

  // COUNTS

  const assignedCount = userTasks.filter(
    (task) => task.status === "Assigned"
  ).length;

  const inProcessCount = userTasks.filter(
    (task) => task.status === "In Process"
  ).length;

  const closedCount = userTasks.filter(
    (task) => task.status === "Closed"
  ).length;

  return (

    <div className="flex min-h-screen bg-gray-100">

      {/* Sidebar */}

      <Sidebar />

      {/* Main */}

      <div className="flex-1 p-10">

        {/* Header */}

        <div className="flex justify-between items-center mb-12">

        <div>

  <h1 className="text-5xl font-bold text-gray-800">
    Dashboard
  </h1>

  <p className="text-gray-500 mt-2">
    Welcome back
  </p>

</div>

          {/* Profile */}

          <div className="relative">

            <div
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-4 bg-white px-5 py-3 rounded-2xl shadow-md cursor-pointer hover:bg-gray-50 transition"
            >

              {/* Profile Icon */}

              <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold">

                {user?.fullName?.charAt(0)}

              </div>

              {/* User */}

              <div>

                <h2 className="font-semibold text-gray-800">
                  {user?.fullName}
                </h2>

                <p className="text-sm text-gray-500">
                  {user?.role}
                </p>

              </div>

            </div>

            {/* Dropdown */}

            {
              showProfile && (

                <div className="absolute right-0 mt-3 w-[260px] bg-white rounded-2xl shadow-xl p-5 z-50">

                  <div className="border-b pb-3">

                    <h2 className="font-bold text-lg text-gray-800">
                      {user?.fullName}
                    </h2>

                    <p className="text-sm text-gray-500 mt-1">
                      {user?.email}
                    </p>

                    <p className="text-sm text-blue-600 mt-2 font-semibold">
                      {user?.role}
                    </p>

                  </div>

                  {/* Logout */}

                  <button
                    onClick={() => {

                      localStorage.removeItem("user");

                      window.location.href = "/login";

                    }}
                    className="w-full mt-4 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl transition"
                  >

                    Logout

                  </button>

                </div>

              )
            }

          </div>

        </div>

        {/* Dashboard Cards */}

        <div className="grid grid-cols-3 gap-8">

          {/* Assigned */}

          <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition">

            <h2 className="text-gray-500 text-xl">
              Assigned Tasks
            </h2>

            <h1 className="text-6xl font-bold text-blue-600 mt-6">
              {assignedCount}
            </h1>

          </div>

          {/* In Process */}

          <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition">

            <h2 className="text-gray-500 text-xl">
              In Process
            </h2>

            <h1 className="text-6xl font-bold text-yellow-500 mt-6">
              {inProcessCount}
            </h1>

          </div>

          {/* Closed */}

          <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition">

            <h2 className="text-gray-500 text-xl">
              Closed Tasks
            </h2>

            <h1 className="text-6xl font-bold text-green-600 mt-6">
              {closedCount}
            </h1>

          </div>

        </div>

      </div>

    </div>

  );

}