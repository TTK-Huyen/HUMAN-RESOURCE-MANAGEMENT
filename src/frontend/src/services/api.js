import axios from 'axios';

// --- CẤU HÌNH MOCK DATA (Dữ liệu giả để Demo) ---
const MOCK_PROFILE = {
    employeeCode: "NV001",
    fullName: "Nguyễn Văn A",
    dateOfBirth: "1999-01-01T00:00:00",
    gender: "Male",
    departmentName: "Phòng Kỹ Thuật (IT)",
    jobTitle: "Lập trình viên (Developer)",
    companyEmail: "nguyenvana@company.com",
    personalEmail: "vana.nguyen99@gmail.com",
    phoneNumber: "0909123456",
    currentAddress: "123 Đường Lê Lợi, Quận 1, TP.HCM",
    citizenId: "079099000123",
    personalTaxCode: "8001234567",
    bankAccount: "1012145678 (Vietcombank)",
    contractType: "Hợp đồng chính thức"
};

const MOCK_HR_REQUESTS = [
    {
        requestId: 1,
        employeeCode: "NV001",
        fullName: "Nguyễn Văn A",
        createdAt: "2023-10-25T08:30:00",
        status: "PENDING",
        reason: "Chuyển nhà nên đổi địa chỉ"
    },
    {
        requestId: 2,
        employeeCode: "NV002",
        fullName: "Trần Thị B",
        createdAt: "2023-10-26T09:15:00",
        status: "PENDING",
        reason: "Cập nhật số điện thoại mới"
    }
];

const MOCK_REQUEST_DETAIL = {
    requestId: 1,
    employeeCode: "NV001",
    fullName: "Nguyễn Văn A",
    reason: "Chuyển nhà nên đổi địa chỉ",
    createdAt: "2023-10-25T08:30:00",
    status: "PENDING",
    details: [
        { fieldName: "currentAddress", oldValue: "123 Đường Cũ", newValue: "456 Đường Mới, Q3" }
    ]
};

// --- SIMULATE ASYNC (Hàm giả lập độ trễ mạng) ---
const mockDelay = (data, ms = 500) => {
    return new Promise((resolve) => setTimeout(() => resolve({ data: data }), ms));
};

// ============================================================
// REAL API SETUP (Giữ lại cấu hình này để dùng sau)
const BASE_URL = 'http://localhost:5291/api/v1'; 
const api = axios.create({ baseURL: BASE_URL, headers: { 'Content-Type': 'application/json' } });
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});
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

export default api;