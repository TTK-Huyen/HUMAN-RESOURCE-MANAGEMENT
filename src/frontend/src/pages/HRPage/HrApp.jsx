import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// --- IMPORT CÁC TRANG CON (SUB-PAGES) ---
// Đảm bảo bạn đã tạo các file này trong cùng thư mục hoặc chỉnh đường dẫn import cho đúng
import HrProfileUpdateRequestListPage from "./HrProfileUpdateRequestListPage.jsx";
import HrProfileUpdateRequestDetailPage from "./HrProfileUpdateRequestDetailPage.jsx";
import HRDirectoryPage from "./HRDirectoryPage.jsx";
import HRAddEmployeePage from "./HRAddEmployeePage.jsx";
import HRUploadExcelPage from "./HRUploadExcelPage.jsx";
import HRViewProfilePage from "./HRViewProfilePage.jsx";
import RedemptionRequests from "./Reward/RedemptionRequests";
import HRAddCampaignPage from "./HRAddCampaignPage.jsx";
import HRCampaignListPage from "./HRCampaignListPage.jsx";
import CampaignDetail from "../EmployeePage/Campaigns/CampaignDetail.jsx";

export default function HrApp() {
  return (
    <Routes>
      {/* ✅ 1. ROUTE MẶC ĐỊNH (INDEX)
        Khi vào /hr -> Chuyển hướng ngay đến /hr/profile-requests
        Dùng đường dẫn tuyệt đối "/" ở đầu để tránh lỗi đệ quy.
      */}
      <Route index element={<Navigate to="/hr/profile-requests" replace />} />

      {/* ✅ 2. NHÓM QUẢN LÝ YÊU CẦU HỒ SƠ 
        Path: /hr/profile-requests
      */}
      <Route path="profile-requests" element={<HrProfileUpdateRequestListPage />} />
      <Route path="profile-requests/:requestId" element={<HrProfileUpdateRequestDetailPage />} />
      {/* HR Reward: Pending redemptions (Approve / Reject) */}
      <Route path="rewards/redemptions" element={<RedemptionRequests />} />
      
      {/* ✅ 3. NHÓM QUẢN LÝ DANH BẠ (DIRECTORY)
        Path: /hr/directory...
      */}
      <Route path="directory" element={<HRDirectoryPage />} />
      <Route path="directory/add" element={<HRAddEmployeePage />} />
      <Route path="directory/import" element={<HRUploadExcelPage />} />
      
      {/* ✅ 4. XEM CHI TIẾT HỒ SƠ NHÂN VIÊN
        Path: /hr/profile/:employeeCode
      */}
      <Route path="profile/:employeeCode" element={<HRViewProfilePage />} />
      
      {/* ✅ 5. FALLBACK ROUTE (TRANG 404 CỦA HR)
        Nếu nhập sai đường dẫn con (ví dụ /hr/xyz123) -> Chuyển về trang danh sách yêu cầu.
        QUAN TRỌNG: Phải dùng "/hr/profile-requests" (tuyệt đối) chứ không dùng "profile-requests" (tương đối).
      */}
      {/* ✅ NHÓM QUẢN LÝ CAMPAIGN */}
      <Route path="campaigns/add" element={<HRAddCampaignPage />} />
      <Route path="campaigns" element={<HRCampaignListPage />} />
      <Route path="campaigns/:id" element={<CampaignDetail />} />

      <Route path="*" element={<Navigate to="/hr/profile-requests" replace />} />
    </Routes>
  );
}