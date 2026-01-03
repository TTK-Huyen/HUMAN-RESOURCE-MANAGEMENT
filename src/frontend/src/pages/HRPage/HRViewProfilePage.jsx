// HRViewProfilePage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FormRow } from "../../components/common/FormRow";
import "../../Services/employees.js"
import { HRService } from "../../Services/employees.js";

export default function HRViewProfilePage() {
  const { employeeCode } = useParams();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    HRService.fetchEmployeeProfileByCode(employeeCode).then(setProfile);
  }, [employeeCode]);

  if (!profile) return <p>Loading...</p>;

  return (
    <div className="card fade-in-up">
      <div className="card-header">
        <h2>Employee Profile: {profile.full_name}</h2>
        <p>Code: {profile.employee_code}</p>
      </div>
      <div className="card-body">
        <div className="form-grid">
          <FormRow label="Department">{profile.department_name}</FormRow>
          <FormRow label="Position">{profile.position_name}</FormRow>
          <FormRow label="Email">{profile.company_email}</FormRow>
          <FormRow label="Phone">{profile.phone_number}</FormRow>
          <FormRow label="Status">{profile.status}</FormRow>
          <FormRow label="Education">{profile.education}</FormRow>
        </div>
      </div>
    </div>
  );
}
