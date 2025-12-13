import React from "react";
import { LayoutDashboard, History, LogOut, FileText } from "lucide-react"; // Import thêm icon nếu cần
import NavItem from "./NavItem";
import "./Layout.css"; 

export default function Layout({ children }) {
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
            {/* THAY ĐỔI Ở ĐÂY: Đổi Home thành Dashboard và trỏ về trang chủ /manager */}
            <NavItem 
                to="/manager" 
                label={<><LayoutDashboard size={18} /> Dashboard</>} 
            />
          </div>
        </nav>

        {/* 3. User Profile (Bottom) */}
        <div className="sidebar-footer">
          <div className="user-card">
            <div className="user-avatar" />
            <div className="user-info">
              <div className="name">HR Manager</div>
              <div className="email">manager@example.com</div>
            </div>
            <button style={{marginLeft: 'auto', background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer'}}>
                <LogOut size={16} />
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

    </div>
  );
}