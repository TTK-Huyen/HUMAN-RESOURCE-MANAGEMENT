// src/frontend/src/pages/HRPage/Reward/AutoAllocationConfig.jsx
import React, { useState } from 'react';
import Layout from '../../../components/layout/Layout'; 
import Button from '../../../components/common/Button';
import Toast from '../../../components/common/Toast';
import { triggerMonthlyAllocation } from '../../../Services/rewardService';

const AutoAllocationConfig = () => {
    const [targetMonth, setTargetMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);

    const handleTrigger = async () => {
        if(!window.confirm(`Bạn có chắc muốn chạy tiến trình cộng điểm cho tháng ${targetMonth}?`)) return;

        setLoading(true);
        try {
            await triggerMonthlyAllocation(targetMonth);
            setToast({ type: 'success', message: `Đã kích hoạt tiến trình cộng điểm tháng ${targetMonth} thành công!` });
        } catch (error) {
            setToast({ type: 'error', message: 'Lỗi kích hoạt tiến trình. Vui lòng kiểm tra log.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div style={{ padding: '20px' }}>
                <h2>Cấu hình Cộng điểm Tự động</h2>
                <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', border: '1px solid #ddd', marginTop: '20px' }}>
                    <h4>Kích hoạt thủ công (Manual Trigger)</h4>
                    <p style={{ color: '#666', fontSize: '0.9rem' }}>
                        Hệ thống tự động chạy vào ngày 01 hàng tháng. Sử dụng chức năng này nếu tiến trình tự động bị lỗi hoặc cần chạy lại.
                    </p>
                    
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', marginTop: '15px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Chọn tháng:</label>
                            <input 
                                type="month" 
                                value={targetMonth}
                                onChange={(e) => setTargetMonth(e.target.value)}
                                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                        </div>
                        <Button 
                            variant="danger" 
                            onClick={handleTrigger}
                            disabled={loading}
                        >
                            {loading ? 'Đang xử lý...' : 'Chạy ngay'}
                        </Button>
                    </div>
                </div>
            </div>
            {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
        </Layout>
    );
};

export default AutoAllocationConfig;