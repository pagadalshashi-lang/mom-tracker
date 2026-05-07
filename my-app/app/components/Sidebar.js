"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Sidebar() {

  const [user, setUser] = useState(null);

  useEffect(() => {

    const loggedUser = localStorage.getItem("user");

    if (loggedUser) {

      setUser(JSON.parse(loggedUser));

    }

  }, []);

  return (

    <div className="w-[280px] bg-blue-900 text-white min-h-screen p-8">

      {/* Logo */}

      <h1 className="text-5xl font-bold mb-14 leading-tight">
        Mom <br /> Tracker
      </h1>

      {/* Menu */}

      <div className="flex flex-col gap-7">

        {/* Dashboard */}

        <Link
          href="/dashboard"
          className="bg-blue-800 hover:bg-blue-700 px-7 py-5 rounded-3xl text-2xl font-medium transition duration-300"
        >

          Dashboard

        </Link>

        {/* Add Task */}

        {
          user?.role === "Employee" && (

            <Link
              href="/dashboard/add-task"
              className="bg-blue-800 hover:bg-blue-700 px-7 py-5 rounded-3xl text-2xl font-medium transition duration-300"
            >

              Add Task

            </Link>

          )
        }

        {/* Reports */}

        <Link
          href="/reports"
          className="bg-blue-800 hover:bg-blue-700 px-7 py-5 rounded-3xl text-2xl font-medium transition duration-300"
        >

          Reports

        </Link>

      </div>

    </div>

  );

}