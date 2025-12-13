import { useState } from "react";
import { createOvertimeRequest  } from "../../Services/requests";
import ViolationBanner from "../../components/ViolationBanner";
import { FormRow } from "../../components/FormRow";
import "./RequestForm.css";


const INITIAL_FORM = {
  date: "",
  start: "",
  end: "",
  reason: "",
  projectId: "",
};

export default function OTRequestPage() {
  const [f, setF] = useState(INITIAL_FORM);
  const [errs, setErrs] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // ⚠️ Tạm thời dùng cứng — sau này sẽ lấy từ login
  const employeeCode = "EMP001";

  function onChange(e) {
    const { name, value } = e.target;
    setF((x) => ({ ...x, [name]: value }));
  }

  function timeDiffHours(a, b) {
    const [ah, am] = a.split(":").map(Number);
    const [bh, bm] = b.split(":").map(Number);
    return (bh * 60 + bm - (ah * 60 + am)) / 60;
  }

  function validate() {
    const m = [];
    if (!f.date) m.push("Date is required.");
    if (!f.start || !f.end || f.start >= f.end)
      m.push("End time must be later than Start time.");
    const diff = f.start && f.end ? timeDiffHours(f.start, f.end) : 0;
    if (diff > 4) m.push("Overtime cannot exceed 4 hours/day.");
    if (!f.reason) m.push("Reason is required.");
    return { messages: m, hours: diff };
  }

  async function submit(e) {
    e.preventDefault();
    const { messages, hours } = validate();
    if (messages.length) {
      setErrs(messages);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        date: f.date,
        startTime: f.start,
        endTime: f.end,
        hours,
        reason: f.reason,
        projectId: f.projectId || null,
      };

      console.log("Sending payload:", payload);

      await createOvertimeRequest(employeeCode, payload);  // ✅ CALL API REAL

      alert("Overtime request created successfully!");
      setErrs([]);
      setF(INITIAL_FORM);
    } catch (err) {
      setErrs([err.message || "Failed to create overtime request"]);
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
      <h3>Overtime request</h3>
      <ViolationBanner messages={errs} />
      <form className="form-grid" onSubmit={submit} noValidate>
        <FormRow label="Date" required>
          <input
            className="input"
            type="date"
            name="date"
            value={f.date}
            onChange={onChange}
          />
        </FormRow>

        <FormRow label="Start time" required>
          <input
            className="input"
            type="time"
            name="start"
            value={f.start}
            onChange={onChange}
          />
        </FormRow>

        <FormRow label="End time" required>
          <input
            className="input"
            type="time"
            name="end"
            value={f.end}
            onChange={onChange}
          />
        </FormRow>

        <FormRow label="Project ID">
          <input
            className="input"
            name="projectId"
            value={f.projectId}
            onChange={onChange}
          />
        </FormRow>

        <FormRow label="Reason" required full>
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
