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