import React from "react";
import { FormRow } from "../../common/FormRow.jsx";

const ProfileView = ({ profile }) => {
  if (!profile)
    return (
      <div className="text-gray-500 text-center py-8">
        Loading profile information...
      </div>
    );

  // Helper render field
  const Field = ({ label, val, full }) => (
    <FormRow label={label} full={full}>
      <div className="p-2 bg-gray-100 border rounded text-gray-700 min-h-[40px] flex items-center">
        {val !== undefined && val !== null && val !== "" ? val : "—"}
      </div>
    </FormRow>
  );

  // Map giá trị từ DTO (camelCase) + fallback snake_case cũ
  const employeeCode = profile.employeeCode ?? profile.employee_code;
  const fullName = profile.employeeName ?? profile.full_name;
  const dateOfBirth = profile.dateOfBirth ?? profile.date_of_birth;
  const gender = profile.gender;

  const department = profile.department ?? profile.department_name;
  const jobTitle = profile.jobTitle ?? profile.job_title;

  const companyEmail = profile.companyEmail ?? profile.company_email;
  const personalEmail = profile.personalEmail ?? profile.personal_email;

  const phoneNumber = Array.isArray(profile.phoneNumbers) && profile.phoneNumbers.length > 0
    ? profile.phoneNumbers
        .filter((p) => p && p.phoneNumber)
        .map((p) => `${p.phoneNumber}${p.description ? ` (${p.description})` : ""}`)
        .join(", ")
    : profile.phone_number;

  const currentAddress =
    profile.currentAddress ?? profile.current_address;

  const citizenId =
    profile.citizenIdNumber ?? profile.citizen_id ?? profile.citizenId;
  const personalTaxCode =
    profile.personalTaxCode ?? profile.personal_tax_code;
  const socialInsuranceNumber =
    profile.socialInsuranceNumber ?? profile.social_insurance_number;

  const bankAccount = Array.isArray(profile.bankAccounts) && profile.bankAccounts.length > 0
    ? profile.bankAccounts
        .filter((b) => b && (b.accountNumber || b.bankName))
        .map((b) => {
          const parts = [b.bankName, b.accountNumber, b.accountHolderName].filter(Boolean);
          const main = parts.join(" - ");
          return b.isPrimary ? `${main} [Primary]` : main;
        })
        .join("; ")
    : profile.bank_account;

  const nationality = profile.nationality;
  const employmentType =
    profile.employmentType ?? profile.employment_type;
  const contractType =
    profile.contractType ?? profile.contract_type;
  const contractStartDate =
    profile.contractStartDate ?? profile.contract_start_date;
  const contractEndDate =
    profile.contractEndDate ?? profile.contract_end_date;
  const directManager =
    profile.directManager ?? profile.direct_manager;
  const status = profile.status;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* General */}
      <h3 className="col-span-full text-lg font-bold text-blue-600 border-b pb-2 mt-2">
        General Information
      </h3>
      <Field label="employee_code" val={employeeCode} />
      <Field label="full_name" val={fullName} />
      <Field label="date_of_birth" val={dateOfBirth} />
      <Field label="gender" val={gender} />
      <Field label="nationality" val={nationality} />
      <Field label="department" val={department} />
      <Field label="job_title" val={jobTitle} />
      <Field label="employment_type" val={employmentType} />
      <Field label="status" val={status} />

      {/* Contract */}
      <h3 className="col-span-full text-lg font-bold text-blue-600 border-b pb-2 mt-4">
        Contract Information
      </h3>
      <Field label="contract_type" val={contractType} />
      <Field label="contract_start_date" val={contractStartDate} />
      <Field label="contract_end_date" val={contractEndDate} />
      <Field label="direct_manager" val={directManager} />

      {/* Contact */}
      <h3 className="col-span-full text-lg font-bold text-blue-600 border-b pb-2 mt-4">
        Contact Information
      </h3>
      <Field label="company_email" val={companyEmail} />
      <Field label="personal_email" val={personalEmail} />
      <Field label="phone_number" val={phoneNumber} />
      <Field
        label="current_address"
        val={currentAddress}
        full={true}
      />

      {/* Security & Banking */}
      <h3 className="col-span-full text-lg font-bold text-blue-600 border-b pb-2 mt-4">
        Security & Banking Information
      </h3>
      <Field label="citizen_id" val={citizenId} />
      <Field label="personal_tax_code" val={personalTaxCode} />
      <Field
        label="social_insurance_number"
        val={socialInsuranceNumber}
      />
      <Field label="bank_account" val={bankAccount} full={true} />
    </div>
  );
};

export default ProfileView;
