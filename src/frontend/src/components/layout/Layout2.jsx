import React, { useState, useEffect } from "react";
import { LogOut, ChevronRight, Menu } from "lucide-react"; 

/* --- CSS STYLES --- */
const styles = `
  .app-layout {
    display: flex;
    height: 100vh;
    width: 100vw;
    overflow: hidden;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    background-color: #f8fafc;
  }

  /* SIDEBAR */
  .sidebar {
    width: 260px;
    background-color: #ffffff;
    border-right: 1px solid #e2e8f0;
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    transition: width 0.3s ease;
  }

  .sidebar-header {
    height: 64px;
    display: flex;
    align-items: center;
    padding: 0 1.5rem;
    border-bottom: 1px solid #f1f5f9;
  }

  .logo-icon {
    width: 32px;
    height: 32px;
    background-color: #3b82f6;
    border-radius: 8px;
    margin-right: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    font-size: 0.9rem;
  }

  .brand-text h1 {
    font-size: 1rem;
    font-weight: 700;
    color: #0f172a;
    margin: 0;
    line-height: 1.2;
  }

  .brand-text p {
    font-size: 0.75rem;
    color: #64748b;
    margin: 0;
  }

  .sidebar-nav {
    flex: 1;
    overflow-y: auto;
    padding: 1.5rem 1rem;
  }

  .nav-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  /* NAV ITEM */
  .nav-item {
    display: flex;
    align-items: center;
    padding: 0.75rem 1rem;
    color: #475569;
    text-decoration: none;
    border-radius: 0.5rem;
    transition: all 0.2s;
    font-size: 0.95rem;
    font-weight: 500;
    cursor: pointer;
    user-select: none;
  }

  .nav-item:hover {
    background-color: #f1f5f9;
    color: #0f172a;
  }

  .nav-item.active {
    background-color: #eff6ff;
    color: #2563eb;
  }

  .nav-icon-wrapper {
    margin-right: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
  }

  /* FOOTER & PROFILE */
  .sidebar-footer {
    padding: 1rem;
    border-top: 1px solid #f1f5f9;
  }

  .user-card {
    display: flex;
    align-items: center;
    padding: 0.5rem;
    border-radius: 0.5rem;
    background-color: #f8fafc;
    border: 1px solid #e2e8f0;
  }

  .user-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    margin-right: 10px;
    flex-shrink: 0;
  }

  .user-info {
    flex: 1;
    min-width: 0;
  }

  .user-info .name {
    font-size: 0.875rem;
    font-weight: 600;
    color: #334155;
  }

  .user-info .email {
    font-size: 0.75rem;
    color: #94a3b8;
  }

  /* MAIN CONTENT */
  .main-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
  }

  .page-content {
    flex: 1;
    padding: 2rem;
    overflow-y: auto;
    background-color: #f8fafc;
  }

  .app-footer {
    height: 50px;
    background-color: #fff;
    border-top: 1px solid #e2e8f0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 2rem;
    font-size: 0.8rem;
    color: #94a3b8;
  }

  .footer-links a {
    margin-left: 1.5rem;
    color: #64748b;
    text-decoration: none;
  }
  .footer-links a:hover { color: #3b82f6; }

  /* LOGOUT MODAL */
  .logout-overlay {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background-color: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 50;
  }

  .logout-popup {
    background: white;
    padding: 1.5rem;
    border-radius: 0.75rem;
    width: 320px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  .logout-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
  }

  .btn-cancel-logout {
    padding: 0.5rem 1rem;
    border: 1px solid #e2e8f0;
    background: white;
    color: #64748b;
    border-radius: 0.375rem;
    cursor: pointer;
  }

  .btn-confirm-logout {
    padding: 0.5rem 1rem;
    background: #ef4444;
    color: white;
    border: none;
    border-radius: 0.375rem;
    cursor: pointer;
  }
`;

/**
 * NavItem Component (Internal Helper)
 */
const NavItem = ({ to, label, icon, isActive, onClick }) => {
  return (
    <div 
      className={`nav-item ${isActive ? 'active' : ''}`}
      onClick={() => onClick(to)} 
    >
      <div className="nav-icon-wrapper">
        {icon || <Menu size={18} />}
      </div>
      {label}
      {isActive && <ChevronRight size={16} style={{ marginLeft: 'auto', opacity: 0.5 }} />}
    </div>
  );
};

