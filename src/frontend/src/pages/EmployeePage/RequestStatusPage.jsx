import { useEffect, useMemo, useState } from "react";
import "./RequestStatusPage.css";
import {
  getEmployeeRequests_1,
  getLeaveRequestDetail,
  getOvertimeRequestDetail,
  getResignationRequestDetail,
  // --- THÊM MỚI 2 HÀM NÀY (Đảm bảo bạn đã thêm vào Services/requests.js) ---
  getMyProfileUpdateRequests,       
  getMyProfileUpdateRequestDetail 
} from "../../Services/requests";

// --- CẬP NHẬT: Thêm PROFILE_UPDATE ---
const REQUEST_TYPES = ["ALL", "LEAVE", "OVERTIME", "RESIGNATION", "PROFILE UPDATE"];
const STATUS_OPTIONS = ["ALL", "PENDING", "APPROVED", "REJECTED", "CANCELLED"];
const PAGE_SIZE = 10;

function formatDateTime(value) {
  if (!value) return "";
  try {
    let safeDateStr = value;
    if (typeof safeDateStr === 'string' && !safeDateStr.endsWith('Z') && !safeDateStr.includes('+')) {
        safeDateStr += 'Z';
    }
    const d = new Date(safeDateStr);
    if (isNaN(d.getTime())) return "";
    
    return d.toLocaleString("en-GB", {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
      hour12: false,
      timeZone: 'Asia/Ho_Chi_Minh'
    });
  } catch { return ""; }
}

function getApprovedTime(item) {
  if (!item) return null;
  // Với Profile Update, BE trả về 'reviewedAt'
  if (item.reviewedAt) return item.reviewedAt;

  if (item.approvedAt) return item.approvedAt;
  
  const direct = item.approved_at || item.decidedAt || item.decided_at || item.approved_on || item.approved_on_date || item.approvedOn;
  if (direct) return direct;

  const extractFromLog = (log) => {
    if (!log) return null;
    return log.time || log.timeStamp || log.timestamp || log.approvedAt || log.approved_at || log.decidedAt || log.decided_at || log.createdAt || log.created_at || null;
  };

  const histories = item.history || item.historyItems || item.histories || item.logs || item.approvalHistory;
  if (Array.isArray(histories)) {
    const approved = histories.find(h => (h.status || '').toString().toUpperCase() === 'APPROVED');
    if (approved) return extractFromLog(approved);
    for (let i = histories.length - 1; i >= 0; i--) {
      const t = extractFromLog(histories[i]);
      if (t) return t;
    }
  }

  return null;
}

