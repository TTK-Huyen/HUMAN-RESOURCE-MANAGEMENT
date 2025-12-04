import { useState } from "react";
import { create } from "../../services/requestApi";
import ViolationBanner from "../../components/ViolationBanner";
import { FormRow } from "../../components/FormRow";
import "./RequestForm.css";

const INITIAL_FORM = {
  employeeId: "E001",
  employeeName: "Alice",
  department: "Engineering",
  position: "SE",
  contractEnd: "",
  resignationDate: "",
  reason: "",
  approverId: "",
};

function isWeekend(d) {
  const day = new Date(d).getDay();
  return day === 0 || day === 6;
}

export default function ResignationRequestPage() {
  const [f, setF] = useState(INITIAL_FORM);
  const [errs, setErrs] = useState([]);
  const [submitting, setSubmitting] = useState(false);

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
    if (!f.approverId) m.push("Approver is required.");

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
      await create("resignation", f);
      setErrs([]);
      alert("Resignation request submitted. Status = Pending.");
      setF(INITIAL_FORM);
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setF(INITIAL_FORM);
    setErrs([]);
  }

  return (
    <div className="card form-card fade-in-up">
      <h3>Resignation request</h3>
      <ViolationBanner messages={errs} />
      <form className="form-grid" onSubmit={submit} noValidate>
        <FormRow label="Employee ID" required>
          <input className="input" value={f.employeeId} readOnly />
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
          <input
            className="input"
            type="date"
            name="contractEnd"
            value={f.contractEnd}
            onChange={onChange}
          />
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

        <FormRow label="Approver ID" required>
          <input
            className="input"
            name="approverId"
            value={f.approverId}
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
          <button
            className="btn primary"
            type="submit"
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
}
