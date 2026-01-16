// src/services/requestApi.js
import api from "./client";

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

export function create(type, payload) {
  const list = load();
  const id = type.toUpperCase() + "-" + Math.random().toString(36).slice(2, 8);
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

export function listByType(type, ownerId = "EMP001") {
  return load().filter(
    (x) => x.type === type && (!ownerId || x.employeeCode === ownerId)
  );
}

export async function getEmployeeRequests(params = {}) {
  const res = await api.get("/employee/requests", { params });
  return res.data;
}

export async function fetchEmployeeProfile(employeeCode) {
  const res = await api.get(`/employees/${employeeCode}/profile`);
  return res.data;
}

export async function sendProfileUpdateRequest(employeeCode = "EMP001", payload) {
  const res = await api.post(`/employees/${employeeCode}/profile-update-requests`, payload);
  return res.data;
}

export async function hrFetchProfileUpdateRequests({ status = "ALL", employeeCode = "" } = {}) {
  const params = {};
  if (status && status !== "ALL") params.status = status;
  if (employeeCode) params.employeeCode = employeeCode;
  const res = await api.get("/hr/profile-update-requests", { params });
  return res.data;
}

export async function hrFetchProfileUpdateRequestDetail(requestId) {
  const res = await api.get(`/hr/profile-update-requests/${requestId}/detailed`);
  return res.data;
}

export async function hrUpdateProfileUpdateRequestStatus(requestId, { new_status, reject_reason = "", hrId }) {
  const payload = {
    new_status,
    reject_reason,
    Employee_ID: hrId,
  };
  const res = await api.patch(`/hr/profile-update-requests/${requestId}/status`, payload);
  return res.data;
}

export async function createLeaveRequest(employeeCode, payload) {
  const res = await api.post(`/employees/${employeeCode}/requests/leave`, payload);
  return res.data;
}

export async function createOvertimeRequest(employeeCode, payload) {
  const res = await api.post(`/employees/${employeeCode}/requests/overtime`, payload);
  return res.data;
}

export async function createResignationRequest(employeeCode, payload) {
  const res = await api.post(`/employees/${employeeCode}/requests/resignation`, payload);
  return res.data;
}

export async function getEmployeeRequests_1(employeeCode = "EMP001", { type = "ALL", status = "ALL" } = {}) {
  const params = {};
  if (type !== "ALL") params.type = type;
  if (status !== "ALL") params.status = status;
  const res = await api.get(`/employees/${employeeCode}/requests`, { params });
  return res.data;
}

export async function getLeaveRequestDetail(employeeCode, requestId) {
  const res = await api.get(`/employees/${employeeCode}/requests/leave/${requestId}`);
  return res.data;
}

export async function getOvertimeRequestDetail(employeeCode, requestId) {
  const res = await api.get(`/employees/${employeeCode}/requests/overtime/${requestId}`);
  return res.data;
}

export async function getResignationRequestDetail(employeeCode, requestId) {
  const res = await api.get(`/employees/${employeeCode}/requests/resignation/${requestId}`);
  return res.data;
}

export async function getMyProfileUpdateRequests(employeeCode) {
  // Sử dụng API search hiện có, lọc theo employeeCode
// Gọi vào endpoint của Employee thay vì HR để tránh lỗi quyền hạn (403 Forbidden)
  const res = await api.get(`/employees/${employeeCode}/profile-update-requests`);
  return res.data;
}

export async function getMyProfileUpdateRequestDetail(employeeCode, requestId) {
  const res = await api.get(`/employees/${employeeCode}/profile-update-requests/${requestId}`);
  return res.data;
}