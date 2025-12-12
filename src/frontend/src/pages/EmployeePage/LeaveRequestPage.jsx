import { useState } from "react";
import ViolationBanner from "../../components/ViolationBanner";
import { FormRow } from "../../components/FormRow";
import { createLeaveRequest } from "../../Services/requests";
import "./RequestForm.css";

const LEAVE_TYPES = [
  "Paid Leave",
  "Unpaid Leave",
  "Sick Leave",
  "Maternity Leave",
  "Half Day",
];

const INITIAL_FORM = {
  employeeName: "Alice",
  employeeCode: "EMP001",
  department: "Engineering",
  leaveType: "",
  startDate: "",
  endDate: "",
  reason: "",
  handoverPerson: "",
  attachment: null,
};

export default function LeaveRequestPage() {
  const [f, setF] = useState(INITIAL_FORM);
  const [errs, setErrs] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  function onChange(e) {
    const { name, value, files } = e.target;
    setF((x) => ({ ...x, [name]: files ? files[0] : value }));
  }

  function validate() {
    const m = [];
    if (!f.leaveType) m.push("Leave Type is required.");
    if (!f.startDate || !f.endDate)
      m.push("Start date and End date are required.");
    if (f.startDate && f.endDate && new Date(f.startDate) > new Date(f.endDate))
      m.push("Start date must be ≤ End date.");
    if (!f.reason || f.reason.length < 1 || f.reason.length > 500)
      m.push("Reason 1–500 chars is required.");
    if (!f.handoverPerson) m.push("Handover person is required.");

    const needAttach =
      f.leaveType === "Sick Leave" || f.leaveType === "Maternity Leave";
    if (needAttach && !f.attachment)
      m.push("Attachment required for Sick/Maternity leave.");
    if (f.attachment) {
      const ok =
        /\.(pdf|jpg|jpeg|png|docx)$/i.test(f.attachment.name) &&
        f.attachment.size <= 5 * 1024 * 1024;
      if (!ok)
        m.push("Attachment must be .pdf/.jpg/.png/.docx and ≤ 5MB.");
    }

    if (f.leaveType !== "Sick Leave" && f.startDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      let d = 0;
      const target = new Date(f.startDate);
      const t = new Date(today);

      while (t < target) {
        const day = t.getDay();
        if (day !== 0 && day !== 6) d++;
        t.setDate(t.getDate() + 1);
      }
      if (d < 3)
        m.push("Submit ≥ 3 working days in advance (except Sick Leave).");
    }
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
      // Convert file -> base64 nếu có
      let attachmentBase64 = null;

      if (f.attachment) {
        const file = f.attachment;
        attachmentBase64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result.split(",")[1]); // chỉ lấy base64
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }

      // Build payload đúng theo API backend
      const payload = {
        leaveType: f.leaveType,
        startDate: new Date(f.startDate).toISOString(),
        endDate: new Date(f.endDate).toISOString(),
        reason: f.reason,
        handoverPersonId: Number(f.handoverPerson), // backend yêu cầu số
        attachmentsBase64: attachmentBase64
      };

      // Gọi API thực
      await createLeaveRequest(f.employeeCode, payload);

      alert("Leave request submitted successfully!");
      setF(INITIAL_FORM);
      setErrs([]);

    } catch (err) {
      setErrs(["Failed to create leave request"]);
    } finally {
      setSubmitting(false);
    }
  }



  function resetForm() {
    setF(INITIAL_FORM);
    setErrs([]);
  }

  const attachLabel = ["Sick Leave", "Maternity Leave"].includes(f.leaveType)
    ? "Attachment (required)"
    : "Attachment";

  return (
    <div className="card form-card fade-in-up">
      <h3>Leave request</h3>
      <ViolationBanner messages={errs} />
      <form className="form-grid" onSubmit={submit} noValidate>
        <FormRow label="Employee Name" required>
          <input className="input" value={f.employeeName} readOnly />
        </FormRow>
        <FormRow label="Employee Code" required>
          <input className="input" value={f.employeeCode} readOnly />
        </FormRow>
        <FormRow label="Department" required>
          <input className="input" value={f.department} readOnly />
        </FormRow>

        <FormRow label="Leave Type" required>
          <select
            className="select"
            name="leaveType"
            value={f.leaveType}
            onChange={onChange}
          >
            <option value="">-- Select --</option>
            {LEAVE_TYPES.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </FormRow>

        <FormRow label="Start Date" required>
          <input
            className="input"
            type="date"
            name="startDate"
            value={f.startDate}
            onChange={onChange}
          />
        </FormRow>
        <FormRow label="End Date" required>
          <input
            className="input"
            type="date"
            name="endDate"
            value={f.endDate}
            onChange={onChange}
          />
        </FormRow>

        <FormRow label="Handover Person" required>
          <input
            className="input"
            name="handoverPerson"
            value={f.handoverPerson}
            onChange={onChange}
            placeholder="Employee ID"
          />
        </FormRow>

        <FormRow label={attachLabel}>
          <input
            className="input"
            type="file"
            name="attachment"
            onChange={onChange}
            accept=".pdf,.jpg,.jpeg,.png,.docx"
          />
        </FormRow>

        <FormRow label="Reason (1–500 chars)" required full>
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
            {submitting ? "Submitting..." : "Create request"}
          </button>
        </div>
      </form>
    </div>
  );
}
