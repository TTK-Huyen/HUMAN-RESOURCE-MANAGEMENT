import React from "react";
import { Routes, Route, NavLink, Navigate } from "react-router-dom";
import { FileText, Clock, LogOut } from "lucide-react"; // Dùng icon cho đẹp (nếu bạn đã cài lucide-react)

// Import các trang chức năng
import LeaveRequestPage from "./LeaveRequestPage";
import OTRequestPage from "./OTRequestPage";
import ResignationRequestPage from "./ResignationRequestPage";
import RequestStatusPage from "./RequestStatusPage";
import MyProfilePage from "./MyProfilePage";
import ProfileUpdateRequestPage from "./ProfileUpdateRequestPage";
import CampaignsList from "./Campaigns/CampaignsList";
import CampaignDetail from "./Campaigns/CampaignDetail";

// --- COMPONENT MENU LƯỚI (DASHBOARD CỦA NHÂN VIÊN) ---
function CreateGrid() {
  const tiles = [
    {
      to: "leave",
      title: "Xin nghỉ phép",
      desc: "Tạo đơn xin nghỉ phép năm, nghỉ ốm...",
      icon: <FileText size={32} color="#2563eb" />,
    },
    {
      to: "ot",
      title: "Đăng ký OT",
      desc: "Đăng ký làm thêm giờ (Overtime)",
      icon: <Clock size={32} color="#f59e0b" />,
    },
    {
      to: "resignation",
      title: "Nghỉ việc",
      desc: "Gửi đơn xin thôi việc",
      icon: <LogOut size={32} color="#ef4444" />,
    },
  ];

  return (
    <div
      className="fade-in-up"
      style={{
        width: "100%",
        boxSizing: "border-box",
        padding: "24px",
        maxWidth: 1200,
        margin: "0 auto",
        overflowX: "hidden",
      }}
    >
      <div style={{ marginBottom: 24 }}>
        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: "bold",
            color: "#1e293b",
            marginBottom: 8,
          }}
        >
          Bạn muốn tạo yêu cầu gì?
        </h2>
        <p style={{ color: "#64748b", margin: 0 }}>
          Chọn loại đơn từ bên dưới để bắt đầu quy trình.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 20,
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {tiles.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            style={{ textDecoration: "none", display: "block", minWidth: 0 }}
          >
            <div
              className="tile-card"
              style={{
                background: "white",
                padding: 24,
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                transition: "all 0.2s",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 12,
                cursor: "pointer",
                boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                minWidth: 0,
                boxSizing: "border-box",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow =
                  "0 10px 15px -3px rgba(0, 0, 0, 0.1)";
                e.currentTarget.style.borderColor = "#3b82f6";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.02)";
                e.currentTarget.style.borderColor = "#e2e8f0";
              }}
            >
              <div
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 10,
                  background: "#f8fafc",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {t.icon}
              </div>

              <div style={{ minWidth: 0 }}>
                <h3
                  style={{
                    margin: "0 0 4px",
                    fontSize: "1.1rem",
                    color: "#0f172a",
                  }}
                >
                  {t.title}
                </h3>
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.9rem",
                    color: "#64748b",
                    lineHeight: 1.5,
                  }}
                >
                  {t.desc}
                </p>
              </div>
            </div>
          </NavLink>
        ))}
      </div>
    </div>
  );
}

// --- MAIN EMPLOYEE APP ---
export default function EmployeeApp() {
  return (
    // ❌ QUAN TRỌNG: Đã xóa <EmployeeLayout> vì App.js đã bọc MainLayout rồi
    <Routes>
      {/* Mặc định vào /employee sẽ chuyển hướng đến trang Create */}
      <Route index element={<Navigate to="create" replace />} />

      {/* 1. Nhóm Trang Tạo Đơn (/employee/create) */}
      <Route path="create">
        <Route index element={<CreateGrid />} /> {/* /employee/create */}
        <Route path="leave" element={<LeaveRequestPage />} />{" "}
        {/* /employee/create/leave */}
        <Route path="ot" element={<OTRequestPage />} />{" "}
        {/* /employee/create/ot */}
        <Route path="resignation" element={<ResignationRequestPage />} />{" "}
        {/* /employee/create/resignation */}
      </Route>

      {/* 2. Trang Xem Trạng Thái (/employee/status) */}
      <Route path="status" element={<RequestStatusPage />} />

      {/* 3. Nhóm Trang Profile (/employee/profile) */}
      <Route path="profile">
        <Route index element={<MyProfilePage />} />
        <Route path="update-request" element={<ProfileUpdateRequestPage />} />
      </Route>

      {/* 4. Nhóm Trang Chiến Dịch (/employee/campaigns) */}
      <Route path="campaigns">
        <Route index element={<CampaignsList />} />
        <Route path=":id" element={<CampaignDetail />} />
      </Route>

      {/* Fallback: Nhập sai link thì về create */}
      <Route path="*" element={<Navigate to="create" replace />} />
    </Routes>
  );
}
