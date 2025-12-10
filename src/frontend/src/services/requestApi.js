// src/services/requestApi.js
//Lấy base URL từ biến môi trường CRA
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5291";
// Dùng base URL thật, không dùng path tương đối
const API_V1 = `${API_BASE_URL}/api/v1`;
// ───────────────────────────────────────────────
// Local storage helpers cho các loại request (leave, OT, resignation)
// ───────────────────────────────────────────────
const KEY = "ems_requests_v1";

const CURRENT_HR_ID = 1; // trùng Employee_ID trong DB của HR

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
export function listByType(type, ownerId = "EMP001") {
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



// UC1.1 – Employee Views Personal Profile
// GET /api/v1/employees/{employeeCode}/profile
export async function fetchEmployeeProfile(employeeCode = "EMP001") {
  const url = `${API_V1}/employees/${encodeURIComponent(employeeCode)}/profile`;
  console.log("[PROFILE] Request URL:", url);

  const res = await fetch(url);
  const contentType = res.headers.get("content-type") || "";
  console.log("[PROFILE] Status:", res.status, res.statusText);
  console.log("[PROFILE] Content-Type:", contentType);

  const raw = await res.clone().text();
  console.log("[PROFILE] Raw body:", raw);

  if (res.status === 404) {
    throw new Error("Profile not found for this employee.");
  }
  if (res.status === 403 || res.status === 401) {
    throw new Error("You are not allowed to view this profile.");
  }

  if (!res.ok) {
    let detail = null;
    if (contentType.includes("application/json")) {
      try {
        detail = JSON.parse(raw);
      } catch {}
    }

    const message =
      detail?.title ||
      detail?.message ||
      detail?.error ||
      detail?.error_message ||
      `Failed to fetch employee profile (status ${res.status}).`;

    throw new Error(message);
  }

  if (!contentType.includes("application/json")) {
    console.error("[PROFILE] Expected JSON, got:", raw.slice(0, 200));
    throw new Error("Server trả dữ liệu không đúng định dạng JSON.");
  }

  const data = JSON.parse(raw);
  console.log("[PROFILE] Parsed JSON object:", data);
  return data;
}

/**
 * UC1.5 – Send Profile Update Request
 *
 * POST /api/v1/employees/{employeeCode}/profile-update-requests
 * Body: {
 *   reason: string,
 *   details: [{ fieldName, oldValue, newValue }]
 * }
 * Return: { message: "Profile update request sent and pending approval." }
 */
export async function sendProfileUpdateRequest(
  employeeCode = "EMP001",
  payload
) {
  const url = `${API_V1}/employees/${encodeURIComponent(
    employeeCode
  )}/profile-update-requests`;

  // payload từ FE phải có dạng:
  // {
  //   reason: "...",
  //   details: [
  //     { fieldName: "Gender", oldValue: "Male", newValue: "Female" }
  //   ]
  // }

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "*/*", // swagger dùng text/plain nhưng vẫn ok
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let detail = null;
    try {
      detail = await res.json();
    } catch {
      // ignore parse error (vì 200 là text/plain)
    }

    const message =
      detail?.title ||
      detail?.message ||
      detail?.error ||
      detail?.error_message ||
      (res.status === 404
        ? "Employee not found."
        : res.status === 403 || res.status === 401
        ? "You are not allowed to update this profile."
        : "Failed to create profile update request.");

    throw new Error(message);
  }

  const text = await res.text();
  return { message: text || "Profile update request sent and pending approval." };
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

  const res = await fetch(url, {
    headers: {
      Accept: "application/json, text/plain, */*",
    },
  });

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
      detail?.error_message ||
      `Failed to fetch profile update requests (status ${res.status})`;

    throw new Error(message);
  }

  return await res.json(); // array
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
export async function hrUpdateProfileUpdateRequestStatus(
  requestId,
  { new_status, reject_reason = "", hrId }
) {
  const url = `${API_V1}/hr/profile-update-requests/${encodeURIComponent(
    requestId
  )}/status`;

  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/plain, */*",
    },
    body: JSON.stringify({
      new_status,
      reject_reason,
      Employee_ID: hrId,
    }),
  });

  let detail = null;
  try {
    detail = await res.json();
  } catch {
    // ignore
  }

  if (res.status === 400 || res.status === 404) {
    const message = detail?.error_message || "Invalid request or not found.";
    throw new Error(message);
  }
  if (!res.ok) {
    const message =
      detail?.title ||
      detail?.message ||
      detail?.error ||
      detail?.error_message ||
      "Failed to update request status.";
    throw new Error(message);
  }

  return detail;
}


/**
 * PATCH /api/v1/hr/profile-update-requests/{requestId}/status
 * Body: { new_status: "APPROVED" | "REJECTED", reject_reason? }
 * Expect: { request_id, request_status }
 */
export async function hrFetchProfileUpdateRequestDetail(requestId) {
  const url = `${API_V1}/hr/profile-update-requests/${encodeURIComponent(
    requestId
  )}`;

  const res = await fetch(url, {
    headers: {
      Accept: "application/json, text/plain, */*",
    },
  });

  let detail = null;
  try {
    detail = await res.json();
  } catch {
    // ignore
  }

  if (res.status === 404) {
    throw new Error(detail?.error_message || "Update request not found.");
  }
  if (!res.ok) {
    const message =
      detail?.title ||
      detail?.message ||
      detail?.error ||
      detail?.error_message ||
      "Failed to fetch update request detail.";
    throw new Error(message);
  }

  return detail;
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

// ====== GỌI API THẬT CHO RESIGNATION REQUEST ======
export async function createResignationRequest(employeeCode, payload) {
  const url = `${API_BASE_URL}/api/v1/employees/${encodeURIComponent(
    employeeCode
  )}/requests/resignation`;

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
      // ignore parse JSON error
    }

    const message =
      errorDetail?.title ||
      errorDetail?.message ||
      errorDetail?.error ||
      `Failed with status ${res.status}`;

    throw new Error(message);
  }

  if (res.status === 204) return null;
  return res.json();
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

// GET /api/v1/employees/{employeeCode}/requests/leave/{requestId}
export async function getLeaveRequestDetail(employeeCode, requestId) {
  const url = `${API_BASE_URL}/api/v1/employees/${encodeURIComponent(
    employeeCode
  )}/requests/leave/${encodeURIComponent(requestId)}`;

  const res = await fetch(url);

  if (res.status === 404) {
    throw new Error("Leave request not found.");
  }
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
      `Failed to fetch leave request detail (status ${res.status})`;

    throw new Error(message);
  }

  return await res.json();
}

// GET /api/v1/employees/{employeeCode}/requests/overtime/{requestId}
export async function getOvertimeRequestDetail(employeeCode, requestId) {
  const url = `${API_BASE_URL}/api/v1/employees/${encodeURIComponent(
    employeeCode
  )}/requests/overtime/${encodeURIComponent(requestId)}`;

  const res = await fetch(url);

  if (res.status === 404) {
    throw new Error("Overtime request not found.");
  }
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
      `Failed to fetch overtime request detail (status ${res.status})`;

    throw new Error(message);
  }

  return await res.json();
}

// GET /api/v1/employees/{employeeCode}/requests/resignation/{requestId}
export async function getResignationRequestDetail(employeeCode, requestId) {
  const url = `${API_BASE_URL}/api/v1/employees/${encodeURIComponent(
    employeeCode
  )}/requests/resignation/${encodeURIComponent(requestId)}`;

  const res = await fetch(url);

  if (res.status === 404) {
    throw new Error("Resignation request not found.");
  }
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
      `Failed to fetch resignation request detail (status ${res.status})`;

    throw new Error(message);
  }

  return await res.json();
}