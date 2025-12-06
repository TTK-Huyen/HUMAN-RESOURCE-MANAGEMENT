import { Routes, Route, NavLink, Navigate, useLocation } from "react-router-dom";

// Import các trang cũ
import LeaveRequestPage from "./LeaveRequestPage";
import OTRequestPage from "./OTRequestPage";
import ResignationRequestPage from "./ResignationRequestPage";
import RequestStatusPage from "./RequestStatusPage";

// Import các trang Profile mới (Của Ý)
import MyProfilePage from "./MyProfilePage";
import ProfileUpdateRequestPage from "./ProfileUpdateRequestPage";

import "../../index.css";

function HeaderTabs() {
  const { pathname } = useLocation();

  // Logic kiểm tra tab nào đang active
  const isCreate = pathname === "/employee" || pathname.startsWith("/employee/create");
  const isStatus = pathname.startsWith("/employee/status");
  const isProfile = pathname.startsWith("/employee/profile");

  return (
    <header className="emp-header shadow-soft fade-in-down">
      <div className="container bar">
        <div className="brand">
          <div className="logo" />
          <div className="brand-text">
            <strong>Employee Workspace</strong>
            <span className="brand-sub">Self-service portal</span>
          </div>
        </div>
        <nav className="tabs" aria-label="Main navigation">
          {/* Tab 1: Tạo Request */}
          <NavLink
            to="/employee/create"
            className={`tab ${isCreate ? "active" : ""}`}
          >
            Create request
          </NavLink>

          {/* Tab 2: Xem trạng thái */}
          <NavLink
            to="/employee/status"
            className={`tab ${isStatus ? "active" : ""}`}
          >
            View request status
          </NavLink>

          {/* Tab 3: Hồ sơ cá nhân (MỚI THÊM) */}
          <NavLink
            to="/employee/profile"
            className={`tab ${isProfile ? "active" : ""}`}
          >
            My Profile
          </NavLink>
        </nav>
        
        <div className="userbox">
          <div className="avatar" />
          <div className="user-meta">
            <span className="user-name">Employee</span>
            <span className="user-code">NV001</span>
          </div>
        </div>
      </div>
    </header>
  );
}

function CreateGrid() {
  const tiles = [
    { to: "leave", title: "Leave request", desc: "Xin nghỉ phép", icon: "🏖️" },
    { to: "ot", title: "Overtime", desc: "Đăng ký OT", icon: "⏱️" },
    { to: "resignation", title: "Resignation", desc: "Nghỉ việc", icon: "📤" },
  ];

  return (
    <section className="create-section fade-in-up">
      <div className="create-header">
        <h2>Choose a request type</h2>
        <p>Quick actions for your daily HR tasks</p>
      </div>

      <div className="grid-3">
        {tiles.map((t) => (
          <NavLink key={t.to} to={t.to} className="tile-card hover-lift">
            <div className="tile-head">
              <span className="tile-emoji" aria-hidden="true">
                {t.icon}
              </span>
              <span>{t.title}</span>
            </div>
            <p className="tile-desc">{t.desc}</p>
          </NavLink>
        ))}
      </div>
    </section>
  );
}

export default function EmployeeApp() {
  return (
    <div className="app">
      <HeaderTabs />
      <main className="container" style={{ marginTop: 24, marginBottom: 32 }}>
        <Routes>
          <Route index element={<Navigate to="create" replace />} />
          
          {/* Khu vực tạo Request */}
          <Route path="create" element={<CreateGrid />} />
          <Route path="create/leave" element={<LeaveRequestPage />} />
          <Route path="create/ot" element={<OTRequestPage />} />
          <Route path="create/resignation" element={<ResignationRequestPage />} />
          
          {/* Khu vực xem Status */}
          <Route path="status" element={<RequestStatusPage />} />

          {/* Khu vực Profile (User Case của Ý) */}
          <Route path="profile" element={<MyProfilePage />} />
          <Route path="profile/update-request" element={<ProfileUpdateRequestPage />} />

          <Route path="*" element={<Navigate to="create" replace />} />
        </Routes>
      </main>

      <footer className="fade-in-up-delayed">
        <div className="container">© 2025 EMS</div>
      </footer>
    </div>
  );
}