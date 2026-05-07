"use client";

import { useEffect, useState } from "react";

export default function TaskForm() {

  const [employees, setEmployees] = useState([]);

  const [accounts, setAccounts] = useState([]);

  const [filteredAccounts, setFilteredAccounts] = useState([]);

  const [filteredFPR, setFilteredFPR] = useState([]);

  const [filteredSPR, setFilteredSPR] = useState([]);

  const [account, setAccount] = useState("");

  const [mainPoint, setMainPoint] = useState("");

  const [subPoint, setSubPoint] = useState("");

  const [fpr, setFpr] = useState("");

  const [spr, setSpr] = useState("");

  const [plannedStartDate, setPlannedStartDate] = useState("");

  const [plannedEndDate, setPlannedEndDate] = useState("");

  const [status, setStatus] = useState("Pending");

  const [remark, setRemark] = useState("");

  const [showAccountDropdown, setShowAccountDropdown] = useState(false);

  const [showFprDropdown, setShowFprDropdown] = useState(false);

  const [showSprDropdown, setShowSprDropdown] = useState(false);

  // FETCH EMPLOYEES

  useEffect(() => {

    const fetchEmployees = async () => {

      try {

        const res = await fetch("/api/employees");

        const data = await res.json();

        if (Array.isArray(data)) {

          setEmployees(data);

          // ACCOUNT LIST FROM API

          const uniqueAccounts = [

            ...new Set(

              data.map((emp) => emp.account)

            ),

          ];

          setAccounts(uniqueAccounts);

        }

      } catch (error) {

        console.log(error);

      }

    };

    fetchEmployees();

  }, []);

  // ACCOUNT FILTER

  useEffect(() => {

    if (account.trim() === "") {

      setFilteredAccounts([]);

      return;

    }

    const filtered = accounts.filter((acc) =>

      acc?.toLowerCase()
        .includes(account.toLowerCase())

    );

    setFilteredAccounts(filtered);

  }, [account, accounts]);

  // FPR FILTER

  useEffect(() => {

    if (fpr.trim() === "") {

      setFilteredFPR([]);

      return;

    }

    const filtered = employees.filter((emp) =>

      emp.name
        ?.toLowerCase()
        .includes(fpr.toLowerCase())

    );

    setFilteredFPR(filtered);

  }, [fpr, employees]);

  // SPR FILTER

  useEffect(() => {

    if (spr.trim() === "") {

      setFilteredSPR([]);

      return;

    }

    const filtered = employees.filter((emp) =>

      emp.name
        ?.toLowerCase()
        .includes(spr.toLowerCase())

    );

    setFilteredSPR(filtered);

  }, [spr, employees]);

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

          account,

          mainPoint,

          subPoint,

          fpr,

          spr,

          plannedStartDate,

          plannedEndDate,

          actualStartDate: "",

          actualEndDate: "",

          status,

          remark,

          createdBy: loggedUser?.fullName,

        }),

      });

      const data = await res.json();

      if (data.success || data._id) {

        alert("Task Created Successfully");

        setAccount("");

        setMainPoint("");

        setSubPoint("");

        setFpr("");

        setSpr("");

        setPlannedStartDate("");

        setPlannedEndDate("");

        setRemark("");

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

      {/* TOP */}

      <div className="flex justify-between items-center mb-10">

        <h1 className="text-4xl font-bold text-gray-800">

          Add Task

        </h1>

        {/* IMPORT EXCEL */}

        <label className="bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-2xl cursor-pointer font-semibold shadow-lg transition">

          Import Excel

          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
          />

        </label>

      </div>

      <div className="grid grid-cols-2 gap-8">

        {/* ACCOUNT */}

        <div className="relative">

          <input
            type="text"
            placeholder="Project / Client Name"
            value={account}
            onChange={(e) => {

              setAccount(e.target.value);

              setShowAccountDropdown(true);

            }}
            className="border border-gray-300 p-5 rounded-2xl w-full"
            required
          />

          {

            showAccountDropdown &&
            filteredAccounts.length > 0 && (

              <div className="absolute w-full bg-white border rounded-2xl shadow-lg mt-2 z-50 max-h-[250px] overflow-y-auto">

                {

                  filteredAccounts
                    .slice(0, 10)
                    .map((acc, index) => (

                      <div
                        key={index}
                        className="p-4 hover:bg-blue-100 cursor-pointer border-b"
                        onClick={() => {

                          setAccount(acc);

                          setShowAccountDropdown(false);

                        }}
                      >

                        {acc}

                      </div>

                    ))

                }

              </div>

            )

          }

        </div>

        {/* MAIN POINT */}

        <input
          type="text"
          placeholder="Main Point"
          value={mainPoint}
          onChange={(e) => setMainPoint(e.target.value)}
          className="border border-gray-300 p-5 rounded-2xl"
          required
        />

        {/* SUB POINT */}

        <input
          type="text"
          placeholder="Sub Point"
          value={subPoint}
          onChange={(e) => setSubPoint(e.target.value)}
          className="border border-gray-300 p-5 rounded-2xl"
          required
        />

        {/* FPR */}

        <div className="relative">

          <input
            type="text"
            placeholder="FPR"
            value={fpr}
            onChange={(e) => {

              setFpr(e.target.value);

              setShowFprDropdown(true);

            }}
            className="border border-gray-300 p-5 rounded-2xl w-full"
            required
          />

          {

            showFprDropdown &&
            filteredFPR.length > 0 && (

              <div className="absolute w-full bg-white border rounded-2xl shadow-lg mt-2 z-50 max-h-[250px] overflow-y-auto">

                {

                  filteredFPR.slice(0, 10).map((emp, index) => (

                    <div
                      key={index}
                      className="p-4 hover:bg-blue-100 cursor-pointer border-b"
                      onClick={() => {

                        setFpr(emp.name);

                        setShowFprDropdown(false);

                      }}
                    >

                      {emp.name}

                    </div>

                  ))

                }

              </div>

            )

          }

        </div>

        {/* SPR */}

        <div className="relative">

          <input
            type="text"
            placeholder="SPR"
            value={spr}
            onChange={(e) => {

              setSpr(e.target.value);

              setShowSprDropdown(true);

            }}
            className="border border-gray-300 p-5 rounded-2xl w-full"
            required
          />

          {

            showSprDropdown &&
            filteredSPR.length > 0 && (

              <div className="absolute w-full bg-white border rounded-2xl shadow-lg mt-2 z-50 max-h-[250px] overflow-y-auto">

                {

                  filteredSPR.slice(0, 10).map((emp, index) => (

                    <div
                      key={index}
                      className="p-4 hover:bg-blue-100 cursor-pointer border-b"
                      onClick={() => {

                        setSpr(emp.name);

                        setShowSprDropdown(false);

                      }}
                    >

                      {emp.name}

                    </div>

                  ))

                }

              </div>

            )

          }

        </div>

        {/* START DATE */}

        <input
          type="date"
          value={plannedStartDate}
          onChange={(e) =>
            setPlannedStartDate(e.target.value)
          }
          className="border border-gray-300 p-5 rounded-2xl"
          required
        />

        {/* END DATE */}

        <input
          type="date"
          value={plannedEndDate}
          onChange={(e) =>
            setPlannedEndDate(e.target.value)
          }
          className="border border-gray-300 p-5 rounded-2xl"
          required
        />

        {/* STATUS */}

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border border-gray-300 p-5 rounded-2xl"
        >

          <option>Pending</option>
          <option>In Progress</option>
          <option>Closed</option>

        </select>

        {/* REMARK */}

        <textarea
          placeholder="Remark"
          value={remark}
          onChange={(e) => setRemark(e.target.value)}
          className="border border-gray-300 p-5 rounded-2xl"
        />

      </div>

      {/* BUTTON */}

      <button
        onClick={handleCreateTask}
        className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-2xl mt-10 text-lg font-semibold"
      >

        Create Task

      </button>

    </div>

  );

}