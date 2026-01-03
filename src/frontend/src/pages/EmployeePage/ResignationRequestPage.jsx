// ResignationRequestPage.jsx
import { useState, useEffect } from "react";
import {
  createResignationRequest,
  fetchEmployeeProfile,
} from "../../Services/requests";
import ViolationBanner from "../../components/common/ViolationBanner";
import { FormRow } from "../../components/common/FormRow";
import "./RequestForm.css";

const INITIAL_FORM = {
  employeeCode: "",
  employeeName: "",
  department: "",
  position: "",
  contractEnd: "",
  resignationDate: "",
  reason: "",
};

function isWeekend(d) {
  const day = new Date(d).getDay();
  return day === 0 || day === 6;
}

function toISODate(mmddyyyy) {
  // "01/31/2026" -> "2026-01-31"
  if (!mmddyyyy) return "";
  const [mm, dd, yyyy] = mmddyyyy.split("/");
  if (!mm || !dd || !yyyy) return "";
  return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
}


export default function ResignationRequestPage() {
  const [f, setF] = useState(INITIAL_FORM);
  const [errs, setErrs] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
  async function loadProfile() {
    try {
      const employeeCodeLS = localStorage.getItem("employeeCode") || "";

      if (!employeeCodeLS) {
        setErrs(["Missing employeeCode. Please login again."]);
        return;
      }

      const profile = await fetchEmployeeProfile(employeeCodeLS);

      // Map đúng theo response swagger bạn gửi
      setF((prev) => ({
        ...prev,
        employeeCode: profile.employeeCode || employeeCodeLS,
        employeeName: profile.employeeName || localStorage.getItem("employeeName") || "",
        department: profile.department || "",
        position: profile.jobTitle || "",

        // input type="date" cần yyyy-MM-dd, trong swagger contractEndDate có thể null
        contractEnd: profile.contractEndDate ? toISODate(profile.contractEndDate) : "",
      }));

      setErrs([]);
    } catch (err) {
      console.error("Không load được profile:", err);
      setErrs(["Cannot load employee profile. Please try again."]);
    }
  }

  loadProfile();
  }, []);


  function onChange(e) {
    const { name, value } = e.target;
    setF((x) => ({ ...x, [name]: value }));
  }

  function validate() {
    const m = [];
    if (!f.resignationDate) m.push("Resignation date is required.");

    if (f.resignationDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const res = new Date(f.resignationDate);

      if (res < today || isWeekend(f.resignationDate)) {
        m.push(
          "Resignation date must be today or later and not fall on a weekend."
        );
      }
    }

    if (!f.reason) m.push("Resignation reason is required.");

    return m;
  }

  async function submit(e) {
    e.preventDefault();
    const m = validate();
    if (m.length) {
      setErrs(m);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        resignationDate: f.resignationDate,
        reason: f.reason,
      };

      await createResignationRequest(f.employeeCode, payload);
      setErrs([]);
      alert("Resignation request submitted. Status = Pending.");
      setF((prev) => ({
        ...INITIAL_FORM,
        employeeCode: prev.employeeCode,
        employeeName: prev.employeeName,
        department: prev.department,
        position: prev.position,
        contractEnd: prev.contractEnd,
      }));
    } catch (err) {
      console.error(err);
      setErrs([
        err.message || "Failed to submit resignation request. Please try again.",
      ]);
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setF((prev) => ({
    ...INITIAL_FORM,
    employeeCode: prev.employeeCode,
    employeeName: prev.employeeName,
    department: prev.department,
    position: prev.position,
    contractEnd: prev.contractEnd,
    }));
    setErrs([]);
  }

  return (
    <div className="card form-card fade-in-up">
      <h3>Resignation request</h3>
      <ViolationBanner messages={errs} />

      <form className="form-grid" onSubmit={submit} noValidate>
        {/* Nếu không muốn show lên UI thì xoá mấy FormRow này, state vẫn giữ data */}
        <FormRow label="Employee Code" required>
          <input className="input" value={f.employeeCode} readOnly />
        </FormRow>

        <FormRow label="Employee Name" required>
          <input className="input" value={f.employeeName} readOnly />
        </FormRow>

        <FormRow label="Department" required>
          <input className="input" value={f.department} readOnly />
        </FormRow>

        <FormRow label="Position" required>
          <input className="input" value={f.position} readOnly />
        </FormRow>

        <FormRow label="Contract end date">
          
          <input className="input" value={f.contractEnd} readOnly />
        </FormRow>

        <FormRow label="Resignation date" required>
          <input
            className="input"
            type="date"
            name="resignationDate"
            value={f.resignationDate}
            onChange={onChange}
          />
        </FormRow>

        <FormRow label="Resignation reason" required full>
          <textarea
            className="textarea"
            name="reason"
            value={f.reason}
            onChange={onChange}
          />
        </FormRow>

        <div
          className="hstack"
          style={{ gridColumn: "1 / -1", justifyContent: "flex-end", gap: 8 }}
        >
          <button
            type="button"
            className="btn ghost"
            onClick={resetForm}
            disabled={submitting}
          >
            Cancel
          </button>
          <button className="btn primary" type="submit" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
}
