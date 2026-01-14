import axios from "axios";
import api from "./client.js"; 

const USE_MOCK = false; 


export async function login(data) {
    if (USE_MOCK) {
        console.log("⚠️ Đang chạy chế độ MOCK DATA (Không gọi Server)");
        return loginMock(data);
    } else {
        return loginReal(data);
    }
}

/**
 * 1. LOGIN 
 */
async function loginReal({ username, password }) {
    const res = await api.post("/auth/login", { username, password });
    
    console.log("✅ Backend Response:", res);
    console.log("✅ Response Data:", res.data);
    
    const data = res.data?.data || res.data;
    console.log("✅ Extracted Data:", data);
    
    return data;
}


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
                role: 'ADMIN',
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
        const responseData = {
            token: "mock-jwt-token-" + Date.now(), // Token giả
            role: user.role,
            employeeCode: user.code,
            employeeName: user.name,
            employeeId: user.id
        };

        
        resolve(responseData);
    });
}