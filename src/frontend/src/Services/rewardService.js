// src/frontend/src/Services/rewardService.js
import client from './client';

// --- Dành cho Nhân viên ---

// Lấy thông tin ví điểm và lịch sử (Dashboard)
export const getMyWallet = async () => {
    try {
        const response = await client.get('/rewards/wallet/my-wallet');
        return response.data;
    } catch (error) {
        console.error("Error fetching wallet:", error);
        throw error;
    }
};

// Đổi điểm sang tiền mặt
export const redeemPoints = async (pointsToRedeem) => {
    try {
        // Body: { points: 100, method: "CASH" }
        const response = await client.post('/rewards/redeem', { 
            points: pointsToRedeem,
            redemptionMethod: 'CASH' 
        });
        return response.data;
    } catch (error) {
        console.error("Error redeeming points:", error);
        throw error;
    }
};

// Lấy lịch sử giao dịch (có thể filter theo tháng)
export const getTransactionHistory = async (month, year) => {
    try {
        const response = await client.get('/rewards/transactions', {
            params: { month, year }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching history:", error);
        throw error;
    }
};

// --- Dành cho Quản lý (Manager) ---

// Tặng điểm cho nhân viên
export const givePoints = async (employeeId, points, reason) => {
    try {
        const response = await client.post('/rewards/manager/give-points', {
            targetEmployeeId: employeeId,
            points: parseInt(points),
            reason: reason
        });
        return response.data;
    } catch (error) {
        console.error("Error giving points:", error);
        throw error;
    }
};

// --- Dành cho Admin/Hệ thống ---

// Kích hoạt tiến trình cộng điểm tự động (Manual Trigger)
export const triggerMonthlyAllocation = async (targetMonth) => {
    try {
        const response = await client.post('/admin/rewards/monthly-allocation', {
            targetMonth: targetMonth // Format: "MM/YYYY" or ISO date
        });
        return response.data;
    } catch (error) {
        console.error("Error triggering allocation:", error);
        throw error;
    }
};