import { useEffect, useMemo, useState } from "react";
import "./RequestStatusPage.css";

const REQUEST_TYPES = ["ALL", "LEAVE", "OT", "RESIGNATION"];
const STATUS_OPTIONS = ["ALL", "PENDING", "APPROVED", "REJECTED", "CANCELLED"];
const PAGE_SIZE = 10;

function formatDateTime(value) {
  if (!value) return "";
  const d = new Date(value);
  return d.toLocaleString("vi-VN");
}

function formatDate(value) {
  if (!value) return "";
  const d = new Date(value);
  return d.toLocaleDateString("vi-VN");
}

function getEffectiveDateForRequest(r) {
  if (!r) return null;

  switch (r.request_type) {
    case "LEAVE":
      return r.start_date;
    case "OT":
      return r.ot_date;
    case "RESIGNATION":
      return r.proposed_last_working_date;
    default:
      return null;
  }
}

export default function RequestStatusPage() {
  const [requests, setRequests] = useState([]);
  const [filters, setFilters] = useState({
    type: "ALL",
    status: "ALL",
    from: "",
    to: "",
    keyword: "",
  });

  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);

    // Mock data bám DB + có thêm approver_name để hiển thị
    const timer = setTimeout(() => {
      const demo = [
        {
          // ===== LEAVE REQUEST =====
          request_id: 101,
          employee_id: 1,
          request_type: "LEAVE",
          created_at: "2025-01-02T09:00:00",
          status: "APPROVED",
          approver_name: "Bob",
          approved_at: "2025-01-03T11:00:00",
          reject_reason: null,

          // from leave_requests
          leave_type: "SICK",
          start_date: "2025-01-05",
          end_date: "2025-01-07",
          half_day: null,
          reason: "Bị cảm cúm nặng, cần nghỉ 3 ngày.",
          handover_employee_id: 10,
          attachment_path: "/uploads/medical.pdf",
        },
        {
          // ===== OT REQUEST =====
          request_id: 102,
          employee_id: 1,
          request_type: "OT",
          created_at: "2025-01-10T15:25:00",
          status: "PENDING",
          approver_name: "Carol",
          approved_at: null,
          reject_reason: null,

          // from overtime_requests
          ot_date: "2025-01-12",
          start_time: "18:00",
          end_time: "21:30",
          total_hours: 3.5,
          ot_reason: "Gấp rút hoàn thành sprint cuối.",
          project_name: "DMS System Upgrade",
        },
        {
          // ===== RESIGNATION REQUEST =====
          request_id: 103,
          employee_id: 1,
          request_type: "RESIGNATION",
          created_at: "2025-01-15T10:00:00",
          status: "REJECTED",
          approver_name: "David",
          approved_at: "2025-01-20T16:00:00",
          reject_reason:
            "Thời gian bàn giao chưa đủ, cần kéo dài thêm 2 tuần.",

          // from resignation_requests
          proposed_last_working_date: "2025-02-15",
          resign_reason: "Chuyển sang công ty mới gần nhà hơn.",
          has_completed_handover: 0,
          hr_note: "Vui lòng cập nhật lại kế hoạch bàn giao chi tiết.",
        },
      ];

      setRequests(demo);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      if (filters.type !== "ALL" && r.request_type !== filters.type) return false;
      if (filters.status !== "ALL" && r.status !== filters.status) return false;

      const effDateStr = getEffectiveDateForRequest(r);
      if (filters.from && effDateStr) {
        const from = new Date(filters.from);
        const eff = new Date(effDateStr);
        if (eff < from) return false;
      }
      if (filters.to && effDateStr) {
        const to = new Date(filters.to);
        const eff = new Date(effDateStr);
        if (eff > to) return false;
      }

      if (filters.keyword) {
        const key = filters.keyword.toLowerCase();
        const text = `${r.request_type} ${r.request_id} ${r.project_name || ""}`.toLowerCase();
        if (!text.includes(key)) return false;
      }

      return true;
    });
  }, [requests, filters]);

  const pagedRequests = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredRequests.slice(start, start + PAGE_SIZE);
  }, [filteredRequests, page]);

  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / PAGE_SIZE));

  function handleFilterChange(name, value) {
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPage(1);
  }

  function handleOpenDetail(request) {
    setSelected(request);
  }

  function handleCloseDetail() {
    setSelected(null);
  }

  function statusClass(status) {
    if (!status) return "badge status-pending";
    const upper = status.toUpperCase();
    if (upper === "APPROVED") return "badge status-approved";
    if (upper === "REJECTED") return "badge status-rejected";
    if (upper === "CANCELLED") return "badge status-cancelled";
    return "badge status-pending";
  }

  function renderTypeSpecificDetail(r) {
    if (!r) return null;

    if (r.request_type === "LEAVE") {
      return (
        <section className="status-detail-section">
          <h4>Leave request details</h4>
          <dl className="status-detail-grid status-detail-grid--2cols">
            <div>
              <dt>Leave type</dt>
              <dd>{r.leave_type}</dd>
            </div>
            <div>
              <dt>Start date</dt>
              <dd>{formatDate(r.start_date)}</dd>
            </div>
            <div>
              <dt>End date</dt>
              <dd>{formatDate(r.end_date)}</dd>
            </div>
            {r.half_day && (
              <div>
                <dt>Half day</dt>
                <dd>{r.half_day}</dd>
              </div>
            )}
            <div>
              <dt>Handover to (employee ID)</dt>
              <dd>{r.handover_employee_id || "-"}</dd>
            </div>
            <div>
              <dt>Attachment path</dt>
              <dd>{r.attachment_path || "No attachment"}</dd>
            </div>
            <div className="full-row">
              <dt>Reason</dt>
              <dd>{r.reason || "-"}</dd>
            </div>
          </dl>
        </section>
      );
    }

    if (r.request_type === "OT") {
      return (
        <section className="status-detail-section">
          <h4>Overtime request details</h4>
          <dl className="status-detail-grid status-detail-grid--2cols">
            <div>
              <dt>OT date</dt>
              <dd>{formatDate(r.ot_date)}</dd>
            </div>
            <div>
              <dt>Start time</dt>
              <dd>{r.start_time}</dd>
            </div>
            <div>
              <dt>End time</dt>
              <dd>{r.end_time}</dd>
            </div>
            <div>
              <dt>Total hours</dt>
              <dd>{r.total_hours}</dd>
            </div>
            <div className="full-row">
              <dt>Project name</dt>
              <dd>{r.project_name || "-"}</dd>
            </div>
            <div className="full-row">
              <dt>OT reason</dt>
              <dd>{r.ot_reason || "-"}</dd>
            </div>
          </dl>
        </section>
      );
    }

    if (r.request_type === "RESIGNATION") {
      return (
        <section className="status-detail-section">
          <h4>Resignation request details</h4>
          <dl className="status-detail-grid status-detail-grid--2cols">
            <div>
              <dt>Proposed last working date</dt>
              <dd>{formatDate(r.proposed_last_working_date)}</dd>
            </div>
            <div>
              <dt>Completed handover?</dt>
              <dd>{r.has_completed_handover ? "Yes" : "No"}</dd>
            </div>
            <div className="full-row">
              <dt>Resignation reason</dt>
              <dd>{r.resign_reason || "-"}</dd>
            </div>
            {r.hr_note && (
              <div className="full-row">
                <dt>HR note</dt>
                <dd>{r.hr_note}</dd>
              </div>
            )}
          </dl>
        </section>
      );
    }

    return null;
  }

  return (
    <div className="status-page fade-in-up">
      <div className="card status-card">
        <header className="status-header">
          <div>
            <h2>Request status</h2>
            <p className="status-subtitle">
              View all requests you have submitted and track their approval
              status.
            </p>
          </div>
          <div className="status-counter">
            <span className="status-count">{filteredRequests.length}</span>
            <span className="status-count-label">requests</span>
          </div>
        </header>

        {/* Filters */}
        <section className="status-filters">
          <div className="filter-row">
            <div className="filter-item">
              <label>Request type</label>
              <select
                className="select"
                value={filters.type}
                onChange={(e) => handleFilterChange("type", e.target.value)}
              >
                {REQUEST_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t === "ALL" ? "All types" : t}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-item">
              <label>Status</label>
              <select
                className="select"
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s === "ALL" ? "All statuses" : s}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-item">
              <label>From date</label>
              <input
                type="date"
                className="input"
                value={filters.from}
                onChange={(e) => handleFilterChange("from", e.target.value)}
              />
            </div>

            <div className="filter-item">
              <label>To date</label>
              <input
                type="date"
                className="input"
                value={filters.to}
                onChange={(e) => handleFilterChange("to", e.target.value)}
              />
            </div>

            <div className="filter-item filter-item--keyword">
              <label>Search</label>
              <input
                className="input"
                placeholder="Search by type, project or ID…"
                value={filters.keyword}
                onChange={(e) =>
                  handleFilterChange("keyword", e.target.value)
                }
              />
            </div>
          </div>
        </section>

        {/* Table */}
        <section className="status-table-wrapper">
          {loading ? (
            <div className="status-empty">Loading requests…</div>
          ) : filteredRequests.length === 0 ? (
            <div className="status-empty">
              No requests found with current filters.
            </div>
          ) : (
            <table className="status-table">
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Type</th>
                  <th>Created at</th>
                  <th>Effective date</th>
                  <th>Status</th>
                  <th>Approver</th>
                  <th>Approved at</th>
                </tr>
              </thead>
              <tbody>
                {pagedRequests.map((r) => (
                  <tr
                    key={r.request_id}
                    className="status-row"
                    onClick={() => handleOpenDetail(r)}
                  >
                    <td>{r.request_id}</td>
                    <td>{r.request_type}</td>
                    <td>{formatDateTime(r.created_at)}</td>
                    <td>{formatDate(getEffectiveDateForRequest(r)) || "-"}</td>
                    <td>
                      <span className={statusClass(r.status)}>{r.status}</span>
                    </td>
                    <td>{r.approver_name || r.approver_id || "-"}</td>
                    <td>{formatDateTime(r.approved_at) || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* Pagination */}
        {filteredRequests.length > 0 && (
          <div className="status-pagination">
            <button
              className="btn ghost"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Prev
            </button>
            <span className="status-page-indicator">
              Page {page} / {totalPages}
            </span>
            <button
              className="btn ghost"
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Detail panel */}
      {selected && (
        <div className="status-detail-backdrop" onClick={handleCloseDetail}>
          <div
            className="status-detail"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="status-detail-header">
              <div>
                <h3>Request #{selected.request_id}</h3>
                <p className="status-detail-sub">
                  {selected.request_type} · Current status:{" "}
                  <span className={statusClass(selected.status)}>
                    {selected.status}
                  </span>
                </p>
              </div>
              <button className="btn ghost" onClick={handleCloseDetail}>
                Close
              </button>
            </header>

            {/* General info */}
            <section className="status-detail-section">
              <h4>General information</h4>
              <dl className="status-detail-grid">
                <div>
                  <dt>Created at</dt>
                  <dd>{formatDateTime(selected.created_at)}</dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd>{selected.status}</dd>
                </div>
                <div>
                  <dt>Approver</dt>
                  <dd>
                    {selected.approver_name || selected.approver_id || "-"}
                  </dd>
                </div>
                <div>
                  <dt>Approved at</dt>
                  <dd>{formatDateTime(selected.approved_at) || "-"}</dd>
                </div>
                {selected.reject_reason && (
                  <div className="full-row">
                    <dt>Reject reason</dt>
                    <dd className="reject-reason">
                      {selected.reject_reason}
                    </dd>
                  </div>
                )}
              </dl>
            </section>

            {/* Type-specific */}
            {renderTypeSpecificDetail(selected)}

            <p className="status-detail-note">
              This screen is read-only. Past requests cannot be edited.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
