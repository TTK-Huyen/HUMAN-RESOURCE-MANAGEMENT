import React, { useEffect, useState, useCallback } from "react";
import { Eye, Calendar, Clock, LogOut, FileText, Search } from "lucide-react";
import "./PendingApprovals.css";

import StatsGrid from "../../components/common/StatsGrid"; 
import DetailModal from "../../components/features/request/DetailModal";
import Pagination from "../../components/common/Pagination";
import StatusBadge from "../../components/common/StatusBadge";
import Button from "../../components/common/Button";
import EmptyState from "../../components/common/EmptyState";

const API_BASE = "/api/v1";
const PAGE_SIZE = 10;
const IS_DEMO = false; 

// --- MOCK DATA ---
const MOCK_DEPARTMENTS = [
  { id: "IT", name: "IT Department" },
  { id: "HR", name: "Human Resources" },
  { id: "SALES", name: "Sales Department" },
];

const MOCK_REQUESTS = [
  {
    requestCode: "LR-2023-001",
    requestType: "Leave Request",
    employee: { id: "EMP001", fullName: "Nguyễn Văn A", departmentName: "IT" },
    decidedAt: null,
    effectiveDate: "2023-10-25",
    status: "PENDING",
    createdAt: "2023-10-24T15:30:00",
  },
  {
    requestCode: "OT-2023-089",
    requestType: "Overtime Request",
    employee: { id: "EMP002", fullName: "Trần Thị B", departmentName: "HR" },
    decidedAt: "2023-10-20",
    effectiveDate: "2023-10-22",
    status: "APPROVED",
    createdAt: "2023-10-19T10:00:00",
  },
  {
    requestCode: "RR-2023-012",
    requestType: "Resignation Request",
    employee: { id: "EMP003", fullName: "Lê Văn C", departmentName: "Sales" },
    decidedAt: "2023-10-15",
    effectiveDate: "2023-11-01",
    status: "REJECTED",
    createdAt: "2023-10-14T09:30:00",
  },
  {
    requestCode: "LR-2023-004",
    requestType: "Leave Request",
    employee: {
      id: "EMP004",
      fullName: "Phạm Thị D",
      departmentName: "Marketing",
    },
    decidedAt: null,
    effectiveDate: "2023-10-26",
    status: "PENDING",
    createdAt: "2023-10-24T16:45:00",
  },
  {
    requestCode: "OT-2023-090",
    requestType: "Overtime Request",
    employee: { id: "EMP005", fullName: "Hoàng Văn E", departmentName: "IT" },
    decidedAt: null,
    effectiveDate: "2023-10-27",
    status: "PENDING",
    createdAt: "2023-10-24T17:20:00",
  },
  // ... More sample data
];

// Create additional 15 rows of mock data for pagination testing
for (let i = 6; i <= 25; i++) {
  MOCK_REQUESTS.push({
    requestCode: `REQ-2023-${i.toString().padStart(3, "0")}`,
    requestType: i % 2 === 0 ? "Leave Request" : "Overtime Request",
    employee: {
      id: `EMP00${i}`,
      fullName: `Employee Demo ${i}`,
      departmentName: i % 3 === 0 ? "HR" : "IT",
    },
    decidedAt: null,
    effectiveDate: "2023-11-05",
    status: i % 5 === 0 ? "APPROVED" : "PENDING",
    createdAt: new Date(2023, 9, 24, 12, i).toISOString(),
  });
}

// Config Mapping by Request Type for Modal to know which API to call
const getTypeConfig = (typeStr) => {
  const t = typeStr?.toLowerCase() || "";
  if (t.includes("leave"))
    return {
      label: "Leave Request",
      icon: <Calendar size={18} />,
      colorClass: "bg-blue",
      apiApprovePath: "manager/leave-requests",
    };
  if (t.includes("overtime") || t === "ot")
    return {
      label: "Overtime",
      icon: <Clock size={18} />,
      colorClass: "bg-orange",
      apiApprovePath: "overtime-requests",
    };
  if (t.includes("resignation"))
    return {
      label: "Resignation",
      icon: <LogOut size={18} />,
      colorClass: "bg-red",
      apiApprovePath: "resignation-requests",
    };
  return {
    label: typeStr,
    icon: <FileText size={18} />,
    colorClass: "bg-gray",
    apiApprovePath: "requests",
  };
};

const formatDate = (dateString) => {
  if (!dateString) return "--";
  return new Date(dateString).toLocaleDateString("en-US");
};

