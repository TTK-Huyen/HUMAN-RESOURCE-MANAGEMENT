import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  hrFetchProfileUpdateRequestDetail,
  hrUpdateProfileUpdateRequestStatus,
} from "../../Services/requests";
import ViolationBanner from "../../components/common/ViolationBanner";

const SENSITIVE_FIELDS = [
  "citizen_id",
  "personal_tax_code",
  "personal_taxcode",
  "bank_account",
  "bank_accounts",
  "bank_account_number",
];

function StatusBadge({ status }) {
  if (!status) return null;
  const s = status.toUpperCase();
  let bg = "#e5e7eb";
  let color = "#374151";

  if (s === "PENDING") {
    bg = "#fef3c7";
    color = "#92400e";
  } else if (s === "APPROVED") {
    bg = "#dcfce7";
    color = "#166534";
  } else if (s === "REJECTED") {
    bg = "#fee2e2";
    color = "#991b1b";
  }

  return (
    <span
      style={{
        padding: "2px 8px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 500,
        background: bg,
        color,
      }}
    >
      {s}
    </span>
  );
}

export default function HrProfileUpdateRequestDetailPage() {
  const { requestId } = useParams();
  const navigate = useNavigate();

  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState("");
  const [violations, setViolations] = useState([]);
  const [rejectReason, setRejectReason] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      setSuccessMsg("");
      try {
        const data = await hrFetchProfileUpdateRequestDetail(requestId);
        if (!cancelled) {
          setDetail(data);
          setRejectReason(data.reject_reason || "");
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load request detail.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [requestId]);

  const hasSensitiveChanges = useMemo(() => {
    if (!detail || !Array.isArray(detail.details)) return false;
    return detail.details.some((d) =>
      SENSITIVE_FIELDS.includes((d.field_name || "").toLowerCase())
    );
  }, [detail]);

  function validateBeforeAction(action) {
    const v = [];
    if (!detail) {
      v.push("Request data is not loaded.");
    }
    if (detail && detail.request_status && detail.request_status !== "PENDING") {
      v.push("Only pending requests can be updated.");
    }
    if (action === "REJECTED" && !rejectReason.trim()) {
      v.push("Reject reason is required when rejecting a request.");
    }
    setViolations(v);
    return v.length === 0;
  }

  async function handleDecision(action) {
    // action: "APPROVED" | "REJECTED"
    if (!validateBeforeAction(action)) return;

    if (action === "APPROVED" && hasSensitiveChanges) {
      const ok = window.confirm(
        "This request contains sensitive information (Citizen ID, tax code, bank account). Are you sure you want to approve these changes?"
      );
      if (!ok) return;
    }

    setSubmitLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await hrUpdateProfileUpdateRequestStatus(requestId, {
        new_status: action,
        reject_reason: action === "REJECTED" ? rejectReason.trim() : "",
      });

      setDetail((prev) =>
        prev
          ? {
              ...prev,
              request_status: res.request_status || action,
              reject_reason:
                action === "REJECTED" ? rejectReason.trim() : prev.reject_reason,
            }
          : prev
      );

      setSuccessMsg(
        `Request ${requestId} has been ${action.toLowerCase()} successfully.`
      );
      setViolations([]);
    } catch (err) {
      setError(err.message || "Failed to update request status.");
    } finally {
      setSubmitLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="card fade-in-up">
        <div className="card-header">
          <h2>Profile update request #{requestId}</h2>
        </div>
        <div className="card-body">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (error && !detail) {
    return (
      <div className="card fade-in-up">
        <div className="card-header">
          <h2>Profile update request #{requestId}</h2>
        </div>
        <div className="card-body">
          <p style={{ color: "var(--danger)" }}>{error}</p>
          <button
            type="button"
            className="btn"
            onClick={() => navigate("/hr/profile-requests")}
          >
            Back to list
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card fade-in-up">
      <div
        className="card-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 12,
        }}
      >
        <div>
          <h2 style={{ margin: 0 }}>
            Profile update request #{detail.request_id}
          </h2>
          <p style={{ margin: 0, color: "var(--muted)", fontSize: 14 }}>
            {detail.full_name} ({detail.employee_code})
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <StatusBadge status={detail.request_status} />
          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
            Created at: {detail.request_date || detail.created_at}
          </div>
        </div>
      </div>

      <div className="card-body">
        <ViolationBanner messages={violations} />

        {successMsg && (
          <div
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
            {successMsg}
          </div>
        )}

        {error && (
          <p style={{ color: "var(--danger)", marginBottom: 12 }}>{error}</p>
        )}

        <section style={{ marginBottom: 20 }}>
          <h3
            style={{
              margin: "0 0 8px",
              fontSize: 15,
              fontWeight: 600,
              color: "#0f172a",
            }}
          >
            Request info
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 12,
              fontSize: 14,
            }}
          >
            <div>
              <div style={{ color: "var(--muted)", fontSize: 12 }}>Employee</div>
              <div>
                {detail.full_name} ({detail.employee_code})
              </div>
            </div>
            <div>
              <div style={{ color: "var(--muted)", fontSize: 12 }}>
                Current status
              </div>
              <div>
                <StatusBadge status={detail.request_status} />
              </div>
            </div>
            <div>
              <div style={{ color: "var(--muted)", fontSize: 12 }}>
                Created at
              </div>
              <div>{detail.request_date || detail.created_at}</div>
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <div style={{ color: "var(--muted)", fontSize: 12 }}>Reason</div>
            <div
              style={{
                fontSize: 14,
                padding: 8,
                borderRadius: 8,
                background: "#f9fafb",
                border: "1px solid #e5e7eb",
              }}
            >
              {detail.reason || <span style={{ color: "#9ca3af" }}>N/A</span>}
            </div>
          </div>
        </section>

        <section style={{ marginBottom: 20 }}>
          <h3
            style={{
              margin: "0 0 8px",
              fontSize: 15,
              fontWeight: 600,
              color: "#0f172a",
            }}
          >
            Changes
          </h3>

          {!detail.details || detail.details.length === 0 ? (
            <p style={{ color: "var(--muted)", fontSize: 14 }}>
              No field changes found in this request.
            </p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 14,
                }}
              >
                <thead>
                  <tr style={{ textAlign: "left" }}>
                    <th style={{ padding: "8px 8px" }}>Field</th>
                    <th style={{ padding: "8px 8px" }}>Old value</th>
                    <th style={{ padding: "8px 8px" }}>New value</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.details.map((d, idx) => {
                    const isSensitive = SENSITIVE_FIELDS.includes(
                      (d.field_name || "").toLowerCase()
                    );
                    return (
                      <tr key={idx}>
                        <td style={{ padding: "8px 8px", whiteSpace: "nowrap" }}>
                          {d.field_name}
                          {isSensitive && (
                            <span
                              style={{
                                marginLeft: 6,
                                fontSize: 11,
                                padding: "2px 6px",
                                borderRadius: 999,
                                background: "#fee2e2",
                                color: "#991b1b",
                              }}
                            >
                              sensitive
                            </span>
                          )}
                        </td>
                        <td
                          style={{
                            padding: "8px 8px",
                            borderTop: "1px solid #e5e7eb",
                          }}
                        >
                          {d.old_value || (
                            <span style={{ color: "#9ca3af" }}>—</span>
                          )}
                        </td>
                        <td
                          style={{
                            padding: "8px 8px",
                            borderTop: "1px solid #e5e7eb",
                            background: "#ecfeff",
                          }}
                        >
                          {d.new_value || (
                            <span style={{ color: "#9ca3af" }}>—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section>
          <h3
            style={{
              margin: "0 0 8px",
              fontSize: 15,
              fontWeight: 600,
              color: "#0f172a",
            }}
          >
            Decision
          </h3>

          <div style={{ marginBottom: 10, fontSize: 13, color: "var(--muted)" }}>
            When rejecting this request, please provide a clear reason. For
            sensitive fields (Citizen ID, Tax Code, Bank Account), approval
            requires extra confirmation.
          </div>

          <div style={{ marginBottom: 12 }}>
            <label
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
                fontSize: 13,
                color: "#334155",
              }}
            >
              Reject reason (required if rejecting)
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Explain why this request is rejected..."
              />
            </label>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
              marginTop: 16,
            }}
          >
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate("/hr/profile-requests")}
            >
              Back to list
            </button>

            <div style={{ display: "flex", gap: 12 }}>
              <button
                type="button"
                className="btn danger"
                disabled={
                  submitLoading || detail.request_status !== "PENDING"
                }
                onClick={() => handleDecision("REJECTED")}
              >
                {submitLoading ? "Processing..." : "Reject"}
              </button>
              <button
                type="button"
                className="btn"
                disabled={
                  submitLoading || detail.request_status !== "PENDING"
                }
                onClick={() => handleDecision("APPROVED")}
              >
                {submitLoading ? "Processing..." : "Approve"}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
