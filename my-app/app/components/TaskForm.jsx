"use client";

import { useEffect, useState } from "react";

export default function TaskForm() {

  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);

  const [searchEmployee, setSearchEmployee] = useState("");
  const [accountName, setAccountName] = useState("");
  const [pointer, setPointer] = useState("");
  const [subPointer, setSubPointer] = useState("");
  const [plannedStartDate, setPlannedStartDate] = useState("");
  const [plannedEndDate, setPlannedEndDate] = useState("");
  const [status, setStatus] = useState("Assigned");

  const [showDropdown, setShowDropdown] = useState(false);

  // Fetch Employees

  useEffect(() => {

    const fetchEmployees = async () => {

      try {

        const res = await fetch("/api/employees");

        const data = await res.json();

        if (Array.isArray(data)) {

          setEmployees(data);

        }

      } catch (error) {

        console.log(error);

      }

    };

    fetchEmployees();

  }, []);

  // Search Employee

  useEffect(() => {

    if (searchEmployee.trim() === "") {

      setFilteredEmployees([]);

      return;

    }

    const filtered = employees.filter((emp) =>

      emp.name
        ?.toLowerCase()
        .includes(searchEmployee.toLowerCase())

    );

    setFilteredEmployees(filtered);

  }, [searchEmployee, employees]);

  // Select Employee

  const handleSelectEmployee = (emp) => {

    setSearchEmployee(emp.name);

    setAccountName(emp.account || "");

    setShowDropdown(false);

  };

  // CREATE TASK

  const handleCreateTask = async () => {

    try {

      const loggedUser = JSON.parse(
        localStorage.getItem("user")
      );

      const res = await fetch("/api/tasks", {

        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({

          pointer,

          subPointer,

          assignedTo: searchEmployee,

          accountName,

          status,

          plannedStartDate,

          plannedEndDate,

          actualStartDate: "",

          actualEndDate: "",

          createdBy: loggedUser?.name,

        }),

      });

      const data = await res.json();

      if (data.success) {

        alert("Task Created Successfully");

        // Clear Form

        setPointer("");
        setSubPointer("");
        setSearchEmployee("");
        setAccountName("");
        setPlannedStartDate("");
        setPlannedEndDate("");

      } else {

        alert("Task Creation Failed");

      }

    } catch (error) {

      console.log(error);

      alert("Error Creating Task");

    }

  };

  return (

    <div className="bg-white p-8 rounded-2xl shadow-lg">

      <h1 className="text-4xl font-bold mb-10 text-gray-800">
        Create Task
      </h1>

      <div className="grid grid-cols-2 gap-8">

        {/* Pointer */}

        <input
          type="text"
          placeholder="Pointer"
          value={pointer}
          onChange={(e) => setPointer(e.target.value)}
          className="border border-gray-300 p-5 rounded-2xl"
        />

        {/* Sub Pointer */}

        <input
          type="text"
          placeholder="Sub Pointer"
          value={subPointer}
          onChange={(e) => setSubPointer(e.target.value)}
          className="border border-gray-300 p-5 rounded-2xl"
        />

        {/* Employee */}

        <div className="relative">

          <input
            type="text"
            placeholder="Assign Employee"
            value={searchEmployee}
            onChange={(e) => {

              setSearchEmployee(e.target.value);

              setShowDropdown(true);

            }}
            className="border border-gray-300 p-5 rounded-2xl w-full"
          />

          {/* Dropdown */}

          {
            showDropdown &&
            filteredEmployees.length > 0 && (

              <div className="absolute w-full bg-white border rounded-2xl shadow-lg mt-2 z-50 max-h-[250px] overflow-y-auto">

                {
                  filteredEmployees.slice(0, 10).map((emp, index) => (

                    <div
                      key={index}
                      className="p-4 hover:bg-blue-100 cursor-pointer border-b"
                      onClick={() => handleSelectEmployee(emp)}
                    >

                      <div className="font-semibold text-lg">
                        {emp.name}
                      </div>

                      <div className="text-sm text-gray-500">
                        {emp.account}
                      </div>

                    </div>

                  ))
                }

              </div>

            )
          }

        </div>

        {/* Account */}

        <input
          type="text"
          placeholder="Account Name"
          value={accountName}
          readOnly
          className="border border-gray-300 p-5 rounded-2xl bg-gray-100"
        />

        {/* Planned Start */}

        <div>

          <label className="block mb-2 font-semibold text-gray-700">
            Planned Start Date
          </label>

          <input
            type="date"
            value={plannedStartDate}
            onChange={(e) =>
              setPlannedStartDate(e.target.value)
            }
            className="border border-gray-300 p-5 rounded-2xl w-full"
          />

        </div>

        {/* Planned End */}

        <div>

          <label className="block mb-2 font-semibold text-gray-700">
            Planned End Date
          </label>

          <input
            type="date"
            value={plannedEndDate}
            onChange={(e) =>
              setPlannedEndDate(e.target.value)
            }
            className="border border-gray-300 p-5 rounded-2xl w-full"
          />

        </div>

      </div>

      {/* Button */}

      <button
        onClick={handleCreateTask}
        className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-2xl mt-10 text-lg font-semibold"
      >

        Create Task

      </button>

    </div>

  );

}