import React, { useState } from 'react';
import { Plus, Download, Filter, Save, X, Calendar } from 'lucide-react';

// Import các component của bạn
import MainLayout from '../components/layout/Mainlayout';
import Table from '../components/common/Table'; 
import StatusBadge from '../components/common/StatusBadge'; 

// ==========================================
// 1. DUMMY DATA (DỮ LIỆU GIẢ)
// ==========================================

// Dữ liệu cho Bảng nhân viên
const DUMMY_EMPLOYEES = [
  { id: 'NV001', name: 'Nguyễn Văn A', dept: 'Kỹ thuật', role: 'Backend Dev', status: 'ACTIVE', joinDate: '2023-01-15' },
  { id: 'NV002', name: 'Trần Thị B', dept: 'Nhân sự', role: 'Recruiter', status: 'ACTIVE', joinDate: '2023-02-20' },
  { id: 'NV003', name: 'Lê Văn C', dept: 'Kinh doanh', role: 'Sales Lead', status: 'INACTIVE', joinDate: '2022-11-05' },
  { id: 'NV004', name: 'Phạm Thị D', dept: 'Marketing', role: 'Content', status: 'ACTIVE', joinDate: '2023-05-10' },
  { id: 'NV005', name: 'Hoàng Văn E', dept: 'Kỹ thuật', role: 'Tester', status: 'PENDING', joinDate: '2023-06-01' },
];

const TABLE_COLUMNS = [
  { title: 'Mã NV', dataIndex: 'id' },
  { title: 'Họ và tên', dataIndex: 'name', render: (row) => <b>{row.name}</b> },
  { title: 'Phòng ban', dataIndex: 'dept' },
  { title: 'Chức vụ', dataIndex: 'role' },
  { title: 'Ngày vào', dataIndex: 'joinDate' },
  { title: 'Trạng thái', key: 'status', render: (row) => <StatusBadge status={row.status} /> }, // Dùng component StatusBadge của bạn
];

// ==========================================
// 2. CÁC VIEW GIẢ LẬP (MÔ PHỎNG PAGE)
// ==========================================

// View 1: Dashboard (Biểu đồ, Thống kê)
const DummyDashboard = () => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
    {/* Card Thống kê */}
    {[
      { label: 'Tổng nhân viên', val: 150, change: '+12%', color: '#16a34a' },
      { label: 'Đơn chờ duyệt', val: 5, change: '-2%', color: '#dc2626' },
      { label: 'Nhân viên mới', val: 12, change: '+5%', color: '#16a34a' },
      { label: 'Sắp hết HĐ', val: 3, change: 'Cảnh báo', color: '#ca8a04' }
    ].map((item, i) => (
      <div key={i} style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
        <div style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '8px' }}>{item.label}</div>
        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0f172a' }}>{item.val}</div>
        <div style={{ color: item.color, fontSize: '0.8rem', marginTop: '4px', fontWeight: 500 }}>{item.change}</div>
      </div>
    ))}

    {/* Khu vực Biểu đồ giả */}
    <div style={{ gridColumn: '1 / -1', background: 'white', height: '350px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', borderStyle: 'dashed' }}>
      <div style={{fontSize: '3rem', marginBottom: 10}}>📊</div>
      <div style={{color: '#94a3b8'}}>Khu vực hiển thị Biểu đồ (Chart Area)</div>
    </div>
  </div>
);

