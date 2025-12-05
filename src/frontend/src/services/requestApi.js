// src/services/requestApi.js
//Lấy base URL từ biến môi trường CRA
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5291";
// ───────────────────────────────────────────────
// Local storage helpers cho các loại request (leave, OT, resignation)
// ───────────────────────────────────────────────
const KEY = "ems_requests_v1";

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch (e) {
    console.error("Failed to parse local storage", e);
    return [];
  }
}

function save(list) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

/**
 * Tạo request local (demo / fallback)
 * type: LEAVE | OT | RESIGNATION | ...
 * payload: object thêm (employeeCode, reason, ...)
 */
export function create(type, payload) {
  const list = load();
  const id =
    type.toUpperCase() + "-" + Math.random().toString(36).slice(2, 8);
  const record = {
    id,
    type,
    status: "Pending",
    createdAt: new Date().toISOString(),
    ...payload,
  };
  list.push(record);
  save(list);
  return record;
}

/**
 * Lọc request theo type + owner (local)
 */
export function listByType(type, ownerId = "E001") {
  return load().filter(
    (x) => x.type === type && (!ownerId || x.employeeCode === ownerId)
  );
}

// ───────────────────────────────────────────────
// API cho màn View Request Status (backend thật)
// ───────────────────────────────────────────────

/**
 * GET /api/employee/requests
 * Query: type, status, from, to, keyword, page, pageSize
 * Return: { items: [...], total: number }
 */
export async function getEmployeeRequests({
  type = "ALL",
  status = "ALL",
  from = "",
  to = "",
  keyword = "",
  page = 1,
  pageSize = 10,
} = {}) {
  const params = new URLSearchParams({
    type: type === "ALL" ? "" : type,
    status: status === "ALL" ? "" : status,
    from,
    to,
    keyword,
    page: String(page),
    pageSize: String(pageSize),
  });

  const res = await fetch(`/api/employee/requests?${params.toString()}`);
  if (!res.ok) {
    throw new Error("Failed to fetch requests");
  }
  return await res.json();
}

// ───────────────────────────────────────────────
// API V1 (Profile)
// ───────────────────────────────────────────────

const API_V1 = "/api/v1";

/**
 * UC1.1 – Employee Views Personal Profile
 * GET /api/v1/employees/{employeeCode}/profile
 */
export async function fetchEmployeeProfile(employeeCode = "E001") {
  const res = await fetch(
    `${API_V1}/employees/${encodeURIComponent(employeeCode)}/profile`
  );

  if (res.status === 404) {
    throw new Error("Profile not found for this employee.");
  }
  if (res.status === 403) {
    throw new Error("You are not allowed to view this profile.");
  }
  if (!res.ok) {
    throw new Error("Failed to fetch employee profile.");
  }

  return await res.json();
}

/**
 * UC1.5 – Send Profile Update Request
 * (Spec ghi GET nhưng có body nên mình dùng POST cho đúng REST)
 *
 * POST /api/v1/employees/{employeeCode}/profile-update-requests
 * Body: { reason, updates: [{ field_name, new_value }] }
 * Return: { request_id, request_status: "Pending Approval" }
 */
export async function sendProfileUpdateRequest(
  employeeCode = "E001",
  payload
) {
  const res = await fetch(
    `${API_V1}/employees/${encodeURIComponent(
      employeeCode
    )}/profile-update-requests`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  if (res.status === 404) {
    throw new Error("Employee not found.");
  }
  if (res.status === 403) {
    throw new Error("You are not allowed to update this profile.");
  }
  if (res.status === 400) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.error_message || "Invalid request payload.");
  }
  if (!res.ok) {
    throw new Error("Failed to create profile update request.");
  }

  return await res.json(); // { request_id, request_status }
}

// ───────────────────────────────────────────────
// HR APIs – UC1.6 Edit / Approve Profile Updates
// ───────────────────────────────────────────────

/**
 * GET /api/v1/hr/profile-update-requests
 * Optional query: status, employeeCode
 * Expect: JSON array
 *  [{ request_id, employee_code, full_name, created_at, request_status }, ...]
 */
