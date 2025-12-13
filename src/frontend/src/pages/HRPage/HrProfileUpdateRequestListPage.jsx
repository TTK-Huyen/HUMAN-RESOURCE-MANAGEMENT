import React, { useEffect, useState } from 'react';
import { HRService } from '../../Services/employees.js';
import { useNavigate } from "react-router-dom";

const HrProfileUpdateRequestListPage = () => {
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
                    {requests.map(req => (
                        <tr key={req.requestId} className="hover:bg-gray-50">
                            <td className="p-3 border">{req.employeeCode}</td>
                            <td className="p-3 border">{req.fullName}</td>
                            <td className="p-3 border">{new Date(req.createdAt).toLocaleDateString()}</td>
                            <td className="p-3 border">{req.reason}</td>
                            <td className="p-3 border text-center">
                                <button className="text-blue-600 mr-3">Xem</button>
                                <button className="text-green-600 font-bold" onClick={() => handleApprove(req.requestId)}>Duyệt</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default HrProfileUpdateRequestListPage;