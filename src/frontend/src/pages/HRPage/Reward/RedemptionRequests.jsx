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
            setToast({ type: 'error', message: 'Failed to load pending list' });
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        if (!window.confirm('Confirm approve this request?')) return;
        try {
            await approveRedemption(id);
            setToast({ type: 'success', message: 'Request approved' });
            setRequests(prev => prev.filter(r => r.redemptionId !== id));
        } catch (err) {
            console.error('Approve failed', err);
            setToast({ type: 'error', message: 'Approve failed' });
        }
    };

    const handleReject = async (id) => {
        const notes = window.prompt('Reason for rejection (optional):');
        if (notes === null) return; // user cancelled
        try {
            await rejectRedemption(id, { notes });
            setToast({ type: 'success', message: 'Rejected and points refunded' });
            setRequests(prev => prev.filter(r => r.redemptionId !== id));
        } catch (err) {
            console.error('Reject failed', err);
            setToast({ type: 'error', message: 'Rejection failed' });
        }
    };

    const columns = [
        { title: 'Requested', dataIndex: 'requestedAt', render: (r) => new Date(r.requestedAt).toLocaleString('en-US') },
        { title: 'Code - Name', dataIndex: 'employee', render: (r) => `${r.employee?.employeeCode || ''} - ${r.employee?.fullName || ''}` },
        { title: 'Points', dataIndex: 'pointsRedeemed', render: (r) => r.pointsRedeemed },
        { title: 'Amount (USD)', dataIndex: 'cashAmount', render: (r) => '$' + (Number(r.cashAmount) || 0).toLocaleString() },
        { title: 'Status', dataIndex: 'status', render: (r) => {
            const st = r.status;
            let t = 'default';
            if (st === 'PENDING') t = 'warning';
            if (st === 'APPROVED') t = 'success';
            if (st === 'REJECTED') t = 'danger';
            return <StatusBadge status={st} type={t} label={st} />
        }},
        { title: 'Actions', dataIndex: 'actions', render: (r) => (
            <div className="flex gap-2">
                <Button variant="primary" onClick={() => handleApprove(r.redemptionId)}>Approve</Button>
                <Button variant="danger" onClick={() => handleReject(r.redemptionId)}>Reject</Button>
            </div>
        ), width: 220 }
    ];

    return (
        <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Redemption Requests (Pending Approval)</h2>
            <div className="mb-4">
                <Button onClick={fetchData} className="mr-2">Refresh</Button>
            </div>
            <Table columns={columns} data={requests || []} emptyText={loading ? 'Đang tải...' : 'Không có yêu cầu'} />
            {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
        </div>
    );
}
