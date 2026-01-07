import axios from "axios";
import api from "./client.js"; // Uncomment khi có file client.js thật

// ⚡ CỜ CẤU HÌNH: Đặt true để chạy Mock (Test), false để chạy API thật (Prod)
const USE_MOCK = false; 

/**
 * Hàm Login chính (Gateway)
 * Tự động điều hướng sang Mock hoặc Real API dựa vào biến USE_MOCK
 */
export async function login(data) {
    if (USE_MOCK) {
        console.log("⚠️ Đang chạy chế độ MOCK DATA (Không gọi Server)");
        return loginMock(data);
    } else {
        return loginReal(data);
    }
}

/**
 * 1. LOGIN THẬT (Gọi Backend)
 */
async function loginReal({ username, password }) {
    // Nếu bạn chưa có file client.js, dùng axios trực tiếp
    const res = await api.post("/auth/login", { username, password });
    
    return res.data; 
}

/**
 * 2. LOGIN GIẢ LẬP (Mock Data)
 * Dành cho lúc mất mạng, server sập, hoặc đang dev frontend
 */
async function loginMock({ username, password }) {
    // Giả lập độ trễ mạng 0.8s cho giống thật
    await new Promise(r => setTimeout(r, 800));

    return new Promise((resolve, reject) => {
        // Danh sách tài khoản Hard-code để test
        const validAccounts = {
            // Tài khoản Employee
            'employee': { 
                pass: 'Emp123!@', 
                role: 'EMP', 
                name: 'Nguyễn Văn Nhân Viên', 
                code: 'EMP001',
                id: 1
            },
            // Tài khoản HR
            'hr': { 
                pass: 'Hr123!@#', 
                role: 'HR', 
                name: 'Phạm Thị Nhân Sự', 
                code: 'HR001',
                id: 2
            },
            // Tài khoản Manager
            'manager': { 
                pass: 'Mgr123!@#', 
                role: 'MANAGER', 
                name: 'Trần Văn Quản Lý', 
                code: 'MGR001',
                id: 3
            },
            // Tài khoản Admin cũ (giữ lại nếu cần)
            'admin@example.com': {
                pass: 'Password123!',
                role: 'HR',
                name: 'Super Admin',
                code: 'ADM001',
                id: 4
            }
        };

        const user = validAccounts[username];

        // 1. Check Username
        if (!user) {
            reject({ 
                response: { data: { message: `Tài khoản '${username}' không tồn tại!` } } 
            });
            return;
        }

        // 2. Check Password
        if (user.pass !== password) {
            reject({ 
                response: { data: { message: "Mật khẩu không chính xác!" } } 
            });
            return;
        }

        // 3. Login thành công -> Trả về dữ liệu y hệt Backend thật
        const responseData = {
            token: "mock-jwt-token-" + Date.now(), // Token giả
            role: user.role,
            employeeCode: user.code,
            employeeName: user.name,
            employeeId: user.id
        };

        // Lưu luôn vào LocalStorage ở đây (hoặc để component lo cũng được)
        // Nhưng tốt nhất để component lo việc lưu storage để code service được 'pure'
        
        resolve(responseData);
    });
}