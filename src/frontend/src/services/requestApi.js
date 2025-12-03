//Lấy base URL từ biến môi trường CRA
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5291";

// ====== Demo localStorage cho mock data (nếu còn dùng) ======
const KEY = "ems_requests_v1";

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

function save(list) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

// Tạo record local (nếu bạn vẫn muốn lưu demo trên FE)
export function create(type, payload) {
  const list = load();
  const id = type.toUpperCase() + "-" + Math.random().toString(36).slice(2, 8);
  const record = {
    id,
    type,
    status: "PENDING",
    createdAt: new Date().toISOString(),
    ...payload,
  };
  list.push(record);
  save(list);
  return record;
}

export function listByType(type, ownerId = "EMP001") {
  return load().filter(
    (x) => x.type === type && x.employeeCode === ownerId
  );
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
