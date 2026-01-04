import React from "react";
import { useNavigate } from "react-router-dom";
import { Building2 } from "lucide-react"; 
import AuthForm from "../../../components/features/auth/AuthForm.jsx"; 
import { login } from "../../../Services/users.js";

export default function LoginPage() {
  const navigate = useNavigate();

  const handleLogin = async (data) => {
    try {
      const res = await login(data); 
      const { token, role, employeeCode, employeeName } = res;

      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      localStorage.setItem("employeeCode", employeeCode);
      localStorage.setItem("employeeName", employeeName);

      if (role === "EMP") navigate("/employee");
      else if (role === "HR") navigate("/hr");
      else if (role === "MANAGER") navigate("/manager");
      else navigate("/");
    } catch (err) {
      alert(err.response?.data?.message || "Đăng nhập thất bại");
    }
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
            <div className="welcome-text">Hệ thống quản trị nhân sự</div>
          </div>

          <AuthForm
            submitLabel="Đăng nhập"
            fields={[
              { name: "username", label: "Tài khoản", type: "text", required: true, placeholder: "Nhập tài khoản..." },
              { name: "password", label: "Mật khẩu", type: "password", required: true, placeholder: "Nhập mật khẩu..." },
            ]}
            onSubmit={handleLogin}
          />

          {/* 👇 Cập nhật Box hiển thị tài khoản Demo */}
          <div className="demo-box">
            <div style={{textAlign: 'center', fontWeight: 'bold', marginBottom: 8, color: '#2563eb'}}>
               TÀI KHOẢN DEMO
            </div>
            <div className="demo-row">
              <span className="demo-label">Employee:</span>
              <span><span className="demo-code">employee</span> / <span className="demo-code">Emp123!@</span></span>
            </div>
            <div className="demo-row">
              <span className="demo-label">HR Admin:</span>
              <span><span className="demo-code">hr</span> / <span className="demo-code">Hr123!@#</span></span>
            </div>
            <div className="demo-row">
              <span className="demo-label">Manager:</span>
              <span><span className="demo-code">manager</span> / <span className="demo-code">Mgr123!@#</span></span>
            </div>
          </div>

          
        </div>
      </div>
    </>
  );
}