import React, { useState, useEffect } from 'react';
import StatsGrid from '../../../components/common/StatsGrid'; 
import Table from '../../../components/common/Table';
import Button from '../../../components/common/Button';
import { FormRow } from '../../../components/common/FormRow'; 
import StatusBadge from '../../../components/common/StatusBadge';
import Toast from '../../../components/common/Toast';
import { getMyWallet, redeemPoints, getMyRedemptions } from '../../../Services/rewardService';
import { HRService } from '../../../Services/employees';
import { DollarSign, Gift, Activity } from 'lucide-react'; // Dùng lucide-react

const MyRewardPage = () => {
    const [wallet, setWallet] = useState({ balance: 0, transactions: [] });
    const [redeemAmount, setRedeemAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            // Debug: Check if token exists
            const token = localStorage.getItem('token');
            const employeeCode = localStorage.getItem('employeeCode');
            console.log('🔐 Token check:', { 
                hasToken: !!token, 
                tokenLength: token?.length,
                employeeCode,
                fullToken: token ? token.substring(0, 50) + '...' : 'NO TOKEN'
            });

            if (!token) {
                console.warn('⚠️ NO TOKEN IN LOCALSTORAGE - User may not be logged in');
                setToast({ type: 'warning', message: 'Vui lòng đăng nhập lại' });
                return;
            }

            const res = await getMyWallet();
            console.log('Wallet Response:', res);

            // Backend may return different shapes depending on server code / casing.
            // Normalize possible shapes to a single `walletData` object.
            const raw = res?.data ?? res;
            const payload = raw?.data ?? raw?.Data ?? raw;
            const walletData = payload || {};

            const balance = walletData.balance ?? walletData.Balance ?? walletData.currentBalance ?? walletData.CurrentBalance ?? 0;
            const totalEarned = walletData.totalEarned ?? walletData.TotalEarned ?? 0;
            const totalSpent = walletData.totalSpent ?? walletData.TotalSpent ?? 0;
            let transactions = walletData.transactions ?? walletData.Transactions ?? [];

            // Also fetch redemption requests to show status and metadata for redeem transactions
            try {
                const redRes = await getMyRedemptions();
                const rawR = redRes?.data ?? redRes;
                const redList = rawR?.data ?? rawR ?? [];

                // Build lookups: by redemptionId, by points+minute, and latest by points
                const redemptionById = {};
                const byKey = {};
                const byPointsLatest = {};

                (redList || []).forEach(r => {
                    const id = r.redemptionId ?? r.RedemptionId ?? r.redemption_id;
                    if (id) redemptionById[id] = r;

                    const pts = r.pointsRedeemed ?? r.PointsRedeemed ?? r.points ?? r.Points;
                    const at = r.requestedAt ?? r.RequestedAt ?? r.requested_at;
                    if (!pts) return;
                    const key = `${pts}|${at ? new Date(at).toISOString().slice(0,16) : 'nok'}`;
                    byKey[key] = r;
                    if (!byPointsLatest[pts]) byPointsLatest[pts] = r;
                });

                // If there are processedBy ids without a processor name, we'll try to resolve names
                const processedIds = new Set();
                (redList || []).forEach(r => {
                    const pb = r.processedBy ?? r.ProcessedBy ?? r.processed_by;
                    const proc = r.processor ?? r.Processor;
                    if (pb && !proc) processedIds.add(pb);
                });

                let employeesById = {};
                if (processedIds.size > 0) {
                    try {
                        // Fetch employees (use large page size to include all; acceptable for small deployments)
                        const empRes = await HRService.fetchAllEmployees({ Page: 1, PageSize: 1000 });
                        const empData = empRes?.data ?? empRes ?? empRes?.employees ?? empRes?.items;
                        const list = Array.isArray(empData) ? empData : (empRes?.employees ?? empRes?.data ?? []);
                        (list || []).forEach(e => { employeesById[e.id ?? e.employeeId ?? e.EmployeeId] = e; });
                    } catch (e) {
                        console.warn('Could not fetch employees to resolve processor names', e);
                    }
                }

                transactions = (transactions || []).map(tx => {
                    const txPoints = tx.amount ?? tx.Amount ?? tx.Points ?? tx.points;
                    const txAt = tx.createdAt ?? tx.CreatedAt ?? tx.requestedAt ?? tx.RequestedAt;
                    const txRelated = tx.relatedId ?? tx.RelatedId ?? tx.related_id ?? tx.related;
                    const key = `${Math.abs(txPoints) || txPoints}|${txAt ? new Date(txAt).toISOString().slice(0,16) : 'nok'}`;

                    // match by related id -> by key -> by latest points
                    let matched = null;
                    if (txRelated && redemptionById[txRelated]) matched = redemptionById[txRelated];
                    if (!matched) matched = byKey[key] || byPointsLatest[Math.abs(txPoints)];

                    const status = matched ? (matched.status ?? matched.Status) : (tx.status || tx.Status);

                    const requestedAt = matched ? (matched.requestedAt ?? matched.RequestedAt ?? matched.requested_at) : undefined;
                    const processedAt = matched ? (matched.processedAt ?? matched.ProcessedAt ?? matched.processed_at) : undefined;
                    let processorName = matched ? (
                        matched.processor?.fullName || matched.Processor?.fullName || matched.processorName || matched.processedByName || matched.processedByFullName || undefined
                    ) : undefined;

                    // If still missing processorName, try lookup from employees fetch
                    if (!processorName && matched) {
                        const pb = matched.processedBy ?? matched.ProcessedBy ?? matched.processed_by;
                        const emp = employeesById[pb];
                        if (emp) processorName = emp.fullName ?? emp.full_name ?? emp.employeeName ?? emp.employeeName;
                    }

                    return { ...tx, status, requestedAt, processedAt, processorName };
                });
            } catch (e) {
                console.warn('Could not load redemptions to merge statuses', e);
            }

            setWallet({
                balance,
                totalEarned,
                totalSpent,
                transactions
            });
        } catch (error) {
            console.error("Lỗi tải dữ liệu ví:", error);
            // More detailed error logging
            if (error.response?.status === 401) {
                console.error('❌ 401 Unauthorized - Token invalid or expired');
                console.error('Token from localStorage:', localStorage.getItem('token')?.substring(0, 50) + '...');
            }
            setToast({ type: 'error', message: 'Không thể tải dữ liệu ví' });
        }
    };

    const handleRedeem = async () => {
        if (!redeemAmount || parseInt(redeemAmount) < 100) {
            setToast({ type: 'warning', message: 'Tối thiểu đổi 100 điểm' });
            return;
        }
        if (parseInt(redeemAmount) > wallet.balance) {
            setToast({ type: 'error', message: 'Số điểm không đủ' });
            return;
        }
        if (!window.confirm(`Xác nhận đổi ${redeemAmount} điểm?`)) return;

        setLoading(true);
        try {
            // Call backend to create a redeem request. Backend should mark this request as PENDING
            const points = parseInt(redeemAmount);
            const res = await redeemPoints({ points, method: 'CASH' });

            // Optimistically update UI: temporarily deduct points and insert a pending transaction
            const pendingTransaction = {
                id: res?.data?.id || `local-${Date.now()}`,
                createdAt: new Date().toISOString(),
                type: 'REDEEM',
                description: 'Yêu cầu đổi tiền mặt',
                amount: -points,
                status: 'PENDING'
            };

            setWallet(prev => ({
                ...prev,
                balance: (Number(prev.balance) || 0) - points,
                transactions: [pendingTransaction, ...(prev.transactions || [])]
            }));

            setToast({ type: 'success', message: 'Yêu cầu đổi điểm đã gửi, chờ duyệt' });
            setRedeemAmount('');
            // Refresh from backend to get authoritative data (will reconcile if backend already deducted)
            fetchData(); 
        } catch (error) {
            console.error('Redeem request failed', error);
            setToast({ type: 'error', message: 'Đổi điểm thất bại' });
        } finally {
            setLoading(false);
        }
    };

    // Props input cho Component StatsGrid
    const stats = [
        {
            title: 'Điểm khả dụng',
            value: wallet.balance?.toLocaleString(),
            icon: <Gift size={24} />,
            color: 'blue'
        },
        {
            title: 'Quy đổi VNĐ (Dự kiến)',
            value: `${(wallet.balance * 1000)?.toLocaleString()} đ`,
            icon: <DollarSign size={24} />,
            color: 'green'
        }
    ];

    // Props input cho Component Table
    const columns = [
        { title: 'Ngày', dataIndex: 'createdAt', render: (row) => new Date(row.createdAt).toLocaleDateString('vi-VN') },
        { 
            title: 'Loại GD', 
            dataIndex: 'type',
            render: (row) => {
                let type = 'default';
                if (row.type === 'EARN') type = 'success';
                if (row.type === 'REDEEM') type = 'warning';
                if (row.type === 'MONTHLY') type = 'info';
                return <StatusBadge status={row.type} type={type} label={row.type} />
            }
        },
        { title: 'Trạng thái', dataIndex: 'status', render: (row) => {
                const st = row.status || '';
                let t = 'default';
                if (st === 'PENDING') t = 'warning';
                if (st === 'APPROVED') t = 'success';
                if (st === 'REJECTED') t = 'danger';
                return st ? <StatusBadge status={st} type={t} label={st} /> : <span className="text-gray-500">-</span>
            }
        },
        { title: 'Yêu cầu lúc', dataIndex: 'requestedAt', render: (row) => row.requestedAt ? new Date(row.requestedAt).toLocaleString('vi-VN') : '-' },
        { title: 'Đã xử lý bởi', dataIndex: 'processorName', render: (row) => row.processorName || '-' },
        { title: 'Thời gian xử lý', dataIndex: 'processedAt', render: (row) => row.processedAt ? new Date(row.processedAt).toLocaleString('vi-VN') : '-' },
        { title: 'Nội dung', dataIndex: 'description' },
        { 
            title: 'Số điểm', 
            dataIndex: 'amount', 
            render: (row) => (
                <span className={`font-bold ${row.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {row.amount > 0 ? '+' : ''}{row.amount}
                </span>
            )
        }
    ];

    return (
        <div className="p-6 fade-in-up">
            <h1 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                <Gift className="text-blue-600"/> Ví Thưởng Cá Nhân
            </h1>
            
            <div className="mb-8">
                {/* Simple stats display for wallet (balance + conversion) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between">
                        <div>
                            <div className="text-sm text-gray-500">Điểm khả dụng</div>
                            <div className="text-2xl font-bold text-gray-800">{Number(wallet.balance).toLocaleString()}</div>
                        </div>
                        <div className="text-blue-500">
                            <Gift size={28} />
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between">
                        <div>
                            <div className="text-sm text-gray-500">Quy đổi VNĐ (Dự kiến)</div>
                            <div className="text-2xl font-bold text-gray-800">{(Number(wallet.balance) * 1000).toLocaleString()} đ</div>
                        </div>
                        <div className="text-green-500">
                            <DollarSign size={28} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Feature: Form đổi điểm */}
                <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-sm border border-gray-100 h-fit">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Activity className="text-orange-500" size={20}/> Đổi Tiền Mặt
                    </h3>
                    <div className="space-y-4">
                        <FormRow label="Nhập số điểm (Tỷ lệ 1:1000)">
                            <input 
                                type="number" 
                                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                                value={redeemAmount}
                                onChange={(e) => setRedeemAmount(e.target.value)}
                                placeholder="VD: 500"
                                min="100"
                            />
                        </FormRow>
                        <Button 
                            variant="primary"
                            onClick={handleRedeem} 
                            disabled={loading}
                            className="w-full justify-center"
                        >
                            {loading ? 'Đang xử lý...' : 'Xác nhận Đổi'}
                        </Button>
                    </div>
                </div>

                {/* Feature: Lịch sử */}
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold mb-4">Lịch sử biến động</h3>
                    <Table columns={columns} data={wallet.transactions || []} />
                </div>
            </div>
            {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
        </div>
    );
};

export default MyRewardPage;