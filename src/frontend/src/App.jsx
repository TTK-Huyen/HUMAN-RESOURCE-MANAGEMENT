import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

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
        <Route path="/" element={<LoginPage />} />
        <Route path="/employee/*" element={<RequireAuth role="EMP"><EmployeeApp /></RequireAuth>} />
        <Route path="/hr/*" element={<HrApp />} />
        <Route path="/manager" element = {<RequireAuth role='MANAGER'><DashboardManager /></RequireAuth>} />
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route path="/test-component" element={<TestPage />} />
      </Routes>
    </Router>
  );
}

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
