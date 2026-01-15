// ResignationRequestPage.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  createResignationRequest,
  fetchEmployeeProfile,
} from "../../Services/requests";
import ViolationBanner from "../../components/common/ViolationBanner";
import { FormRow } from "../../components/common/FormRow";
import Button from "../../components/common/Button";
import Toast from "../../components/common/Toast";
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

function toISODate(dateStr) {
  if (!dateStr) return "";
  // already ISO
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;

  const parts = dateStr.split("/");
  if (parts.length !== 3) return "";

  const [p1, p2, yyyy] = parts;
  const n1 = Number(p1);
  const n2 = Number(p2);
  if (!yyyy || !n1 || !n2) return "";

  const isDDMM = n1 > 12;
  const dd = String(isDDMM ? n1 : n2).padStart(2, "0");
  const mm = String(isDDMM ? n2 : n1).padStart(2, "0");

  return `${yyyy}-${mm}-${dd}`;
}

function todayStr() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`; // YYYY-MM-DD
}

function addDaysISO(isoDate, days) {
  const d = new Date(isoDate);
  d.setDate(d.getDate() + days);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function getNoticeDays(position) {
  const p = (position || "").toLowerCase();
  const isManagerial = /manager|lead|head|supervisor/.test(p);
  return isManagerial ? 45 : 30;
}

export default function ResignationRequestPage() {
  const navigate = useNavigate();
  const [f, setF] = useState(INITIAL_FORM);
  const [errs, setErrs] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const employeeCodeLS = localStorage.getItem("employeeCode") || "";

        if (!employeeCodeLS) {
          setErrs(["Missing employeeCode. Please login again."]);
          return;
        }

        const profile = await fetchEmployeeProfile(employeeCodeLS);

        setF((prev) => ({
          ...prev,
          employeeCode: profile.employeeCode || employeeCodeLS,
          employeeName:
            profile.employeeName || localStorage.getItem("employeeName") || "",
          department: profile.department || "",
          position: profile.jobTitle || "",
          contractEnd: profile.contractEndDate || "",
        }));

        setErrs([]);
      } catch (err) {
        console.error("Cannot load employee profile", err);
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
      const today = todayStr();
      const noticeDays = getNoticeDays(f.position);
      const minDate = addDaysISO(today, noticeDays);

      const contractEndISO = toISODate(f.contractEnd);
      if (
        contractEndISO &&
        f.resignationDate &&
        f.resignationDate > contractEndISO
      ) {
        m.push("Final working day must be on or before the contract end date.");
      }

      if (f.resignationDate < minDate) {
        m.push(
          `Final working day must be at least ${noticeDays} days from today.`
        );
      }
      const todayD = new Date();
      todayD.setHours(0, 0, 0, 0);
      const res = new Date(f.resignationDate);

      if (res < todayD || isWeekend(f.resignationDate)) {
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
        proposedLastWorkingDate: f.resignationDate,
        reason: f.reason,
      };

      await createResignationRequest(f.employeeCode, payload);
      setErrs([]);
      setToast({
        message: "Resignation request submitted successfully!",
        type: "success",
      });
      setTimeout(() => navigate(-1), 2000);
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
    navigate(-1);
  }

  const noticeDays = getNoticeDays(f.position);
  const minFinalWorkingDay = addDaysISO(todayStr(), noticeDays);
  const contractEndISO = toISODate(f.contractEnd);

  return (
    <div className="request-page">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="card form-card fade-in-up">
        <div className="form-header">
          <div>
            <h2>Resignation request</h2>
            <p>Submit a resignation request for approval</p>
          </div>
        </div>

        <ViolationBanner messages={errs} />

        <form className="form-grid" onSubmit={submit} noValidate>
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

          <FormRow
            label="Contract end date"
            style={{ opacity: f.contractEnd ? 1 : 0.5 }}
          >
            <input
              className="input"
              type="date"
              value={contractEndISO || ""}
              readOnly
              disabled
            />
          </FormRow>

          <FormRow label="Resignation date" required>
            <input
              className="input"
              type="date"
              name="resignationDate"
              value={f.resignationDate}
              onChange={onChange}
              min={minFinalWorkingDay}
              max={contractEndISO || undefined}
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

          <div className="form-actions">
            <Button variant="ghost" onClick={resetForm} disabled={submitting}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={submit}
              disabled={submitting}
              isLoading={submitting}
            >
              {submitting ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
