import React, { useEffect, useState, useCallback } from "react";
import { 
  Clock, CheckCircle, XCircle, Eye, Search, Filter, 
  Calendar, FileText, LogOut
} from 'lucide-react';
import './PendingApprovals.css';
import Layout from '../../components/Layout'; 

// --- CONFIG ---
const API_BASE = "/api/v1";

// Helper: Format ngày giờ
const formatDate = (dateString) => {
    if (!dateString) return "--";
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "--";
        return date.toLocaleString('vi-VN', { 
            day: '2-digit', month: '2-digit', year: 'numeric', 
            hour: '2-digit', minute: '2-digit' 
        });
    } catch { return "--"; }
};

// Helper: Config Icon/Màu sắc theo loại
const getTypeConfig = (typeStr) => {
    const t = typeStr?.toLowerCase() || '';
    if (t.includes('leave')) return { label: 'Annual Leave', icon: <Calendar size={18}/>, colorClass: 'bg-blue' };
    if (t.includes('overtime')) return { label: 'Overtime', icon: <Clock size={18}/>, colorClass: 'bg-orange' };
    if (t.includes('resignation')) return { label: 'Resignation', icon: <LogOut size={18}/>, colorClass: 'bg-red' };
    return { label: typeStr, icon: <FileText size={18}/>, colorClass: 'bg-gray' };
};

const StatusBadge = ({ status }) => {
    const s = status?.toUpperCase() || 'PENDING';
    let icon = <Clock size={12}/>;
    let styleClass = 'pending';
    if (s === 'APPROVED') { icon = <CheckCircle size={12}/>; styleClass = 'approved'; }
    if (s === 'REJECTED') { icon = <XCircle size={12}/>; styleClass = 'rejected'; }
    return <span className={`status-badge ${styleClass}`}>{icon} {status}</span>;
};

