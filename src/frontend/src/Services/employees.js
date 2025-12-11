import api from './client.js';
// ============================================================
// REAL API SETUP (Giữ lại cấu hình này để dùng sau)

// ============================================================

export const EmployeeService = {
  // 1. Xem hồ sơ – dùng API thật (Swagger profile)
  getProfile: (employeeCode) => {
    // Trả về đúng DTO từ backend
    return api.get(`/employees/${employeeCode}/profile`);
    // Response data chính là:
    // {
    //   employeeName, employeeCode, dateOfBirth, gender, nationality, ...
    // }
  },

  // 2. Gửi yêu cầu cập nhật – dùng API thật
  // payload phải giống Swagger:
  // {
  //   reason: "string",
  //   details: [{ fieldName, oldValue, newValue }]
  // }
  sendUpdateRequest: (employeeCode, payload) => {
    return api.post(
      `/employees/${employeeCode}/profile-update-requests`,
      payload,
      { headers: { Accept: "*/*" } }
    );
    // Response data: "Profile update request sent and pending approval."
  },
};

export const HRService = {
  // 3. HR lấy danh sách
  // params: { status, employeeCode }
  getUpdateRequests: (params) => {
    return api.get('/hr/profile-update-requests', {
      params,
      headers: { Accept: "application/json, text/plain, */*" },
    });
    // data: [
    //   { request_id, employee_code, full_name, created_at, request_status }, ...
    // ]
  },

  // 4. HR xem chi tiết
  getRequestDetail: (requestId) => {
    return api.get(`/hr/profile-update-requests/${requestId}`, {
      headers: { Accept: "application/json, text/plain, */*" },
    });
    // data:
    // {
    //   request_id, employee_id, request_status,
    //   details: [{ field_name, old_value, new_value }]
    // }
  },

  // 5. HR duyệt / từ chối
  updateRequestStatus: (requestId, statusData) => {
    // statusData phải có: { new_status, reject_reason, Employee_ID }
    return api.patch(
      `/hr/profile-update-requests/${requestId}/status`,
      statusData,
      { headers: { Accept: "application/json, text/plain, */*" } }
    );
    // data: { request_id, request_status }
  },
};
