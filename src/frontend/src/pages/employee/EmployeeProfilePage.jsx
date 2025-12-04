import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchEmployeeProfile } from "../../services/requestApi";
import { FormRow } from "../../components/FormRow";
import ViolationBanner from "../../components/ViolationBanner";

const CURRENT_EMPLOYEE_CODE = "E001"; // TODO: lấy từ auth sau này

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export default function EmployeeProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [violations, setViolations] = useState([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      setViolations([]);
      
      // Mock data for testing - replace with real API when backend is ready
      const mockProfile = {
        full_name: "Trần Thị Mỹ",
        employee_code: "E001",
        date_of_birth: "1995-05-15",
        gender: "Female",
        nationality: "Vietnamese",
        company_email: "my.tran@company.com",
        personal_email: "mythran@gmail.com",
        marital_status: "Single",
        has_children: false,
        citizen_id: "123456789",
        personal_tax_code: "9876543210",
        social_insurance_no: "112233445566",
        current_address: "123 Main St, Ho Chi Minh City",
        phone_number: "0912345678",
        bank_accounts: "Bank A: 987654321098765\nBank B: 111222333444",
        department_name: "IT Department",
        position_name: "Software Engineer",
        employment_type: "Full-time",
        contract_start_date: "2020-01-15",
        contract_end_date: "2025-01-15",
        manager_name: "Nguyễn Văn A",
        status: "Active",
        contract_type: "Permanent",
        education: "Bachelor of IT - University of Technology\nGraduation: 2017\nCertifications: AWS Solutions Architect"
      };
      
      // Simulate slight delay
      setTimeout(() => {
        if (!cancelled) {
          setProfile(mockProfile);
          setLoading(false);
        }
      }, 500);

      // Uncomment below to use real API when backend is running
      /*
      try {
        const data = await fetchEmployeeProfile(CURRENT_EMPLOYEE_CODE);
        if (!cancelled) {
          setProfile(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Something went wrong.");
          setProfile(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
      */
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Bạn có thể validate thêm (VD: thiếu citizen_id, v.v.) và đẩy vào violation banner
  useEffect(() => {
    const v = [];
    if (profile && !profile.current_address) {
      v.push("Current address is missing. Please send an update request.");
    }
    if (profile && !profile.phone_number) {
      v.push("Phone number is missing. Please send an update request.");
    }
    setViolations(v);
  }, [profile]);

  return (
    <div className="card fade-in-up">
      <div className="card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <div>
          <h2 style={{ margin: 0 }}>Personal profile</h2>
          <p style={{ margin: 0, color: "var(--muted)" }}>
            View your official HR profile. Data is read-only.
          </p>
        </div>
        <button
          type="button"
          className="btn"
          onClick={() => navigate("/employee/profile/update")}
        >
          Send update request
        </button>
      </div>

      {error && (
        <div className="card-body">
          <p style={{ color: "var(--danger)" }}>{error}</p>
        </div>
      )}

      {loading && !error && (
        <div className="card-body">
          <p>Loading profile...</p>
        </div>
      )}

      {!loading && !error && profile && (
        <div className="card-body">
          <ViolationBanner messages={violations} />

          <div className="form-grid">
            <FormRow label="Employee name">
              <input value={profile.full_name || ""} readOnly />
            </FormRow>
            <FormRow label="Employee code">
              <input value={profile.employee_code || ""} readOnly />
            </FormRow>
            <FormRow label="Date of birth">
              <input value={formatDate(profile.date_of_birth)} readOnly />
            </FormRow>
            <FormRow label="Gender">
              <input value={profile.gender || ""} readOnly />
            </FormRow>
            <FormRow label="Nationality">
              <input value={profile.nationality || ""} readOnly />
            </FormRow>
            <FormRow label="Company email">
              <input value={profile.company_email || ""} readOnly />
            </FormRow>
            <FormRow label="Personal email">
              <input value={profile.personal_email || ""} readOnly />
            </FormRow>
            <FormRow label="Marital status">
              <input value={profile.marital_status || ""} readOnly />
            </FormRow>
            <FormRow label="Children">
              <input value={profile.has_children ? "Yes" : "No"} readOnly />
            </FormRow>
            <FormRow label="Citizen ID number">
              <input value={profile.citizen_id || ""} readOnly />
            </FormRow>
            <FormRow label="Personal tax code">
              <input value={profile.personal_tax_code || ""} readOnly />
            </FormRow>
            <FormRow label="Social insurance number">
              <input value={profile.social_insurance_no || ""} readOnly />
            </FormRow>
            <FormRow label="Current address" full>
              <textarea value={profile.current_address || ""} readOnly rows={2} />
            </FormRow>
            <FormRow label="Phone numbers">
              <input value={profile.phone_number || ""} readOnly />
            </FormRow>
            <FormRow label="Bank account(s)" full>
              <textarea
                value={profile.bank_accounts || ""}
                readOnly
                rows={2}
                placeholder="Bank info as text"
              />
            </FormRow>
            <FormRow label="Department">
              <input value={profile.department_name || ""} readOnly />
            </FormRow>
            <FormRow label="Job title">
              <input value={profile.position_name || ""} readOnly />
            </FormRow>
            <FormRow label="Employment type">
              <input value={profile.employment_type || ""} readOnly />
            </FormRow>
            <FormRow label="Contract start date">
              <input value={formatDate(profile.contract_start_date)} readOnly />
            </FormRow>
            <FormRow label="Contract end date">
              <input value={formatDate(profile.contract_end_date)} readOnly />
            </FormRow>
            <FormRow label="Direct manager">
              <input value={profile.manager_name || ""} readOnly />
            </FormRow>
            <FormRow label="Status">
              <input value={profile.status || ""} readOnly />
            </FormRow>
            <FormRow label="Contract type">
              <input value={profile.contract_type || ""} readOnly />
            </FormRow>
            <FormRow label="Education" full>
              <textarea
                rows={3}
                value={profile.education || ""}
                readOnly
                placeholder="Degrees, university, graduation year, certificates..."
              />
            </FormRow>
          </div>
        </div>
      )}
    </div>
  );
}
