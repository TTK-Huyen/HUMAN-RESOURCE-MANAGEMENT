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
          <RequireAuth requiredRole="EMP" allowedRoles={['EMP', 'HR', 'MANAGER']}>
            <MainLayout><EmployeeApp /></MainLayout>
          </RequireAuth>
        } />
        
        {/* Route Ví thưởng (Đã sửa lỗi loop) */}
        <Route path="/rewards/my-wallet" element={
          <RequireAuth requiredRole="EMP" allowedRoles={['EMP', 'HR', 'MANAGER']}>
            <MainLayout><MyRewardPage /></MainLayout>
          </RequireAuth>
        } />

        {/* Backwards-compatible route used in some menu configs */}
        <Route path="/employee/rewards" element={
          <RequireAuth requiredRole="EMP" allowedRoles={['EMP', 'HR', 'MANAGER']}>
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

        {/* Admin routes removed - admins redirected to employee profile on login */}
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
  const storedRole = (localStorage.getItem("role") || "").toUpperCase();
  const targetRole = (requiredRole || "").toUpperCase();
  
  // FIX: Use allowedRoles if provided, otherwise strict match
  const rolesAllowed = Array.isArray(allowedRoles)
    ? allowedRoles.map((r) => (r || "").toUpperCase())
    : [targetRole];  // Strict: only exact role match

  console.log("RequireAuth Check:", { token: !!token, storedRole, targetRole, rolesAllowed, allowed: rolesAllowed.includes(storedRole) });

  // ADMIN bypass: administrators have full access to all routes
  if (storedRole === 'ADMIN') {
    console.log('ADMIN bypass - full access granted');
    return children;
  }

  // 1. Chưa đăng nhập -> Về Login
  if (!token) {
    console.log("No token - redirecting to login");
    return <Navigate to="/" replace />;
  }
  
  // 2. Đã đăng nhập nhưng SAI ROLE -> Redirect sang dashboard của họ (KHÔNG xóa token)
  if (rolesAllowed.length && !rolesAllowed.includes(storedRole)) {
    console.warn(`Chặn truy cập. Cần: ${rolesAllowed.join(' hoặc ')}, Có: ${storedRole}`);
    
    // Redirect sang dashboard của user đó - KHÔNG xóa token
    if (storedRole === 'MANAGER') return <Navigate to="/manager" replace />;
    if (storedRole === 'HR') return <Navigate to="/hr" replace />;
    if (storedRole === 'EMP') return <Navigate to="/employee" replace />;
    
    // Role lạ hoàn toàn -> logout
    console.error("Unknown role - clearing storage");
    localStorage.clear();
    return <Navigate to="/" replace />;
  }

  // 3. Hợp lệ -> Cho vào
  console.log("Auth check passed");
  return children;
}

export default App;