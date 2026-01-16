import React, { useState } from "react"; // ✅ Đã thêm useState
import { FormRow } from "../../common/FormRow.jsx";
import StatusBadge from "../../common/StatusBadge.jsx";

// Component con: Hiển thị trường thông tin (có hỗ trợ che/hiện)
const SensitiveField = ({ label, val, isSensitive = false, full = false }) => {
  const [isVisible, setIsVisible] = useState(!isSensitive);

  const displayValue = () => {
    if (val === undefined || val === null || val === "") return "—";
    
    // Nếu val là React Element (ví dụ danh sách sđt)
    if (React.isValidElement(val)) {
      // Nếu sensitive và hidden, che dấu toàn bộ element
      if (isSensitive && !isVisible) {
        return "••••••••••••";
      }
      return val;
    }
    
    // String case
    if (isVisible) return val;
    return "••••••••••••";
  };

  return (
    <FormRow label={label} full={full}>
      <div className="relative p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 min-h-[40px] flex items-center justify-between group">
        <span className="truncate pr-8 font-medium">{displayValue()}</span>
        
        {isSensitive && val && (
          <button
            type="button"
            onClick={() => setIsVisible(!isVisible)}
            className="absolute right-3 text-gray-400 hover:text-blue-600 focus:outline-none transition-colors"
            title={isVisible ? "Ẩn thông tin" : "Xem thông tin"}
          >
            {/* Icon mắt đơn giản bằng SVG để không cần cài thư viện ngoài */}
            {isVisible ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            )}
          </button>
        )}
      </div>
    </FormRow>
  );
};

