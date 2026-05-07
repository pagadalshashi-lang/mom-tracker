"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {

  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {

    try {

      const res = await fetch("/api/login", {

        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          email,
          password,
        }),

      });

      const data = await res.json();

      if (res.ok) {

        // SAVE USER SESSION

        localStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );

        alert("Login Successful");

        router.push("/dashboard");

      } else {

        alert(data.message);

      }

    } catch (error) {

      console.log(error);

      alert("Login Failed");

    }

  };

  return (

    <div className="min-h-screen flex">

      {/* LEFT */}

      <div className="w-1/2 bg-blue-900 text-white flex flex-col justify-center items-center p-10">

        {/* Logo */}

        <div className="bg-white p-5 rounded-3xl shadow-2xl mb-8">

          <Image
            src="/logo.jpg"
            alt="Logo"
            width={140}
            height={140}
            className="object-contain"
          />

        </div>

        {/* Heading */}

        <h1 className="text-7xl font-extrabold text-center leading-tight">

          MOM
          <br />
          Tracker

        </h1>

        {/* Subtitle */}

        <p className="text-2xl text-center text-blue-200 leading-10 mt-8">

          Smart Task Management System

        </p>

      </div>

      {/* RIGHT */}

      <div className="w-1/2 flex justify-center items-center bg-gray-100">

        <div className="bg-white p-10 rounded-3xl shadow-2xl w-[500px]">

          <h1 className="text-5xl font-bold mb-10 text-center text-gray-800">
            Login
          </h1>

          <div className="space-y-6">

            <input
              type="email"
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border p-5 rounded-2xl"
            />

            <input
              type="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border p-5 rounded-2xl"
            />

            <button
              onClick={handleLogin}
              className="w-full bg-blue-700 hover:bg-blue-800 text-white py-5 rounded-2xl text-xl font-semibold"
            >

              Login

            </button>

          </div>

        </div>

      </div>

    </div>

  );

}