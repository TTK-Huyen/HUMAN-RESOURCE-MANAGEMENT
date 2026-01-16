// HRViewProfilePage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchEmployeeProfile } from "../../Services/requests";
import ProfileView from "../../components/features/employee/ProfileView";

export default function HRViewProfilePage() {
  const { employeeCode: paramCode } = useParams();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const code = paramCode || localStorage.getItem("employeeCode");
    
    if (!code) {
      setError("Employee code not found");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    fetchEmployeeProfile(code)
      .then(apiData => {
        if (apiData) {
          console.log("[HRViewProfilePage] Raw API data:", apiData);
          // Normalize phone numbers list
          const normalizedPhoneNumbers = (apiData.phoneNumbers || apiData.PhoneNumbers || apiData.phone_number || [])
            .map((p) => ({
              phoneNumber: p?.phoneNumber || p?.PhoneNumber || p?.number || p,
              description: p?.description || p?.Description || "",
            }))
            .filter((p) => p.phoneNumber);

          console.log("[HRViewProfilePage] Normalized phoneNumbers:", normalizedPhoneNumbers);
          console.log("[HRViewProfilePage] BankAccounts:", apiData.bankAccounts);


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
            phoneNumbers: normalizedPhoneNumbers,
            phoneNumberSingle: apiData.phoneNumber || apiData.phone_number || "",

            // Address Information
            birthPlace:
              apiData.birthPlace ||
              apiData.birth_place || {
                province:
                  apiData.birthPlaceProvince ||
                  apiData.birth_place_province ||
                  "",
                district:
                  apiData.birthPlaceDistrict ||
                  apiData.birth_place_district ||
                  "",
              },
            currentAddress: apiData.currentAddress || apiData.current_address || { province: "", district: "" },

            // Bank Account
            bankAccounts: apiData.bankAccounts || apiData.bank_accounts || [],
            bankAccount:
              apiData.bankAccount ||
              apiData.bank_accounts?.[0] ||
              (apiData.bankAccounts && apiData.bankAccounts[0]) ||
              { bankName: "", accountNumber: "" },

            // Employment Information
            jobTitleId: apiData.jobTitleId || apiData.job_title_id || "",
            directManagerId: apiData.directManagerId || apiData.direct_manager_id || "",
            employmentType: apiData.employmentType || apiData.employment_type || "",
            contractType: apiData.contractType || apiData.contract_type || "",
            contractStartDate: apiData.contractStartDate || apiData.contract_start_date || "",
            contractEndDate: apiData.contractEndDate || apiData.contract_end_date || "",

            // Display names
            departmentName: apiData.department || apiData.department_name || "",
            directManagerName: apiData.directManager || apiData.manager_name || "",
            jobTitle:
              apiData.jobTitle ||
              apiData.JobTitle ||
              apiData.job_title ||
              apiData.position ||
              apiData.position_name ||
              "",
            status: apiData.status || "",
            education: apiData.education || "",
          };

          console.log("[HRViewProfilePage] Mapped profile:", mappedProfile);
          setProfile(mappedProfile);
          setError(null);
        } else {
          setError("Employee not found");
        }
      })
      .catch(err => {
        console.error("Error loading profile:", err);
        setError(err.response?.data?.message || "Failed to load profile");
      })
      .finally(() => setLoading(false));
  }, [paramCode]);

  if (error) return <div className="p-6 text-red-500">❌ {error}</div>;
  if (loading) return <div className="p-6">Loading...</div>;
  if (!profile) return <div className="p-6 text-red-500">❌ Profile data not found</div>;

  return (
    <div className="p-6 bg-white shadow-md rounded-lg max-w-4xl mx-auto my-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Employee Profile</h1>
      </div>
      <ProfileView profile={profile} />
    </div>
  );
}
