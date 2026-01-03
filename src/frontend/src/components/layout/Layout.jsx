import React, { useState, useEffect } from "react";
import { LayoutDashboard, History, LogOut, FileText } from "lucide-react"; 
import NavItem from "../common/NavItem.jsx";
import "./Layout.css"; 
import NotificationBell from "../../components/NotificationBell";

export default function Layout({ children }) {
  // --- STATE MỚI: QUẢN LÝ USER & POPUP LOGOUT ---
  const [user, setUser] = useState({ name: 'Guest', code: 'N/A', id: null });
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // 1. Lấy thông tin user từ LocalStorage khi load trang
  useEffect(() => {
    const name = localStorage.getItem('employeeName') || 'HR Manager'; // Fallback nếu chưa login
    const code = localStorage.getItem('employeeCode') || 'ADMIN';
    const id = Number(localStorage.getItem("employeeId"));
    setUser({ name, code, id: Number.isFinite(id) ? id : null });
  }, []);

  // 2. Hàm xử lý Đăng xuất
  const handleLogout = () => {
    localStorage.clear(); // Xóa token & info
    window.location.href = '/login'; // Chuyển về trang login
  };

  return (
    <div className="app-layout">
      
      {/* --- LEFT SIDEBAR --- */}
      <aside className="sidebar">
        
        {/* 1. Brand Logo */}
        <div className="sidebar-header">
          <div className="logo-icon" />
          <div className="brand-text">
            <h1>HR Request Portal</h1>
            <p>Manager Console</p>
          </div>
        </div>

        {/* 2. Navigation Menu */}
        <nav className="sidebar-nav">
          <div className="nav-group">
            <NavItem 
                to="/manager" 
                label={<><LayoutDashboard size={18} /> Dashboard</>} 
            />
          </div>
        </nav>

        {/* 3. User Profile (Bottom) - ĐÃ SỬA ĐỔI */}
        <div className="sidebar-footer">
          <div className="user-card">
            {/* Avatar chữ cái đầu */}
            <div className="user-avatar" style={{
                backgroundColor: '#ec4899', color: 'white', display: 'flex', 
                alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem'
            }}>
                {user.name.charAt(0).toUpperCase()}
            </div>
            
            {/* Tên & Mã NV lấy động */}
            <div className="user-info">
              <div className="name" title={user.name} style={{whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:'120px'}}>
                  {user.name}
              </div>
              <div className="email">{user.code}</div>
            </div>

            <NotificationBell userId={user.id} />
            {/* Nút Logout mở Popup */}
            <button 
                onClick={() => setShowLogoutConfirm(true)}
                style={{marginLeft: 'auto', background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer'}}
                title="Đăng xuất"
            >
                <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* --- RIGHT MAIN CONTENT --- */}
      <div className="main-wrapper">
        <main className="page-content">
            {children}
        </main>

        <footer className="app-footer">
          <div>© {new Date().getFullYear()} Acme Corp • HR Suite</div>
          <div className="footer-links">
            <a href="#help">Help</a>
            <a href="#privacy">Privacy</a>
            <a href="#terms">Terms</a>
          </div>
        </footer>
      </div>

      {/* --- 4. POPUP XÁC NHẬN LOGOUT (MỚI THÊM) --- */}
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