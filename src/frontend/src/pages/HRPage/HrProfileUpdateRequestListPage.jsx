import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Eye, RefreshCw, Filter, Check, X } from "lucide-react";
import { HRService } from '../../Services/employees.js';

// --- IMPORT CÁC COMPONENT DÙNG CHUNG (REUSABLE COMPONENTS) ---
import Table from '../../components/common/Table';
import StatusBadge from '../../components/common/StatusBadge';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import FilterBar from '../../components/common/FilterBar';

const HrProfileUpdateRequestListPage = () => {
    const navigate = useNavigate();    // -- State --
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
    };    useEffect(() => {
        fetchRequests();
    }, []);

    // -- Filter Logic --
    const filteredRequests = requests.filter(req => {
        const nameMatch = req.full_name?.toLowerCase().includes(keyword.toLowerCase());
        const codeMatch = req.employee_code?.toLowerCase().includes(keyword.toLowerCase());
        const statusMatch = statusFilter === "ALL" || req.request_status === statusFilter;

        return (nameMatch || codeMatch) && statusMatch;
    });    // -- Cấu hình Cột cho Table --
    const columns = [
        {
            title: "Employee ID",
            dataIndex: "employee_code",
            key: "employee_code",
            width: "12%",
            render: (row) => <span style={{ fontWeight: 600, color: '#475569' }}>{row.employee_code}</span>
        },
        {
            title: "Full Name",
            dataIndex: "full_name",
            key: "full_name",
            width: "28%",
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
            title: "Created Date",
            dataIndex: "created_at",
            key: "created_at",
            width: "16%",
            render: (row) => row.created_at ? new Date(row.created_at).toLocaleDateString('en-US') : ''
        },
        {
            title: "Status",
            dataIndex: "request_status", // Dùng dataIndex để sort/filter nếu cần
            key: "request_status",
            width: "14%",
            // ✅ Tái sử dụng component StatusBadge
            render: (row) => <StatusBadge status={row.request_status} />
        },        {
            title: "Actions",
            key: "actions",
            width: "30%",
            // ✅ Luôn hiển thị nút Duyệt & Từ chối + Chi tiết
            // Nút được disable nếu status !== PENDING
            render: (row) => {
                const isDisabled = row.request_status !== 'PENDING';
                const disabledStyle = {
                    opacity: isDisabled ? 0.5 : 1,
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    pointerEvents: isDisabled ? 'none' : 'auto'
                };
                
                return (
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-start', flexWrap: 'wrap', alignItems: 'center' }}>
                        {/* Nút Từ chối */}
                        <button
                            onClick={() => navigate(`/hr/profile-requests/${row.request_id}`)}
                            disabled={isDisabled}
                            style={{
                                padding: '6px 12px',
                                borderRadius: '6px',
                                border: isDisabled ? '1px solid #cbd5e1' : '1px solid #fca5a5',
                                color: isDisabled ? '#94a3b8' : '#dc2626',
                                background: 'transparent',
                                fontWeight: 500,
                                cursor: isDisabled ? 'not-allowed' : 'pointer',
                                fontSize: '0.85rem',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                opacity: isDisabled ? 0.5 : 1
                            }}                            onMouseEnter={(e) => !isDisabled && (e.target.style.background = '#fee2e2')}
                            onMouseLeave={(e) => !isDisabled && (e.target.style.background = 'transparent')}
                            title={isDisabled ? "Cannot perform action on processed request" : "Reject request"}
                        >
                            <X size={16} />
                            Reject
                        </button>

                        {/* Nút Duyệt */}
                        <button
                            onClick={() => navigate(`/hr/profile-requests/${row.request_id}`)}
                            disabled={isDisabled}
                            style={{
                                padding: '6px 12px',
                                borderRadius: '6px',
                                border: 'none',
                                background: isDisabled ? '#cbd5e1' : '#16a34a',
                                color: 'white',
                                fontWeight: 500,
                                cursor: isDisabled ? 'not-allowed' : 'pointer',
                                fontSize: '0.85rem',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                opacity: isDisabled ? 0.5 : 1
                            }}
                            onMouseEnter={(e) => !isDisabled && (e.target.style.background = '#15803d')}
                            onMouseLeave={(e) => !isDisabled && (e.target.style.background = '#16a34a')}
                            title={isDisabled ? "Cannot perform action on processed request" : "Approve request"}
                        >
                            <Check size={16} />
                            Approve
                        </button>

                        {/* Nút Chi tiết */}
                        <Button 
                            variant="ghost" 
                            icon={Eye} 
                            onClick={() => navigate(`/hr/profile-requests/${row.request_id}`)}
                            style={{ fontSize: '0.85rem', padding: '6px 10px' }}
                        >
                            Details
                        </Button>
                    </div>
                );
            }
        }
    ];

    // -- Render --
    return (
        <div className="page-container fade-in-up">
              {/* 1. Header Section */}
            <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>
                        Profile Update Requests
                    </h2>
                    <p style={{ color: '#64748b', margin: 0 }}>
                        Manage profile change requests from employees.
                    </p>
                </div>
                <div style={{ background: '#eff6ff', color: '#1d4ed8', padding: '6px 12px', borderRadius: 6, fontWeight: 600, fontSize: '0.9rem' }}>
                    {requests.filter(r => r.request_status === 'PENDING').length} Pending
                </div>
            </div>

            {/* 2. Filter Bar & Actions */}
            <div className="card-filter-wrapper">
                {/* ✅ Tái sử dụng FilterBar cho ô tìm kiếm (Keyword) 
                    Truyền mảng rỗng vào departments để ẩn dropdown department đi vì ta không dùng ở đây */}
                <div style={{ flex: 1, minWidth: '250px' }}>                    <FilterBar 
                        keyword={keyword} 
                        setKeyword={setKeyword} 
                        departments={[]} 
                        placeholder="Search by name or employee code..."
                    />
                </div>

                {/* Custom Status Filter (Vì FilterBar không hỗ trợ status select nên ta thêm thủ công bên cạnh) */}
                <div className="custom-select-wrapper">
                    <Filter size={18} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />                    <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="custom-select"
                    >
                        <option value="ALL">All Statuses</option>
                        <option value="PENDING">Pending</option>
                        <option value="APPROVED">Approved</option>
                        <option value="REJECTED">Rejected</option>
                    </select>
                </div>                {/* ✅ Tái sử dụng Button cho nút Refresh */}
                <Button variant="secondary" icon={RefreshCw} onClick={fetchRequests} isLoading={loading}>
                    Refresh
                </Button>
            </div>

            {/* 3. Table Section */}
            <div className="card-table-wrapper">                {/* ✅ Tái sử dụng Loading Component khi đang tải toàn trang bảng */}
                {loading && requests.length === 0 ? (
                    <div style={{ padding: 60 }}>
                        <Loading text="Loading request list..." />
                    </div>
                ) : (
                    /* ✅ Tái sử dụng Table Component */                    <Table 
                        columns={columns} 
                        data={filteredRequests} 
                        /* ✅ Tái sử dụng EmptyState Component đưa vào prop emptyText */
                        emptyText={
                            <EmptyState 
                                message="No data found" 
                                subMessage="Try changing the search keyword or status filter." 
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