"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function Sidebar() {

  const [user, setUser] = useState(null);

  useEffect(() => {

    const loggedUser = localStorage.getItem("user");

    if (loggedUser) {

      setUser(JSON.parse(loggedUser));

    }

  }, []);

  return (

    <div className="w-[320px] bg-blue-900 text-white min-h-screen p-8">

      {/* Logo + Title */}

      <div className="flex flex-col items-center mb-14">

        {/* Logo */}

        <div className="bg-white p-4 rounded-3xl shadow-2xl mb-6">

          <Image
            src="/logo.jpg"
            alt="Logo"
            width={120}
            height={120}
            className="object-contain"
          />

        </div>

        {/* Title */}

        <h1 className="text-6xl font-extrabold tracking-wide text-center leading-tight">

          MOM
          <br />
          Tracker

        </h1>

        <p className="text-blue-200 text-center mt-4 text-lg">

          Task Management System

        </p>

      </div>

      {/* Menu */}

      <div className="flex flex-col gap-6">

        {/* Dashboard */}

        <Link
          href="/dashboard"
          className="bg-blue-800 hover:bg-blue-700 px-6 py-5 rounded-3xl text-2xl text-center transition font-semibold"
        >

          Dashboard

        </Link>

        {/* Employee Only */}

        {
          user?.role === "Employee" && (

            <Link
              href="/dashboard/add-task"
              className="bg-blue-800 hover:bg-blue-700 px-6 py-5 rounded-3xl text-2xl text-center transition font-semibold"
            >

              Add Task

            </Link>

          )
        }

        {/* Reports */}

        <Link
          href="/reports"
          className="bg-blue-800 hover:bg-blue-700 px-6 py-5 rounded-3xl text-2xl text-center transition font-semibold"
        >

          Reports

        </Link>

      </div>

    </div>

  );

}