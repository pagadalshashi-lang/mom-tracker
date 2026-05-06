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

      <h1 className="text-4xl font-bold mb-14">
        Mom Tracker
      </h1>

      {/* Menu */}

      <div className="flex flex-col gap-5">

        {/* Dashboard */}

        <Link
          href="/dashboard"
          className="bg-blue-800 hover:bg-blue-700 px-5 py-4 rounded-2xl text-lg transition"
        >

          Dashboard

        </Link>

        {/* Employee Only */}

        {
          user?.role === "Employee" && (

            <Link
              href="/add-task"
              className="bg-blue-800 hover:bg-blue-700 px-5 py-4 rounded-2xl text-lg transition"
            >

              Add Task

            </Link>

          )
        }

        {/* Reports */}

        <Link
          href="/reports"
          className="bg-blue-800 hover:bg-blue-700 px-5 py-4 rounded-2xl text-lg transition"
        >

          Reports

        </Link>

      </div>

    </div>

  );

}