/**
 * Layout Component (Pure Component)
 * Component này đóng vai trò là khung sườn (Shell).
 * Dữ liệu và trạng thái được điều khiển bởi Component cha.
 * * @param {string} title - Tên ứng dụng (VD: HR Portal)
 * @param {string} subtitle - Tên phân hệ (VD: Manager View)
 * @param {Array} menuItems - Mảng các object menu: { to: string, label: string, icon: ReactNode }
 * @param {string} activePath - Đường dẫn/Key của menu đang được chọn
 * @param {Function} onNavigate - Hàm callback khi click menu: (path) => void
 * @param {Object} userInfo - Thông tin user: { name: string, code: string, avatarColor?: string }
 * @param {Function} onLogout - Hàm callback khi user xác nhận logout
 */
export default function Layout({ 
  children, 
  title = "Application Name", 
  subtitle = "Module Name",
  menuItems = [],
  activePath = "", 
  onNavigate = (path) => window.location.hash = path, // Default demo behavior
  userInfo = null,
  onLogout = () => console.log("Logout clicked")
}) {
  const [currentUser, setCurrentUser] = useState({ name: 'Guest', code: '---' });
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Logic hiển thị user: Ưu tiên props truyền vào, nếu không có thì fallback local storage
  useEffect(() => {
    if (userInfo) {
      setCurrentUser(userInfo);
    } else {
      const name = localStorage.getItem('employeeName') || 'Guest User'; 
      const code = localStorage.getItem('employeeCode') || 'G-001';
      setCurrentUser({ name, code });
    }
  }, [userInfo]);

  const handleConfirmLogout = () => {
    setShowLogoutConfirm(false);
    onLogout();
  };

  return (
    <>
      <style>{styles}</style>
      <div className="app-layout">
        
        {/* --- LEFT SIDEBAR --- */}
        <aside className="sidebar">
          
          {/* Brand Header */}
          <div className="sidebar-header">
            <div className="logo-icon">{title.charAt(0)}</div>
            <div className="brand-text">
              <h1>{title}</h1>
              <p>{subtitle}</p>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="sidebar-nav">
            <div className="nav-group">
              {menuItems && menuItems.length > 0 ? (
                menuItems.map((item, index) => (
                  <NavItem 
                    key={index}
                    to={item.to} 
                    label={item.label}
                    icon={item.icon}
                    isActive={activePath === item.to}
                    onClick={onNavigate}
                  />
                ))
              ) : (
                <div style={{padding: '1rem', color: '#94a3b8', fontSize: '0.9rem', textAlign: 'center'}}>
                  No menu items provided
                </div>
              )}
            </div>
          </nav>

          {/* User Profile */}
          <div className="sidebar-footer">
            <div className="user-card">
              <div className="user-avatar" style={{
                  backgroundColor: userInfo?.avatarColor || '#ec4899', 
                  color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  fontWeight: 'bold', fontSize: '1.2rem'
              }}>
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : '?'}
              </div>
              
              <div className="user-info">
                <div className="name" title={currentUser.name} style={{whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:'120px'}}>
                    {currentUser.name}
                </div>
                <div className="email">{currentUser.code}</div>
              </div>

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
            <div>© {new Date().getFullYear()} System • {title}</div>
            <div className="footer-links">
              <a href="#">Help</a>
              <a href="#">Privacy</a>
            </div>
          </footer>
        </div>

        {/* --- LOGOUT CONFIRMATION MODAL --- */}
        {showLogoutConfirm && (
          <div className="logout-overlay">
            <div className="logout-popup">
              <h3 style={{marginTop: 0, color: '#0f172a'}}>Xác nhận</h3>
              <p style={{color: '#64748b', marginBottom: '1.5rem'}}>Bạn có chắc chắn muốn đăng xuất?</p>
              <div className="logout-actions">
                <button className="btn-cancel-logout" onClick={() => setShowLogoutConfirm(false)}>Hủy</button>
                <button className="btn-confirm-logout" onClick={handleConfirmLogout}>Đăng xuất</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}