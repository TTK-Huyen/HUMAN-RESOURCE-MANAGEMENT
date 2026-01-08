import React, { useEffect, useState } from 'react';
import Table from '../../../components/common/Table';
import Button from '../../../components/common/Button';
import StatusBadge from '../../../components/common/StatusBadge';
import Toast from '../../../components/common/Toast';
import { getPendingRedemptions, approveRedemption, rejectRedemption } from '../../../Services/rewardService';

export default function RedemptionRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await getPendingRedemptions();
            const raw = res?.data ?? res;
            const data = raw?.data ?? raw;
            setRequests(data || []);
        } catch (err) {
            console.error('Error loading pending redemptions', err);
            setToast({ type: 'error', message: 'Không tải được danh sách chờ' });
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        if (!window.confirm('Xác nhận duyệt yêu cầu này?')) return;
        try {
            await approveRedemption(id);
            setToast({ type: 'success', message: 'Đã duyệt yêu cầu' });
            setRequests(prev => prev.filter(r => r.redemptionId !== id));
        } catch (err) {
            console.error('Approve failed', err);
            setToast({ type: 'error', message: 'Duyệt thất bại' });
        }
    };

    const handleReject = async (id) => {
        const notes = window.prompt('Lý do từ chối (tuỳ chọn):');
        if (notes === null) return; // user cancelled
        try {
            await rejectRedemption(id, { notes });
            setToast({ type: 'success', message: 'Đã từ chối và hoàn điểm' });
            setRequests(prev => prev.filter(r => r.redemptionId !== id));
        } catch (err) {
            console.error('Reject failed', err);
            setToast({ type: 'error', message: 'Từ chối thất bại' });
        }
    };

    const columns = [
        { title: 'Yêu cầu', dataIndex: 'requestedAt', render: (r) => new Date(r.requestedAt).toLocaleString('vi-VN') },
        { title: 'Mã - Tên', dataIndex: 'employee', render: (r) => `${r.employee?.employeeCode || ''} - ${r.employee?.fullName || ''}` },
        { title: 'Điểm', dataIndex: 'pointsRedeemed', render: (r) => r.pointsRedeemed },
        { title: 'Số tiền (VNĐ)', dataIndex: 'cashAmount', render: (r) => (Number(r.cashAmount) || 0).toLocaleString() + ' đ' },
        { title: 'Trạng thái', dataIndex: 'status', render: (r) => {
            const st = r.status;
            let t = 'default';
            if (st === 'PENDING') t = 'warning';
            if (st === 'APPROVED') t = 'success';
            if (st === 'REJECTED') t = 'danger';
            return <StatusBadge status={st} type={t} label={st} />
        }},
        { title: 'Hành động', dataIndex: 'actions', render: (r) => (
            <div className="flex gap-2">
                <Button variant="primary" onClick={() => handleApprove(r.redemptionId)}>Duyệt</Button>
                <Button variant="danger" onClick={() => handleReject(r.redemptionId)}>Từ chối</Button>
            </div>
        ), width: 220 }
    ];

    return (
        <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Danh sách yêu cầu đổi điểm (Chờ duyệt)</h2>
            <div className="mb-4">
                <Button onClick={fetchData} className="mr-2">Tải lại</Button>
            </div>
            <Table columns={columns} data={requests || []} emptyText={loading ? 'Đang tải...' : 'Không có yêu cầu'} />
            {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
        </div>
    );
}
