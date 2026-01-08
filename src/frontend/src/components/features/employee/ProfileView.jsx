import React from "react";
import { FormRow } from "../../common/FormRow.jsx";
import StatusBadge from "../../common/StatusBadge.jsx";

const ProfileView = ({ profile }) => {
  if (!profile)
    return (
      <div className="text-gray-500 text-center py-8">
        Loading profile information...
      </div>
    );

  // Helper render read-only field
  const ReadOnlyField = ({ label, val, full }) => (
    <FormRow label={label} full={full}>
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 min-h-[40px] flex items-center">
        {val !== undefined && val !== null && val !== "" ? val : "—"}
      </div>
    </FormRow>
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
  const jobTitle = profile.position ?? profile.job_title;
  const directManager = profile.directManagerName ?? profile.directManager ?? profile.direct_manager;
  const employmentType = profile.employmentType ?? profile.employment_type;
  const status = profile.status;

  const companyEmail = profile.companyEmail ?? profile.company_email;
  const personalEmail = profile.personalEmail ?? profile.personal_email;

  const phoneNumber = Array.isArray(profile.phoneNumbers) && profile.phoneNumbers.length > 0
    ? profile.phoneNumbers
        .filter((p) => p && p.phoneNumber)
        .map((p) => `${p.phoneNumber}${p.description ? ` (${p.description})` : ""}`)
        .join(", ")
    : profile.phone_number;

  const currentAddressStr = profile.currentAddress 
    ? (typeof profile.currentAddress === 'object' 
        ? `${profile.currentAddress?.province}, ${profile.currentAddress?.district}` 
        : profile.currentAddress)
    : profile.current_address;

  const birthPlaceStr = profile.birthPlace
    ? `${profile.birthPlace?.province}, ${profile.birthPlace?.district}`
    : "—";

  const citizenId = profile.citizenIdNumber ?? profile.citizen_id ?? profile.citizenId;
  const personalTaxCode = profile.personalTaxCode ?? profile.personal_tax_code;
  const socialInsuranceNumber = profile.socialInsuranceNumber ?? profile.social_insurance_number;

  const bankName = profile.bankAccount?.bankName || "—";
  const accountNumber = profile.bankAccount?.accountNumber || "—";

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
          <ReadOnlyField label="Employee Code" val={employeeCode} />
          <ReadOnlyField label="Full Name" val={fullName} />
          <ReadOnlyField label="Date of Birth" val={dateOfBirth} />
          <ReadOnlyField label="Gender" val={gender} />
          <ReadOnlyField label="Nationality" val={nationality} />
          <ReadOnlyField label="Marital Status" val={maritalStatus} />
          <ReadOnlyField label="Has Children" val={hasChildren ? "Yes" : "No"} />
        </div>
      </section>

      {/* Legal Information */}
      <section className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-blue-600 border-b pb-3 mb-4">
          Legal Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ReadOnlyField label="Citizen ID Number" val={citizenId} />
          <ReadOnlyField label="Personal Tax Code" val={personalTaxCode} />
          <ReadOnlyField label="Social Insurance Number" val={socialInsuranceNumber} />
        </div>
      </section>

      {/* Contact Information */}
      <section className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-blue-600 border-b pb-3 mb-4">
          Contact Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ReadOnlyField label="Company Email" val={companyEmail} />
          <ReadOnlyField label="Personal Email" val={personalEmail} />
          <ReadOnlyField label="Phone Numbers" val={phoneNumber} />
          <ReadOnlyField label="Current Address" val={currentAddressStr} full={true} />
        </div>
      </section>

      {/* Birth Place */}
      <section className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-blue-600 border-b pb-3 mb-4">
          Birth Place
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ReadOnlyField label="Birth Place" val={birthPlaceStr} full={true} />
        </div>
      </section>

      {/* Bank Account */}
      <section className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-blue-600 border-b pb-3 mb-4">
          Bank Account
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ReadOnlyField label="Bank Name" val={bankName} />
          <ReadOnlyField label="Account Number" val={accountNumber} />
        </div>
      </section>

      {/* Employment Information */}
      <section className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-blue-600 border-b pb-3 mb-4">
          Employment Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ReadOnlyField label="Department" val={department} />
          <ReadOnlyField label="Job Title" val={jobTitle} />
          <ReadOnlyField label="Direct Manager" val={directManager || "—"} />
          <ReadOnlyField label="Employment Type" val={employmentType} />
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
          <ReadOnlyField label="Contract Type" val={contractType} />
          <ReadOnlyField label="Contract Start Date" val={contractStartDate} />
          <ReadOnlyField label="Contract End Date" val={contractEndDate || "—"} />
        </div>
      </section>

      {/* Education */}
      {education && (
        <section className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-blue-600 border-b pb-3 mb-4">
            Education
          </h3>
          <div className="grid grid-cols-1 gap-4">
            <ReadOnlyField label="Education" val={education} full={true} />
          </div>
        </section>
      )}
    </div>
  );
};

export default ProfileView;
