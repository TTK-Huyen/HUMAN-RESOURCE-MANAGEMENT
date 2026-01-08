// HRViewProfilePage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FormRow } from "../../components/common/FormRow";
import "../../Services/employees.js"
import { HRService } from "../../Services/employees.js";

export default function HRViewProfilePage() {
  const { employeeCode: paramCode } = useParams();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ✅ FIX: Use URL param first, fall back to localStorage
    const code = paramCode || localStorage.getItem("employeeCode");
    
    if (!code) {
      setError("Employee code not found");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    HRService.fetchEmployeeProfileByCode(code)
      .then(data => {
        if (data) {
          setProfile(data);
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

  if (error) return <p className="text-red-600 p-4">❌ {error}</p>;
  if (loading) return <p className="p-4">Loading...</p>;
  if (!profile) return <p className="text-red-600 p-4">❌ Profile data not found</p>;

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
