import React, { useState, useEffect } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  History,
  User,
  LogOut,
  Menu,
  ShieldCheck,
  Users,
  Gift,
  Settings,
} from "lucide-react";
import NotificationBell from "../NotificationBell.jsx";
import "./Layout.css";

/* ================= MENU CONFIG THEO ROLE ================= */
const MENU_CONFIG = {
  EMP: {
    title: "Employee Portal",
    subtitle: "Employee Workspace",
    items: [
      { to: "/employee/create", label: "Create Request", icon: FileText },
      { to: "/employee/status", label: "Request Status", icon: History },
      { to: "/employee/profile", label: "My Profile", icon: User },
      { to: "/rewards/my-wallet", label: "My Rewards", icon: Gift },
    ],
  },

  MANAGER: {
    title: "Manager Console",
    subtitle: "Approval System",
    items: [
      { to: "/manager", label: "Dashboard", icon: LayoutDashboard },
      { to: "/manager/rewards/give", label: "Give Bonus", icon: Gift },
      // Employee capabilities
      { to: "/employee/create", label: "Create Request", icon: FileText },
      { to: "/employee/status", label: "Request Status", icon: History },
      { to: "/employee/profile", label: "My Profile", icon: User },
      { to: "/rewards/my-wallet", label: "My Rewards", icon: Gift },
    ],
  },

  HR: {
    title: "HR Administration",
    subtitle: "System Management",
    items: [
      { to: "/hr/profile-requests", label: "Profile Requests", icon: FileText },
      { to: "/hr/directory", label: "Employee Directory", icon: Users },
      { to: "/hr/rewards/config", label: "Reward Config", icon: Settings },
      // Employee capabilities
      { to: "/employee/create", label: "Create Request", icon: FileText },
      { to: "/employee/status", label: "Request Status", icon: History },
      { to: "/employee/profile", label: "My Profile", icon: User },
      { to: "/rewards/my-wallet", label: "My Rewards", icon: Gift },
    ],
  },

  GUEST: {
    title: "HRM System",
    subtitle: "Welcome",
    items: [{ to: "/login", label: "Login", icon: LogOut }],
  },
};

export default function MainLayout({ children }) {
  const [user, setUser] = useState({
    name: "Guest",
    code: "",
    id: null,
    role: "GUEST",
  });
  const [menu, setMenu] = useState(MENU_CONFIG.GUEST);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  /* ================= LOAD USER ================= */
  useEffect(() => {
    const name = localStorage.getItem("employeeName") || "Guest User";
    const code = localStorage.getItem("employeeCode") || "---";
    const id = Number(localStorage.getItem("employeeId"));
    const role = (localStorage.getItem("role") || "GUEST").toUpperCase();

    setUser({
      name,
      code,
      id: Number.isFinite(id) ? id : null,
      role,
    });

    setMenu(MENU_CONFIG[role] || MENU_CONFIG.GUEST);
  }, []);

  /* ================= LOGOUT ================= */
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div className="app-layout">
      {/* ================= SIDEBAR ================= */}
      <aside className="sidebar">
        {/* Header */}
        <div className="sidebar-header">
          <div className="logo-icon">
            {user.role === "MANAGER" ? (
              <ShieldCheck size={20} color="white" />
            ) : (
              <Menu size={20} color="white" />
            )}
          </div>
          <div className="brand-text">
            <h1>{menu.title}</h1>
            <p>{menu.subtitle}</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {menu.items.map((item, idx) => (
            <NavLink
              key={idx}
              to={item.to}
              className={({ isActive }) => (isActive ? "active" : "")}
              end
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User Card */}
        <div className="sidebar-footer">
          <div className="user-card">
            <div
              className="user-avatar"
              style={{
                backgroundColor:
                  user.role === "MANAGER" ? "#ec4899" : "#2563eb",
                color: "white",
                fontWeight: "bold",
                fontSize: "1.2rem",
              }}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>

            <div className="user-info">
              <div className="name" title={user.name}>
                {user.name}
              </div>
              <div className="email">{user.code}</div>
            </div>

            {/* 🔔 Notification */}
            <NotificationBell userId={user.id} />

            {/* Logout */}
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

      {/* ================= MAIN CONTENT ================= */}
      <div className="main-wrapper">
        <main className="page-content">
          {/* 👇 Page sẽ render tại đây */}
          {children ? children : <Outlet />}
        </main>

        <footer className="app-footer">
          <div>
            © {new Date().getFullYear()} HRM Suite • {user.role}
          </div>
          <div className="footer-links">
            <a href="#">Help</a>
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
          </div>
        </footer>
      </div>

      {/* ================= LOGOUT MODAL ================= */}
      {showLogoutConfirm && (
        <div className="logout-overlay">
          <div className="logout-popup">
            <h3>Xác nhận</h3>
            <p>Bạn có chắc chắn muốn đăng xuất?</p>
            <div className="logout-actions">
              <button onClick={() => setShowLogoutConfirm(false)}>Hủy</button>
              <button onClick={handleLogout}>Đăng xuất</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