export async function hrFetchProfileUpdateRequests({
  status = "ALL",
  employeeCode = "",
} = {}) {
  const params = new URLSearchParams();
  if (status && status !== "ALL") params.set("status", status);
  if (employeeCode) params.set("employeeCode", employeeCode);

  const qs = params.toString();
  const url = `${API_V1}/hr/profile-update-requests${qs ? "?" + qs : ""}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Failed to fetch profile update requests.");
  }
  return await res.json();
}

/**
 * GET /api/v1/hr/profile-update-requests/{requestId}
 *
 * Expect:
 * {
 *   request_id,
 *   employee_id,
 *   employee_code,
 *   full_name,
 *   request_status,
 *   request_date,
 *   reason,
 *   details: [{ field_name, old_value, new_value }]
 * }
 */
export async function hrFetchProfileUpdateRequestDetail(requestId) {
  const res = await fetch(
    `${API_V1}/hr/profile-update-requests/${encodeURIComponent(requestId)}`
  );

  if (res.status === 404) {
    throw new Error("Update request not found.");
  }
  if (!res.ok) {
    throw new Error("Failed to fetch update request detail.");
  }
  return await res.json();
}

/**
 * PATCH /api/v1/hr/profile-update-requests/{requestId}/status
 * Body: { new_status: "APPROVED" | "REJECTED", reject_reason? }
 * Expect: { request_id, request_status }
 */
export async function hrUpdateProfileUpdateRequestStatus(
  requestId,
  { new_status, reject_reason = "" }
) {
  const res = await fetch(
    `${API_V1}/hr/profile-update-requests/${encodeURIComponent(
      requestId
    )}/status`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ new_status, reject_reason }),
    }
  );

  if (res.status === 400 || res.status === 404) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.error_message || "Invalid request or not found.");
  }
  if (!res.ok) {
    throw new Error("Failed to update request status.");
  }

  return await res.json(); // { request_id, request_status }
}

// ====== GỌI API THẬT CHO LEAVE REQUEST ======

export async function createLeaveRequest(employeeCode, payload) {
  const url = `${API_BASE_URL}/api/v1/employees/${encodeURIComponent(
    employeeCode
  )}/requests/leave`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let errorDetail = null;
    try {
      errorDetail = await res.json();
    } catch {
      // ignore parse error
    }

    const message =
      errorDetail?.title ||
      errorDetail?.message ||
      errorDetail?.error ||
      `Failed with status ${res.status}`;

    throw new Error(message);
  }

  // Nếu API trả 201 + body
  if (res.status === 204) return null;
  return res.json();
}

// ====== GỌI API THẬT CHO OVERTIME REQUEST ======
export async function createOvertimeRequest(employeeCode, payload) {
  const url = `${API_BASE_URL}/api/v1/employees/${encodeURIComponent(
    employeeCode
  )}/requests/overtime`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let errorDetail = null;
    try {
      errorDetail = await res.json();
    } catch {
      // ignore parse error
    }

    const message =
      errorDetail?.title ||
      errorDetail?.message ||
      errorDetail?.error ||
      `Failed with status ${res.status}`;

    throw new Error(message);
  }

  if (res.status === 204) return null;
  return res.json(); // { requestId, status: "Pending", ... } nếu BE có trả
}

export async function getEmployeeRequests_1(
  employeeCode = "EMP001",
  {
    type = "ALL",
    status = "ALL",
  } = {}
) {
  const params = new URLSearchParams();

  // chỉ gắn query khi khác ALL để BE dễ xử lý
  if (type && type !== "ALL") params.set("type", type);
  if (status && status !== "ALL") params.set("status", status);

  const qs = params.toString();
  const url = `${API_BASE_URL}/api/v1/employees/${encodeURIComponent(
    employeeCode
  )}/requests${qs ? "?" + qs : ""}`;

  const res = await fetch(url);

  if (!res.ok) {
    let detail = null;
    try {
      detail = await res.json();
    } catch {
      // ignore
    }

    const message =
      detail?.title ||
      detail?.message ||
      detail?.error ||
      `Failed to fetch requests (status ${res.status})`;

    throw new Error(message);
  }

  return await res.json(); // expect: array
}