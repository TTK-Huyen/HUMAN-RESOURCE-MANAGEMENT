import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Eye, RefreshCw, Filter } from "lucide-react";
import { HRService } from '../../Services/employees.js';

// --- IMPORT CÁC COMPONENT DÙNG CHUNG (REUSABLE COMPONENTS) ---
import Table from '../../components/common/Table';
import StatusBadge from '../../components/common/StatusBadge';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import FilterBar from '../../components/common/FilterBar';

const HrProfileUpdateRequestListPage = () => {
    const navigate = useNavigate();

    // -- State --
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Filter State
    const [keyword, setKeyword] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    // -- Fetch Data --
    const fetchRequests = async () => {
        setLoading(true);
        try {
            // Giả sử API lấy tất cả, ta sẽ lọc ở client để tối ưu trải nghiệm
            const res = await HRService.getUpdateRequests(); 
            if (res.data) {
                setRequests(res.data);
            }
        } catch (error) {
            console.error("Lỗi tải dữ liệu:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    // -- Filter Logic --
    const filteredRequests = requests.filter(req => {
        const nameMatch = req.full_name?.toLowerCase().includes(keyword.toLowerCase());
        const codeMatch = req.employee_code?.toLowerCase().includes(keyword.toLowerCase());
        const statusMatch = statusFilter === "ALL" || req.request_status === statusFilter;

        return (nameMatch || codeMatch) && statusMatch;
    });

    // -- Cấu hình Cột cho Table --
    const columns = [
        {
            title: "Mã NV",
            dataIndex: "employee_code",
            key: "employee_code",
            width: "10%",
            render: (row) => <span style={{ fontWeight: 600, color: '#475569' }}>{row.employee_code}</span>
        },
        {
            title: "Họ và tên",
            dataIndex: "full_name",
            key: "full_name",
            width: "25%",
            render: (row) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#dbeafe', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>
                        {row.full_name?.charAt(0)}
                    </div>
                    <span style={{ fontWeight: 500, color: '#1e293b' }}>{row.full_name}</span>
                </div>
            )
        },
        {
            title: "Ngày tạo",
            dataIndex: "created_at",
            key: "created_at",
            width: "15%",
            render: (row) => row.created_at ? new Date(row.created_at).toLocaleDateString('vi-VN') : ''
        },
        {
            title: "Trạng thái",
            dataIndex: "request_status", // Dùng dataIndex để sort/filter nếu cần
            key: "request_status",
            width: "15%",
            // ✅ Tái sử dụng component StatusBadge
            render: (row) => <StatusBadge status={row.request_status} />
        },
        {
            title: "Hành động",
            key: "actions",
            width: "15%",
            // ✅ Tái sử dụng component Button (variant ghost)
            render: (row) => (
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button 
                        variant="ghost" 
                        icon={Eye} 
                        onClick={() => navigate(`/hr/profile-requests/${row.request_id}`)}
                        style={{ fontSize: '0.85rem', padding: '6px 10px' }}
                    >
                        Chi tiết
                    </Button>
                </div>
            )
        }
    ];

    // -- Render --
    return (
        <div className="page-container fade-in-up">
            
            {/* 1. Header Section */}
            <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>
                        Yêu cầu cập nhật hồ sơ
                    </h2>
                    <p style={{ color: '#64748b', margin: 0 }}>
                        Quản lý các yêu cầu thay đổi thông tin từ nhân viên.
                    </p>
                </div>
                <div style={{ background: '#eff6ff', color: '#1d4ed8', padding: '6px 12px', borderRadius: 6, fontWeight: 600, fontSize: '0.9rem' }}>
                    {requests.filter(r => r.request_status === 'PENDING').length} Chờ duyệt
                </div>
            </div>

            {/* 2. Filter Bar & Actions */}
            <div className="card-filter-wrapper">
                {/* ✅ Tái sử dụng FilterBar cho ô tìm kiếm (Keyword) 
                    Truyền mảng rỗng vào departments để ẩn dropdown department đi vì ta không dùng ở đây */}
                <div style={{ flex: 1, minWidth: '250px' }}>
                    <FilterBar 
                        keyword={keyword} 
                        setKeyword={setKeyword} 
                        departments={[]} 
                        placeholder="Tìm theo tên hoặc mã NV..."
                    />
                </div>

                {/* Custom Status Filter (Vì FilterBar không hỗ trợ status select nên ta thêm thủ công bên cạnh) */}
                <div className="custom-select-wrapper">
                    <Filter size={18} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="custom-select"
                    >
                        <option value="ALL">Tất cả trạng thái</option>
                        <option value="PENDING">Chờ duyệt</option>
                        <option value="APPROVED">Đã duyệt</option>
                        <option value="REJECTED">Từ chối</option>
                    </select>
                </div>

                {/* ✅ Tái sử dụng Button cho nút Refresh */}
                <Button variant="secondary" icon={RefreshCw} onClick={fetchRequests} isLoading={loading}>
                    Tải lại
                </Button>
            </div>

            {/* 3. Table Section */}
            <div className="card-table-wrapper">
                {/* ✅ Tái sử dụng Loading Component khi đang tải toàn trang bảng */}
                {loading && requests.length === 0 ? (
                    <div style={{ padding: 60 }}>
                        <Loading text="Đang tải danh sách yêu cầu..." />
                    </div>
                ) : (
                    /* ✅ Tái sử dụng Table Component */
                    <Table 
                        columns={columns} 
                        data={filteredRequests} 
                        /* ✅ Tái sử dụng EmptyState Component đưa vào prop emptyText */
                        emptyText={
                            <EmptyState 
                                message="Không tìm thấy dữ liệu" 
                                subMessage="Thử thay đổi từ khóa hoặc bộ lọc trạng thái." 
                            />
                        }
                    />
                )}
            </div>

            {/* CSS Cục bộ để hỗ trợ các Component (nếu project chưa có global css) */}
            <style>{`
                .page-container { padding: 24px; max-width: 1280px; margin: 0 auto; }
                
                /* Support style cho StatusBadge (vì component này dùng class) */
                .status-badge { padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; text-transform: capitalize; }
                .status-badge.pending { background: #fff7ed; color: #c2410c; border: 1px solid #ffedd5; }
                .status-badge.approved { background: #f0fdf4; color: #15803d; border: 1px solid #dcfce7; }
                .status-badge.rejected { background: #fef2f2; color: #b91c1c; border: 1px solid #fee2e2; }

                /* Support Layout cho FilterBar */
                .card-filter-wrapper { background: white; padding: 16px; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 20px; display: flex; gap: 16px; align-items: center; flex-wrap: wrap; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
                .filter-bar { width: 100%; display: flex; gap: 10px; } /* Override FilterBar style */
                .filter-bar .input-group { flex: 1; display: flex; align-items: center; border: 1px solid #e2e8f0; border-radius: 6px; padding: 0 12px; height: 40px; background: white; }
                .filter-bar .input-group input { border: none; outline: none; width: 100%; padding-left: 8px; font-size: 0.9rem; color: #334155; }
                
                /* Custom Select Styles */
                .custom-select-wrapper { position: relative; min-width: 180px; }
                .custom-select { width: 100%; height: 40px; padding: 0 36px 0 36px; border: 1px solid #e2e8f0; border-radius: 6px; outline: none; appearance: none; background: white; cursor: pointer; color: #334155; font-size: 0.9rem; }
                .custom-select:focus { border-color: #3b82f6; box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1); }

                .card-table-wrapper { background: white; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.02); overflow: hidden; }
            `}</style>
        </div>
    );
};

export default HrProfileUpdateRequestListPage;