// View 2: Form nhập liệu (Tạo mới)
const DummyForm = () => (
  <div style={{ background: 'white', padding: '40px', borderRadius: '12px', border: '1px solid #e2e8f0', maxWidth: '800px', margin: '0 auto', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
    <h3 style={{marginTop: 0, marginBottom: 20, color: '#334155'}}>Thông tin cơ bản</h3>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
      <div>
        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#334155', fontSize: '0.9rem' }}>Họ và tên <span style={{color:'red'}}>*</span></label>
        <input style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none' }} placeholder="Nhập tên..." />
      </div>
      <div>
        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#334155', fontSize: '0.9rem' }}>Mã nhân viên</label>
        <input style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#f1f5f9', color: '#64748b' }} value="AUTO-GEN-001" disabled />
      </div>
      <div>
        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#334155', fontSize: '0.9rem' }}>Phòng ban</label>
        <select style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px' }}>
          <option>Phòng Kỹ Thuật (IT)</option>
          <option>Phòng Nhân Sự (HR)</option>
          <option>Phòng Kinh Doanh (Sales)</option>
        </select>
      </div>
      <div>
        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#334155', fontSize: '0.9rem' }}>Ngày sinh</label>
        <input type="date" style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
      </div>
    </div>
    <div style={{ marginBottom: '20px' }}>
      <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#334155', fontSize: '0.9rem' }}>Ghi chú thêm</label>
      <textarea rows={4} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none' }} placeholder="Nhập thêm thông tin..." />
    </div>
  </div>
);

// ==========================================
// 3. COMPONENT TRANG TEST CHÍNH
// ==========================================
const LayoutTestPage = () => {
  const [currentView, setCurrentView] = useState('list'); // 'dashboard', 'list', 'form'
  
  // Style cho nút bấm giả (nếu chưa có component Button)
  const btnStyle = { padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 };
  const primaryBtn = { ...btnStyle, background: '#2563eb', color: 'white' };
  const secondaryBtn = { ...btnStyle, background: 'white', border: '1px solid #cbd5e1', color: '#475569' };

  // --- CẤU HÌNH DỮ LIỆU LAYOUT THEO TỪNG VIEW ---
  // Đây là phần bạn sẽ truyền vào MainLayout
  const getLayoutProps = () => {
    switch (currentView) {
      case 'dashboard':
        return {
          title: "Tổng quan hệ thống",
          subtitle: "Báo cáo hiệu suất và thống kê nhân sự",
          actions: (
             <div style={{display:'flex', gap: 10}}>
                <button style={secondaryBtn}><Calendar size={16}/> Tháng này</button>
                <button style={primaryBtn}><Download size={16}/> Xuất báo cáo</button>
             </div>
          )
        };
      case 'form':
        return {
          title: "Thêm mới nhân viên",
          subtitle: "Vui lòng điền đầy đủ thông tin hồ sơ",
          actions: (
            <div style={{display:'flex', gap: 10}}>
               <button style={secondaryBtn} onClick={() => setCurrentView('list')}>Hủy bỏ</button>
               <button style={primaryBtn}><Save size={16}/> Lưu hồ sơ</button>
            </div>
          )
        };
      case 'list':
      default:
        return {
          title: "Danh sách nhân viên",
          subtitle: "Quản lý 150 hồ sơ nhân sự",
          actions: (
            <div style={{display:'flex', gap: 10}}>
               <button style={secondaryBtn}><Filter size={16}/> Bộ lọc</button>
               <button style={primaryBtn} onClick={() => setCurrentView('form')}><Plus size={16}/> Thêm mới</button>
            </div>
          )
        };
    }
  };

  const layoutProps = getLayoutProps();

  return (
    <>
      {/* --- GỌI MAIN LAYOUT Ở ĐÂY --- */}
      {/* Chúng ta truyền title, subtitle, actions vào để Layout hiển thị */}
      <MainLayout 
        title={layoutProps.title} 
        subtitle={layoutProps.subtitle} 
        actions={layoutProps.actions}
      >
        {/* Nội dung bên trong thay đổi theo View */}
        {currentView === 'dashboard' && <DummyDashboard />}
        {currentView === 'list' && <Table columns={TABLE_COLUMNS} data={DUMMY_EMPLOYEES} />}
        {currentView === 'form' && <DummyForm />}
      </MainLayout>

      {/* --- MENU ĐIỀU KHIỂN NỔI (ĐỂ BẠN TEST) --- */}
      <div style={{
          position: 'fixed', bottom: 30, right: 30, background: '#1e293b', padding: 15, borderRadius: 12,
          boxShadow: '0 10px 25px rgba(0,0,0,0.3)', color: 'white', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 10
      }}>
          <div style={{fontWeight: 'bold', fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', borderBottom: '1px solid #475569', paddingBottom: 5}}>
              🖥️ Chuyển màn hình
          </div>
          <button onClick={() => setCurrentView('dashboard')} style={{...btnStyle, background: currentView==='dashboard'?'#3b82f6':'#334155', color:'white', width: '100%'}}>
              Dashboard View
          </button>
          <button onClick={() => setCurrentView('list')} style={{...btnStyle, background: currentView==='list'?'#3b82f6':'#334155', color:'white', width: '100%'}}>
              List View
          </button>
          <button onClick={() => setCurrentView('form')} style={{...btnStyle, background: currentView==='form'?'#3b82f6':'#334155', color:'white', width: '100%'}}>
              Form View
          </button>
      </div>
    </>
  );
};

export default LayoutTestPage;