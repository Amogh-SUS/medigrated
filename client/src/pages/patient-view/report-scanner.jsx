// client/src/pages/patient-view/report-scanner.jsx
import React, { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";

export default function ReportUpload() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files?.[0] || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setStatus("Please select a file first.");
      return;
    }

    try {
      setStatus("Uploading...");
      const fd = new FormData();
      fd.append("file", file);

      // <-- important: call backend port 5000 directly
      const res = await axios.post(
        "http://localhost:5000/api/reports/upload",
        fd,
        {
          withCredentials: true, // send auth cookie if any
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (res?.data?.success) {
        setStatus("Upload successful.");
      } else {
        setStatus(res?.data?.message || "Upload completed but server returned no success.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      setStatus(
        err?.response?.data?.message ||
          err.message ||
          "Upload failed. Check server and network."
      );
    }
  };

  return (
    <div className="max-w-md">
      <h2 className="text-xl font-semibold mb-2">Upload Report</h2>
      <form onSubmit={handleSubmit}>
        <input type="file" accept=".pdf,image/*" onChange={handleFileChange} />
        <div className="mt-3">
          <Button type="submit">Upload</Button>
        </div>
      </form>
      {status && <div className="mt-3 text-sm">{status}</div>}
    </div>
  );
}
