import axios from 'axios'; // Đưa import lên đầu file

// --- CẤU HÌNH MOCK DATA (Dữ liệu giả lập) ---
const MOCK_PROFILE = {
    employeeCode: "NV001",
    fullName: "Trần Thị Mỹ Ý",
    email: "myy.tran@company.com",
    phone: "0909.123.456",
    address: "123 Đường Lê Lợi, Q.1, TP.HCM",
    department: "Phòng IT",
    position: "Frontend Developer",
    citizenId: "079123456789",
    bankAccount: "101456789 (Vietcombank)"
};

// Hàm giả lập độ trễ mạng (500ms)
const mockDelay = (data) => {
    return new Promise((resolve) => setTimeout(() => resolve({ data: data }), 500));
};

export const EmployeeService = {
    getProfile: (code) => {
        console.log("⚡ [API MOCK] Đang lấy hồ sơ cho:", code);
        return mockDelay(MOCK_PROFILE);
    },
    
    sendUpdateRequest: (code, data) => {
        console.log("⚡ [API MOCK] Gửi yêu cầu cập nhật:", data);
        return mockDelay({ success: true });
    }
};

export const HRService = {
    getUpdateRequests: () => mockDelay([]),
    updateRequestStatus: () => mockDelay({ success: true }),
    getRequestDetail: () => mockDelay({})
};

// Tạo instance axios mặc định để export (tránh lỗi nếu file khác import default)
const api = axios.create();
export default api;