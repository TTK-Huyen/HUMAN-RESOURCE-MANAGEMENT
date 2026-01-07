import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";

// Components
import MainLayout from "./components/layout/Mainlayout.jsx";
import EmployeeApp from "./pages/EmployeePage/EmployeeApp";
import HrApp from "./pages/HRPage/HrApp";
import LoginPage from "./pages/AuthPage/LoginPage/LoginPage";
import DashboardManager from "./pages/ManagerPage/PendingApprovals";
import TestPage from './components/TestComponent';

// Reward Pages
import MyRewardPage from './pages/EmployeePage/RewardPage/MyRewardPage';
import ManagerGivePointsPage from './pages/ManagerPage/Reward/ManagerGivePointsPage';
import AutoAllocationConfig from './pages/HRPage/Reward/AutoAllocationConfig';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />

        {/* --- EMPLOYEE ROUTES --- */}
        <Route path="/employee/*" element={
          <RequireAuth requiredRole="EMP">
            <MainLayout><EmployeeApp /></MainLayout>
          </RequireAuth>
        } />
        
        {/* Route Ví thưởng (Đã sửa lỗi loop) */}
        <Route path="/rewards/my-wallet" element={
          <RequireAuth requiredRole="EMP">
            <MainLayout><MyRewardPage /></MainLayout>
          </RequireAuth>
        } />

        {/* --- HR ROUTES --- */}
        <Route path="/hr/*" element={
          <RequireAuth requiredRole="HR">
            <MainLayout><HrApp /></MainLayout>
          </RequireAuth>
        } />
        <Route path="/hr/rewards/config" element={
          <RequireAuth requiredRole="HR">
            <MainLayout><AutoAllocationConfig /></MainLayout>
          </RequireAuth>
        } />

        {/* --- MANAGER ROUTES --- */}
        <Route path="/manager/*" element={
          <RequireAuth requiredRole="MANAGER">
            <MainLayout><DashboardManager /></MainLayout>
          </RequireAuth>
        } />
        <Route path="/manager/rewards/give" element={
          <RequireAuth requiredRole="MANAGER">
            <MainLayout><ManagerGivePointsPage /></MainLayout>
          </RequireAuth>
        } />

        <Route path="/test-component" element={<TestPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

// --- COMPONENT CHẶN VÒNG LẶP ---
function RequireAuth({ requiredRole, allowedRoles, children }) {
  const token = localStorage.getItem("token");
  // Lấy role và viết hoa để so sánh chuẩn (tránh lỗi emp != EMP)
  const storedRole = (localStorage.getItem("role") || "").toUpperCase();
  const targetRole = (requiredRole || "").toUpperCase();
  const normalizedAllowed = Array.isArray(allowedRoles)
    ? allowedRoles.map((r) => (r || "").toUpperCase())
    : [];

  // Cho phép kế thừa quyền: EMP có thể truy cập bởi EMP, HR, MANAGER
  const rolesAllowed = normalizedAllowed.length > 0
    ? normalizedAllowed
    : (targetRole === 'EMP' ? ['EMP', 'HR', 'MANAGER'] : [targetRole]);

  // 1. Chưa đăng nhập -> Về Login
  if (!token) {
    return <Navigate to="/" replace />;
  }
  
  // 2. Đã đăng nhập nhưng SAI ROLE -> KHÔNG về Login, mà về Dashboard của họ
  // (Đây là chỗ chặn đứng vòng lặp)
  if (rolesAllowed.length && !rolesAllowed.includes(storedRole)) {
    console.warn(`⛔ Chặn truy cập. Cần: ${targetRole}, Có: ${storedRole}`);
    
    if (storedRole === 'MANAGER') return <Navigate to="/manager" replace />;
    if (storedRole === 'HR') return <Navigate to="/hr" replace />;
    if (storedRole === 'EMP') return <Navigate to="/employee" replace />;
    
    // Role lạ -> Xóa token cho đăng nhập lại
    localStorage.clear();
    return <Navigate to="/" replace />;
  }

  // 3. Hợp lệ -> Cho vào
  return children;
}

export default App;