// Sort requests: PENDING first, then by createdAt desc (newest first)
const sortRequests = (reqs = []) => {
  const norm = (s) => (s ?? "").toString().trim().toUpperCase();

  return [...reqs].sort((a, b) => {
    const sa = norm(a?.status);
    const sb = norm(b?.status);

    const aIsPending = sa === "PENDING";
    const bIsPending = sb === "PENDING";

    // PENDING first
    if (aIsPending && !bIsPending) return -1;
    if (!aIsPending && bIsPending) return 1;

    // Same pending-ness -> createdAt desc
    const ta = new Date(a?.createdAt ?? 0).getTime();
    const tb = new Date(b?.createdAt ?? 0).getTime();

    // invalid date safety
    const safeTa = Number.isFinite(ta) ? ta : 0;
    const safeTb = Number.isFinite(tb) ? tb : 0;

    return safeTb - safeTa;
  });
};


export default function PendingApprovals() {
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingCount: 0,
    approvedCount: 0,
    rejectedCount: 0,
  });
  const [ setDepartments] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [deptId] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReq, setSelectedReq] = useState(null);

  // LISTEN EVENT từ NotificationBell: click notification → bấm con mắt
  useEffect(() => {
    const handler = async (ev) => {
      const { requestId, requestType } = ev.detail || {};
      if (!requestId) return;

      // 1) tìm trong danh sách hiện tại
      const found = requests.find((r) => (r.id || r.requestId) === requestId);
      if (found) {
        setSelectedReq(found);
        return;
      }

      // 2) nếu không có trong list (do filter/paging), mở bằng object tối thiểu
      setSelectedReq({
        id: requestId,
        requestId,
        requestType: requestType || "leave",
        requestCode: `REQ-${requestId}`,
        status: "PENDING",
      });
    };

    window.addEventListener("notification:openRequest", handler);
    return () =>
      window.removeEventListener("notification:openRequest", handler);
  }, [requests]);

  // 1. Lấy danh sách phòng ban
  useEffect(() => {
    if (IS_DEMO) {
      setDepartments(MOCK_DEPARTMENTS);
    } else {
      fetch(`${API_BASE}/departments`)
        .then((res) => (res.ok ? res.json() : []))
        .then(setDepartments)
        .catch(console.error);
    }
  }, []);

  // 2. Hàm tải dữ liệu (Có logic chuyển đổi Demo/Real)
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      if (IS_DEMO) {
        // --- LOGIC GIẢ LẬP ---
        console.log("⚡ Đang chạy chế độ Demo...");
        await new Promise((r) => setTimeout(r, 600)); 

        // Lọc dữ liệu theo keyword
        let filtered = MOCK_REQUESTS.filter(
          (r) =>
            (!keyword ||
              r.employee.fullName
                .toLowerCase()
                .includes(keyword.toLowerCase())) &&
            (!deptId || r.employee.departmentName === deptId) // Lưu ý: logic lọc deptId này chỉ là ví dụ
        );

        // Tính toán thống kê giả
        const newStats = {
          totalRequests: filtered.length,
          pendingCount: filtered.filter((r) => r.status === "PENDING").length,
          approvedCount: filtered.filter((r) => r.status === "APPROVED").length,
          rejectedCount: filtered.filter((r) => r.status === "REJECTED").length,
        };

        setStats(newStats);
        setRequests(sortRequests(filtered));
        setCurrentPage(1);
      } else {
        // --- LOGIC GỌI API THẬT ---
        const params = new URLSearchParams();
        if (keyword) params.append("keyword", keyword);
        if (deptId) params.append("DepartmentId", deptId);
        // Nếu role là MANAGER, tự động gửi ManagerId và chỉ lấy báo cáo trực tiếp
        try {
          const role = localStorage.getItem("role");
          const employeeId = localStorage.getItem("employeeId");
          if (role && role.toUpperCase() === "MANAGER" && employeeId) {
            params.append("ManagerId", parseInt(employeeId, 10));
            params.append("OnlyDirectReports", true);
          }
        } catch {}
        const query = params.toString();

        const [summaryRes, listRes] = await Promise.all([
          fetch(`${API_BASE}/requests/dashboard/summary?${query}`),
          fetch(`${API_BASE}/requests/dashboard?${query}`),
        ]);

        // Handle summary response
        if (summaryRes.ok) {
          try {
            setStats(await summaryRes.json());
          } catch (e) {
            console.error("Failed to parse summary response:", e);
            console.error(
              "Status:",
              summaryRes.status,
              "Content-Type:",
              summaryRes.headers.get("content-type")
            );
          }
        } else {
          try {
            const errorText = await summaryRes.text();
            console.error(
              `Summary API error ${summaryRes.status}:`,
              errorText.substring(0, 500)
            );
          } catch {
            console.error(
              "Summary API error:",
              summaryRes.status,
              summaryRes.statusText
            );
          }
        }

        // Handle list response
        if (listRes.ok) {
          try {
            const listData = await listRes.json();
            setRequests(sortRequests(listData.items || []));
          } catch (e) {
            console.error("Failed to parse list response:", e);
            console.error(
              "Status:",
              listRes.status,
              "Content-Type:",
              listRes.headers.get("content-type")
            );
          }
        } else {
          try {
            const errorText = await listRes.text();
            console.error(
              `List API error ${listRes.status}:`,
              errorText.substring(0, 500)
            );
          } catch {
            console.error(
              "List API error:",
              listRes.status,
              listRes.statusText
            );
          }
        }
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }, [keyword, deptId]);

  useEffect(() => {
    const timer = setTimeout(() => fetchDashboardData(), 500);
    return () => clearTimeout(timer);
  }, [fetchDashboardData]);

  // Phân trang Client-side
  const indexOfLastRequest = currentPage * PAGE_SIZE;
  const indexOfFirstRequest = indexOfLastRequest - PAGE_SIZE;
  const currentRequests = requests.slice(
    indexOfFirstRequest,
    indexOfLastRequest
  );
  const totalPages = Math.ceil(requests.length / PAGE_SIZE);

  return (
    <div className="pa-container fade-in-up">
      {/* Header Thống kê */}
      <div style={{ marginBottom: 24 }}>
        <StatsGrid stats={stats} />
      </div>

      <div
        style={{
          background: "white",
          padding: 20,
          borderRadius: 12,
          border: "1px solid #e2e8f0",
          marginBottom: 20,
        }}
      >
        {/* Thanh tìm kiếm & Bộ lọc */}
        <div
          style={{
            display: "flex",
            gap: 10,
            marginBottom: 20,
            flexWrap: "wrap",
          }}
        >
          <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
            <Search
              size={18}
              style={{
                position: "absolute",
                left: 12,
                top: 10,
                color: "#94a3b8",
              }}
            />
            <input
              type="text"
              placeholder="Search by employee name..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px 8px 36px",
                borderRadius: 8,
                border: "1px solid #cbd5e1",
              }}
            />
          </div>
        </div>

        {/* Bảng dữ liệu */}
        <div className="table-responsive">
          <table className="pa-table">
            <thead>
              <tr>
                <th>Request Type</th>
                <th>Employee</th>
                <th>Department</th>
                <th>Date</th>
                <th>Status</th>
                <th style={{ textAlign: "center" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="6"
                    style={{ textAlign: "center", padding: "2rem" }}
                  >
                    Loading data...
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: "2rem" }}>
                    <EmptyState message="No requests found" subMessage="No pending requests at the moment" />
                  </td>
                </tr>
              ) : (
                currentRequests.map((req, idx) => {
                  const conf = getTypeConfig(req.requestType);
                  return (
                    <tr key={idx}>
                      <td>
                        <div className="cell-type">
                          <div className={`type-icon ${conf.colorClass}`}>
                            {conf.icon}
                          </div>
                          <div>
                            <div
                              className="fw-600"
                              style={{ color: "#0f172a" }}
                            >
                              {req.requestCode}
                            </div>
                            <div className="sub-text">{conf.label}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="user-cell">
                          <div
                            className="avatar-small"
                            style={{
                              background: "#3b82f6",
                              color: "white",
                              width: 32,
                              height: 32,
                              borderRadius: "50%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 12,
                            }}
                          >
                            {req.employee?.fullName?.charAt(0)}
                          </div>
                          <div>
                            <div className="fw-600">
                              {req.employee?.fullName}
                            </div>
                            <div className="sub-text">
                              ID: {req.employee?.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>{req.employee?.departmentName}</td>
                      <td>
                        <div className="date-cell">
                          <div className="date-row">
                            <span className="date-label">Decision Date:</span>{" "}
                            <span
                              className="date-val"
                              style={{
                                color: req.decidedAt ? "#0f172a" : "#94a3b8",
                              }}
                            >
                              {formatDate(req.decidedAt)}
                            </span>
                          </div>
                          <div className="date-row">
                            <span className="date-label">Effective Date:</span>{" "}
                            <span className="date-val">
                              {formatDate(req.effectiveDate)}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <StatusBadge status={req.status} />
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <Button
                          variant="ghost"
                          onClick={() => setSelectedReq(req)}
                          icon={Eye}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Phân trang */}
        <div
          style={{ marginTop: 20, display: "flex", justifyContent: "center" }}
        >
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* Modal chi tiết */}
      {selectedReq && (
        <DetailModal
          req={selectedReq}
          typeConfig={getTypeConfig(selectedReq.requestType)}
          onClose={() => setSelectedReq(null)}
          onRefresh={fetchDashboardData}
        />
      )}
    </div>
  );
}
