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