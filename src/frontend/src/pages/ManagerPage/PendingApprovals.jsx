import React, { useEffect, useState, useCallback } from "react";
import { 
  Clock, CheckCircle, XCircle, Eye, Search, Filter, 
  Calendar, FileText, LogOut, Paperclip
} from 'lucide-react';
import './PendingApprovals.css';
import Layout from '../../components/Layout'; 

// --- CONFIG ---
const API_BASE = "/api/v1";

// [ĐÃ SỬA] Helper: Format ngày giờ
// Logic: Nếu chuỗi thời gian không có múi giờ, tự động thêm 'Z' để báo hiệu đây là UTC
// Sau đó convert sang múi giờ Asia/Ho_Chi_Minh (+7)
const formatDate = (dateString) => {
    if (!dateString) return "--";
    try {
        let safeDateStr = dateString;
        // Nếu chuỗi chưa có 'Z' (UTC) hoặc dấu '+' (Offset), ta thêm 'Z' vào cuối
        // Ví dụ: "2025-12-16T08:30:00" -> "2025-12-16T08:30:00Z" (Hiểu là 8h sáng giờ UTC)
        if (typeof safeDateStr === 'string' && !safeDateStr.endsWith('Z') && !safeDateStr.includes('+')) {
            safeDateStr += 'Z';
        }

        const date = new Date(safeDateStr);
        if (isNaN(date.getTime())) return "--";
        
        // Convert sang giờ Việt Nam
        return date.toLocaleString('vi-VN', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit',
            timeZone: 'Asia/Ho_Chi_Minh' 
        });
    } catch { return "--"; }
};

const getTypeConfig = (typeStr) => {
    const t = typeStr?.toLowerCase() || '';
    if (t.includes('leave')) return { label: 'Annual Leave', icon: <Calendar size={18}/>, colorClass: 'bg-blue', apiDetailPath: 'getdetail-leave-requests', apiApprovePath: 'leave-requests' };
    if (t.includes('overtime')) return { label: 'Overtime', icon: <Clock size={18}/>, colorClass: 'bg-orange', apiDetailPath: 'getdetail-overtime-requests', apiApprovePath: 'overtime-requests' };
    if (t.includes('resignation')) return { label: 'Resignation', icon: <LogOut size={18}/>, colorClass: 'bg-red', apiDetailPath: 'getdetail-resignation-requests', apiApprovePath: 'resignation-requests' };
    return { label: typeStr, icon: <FileText size={18}/>, colorClass: 'bg-gray', apiDetailPath: 'requests', apiApprovePath: 'requests' };
};

const StatusBadge = ({ status }) => {
    const s = status?.toUpperCase() || 'PENDING';
    let icon = <Clock size={12}/>;
    let styleClass = 'pending';
    if (s === 'APPROVED') { icon = <CheckCircle size={12}/>; styleClass = 'approved'; }
    if (s === 'REJECTED') { icon = <XCircle size={12}/>; styleClass = 'rejected'; }
    return <span className={`status-badge ${styleClass}`}>{icon} {status}</span>;
};

