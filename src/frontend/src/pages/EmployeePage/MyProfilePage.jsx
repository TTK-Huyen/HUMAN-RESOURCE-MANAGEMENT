// src/pages/employee/MyProfilePage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchEmployeeProfile } from "../../Services/requests";
import ProfileView from "../../components/features/employee/ProfileView";

const CURRENT_EMPLOYEE_CODE = "EMP001";

const MyProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const apiData = await fetchEmployeeProfile(CURRENT_EMPLOYEE_CODE);
        console.log("[MyProfilePage] API data:", apiData);

        // Giữ nguyên field BE trả về + thêm vài alias cho UI
        const mappedProfile = {
          ...apiData,

          // alias cho UI cũ nếu có dùng
          employeeName: apiData.employeeName,
          employeeCode: apiData.employeeCode,

          dob: apiData.dateOfBirth, // alias
          nationality: apiData.nationality,

          citizenId: apiData.citizenIdNumber,
          taxCode: apiData.personalTaxCode,
          socialInsurance: apiData.socialInsuranceNumber,

          departmentName: apiData.department,
          directManagerName: apiData.directManager,
        };

        console.log("[MyProfilePage] mappedProfile:", mappedProfile);

        if (!cancelled) setProfile(mappedProfile);
      } catch (err) {
        console.error("Lỗi tải hồ sơ:", err);
        if (!cancelled) {
          setError(err.message || "Không tải được dữ liệu hồ sơ.");
          setProfile(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <div className="p-6">Đang tải dữ liệu từ hệ thống…</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  if (!profile) {
    return (
      <div className="p-6 text-red-500">
        Không tìm thấy thông tin hồ sơ. Vui lòng kiểm tra lại.
      </div>
    );
  }

  return (
    <div className="p-6 bg-white shadow-md rounded-lg max-w-4xl mx-auto my-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Hồ sơ cá nhân</h1>
        <button
          onClick={() => navigate("/employee/profile/update-request")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
        >
          Gửi yêu cầu cập nhật
        </button>
      </div>
      <ProfileView profile={profile} />
    </div>
  );
};

export default MyProfilePage;
