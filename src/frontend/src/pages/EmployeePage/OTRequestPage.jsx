import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createOvertimeRequest } from "../../Services/requests";
import ViolationBanner from "../../components/common/ViolationBanner";
import { FormRow } from "../../components/common/FormRow";
import Button from "../../components/common/Button";
import Toast from "../../components/common/Toast";
import "./RequestForm.css";

const INITIAL_FORM = {
  date: "",
  start: "",
  end: "",
  reason: "",
  projectId: "",
};

function todayStr() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function OTRequestPage() {
  const navigate = useNavigate();
  const [f, setF] = useState(INITIAL_FORM);
  const [errs, setErrs] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  //Lấy từ localStorage (được set khi login thành công)
  const employeeCode = localStorage.getItem("employeeCode") || "EMP001";

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
    const today = todayStr();
    if (!f.date) m.push("Date is required.");
    if (f.date && f.date < today) m.push("OT date cannot be in the past.");
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

      await createOvertimeRequest(employeeCode, payload);

      setToast({
        message: "Overtime request created successfully!",
        type: "success",
      });
      setErrs([]);
      setTimeout(() => navigate(-1), 2000);
    } catch (err) {
      setErrs([err.message || "Failed to create overtime request"]);
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    navigate(-1);
  }

  const minDate = todayStr();

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
            <h2>Overtime request</h2>
            <p>Submit an overtime request for approval</p>
          </div>
        </div>

        <ViolationBanner messages={errs} />

        <form className="form-grid" onSubmit={submit} noValidate>
          <FormRow label="Date" required>
            <input
              className="input"
              type="date"
              name="date"
              value={f.date}
              onChange={onChange}
              min={minDate}
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
