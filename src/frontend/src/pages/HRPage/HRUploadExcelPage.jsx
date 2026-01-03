// HRUploadExcelPage.jsx
import React, { useState } from "react";
import "../../Services/employees.js"
export default function HRUploadExcelPage() {
  const [file, setFile] = useState(null);

  const handleUpload = () => {
    if (!file) return alert("Please select a file");
    // TODO: Gửi file lên API
    alert("Uploading " + file.name);
  };

  return (
    <div className="card fade-in-up">
      <div className="card-header">
        <h2>Import Employees from Excel</h2>
        <p>Accepts .xlsx or .csv files.</p>
      </div>
      <div className="card-body">
        <input
          type="file"
          accept=".xlsx,.csv"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <button className="btn" onClick={handleUpload} disabled={!file}>
          Upload
        </button>
      </div>
    </div>
  );
}
