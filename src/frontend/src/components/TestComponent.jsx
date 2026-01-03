import React, { useState } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { ChevronDown, ChevronRight } from 'lucide-react'; 

// --- IMPORT COMPONENT ---
import NavItem from '../components/common/NavItem';
import FilterBar from '../components/common/FilterBar';
import ConfirmDialog from '../components/common/ConfirmDialog';
import StatsGrid from '../components/common/StatsGrid';
import KPIs from '../components/common/KPIs';
import Pagination from '../components/common/Pagination';
import { FormRow } from '../components/common/FormRow';
import DetailModal from './features/request/DetailModal';

// 👇 [MỚI] Import thêm các component vừa bổ sung
import Table from '../components/common/Table';
import StatusBadge from '../components/common/StatusBadge';
import Toolbar from '../components/common/Toolbar';
import ViolationBanner from '../components/common/ViolationBanner';

import ApprovalModal from '../components/features/request/ApprovalModal';
import ProfileView from './features/employee/ProfileView';
// ==========================================
// 1. CẦU CHÌ BẮT LỖI (Giữ nguyên)
// ==========================================
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, errorInfo) { console.error("Error:", error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return <div style={{ padding: 10, color: 'red', background: '#fee2e2' }}>⚠️ Lỗi: {this.state.error?.toString()}</div>;
    }
    return this.props.children;
  }
}

// ==========================================
// 2. KHUNG ĐÓNG MỞ (Wrapper)
// ==========================================
const ComponentBox = ({ name, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div style={{ border: '1px solid #ddd', borderRadius: '8px', marginBottom: '10px', background: 'white', overflow: 'hidden' }}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{ padding: '12px 15px', background: '#f9fafb', cursor: 'pointer', display: 'flex', alignItems: 'center', fontWeight: 'bold', userSelect: 'none' }}
      >
        <span style={{ marginRight: 10 }}>{isOpen ? <ChevronDown size={18}/> : <ChevronRight size={18}/>}</span>
        {name}
      </div>
      {isOpen && <div style={{ padding: '20px', borderTop: '1px solid #eee' }}><ErrorBoundary>{children}</ErrorBoundary></div>}
    </div>
  );
};

