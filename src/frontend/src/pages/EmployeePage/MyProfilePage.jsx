// src/pages/employee/MyProfilePage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchEmployeeProfile } from "../../Services/requests";
import ProfileView from "../../components/features/employee/ProfileView";

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

      // ✅ FIX: Read from localStorage INSIDE useEffect, not top level
      const STORED_EMPLOYEE_CODE =
        localStorage.getItem("employeeCode") || localStorage.getItem("employee_code") || "";

      if (!STORED_EMPLOYEE_CODE) {
        setError("Employee code not found in session. Please log in.");
        setLoading(false);
        return;
      }

      try {
        const apiData = await fetchEmployeeProfile(STORED_EMPLOYEE_CODE);
        console.log("[MyProfilePage] API data:", apiData);

        // ✅ Align field names with AddEmployee page
        const mappedProfile = {
          // Personal Information
          employeeName: apiData.employeeName || apiData.full_name || "",
          employeeCode: apiData.employeeCode || apiData.employee_code || "",
          dateOfBirth: apiData.dateOfBirth || apiData.date_of_birth || "",
          gender: apiData.gender || "",
          nationality: apiData.nationality || "",
          maritalStatus: apiData.maritalStatus || apiData.marital_status || "",
          hasChildren: apiData.hasChildren || apiData.has_children || false,

          // Legal Information
          citizenIdNumber: apiData.citizenIdNumber || apiData.citizen_id || "",
          personalTaxCode: apiData.personalTaxCode || apiData.personal_tax_code || "",
          socialInsuranceNumber: apiData.socialInsuranceNumber || apiData.social_insurance_no || "",

          // Contact Information
          personalEmail: apiData.personalEmail || apiData.personal_email || "",
          companyEmail: apiData.companyEmail || apiData.company_email || "",
          phoneNumbers: apiData.phoneNumbers || apiData.phone_number || [],

          // Address Information
          birthPlace: apiData.birthPlace || { province: "", district: "" },
          currentAddress: apiData.currentAddress || apiData.current_address || { province: "", district: "" },

          // Bank Account
          bankAccount: apiData.bankAccount || apiData.bank_accounts || { bankName: "", accountNumber: "" },

          // Employment Information
          departmentId: apiData.departmentId || apiData.department_id || "",
          jobTitleId: apiData.jobTitleId || apiData.job_title_id || "",
          directManagerId: apiData.directManagerId || apiData.direct_manager_id || "",
          employmentType: apiData.employmentType || apiData.employment_type || "",
          contractType: apiData.contractType || apiData.contract_type || "",
          contractStartDate: apiData.contractStartDate || apiData.contract_start_date || "",
          contractEndDate: apiData.contractEndDate || apiData.contract_end_date || "",

          // Display names
          departmentName: apiData.department || apiData.department_name || "",
          directManagerName: apiData.directManager || apiData.manager_name || "",
          position: apiData.position || apiData.position_name || "",
          status: apiData.status || "",
          education: apiData.education || "",
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
    return <div className="p-6">Loading data from system…</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  if (!profile) {
    return (
      <div className="p-6 text-red-500">
        Profile information not found. Please check.
      </div>
    );
  }

  return (
    <div className="p-6 bg-white shadow-md rounded-lg max-w-4xl mx-auto my-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Personal Profile</h1>
        <button
          onClick={() => navigate("/employee/profile/update-request")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
        >
          Request Update
        </button>
      </div>
      <ProfileView profile={profile} />
    </div>
  );
};

export default MyProfilePage;
