"use client";

import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");

  const handleLogin = async () => {
    try {
      const response = await fetch(
        "/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data =
        await response.json();

      console.log(
        "Login Response:",
        data
      );

      if (data.success) {

        localStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );

        console.log(
          "Saved User:",
          data.user
        );


        window.location.href =
          "/dashboard";

      } else {
        alert(
          data.message
        );
      }
    } catch (error) {
      console.error(
        "LOGIN ERROR:",
        error
      );

      alert(
        "Login Failed"
      );
    }
  };
const handleSubmit = (e) => {
  e.preventDefault(); // Prevent page refresh
  handleLogin();      // Call your login function
};

return (
  <div className="min-h-screen flex items-center justify-center bg-gray-100">
    <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md">
      <div className="text-center mb-8">
        <img
          src="/logo.jpg"
          alt="i4T"
          className="w-20 mx-auto mb-4"
        />

        <h1 className="text-5xl font-bold text-[#3E7591]">
          MoM
        </h1>

        <h2 className="text-5xl font-bold text-[#3E7591]">
          Tracker
        </h2>

        <p className="text-gray-600 mt-2">
          Login
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-2 font-semibold text-[#3E7591]">
            Email
          </label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border p-3 rounded-lg text-black"
          />
        </div>

        <div className="mb-6">
          <label className="block mb-2 font-semibold text-[#3E7591]">
            Password
          </label>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border p-3 rounded-lg text-black"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-[#3E7591] hover:bg-[#2f617a] text-white p-3 rounded-lg font-semibold"
        >
          Login
        </button>
      </form>
    </div>
  </div>
);
  
}