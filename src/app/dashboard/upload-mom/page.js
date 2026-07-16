"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

export default function UploadMomPage() {
  const [file, setFile] = useState(null);
  const [data, setData] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [invalidRows, setInvalidRows] = useState([]);
  const [saveSummary, setSaveSummary] = useState(null);

  const [activeFprRow, setActiveFprRow] = useState(null);
  const [activeSprRow, setActiveSprRow] = useState(null);

  // NEW: position for the floating dropdown (fixes it being clipped by the
  // scrollable table wrapper) + refs to the inputs so we can measure them
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
  const fprRefs = useRef({});
  const sprRefs = useRef({});

  useEffect(() => {
    fetch("/api/hrms")
      .then((res) => res.json())
      .then((result) => {
        console.log("HRMS DATA", result);
        setEmployees(result || []);
      })
      .catch(console.error);
  }, []);

  const openFprDropdown = (index) => {
    const el = fprRefs.current[index];
    if (el) {
      const rect = el.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
    setActiveFprRow(index);
    setActiveSprRow(null);
  };

  const openSprDropdown = (index) => {
    const el = sprRefs.current[index];
    if (el) {
      const rect = el.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
    setActiveSprRow(index);
    setActiveFprRow(null);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select Excel file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      for (const row of data) {
        if (!row.Account) {
          alert("Account Required");
          return;
        }

        if (!row["Main Point"]) {
          alert("Main Point Required");
          return;
        }

        if (!row["Sub Point"]) {
          alert("Sub Point Required");
          return;
        }

        if (!row.FPR) {
          alert("FPR Required");
          return;
        }

        if (!row.SPR) {
          alert("SPR Required");
          return;
        }

        if (!row["Plan Start Date"]) {
          alert("Plan Start Date Required");
          return;
        }

        if (!row["Plan End Date"]) {
          alert("Plan End Date Required");
          return;
        }

        if (row.Status === "Closed") {
          if (!row["Actual Start Date"]) {
            alert("Actual Start Date Required");
            return;
          }

          if (!row["Actual End Date"]) {
            alert("Actual End Date Required");
            return;
          }

          if (!(row.Remarks || row.Remark)) {
            alert("Remarks Required");
            return;
          }
        }
      }
      const response = await fetch("/api/mom/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      console.log("UPLOAD RESPONSE:", result);
      if (!response.ok) {
        alert(result.message || "Upload failed");

        if (result.errors) {
          console.log(result.errors);
        }

        return;
      }

      if (result.success) {
        const mappedData = result.data.map((row) => {
          const fprMatch = employees.find((emp) =>
            (emp.name || "")
              .toLowerCase()
              .includes((row.FPR || "").toLowerCase())
          );

          const sprMatch = employees.find((emp) =>
            (emp.name || "")
              .toLowerCase()
              .includes((row.SPR || "").toLowerCase())
          );

          return {
            ...row,

            FPR: fprMatch?.name || row.FPR,
            FPR_EMAIL: fprMatch?.email || "",
            FPR_PERSONAL_EMAIL: fprMatch?.personalEmail || "",

            SPR: sprMatch?.name || row.SPR,
            SPR_EMAIL: sprMatch?.email || "",
            SPR_PERSONAL_EMAIL: sprMatch?.personalEmail || "",
          };
        });

        setData(mappedData);
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("Upload Error:", error);
      alert(error.message || "Upload Failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (saving) return;

    setSaving(true);

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      console.log("SAVE DATA");
      console.log(data);

      const response = await fetch("/api/mom/save", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          rows: data,

          createdBy: user?.name || "",

          createdByEmail: user?.email || "",
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSaveSummary({
          uploaded: result.savedCount,

          failed: result.invalidCount,
        });

        setInvalidRows(result.invalidRows || []);
        const failedRows = result.invalidRows || [];

        if (result.invalidCount > 0) {
          setData((prevData) =>
            prevData.filter((_, index) =>
              failedRows.some((f) => f.index === index)
            )
          );

          alert(
            `${result.savedCount} Rows Uploaded\n${result.invalidCount} Rows Failed`
          );
        } else {
          alert(`${result.savedCount} Rows Uploaded Successfully`);

          setData([]);

          setTimeout(() => {
            window.location.href = "/dashboard/mom-list";
          }, 1500);
        }
      } else {
        alert(result.message || "Save Failed");
      }
    } catch (error) {
      console.error(error);

      alert(error.message || "Save Failed");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full min-w-[150px] border border-gray-300 rounded-md px-2 py-1.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#3E7591] focus:border-[#3E7591]";

  const thClass =
    "border border-[#2f617a] px-3 py-3 text-sm font-semibold text-white bg-[#3E7591] whitespace-nowrap text-left";

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">
      <div className="w-full bg-white rounded-2xl shadow-lg p-4 md:p-6">
        <h1 className="text-2xl md:text-3xl font-bold text-center mb-6 text-[#3E7591]">
          Upload MoM Excel
        </h1>

        <button
  onClick={() => {
    const link = document.createElement("a");
    link.href = "/Sample MOM.xlsx";
    link.download = "Sample MOM.xlsx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }}
  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
>
  Download Sample Excel
</button>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => setFile(e.target.files[0])}
            className="border border-gray-300 rounded-lg p-2.5 w-full text-sm text-gray-800"
          />

          <button
            onClick={handleUpload}
            disabled={loading}
            className="bg-[#3E7591] hover:bg-[#2f617a] disabled:bg-gray-400 text-white px-6 py-2.5 rounded-lg font-medium whitespace-nowrap transition-colors"
          >
            {loading ? "Uploading..." : "Upload"}
          </button>
        </div>

        {data.length > 0 && (
          <>
            <h2 className="text-xl font-semibold mb-3 text-gray-900">
              Excel Preview
            </h2>

            {/* Scroll wrapper: horizontal scroll only. Dropdown suggestions are
                rendered through a portal (see below) so they are never clipped. */}
            <div className="border border-gray-300 rounded-xl overflow-x-auto">
              <table className="w-full min-w-[1600px] border-collapse text-sm">
                <thead className="sticky top-0 z-10">
                  <tr>
                    <th className={`${thClass} w-12 text-center`}>#</th>
                    <th className={`${thClass} min-w-[140px]`}>Account</th>
                    <th className={`${thClass} min-w-[220px]`}>Main Point</th>
                    <th className={`${thClass} min-w-[220px]`}>Sub Point</th>
                    <th className={`${thClass} min-w-[180px]`}>FPR</th>
                    <th className={`${thClass} min-w-[180px]`}>SPR</th>
                    <th className={`${thClass} min-w-[130px]`}>Status</th>
                    <th className={`${thClass} min-w-[150px]`}>Plan Start</th>
                    <th className={`${thClass} min-w-[150px]`}>Actual Start</th>
                    <th className={`${thClass} min-w-[150px]`}>Plan End</th>
                    <th className={`${thClass} min-w-[150px]`}>Actual End</th>
                    <th className={`${thClass} min-w-[220px]`}>Remark</th>
                  </tr>
                </thead>

                <tbody>
                  {data.map((row, index) => (
                    <tr
                      key={index}
                      className="hover:bg-gray-50 even:bg-gray-50/50"
                    >
                      <td className="border border-gray-200 p-2 text-center text-gray-700">
                        {index + 1}
                      </td>

                      <td className="border border-gray-200 p-2">
                        <input
                          type="text"
                          value={row.Account || ""}
                          onChange={(e) => {
                            const temp = [...data];
                            temp[index].Account = e.target.value;
                            setData(temp);
                          }}
                          className={inputClass}
                        />
                      </td>

                      <td className="border border-gray-200 p-2">
                        <input
                          type="text"
                          value={row["Main Point"] || ""}
                          onChange={(e) => {
                            const temp = [...data];
                            temp[index]["Main Point"] = e.target.value;
                            setData(temp);
                          }}
                          className={inputClass}
                        />
                      </td>

                      <td className="border border-gray-200 p-2">
                        <input
                          type="text"
                          value={row["Sub Point"] || ""}
                          onChange={(e) => {
                            const temp = [...data];
                            temp[index]["Sub Point"] = e.target.value;
                            setData(temp);
                          }}
                          className={inputClass}
                        />
                      </td>

                      {/* FPR */}
                      <td className="border border-gray-200 p-2">
                        <input
                          ref={(el) => (fprRefs.current[index] = el)}
                          type="text"
                          value={row.FPR || ""}
                          onFocus={() => openFprDropdown(index)}
                          onBlur={() =>
                            setTimeout(() => setActiveFprRow(null), 200)
                          }
                          onChange={(e) => {
                            const temp = [...data];
                            temp[index].FPR = e.target.value;

                            const emp = employees.find(
                              (emp) =>
                                (emp.name || "").toLowerCase() ===
                                e.target.value.toLowerCase()
                            );

                            if (emp) {
                              temp[index].FPR = emp.name;
                              temp[index].FPR_EMAIL =
                                emp.email || emp.officeEmail || "";
                              temp[index].FPR_PERSONAL_EMAIL =
                                emp.personalEmail || "";
                            }

                            setData(temp);
                            openFprDropdown(index);
                          }}
                          className={inputClass}
                        />

                        {activeFprRow === index &&
                          typeof window !== "undefined" &&
                          createPortal(
                            <div
                              style={{
                                position: "absolute",
                                top: dropdownPos.top,
                                left: dropdownPos.left,
                                width: Math.max(dropdownPos.width, 220),
                              }}
                              className="bg-white border border-gray-300 shadow-xl max-h-56 overflow-auto rounded-md z-[9999]"
                            >
                              {employees
                                .filter((emp) =>
                                  (emp.name || "")
                                    .toLowerCase()
                                    .includes((row.FPR || "").toLowerCase())
                                )
                                .slice(0, 10)
                                .map((emp) => (
                                  <div
                                    key={emp.id}
                                    className="p-2 text-sm text-gray-900 hover:bg-blue-100 cursor-pointer"
                                    onMouseDown={() => {
                                      const temp = [...data];

                                      temp[index].FPR = emp.name;
                                      temp[index].FPR_EMAIL =
                                        emp.email || emp.officeEmail || "";
                                      temp[index].FPR_PERSONAL_EMAIL =
                                        emp.personalEmail || "";

                                      setData(temp);
                                      setActiveFprRow(null);
                                    }}
                                  >
                                    {emp.name}
                                  </div>
                                ))}
                            </div>,
                            document.body
                          )}
                      </td>

                      {/* SPR */}
                      <td className="border border-gray-200 p-2">
                        <input
                          ref={(el) => (sprRefs.current[index] = el)}
                          type="text"
                          value={row.SPR || ""}
                          onFocus={() => openSprDropdown(index)}
                          onBlur={() =>
                            setTimeout(() => setActiveSprRow(null), 200)
                          }
                          onChange={(e) => {
                            const temp = [...data];
                            temp[index].SPR = e.target.value;

                            const emp = employees.find(
                              (emp) =>
                                (emp.name || "").toLowerCase() ===
                                e.target.value.toLowerCase()
                            );

                            if (emp) {
                              temp[index].SPR = emp.name;
                              temp[index].SPR_EMAIL =
                                emp.email || emp.officeEmail || "";
                              temp[index].SPR_PERSONAL_EMAIL =
                                emp.personalEmail || "";
                            }

                            setData(temp);
                            openSprDropdown(index);
                          }}
                          className={inputClass}
                        />

                        {activeSprRow === index &&
                          typeof window !== "undefined" &&
                          createPortal(
                            <div
                              style={{
                                position: "absolute",
                                top: dropdownPos.top,
                                left: dropdownPos.left,
                                width: Math.max(dropdownPos.width, 220),
                              }}
                              className="bg-white border border-gray-300 shadow-xl max-h-56 overflow-auto rounded-md z-[9999]"
                            >
                              {employees
                                .filter((emp) =>
                                  (emp.name || "")
                                    .toLowerCase()
                                    .includes((row.SPR || "").toLowerCase())
                                )
                                .slice(0, 10)
                                .map((emp) => (
                                  <div
                                    key={emp.id}
                                    className="p-2 text-sm text-gray-900 hover:bg-blue-100 cursor-pointer"
                                    onMouseDown={() => {
                                      const temp = [...data];

                                      temp[index].SPR = emp.name;
                                      temp[index].SPR_EMAIL =
                                        emp.email || emp.officeEmail || "";
                                      temp[index].SPR_PERSONAL_EMAIL =
                                        emp.personalEmail || "";

                                      setData(temp);
                                      setActiveSprRow(null);
                                    }}
                                  >
                                    {emp.name}
                                  </div>
                                ))}
                            </div>,
                            document.body
                          )}
                      </td>

                      <td className="border border-gray-200 p-2">
                        <select
                          value={row.Status || "Open"}
                          onChange={(e) => {
                            const temp = [...data];
                            temp[index].Status = e.target.value;

                            if (e.target.value !== "Closed") {
                              temp[index]["Actual Start Date"] = "";
                              temp[index]["Actual End Date"] = "";
                              temp[index].Remarks = "";
                              temp[index].Remark = "";
                            }
                            setData(temp);
                          }}
                          className={`${inputClass} min-w-[130px]`}
                        >
                          <option value="Open">Open</option>
                          <option value="In Process">In Process</option>
                          <option value="Pending">Pending</option>
                          <option value="Closed">Closed</option>
                        </select>
                      </td>

                      <td className="border border-gray-200 p-2">
                        <input
                          type="date"
                          value={row["Plan Start Date"] || ""}
                          onChange={(e) => {
                            const temp = [...data];
                            temp[index]["Plan Start Date"] = e.target.value;
                            setData(temp);
                          }}
                          className={inputClass}
                        />
                      </td>

                      <td className="border border-gray-200 p-2">
                        <input
                          type="date"
                          value={row["Actual Start Date"] || ""}
                          onChange={(e) => {
                            const temp = [...data];
                            temp[index]["Actual Start Date"] = e.target.value;
                            setData(temp);
                          }}
                          className={inputClass}
                        />
                      </td>

                      <td className="border border-gray-200 p-2">
                        <input
                          type="date"
                          value={row["Plan End Date"] || ""}
                          onChange={(e) => {
                            const temp = [...data];
                            temp[index]["Plan End Date"] = e.target.value;
                            setData(temp);
                          }}
                          className={inputClass}
                        />
                      </td>

                      <td className="border border-gray-200 p-2">
                        <input
                          type="date"
                          value={row["Actual End Date"] || ""}
                          onChange={(e) => {
                            const temp = [...data];
                            temp[index]["Actual End Date"] = e.target.value;
                            setData(temp);
                          }}
                          className={inputClass}
                        />
                      </td>

                      <td className="border border-gray-200 p-2">
                        <input
                          type="text"
                          value={row.Remarks || row.Remark || ""}
                          onChange={(e) => {
                            const temp = [...data];
                            temp[index].Remarks = e.target.value;
                            temp[index].Remark = e.target.value; // optional for backward compatibility
                            setData(temp);
                          }}
                          className={inputClass}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {saveSummary && (
              <div className="mt-6 mb-2">
                <div className="bg-green-50 border border-green-300 rounded-xl p-4">
                  <h3 className="font-bold text-green-700 mb-1">
                    Upload Summary
                  </h3>

                  <p className="text-green-700 text-sm">
                    Uploaded Successfully: {saveSummary.uploaded}
                  </p>

                  <p className="text-red-700 text-sm">
                    Failed Validation: {saveSummary.failed}
                  </p>
                </div>
              </div>
            )}

            {invalidRows.length > 0 && (
              <div className="bg-red-50 border border-red-300 rounded-xl p-5 mt-4">
                <h2 className="text-lg font-bold text-red-700 mb-4">
                  Rows Not Uploaded
                </h2>

                {invalidRows.map((row, index) => (
                  <div key={index} className="border-b border-red-200 py-3">
                    <p className="font-semibold text-gray-900 text-sm">
                      Row: {row.rowNumber}
                    </p>
                    <p className="text-gray-800 text-sm">
                      Main Point: {row.mainPoint}
                    </p>
                    <p className="text-gray-800 text-sm">
                      Sub Point: {row.subPoint}
                    </p>
                    <p className="text-gray-800 text-sm">FPR: {row.fpr}</p>
                    <p className="text-gray-800 text-sm">SPR: {row.spr}</p>
                    <p className="text-gray-800 text-sm">
                      Account: {row.account}
                    </p>
                    <ul className="list-disc pl-6 text-red-700 text-sm font-medium mt-1">
                      {row.errors?.map((error, i) => (
                        <li key={i}>{error}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6">
              <button
                onClick={handleSave}
                disabled={saving || data.length === 0}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}