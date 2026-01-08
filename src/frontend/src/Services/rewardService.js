import client from './client';

// --- HR/ADMIN ---
export const triggerMonthlyAllocation = async (data) => {
    // data: { targetMonth: "YYYY-MM" }
    return await client.post('/admin/rewards/monthly-allocation', data);
};

// --- MANAGER ---
export const givePoints = async (data) => {
    return await client.post('/rewards/manager/give-points', data);
};

// --- EMPLOYEE ---
export const getMyWallet = async () => {
    return await client.get('/rewards/wallet/my-wallet');
};

export const redeemPoints = async (data) => {
    return await client.post('/rewards/redeem', data);
};

export const getTransactionHistory = async (params) => {
    return await client.get('/rewards/transactions', { params });
};

// Employee: get my redemption requests (to show status)
export const getMyRedemptions = async () => {
    return await client.get('/rewards/redemptions');
};

// HR/Admin: get pending cash redemptions
export const getPendingRedemptions = async () => {
    return await client.get('/rewards/redemptions/pending');
};

// HR/Admin: approve a redemption request
export const approveRedemption = async (redemptionId) => {
    return await client.post(`/rewards/redemptions/${redemptionId}/approve`);
};

// HR/Admin: reject a redemption request with optional notes
export const rejectRedemption = async (redemptionId, data) => {
    return await client.post(`/rewards/redemptions/${redemptionId}/reject`, data);
};