function formatDate(value) {
  if (!value) return "";
  try {
    let safeDateStr = value;
    if (typeof safeDateStr === 'string' && !safeDateStr.endsWith('Z') && !safeDateStr.includes('+')) {
        safeDateStr += 'Z';
    }
    const d = new Date(safeDateStr);
    if (isNaN(d.getTime())) return "";

    return d.toLocaleDateString("en-GB", {
      day: '2-digit', month: '2-digit', year: 'numeric',
      timeZone: 'Asia/Ho_Chi_Minh'
    });
  } catch { return ""; }
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
  const employeeCode = localStorage.getItem("employeeCode") || "EMP001";
  
  console.log("Current employeeCode:", employeeCode);

  const [selectedSummary, setSelectedSummary] = useState(null);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  // --- CẬP NHẬT LOGIC LOAD DATA ---
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");

      try {
        // 1. Gọi API lấy request thường (Leave, OT, Resignation)
        let regularRequestsPromise = Promise.resolve([]);
        // Nếu filter không phải là PROFILE_UPDATE thì mới gọi API cũ
        if (filters.type === "ALL" || filters.type !== "PROFILE UPDATE") {
             regularRequestsPromise = getEmployeeRequests_1(employeeCode, {
                type: filters.type === "PROFILE UPDATE" ? "NONE" : filters.type,
                status: filters.status,
             });
        }

        // 2. Gọi API lấy Profile Update Requests
        let profileRequestsPromise = Promise.resolve([]);
        // Nếu filter là ALL hoặc PROFILE_UPDATE thì gọi API mới
        if (filters.type === "ALL" || filters.type === "PROFILE UPDATE") {
             profileRequestsPromise = getMyProfileUpdateRequests(employeeCode);
        }

        // Chạy song song 2 API
        const [regularData, profileData] = await Promise.all([regularRequestsPromise, profileRequestsPromise]);
        console.log("Loaded Profile Update Requests:", profileData);

        if (!cancelled) {
          let combined = [];

          // Gộp requests thường
          if (Array.isArray(regularData)) combined = [...regularData];

          // Gộp requests profile (chuẩn hóa dữ liệu cho khớp với bảng)
          if (Array.isArray(profileData)) {
             console.log("Raw Profile Data from API:", profileData);
             const formattedProfiles = profileData.map(p => ({
               // API trả về snake_case, map sang camelCase dùng trong UI
               requestId: p.request_id,
               type: "PROFILE UPDATE",
               createdAt: p.created_at,
               effectiveDate: p.created_at, // có hiệu lực ngay
               status: p.request_status,
               approverName: "HR Dept",
               reviewedAt: p.reviewed_at, // Thời gian duyệt - hiển thị ở cột "Approved at"
               // giữ nguyên details nếu có để hiển thị nhanh
               details: p.details,
               // merge còn lại đề phòng dùng ở chỗ khác
               ...p
             }));
             combined = [...combined, ...formattedProfiles];
          }

          // Lọc lại Status phía Client (vì API Profile trả về tất cả status)
          if (filters.status !== "ALL") {
              combined = combined.filter(r => r.status?.toUpperCase() === filters.status);
          }

          // Sắp xếp giảm dần theo ngày tạo
          combined.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

          setRequests(combined);
          setPage(1);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setError(err.message || "Failed to load requests.");
          setRequests([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [filters.type, filters.status]); // Trigger lại khi filter thay đổi

  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      if (filters.type !== "ALL" && r.type !== filters.type) return false;
      if (filters.status !== "ALL" && r.status !== filters.status) return false;

      if (filters.from && r.effectiveDate) {
        const from = new Date(filters.from);
        const eff = new Date(r.effectiveDate);
        if (eff < from) return false;
      }
      if (filters.to && r.effectiveDate) {
        const to = new Date(filters.to);
        const eff = new Date(r.effectiveDate);
        if (eff > to) return false;
      }

      if (filters.keyword) {
        const key = filters.keyword.toLowerCase();
        // Thêm search cho reason của profile update
        const text = `${r.type} ${r.requestId} ${r.projectName || ""} ${r.reason || ""} ${r.comment || ""}`.toLowerCase();
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
    if (name !== "type" && name !== "status") {
      setPage(1);
    }
  }

  async function loadDetail(request) {
    setDetailLoading(true);
    setDetailError("");
    setSelectedDetail(null);

    try {
      console.log("Loading detail for request:", request);
      let data;
      switch (request.type) {
        case "LEAVE":
          data = await getLeaveRequestDetail(employeeCode, request.requestId);
          break;
        case "OT":
          data = await getOvertimeRequestDetail(employeeCode, request.requestId);
          break;
        case "RESIGNATION":
          data = await getResignationRequestDetail(employeeCode, request.requestId);
          break;
        // --- CẬP NHẬT: Case mới cho Profile Update ---
        case "PROFILE UPDATE":
          console.log("Calling getMyProfileUpdateRequestDetail with employeeCode:", employeeCode, "requestId:", request.requestId);
          data = await getMyProfileUpdateRequestDetail(employeeCode, request.requestId);
          console.log("Profile Update Request Detail Data:", data);

          if (data) {
            // Chuẩn hóa snake_case từ API chi tiết sang camelCase dùng trong UI
            data = {
              ...data,
              requestId: data.request_id ?? data.requestId ?? request.requestId,
              createdAt: data.request_date ?? data.created_at ?? data.createdAt ?? request.createdAt,
              status: data.request_status ?? data.status ?? request.status,
              reviewedAt: data.reviewed_at ?? data.reviewedAt,
              approverName: data.reviewed_by_name ?? data.reviewed_by ?? data.reviewedByName ?? data.reviewedBy ?? request.approverName,
              rejectReason: data.reject_reason ?? data.rejectReason ?? request.rejectReason,
              details: data.details ?? request.details,
            };
          }
          break;
        default:
          data = null;
      }

      if (data) {
        setSelectedDetail({ ...request, ...data });
      } else {
        setSelectedDetail(request);
      }
    } catch (err) {
      console.error("Error in loadDetail:", err);
      setDetailError(err.message || "Failed to load request details.");
      setSelectedDetail(request); 
    } finally {
      setDetailLoading(false);
    }
  }

  function handleOpenDetail(request) {
    setSelectedSummary(request);
    setSelectedDetail(null);
    setDetailError("");
    loadDetail(request);
  }

  function handleCloseDetail() {
    // Đóng modal - profile sẽ tự động update lần tới khi nhân viên đăng nhập
    setSelectedSummary(null);
    setSelectedDetail(null);
    setDetailError("");
    setDetailLoading(false);
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

    if (r.type === "LEAVE") {
      return (
        <section className="status-detail-section">
          <h4>Leave request details</h4>
          <dl className="status-detail-grid status-detail-grid--2cols">
            <div><dt>Leave type</dt><dd>{r.leaveType}</dd></div>
            <div><dt>Start date</dt><dd>{formatDate(r.startDate)}</dd></div>
            <div><dt>End date</dt><dd>{formatDate(r.endDate)}</dd></div>
            {r.halfDay && (<div><dt>Half day</dt><dd>{r.halfDay}</dd></div>)}
            <div><dt>Handover to</dt><dd>{r.handoverToEmployeeCode ?? "-"}</dd></div>
            <div><dt>Attachment</dt><dd>{r.attachment || "No attachment"}</dd></div>
            <div className="full-row"><dt>Reason</dt><dd>{r.reason || "-"}</dd></div>
          </dl>
        </section>
      );
    }

    if (r.type === "OT") {
      return (
        <section className="status-detail-section">
          <h4>Overtime request details</h4>
          <dl className="status-detail-grid status-detail-grid--2cols">
            <div><dt>OT date</dt><dd>{formatDate(r.otDate)}</dd></div>
            <div><dt>Start time</dt><dd>{r.startTime}</dd></div>
            <div><dt>End time</dt><dd>{r.endTime}</dd></div>
            <div><dt>Total hours</dt><dd>{r.totalHours}</dd></div>
            <div className="full-row"><dt>Project name</dt><dd>{r.projectName || "-"}</dd></div>
            <div className="full-row"><dt>OT reason</dt><dd>{r.reason || "-"}</dd></div>
          </dl>
        </section>
      );
    }

    if (r.type === "RESIGNATION") {
      return (
        <section className="status-detail-section">
          <h4>Resignation request details</h4>
          <dl className="status-detail-grid status-detail-grid--2cols">
            <div><dt>Proposed last working date</dt><dd>{formatDate(r.proposedLastWorkingDate)}</dd></div>
            <div><dt>Completed handover?</dt><dd>{r.completedHandover ? "Yes" : "No"}</dd></div>
            <div className="full-row"><dt>Resignation reason</dt><dd>{r.resignationReason || "-"}</dd></div>
            {r.hrNote && (<div className="full-row"><dt>HR note</dt><dd>{r.hrNote}</dd></div>)}
          </dl>
        </section>
      );
    }

    // --- CẬP NHẬT: Hiển thị chi tiết thay đổi Profile ---
    if (r.type === "PROFILE UPDATE") {
      return (
        <section className="status-detail-section">
          <h4>Profile Update Details</h4>
          <dl className="status-detail-grid">
            <div className="full-row">
              <dt>Reason</dt>
              {/* Profile update BE trả về comment hoặc reason */}
              <dd>{r.comment || r.reason || "Update personal information"}</dd>
            </div>
            <div className="full-row mt-3">
              <dt>Requested Changes</dt>
              <dd>
                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700 bg-gray-50 p-3 rounded border border-gray-100 mt-2">
                  {r.details && r.details.length > 0 ? (
                      r.details.map((d, idx) => (
                        <li key={idx}>
                          <span className="font-semibold text-gray-800">{d.field_name}: </span>
                          <span className="line-through text-red-400 mx-1">{d.old_value || "(empty)"}</span>
                          <span className="text-gray-400"> &rarr; </span>
                          <span className="text-green-600 font-bold">{d.new_value}</span>
                        </li>
                      ))
                  ) : (
                      <li className="text-gray-400 italic">No detailed changes recorded.</li>
                  )}
                </ul>
              </dd>
            </div>
          </dl>
        </section>
      );
    }

    return null;
  }

  // --- RETURN JSX (Phần dưới này gần như giữ nguyên, chỉ thay đổi data source) ---
  return (
    <div className="status-page fade-in-up">
      <div className="card status-card">
        <header className="status-header">
          <div>
            <h2>Request status</h2>
            <p className="status-subtitle">
              View all requests you have submitted and track their approval status.
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
                placeholder="Search..."
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
          ) : error ? (
            <div className="status-empty status-error">{error}</div>
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
                    key={`${r.type}-${r.requestId}`} // Unique key an toàn hơn
                    className="status-row"
                    onClick={() => handleOpenDetail(r)}
                  >
                    <td>{r.requestId}</td>
                    <td>{r.type}</td>
                    <td>{formatDateTime(r.createdAt)}</td>
                    <td>{formatDate(r.effectiveDate) || "-"}</td>
                    <td>
                      <span className={statusClass(r.status)}>{r.status}</span>
                    </td>
                    <td>{r.approverName || "-"}</td>
                    <td>{formatDateTime(getApprovedTime(r)) || "-"}</td>
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
      {selectedSummary && (
        <div className="status-detail-backdrop" onClick={handleCloseDetail}>
          <div
            className="status-detail"
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const r = selectedDetail || selectedSummary;
              return (
                <>
                  <header className="status-detail-header">
                    <div>
                      <h3>Request #{r.requestId}</h3>
                      <p className="status-detail-sub">
                        {r.type} · Current status:{" "}
                        <span className={statusClass(r.status)}>
                          {r.status}
                        </span>
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button className="btn ghost" onClick={handleCloseDetail}>
                        Close
                      </button>
                    </div>
                  </header>

                  {detailLoading && (
                    <div className="status-detail-loading">
                      Loading request details…
                    </div>
                  )}

                  {detailError && (
                    <div className="status-detail-error">{detailError}</div>
                  )}

                  {/* General info */}
                  <section className="status-detail-section">
                    <h4>General information</h4>
                    <dl className="status-detail-grid">
                      <div>
                        <dt>Created at</dt>
                        <dd>{formatDateTime(r.createdAt)}</dd>
                      </div>
                      <div>
                        <dt>Status</dt>
                        <dd>{r.status}</dd>
                      </div>
                      <div>
                        <dt>Approver</dt>
                        <dd>{r.approverName || "-"}</dd>
                      </div>
                      <div>
                        <dt>Approved at</dt>
                        <dd>{formatDateTime(getApprovedTime(r)) || "-"}</dd>
                      </div>
                      {r.rejectReason && (
                        <div className="full-row">
                          <dt>Reject reason</dt>
                          <dd className="reject-reason">
                            {r.rejectReason}
                          </dd>
                        </div>
                      )}
                    </dl>
                  </section>

                  {/* Type-specific detail */}
                  {!detailLoading && renderTypeSpecificDetail(r)}
                  
                  {/* Note */}
                  <p className="status-detail-note">
                    This screen is read-only. Past requests cannot be edited.
                  </p>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}