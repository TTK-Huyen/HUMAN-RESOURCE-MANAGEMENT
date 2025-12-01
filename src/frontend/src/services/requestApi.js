const KEY = "ems_requests_v1";

function load() { return JSON.parse(localStorage.getItem(KEY) || "[]"); }
function save(list) { localStorage.setItem(KEY, JSON.stringify(list)); }

export function create(type, payload) {
  const list = load();
  const id = type.toUpperCase() + "-" + Math.random().toString(36).slice(2,8);
  const record = { id, type, status: "Pending", createdAt: new Date().toISOString(), ...payload };
  list.push(record); save(list);
  return record;
}
export function listByType(type, ownerId = "E001") {
  return load().filter(x => x.type === type && x.employeeCode === ownerId);
}

export async function getEmployeeRequests({ type, status, from, to, keyword, page, pageSize }) {
  const params = new URLSearchParams({
    type: type === "ALL" ? "" : type,
    status: status === "ALL" ? "" : status,
    from,
    to,
    keyword,
    page,
    pageSize,
  });

  const res = await fetch(`/api/employee/requests?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch requests");
  return await res.json(); // { items: [], total: 0 }
}
