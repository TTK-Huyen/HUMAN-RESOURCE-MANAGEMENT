import React from "react";
import {
  Routes,
  Route,
  NavLink,
  Navigate,
  useLocation,
} from "react-router-dom";
import "../../index.css";

import HrProfileUpdateRequestListPage from "./HrProfileUpdateRequestListPage";
import HrProfileUpdateRequestDetailPage from "./HrProfileUpdateRequestDetailPage";

function HrHeader() {
  const { pathname } = useLocation();
  const onRequests = pathname.startsWith("/hr/profile-requests");

  return (
    <header className="emp-header shadow-soft fade-in-down">
      <div className="container bar">
        <div className="brand">
          <div className="logo" />
          <div className="brand-text">
            <strong>HR Console</strong>
            <span className="brand-sub">Manage employee profiles</span>
          </div>
        </div>

        <nav className="tabs" aria-label="HR navigation">
          <NavLink
            to="/hr/profile-requests"
            className={`tab ${onRequests ? "active" : ""}`}
          >
            Profile update requests
          </NavLink>
          {/* Bạn có thể thêm các tab HR khác ở đây sau này */}
        </nav>

        <div className="userbox">
          <div className="avatar" />
          <div className="user-meta">
            <span className="user-name">HR Admin</span>
            <span className="user-code">HR01</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default function HrApp() {
  return (
    <div className="app">
      <HrHeader />

      <main
        className="container"
        style={{
          marginTop: 24,
          marginBottom: 32,
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
        <Routes>
          <Route
            path="/"
            element={<Navigate to="/hr/profile-requests" replace />}
          />
          <Route
            path="/profile-requests"
            element={<HrProfileUpdateRequestListPage />}
          />
          <Route
            path="/profile-requests/:requestId"
            element={<HrProfileUpdateRequestDetailPage />}
          />
          <Route path="*" element={<Navigate to="/hr" replace />} />
        </Routes>
      </main>

      <footer className="fade-in-up-delayed">
        <div className="container">© 2025 EMS – HR</div>
      </footer>
    </div>
  );
}
