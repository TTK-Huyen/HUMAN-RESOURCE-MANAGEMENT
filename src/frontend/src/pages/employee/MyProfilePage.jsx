import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EmployeeService } from '../../services/api';

const MyProfilePage = () => {
    const [p, setP] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        console.log("🚀 Bắt đầu tải Profile...");
        
        EmployeeService.getProfile("NV001")
            .then(res => {
                console.log("✅ Dữ liệu nhận được:", res.data);
                setP(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("❌ Lỗi tải profile:", err);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="p-10 text-center text-gray-500">⏳ Đang tải dữ liệu...</div>;
    
    if (!p) return <div className="p-10 text-center text-red-500">❌ Không có dữ liệu (Kiểm tra Console F12)</div>;

    // Component hiển thị dòng (nhúng trực tiếp để tránh lỗi props)
    const Row = ({ label, value }) => (
        <div className="mb-4 border-b pb-2">
            <span className="block text-sm font-medium text-gray-500 uppercase">{label}</span>
            <span className="block text-lg font-semibold text-gray-800 mt-1">{value || "—"}</span>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto my-10 bg-white shadow-lg rounded-xl overflow-hidden">
            {/* Header */}
            <div className="bg-blue-600 p-6 flex justify-between items-center text-white">
                <div>
                    <h1 className="text-2xl font-bold">Hồ sơ nhân viên</h1>
                    <p className="opacity-90">Xem và quản lý thông tin cá nhân</p>
                </div>
                <button 
                    onClick={() => navigate('/employee/profile/update-request')}
                    className="bg-white text-blue-600 px-4 py-2 rounded-lg font-bold hover:bg-blue-50 transition"
                >
                    🖊 Yêu cầu chỉnh sửa
                </button>
            </div>

            {/* Body */}
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <div className="md:col-span-2 text-blue-600 font-bold text-xl mb-2 border-b-2 border-blue-100 pb-2">
                    Thông tin cơ bản
                </div>
                <Row label="Mã nhân viên" value={p.employeeCode} />
                <Row label="Họ và tên" value={p.fullName} />
                <Row label="Phòng ban" value={p.department} />
                <Row label="Chức vụ" value={p.position} />

                <div className="md:col-span-2 text-blue-600 font-bold text-xl mb-2 mt-4 border-b-2 border-blue-100 pb-2">
                    Liên hệ & Bảo mật
                </div>
                <Row label="Email" value={p.email} />
                <Row label="Số điện thoại" value={p.phone} />
                <Row label="Địa chỉ" value={p.address} />
                <Row label="CCCD/CMND" value={p.citizenId} />
                <Row label="Tài khoản ngân hàng" value={p.bankAccount} />
            </div>
        </div>
    );
};

export default MyProfilePage;