// ============================================================================
// MAIN COMPONENT (Dashboard & Department dùng API THẬT)
// ============================================================================
export default function PendingApprovals() {
  const [stats, setStats] = useState({ totalRequests: 0, pendingCount: 0, approvedCount: 0, rejectedCount: 0 });
  const [departments, setDepartments] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Filters
  const [keyword, setKeyword] = useState("");
  const [deptId, setDeptId] = useState("");
  
  // Modal State
  const [selectedReq, setSelectedReq] = useState(null);

  // 1. Fetch Departments (API Thật - Chạy 1 lần)
  useEffect(() => {
    fetch(`${API_BASE}/departments`)
      .then(res => res.ok ? res.json() : [])
      .then(setDepartments)
      .catch(err => console.error("Lỗi tải phòng ban:", err));
  }, []);

  // 2. Fetch Dashboard & Summary (API Thật - Có Debounce)
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (keyword) params.append('keyword', keyword);
      if (deptId) params.append('DepartmentId', deptId);
      const query = params.toString();

      // Gọi song song API Summary và Dashboard
      const [summaryRes, listRes] = await Promise.all([
        fetch(`${API_BASE}/requests/dashboard/summary?${query}`),
        fetch(`${API_BASE}/requests/dashboard?${query}`)
      ]);

      if (summaryRes.ok) setStats(await summaryRes.json());
      
      if (listRes.ok) {
        const listData = await listRes.json();
        setRequests(listData.items || []); 
      }
    } catch (error) {
      console.error("Lỗi tải dashboard:", error);
    } finally {
      setLoading(false);
    }
  }, [keyword, deptId]);

  // Debounce: Chỉ gọi API khi dừng gõ 500ms
  useEffect(() => {
    const timer = setTimeout(() => fetchDashboardData(), 500);
    return () => clearTimeout(timer);
  }, [fetchDashboardData]);

  // Hàm refresh nhẹ (dùng khi đóng modal để cập nhật lại trạng thái)
  const handleRefresh = () => {
      fetchDashboardData();
  };

  return (
    <Layout>
      <div className="pa-container">
        <div className="pa-header">
          <div className="pa-title"><h1>Request Management</h1><p>Centralized Approval Dashboard</p></div>
        </div>

        {/* STATS (Dữ liệu thật từ API Summary) */}
        <div className="stats-grid">
            <div className="stat-card blue"><div><div className="stat-value">{stats.totalRequests}</div><div className="stat-info"><p>Total</p></div></div><div className="stat-icon"><FileText size={24}/></div></div>
            <div className="stat-card yellow"><div><div className="stat-value">{stats.pendingCount}</div><div className="stat-info"><p>Pending</p></div></div><div className="stat-icon"><Clock size={24}/></div></div>
            <div className="stat-card green"><div><div className="stat-value">{stats.approvedCount}</div><div className="stat-info"><p>Approved</p></div></div><div className="stat-icon"><CheckCircle size={24}/></div></div>
            <div className="stat-card red"><div><div className="stat-value">{stats.rejectedCount}</div><div className="stat-info"><p>Rejected</p></div></div><div className="stat-icon"><XCircle size={24}/></div></div>
        </div>

        {/* FILTERS */}
        <div className="filter-bar">
          <div className="input-group search-wrapper">
            <Search size={18} color="#94a3b8"/>
            <input placeholder="Search requests..." value={keyword} onChange={(e) => setKeyword(e.target.value)}/>
          </div>
          <div className="input-group filter-select-wrapper">
            <Filter size={18} color="#94a3b8"/>
            <select value={deptId} onChange={(e) => setDeptId(e.target.value)}>
              <option value="">All Departments</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
        </div>

        {/* TABLE (Dữ liệu thật từ API Dashboard) */}
        <div className="table-container">
          <div className="table-responsive">
            <table className="pa-table">
              <thead>
                <tr>
                  <th>Request Type</th>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Decided / Effective</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? ( <tr><td colSpan="6" style={{textAlign:'center', padding:'2rem'}}>Loading data...</td></tr> ) : 
                 requests.length === 0 ? ( <tr><td colSpan="6" style={{textAlign:'center', padding:'2rem'}}>No requests found.</td></tr> ) : (
                  requests.map((req) => {
                    const conf = getTypeConfig(req.requestType);
                    return (
                      <tr key={req.requestCode}>
                        <td>
                          <div className="cell-type">
                            <div className={`type-icon ${conf.colorClass}`}>{conf.icon}</div>
                            <div><div className="fw-600">{req.requestCode}</div><div className="sub-text">{conf.label}</div></div>
                          </div>
                        </td>
                        <td>
                            <div className="user-cell">
                                <div className="avatar-small">{req.employee?.fullName?.charAt(0)}</div>
                                <div><div className="fw-600">{req.employee?.fullName}</div><div className="sub-text">ID: {req.employee?.id}</div></div>
                            </div>
                        </td>
                        <td>{req.employee?.departmentName}</td>
                        <td>
                           <div className="date-cell">
                               <div className="date-row"><span className="date-label">Decided:</span> <span className="date-val" style={{color: req.decidedAt?'#0f172a':'#94a3b8'}}>{formatDate(req.decidedAt)}</span></div>
                               <div className="date-row"><span className="date-label">Eff:</span> <span className="date-val">{formatDate(req.effectiveDate)}</span></div>
                           </div>
                        </td>
                        <td><StatusBadge status={req.status}/></td>
                        {/* Nút Xem chi tiết - Khi bấm vào mới mở Modal và gọi API Lịch sử */}
                        <td><button className="btn-view" onClick={() => setSelectedReq(req)}><Eye size={18}/></button></td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL CHI TIẾT */}
        {selectedReq && (
          <DetailModal 
            req={selectedReq} 
            onClose={() => setSelectedReq(null)} 
            onRefresh={handleRefresh}
          />
        )}
      </div>
    </Layout>
  );
}

// ============================================================================
// DETAIL MODAL (API History THẬT - Detail & Action GIẢ)
// ============================================================================
const DetailModal = ({ req, onClose, onRefresh }) => {
  const [historyItems, setHistoryItems] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  
  // Logic Action giả lập
  const [showRejectBox, setShowRejectBox] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [processing, setProcessing] = useState(false);

  // 1. GỌI API LỊCH SỬ THẬT (Chỉ 1 lần khi Modal mở)
  useEffect(() => {
    if (req?.requestCode) {
        setLoadingHistory(true);
        // Gọi API thật: /api/v1/requests/{requestId}/history
        fetch(`${API_BASE}/requests/${req.requestCode}/history`)
            .then(res => {
                if(!res.ok) throw new Error("API Error");
                return res.json();
            })
            .then(data => {
                // API trả về { items: [...] }
                setHistoryItems(data.items || []);
            })
            .catch(err => {
                console.warn("Chưa có API History hoặc lỗi:", err);
                setHistoryItems([]); // Fallback rỗng
            })
            .finally(() => setLoadingHistory(false));
    }
  }, [req]); // Dependency là [req] đảm bảo chỉ chạy lại khi mở request khác

  // 2. Mock Data cho Detail (Vì API chi tiết chưa tích hợp)
  const mockDetail = (() => {
      const t = req.requestType.toLowerCase();
      if(t.includes('leave')) return { type: "Paid Leave", date: `${formatDate(req.effectiveDate)}`, reason: "Giải quyết việc gia đình", note: "Bàn giao: Nguyễn Văn A" };
      if(t.includes('overtime')) return { type: "Overtime", date: `${formatDate(req.effectiveDate)}`, reason: "Deploy dự án gấp", note: "Dự án: Apollo (3h)" };
      return { type: "Resignation", date: `${formatDate(req.effectiveDate)}`, reason: "Thay đổi định hướng", note: "Đã bàn giao tài sản" };
  })();

  // 3. Mock Action Approve/Reject
  const handleMockAction = (status) => {
      setProcessing(true);
      setTimeout(() => {
          alert(`[MOCK] Đã thực hiện ${status} thành công!`);
          setProcessing(false);
          onRefresh(); // Refresh dashboard
          onClose();   // Đóng modal
      }, 1000);
  };

  // Render Lịch sử: Kết quả (Trên) -> Pending (Giữa) -> Request (Dưới)
  const renderTimeline = () => {
    // Tìm mốc Created và mốc Decision (Approved/Rejected) từ API items
    const createdLog = historyItems.find(x => x.status === 'CREATED');
    const decisionLog = historyItems.find(x => x.status === 'APPROVED' || x.status === 'REJECTED');
    const isPending = !decisionLog;

    return (
        <div className="timeline">
            {/* NODE 1: KẾT QUẢ (Luôn nằm trên cùng - Mới nhất) */}
            <div className="timeline-item">
                <div className={`timeline-dot ${isPending ? 'pending-empty' : (decisionLog?.status === 'APPROVED' ? 'approved' : 'rejected')}`}></div>
                <div className="history-content">
                    {decisionLog ? (
                        <>
                            <div className="status" style={{color: decisionLog.status==='APPROVED'?'#16a34a':'#dc2626'}}>
                                {decisionLog.status}
                            </div>
                            <div className="actor">Bởi: <b>{decisionLog.full_Name}</b> ({decisionLog.employee_Id})</div>
                            <div className="date">{formatDate(decisionLog.time)}</div>
                        </>
                    ) : (
                        <div className="status" style={{color:'#94a3b8'}}>Chưa có kết quả</div>
                    )}
                </div>
            </div>

            {/* NODE 2: TRẠNG THÁI PENDING (Ở giữa) */}
            <div className="timeline-item">
                <div className={`timeline-dot ${isPending ? 'pending' : 'done'}`}></div>
                <div className="history-content">
                    <div className="status" style={{color: isPending ? '#d97706' : '#64748b'}}>
                        {isPending ? 'Đang chờ duyệt (Pending)' : 'Đã qua bước duyệt'}
                    </div>
                    <div className="actor">Hệ thống xử lý</div>
                    <div className="date">--</div>
                </div>
            </div>

            {/* NODE 3: GỬI YÊU CẦU (Dưới cùng - Cũ nhất) */}
            <div className="timeline-item">
                 <div className="timeline-dot active"></div>
                 <div className="history-content">
                    <div className="status">Gửi yêu cầu (Created)</div>
                    <div className="actor">
                        Bởi: <b>{createdLog ? createdLog.full_Name : req.employee?.fullName}</b> 
                        {createdLog && <small> ({createdLog.employee_Id})</small>}
                    </div>
                    <div className="date">
                        {/* Lấy thời gian từ API history, nếu không có thì lấy fallback */}
                        {formatDate(createdLog ? createdLog.time : req.effectiveDate)}
                    </div>
                 </div>
            </div>
        </div>
    );
  };

  return (
    <div className="modal-overlay">
      <div className="modal-drawer">
        <div className="drawer-header">
            <h3>Request Details <span style={{fontSize:'0.85rem', color:'#64748b'}}>#{req.requestCode}</span></h3>
            <button onClick={onClose} className="btn-close"><XCircle size={24}/></button>
        </div>
        <div className="drawer-body">
            {/* Info User */}
            <div className="info-box user-box">
                <div className="avatar-med">{req.employee?.fullName?.charAt(0)}</div>
                <div><b>{req.employee?.fullName}</b><div className="sub-text">{req.employee?.departmentName}</div></div>
            </div>

            {/* Mock Info Detail */}
            <div className="section-title"><FileText size={18}/> Information (Mock)</div>
            <div className="info-box">
                <div className="info-row"><span className="info-label">Type</span><span className="info-val">{mockDetail.type}</span></div>
                <div className="info-row"><span className="info-label">Date</span><span className="info-val">{mockDetail.date}</span></div>
                <div className="info-row"><span className="info-label">Reason</span><span className="info-val">{mockDetail.reason}</span></div>
                <div className="info-row"><span className="info-label">Note</span><span className="info-val">{mockDetail.note}</span></div>
            </div>

            {/* API History Real */}
            <div className="section-title"><Clock size={18}/> Process History</div>
            <div className="info-box bg-gray">
                {loadingHistory ? <p className="text-center" style={{color:'#64748b'}}>Đang tải lịch sử...</p> : renderTimeline()}
            </div>
        </div>
        
        {/* Actions (Mock) */}
        {req.status?.toUpperCase() === 'PENDING' ? (
             <div className="drawer-footer">
                {!showRejectBox ? (
                    <div className="btn-group">
                        <button className="btn-action btn-reject" onClick={() => setShowRejectBox(true)}><XCircle size={18}/> Reject</button>
                        <button className="btn-action btn-approve" onClick={() => handleMockAction('APPROVED')} disabled={processing}>
                            {processing ? '...' : <><CheckCircle size={18}/> Approve</>}
                        </button>
                    </div>
                ) : (
                    <div className="reject-box">
                        <label>Lý do từ chối <span style={{color:'red'}}>*</span></label>
                        <textarea rows="3" value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Nhập lý do..."/>
                        <div className="btn-group">
                            <button className="btn-action btn-cancel" onClick={() => setShowRejectBox(false)}>Cancel</button>
                            <button className="btn-action btn-confirm-reject" disabled={!rejectReason.trim()} onClick={() => handleMockAction('REJECTED')}>Confirm</button>
                        </div>
                    </div>
                )}
             </div>
        ) : (
             <div className="drawer-footer text-center">
                 <span style={{fontWeight:600, color: req.status.toUpperCase()==='APPROVED'?'#16a34a':'#dc2626'}}>Request is {req.status}</span>
             </div>
        )}
      </div>
    </div>
  );
};