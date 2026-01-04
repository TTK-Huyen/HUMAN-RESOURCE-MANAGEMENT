import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// --- IMPORT COMPONENTS ---
import MainLayout from "./components/layout/Mainlayout.jsx"; // Import Layout chung

import EmployeeApp from "./pages/EmployeePage/EmployeeApp";
import HrApp from "./pages/HRPage/HrApp";
import LoginPage from "./pages/AuthPage/LoginPage/LoginPage";
import DashboardManager from "./pages/ManagerPage/PendingApprovals";
import TestPage from './components/TestComponent';

//import Layout from './components/Layout';
function App() {
  return (
    <Router>
      <Routes>
        {/* 1. Trang Login (Không có Layout) */}
        <Route path="/" element={<LoginPage />} />

        {/* 2. Khu vực Employee */}
        <Route path="/employee/*" element={
          <RequireAuth role="EMP">
            {/* Bọc MainLayout để có Sidebar/Header */}
            <MainLayout title="Cổng nhân viên" subtitle="Employee Workspace">
              <EmployeeApp />
            </MainLayout>
          </RequireAuth>
        } />

        {/* 3. Khu vực HR */}
        <Route path="/hr/*" element={
          // Bạn có thể thêm RequireAuth role="HR" vào đây nếu cần
          <MainLayout title="Quản trị hệ thống" subtitle="HR Administration">
            <HrApp />
          </MainLayout>
        } />

        {/* 4. Khu vực Manager */}
        <Route path="/manager" element={
          <RequireAuth role='MANAGER'>
            <MainLayout title="Bảng điều khiển" subtitle="Manager Console">
              <DashboardManager />
            </MainLayout>
          </RequireAuth>
        } />

        {/* 5. Trang Test (Dùng Layout để test hiển thị) */}
        <Route path="/test-component" element={
            <MainLayout title="Test Component" subtitle="Debug Mode">
                <TestPage />
            </MainLayout>
        } />

        {/* 6. Trang Test Layout riêng (KHÔNG bọc Layout vì trang này tự quản lý Layout bên trong) */}
        <Route path="/test-layout" element={<LayoutTestPage />} />

        {/* 7. Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route path="/test-component" element={<TestPage />} />
      </Routes>
    </Router>
  );
}

// --- COMPONENT BẢO VỆ ROUTE (Giữ nguyên logic của bạn) ---
function RequireAuth({ role, children }) {
  const token = localStorage.getItem("token");
  const storedRole = localStorage.getItem("role");

  // --- BẮT ĐẦU DEBUG LOG ---
  console.group("🔍 Debug RequireAuth");
  console.log("Đang truy cập route yêu cầu quyền:", role);
  console.log("Token hiện tại:", token ? "Có token" : "Không có token");
  console.log("Role đang lưu trong LocalStorage:", storedRole);

  if (!token) {
    console.error("❌ Thất bại: Không tìm thấy Token -> Chuyển về Login");
    console.groupEnd();
    return <Navigate to="/" replace />;
  }
  
  // Logic kiểm tra Role: Nếu role yêu cầu khác với role đang có -> Chặn
  if (role && storedRole !== role) {
    console.error(`❌ Thất bại: Role không khớp. Cần "${role}" nhưng lại là "${storedRole}" -> Chuyển về Login`);
    console.groupEnd();
    return <Navigate to="/" replace />;
  }

  console.log("✅ Thành công: Hợp lệ -> Cho phép vào trang con");
  console.groupEnd();
  // --- KẾT THÚC DEBUG LOG ---

  return children;
}

export default App;