import React from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { FileText, Users, UserPlus, Upload, CheckSquare } from "lucide-react";
import Layout2 from "../../components/layout/Layout2.jsx";
import HrProfileUpdateRequestListPage from "./HrProfileUpdateRequestListPage.jsx";
import HrProfileUpdateRequestDetailPage from "./HrProfileUpdateRequestDetailPage.jsx";
import HRDirectoryPage from "./HRDirectoryPage.jsx";
import HRAddEmployeePage from "./HRAddEmployeePage.jsx";
import HRUploadExcelPage from "./HRUploadExcelPage.jsx";
import HRViewProfilePage from "./HRViewProfilePage.jsx";


const HrAppContent = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Định nghĩa menu map với các route
  const menuItems = [
    { to: "/hr/profile-requests", label: "Yêu cầu hồ sơ", icon: <FileText size={18} /> },
    { to: "/hr/directory", label: "Danh bạ nhân viên", icon: <Users size={18} /> },
    { to: "/hr/directory/add", label: "Thêm nhân viên", icon: <UserPlus size={18} /> },
    { to: "/hr/directory/import", label: "Import Excel", icon: <Upload size={18} /> },
    { to: "/hr/approvals", label: "Phê duyệt", icon: <CheckSquare size={18} /> },
  ];

  return (
    <Layout2
      title="HR Console"
      subtitle="Manage employee data"
      menuItems={menuItems}
      activePath={location.pathname}
      onNavigate={(path) => navigate(path)}
      userInfo={{ 
        name: localStorage.getItem('employeeName') || 'HR Admin', 
        code: localStorage.getItem('employeeCode') || 'HR01' 
      }}
      onLogout={() => {
        localStorage.clear();
        alert("Đăng xuất thành công!");
        // Quay về trang chủ hoặc login (giả định route gốc là /)
        navigate("/"); 
      }}
    >
      <Routes>
        <Route path="/" element={<Navigate to="profile-requests" replace />} />
        <Route path="profile-requests" element={<HrProfileUpdateRequestListPage />} />
        <Route path="profile-requests/:requestId" element={<HrProfileUpdateRequestDetailPage />} />
        
        <Route path="directory" element={<HRDirectoryPage />} />
        <Route path="directory/add" element={<HRAddEmployeePage />} />
        <Route path="directory/import" element={<HRUploadExcelPage />} />
        <Route path="profile/:employeeCode" element={<HRViewProfilePage />} />
 
        
        <Route path="*" element={<Navigate to="profile-requests" replace />} />
      </Routes>
    </Layout2>
  );
};

export default function HrApp() {
  return <HrAppContent />;
}