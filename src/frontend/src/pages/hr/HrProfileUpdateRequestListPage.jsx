import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { hrFetchProfileUpdateRequests } from "../../services/requestApi";


const STATUS_OPTIONS = ["ALL", "PENDING", "APPROVED", "REJECTED"];

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

export default function HrProfileUpdateRequestListPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("PENDING");
  const [employeeCode, setEmployeeCode] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await hrFetchProfileUpdateRequests({
        status,
        employeeCode: employeeCode.trim(),
      });
      setData(Array.isArray(res) ? res : []);
    } catch (err) {
      setError(err.message || "Failed to load requests.");
      setData([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  function handleSubmit(e) {
    e.preventDefault();
    load();
  }

  return (
    <div className="card fade-in-up">
      <div className="card-header">
        <h2 style={{ margin: 0 }}>Profile update requests</h2>
        <p style={{ margin: 0, color: "var(--muted)", fontSize: 14 }}>
          Review and approve employee profile changes.
        </p>
      </div>

      <div className="card-body">
        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            alignItems: "flex-end",
            marginBottom: 16,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 13, color: "#334155" }}>
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              style={{ minWidth: 140 }}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s === "ALL" ? "All" : s[0] + s.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 13, color: "#334155" }}>
              Employee code
            </label>
            <input
              type="text"
              placeholder="E001..."
              value={employeeCode}
              onChange={(e) => setEmployeeCode(e.target.value)}
            />
          </div>

          <button type="submit" className="btn">
            Filter
          </button>
        </form>

        {error && (
          <p style={{ color: "var(--danger)", marginBottom: 12 }}>{error}</p>
        )}

        {loading ? (
          <p>Loading...</p>
        ) : data.length === 0 ? (
          <p style={{ color: "var(--muted)" }}>No requests found.</p>
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
                  <th style={{ padding: "8px 8px" }}>Request ID</th>
                  <th style={{ padding: "8px 8px" }}>Employee</th>
                  <th style={{ padding: "8px 8px" }}>Created at</th>
                  <th style={{ padding: "8px 8px" }}>Status</th>
                  <th style={{ padding: "8px 8px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map((r) => (
                  <tr
                    key={r.request_id}
                    className="hover-row"
                    style={{ cursor: "pointer" }}
                    onClick={() =>
                      navigate(`/hr/profile-requests/${r.request_id}`)
                    }
                  >
                    <td style={{ padding: "8px 8px" }}>{r.request_id}</td>
                    <td style={{ padding: "8px 8px" }}>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span>{r.full_name}</span>
                        <span
                          style={{
                            fontSize: 12,
                            color: "var(--muted)",
                          }}
                        >
                          {r.employee_code}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: "8px 8px" }}>
                      {r.created_at || r.request_date}
                    </td>
                    <td style={{ padding: "8px 8px" }}>
                      <StatusBadge status={r.request_status} />
                    </td>
                    <td
                      style={{ padding: "8px 8px" }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() =>
                          navigate(`/hr/profile-requests/${r.request_id}`)
                        }
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
