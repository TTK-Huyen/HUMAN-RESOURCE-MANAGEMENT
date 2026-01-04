// src/frontend/src/pages/EmployeePage/RewardPage/MyRewardPage.jsx
import React, { useState, useEffect } from 'react';
import Layout from '../../../components/layout/Layout';
import Table from '../../../components/common/Table'; // Tái sử dụng component Table
import Button from '../../../components/common/Button'; // Tái sử dụng component Button
import Toast from '../../../components/common/Toast'; // Tái sử dụng Toast
import { getMyWallet, redeemPoints } from '../../../Services/rewardService';
import './MyRewardPage.css'; // File CSS bên dưới

const MyRewardPage = () => {
    const [wallet, setWallet] = useState({ balance: 0, transactions: [] });
    const [redeemAmount, setRedeemAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        fetchWalletData();
    }, []);

    const fetchWalletData = async () => {
        try {
            const data = await getMyWallet();
            // Giả sử API trả về { balance: 1500, transactions: [...] }
            setWallet(data); 
        } catch (error) {
            setToast({ type: 'error', message: 'Không thể tải thông tin ví điểm' });
        }
    };

    const handleRedeem = async (e) => {
        e.preventDefault();
        if (!redeemAmount || redeemAmount <= 0) {
            setToast({ type: 'warning', message: 'Vui lòng nhập số điểm hợp lệ' });
            return;
        }
        if (redeemAmount > wallet.balance) {
            setToast({ type: 'error', message: 'Số điểm không đủ' });
            return;
        }

        if(!window.confirm(`Bạn chắc chắn muốn đổi ${redeemAmount} điểm thành tiền mặt?`)) return;

        setLoading(true);
        try {
            await redeemPoints(redeemAmount);
            setToast({ type: 'success', message: 'Đổi điểm thành công! Vui lòng kiểm tra lương tháng tới.' });
            setRedeemAmount('');
            fetchWalletData(); // Refresh lại số dư
        } catch (error) {
            setToast({ type: 'error', message: 'Đổi điểm thất bại. Vui lòng thử lại.' });
        } finally {
            setLoading(false);
        }
    };

    // Cấu hình cột cho bảng lịch sử (Tương thích với component Table.jsx)
    const columns = [
        { header: 'Ngày giao dịch', accessor: 'createdAt', render: (row) => new Date(row.createdAt).toLocaleDateString('vi-VN') },
        { header: 'Loại', accessor: 'type' }, // Ví dụ: "EARNED", "REDEEMED"
        { header: 'Mô tả', accessor: 'description' },
        { 
            header: 'Số điểm', 
            accessor: 'amount', 
            render: (row) => (
                <span className={row.amount > 0 ? 'point-plus' : 'point-minus'}>
                    {row.amount > 0 ? '+' : ''}{row.amount}
                </span>
            )
        },
    ];

    return (
        <Layout>
            <div className="reward-page-container">
                <h2>Ví Điểm Thưởng</h2>
                
                {/* Khu vực hiển thị điểm và Đổi quà */}
                <div className="reward-dashboard">
                    <div className="balance-card">
                        <h3>Điểm hiện tại</h3>
                        <div className="balance-number">{wallet.balance?.toLocaleString()} pts</div>
                        <div className="balance-vnd">≈ {(wallet.balance * 1000).toLocaleString()} VNĐ</div>
                    </div>

                    <div className="redeem-card">
                        <h3>Đổi điểm sang tiền mặt</h3>
                        <form onSubmit={handleRedeem} className="redeem-form">
                            <div className="form-group">
                                <label>Nhập số điểm cần đổi (Tối thiểu 100):</label>
                                <input 
                                    type="number" 
                                    value={redeemAmount}
                                    onChange={(e) => setRedeemAmount(e.target.value)}
                                    placeholder="VD: 500"
                                    min="100"
                                />
                            </div>
                            <Button 
                                type="submit" 
                                variant="primary" 
                                disabled={loading}
                            >
                                {loading ? 'Đang xử lý...' : 'Xác nhận đổi'}
                            </Button>
                        </form>
                    </div>
                </div>

                {/* Khu vực lịch sử giao dịch */}
                <div className="history-section">
                    <h3>Lịch sử biến động điểm</h3>
                    <Table 
                        columns={columns} 
                        data={wallet.transactions || []} 
                        // Nếu Table component có hỗ trợ pagination, truyền thêm props tại đây
                    />
                </div>

                {toast && (
                    <Toast 
                        type={toast.type} 
                        message={toast.message} 
                        onClose={() => setToast(null)} 
                    />
                )}
            </div>
        </Layout>
    );
};

export default MyRewardPage;