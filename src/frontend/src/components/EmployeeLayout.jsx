import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { FileText, History, User, LogOut } from "lucide-react";
import "./Layout.css";
import NotificationBell from "../components/NotificationBell";

export default function EmployeeLayout({ children }) {
  const [user, setUser] = useState({ name: "Employee", code: "", id: null });
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    const name = localStorage.getItem("employeeName") || "Employee";
    const code = localStorage.getItem("employeeCode") || "";
    const id = Number(localStorage.getItem("employeeId"));
    setUser({ name, code, id: Number.isFinite(id) ? id : null });
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const linkClass = ({ isActive }) => (isActive ? "active" : "");

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo-icon" />
          <div className="brand-text">
            <h1>Employee Portal</h1>
            <p>Employee Workspace</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/employee/create" className={linkClass}>
            <FileText size={18} /> Create request
          </NavLink>

          <NavLink to="/employee/status" className={linkClass}>
            <History size={18} /> View request status
          </NavLink>

          <NavLink to="/employee/profile" className={linkClass}>
            <User size={18} /> My Profile
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="user-card">
            <div
              className="user-avatar"
              style={{
                backgroundColor: "#2563eb",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                fontSize: "1.2rem",
                backgroundImage: "none",
              }}
            >
              {user.name?.charAt(0)?.toUpperCase()}
            </div>

            <div className="user-info">
              <div
                className="name"
                title={user.name}
                style={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: "120px",
                }}
              >
                {user.name}
              </div>
              <div className="email">{user.code}</div>
            </div>
            <NotificationBell userId={user.id} />
            <button
              onClick={() => setShowLogoutConfirm(true)}
              style={{
                marginLeft: "auto",
                background: "transparent",
                border: "none",
                color: "#64748b",
                cursor: "pointer",
              }}
              title="Đăng xuất"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      <div className="main-wrapper">
        <main className="page-content">{children}</main>

        <footer className="app-footer">
          <div>© {new Date().getFullYear()} EMS • HR Suite</div>
          <div className="footer-links">
            <a href="#help">Help</a>
            <a href="#privacy">Privacy</a>
            <a href="#terms">Terms</a>
          </div>
        </footer>
      </div>

      {showLogoutConfirm && (
        <div className="logout-overlay">
          <div className="logout-popup">
            <h3 style={{ marginTop: 0, color: "#0f172a" }}>Xác nhận</h3>
            <p style={{ color: "#64748b", marginBottom: "1.5rem" }}>
              Bạn có chắc chắn muốn đăng xuất?
            </p>
            <div className="logout-actions">
              <button
                className="btn-cancel-logout"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Hủy
              </button>
              <button className="btn-confirm-logout" onClick={handleLogout}>
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
