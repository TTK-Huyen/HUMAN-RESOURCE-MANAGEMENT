import { Routes, Route, NavLink, Navigate, useLocation } from "react-router-dom";

import LeaveRequestPage from "./LeaveRequestPage";
import OTRequestPage from "./OTRequestPage";
import ResignationRequestPage from "./ResignationRequestPage";
//import RequestStatusPage from "./RequestStatusPage";

import "../../index.css";

function HeaderTabs() {
  const { pathname } = useLocation();
  const onCreate =
    pathname === "/employee" || pathname.startsWith("/employee/create");

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
          <NavLink
            to="/employee/create"
            className={`tab ${onCreate ? "active" : ""}`}
          >
            Create request
          </NavLink>
          <NavLink
            to="/employee/status"
            className={`tab ${!onCreate ? "active" : ""}`}
          >
            View request status
          </NavLink>
        </nav>
        <div className="userbox">
          <div className="avatar" />
          <div className="user-meta">
            <span className="user-name">Alice</span>
            <span className="user-code">E001</span>
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
          <Route path="/" element={<CreateGrid />} />
          <Route path="/create" element={<CreateGrid />} />
          <Route path="/create/leave" element={<LeaveRequestPage />} />
          <Route path="/create/ot" element={<OTRequestPage />} />
          <Route path="/create/resignation" element={<ResignationRequestPage />} />

          <Route path="*" element={<Navigate to="/employee" replace />} />
        </Routes>
      </main>

      <footer className="fade-in-up-delayed">
        <div className="container">© 2025 EMS</div>
      </footer>
    </div>
  );
}
