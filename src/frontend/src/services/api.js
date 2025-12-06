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
    // 1. Xem hồ sơ (MOCK)
    getProfile: (employeeCode) => {
        console.log(`[MOCK API] Get Profile for ${employeeCode}`);
        return mockDelay(MOCK_PROFILE);
        // Khi chạy thật thì dùng dòng dưới:
        // return api.get(`/employees/${employeeCode}/profile`);
    },

    // 2. Gửi yêu cầu cập nhật (MOCK)
    sendUpdateRequest: (employeeCode, payload) => {
        console.log(`[MOCK API] Send Request for ${employeeCode}:`, payload);
        return mockDelay({ message: "Gửi yêu cầu thành công!" });
        // return api.post(`/employees/${employeeCode}/profile-update-requests`, payload);
    },
};

export const HRService = {
    // 3. HR Lấy danh sách (MOCK)
    getUpdateRequests: (params) => {
        console.log(`[MOCK API] Get HR Requests`, params);
        return mockDelay(MOCK_HR_REQUESTS);
        // return api.get('/hr/profile-update-requests', { params });
    },

    // 4. HR Xem chi tiết (MOCK)
    getRequestDetail: (requestId) => {
        console.log(`[MOCK API] Get Detail ${requestId}`);
        return mockDelay(MOCK_REQUEST_DETAIL);
        // return api.get(`/hr/profile-update-requests/${requestId}`);
    },

    // 5. HR Duyệt/Từ chối (MOCK)
    updateRequestStatus: (requestId, statusData) => {
        console.log(`[MOCK API] Update Status ${requestId}:`, statusData);
        return mockDelay({ message: "Cập nhật trạng thái thành công!" });
        // return api.patch(`/hr/profile-update-requests/${requestId}/status`, statusData);
    },
};

export default api;