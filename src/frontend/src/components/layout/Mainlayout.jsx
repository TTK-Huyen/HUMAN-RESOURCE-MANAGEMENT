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
import ConfirmDialog from "../common/ConfirmDialog.jsx";
import "./Layout.css";

/* ================= MENU CONFIG THEO ROLE (Grouped Sections) ================= */
// Each role now has `groups` representing: Profile, Request, Campaign, Reward
const MENU_CONFIG = {
  EMP: {
    title: "Employee Portal",
    subtitle: "Employee Workspace",
    groups: [
      {
        key: "profile",
        label: "Profile",
        items: [
          { to: "/employee/profile", label: "My Profile", icon: User },
        ],
      },
      {
        key: "request",
        label: "Request",
        items: [
          { to: "/employee/create", label: "Create Request", icon: FileText },
          { to: "/employee/status", label: "Request Status", icon: History },
        ],
      },
      {
        key: "campaign",
        label: "Campaign",
        items: [
          { to: "/employee/campaigns", label: "Campaigns", icon: Megaphone },
        ],
      },
      {
        key: "reward",
        label: "Reward",
        items: [
          { to: "/rewards/my-wallet", label: "My Rewards", icon: Gift },
        ],
      },
    ],
  },

  MANAGER: {
    title: "Manager Console",
    subtitle: "Approval System",
    groups: [
      {
        key: "profile",
        label: "Profile",
        items: [
          { to: "/employee/profile", label: "My Profile", icon: User },
        ],
      },
      {
        key: "request",
        label: "Request",
        items: [
          { to: "/manager", label: "Dashboard", icon: LayoutDashboard },
          { to: "/employee/create", label: "Create Request", icon: FileText },
          { to: "/employee/status", label: "Request Status", icon: History },
        ],
      },
      {
        key: "campaign",
        label: "Campaign",
        items: [
          { to: "/employee/campaigns", label: "Campaigns", icon: Megaphone }
        ],
      },
      {
        key: "reward",
        label: "Reward",
        items: [
          { to: "/manager/rewards/give", label: "Give Bonus", icon: Gift },
          { to: "/rewards/my-wallet", label: "My Rewards", icon: Gift },
        ],
      },
    ],
  },

  ADMIN: {
    title: "Administrator",
    subtitle: "Full Access",
    groups: [
      {
        key: "profile",
        label: "Profile",
        items: [
          { to: "/employee/profile", label: "View Profile", icon: User },
          { to: "/hr/profile-requests", label: "Profile Requests", icon: FileText },
          { to: "/hr/directory", label: "Employee Directory", icon: Users },
        ],
      },
      {
        key: "request",
        label: "Request",
        items: [
          { to: "/manager", label: "Dashboard", icon: LayoutDashboard },
          { to: "/employee/create", label: "Create Request", icon: FileText },
          { to: "/employee/status", label: "Request Status", icon: History },
        ],
      },
      {
        key: "campaign",
        label: "Campaign",
        items: [
          { to: "/hr/campaigns", label: "Manage Campaigns", icon: Megaphone },
          { to: "/hr/campaigns/add", label: "Add campaign", icon: Megaphone },
          { to: "/employee/campaigns", label: "Employee Campaigns", icon: Megaphone },
        ],
      },
      {
        key: "reward",
        label: "Reward",
        items: [
          { to: "/hr/rewards/config", label: "Reward Config", icon: Settings },
          { to: "/employee/rewards", label: "Employee Rewards", icon: Gift },
          { to: "/hr/rewards/redemptions", label: "Redemptions", icon: Gift },
          { to: "/manager/rewards/give", label: "Give Bonus", icon: Gift },
        ],
      },
      /* System group removed for ADMIN - keep admin pages under other groups */
    ],
  },

  HR: {
    title: "HR Administration",
    subtitle: "System Management",
    groups: [
      {
        key: "profile",
        label: "Profile",
        items: [
          { to: "/employee/profile", label: "View Profile", icon: User },
          //{ to: "/hr/profile-requests", label: "Profile Requests", icon: FileText },
          { to: "/hr/directory", label: "Employee Directory", icon: Users },
        ],
      },
      {
        key: "request",
        label: "Request",
        items: [
          { to: "/employee/create", label: "Create Request", icon: FileText },
          { to: "/employee/status", label: "Request Status", icon: History },
        ],
      },
      {
        key: "campaign",
        label: "Campaign",
        items: [
          { to: "/hr/campaigns", label: "List campaigns", icon: Megaphone },
          { to: "/hr/campaigns/add", label: "Add campaign", icon: Megaphone },
        ],
      },
      {
        key: "reward",
        label: "Reward",
        items: [
          { to: "/hr/rewards/config", label: "Reward Config", icon: Settings },
          { to: "/employee/rewards", label: "My Rewards", icon: Gift},
          { to: "/hr/rewards/redemptions", label: "Redemptions", icon: Gift }        
        ],
      },
    ],
  },

  GUEST: {
    title: "HRM System",
    subtitle: "Welcome",
    groups: [
      { key: "profile", label: "Profile", items: [{ to: "/login", label: "Login", icon: LogOut }] },
    ],
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
    const token = localStorage.getItem("token");
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
    
    // DEBUG: Log user info
    console.log("MainLayout - User loaded:", { token: !!token, role, code });
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
    console.log("🚪 Logging out...");
    // FIX: Clear only auth data, not entire localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("employeeCode");
    localStorage.removeItem("employeeName");
    localStorage.removeItem("employeeId");
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

        {/* Navigation - grouped into subsystems */}
        <nav className="sidebar-nav">
          {(menu.groups || []).map((section, sIdx) => (
            <div key={sIdx} className="menu-section">
              <div className="menu-section-header" style={{padding: '10px 15px', color: '#9fb4ff', fontWeight: 700}}>
                {section.label}
              </div>

              <div className="menu-section-items">
                {(section.items || []).map((item, idx) => {
                  if (item.children) {
                    const labelKey = item.label || `child-${idx}`;
                    const isExpanded = !!expandedMenu[labelKey];
                    const isActiveParent = (item.children || []).some(child => location.pathname === child.to);

                    return (
                      <div key={idx} className="nav-group">
                        <div
                          className={`nav-item-parent ${isActiveParent ? "active" : ""}`}
                          onClick={() => toggleSubMenu(labelKey)}
                          style={{display: 'flex', alignItems: 'center', padding: '10px 15px', cursor: 'pointer', justifyContent: 'space-between', color: isActiveParent ? '#60a5fa' : '#e2e8f0'}}
                        >
                          <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                            {item.icon && <item.icon size={18} />}
                            <span>{item.label}</span>
                          </div>
                          {isExpanded ? <ChevronDown size={14}/> : <ChevronRight size={14}/>}
                        </div>

                        {isExpanded && (
                          <div className="nav-children" style={{paddingLeft: '12px', background: 'rgba(0,0,0,0.08)'}}>
                            {(item.children || []).map((child, cIdx) => (
                              <NavLink
                                key={cIdx}
                                to={child.to}
                                className={({ isActive }) => (isActive ? 'active' : '')}
                                end
                                style={({ isActive }) => ({display: 'block', padding: '8px 12px', textDecoration: 'none', color: isActive ? '#60a5fa' : '#e2e8f0'})}
                              >
                                {child.label}
                              </NavLink>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  }

                  return (
                    <NavLink
                      key={idx}
                      to={item.to}
                      className={({ isActive }) => (isActive ? 'active' : '')}
                      end
                      style={({ isActive }) => ({display: 'flex', alignItems: 'center', padding: '10px 15px', textDecoration: 'none', color: isActive ? '#60a5fa' : '#e2e8f0'})}
                    >
                      {item.icon && <item.icon size={18} />}
                      <span style={{marginLeft: 10}}>{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
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
              title="Logout"
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

      {/* ================= LOGOUT CONFIRM DIALOG ================= */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        title="Confirm"
        message="Are you sure you want to log out?"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
        type="danger"
        confirmLabel="Log out"
        cancelLabel="Cancel"
      />
    </div>
  );
}