import React, { useState, useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom"; 
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
  Megaphone,
  ChevronDown, 
  ChevronRight,
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
      { to: "/employee/campaigns", label: "Campaigns", icon: Gift },
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
      
      // 👇 MENU CÓ CON (DROPDOWN) - Đã cấu hình
      { 
        label: "Campaign", 
        icon: Megaphone,
        children: [ 
          { to: "/hr/campaigns", label: "List campaigns" },
          { to: "/hr/campaigns/add", label: "Add campaign" }
        ]
      },
      
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
  const location = useLocation(); // Hook lấy đường dẫn hiện tại
  const [user, setUser] = useState({
    name: "Guest",
    code: "",
    id: null,
    role: "GUEST",
  });
  const [menu, setMenu] = useState(MENU_CONFIG.GUEST);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  // State quản lý mở menu con
  const [expandedMenu, setExpandedMenu] = useState({});

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

  /* ================= LOGIC TOGGLE MENU ================= */
  const toggleSubMenu = (label) => {
    setExpandedMenu(prev => ({
      ...prev,
      [label]: !prev[label] 
    }));
  };

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
          {menu.items.map((item, idx) => {
            // --- TRƯỜNG HỢP 1: MENU CÓ CON (DROPDOWN) ---
            if (item.children) {
              const isExpanded = expandedMenu[item.label];
              // Kiểm tra xem có đang ở trang con nào không để highlight menu cha
              const isActiveParent = item.children.some(child => location.pathname === child.to);

              return (
                <div key={idx} className="nav-group">
                  {/* Menu Cha */}
                  <div 
                    className={`nav-item-parent ${isActiveParent ? "active" : ""}`}
                    onClick={() => toggleSubMenu(item.label)}
                    style={{
                      display: "flex", alignItems: "center", padding: "12px 15px", 
                      cursor: "pointer", 
                      // 👇 MÀU CHỮ: Active = Xanh sáng, Bình thường = Trắng (để nổi trên nền đen)
                      color: isActiveParent ? "#60a5fa" : "white", 
                      fontWeight: isActiveParent ? "600" : "500",
                      justifyContent: "space-between",
                      transition: "all 0.2s"
                    }}
                  >
                    <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                      <item.icon size={18} />
                      <span>{item.label}</span>
                    </div>
                    {isExpanded ? <ChevronDown size={16}/> : <ChevronRight size={16}/>}
                  </div>

                  {/* Menu Con */}
                  {isExpanded && (
                    <div className="nav-children" style={{paddingLeft: "10px", background: "rgba(0,0,0,0.15)"}}>
                      {item.children.map((child, cIdx) => (
                        <NavLink
                          key={cIdx}
                          to={child.to}
                          className={({ isActive }) => (isActive ? "active" : "")}
                          end
                          style={({ isActive }) => ({
                            display: "flex", alignItems: "center", padding: "10px 15px 10px 35px",
                            textDecoration: "none", fontSize: "0.9rem",
                            // 👇 MÀU CHỮ CON: Active = Xanh sáng, Bình thường = Xám trắng
                            color: isActive ? "#60a5fa" : "#e2e8f0"
                          })}
                        >
                          {child.label}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            // --- TRƯỜNG HỢP 2: MENU THƯỜNG (Giữ nguyên nhưng sửa màu) ---
            return (
              <NavLink
                key={idx}
                to={item.to}
                className={({ isActive }) => (isActive ? "active" : "")}
                end
                style={({ isActive }) => ({
                    // Đảm bảo menu thường cũng màu trắng khi chưa active
                    color: isActive ? "#60a5fa" : "white"
                })}
              >
                <item.icon size={18} />
                {item.label}
              </NavLink>
            );
          })}
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

            <NotificationBell userId={user.id} />

            <button
              onClick={() => setShowLogoutConfirm(true)}
              style={{
                marginLeft: "auto",
                background: "transparent",
                border: "none",
                color: "#cbd5e1", // Sửa màu icon logout cho rõ hơn
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