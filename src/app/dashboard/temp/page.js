"use client";

import { useState } from "react";

export default function BulkAccountUpload() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files?.[0] || null);
    setResults(null);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please choose a CSV or Excel file first.");
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/bulk-update-account", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Upload failed.");
      } else {
        setResults(data.results);
      }
    } catch (err) {
      setError("Something went wrong while uploading.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4 border rounded-lg space-y-4">
      <h2 className="text-lg font-semibold">Bulk Update Account (by subPoint)</h2>

      <div className="flex items-center gap-3">
        <input
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileChange}
          className="text-sm"
        />
        <button
          onClick={handleUpload}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      {results && (
        <div className="space-y-3">
          <div className="flex gap-4 text-sm">
            <span>Total: <b>{results.total}</b></span>
            <span className="text-green-600">Updated: <b>{results.updated}</b></span>
            <span className="text-yellow-600">Not found: <b>{results.notFound}</b></span>
            <span className="text-gray-500">Skipped: <b>{results.skipped}</b></span>
          </div>

          <div className="overflow-auto max-h-96 border rounded">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="text-left p-2">subPoint</th>
                  <th className="text-left p-2">account</th>
                  <th className="text-left p-2">status</th>
                  <th className="text-left p-2">reason</th>
                </tr>
              </thead>
              <tbody>
                {results.details.map((row, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-2">{row.subPoint ?? "-"}</td>
                    <td className="p-2">{row.account ?? "-"}</td>
                    <td
                      className={
                        "p-2 font-medium " +
                        (row.status === "updated"
                          ? "text-green-600"
                          : row.status === "notFound"
                          ? "text-yellow-600"
                          : "text-gray-500")
                      }
                    >
                      {row.status}
                    </td>
                    <td className="p-2 text-gray-500">{row.reason || ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}