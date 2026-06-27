"use client";

import { useState, useEffect } from "react";

export default function UploadMomPage() {
  const [file, setFile] = useState(null);
  const [data, setData] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [invalidRows, setInvalidRows] =
  useState([]);

  const [saveSummary, setSaveSummary] =
  useState(null);

  const [activeFprRow, setActiveFprRow] = useState(null);
  const [activeSprRow, setActiveSprRow] = useState(null);

  useEffect(() => {
  fetch("/api/hrms")
    .then((res) => res.json())
    .then((result) => {

      console.log(
        "HRMS DATA",
        result
      );

      setEmployees(result || []);

    })
    .catch(console.error);
}, []);
const handleUpload = async () => {
  if (!file) {
    alert("Please select Excel file");
    return;
  }

  const formData = new FormData();
  formData.append("file", file);

  try {
    setLoading(true);

    const response = await fetch(
      "/api/mom/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    const result = await response.json();

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
          FPR_PERSONAL_EMAIL:
            fprMatch?.personalEmail || "",

          SPR: sprMatch?.name || row.SPR,
          SPR_EMAIL: sprMatch?.email || "",
          SPR_PERSONAL_EMAIL:
            sprMatch?.personalEmail || "",
        };
      });

      setData(mappedData);
    } else {
      alert(result.message);
    }
  } catch (error) {
    console.error(error);
    alert("Upload Failed");
  } finally {
    setLoading(false);
  }
};
  const handleSave = async () => {
if (saving) return;

setSaving(true);

  try {

    const user = JSON.parse(
      localStorage.getItem("user")
    );
    console.log("SAVE DATA");
console.log(data);

    const response = await fetch(
      "/api/mom/save",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          rows: data,

          createdBy:
            user?.name || "",

          createdByEmail:
            user?.email || "",
        }),
      }
    );
  
    const result =
      await response.json();

    if (result.success) {

      setSaveSummary({
        uploaded:
          result.savedCount,

        failed:
          result.invalidCount,
      });

      setInvalidRows(
  result.invalidRows || []
);
const failedRows =
  result.invalidRows || [];

if (result.invalidCount > 0) {

  setData((prevData) =>
    prevData.filter((_, index) =>
      failedRows.some(
        (f) => f.index === index
      )
    )
  );

  alert(
    `${result.savedCount} Rows Uploaded\n${result.invalidCount} Rows Failed`
  );

} else {

  alert(
    `${result.savedCount} Rows Uploaded Successfully`
  );

  setData([]);

  setTimeout(() => {
    window.location.href =
      "/dashboard/mom-list";
  }, 1500);
}

    } else {

      alert(result.message || "Save Failed");

    }

  } catch (error) {

    console.error(error);

    alert(
      error.message || "Save Failed"
    );

  } finally {

    setSaving(false);

  }

};


  return (
    <div className="min-h-screen bg-gray-100 p-2">
      <div className="w-full bg-white rounded-2xl shadow-lg p-4">

        <h1 className="text-4xl font-bold text-center mb-8 text-[#3E7591]">
          Upload MoM Excel
        </h1>

        <div className="flex gap-4 mb-8">
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) =>
              setFile(e.target.files[0])
            }
            className="border border-gray-300 rounded-lg p-3 w-full text-black"
          />

          <button
            onClick={handleUpload}
            disabled={loading}
            className="bg-[#3E7591] hover:bg-[#2f617a] text-white px-8 rounded-lg"
          >
            {loading
              ? "Uploading..."
              : "Upload"}
          </button>
        </div>

        {data.length > 0 && (
          <>
<h2 className="text-2xl font-semibold mb-4 text-black">
  Excel Preview
</h2>

<div className="border rounded-xl overflow-hidden bg-white">

  <div className="max-h-162.5 overflow-auto">

    <table className="w-full min-w-[1800px] border-collapse text-sm text-black">

      <thead className="sticky top-0 bg-gray-200 z-20">

        <tr>

          <th className="border p-2 text-black font-semibold bg-gray-200">#</th>

          <th className="border p-2 min-w-62.5">
            Main Point
          </th>

          <th className="border p-2 min-w-62.5">
            Sub Point
          </th>

          <th className="border p-2 min-w-45">
            FPR
          </th>

          <th className="border p-2 min-w-45">
            SPR
          </th>

          <th className="border p-2 text-black font-semibold bg-gray-200">
            Status
          </th>
         
         <th className="border p-2">Plan Start</th>
<th className="border p-2">Actual Start</th>
<th className="border p-2">Plan End</th>
<th className="border p-2">Actual End</th>
         
         

          <th className="border p-2 min-w-62.5">
            Remark
          </th>

        </tr>

      </thead>

      <tbody>

        {data.map((row, index) => (

          <tr
            key={index}
            className="hover:bg-gray-50"
          >

            <td className="border p-2 text-center">
              {index + 1}
            </td>

            <td className="border p-2 text-black align-top">
              {row["Main Point"]}
            </td>

            <td className="border p-2 text-black align-top">
              {row["Sub Point"]}
            </td>

            {/* FPR */}

            <td className="border p-2 text-black align-top">

              <div className="relative">

                <input
                  type="text"
                  value={row.FPR || ""}
                  onFocus={() =>
                    setActiveFprRow(index)
                  }
                  onChange={(e) => {

                    const temp = [...data];

                    temp[index].FPR =
                      e.target.value;

                    setData(temp);

                  }}
                  className="w-full border rounded px-2 py-1 text-black"
                />

                {activeFprRow === index && (

                  <div className="absolute bg-white border shadow-lg w-full max-h-40 overflow-auto z-50">

                    {employees
                      .filter((emp) =>
                        (emp.name || "")
                          .toLowerCase()
                          .includes(
                            (row.FPR || "")
                              .toLowerCase()
                          )
                      )
                      .slice(0, 10)
                      .map((emp) => (

                        <div
                          key={emp.id}
                          className="p-2 hover:bg-blue-100 cursor-pointer"
                          onClick={() => {

                            const temp = [
                              ...data,
                            ];

                            temp[index].FPR =
                              emp.name;

                           temp[index].FPR_EMAIL =
  emp.email ||
  emp.officeEmail ||
  "";

temp[index]
  .FPR_PERSONAL_EMAIL =
  emp.personalEmail ||
  "";

                            setData(temp);

                            setActiveFprRow(
                              null
                            );

                          }}
                        >
                          {emp.name}
                        </div>

                      ))}

                  </div>

                )}

              </div>

            </td>

            {/* SPR */}

            <td className="border p-2 text-black align-top">

              <div className="relative">

                <input
                  type="text"
                  value={row.SPR || ""}
                  onFocus={() =>
                    setActiveSprRow(index)
                  }
                  onChange={(e) => {

                    const temp = [...data];

                    temp[index].SPR =
                      e.target.value;

                    setData(temp);

                  }}
                  className="w-full border rounded px-2 py-1 text-black"
                />

                {activeSprRow === index && (

                  <div className="absolute bg-white border shadow-lg w-full max-h-40 overflow-auto z-50">

                    {employees
                      .filter((emp) =>
                        (emp.name || "")
                          .toLowerCase()
                          .includes(
                            (row.SPR || "")
                              .toLowerCase()
                          )
                      )
                      .slice(0, 10)
                      .map((emp) => (

                        <div
                          key={emp.id}
                          className="p-2 hover:bg-blue-100 cursor-pointer"
                          onClick={() => {

                            const temp = [
                              ...data,
                            ];

                            temp[index].SPR =
                              emp.name;

                           temp[index].SPR_EMAIL =
  emp.email ||
  emp.officeEmail ||
  "";

temp[index]
  .SPR_PERSONAL_EMAIL =
  emp.personalEmail ||
  "";

                            setData(temp);

                            setActiveSprRow(
                              null
                            );

                          }}
                        >
                          {emp.name}
                        </div>

                      ))}

                  </div>

                )}

              </div>

            </td>

            <td className="border p-2 text-black align-top">

              <select
                value={
                  row.Status || "Open"
                }
                onChange={(e) => {

                  const temp = [...data];

                  temp[index].Status =
                    e.target.value;

                  setData(temp);

                }}
           className="border rounded px-2 py-1 text-black bg-white min-w-35"
              >
                <option value="Open">
                  Open
                </option>

                <option value="In Process">
                  In Process
                </option>

                <option value="Pending">
                  Pending
                </option>

                <option value="Closed">
                  Closed
                </option>

              </select>

            </td>
<td className="border p-2">
  {row["Plan Start Date"]}
</td>

<td className="border p-2">
  {row["Actual Start Date"]}
</td>

<td className="border p-2 text-black align-top">

              {row["Plan End Date"]}

            </td>

<td className="border p-2">
  {row["Actual End Date"]}
</td>

              <td className="border p-2 text-black align-top">

              <input
                type="text"
                value={row.Remark || ""}
                onChange={(e) => {

                  const temp = [...data];

                  temp[index].Remark =
                    e.target.value;

                  setData(temp);

                }}
                className="w-full border rounded px-2 py-1 text-black bg-white"
              />

            </td>

          </tr>

        ))}

      </tbody>

    </table>

  </div>

</div>

{saveSummary && (

<div className="mb-6">

<div className="bg-green-50 border border-green-300 rounded-xl p-4 mb-4">

<h3 className="font-bold text-green-700">
Upload Summary
</h3>

<p className="text-green-700">
Uploaded :
{saveSummary.uploaded}
</p>

<p className="text-red-700">
Failed :
{saveSummary.failed}
</p>

</div>

</div>

)}

{invalidRows.length > 0 && (

<div className="bg-red-50 border border-red-300 rounded-xl p-5 mb-6">

<h2 className="text-xl font-bold text-red-700 mb-4">
Rows Not Uploaded
</h2>

{invalidRows.map(
(row, index) => (

<div
key={index}
className="border-b py-3"
>

<p className="font-semibold text-black">

Row :
{row.rowNumber}

</p>

<p className="text-black">
Main Point :
{row.mainPoint}
</p>

<p className="text-black">
FPR :
{row.fpr}
</p>

<p className="text-black">
SPR :
{row.spr}
</p>

<ul className="list-disc pl-6 text-red-700 font-medium">

{row.errors?.map(
(error, i) => (

<li key={i}>
{error}
</li>

))
}

</ul>

</div>

))
}

</div>

)}


            <div className="mt-6">
              <button
  onClick={handleSave}
disabled={saving || data.length === 0}
  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-semibold"
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