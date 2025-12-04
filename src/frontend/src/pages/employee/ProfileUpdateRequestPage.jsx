import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchEmployeeProfile, sendProfileUpdateRequest } from "../../services/requestApi";
import { FormRow } from "../../components/FormRow";
import ViolationBanner from "../../components/ViolationBanner";

const CURRENT_EMPLOYEE_CODE = "E001";

const EDITABLE_FIELDS = [
  { id: "current_address", label: "Current address", type: "textarea" },
  { id: "phone_number", label: "Phone numbers", type: "text" },
  { id: "personal_email", label: "Personal email", type: "email" },
  {
    id: "bank_accounts",
    label: "Bank account(s)",
    type: "textarea",
    placeholder: "Example: Vietcombank - 0123456789 - Nguyen Van A",
  },
  {
    id: "education",
    label: "Education",
    type: "textarea",
    placeholder: "Degrees, major, university, graduation year, certificates...",
  },
];

export default function ProfileUpdateRequestPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({});
  const [reason, setReason] = useState("");
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null); // {request_id, request_status}
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const data = await fetchEmployeeProfile(CURRENT_EMPLOYEE_CODE);
        if (!cancelled) {
          setProfile(data);
          const initial = {};
          EDITABLE_FIELDS.forEach((f) => {
            initial[f.id] = data[f.id] ?? "";
          });
          setForm(initial);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load profile.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  function handleChange(fieldId, value) {
    setForm((prev) => ({ ...prev, [fieldId]: value }));
  }

  function validate() {
    const v = [];
    if (!reason.trim()) {
      v.push("Reason is required.");
    }
    if (!profile) {
      v.push("Profile is not loaded.");
    }
    if (profile) {
      const updates = buildUpdates(profile, form);
      if (updates.length === 0) {
        v.push("No changes detected. Please modify at least one field.");
      }
    }
    setViolations(v);
    return v.length === 0;
  }

  function buildUpdates(original, currentForm) {
    const updates = [];
    EDITABLE_FIELDS.forEach(({ id }) => {
      const oldVal = (original[id] ?? "").trim();
      const newVal = (currentForm[id] ?? "").trim();
      if (oldVal !== newVal) {
        updates.push({
          field_name: id,
          new_value: newVal,
        });
      }
    });
    return updates;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setError("");
    setSubmitResult(null);

    try {
      const updates = buildUpdates(profile, form);
      const payload = {
        reason: reason.trim(),
        updates,
      };
      const res = await sendProfileUpdateRequest(
        CURRENT_EMPLOYEE_CODE,
        payload
      );
      setSubmitResult(res); // { request_id, request_status }
      setViolations([]);
    } catch (err) {
      setError(err.message || "Failed to submit update request.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="card fade-in-up">
        <div className="card-header">
          <h2>Send profile update request</h2>
        </div>
        <div className="card-body">
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="card fade-in-up">
        <div className="card-header">
          <h2>Send profile update request</h2>
        </div>
        <div className="card-body">
          <p style={{ color: "var(--danger)" }}>{error}</p>
          <button type="button" className="btn" onClick={() => navigate(-1)}>
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <form className="card fade-in-up" onSubmit={handleSubmit}>
      <div className="card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <div>
          <h2 style={{ margin: 0 }}>Send profile update request</h2>
          <p style={{ margin: 0, color: "var(--muted)" }}>
            Changes will be reviewed and approved by HR.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => navigate("/employee/profile")}
        >
          Back to profile
        </button>
      </div>

      <div className="card-body">
        <ViolationBanner messages={violations} />

        {submitResult && (
          <div
            className="alert success"
            style={{
              marginBottom: 16,
              padding: 12,
              borderRadius: 8,
              background: "#ecfdf3",
              border: "1px solid #bbf7d0",
              color: "#14532d",
              fontSize: 14,
            }}
          >
            <strong>Request submitted!</strong>{" "}
            Request ID: {submitResult.request_id}, status:{" "}
            {submitResult.request_status}
          </div>
        )}

        <div className="form-grid">
          {EDITABLE_FIELDS.map((f) => (
            <FormRow
              key={f.id}
              label={f.label}
              required={false}
              full={["current_address", "bank_accounts", "education"].includes(
                f.id
              )}
            >
              {f.type === "textarea" ? (
                <textarea
                  rows={3}
                  value={form[f.id] ?? ""}
                  onChange={(e) => handleChange(f.id, e.target.value)}
                  placeholder={f.placeholder}
                />
              ) : (
                <input
                  type={f.type}
                  value={form[f.id] ?? ""}
                  onChange={(e) => handleChange(f.id, e.target.value)}
                  placeholder={f.placeholder}
                />
              )}
            </FormRow>
          ))}
        </div>

        <div style={{ marginTop: 16 }}>
          <FormRow label="Reason for update" required full>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why you need to update your information..."
            />
          </FormRow>
        </div>

        {error && (
          <p style={{ color: "var(--danger)", marginTop: 12 }}>{error}</p>
        )}

        <div
          style={{
            marginTop: 20,
            display: "flex",
            gap: 12,
            justifyContent: "flex-end",
          }}
        >
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate("/employee/profile")}
          >
            Cancel
          </button>
          <button type="submit" className="btn" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit request"}
          </button>
        </div>
      </div>
    </form>
  );
}
