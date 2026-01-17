import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2 } from "lucide-react"; 
import AuthForm from "../../../components/features/auth/AuthForm.jsx"; 
import { login } from "../../../Services/users.js";

export default function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: "", password: "" });

  const handleLogin = async (data) => {
    try {
      const res = await login(data); 
      const { token, role, employeeCode, employeeName, employeeId } = res;

      console.log("Login Response:", { token, role, employeeCode, employeeName, employeeId });

      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("employeeCode");
      localStorage.removeItem("employeeName");
      localStorage.removeItem("employeeId");

      // Set new data
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      localStorage.setItem("employeeCode", employeeCode);
      localStorage.setItem("employeeName", employeeName);
      localStorage.setItem("employeeId", employeeId);

      // VERIFY data was saved
      const savedToken = localStorage.getItem("token");
      const savedCode = localStorage.getItem("employeeCode");
      console.log("Saved to localStorage - Token:", !!savedToken, "Code:", savedCode);

      if (!savedToken || !savedCode) {
        alert("Failed to save login data. Please try again.");
        return;
      }

      console.log("Login success - Role:", role);

      // Chuyển hướng dựa vào role - không phân biệt chữ hoa/thường
      const normalizedRole = role?.trim().toUpperCase();
      setTimeout(() => {
        const finalToken = localStorage.getItem("token");
        if (!finalToken) {
          console.error("Token disappeared!");
          window.location.href = "/login";
          return;
        }
        
        if (normalizedRole === "EMP") {
          navigate("/employee");
        } else if (normalizedRole === "HR") {
          navigate("/hr");
        } else if (normalizedRole === "MANAGER") {
          navigate("/manager");
        } else if (normalizedRole === "ADMIN") {
          navigate("/employee/profile");
        } else {
          console.warn("Unknown role:", role);
          navigate("/");
        }
      }, 300);
    } catch (err) {
      console.error("Login error:", err);
      alert(err.response?.data?.message || "Login failed");
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleLogin(formData);
  };

  // Demo accounts (from DataSeeder)
  const demoAccounts = [
    // ===== ADMIN =====
    { role: "1. Admin", username: "admin"},
    // ===== MANAGERS (4 tài khoản) =====
    { role: "2. Manager", username: "EMP001"},
    
    // ===== HR SPECIALISTS (4 tài khoản) =====
    { role: "3. HR", username: "EMP005"},
    
    // ===== EMPLOYEES - IT TEAM (5 tài khoản) =====
    { role: "4. Employee", username: "EMP009"}
    
    
  ];

  const handleQuickLogin = (account) => {
    setFormData({ username: account.username, password: account.password });
  };

  const pageStyles = `
    .login-wrapper {
      min-height: 100vh;
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      background-image: url('https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2301&auto=format&fit=crop');
      background-size: cover;
      background-position: center;
      position: relative;
      font-family: 'Inter', -apple-system, sans-serif;
    }
    .bg-overlay {
      position: absolute;
      inset: 0;
      background: rgba(15, 23, 42, 0.65);
      backdrop-filter: blur(4px);
    }
    .login-card {
      position: relative;
      z-index: 10;
      background: white;
      width: 100%;
      max-width: 440px;
      padding: 40px;
      border-radius: 16px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      animation: slideUp 0.4s ease-out;
    }
    .card-header { text-align: center; margin-bottom: 30px; }
    .brand-logo {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      font-weight: 800;
      font-size: 1.5rem;
      color: #2563eb;
      margin-bottom: 8px;
    }
    .welcome-text { color: #64748b; font-size: 0.95rem; }
    
    /* Box Demo Credentials Mới */
    .demo-box {
      margin-top: 24px;
      padding: 16px;
      background: #f1f5f9;
      border: 1px dashed #cbd5e1;
      border-radius: 8px;
      font-size: 0.85rem;
      color: #334155;
      line-height: 1.6;
    }
    .demo-row { display: flex; justify-content: space-between; margin-bottom: 4px; }
    .demo-label { font-weight: 600; color: #475569; }
    .demo-code { 
      background: #e2e8f0; padding: 2px 6px; border-radius: 4px; 
      font-family: monospace; font-weight: bold; color: #0f172a;
    }
    
    /* Danh sách tài khoản */
    .demo-accounts-section {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
    }
    .demo-accounts-title {
      text-align: center;
      font-weight: 700;
      color: #2563eb;
      margin-bottom: 12px;
      font-size: 0.9rem;
    }
    .demo-account-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 10px;
      margin-bottom: 6px;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 0.85rem;
    }
    .demo-account-item:hover {
      background: #dbeafe;
      border-color: #2563eb;
      box-shadow: 0 2px 8px rgba(37, 99, 235, 0.2);
    }
    .demo-account-info {
      display: flex;
      align-items: center;
      gap: 10px;
      flex: 1;
    }
    .demo-account-role {
      font-weight: 600;
      color: #475569;
      min-width: 90px;
    }
    .demo-account-creds {
      display: flex;
      gap: 8px;
      align-items: center;
    }
    .demo-cred-badge {
      background: #f1f5f9;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: monospace;
      font-weight: bold;
      color: #0f172a;
      font-size: 0.8rem;
    }
    .demo-account-action {
      background: #2563eb;
      color: white;
      border: none;
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }
    .demo-account-action:hover {
      background: #1d4ed8;
    }

    .footer-links {
      margin-top: 24px;
      text-align: center;
      font-size: 0.85rem;
      color: #94a3b8;
    }
    .footer-links a { color: #2563eb; text-decoration: none; font-weight: 500; }
    
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;

  return (
    <>
      <style>{pageStyles}</style>
      <div className="login-wrapper">
        <div className="bg-overlay"></div>

        <div className="login-card">
          <div className="card-header">
            <div className="brand-logo">
              <Building2 size={32} />
              HRM SUITE
            </div>
            <div className="welcome-text">Human Resource Management System</div>
          </div>

            {/* Form Đăng nhập tùy chỉnh */}
            <form onSubmit={handleSubmit} style={{marginTop: '30px'}}>
              <div style={{marginBottom: '20px'}}>
                <label style={{display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569', fontSize: '0.9rem'}}>
                  Username
                </label>
                <input 
                  type="text" 
                  name="username" 
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Enter username..."
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '0.95rem',
                    fontFamily: 'inherit',
                    transition: 'all 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                />
              </div>

              <div style={{marginBottom: '20px'}}>
                <label style={{display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569', fontSize: '0.9rem'}}>
                  Password
                </label>
                <input 
                  type="password" 
                  name="password" 
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter password..."
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '0.95rem',
                    fontFamily: 'inherit',
                    transition: 'all 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                />
              </div>

              <button 
                type="submit"
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.background = '#1d4ed8'}
                onMouseLeave={(e) => e.target.style.background = '#2563eb'}
                >
                Log In
              </button>
            </form>

            {/* Danh sách tài khoản Demo */}
            
        </div>
      </div>
    </>
  );
}