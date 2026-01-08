import React, { useState, useRef } from "react";
import {
  Download,
  Upload,
  FileUp,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
} from "lucide-react";
import { HRService } from "../../Services/employees";
import Button from "../../components/common/Button";
import Toast from "../../components/common/Toast";
import Table from "../../components/common/Table";

export default function HRUploadExcelPage() {
  const [file, setFile] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [importResult, setImportResult] = useState(null); // Lưu kết quả trả về từ API
  const [toast, setToast] = useState(null); // { message, type }
  const fileInputRef = useRef(null);

  // Handle download template
  const handleDownloadTemplate = async () => {
    try {
      setDownloading(true);
      await HRService.downloadEmployeeExcelTemplate(); // service tự download
      setToast({ message: "Downloaded template successfully!", type: "success" });
    } catch (e) {
      console.error(e);
      setToast({
        message: e?.message || "Failed to download template. Please try again.",
        type: "danger",
      });
    } finally {
      setDownloading(false);
    }
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setImportResult(null); // Reset kết quả cũ khi chọn file mới
    }
  };

  // Xử lý Upload
  const handleUpload = async () => {
    if (!file) {
      setToast({
        message: "Please select a file before uploading",
        type: "danger",
      });
      return;
    }

    try {
      setUploading(true);
      setImportResult(null);

      const formData = new FormData();
      formData.append("file", file);

      // Call import API
      const response = await HRService.importEmployeesFromExcel(formData);

      // Response.data is usually wrapped in a common object, check the API response structure
      // Based on controller: return Ok(new { message, data = result })
      const resultData = response.data || response;

      setImportResult(resultData);
      setToast({ message: "File processed successfully!", type: "success" });

      // Reset file input after completion
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.message || "Error uploading file.";
      setToast({ message: errorMsg, type: "danger" });

      // If there are validation errors returned from server
      if (error.response?.data?.errors) {
        setImportResult({ errors: error.response.data.errors, isError: true });
      }
    } finally {
      setUploading(false);
    }
  };

  // Error table columns configuration
  const errorColumns = [
    {
      title: "Row",
      dataIndex: "row",
      width: "80px",
      className: "text-center",
    },
    { title: "Employee Code", dataIndex: "employeeCode", width: "120px" },
    { title: "Error Field", dataIndex: "field", width: "150px" },
    { title: "Error Details", dataIndex: "error", className: "text-danger" },
  ];

  return (
    <div className="card fade-in-up" style={{ padding: 24 }}>
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type === "danger" ? "error" : "success"}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <div
        style={{
          marginBottom: 24,
          borderBottom: "1px solid #e2e8f0",
          paddingBottom: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 8,
          }}
        >
          <div
            style={{
              padding: 10,
              background: "#eff6ff",
              borderRadius: "50%",
              color: "#3b82f6",
            }}
          >
            <FileSpreadsheet size={24} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: "1.25rem", color: "#1e293b" }}>
              Import Employees from Excel
            </h2>
            <p
              style={{
                margin: "4px 0 0",
                color: "#64748b",
                fontSize: "0.875rem",
              }}
            >
              Support .xlsx or .csv file formats. Data will be added or updated based on Employee Code.
            </p>
          </div>
        </div>
      </div>

      {/* Actions Area */}
      <div
        style={{
          display: "flex",
          gap: 16,
          alignItems: "center",
          background: "#f8fafc",
          padding: 20,
          borderRadius: 8,
          marginBottom: 24,
        }}
      >
        {/* Nút tải mẫu */}
        <Button
          variant="secondary"
          onClick={handleDownloadTemplate}
          isLoading={downloading}
          icon={Download}
        >
          Download Template 
        </Button>

        <div style={{ width: 1, height: 40, background: "#cbd5e1" }}></div>

        {/* Input file */}
        <div style={{ flex: 1 }}>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.csv"
            onChange={handleFileChange}
            style={{
              display: "block",
              width: "100%",
              padding: "8px",
              border: "1px solid #e2e8f0",
              borderRadius: 6,
              background: "white",
            }}
          />
        </div>

        {/* Import Button */}
        <Button
          variant="primary"
          onClick={handleUpload}
          disabled={!file}
          isLoading={uploading}
          icon={Upload}
        >
          Import
        </Button>
      </div>

      {/* Result Section */}
      {importResult && (
        <div className="fade-in-up">
          <h3 style={{ fontSize: "1.1rem", marginBottom: 16 }}>
            Import Results
          </h3>

          {/* Summary Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 16,
              marginBottom: 24,
            }}
          >
            <SummaryCard
              label="Total Rows Processed"
              value={importResult.processedRows || 0}
              icon={Info}
              color="#3b82f6"
              bg="#eff6ff"
            />
            <SummaryCard
              label="Created"
              value={importResult.createdCount || 0}
              icon={CheckCircle}
              color="#16a34a"
              bg="#dcfce7"
            />
            <SummaryCard
              label="Updated"
              value={importResult.updatedCount || 0}
              icon={FileUp}
              color="#d97706"
              bg="#fef3c7"
            />
            <SummaryCard
              label="Skipped / Errors"
              value={
                (importResult.skippedCount || 0) +
                (importResult.errors?.length || 0)
              }
              icon={AlertTriangle}
              color="#dc2626"
              bg="#fee2e2"
            />
          </div>

          {/* Error Table */}
          {importResult.errors && importResult.errors.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <h4
                style={{
                  color: "#dc2626",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 12,
                }}
              >
                <XCircle size={18} />
                Detailed Error List ({importResult.errors.length})
              </h4>
              <Table
                columns={errorColumns}
                data={importResult.errors}
                emptyText="No errors."
              />
            </div>
          )}
        </div>
      )}

      {/* Results will be displayed here */}
    </div>
  );
}

// Sub component to display small statistics card
function SummaryCard({ label, value, icon: Icon, color, bg }) {
  return (
    <div
      style={{
        background: "white",
        border: `1px solid ${bg}`,
        borderRadius: 8,
        padding: 16,
        display: "flex",
        alignItems: "center",
        gap: 16,
        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
      }}
    >
      <div
        style={{ background: bg, padding: 10, borderRadius: 8, color: color }}
      >
        <Icon size={24} />
      </div>
      <div>
        <div style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: 4 }}>
          {label}
        </div>
        <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1e293b" }}>
          {value}
        </div>
      </div>
    </div>
  );
}
