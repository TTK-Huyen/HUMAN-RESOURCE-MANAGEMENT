import React, { useEffect, useState } from 'react';
import { HRService } from '../../services/api';
import { useNavigate } from "react-router-dom";

const HrProfileUpdateRequestListPage = () => {
    const navigate = useNavigate(); 
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchRequests = async () => {
        try {
            const res = await HRService.getUpdateRequests({ status: 'PENDING' });
            setRequests(res.data);
        } catch (error) {
            console.error("Lỗi:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleApprove = async (id) => {
        if(window.confirm("Demo: Bạn muốn duyệt yêu cầu này?")) {
            await HRService.updateRequestStatus(id, { status: "APPROVED", hrId: 1 });
            alert("Đã duyệt (Demo)!");
            // Trong demo thực tế thì data mock là tĩnh nên list sẽ không đổi, 
            // nhưng flow code là đúng.
        }
    }

    if (loading) return <div>Đang tải danh sách Demo...</div>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Quản lý Yêu cầu (Chế độ Demo)</h1>
            <table className="min-w-full bg-white border shadow-sm">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="p-3 border text-left">Mã NV</th>
                        <th className="p-3 border text-left">Họ tên</th>
                        <th className="p-3 border text-left">Ngày tạo</th>
                        <th className="p-3 border text-left">Lý do</th>
                        <th className="p-3 border text-center">Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                {requests.length === 0 ? (
                    <tr>
                    <td colSpan={6} style={{ padding: "12px", textAlign: "center", color: "#999" }}>
                        No pending requests found.
                    </td>
                    </tr>
                ) : (
                    requests.map((req, index) => (
                    <tr key={req.request_id ?? `req-${index}`}>
                        <td style={{ padding: "8px 8px" }}>#{req.request_id}</td>
                        <td style={{ padding: "8px 8px" }}>{req.employee_code}</td>
                        <td style={{ padding: "8px 8px" }}>{req.full_name}</td>
                        <td style={{ padding: "8px 8px" }}>{req.created_at}</td>
                        <td style={{ padding: "8px 8px" }}>{req.request_status}</td>
                        <td style={{ padding: "8px 8px", textAlign: "right" }}>
                        <button
                            type="button"
                            className="btn"
                            onClick={() =>
                            navigate(`/hr/profile-requests/${req.request_id}`)
                            }
                        >
                            View detail
                        </button>
                        </td>
                    </tr>
                    ))
                )}
                </tbody>


            </table>
        </div>
    );
};

export default HrProfileUpdateRequestListPage;