const ProfileView = ({ profile }) => {
  if (!profile)
    return (
      <div className="text-gray-500 text-center py-8 animate-pulse">
        Loading profile information...
      </div>
    );

  // Map giá trị từ DTO
  const employeeCode = profile.employeeCode ?? profile.employee_code;
  const fullName = profile.employeeName ?? profile.full_name;
  const dateOfBirth = profile.dateOfBirth ?? profile.date_of_birth;
  const gender = profile.gender;
  const nationality = profile.nationality;
  const maritalStatus = profile.maritalStatus ?? profile.marital_status;
  const hasChildren = profile.hasChildren ?? profile.has_children;

  const department = profile.departmentName ?? profile.department ?? profile.department_name;
  const jobTitle =
    profile.jobTitle ||
    profile.jobTitleName ||
    profile.position ||
    profile.job_title ||
    profile.JobTitle;
  const directManager = profile.directManagerName ?? profile.directManager ?? profile.direct_manager;
  const employmentType = profile.employmentType ?? profile.employment_type;
  const status = profile.status;

  const companyEmail = profile.companyEmail ?? profile.company_email;
  const personalEmail = profile.personalEmail ?? profile.personal_email;

const phoneNumber = Array.isArray(profile.phoneNumbers) && profile.phoneNumbers.length > 0
    ? (
        <div className="flex flex-col gap-1">
          {profile.phoneNumbers
            .filter((p) => p && p.phoneNumber)
            .map((p, idx) => (
              <span key={idx} className="block">
                {p.phoneNumber}
              </span>
            ))}
        </div>
      )
    : (profile.phone_number || "Chưa cập nhật");

  const currentAddressStr = profile.currentAddress 
    ? (typeof profile.currentAddress === 'object' 
        ? `${profile.currentAddress?.province}, ${profile.currentAddress?.district}` 
        : profile.currentAddress)
    : profile.current_address;

  const birthPlaceStr = profile.birthPlace
    ? (typeof profile.birthPlace === "object"
        ? `${profile.birthPlace?.province || ""}${profile.birthPlace?.province && profile.birthPlace?.district ? ", " : ""}${profile.birthPlace?.district || ""}`.trim() || "—"
        : profile.birthPlace)
    : profile.birthPlaceProvince || profile.birthPlaceDistrict
    ? `${profile.birthPlaceProvince || ""}${profile.birthPlaceProvince && profile.birthPlaceDistrict ? ", " : ""}${profile.birthPlaceDistrict || ""}`
    : "—";

  const citizenId = profile.citizenIdNumber ?? profile.citizen_id ?? profile.citizenId;
  const personalTaxCode = profile.personalTaxCode ?? profile.personal_tax_code;
  const socialInsuranceNumber = profile.socialInsuranceNumber ?? profile.social_insurance_number;

  const bankAccounts = profile.bankAccounts || profile.BankAccounts || [];
  const primaryBank = bankAccounts.find((b) => b.isPrimary) || bankAccounts[0];
  const bankName = primaryBank?.bankName || profile.bankAccount?.bankName || "Chưa cập nhật";
  const accountNumber = primaryBank?.accountNumber || profile.bankAccount?.accountNumber || "Chưa cập nhật";

  const contractType = profile.contractType ?? profile.contract_type;
  const contractStartDate = profile.contractStartDate ?? profile.contract_start_date;
  const contractEndDate = profile.contractEndDate ?? profile.contract_end_date;
  const education = profile.education;

  return (
    <div className="space-y-6">
      {/* Personal Information */}
      <section className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-blue-600 border-b pb-3 mb-4">
          Personal Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SensitiveField label="Employee Code" val={employeeCode} />
          <SensitiveField label="Full Name" val={fullName} />
          <SensitiveField label="Date of Birth" val={dateOfBirth} isSensitive={true} />
          <SensitiveField label="Gender" val={gender} />
          <SensitiveField label="Nationality" val={nationality} />
          <SensitiveField label="Marital Status" val={maritalStatus} />
          <SensitiveField label="Has Children" val={hasChildren ? "Yes" : "No"} />
        </div>
      </section>

      {/* Legal Information - CÓ CHE THÔNG TIN */}
      <section className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-blue-600 border-b pb-3 mb-4">
          Legal Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SensitiveField label="Citizen ID Number" val={citizenId} isSensitive={true} />
          <SensitiveField label="Personal Tax Code" val={personalTaxCode} isSensitive={true} />
          <SensitiveField label="Social Insurance No" val={socialInsuranceNumber} isSensitive={true} />
        </div>
      </section>

      {/* Contact Information */}
      <section className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-blue-600 border-b pb-3 mb-4">
          Contact Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SensitiveField label="Company Email" val={companyEmail} />
          <SensitiveField label="Personal Email" val={personalEmail} />
          <SensitiveField label="Phone Number (Personal)" val={phoneNumber} isSensitive={true}/>
          <SensitiveField label="Current Address" val={currentAddressStr} full={true} />
        </div>
      </section>

      {/* Birth Place */}
      <section className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-blue-600 border-b pb-3 mb-4">
          Birth Place
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SensitiveField label="Birth Place" val={birthPlaceStr} full={true} />
        </div>
      </section>

      {/* Bank Account - CÓ CHE THÔNG TIN */}
      <section className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-blue-600 border-b pb-3 mb-4">
          Bank Account
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SensitiveField label="Bank Name" val={bankName} />
          <SensitiveField label="Account Number" val={accountNumber} isSensitive={true} />
        </div>
      </section>

      {/* Employment Information */}
      <section className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-blue-600 border-b pb-3 mb-4">
          Employment Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SensitiveField label="Department" val={department} />
          <SensitiveField label="Job Title" val={jobTitle} />
          <SensitiveField label="Direct Manager" val={directManager || "—"} />
          <SensitiveField label="Employment Type" val={employmentType} />
          <FormRow label="Status">
            <StatusBadge status={status} />
          </FormRow>
        </div>
      </section>

      {/* Contract Information */}
      <section className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-blue-600 border-b pb-3 mb-4">
          Contract Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SensitiveField label="Contract Type" val={contractType} />
          <SensitiveField label="Contract Start Date" val={contractStartDate} />
          <SensitiveField label="Contract End Date" val={contractEndDate || "—"} />
        </div>
      </section>

      {/* Education */}
      {education && (
        <section className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-blue-600 border-b pb-3 mb-4">
            Education
          </h3>
          <div className="grid grid-cols-1 gap-4">
            <SensitiveField label="Education" val={education} full={true} />
          </div>
        </section>
      )}
    </div>
  );
};

export default ProfileView;