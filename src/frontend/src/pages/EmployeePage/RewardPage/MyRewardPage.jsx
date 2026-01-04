import React, { useState, useEffect } from 'react';
import StatsGrid from '../../../components/common/StatsGrid'; 
import Table from '../../../components/common/Table';
import Button from '../../../components/common/Button';
import { FormRow } from '../../../components/common/FormRow'; 
import StatusBadge from '../../../components/common/StatusBadge';
import Toast from '../../../components/common/Toast';
import { getMyWallet, redeemPoints } from '../../../Services/rewardService';
import { DollarSign, Gift, Activity } from 'lucide-react'; // Dùng lucide-react

const MyRewardPage = () => {
    const [wallet, setWallet] = useState({ balance: 0, transactions: [] });
    const [redeemAmount, setRedeemAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const res = await getMyWallet();
            setWallet(res.data || { balance: 0, transactions: [] });
        } catch (error) {
            console.error("Lỗi tải dữ liệu ví");
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
            await redeemPoints({ points: parseInt(redeemAmount), method: 'CASH' });
            setToast({ type: 'success', message: 'Đổi điểm thành công!' });
            setRedeemAmount('');
            fetchData(); 
        } catch (error) {
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
        { header: 'Ngày', accessor: 'createdAt', render: (row) => new Date(row.createdAt).toLocaleDateString('vi-VN') },
        { 
            header: 'Loại GD', 
            accessor: 'type',
            render: (row) => {
                let type = 'default';
                if (row.type === 'EARN') type = 'success';
                if (row.type === 'REDEEM') type = 'warning';
                if (row.type === 'MONTHLY') type = 'info';
                return <StatusBadge status={row.type} type={type} label={row.type} />
            }
        },
        { header: 'Nội dung', accessor: 'description' },
        { 
            header: 'Số điểm', 
            accessor: 'amount', 
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
                <StatsGrid stats={stats} />
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