// --- USER PROFILE ---
const UserProfile = () => {
    const [user, setUser] = useState({ name: 'Guest', role: '' });
    const [showConfirm, setShowConfirm] = useState(false);

    useEffect(() => {
        const name = localStorage.getItem('employeeName') || 'Người dùng';
        const role = localStorage.getItem('role') || 'N/A';
        setUser({ name, role });
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/login'; 
    };

    return (
        <>
            <div className="user-profile-section">
                <div className="user-info-group">
                    <span className="user-name">{user.name}</span>
                    <span className="user-role">{user.role === 'M' ? 'Manager' : user.role}</span>
                </div>
                <button className="btn-logout" onClick={() => setShowConfirm(true)} title="Đăng xuất"><LogOut size={18} /></button>
            </div>
            {showConfirm && (
                <div className="logout-overlay">
                    <div className="logout-popup">
                        <div style={{color:'#dc2626', marginBottom:'1rem'}}><LogOut size={48}/></div>
                        <h3>Đăng xuất?</h3>
                        <p>Bạn có chắc chắn muốn đăng xuất không?</p>
                        <div className="logout-actions">
                            <button className="btn-popup btn-cancel-logout" onClick={() => setShowConfirm(false)}>Hủy bỏ</button>
                            <button className="btn-popup btn-confirm-logout" onClick={handleLogout}>Đồng ý</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

// --- MAIN COMPONENT ---
export default function PendingApprovals() {
  const [stats, setStats] = useState({ totalRequests: 0, pendingCount: 0, approvedCount: 0, rejectedCount: 0 });
  const [departments, setDepartments] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [deptId, setDeptId] = useState("");
  const [selectedReq, setSelectedReq] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/departments`).then(res => res.ok ? res.json() : []).then(setDepartments).catch(console.error);
  }, []);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (keyword) params.append('keyword', keyword);
      if (deptId) params.append('DepartmentId', deptId);
      const query = params.toString();

      const [summaryRes, listRes] = await Promise.all([
        fetch(`${API_BASE}/requests/dashboard/summary?${query}`),
        fetch(`${API_BASE}/requests/dashboard?${query}`)
      ]);

      if (summaryRes.ok) setStats(await summaryRes.json());
      
      if (listRes.ok) {
        const listData = await listRes.json();
        let items = listData.items || [];

        // SORT: Pending lên đầu -> Ngày cũ nhất (tăng dần)
        items.sort((a, b) => {
            const isPendingA = a.status?.toUpperCase() === 'PENDING';
            const isPendingB = b.status?.toUpperCase() === 'PENDING';

            if (isPendingA && !isPendingB) return -1;
            if (!isPendingA && isPendingB) return 1;

            const dateA = new Date(a.effectiveDate || 0).getTime();
            const dateB = new Date(b.effectiveDate || 0).getTime();
            return dateA - dateB;
        });

        setRequests(items); 
      }
    } catch (error) { console.error("Lỗi tải dashboard:", error); } 
    finally { setLoading(false); }
  }, [keyword, deptId]);

  useEffect(() => {
    const timer = setTimeout(() => fetchDashboardData(), 500);
    return () => clearTimeout(timer);
  }, [fetchDashboardData]);

  return (
    <Layout>
      <div className="pa-container">
        <div className="pa-header">
          <div className="pa-title"><h1>Request Management</h1><p>Centralized Approval Dashboard</p></div>
          <UserProfile />
        </div>

        <div className="stats-grid">
            <div className="stat-card blue"><div><div className="stat-value">{stats.totalRequests}</div><div className="stat-info"><p>Total</p></div></div><div className="stat-icon"><FileText size={24}/></div></div>
            <div className="stat-card yellow"><div><div className="stat-value">{stats.pendingCount}</div><div className="stat-info"><p>Pending</p></div></div><div className="stat-icon"><Clock size={24}/></div></div>
            <div className="stat-card green"><div><div className="stat-value">{stats.approvedCount}</div><div className="stat-info"><p>Approved</p></div></div><div className="stat-icon"><CheckCircle size={24}/></div></div>
            <div className="stat-card red"><div><div className="stat-value">{stats.rejectedCount}</div><div className="stat-info"><p>Rejected</p></div></div><div className="stat-icon"><XCircle size={24}/></div></div>
        </div>

        <div className="filter-bar">
          <div className="input-group search-wrapper"><Search size={18} color="#94a3b8"/><input placeholder="Search requests..." value={keyword} onChange={(e) => setKeyword(e.target.value)}/></div>
          <div className="input-group filter-select-wrapper"><Filter size={18} color="#94a3b8"/><select value={deptId} onChange={(e) => setDeptId(e.target.value)}><option value="">All Departments</option>{departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select></div>
        </div>

        <div className="table-container">
          <div className="table-responsive">
            <table className="pa-table">
              <thead><tr><th>Request Type</th><th>Employee</th><th>Department</th><th>Decided / Effective</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {loading ? ( <tr><td colSpan="6" style={{textAlign:'center', padding:'2rem'}}>Loading data...</td></tr> ) : 
                 requests.length === 0 ? ( <tr><td colSpan="6" style={{textAlign:'center', padding:'2rem'}}>No requests found.</td></tr> ) : (
                  requests.map((req) => {
                    const conf = getTypeConfig(req.requestType);
                    return (
                      <tr key={req.requestCode}>
                        <td><div className="cell-type"><div className={`type-icon ${conf.colorClass}`}>{conf.icon}</div><div><div className="fw-600">{req.requestCode}</div><div className="sub-text">{conf.label}</div></div></div></td>
                        <td><div className="user-cell"><div className="avatar-small">{req.employee?.fullName?.charAt(0)}</div><div><div className="fw-600">{req.employee?.fullName}</div><div className="sub-text">ID: {req.employee?.id}</div></div></div></td>
                        <td>{req.employee?.departmentName}</td>
                        {/* Tất cả ngày giờ sẽ +7 ở đây */}
                        <td><div className="date-cell"><div className="date-row"><span className="date-label">Decided:</span> <span className="date-val" style={{color: req.decidedAt?'#0f172a':'#94a3b8'}}>{formatDate(req.decidedAt)}</span></div><div className="date-row"><span className="date-label">Eff:</span> <span className="date-val">{formatDate(req.effectiveDate)}</span></div></div></td>
                        <td><StatusBadge status={req.status}/></td>
                        <td><button className="btn-view" onClick={() => setSelectedReq(req)}><Eye size={18}/></button></td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {selectedReq && <DetailModal req={selectedReq} onClose={() => setSelectedReq(null)} onRefresh={fetchDashboardData} />}
      </div>
    </Layout>
  );
}

// ============================================================================
// DETAIL MODAL
// ============================================================================
const DetailModal = ({ req, onClose, onRefresh }) => {
  const typeConfig = getTypeConfig(req.requestType);
  const [historyItems, setHistoryItems] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showRejectBox, setShowRejectBox] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [processing, setProcessing] = useState(false);

  // API History
  useEffect(() => {
    const requestId = req.id || req.requestId; 
    if (requestId) {
        setLoadingHistory(true);
        fetch(`${API_BASE}/requests/${requestId}/history`)
            .then(res => res.ok ? res.json() : { items: [] })
            .then(data => setHistoryItems(data.items || []))
            .catch(err => { console.warn("History Error:", err); setHistoryItems([]); })
            .finally(() => setLoadingHistory(false));
    }
  }, [req]); 

  const mockDetail = (() => {
      const t = req.requestType.toLowerCase();
      // Date +7 được xử lý bởi formatDate
      if(t.includes('leave')) return { type: "Paid Leave", date: `${formatDate(req.effectiveDate)}`, reason: "Lý do cá nhân", note: "Bàn giao: Nguyễn Văn A", fileName: "Giay_Kham_Benh.pdf", fileUrl: "#" };
      if(t.includes('overtime')) return { type: "Overtime", date: `${formatDate(req.effectiveDate)}`, reason: "Chạy dự án", note: "Dự án: X (3h)" };
      return { type: "Resignation", date: `${formatDate(req.effectiveDate)}`, reason: "Thay đổi định hướng", note: "Đã bàn giao tài sản" };
  })();

  const handleAction = async (status) => {
      const requestId = req.id || req.requestId;
      const token = localStorage.getItem('token'); 

      if (!requestId) { alert("Không tìm thấy ID yêu cầu!"); return; }
      if (!token) { alert("Bạn chưa đăng nhập hoặc phiên làm việc hết hạn!"); return; }

      setProcessing(true);

      const url = `${API_BASE}/${typeConfig.apiApprovePath}/${requestId}/approval`;
      const payload = {
          "new_status": status,
          "reject_reason": status === 'REJECTED' ? rejectReason : "string",
          "Employee_ID": 1 
      };

      try {
          const response = await fetch(url, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              body: JSON.stringify(payload)
          });

          if (response.ok) {
              const data = await response.json();
              alert(data.message || `Thành công! Đã chuyển trạng thái sang ${status}`);
              setProcessing(false);
              onRefresh();
              onClose();
          } else {
              const errText = await response.text();
              console.error("API Error:", errText);
              alert(`Lỗi: ${errText || "Không thể xử lý yêu cầu"}`);
              setProcessing(false);
          }
      } catch (error) {
          console.error("Network Error:", error);
          alert("Lỗi kết nối server.");
          setProcessing(false);
      }
  };

  const renderTimeline = () => {
    const createdLog = historyItems.find(x => x.status === 'CREATED');
    const decisionLog = historyItems.find(x => x.status === 'APPROVED' || x.status === 'REJECTED');
    const isPending = !decisionLog;

    return (
        <div className="timeline">
            <div className="timeline-item">
                <div className={`timeline-dot ${isPending ? 'pending-empty' : (decisionLog?.status === 'APPROVED' ? 'approved' : 'rejected')}`}></div>
                <div className="history-content">
                    {decisionLog ? (
                        <>
                            <div className="status" style={{color: decisionLog.status==='APPROVED'?'#16a34a':'#dc2626'}}>{decisionLog.status}</div>
                            <div className="actor">Bởi: <b>{decisionLog.full_Name}</b> ({decisionLog.employee_Id})</div>
                            {/* Date +7 cho History */}
                            <div className="date">{formatDate(decisionLog.time)}</div>
                        </>
                    ) : ( <div className="status" style={{color:'#94a3b8'}}>Chưa có kết quả</div> )}
                </div>
            </div>
            <div className="timeline-item"><div className={`timeline-dot ${isPending?'pending':'done'}`}></div><div className="history-content"><div className="status" style={{color:isPending?'#d97706':'#64748b'}}>{isPending?'Đang chờ duyệt':'Đã qua bước duyệt'}</div><div className="actor">Hệ thống xử lý</div><div className="date">--</div></div></div>
            <div className="timeline-item"><div className="timeline-dot active"></div><div className="history-content"><div className="status">Gửi yêu cầu</div><div className="actor">Bởi: <b>{createdLog?createdLog.full_Name:req.employee?.fullName}</b></div><div className="date">{createdLog?formatDate(createdLog.time):'--'}</div></div></div>
        </div>
    );
  };

  return (
    <div className="modal-overlay">
      <div className="modal-drawer">
        <div className="drawer-header"><h3>Request Details #{req.requestCode}</h3><button onClick={onClose} className="btn-close"><XCircle size={24}/></button></div>
        <div className="drawer-body">
            <div className="info-box user-box"><div className="avatar-med">{req.employee?.fullName?.charAt(0)}</div><div><b>{req.employee?.fullName}</b><div className="sub-text">{req.employee?.departmentName}</div></div></div>
            <div className="section-title"><FileText size={18}/> Information (Mock)</div>
            <div className="info-box">
                <div className="info-row"><span className="info-label">Type</span><span className="info-val">{mockDetail.type}</span></div>
                <div className="info-row"><span className="info-label">Date</span><span className="info-val">{mockDetail.date}</span></div>
                <div className="info-row"><span className="info-label">Reason</span><span className="info-val">{mockDetail.reason}</span></div>
                <div className="info-row"><span className="info-label">Note</span><span className="info-val">{mockDetail.note}</span></div>
                {mockDetail.fileName && (<div className="info-row"><span className="info-label">Attachment</span><span className="info-val"><a href={mockDetail.fileUrl} target="_blank" rel="noreferrer" style={{display:'flex',alignItems:'center',gap:'5px',textDecoration:'none',color:'#2563eb'}}><Paperclip size={14}/> {mockDetail.fileName}</a></span></div>)}
            </div>
            <div className="section-title"><Clock size={18}/> Process History</div>
            <div className="info-box bg-gray">{loadingHistory ? <p className="text-center" style={{color:'#64748b'}}>Đang tải lịch sử...</p> : renderTimeline()}</div>
        </div>
        {req.status?.toUpperCase() === 'PENDING' ? (
             <div className="drawer-footer">
                {!showRejectBox ? (
                    <div className="btn-group">
                        <button className="btn-action btn-reject" onClick={() => setShowRejectBox(true)}><XCircle size={18}/> Reject</button>
                        <button className="btn-action btn-approve" onClick={() => handleAction('APPROVED')} disabled={processing}>{processing ? 'Processing...' : <><CheckCircle size={18}/> Approve</>}</button>
                    </div>
                ) : (
                    <div className="reject-box">
                        <label>Lý do từ chối <span style={{color:'red'}}>*</span></label>
                        <textarea rows="3" value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Nhập lý do..."/>
                        <div className="btn-group">
                            <button className="btn-action btn-cancel" onClick={() => setShowRejectBox(false)}>Cancel</button>
                            <button className="btn-action btn-confirm-reject" disabled={!rejectReason.trim()} onClick={() => handleAction('REJECTED')}>Confirm</button>
                        </div>
                    </div>
                )}
             </div>
        ) : ( <div className="drawer-footer text-center"><span style={{fontWeight:600, color: req.status.toUpperCase()==='APPROVED'?'#16a34a':'#dc2626'}}>Request is {req.status}</span></div> )}
      </div>
    </div>
  );
};