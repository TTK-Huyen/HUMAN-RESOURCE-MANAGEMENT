import api from './client.js';
// ============================================================
// REAL API SETUP (Giữ lại cấu hình này để dùng sau)

// ============================================================

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