// ==========================================
// 3. TRANG TEST CHÍNH
// ==========================================
const TestPage = () => {
    // State cơ bản
    const [keyword, setKeyword] = useState('');
    const [deptId, setDeptId] = useState('');
    const [page, setPage] = useState(1);
    const [modal, setModal] = useState(null); // 'confirm', 'approval', 'detail'

    // --- MOCK DATA ---
    const mock = {
        profile: { employeeCode: "EMP01", full_name: "Nguyễn Văn A", dateOfBirth: "1999-01-01", gender: "Nam", department_name: "IT", jobTitle: "Dev", status: "Active", phoneNumbers: ["0909000111"], companyEmail: "a@test.com", currentAddress: "TPHCM", employment_type: "Fulltime", contract_type: "HĐLĐ" },
        stats: { totalRequests: 100, pendingCount: 5, approvedCount: 90, rejectedCount: 5 },
        kpis: { pending: Array(5).fill({}), history: Array(50).fill({ status: 'approved' }) },
        depts: [{ id: 'IT', name: 'IT Dept' }, { id: 'HR', name: 'HR Dept' }],
        approvalRow: { id: "REQ-01", type: "Nghỉ phép", employee: "User A", dept: "IT", status: "Pending", details: "Lý do: Bận việc nhà" },
        reqDetail: { id: 1, requestCode: "REQ-01", requestType: "Leave", status: "PENDING", employee: { fullName: "User A", departmentName: "IT" }, submittedDate: "2024-01-01" },
        
        // Data cho Table
        tableData: [
            { id: 1, name: 'Dự án A', budget: '$1000', status: 'APPROVED' },
            { id: 2, name: 'Mua thiết bị', budget: '$500', status: 'PENDING' },
            { id: 3, name: 'Team building', budget: '$2000', status: 'REJECTED' },
        ],
        // Cấu hình cột cho Table
        tableCols: [
            { title: 'ID', dataIndex: 'id' },
            { title: 'Tên hạng mục', dataIndex: 'name' },
            { title: 'Ngân sách', dataIndex: 'budget' },
            { 
                title: 'Trạng thái', 
                key: 'status',
                render: (row) => <StatusBadge status={row.status} /> // Test lồng component StatusBadge vào Table
            }
        ],
        // Data cho Banner
        violations: [
            "Mật khẩu quá yếu, vui lòng đổi lại.",
            "Bạn chưa cập nhật số điện thoại khẩn cấp."
        ]
    };

    return (
        <div style={{ padding: '30px', background: '#f1f5f9', minHeight: '100vh', fontFamily: 'sans-serif' }}>
            <h2 style={{ marginBottom: 20 }}>Danh sách Component (Bấm để xem)</h2>

            {/* --- NHÓM HIỂN THỊ DỮ LIỆU --- */}

            <ComponentBox name="<Table /> (Bảng dữ liệu)" defaultOpen={true}>
                <Table columns={mock.tableCols} data={mock.tableData} />
            </ComponentBox>

            <ComponentBox name="<StatusBadge /> (Nhãn trạng thái)">
                <div style={{ display: 'flex', gap: 10 }}>
                    <StatusBadge status="APPROVED" />
                    <StatusBadge status="PENDING" />
                    <StatusBadge status="REJECTED" />
                </div>
            </ComponentBox>

            <ComponentBox name="<ViolationBanner /> (Thông báo lỗi)">
                <ViolationBanner messages={mock.violations} />
            </ComponentBox>

            <ComponentBox name="<StatsGrid /> (Thẻ thống kê)">
                <StatsGrid stats={mock.stats} />
            </ComponentBox>

            <ComponentBox name="<ProfileView /> (Hồ sơ)">
                <ProfileView profile={mock.profile} />
            </ComponentBox>

            {/* --- NHÓM ĐIỀU KHIỂN --- */}

            <ComponentBox name="<Toolbar /> (Thanh công cụ)">
                <Toolbar>
                    {/* Toolbar là wrapper nên cần bỏ nút vào trong */}
                    <button style={{ marginRight: 10, padding: '5px 10px' }}>+ Thêm mới</button>
                    <button style={{ padding: '5px 10px' }}>Xuất Excel</button>
                </Toolbar>
            </ComponentBox>

            <ComponentBox name="<FilterBar />">
                <FilterBar keyword={keyword} setKeyword={setKeyword} deptId={deptId} setDeptId={setDeptId} departments={mock.depts} />
            </ComponentBox>

            <ComponentBox name="<Pagination />">
                <Pagination currentPage={page} totalPages={10} onPageChange={setPage} />
            </ComponentBox>

            <ComponentBox name="<FormRow />">
                <div style={{ maxWidth: 400 }}>
                    <FormRow label="Họ và tên" required={true}><input style={{ width: '100%', padding: 8 }} /></FormRow>
                </div>
            </ComponentBox>

            {/* --- NHÓM KHÁC --- */}

            <ComponentBox name="<KPIs />">
                <div style={{ background: '#eee', padding: 20 }}><KPIs pending={mock.kpis.pending} history={mock.kpis.history} /></div>
            </ComponentBox>

            <ComponentBox name="<NavItem />">
                <div style={{ background: '#333', padding: 10, display: 'flex' }}>
                    {/* Style tạm để giả lập class active */}
                    <style>{`a { color: #aaa; margin-right: 15px; text-decoration: none } a.active { color: white; font-weight: bold }`}</style>
                    
                    {/* NavItem sẽ tự dùng Router của App.js */}
                    <NavItem to="/" label="Dashboard (Active)" />
                    <NavItem to="/user" label="Users" />
                </div>
            </ComponentBox>

            {/* --- MODALS --- */}
            
            <ComponentBox name="MODAL & DIALOGS (Bấm nút bên dưới)">
                <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={() => setModal('confirm')}>Mở Confirm</button>
                    <button onClick={() => setModal('approval')}>Mở Approval</button>
                    <button onClick={() => setModal('detail')}>Mở Detail</button>
                </div>
                
                {/* Render Modals */}
                <ConfirmDialog isOpen={modal === 'confirm'} title="Xác nhận" message="Bạn chắc chưa?" onCancel={() => setModal(null)} onConfirm={() => setModal(null)} />
                
                {/* Lưu ý: ApprovalModal trong file bạn gửi đang bị comment hết code. 
                    Nếu bạn uncomment file đó thì dòng dưới mới chạy được. */}
                <ApprovalModal open={modal === 'approval'} row={mock.approvalRow} onClose={() => setModal(null)} onAction={() => setModal(null)} />
                
                {modal === 'detail' && <DetailModal req={mock.reqDetail} typeConfig={{ apiApprovePath: 'test' }} onClose={() => setModal(null)} onRefresh={() => {}} />}
            </ComponentBox>

        </div>
    );
};

export default TestPage;