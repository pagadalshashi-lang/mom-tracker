"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {

  const router = useRouter();

  const [name, setName] = useState("");

  const [fullName, setFullName] = useState("");

  const [role, setRole] = useState("Employee");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const handleRegister = async () => {

    try {

      const res = await fetch("/api/register", {

        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({

          name,

          fullName,

          role,

          email,

          password,

        }),

      });

      const data = await res.json();

      if (res.ok) {

        alert("Account Created Successfully");

        router.push("/login");

      } else {

        alert(data.message);

      }

    } catch (error) {

      console.log(error);

      alert("Registration Failed");

    }

  };

  return (

    <div className="min-h-screen flex">

      {/* Left Side */}

      <div className="w-1/2 bg-blue-900 text-white flex flex-col justify-center items-center p-10">

        <h1 className="text-6xl font-bold mb-6">
          Mom Tracker
        </h1>

        <p className="text-2xl text-center text-gray-300 leading-10">

          Manage Tasks, Employees, Reports and Workflow in one smart place.

        </p>

      </div>

      {/* Right Side */}

      <div className="w-1/2 flex justify-center items-center bg-gray-100">

        <div className="bg-white p-10 rounded-3xl shadow-2xl w-[500px]">

          <h1 className="text-5xl font-bold mb-10 text-center text-gray-800">

            Create Account

          </h1>

          <div className="space-y-6">

            {/* Short Name */}

            <input
              type="text"
              placeholder="Short Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border p-5 rounded-2xl"
            />

            {/* HRMS Full Name */}

            <input
              type="text"
              placeholder="Employee Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full border p-5 rounded-2xl"
            />

            {/* Email */}

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border p-5 rounded-2xl"
            />

            {/* Password */}

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border p-5 rounded-2xl"
            />

            {/* Role */}

            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full border p-5 rounded-2xl"
            >

              <option value="Employee">
                Employee
              </option>

              <option value="Admin">
                Admin
              </option>

            </select>

            {/* Button */}

            <button
              onClick={handleRegister}
              className="w-full bg-blue-700 hover:bg-blue-800 text-white py-5 rounded-2xl text-xl font-semibold"
            >

              Create Account

            </button>

          </div>

        </div>

      </div>

    </div>

  );

}