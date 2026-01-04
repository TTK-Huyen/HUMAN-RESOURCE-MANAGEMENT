import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
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
  Settings   
} from "lucide-react"; 
import "./Layout.css"; 

// --- CẤU HÌNH MENU CHO TỪNG ROLE ---
const MENU_CONFIG = {
  // Menu cho Nhân viên
  EMP: {
    title: "Employee Portal",
    subtitle: "Employee Workspace",
    items: [
      { to: "/employee/create", label: "Create Request", icon: FileText },
      { to: "/employee/status", label: "Request Status", icon: History },
      { to: "/employee/profile", label: "My Profile", icon: User },
      // [SỬA LẠI] Đường dẫn đúng khớp với App.jsx (bỏ /employee ở đầu)
      { to: "/rewards/my-wallet", label: "My Rewards", icon: Gift },
    ]
  },
  // Menu cho Quản lý
  MANAGER: {
    title: "Manager Console",
    subtitle: "Approval System",
    items: [
      { to: "/manager", label: "Dashboard", icon: LayoutDashboard },
      { to: "/manager/rewards/give", label: "Give Bonus", icon: Gift },
    ]
  },
  // Menu cho HR
  HR: {
    title: "HR Administration",
    subtitle: "System Management",
    items: [
      { to: "/hr/profile-requests", label: "Yêu cầu hồ sơ", icon: FileText },
      { to: "/hr/directory", label: "Danh bạ nhân viên", icon: Users },
      { to: "/hr/rewards/config", label: "Reward Config", icon: Settings },
    ]
  },
  // Menu mặc định (Khách)
  GUEST: {
    title: "HRM System",
    subtitle: "Welcome",
    items: [
      { to: "/login", label: "Login", icon: LogOut },
    ]
  }
};

export default function MainLayout({ children }) {
  const navigate = useNavigate();
  
  // --- STATE ---
  const [user, setUser] = useState({ name: "Guest", code: "", role: "GUEST" });
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [layoutConfig, setLayoutConfig] = useState(MENU_CONFIG.GUEST);

  // --- EFFECT: Lấy thông tin User & Chọn Menu ---
  useEffect(() => {
    const name = localStorage.getItem("employeeName") || "Guest User";
    const code = localStorage.getItem("employeeCode") || "---";
    // Lấy Role và chuyển về chữ hoa để so sánh chính xác với MENU_CONFIG
    const role = (localStorage.getItem("role") || "GUEST").toUpperCase();

    setUser({ name, code, role });

    // Chọn cấu hình menu, nếu role không khớp thì fallback về GUEST
    const config = MENU_CONFIG[role] || MENU_CONFIG.GUEST;
    setLayoutConfig(config);
  }, []);

  // --- ACTION: Đăng xuất ---
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/"; // Về trang Login
  };

  return (
    <div className="app-layout">
      
      {/* === SIDEBAR === */}
      <aside className="sidebar">
        {/* Header */}
        <div className="sidebar-header">
          <div className="logo-icon">
             {user.role === 'MANAGER' ? <ShieldCheck size={20} color="white"/> : <Menu size={20} color="white"/>}
          </div>
          <div className="brand-text">
            <h1>{layoutConfig.title}</h1>
            <p>{layoutConfig.subtitle}</p>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="sidebar-nav">
          {layoutConfig.items.map((item, index) => (
            <NavLink 
              key={index} 
              to={item.to} 
              className={({ isActive }) => isActive ? "active" : ""}
              end // Giữ end để highlight đúng link chính xác
            >
              <item.icon size={18} /> 
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Footer (User Info) */}
        <div className="sidebar-footer">
          <div className="user-card">
            <div className="user-avatar" style={{
                backgroundColor: user.role === 'MANAGER' ? '#ec4899' : '#2563eb', 
                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                fontWeight: 'bold', fontSize: '1.2rem', backgroundImage: 'none'
            }}>
                {user.name.charAt(0).toUpperCase()}
            </div>

            <div className="user-info">
              <div className="name" title={user.name}>
                {user.name}
              </div>
              <div className="email">{user.code}</div>
            </div>

            <button 
                onClick={() => setShowLogoutConfirm(true)}
                className="btn-logout-trigger"
                title="Đăng xuất"
                style={{marginLeft: 'auto', background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer'}}
            >
                <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* === MAIN CONTENT === */}
      <div className="main-wrapper">
        <main className="page-content">
            {children}
        </main>

        <footer className="app-footer">
          <div>© {new Date().getFullYear()} HRM Suite • {user.role} View</div>
          <div className="footer-links">
            <a href="#">Help</a>
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
          </div>
        </footer>
      </div>

      {/* === LOGOUT MODAL === */}
      {showLogoutConfirm && (
        <div className="logout-overlay">
          <div className="logout-popup">
            <h3 style={{marginTop: 0, color: '#0f172a'}}>Xác nhận</h3>
            <p style={{color: '#64748b', marginBottom: '1.5rem'}}>Bạn có chắc chắn muốn đăng xuất?</p>
            <div className="logout-actions">
              <button className="btn-cancel-logout" onClick={() => setShowLogoutConfirm(false)}>Hủy</button>
              <button className="btn-confirm-logout" onClick={handleLogout}>Đăng xuất</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}