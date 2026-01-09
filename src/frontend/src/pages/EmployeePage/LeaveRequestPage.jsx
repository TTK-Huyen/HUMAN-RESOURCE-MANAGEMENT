import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ViolationBanner from "../../components/common/ViolationBanner";
import { FormRow } from "../../components/common/FormRow";
import Button from "../../components/common/Button";
import Toast from "../../components/common/Toast";
import { createLeaveRequest, fetchEmployeeProfile } from "../../Services/requests";
import { HRService } from "../../Services/employees.js";
import "./RequestForm.css";

const LEAVE_TYPES = [
  "Paid Leave",
  "Unpaid Leave",
  "Sick Leave",
  "Maternity Leave",
  "Half Day",
];

const INITIAL_FORM = {
  employeeName: "",
  employeeCode: "",
  department: "",
  leaveType: "",
  startDate: "",
  endDate: "",
  reason: "",
  handoverPersonCode: "",
  attachment: null,
};

function todayStr() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function LeaveRequestPage() {
  const navigate = useNavigate();
  const [f, setF] = useState(INITIAL_FORM);
  const [errs, setErrs] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
  (async () => {
    const employeeCode = localStorage.getItem("employeeCode") || "";
    const employeeName = localStorage.getItem("employeeName") || "";

    // Fill nhanh name/code từ login response
    setF((prev) => ({
      ...prev,
      employeeCode,
      employeeName,
    }));

    // Nếu chưa có employeeCode -> chưa login hoặc storage mất
    if (!employeeCode) {
      setErrs(["Missing employeeCode. Please login again."]);
      return;
    }

    // Gọi API thật để lấy department
    try {
      const profile = await HRService.fetchEmployeeProfileByCode(employeeCode);
      console.log("Employee profile:", profile); // Debug: xem response từ API

      setF((prev) => ({
        ...prev,
        department: profile.Department || profile.departmentName || profile.department || "",
      }));
    } catch (e) {
      console.error("Error loading employee data:", e);
      setErrs(["Cannot load employee profile. Please try again."]);
    }
  })();
  }, []);

  function onChange(e) {
    const { name, value, files } = e.target;
    setF((x) => ({ ...x, [name]: files ? files[0] : value }));
  }

  function validate() {
    const m = [];
    const today = todayStr();
    if (!f.leaveType) m.push("Leave Type is required.");
    if (!f.startDate || !f.endDate)
      m.push("Start date and End date are required.");
    if (f.startDate && f.startDate < today) m.push("Start date cannot be in the past.");
    if (f.endDate && f.endDate < today) m.push("End date cannot be in the past.");
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
        handoverPersonCode: f.handoverPerson, // backend yêu cầu số
        attachmentsBase64: attachmentBase64
      };

      // Gọi API thực
      await createLeaveRequest(f.employeeCode, payload);

      setToast({ message: "Leave request created successfully!", type: "success" });
      setErrs([]);
      setTimeout(() => navigate(-1), 2000);

    } catch (err) {
      setErrs(["Failed to create leave request"]);
    } finally {
      setSubmitting(false);
    }
  }



  function resetForm() {
    navigate(-1);
  }

  const attachLabel = ["Sick Leave", "Maternity Leave"].includes(f.leaveType)
    ? "Attachment (required)"
    : "Attachment";

  const minDate = todayStr();

  return (
    <div
      style={{
        padding: "24px",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="card form-card fade-in-up">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "24px",
            paddingBottom: "16px",
            borderBottom: "1px solid #e2e8f0",
          }}
        >
          <div>
            <h2 style={{ margin: "0 0 4px 0", fontSize: "1.5rem", color: "#0f172a" }}>
              Leave request
            </h2>
            <p style={{ margin: 0, fontSize: "0.9rem", color: "#64748b" }}>
              Submit a leave request for approval
            </p>
          </div>
        </div>

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
              min={minDate}
            />
          </FormRow>
          <FormRow label="End Date" required>
            <input
              className="input"
              type="date"
              name="endDate"
              value={f.endDate}
              onChange={onChange}
              min={f.startDate || minDate}
            />
          </FormRow>

          <FormRow label="Handover Person" required>
            <input
              className="input"
              name="handoverPerson"
              value={f.handoverPerson}
              onChange={onChange}
              placeholder="Employee Code"
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
            style={{
              gridColumn: "1 / -1",
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px",
              marginTop: "16px",
              paddingTop: "16px",
              borderTop: "1px solid #e2e8f0",
            }}
          >
            <Button
              variant="ghost"
              onClick={resetForm}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={submit}
              disabled={submitting}
              isLoading={submitting}
            >
              {submitting ? "Submitting..." : "Create request"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
