import React from 'react';
import { FormRow } from './FormRow'; // Tận dụng component có sẵn

const ProfileView = ({ profile }) => {
    if (!profile) return <div className="text-gray-500 text-center py-8">Loading profile information...</div>;

    // Helper để render field nhanh
    const Field = ({ label, val, full }) => (
        <FormRow label={label} full={full}>
            <div className="p-2 bg-gray-100 border rounded text-gray-700 min-h-[40px] flex items-center">
                {val || "—"}
            </div>
        </FormRow>
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <h3 className="col-span-full text-lg font-bold text-blue-600 border-b pb-2 mt-2">General Information</h3>
            <Field label="employee_code" val={profile.employee_code} />
            <Field label="full_name" val={profile.full_name} />
            <Field label="date_of_birth" val={profile.date_of_birth} />
            <Field label="gender" val={profile.gender} />
            <Field label="department_name" val={profile.department_name} />
            <Field label="job_title" val={profile.job_title} />

            <h3 className="col-span-full text-lg font-bold text-blue-600 border-b pb-2 mt-4">Contact Information</h3>
            <Field label="company_email" val={profile.company_email} />
            <Field label="personal_email" val={profile.personal_email} />
            <Field label="phone_number" val={profile.phone_number} />
            <Field label="current_address" val={profile.current_address} full={true} />

            <h3 className="col-span-full text-lg font-bold text-blue-600 border-b pb-2 mt-4">Security & Banking Information</h3>
            <Field label="citizen_id" val={profile.citizen_id} />
            <Field label="personal_tax_code" val={profile.personal_tax_code} />
            <Field label="bank_account" val={profile.bank_account} full={true} />
        </div>
    );
};

export default ProfileView;