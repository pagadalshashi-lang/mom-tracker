"use client";

import { useState, useEffect } from "react";

export default function RegisterPage() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedEmployee, setSelectedEmployee] =
    useState(null);

  const [password, setPassword] =
    useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  useEffect(() => {
    fetch("/api/hrms")
      .then((res) => res.json())
      .then((data) => {
        setEmployees(
          Array.isArray(data) ? data : []
        );
      })
      .catch((err) =>
        console.error(err)
      );
  }, []);

  const filteredEmployees =
    employees.filter((emp) =>
      emp.name
        ?.toLowerCase()
        .includes(search.toLowerCase())
    );

  const handleRegister = async () => {
    if (!selectedEmployee) {
      alert("Please select an employee");
      return;
    }

    if (!password || !confirmPassword) {
      alert("Please enter password");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const response = await fetch(
        "/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
       body: JSON.stringify({
  employeeCode: selectedEmployee.id,
  name: selectedEmployee.name,
  email:
    selectedEmployee.email?.trim()
      ? selectedEmployee.email
      : selectedEmployee.personalEmail,
  password,
}),
        }
      );

      const data =
        await response.json();

      if (data.success) {
        alert(
          "Registration Successful"
        );

        window.location.href =
          "/login";
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Registration Failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
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
            Meeting Minutes Management
            System
          </p>
        </div>

        <div className="mb-4">
          <label className="block mb-2 font-semibold text-[#3E7591]">
            Employee Name
          </label>

          <input
            type="text"
            placeholder="Search Employee..."
            className="w-full border border-gray-300 p-3 rounded-lg text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3E7591]"
            value={search}
            onChange={(e) => {
              setSearch(
                e.target.value
              );
              setSelectedEmployee(
                null
              );
            }}
          />

          {search &&
            !selectedEmployee && (
              <div className="border border-gray-300 rounded-lg mt-1 max-h-40 overflow-y-auto bg-white shadow">
                {filteredEmployees.length >
                0 ? (
                  filteredEmployees.map(
                    (emp) => (
                      <div
                        key={emp.id}
                        className="p-3 hover:bg-blue-100 cursor-pointer text-black"
                        onClick={() => {
                          setSelectedEmployee(
                            emp
                          );
                          setSearch(
                            emp.name
                          );
                        }}
                      >
                        {emp.name}
                      </div>
                    )
                  )
                ) : (
                  <div className="p-3 text-gray-500">
                    No Employee Found
                  </div>
                )}
              </div>
            )}
        </div>

        {selectedEmployee && (
          <>
            <div className="mb-4">
              <label className="block mb-2 font-semibold text-[#3E7591]">
                Employee Code
              </label>

              <input
                type="text"
                readOnly
                value={
                  selectedEmployee?.id ||
                  ""
                }
                className="w-full border p-3 rounded-lg bg-gray-100 text-black"
              />
            </div>

            <div className="mb-4">
              <label className="block mb-2 font-semibold text-[#3E7591]">
                Email
              </label>

              <input
                type="text"
                readOnly
                value={
                  selectedEmployee?.email ||
                  selectedEmployee?.personalEmail ||
                  ""
                }
                className="w-full border p-3 rounded-lg bg-gray-100 text-black"
              />
            </div>

            <div className="mb-4">
              <label className="block mb-2 font-semibold text-[#3E7591]">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }
                className="w-full border p-3 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#3E7591]"
              />
            </div>

            <div className="mb-6">
              <label className="block mb-2 font-semibold text-[#3E7591]">
                Confirm Password
              </label>

              <input
                type="password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(
                    e.target.value
                  )
                }
                className="w-full border p-3 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#3E7591]"
              />
            </div>

            <button
              onClick={handleRegister}
              className="w-full bg-[#3E7591] hover:bg-[#2f617a] text-white p-3 rounded-lg font-semibold transition"
            >
              Register
            </button>
          </>
        )}
      </div>
    </div>
  );
}